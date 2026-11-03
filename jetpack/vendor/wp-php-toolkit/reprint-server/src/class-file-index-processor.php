<?php

namespace WordPress\Reprint\Server;

use InvalidArgumentException;
use LogicException;
use RuntimeException;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Traversal failures become API or CLI values, never HTML output.

/**
 * Walks filesystem paths for the file index one resumable step at a time.
 *
 * The processor owns directory traversal and path inspection. Callers own
 * what happens to the resulting index entries: the HTTP endpoint batches and
 * encodes them, while local push indexing will write them to its JSONL file.
 *
 * A cursor contains the active directory stack and the last settled name in
 * each directory. Reopening from that cursor rescans only the active
 * directories and continues after those names. Directory names remain sorted
 * exactly as they were in endpoint_file_index() before this extraction.
 *
 * One step either produces zero or more index entries for one filesystem path,
 * skips one path, reports one directory failure, or finishes one directory.
 * Following a symlink may produce additional intermediate-symlink entries in
 * the same step because they share the path's cursor boundary.
 *
 * Directory names are still read with scandir(). This deliberately preserves
 * the endpoint's established ordering and cursor behavior. It also means one
 * unusually wide directory is held in memory; changing that requires a
 * separate traversal design rather than hiding it inside this extraction.
 *
 * @phpstan-type FileIndexRoot (
 *     array{requested_path:string,resolved_path:string,type:'directory'|'file'|'symlink'}
 *     | array{requested_path:string,resolved_path:null,type:'missing'}
 * )
 */
final class FileIndexProcessor {

    const STATUS_INDEXED = "indexed";
    const STATUS_SKIPPED = "skipped";
    const STATUS_PATH_UNAVAILABLE = "path_unavailable";
    const STATUS_DIRECTORY_COMPLETE = "directory_complete";
    const STATUS_DIRECTORY_ERROR = "directory_error";

    const STAT_TYPE_MASK = 0170000;
    const STAT_TYPE_LINK = 0120000;
    const STAT_TYPE_FILE = 0100000;
    const STAT_TYPE_DIR = 0040000;

    /** @var array[] Configured file-index roots, in requested order. */
    private $roots;

    /** @var string[] Canonical directories selected by the request. */
    private $configured_directories;

    /** @var bool Whether directory symlinks may lead outside the allowed directories. */
    private $follow_symlinks;

    /** @var string Canonical Reprint storage path omitted from the index, or an empty string. */
    private $storage_path;

    /** @var array[] Active directory stack, from scheduled roots to the current directory. */
    private $directory_stack;

    /** @var string Directory reported as X-Index-Dir for this traversal. */
    private $index_directory;

    /** @var array[] Intermediate symlinks emitted before a new traversal begins. */
    private $initial_index_entries;

    /** @var string[] Requested named roots still to index, one per step. */
    private $pending_named_roots = [];

    /** @var string[]|null Sorted names in the current directory. */
    private $current_directory_names = null;

    /** @var int Position of the next name in $current_directory_names. */
    private $current_directory_position = 0;

    /** @var string|null Current directory used for endpoint exception reporting. */
    private $current_directory = null;

    /** @var string|null Result of the most recent step. */
    private $step_status = null;

    /** @var array[] Entries produced by the most recent indexed step. */
    private $index_entries = [];

    /** @var array|null Directory failure produced by the most recent step. */
    private $directory_error = null;

    /**
     * Restricts traversal to shared code and the selected site's uploads.
     * For site 7, skip uploads/sites/8 before opening it. Null leaves the
     * ordinary single-site traversal rules in place.
     *
     * @var MultisiteFileSelection|null
     */
    private $multisite_selection;

    /** @var bool Whether close() has been called. */
    private $closed = false;

    /**
     * Starts a traversal at the requested root. A configured start also
     * schedules the other configured roots.
     *
     * @param FileIndexRoot[] $roots       Structured roots scheduled for this index.
     * @param FileIndexRoot   $start_root  Root scheduled first. It may be an
     *                                      external directory reached by a followed link.
     * @param bool            $follow_symlinks Whether directory symlinks may lead outside the allowed directories.
     * @param string          $storage_path Reprint storage path omitted from the index, or an empty string.
     * @param MultisiteFileSelection|null $multisite_selection Shared code and selected uploads allowed by the source WordPress site; null for single-site sources.
     * @return self New file-index processor.
     */
    public static function start(
        array $roots,
        array $start_root,
        bool $follow_symlinks,
        string $storage_path,
        ?MultisiteFileSelection $multisite_selection = null
    ): self {
        $roots = self::validate_roots($roots);
        if ($multisite_selection !== null) {
            foreach ($roots as $root) {
                $multisite_selection->assert_path_allowed($root['requested_path']);
            }
        }
        $start_root = self::validate_root($start_root);
        if ($multisite_selection !== null) {
            $multisite_selection->assert_path_allowed($start_root['requested_path']);
        }
        $start_root_is_configured = false;
        foreach ($roots as $root) {
            if ($root["requested_path"] === $start_root["requested_path"]) {
                $start_root_is_configured = true;
                break;
            }
        }
        if (!$start_root_is_configured && $start_root["type"] !== "directory") {
            throw new InvalidArgumentException(
                "File-index start root must be a configured root or a directory: {$start_root["requested_path"]}"
            );
        }

        $configured_directories = self::resolved_directory_roots($roots, $follow_symlinks);

        // The initial request starts at a configured root and visits every
        // configured root. A request which follows an external directory
        // symlink must visit only that target, or each link would also repeat
        // the complete configured traversal.
        $ordered_roots = [$start_root];
        if ($start_root_is_configured) {
            $extra_roots = [];
            foreach ($roots as $root) {
                if ($root["requested_path"] !== $start_root["requested_path"]) {
                    $extra_roots[] = $root;
                }
            }
            // Stable ordering makes a cursor independent of the order in
            // which configuration discovered the additional roots.
            usort($extra_roots, static function (array $left, array $right): int {
                return strcmp($left["requested_path"], $right["requested_path"]);
            });
            $ordered_roots = array_merge($ordered_roots, $extra_roots);
        }

        // A selected directory symlink has two responsibilities: emit its
        // requested link entry and traverse its resolved target. Keep the
        // two work lists separate so each follows its own coordinate.
        $traversal_directories = self::resolved_directory_roots($ordered_roots, $follow_symlinks);
        $pending_named_roots = [];
        foreach ($ordered_roots as $root) {
            if ($root["type"] !== "directory") {
                $pending_named_roots[] = $root["requested_path"];
            }
        }

        // The last stack element is visited next, so reverse the desired order
        // while constructing the depth-first traversal stack.
        $directory_stack = [];
        for ($i = count($traversal_directories) - 1; $i >= 0; $i--) {
            $directory_stack[] = [
                "dir" => $traversal_directories[$i],
                "after" => null,
            ];
        }

        // Keep parent-link discovery as the first traversal event. This
        // preserves the endpoint's established ordering: any link entries
        // found here must precede ordinary directory entries.
        $initial_index_entries = [];
        if ($follow_symlinks) {
            foreach ($ordered_roots as $root) {
                if ($root["type"] === "directory") {
                    $initial_index_entries = array_merge(
                        $initial_index_entries,
                        self::find_parent_symlinks($root["requested_path"])
                    );
                }
            }
        }

        // X-Index-Dir names a directory, so a named path reports its parent.
        $reported_index_directory = $start_root["type"] === "directory"
            ? $start_root["resolved_path"]
            : dirname($start_root["requested_path"]);

        return new self(
            $roots,
            $configured_directories,
            $follow_symlinks,
            $storage_path,
            $directory_stack,
            $reported_index_directory,
            $initial_index_entries,
            $pending_named_roots,
            $multisite_selection
        );
    }

