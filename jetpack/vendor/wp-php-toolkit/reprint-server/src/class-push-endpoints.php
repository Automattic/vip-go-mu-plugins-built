<?php

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped,WordPress.Security.EscapeOutput.OutputNotEscaped -- Authenticated protocol responses are JSON, never HTML output.
// phpcs:disable WordPress.Security.ValidatedSanitizedInput -- Multipart parsing and request-body byte accounting require the request bytes unchanged.

use function WordPress\Reprint\Server\assert_valid_path;
use function WordPress\Reprint\Server\normalize_excluded_paths;
use function WordPress\Reprint\Server\normalize_path;
use function WordPress\Reprint\Server\parse_size;
use function WordPress\Reprint\Server\path_is_same_as_or_descendant_of;
use function WordPress\Reprint\Server\realpath_with_missing_tail;

require_once __DIR__ . '/utils.php';

/**
 * Exposes push-session operations through the exporter HTTP dispatcher.
 *
 * The endpoint configuration is supplied by the server, not by request
 * parameters. It fixes the reprint directory, document root, excluded paths,
 * maximum multipart part size, and bounded commit work for every request.
 * Authentication happens in the embedding router before these methods run.
 *
 * Upload requests pass php://input directly to Site_Export_Push_Session. The
 * endpoint retains only the latest accepted change while the receiver reads
 * each multipart part in bounded fragments; it never buffers the request body
 * or a list of all parts.
 */
final class Site_Export_Push_Endpoints {

    private const DEFAULT_MAXIMUM_PART_BYTES = 4194304;
    private const DEFAULT_MAXIMUM_COMMIT_ENTRIES = 256;

    /** @var string */
    private $reprint_directory;

    /** @var string */
    private $docroot;

    /** @var list<string> */
    private $excluded_paths;

    /** @var int */
    private $maximum_part_bytes;

    /** @var int */
    private $maximum_commit_entries;

    /** @var string|null */
    private $commit_start_denial_detail;

    /** @var int|null */
    private $post_max_bytes;

