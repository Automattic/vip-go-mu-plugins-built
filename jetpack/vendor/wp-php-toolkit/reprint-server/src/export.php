<?php
/**
 * Unified export API for SQL and file operations.
 */

use WordPress\Reprint\Server\FileIndexProcessor;
use WordPress\Reprint\Server\FileTreeProducer;
use WordPress\Reprint\Server\GzipOutputStream;
use WordPress\Reprint\Server\MySQLDumpProducer;
use WordPress\Reprint\Server\PdoConstants;
use WordPress\Reprint\Server\ResourceBudget;
use WordPress\Reprint\Server\SqliteDriverPDO;
use WordPress\Reprint\Server\WpdbDriverPDO;

use function WordPress\Reprint\Server\assert_valid_path;
use function WordPress\Reprint\Server\build_pdo_dsn;
use function WordPress\Reprint\Server\generate_random_bytes;
use function WordPress\Reprint\Server\json_encode_or_throw;
use function WordPress\Reprint\Server\normalize_path;
use function WordPress\Reprint\Server\parse_size;
use function WordPress\Reprint\Server\path_is_same_as_or_descendant_of;
use function WordPress\Reprint\Server\trim_right_slash;
use function WordPress\Reprint\Server\wp_join_unix_paths;

require_once __DIR__ . '/utils.php';
require_once __DIR__ . '/class-resource-budget.php';
require_once __DIR__ . '/class-gzip-output-stream.php';
require_once __DIR__ . '/class-file-index-processor.php';

// Capture any accidental output before headers are set so we can discard it
// when switching to streaming mode later.
if (!ob_get_level()) {
    ob_start();
}


/**
 * The wire-protocol version this export plugin speaks.
 *
 * The export plugin and importer report this value during preflight so a
 * mismatched deployment fails before any content is transferred.
 *
 * EXPORT_PROTOCOL_VERSION is sent to the importer in the preflight JSON
 * response as `protocol_version`.  Bump it whenever a change to the wire
 * protocol (cursor encoding, multipart structure, header names, endpoint
 * parameters, response format) would break an older importer.
 */
define('EXPORT_PROTOCOL_VERSION', 3);

// File type mask + file type values (top bits of st_mode)
define('STAT_TYPE_MASK',   0170000);
define('STAT_TYPE_SOCKET', 0140000);
define('STAT_TYPE_LINK',   0120000);
define('STAT_TYPE_FILE',   0100000);
define('STAT_TYPE_BLOCK',  0060000);
define('STAT_TYPE_DIR',    0040000);
define('STAT_TYPE_CHAR',   0020000);
define('STAT_TYPE_FIFO',   0010000);

/**
 * Global streaming context. When set, the error handlers emit error chunks
 * into the active multipart stream instead of sending plain JSON, which would
 * corrupt either a compressed or uncompressed multipart response.
 *
 * Set by each streaming endpoint right after creating $gz and $boundary.
 * Keys: 'gz' => GzipOutputStream, 'boundary' => string
 */
$streaming_context = null;

/**
 * Initializes a multipart/mixed streaming response, optionally with gzip compression.
 *
 * Every streaming endpoint needs the same setup: a unique boundary, the
 * Content-Type header, an output stream, and the global $streaming_context so
 * error handlers can emit structured error chunks mid-stream.
 *
 * @param bool $require_headers If true, throws when headers were already sent
 *                              (use for endpoints that can't degrade gracefully).
 * @param bool $gzip If true, emit Content-Encoding: gzip and compress the body.
 * @return array {
 *     Multipart stream context.
 *
 *     @type GzipOutputStream $gz       Output stream used by the response.
 *     @type string           $boundary MIME boundary for response parts.
 * }
 * @phpstan-return array{gz: GzipOutputStream, boundary: string}
 */
function begin_multipart_stream(bool $require_headers = false, bool $gzip = true): array
{
    global $streaming_context;

    /**
     * We're choosing a random boundary without checking for its presence in the content.
     * This may seem to contradict RFC 2046, where it says:
     *
     * > As stated previously, each body part is preceded by a boundary
     * > delimiter line that contains the boundary delimiter.  The boundary
     * > delimiter MUST NOT appear inside any of the encapsulated parts, on a
     * > line by itself or as the prefix of any line.  This implies that it is
     * > crucial that the composing agent be able to choose and specify a
     * > unique boundary parameter value that does not contain the boundary
     * > parameter value of an enclosing multipart as a prefix.
     * >
     * > https://www.rfc-editor.org/rfc/rfc2046.html
     *
     * But in practice, we're okay. We use 128 bits of randomness. The chance of
     * it appearing in the data is about 1 in 2^128 — effectively zero. Curl does
     * the same here:
     *
     *    https://github.com/curl/curl/blob/462244447e8ba3a53b1ba9f0ba7baa52d8777daa/lib/mime.c#L1179-L1236
     *
     * Also, every chunk declares its Content-Length, so the client never needs
     * to search arbitrary body bytes for the boundary.
     */
    $boundary = "boundary-" . bin2hex(generate_random_bytes(16));
    $can_send_headers = !headers_sent();

    if ($require_headers && !$can_send_headers) {
        throw new RuntimeException(
            "Cannot begin multipart stream: headers already sent"
        );
    }

    if ($can_send_headers) {
        @header("Content-Type: multipart/mixed; boundary=\"$boundary\"");
    }

    $gz = new GzipOutputStream($can_send_headers && $gzip);
    $streaming_context = ['gz' => $gz, 'boundary' => $boundary];

    return $streaming_context;
}

/**
 * Resolves database credentials from PHP constants and environment variables.
 *
 * Never reads from $config / HTTP parameters — credentials must come from
 * the server environment (PHP constants or environment variables).
 *
 * @return array {
 *     Database connection details resolved from the server environment.
 *
 *     @type string      $db_host        Database host.
 *     @type string      $db_name        Database name.
 *     @type string      $db_user        Database user.
 *     @type string      $db_password    Database password.
 *     @type string|null $wp_config_path WordPress config path, if known.
 *     @type string|null $table_prefix   WordPress table prefix, if known.
 * }
 * @phpstan-return array{
 *     db_host: string,
 *     db_name: string,
 *     db_user: string,
 *     db_password: string,
 *     wp_config_path: ?string,
 *     table_prefix: ?string
 * }
 * @throws InvalidArgumentException When required credentials are missing.
 */
function resolve_db_credentials(): array
{
    $db_host = defined("DB_HOST") ? DB_HOST : getenv("DB_HOST");
    $db_name = defined("DB_NAME") ? DB_NAME : getenv("DB_NAME");
    $db_user = defined("DB_USER") ? DB_USER : getenv("DB_USER");
    $db_password = defined("DB_PASSWORD") ? DB_PASSWORD : getenv("DB_PASSWORD");

    global $wpdb;

    $wp_config_path = null;
    $table_prefix = null;
    if (isset($GLOBALS['table_prefix']) && is_string($GLOBALS['table_prefix']) && $GLOBALS['table_prefix'] !== '') {
        $table_prefix = $GLOBALS['table_prefix'];
    } elseif (isset($wpdb) && is_object($wpdb) && isset($wpdb->prefix) && is_string($wpdb->prefix) && $wpdb->prefix !== '') {
        $table_prefix = $wpdb->prefix;
    }

    // On SQLite sites, the driver is already loaded by WordPress via the
    // db.php drop-in. We just need to confirm it's available and skip the
    // MySQL credential requirements.
    if (is_sqlite_site()) {
        return [
            "db_engine" => "sqlite",
            "db_host" => "",
            "db_name" => $db_name ?: "wordpress",
            "db_user" => "",
            "db_password" => "",
            "wp_config_path" => $wp_config_path,
            "table_prefix" => $table_prefix,
        ];
    }

    $missing = [];
    if (!$db_host) { $missing[] = "db_host"; }
    if (!$db_name) { $missing[] = "db_name"; }
    if (!$db_user) { $missing[] = "db_user"; }
    if ($db_password === false || $db_password === null) {
        $missing[] = "db_password";
    }
    if (!empty($missing)) {
        throw new InvalidArgumentException(
            "Database credentials not found. Please provide via environment variables, " .
                "PHP constants, or ensure wp-config.php exists with valid credentials. " .
                "Missing: " . implode(", ", $missing)
        );
    }

    return [
        "db_engine" => "mysql",
        "db_host" => $db_host,
        "db_name" => $db_name,
        "db_user" => $db_user,
        "db_password" => $db_password,
        "wp_config_path" => $wp_config_path,
        "table_prefix" => $table_prefix,
    ];
}

/**
 * Returns true when the current WordPress site uses the SQLite backend.
 *
 * The sqlite-database-integration plugin's db.php drop-in defines
 * SQLITE_DB_DROPIN_VERSION and exposes its PDO handle through $GLOBALS['@pdo'].
 */
function is_sqlite_site(): bool
{
    // Connection setup checks which supported driver WordPress loaded.
    return defined('SQLITE_DB_DROPIN_VERSION') && isset($GLOBALS['@pdo']);
}

/**
 * Creates a database connection appropriate for the detected backend.
 *
 * For MySQL sites, returns a standard PDO connection, falling back to the
 * wpdb adapter when that connection fails and WordPress is loaded.
 * For SQLite sites, wraps the MySQL-on-SQLite driver which WordPress already
 * loaded in a PDO-compatible adapter. The driver's translator converts every
 * MySQL query to SQLite on the fly, so MySQLDumpProducer sees MySQL-shaped
 * results and produces valid MySQL SQL output.
 *
 * @param array $creds   Credentials from resolve_db_credentials().
 * @param array $options PDO options. Reach the real PDO connection only; the
 *                       wpdb adapter has no handle to set them on.
 * @return PDO A real PDO for MySQL, or a PDO-compatible adapter for SQLite
 *             and for MySQL hosts reached through wpdb.
 */
function create_db_connection(array $creds, array $options = [])
{
    if (($creds["db_engine"] ?? "mysql") === "sqlite") {
        return create_sqlite_pdo_adapter();
    }

    // Gate on pdo_mysql, not pdo: ext-pdo core without the mysql driver
    // can't drive MySQL exports.
    if (!extension_loaded('pdo_mysql')) {
        $mysql = create_wpdb_pdo_adapter();
    } else {
        // MySQL path (also works for HyperDB — wp-config.php credentials
        // point to the write master).
        $default_options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ];
        $merged_options = $options + $default_options;

        try {
            $mysql = new PDO(
                build_pdo_dsn($creds['db_host'], $creds['db_name']),
                $creds["db_user"],
                $creds["db_password"],
                $merged_options
            );
        } catch (PDOException $connection_error) {
            global $wpdb;
            if (!isset($wpdb) || !is_object($wpdb)) {
                throw $connection_error;
            }

            // Fallback to using wpdb if we failed to connect directly to the database.
            $mysql = create_wpdb_pdo_adapter();
        }
    }

    // SET NAMES normalizes the client, connection, and result charsets plus
    // the connection collation for both PDO and wpdb. Text primary key
    // comparisons still use each column's stored collation.
    $mysql->query(
        "SET NAMES utf8mb4 COLLATE utf8mb4_bin"
    );

    return $mysql;
}

/**
 * Wraps the SQLite plugin's already-loaded driver in a PDO-compatible adapter.
 *
 * Version 3 exposes its active translator through $wpdb->get_driver(). Version
 * 2 exposes its active translator through wpdb's backward-compatible dbh
 * property. Both translate MySQL queries, but neither provides every PDO
 * operation used by MySQLDumpProducer.
 *
 * @return object PDO-compatible adapter (SqliteDriverPDO).
 * @throws RuntimeException If the driver is not available or unsupported.
 */
function create_sqlite_pdo_adapter()
{
    global $wpdb;

    /**
     * Minimum supported sqlite-database-integration version.
     */
    $min_version = '2.1.0';

    if (!class_exists('PDO', false)) {
        throw new RuntimeException('SQLite export requires the PDO extension.');
    }

    require_once __DIR__ . "/class-sqlite-driver-pdo.php";

    $driver = null;
    $raw_pdo = null;

    if (isset($wpdb) && is_object($wpdb) && method_exists($wpdb, 'get_driver')) {
        $candidate = $wpdb->get_driver();
        if (
            is_object($candidate) &&
            method_exists($candidate, 'query') &&
            method_exists($candidate, 'get_sqlite_pdo')
        ) {
            $candidate_pdo = call_user_func([$candidate, 'get_sqlite_pdo']);
        } else {
            $candidate_pdo = null;
        }
        if ($candidate_pdo instanceof PDO) {
            $driver = $candidate;
            $raw_pdo = $candidate_pdo;
        }
    }

    if ($driver === null && isset($wpdb) && is_object($wpdb)) {
        $candidate = $wpdb->dbh;
        $candidate_pdo = null;
        if (is_object($candidate) && method_exists($candidate, 'query')) {
            if (method_exists($candidate, 'get_pdo')) {
                $candidate_pdo = call_user_func([$candidate, 'get_pdo']);
            } elseif (method_exists($candidate, 'get_connection')) {
                $connection = call_user_func([$candidate, 'get_connection']);
                if (is_object($connection) && method_exists($connection, 'get_pdo')) {
                    $candidate_pdo = call_user_func([$connection, 'get_pdo']);
                }
            }
        }
        if ($candidate_pdo instanceof PDO) {
            $driver = $candidate;
            $raw_pdo = $candidate_pdo;
        }
    }

    if ($driver === null) {
        throw new RuntimeException(
            "SQLite export requires WordPress to load a supported " .
            "sqlite-database-integration driver."
        );
    }

    if (
        defined('SQLITE_DRIVER_VERSION') &&
        version_compare(SQLITE_DRIVER_VERSION, $min_version, '<')
    ) {
        throw new RuntimeException(
            "sqlite-database-integration plugin version " . SQLITE_DRIVER_VERSION .
            " is too old. Minimum required: " . $min_version
        );
    }

    return new SqliteDriverPDO($driver, $raw_pdo);
}

/**
 * Wraps the global $wpdb in a PDO-shaped adapter.
 *
 * Used on hosts without ext-pdo_mysql. Requires WordPress to be loaded
 * (so $wpdb is available); throws otherwise.
 */
function create_wpdb_pdo_adapter()
{
    global $wpdb;

    require_once __DIR__ . "/class-wpdb-driver-pdo.php";

    // Guard against a clobbered/half-initialized $wpdb: isset() alone passes
    // for non-object scalars, which would fatal inside the adapter constructor.
    if (!isset($wpdb) || !is_object($wpdb)) {
        throw new RuntimeException(
            "MySQL export without PDO requires WordPress \$wpdb to be initialized."
        );
    }

    return new WpdbDriverPDO($wpdb);
}

if (!class_exists('Site_Export_HTTP_Server', false)) {
    require_once __DIR__ . "/class-http-server.php";
}

/**
 * Emits an error chunk into a multipart stream.
 */
function emit_error_chunk($gz, string $boundary, string $message): void
{
    $json = json_encode([
        "error_type" => "php_error",
        "path" => "",
        "message" => $message,
    ]);
    if ($json === false) {
        $json = '{"error_type":"php_error","path":"","message":"Error (json_encode failed)"}';
    }
    $chunk =
        "--{$boundary}\r\n" .
        "Content-Type: application/json\r\n" .
        "Content-Length: " . strlen($json) . "\r\n" .
        "X-Chunk-Type: error\r\n" .
        "\r\n" .
        $json . "\r\n";
    $write_failed = false;
    try {
        $gz->write($chunk);
        $gz->sync();
    } catch (\Exception $e) {
        $write_failed = true;
    } catch (\Throwable $e) {
        $write_failed = true;
    }

    if ($write_failed) {
        // The output stream is broken, so make one last raw write. If gzip was
        // active, the client likely cannot parse it, but this is better than
        // silent failure.
        echo $chunk;
        flush();
    }
}