    /**
     * Resumes traversal from a cursor returned by get_cursor().
     *
     * @param FileIndexRoot[] $roots   Structured roots scheduled for this index.
     * @param string          $cursor_json JSON cursor returned by the preceding request.
     * @param bool            $follow_symlinks Whether directory symlinks may lead outside the allowed directories.
     * @param string          $storage_path Reprint storage path omitted from the index, or an empty string.
     * @param MultisiteFileSelection|null $multisite_selection Current source selection, which must match the cursor's site and paths.
     * @return self Resumed file-index processor.
     */
    public static function resume(
        array $roots,
        string $cursor_json,
        bool $follow_symlinks,
        string $storage_path,
        ?MultisiteFileSelection $multisite_selection = null
    ): self {
        $roots = self::validate_roots($roots);
        if ($multisite_selection !== null) {
            foreach ($roots as $root) {
                $multisite_selection->assert_path_allowed($root['requested_path']);
            }
        }
        $configured_directories = self::resolved_directory_roots($roots, $follow_symlinks);

        // A cursor is caller-held continuation state. Reject malformed JSON or
        // a missing stack before any filesystem work begins.
        $cursor = json_decode($cursor_json, true);
        if (!is_array($cursor)) {
            throw new InvalidArgumentException("Invalid index cursor format");
        }
        $selection_identity = $multisite_selection === null ? null : $multisite_selection->get_identity();
        if (( $cursor['multisite_selection'] ?? null ) !== $selection_identity) {
            throw new InvalidArgumentException('Cannot resume file index: multisite selection changed.');
        }
        if (!isset($cursor["stack"]) || !is_array($cursor["stack"])) {
            throw new InvalidArgumentException("Index cursor missing stack");
        }

        // Paths are base64 text because filesystem names are arbitrary bytes
        // while JSON strings must be valid UTF-8. Decode each frame back into
        // the in-memory stack used by traversal.
        $directory_stack = [];
        foreach ($cursor["stack"] as $frame) {
            if (!is_array($frame)) {
                throw new InvalidArgumentException("Invalid index cursor frame");
            }
            $encoded_directory = isset($frame["dir"]) ? $frame["dir"] : null;
            if (!is_string($encoded_directory) || $encoded_directory === "") {
                throw new InvalidArgumentException("Index cursor frame missing dir");
            }
            $directory = base64_decode($encoded_directory, true);
            if ($directory === false || $directory === "") {
                throw new InvalidArgumentException("Index cursor frame has invalid dir encoding");
            }

            $encoded_after = array_key_exists("after", $frame) ? $frame["after"] : null;
            if ($encoded_after !== null && !is_string($encoded_after)) {
                throw new InvalidArgumentException("Index cursor frame invalid after");
            }
            $after = null;
            if ($encoded_after !== null) {
                $after = base64_decode($encoded_after, true);
                if ($after === false) {
                    throw new InvalidArgumentException("Index cursor frame has invalid after encoding");
                }
            }

            $directory_stack[] = [
                "dir" => $directory,
                "after" => $after,
            ];
        }

        // Absent from cursors written before this field existed.
        $pending_named_roots = [];
        $encoded_path_roots = isset($cursor["paths"]) ? $cursor["paths"] : [];
        if (!is_array($encoded_path_roots)) {
            throw new InvalidArgumentException("Index cursor paths must be an array");
        }
        foreach ($encoded_path_roots as $encoded_path_root) {
            if (!is_string($encoded_path_root) || $encoded_path_root === "") {
                throw new InvalidArgumentException("Index cursor path entry must be a non-empty string");
            }
            $path_root = base64_decode($encoded_path_root, true);
            if ($path_root === false || $path_root === "") {
                throw new InvalidArgumentException("Index cursor path entry has invalid encoding");
            }
            $pending_named_roots[] = $path_root;
        }

        // During continuation, the active directory is the best description
        // of what this request is indexing. A completed cursor has no active
        // directory, so it falls back to the first configured root.
        $index_directory = !empty($directory_stack)
            ? $directory_stack[count($directory_stack) - 1]["dir"]
            : ( isset($configured_directories[0]) ? $configured_directories[0] : "/" );

        return new self(
            $roots,
            $configured_directories,
            $follow_symlinks,
            $storage_path,
            $directory_stack,
            $index_directory,
            [],
            $pending_named_roots,
            $multisite_selection
        );
    }