    /**
     * Stores the server-supplied push directories, path policy, and limits.
     *
     * Missing numeric options use bounded defaults. Present numeric options
     * must be positive so a malformed server configuration cannot silently
     * change the protocol limit.
     *
     * @param array $options {
     *     Trusted endpoint configuration.
     *
     *     @type string $reprint_directory Required private reprint directory.
     *     @type string $docroot Required document-root directory.
     *     @type list<string> $excluded_paths Required document-root-relative
     *         paths which push must preserve.
     *     @type int|float|string $maximum_part_bytes Maximum Content-Length
     *         accepted for one multipart part. Default 4 MiB.
     *     @type int|float|string $maximum_commit_entries Maximum entries one
     *         commit request may process. Default 256.
     *     @type string $commit_start_denial_detail When present, starting commit
     *         returns `push_disabled` with this detail. A commit with a durable
     *         checkpoint remains recoverable.
     *     @type int|float|string|null $post_max_bytes Decoded request-body
     *         limit enforced and reported to senders. Defaults to PHP's
     *         post_max_size; null means PHP reports no positive limit.
     * }
     * @phpstan-param array{
     *     reprint_directory?:mixed,
     *     docroot?:mixed,
     *     excluded_paths?:mixed,
     *     maximum_part_bytes?:mixed,
     *     maximum_commit_entries?:mixed,
     *     commit_start_denial_detail?:mixed,
     *     post_max_bytes?:mixed
     * } $options
     *
     * @throws InvalidArgumentException If required configuration is absent, a
     *     present numeric limit is not positive, or a commit-start denial detail
     *     is not a non-empty string.
     */
    public function __construct(array $options) {
        $reprint_directory = $options['reprint_directory'] ?? null;
        $docroot = $options['docroot'] ?? null;
        $excluded_paths = $options['excluded_paths'] ?? null;
        if (!is_string($reprint_directory) || $reprint_directory === '') {
            throw new InvalidArgumentException('Push endpoints require a non-empty reprint_directory option.');
        }
        if (!is_string($docroot) || $docroot === '') {
            throw new InvalidArgumentException('Push endpoints require a non-empty docroot option.');
        }
        if (!is_array($excluded_paths)) {
            throw new InvalidArgumentException('Push endpoints require an excluded_paths array.');
        }
        $excluded_paths = normalize_excluded_paths($excluded_paths);

        assert_valid_path($reprint_directory, 'Push endpoint reprint_directory');
        assert_valid_path($docroot, 'Push endpoint docroot');
        $canonical_reprint_directory = realpath_with_missing_tail(
            $reprint_directory
        );
        $canonical_docroot = realpath($docroot);
        if ($canonical_docroot === false) {
            $canonical_docroot = normalize_path($docroot);
        }
        if (path_is_same_as_or_descendant_of($canonical_reprint_directory, $canonical_docroot)) {
            throw new InvalidArgumentException(
                'Push endpoints require reprint_directory ' . json_encode($reprint_directory)
                . ' to be outside docroot ' . json_encode($docroot) . '; observed it inside that document root.'
            );
        }

        $maximum_part_bytes = $options['maximum_part_bytes'] ?? self::DEFAULT_MAXIMUM_PART_BYTES;
        $maximum_commit_entries = $options['maximum_commit_entries'] ?? self::DEFAULT_MAXIMUM_COMMIT_ENTRIES;
        if (!is_numeric($maximum_part_bytes) || (int) $maximum_part_bytes <= 0) {
            throw new InvalidArgumentException('maximum_part_bytes must be a positive integer.');
        }
        if (!is_numeric($maximum_commit_entries) || (int) $maximum_commit_entries <= 0) {
            throw new InvalidArgumentException('maximum_commit_entries must be a positive integer.');
        }

        if (array_key_exists('post_max_bytes', $options)) {
            $post_max_bytes = $options['post_max_bytes'];
            if ($post_max_bytes !== null && ( !is_numeric($post_max_bytes) || (int) $post_max_bytes <= 0 )) {
                throw new InvalidArgumentException('post_max_bytes must be null or a positive integer.');
            }
            $this->post_max_bytes = $post_max_bytes === null ? null : (int) $post_max_bytes;
        } else {
            $post_max_size = ini_get('post_max_size');
            $parsed_post_max_bytes = is_string($post_max_size) && $post_max_size !== ''
                ? parse_size($post_max_size)
                : 0;
            $this->post_max_bytes = $parsed_post_max_bytes > 0 ? $parsed_post_max_bytes : null;
        }

        $this->reprint_directory = $reprint_directory;
        $this->docroot = $docroot;
        $this->excluded_paths = $excluded_paths;
        $this->maximum_part_bytes = (int) $maximum_part_bytes;
        $this->maximum_commit_entries = (int) $maximum_commit_entries;
        $this->commit_start_denial_detail = null;
        if (array_key_exists('commit_start_denial_detail', $options)) {
            if (!is_string($options['commit_start_denial_detail']) || $options['commit_start_denial_detail'] === '') {
                throw new InvalidArgumentException('commit_start_denial_detail must be a non-empty string.');
            }
            $this->commit_start_denial_detail = $options['commit_start_denial_detail'];
        }
    }

