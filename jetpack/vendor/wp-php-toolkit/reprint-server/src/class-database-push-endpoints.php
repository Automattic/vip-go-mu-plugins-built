<?php

namespace WordPress\Reprint\Server;

use PDO;
use RuntimeException;
use Throwable;

require_once __DIR__ . '/class-database-push.php';

/** Authenticated database endpoints. URL rewriting remains entirely in the client. */
final class DatabasePushEndpoints {
    /** @var int */
    private $maximum_part_bytes;
    /** @var int|null */
    private $post_max_bytes;

    /**
     * @param array $options {
     *     Trusted host configuration, never request parameters.
     *     @type string $reprint_directory Private directory outside the web document root.
     *     @type string $docroot Actual web document root, used to validate private storage.
     *     @type list<string> $excluded_paths File-push exclusions (not database selections).
     * }
     */
    public function __construct(array $options) {
        // Reuse the established outside-document-root validation first.
        new PushEndpoints($options);
        $this->maximum_part_bytes = min( (int) ( $options['maximum_part_bytes'] ?? DatabasePush::MAX_RECORD_BYTES ), DatabasePush::MAX_RECORD_BYTES);
        $post_max_bytes = array_key_exists('post_max_bytes', $options) ? $options['post_max_bytes'] : Utils::parse_size( (string) ini_get('post_max_size'));
        $this->post_max_bytes = $post_max_bytes > 0 ? (int) $post_max_bytes : null;
    }

    /**
     * @param array $config {
     *     Signed endpoint parameters; database credentials and prefix are host configuration.
     *     @type string $endpoint Registered database push endpoint.
     *     @type string $push_session_id Existing or new 32-character session ID.
     *     @type string $extra_tables JSON table-name list on create; immutable for this push.
     *     @type string $review Required for commit. Token from the current table review.
     *     @type string $writers_stopped Required for commit. Must be the literal yes.
     * }
     */
    public function handle(array $config): void {
        $push = null;
        try {
            $endpoint = $config['endpoint'];
            $method = $endpoint === 'push_db_status' ? 'GET' : 'POST';
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- Compare the exact signed HTTP method; this also runs without WordPress.
            if (( $_SERVER['REQUEST_METHOD'] ?? '' ) !== $method) {
                throw new RuntimeException('Database push endpoint requires HTTP ' . $method . '.');
            }
            $credentials = \resolve_db_credentials();
            if (( $credentials['db_engine'] ?? 'mysql' ) !== 'mysql' || empty($credentials['table_prefix'])) {
                throw new RuntimeException('Database push requires a MySQL target and a trusted WordPress table prefix.');
            }
            // Native parameters keep binary row values as data, not SQL syntax.
            // Keep transaction state and the advisory lock on one dedicated
            // connection. Neither driver needs WordPress or its shared $wpdb.
            $options = extension_loaded('pdo_mysql') ? [
                PDO::ATTR_EMULATE_PREPARES => false,
                ( defined('Pdo\\Mysql::ATTR_MULTI_STATEMENTS') ? constant('Pdo\\Mysql::ATTR_MULTI_STATEMENTS') : PDO::MYSQL_ATTR_MULTI_STATEMENTS ) => false,
            ] : [];
            $database = Utils::connect_mysql(Utils::build_pdo_dsn($credentials['db_host'], $credentials['db_name']), $credentials['db_user'], $credentials['db_password'], $options);
            $database->exec('SET NAMES utf8mb4');
            $push_session_id = $config['push_session_id'] ?? '';
            $push = new DatabasePush($database, $credentials['table_prefix'], $push_session_id);
            if ($endpoint === 'push_db_create') {
                $extra_tables = json_decode($config['extra_tables'] ?? '[]', true);
                if (!is_array($extra_tables) || array_values($extra_tables) !== $extra_tables) {
                    throw new RuntimeException('Database push extra_tables must be a JSON list of table names.');
                }
                $push->start($extra_tables);
                $this->respond(200, ['status' => 'created', 'max_part_bytes' => $this->maximum_part_bytes, 'post_max_bytes' => $this->post_max_bytes]);
                return;
            }
            if ($endpoint === 'push_db_upload') {
                $this->upload($push);
            }
            $state = $push->get_status();
            if ($endpoint === 'push_db_commit') {
                if (( $config['writers_stopped'] ?? '' ) !== 'yes') {
                    throw new RuntimeException('Stop and drain web requests, cron, queues, and other writers before confirming the overwrite.');
                }
                if ($state['phase'] === 'ready') {
                    $review = hash('sha256', json_encode([$push_session_id, $state['incoming_tables'], $state['replace_tables']]));
                    if (!is_string($config['review'] ?? null) || !hash_equals($review, $config['review'])) {
                        throw new RuntimeException('The overwrite review token does not match the current table list. Read push_db_status again.');
                    }
                }
                $push->commit();
            } elseif ($endpoint === 'push_db_discard') {
                $push->discard_next_table();
            } elseif ($endpoint === 'push_db_cleanup') {
                $push->cleanup_next_table();
            }
            $state = $push->get_status();
            $state['review'] = $state['phase'] === 'ready' ? hash('sha256', json_encode([$push_session_id, $state['incoming_tables'], $state['replace_tables']])) : null;
            $state['table_prefix'] = $credentials['table_prefix'];
            $this->respond(200, ['status' => 'accepted'] + $state);
        } catch (Throwable $exception) {
            $reason = $exception instanceof PushException ? $exception->get_error_code() : 'database_push_failed';
            $this->respond($reason === 'request_too_large' ? 413 : ( $reason === 'busy' ? 409 : 400 ), ['status' => 'rejected', 'reason' => $reason, 'detail' => $exception->getMessage(), 'post_max_bytes' => $this->post_max_bytes]);
        } finally {
            if ($push !== null) {
                $push->close();
            }
        }
    }