    /**
     * Performs one traversal step.
     *
     * @return bool Whether a current step is available. False means traversal is complete.
     */
    public function next_index_step(): bool
    {
        // A closed processor has discarded its retained directory names and
        // cannot safely take another step.
        if ($this->closed) {
            throw new LogicException("Cannot take a file-index step after close().");
        }

        // Step accessors describe only the current call. Clear the preceding
        // result before deciding which traversal event comes next.
        $this->step_status = null;
        $this->index_entries = [];
        $this->directory_error = null;

        // Emit the parent links discovered during start() before descendants.
        // They share one cursor boundary because traversal has not begun yet.
        if (!empty($this->initial_index_entries)) {
            $this->step_status = self::STATUS_INDEXED;
            $this->index_entries = $this->initial_index_entries;
            $this->initial_index_entries = [];
            return true;
        }

        // Index one selected named root before walking directories. This keeps
        // each step bounded and makes its cursor boundary unambiguous.
        if (!empty($this->pending_named_roots)) {
            $this->index_next_named_root();
            // An unreadable Windows link must remain pending when inspection throws.
            array_shift($this->pending_named_roots);
            return true;
        }

        // Load the directory at the top of the stack only when no sorted name
        // list is retained. A directory failure is itself a step; an empty
        // stack means traversal has no further event.
        if ($this->current_directory_names === null) {
            if (!$this->open_current_directory()) {
                return $this->step_status !== null;
            }
        }

        // Finishing a directory is observable so callers may stop at this
        // exact cursor before the processor returns to its parent directory.
        if ($this->current_directory_position >= count($this->current_directory_names)) {
            $this->step_status = self::STATUS_DIRECTORY_COMPLETE;
            // Emit empty directories here, including a selected root which
            // has no parent entry in this traversal. Root exclusions still
            // apply even though there were no child names to check.
            if (
                $this->current_directory_names === []
                && !self::path_has_default_skipped_component($this->current_directory)
                && ( $this->storage_path === "" || !Utils::path_is_same_as_or_descendant_of($this->current_directory, $this->storage_path) )
            ) {
                clearstatcache(true, $this->current_directory);
                $stat = @Utils::source_lstat($this->current_directory);
                if ($stat !== false) {
                    $this->index_entries = self::index_entries_for_path($this->current_directory, $stat, false)["entries"];
                    $this->step_status = self::STATUS_INDEXED;
                }
            }
            array_pop($this->directory_stack);
            $this->forget_current_directory_names();
            return true;
        }

        // Select exactly one name for this step. Move the cursor first so every
        // omission or disappearance settles the name. An uninspectable UNC
        // entry below rolls this cursor back instead of claiming disappearance.
        $frame_index = count($this->directory_stack) - 1;
        $entry_name = $this->current_directory_names[$this->current_directory_position];
        ++$this->current_directory_position;
        // Set "after" before any skip or stat call. The cursor must move past
        // a cache path or a path that disappears between scandir() and lstat(),
        // or every resumed request would inspect that same name again.
        $previous_entry_name = $this->directory_stack[$frame_index]["after"];
        $this->directory_stack[$frame_index]["after"] = $entry_name;
        $path = Utils::wp_join_unix_paths($this->current_directory, $entry_name);

        // Skip sibling paths before lstat() and before a directory can enter
        // the stack. Their names came from the parent listing, but skipping
        // them here adds no filesystem calls. Allowed paths still need a link
        // check; includes_path() only checks strings.
        if ($this->multisite_selection !== null && !$this->multisite_selection->includes_path($path)) {
            $this->step_status = self::STATUS_SKIPPED;
            return true;
        }
        if ($this->multisite_selection !== null) {
            $this->multisite_selection->assert_path_allowed($path);
        }
        if (self::path_has_default_skipped_component($path)) {
            $this->step_status = self::STATUS_SKIPPED;
            return true;
        }
        if (
            $this->storage_path !== ""
            && Utils::path_is_same_as_or_descendant_of($path, $this->storage_path)
        ) {
            $this->step_status = self::STATUS_SKIPPED;
            return true;
        }

        // A name returned by scandir() may disappear before inspection. Its
        // cursor is already settled, so continuation moves to the next name
        // unless a UNC API limit makes disappearance impossible to infer.
        clearstatcache(true, $path);
        try {
            $stat = @Utils::source_lstat($path);
            if ($stat === false) {
                if (Utils::windows_share_root($path) !== null) {
                    // PHP may list a long UNC filename but fail to inspect it. Do
                    // not treat that API limit as a deletion. Keep the cursor before
                    // this entry so another attempt cannot silently skip the file.
                    throw new RuntimeException(
                        "Cannot inspect Windows share path: {$path}. PHP returned no file metadata. " .
                        "Check source access; for long UNC paths, configure the source with a drive-letter path."
                    );
                }
                $this->step_status = self::STATUS_PATH_UNAVAILABLE;
                return true;
            }
            if (
                self::stat_is_file($stat)
                && self::file_name_is_default_skipped($path)
            ) {
                $this->step_status = self::STATUS_SKIPPED;
                return true;
            }

            $inspected_path = self::index_entries_for_path($path, $stat, $this->follow_symlinks);
        } catch (RuntimeException $error) {
            // Names and link targets that PHP cannot inspect must fail again
            // after resume, not disappear behind this entry's error cursor.
            $this->directory_stack[$frame_index]["after"] = $previous_entry_name;
            --$this->current_directory_position;
            throw $error;
        }
        $this->index_entries = $inspected_path["entries"];
        $type = $inspected_path["type"];
        // The directory's own final step emits its empty entry, including when
        // it is also a selected root. Keep uninspectable directory entries here
        // so a later directory error does not make the path look absent.
        if ($type === "dir" && !empty($this->index_entries[0]["empty"])) {
            $this->index_entries = [];
        }
        $this->step_status = self::STATUS_INDEXED;

        // Depth-first traversal enters a new directory before returning to the
        // remaining names in its parent. An exact scheduled root is already
        // on the stack, and traversing an ancestor would expose paths outside
        // the requested tree before entering that root again.
        if ($type === "dir") {
            $canonical_directory = Utils::source_realpath($path);
            if (
                $canonical_directory === false
                || !Utils::path_is_same_as_or_descendant_of($this->configured_directories, $canonical_directory)
            ) {
                $this->directory_stack[] = [
                    "dir" => $path,
                    "after" => null,
                ];
                $this->forget_current_directory_names();
            }
        }

        return true;
    }