    /**
     * Creates or reopens the caller-named push session.
     *
     * This operation is idempotent for the same push session ID and immutable
     * server configuration. A successful response reports the independent
     * multipart-part and decoded request-body limits the sender must apply,
     * plus the normalized excluded paths stored in push metadata.
     *
     * The HTTP 200 response has these fields:
     *
     * - `status`: `created`.
     * - `push_session_id`: the caller-supplied ID.
     * - `max_part_bytes`: the maximum multipart-part Content-Length.
     * - `post_max_bytes`: the decoded request-body limit, or null.
     * - `excluded_paths_b64`: the stored excluded paths in base64.
     *
     * An HTTP 409 `commit_required` response also contains
     * `blocking_push_session_id`, which names the commit that must finish first.
     *
     * @param array $config {
     *     Create request parameters.
     *
     *     @type string $push_session_id Caller-named push session ID.
     * }
     * @phpstan-param array<string,mixed> $config
     */
    public function create(array $config): void {
        try {
            $this->assert_request_method('POST');
            $push_session_id = $this->read_push_session_id($config);
            Site_Export_Push_Session::create(
                $this->reprint_directory,
                $this->docroot,
                $this->excluded_paths,
                $push_session_id
            );
            $this->respond(200, [
                'status' => 'created',
                'push_session_id' => $push_session_id,
                'max_part_bytes' => $this->maximum_part_bytes,
                'post_max_bytes' => $this->post_max_bytes,
                'excluded_paths_b64' => array_map('base64_encode', $this->excluded_paths),
            ]);
        } catch (Throwable $exception) {
            $this->respond_to_failure($exception);
        }
    }

    /**
     * Streams one multipart request into an existing push session.
     *
     * The request must be POST multipart/mixed with one valid boundary. Each
     * part is accepted before the next part is read. The response retains only
     * the latest receiver-confirmed change, so response memory does not grow
     * with the number of parts in the request.
     *
     * The HTTP 200 response has `status`, `push_session_id`,
     * `changes_accepted`, and `last_change`. An empty request reports null for
     * `last_change`. Otherwise `last_change` contains:
     *
     * - `state`: `partial` or `complete`.
     * - `type`: `file`, `directory`, `symlink`, or `delete-list`.
     * - `accepted_bytes`: receiver-confirmed bytes; zero for directories and
     *   symlinks.
     * - `path_b64`: the base64 path for files, directories, and symlinks. A
     *   delete-list change has no path.
     *
     * @param array $config {
     *     Upload request parameters.
     *
     *     @type string $push_session_id Existing push session ID.
     * }
     * @phpstan-param array<string,mixed> $config
     */
    public function upload(array $config): void {
        $input = null;
        $push_session = null;
        $upload_open = false;
        try {
            $this->assert_request_method('POST');
            $push_session_id = $this->read_push_session_id($config);
            $content_type = (string) ( $_SERVER['CONTENT_TYPE'] ?? '' );
            $boundary = Site_Export_Multipart_Processor::boundary_from_content_type($content_type);
            $declared_request_bytes = $_SERVER['CONTENT_LENGTH'] ?? null;
            if (
                $this->post_max_bytes !== null
                && is_numeric($declared_request_bytes)
                && (int) $declared_request_bytes > $this->post_max_bytes
            ) {
                $this->respond(413, [
                    'status' => 'rejected',
                    'reason' => 'request_too_large',
                    'detail' => 'The decoded request body declares ' . (int) $declared_request_bytes
                        . ' bytes, exceeding the target post_max_size of ' . $this->post_max_bytes . ' bytes.',
                    'post_max_bytes' => $this->post_max_bytes,
                ]);
                return;
            }
            $input = fopen('php://input', 'rb');
            if ($input === false) {
                throw new Site_Export_Push_Exception(
                    Site_Export_Push_Session::ERROR_FILESYSTEM,
                    'Could not open the multipart upload request body.'
                );
            }
            $push_session = Site_Export_Push_Session::open(
                $this->reprint_directory,
                $this->docroot,
                $push_session_id,
                $this->excluded_paths
            );
            $push_session->accept_upload(
                $input,
                new Site_Export_Multipart_Processor($boundary),
                $this->maximum_part_bytes,
                $this->post_max_bytes ?? PHP_INT_MAX
            );
            $upload_open = true;
            $changes_accepted = 0;
            $last_change = null;
            while ($push_session->next_change()) {
                ++$changes_accepted;
                $current_change = $push_session->get_current_change();
                if ($current_change === null) {
                    throw new LogicException('An accepted multipart part did not set its receiver-confirmed change.');
                }
                $last_change = [];
                if (array_key_exists('path_b64', $current_change)) {
                    $last_change['path_b64'] = $current_change['path_b64'];
                }
                $last_change['state'] = $current_change['state'];
                $last_change['type'] = $current_change['type'];
                $last_change['accepted_bytes'] = $current_change['accepted_bytes'];
            }
            $push_session->finish_upload();
            $upload_open = false;
            fclose($input);
            $input = null;
            $this->respond(200, [
                'status' => 'accepted',
                'push_session_id' => $push_session_id,
                'changes_accepted' => $changes_accepted,
                'last_change' => $last_change,
            ]);
        } catch (Throwable $exception) {
            if ($upload_open && $push_session instanceof Site_Export_Push_Session) {
                $push_session->finish_upload();
            }
            if (is_resource($input)) {
                fclose($input);
            }
            $this->respond_to_failure($exception);
        }
    }