// Streaming-aware error handler. Before streaming starts, errors produce
// a JSON response with HTTP 500. Mid-stream, errors become multipart
// error chunks so the client receives structured diagnostics.
//
// Respects the @ operator: suppressed errors are logged but never emitted
// into the stream or sent as responses, since the calling code already
// handles the failure (e.g. @readlink checks for false).
set_error_handler(function ($errno, $errstr, $errfile, $errline) {
    global $streaming_context;

    $error = [
        "error" => "PHP Error: $errstr",
        "file" => $errfile,
        "line" => $errline,
        "type" => $errno,
    ];

    if (!(error_reporting() & $errno)) {
        error_log("Export error (suppressed): " . json_encode($error));
        return true;
    }

    error_log("Export error: " . json_encode($error));

    if ($streaming_context !== null) {
        emit_error_chunk(
            $streaming_context['gz'],
            $streaming_context['boundary'],
            "PHP Error ({$errno}): {$errstr} in {$errfile}:{$errline}"
        );
        return true;
    }

    http_response_code(500);
    @header("Content-Type: application/json");
    echo json_encode($error);
    exit(1);
});

// Streaming-aware exception handler, mirrors the error handler above.
set_exception_handler(function ($e) {
    global $streaming_context;

    $error = [
        "error" => get_class($e) . ": " . $e->getMessage(),
        "file" => $e->getFile(),
        "line" => $e->getLine(),
        "trace" => $e->getTraceAsString(),
    ];
    error_log("Export exception: " . json_encode($error));

    if ($streaming_context !== null) {
        emit_error_chunk(
            $streaming_context['gz'],
            $streaming_context['boundary'],
            get_class($e) . ": " . $e->getMessage()
        );
        return;
    }

    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode($error);
    exit(1);
});

// Catches E_ERROR/E_PARSE fatals that set_error_handler cannot intercept.
register_shutdown_function(function () {
    global $streaming_context;

    $error = error_get_last();
    if ($error === null) {
        return;
    }
    $fatal_types = E_ERROR | E_PARSE | E_CORE_ERROR | E_COMPILE_ERROR;
    if (!($error['type'] & $fatal_types)) {
        return;
    }

    $message = "Fatal: {$error['message']} in {$error['file']}:{$error['line']}";
    error_log("Export fatal: " . json_encode($error));

    if ($streaming_context !== null) {
        // Best-effort attempt to emit an error chunk into the stream.
        // The stream may already be in a broken state, but this gives
        // the client the best chance of receiving structured error info.
        try {
            emit_error_chunk(
                $streaming_context['gz'],
                $streaming_context['boundary'],
                $message
            );
        } catch (Exception $ignored) {
            // Stream is too broken to write to — nothing more we can do.
            return;
        } catch (Throwable $ignored) {
            // Stream is too broken to write to — nothing more we can do.
            return;
        }
        return;
    }

    if (!headers_sent()) {
        http_response_code(500);
        @header("Content-Type: application/json");
        echo json_encode([
            "error" => $message,
            "file" => $error['file'],
            "line" => $error['line'],
            "type" => $error['type'],
        ]);
    }
});

// ============================================================================
// E2E Test Hook System (only active when SITE_EXPORT_TEST_MODE env var is set)
// We don't want anyone to interfere with the export process, which is why those
// hooks are not registered in production.
// ============================================================================
if (getenv('SITE_EXPORT_TEST_MODE')) {
    /**
     * Load test hooks from a well-known path relative to the site root.
     * The hook file can define callback functions that are called at key
     * points during export for testing error conditions and edge cases.
     *
     * Supported hook functions:
     *   test_hook_before_sql_batch(&$sql, $cursor)     - Before SQL batch emitted
     *   test_hook_before_file_chunk($path, $offset, &$data) - Before file chunk
     *   test_hook_after_gzip_init($gz, $boundary)       - After gzip stream init
     *   test_hook_before_completion($status, $gz, $boundary) - Before completion chunk
     *   test_hook_before_index_batch(&$batch_items, $stack)  - Before index batch emitted
     *   test_hook_during_dir_scan($dir, &$entries)       - During directory scanning
     */
    $__test_hook_file_loaded = false;
    function _e2e_load_test_hooks_if_needed(array $config): void {
        global $__test_hook_file_loaded;
        if ($__test_hook_file_loaded) {
            return;
        }
        $candidates = [];
        if (isset($config['directory'])) {
            $dirs = is_array($config['directory']) ? $config['directory'] : [$config['directory']];
            foreach ($dirs as $d) {
                $candidates[] = wp_join_unix_paths(
                    $d,
                    'wp-content/plugins/site-export/test-hooks.php'
                );
            }
        }
        // Also check relative to this file's parent
        $candidates[] = dirname(__DIR__) . '/test-hooks.php';
        foreach ($candidates as $candidate) {
            if (file_exists($candidate)) {
                if (function_exists('opcache_invalidate')) {
                    @opcache_invalidate($candidate, true);
                }
                require $candidate;
                $__test_hook_file_loaded = true;
                return;
            }
        }
    }

    function _e2e_call_hook(string $name, array &$args = []): void {
        if (function_exists($name)) {
            call_user_func_array($name, $args);
        }
    }
}

require_once __DIR__ . "/class-mysql-dump-producer.php";
require_once __DIR__ . "/class-file-tree-producer.php";

/**
 * Prepares the PHP environment for streaming by disabling output buffering,
 * compression layers, and proxy buffering.
 */
function prepare_streaming_response(): void
{
    while (ob_get_level() > 0) {
        @ob_end_clean();
    }

    if (!headers_sent()) {
        @header("X-Accel-Buffering: no");
        @header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
        @header("Pragma: no-cache");
        @header("Expires: 0");
    }

    /**
     * zlib.output_compression buffers the entire response before compressing. The
     * entire point of this plugin is to stream the response, therefore we use a custom
     * GzipOutputStream.
     */
    if (function_exists("ini_set")) {
        @ini_set("zlib.output_compression", "0");
        @ini_set("output_buffering", "0");
        @ini_set("implicit_flush", "1");
    }

    @ob_implicit_flush(true);
}

/**
 * Deduplicates and resolves a list of paths, discarding empty entries.
 */
function normalize_path_list(array $paths): array
{
    $normalized = [];
    foreach ($paths as $path) {
        if (!is_string($path)) {
            continue;
        }
        $path = trim($path);
        if ($path === "") {
            continue;
        }
        $real = realpath($path);
        $final = $real !== false ? $real : $path;
        $final = trim_right_slash($final);
        if ($final === "") {
            continue;
        }
        $normalized[$final] = true;
    }
    return array_keys($normalized);
}

/**
 * Walks parent directories upward from each start path to find WordPress installations.
 */
function detect_wp_roots(array $start_paths): array
{
    $start_paths = normalize_path_list($start_paths);
    $seen = [];
    $roots = [];

    foreach ($start_paths as $start) {
        $current = $start;
        while ($current !== "" && !isset($seen[$current])) {
            $seen[$current] = true;
            $wp_load_path = wp_join_unix_paths($current, "wp-load.php");
            $wp_config_path = wp_join_unix_paths($current, "wp-config.php");
            $wp_content_path = wp_join_unix_paths($current, "wp-content");
            $filesystem_probe_warning = false;
            $reprint_error_handler = null;
            // During preflight, Reprint's error handler turns a warning into HTTP 500.
            // These checks move up to parent directories that open_basedir may block.
            // Catch probe warnings here so we can stop only this walk. Send other error
            // types to the previous handler, then restore that handler in finally below.
            $reprint_error_handler = set_error_handler(
                function ($errno, $errstr, $errfile, $errline) use (
                    &$filesystem_probe_warning,
                    &$reprint_error_handler
                ) {
                    if ($errno === E_WARNING) {
                        $filesystem_probe_warning = true;
                        return true;
                    }
                    if (!is_callable($reprint_error_handler)) {
                        return false;
                    }
                    return call_user_func(
                        $reprint_error_handler,
                        $errno,
                        $errstr,
                        $errfile,
                        $errline
                    );
                }
            );
            try {
                $has_wp_load = file_exists($wp_load_path);
                $has_wp_config = file_exists($wp_config_path);
                $has_wp_content = is_dir($wp_content_path);
            } finally {
                restore_error_handler();
            }
            if ($filesystem_probe_warning) {
                // WordPress root discovery is speculative. If this path cannot be
                // inspected reliably, keep roots found by this walk and let
                // preflight continue with the other start paths.
                break;
            }
            if ($has_wp_load || $has_wp_config) {
                $roots[$current] = [
                    "path" => $current,
                    "wp_load" => $has_wp_load,
                    "wp_load_path" => $has_wp_load ? $wp_load_path : null,
                    "wp_config" => $has_wp_config,
                    "wp_config_path" => $has_wp_config ? $wp_config_path : null,
                    "wp_content" => $has_wp_content,
                ];
            }

            $parent = dirname($current);
            if ($parent === $current || $parent === "") {
                break;
            }
            $current = $parent;
        }
    }

    return [
        "searched" => array_keys($seen),
        "roots" => array_values($roots),
    ];
}

/**
 * Streams SQL dump fragments as gzipped multipart chunks.
 */
