<?php

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Push errors become authenticated API JSON, never HTML output.

use function WordPress\Reprint\Server\assert_valid_relative_path;
use function WordPress\Reprint\Server\normalize_excluded_paths;
use function WordPress\Reprint\Server\path_is_same_as_or_descendant_of;
use function WordPress\Reprint\Server\path_remainder_under;
use function WordPress\Reprint\Server\relative_path_under;
use function WordPress\Reprint\Server\trim_right_slash;
use function WordPress\Reprint\Server\wp_join_unix_paths;

require_once __DIR__ . '/utils.php';

if (!class_exists('Site_Export_Multipart_Processor', false)) {
    require_once __DIR__ . '/class-multipart-processor.php';
}
if (!class_exists('Site_Export_Push_Exception', false)) {
    require_once __DIR__ . '/class-push-exception.php';
}

/**
 * Receives push work privately, then commits its deletes and files directly.
 *
 * `work/files/` is both the completed work tree and the work-file queue.
 * In-flight work is recorded in `work/inflight.json`; bytes for an in-flight
 * file live in `work/inflight.data` rather than in a second path-shaped tree.
 * Successful file installation consumes each entry. Deletes remain raw NUL-delimited
 * bytes in `work/deletes`; their confirmed cursor is the file's actual size.
 * Commit persists only one delete, one work-files descendant, and a path-depth-bounded
 * commit cursor. It never builds a candidate tree, action plan, backup, path
 * index, or second queue.
 *
 * @phpstan-type CurrentChange (
 *     array{path_b64:string,state:'partial'|'complete',type:'file',accepted_bytes:int}
 *     | array{path_b64:string,state:'complete',type:'directory'|'symlink',accepted_bytes:0}
 *     | array{state:'partial'|'complete',type:'delete-list',accepted_bytes:int}
 * )
 * @phpstan-type PathStatus (
 *     array{path_b64:string,state:'missing',accepted_bytes:0}
 *     | array{path_b64:string,state:'partial',type:'file',accepted_bytes:int}
 *     | array{path_b64:string,state:'partial',type:'directory'|'symlink',accepted_bytes:0}
 *     | array{path_b64:string,state:'complete',type:'file',accepted_bytes:int}
 *     | array{path_b64:string,state:'complete',type:'directory'|'symlink',accepted_bytes:0}
 * )
 * @phpstan-type InFlightWork (
 *     array{phase:'preparing'|'receiving'|'completing',path_b64:string,type:'file',total_bytes:int}
 *     | array{phase:'preparing'|'completing',path_b64:string,type:'directory'}
 *     | array{phase:'preparing'|'completing',path_b64:string,type:'symlink',target_b64:string}
 * )
 * @phpstan-type CommitState array{
 *     phase:'deleting_files'|'installing_files'|'complete',
 *     work_deletes_byte_offset:int,
 *     current_delete_path:?string,
 *     current_work_files_descendant:?array{path_b64:string,expected_type:'file'|'directory'|'symlink'},
 *     commit_cursor:list<array{component_b64:string}>,
 *     non_recoverable_commit_failure?:array{reason:'unexpected_docroot_mutation'|'same_device',detail:string,context:array<string,mixed>}
 * }
 */
final class Site_Export_Push_Session {

    public const ERROR_LOCK_ACQUISITION_FAILURE = 'lock_acquisition_failure';
    public const ERROR_OFFSET_GAP = 'offset_gap';
    public const ERROR_PUSH_NOT_FOUND = 'push_not_found';
    public const ERROR_FILESYSTEM = 'filesystem_error';
    public const ERROR_COMMIT_REQUIRED = 'commit_required';
    public const ERROR_UNEXPECTED_DOCROOT_MUTATION = 'unexpected_docroot_mutation';
    public const ERROR_CORRUPTED_PUSH_STATE = 'corrupted_push_state';
    public const ERROR_SAME_DEVICE = 'same_device';
    public const ERROR_REQUEST_TOO_LARGE = 'request_too_large';
    public const ERROR_PUSH_DISABLED = 'push_disabled';

    private const MAX_PATH_BYTES = 4096;
    private const MAX_METADATA_BYTES = 1048576;
    private const REMOVE_ENTRY_LIMIT = 256;

    /** @var string */
    private $reprint_directory;
    /** @var string */
    private $docroot;
    /** @var string */
    private $push_session_id;
    /** @var list<string> */
    private $excluded_paths;
    /** @var string */
    private $commit_state_path;
    /** @var string */
    private $commit_state_lock_path;
    /** @var string */
    private $push_directory;
    /** @var string */
    private $work_dir;
    /** @var string */
    private $work_files_directory;
    /** @var string */
    private $work_inflight_path;
    /** @var string */
    private $work_inflight_data_path;
    /** @var string */
    private $work_deletes_path;
    /** @var string */
    private $push_json_path;
    /** @var string */
    private $commit_json_path;
    /** @var string */
    private $push_lock_path;
    /** @var string */
    private $maintenance_copy_path;

    /** @var resource|null */
    private $upload_lock = null;
    /** @var resource|null */
    private $upload_input = null;
    /** @var Site_Export_Multipart_Processor|null */
    private $upload_processor = null;
    /** @var bool */
    private $current_upload_part_ended = false;
    /** @var CurrentChange|null */
    private $current_change = null;
    /** @var int */
    private $maximum_upload_part_bytes = PHP_INT_MAX;
    /** @var int */
    private $maximum_upload_request_body_bytes = PHP_INT_MAX;
    /** @var int */
    private $upload_request_body_bytes_read = 0;

    /**
     * Normalizes one push session's policy and derives its private paths.
     *
     * Factory methods canonicalize the reprint directory and document root before they
     * reach this constructor. The constructor then establishes the invariant
     * shared by every push-session handle: excluded paths are valid
     * document-root-relative paths in sorted, unique order, and a reprint
     * directory below the document root protects itself from push.
     * No filesystem state is read or changed here.
     *
     * @param list<string> $excluded_paths Document-root-relative paths which a push
     *                                      must never receive, delete, or replace.
     */
    private function __construct(string $reprint_directory, string $docroot, string $push_session_id, array $excluded_paths) {
        $this->reprint_directory = trim_right_slash($reprint_directory);
        $this->docroot = trim_right_slash($docroot);
        $this->push_session_id = $push_session_id;
        if ($reprint_directory === $this->docroot) {
            throw new InvalidArgumentException('The reprint directory must not be the document root itself.');
        }
        $relative_reprint_directory = relative_path_under($reprint_directory, $this->docroot);
        if ($relative_reprint_directory !== null && $relative_reprint_directory !== '') {
            $excluded_paths[] = $relative_reprint_directory;
        }
        $this->excluded_paths = normalize_excluded_paths($excluded_paths);
        $push_sessions_directory = wp_join_unix_paths($this->reprint_directory, '.reprint', 'push');
        $this->commit_state_path = wp_join_unix_paths($push_sessions_directory, 'commit-state');
        $this->commit_state_lock_path = wp_join_unix_paths($push_sessions_directory, 'commit-state.lock');
        $this->push_directory = wp_join_unix_paths($push_sessions_directory, $push_session_id);
        $this->push_json_path = wp_join_unix_paths($this->push_directory, 'push.json');
        $this->commit_json_path = wp_join_unix_paths($this->push_directory, 'commit.json');
        $this->push_lock_path = wp_join_unix_paths($this->push_directory, 'push.lock');
        $this->work_dir = wp_join_unix_paths($this->push_directory, 'work');
        $this->work_files_directory = wp_join_unix_paths($this->work_dir, 'files');
        $this->work_inflight_path = wp_join_unix_paths($this->work_dir, 'inflight.json');
        $this->work_inflight_data_path = wp_join_unix_paths($this->work_dir, 'inflight.data');
        $this->work_deletes_path = wp_join_unix_paths($this->work_dir, 'deletes');
        $this->maintenance_copy_path = wp_join_unix_paths($this->work_dir, 'maintenance.php');
    }

    /**
     * Creates or idempotently reopens one private push session.
     *
     * The empty work tree is created before its device is compared with the
     * document root. A mismatch removes the new push session before any multipart
     * bytes can be accepted. That device check necessarily stats the new tree;
     * successful creation and metadata writes are otherwise trusted instead
     * of being followed by a complete layout scan.
     *
     * Replaying the same push session ID validates the existing directory's
     * durable layout, immutable metadata, and same-filesystem relationship
     * under its push lock before returning the handle. The create/remove lock
     * remains held during that validation, so remove cannot rename the directory
     * between the existing-directory check and the push-lock acquisition.
     *
     * @param string $reprint_directory Durable private reprint directory on the document-root filesystem.
     * @param string $docroot Document-root directory receiving committed values.
     * @param list<string> $excluded_paths Document-root-relative paths which a push must preserve.
     * @param string $push_session_id Stable lowercase hexadecimal push session ID.
     * @return self New or existing push-session handle.
     */
    public static function create(string $reprint_directory, string $docroot, array $excluded_paths, string $push_session_id): self {
        self::require_push_session_id($push_session_id);
        $reprint_directory = self::require_directory($reprint_directory, 'reprint directory', true);
        $docroot = self::require_directory($docroot, 'document root', false);
        $push_session = new self($reprint_directory, $docroot, $push_session_id, $excluded_paths);
        $push_sessions_directory = self::create_push_sessions_directory($reprint_directory);
        $create_remove_lock = self::acquire_create_remove_lock($push_sessions_directory, 'create');
        try {
            $push_session->with_commit_state_lock(function () use ($push_session): void {
                $active_owner = $push_session->read_commit_owner();
                if ($active_owner !== null && $active_owner !== $push_session->push_session_id) {
                    throw new Site_Export_Push_Exception(
                        self::ERROR_COMMIT_REQUIRED,
                        'Push session ' . $active_owner . ' must finish committing this document root before another push session can start.',
                        ['blocking_push_session_id' => $active_owner]
                    );
                }
            });
            $removing_push_directory = wp_join_unix_paths(
                $push_sessions_directory,
                '.removing-' . $push_session_id
            );
            if (file_exists($removing_push_directory) || is_link($removing_push_directory)) {
                throw new Site_Export_Push_Exception(
                    self::ERROR_LOCK_ACQUISITION_FAILURE,
                    'Push session removal is incomplete. Retry create after remove finishes.'
                );
            }
            if (file_exists($push_session->push_directory) || is_link($push_session->push_directory)) {
                // Lock acquisition checks the durable layout; with_push_lock()
                // then checks immutable configuration before this callback.
                $push_session->with_push_lock(static function (): void {});
                return $push_session;
            }
            if (!@mkdir($push_session->work_files_directory, 0700, true)) {
                self::remove_tree($push_session->push_directory);
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create the push work directories.');
            }
            if (@file_put_contents($push_session->push_lock_path, '') === false || @file_put_contents($push_session->work_deletes_path, '') === false) {
                self::remove_tree($push_session->push_directory);
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create push session control files.');
            }
            try {
                $push_session->require_same_device($push_session->work_files_directory, $push_session->docroot, 'receive', '');
            } catch (Throwable $exception) {
                self::remove_tree($push_session->push_directory);
                throw $exception;
            }
            $push_session->write_json($push_session->push_json_path, [
                'push_session_id' => $push_session_id,
                'docroot_b64' => base64_encode($docroot),
                'excluded_paths_b64' => array_map('base64_encode', $push_session->excluded_paths),
                'work_deletes_complete' => false,
            ]);
            return $push_session;
        } finally {
            flock($create_remove_lock, LOCK_UN);
            fclose($create_remove_lock);
        }
    }

    /**
     * Creates a push-session handle which will be validated when it is used.
     *
     * This method canonicalizes the configured roots but deliberately does not
     * inspect the push directory. Upload, status, and commit acquire the
     * push lock and then validate its complete layout, immutable metadata,
     * and same-filesystem relationship exactly once for that operation.
     *
     * @param string $reprint_directory Durable private reprint directory.
     * @param string $docroot Document-root directory.
     * @param string $push_session_id Lowercase hexadecimal push session ID.
     * @param list<string> $excluded_paths Document-root-relative paths which a push must preserve.
     * @return self Push-session handle; the push session may prove missing or invalid
     *              when its first operation acquires the lock.
     */
    public static function open(string $reprint_directory, string $docroot, string $push_session_id, array $excluded_paths): self {
        self::require_push_session_id($push_session_id);
        $reprint_directory = self::require_directory($reprint_directory, 'reprint directory', false);
        $docroot = self::require_directory($docroot, 'document root', false);
        return new self($reprint_directory, $docroot, $push_session_id, $excluded_paths);
    }

    /**
     * Removes private push work without requiring the old document-root configuration.
     *
     * Remove validates the push directory under its push lock, but it does not
     * require current excluded paths or the document root to match immutable
     * push metadata. That exception is intentional: operators must still be
     * able to remove abandoned private work after configuration changes.
     *
     * @param string $reprint_directory Durable private reprint directory.
     * @param string $docroot Currently configured document-root directory.
     * @param string $push_session_id Lowercase hexadecimal push session ID.
     * @param list<string> $excluded_paths Currently configured excluded paths.
     * @return bool True when the push directory and any remove tombstone are gone.
     */
    public static function remove(string $reprint_directory, string $docroot, string $push_session_id, array $excluded_paths): bool {
        self::require_push_session_id($push_session_id);
        $reprint_directory = self::require_directory($reprint_directory, 'reprint directory', false);
        $docroot = self::require_directory($docroot, 'document root', false);
        return ( new self($reprint_directory, $docroot, $push_session_id, $excluded_paths) )->remove_push_directory();
    }

    /**
     * Returns the immutable identity assigned to this push session.
     *
     * The push session ID is the caller-provided lowercase hexadecimal token used
     * in upload, status, commit, and remove endpoints. It is not re-read from
     * disk here; operations that depend on durable state validate the matching
     * metadata while holding the push lock.
     *
     * @return string Push session ID used in public protocol responses and paths.
     */
    public function get_push_session_id(): string {
        return $this->push_session_id;
    }

    /**
     * Returns the private push directory derived for this push session.
     *
     * This is an implementation path under the configured reprint directory.
     * The method is used by tests and endpoint code that need to inspect or
     * remove the private push directory; it does not imply that the
     * directory currently exists or has passed layout validation.
     *
     * @return string Absolute path to the push session's private directory.
     */
    public function get_push_directory(): string {
        return $this->push_directory;
    }