    /** Read the request directly into incoming rows; retain only one unfinished record. */
    private function upload(DatabasePush $push): void {
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput -- The strict multipart parser validates the exact wire header.
        $multipart = new MultipartProcessor(MultipartProcessor::boundary_from_content_type( (string) ( $_SERVER['CONTENT_TYPE'] ?? '' )));
        $input = fopen('php://input', 'rb');
        if ($input === false) {
            throw new RuntimeException('Cannot open the database push request body.');
        }
        $request_bytes = 0;
        $record_number = 0;
        $total_bytes = 0;
        $offset = 0;
        try {
            while (!feof($input)) {
                $chunk = fread($input, MultipartProcessor::MAX_INPUT_FRAGMENT_BYTES);
                if ($chunk === '' && feof($input)) {
                    break;
                }
                if ($chunk === false || $chunk === '') {
                    throw new RuntimeException('Cannot read the next database push request chunk.');
                }
                $request_bytes += strlen($chunk);
                if ($this->post_max_bytes !== null && $request_bytes > $this->post_max_bytes) {
                    throw new PushException('request_too_large', 'Database push request exceeds the target post_max_size of ' . $this->post_max_bytes . ' bytes.');
                }
                $multipart->append_bytes($chunk);
                while ($multipart->next_token()) {
                    if ($multipart->get_token_type() === MultipartProcessor::TOKEN_PART_START) {
                        $headers = $multipart->get_current_headers();
                        if (( $headers['x-chunk-type'] ?? '' ) !== 'database') {
                            throw new RuntimeException('Database push accepts only database multipart parts.');
                        }
                        foreach (['x-record-number', 'x-record-size', 'x-chunk-offset'] as $name) {
                            if (!isset($headers[$name]) || !preg_match('/^(0|[1-9][0-9]{0,14})$/D', $headers[$name])) {
                                throw new RuntimeException('Database part requires a non-negative decimal ' . $name . '; observed ' . json_encode($headers[$name] ?? null) . '.');
                            }
                        }
                        $record_number = (int) $headers['x-record-number'];
                        $total_bytes = (int) $headers['x-record-size'];
                        $offset = (int) $headers['x-chunk-offset'];
                        $length = (int) $headers['content-length'];
                        if ($length <= 0 || $length > $this->maximum_part_bytes || $total_bytes > DatabasePush::MAX_RECORD_BYTES || $offset + $length > $total_bytes) {
                            throw new RuntimeException('Database part has length ' . $length . ', offset ' . $offset . ', and record size ' . $total_bytes . '; maximum part bytes is ' . $this->maximum_part_bytes . '.');
                        }
                    } elseif ($multipart->get_token_type() === MultipartProcessor::TOKEN_BODY) {
                        $piece = $multipart->get_current_body_piece();
                        $push->accept_record_chunk($record_number, $total_bytes, $offset, $piece);
                        $offset += strlen($piece);
                    }
                }
            }
            $multipart->finish_input();
            $push->finish_record_request();
        } finally {
            fclose($input);
        }
    }

    /** @param array<string,mixed> $response Bounded protocol result, never HTML. */
    private function respond(int $code, array $response): void {
        http_response_code($code);
        header('Content-Type: application/octet-stream');
        header('Cache-Control: no-store');
        echo json_encode($response, JSON_INVALID_UTF8_SUBSTITUTE);
    }
}
