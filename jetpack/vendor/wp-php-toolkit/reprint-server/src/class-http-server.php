<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;

if (!class_exists('WordPress\\Reprint\\Server\\ResourceBudget', false)) {
    require_once __DIR__ . '/class-resource-budget.php';
}
if (!class_exists(PushConfigurationException::class, false)) {
    require_once __DIR__ . '/class-push-configuration-exception.php';
}

/**
 * HTTP dispatcher for the Reprint Server API.
 */
final class HTTPServer {

    private const PUSH_ENDPOINT_METHODS = [
        'push_create' => 'create',
        'push_upload' => 'upload',
        'push_status' => 'status',
        'push_commit' => 'commit',
        'push_remove' => 'remove',
    ];

    private const DATABASE_PUSH_ENDPOINTS = ['push_db_create', 'push_db_upload', 'push_db_status', 'push_db_commit', 'push_db_cleanup', 'push_db_discard'];

    /** @var DatabasePushEndpoints|null */
    private $database_push_endpoints;

    /** @var array<string, callable> */
    private $handlers;

    /** @var callable */
    private $budget_factory;

    /** @var callable */
    private $body_reader;

    /** @var string */
    private $cursor_header_name;

    /** @var string|null */
    private $default_directory;

    /** @var PushEndpoints|null */
    private $push_endpoints;

    /** @var array|null Trusted WordPress source metadata, never read from the request. */
    private $multisite;

    public function __construct(array $options = []) {
        $this->multisite = $options['multisite'] ?? null;
        $this->budget_factory = $options['budget_factory'] ?? [$this, 'default_budget_factory'];
        $this->body_reader = $options['body_reader'] ?? static function (): string {
            $body = file_get_contents('php://input');
            return $body === false ? '' : $body;
        };
        $this->cursor_header_name = $options['cursor_header_name'] ?? 'HTTP_X_EXPORT_CURSOR';
        $this->default_directory = $options['default_directory'] ?? null;
        $this->push_endpoints = null;
        if (array_key_exists('push', $options)) {
            try {
                if (!is_array($options['push'])) {
                    throw new InvalidArgumentException('The push HTTP server option must be an array.');
                }
                if (!class_exists(PushEndpoints::class, false)) {
                    require_once __DIR__ . '/class-push-endpoints.php';
                }
                $this->push_endpoints = new PushEndpoints($options['push']);
            } catch (InvalidArgumentException $exception) {
                // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- This rethrows a trusted configuration error; it does not render output.
                throw new PushConfigurationException(
                    $exception->getMessage(),
                    0,
                    $exception
                );
                // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
            }
        }
        if (isset($options['database_push'])) {
            require_once __DIR__ . '/class-database-push-endpoints.php';
            $this->database_push_endpoints = new DatabasePushEndpoints($options['database_push']);
        }
        $this->handlers = $options['handlers'] ?? $this->default_handlers();
    }

    public function handle_request(array $request = []): void {
        $server = $request['server'] ?? $_SERVER;
        $get = $request['get'] ?? $_GET;
        $post = $request['post'] ?? $_POST;
        // A push endpoint travels in the signed query string, and a push upload
        // streams php://input itself, so no push body is read here.
        $endpoint = $get['endpoint'] ?? null;
        $uses_push_request_contract = is_string($endpoint) && strpos($endpoint, 'push_') === 0;
        $body = '';
        if ($uses_push_request_contract) {
            // $_POST must not override the signed query endpoint after the
            // router has applied push authorization to that query endpoint.
            $post = [];
        } else {
            $body = array_key_exists('body', $request)
                ? (string) $request['body']
                : ( $this->is_json_content_type($server) ? call_user_func($this->body_reader) : '' );
        }
        $config = $request['config'] ?? $this->parse_http_config(
            $get,
            $post,
            $server,
            $body
        );
        $config = $this->normalize_config($config, $server);
        $this->dispatch($config);
    }