    /**
     * Returns what the most recent step did.
     *
     * @return string|null One STATUS_* value, or null before the first step and after completion.
     */
    public function get_step_status()
    {
        return $this->step_status;
    }

    /**
     * Returns entries produced by the most recent indexed step.
     *
     * @return array[] File-index entries, normally containing exactly one entry.
     */
    public function get_index_entries(): array
    {
        return $this->index_entries;
    }

    /**
     * Returns the directory failure produced by the most recent step.
     *
     * @return array|null {
     *     Directory failure, or null when the current step did not report one.
     *
     *     @type string $error_type Protocol error type.
     *     @type string $path       Filesystem path that could not be traversed.
     *     @type string $message    Human-readable explanation.
     * }
     */
    public function get_directory_error()
    {
        return $this->directory_error;
    }

    /**
     * Returns a JSON-safe cursor for the next traversal step.
     *
     * @return array {
     *     File-index cursor.
     *
     *     @type array[]  $stack Active directories with base64-encoded path names.
     *     @type string[] $paths Base64-encoded named paths not yet inspected.
     * }
     */
    public function get_cursor(): array
    {
        $encoded_stack = [];
        foreach ($this->directory_stack as $frame) {
            $encoded_stack[] = [
                "dir" => base64_encode($frame["dir"]),
                "after" => $frame["after"] !== null ? base64_encode($frame["after"]) : null,
            ];
        }
        $encoded_path_roots = [];
        foreach ($this->pending_named_roots as $path_root) {
            $encoded_path_roots[] = base64_encode($path_root);
        }
        $cursor = ["stack" => $encoded_stack, "paths" => $encoded_path_roots];
        if ($this->multisite_selection !== null) {
            $cursor['multisite_selection'] = $this->multisite_selection->get_identity();
        }
        return $cursor;
    }

    /**
     * Returns the directory reported by the endpoint as X-Index-Dir.
     *
     * @return string Index directory for this traversal.
     */
    public function get_index_directory(): string
    {
        return $this->index_directory;
    }

    /**
     * Returns the directory active during the most recent step.
     *
     * @return string|null Current directory, or null before traversal begins.
     */
    public function get_current_directory()
    {
        return $this->current_directory;
    }

    /**
     * Releases in-memory directory data without performing another step.
     */
    public function close(): void
    {
        if ($this->closed) {
            return;
        }
        $this->closed = true;
        $this->initial_index_entries = [];
        $this->forget_current_directory_names();
    }

    /**
     * Reports whether a path belongs to the established default skip set.
     *
     * Keep node_modules: Weglot's Composer autoloader loads WeglotLanguages\Languages
     * from vendor/weglot/weglot-php/node_modules/@weglot/languages/dist/Languages.php
     * inside the plugin. Omitting that PHP file makes site requests fail with a
     * missing-class fatal error. Copying bundled runtime files is safer than
     * breaking the site to save transfer time and space.
     *
     * This does not make development dependencies portable. Native binaries may
     * require a different OS or CPU; those projects still need dependency
     * installation or rebuilding on the target after Reprint runs. Automating
     * that step is separate work, not a reason to omit portable runtime files.
     *
     * @param string $path         Filesystem path to classify.
     * @param bool   $path_is_file Whether the path is a regular file.
     * @return bool Whether the path should be omitted.
     */
    public static function path_is_default_skipped(
        string $path,
        bool $path_is_file = true
    ): bool
    {
        return self::path_has_default_skipped_component($path)
            || (
                $path_is_file
                && self::file_name_is_default_skipped($path)
            );
    }

    /** Reports whether a path contains a complete default-skipped component. */
    private static function path_has_default_skipped_component(string $path): bool
    {
        // Sentinel slashes make component matches independent of whether the
        // component appears at the beginning, middle, or end of the path.
        $path_with_boundaries = "/" . trim($path, "/") . "/";

        // These generated directories are limited to known plugin paths. A
        // directory with a similar name elsewhere may contain user files and
        // remains included. wpcomsh-cache is wp.com Atomic's filesystem cache
        // shadow; wflogs and wfcache are Wordfence runtime data.
        static $generated_directories = [
            "/wp-content/cache/",
            "/wp-content/upgrade/",
            "/wp-content/wpcomsh-cache/",
            "/wp-content/wflogs/",
            "/wp-content/wfcache/",
            "/wp-content/wpvividbackups/wpvivid_log/",
            "/wp-content/plugins/all-in-one-wp-migration/storage/",
            "/wp-content/plugins/si-captcha-for-wordpress/temp/",
            "/wp-content/uploads/backwpup-restore/",
            "/wp-content/uploads/backupbuddy_temp/",
            "/wp-content/uploads/pb_backupbuddy/",
            "/wp-content/uploads/wc-logs/",
            "/wp-content/uploads/wpallimport/logs/",
        ];
        foreach ($generated_directories as $directory) {
            if (strpos($path_with_boundaries, $directory) !== false) {
                return true;
            }
        }

        // Version-control metadata, IDE settings, and package-manager caches
        // match complete path components. Similar names such as cache-control
        // or .git-backup remain included. Keep node_modules: plugins and themes
        // may bundle runtime PHP, JavaScript, and CSS dependencies there.
        static $skipped_components = [
            ".git", ".svn", ".hg", ".bzr",
            ".idea", ".vscode",
            ".cache", ".npm", ".yarn", ".pnpm-store",
        ];
        foreach ($skipped_components as $component) {
            if (strpos($path_with_boundaries, "/" . $component . "/") !== false) {
                return true;
            }
        }

        return false;
    }