function endpoint_sql_chunk(
    array $config,
    ResourceBudget $budget
): array {
    prepare_streaming_response();
    $creds = resolve_db_credentials();

    // -- Parse request parameters --
    $fragments_per_batch = $config["fragments_per_batch"] ?? 1000;
    $fragments_per_batch = require_int_range(
        "fragments_per_batch",
        (int) $fragments_per_batch,
        1,
        10000
    );

    $pdo_options = [];
    if (!empty($config["db_unbuffered"]) && extension_loaded('pdo_mysql')) {
        $pdo_options[PDO::MYSQL_ATTR_USE_BUFFERED_QUERY] = false;
    }
    $mysql = create_db_connection($creds, $pdo_options);

    $producer_options = [
        "create_table_query" => $config["create_table_query"] ?? true,
    ];

    // -- Cap statement size to packet limits --
    // If the client sent its max_allowed_packet, cap the producer's
    // max_statement_size so the dump stays importable on the client.
    // We query the server's own max_allowed_packet too and use the
    // smaller of the two (both scaled to 80% for protocol headroom).
    if (!empty($config["max_allowed_packet"])) {
        $client_max = (int) $config["max_allowed_packet"];
        if ($client_max >= 1048576 && $client_max <= 1073741824) {
            $client_statement_size = (int) ($client_max * 0.8);
            $server_statement_size = null;
            try {
                $row = $mysql
                    ->query("SELECT @@max_allowed_packet AS v")
                    ->fetch(PdoConstants::fetch_assoc());
                if ($row && isset($row["v"])) {
                    $server_statement_size = (int) ((int) $row["v"] * 0.8);
                }
            } catch (Exception $e) {
                // Ignore — producer will auto-detect
            }
            if ($server_statement_size !== null) {
                $producer_options["max_statement_size"] = min(
                    $client_statement_size,
                    $server_statement_size
                );
            } else {
                $producer_options["max_statement_size"] = $client_statement_size;
            }
        }
    }

    if (!empty($config["db_query_time_limit"])) {
        $execution_budget_ms = (int) ($budget->max_time * 1000 * 0.8);
        $query_time_limit = require_int_range(
            "db_query_time_limit",
            (int) $config["db_query_time_limit"],
            0,
            300000
        );
        $query_time_limit = min($query_time_limit, $execution_budget_ms);
        if ($query_time_limit > 0) {
            $producer_options["query_time_limit_ms"] = $query_time_limit;
        }
    }

    $exclude_rows = sql_exclude_rows_from_config($config, $creds["table_prefix"] ?? null);
    if ($exclude_rows) {
        $producer_options["exclude_rows"] = $exclude_rows;
    }

    if (isset($config["skip_tables"])) {
        if (!is_array($config["skip_tables"])) {
            throw new InvalidArgumentException("skip_tables must be an array");
        }
        foreach ($config["skip_tables"] as $skipped_table) {
            if (!is_string($skipped_table) || $skipped_table === "") {
                throw new InvalidArgumentException(
                    "Every skip_tables entry must be a non-empty string"
                );
            }
        }
        $producer_options["exclude_tables"] = array_values($config["skip_tables"]);
    }

    if (isset($config["cursor"])) {
        $producer_options["cursor"] = $config["cursor"];
    }

    $reader = new MySQLDumpProducer(
        $mysql,
        $producer_options
    );

    if (ob_get_level()) {
        ob_end_flush();
    }


    ['gz' => $gz, 'boundary' => $boundary] = begin_multipart_stream(true);

    // E2E test hook: after gzip stream initialization
    if (getenv('SITE_EXPORT_TEST_MODE')) {
        _e2e_load_test_hooks_if_needed($config);
        $hook_args = [$gz, $boundary];
        _e2e_call_hook('test_hook_after_gzip_init', $hook_args);
    }

    if (!isset($config["cursor"])) {
        // Send the initial connection settings separately so the client can save
        // them outside db.sql for a later MySQL connection.
        $session_setup = MySQLDumpProducer::get_session_setup_sql();
        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/sql\r\n" .
            "Content-Length: " . strlen($session_setup) . "\r\n" .
            "X-Chunk-Type: sql_session_setup\r\n" .
            "\r\n"
        );
        $gz->write($session_setup);
        $gz->write("\r\n");
        $gz->sync();
    }

    // -- Stream SQL fragments --
    // Pull SQL fragments from the producer in batches, writing each batch
    // as one or two multipart parts. Stop when the producer is exhausted or the
    // resource budget (time/memory) runs out.
    $batches_processed = 0;
    $sql_bytes_processed = 0;
    $aborted = false;
    /** @var string|null $deferred_fragment */
    $deferred_fragment = null;
    /** @var string|null $deferred_fragment_cursor */
    $deferred_fragment_cursor = null;
    /** @var bool $deferred_fragment_must_be_its_own_part */
    $deferred_fragment_must_be_its_own_part = false;

    $stream_failure = null;
    try {
        while (
            $budget->has_remaining()
        ) {
            $sql_fragments = [];
            $sql_batch_bytes = 0;
            $cursor = null;
            /** @var string|null Cursor after the last fragment included in this batch. */
            $last_fragment_cursor = null;
            $sql_ends_with_complete_statement = false;
            $complete_prefix_byte_length = 0;
            /** @var string|null Cursor after the last complete statement in this batch. */
            $complete_prefix_cursor = null;

            $i = 0;
            $part_must_end = false;
            if ($deferred_fragment !== null) {
                $sql_fragments[] = $deferred_fragment;
                $sql_batch_bytes = strlen($deferred_fragment);
                $cursor = $deferred_fragment_cursor;
                $last_fragment_cursor = $deferred_fragment_cursor;
                $trimmed_fragment = rtrim($deferred_fragment);
                $sql_ends_with_complete_statement =
                    $trimmed_fragment !== '' && substr($trimmed_fragment, -1) === ';';
                if ($sql_ends_with_complete_statement) {
                    $complete_prefix_byte_length = $sql_batch_bytes;
                    $complete_prefix_cursor = $deferred_fragment_cursor;
                }
                $part_must_end = $deferred_fragment_must_be_its_own_part;
                $i = 1;
                $deferred_fragment = null;
                $deferred_fragment_cursor = null;
                $deferred_fragment_must_be_its_own_part = false;
            }

            if (
                !$part_must_end &&
                $i < $fragments_per_batch
            ) {
                while ($reader->next_sql_fragment()) {
                    $fragment = (string) $reader->get_sql_fragment();
                    $fragment_bytes = strlen($fragment);

                    if (
                        $fragment_bytes > MySQLDumpProducer::MAX_SQL_PART_BODY_BYTES
                    ) {
                        throw new RuntimeException(
                            "The SQL producer returned a {$fragment_bytes}-byte fragment; " .
                            "the decoded SQL part body limit is " .
                            MySQLDumpProducer::MAX_SQL_PART_BODY_BYTES .
                            " bytes."
                        );
                    }
                    $fragment_cursor = $reader->get_reentrancy_cursor();

                    if (
                        !empty($sql_fragments) &&
                        $sql_batch_bytes + $fragment_bytes >
                            MySQLDumpProducer::MAX_SQL_PART_BODY_BYTES
                    ) {
                        // The producer has already advanced. Retain this fragment
                        // and its cursor while this batch keeps its earlier cursor.
                        $deferred_fragment = $fragment;
                        $deferred_fragment_cursor = $fragment_cursor;
                        $deferred_fragment_must_be_its_own_part =
                            $reader->current_fragment_must_be_its_own_part();
                        break;
                    }

                    // The importer stores a cursor only after executing a complete part.
                    // Keep the SET header alone before row data. Do not put DROP/CREATE
                    // or the footer after INSERTs: their implicit or explicit COMMIT
                    // could make those rows permanent before the INSERT cursor is stored.
                    // Keep each CONCAT UPDATE alone so its cursor is stored immediately;
                    // if MyISAM stops first, the importer refuses to repeat the append.
                    if (
                        $reader->current_fragment_must_be_its_own_part() &&
                        !empty($sql_fragments) &&
                        $sql_ends_with_complete_statement
                    ) {
                        $deferred_fragment = $fragment;
                        $deferred_fragment_cursor = $fragment_cursor;
                        $deferred_fragment_must_be_its_own_part = true;
                        break;
                    }

                    $sql_fragments[] = $fragment;
                    $sql_batch_bytes += $fragment_bytes;
                    $last_fragment_cursor = $fragment_cursor;
                    $i++;

                    $trimmed_fragment = rtrim($fragment);
                    $sql_ends_with_complete_statement =
                        $trimmed_fragment !== '' && substr($trimmed_fragment, -1) === ';';
                    if ($sql_ends_with_complete_statement) {
                        $cursor = $fragment_cursor;
                        $complete_prefix_byte_length = $sql_batch_bytes;
                        $complete_prefix_cursor = $fragment_cursor;
                    }

                    if ($reader->current_fragment_must_be_its_own_part()) {
                        break;
                    }

                    if ($i >= $fragments_per_batch) {
                        break;
                    }

                    if (
                        !$budget->has_remaining()
                    ) {
                        break;
                    }
                }
            }

            $sql = implode("", $sql_fragments);
            if ($sql === '') {
                break;
            }
            // Does this assembled SQL body end on a complete statement boundary?
            // A complete SQL statement ends with ";"; a fragment from an open
            // INSERT does not.
            $query_complete = $sql_ends_with_complete_statement;
            if (!$query_complete || $cursor === null) {
                $cursor = $last_fragment_cursor;
            }

            // E2E test hook: before SQL batch is emitted
            if (getenv('SITE_EXPORT_TEST_MODE')) {
                $hook_args = [&$sql, $cursor];
                _e2e_call_hook('test_hook_before_sql_batch', $hook_args);
            }

            $sql_batch_bytes = strlen($sql);
            if (
                $sql_batch_bytes > MySQLDumpProducer::MAX_SQL_PART_BODY_BYTES
            ) {
                throw new RuntimeException(
                    "The decoded SQL part body is {$sql_batch_bytes} bytes; " .
                    "the limit is " .
                    MySQLDumpProducer::MAX_SQL_PART_BODY_BYTES .
                    " bytes."
                );
            }
            $sql_bytes_processed += $sql_batch_bytes;
            // Keep only the assembled bounded batch while it is split and emitted.
            unset($sql_fragments);

            if (
                !$query_complete
                && $complete_prefix_byte_length > 0
                && $complete_prefix_cursor !== null
            ) {
                // Expose the last complete statement boundary before the
                // incomplete suffix. The importer can save that cursor instead
                // of retaining earlier statements with the suffix.
                $complete_sql_prefix = substr($sql, 0, $complete_prefix_byte_length);
                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/sql\r\n" .
                    "Content-Length: " . strlen($complete_sql_prefix) . "\r\n" .
                    "X-Chunk-Type: sql\r\n" .
                    "X-Query-Complete: 1\r\n" .
                    "X-Cursor: " . base64_encode($complete_prefix_cursor) . "\r\n" .
                    "\r\n"
                );
                $gz->write($complete_sql_prefix);
                $gz->write("\r\n");
                $gz->sync();
                unset($complete_sql_prefix);

                $sql = substr($sql, $complete_prefix_byte_length);
            }

            $gz->write(
                "--{$boundary}\r\n" .
                "Content-Type: application/sql\r\n" .
                "Content-Length: " . strlen($sql) . "\r\n" .
                "X-Chunk-Type: sql\r\n" .
                "X-Query-Complete: " . ($query_complete ? "1" : "0") . "\r\n" .
                "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                "\r\n"
            );
            $gz->write($sql);
            $gz->write("\r\n");
            $gz->sync();

            $batches_processed++;

            if ($reader->is_finished() && $deferred_fragment === null) {
                break;
            }
        }
    } catch (Exception $e) {
        $stream_failure = $e;
    } catch (Throwable $e) {
        $stream_failure = $e;
    }

    if ($stream_failure !== null) {
        $aborted = true;
        error_log("SQL streaming error: " . $stream_failure->getMessage());
        emit_error_chunk($gz, $boundary, $stream_failure->getMessage());
    }

    // Best-effort completion chunk — the client already has the data chunks.
    $status = $aborted
        ? "partial"
        : ($reader->is_finished() && $deferred_fragment === null ? "complete" : "partial");

    // E2E test hook: before completion chunk
    if (getenv('SITE_EXPORT_TEST_MODE')) {
        $hook_args = [$status, $gz, $boundary];
        _e2e_call_hook('test_hook_before_completion', $hook_args);
    }

    $completion_failure = null;
    try {
        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/octet-stream\r\n" .
            "Content-Length: 0\r\n" .
            "X-Chunk-Type: completion\r\n" .
            "X-Status: {$status}\r\n" .
            "X-Batches-Processed: {$batches_processed}\r\n" .
            "X-SQL-Bytes: {$sql_bytes_processed}\r\n" .
            "X-Memory-Used: " . memory_get_peak_usage(true) . "\r\n" .
            "X-Memory-Limit: " . $budget->max_memory . "\r\n" .
            "X-Time-Elapsed: " . (microtime(true) - $budget->start_time) . "\r\n" .
            "\r\n" .
            "\r\n" .
            "--{$boundary}--\r\n"
        );
        $gz->finish();
    } catch (\Exception $e) {
        $completion_failure = $e;
    } catch (\Throwable $e) {
        $completion_failure = $e;
    }
    if ($completion_failure !== null) {
        error_log("Export: failed to write completion chunk: " . $completion_failure->getMessage());
    }

    return [
        "status" => $status,
        "stats" => [
            "batches_processed" => $batches_processed,
            "sql_bytes" => $sql_bytes_processed,
            "memory_used" => memory_get_peak_usage(true),
            "time_elapsed" => microtime(true) - $budget->start_time,
        ],
    ];
}

/**
 * Streams table metadata (name, estimated rows, size) from INFORMATION_SCHEMA.
 */
function endpoint_db_index(
    array $config,
    ResourceBudget $budget
): array {
    prepare_streaming_response();

    $creds = resolve_db_credentials();

    if (getenv('SITE_EXPORT_TEST_MODE')) {
        _e2e_load_test_hooks_if_needed($config);
    }

    $tables_per_batch = $config["tables_per_batch"] ?? 1000;
    $tables_per_batch = require_int_range(
        "tables_per_batch",
        (int) $tables_per_batch,
        10,
        10000
    );

    $cursor = null;
    if (isset($config["cursor"])) {
        $cursor = json_decode($config["cursor"], true);
        if ($cursor === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException(
                "Invalid cursor format: " . json_last_error_msg()
            );
        }
    }
    $last_table = $cursor["last_table"] ?? "";

    $mysql = create_db_connection($creds);

    ['gz' => $gz, 'boundary' => $boundary] = begin_multipart_stream();

    $tables_processed = 0;
    $rows_estimated = 0;
    $status = "partial";
    $aborted = false;

    $stream_failure = null;
    try {
        while (
            $budget->has_remaining()
        ) {
            $sql =
                "SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, ENGINE, " .
                "TABLE_COLLATION FROM INFORMATION_SCHEMA.TABLES " .
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME > :last " .
                "ORDER BY TABLE_NAME ASC LIMIT {$tables_per_batch}";
            $stmt = $mysql->prepare($sql);
            $stmt->bindValue(":last", $last_table, PdoConstants::param_str());
            $stmt->execute();
            $rows = $stmt->fetchAll(PdoConstants::fetch_assoc());

            if (!$rows) {
                $status = "complete";
                break;
            }

            $tables = [];
            foreach ($rows as $row) {
                $name = (string) ($row["TABLE_NAME"] ?? "");
                $tables[] = [
                    "name" => $name,
                    "rows" =>
                        isset($row["TABLE_ROWS"]) && is_numeric($row["TABLE_ROWS"])
                            ? (int) $row["TABLE_ROWS"]
                            : null,
                    "data_bytes" =>
                        isset($row["DATA_LENGTH"]) && is_numeric($row["DATA_LENGTH"])
                            ? (int) $row["DATA_LENGTH"]
                            : null,
                    "index_bytes" =>
                        isset($row["INDEX_LENGTH"]) && is_numeric($row["INDEX_LENGTH"])
                            ? (int) $row["INDEX_LENGTH"]
                            : null,
                    "engine" => $row["ENGINE"] ?? null,
                    "collation" => $row["TABLE_COLLATION"] ?? null,
                ];
                $last_table = $name;
                $tables_processed++;
                if (
                    isset($row["TABLE_ROWS"]) &&
                    is_numeric($row["TABLE_ROWS"])
                ) {
                    $rows_estimated += (int) $row["TABLE_ROWS"];
                }
            }

            $payload = json_encode_or_throw($tables);
            $cursor_json = json_encode_or_throw([
                "phase" => "tables",
                "last_table" => $last_table,
            ]);

            $gz->write(
                "--{$boundary}\r\n" .
                "Content-Type: application/json\r\n" .
                "Content-Length: " . strlen($payload) . "\r\n" .
                "X-Chunk-Type: table_stats\r\n" .
                "X-Tables: " . count($tables) . "\r\n" .
                "X-Cursor: " . base64_encode($cursor_json) . "\r\n" .
                "\r\n" .
                $payload . "\r\n"
            );
            $gz->sync();

            if (count($rows) < $tables_per_batch) {
                $status = "complete";
                break;
            }
        }
    } catch (\Exception $e) {
        $stream_failure = $e;
    } catch (\Throwable $e) {
        $stream_failure = $e;
    }

    if ($stream_failure !== null) {
        $aborted = true;
        emit_error_chunk(
            $gz,
            $boundary,
            get_class($stream_failure) . ": " . $stream_failure->getMessage()
        );
    }

    $completion_failure = null;
    try {
        if (getenv('SITE_EXPORT_TEST_MODE')) {
            $hook_status = $aborted ? "partial" : $status;
            $hook_args = [$hook_status, $gz, $boundary];
            _e2e_call_hook('test_hook_before_completion', $hook_args);
        }

        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/octet-stream\r\n" .
            "Content-Length: 0\r\n" .
            "X-Chunk-Type: completion\r\n" .
            "X-Status: " . ($aborted ? "partial" : $status) . "\r\n" .
            "X-Tables-Processed: {$tables_processed}\r\n" .
            "X-Rows-Estimated: {$rows_estimated}\r\n" .
            "X-Memory-Used: " . memory_get_peak_usage(true) . "\r\n" .
            "X-Memory-Limit: " . $budget->max_memory . "\r\n" .
            "X-Time-Elapsed: " . (microtime(true) - $budget->start_time) . "\r\n" .
            "\r\n" .
            "\r\n" .
            "--{$boundary}--\r\n"
        );
        $gz->finish();
    } catch (\Exception $e) {
        $completion_failure = $e;
    } catch (\Throwable $e) {
        $completion_failure = $e;
    }
    if ($completion_failure !== null) {
        error_log("Export: failed to write completion chunk: " . $completion_failure->getMessage());
    }

    return [
        "status" => $status,
        "stats" => [
            "tables_processed" => $tables_processed,
            "rows_estimated" => $rows_estimated,
            "memory_used" => memory_get_peak_usage(true),
            "time_elapsed" => microtime(true) - $budget->start_time,
        ],
    ];
}

/**
 * Resolves directory paths from config for operations which can walk only directories.
 */
function resolve_directories(array $config): array
{
    $directories_input = $config["directory"] ?? null;
    if (!$directories_input) {
        throw new InvalidArgumentException(
            "directory is required for files operation"
        );
    }

    $directories = [];
    $dir_list = is_array($directories_input)
        ? $directories_input
        : [$directories_input];

    foreach ($dir_list as $directory) {
        if (!is_string($directory)) {
            throw new InvalidArgumentException(
                "directory entries must be non-empty strings"
            );
        }
        $directory = trim($directory);
        assert_valid_path($directory, "directory entry");

        clearstatcache(true, $directory);
        $real_directory = @realpath($directory);
        if ($real_directory === false || !is_dir($real_directory)) {
            throw new InvalidArgumentException(
                "directory entry is not an accessible directory: {$directory}\n" .
                    "Current working directory: " .
                    getcwd() .
                    "\n" .
                    "Script directory: " .
                    __DIR__
            );
        }

        $directories[] = $real_directory;
    }

    if (empty($directories)) {
        throw new InvalidArgumentException("No valid directories specified");
    }

    return $directories;
}

/**
 * Builds file-index roots from the file_index request's `directory` parameter.
 *
 * The `directory` parameter contains the selected paths. In spite of the
 * parameter name, a selected path may name a directory, regular file, or
 * symlink.
 *
 * Unlike resolve_directories(), this keeps one file-index root for every
 * selected path. `requested_path` is the normalized spelling supplied by the
 * client. `resolved_path` is its realpath() target.
 *
 * FileIndexProcessor adds a link entry at `requested_path` to the file index.
 * It walks a followed directory target at `resolved_path`. It also uses
 * `resolved_path` so aliases to the same target are indexed once.
 *
 * Example: for /site/theme -> /shared/theme, this returns a file-index root
 * with `requested_path` /site/theme, `resolved_path` /shared/theme, and type
 * symlink. With symlink following enabled, it adds the link entry at
 * /site/theme and indexes the target tree at /shared/theme.
 *
 * @return array[] {
 *     File-index roots.
 *
 *     @type string      $requested_path Normalized path supplied by the client.
 *     @type string|null $resolved_path  realpath() target, when available.
 *     @type string      $type           directory, file, symlink, or missing.
 * }
 */