    /**
     * Reports receiver-confirmed progress for a push session and optional path.
     *
     * `path_b64`, when supplied, is strict base64 for the raw document-root-
     * relative path. The receiver reads actual work state under the push lock;
     * it never echoes a sender-supplied cursor.
     *
     * The HTTP 200 response has these fields:
     *
     * - `status`: `accepted`.
     * - `push_session_id`: the requested push session.
     * - `phase`: `receiving_work`, `deleting_files`, `installing_files`, or
     *   `complete`.
     * - `work_deletes_bytes`: receiver-confirmed delete-list bytes.
     * - `work_deletes_complete`: whether the sender closed the delete list.
     * - `path`: null when no path was requested. Otherwise it contains
     *   `path_b64`, `state`, and `accepted_bytes`; non-missing paths also have
     *   `type`.
     *
     * @param array $config {
     *     Status request parameters.
     *
     *     @type string $push_session_id Existing push session ID.
     *     @type string $path_b64 Optional. Base64-encoded path whose
     *                           receiver-confirmed state should be reported.
     * }
     * @phpstan-param array<string,mixed> $config
     */
    public function status(array $config): void {
        try {
            $this->assert_request_method('GET');
            $push_session_id = $this->read_push_session_id($config);
            $path = null;
            if (array_key_exists('path_b64', $config)) {
                if (!is_string($config['path_b64'])) {
                    throw new InvalidArgumentException('path_b64 must be base64 text.');
                }
                $path = base64_decode($config['path_b64'], true);
                if ($path === false) {
                    throw new InvalidArgumentException('path_b64 must be valid base64 text.');
                }
            }
            $push_session = Site_Export_Push_Session::open(
                $this->reprint_directory,
                $this->docroot,
                $push_session_id,
                $this->excluded_paths
            );
            $push_status = $push_session->get_status($path);
            $path_status = null;
            if ($push_status['path'] !== null) {
                $path_status = [
                    'path_b64' => $push_status['path']['path_b64'],
                    'state' => $push_status['path']['state'],
                ];
                if (array_key_exists('type', $push_status['path'])) {
                    $path_status['type'] = $push_status['path']['type'];
                }
                $path_status['accepted_bytes'] = $push_status['path']['accepted_bytes'];
            }
            $this->respond(200, [
                'status' => 'accepted',
                'push_session_id' => $push_session_id,
                'phase' => $push_status['phase'],
                'work_deletes_bytes' => $push_status['work_deletes_bytes'],
                'work_deletes_complete' => $push_status['work_deletes_complete'],
                'path' => $path_status,
            ]);
        } catch (Throwable $exception) {
            $this->respond_to_failure($exception);
        }
    }