    /** Reports whether a basename matches a default-skipped file shape. */
    private static function file_name_is_default_skipped(string $path): bool
    {
        $path_with_boundaries = "/" . trim($path, "/") . "/";
        $basename = basename($path);

        // Keep walking backup directories so an unrelated file placed there
        // is still indexed. Match the file shape generated by each plugin
        // instead of omitting the entire directory.
        static $backup_file_patterns = [
            "/wp-content/updraft/" => "/^backup_.*\\.(?:gz(?:\\.crypt)?|zip)$/i",
            "/wp-content/ai1wm-backups/" => "/\\.wpress$/i",
            "/wp-content/wpvividbackups/" => "/_wpvivid-.*_backup_.*\\.zip$/i",
            "/wp-content/backups-dup-lite/" => "/_archive\\.(?:daf|zip)$/i",
            "/wp-content/backups-dup-pro/" => "/_archive\\.(?:daf|zip)$/i",
            "/wp-content/backup-db/" => "/\\.sql(?:\\.gz)?$/i",
            "/wp-content/backup-guard/" => "/\\.sgbp$/i",
            "/wp-content/uploads/backupbuddy_backups/" => "/^backup-.*\\.zip$/i",
            "/wp-content/uploads/backup-guard/" => "/\\.sgbp$/i",
            "/wp-content/uploads/wp-staging/backups/" => "/\\.wpstg$/i",
            "/wp-content/uploads/tCapsule/backups/" => "/\\.sql(?:\\.gz)?$/i",
            "/wp-snapshots/" => "/_archive\\.(?:daf|zip)$/i",
        ];
        foreach ($backup_file_patterns as $directory => $file_pattern) {
            if (
                strpos($path_with_boundaries, $directory) !== false
                && preg_match($file_pattern, $basename) === 1
            ) {
                return true;
            }
        }
        if (
            preg_match(
                "#/wp-content/uploads/backwpup(?:/[^/]+/backups|-[^/]+-backups)/#",
                $path_with_boundaries
            ) === 1
            && preg_match("/\\.(?:tar(?:\\.bz2|\\.gz)?|tgz|zip)$/i", $basename) === 1
        ) {
            return true;
        }
        if (
            strpos($path_with_boundaries, "/wp-content/updraft/") !== false
            && preg_match("/^log\\.[a-z0-9]+\\.txt$/i", $basename) === 1
        ) {
            return true;
        }

        // Operating-system and server log metadata matches only the basename.
        static $skipped_basenames = [
            ".DS_Store", "._.DS_Store",
            "Thumbs.db", "desktop.ini", "ehthumbs.db",
            "error_log", "php_errorlog",
        ];
        if (in_array($basename, $skipped_basenames, true)) {
            return true;
        }
        // Editor and merge scratch files: Emacs locks and autosaves, trailing
        // tildes, Vim swaps, backups, and conflict leftovers.
        if ($basename !== "" && $basename[0] === "." && isset($basename[1]) && $basename[1] === "#") {
            return true;
        }
        if (strlen($basename) >= 3 && $basename[0] === "#" && substr($basename, -1) === "#") {
            return true;
        }
        if (preg_match("/\\.(?:log|tmp)$/i", $basename) === 1) {
            return true;
        }
        if (preg_match("/(?:~|\\.(?:swp|swo|swn|bak|orig|rej))$/", $basename) === 1) {
            return true;
        }

        return false;
    }

    /**
     * Reports whether an inspected path is a regular file.
     *
     * @param array $stat lstat() result for the path.
     */
    private static function stat_is_file(array $stat): bool
    {
        return ( $stat["mode"] & self::STAT_TYPE_MASK ) === self::STAT_TYPE_FILE;
    }

    /**
     * Initializes common traversal state.
     *
     * @param array[]  $roots                Structured file-index roots.
     * @param string[] $configured_directories Canonical directories selected by the request.
     * @param bool     $follow_symlinks      Whether directory symlinks may leave the allowed directories.
     * @param string   $storage_path         Reprint storage path omitted from the index, or an empty string.
     * @param array[]  $directory_stack      Active directory stack.
     * @param string   $index_directory      Directory reported by the endpoint.
     * @param array[]  $initial_index_entries Intermediate symlinks emitted before traversal.
     * @param string[] $pending_named_roots  Requested named roots still to index, one per step.
     * @param MultisiteFileSelection|null $multisite_selection Source selection checked against saved directories before traversal resumes.
     */
    private function __construct(
        array $roots,
        array $configured_directories,
        bool $follow_symlinks,
        string $storage_path,
        array $directory_stack,
        string $index_directory,
        array $initial_index_entries,
        array $pending_named_roots = [],
        ?MultisiteFileSelection $multisite_selection = null
    ) {
        $this->multisite_selection = $multisite_selection;
        if ($multisite_selection !== null) {
            foreach ($directory_stack as $frame) {
                $multisite_selection->assert_path_allowed($frame['dir']);
            }
            foreach ($pending_named_roots as $remote_absolute_path) {
                $multisite_selection->assert_path_allowed($remote_absolute_path);
            }
        }
        $this->roots = $roots;
        $this->configured_directories = $configured_directories;
        $this->follow_symlinks = $follow_symlinks;
        $this->storage_path = self::canonical_storage_path($storage_path);
        $this->directory_stack = $directory_stack;
        $this->index_directory = $index_directory;
        $this->initial_index_entries = $initial_index_entries;
        $this->pending_named_roots = $pending_named_roots;
    }