function resolve_file_index_roots(array $config): array
{
    $roots_input = $config["directory"] ?? null;
    if (!$roots_input) {
        throw new InvalidArgumentException("directory is required for files operation");
    }

    $roots = [];
    foreach (is_array($roots_input) ? $roots_input : [$roots_input] as $root_input) {
        if (!is_string($root_input)) {
            throw new InvalidArgumentException("directory entries must be non-empty strings");
        }
        $root_input = trim($root_input);
        assert_valid_path($root_input, "directory entry");
        $requested_path = normalize_path($root_input);
        clearstatcache(true, $requested_path);
        $stat = @lstat($requested_path);
        if ($stat === false) {
            // The client sends `pulled_before` for selected paths an earlier pull
            // already saw. Absence there means the source deleted the path, so it
            // becomes a missing root instead of an error. Anything else absent is
            // a bad path and still throws below.
            $paths_pulled_before = isset($config["pulled_before"]) && is_array($config["pulled_before"])
                ? $config["pulled_before"]
                : [];
            if (in_array($requested_path, $paths_pulled_before, true)) {
                $roots[] = [
                    "requested_path" => $requested_path,
                    "resolved_path" => null,
                    "type" => "missing",
                ];
                continue;
            }
            throw new InvalidArgumentException(
                "Selected file-index root does not exist or is not accessible: {$requested_path}"
            );
        }

        $mode = $stat["mode"] & STAT_TYPE_MASK;
        $type = $mode === STAT_TYPE_LINK ? "symlink" : ( is_dir($requested_path) ? "directory" : "file" );
        $resolved_path = @realpath($requested_path);
        if ($type === "symlink" && $resolved_path === false) {
            throw new InvalidArgumentException("Selected file-index root is a broken symlink: {$requested_path}");
        }
        if ($resolved_path === false) {
            throw new InvalidArgumentException(
                "Selected file-index root does not exist or is not accessible: {$requested_path}"
            );
        }
        if (empty($config["follow_symlinks"])) {
            $parent_link = file_index_parent_symlink($requested_path);
            if ($parent_link !== null) {
                throw new InvalidArgumentException(
                    "Selected file-index root {$requested_path} is reached through parent symlink " .
                    "{$parent_link["path"]} targeting {$parent_link["target"]}; use --follow-symlinks."
                );
            }
        }
        $roots[] = [
            "requested_path" => $requested_path,
            "resolved_path" => $resolved_path,
            "type" => $type,
        ];
    }

    return $roots;
}

/**
 * Returns the file-index root for the file_index request's `list_dir` parameter.
 *
 * `list_dir` normally names a path from `directory[]`. When following symlinks,
 * it may instead name a resolved directory found through a link below one of
 * those selected paths.
 *
 * Example: `directory[]` contains /site. If indexing /site finds a link from
 * /site/theme to /shared/theme, the client later requests
 * `list_dir=/shared/theme`. This function returns a file-index root for
 * /shared/theme even though it is not in `directory[]`.
 *
 * @param array[] $roots           File-index roots returned by resolve_file_index_roots().
 * @param string  $list_directory  Value sent as `list_dir`.
 * @param bool    $follow_symlinks Whether `list_dir` may name a directory reached through a link.
 * @return array {
 *     File-index root for `list_dir`.
 *
 *     @type string      $requested_path Requested normalized root path.
 *     @type string|null $resolved_path  Resolved root path, when available.
 *     @type string      $type           directory, file, symlink, or missing.
 * }
 */
function resolve_file_index_start_root(
    array $roots,
    string $list_directory,
    bool $follow_symlinks
): array {
    $requested_path = normalize_path($list_directory);
    foreach ($roots as $root) {
        if ($root["requested_path"] === $requested_path) {
            return $root;
        }
    }

    if (!$follow_symlinks) {
        throw new InvalidArgumentException(
            "list_dir must name a selected root unless follow_symlinks is enabled: {$requested_path}"
        );
    }

    $resolved_path = @realpath($requested_path);
    if ($resolved_path === false || !is_dir($resolved_path)) {
        throw new InvalidArgumentException(
            "Followed symlink target directory does not exist or is not accessible: {$requested_path}"
        );
    }

    return [
        "requested_path" => $requested_path,
        "resolved_path" => $resolved_path,
        "type" => "directory",
    ];
}

/** Returns the first symlink in a requested root's parent path. */
function file_index_parent_symlink(string $requested_path): ?array
{
    $current = "/";
    $parts = explode("/", trim(dirname($requested_path), "/"));
    foreach ($parts as $part) {
        if ($part === "") {
            continue;
        }
        $current = wp_join_unix_paths($current, $part);
        if (!@is_link($current)) {
            continue;
        }
        $target = @readlink($current);
        return ["path" => $current, "target" => $target === false ? "(unreadable)" : $target];
    }
    return null;
}

/**
 * Returns lightweight preflight checks: filesystem accessibility, DB connectivity,
 * and environment details useful for diagnostics.
 */