    /**
     * Advances bounded commit work for one push session.
     *
     * The configured maximum commit-entry count bounds each call. Senders repeat this
     * operation while `send_next_request` is true; a repeated request after an
     * indeterminate response resumes the receiver's durable commit checkpoint.
     *
     * The HTTP 200 response has `status`, `push_session_id`, `phase`,
     * `send_next_request`, and `entries_processed`. `phase` is
     * `deleting_files`, `installing_files`, or `complete`.
     *
     * @param array $config {
     *     Commit request parameters.
     *
     *     @type string $push_session_id Existing push session ID.
     * }
     * @phpstan-param array<string,mixed> $config
     */
    public function commit(array $config): void {
        try {
            $this->assert_request_method('POST');
            $push_session_id = $this->read_push_session_id($config);
            $push_session = Site_Export_Push_Session::open(
                $this->reprint_directory,
                $this->docroot,
                $push_session_id,
                $this->excluded_paths
            );
            $commit = $push_session->commit(
                $this->maximum_commit_entries,
                $this->commit_start_denial_detail
            );
            $this->respond(200, [
                'status' => 'accepted',
                'push_session_id' => $push_session_id,
                'phase' => $commit['phase'],
                'send_next_request' => $commit['send_next_request'],
                'entries_processed' => $commit['entries_processed'],
            ]);
        } catch (Throwable $exception) {
            if (
                $this->commit_start_denial_detail !== null
                && $exception instanceof Site_Export_Push_Exception
                && $exception->get_error_code() === Site_Export_Push_Session::ERROR_PUSH_NOT_FOUND
            ) {
                $this->respond(403, [
                    'status' => 'rejected',
                    'reason' => Site_Export_Push_Session::ERROR_PUSH_DISABLED,
                    'detail' => $this->commit_start_denial_detail,
                ]);
                return;
            }
            $this->respond_to_failure($exception);
        }
    }

    /**
     * Performs one bounded removal step for a push session.
     *
     * A false `removed` value means the sender must call this operation again.
     * Repeating the operation after a lost response is safe: a missing push
     * directory and completed removal tombstone report true.
     *
     * The HTTP 200 response has `status`, `push_session_id`, and `removed`.
     *
     * @param array $config {
     *     Remove request parameters.
     *
     *     @type string $push_session_id Existing push session ID.
     * }
     * @phpstan-param array<string,mixed> $config
     */
    public function remove(array $config): void {
        try {
            $this->assert_request_method('POST');
            $push_session_id = $this->read_push_session_id($config);
            $remove_complete = Site_Export_Push_Session::remove(
                $this->reprint_directory,
                $this->docroot,
                $push_session_id,
                $this->excluded_paths
            );
            $this->respond(200, [
                'status' => 'accepted',
                'push_session_id' => $push_session_id,
                'removed' => $remove_complete,
            ]);
        } catch (Throwable $exception) {
            $this->respond_to_failure($exception);
        }
    }

    /**
     * Rejects a request whose HTTP method does not match the endpoint.
     *
     * @param string $expected_method Uppercase protocol method.
     *
     * @throws InvalidArgumentException If the current request uses another method.
     */
    private function assert_request_method(string $expected_method): void {
        $observed_method = strtoupper( (string) ( $_SERVER['REQUEST_METHOD'] ?? '' ));
        if ($observed_method !== $expected_method) {
            throw new InvalidArgumentException(
                'Push endpoint requires ' . $expected_method . '; observed ' . ( $observed_method === '' ? 'no request method' : $observed_method ) . '.'
            );
        }
    }