    /**
     * Opens and positions the directory at the top of the traversal stack.
     *
     * @return bool Whether directory entries are ready for the current step.
     */
    private function open_current_directory(): bool
    {
        // An empty stack is normal completion, not a directory failure.
        if (empty($this->directory_stack)) {
            return false;
        }

        // The top frame names the next directory and the last name settled in
        // it. Keep the directory available for any failure reported this step.
        $frame_index = count($this->directory_stack) - 1;
        $frame = $this->directory_stack[$frame_index];
        $this->current_directory = $frame["dir"];
        if ($this->multisite_selection !== null) {
            $this->multisite_selection->assert_path_allowed($this->current_directory);
        }

        // A directory may disappear while it waits on the stack. Remove that
        // frame so a later call continues with its parent or the next root.
        clearstatcache(true, $this->current_directory);
        $canonical_directory = Utils::source_realpath($this->current_directory);
        if ($canonical_directory === false || !is_dir(Utils::source_io_path($canonical_directory))) {
            array_pop($this->directory_stack);
            $this->directory_error = [
                "error_type" => "dir_open",
                "path" => $this->current_directory,
                "message" => "Directory does not exist or is not accessible",
            ];
            $this->step_status = self::STATUS_DIRECTORY_ERROR;
            return false;
        }

        $canonical_directory = Utils::normalize_path_separators($canonical_directory, Utils::native_path_format());

        // When following links is disabled, every canonical directory must
        // remain inside a configured root. Reject one that crosses that
        // boundary, then continue with the remaining stack.
        if (
            !$this->follow_symlinks
            && !Utils::path_is_same_as_or_descendant_of($canonical_directory, $this->configured_directories)
        ) {
            array_pop($this->directory_stack);
            $this->directory_error = [
                "error_type" => "dir_outside_root",
                "path" => $canonical_directory,
                "message" => "Directory is outside allowed roots",
            ];
            $this->step_status = self::STATUS_DIRECTORY_ERROR;
            return false;
        }

        // Canonical paths keep split roots and followed symlinks in one
        // namespace, matching the endpoint's previous traversal.
        $this->directory_stack[$frame_index]["dir"] = $canonical_directory;
        $this->current_directory = $canonical_directory;

        // scandir() supplies the stable byte order on which cursor resumption
        // depends. Failure settles this directory rather than retrying it on
        // every subsequent request.
        // This reads, sorts and holds every name in this directory, including
        // on resume. The index batch limit does not bound this allocation. For
        // a site 7 pull, uploads/sites still lists sibling names; the selection
        // skips their subtrees, not this parent-directory listing.
        clearstatcache(true, $canonical_directory);
        $directory_names = @scandir(Utils::source_io_path($canonical_directory), SCANDIR_SORT_ASCENDING);
        if ($directory_names === false) {
            array_pop($this->directory_stack);
            $this->directory_error = [
                "error_type" => "dir_open",
                "path" => $canonical_directory,
                "message" => "Failed to open directory",
            ];
            $this->step_status = self::STATUS_DIRECTORY_ERROR;
            return false;
        }

        // Tests may change the scanned names to exercise traversal boundaries.
        // Production traversal has no hook and uses scandir() results directly.
        $test_mode_enabled = getenv("REPRINT_SERVER_TEST_MODE");
        if ($test_mode_enabled && function_exists("_e2e_call_hook")) {
            $hook_arguments = [$canonical_directory, &$directory_names];
            _e2e_call_hook("test_hook_during_dir_scan", $hook_arguments);
        }

        // Remove the two navigation names, then seek past the last settled name.
        // Binary search makes the seek cheap even in a wide directory; the full
        // directory scan and allocation above have already happened.
        $this->current_directory_names = [];
        foreach ($directory_names as $directory_name) {
            if ($directory_name !== "." && $directory_name !== "..") {
                $this->current_directory_names[] = $directory_name;
            }
        }
        $this->current_directory_position = 0;
        $after = isset($frame["after"]) ? $frame["after"] : null;
        if ($after !== null && $after !== "") {
            $this->current_directory_position = self::position_after_name(
                $this->current_directory_names,
                $after
            );
        }

        return true;
    }

    /**
     * Drops the cached names for the current directory.
     */
    private function forget_current_directory_names(): void
    {
        $this->current_directory_names = null;
        $this->current_directory_position = 0;
    }

    /**
     * Returns a canonical storage path when the configured path exists.
     *
     * @param string $storage_path Configured Reprint storage path.
     * @return string Canonical or normalized storage path, or an empty string.
     */
    private static function canonical_storage_path(string $storage_path): string
    {
        // Reprint storage may live inside the document root on hosts that can
        // write nowhere else. It must never enter an index or a push could
        // copy or delete its own work while using it. Traversal canonicalizes
        // directories with realpath(), so the comparison uses the same form.
        // rtrim() also prevents a trailing slash from missing an exact match.
        $storage_path = rtrim($storage_path, "/");
        if ($storage_path === "") {
            return "";
        }
        $canonical_storage_path = Utils::source_realpath($storage_path);
        return Utils::normalize_path_separators($canonical_storage_path !== false ? $canonical_storage_path : $storage_path, Utils::native_path_format());
    }

    /**
     * Finds the first sorted directory name after a cursor name.
     *
     * @param string[] $directory_names Sorted directory names.
     * @param string   $after_name      Last settled directory name.
     * @return int Position of the next directory name.
     */
    private static function position_after_name(array $directory_names, string $after_name): int
    {
        $low = 0;
        $high = count($directory_names);
        while ($low < $high) {
            $middle = (int) ( ( $low + $high ) / 2 );
            if (strcmp($directory_names[$middle], $after_name) <= 0) {
                $low = $middle + 1;
            } else {
                $high = $middle;
            }
        }
        return $low;
    }