function endpoint_preflight(array $config): array
{
    // -- Resolve filesystem roots --
    // Determine which directories to scan: either from the client-provided
    // "directory" config, or by auto-detecting from cwd/DOCUMENT_ROOT/__DIR__.
    $directories = [];
    $dir_error = null;
    $has_root_input = array_key_exists("directory", $config) && $config["directory"] !== null;
    if ($has_root_input) {
        try {
            $directories = resolve_directories($config);
        } catch (Exception $e) {
            $dir_error = $e->getMessage();
        }
    }

    $search_roots = [];
    if (!empty($directories)) {
        $search_roots = $directories;
    } else {
        $filtered = array_filter(
            [
                getcwd() ?: null,
                $_SERVER["DOCUMENT_ROOT"] ?? null,
                isset($_SERVER["SCRIPT_FILENAME"])
                    ? dirname($_SERVER["SCRIPT_FILENAME"])
                    : null,
                __DIR__,
            ],
            function ($value) {
                return $value !== null && $value !== "";
            }
        );
        $search_roots = normalize_path_list($filtered);
    }

    // -- Detect WordPress installations --
    // Walk parent directories to find wp-load.php / wp-config.php.
    $wp_detect = detect_wp_roots($search_roots);
    $detected_root_paths = [];
    foreach ($wp_detect["roots"] as $root) {
        if (!empty($root["path"])) {
            $detected_root_paths[] = $root["path"];
        }
    }
    $detected_root_paths = normalize_path_list($detected_root_paths);

    $wp_load_path = null;
    foreach ($wp_detect["roots"] as $root) {
        if (!empty($root["wp_load_path"]) && is_readable($root["wp_load_path"])) {
            $wp_load_path = $root["wp_load_path"];
            break;
        }
    }
    $preflight_error = null;
    if (!$has_root_input && $wp_load_path === null) {
        $preflight_error =
            "wp-load.php not found and no root directories were provided";
    }

    $scan_roots = !empty($directories) ? $directories : $detected_root_paths;
    if (empty($scan_roots)) {
        $scan_roots = $search_roots;
    }
    $scan_roots = normalize_path_list($scan_roots);

    $wp_scan_roots = normalize_path_list(
        array_merge($scan_roots, $detected_root_paths)
    );

    // -- Probe each directory --
    // Check accessibility, read .htaccess files, and collect disk space info.
    $dir_checks = [];
    $htaccess_files = [];
    $wp_paths = [];
    if (!empty($scan_roots)) {
        foreach ($scan_roots as $dir) {
            $exists = is_dir($dir);
            $readable = $exists && is_readable($dir);
            $openable = false;
            $disk_free = null;
            $disk_total = null;
            if ($readable) {
                $dh = @opendir($dir);
                if ($dh !== false) {
                    $openable = true;
                    @readdir($dh);
                    closedir($dh);
                }
            }
            if ($openable) {
                $disk_free = function_exists("disk_free_space") ? @disk_free_space($dir) : false;
                $disk_total = function_exists("disk_total_space") ? @disk_total_space($dir) : false;
            }
            $dir_checks[] = [
                "path" => $dir,
                "exists" => $exists,
                "readable" => $readable,
                "openable" => $openable,
                "disk_free_bytes" => $disk_free !== false ? $disk_free : null,
                "disk_total_bytes" => $disk_total !== false ? $disk_total : null,
            ];

            $htaccess_path = wp_join_unix_paths($dir, ".htaccess");
            if (file_exists($htaccess_path)) {
                $htaccess_readable = is_readable($htaccess_path);
                $htaccess_size = @filesize($htaccess_path);
                $htaccess_mtime = @filemtime($htaccess_path);
                $htaccess_content = null;
                $htaccess_truncated = false;
                if ($htaccess_readable) {
                    $limit = 8192;
                    $fh = @fopen($htaccess_path, "r");
                    if ($fh) {
                        $data = @fread($fh, $limit + 1);
                        fclose($fh);
                        if ($data !== false) {
                            if (strlen($data) > $limit) {
                                $htaccess_truncated = true;
                                $data = substr($data, 0, $limit);
                            }
                            $htaccess_content = $data;
                        }
                    }
                }
                $htaccess_files[] = [
                    "path" => $htaccess_path,
                    "readable" => $htaccess_readable,
                    "size_bytes" => $htaccess_size !== false ? $htaccess_size : null,
                    "mtime" => $htaccess_mtime !== false ? $htaccess_mtime : null,
                    "content" => $htaccess_content,
                    "truncated" => $htaccess_truncated,
                ];
            }

            $plugins_dir = wp_join_unix_paths($dir, "wp-content/plugins");
            $mu_plugins_dir = wp_join_unix_paths($dir, "wp-content/mu-plugins");
            $themes_dir = wp_join_unix_paths($dir, "wp-content/themes");
            $wp_paths[] = [
                "root" => $dir,
                "plugins_dir" => $plugins_dir,
                "mu_plugins_dir" => $mu_plugins_dir,
                "themes_dir" => $themes_dir,
            ];
        }
    }

    if (!empty($wp_scan_roots)) {
        foreach ($wp_scan_roots as $dir) {
            $plugins_dir = wp_join_unix_paths($dir, "wp-content/plugins");
            $mu_plugins_dir = wp_join_unix_paths($dir, "wp-content/mu-plugins");
            $themes_dir = wp_join_unix_paths($dir, "wp-content/themes");
            $wp_paths[] = [
                "root" => $dir,
                "plugins_dir" => $plugins_dir,
                "mu_plugins_dir" => $mu_plugins_dir,
                "themes_dir" => $themes_dir,
            ];
        }
    }

    $wp_paths = normalize_path_list(
        array_map(
            function ($entry) {
                return $entry["root"] ?? null;
            },
            $wp_paths
        )
    );
    $wp_paths = array_map(function ($root) {
        return [
            "root" => $root,
            "plugins_dir" => wp_join_unix_paths($root, "wp-content/plugins"),
            "mu_plugins_dir" => wp_join_unix_paths($root, "wp-content/mu-plugins"),
            "themes_dir" => wp_join_unix_paths($root, "wp-content/themes"),
        ];
    }, $wp_paths);

    $filesystem_ok = true;
    if ($dir_error !== null) {
        $filesystem_ok = false;
    } elseif (!empty($dir_checks)) {
        foreach ($dir_checks as $check) {
            if (empty($check["openable"])) {
                $filesystem_ok = false;
                break;
            }
        }
    } elseif ($wp_load_path === null) {
        $filesystem_ok = false;
    }

    // -- PHP resource limits --
    // Gather memory, upload, and execution limits so the client can tune
    // its request sizes accordingly.
    $memory_limit_raw = ini_get("memory_limit");
    $memory_limit_bytes = null;
    if ($memory_limit_raw !== false && $memory_limit_raw !== "") {
        if ($memory_limit_raw === "-1") {
            $memory_limit_bytes = PHP_INT_MAX;
        } else {
            $memory_limit_bytes = parse_size($memory_limit_raw);
        }
    }
    $memory_used = memory_get_usage(true);
    $memory_available =
        $memory_limit_bytes !== null && $memory_limit_bytes !== PHP_INT_MAX
            ? max(0, $memory_limit_bytes - $memory_used)
            : null;
    $post_max_size_raw = ini_get("post_max_size");
    $upload_max_filesize_raw = ini_get("upload_max_filesize");
    $post_max_bytes =
        $post_max_size_raw !== false && $post_max_size_raw !== ""
            ? parse_size($post_max_size_raw)
            : null;
    $upload_max_bytes =
        $upload_max_filesize_raw !== false && $upload_max_filesize_raw !== ""
            ? parse_size($upload_max_filesize_raw)
            : null;
    $max_request_bytes = null;
    if ($post_max_bytes !== null && $upload_max_bytes !== null) {
        $max_request_bytes = min($post_max_bytes, $upload_max_bytes);
    } elseif ($post_max_bytes !== null) {
        $max_request_bytes = $post_max_bytes;
    } elseif ($upload_max_bytes !== null) {
        $max_request_bytes = $upload_max_bytes;
    }

    // -- PHP extensions --
    // Report loaded extensions and image processing capabilities.
    $extensions = get_loaded_extensions();
    sort($extensions, SORT_STRING);
    $extension_versions = [];
    foreach ([
        "curl",
        "gd",
        "imagick",
        "pdo_mysql",
        "mysqli",
        "mbstring",
        "zlib",
        "openssl",
        "fileinfo",
        "exif",
    ] as $ext) {
        if (extension_loaded($ext)) {
            $ver = phpversion($ext);
            $extension_versions[$ext] = $ver !== false ? $ver : true;
        }
    }

    $gd_info = function_exists("gd_info") ? gd_info() : null;
    $gd_formats = null;
    $gd_version = null;
    if (is_array($gd_info)) {
        $gd_version = $gd_info["GD Version"] ?? null;
        $gd_formats = [
            "gif_create" => (bool) ($gd_info["GIF Create Support"] ?? false),
            "gif_read" => (bool) ($gd_info["GIF Read Support"] ?? false),
            "jpeg" => (bool) ($gd_info["JPEG Support"] ?? false),
            "png" => (bool) ($gd_info["PNG Support"] ?? false),
            "webp" => (bool) ($gd_info["WebP Support"] ?? false),
            "avif" => (bool) ($gd_info["AVIF Support"] ?? false),
            "bmp" => (bool) ($gd_info["BMP Support"] ?? false),
            "wbmp" => (bool) ($gd_info["WBMP Support"] ?? false),
            "xpm" => (bool) ($gd_info["XPM Support"] ?? false),
        ];
    }
    $imagick_version = extension_loaded("imagick")
        ? (phpversion("imagick") ?: null)
        : null;

    // -- Database connectivity --
    // Find wp-config.php credentials, connect to MySQL, and probe server
    // variables (charset, collation, max_allowed_packet, sql_mode).
    // If WordPress is loadable, also read options like active_plugins,
    // theme, siteurl, multisite config, and WP constants.
    $db = [
        "db_engine" => is_sqlite_site() ? "sqlite" : "mysql",
        "credentials_found" => false,
        "connected" => false,
        "can_query" => false,
        "version" => null,
        "db_charset" => null,
        "db_collation" => null,
        "server_charset" => null,
        "server_collation" => null,
        "table_listable" => null,
        "table_list_error" => null,
        "wp" => [
            "wp_config_path" => null,
            "wp_load_path" => null,
            "wp_load_attempted" => false,
            "wp_load_loaded" => false,
            "wp_load_error" => null,
            "table_prefix" => null,
            "options_table" => null,
            "active_plugins" => null,
            "active_sitewide_plugins" => null,
            "theme_template" => null,
            "theme_stylesheet" => null,
            "siteurl" => null,
            "home" => null,
            "paths_urls" => null,
            "multisite" => null,
            "constants" => null,
            "constant_names" => null,
            "wpdb_charset" => null,
            "wpdb_collation" => null,
            "error" => null,
        ],
        "error" => null,
    ];

    $credential_roots = [];
    if (!empty($directories)) {
        $credential_roots = $directories;
    } elseif (!empty($detected_root_paths)) {
        $credential_roots = $detected_root_paths;
    } elseif (!empty($search_roots)) {
        $credential_roots = $search_roots;
    }
    $credential_roots = normalize_path_list($credential_roots);

    $db["wp"]["wp_load_path"] = $wp_load_path;
    $db["wp"]["wp_load_loaded"] = function_exists("get_option");

    $creds = null;
    try {
        $creds = resolve_db_credentials();
        $db["wp"]["wp_config_path"] = $creds["wp_config_path"];
        $db["wp"]["table_prefix"] = $creds["table_prefix"];
        $db["db_engine"] = $creds["db_engine"] ?? $db["db_engine"];
        $db["credentials_found"] = true;
    } catch (InvalidArgumentException $e) {
        $db["error"] = $e->getMessage();
    }

    if ($creds !== null) {
        $db_engine = $creds["db_engine"] ?? "mysql";
        $required_ext = $db_engine === "sqlite" ? "pdo_sqlite" : "pdo_mysql";
        $wpdb_available = $db_engine !== "sqlite" && isset($GLOBALS["wpdb"]) && is_object($GLOBALS["wpdb"]);

        if (!extension_loaded($required_ext) && !$wpdb_available) {
            $db["error"] = "{$required_ext} extension not loaded";
        } else {
            try {
                $mysql = create_db_connection($creds);
                $db["connected"] = true;

                $version = $mysql->query("SELECT VERSION()")->fetchColumn();
                $db["version"] = $version !== false ? (string) $version : null;
                $db["can_query"] = true;

                $table_prefix = $db["wp"]["table_prefix"];
                if ($table_prefix === null || $table_prefix === "") {
                    try {
                        $stmt = $mysql->query(
                            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES " .
                                "WHERE TABLE_SCHEMA = DATABASE() " .
                                "AND TABLE_NAME LIKE '%\\_options' ESCAPE '\\\\' " .
                                "LIMIT 5"
                        );
                        if ($stmt !== false) {
                            $names = $stmt->fetchAll(PdoConstants::fetch_column());
                            foreach ($names as $name) {
                                if (!is_string($name)) {
                                    continue;
                                }
                                $suffix = "options";
                                if (
                                    strlen($name) > strlen($suffix) &&
                                    substr($name, -strlen($suffix)) === $suffix
                                ) {
                                    $table_prefix = substr(
                                        $name,
                                        0,
                                        -strlen($suffix)
                                    );
                                    break;
                                }
                            }
                        }
                    } catch (Exception $e) {
                        if ($db["wp"]["error"] === null) {
                            $db["wp"]["error"] = $e->getMessage();
                        }
                    }
                }

                if ($table_prefix !== null && $table_prefix !== "") {
                    $db["wp"]["table_prefix"] = $table_prefix;
                    $db["wp"]["options_table"] = $table_prefix . "options";
                }

                $wp_load_attempted = false;
                $wp_load_error = null;
                $wp_loaded = $db["wp"]["wp_load_loaded"];
                if (!$wp_loaded && $wp_load_path !== null) {
                    $wp_load_attempted = true;
                    $errors = [];
                    $handler = function ($errno, $errstr) use (&$errors) {
                        $errors[] = $errstr;
                        return true;
                    };
                    set_error_handler($handler);
                    $include_result = @include_once $wp_load_path;
                    restore_error_handler();
                    if ($include_result === false) {
                        $wp_load_error = !empty($errors)
                            ? implode("; ", $errors)
                            : "Failed to include wp-load.php";
                    }
                    if (function_exists("get_option")) {
                        $wp_loaded = true;
                    } elseif ($wp_load_error === null) {
                        $wp_load_error = "wp-load.php did not load WordPress functions";
                    }
                }

                $db["wp"]["wp_load_attempted"] = $wp_load_attempted;
                $db["wp"]["wp_load_loaded"] = $wp_loaded;
                if ($wp_load_error !== null) {
                    $db["wp"]["wp_load_error"] = $wp_load_error;
                }

                if ($wp_loaded) {
                    try {
                        $wpdb_global = $GLOBALS["wpdb"] ?? null;
                        if (is_object($wpdb_global)) {
                            $wpdb_charset = (string) ($wpdb_global->charset ?? "");
                            $db["wp"]["wpdb_charset"] = $wpdb_charset !== "" ? $wpdb_charset : null;

                            $wpdb_collation = (string) ($wpdb_global->collate ?? "");
                            $db["wp"]["wpdb_collation"] = $wpdb_collation !== "" ? $wpdb_collation : null;
                        }

                        $db["wp"]["active_plugins"] = get_option("active_plugins");
                        $db["wp"]["theme_stylesheet"] = get_option("stylesheet");
                        $db["wp"]["theme_template"] = get_option("template");
                        $db["wp"]["siteurl"] = get_option("siteurl");
                        $db["wp"]["home"] = get_option("home");
                        // Resolve wp-admin and wp-includes paths.
                        // These are always ABSPATH/wp-admin and ABSPATH/WPINC
                        // by WordPress convention, but on hosts like WP Cloud
                        // they may be symlinks (e.g. __wp__/wp-admin -> /wordpress/wp-admin).
                        // Use realpath() to resolve to the physical location so
                        // the importer knows where the files actually live.
                        $wp_admin_path = null;
                        if (defined("ABSPATH")) {
                            $wp_admin_candidate = wp_join_unix_paths(ABSPATH, "wp-admin");
                            $wp_admin_real = realpath($wp_admin_candidate);
                            if ($wp_admin_real !== false && is_dir($wp_admin_real)) {
                                $wp_admin_path = $wp_admin_real;
                            }
                        }

                        $wp_includes_path = null;
                        if (defined("ABSPATH")) {
                            $wpinc = defined("WPINC") ? WPINC : "wp-includes";
                            $wp_includes_candidate = wp_join_unix_paths(ABSPATH, $wpinc);
                            $wp_includes_real = realpath($wp_includes_candidate);
                            if ($wp_includes_real !== false && is_dir($wp_includes_real)) {
                                $wp_includes_path = $wp_includes_real;
                            }
                        }

                        // Use realpath() to resolve any symlinks in
                        // ABSPATH (e.g. /wordpress -> /srv/wpcloud/core/6.9.4
                        // on WP Cloud). This matches the convention used for
                        // all other paths below and ensures the importer can
                        // find the directory at the resolved location where
                        // files are actually downloaded.
                        $abspath_raw = defined("ABSPATH")
                            ? trim_right_slash(ABSPATH)
                            : null;
                        $abspath_resolved = null;
                        if ($abspath_raw !== null) {
                            $abspath_real = realpath($abspath_raw);
                            $abspath_resolved = $abspath_real !== false
                                ? trim_right_slash($abspath_real)
                                : $abspath_raw;
                        }

                        $paths_urls = [
                            "abspath" => $abspath_resolved,
                            "wp_admin_path" => $wp_admin_path,
                            "wp_includes_path" => $wp_includes_path,
                            "content_dir" => defined("WP_CONTENT_DIR")
                                ? realpath(WP_CONTENT_DIR)
                                : null,
                            "content_url" => function_exists("content_url")
                                ? content_url()
                                : (defined("WP_CONTENT_URL") ? WP_CONTENT_URL : null),
                            "plugins_dir" => defined("WP_PLUGIN_DIR")
                                ? realpath(WP_PLUGIN_DIR)
                                : null,
                            "plugins_url" => function_exists("plugins_url")
                                ? plugins_url()
                                : (defined("WP_PLUGIN_URL") ? WP_PLUGIN_URL : null),
                            "mu_plugins_dir" => defined("WPMU_PLUGIN_DIR")
                                ? realpath(WPMU_PLUGIN_DIR)
                                : null,
                            "mu_plugins_url" => function_exists("content_url")
                                ? content_url("/mu-plugins")
                                : (defined("WPMU_PLUGIN_URL") ? WPMU_PLUGIN_URL : null),
                            "uploads" => [
                                "basedir" => null,
                                "baseurl" => null,
                                "subdir" => null,
                            ],
                            "site_url" => function_exists("site_url")
                                ? site_url()
                                : null,
                            "home_url" => function_exists("home_url")
                                ? home_url()
                                : null,
                            "network_site_url" => function_exists("network_site_url")
                                ? network_site_url()
                                : null,
                            "network_home_url" => function_exists("network_home_url")
                                ? network_home_url()
                                : null,
                        ];

                        if (function_exists("wp_upload_dir")) {
                            $uploads = wp_upload_dir(null, false);
                            if (is_array($uploads)) {
                                $raw_basedir = $uploads["basedir"] ?? null;
                                $paths_urls["uploads"]["basedir"] =
                                    is_string($raw_basedir) ? realpath($raw_basedir) : null;
                                $paths_urls["uploads"]["baseurl"] =
                                    $uploads["baseurl"] ?? null;
                                $paths_urls["uploads"]["subdir"] =
                                    $uploads["subdir"] ?? null;
                            }
                        }
                        $db["wp"]["paths_urls"] = $paths_urls;

                        if (
                            function_exists("is_multisite") &&
                            is_multisite() &&
                            function_exists("get_site_option")
                        ) {
                            $db["wp"]["active_sitewide_plugins"] = get_site_option(
                                "active_sitewide_plugins"
                            );
                        }

                        $multisite = [
                            "enabled" => false,
                            "subdomain_install" => defined("SUBDOMAIN_INSTALL")
                                ? (bool) SUBDOMAIN_INSTALL
                                : null,
                            "current_blog_id" =>
                                function_exists("get_current_blog_id")
                                    ? get_current_blog_id()
                                    : null,
                            "current_network_id" =>
                                function_exists("get_current_network_id")
                                    ? get_current_network_id()
                                    : null,
                            "domain_current_site" => defined("DOMAIN_CURRENT_SITE")
                                ? DOMAIN_CURRENT_SITE
                                : null,
                            "path_current_site" => defined("PATH_CURRENT_SITE")
                                ? PATH_CURRENT_SITE
                                : null,
                            "site_id_current_site" =>
                                defined("SITE_ID_CURRENT_SITE")
                                    ? SITE_ID_CURRENT_SITE
                                    : null,
                            "blog_id_current_site" =>
                                defined("BLOG_ID_CURRENT_SITE")
                                    ? BLOG_ID_CURRENT_SITE
                                    : null,
                            "network" => null,
                            "site" => null,
                        ];

                        if (function_exists("is_multisite") && is_multisite()) {
                            $multisite["enabled"] = true;
                            $network_id = $multisite["current_network_id"];
                            if ($network_id !== null && function_exists("get_network")) {
                                $network = get_network($network_id);
                                if (is_object($network)) {
                                    $multisite["network"] = [
                                        "id" => $network->id ?? null,
                                        "domain" => $network->domain ?? null,
                                        "path" => $network->path ?? null,
                                        "site_id" => $network->site_id ?? null,
                                        "registered" => $network->registered ?? null,
                                        "last_updated" => $network->last_updated ?? null,
                                    ];
                                }
                            }

                            $blog_id = $multisite["current_blog_id"];
                            if ($blog_id !== null && function_exists("get_site")) {
                                $site = get_site($blog_id);
                                if (is_object($site)) {
                                    $multisite["site"] = [
                                        "blog_id" => $site->blog_id ?? null,
                                        "domain" => $site->domain ?? null,
                                        "path" => $site->path ?? null,
                                        "site_id" => $site->site_id ?? null,
                                        "registered" => $site->registered ?? null,
                                        "last_updated" => $site->last_updated ?? null,
                                        "public" => $site->public ?? null,
                                        "archived" => $site->archived ?? null,
                                        "mature" => $site->mature ?? null,
                                        "spam" => $site->spam ?? null,
                                        "deleted" => $site->deleted ?? null,
                                        "lang_id" => $site->lang_id ?? null,
                                    ];
                                }
                            }
                        }
                        $db["wp"]["multisite"] = $multisite;

                        // Capture all WP_* constants plus a few other
                        // WordPress-specific ones that don't follow the prefix.
                        // We use the "user" category from get_defined_constants(true)
                        // which only includes constants set via define(), excluding
                        // the thousands of constants from PHP extensions.
                        $user_constants = get_defined_constants(true)["user"] ?? [];
                        // Include non-WP_* constants that are still
                        // important for understanding a WordPress site.
                        $extra_constants_names = [
                            "WPMU_PLUGIN_DIR",
                            "WPMU_PLUGIN_URL",
                            "UPLOADS",
                            "ABSPATH",
                            "DOMAIN_CURRENT_SITE",
                            "PATH_CURRENT_SITE",
                            "SITE_ID_CURRENT_SITE",
                            "BLOG_ID_CURRENT_SITE",
                            "SUBDOMAIN_INSTALL",
                            "TEMPLATEPATH",
                            "STYLESHEETPATH",
                            "FORCE_SSL_LOGIN",
                            "FORCE_SSL_ADMIN",
                            "SAVEQUERIES",
                        ];
                        $db["wp"]["constant_values"] = [];
                        // Names of all runtime-defined constants (without values)
                        // so the importer can use their presence as a detection
                        // signal without leaking secret values. Only includes
                        // constants set via define(), not PHP extension constants.
                        $db["wp"]["constant_names"] = [];
                        foreach ($user_constants as $name => $value) {
                            if (strncmp($name, "WP_", 3) === 0 || in_array($name, $extra_constants_names)) {
                                $db["wp"]["constant_values"][$name] = $value;
                            } else {
                                $db["wp"]["constant_names"][] = $name;
                            }
                        }

                        global $wp_version;
                        $db["wp"]["wp_version"] = isset($wp_version) && is_string($wp_version)
                            ? $wp_version
                            : null;
                    } catch (Exception $e) {
                        if ($db["wp"]["error"] === null) {
                            $db["wp"]["error"] = $e->getMessage();
                        }
                    } catch (Throwable $e) {
                        if ($db["wp"]["error"] === null) {
                            $db["wp"]["error"] = $e->getMessage();
                        }
                    }
                } else {
                    if ($db["wp"]["error"] === null) {
                        if ($wp_load_error !== null) {
                            $db["wp"]["error"] = $wp_load_error;
                        } elseif ($wp_load_path === null) {
                            $db["wp"]["error"] = "wp-load.php not found";
                        } else {
                            $db["wp"]["error"] = "wp-load.php not loaded";
                        }
                    }
                }

                // MySQL server variables — these don't apply to SQLite,
                // so wrap in a separate try/catch to avoid losing WP data
                // gathered earlier if the query fails.
                try {
                    $vars = $mysql
                        ->query(
                            "SELECT @@character_set_database AS db_charset, " .
                                "@@collation_database AS db_collation, " .
                                "@@character_set_server AS server_charset, " .
                                "@@collation_server AS server_collation, " .
                                "@@character_set_connection AS connection_charset, " .
                                "@@collation_connection AS connection_collation, " .
                                "@@max_allowed_packet AS max_allowed_packet, " .
                                "@@sql_mode AS sql_mode, " .
                                "@@lower_case_table_names AS lower_case_table_names"
                        )
                        ->fetch(PdoConstants::fetch_assoc());
                    if (is_array($vars)) {
                        $db["db_charset"] = $vars["db_charset"] ?? null;
                        $db["db_collation"] = $vars["db_collation"] ?? null;
                        $db["server_charset"] = $vars["server_charset"] ?? null;
                        $db["server_collation"] = $vars["server_collation"] ?? null;
                        $db["connection_charset"] = $vars["connection_charset"] ?? null;
                        $db["connection_collation"] = $vars["connection_collation"] ?? null;
                        $db["max_allowed_packet"] = isset($vars["max_allowed_packet"])
                            ? (int) $vars["max_allowed_packet"]
                            : null;
                        $db["sql_mode"] = $vars["sql_mode"] ?? null;
                        $db["lower_case_table_names"] = isset(
                            $vars["lower_case_table_names"]
                        )
                            ? (int) $vars["lower_case_table_names"]
                            : null;
                    }
                } catch (Exception $e) {
                    // Expected for SQLite — these MySQL system variables
                    // don't exist. The null defaults are correct.
                }

                try {
                    $stmt = $mysql->query(
                        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES " .
                            "WHERE TABLE_SCHEMA = DATABASE() LIMIT 1"
                    );
                    if ($stmt !== false) {
                        $stmt->fetchColumn();
                        $db["table_listable"] = true;
                        $db["table_list_error"] = null;
                    } else {
                        $db["table_listable"] = false;
                        $db["table_list_error"] = "SHOW TABLES failed";
                    }
                } catch (Exception $e) {
                    $db["table_listable"] = false;
                    $db["table_list_error"] = $e->getMessage();
                }
            } catch (Exception $e) {
                $db["error"] = $e->getMessage();
            }
        }
    }

    // -- WordPress content inventory --
    // If WordPress was loaded, use its constants for the real plugin/theme/
    // mu-plugin paths. Otherwise, fall back to conventional wp-content/ layout.
    // Scan each directory to list installed plugins, mu-plugins, and themes.
    $wp_runtime_paths = null;
    if ($db["wp"]["wp_load_loaded"]) {
        $runtime_root = defined("ABSPATH") ? trim_right_slash(ABSPATH) : null;
        $content_dir = defined("WP_CONTENT_DIR")
            ? trim_right_slash(WP_CONTENT_DIR)
            : null;
        $plugins_dir = defined("WP_PLUGIN_DIR")
            ? trim_right_slash(WP_PLUGIN_DIR)
            : null;
        $mu_plugins_dir = defined("WPMU_PLUGIN_DIR")
            ? trim_right_slash(WPMU_PLUGIN_DIR)
            : null;
        $themes_dir = null;
        if (function_exists("get_theme_root")) {
            $themes_dir = get_theme_root();
            if (is_string($themes_dir)) {
                $themes_dir = trim_right_slash($themes_dir);
            } else {
                $themes_dir = null;
            }
        }

        if ($content_dir !== null) {
            if ($plugins_dir === null) {
                $plugins_dir = wp_join_unix_paths($content_dir, "plugins");
            }
            if ($mu_plugins_dir === null) {
                $mu_plugins_dir = wp_join_unix_paths($content_dir, "mu-plugins");
            }
            if ($themes_dir === null) {
                $themes_dir = wp_join_unix_paths($content_dir, "themes");
            }
        }

        $wp_runtime_paths = [
            "root" => $runtime_root ?? $content_dir,
            "content_dir" => $content_dir,
            "plugins_dir" => $plugins_dir,
            "mu_plugins_dir" => $mu_plugins_dir,
            "themes_dir" => $themes_dir,
        ];
    }

    $wp_content = [
        "roots" => [],
    ];
    $wp_paths_to_scan = $wp_runtime_paths !== null ? [$wp_runtime_paths] : $wp_paths;
    foreach ($wp_paths_to_scan as $paths) {
        $root_entry = [
            "root" => $paths["root"],
            "content_dir" => $paths["content_dir"] ?? null,
            "plugins" => [],
            "mu_plugins" => [],
            "themes" => [],
        ];
        $plugins_dir = $paths["plugins_dir"] ?? null;
        if ($plugins_dir !== null && is_dir($plugins_dir) && is_readable($plugins_dir)) {
            $entries = @scandir($plugins_dir) ?: [];
            foreach ($entries as $entry) {
                if ($entry === "." || $entry === "..") {
                    continue;
                }
                $path = wp_join_unix_paths($plugins_dir, $entry);
                $root_entry["plugins"][] = [
                    "name" => $entry,
                    "type" => is_dir($path) ? "dir" : "file",
                ];
            }
            usort(
                $root_entry["plugins"],
                function ($a, $b) {
                    return strcmp($a["name"], $b["name"]);
                }
            );
        }

        $mu_plugins_dir = $paths["mu_plugins_dir"] ?? null;
        if ($mu_plugins_dir !== null && is_dir($mu_plugins_dir) && is_readable($mu_plugins_dir)) {
            $entries = @scandir($mu_plugins_dir) ?: [];
            foreach ($entries as $entry) {
                if ($entry === "." || $entry === "..") {
                    continue;
                }
                $path = wp_join_unix_paths($mu_plugins_dir, $entry);
                $root_entry["mu_plugins"][] = [
                    "name" => $entry,
                    "type" => is_dir($path) ? "dir" : "file",
                ];
            }
            usort(
                $root_entry["mu_plugins"],
                function ($a, $b) {
                    return strcmp($a["name"], $b["name"]);
                }
            );
        }

        $themes_dir = $paths["themes_dir"] ?? null;
        if ($themes_dir !== null && is_dir($themes_dir) && is_readable($themes_dir)) {
            $entries = @scandir($themes_dir) ?: [];
            foreach ($entries as $entry) {
                if ($entry === "." || $entry === "..") {
                    continue;
                }
                $path = wp_join_unix_paths($themes_dir, $entry);
                if (is_dir($path)) {
                    $root_entry["themes"][] = $entry;
                }
            }
            sort($root_entry["themes"]);
        }

        $wp_content["roots"][] = $root_entry;
    }

    $environment_variables = [];
    if (PHP_VERSION_ID >= 70100) {
        $all_environment_variables = getenv();
        if (is_array($all_environment_variables)) {
            $environment_variables = $all_environment_variables;
        }
    }
    $environment_variable_names = array_values(array_unique(array_merge(
        array_keys($_ENV),
        array_keys($environment_variables)
    )));

    // -- Probe whether streaming responses can avoid double compression --
    $current_output_compression = ini_get("zlib.output_compression");
    $output_compression_is_on = ! in_array($current_output_compression, [false, "", "0"], true);

    $output_compression_can_be_disabled = true;
    if ($output_compression_is_on) {
        $output_compression_can_be_disabled = false;

        if (function_exists("ini_set")) {
            @ini_set("zlib.output_compression", "0");

            $probed = ini_get("zlib.output_compression");
            $output_compression_can_be_disabled = in_array($probed, [false, "", "0"], true);

            @ini_set("zlib.output_compression", $current_output_compression);
        }
    }

    // -- Assemble and return the preflight response --
    $ok =
        $preflight_error === null &&
        $filesystem_ok &&
        (!empty($db["credentials_found"]) ? !empty($db["connected"]) : false);
    $response = [
        "ok" => $ok,
        "error" => $preflight_error,
        "timestamp" => time(),
        "protocol_version" => EXPORT_PROTOCOL_VERSION,
        "wp_detect" => [
            "found" => !empty($wp_detect["roots"]),
            "searched" => $wp_detect["searched"],
            "roots" => $wp_detect["roots"],
            "error" =>
                !empty($wp_detect["roots"])
                    ? null
                    : "wp-load.php or wp-config.php not found in parent directories",
        ],
        "php" => [
            "version" => PHP_VERSION,
            "sapi" => function_exists("php_sapi_name") ? php_sapi_name() : null,
            "timezone" => date_default_timezone_get(),
            "extensions" => $extensions,
            "extension_versions" => $extension_versions,
        ],
        "limits" => [
            "ini_max_execution_time" => (int) ini_get("max_execution_time"),
            "ini_max_input_time" => (int) ini_get("max_input_time"),
            "ini_default_socket_timeout" => (int) ini_get("default_socket_timeout"),
            "max_input_vars" => (int) ini_get("max_input_vars"),
            "max_file_uploads" => (int) ini_get("max_file_uploads"),
            "post_max_size" => $post_max_size_raw !== false ? $post_max_size_raw : null,
            "post_max_bytes" => $post_max_bytes,
            "upload_max_filesize" =>
                $upload_max_filesize_raw !== false ? $upload_max_filesize_raw : null,
            "upload_max_bytes" => $upload_max_bytes,
            "max_request_bytes" => $max_request_bytes,
            "output_buffering" => ini_get("output_buffering") ?: null,
            "zlib_output_compression" => ini_get("zlib.output_compression") ?: null,
            "zlib_output_compression_can_be_disabled" => $output_compression_can_be_disabled,
            "disable_functions" => ini_get("disable_functions") ?: null,
            "allow_url_fopen" => ini_get("allow_url_fopen") ?: null,
            "open_basedir" => ini_get("open_basedir") ?: null,
        ],
        "memory" => [
            "limit_raw" => $memory_limit_raw !== false ? $memory_limit_raw : null,
            "limit_bytes" => $memory_limit_bytes,
            "used_bytes" => $memory_used,
            "available_bytes" => $memory_available,
        ],
        "images" => [
            "gd" => [
                "available" => is_array($gd_info),
                "version" => $gd_version,
                "formats" => $gd_formats,
            ],
            "imagick" => [
                "available" => $imagick_version !== null,
                "version" => $imagick_version,
            ],
        ],
        "runtime" => [
            "server_software" => $_SERVER["SERVER_SOFTWARE"] ?? null,
            // Every effective INI directive as computed by the PHP runtime
            // after merging php.ini, scanned .ini files, and htaccess
            // overrides.  This captures the full configuration without
            // needing to read the .ini files themselves.
            "ini_get_all" => ini_get_all(null, false),
            "temp_dir" => function_exists("sys_get_temp_dir") ? sys_get_temp_dir() : null,
            "document_root" => $_SERVER["DOCUMENT_ROOT"] ?? null,
            "script_filename" => $_SERVER["SCRIPT_FILENAME"] ?? null,
            "cwd" => getcwd() ?: null,
            // Names of environment variables exposed without their values so
            // the importer can use their presence as a webhost detection
            // signal. PHP 5.6 cannot list getenv(), so it contributes only
            // names present in $_ENV.
            "env_names" => $environment_variable_names,
            '$_SERVER_names' => array_keys($_SERVER),
        ],
        "filesystem" => [
            "directories" => $dir_checks,
            "error" => $dir_error,
            "ok" => $filesystem_ok,
        ],
        "htaccess" => [
            "files" => $htaccess_files,
        ],
        "wp_content" => $wp_content,
        "database" => $db,
    ];

    header("Content-Type: application/json");
    $json = json_encode($response);
    if ($json === false) {
        http_response_code(500);
        echo '{"error":"Failed to serialize preflight response: ' . json_last_error_msg() . '"}';
    } else {
        echo $json;
    }

    return [
        "status" => $response["ok"] ? "ok" : "error",
        "stats" => $response,
    ];
}