    /**
     * Opens one caller-driven multipart request without reading its body.
     *
     * The push lock remains held until finish_upload() is called, so no
     * status, commit, remove, or second upload can observe a partly processed
     * MIME part. The supplied processor owns the request boundary and parser
     * state. The two byte limits remain independent: one applies to each part's
     * declared Content-Length, and one applies to all decoded request-body bytes
     * read from the supplied stream.
     *
     * A push session which has started commit is closed to further uploads. This
     * method validates that condition before any bytes are read from $input.
     *
     * @param resource $input Blocking stream containing one multipart request.
     * @param Site_Export_Multipart_Processor $processor Parser configured with
     *                                                   the request boundary.
     * @param int $maximum_part_bytes Largest Content-Length accepted for one part.
     * @param int $maximum_request_body_bytes Largest decoded request body accepted.
     *                                        Defaults to unlimited for direct callers.
     *
     * @throws LogicException If another upload is already open on this object.
     * @throws InvalidArgumentException If the stream or either byte limit is invalid.
     * @throws Site_Export_Push_Exception If the push session is busy,
     *     malformed, unavailable, already committing, or the decoded request
     *     body exceeds its byte limit.
     */
    public function accept_upload(
        $input,
        Site_Export_Multipart_Processor $processor,
        int $maximum_part_bytes = PHP_INT_MAX,
        int $maximum_request_body_bytes = PHP_INT_MAX
    ): void {
        if ($this->upload_lock !== null) {
            throw new LogicException('A push upload is already open; call finish_upload() first.');
        }
        if (!is_resource($input)) {
            throw new InvalidArgumentException('Push multipart input must be a readable stream resource; received ' . gettype($input) . '.');
        }
        if ($maximum_part_bytes <= 0) {
            throw new InvalidArgumentException('Multipart part byte limit must be greater than zero.');
        }
        if ($maximum_request_body_bytes <= 0) {
            throw new InvalidArgumentException(
                'Multipart request-body byte limit must be greater than zero; received '
                . $maximum_request_body_bytes . '.'
            );
        }
        $lock = $this->acquire_push_lock();
        try {
            $this->assert_push_configuration();
            if (is_file($this->commit_json_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_COMMIT_REQUIRED, 'Uploads are closed because this push session is committing.');
            }
            $this->upload_lock = $lock;
            $this->upload_input = $input;
            $this->upload_processor = $processor;
            $this->current_upload_part_ended = false;
            $this->current_change = null;
            $this->maximum_upload_part_bytes = $maximum_part_bytes;
            $this->maximum_upload_request_body_bytes = $maximum_request_body_bytes;
            $this->upload_request_body_bytes_read = 0;
        } catch (Throwable $exception) {
            flock($lock, LOCK_UN);
            fclose($lock);
            throw $exception;
        }
    }

    /**
     * Reads and records the next change from the active multipart upload.
     *
     * Each MIME part describes one file chunk, directory, symlink, or segment
     * of the raw delete stream. File bodies pass through the multipart
     * processor in bounded pieces instead of being collected in memory. One
     * call interprets exactly one complete part and does not begin interpreting
     * the following part before returning.
     *
     * Returning true means the complete part has been accepted into the work
     * directory and get_current_change() describes the resulting work state.
     * A file part may leave the current value in flight, so true does not mean
     * the logical file or the complete multipart request is finished.
     *
     * Returning false means the closing multipart boundary was consumed. EOF
     * in a header, body, or boundary throws instead, so truncation is never
     * reported as normal completion.
     *
     * accept_upload() must be called first. The caller must eventually call
     * finish_upload(), including after an exception, to release the push
     * lock and clear the request state.
     *
     * @return bool True when one complete part was accepted, false after the
     *              multipart request closed cleanly.
     *
     * @throws LogicException If no upload is active or parser state is inconsistent.
     * @throws InvalidArgumentException If the part violates the push protocol.
     * @throws RuntimeException If the request is truncated or the work directory
     *     cannot record the part.
     */
    public function next_change(): bool {
        if ($this->upload_lock === null || $this->upload_input === null || $this->upload_processor === null) {
            throw new LogicException('Accept an upload before reading changes.');
        }
        $this->current_change = null;
        $this->current_upload_part_ended = false;
        try {
            if (!$this->next_upload_token()) {
                return false;
            }
            if ($this->upload_processor->get_token_type() !== Site_Export_Multipart_Processor::TOKEN_PART_START) {
                throw new LogicException('Expected a multipart part-start token before the next change.');
            }
            $headers = $this->upload_processor->get_current_headers();
            $part_bytes = $this->require_non_negative_header($headers, 'content-length');
            if ($part_bytes > $this->maximum_upload_part_bytes) {
                throw new InvalidArgumentException('Multipart part Content-Length ' . $part_bytes . ' exceeds the document-root maximum of ' . $this->maximum_upload_part_bytes . ' bytes.');
            }
            $type = $headers['x-chunk-type'] ?? null;
            if (!is_string($type) || !in_array($type, ['file', 'directory', 'symlink', 'delete-list'], true)) {
                throw new InvalidArgumentException('Multipart X-Chunk-Type must be file, directory, symlink, or delete-list; observed ' . json_encode($type) . '.');
            }
            if ($type === 'file') {
                $this->receive_file_part($headers, $part_bytes);
            } elseif ($type === 'directory') {
                $this->receive_directory_part($headers, $part_bytes);
            } elseif ($type === 'symlink') {
                $this->receive_symlink_part($headers, $part_bytes);
            } else {
                $this->receive_delete_list_part($headers, $part_bytes);
            }
            $unread = $this->read_current_upload_body_piece();
            if ($unread !== null) {
                throw new LogicException('The multipart part handler left ' . strlen($unread) . ' body bytes unread.');
            }
            return true;
        } catch (Throwable $exception) {
            $this->upload_input = null;
            $this->upload_processor = null;
            $this->current_change = null;
            throw $exception;
        }
    }

    /**
     * Closes the active upload and releases its push lock.
     *
     * This method does not drain or validate the remainder of the multipart
     * request. A caller may therefore stop after any complete part when a
     * request budget is exhausted; a later request resumes from push-directory
     * state. It must also be called after next_change() throws.
     *
     * @throws LogicException If no upload is active.
     */
    public function finish_upload(): void {
        if ($this->upload_lock === null) {
            throw new LogicException('No push upload is open; call accept_upload() first.');
        }
        $lock = $this->upload_lock;
        $this->upload_lock = null;
        $this->upload_input = null;
        $this->upload_processor = null;
        $this->current_upload_part_ended = false;
        $this->current_change = null;
        $this->maximum_upload_part_bytes = PHP_INT_MAX;
        $this->maximum_upload_request_body_bytes = PHP_INT_MAX;
        $this->upload_request_body_bytes_read = 0;
        flock($lock, LOCK_UN);
        fclose($lock);
    }

    /**
     * Returns the receiver-confirmed work state from the latest accepted MIME part.
     *
     * The value is meaningful only after next_change() returns true. Calling
     * next_change() again clears the previous value before processing, and
     * finish_upload() clears it when the request closes.
     *
     * @return array|null {
     *     Accepted work state, or null when no result is current.
     *
     *     @type string $path_b64 Base64-encoded work path. Present for file,
     *                            directory, and symlink changes; absent for the
     *                            delete list.
     *     @type string $state Whether the part left partial or complete work.
     *                         Directory and symlink parts are always complete.
     *     @type string $type One of `file`, `directory`, `symlink`, or
     *                        `delete-list`.
     *     @type int $accepted_bytes Receiver-confirmed file or delete-list
     *                               bytes. Always zero for directories and
     *                               symlinks.
     * }
     * @phpstan-return CurrentChange|null
     */
    public function get_current_change(): ?array {
        return $this->current_change;
    }

    /**
     * Reports work-confirmed push-session progress and selected path cursors.
     *
     * Senders use this snapshot after a lost response or process restart. It
     * derives every cursor from the work directory rather than echoing a
     * sender's claimed offset. Calling it without a path returns only push-session
     * progress; it never enumerates the complete work-files tree.
     *
     * The optional path is the in-flight work whose upload response was lost.
     * Delete-list resume does not need a path; use work_deletes_bytes from
     * the push-session result. The path status is encoded as path_b64 so arbitrary
     * filesystem bytes remain representable. It is reported as one of:
     *
     *  - missing, with an accepted_bytes cursor of zero;
     *  - partial, with its type and the regular file's actual stored byte size,
     *    or zero for a directory or symlink; or
     *  - complete, with its file, directory, or symlink type and a file-size
     *    cursor where applicable.
     *
     * The push-session result contains the push session ID, the current receiving_work,
     * deleting_files, installing_files, or complete phase, the actual delete-stream byte
     * size, whether its completion was explicitly declared, and a path status
     * when a path was requested. The complete snapshot is read while holding
     * the push lock.
     *
     * @param string|null $path Raw document-root-relative path byte string to inspect.
     * @return array {
     *     Work-confirmed push-session and optional path progress.
     *
     *     @type string $push_session_id Push session ID.
     *     @type string $phase One of `receiving_work`, `deleting_files`,
     *                         `installing_files`, or `complete`.
     *     @type int $work_deletes_bytes Receiver-confirmed delete-list bytes.
     *     @type bool $work_deletes_complete Whether the delete-list upload was
     *                                       explicitly completed.
     *     @type array|null $path Selected path status, or null when no path was
     *                            requested. A status contains `path_b64`, `state`,
     *                            and `accepted_bytes`; `type` is present unless
     *                            `state` is `missing`. `accepted_bytes` is the
     *                            stored file size and zero for missing paths,
     *                            directories, and symlinks.
     * }
     * @phpstan-return array{
     *     push_session_id:string,
     *     phase:'receiving_work'|'deleting_files'|'installing_files'|'complete',
     *     work_deletes_bytes:int,
     *     work_deletes_complete:bool,
     *     path:PathStatus|null
     * }
     *
     * @throws InvalidArgumentException If the requested path is reserved or
     *     overlaps an excluded path.
     * @throws Site_Export_Push_Exception If the push session is busy,
     *     unavailable, corrupt, or no longer matches the document-root configuration.
     */
    public function get_status(?string $path = null): array {
        return $this->with_push_lock(function () use ($path): array {
            $this->finish_inflight_completion();
            $reported_path = null;
            if ($path !== null) {
                $this->assert_path_does_not_overlap_excluded_paths($path);
                $complete = wp_join_unix_paths($this->work_files_directory, $path);
                $this->ensure_private_parent($complete, false);
                $inflight = $this->read_inflight();
                if ($inflight !== null && base64_decode($inflight['path_b64'], true) === $path) {
                    $reported_path = [
                        'path_b64' => base64_encode($path),
                        'state' => 'partial',
                        'type' => $inflight['type'],
                        'accepted_bytes' => $inflight['type'] === 'file' && $inflight['phase'] === 'receiving' ? $this->file_size($this->work_inflight_data_path) : 0,
                    ];
                } elseif (($complete_identity = $this->lstat_path($complete)) !== null) {
                    $reported_path = [
                        'path_b64' => base64_encode($path),
                        'state' => 'complete',
                        'type' => $complete_identity['type'],
                        'accepted_bytes' => $complete_identity['type'] === 'file' ? $complete_identity['size'] : 0,
                    ];
                } else {
                    $reported_path = ['path_b64' => base64_encode($path), 'state' => 'missing', 'accepted_bytes' => 0];
                }
            }
            $commit_state = $this->read_json($this->commit_json_path);
            return [
                'push_session_id' => $this->push_session_id,
                'phase' => $commit_state === null ? 'receiving_work' : $commit_state['phase'],
                'work_deletes_bytes' => $this->file_size($this->work_deletes_path),
                'work_deletes_complete' => $this->work_deletes_are_complete(),
                'path' => $reported_path,
            ];
        });
    }