    /**
     * Indexes one requested named root using traversal's exclusions.
     */
    private function index_next_named_root(): void
    {
        // The caller settles skipped, vanished, or indexed roots after return.
        // A thrown read error keeps this named root pending for resume.
        $requested_path = $this->pending_named_roots[0];
        $root = $this->find_root($requested_path);
        if ($root === null) {
            throw new InvalidArgumentException("Index cursor names a root absent from this request: {$requested_path}");
        }

        if ($root["type"] === "missing") {
            $this->step_status = self::STATUS_PATH_UNAVAILABLE;
            return;
        }

        $path_root = $root["requested_path"];

        if (self::path_has_default_skipped_component($path_root)) {
            $this->step_status = self::STATUS_SKIPPED;
            return;
        }
        if (
            $this->storage_path !== ""
            && Utils::path_is_same_as_or_descendant_of($path_root, $this->storage_path)
        ) {
            $this->step_status = self::STATUS_SKIPPED;
            return;
        }

        clearstatcache(true, $path_root);
        $stat = @Utils::source_lstat($path_root);
        if ($stat === false) {
            $this->step_status = self::STATUS_PATH_UNAVAILABLE;
            return;
        }
        if (
            self::stat_is_file($stat)
            && self::file_name_is_default_skipped($path_root)
        ) {
            $this->step_status = self::STATUS_SKIPPED;
            return;
        }

        $entries = [];
        if ($this->follow_symlinks) {
            // Record links in the requested parent path. The inspected root may
            // add links from its own symlink target, so keep both entry sets.
            $entries = self::find_parent_symlinks(dirname($path_root));
        }
        // A regular file uses the spelling already returned by realpath(), just
        // like a traversed directory. Emitting both spellings would turn a
        // Windows lookup of HELLO.TXT into two Linux files: HELLO.TXT and hello.txt.
        // Parent links above keep their requested paths; the file appears once
        // at the resolved path reached through those links.
        if ($root["type"] === "file" && $root["resolved_path"] !== null) {
            $path_root = $root["resolved_path"];
        }
        $inspected_path = self::index_entries_for_path($path_root, $stat, $this->follow_symlinks);
        $resolved_target_was_indexed = $root["resolved_path"] !== null
            && $this->resolved_target_was_indexed($root);

        // A selected symlink always remains at its requested path. When
        // followed, its target content is emitted in the resolved-path namespace
        // that normal traversal already uses. Two aliases may therefore share
        // one target entry while both link entries remain present.
        if (!( $root["type"] === "file" && $resolved_target_was_indexed )) {
            $entries = array_merge($entries, $inspected_path["entries"]);
        }
        if (
            $this->follow_symlinks
            && $root["type"] === "symlink"
            && $root["resolved_path"] !== null
            && !is_dir(Utils::source_io_path($root["resolved_path"]))
            && !$resolved_target_was_indexed
        ) {
            clearstatcache(true, $root["resolved_path"]);
            $target_stat = @Utils::source_lstat($root["resolved_path"]);
            if (is_array($target_stat)) {
                $target = self::index_entries_for_path($root["resolved_path"], $target_stat, false);
                $entries = array_merge($entries, $target["entries"]);
            }
        }
        $this->index_entries = $entries;
        $this->step_status = self::STATUS_INDEXED;
    }

    /** Finds the current structured root by its requested path. */
    private function find_root(string $requested_path): ?array
    {
        foreach ($this->roots as $root) {
            if ($root["requested_path"] === $requested_path) {
                return $root;
            }
        }
        return null;
    }

    /** Whether an earlier named root already emitted this resolved target. */
    private function resolved_target_was_indexed(array $root): bool
    {
        foreach ($this->roots as $candidate) {
            if (
                $candidate["requested_path"] !== $root["requested_path"]
                &&
                $candidate["resolved_path"] === $root["resolved_path"]
                && !in_array($candidate["requested_path"], $this->pending_named_roots, true)
            ) {
                return true;
            }
        }
        return false;
    }

    /**
     * Validates root records produced by the endpoint resolver or local callers.
     *
     * @param array[] $roots File-index roots.
     * @return FileIndexRoot[]
     */
    private static function validate_roots(array $roots): array
    {
        $validated_roots = [];
        foreach ($roots as $root) {
            $validated_roots[] = self::validate_root($root);
        }
        return $validated_roots;
    }

    /**
     * @param mixed $root Candidate file-index root.
     * @return FileIndexRoot Validated file-index root.
     */
    private static function validate_root($root): array
    {
        if (!is_array($root) || !isset($root["requested_path"], $root["type"])) {
            throw new InvalidArgumentException("File-index roots must contain requested_path and type");
        }
        if (!is_string($root["requested_path"]) || !is_string($root["type"])) {
            throw new InvalidArgumentException("File-index root fields have invalid types");
        }
        $requested_path = $root["requested_path"];
        if (
            $requested_path === ""
            || \WordPress\Reprint\Server\Utils::normalize_path($requested_path, Utils::native_path_format()) !== $requested_path
        ) {
            throw new InvalidArgumentException("File-index root requested_path must be normalized");
        }
        $resolved_path = $root["resolved_path"] ?? null;
        if ($resolved_path !== null && !is_string($resolved_path)) {
            throw new InvalidArgumentException("File-index root resolved_path has invalid type");
        }
        if (!in_array($root["type"], ["directory", "file", "symlink", "missing"], true)) {
            throw new InvalidArgumentException("File-index root type is invalid: {$root["type"]}");
        }
        if ($root["type"] === "missing") {
            if ($resolved_path !== null) {
                throw new InvalidArgumentException(
                    "Missing file-index root has a resolved_path: {$requested_path}"
                );
            }
        } elseif ($resolved_path === null || $resolved_path === "") {
            throw new InvalidArgumentException("File-index root missing resolved_path: {$requested_path}");
        }
        return [
            "requested_path" => $requested_path,
            "resolved_path" => $resolved_path,
            "type" => $root["type"],
        ];
    }

    /**
     * Returns resolved directory roots, including followed directory links.
     *
     * @param FileIndexRoot[] $roots Structured roots. Each has requested_path,
     *                                resolved_path, and type keys; type is directory,
     *                                file, symlink, or missing.
     * @return string[] Resolved directory paths.
     */
    private static function resolved_directory_roots(array $roots, bool $follow_symlinks): array
    {
        $directories = [];
        foreach ($roots as $root) {
            if (
                $root["type"] === "directory"
                || ( $follow_symlinks && $root["type"] === "symlink" && $root["resolved_path"] !== null && is_dir(Utils::source_io_path($root["resolved_path"])) )
            ) {
                if (!in_array($root["resolved_path"], $directories, true)) {
                    $directories[] = $root["resolved_path"];
                }
            }
        }
        return $directories;
    }