/**
 * Streams file chunks from a producer as multipart/mixed.
 */
function stream_file_producer(
    $producer,
    ResourceBudget $budget,
    array $config = [],
    bool $gzip = false
): array {
    prepare_streaming_response();

    ['gz' => $gz, 'boundary' => $boundary] = begin_multipart_stream(false, $gzip);

    // E2E test hook: after gzip stream initialization (file producer)
    if (getenv('SITE_EXPORT_TEST_MODE')) {
        _e2e_load_test_hooks_if_needed($config);
        $hook_args = [$gz, $boundary];
        _e2e_call_hook('test_hook_after_gzip_init', $hook_args);
    }

    $chunks_processed = 0;
    $files_completed = 0;
    $bytes_processed = 0;
    $last_progress_output = microtime(true);
    $metadata_sent = false;
    $iterations = 0;
    $aborted = false;
    $abort_payload = null;
    $last_cursor = "";

    // -- Stream chunks from the producer --
    // The producer yields file data, directories, symlinks, index entries,
    // and progress updates. Each chunk type is wrapped in a multipart part
    // with metadata headers (path, cursor, size, ctime). The loop runs
    // until the producer is exhausted or the resource budget runs out.
    $stream_failure = null;
    try {
        $initial_progress = $producer->get_progress();
        $initial_progress_json = json_encode_or_throw($initial_progress);
        $initial_cursor = $producer->get_reentrancy_cursor();
        $last_cursor = $initial_cursor;
        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/json\r\n" .
            "Content-Length: " . strlen($initial_progress_json) . "\r\n" .
            "X-Chunk-Type: progress\r\n" .
            "X-Cursor: " . base64_encode($initial_cursor) . "\r\n" .
            "\r\n" .
            $initial_progress_json . "\r\n"
        );
        $gz->sync();
        while (true) {
            if (
                !$budget->has_remaining()
            ) {
                break;
            }

            if (!$producer->next_chunk()) {
                break;
            }

            $iterations++;
            $chunk = $producer->get_current_chunk();
            $progress = $producer->get_progress();

            if (!$metadata_sent && $progress["phase"] === "streaming") {
                $filesystem_root = $producer->get_filesystem_root();
                $metadata = [
                    "filesystem_root" => base64_encode($filesystem_root ?? ""),
                ];
                $metadata_json = json_encode_or_throw($metadata);

                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/json\r\n" .
                    "Content-Length: " . strlen($metadata_json) . "\r\n" .
                    "X-Chunk-Type: metadata\r\n" .
                    "X-Filesystem-Root: " . base64_encode($filesystem_root ?? "") . "\r\n" .
                    "\r\n" .
                    $metadata_json . "\r\n"
                );
                $gz->sync();

                $metadata_sent = true;
            }

            if ($chunk === null) {
                $now = microtime(true);
                if ($iterations === 1 || $now - $last_progress_output >= 3.0) {
                    $progress_json = json_encode_or_throw($progress);
                    $cursor = $producer->get_reentrancy_cursor();
                    $last_cursor = $cursor;

                    $gz->write(
                        "--{$boundary}\r\n" .
                        "Content-Type: application/json\r\n" .
                        "Content-Length: " . strlen($progress_json) . "\r\n" .
                        "X-Chunk-Type: progress\r\n" .
                        "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                        "\r\n" .
                        $progress_json . "\r\n"
                    );
                    $gz->sync();

                    $last_progress_output = $now;
                }

                continue;
            }

            $chunk_type = $chunk["type"] ?? "file";
            $cursor = $producer->get_reentrancy_cursor();
            $last_cursor = $cursor;

            if ($chunk_type === "directory") {
                $part =
                    "--{$boundary}\r\n" .
                    "Content-Type: application/octet-stream\r\n" .
                    "Content-Length: 0\r\n" .
                    "X-Chunk-Type: directory\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "X-Directory-Path: " . base64_encode($chunk["path"]) . "\r\n";
                if (isset($chunk["ctime"])) {
                    $part .= "X-Directory-Ctime: " . $chunk["ctime"] . "\r\n";
                }
                $gz->write($part . "\r\n\r\n");
                $gz->sync();
            } elseif ($chunk_type === "symlink") {
                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/octet-stream\r\n" .
                    "Content-Length: 0\r\n" .
                    "X-Chunk-Type: symlink\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "X-Symlink-Path: " . base64_encode($chunk["path"]) . "\r\n" .
                    "X-Symlink-Target: " . base64_encode($chunk["target"]) . "\r\n" .
                    "X-Symlink-Ctime: " . $chunk["ctime"] . "\r\n" .
                    "\r\n\r\n"
                );
                $gz->sync();
            } elseif ($chunk_type === "index") {
                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/octet-stream\r\n" .
                    "Content-Length: 0\r\n" .
                    "X-Chunk-Type: index\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "X-Index-Path: " . base64_encode($chunk["path"]) . "\r\n" .
                    "X-File-Ctime: " . $chunk["ctime"] . "\r\n" .
                    "X-File-Size: " . $chunk["size"] . "\r\n" .
                    "\r\n\r\n"
                );
                $gz->sync();
            } elseif ($chunk_type === "missing") {
                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/octet-stream\r\n" .
                    "Content-Length: 0\r\n" .
                    "X-Chunk-Type: missing\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "X-File-Path: " . base64_encode($chunk["path"]) . "\r\n" .
                    "\r\n\r\n"
                );
                $gz->sync();
            } elseif ($chunk_type === "error") {
                $payload = [
                    "error_type" => $chunk["error_type"] ?? "unknown",
                    "path" => base64_encode($chunk["path"] ?? ""),
                    "message" => $chunk["message"] ?? "Error",
                ];
                if (isset($chunk["expected_ctime"])) {
                    $payload["expected_ctime"] = $chunk["expected_ctime"];
                }
                if (isset($chunk["actual_ctime"])) {
                    $payload["actual_ctime"] = $chunk["actual_ctime"];
                }
                $json = json_encode_or_throw($payload);
                $gz->write(
                    "--{$boundary}\r\n" .
                    "Content-Type: application/json\r\n" .
                    "Content-Length: " . strlen($json) . "\r\n" .
                    "X-Chunk-Type: error\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "\r\n" .
                    $json . "\r\n"
                );
                $gz->sync();
            } else {
                // E2E test hook: before file chunk is emitted
                if (getenv('SITE_EXPORT_TEST_MODE')) {
                    $hook_data = $chunk["data"];
                    $hook_args = [$chunk["path"], $chunk["offset"], &$hook_data];
                    _e2e_call_hook('test_hook_before_file_chunk', $hook_args);
                    $chunk["data"] = $hook_data;
                }

                $chunks_processed++;
                $bytes_processed += strlen($chunk["data"]);
                if ($chunk["is_first_chunk"]) {
                    $files_completed++;
                }

                $data = $chunk["data"];

                $headers =
                    "--{$boundary}\r\n" .
                    "Content-Type: application/octet-stream\r\n" .
                    "Content-Length: " . strlen($data) . "\r\n" .
                    "X-Chunk-Type: file\r\n" .
                    "X-Cursor: " . base64_encode($cursor) . "\r\n" .
                    "X-File-Path: " . base64_encode($chunk["path"]) . "\r\n" .
                    "X-File-Size: " . $chunk["size"] . "\r\n" .
                    "X-File-Ctime: " . $chunk["ctime"] . "\r\n" .
                    "X-Chunk-Offset: " . $chunk["offset"] . "\r\n" .
                    "X-Chunk-Size: " . strlen($data) . "\r\n" .
                    "X-First-Chunk: " . ($chunk["is_first_chunk"] ? "1" : "0") . "\r\n" .
                    "X-Last-Chunk: " . ($chunk["is_last_chunk"] ? "1" : "0") . "\r\n";
                if (!empty($chunk["file_changed"])) {
                    $headers .= "X-File-Changed: 1\r\n";
                    if ($chunk["change_ctime"] !== null) {
                        $headers .= "X-File-Change-Ctime: " . $chunk["change_ctime"] . "\r\n";
                    }
                    if ($chunk["change_size"] !== null) {
                        $headers .= "X-File-Change-Size: " . $chunk["change_size"] . "\r\n";
                    }
                }
                $gz->write($headers . "\r\n");
                $gz->write($data);
                $gz->write("\r\n");
                $gz->sync();
            }
        }
    } catch (Exception $e) {
        $stream_failure = $e;
    } catch (Throwable $e) {
        $stream_failure = $e;
    }

    if ($stream_failure !== null) {
        $aborted = true;
        $abort_payload = [
            "error_type" => "exception",
            "path" => "",
            "message" => $stream_failure->getMessage(),
        ];
    }

    // Best-effort error and completion chunks — the client already has the
    // data chunks. If the stream is broken at this point, log and move on.
    $completion_failure = null;
    try {
        // @TODO: If an exception is thrown right after the previous chunk header,
        //        it read the fixed Content-Length value and will consume this next
        //        chunk as data. We should try and backfill the output up to the
        //        previous content-length value if possible.
        if ($abort_payload !== null) {
            $json = json_encode_or_throw($abort_payload);
            $gz->write(
                "--{$boundary}\r\n" .
                "Content-Type: application/json\r\n" .
                "Content-Length: " . strlen($json) . "\r\n" .
                "X-Chunk-Type: error\r\n" .
                "X-Cursor: " . base64_encode($last_cursor) . "\r\n" .
                "\r\n" .
                $json . "\r\n"
            );
            $gz->sync();
        }

        $progress = $producer->get_progress();
        $is_complete = $progress["phase"] === "finished" && !$aborted;
        $status = $is_complete ? "complete" : "partial";

        // E2E test hook: before completion chunk (file producer)
        if (getenv('SITE_EXPORT_TEST_MODE')) {
            $hook_args = [$status, $gz, $boundary];
            _e2e_call_hook('test_hook_before_completion', $hook_args);
        }

        error_log(
            "Export completion: status={$status}, phase={$progress["phase"]}, " .
                "chunks={$chunks_processed}, files={$files_completed}, bytes={$bytes_processed}"
        );

        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/octet-stream\r\n" .
            "Content-Length: 0\r\n" .
            "X-Chunk-Type: completion\r\n" .
            "X-Status: {$status}\r\n" .
            "X-Chunks-Processed: {$chunks_processed}\r\n" .
            "X-Files-Completed: {$files_completed}\r\n" .
            "X-Bytes-Processed: {$bytes_processed}\r\n" .
            "X-Memory-Used: " . memory_get_peak_usage(true) . "\r\n" .
            "X-Memory-Limit: " . $budget->max_memory . "\r\n" .
            "X-Time-Elapsed: " . (microtime(true) - $budget->start_time) . "\r\n" .
            "\r\n" .
            "\r\n" .
            "--{$boundary}--\r\n"
        );
        $gz->finish();
    } catch (\Exception $e) {
        $completion_failure = $e;
    } catch (\Throwable $e) {
        $completion_failure = $e;
    }
    if ($completion_failure !== null) {
        error_log("Export: failed to write completion chunk: " . $completion_failure->getMessage());
    }

    $status = $aborted ? "partial" : ($status ?? "partial");

    return [
        "status" => $status,
        "stats" => [
            "chunks_processed" => $chunks_processed,
            "files_completed" => $files_completed,
            "bytes_processed" => $bytes_processed,
            "memory_used" => memory_get_peak_usage(true),
            "time_elapsed" => microtime(true) - $budget->start_time,
        ],
    ];
}