    /**
     * Emits CORS headers and terminates OPTIONS preflight requests.
     *
     * Must be called BEFORE authentication runs — browsers send
     * preflight OPTIONS without credentials, so the consumer must not
     * require auth headers before this check passes.
     *
     * A wildcard origin ('*') is safe when authentication happens
     * out-of-band (e.g., HMAC with a pre-shared secret) — an attacker
     * without the secret cannot export anything regardless of origin.
     *
     * For OPTIONS requests this terminates the process. For all other
     * methods it just emits the headers and returns so the caller can
     * continue with authentication and dispatch.
     *
     * @param string|true $origin The Access-Control-Allow-Origin value,
     *     or true as a shorthand for '*'.
     * @param string $allow_headers The Access-Control-Allow-Headers value.
     *     Defaults to '*' to permit all headers. Pass a comma-separated
     *     list to restrict (e.g. 'Content-Type, X-Auth-Signature').
     * @param array<string, mixed> $server Request server array (defaults to $_SERVER).
     * @param array<string, callable>|null $io Optional overrides for
     *     'header' (emitter) and 'exit' (preflight terminator). Used
     *     only by tests.
     */
    public static function handle_cors_headers_and_terminate_on_options(
        $origin = '*',
        string $allow_headers = '*',
        array $server = [],
        ?array $io = null
    ): void {
        if ($origin === true) {
            $origin = '*';
        }
        if (!is_string($origin) || $origin === '') {
            throw new InvalidArgumentException(
                'CORS origin must be a non-empty string or true'
            );
        }

        $emit_header = ($io['header'] ?? null) ?? static function (string $h): void {
            header($h);
        };
        $terminate = ($io['exit'] ?? null) ?? static function (): void {
            exit;
        };

        $emit_header('Access-Control-Allow-Origin: ' . $origin);
        $emit_header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        $emit_header('Access-Control-Allow-Headers: ' . $allow_headers);

        $request_server = $server === [] ? $_SERVER : $server;
        $method = isset($request_server['REQUEST_METHOD']) ? (string) $request_server['REQUEST_METHOD'] : '';
        if (strtoupper($method) !== 'OPTIONS') {
            return;
        }

        $emit_header('Allow: GET, POST, OPTIONS');
        $terminate();
    }

    /**
     * One-call convenience entry point: loads export.php, constructs
     * the server, and dispatches the current request.
     *
     * Equivalent to:
     *
     *     require_once __DIR__ . '/export.php';
     *     $server = new HTTPServer($options);
     *     $server->handle_request();
     *
     * export.php is only required once. Callers that need to run CORS
     * or their own authentication must do that before calling this method.
     *
     * @param array<string, mixed> $options Forwarded to the constructor.
     * @throws \Exception If request parsing or endpoint dispatch fails.
     */
    public static function serve(array $options = []): void {
        // endpoint_preflight is defined by export.php — use it as a
        // cheap sentinel to detect whether the runtime is already
        // loaded. require_once would be safe either way, but this
        // avoids re-running the stat() on hot paths.
        if (!function_exists('endpoint_preflight')) {
            require_once __DIR__ . '/export.php';
        }

        $server = new self($options);
        $server->handle_request();
    }