    /**
     * Advances a bounded amount of document-root mutation for this push session.
     *
     * Commit starts only after the delete upload has been explicitly closed and
     * no work remains in flight. The first call creates a durable checkpoint
     * and claims the document root so no other push session can mutate it.
     * Subsequent calls resume from that checkpoint, refresh the WordPress
     * maintenance marker, and perform at most $maximum_entries units of delete or
     * install work before returning.
     *
     * Document-root drift and cross-device destinations are non-recoverable for
     * the push session: the failure is written into the commit checkpoint and replayed on
     * later calls. Recoverable I/O failures do not persist a failure, so a later call can
     * retry the same bounded step from the durable state.
     *
     * @param int $maximum_entries Maximum bounded commit entries to process in this call.
     * @param string|null $commit_start_denial_detail When present, commit may
     *     resume a durable checkpoint but may not create one. The string
     *     describes why starting commit is denied.
     * @return array {
     *     Current bounded commit result.
     *
     *     @type string $phase Current `deleting_files`, `installing_files`, or
     *                         `complete` phase.
     *     @type bool $send_next_request Whether another commit request is needed.
     *     @type int $entries_processed Entries processed by this call.
     * }
     * @phpstan-return array{phase:'deleting_files'|'installing_files'|'complete',send_next_request:bool,entries_processed:int}
     */
    public function commit(int $maximum_entries = 1, ?string $commit_start_denial_detail = null): array {
        if ($maximum_entries <= 0) {
            throw new InvalidArgumentException('The commit entry limit must be greater than zero.');
        }
        if ($commit_start_denial_detail === '') {
            throw new InvalidArgumentException('The commit start denial detail must be a non-empty string.');
        }
        return $this->with_push_lock(function () use ($maximum_entries, $commit_start_denial_detail): array {
            $commit_state = $this->read_json($this->commit_json_path);
            if ($commit_state === null) {
                // The authorization decision and checkpoint creation share the
                // push lock so a denied request cannot race another lifecycle
                // operation into starting a new commit.
                if ($commit_start_denial_detail !== null) {
                    throw new Site_Export_Push_Exception(
                        self::ERROR_PUSH_DISABLED,
                        $commit_start_denial_detail
                    );
                }
                if (!$this->work_deletes_are_complete()) {
                    throw new InvalidArgumentException('Commit requires an explicit completed delete upload declaration.');
                }
                $work_deletes_bytes = $this->file_size($this->work_deletes_path);
                if ($work_deletes_bytes > 0) {
                    $handle = @fopen($this->work_deletes_path, 'rb');
                    if ($handle === false || fseek($handle, -1, SEEK_END) !== 0) {
                        if (is_resource($handle)) {
                            fclose($handle);
                        }
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not inspect the final work delete byte.');
                    }
                    $last_byte = fread($handle, 1);
                    fclose($handle);
                    if ($last_byte !== "\0") {
                        throw new InvalidArgumentException('A nonempty delete stream must end in NUL before commit; the final record is unterminated.');
                    }
                }
                $this->finish_inflight_completion();
                if ($this->read_inflight() !== null) {
                    throw new InvalidArgumentException('Commit cannot begin while work remains in flight.');
                }
                $commit_state = [
                    'phase' => 'deleting_files',
                    'work_deletes_byte_offset' => 0,
                    'current_delete_path' => null,
                    'current_work_files_descendant' => null,
                    'commit_cursor' => [],
                ];
                $this->write_json($this->commit_json_path, $commit_state);
            }
            if (isset($commit_state['non_recoverable_commit_failure'])) {
                throw new Site_Export_Push_Exception(
                    $commit_state['non_recoverable_commit_failure']['reason'],
                    $commit_state['non_recoverable_commit_failure']['detail'],
                    $commit_state['non_recoverable_commit_failure']['context']
                );
            }
            if ($commit_state['phase'] === 'complete') {
                // The complete checkpoint is durable before commit ownership is released.
                // A retry must finish that release without replaying document-root work.
                $this->release_commit_state();
                return [
                    'phase' => $commit_state['phase'],
                    'send_next_request' => false,
                    'entries_processed' => 0,
                ];
            }
            $this->with_commit_state_lock(function (): void {
                $active_owner = $this->read_commit_owner();
                if ($active_owner !== null && $active_owner !== $this->push_session_id) {
                    throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'Another push session is already committing this document root: ' . $active_owner . '.');
                }
                $this->write_atomic_file($this->commit_state_path, $this->push_session_id . "\n", 0600);
            });
            $maintenance_docroot_path = $this->docroot_path('.maintenance');
            $maintenance_identity = $this->lstat_path($maintenance_docroot_path);
            if ($maintenance_identity !== null && !$this->maintenance_marker_is_owned($maintenance_docroot_path, $this->push_session_id)) {
                throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'A foreign WordPress maintenance marker already exists. Retry after its owner removes it.');
            }
            $maintenance_contents = "<?php\n"
                . "\$reprint_push_request = (isset(\$_GET['reprint-api']) || isset(\$_GET['site-export-api']))\n"
                . "    && isset(\$_GET['endpoint']) && is_string(\$_GET['endpoint'])\n"
                . "    && strpos(\$_GET['endpoint'], 'push_') === 0;\n"
                . "if (!\$reprint_push_request) {\n"
                . "    \$upgrading = " . time() . ";\n"
                . "}\n"
                . "unset(\$reprint_push_request);\n"
                . "// reprint-push-session:" . $this->push_session_id . "\n";
            $this->write_atomic_file($this->maintenance_copy_path, $maintenance_contents, 0600);
            $this->write_atomic_file($maintenance_docroot_path, $maintenance_contents, 0644);
            try {
                for ($entries_processed = 0; $entries_processed < $maximum_entries && $commit_state['phase'] !== 'complete'; ++$entries_processed) {
                    if ($commit_state['phase'] === 'deleting_files') {
                        $this->advance_delete($commit_state);
                    } else {
                        $this->advance_installing_files($commit_state);
                    }
                }
            } catch (Site_Export_Push_Exception $exception) {
                if (in_array($exception->get_error_code(), [self::ERROR_UNEXPECTED_DOCROOT_MUTATION, self::ERROR_SAME_DEVICE], true)) {
                    $commit_state['non_recoverable_commit_failure'] = [
                        'reason' => $exception->get_error_code(),
                        'detail' => $exception->getMessage(),
                        'context' => $exception->get_context(),
                    ];
                    $this->write_json($this->commit_json_path, $commit_state);
                }
                throw $exception;
            }
            return [
                'phase' => $commit_state['phase'],
                'send_next_request' => $commit_state['phase'] !== 'complete',
                'entries_processed' => $entries_processed,
            ];
        });
    }

    /**
     * Advances bounded cleanup of an upload-only or completed push directory.
     *
     * A push session which has begun an incomplete commit remains recovery state and
     * cannot be removed. An eligible push session is atomically renamed to a
     * private tombstone before entries are removed, so a lost response or later
     * request resumes cleanup without making the old push session addressable again.
     *
     * @return bool True when cleanup is complete, false when the bounded entry
     *              limit left tombstone work for another call.
     */
    public function remove_push_directory(): bool {
        $push_sessions_directory = self::create_push_sessions_directory($this->reprint_directory);
        $removing_push_directory = wp_join_unix_paths(
            $push_sessions_directory,
            '.removing-' . $this->push_session_id
        );
        $create_remove_lock = self::acquire_create_remove_lock($push_sessions_directory, 'remove');
        try {
            if ($this->lstat_path($this->push_directory) === null) {
                return $this->remove_tombstone($removing_push_directory);
            }
            $lock = $this->acquire_push_lock();
            try {
                $commit_state = $this->read_json($this->commit_json_path);
                if ($commit_state !== null && $commit_state['phase'] !== 'complete') {
                    throw new Site_Export_Push_Exception(self::ERROR_COMMIT_REQUIRED, 'Document-root mutation has begun. Resume commit instead of removing this push session.');
                }
                if (file_exists($removing_push_directory) || is_link($removing_push_directory)) {
                    throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'A remove tombstone already exists for push session ' . $this->push_session_id . '.');
                }
                if (!@rename($this->push_directory, $removing_push_directory)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not move the push directory to its removal tombstone.');
                }
            } finally {
                flock($lock, LOCK_UN);
                fclose($lock);
            }
            return $this->remove_tombstone($removing_push_directory);
        } finally {
            flock($create_remove_lock, LOCK_UN);
            fclose($create_remove_lock);
        }
    }

    /**
     * Returns the next body fragment for the current multipart part.
     *
     * The multipart processor may expose a body in several bounded fragments,
     * followed by a PART_END token. This method hides that token transition
     * from the part-specific work code: a string means bytes still belong to
     * the current part, and null means the declared Content-Length has been
     * satisfied. It never reads into the next part.
     *
     * @return string|null Current body bytes, or null after the part end.
     */
    private function read_current_upload_body_piece(): ?string {
        if ($this->current_upload_part_ended) {
            return null;
        }
        if (!$this->next_upload_token()) {
            throw new LogicException('Multipart input closed before the current part-end token.');
        }
        $type = $this->upload_processor->get_token_type();
        if ($type === Site_Export_Multipart_Processor::TOKEN_BODY) {
            return $this->upload_processor->get_current_body_piece();
        }
        if ($type === Site_Export_Multipart_Processor::TOKEN_PART_END) {
            $this->current_upload_part_ended = true;
            return null;
        }
        throw new LogicException('Expected multipart body or part-end; received ' . json_encode($type) . '.');
    }

    /**
     * Advances the multipart processor, feeding it bounded request bytes.
     *
     * The processor is drained before each new fread(), so this method
     * preserves the streaming contract: at most one request fragment and one
     * exposed token are held at a time. Clean completion returns false; a
     * truncated request is reported by finish_input().
     *
     * @return bool True when a processor token is current, false after close.
     */
    private function next_upload_token(): bool {
        while (!$this->upload_processor->next_token()) {
            if ($this->upload_processor->is_complete()) {
                $trailing_bytes = $this->read_upload_request_fragment();
                if ($trailing_bytes !== '') {
                    throw new InvalidArgumentException(
                        'Multipart data contains ' . strlen($trailing_bytes) . ' bytes after the closing boundary.'
                    );
                }
                $this->upload_processor->finish_input();
                return false;
            }
            if (!$this->upload_processor->paused_at_incomplete_input()) {
                throw new LogicException('Multipart processor stopped without completing or requesting input.');
            }
            $bytes = $this->read_upload_request_fragment();
            if ($bytes === '') {
                $this->upload_processor->finish_input();
                return false;
            }
            $this->upload_processor->append_bytes($bytes);
        }
        return true;
    }

    /**
     * Reads and accounts for one bounded decoded request-body fragment.
     *
     * When a request-body limit remains, the extra byte in the read size proves
     * the exact observed size which crossed it without buffering another chunk.
     * EOF is returned as an empty string so the multipart caller can finish the
     * processor in both incomplete and complete parser states.
     *
     * @return string Next bounded request-body fragment, or an empty string at EOF.
     */
    private function read_upload_request_fragment(): string {
        $maximum_fragment_bytes = Site_Export_Multipart_Processor::MAX_INPUT_FRAGMENT_BYTES;
        $remaining_request_body_bytes = PHP_INT_MAX;
        if ($this->maximum_upload_request_body_bytes !== PHP_INT_MAX) {
            $remaining_request_body_bytes = $this->maximum_upload_request_body_bytes - $this->upload_request_body_bytes_read;
            $maximum_fragment_bytes = min($maximum_fragment_bytes, $remaining_request_body_bytes + 1);
        }
        $bytes = fread($this->upload_input, $maximum_fragment_bytes);
        if ($bytes === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read the multipart upload request body.');
        }
        $fragment_bytes = strlen($bytes);
        if ($fragment_bytes > $remaining_request_body_bytes) {
            $observed_request_body_bytes = $this->upload_request_body_bytes_read + $fragment_bytes;
            throw new Site_Export_Push_Exception(
                self::ERROR_REQUEST_TOO_LARGE,
                'The decoded request body reached ' . $observed_request_body_bytes
                . ' bytes, exceeding the target post_max_size of '
                . $this->maximum_upload_request_body_bytes . ' bytes.',
                ['observed_request_body_bytes' => $observed_request_body_bytes]
            );
        }
        $this->upload_request_body_bytes_read += $fragment_bytes;
        return $bytes;
    }

    /**
     * Reads the durable description of in-flight work.
     *
     * A push receives or completes one work value at a time. Its identity and
     * phase are stored in `work/inflight.json`; file bytes, when
     * applicable, are stored separately in `work/inflight.data`. This method
     * reads the record before upload, status, or commit decides what work is
     * safe to perform.
     *
     * The JSON record is the authority for whether work is in flight. Callers
     * use its type and phase to decide whether they can receive more bytes,
     * finish the completed value, or begin commit work. A missing record means
     * there is no in-flight work.
     *
     * @return array|null {
     *     In-flight work, or null when none exists.
     *
     *     @type string $phase Current `preparing`, `receiving`, or `completing`
     *                         phase. Only files use `receiving`.
     *     @type string $path_b64 Base64-encoded work path.
     *     @type string $type One of `file`, `directory`, or `symlink`.
     *     @type int $total_bytes Declared file size. Present only for files.
     *     @type string $target_b64 Base64-encoded target. Present only for symlinks.
     * }
     * @phpstan-return InFlightWork|null
     */
    private function read_inflight(): ?array {
        return $this->read_json($this->work_inflight_path);
    }

    /**
     * Finishes in-flight work which crossed its durable completion boundary.
     *
     * The `completing` phase is stored before the completed work value changes.
     * That ordering lets a later upload, status request, or commit distinguish a
     * stop before completion from one after the data-file rename. When the fixed
     * data file remains it is authoritative and is renamed into work/files.
     * When it has already been consumed, the matching work value confirms
     * completion. Only then is the in-flight metadata removed.
     *
     * @return void
     */
    private function finish_inflight_completion(): void {
        $inflight = $this->read_inflight();
        if ($inflight === null || $inflight['phase'] !== 'completing') {
            return;
        }
        $path = base64_decode($inflight['path_b64'], true);
        $work_path = wp_join_unix_paths($this->work_files_directory, $path);
        $work_identity = $this->lstat_path($work_path);
        if ($inflight['type'] === 'file') {
            $data = $this->lstat_path($this->work_inflight_data_path);
            if ($data !== null) {
                if ($data['type'] !== 'file' || $data['size'] !== $inflight['total_bytes']) {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'In-flight file completion has an invalid data size.');
                }
                $this->ensure_private_parent($work_path);
                if ($work_identity !== null) {
                    $this->remove_work_path($work_path);
                }
                if (!@rename($this->work_inflight_data_path, $work_path)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not move in-flight file data to its work-file path.');
                }
            } elseif ($work_identity === null || $work_identity['type'] !== 'file' || $work_identity['size'] !== $inflight['total_bytes']) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'In-flight file completion has neither data nor a matching work file.');
            }
        } elseif ($inflight['type'] === 'directory') {
            if ($work_identity === null) {
                $this->ensure_private_parent($work_path);
                // The process umask filters 0777 to the document-root mode used by normal completion.
                // Until commit, 0700 work ancestors deny group and other traversal.
                if (!@mkdir($work_path, 0777)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create the in-flight directory at its work-file path.');
                }
            } elseif ($work_identity['type'] !== 'directory') {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'In-flight directory completion found an incompatible work value.');
            }
        } elseif ($work_identity === null) {
            $this->ensure_private_parent($work_path);
            if (!@symlink(base64_decode($inflight['target_b64'], true), $work_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create the in-flight symlink at its work-file path.');
            }
        } elseif ($work_identity['type'] !== 'symlink' || @readlink($work_path) !== base64_decode($inflight['target_b64'], true)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'In-flight symlink completion found an incompatible work value.');
        }
        if (!@unlink($this->work_inflight_path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not clear in-flight metadata after completing work.');
        }
    }

    /**
     * Accepts one file MIME part through the durable in-flight slot.
     *
     * The caller has already validated Content-Length against the document-root
     * part ceiling. This method validates the file-specific headers, enforces the
     * work-confirmed resume offset, streams the body into the in-flight data
     * file,
     * and promotes the file atomically inside the private reprint directory only when the
     * declared total size has been reached.
     *
     * @param array $headers {
     *     Normalized file part headers.
     *
     *     @type string $content-length Declared Content-Length header.
     *     @type string $content-type   Optional. Content-Type header.
     *     @type string $x-chunk-type   Chunk type header.
     *     @type string $x-file-path    Base64-encoded file path header.
     *     @type string $x-file-size    Declared file size header.
     *     @type string $x-chunk-offset Declared chunk offset header.
     * }
     * @phpstan-param array{
     *     content-length:string,
     *     content-type?:string,
     *     x-chunk-type:string,
     *     x-file-path:string,
     *     x-file-size:string,
     *     x-chunk-offset:string
     * } $headers
     * @param int $part_bytes Declared Content-Length for this file chunk.
     */
    private function receive_file_part(array $headers, int $part_bytes): void {
        $this->require_only_headers($headers, ['content-length', 'content-type', 'x-chunk-type', 'x-file-path', 'x-file-size', 'x-chunk-offset'], 'file');
        $path = $this->decode_path_header($headers, 'x-file-path');
        $total_bytes = $this->require_non_negative_header($headers, 'x-file-size');
        $offset = $this->require_non_negative_header($headers, 'x-chunk-offset');
        if ($offset > $total_bytes || $part_bytes > $total_bytes - $offset) {
            throw new InvalidArgumentException('File part for ' . base64_encode($path) . ' exceeds its declared total of ' . $total_bytes . ' bytes.');
        }
        $this->finish_inflight_completion();
        $inflight = $this->read_inflight();
        $complete_path = wp_join_unix_paths($this->work_files_directory, $path);
        $complete = $this->lstat_path($complete_path);
        if ($inflight === null && $complete !== null && $complete['type'] === 'file' && $complete['size'] === $total_bytes && $offset === $total_bytes && $part_bytes === 0) {
            if ($this->read_current_upload_body_piece() !== null) {
                throw new LogicException('Multipart processor exposed file bytes for an empty completed-file replay.');
            }
            $this->current_change = ['path_b64' => base64_encode($path), 'state' => 'complete', 'type' => 'file', 'accepted_bytes' => $total_bytes];
            return;
        }
        if ($inflight === null && $offset !== 0) {
            throw new Site_Export_Push_Exception(self::ERROR_OFFSET_GAP, 'File part for ' . base64_encode($path) . ' starts at offset ' . $offset . ', but no matching in-flight file exists. Start at offset 0.');
        }
        if ($inflight !== null && base64_decode($inflight['path_b64'], true) !== $path) {
            throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'In-flight work already occupies the slot: ' . $inflight['path_b64'] . '.');
        }
        if ($inflight === null || $offset === 0) {
            if ($inflight !== null && $this->lstat_path($this->work_inflight_data_path) !== null && !@unlink($this->work_inflight_data_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not discard in-flight file data for restart.');
            }
            $inflight = ['phase' => 'preparing', 'path_b64' => base64_encode($path), 'type' => 'file', 'total_bytes' => $total_bytes];
            $this->write_json($this->work_inflight_path, $inflight);
            $handle = @fopen($this->work_inflight_data_path, 'wb');
            if ($handle === false) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create in-flight file data for ' . base64_encode($path) . '.');
            }
            fclose($handle);
            $inflight['phase'] = 'receiving';
            $this->write_json($this->work_inflight_path, $inflight);
            $actual_bytes = 0;
        } else {
            if ($inflight['type'] !== 'file' || $inflight['phase'] !== 'receiving' || $inflight['total_bytes'] !== $total_bytes) {
                throw new Site_Export_Push_Exception(self::ERROR_OFFSET_GAP, 'In-flight file ' . base64_encode($path) . ' must be restarted at offset 0.');
            }
            $actual_bytes = $this->file_size($this->work_inflight_data_path);
            if ($offset !== $actual_bytes) {
                throw new Site_Export_Push_Exception(self::ERROR_OFFSET_GAP, 'File part for ' . base64_encode($path) . ' starts at offset ' . $offset . ', but in-flight data contains ' . $actual_bytes . ' bytes.');
            }
        }
        $handle = @fopen($this->work_inflight_data_path, 'ab');
        if ($handle === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open in-flight file data for ' . base64_encode($path) . '.');
        }
        $received = 0;
        try {
            while (($piece = $this->read_current_upload_body_piece()) !== null) {
                $received += strlen($piece);
                $this->write_all($handle, $piece, 'in-flight file data ' . base64_encode($path));
            }
            if (!fflush($handle)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not flush in-flight file data ' . base64_encode($path) . '.');
            }
        } finally {
            fclose($handle);
        }
        $accepted_bytes = $actual_bytes + $received;
        if ($accepted_bytes === $total_bytes) {
            $inflight['phase'] = 'completing';
            $this->write_json($this->work_inflight_path, $inflight);
            $this->ensure_private_parent($complete_path);
            if ($this->lstat_path($complete_path) !== null) {
                $this->remove_work_path($complete_path);
            }
            if (!@rename($this->work_inflight_data_path, $complete_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not move in-flight file data to the work-file path ' . base64_encode($path) . '.');
            }
            if (!@unlink($this->work_inflight_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not clear in-flight metadata after completing work for ' . base64_encode($path) . '.');
            }
            $state = 'complete';
        } else {
            $state = 'partial';
        }
        $this->current_change = ['path_b64' => base64_encode($path), 'state' => $state, 'type' => 'file', 'accepted_bytes' => $accepted_bytes];
    }

    /**
     * Accepts one explicit empty-directory MIME part.
     *
     * Directory parts have no body. They create or refresh an empty directory in
     * the completed work tree. A directory part cannot replace a non-empty
     * directory because that directory contains other completed work values.
     *
     * @param array $headers {
     *     Normalized directory part headers.
     *
     *     @type string $content-length   Declared Content-Length header.
     *     @type string $content-type     Optional. Content-Type header.
     *     @type string $x-chunk-type     Chunk type header.
     *     @type string $x-directory-path Base64-encoded directory path header.
     * }
     * @phpstan-param array{content-length:string,content-type?:string,x-chunk-type:string,x-directory-path:string} $headers
     * @param int $part_bytes Declared Content-Length, which must be zero.
     */
    private function receive_directory_part(array $headers, int $part_bytes): void {
        $this->require_only_headers($headers, ['content-length', 'content-type', 'x-chunk-type', 'x-directory-path'], 'directory');
        if ($part_bytes !== 0 || $this->read_current_upload_body_piece() !== null) {
            throw new InvalidArgumentException('Multipart directory part must have Content-Length 0.');
        }
        $path = $this->decode_path_header($headers, 'x-directory-path');
        $target = wp_join_unix_paths($this->work_files_directory, $path);
        $this->finish_inflight_completion();
        $inflight = $this->read_inflight();
        if ($inflight !== null && base64_decode($inflight['path_b64'], true) !== $path) {
            throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'In-flight work already occupies the slot: ' . $inflight['path_b64'] . '.');
        }
        $identity = $this->lstat_path($target);
        if ($identity !== null && $identity['type'] === 'directory' && $this->first_directory_entry($target) !== null) {
            throw new InvalidArgumentException('Explicit empty directory ' . base64_encode($path) . ' conflicts with completed work descendants.');
        }
        if ($inflight === null && $identity !== null && $identity['type'] === 'directory') {
            $this->current_change = ['path_b64' => base64_encode($path), 'state' => 'complete', 'type' => 'directory', 'accepted_bytes' => 0];
            return;
        }
        $inflight = ['phase' => 'preparing', 'path_b64' => base64_encode($path), 'type' => 'directory'];
        $this->write_json($this->work_inflight_path, $inflight);
        if ($this->lstat_path($this->work_inflight_data_path) !== null && !@unlink($this->work_inflight_data_path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not discard stale in-flight file data.');
        }
        if ($identity !== null) {
            $this->remove_work_path($target);
        }
        $inflight['phase'] = 'completing';
        $this->write_json($this->work_inflight_path, $inflight);
        $this->ensure_private_parent($target);
        if (!is_dir($target) && !@mkdir($target, 0777)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not stage explicit empty directory ' . base64_encode($path) . '.');
        }
        if (!@unlink($this->work_inflight_path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not clear in-flight metadata after completing work for ' . base64_encode($path) . '.');
        }
        $this->current_change = ['path_b64' => base64_encode($path), 'state' => 'complete', 'type' => 'directory', 'accepted_bytes' => 0];
    }

    /**
     * Accepts one symlink MIME part.
     *
     * Symlink parts carry their target in a base64 header and have an empty
     * body. The completed work value replaces any previous leaf at the same
     * private path and rejects directory conflicts that would orphan completed
     * work descendants.
     *
     * @param array $headers {
     *     Normalized symlink part headers.
     *
     *     @type string $content-length   Declared Content-Length header.
     *     @type string $content-type     Optional. Content-Type header.
     *     @type string $x-chunk-type     Chunk type header.
     *     @type string $x-symlink-path   Base64-encoded symlink path header.
     *     @type string $x-symlink-target Base64-encoded symlink target header.
     * }
     * @phpstan-param array{
     *     content-length:string,
     *     content-type?:string,
     *     x-chunk-type:string,
     *     x-symlink-path:string,
     *     x-symlink-target:string
     * } $headers
     * @param int $part_bytes Declared Content-Length, which must be zero.
     */
    private function receive_symlink_part(array $headers, int $part_bytes): void {
        $this->require_only_headers($headers, ['content-length', 'content-type', 'x-chunk-type', 'x-symlink-path', 'x-symlink-target'], 'symlink');
        if ($part_bytes !== 0 || $this->read_current_upload_body_piece() !== null) {
            throw new InvalidArgumentException('Multipart symlink part must have Content-Length 0.');
        }
        $path = $this->decode_path_header($headers, 'x-symlink-path');
        $target_value = $this->decode_path_header($headers, 'x-symlink-target', false);
        if ($target_value === '' || strlen($target_value) > self::MAX_PATH_BYTES || strpos($target_value, "\0") !== false) {
            throw new InvalidArgumentException('Symlink target must contain between 1 and ' . self::MAX_PATH_BYTES . ' bytes without NUL.');
        }
        $target = wp_join_unix_paths($this->work_files_directory, $path);
        $this->finish_inflight_completion();
        $inflight = $this->read_inflight();
        if ($inflight !== null && base64_decode($inflight['path_b64'], true) !== $path) {
            throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'In-flight work already occupies the slot: ' . $inflight['path_b64'] . '.');
        }
        $identity = $this->lstat_path($target);
        if ($identity !== null && $identity['type'] === 'directory' && $this->first_directory_entry($target) !== null) {
            throw new InvalidArgumentException('Work symlink ' . base64_encode($path) . ' conflicts with completed work descendants.');
        }
        if ($inflight === null && $identity !== null && $identity['type'] === 'symlink' && @readlink($target) === $target_value) {
            $this->current_change = ['path_b64' => base64_encode($path), 'state' => 'complete', 'type' => 'symlink', 'accepted_bytes' => 0];
            return;
        }
        $inflight = ['phase' => 'preparing', 'path_b64' => base64_encode($path), 'type' => 'symlink', 'target_b64' => base64_encode($target_value)];
        $this->write_json($this->work_inflight_path, $inflight);
        if ($this->lstat_path($this->work_inflight_data_path) !== null && !@unlink($this->work_inflight_data_path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not discard stale in-flight file data.');
        }
        if ($identity !== null) {
            $this->remove_work_path($target);
        }
        $inflight['phase'] = 'completing';
        $this->write_json($this->work_inflight_path, $inflight);
        $this->ensure_private_parent($target);
        if (!@symlink($target_value, $target)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not stage symlink ' . base64_encode($path) . '.');
        }
        if (!@unlink($this->work_inflight_path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not clear in-flight metadata after completing work for ' . base64_encode($path) . '.');
        }
        $this->current_change = ['path_b64' => base64_encode($path), 'state' => 'complete', 'type' => 'symlink', 'accepted_bytes' => 0];
    }

    /**
     * Accepts one segment of the raw NUL-delimited delete stream.
     *
     * The delete stream is append-only, but lost responses may cause callers to
     * replay bytes already stored by the target. Overlapping bytes must match
     * exactly; new bytes are validated record-by-record before they are flushed.
     * A completion declaration records that no more delete bytes may be added.
     *
     * @param array $headers {
     *     Normalized delete-list part headers.
     *
     *     @type string $content-length    Declared Content-Length header.
     *     @type string $content-type      Optional. Content-Type header.
     *     @type string $x-chunk-type      Chunk type header.
     *     @type string $x-delete-offset   Declared delete-list offset header.
     *     @type string $x-delete-complete Optional. Delete-list completion
     *                                    declaration header.
     * }
     * @phpstan-param array{
     *     content-length:string,
     *     content-type?:string,
     *     x-chunk-type:string,
     *     x-delete-offset:string,
     *     x-delete-complete?:string
     * } $headers
     * @param int $part_bytes Declared Content-Length for this delete segment.
     */
    private function receive_delete_list_part(array $headers, int $part_bytes): void {
        $this->require_only_headers($headers, ['content-length', 'content-type', 'x-chunk-type', 'x-delete-offset', 'x-delete-complete'], 'delete-list');
        $offset = $this->require_non_negative_header($headers, 'x-delete-offset');
        $complete = ( $headers['x-delete-complete'] ?? null ) === '1';
        if (isset($headers['x-delete-complete']) && !$complete) {
            throw new InvalidArgumentException('Multipart X-Delete-Complete must be 1 when present.');
        }
        if ($this->work_deletes_are_complete() && ( !$complete || $offset !== $this->file_size($this->work_deletes_path) || $part_bytes !== 0 )) {
            throw new InvalidArgumentException('Delete upload is already complete; only its empty completion declaration may be replayed.');
        }
        $handle = @fopen($this->work_deletes_path, 'r+b');
        if ($handle === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open the raw work delete stream.');
        }
        try {
            $delete_stat = fstat($handle);
            if (!is_array($delete_stat) || !isset($delete_stat['size'])) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not determine the actual size of work delete stream.');
            }
            $stored_bytes = (int) $delete_stat['size'];
            if ($offset > $stored_bytes) {
                throw new Site_Export_Push_Exception(
                    self::ERROR_OFFSET_GAP,
                    'Delete-list part starts at offset ' . $offset . ', but the work delete stream has stored ' . $stored_bytes . ' bytes.'
                );
            }
            $position = $offset;
            if ($stored_bytes === 0) {
                $trailing_path = '';
            } else {
                $suffix_bytes = min($stored_bytes, self::MAX_PATH_BYTES + 1);
                if (fseek($handle, $stored_bytes - $suffix_bytes) !== 0) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not inspect the work delete-stream suffix.');
                }
                $suffix = $this->read_exact($handle, $suffix_bytes, 'work delete-stream suffix');
                $last_nul = strrpos($suffix, "\0");
                $trailing_path = $last_nul === false ? $suffix : substr($suffix, $last_nul + 1);
                if ($last_nul === false && $stored_bytes > self::MAX_PATH_BYTES) {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The incomplete work delete path already exceeds ' . self::MAX_PATH_BYTES . ' bytes.');
                }
            }
            while (true) {
                $piece = $this->read_current_upload_body_piece();
                if ($piece === null) {
                    break;
                }
                $piece_offset = 0;
                $overlap = min(strlen($piece), max(0, $stored_bytes - $position));
                if ($overlap > 0) {
                    if (fseek($handle, $position) !== 0) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not seek within the work delete stream for replay validation.');
                    }
                    $stored = $this->read_exact($handle, $overlap, 'work delete replay');
                    if ($stored !== substr($piece, 0, $overlap)) {
                        throw new InvalidArgumentException('Delete-list replay differs from bytes already stored at offset ' . $position . '.');
                    }
                    $position += $overlap;
                    $piece_offset = $overlap;
                }
                if ($piece_offset < strlen($piece)) {
                    $append = substr($piece, $piece_offset);
                    $append_length = strlen($append);
                    for ($index = 0; $index < $append_length; ++$index) {
                        if ($append[$index] === "\0") {
                            if ($trailing_path === '') {
                                throw new InvalidArgumentException('Delete-list parts may not contain an empty delete record.');
                            }
                            $this->assert_path_does_not_overlap_excluded_paths($trailing_path);
                            $trailing_path = '';
                            continue;
                        }
                        $trailing_path .= $append[$index];
                        if (strlen($trailing_path) > self::MAX_PATH_BYTES) {
                            throw new InvalidArgumentException('Delete-list path exceeds the maximum of ' . self::MAX_PATH_BYTES . ' bytes.');
                        }
                    }
                    if (fseek($handle, 0, SEEK_END) !== 0) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not seek to the work delete stream end.');
                    }
                    $this->write_all($handle, $append, 'work delete stream');
                    $stored_bytes += strlen($append);
                    $position += strlen($append);
                    if (!fflush($handle)) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not flush the work delete stream.');
                    }
                }
            }
            if ($complete && $position !== $stored_bytes) {
                throw new InvalidArgumentException('Delete completion must be declared at the actual stored size of ' . $stored_bytes . ' bytes.');
            }
        } finally {
            fclose($handle);
        }
        if ($complete) {
            $push_metadata = $this->read_json($this->push_json_path);
            if (!is_array($push_metadata)) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata is missing while completing the delete upload.');
            }
            $push_metadata['work_deletes_complete'] = true;
            $this->write_json($this->push_json_path, $push_metadata);
        }
        $this->current_change = ['state' => $complete ? 'complete' : 'partial', 'type' => 'delete-list', 'accepted_bytes' => $stored_bytes];
    }

    /**
     * Performs one bounded delete step from the durable commit checkpoint.
     *
     * The first call for a record copies the next NUL-delimited path from the
     * raw delete stream into `current_delete_path`. A later call removes at
     * most one leaf or empty directory beneath that root and advances the byte
     * cursor only after the document-root path is confirmed absent.
     *
     * @param array $commit_state {
     *     Commit checkpoint, mutated in place.
     *
     *     @type string $phase Current commit phase.
     *     @type int $work_deletes_byte_offset Confirmed delete-list cursor.
     *     @type string|null $current_delete_path Delete path currently being consumed.
     *     @type array|null $current_work_files_descendant Work value currently being installed,
     *                                                       with `path_b64` and `expected_type` keys.
     *     @type array $commit_cursor Path components for the bounded tree walk.
     *     @type array $non_recoverable_commit_failure Persisted failure reason, detail, and
     *                                                  context. Present only after a
     *                                                  non-recoverable failure.
     * }
     * @phpstan-param CommitState $commit_state
     */
    private function advance_delete(array &$commit_state): void {
        if ($commit_state['current_delete_path'] === null) {
            $work_deletes_byte_offset = (int) $commit_state['work_deletes_byte_offset'];
            $delete_size = $this->file_size($this->work_deletes_path);
            if ($work_deletes_byte_offset === $delete_size) {
                $commit_state['phase'] = 'installing_files';
                $this->write_json($this->commit_json_path, $commit_state);
                return;
            }
            if ($work_deletes_byte_offset < 0 || $work_deletes_byte_offset > $delete_size) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Delete-consumption offset ' . $work_deletes_byte_offset . ' is outside the ' . $delete_size . '-byte stream.');
            }
            $handle = @fopen($this->work_deletes_path, 'rb');
            if ($handle === false || fseek($handle, $work_deletes_byte_offset) !== 0) {
                if (is_resource($handle)) {
                    fclose($handle);
                }
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not seek to the confirmed delete-consumption offset.');
            }
            $path = '';
            $path_bytes = 0;
            try {
                while ($path_bytes <= self::MAX_PATH_BYTES) {
                    $byte = fread($handle, 1);
                    if ($byte === false) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read the work delete stream.');
                    }
                    if ($byte === '') {
                        throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The work delete stream ended before its NUL record terminator.');
                    }
                    if ($byte === "\0") {
                        if ($path === '') {
                            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The work delete stream contains an empty record at offset ' . $work_deletes_byte_offset . '.');
                        }
                        $this->assert_path_does_not_overlap_excluded_paths($path);
                        $commit_state['current_delete_path'] = base64_encode($path);
                        $this->write_json($this->commit_json_path, $commit_state);
                        return;
                    }
                    $path .= $byte;
                    ++$path_bytes;
                }
            } finally {
                fclose($handle);
            }
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'A work delete path exceeds ' . self::MAX_PATH_BYTES . ' bytes.');
        }

        $path = $this->decode_commit_path($commit_state['current_delete_path'], 'current delete');
        $this->assert_path_does_not_overlap_excluded_paths($path);
        $parent_device = $this->require_docroot_ancestors($path, 'delete');
        if ($parent_device !== null) {
            $docroot_value_path = $this->docroot_path($path);
            $identity = $this->lstat_path($docroot_value_path);
            if ($identity !== null) {
                if (!in_array($identity['type'], ['file', 'directory', 'symlink'], true)) {
                    $this->throw_unexpected_docroot_mutation('delete', $path, $path, null, ['absent', 'file', 'directory', 'symlink'], $identity);
                }
                if ($identity['dev'] !== $parent_device) {
                    $this->throw_same_device('delete', $path, $this->work_device(), $identity['dev']);
                }
                $this->remove_docroot_entry($docroot_value_path, $path, $path, $parent_device);
            }
            if ($this->lstat_path($docroot_value_path) !== null) {
                return;
            }
        }
        $commit_state['work_deletes_byte_offset'] += strlen($path) + 1;
        $commit_state['current_delete_path'] = null;
        $this->write_json($this->commit_json_path, $commit_state);
    }

    /**
     * Removes at most one leaf or empty directory below one planned root.
     *
     * Directories are drained depth-first so each commit step is bounded and
     * recoverable. The requested root is kept separate from the recursive
     * relative path so drift responses can name both the user-requested delete
     * and the nested path that actually conflicted.
     *
     * @param string $absolute_path Current document-root filesystem path to inspect.
     * @param string $relative_path Document-root-relative path matching $absolute_path.
     * @param string $requested_path Original delete root used in conflicts.
     * @param int $parent_device Device id expected for the current entry.
     */
    private function remove_docroot_entry(string $absolute_path, string $relative_path, string $requested_path, int $parent_device): void {
        $identity = $this->lstat_path($absolute_path);
        if ($identity === null) {
            return;
        }
        if ($identity['dev'] !== $parent_device) {
            $this->throw_same_device('delete', $relative_path, $this->work_device(), $identity['dev']);
        }
        if ($identity['type'] === 'file' || $identity['type'] === 'symlink') {
            if (!@unlink($absolute_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove document-root ' . $identity['type'] . ' ' . base64_encode($relative_path) . '.');
            }
            return;
        }
        if ($identity['type'] !== 'directory') {
            $this->throw_unexpected_docroot_mutation('delete', $requested_path, $relative_path, null, ['file', 'directory', 'symlink'], $identity);
        }
        $entry = $this->first_directory_entry($absolute_path);
        if ($entry === null) {
            if (!@rmdir($absolute_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove empty document-root directory ' . base64_encode($relative_path) . '.');
            }
            return;
        }
        $child_relative = wp_join_unix_paths($relative_path, $entry);
        $this->remove_docroot_entry(
            wp_join_unix_paths($absolute_path, $entry),
            $child_relative,
            $requested_path,
            $identity['dev']
        );
    }

    /**
     * Performs one bounded installing_files or commit-cursor step.
     *
     * The completed work tree is its own queue. This method walks it
     * depth-first, creating document-root ancestor directories before their
     * children, installing one leaf value per step, and consuming empty work
     * ancestor directories after their descendants have been committed.
     *
     * @param array $commit_state {
     *     Commit checkpoint, mutated in place.
     *
     *     @type string $phase Current commit phase.
     *     @type int $work_deletes_byte_offset Confirmed delete-list cursor.
     *     @type string|null $current_delete_path Delete path currently being consumed.
     *     @type array|null $current_work_files_descendant Work value currently being installed,
     *                                                       with `path_b64` and `expected_type` keys.
     *     @type array $commit_cursor Path components for the bounded tree walk.
     *     @type array $non_recoverable_commit_failure Persisted failure reason, detail, and
     *                                                  context. Present only after a
     *                                                  non-recoverable failure.
     * }
     * @phpstan-param CommitState $commit_state
     */
    private function advance_installing_files(array &$commit_state): void {
        if ($commit_state['current_work_files_descendant'] !== null) {
            /*
             * A checkpoint may survive either side of a rename or work ancestor
             * directory cleanup. The work value may still be present and need
             * retrying, or it may already be consumed and require verification
             * in the document root. Resolve that checkpoint before selecting
             * any new work.
             */
            $current_work_files_descendant = $commit_state['current_work_files_descendant'];
            $path = $this->decode_commit_path($current_work_files_descendant['path_b64'], 'current installing_files');
            $expected_type = $current_work_files_descendant['expected_type'];
            $stack_size = count($commit_state['commit_cursor']);
            $work_ancestor_directory_cleanup = false;
            if ($stack_size > 0) {
                $work_ancestor_directory_cleanup = $this->commit_cursor_path($commit_state['commit_cursor']) === $path;
            }
            $work_path = wp_join_unix_paths($this->work_files_directory, $path);
            $work_identity = $this->lstat_path($work_path);

            if ($work_ancestor_directory_cleanup) {
                $this->assert_path_is_not_excluded($path);
                $this->require_docroot_ancestors($path, 'install', 'directory');
                $docroot_identity = $this->lstat_path($this->docroot_path($path));
                if ($work_identity !== null) {
                    if ($work_identity['type'] !== 'directory' || $this->first_directory_entry($work_path) !== null) {
                        $this->throw_unexpected_docroot_mutation('install', $path, $path, 'directory', ['directory'], $docroot_identity);
                    }
                    if ($docroot_identity === null || $docroot_identity['type'] !== 'directory') {
                        $this->throw_unexpected_docroot_mutation('install', $path, $path, 'directory', ['directory'], $docroot_identity);
                    }
                    if (!@rmdir($work_path)) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not finish work ancestor directory cleanup for ' . base64_encode($path) . '.');
                    }
                } elseif ($docroot_identity === null || $docroot_identity['type'] !== 'directory') {
                    $this->throw_unexpected_docroot_mutation('install', $path, $path, 'directory', ['directory'], $docroot_identity);
                }
                $commit_state['current_work_files_descendant'] = null;
                array_pop($commit_state['commit_cursor']);
                $this->write_json($this->commit_json_path, $commit_state);
                return;
            }

            $this->assert_path_does_not_overlap_excluded_paths($path);
            if ($work_identity !== null) {
                $this->install_work_value($commit_state, $path, $expected_type, true);
                return;
            }
            $this->require_docroot_ancestors($path, 'install', $expected_type);
            $docroot_identity = $this->lstat_path($this->docroot_path($path));
            if ($docroot_identity === null || $docroot_identity['type'] !== $expected_type) {
                $this->throw_unexpected_docroot_mutation('install', $path, $path, $expected_type, [$expected_type], $docroot_identity);
            }
            $commit_state['current_work_files_descendant'] = null;
            $this->write_json($this->commit_json_path, $commit_state);

            return;
        }

        $stack_size = count($commit_state['commit_cursor']);
        if ($stack_size === 0) {
            $parent_path = '';
            $work_directory_path = $this->work_files_directory;
        } else {
            $parent_path = $this->commit_cursor_path($commit_state['commit_cursor']);
            $work_directory_path = wp_join_unix_paths($this->work_files_directory, $parent_path);
        }
        $entry = $this->first_directory_entry($work_directory_path);
        if ($entry === null) {
            if ($stack_size === 0) {
                if ($commit_state['current_delete_path'] !== null || $commit_state['commit_cursor'] !== []) {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit reached completion with active bounded work state.');
                }
                if ( (int) $commit_state['work_deletes_byte_offset'] !== $this->file_size($this->work_deletes_path)) {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit reached completion before consuming the complete delete stream.');
                }
                if ($this->first_directory_entry($this->work_files_directory) !== null) {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit reached completion while work/files still contains pending values.');
                }
                $maintenance_docroot_path = $this->docroot_path('.maintenance');
                $maintenance_identity = $this->lstat_path($maintenance_docroot_path);
                if ($maintenance_identity !== null) {
                    if (!$this->maintenance_marker_is_owned($maintenance_docroot_path, $this->push_session_id)) {
                        throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'The push-session-owned maintenance marker was replaced by another owner.');
                    }
                    if (!@unlink($maintenance_docroot_path)) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove the push-session-owned WordPress maintenance marker.');
                    }
                }
                if ($this->lstat_path($this->maintenance_copy_path) !== null && !@unlink($this->maintenance_copy_path)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove the private maintenance ownership marker.');
                }
                $commit_state['phase'] = 'complete';
                $this->write_json($this->commit_json_path, $commit_state);
                $this->release_commit_state();
                return;
            }
            $this->require_docroot_ancestors($parent_path, 'install', 'directory');
            $docroot_identity = $this->lstat_path($this->docroot_path($parent_path));
            if ($docroot_identity === null || $docroot_identity['type'] !== 'directory') {
                $this->throw_unexpected_docroot_mutation('install', $parent_path, $parent_path, 'directory', ['directory'], $docroot_identity);
            }
            $commit_state['current_work_files_descendant'] = ['path_b64' => base64_encode($parent_path), 'expected_type' => 'directory'];
            $this->write_json($this->commit_json_path, $commit_state);
            if (!@rmdir($work_directory_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not consume empty work ancestor directory ' . base64_encode($parent_path) . '.');
            }
            $commit_state['current_work_files_descendant'] = null;
            array_pop($commit_state['commit_cursor']);
            $this->write_json($this->commit_json_path, $commit_state);
            return;
        }

        $path = wp_join_unix_paths($parent_path, $entry);
        $this->assert_path_not_reserved($path);
        $work_path = wp_join_unix_paths($this->work_files_directory, $path);
        $identity = $this->lstat_path($work_path);
        if ($identity === null) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Selected work path disappeared before installing_files: ' . base64_encode($path) . '.');
        }
        if ($identity['type'] === 'directory' && $this->first_directory_entry($work_path) !== null) {
            $this->assert_path_is_not_excluded($path);
            $commit_state['commit_cursor'][] = ['component_b64' => base64_encode($entry)];
            $this->write_json($this->commit_json_path, $commit_state);
            $requested_path = $this->first_work_files_descendant_path($work_path, $path);
            $parent_device = $this->require_docroot_ancestors($path, 'install', 'directory');
            $docroot_value_path = $this->docroot_path($path);
            $docroot_identity = $this->lstat_path($docroot_value_path);
            if ($docroot_identity === null) {
                if (!@mkdir($docroot_value_path, 0777) && !is_dir($docroot_value_path)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create document-root ancestor directory ' . base64_encode($path) . '.');
                }
                $docroot_identity = $this->lstat_path($docroot_value_path);
            }
            if ($docroot_identity === null || $docroot_identity['type'] !== 'directory') {
                $this->throw_unexpected_docroot_mutation('install', $requested_path, $path, 'directory', ['absent', 'directory'], $docroot_identity);
            }
            if ($docroot_identity['dev'] !== $parent_device || $docroot_identity['dev'] !== $this->work_device()) {
                $this->throw_same_device('install', $path, $this->work_device(), $docroot_identity['dev']);
            }
            return;
        }
        $this->assert_path_does_not_overlap_excluded_paths($path);
        if (!in_array($identity['type'], ['file', 'directory', 'symlink'], true)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Work path ' . base64_encode($path) . ' has unsupported type ' . $identity['type'] . '.');
        }
        $this->install_work_value($commit_state, $path, $identity['type'], false);
    }

    /**
     * Renames one completed work value into the document root.
     *
     * Before rename, the checkpoint records the exact path and expected type so
     * recovery can tell whether the work value still needs installing_files or
     * the document root already contains the committed value. Only same-filesystem
     * renames are allowed; copy fallback would break the direct-install model.
     *
     * An existing empty directory at a directory destination is accepted:
     * rename() replaces it atomically, so re-pushing after an interrupted
     * commit already created the directory succeeds instead of reporting the
     * commit's own leftover as drift. A non-empty directory still conflicts.
     *
     * @param array $commit_state {
     *     Commit checkpoint, mutated in place.
     *
     *     @type string $phase Current commit phase.
     *     @type int $work_deletes_byte_offset Confirmed delete-list cursor.
     *     @type string|null $current_delete_path Delete path currently being consumed.
     *     @type array|null $current_work_files_descendant Work value currently being installed,
     *                                                       with `path_b64` and `expected_type` keys.
     *     @type array $commit_cursor Path components for the bounded tree walk.
     *     @type array $non_recoverable_commit_failure Persisted failure reason, detail, and
     *                                                  context. Present only after a
     *                                                  non-recoverable failure.
     * }
     * @phpstan-param CommitState $commit_state
     * @param string $path Document-root-relative value path.
     * @param string $expected_type Work type expected at $path.
     * @param bool $recovering Whether current_work_files_descendant is already durable.
     */
    private function install_work_value(array &$commit_state, string $path, string $expected_type, bool $recovering): void {
        $work_path = wp_join_unix_paths($this->work_files_directory, $path);
        $work_identity = $this->lstat_path($work_path);
        if ($work_identity === null || $work_identity['type'] !== $expected_type) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Work ' . $expected_type . ' ' . base64_encode($path) . ' is not present for installing_files.');
        }
        $parent_device = $this->require_docroot_ancestors($path, 'install', $expected_type);
        $docroot_value_path = $this->docroot_path($path);
        $docroot_identity = $this->lstat_path($docroot_value_path);
        $expected_docroot_types = $expected_type === 'directory' ? ['absent', 'directory'] : ['absent', 'file', 'symlink'];
        $observed_type = $docroot_identity === null ? 'absent' : $docroot_identity['type'];
        if (!in_array($observed_type, $expected_docroot_types, true)) {
            $this->throw_unexpected_docroot_mutation('install', $path, $path, $expected_type, $expected_docroot_types, $docroot_identity);
        }
        if ($expected_type === 'directory' && $observed_type === 'directory' && $this->first_directory_entry($docroot_value_path) !== null) {
            $this->throw_unexpected_docroot_mutation('install', $path, $path, $expected_type, ['absent'], $docroot_identity);
        }
        if ($parent_device !== $work_identity['dev']) {
            $this->throw_same_device('install', $path, $work_identity['dev'], $parent_device);
        }
        if (!$recovering) {
            $commit_state['current_work_files_descendant'] = ['path_b64' => base64_encode($path), 'expected_type' => $expected_type];
            $this->write_json($this->commit_json_path, $commit_state);
        }
        error_clear_last();
        if (!@rename($work_path, $docroot_value_path)) {
            $last_error = error_get_last();
            $message = is_array($last_error) ? $last_error['message'] : '';
            $observed_docroot_identity = $this->lstat_path($docroot_value_path);
            if ($observed_docroot_identity !== null && $observed_docroot_identity['dev'] !== $work_identity['dev']) {
                $this->throw_same_device('install', $path, $work_identity['dev'], $observed_docroot_identity['dev']);
            }
            if (stripos($message, 'cross-device') !== false || stripos($message, 'exdev') !== false) {
                $this->throw_same_device('install', $path, $work_identity['dev'], $parent_device);
            }
            throw new Site_Export_Push_Exception(
                self::ERROR_FILESYSTEM,
                'Could not rename work ' . base64_encode($path) . ' directly into the document root'
                . ( $message === '' ? '.' : ': ' . $message )
            );
        }
        $commit_state['current_work_files_descendant'] = null;
        $this->write_json($this->commit_json_path, $commit_state);
    }


    /**
     * Validates existing document-root ancestors without following a symlink.
     *
     * @return int|null Device of the nearest real parent, or null when a
     *                  delete root is already absent below a missing parent.
     */
    private function require_docroot_ancestors(string $path, string $operation, ?string $work_identity_type = null): ?int {
        $root = $this->lstat_path($this->docroot);
        if ($root === null || $root['type'] !== 'directory') {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The document root is no longer a real directory.');
        }
        $work_device = $this->work_device();
        if ($root['dev'] !== $work_device) {
            $this->throw_same_device($operation, $path, $work_device, $root['dev']);
        }
        $device = $root['dev'];
        $absolute = $this->docroot;
        $relative = '';
        $segments = explode('/', $path);
        array_pop($segments);
        foreach ($segments as $segment) {
            $relative = wp_join_unix_paths($relative, $segment);
            $absolute = wp_join_unix_paths($absolute, $segment);
            $identity = $this->lstat_path($absolute);
            if ($identity === null) {
                if ($operation === 'delete') {
                    return null;
                }
                $this->throw_unexpected_docroot_mutation($operation, $path, $relative, $work_identity_type, ['directory'], null);
            }
            if ($identity['type'] !== 'directory') {
                $this->throw_unexpected_docroot_mutation($operation, $path, $relative, $work_identity_type, ['directory'], $identity);
            }
            if ($identity['dev'] !== $device) {
                $this->throw_same_device($operation, $relative, $work_device, $identity['dev']);
            }
            $device = $identity['dev'];
        }
        return $device;
    }

    /**
     * @param list<string> $expected_docroot_types Document-root identity types accepted at
     *                                          the conflicting path.
     * @param array|null $observed_identity {
     *     Observed document-root filesystem identity, or null when absent.
     *
     *     @type string $type  Path type.
     *     @type int    $dev   Device number.
     *     @type int    $ino   Inode number.
     *     @type int    $size  Size in bytes.
     *     @type int    $ctime Change time.
     * }
     * @phpstan-param array{type:string,dev:int,ino:int,size:int,ctime:int}|null $observed_identity
     */
    private function throw_unexpected_docroot_mutation(
        string $operation,
        string $path,
        string $conflict_path,
        ?string $work_identity_type,
        array $expected_docroot_types,
        ?array $observed_identity
    ): void {
        $detail = 'Refusing the operation because the observed document-root filesystem state is incompatible. The conflicting path was left untouched.';
        $context = [
            'operation' => $operation,
            'path_b64' => base64_encode($path),
            'conflict_path_b64' => base64_encode($conflict_path),
            'expected_docroot_types' => $expected_docroot_types,
            'observed_docroot_identity' => $observed_identity === null ? ['type' => 'absent'] : $observed_identity,
        ];
        if ($work_identity_type !== null) {
            $context['work_type'] = $work_identity_type;
        }
        throw new Site_Export_Push_Exception(self::ERROR_UNEXPECTED_DOCROOT_MUTATION, $detail, $context);
    }

    /**
     * Raises the non-recoverable same-filesystem violation used by push commit.
     *
     * Work commit intentionally has no copy fallback. Copying would turn a
     * bounded rename step into an unbounded transfer and could leave partially
     * copied document-root files after interruption, so any device mismatch becomes
     * a classified non-recoverable error.
     *
     * @param string $operation Receive, delete, or install operation being checked.
     * @param string $path Document-root-relative path associated with the mismatch.
     * @param int $work_device Device id of the private work filesystem.
     * @param int $docroot_device Device id observed in the document root.
     */
    private function throw_same_device(string $operation, string $path, int $work_device, int $docroot_device): void {
        $detail = 'The work value and document-root destination are on different filesystems. This push requires same-filesystem rename and has no copy fallback.';
        throw new Site_Export_Push_Exception(self::ERROR_SAME_DEVICE, $detail, [
            'operation' => $operation,
            'path_b64' => base64_encode($path),
            'work_device' => $work_device,
            'docroot_device' => $docroot_device,
        ]);
    }

    /**
     * Verifies that two concrete paths are on the same device.
     *
     * This is used when creating or opening a push session, where both paths must
     * already exist and lstat() can supply device ids directly. Later per-path
     * checks use the document-root ancestor walkers because the final destination may
     * not exist yet.
     *
     * @param string $work_path Existing private work path.
     * @param string $docroot_value_path Existing document-root path.
     * @param string $operation Operation name to report on failure.
     * @param string $relative_path Document-root-relative path to report on failure.
     */
    private function require_same_device(string $work_path, string $docroot_value_path, string $operation, string $relative_path): void {
        $work = $this->lstat_path($work_path);
        $docroot_identity = $this->lstat_path($docroot_value_path);
        if ($work === null || $docroot_identity === null) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not determine the work and document-root filesystem devices.');
        }
        if ($work['dev'] !== $docroot_identity['dev']) {
            $this->throw_same_device($operation, $relative_path, $work['dev'], $docroot_identity['dev']);
        }
    }

    /**
     * Returns the device id of the completed work tree root.
     *
     * All direct installs must remain on this device. Reading it from work/files
     * rather than cached constructor state keeps recovery honest if the private
     * push directory was moved or corrupted between requests.
     *
     * @return int Device id reported by lstat().
     */
    private function work_device(): int {
        $identity = $this->lstat_path($this->work_files_directory);
        if ($identity === null || $identity['type'] !== 'directory') {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'work/files is not a real work directory.');
        }
        return $identity['dev'];
    }

    /**
     * Reads an exact number of bytes from a stream or reports a precise short read.
     *
     * Delete replay validation and suffix inspection rely on exact byte counts.
     * Returning partial data would corrupt offset accounting, so short reads
     * are reported as filesystem errors naming the observed length.
     *
     * @param resource $handle Open stream positioned at the first byte to read.
     * @param int $bytes Number of bytes required.
     * @param string $description Human-readable stream description for errors.
     * @return string Bytes read from the stream.
     */
    private function read_exact($handle, int $bytes, string $description): string {
        $result = '';
        $result_bytes = 0;
        while ($result_bytes < $bytes) {
            $piece = fread($handle, $bytes - $result_bytes);
            if ($piece === false || $piece === '') {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read complete ' . $description . '; expected ' . $bytes . ' bytes and observed ' . $result_bytes . '.');
            }
            $result .= $piece;
            $result_bytes += strlen($piece);
        }
        return $result;
    }

    /**
     * Returns the first child name in a directory without following children.
     *
     * The method is used only to distinguish empty directories from ones with
     * descendants. It returns the raw directory entry name so callers can build
     * their own private or document-root path without allocating a full listing.
     *
     * @param string $directory Absolute directory path.
     * @return string|null First child name, or null when the directory is empty.
     */
    private function first_directory_entry(string $directory): ?string {
        $handle = @opendir($directory);
        if ($handle === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read directory ' . $directory . '.');
        }
        try {
            while (true) {
                $entry = readdir($handle);
                if ($entry === false) {
                    break;
                }
                if ($entry !== '.' && $entry !== '..') {
                    return $entry;
                }
            }
        } finally {
            closedir($handle);
        }
        return null;
    }

    /**
     * Returns a work leaf path below a work ancestor directory.
     *
     * When a document-root ancestor directory conflicts, reporting only the
     * ancestor can hide which work value required it. This walks to one
     * descendant so the error can name requested work rather than only the
     * commit-cursor directory.
     *
     * @param string $directory Absolute work directory being traversed.
     * @param string $relative_path Document-root-relative path for that directory.
     * @return string Document-root-relative descendant or the original path if empty.
     */
    private function first_work_files_descendant_path(string $directory, string $relative_path): string {
        $entry = $this->first_directory_entry($directory);
        if ($entry === null) {
            return $relative_path;
        }
        $child_path = wp_join_unix_paths($relative_path, $entry);
        $entry_path = wp_join_unix_paths($directory, $entry);
        $identity = $this->lstat_path($entry_path);
        if ($identity !== null && $identity['type'] === 'directory') {
            return $this->first_work_files_descendant_path($entry_path, $child_path);
        }
        return $child_path;
    }

    /**
     * Checks whether a document-root .maintenance file belongs to this push session ID.
     *
     * The marker may be a normal WordPress maintenance file created by another
     * process. Only files containing this push session's ownership comment are safe
     * to refresh or remove; foreign markers keep the document root busy.
     *
     * @param string $path Absolute document-root .maintenance path.
     * @param string $push_session_id Push session ID recorded in the marker.
     * @return bool Whether the marker contains this push session's ownership line.
     */
    private function maintenance_marker_is_owned(string $path, string $push_session_id): bool {
        $contents = @file_get_contents($path, false, null, 0, 512);
        return is_string($contents)
            && strpos($contents, '// reprint-push-session:' . $push_session_id . "\n") !== false;
    }

    /**
     * Releases this push session's document-root-wide commit claim if it still owns it.
     *
     * The active marker is advisory state excluded by the commit-state lock. A
     * missing marker or another session's valid claim is left untouched so cleanup
     * cannot erase document-root ownership which changed after this commit.
     */
    private function release_commit_state(): void {
        $this->with_commit_state_lock(function (): void {
            $active_owner = $this->read_commit_owner();
            if ($active_owner !== $this->push_session_id) {
                return;
            }
            if (!@unlink($this->commit_state_path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not release the commit-state owner.');
            }
        });
    }

    /**
     * Runs a callback while holding the document-root-wide commit-state lock.
     *
     * This lock serializes the small `commit-state` file shared by all push
     * sessions committing one reprint directory. It is intentionally separate from a
     * push lock so a committing push session can block other committers without
     * blocking their upload/status cleanup paths.
     *
     * @param callable $callback Critical section to execute while locked.
     */
    private function with_commit_state_lock(callable $callback): void {
        $lock = @fopen($this->commit_state_lock_path, 'c+b');
        if ($lock === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open the commit-state lock.');
        }
        try {
            if (!flock($lock, LOCK_EX | LOCK_NB)) {
                throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'The commit-state owner is busy. Retry the request.');
            }
            $callback();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * Reads the validated push session ID which owns the document-root commit.
     *
     * This method is called only while the commit-state lock is held. A missing
     * marker means no commit owns the document root. Existing state must be a
     * readable regular file containing one valid push session ID.
     */
    private function read_commit_owner(): ?string {
        $identity = $this->lstat_path($this->commit_state_path);
        if ($identity === null) {
            return null;
        }
        if ($identity['type'] !== 'file') {
            throw new Site_Export_Push_Exception(
                self::ERROR_CORRUPTED_PUSH_STATE,
                'Reprint cannot identify the active push commit because its commit-state marker is not a regular file.'
            );
        }
        $active_owner = @file_get_contents($this->commit_state_path);
        if (!is_string($active_owner)) {
            throw new Site_Export_Push_Exception(
                self::ERROR_FILESYSTEM,
                'Reprint could not read the active push commit from its commit-state marker.'
            );
        }
        $active_owner = trim($active_owner);
        try {
            self::require_push_session_id($active_owner);
        } catch (InvalidArgumentException $exception) {
            throw new Site_Export_Push_Exception(
                self::ERROR_CORRUPTED_PUSH_STATE,
                'Reprint cannot identify the active push commit because its commit-state marker is malformed.'
            );
        }
        return $active_owner;
    }

    /**
     * Runs one callback against a validated push session while holding its lock.
     *
     * The push-directory layout is checked by acquire_push_lock(). Immutable
     * push session ID and the same-filesystem requirement are then checked
     * before the callback can read or mutate push state.
     *
     * @return mixed Callback result.
     */
    private function with_push_lock(callable $callback) {
        $lock = $this->acquire_push_lock();
        try {
            $this->assert_push_configuration();
            return $callback();
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }

    /**
     * Locks one existing push session after checking only the paths needed to do so safely.
     *
     * The complete durable push directory is validated after the lock is held. This
     * avoids trusting a pre-lock snapshot while also rejecting an already
     * malformed push session or lock path before fopen() is called.
     *
     * @return resource Exclusive push lock owned by the caller.
     */
    private function acquire_push_lock() {
        $push_session_identity = $this->lstat_path($this->push_directory);
        if ($push_session_identity === null) {
            throw new Site_Export_Push_Exception(self::ERROR_PUSH_NOT_FOUND, 'The push session does not exist: ' . $this->push_session_id . '.');
        }
        if ($push_session_identity['type'] !== 'directory') {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The push session path is not a real directory: ' . $this->push_directory . '.');
        }
        $lock_identity = $this->lstat_path($this->push_lock_path);
        if ($lock_identity === null || $lock_identity['type'] !== 'file') {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'The push lock is missing or not regular: ' . $this->push_lock_path . '.');
        }

        $lock = @fopen($this->push_lock_path, 'r+b');
        if ($lock === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open the push lock.');
        }
        if (!flock($lock, LOCK_EX | LOCK_NB)) {
            fclose($lock);
            throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'Push session ' . $this->push_session_id . ' is busy. Retry the request.');
        }
        try {
            foreach ([$this->push_directory, $this->work_dir, $this->work_files_directory] as $directory) {
                $identity = $this->lstat_path($directory);
                if ($identity === null || $identity['type'] !== 'directory') {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Required push directory is missing or not real: ' . $directory . '.');
                }
            }
            foreach ([$this->push_json_path, $this->push_lock_path, $this->work_deletes_path] as $file) {
                $identity = $this->lstat_path($file);
                if ($identity === null || $identity['type'] !== 'file') {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Required push file is missing or not regular: ' . $file . '.');
                }
            }
            foreach ([$this->commit_json_path, $this->maintenance_copy_path, $this->work_inflight_path, $this->work_inflight_data_path] as $optional_file) {
                $identity = $this->lstat_path($optional_file);
                if ($identity !== null && $identity['type'] !== 'file') {
                    throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Optional push file has an unsupported type: ' . $optional_file . '.');
                }
            }
        } catch (Throwable $exception) {
            flock($lock, LOCK_UN);
            fclose($lock);
            throw $exception;
        }
        return $lock;
    }

    /**
     * Verifies that durable push session identity still matches this server configuration.
     *
     * Remove deliberately omits this check: private work may need cleanup
     * after the document-root or excluded-path configuration has changed.
     * Create, upload, status, and commit must agree with the immutable push metadata
     * and retain the same-device guarantee under which the push was made.
     */
    private function assert_push_configuration(): void {
        $push_metadata = $this->read_json($this->push_json_path);
        if (!is_array($push_metadata) || ( $push_metadata['push_session_id'] ?? null ) !== $this->push_session_id
            || !is_bool($push_metadata['work_deletes_complete'] ?? null)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata has an invalid push session ID or work-deletes completion state.');
        }
        if (!is_string($push_metadata['docroot_b64'] ?? null) || !is_array($push_metadata['excluded_paths_b64'] ?? null)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata does not contain the configured document root and excluded paths.');
        }
        $docroot = base64_decode($push_metadata['docroot_b64'], true);
        $excluded = [];
        foreach ($push_metadata['excluded_paths_b64'] as $encoded) {
            $decoded = is_string($encoded) ? base64_decode($encoded, true) : false;
            if (!is_string($decoded)) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata contains an invalid excluded path.');
            }
            $excluded[] = $decoded;
        }
        if ($docroot !== $this->docroot || $excluded !== $this->excluded_paths) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata does not match the current push configuration.');
        }
        $this->require_same_device($this->work_files_directory, $this->docroot, 'receive', '');
    }

    /**
     * Reads a bounded JSON object from private push metadata.
     *
     * Missing files return null so callers can distinguish optional checkpoints
     * from malformed ones. Existing files must be regular, within the metadata
     * size ceiling, and decode to a JSON object.
     *
     * @param string $path Absolute metadata file path.
     * @return array<string,mixed>|null Decoded caller-specific object, or null
     *                                  if absent.
     */
    private function read_json(string $path): ?array {
        $identity = $this->lstat_path($path);
        if ($identity === null) {
            return null;
        }
        if ($identity['type'] !== 'file' || $identity['size'] > self::MAX_METADATA_BYTES) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Metadata file ' . $path . ' is not a bounded regular file.');
        }
        $contents = @file_get_contents($path);
        if (!is_string($contents)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read metadata file ' . $path . '.');
        }
        $decoded = json_decode($contents, true);
        if (!is_array($decoded)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Metadata file ' . $path . ' does not contain a JSON object.');
        }
        return $decoded;
    }

    /**
     * Atomically writes one bounded JSON metadata object.
     *
     * JSON is encoded without slash escaping because metadata contains many
     * filesystem paths already excluded by base64 where necessary. The encoded
     * object must fit the same ceiling enforced by read_json().
     *
     * @param string $path Absolute metadata file path.
     * @param array $value {
     *     Push metadata, in-flight work, or a commit checkpoint.
     *
     *     @type string $push_session_id Push session ID. Present only in push metadata.
     *     @type string $docroot_b64 Base64-encoded document root. Present only in push metadata.
     *     @type string[] $excluded_paths_b64 Base64-encoded excluded paths. Present only in push metadata.
     *     @type bool $work_deletes_complete Delete-list completion. Present only in push metadata.
     *     @type string $phase In-flight or commit phase. Absent from push metadata.
     *     @type string $path_b64 In-flight work path. Present only in in-flight work.
     *     @type string $type In-flight work type. Present only in in-flight work.
     *     @type int $total_bytes Declared file size. Present only for an in-flight file.
     *     @type string $target_b64 Base64-encoded symlink target. Present only for an in-flight symlink.
     *     @type int $work_deletes_byte_offset Confirmed delete-list cursor. Present only in a commit checkpoint.
     *     @type string|null $current_delete_path Current delete path. Present only in a commit checkpoint.
     *     @type array|null $current_work_files_descendant Current installation. Present only in a commit checkpoint.
     *     @type array $commit_cursor Bounded tree cursor. Present only in a commit checkpoint.
     *     @type array $non_recoverable_commit_failure Persisted failure. Present only after a non-recoverable commit failure.
     * }
     * @phpstan-param array{push_session_id:string,docroot_b64:string,excluded_paths_b64:list<string>,work_deletes_complete:bool}|InFlightWork|CommitState $value
     */
    private function write_json(string $path, array $value): void {
        $contents = json_encode($value, JSON_UNESCAPED_SLASHES);
        if (!is_string($contents)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Could not encode bounded push metadata.');
        }
        if (strlen($contents) > self::MAX_METADATA_BYTES) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Encoded push metadata exceeds the maximum of ' . self::MAX_METADATA_BYTES . ' bytes.');
        }
        $this->write_atomic_file($path, $contents, 0600);
    }

    /**
     * Writes a private file through a push-session-specific temporary path and rename.
     *
     * The temporary name includes the push session ID so concurrent push sessions updating
     * shared control files do not collide before the commit-state lock serializes
     * the final rename. Permissions are applied to the temporary file before
     * that rename.
     *
     * @param string $path Absolute destination path.
     * @param string $contents Complete file contents to write.
     * @param int $permissions File mode applied to the temporary file.
     */
    private function write_atomic_file(string $path, string $contents, int $permissions): void {
        $temporary = $path . '.tmp-' . $this->push_session_id;
        if ($this->lstat_path($temporary) !== null && !@unlink($temporary)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not clear temporary metadata file ' . $temporary . '.');
        }
        $handle = @fopen($temporary, 'xb');
        if ($handle === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create temporary metadata file ' . $temporary . '.');
        }
        try {
            $this->write_all($handle, $contents, 'metadata file ' . $path);
            if (!fflush($handle)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not flush temporary metadata file ' . $temporary . '.');
            }
        } finally {
            fclose($handle);
        }
        @chmod($temporary, $permissions);
        if (!@rename($temporary, $path)) {
            @unlink($temporary);
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not replace metadata file ' . $path . '.');
        }
    }

    /**
     * Writes every byte of a string to an already opened stream.
     *
     * fwrite() may accept only part of a string. This loops until all bytes are
     * written and reports the exact completed count if the stream stops making
     * progress, preventing silent truncation of work payloads or metadata.
     *
     * @param resource $handle Writable stream.
     * @param string $contents Bytes to write.
     * @param string $description Human-readable destination for errors.
     */
    private function write_all($handle, string $contents, string $description): void {
        $offset = 0;
        $length = strlen($contents);
        while ($offset < $length) {
            $written = fwrite($handle, substr($contents, $offset));
            if (!is_int($written) || $written <= 0) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not finish writing ' . $description . '; wrote ' . $offset . ' of ' . $length . ' bytes.');
            }
            $offset += $written;
        }
    }

    /**
     * Decodes and validates a base64 path stored in a commit checkpoint.
     *
     * Checkpoints store arbitrary filesystem bytes as base64 to remain valid
     * JSON. This method rejects missing, malformed, or receiver-reserved path
     * forms. Its caller applies the requested-value or work-ancestor-directory
     * excluded-path policy before any document-root mutation.
     *
     * @param mixed $encoded Candidate base64 value from metadata.
     * @param string $description Field name used in error messages.
     * @return string Decoded document-root-relative path.
     */
    private function decode_commit_path($encoded, string $description): string {
        if (!is_string($encoded)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit ' . $description . ' path is not base64 text.');
        }
        $path = base64_decode($encoded, true);
        if (!is_string($path)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit ' . $description . ' path is not valid base64.');
        }
        $this->assert_path_not_reserved($path);
        return $path;
    }

    /**
     * Reconstructs the document-root-relative path from commit cursor frames.
     *
     * Each frame stores exactly one base64 path component. The method validates
     * each component independently, rebuilds the slash-separated path, and then
     * applies the implicit work-ancestor-directory path rules to the result.
     *
     * @param array $stack {
     *     Commit cursor frames.
     *
     *     @type string $component_b64 Base64-encoded path component.
     * }
     * @phpstan-param list<array{component_b64:string}> $stack
     * @return string Document-root-relative path for the current commit cursor directory.
     */
    private function commit_cursor_path(array $stack): string {
        $path = '';
        foreach ($stack as $frame) {
            $encoded = $frame['component_b64'] ?? null;
            $component = is_string($encoded) ? base64_decode($encoded, true) : false;
            if (!is_string($component) || $component === '' || strpos($component, '/') !== false) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit cursor frame does not contain one valid base64 path component.');
            }
            $path = wp_join_unix_paths($path, $component);
            if (strlen($path) > self::MAX_PATH_BYTES) {
                throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Commit cursor path exceeds the maximum of ' . self::MAX_PATH_BYTES . ' bytes.');
            }
        }
        if ($path !== '') {
            $this->assert_path_is_not_excluded($path);
        }
        return $path;
    }

    /**
     * Reads whether the sender explicitly closed the delete stream.
     *
     * A zero-byte or currently stored delete stream is not enough to commit:
     * the sender must declare completion so the receiver knows no later request
     * will append more delete records.
     *
     * @return bool True once a delete-list part declared completion.
     */
    private function work_deletes_are_complete(): bool {
        $push_metadata = $this->read_json($this->push_json_path);
        if (!is_array($push_metadata) || !is_bool($push_metadata['work_deletes_complete'] ?? null)) {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Push metadata has no valid work-deletes completion state.');
        }
        return $push_metadata['work_deletes_complete'];
    }

    /**
     * Rejects a requested value which would overlap an excluded path.
     *
     * Requested files, directories, symlinks, and delete roots may not equal,
     * descend from, or contain an excluded path. Work ancestor directories use
     * assert_path_is_not_excluded() because an unrelated sibling may still need
     * to traverse an ancestor of an excluded path.
     *
     * @param string $path Document-root-relative raw path bytes.
     */
    private function assert_path_does_not_overlap_excluded_paths(string $path): void {
        $this->assert_path_is_not_excluded($path);
        foreach ($this->excluded_paths as $excluded_path) {
            if (path_remainder_under($excluded_path, $path) !== null) {
                throw new InvalidArgumentException(
                    'Excluded document-root-relative path ' . base64_encode($excluded_path)
                    . ' is contained by the requested path, which cannot be changed: '
                    . base64_encode($path) . '.'
                );
            }
        }
    }

    /**
     * Rejects a path equal to or below an excluded path.
     *
     * A work ancestor directory is traversed only to reach requested descendant
     * work. It may be an ancestor of an excluded path when the work lies in an
     * unrelated sibling, but it must never equal or descend from an excluded
     * path itself.
     *
     * @param string $path Document-root-relative path.
     */
    private function assert_path_is_not_excluded(string $path): void {
        $this->assert_path_not_reserved($path);
        foreach ($this->excluded_paths as $excluded_path) {
            if ($path === $excluded_path) {
                throw new InvalidArgumentException(
                    'Excluded document-root-relative path cannot be changed: '
                    . base64_encode($path) . '.'
                );
            }
            if (path_remainder_under($path, $excluded_path) !== null) {
                throw new InvalidArgumentException(
                    'Excluded document-root-relative path ' . base64_encode($excluded_path)
                    . ' contains the requested descendant, which cannot be changed: '
                    . base64_encode($path) . '.'
                );
            }
        }
    }

    /**
     * Rejects path forms reserved by the receiver.
     *
     * Paths are arbitrary byte strings carried as base64 on the wire, but the
     * receiver reserves forms which are empty, exceed the bounded path length,
     * are absolute, contain NUL or backslash bytes, contain empty or dot path
     * components, or address the WordPress maintenance marker.
     *
     * @param string $path Document-root-relative raw path bytes.
     */
    private function assert_path_not_reserved(string $path): void {
        $path_bytes = strlen($path);
        if ($path_bytes > self::MAX_PATH_BYTES) {
            throw new InvalidArgumentException(
                'Document-root-relative path exceeds the maximum of '
                . self::MAX_PATH_BYTES . ' bytes; observed ' . $path_bytes . '.'
            );
        }
        assert_valid_relative_path($path, 'Document-root-relative path');
        if (path_is_same_as_or_descendant_of($path, '.maintenance')) {
            throw new InvalidArgumentException('The WordPress maintenance marker path is reserved: ' . base64_encode($path) . '.');
        }
    }

    /**
     * Decodes a base64 path header from one multipart part.
     *
     * Document-root paths are validated immediately because they select private and
     * document-root filesystem locations. Symlink destination values can be arbitrary
     * relative strings, so callers can disable document-root-path validation and enforce
     * their own symlink-target rules instead.
     *
     * @param array<string,string> $headers Normalized part headers keyed by lowercase header name.
     * @param string $header Header name to read.
     * @param bool $is_docroot_path Whether to validate a document-root path.
     * @return string Decoded header bytes.
     */
    private function decode_path_header(array $headers, string $header, bool $is_docroot_path = true): string {
        $encoded = $headers[$header] ?? null;
        if (!is_string($encoded) || $encoded === '') {
            throw new InvalidArgumentException('Multipart part requires a non-empty ' . $header . ' header.');
        }
        $decoded = base64_decode($encoded, true);
        if (!is_string($decoded)) {
            throw new InvalidArgumentException('Multipart header ' . $header . ' is not valid base64.');
        }
        if ($is_docroot_path) {
            $this->assert_path_does_not_overlap_excluded_paths($decoded);
        }
        return $decoded;
    }

    /**
     * Rejects unexpected headers for a multipart part type.
     *
     * The push protocol is deliberately narrow. Extra headers are not
     * ignored because a misspelled required header or a future unsupported
     * option should fail at the boundary instead of silently changing meaning.
     *
     * @param array<string,string> $headers Normalized headers to inspect, keyed
     *                                      by lowercase header name.
     * @param list<string> $allowed Lowercase header names allowed for this part.
     * @param string $type Human-readable part type for errors.
     */
    private function require_only_headers(array $headers, array $allowed, string $type): void {
        foreach (array_keys($headers) as $name) {
            if (!in_array($name, $allowed, true)) {
                throw new InvalidArgumentException('Multipart ' . $type . ' part does not allow header ' . json_encode($name) . '.');
            }
        }
    }

    /**
     * Reads a non-negative decimal integer header.
     *
     * Header values arrive as strings. This validates the decimal grammar and
     * rejects values that overflow PHP's integer range rather than silently
     * wrapping offsets, sizes, or Content-Length values.
     *
     * @param array<string,string> $headers Normalized headers to inspect, keyed
     *                                      by lowercase header name.
     * @param string $header Header name to read.
     * @return int Parsed non-negative integer.
     */
    private function require_non_negative_header(array $headers, string $header): int {
        $value = $headers[$header] ?? null;
        if (!is_string($value) || $value === '' || preg_match('/^[0-9]+$/D', $value) !== 1) {
            throw new InvalidArgumentException('Multipart header ' . $header . ' must be a non-negative decimal integer; observed ' . json_encode($value) . '.');
        }
        $integer = (int) $value;
        if ($integer < 0 || ( (string) $integer !== ltrim($value, '0') && !preg_match('/^0+$/D', $value) )) {
            throw new InvalidArgumentException('Multipart header ' . $header . ' exceeds the supported integer range; observed ' . json_encode($value) . '.');
        }
        return $integer;
    }

    /**
     * Joins the document root with one document-root-relative path.
     *
     * The caller applies the appropriate requested-value or work-ancestor-path
     * validation where the value originates. This method only preserves correct
     * slash handling for both `/` and normal directory roots.
     *
     * @param string $relative_path Document-root-relative path.
     * @return string Absolute path in the document root.
     */
    private function docroot_path(string $relative_path): string {
        return wp_join_unix_paths($this->docroot, $relative_path);
    }

    /**
     * Creates or validates private work ancestor directories for a work path.
     *
     * Only work/files paths are accepted. Missing parents are
     * created when requested; existing parents must be real directories so a
     * work leaf, link, or external path cannot become a container for another
     * value.
     *
     * @param string $path Absolute private path whose parent is required.
     * @param bool $create_missing Whether absent parent directories are created.
     */
    private function ensure_private_parent(string $path, bool $create_missing = true): void {
        $parent = dirname($path);
        $relative = relative_path_under($parent, $this->work_files_directory);
        if ($relative === null) {
            throw new LogicException('Private work path escaped work/files.');
        }
        if ($relative === '') {
            return;
        }
        $current = $this->work_files_directory;
        foreach (explode('/', $relative) as $segment) {
            $current = wp_join_unix_paths($current, $segment);
            $identity = $this->lstat_path($current);
            if ($identity === null) {
                if (!$create_missing) {
                    return;
                }
                if (!@mkdir($current, 0700)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create private work ancestor directory ' . $current . '.');
                }
                continue;
            }
            if ($identity['type'] !== 'directory') {
                throw new InvalidArgumentException('A work ' . $identity['type'] . ' cannot be used as the parent of another path.');
            }
        }
    }

    /**
     * Returns the lstat identity of one filesystem path.
     *
     * lstat() is used deliberately so symlinks are classified as symlinks
     * rather than followed. Keeping the syscall and mode classification here
     * gives status, recovery, and drift reporting the same view of a path.
     *
     * @param string $path Absolute path to inspect.
     * @return array|null {
     *     Filesystem identity, or null if absent.
     *
     *     @type string $type  Path type.
     *     @type int    $dev   Device number.
     *     @type int    $ino   Inode number.
     *     @type int    $size  Size in bytes.
     *     @type int    $ctime Change time.
     * }
     * @phpstan-return array{type:string,dev:int,ino:int,size:int,ctime:int}|null
     */
    private function lstat_path(string $path): ?array {
        clearstatcache(true, $path);
        $stat = @lstat($path);
        if (!is_array($stat)) {
            return null;
        }
        $type_bits = ( (int) ( $stat['mode'] ?? 0 ) ) & 0170000;
        if ($type_bits === 0100000) {
            $type = 'file';
        } elseif ($type_bits === 0040000) {
            $type = 'directory';
        } elseif ($type_bits === 0120000) {
            $type = 'symlink';
        } else {
            $type = 'other';
        }
        return [
            'type' => $type,
            'dev' => (int) ( $stat['dev'] ?? 0 ),
            'ino' => (int) ( $stat['ino'] ?? 0 ),
            'size' => (int) ( $stat['size'] ?? 0 ),
            'ctime' => (int) ( $stat['ctime'] ?? 0 ),
        ];
    }

    /**
     * Removes one work private leaf or empty directory.
     *
     * A directory with descendants is a work ancestor directory for other paths
     * and cannot be replaced by a different logical value. Files, symlinks, and
     * other leaf-like entries are unlinked without following them.
     *
     * @param string $path Absolute private work path.
     */
    private function remove_work_path(string $path): void {
        $identity = $this->lstat_path($path);
        if ($identity === null) {
            return;
        }
        if ($identity['type'] === 'directory') {
            if ($this->first_directory_entry($path) !== null) {
                throw new InvalidArgumentException('A work directory with descendants cannot be replaced by another logical value.');
            }
            if (!@rmdir($path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove an empty private work directory.');
            }
            return;
        }
        if (!@unlink($path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove a private work ' . $identity['type'] . '.');
        }
    }

    /**
     * Returns the current size of a required regular file.
     *
     * The size is read through lstat_path() so the path is lstat() checked
     * and symlinks are not followed. Missing files or non-files indicate corrupt
     * push state.
     *
     * @param string $path Absolute file path.
     * @return int Current byte size.
     */
    private function file_size(string $path): int {
        $identity = $this->lstat_path($path);
        if ($identity === null || $identity['type'] !== 'file') {
            throw new Site_Export_Push_Exception(self::ERROR_CORRUPTED_PUSH_STATE, 'Expected a regular file at ' . $path . '.');
        }
        return $identity['size'];
    }

    /**
     * Creates or validates the directory shared by every push session.
     *
     * Create and remove both establish this directory before acquiring their
     * shared lock. This lets an idempotent remove coordinate with a create even
     * when no push session or tombstone currently exists.
     *
     * @param string $reprint_directory Canonical private reprint directory.
     * @return string Canonical push sessions directory.
     */
    private static function create_push_sessions_directory(string $reprint_directory): string {
        $push_sessions_directory = wp_join_unix_paths($reprint_directory, '.reprint', 'push');
        if (!@mkdir($push_sessions_directory, 0700, true) && !is_dir($push_sessions_directory)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create push sessions directory ' . $push_sessions_directory . '.');
        }
        return self::require_directory($push_sessions_directory, 'push sessions', false);
    }

    /**
     * Acquires the cross-session lock for one create or bounded remove call.
     *
     * The lock covers creation and every bounded removal step so create cannot
     * race a live-directory rename or an unfinished removal tombstone.
     *
     * @param string $push_sessions_directory Canonical push sessions directory.
     * @param string $operation Current `create` or `remove` operation.
     * @return resource Exclusively locked create/remove handle.
     */
    private static function acquire_create_remove_lock(string $push_sessions_directory, string $operation) {
        $create_remove_lock = @fopen(wp_join_unix_paths($push_sessions_directory, 'create-remove.lock'), 'c+b');
        if ($create_remove_lock === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open create-remove.lock for the ' . $operation . ' request.');
        }
        if (!flock($create_remove_lock, LOCK_EX | LOCK_NB)) {
            fclose($create_remove_lock);
            throw new Site_Export_Push_Exception(
                self::ERROR_LOCK_ACQUISITION_FAILURE,
                'Another create or remove request holds create-remove.lock. Retry the ' . $operation . ' request.'
            );
        }
        return $create_remove_lock;
    }

    /**
     * Advances bounded cleanup of a renamed remove tombstone.
     *
     * Remove first renames a push session so it is no longer addressable by its
     * public ID. This method then removes at most REMOVE_ENTRY_LIMIT entries
     * while holding the tombstone's own lock. Commit ownership is released from
     * this resumable side of the rename before any push state is deleted.
     *
     * @param string $tombstone Absolute tombstone directory path.
     * @return bool True when the tombstone is gone, false when work remains.
     */
    private function remove_tombstone(string $tombstone): bool {
        if (!is_dir($tombstone)) {
            return true;
        }
        $push_lock_path = wp_join_unix_paths($tombstone, 'push.lock');
        $lock = @fopen($push_lock_path, 'r+b');
        if ($lock === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not open the push removal tombstone lock.');
        }
        try {
            if (!flock($lock, LOCK_EX | LOCK_NB)) {
                throw new Site_Export_Push_Exception(self::ERROR_LOCK_ACQUISITION_FAILURE, 'Push removal cleanup is busy. Retry remove.');
            }
            // The push directory rename is durable before commit ownership is released.
            // Retry that release while the tombstone still preserves push state.
            $this->release_commit_state();
            $remaining_entries = self::REMOVE_ENTRY_LIMIT;
            $empty = self::remove_directory_entries($tombstone, $remaining_entries, true);
            if (!$empty) {
                return false;
            }
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
        if (!@unlink($push_lock_path) || !@rmdir($tombstone)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove the completed push removal tombstone.');
        }
        return true;
    }

    /**
     * Returns one configured directory as a canonical real path.
     *
     * A newly created reprint directory uses mode 0700 deliberately. PHP's default
     * 0777 mode, even after a typical umask, can expose work site contents to
     * other system accounts. Existing configured directories keep their mode.
     *
     * @param string $path Absolute directory path from configuration.
     * @param string $description Human-readable name for validation errors.
     * @param bool $create Whether the directory may be created if missing.
     * @return string Canonical absolute directory path without trailing slash.
     */
    private static function require_directory(string $path, string $description, bool $create): string {
        if ($path === '' || $path[0] !== '/') {
            throw new InvalidArgumentException('The ' . $description . ' must be an absolute directory; observed ' . json_encode($path) . '.');
        }
        if ($create && !is_dir($path) && !@mkdir($path, 0700, true) && !is_dir($path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not create ' . $description . ' directory ' . $path . '.');
        }
        $real_path = realpath($path);
        if ($real_path === false || !is_dir($real_path) || is_link($path)) {
            throw new InvalidArgumentException('The ' . $description . ' is not a real directory: ' . $path . '.');
        }
        return trim_right_slash($real_path);
    }

    /**
     * Validates the public push session ID grammar.
     *
     * Push session IDs are used in URLs, directory names, lock files, and ownership
     * comments. Restricting them to lowercase hexadecimal keeps those contexts
     * unambiguous and avoids any path normalization concerns.
     *
     * @param string $push_session_id Caller-provided push session ID.
     */
    private static function require_push_session_id(string $push_session_id): void {
        if (preg_match('/^[a-f0-9]{32}$/D', $push_session_id) !== 1) {
            throw new InvalidArgumentException('Push session ID must be a 32-character lowercase hexadecimal string.');
        }
    }

    /**
     * Removes a bounded number of entries from a remove directory tree.
     *
     * The counter is shared through recursive calls so one remove request has a
     * hard work limit no matter how deeply nested the tombstone is. The top
     * level may preserve its lock file until all other entries are gone.
     *
     * @param string $directory_path Absolute directory currently being drained.
     * @param int $remaining_entries Remaining unlink/rmdir operations allowed.
     * @param bool $preserve_lock Whether to keep a child named `lock`.
     * @return bool True when this directory is empty enough to remove.
     */
    private static function remove_directory_entries(string $directory_path, int &$remaining_entries, bool $preserve_lock = false): bool {
        $handle = @opendir($directory_path);
        if ($handle === false) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read push removal directory: ' . $directory_path . '.');
        }
        try {
            while (true) {
                $entry = readdir($handle);
                if ($entry === false) {
                    break;
                }
                if ($entry === '.' || $entry === '..' || ( $preserve_lock && $entry === 'push.lock' )) {
                    continue;
                }
                if ($remaining_entries === 0) {
                    return false;
                }
                $entry_path = wp_join_unix_paths($directory_path, $entry);
                clearstatcache(true, $entry_path);
                $stat = @lstat($entry_path);
                if (!is_array($stat)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Work commit remove entry disappeared during cleanup: ' . $entry_path . '.');
                }
                $type = ( (int) ( $stat['mode'] ?? 0 ) ) & 0170000;
                if ($type === 0040000) {
                    if (!self::remove_directory_entries($entry_path, $remaining_entries)) {
                        return false;
                    }
                    if ($remaining_entries === 0) {
                        return false;
                    }
                    if (!@rmdir($entry_path)) {
                        throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove push removal directory: ' . $entry_path . '.');
                    }
                } elseif (!@unlink($entry_path)) {
                    throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove push removal entry: ' . $entry_path . '.');
                }
                --$remaining_entries;
            }
        } finally {
            closedir($handle);
        }
        return true;
    }

    /**
     * Recursively removes a newly created private tree after setup failure.
     *
     * This is used only before a push session becomes usable, when cleanup should be
     * immediate rather than bounded by remove semantics. It uses lstat() and
     * unlink/rmdir so symlinks are removed as links and never traversed.
     *
     * @param string $path Absolute private path to remove if it exists.
     */
    private static function remove_tree(string $path): void {
        clearstatcache(true, $path);
        $stat = @lstat($path);
        if (!is_array($stat)) {
            return;
        }
        $type = ( (int) ( $stat['mode'] ?? 0 ) ) & 0170000;
        if ($type === 0040000) {
            $handle = @opendir($path);
            if ($handle === false) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not read push directory for removal: ' . $path . '.');
            }
            try {
                while (true) {
                    $entry = readdir($handle);
                    if ($entry === false) {
                        break;
                    }
                    if ($entry !== '.' && $entry !== '..') {
                        self::remove_tree(wp_join_unix_paths($path, $entry));
                    }
                }
            } finally {
                closedir($handle);
            }
            if (!@rmdir($path)) {
                throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove push directory ' . $path . '.');
            }
            return;
        }
        if (!@unlink($path)) {
            throw new Site_Export_Push_Exception(self::ERROR_FILESYSTEM, 'Could not remove push entry ' . $path . '.');
        }
    }
}