/**
 * Encodes batch items for JSON serialization, base64-encoding paths
 * to handle non-UTF8 filesystem bytes.
 */
function encode_index_batch(array $batch_items): array
{
    $encoded = [];
    foreach ($batch_items as $item) {
        $entry = [
            "path" => base64_encode($item["path"]),
            "ctime" => $item["ctime"],
            "size" => $item["size"],
            "type" => $item["type"],
        ];
        if (isset($item["target"])) {
            $entry["target"] = base64_encode($item["target"]);
        }
        if (!empty($item["intermediate"])) {
            $entry["intermediate"] = true;
        }
        if (isset($item["empty"])) {
            $entry["empty"] = $item["empty"];
        }
        $encoded[] = $entry;
    }
    return $encoded;
}

/**
 * Streams a directory index as gzipped JSON batches of {path, ctime, size,
 * type}, plus an `empty` boolean on every inspected directory.
 *
 * FileIndexProcessor owns the resumable filesystem traversal. This endpoint
 * owns HTTP framing, batching, request budgets, and error chunks.
 */
function endpoint_file_index(
    array $config,
    ResourceBudget $budget
): array {
    // This endpoint may run repeatedly in the same PHP process (e.g. PHP built-in
    // server, long-lived workers). Clear stale stat/realpath cache from previous
    // requests so path type transitions (symlink/file/dir) are seen correctly.
    clearstatcache(true);

    $file_index_roots = resolve_file_index_roots($config);
    $batch_size = require_int_range(
        "batch_size",
        (int) ($config["batch_size"] ?? 5000),
        100,
        100000
    );
    $follow_symlinks = !empty($config["follow_symlinks"]);
    $include_caches = !empty($config["include_caches"]);
    $storage_path = isset($config["storage_path"]) && is_string($config["storage_path"])
        ? $config["storage_path"]
        : "";

    if (isset($config["cursor"])) {
        $file_index = FileIndexProcessor::resume(
            $file_index_roots,
            $config["cursor"],
            $follow_symlinks,
            $include_caches,
            $storage_path
        );
    } else {
        $list_directory = $config["list_dir"] ?? null;
        if (!is_string($list_directory) || $list_directory === "") {
            throw new InvalidArgumentException("list_dir is required for file_index");
        }
        $start_root = resolve_file_index_start_root(
            $file_index_roots,
            $list_directory,
            $follow_symlinks
        );
        $file_index = FileIndexProcessor::start(
            $file_index_roots,
            $start_root,
            $follow_symlinks,
            $include_caches,
            $storage_path
        );
    }

    if (getenv('SITE_EXPORT_TEST_MODE')) {
        _e2e_load_test_hooks_if_needed($config);
    }

    $list_directory = $file_index->get_index_directory();
    $filesystem_root = $file_index_roots[0]["resolved_path"] ?? "/";

    prepare_streaming_response();
    ['gz' => $gz, 'boundary' => $boundary] = begin_multipart_stream();

    $batches_emitted = 0;
    $total_entries = 0;
    $batch_items = [];
    $status = "partial";
    $aborted = false;
    $abort_payload = null;

    $stream_failure = null;
    try {
        $metadata = [
            "filesystem_root" => base64_encode($filesystem_root),
            "list_dir" => base64_encode($list_directory),
        ];
        $metadata_json = json_encode_or_throw($metadata);
        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/json\r\n" .
            "Content-Length: " . strlen($metadata_json) . "\r\n" .
            "X-Chunk-Type: metadata\r\n" .
            "X-Filesystem-Root: " . base64_encode($filesystem_root) . "\r\n" .
            "X-Index-Dir: " . base64_encode($list_directory) . "\r\n" .
            "\r\n" .
            $metadata_json . "\r\n"
        );
        $gz->sync();

        $stop = false;
        while (!$stop) {
            if (!$file_index->next_index_step()) {
                $status = "complete";
                break;
            }

            switch ($file_index->get_step_status()) {
                case FileIndexProcessor::STATUS_INDEXED:
                    foreach ($file_index->get_index_entries() as $index_entry) {
                        $batch_items[] = $index_entry;
                    }
                    if (count($batch_items) >= $batch_size) {
                        emit_file_index_batch(
                            $gz,
                            $boundary,
                            $batch_items,
                            $file_index
                        );
                        $batches_emitted++;
                        $total_entries += count($batch_items);
                        $batch_items = [];
                    }
                    if (!$budget->has_remaining()) {
                        $stop = true;
                    }
                    break;

                case FileIndexProcessor::STATUS_PATH_UNAVAILABLE:
                case FileIndexProcessor::STATUS_DIRECTORY_COMPLETE:
                    if (!$budget->has_remaining()) {
                        $stop = true;
                    }
                    break;

                case FileIndexProcessor::STATUS_DIRECTORY_ERROR:
                    $directory_error = $file_index->get_directory_error();
                    emit_file_index_error(
                        $gz,
                        $boundary,
                        $directory_error,
                        $file_index->get_cursor()
                    );
                    break;

                case FileIndexProcessor::STATUS_SKIPPED:
                    // Cache, development, and Reprint-storage paths never
                    // entered the previous endpoint's budget checks either.
                    break;
            }
        }
    } catch (Exception $e) {
        $stream_failure = $e;
    } catch (Throwable $e) {
        $stream_failure = $e;
    }

    if ($stream_failure !== null) {
        $aborted = true;
        $current_directory = $file_index->get_current_directory();
        $abort_payload = [
            "error_type" => "exception",
            "path" => base64_encode($current_directory ?? $list_directory),
            "message" => $stream_failure->getMessage(),
        ];
    }

    if (!empty($batch_items)) {
        emit_file_index_batch($gz, $boundary, $batch_items, $file_index);
        $batches_emitted++;
        $total_entries += count($batch_items);
    }

    $completion_failure = null;
    try {
        if ($abort_payload !== null) {
            emit_file_index_error(
                $gz,
                $boundary,
                $abort_payload,
                $file_index->get_cursor(),
                true
            );
            $status = "partial";
        }

        $cursor_json = json_encode_or_throw(
            $file_index->get_cursor(),
            JSON_UNESCAPED_SLASHES
        );
        $cursor_base64 = base64_encode($cursor_json);
        $gz->write(
            "--{$boundary}\r\n" .
            "Content-Type: application/octet-stream\r\n" .
            "Content-Length: 0\r\n" .
            "X-Chunk-Type: completion\r\n" .
            "X-Status: " . ($aborted ? "partial" : $status) . "\r\n" .
            "X-Cursor: {$cursor_base64}\r\n" .
            "X-Index-Dir: " . base64_encode($list_directory) . "\r\n" .
            "X-Batches-Emitted: {$batches_emitted}\r\n" .
            "X-Total-Entries: {$total_entries}\r\n" .
            "X-Memory-Used: " . memory_get_peak_usage(true) . "\r\n" .
            "X-Memory-Limit: " . $budget->max_memory . "\r\n" .
            "X-Time-Elapsed: " . (microtime(true) - $budget->start_time) . "\r\n" .
            "\r\n" .
            "\r\n" .
            "--{$boundary}--\r\n"
        );
        $gz->finish();
    } catch (Exception $e) {
        $completion_failure = $e;
    } catch (Throwable $e) {
        $completion_failure = $e;
    } finally {
        $file_index->close();
    }
    if ($completion_failure !== null) {
        error_log("Export: failed to write completion chunk: " . $completion_failure->getMessage());
    }

    return [
        "status" => $aborted ? "partial" : $status,
        "stats" => [
            "batches_emitted" => $batches_emitted,
            "total_entries" => $total_entries,
            "memory_used" => memory_get_peak_usage(true),
            "time_elapsed" => microtime(true) - $budget->start_time,
        ],
    ];
}

/**
 * Writes one file-index batch with the processor's current cursor.
 *
 * @param object             $gzip_stream Gzip stream returned by begin_multipart_stream().
 * @param string             $boundary    Multipart boundary.
 * @param array[]            $batch_items File-index entries in this batch.
 * @param FileIndexProcessor $file_index  Active file-index processor.
 */
function emit_file_index_batch(
    $gzip_stream,
    string $boundary,
    array &$batch_items,
    FileIndexProcessor $file_index
): void {
    if (getenv('SITE_EXPORT_TEST_MODE')) {
        $directory_stack = [];
        foreach ($file_index->get_cursor()["stack"] as $encoded_frame) {
            $directory_stack[] = [
                "dir" => base64_decode($encoded_frame["dir"]),
                "after" => $encoded_frame["after"] !== null
                    ? base64_decode($encoded_frame["after"])
                    : null,
            ];
        }
        $hook_args = [&$batch_items, $directory_stack];
        _e2e_call_hook('test_hook_before_index_batch', $hook_args);
    }

    $cursor_json = json_encode_or_throw(
        $file_index->get_cursor(),
        JSON_UNESCAPED_SLASHES
    );
    $cursor_base64 = base64_encode($cursor_json);
    $json = json_encode_or_throw(
        encode_index_batch($batch_items),
        JSON_UNESCAPED_SLASHES
    );
    $gzip_stream->write(
        "--{$boundary}\r\n" .
        "Content-Type: application/json\r\n" .
        "Content-Length: " . strlen($json) . "\r\n" .
        "X-Chunk-Type: index_batch\r\n" .
        "X-Cursor: {$cursor_base64}\r\n" .
        "X-Batch-Size: " . count($batch_items) . "\r\n" .
        "\r\n"
    );
    $gzip_stream->write($json);
    $gzip_stream->write("\r\n");
    $gzip_stream->sync();
}