    /**
     * Parses HTTP values, including raw or base64-encoded Unix and Windows paths.
     *
     * @param array<string, mixed> $get
     * @param array<string, mixed> $post
     * @param array<string, mixed> $server
     * @return array<string, mixed>
     */
    public function parse_http_config(array $get = [], array $post = [], array $server = [], string $body = ''): array {
        $config = [];
        $params = array_merge($get, $post);

        $content_type = $server['CONTENT_TYPE'] ?? '';
        $content_type_main = strtolower(trim((string) strtok((string) $content_type, ';')));
        if ($content_type_main === 'application/json' && $body !== '') {
            $json_data = json_decode($body, true);
            if (is_array($json_data)) {
                $params = array_merge($params, $json_data);
            }
        }

        // The endpoint is part of the signed request target, so the query's
        // value wins. Released key clients send a pull endpoint in the body
        // and sign the bare API URL. A push endpoint comes only from the query.
        $body_endpoint = $params['endpoint'] ?? null;
        unset($params['endpoint']);
        if (array_key_exists('endpoint', $get)) {
            $params = ['endpoint' => $get['endpoint']] + $params;
        } elseif (is_string($body_endpoint) && strpos($body_endpoint, 'push_') !== 0) {
            $params = ['endpoint' => $body_endpoint] + $params;
        }

        foreach ($params as $key => $value) {
            $key = str_replace('-', '_', (string) $key);

            if (
                in_array($key, [
                    'max_execution_time',
                    'min_ctime',
                    'chunk_size',
                    'fragments_per_batch',
                    'batch_size',
                    'db_query_time_limit',
                    'tables_per_batch',
                ], true)
            ) {
                $value = (int) $value;
            } elseif (in_array($key, ['memory_threshold'], true)) {
                $value = (float) $value;
            } elseif (in_array($key, ['create_table_query', 'db_unbuffered', 'follow_symlinks'], true)) {
                $value = filter_var($value, FILTER_VALIDATE_BOOLEAN);
            } elseif ($key === 'paths' && is_string($value)) {
                $decoded = json_decode($value, true);
                if (is_array($decoded)) {
                    $value = $decoded;
                }
            } elseif (in_array($key, ['directory', 'list_dir', 'pulled_before'], true)) {
                $path_values = is_array($value) ? $value : [$value];
                $decoded_paths = [];
                foreach ($path_values as $path_key => $path_value) {
                    // Do not decode first: PHP accepts a raw path such as /tmp
                    // as strict base64 and turns it into unrelated bytes. Check
                    // for an absolute root in this source host's format before decoding.
                    if (is_string($path_value) && Utils::is_absolute_path($path_value, Utils::native_path_format())) {
                        $decoded_path = $path_value;
                    } else {
                        $decoded_path = is_string($path_value)
                            ? base64_decode($path_value, true)
                            : false;
                    }
                    if (
                        $decoded_path === false
                        || !Utils::is_absolute_path($decoded_path, Utils::native_path_format())
                    ) {
                        $entry = is_array($value) ? ' entry ' . $path_key : '';
                        $observed = is_string($path_value)
                            ? json_encode($path_value)
                            : gettype($path_value);
                        // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- The exception reports the rejected HTTP parameter and value to the API caller.
                        throw new InvalidArgumentException(
                            $key . $entry
                            . ' must be an absolute path or a base64-encoded absolute path; observed '
                            . $observed . '.'
                        );
                        // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped
                    }
                    $decoded_paths[$path_key] = $decoded_path;
                }
                $value = is_array($value) ? $decoded_paths : reset($decoded_paths);
            }

            $config[$key] = $value;
        }

        return $config;
    }

    /**
     * @param array<string, mixed> $config
     * @param array<string, mixed> $server
     * @return array<string, mixed>
     */
    public function normalize_config(array $config, array $server = []): array {
        unset($config['_multisite']);
        if ($this->multisite !== null) {
            // This existing wire value names the selected-site export format.
            // It does not require the client to create a multisite target.
            if (( $config['multisite_mode'] ?? null ) !== 'one-site-network-v1') {
                throw new InvalidArgumentException(
                    'This source requires a Reprint client that supports exporting one selected network site. Update the client.'
                );
            }
            if (!in_array($config['endpoint'] ?? '', ['preflight', 'sql_chunk', 'file_index', 'file_fetch'], true)) {
                throw new InvalidArgumentException('This endpoint does not support a selected multisite site.');
            }
            $config['_multisite'] = $this->multisite;
        }

        if (
            $this->default_directory !== null &&
            !isset($config['directory'])
        ) {
            $config['directory'] = $this->default_directory;
        }

        if (!isset($config['cursor']) && isset($server[$this->cursor_header_name])) {
            $config['cursor'] = $server[$this->cursor_header_name];
        }

        if (isset($config['cursor']) && $config['cursor'] !== '' && $config['cursor'] !== null) {
            $config['cursor'] = $this->decode_cursor((string) $config['cursor']);
        }

        $endpoint = $config['endpoint'] ?? null;
        if (!is_string($endpoint) || $endpoint === '') {
            throw new InvalidArgumentException(
                "endpoint parameter is required. Valid endpoints: " . $this->get_valid_endpoints_message()
            );
        }

        return $config;
    }

    public function decode_cursor(string $cursor_b64): string {
        $cursor_json = base64_decode($cursor_b64, true);
        if ($cursor_json === false) {
            throw new InvalidArgumentException(
                'Cursor must be base64-encoded. Received invalid base64: ' . substr($cursor_b64, 0, 50)
            );
        }

        $cursor_data = json_decode($cursor_json, true);
        if ($cursor_data === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException(
                'Cursor must be valid JSON after base64 decoding. JSON error: ' . json_last_error_msg()
            );
        }

        return $cursor_json;
    }

    /**
     * @param array<string, mixed> $config
     * @return mixed
     */
    public function create_resource_budget(array $config) {
        return call_user_func($this->budget_factory, $config);
    }