    /**
     * Builds the index entries describing one inspected path.
     *
     * @param string $path            Absolute path already confirmed by lstat().
     * @param array  $stat            lstat() result for the path.
     * @param bool   $follow_symlinks Whether directory links may reveal intermediate links.
     * @return array {
     *     @type array[] $entries Intermediate links, then the path's own entry.
     *     @type string  $type    One of file, link, dir, or other.
     * }
     */
    private static function index_entries_for_path(
        string $path,
        array $stat,
        bool $follow_symlinks
    ): array {
        $mode = $stat["mode"] & self::STAT_TYPE_MASK;
        $type = "file";
        $link_target = null;
        $intermediate_symlinks = [];
        if ($mode === self::STAT_TYPE_LINK) {
            $type = "link";
            $resolved_symlink = self::resolve_symlink_target($path);
            $link_target = $resolved_symlink["target"];
            if ($follow_symlinks) {
                $intermediate_symlinks = $resolved_symlink["intermediates"];
            }
        } elseif ($mode === self::STAT_TYPE_DIR) {
            $type = "dir";
        } elseif ($mode !== self::STAT_TYPE_FILE) {
            $type = "other";
        }

        // Directory size does not describe its descendants, so it is zeroed.
        $item = [
            "path" => $path,
            "ctime" => (int) ( isset($stat["ctime"]) ? $stat["ctime"] : 0 ),
            "size" => $type === "file" || $type === "link" ? (int) ( isset($stat["size"]) ? $stat["size"] : 0 ) : 0,
            "type" => $type,
        ];
        if ($link_target !== null) {
            $item["target"] = $link_target;
        }
        if ($type === "dir") {
            // Actual empty directory, not a directory with all its children
            // excluded from the synchronization
            $directory_handle = @opendir(Utils::source_io_path($path));
            if ($directory_handle !== false) {
                $item["empty"] = true;
                while (true) {
                    $directory_entry = readdir($directory_handle);
                    if ($directory_entry === false) {
                        break;
                    }
                    if ($directory_entry !== "." && $directory_entry !== "..") {
                        $item["empty"] = false;
                        break;
                    }
                }
                closedir($directory_handle);
            }
            // If opendir() fails, leave "empty" absent. Pull reports the
            // directory error and push does not plan deletions from it.
        }

        // Intermediate links and the inspected path share one step because a
        // cursor cannot stop between them without losing one of the entries.
        $entries = $intermediate_symlinks;
        // Descendants imply non-empty parents: /a/file already implies /a.
        // Emit a directory only when it is empty or uninspectable, when no
        // descendant can establish that it exists.
        if (
            $type !== "dir"
            || !isset($item["empty"])
            || $item["empty"]
        ) {
            $entries[] = $item;
        }

        return ["entries" => $entries, "type" => $type];
    }

    /**
     * Resolves a directory symlink and finds symlinks in its unresolved path.
     *
     * Managed WordPress hosts often chain symlinks: /srv may point to /,
     * /srv/wordpress may point to /wordpress, and readlink() may return a
     * relative path containing more symlinks. realpath() gives the final
     * canonical directory used for further indexing. File symlinks do not get
     * a canonical target because the pull client does not traverse them.
     *
     * realpath() skips the intermediate links, so the unresolved readlink()
     * path is also walked. Those intermediate entries let pull recreate the
     * complete path rather than only its final target.
     *
     * @param string $path Absolute path to the symlink.
     * @return array {
     *     Symlink details for file indexing.
     *
     *     @type string|null $target        Canonical directory target, or null.
     *     @type array[]     $intermediates Symlinks encountered before that target.
     * }
     */
    private static function resolve_symlink_target(string $path): array
    {
        // Only links ending at a directory need a canonical target because only
        // directories can add more traversal work. Broken, self-referential,
        // and file links normally remain ordinary link entries without a target.
        // Windows lookups can throw when PHP cannot read the stored target;
        // treating that failure as a broken link could omit readable content.
        clearstatcache(true, $path);
        $resolved_target = @Utils::source_realpath($path);
        if (
            $resolved_target === false
            || $resolved_target === $path
            || !is_dir(Utils::source_io_path($resolved_target))
        ) {
            return ["target" => null, "intermediates" => []];
        }

        // realpath() jumps directly to the final directory. Walk the unresolved
        // target as well so links along that path are included in the index.
        $intermediates = [];
        $raw_target = @Utils::source_readlink($path);
        if ($raw_target !== false && $raw_target !== "") {
            // Resolve only textual dot segments. realpath() would skip the
            // intermediate links that this walk must inspect.
            $absolute_raw_target = Utils::resolve_symlink_target_path($path, $raw_target, Utils::native_path_format());
            if (
                $absolute_raw_target !== ""
                && Utils::is_absolute_path($absolute_raw_target, Utils::native_path_format())
                && $absolute_raw_target !== $resolved_target
            ) {
                $intermediates = self::find_parent_symlinks($absolute_raw_target);
            }
        }

        return ["target" => $resolved_target, "intermediates" => $intermediates];
    }

    /**
     * Returns symlinks found while walking the parents of an absolute path.
     *
     * For `/srv/wordpress/wp-content/plugins`, this inspects `/srv`, then
     * `/srv/wordpress`, and so on. After finding a link, traversal continues
     * from its canonical path. The walk is intentionally not recursive into
     * the final target; pull decides whether another directory needs indexing.
     *
     * @param string $absolute_path Absolute filesystem path.
     * @return array[] Intermediate symlink index entries.
     */
    private static function find_parent_symlinks(string $absolute_path): array
    {
        $entries = [];
        $parents = [];
        $current = $absolute_path;
        while (Utils::is_absolute_path($current, Utils::native_path_format())) {
            $parents[] = $current;
            $parent = dirname($current);
            if ($parent === $current) {
                break;
            }
            $current = $parent;
        }

        // Keep the requested spelling while inspecting each parent. PHP follows
        // a parent link when checking the next component, so changing $current
        // to realpath() would turn later emitted links into resolved paths.
        foreach (array_reverse($parents) as $current) {
            if (!@Utils::source_is_link($current)) {
                continue;
            }

            // Preserve the link spelling returned by readlink(); pull needs it
            // to reconstruct the same link rather than only its final directory.
            $target = @Utils::source_readlink($current);
            if ($target !== false && $target !== "") {
                $stat = @Utils::source_lstat($current);
                $entries[] = [
                    "path" => $current,
                    "ctime" => (int) ( is_array($stat) && isset($stat["ctime"]) ? $stat["ctime"] : 0 ),
                    "size" => 0,
                    "type" => "link",
                    "target" => $target,
                    "intermediate" => true,
                ];
            }
        }
        return $entries;
    }
}