/**
 * Writes one file-index error with the cursor after that failure.
 *
 * @param object $gzip_stream    Gzip stream returned by begin_multipart_stream().
 * @param string $boundary       Multipart boundary.
 * @param array  $error          {
 *     File-index error.
 *
 *     @type string $error_type Protocol error type.
 *     @type string $path       Filesystem path.
 *     @type string $message    Human-readable explanation.
 * }
 * @param array  $cursor         {
 *     File-index cursor after the failure.
 *
 *     @type array[] $stack Active directories with base64-encoded path names.
 * }
 * @param bool   $path_is_base64 Whether the error path is already base64 text.
 */
function emit_file_index_error(
    $gzip_stream,
    string $boundary,
    array $error,
    array $cursor,
    bool $path_is_base64 = false
): void {
    if (!$path_is_base64) {
        $error["path"] = base64_encode($error["path"]);
    }
    $json = json_encode_or_throw($error);
    $cursor_json = json_encode_or_throw($cursor, JSON_UNESCAPED_SLASHES);
    $cursor_base64 = base64_encode($cursor_json);
    $gzip_stream->write(
        "--{$boundary}\r\n" .
        "Content-Type: application/json\r\n" .
        "Content-Length: " . strlen($json) . "\r\n" .
        "X-Chunk-Type: error\r\n" .
        "X-Cursor: {$cursor_base64}\r\n" .
        "\r\n" .
        $json . "\r\n"
    );
    $gzip_stream->sync();
}

/**
 * Streams files from client-provided base64 path records uploaded as JSON.
 */
function endpoint_file_fetch(
    array $config,
    ResourceBudget $budget
): array {
    // Same rationale as endpoint_file_index(): avoid stale path metadata across
    // requests in long-lived PHP processes.
    clearstatcache(true);

    $directories = resolve_directories($config);

    $list_path = $config["file_list_path"] ?? null;
    if ($list_path === null && isset($_FILES["file_list"])) {
        $tmp_name = $_FILES["file_list"]["tmp_name"] ?? "";
        if ($tmp_name === "" || !is_uploaded_file($tmp_name)) {
            throw new InvalidArgumentException(
                "file_list upload missing or invalid"
            );
        }
        $list_path = $tmp_name;
    }

    if ($list_path === null) {
        throw new InvalidArgumentException(
            "file_list is required for file_fetch endpoint"
        );
    }

    $raw = file_get_contents($list_path);
    if ($raw === false) {
        throw new InvalidArgumentException("Failed to read file_list");
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        throw new InvalidArgumentException(
            "file_list must be a JSON array of base64 path records"
        );
    }
    $paths = [];
    foreach ($decoded as $entry_index => $entry) {
        $encoded_path = null;
        if (is_array($entry)) {
            $encoded_path = $entry["path"] ?? null;
        }
        $path = is_string($encoded_path)
            ? base64_decode($encoded_path, true)
            : false;
        // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol error, never HTML output.
        if (!is_string($path) || $path === "") {
            throw new InvalidArgumentException(
                "file_list entry {$entry_index} must contain a nonempty base64 path"
            );
        }
        // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
        $paths[] = $path;
    }

    $chunk_size = $config["chunk_size"] ?? FileTreeProducer::DEFAULT_CHUNK_SIZE;
    $chunk_size = require_int_range(
        "chunk_size",
        (int) $chunk_size,
        16 * 1024,
        32 * 1024 * 1024
    );

    $sync_options = [
        "chunk_size" => $chunk_size,
        "paths" => $paths,
    ];
    if (isset($config["cursor"])) {
        $sync_options["cursor"] = $config["cursor"];
    }

    $producer = new FileTreeProducer($directories, $sync_options);
    return stream_file_producer(
        $producer,
        $budget,
        $config,
        file_fetch_paths_should_gzip($paths)
    );
}

/**
 * Decides whether to gzip a file_fetch multipart response based on the path
 * list it will carry.
 *
 * Encoding is set per response (Content-Encoding is a response-level header),
 * so we have to commit before any byte is sent. The trade-off:
 *   - Text-y bodies (PHP/JS/CSS/JSON/SQL/HTML/etc.) compress 5–60×. Gzip is
 *     a clear win on wire size and total wall time.
 *   - Image/video/audio/font/archive bodies are already compressed; passing
 *     them through gzip costs ~4 ms per 200 KB and produces ~0% size
 *     reduction (deflate falls back to literal stored blocks for incompressible
 *     input). Negligible per individual file, but unbounded if the batch is
 *     all-binary multiplied by request volume.
 *
 * Rule: gzip the response if **any** file in the batch is compressible.
 *
 * The previous all-or-nothing rule ("gzip only if every file is compressible")
 * was over-conservative — a single PNG in a 200-CSS batch flipped the whole
 * response to identity, losing ~50 % of wire size that would have compressed.
 * The wasted CPU on the small binary portion of mixed batches is bounded by
 * request size (capped server-side), so this trade-off favors smaller wire
 * bytes on the common WordPress mixed batch (theme dirs, wp-content/uploads
 * mixed with plugin assets) without harming the all-binary uploads case
 * (which has zero compressible files and stays identity).
 */
function file_fetch_paths_should_gzip(array $paths): bool
{
    if ($paths === []) {
        return false;
    }
    $any_compressible = false;
    foreach ($paths as $path) {
        if (!is_string($path)) {
            // Defensive: an unexpected non-string entry is a bad input we
            // shouldn't compress around. Treat as a hard reject.
            return false;
        }
        // Once true, we can skip checking the subsequent files.
        if ($any_compressible) {
            continue;
        }
        $ext = path_extension_compressibility($path);
        if ($ext === 'yes') {
            $any_compressible = true;
            continue;
        }
        if ($ext === 'unknown') {
            // Extension didn't match a known-text or known-binary list. Peek
            // at the first 64 bytes and let the bytes decide. Cheap (one
            // open/read/close per file) and means we don't have to grow the
            // whitelist every time a plugin invents a new template suffix.
            if (path_head_looks_like_text($path)) {
                $any_compressible = true;
            }
            continue;
        }
        // 'no' — known binary. Skip; doesn't disqualify the batch.
    }
    return $any_compressible;
}

/**
 * Three-state classifier for a path's extension.
 *
 *   - 'yes'     known text-y extension (or dotfile / extensionless name).
 *   - 'no'      known binary/already-compressed extension.
 *   - 'unknown' neither list matches; caller may probe the file bytes.
 */
function path_extension_compressibility(string $path): string
{
    $basename = basename($path);
    if ($basename === '') {
        return 'no';
    }
    // Dotfiles like .htaccess / .env / .gitignore have no "real" extension —
    // pathinfo() reports the part after the leading dot as the extension,
    // but they're text by convention. Treat the whole class as compressible.
    if ($basename[0] === '.' && strpos($basename, '.', 1) === false) {
        return 'yes';
    }
    $ext = strtolower((string) pathinfo($basename, PATHINFO_EXTENSION));
    // Files with truly no extension (LICENSE, README, Makefile) — treat as text.
    if ($ext === '') {
        return 'yes';
    }
    static $compressible = [
        // Source / markup
        'php', 'phtml', 'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs',
        'css', 'scss', 'sass', 'less',
        'html', 'htm', 'xml', 'xsl', 'xslt', 'svg',
        'vue', 'astro', 'twig', 'mustache', 'hbs', 'liquid',
        // Data / config
        'json', 'jsonl', 'yaml', 'yml', 'toml', 'csv', 'tsv',
        'sql', 'ini', 'conf', 'cfg', 'env', 'properties',
        // Docs / plain text
        'md', 'markdown', 'txt', 'log', 'rst', 'adoc',
        // Translations / feeds / captions
        'pot', 'po', 'rss', 'atom', 'srt', 'vtt', 'webvtt',
        // Misc text-y
        'sh', 'bash', 'patch', 'diff',
    ];
    if (in_array($ext, $compressible, true)) {
        return 'yes';
    }
    static $incompressible = [
        // Already-compressed / encrypted archives
        'zip', 'gz', 'tgz', 'bz2', 'xz', '7z', 'rar', 'tar',
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif',
        'tiff', 'tif', 'bmp', 'ico',
        // Audio
        'mp3', 'm4a', 'aac', 'ogg', 'opus', 'flac', 'wav',
        // Video
        'mp4', 'm4v', 'mov', 'webm', 'mkv', 'avi',
        // Fonts (already deflate-compressed in woff/woff2)
        'woff', 'woff2', 'ttf', 'otf', 'eot',
        // Misc binary blobs
        'pdf', 'psd', 'sketch', 'fig', 'iso', 'dmg', 'mo', 'phar',
    ];
    if (in_array($ext, $incompressible, true)) {
        return 'no';
    }
    return 'unknown';
}

/**
 * Probes the first bytes of a file to decide if it looks like text.
 *
 * Used as a fallback when the extension didn't match either the text or the
 * binary list. The cost is one open + read + close per file in the
 * file_fetch batch, which is negligible relative to streaming the file
 * itself; the upside is we don't need to grow the extension lists every
 * time a plugin invents a new template suffix.
 *
 * The check is deliberately strict: any NUL or other ASCII control byte
 * (outside tab/newline/CR/form-feed) means binary, and the head must also
 * decode as valid UTF-8. UTF-8 happens to reject most random binary
 * sequences naturally because high-bit bytes only validate in well-formed
 * multi-byte runs — so PNG, JPEG, ZIP, etc. fail this within a handful of
 * bytes even when their headers look ASCII.
 */
function path_head_looks_like_text(string $path): bool
{
    if (!is_file($path)) {
        return false;
    }
    $fp = @fopen($path, 'rb');
    if ($fp === false) {
        // Producer will surface a clearer error later; don't compress on
        // unreadable paths.
        return false;
    }
    $head = (string) fread($fp, 64);
    fclose($fp);
    if ($head === '') {
        // Empty file: nothing to compress, default to identity.
        return false;
    }
    // Any NUL byte → binary. Cheapest signal, catches PNG/ZIP/woff/etc.
    if (strpos($head, "\x00") !== false) {
        return false;
    }
    // Other ASCII control bytes (excluding TAB \x09, LF \x0A, FF \x0C, CR \x0D)
    // shouldn't appear in source/data files. Also reject DEL \x7F.
    if (preg_match('/[\x01-\x08\x0B\x0E-\x1F\x7F]/', $head)) {
        return false;
    }
    // Must decode cleanly as UTF-8. mb_check_encoding handles the case where
    // a multi-byte sequence is sliced by our 64-byte window: it returns false,
    // which we treat as "not obviously text" — biased toward identity, which
    // is the safe direction.
    if (function_exists('mb_check_encoding') && !mb_check_encoding($head, 'UTF-8')) {
        return false;
    }
    return true;
}

/**
 * Reports whether a path belongs to the established default file-index skip set.
 *
 * @param string $path Filesystem path to classify.
 * @return bool Whether the path is omitted unless caches are included.
 */
function path_is_default_skipped(string $path): bool
{
    return FileIndexProcessor::path_is_default_skipped($path);
}

/**
 * Maps importer-requested SQL row filters to producer row-exclusion rules.
 *
 * Rules are data, not exporter-known tokens. A client may provide:
 *
 *   skip_rows[0][table_name_without_prefix]=postmeta
 *   skip_rows[0][column]=meta_key
 *   skip_rows[0][value_base64]=X2VkaXRfbG9jaw==
 *
 * `table_name_without_prefix` is appended to the server-side WordPress table prefix. The
 * prefix must come from WordPress; if it cannot be resolved, clients must use
 * explicit `table` instead. Values are base64-encoded so raw bytes never travel
 * as SQL text.
 *
 * @return array[] {
 *     SQL row exclusion rules.
 *
 *     @type string $table  Table name.
 *     @type string $column Column name.
 *     @type string $value  Column value to exclude.
 * }
 * @phpstan-return list<array{table: string, column: string, value: string}>
 */
function sql_exclude_rows_from_config(array $config, ?string $table_prefix): array
{
    if (!isset($config["skip_rows"])) {
        return [];
    }

    $requested = $config["skip_rows"];
    if (is_string($requested)) {
        $decoded = json_decode($requested, true);
        if (!is_array($decoded)) {
            throw new InvalidArgumentException("skip_rows string must be a JSON array");
        }
        $requested = $decoded;
    }
    if (!is_array($requested)) {
        throw new InvalidArgumentException("skip_rows must be an array");
    }

    $rules = [];
    foreach ($requested as $index => $rule) {
        if (!is_array($rule)) {
            throw new InvalidArgumentException("skip_rows[{$index}] must be an object");
        }

        $has_table = isset($rule["table"]);
        $has_table_name_without_prefix = isset($rule["table_name_without_prefix"]);
        if ($has_table === $has_table_name_without_prefix) {
            throw new InvalidArgumentException("skip_rows[{$index}] must include exactly one of table or table_name_without_prefix");
        }
        if (!isset($rule["column"], $rule["value_base64"])) {
            throw new InvalidArgumentException("skip_rows[{$index}] must include column and value_base64");
        }
        if (!is_string($rule["column"]) || $rule["column"] === "") {
            throw new InvalidArgumentException("skip_rows[{$index}].column must be a non-empty string");
        }
        if (!is_string($rule["value_base64"])) {
            throw new InvalidArgumentException("skip_rows[{$index}].value_base64 must be a string");
        }

        if ($has_table_name_without_prefix) {
            if (!is_string($rule["table_name_without_prefix"]) || $rule["table_name_without_prefix"] === "") {
                throw new InvalidArgumentException("skip_rows[{$index}].table_name_without_prefix must be a non-empty string");
            }
            if ($table_prefix === null || $table_prefix === "") {
                throw new InvalidArgumentException("skip_rows[{$index}].table_name_without_prefix requires a table_prefix");
            }
            $table = $table_prefix . $rule["table_name_without_prefix"];
        } else {
            if (!is_string($rule["table"]) || $rule["table"] === "") {
                throw new InvalidArgumentException("skip_rows[{$index}].table must be a non-empty string");
            }
            $table = $rule["table"];
        }

        $value = base64_decode($rule["value_base64"], true);
        if ($value === false) {
            throw new InvalidArgumentException("skip_rows[{$index}].value_base64 must be valid base64");
        }

        $rules[] = [
            "table" => $table,
            "column" => $rule["column"],
            "value" => $value,
        ];
    }

    return $rules;
}

/**
 * Validates that an integer falls within the given range, or throws.
 */
function require_int_range(
    string $name,
    int $value,
    int $min,
    int $max
): int {
    if ($value < $min || $value > $max) {
        throw new InvalidArgumentException(
            "{$name} out of range. Expected {$min}-{$max}, got {$value}"
        );
    }
    return $value;
}

/**
 * Validates that a float falls within the given range, or throws.
 */
function require_float_range(
    string $name,
    float $value,
    float $min,
    float $max
): float {
    if ($value < $min || $value > $max) {
        throw new InvalidArgumentException(
            "{$name} out of range. Expected {$min}-{$max}, got {$value}"
        );
    }
    return $value;
}

/**
 * Builds the config array from HTTP GET/POST parameters and optional JSON body.
 */
function parse_http_config(): array
{
    $body = file_get_contents('php://input');
    if ($body === false) {
        $body = '';
    }

    $server = new Site_Export_HTTP_Server();
    return $server->parse_http_config($_GET, $_POST, $_SERVER, $body);
}