    /**
     * @param array<string, mixed> $config
     * @param mixed $budget
     */
    public function dispatch(array $config, $budget = null): void {
        $endpoint = $config['endpoint'] ?? null;
        if (!is_string($endpoint) || $endpoint === '') {
            throw new InvalidArgumentException(
                "endpoint parameter is required. Valid endpoints: " . $this->get_valid_endpoints_message()
            );
        }

        if (!isset($this->handlers[$endpoint])) {
            throw new InvalidArgumentException(
                "Invalid endpoint: '{$endpoint}'. Valid endpoints: " . $this->get_valid_endpoints_message()
            );
        }

        $handler = $this->handlers[$endpoint];
        if (self::is_push_endpoint($endpoint)) {
            if (PHP_VERSION_ID < 70200) {
                http_response_code(503);
                header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                header('Pragma: no-cache');
                header('Expires: 0');
                // Hosts such as Hostinger rewrite domains so links and assets stay on a
                // preview domain while the stored site URL still uses the real domain.
                // This lets users preview a site before changing DNS, but also rewrites
                // application/json bodies. Octet-stream bypasses Hostinger's filter.
                header('Content-Type: application/octet-stream');
                echo json_encode([
                    'status' => 'rejected',
                    'reason' => 'push_disabled',
                    'detail' => 'Push endpoints require PHP 7.2 or newer; observed PHP ' . PHP_VERSION . '.',
                ]);
                return;
            }
            call_user_func($handler, $config);
            return;
        }
        if ($endpoint === 'preflight') {
            call_user_func($handler, $config);
            return;
        }

        if ($budget === null) {
            $budget = $this->create_resource_budget($config);
        }

        call_user_func($handler, $config, $budget);
    }

    public static function is_push_endpoint(string $endpoint): bool {
        $push_endpoint_methods = self::PUSH_ENDPOINT_METHODS;
        return isset($push_endpoint_methods[$endpoint]) || in_array($endpoint, self::DATABASE_PUSH_ENDPOINTS, true);
    }

    /**
     * @return array<string, callable>
     */
    private function default_handlers(): array {
        $handlers = [
            'file_index' => 'endpoint_file_index',
            'file_fetch' => 'endpoint_file_fetch',
            'sql_chunk' => 'endpoint_sql_chunk',
            'db_index' => 'endpoint_db_index',
            'preflight' => 'endpoint_preflight',
        ];
        if ($this->push_endpoints !== null) {
            foreach (self::PUSH_ENDPOINT_METHODS as $endpoint => $method) {
                $handlers[$endpoint] = [$this->push_endpoints, $method];
            }
        }
        if ($this->database_push_endpoints !== null) {
            foreach (self::DATABASE_PUSH_ENDPOINTS as $endpoint) {
                $handlers[$endpoint] = [$this->database_push_endpoints, 'handle'];
            }
        }
        return $handlers;
    }

    private function is_json_content_type(array $server): bool {
        $content_type = (string) ( $server['CONTENT_TYPE'] ?? '' );
        return strtolower(trim( (string) strtok($content_type, ';'))) === 'application/json';
    }

    /**
     * @param array<string, mixed> $config
     * @return mixed
     */
    private function default_budget_factory(array $config) {
        $max_execution_time = require_int_range(
            'max_execution_time',
            (int) ($config['max_execution_time'] ?? 15),
            1,
            60
        );
        $ini_max_execution_time = (int) ini_get('max_execution_time');
        if ($ini_max_execution_time > 0) {
            $max_execution_time = min(
                $max_execution_time,
                $ini_max_execution_time
            );
        }
        $memory_threshold = require_float_range(
            'memory_threshold',
            (float) ($config['memory_threshold'] ?? 0.8),
            0.1,
            0.95
        );

        $memory_limit = ini_get('memory_limit');
        $max_memory = $memory_limit === '-1' ? PHP_INT_MAX : Utils::parse_size((string) $memory_limit);

        return new ResourceBudget(
            microtime(true),
            $max_execution_time,
            $max_memory,
            $memory_threshold
        );
    }

    private function get_valid_endpoints_message(): string {
        return "'" . implode("', '", array_keys($this->handlers)) . "'";
    }
}

if (!class_exists('Site_Export_HTTP_Server', false)) {
    class_alias(HTTPServer::class, 'Site_Export_HTTP_Server');
}