    /**
     * Reads the required push session identity from request parameters.
     *
     * Site_Export_Push_Session performs the canonical 32-character lowercase
     * hexadecimal grammar check. This method only rejects missing or non-string
     * values before a factory method is selected.
     *
     * @param array $config {
     *     Endpoint request parameters.
     *
     *     @type string $push_session_id Caller-supplied push session ID.
     * }
     * @phpstan-param array<string,mixed> $config
     * @return string Caller-supplied push session ID.
     *
     * @throws InvalidArgumentException If `push_session_id` is not a string.
     */
    private function read_push_session_id(array $config): string {
        $push_session_id = $config['push_session_id'] ?? null;
        if (!is_string($push_session_id)) {
            throw new InvalidArgumentException('push_session_id must be a string.');
        }
        return $push_session_id;
    }

    /**
     * Maps a push exception onto its stable protocol reason and HTTP status.
     *
     * The response owns its public fields instead of copying an exception's
     * internal context. A streamed request-size rejection deliberately exposes
     * its observed decoded byte count. Invalid or malformed request data
     * receives `invalid_request`; unexpected failures receive
     * `filesystem_error` without exposing a PHP trace.
     *
     * @param Throwable $exception Failure raised while handling an endpoint.
     */
    private function respond_to_failure(Throwable $exception): void {
        if ($exception instanceof Site_Export_Push_Exception) {
            $reason = $exception->get_error_code();
            $http_code = 409;
            if ($reason === Site_Export_Push_Session::ERROR_PUSH_NOT_FOUND) {
                $http_code = 404;
            } elseif ($reason === Site_Export_Push_Session::ERROR_PUSH_DISABLED) {
                $http_code = 403;
            } elseif ($reason === Site_Export_Push_Session::ERROR_LOCK_ACQUISITION_FAILURE) {
                $http_code = 423;
            } elseif ($reason === Site_Export_Push_Session::ERROR_REQUEST_TOO_LARGE) {
                $http_code = 413;
            } elseif (
                $reason === Site_Export_Push_Session::ERROR_FILESYSTEM
                || $reason === Site_Export_Push_Session::ERROR_CORRUPTED_PUSH_STATE
            ) {
                $http_code = 500;
            }
            $response = [
                'status' => 'rejected',
                'reason' => $reason,
                'detail' => $exception->getMessage(),
            ];
            if ($reason === Site_Export_Push_Session::ERROR_COMMIT_REQUIRED) {
                $context = $exception->get_context();
                if (is_string($context['blocking_push_session_id'] ?? null)) {
                    $response['blocking_push_session_id'] = $context['blocking_push_session_id'];
                }
            }
            if ($reason === Site_Export_Push_Session::ERROR_REQUEST_TOO_LARGE) {
                $context = $exception->get_context();
                if (is_int($context['observed_request_body_bytes'] ?? null)) {
                    $response['observed_request_body_bytes'] = $context['observed_request_body_bytes'];
                }
                $response['post_max_bytes'] = $this->post_max_bytes;
            }
            $this->respond($http_code, $response);
            return;
        }
        if (
            $exception instanceof InvalidArgumentException
            || $exception instanceof RuntimeException
        ) {
            $this->respond(400, [
                'status' => 'rejected',
                'reason' => 'invalid_request',
                'detail' => $exception->getMessage(),
            ]);
            return;
        }
        $this->respond(500, [
            'status' => 'rejected',
            'reason' => Site_Export_Push_Session::ERROR_FILESYSTEM,
            'detail' => 'The push endpoint failed while processing the request.',
        ]);
    }

    /**
     * Emits one complete JSON protocol response.
     *
     * @param int $http_code HTTP status code.
     * @param array $body Exact endpoint-specific response object whose keys
     *                    are documented by the calling endpoint.
     * @phpstan-param array<string,mixed> $body
     */
    private function respond(int $http_code, array $body): void {
        http_response_code($http_code);
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        header('Pragma: no-cache');
        header('Expires: 0');
        header('Content-Type: application/json');
        $json = json_encode($body);
        if ($json === false) {
            http_response_code(500);
            echo '{"status":"rejected","reason":"filesystem_error","detail":"Could not encode the push response."}';
            return;
        }
        echo $json;
    }
}
