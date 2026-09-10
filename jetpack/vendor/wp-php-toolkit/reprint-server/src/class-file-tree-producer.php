<?php

namespace WordPress\Reprint\Server;

require_once __DIR__ . '/utils.php';

use InvalidArgumentException;

/**
 * Streams a provided list of filesystem paths in sorted order with
 * cursor-based resumption. The caller must pass the same paths array
 * on each request when resuming from a cursor. Callers are responsible
 * for encoding cursors for transport (e.g. base64 for HTTP headers).
 */
class FileTreeProducer
{
    const DEFAULT_CHUNK_SIZE = 5 * 1024 * 1024;

    const PHASE_STREAMING = "streaming";
    const PHASE_FINISHED = "finished";

    /** @var array */
    private $directories;
    /** @var int */
    private $chunk_size;
    /** @var bool */
    private $index_only;
    /** @var string|null */
    private $filesystem_root;

    /** @var string */
    private $phase;
    /** @var array|null */
    private $current_chunk = null;

    /** Explicit list of paths to stream, sorted on first use. */
    /** @var array */
    private $paths;
    /** @var bool */
    private $paths_sorted = false;
    /** @var bool */
    private $paths_positioned = false;
    /** Ephemeral index into $paths; NOT stored in cursor. */
    /** @var int */
    private $paths_position = 0;

    /** State for the file currently being streamed in chunks. */
    private $streaming_file_handle = null;

    public function __destruct()
    {
        if ($this->streaming_file_handle !== null) {
            fclose($this->streaming_file_handle);
            $this->streaming_file_handle = null;
        }
    }
    /** @var int */
    private $streaming_file_offset = 0;
    /** @var array|null */
    private $current_file_meta = null;

    /** Tracks the last emitted path for cursor generation. */
    /** @var string|null */
    private $last_emitted_path = null;
    /** @var int|null */
    private $last_emitted_ctime = null;

    /**
     * @param string|array $directories Root directories to scan.
     * @param array $options {
     *     @type int    $chunk_size Bytes per file chunk (default 5MB).
     *     @type bool   $index_only Emit index entries instead of file contents.
     *     @type string $cursor     JSON cursor string for resumption.
     *     @type array  $paths      Paths to stream (required).
     * }
     */
    public function __construct($directories, array $options = [])
    {
        $this->directories = $this->normalize_directories($directories);
        $this->chunk_size = $options["chunk_size"] ?? self::DEFAULT_CHUNK_SIZE;
        $this->index_only = $options["index_only"] ?? false;

        if (!isset($options["paths"]) || !is_array($options["paths"])) {
            throw new InvalidArgumentException(
                "The 'paths' option is required and must be an array"
            );
        }
        $this->paths = $options["paths"];

        if (isset($options["cursor"])) {
            $this->initialize_from_cursor($options["cursor"]);
        } else {
            $this->initialize_new();
        }
    }

    /**
     * Sets up a fresh traversal from the beginning.
     */
    private function initialize_new(): void
    {
        $this->phase = self::PHASE_STREAMING;
        $dirs = $this->directories;
        sort($dirs, SORT_STRING);
        $this->filesystem_root = $dirs[0] ?? "/";

        $this->current_chunk = null;
        $this->streaming_file_handle = null;
        $this->streaming_file_offset = 0;
        $this->current_file_meta = null;
        $this->last_emitted_path = null;
        $this->last_emitted_ctime = null;
        $this->paths_sorted = false;
        $this->paths_positioned = false;
        $this->paths_position = 0;
    }

    /**
     * Restores producer state from a JSON cursor string.
     *
     * Cursor format is minimal: (path, ctime, byte_offset)
     * - path: the file/dir/symlink we were processing or just finished
     * - ctime: the ctime of the file when we started (for change detection)
     * - bytes: byte offset within the file (0 if finished or non-file)
     *
     * On resume, position within the paths array is determined by binary
     * search based on the path. This ensures correctness even when the
     * paths array changes between requests.
     */
    private function initialize_from_cursor(string $cursor_json): void
    {
        $cursor = json_decode($cursor_json, true);
        if ($cursor === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new InvalidArgumentException(
                "Invalid cursor format: " . json_last_error_msg()
            );
        }

        $this->phase = $cursor["phase"] ?? self::PHASE_STREAMING;
        $this->filesystem_root = isset($cursor["root"])
            ? base64_decode($cursor["root"])
            : ($this->directories[0] ?? "/");
        $this->current_chunk = null;
        $this->streaming_file_handle = null;
        $this->paths_sorted = false;
        $this->paths_positioned = false;
        $this->paths_position = 0;

        if ($this->phase !== self::PHASE_STREAMING) {
            $this->phase = self::PHASE_FINISHED;
            return;
        }

        $path = isset($cursor["path"]) ? base64_decode($cursor["path"]) : null;
        $ctime = $cursor["ctime"] ?? null;
        $byte_offset = $cursor["bytes"] ?? 0;

        $this->last_emitted_path = null;
        $this->last_emitted_ctime = null;

        if ($path !== null && $byte_offset > 0) {
            // Resuming mid-file.
            clearstatcache(true, $path);
            $size = @filesize($path);
            if ($size === false) {
                // File disappeared; treat as completed.
                $this->current_file_meta = null;
                $this->streaming_file_offset = 0;
                $this->last_emitted_path = $path;
            } else {
                $this->current_file_meta = [
                    "path" => $path,
                    "ctime" => $ctime,
                    "size" => $size,
                ];
                $this->streaming_file_offset = $byte_offset;
                $this->last_emitted_path = $path;
            }
        } else {
            $this->current_file_meta = null;
            $this->streaming_file_offset = 0;
            $this->last_emitted_path = $path;
        }
        // Position within paths array will be resolved by binary search
        // when get_next_path_entry() is first called
    }

    /** @param string|array $directories */
    private function normalize_directories($directories): array
    {
        if (is_string($directories)) {
            return [trim_right_slash($directories)];
        }
        return array_map(function ($d) {
            return trim_right_slash($d);
        }, $directories);
    }

    /**
     * Advances to the next chunk. Returns false when finished.
     */
    public function next_chunk(): bool
    {
        if ($this->phase === self::PHASE_FINISHED) {
            return false;
        }

        $this->stream_step();
        return $this->phase !== self::PHASE_FINISHED;
    }

    /**
     * Produces the next chunk: file data, index entry, directory, or symlink.
     */
    private function stream_step(): void
    {
        if ($this->current_file_meta !== null) {
            $this->stream_file_chunk($this->current_file_meta);
            return;
        }

        while (true) {
            // get_next_server_file() may set current_chunk directly for
            // symlinks and directories, so clear it before each iteration.
            $this->current_chunk = null;

            $server_file = $this->get_next_server_file();

            if ($this->current_chunk !== null) {
                return;
            }

            if ($server_file === null) {
                $this->phase = self::PHASE_FINISHED;
                $this->current_chunk = null;
                return;
            }

            if ($this->index_only) {
                $this->emit_index_chunk($server_file);
                return;
            }

            $this->stream_file_chunk($server_file);
            return;
        }
    }

    /**
     * Emits an index entry chunk without streaming file contents.
     */
    private function emit_index_chunk(array $file): void
    {
        $this->current_chunk = [
            "type" => "index",
            "path" => $file["path"],
            "ctime" => $file["ctime"],
            "size" => $file["size"],
        ];
        $this->last_emitted_path = $file["path"];
        $this->last_emitted_ctime = $file["ctime"];
        $this->current_file_meta = null;
    }

    /**
     * Returns the next file entry, or sets current_chunk for non-file entries
     * (symlinks, directories, missing paths) and returns null.
     */
    private function get_next_server_file(): ?array
    {
        return $this->get_next_path_entry();
    }

    /**
     * Returns the next entry from the paths array.
     *
     * Paths are sorted on first access. Position is determined by binary
     * search based on last_emitted_path, not by a stored index. This ensures
     * correctness even when the paths array changes between requests.
     */
    private function get_next_path_entry(): ?array
    {
        if (!$this->paths_sorted) {
            sort($this->paths, SORT_STRING);
            $this->paths_sorted = true;
        }

        if (!$this->paths_positioned) {
            if ($this->last_emitted_path !== null) {
                $this->paths_position = $this->binary_search_next(
                    $this->paths,
                    $this->last_emitted_path
                );
            } else {
                $this->paths_position = 0;
            }
            $this->paths_positioned = true;
        }

        while ($this->paths_position < count($this->paths)) {
            $path = $this->paths[$this->paths_position];
            $this->paths_position++;

            $resolved_path = $this->resolve_path($path);
            if ($resolved_path === null) {
                // Path doesn't exist or isn't accessible, emit as missing
                $this->last_emitted_path = $path;
                $this->last_emitted_ctime = null;
                $this->current_chunk = [
                    "type" => "missing",
                    "path" => $path,
                ];
                return null;
            }

            $info = $this->lstat_path($resolved_path);
            if ($info === null) {
                continue;
            }

            if ($info["type"] === "link") {
                $target = @readlink($resolved_path);
                $this->last_emitted_path = $resolved_path;
                $this->last_emitted_ctime = $info["ctime"];
                $this->current_chunk = [
                    "type" => "symlink",
                    "path" => $resolved_path,
                    "target" => $target !== false ? $target : "",
                    "ctime" => $info["ctime"] ?? 0,
                ];
                return null;
            }

            if ($info["type"] === "dir") {
                $this->last_emitted_path = $resolved_path;
                $this->last_emitted_ctime = $info["ctime"] ?? null;
                $this->current_chunk = [
                    "type" => "directory",
                    "path" => $resolved_path,
                    "ctime" => $info["ctime"] ?? 0,
                ];
                return null;
            }

            if ($info["type"] === "file") {
                $ctime = $info["ctime"];
                $size = $info["size"];
                if ($ctime === null || $size === null) {
                    continue;
                }
                $this->current_file_meta = [
                    "path" => $resolved_path,
                    "ctime" => $ctime,
                    "size" => $size,
                ];
                $this->streaming_file_offset = 0;
                return $this->current_file_meta;
            }
        }

        return null;
    }

    /**
     * Resolves a path that might be relative to one of the root directories.
     *
     * Uses both file_exists() and is_link() because file_exists() follows
     * symlinks and returns false for broken symlinks, but the symlink
     * itself is still a valid filesystem entry we want to stream.
     */
    private function resolve_path(string $path): ?string
    {
        if ($path === "") {
            return null;
        }

        clearstatcache(true, $path);
        if ($path[0] === "/" && (file_exists($path) || is_link($path))) {
            return $path;
        }

        foreach ($this->directories as $dir) {
            $candidate = wp_join_unix_paths($dir, $path);
            clearstatcache(true, $candidate);
            if (file_exists($candidate) || is_link($candidate)) {
                return $candidate;
            }
        }

        if ($path[0] === "/") {
            return null;
        }

        return null;
    }

    /**
     * Reads the next chunk from the current file and performs post-read
     * change detection via ctime comparison.
     */
    private function stream_file_chunk(array $file): void
    {
        if ($this->streaming_file_handle === null) {
            clearstatcache(true, $file["path"]);
            $pre_stat = @lstat($file["path"]);
            if ($pre_stat === false || (($pre_stat["mode"] & 0170000) !== 0100000)) {
                $this->streaming_file_handle = null;
                $this->current_file_meta = null;
                $this->current_chunk = [
                    "type" => "error",
                    "error_type" => $pre_stat === false ? "file_missing" : "file_changed",
                    "path" => $file["path"],
                    "message" => $pre_stat === false
                        ? "File disappeared before read"
                        : "Path is no longer a regular file",
                ];
                $this->last_emitted_path = $file["path"];
                $this->last_emitted_ctime = $file["ctime"];
                return;
            }

            $this->streaming_file_handle = @fopen($file["path"], "r");
            if (!$this->streaming_file_handle) {
                $this->streaming_file_handle = null;
                $this->current_file_meta = null;
                $this->current_chunk = [
                    "type" => "error",
                    "error_type" => "file_open",
                    "path" => $file["path"],
                    "message" => "Failed to open file",
                ];
                $this->last_emitted_path = $file["path"];
                $this->last_emitted_ctime = $file["ctime"];
                return;
            }
            if ($this->streaming_file_offset > 0) {
                $seek_result = fseek(
                    $this->streaming_file_handle,
                    $this->streaming_file_offset
                );
                if ($seek_result === -1) {
                    fclose($this->streaming_file_handle);
                    $this->streaming_file_handle = null;
                    $this->current_file_meta = null;
                    $this->current_chunk = [
                        "type" => "error",
                        "error_type" => "file_seek",
                        "path" => $file["path"],
                        "message" => "Failed to seek to offset {$this->streaming_file_offset}",
                    ];
                    $this->last_emitted_path = $file["path"];
                    $this->last_emitted_ctime = $file["ctime"];
                    $this->streaming_file_offset = 0;
                    return;
                }
            }
        }

        $data = fread($this->streaming_file_handle, $this->chunk_size);
        if (false === $data || ("" === $data && $file["size"] !== 0)) {
            fclose($this->streaming_file_handle);
            $this->streaming_file_handle = null;
            $this->streaming_file_offset = 0;
            $this->last_emitted_path = $file["path"];
            $this->last_emitted_ctime = $file["ctime"];
            $this->current_file_meta = null;
            $this->current_chunk = [
                "type" => "error",
                "error_type" => "file_read",
                "path" => $file["path"],
                "message" => "Failed to read file",
            ];
            return;
        }

        $offset = $this->streaming_file_offset;
        $this->streaming_file_offset += strlen($data);

        $is_first = $offset === 0;
        $is_last = feof($this->streaming_file_handle);

        $changed = false;
        $change_ctime = null;
        $change_size = null;
        $error_type = "file_changed";

        // Detect whether the file changed while we were reading it.
        clearstatcache(true, $file["path"]);
        $stat = @stat($file["path"]);
        if ($stat === false) {
            $changed = true;
            $error_type = "file_missing";
        } else {
            $now_ctime = $stat["ctime"];
            if ($now_ctime !== $file["ctime"]) {
                $changed = true;
                $change_ctime = $now_ctime;
            }
        }

        if ($changed) {
            fclose($this->streaming_file_handle);
            $this->streaming_file_handle = null;
            $this->streaming_file_offset = 0;
            $this->last_emitted_path = $file["path"];
            $this->last_emitted_ctime = $file["ctime"];
            $this->current_file_meta = null;
            $this->current_chunk = [
                "type" => "error",
                "error_type" => $error_type,
                "path" => $file["path"],
                "message" =>
                    $error_type === "file_missing"
                        ? "File disappeared during stream"
                        : "File changed during stream",
                "expected_ctime" => $file["ctime"],
                "actual_ctime" => $change_ctime,
            ];
            return;
        }

        $this->current_chunk = [
            "type" => "file",
            "path" => $file["path"],
            "data" => $data,
            "size" => $file["size"],
            "ctime" => $file["ctime"],
            "offset" => $offset,
            "is_first_chunk" => $is_first,
            "is_last_chunk" => $is_last,
            "file_changed" => $changed,
            "change_ctime" => $change_ctime,
            "change_size" => $change_size,
        ];

        if ($is_last) {
            fclose($this->streaming_file_handle);
            $this->streaming_file_handle = null;
            $this->streaming_file_offset = 0;
            $this->last_emitted_path = $file["path"];
            $this->last_emitted_ctime = $file["ctime"];
            $this->current_file_meta = null;
        }
    }

    /**
     * Returns the chunk produced by the last call to next_chunk().
     */
    public function get_current_chunk(): ?array
    {
        return $this->current_chunk;
    }

    /**
     * Serializes state into a JSON cursor string.
     *
     * Cursor format is minimal: (path, ctime, byte_offset)
     * - path: last emitted path, or current file being streamed
     * - ctime: ctime of file when we started reading (for change detection)
     * - bytes: byte offset within the current file (0 if not mid-file)
     *
     * No traversal stack or list indices are stored. On resume, position is
     * determined by binary search based on the path. This ensures correctness
     * even when the filesystem changes between requests.
     */
    public function get_reentrancy_cursor(): string
    {
        if ($this->phase === self::PHASE_FINISHED) {
            return json_encode([
                "phase" => self::PHASE_FINISHED,
                "root" => base64_encode($this->filesystem_root),
            ]);
        }

        $cursor = [
            "phase" => $this->phase,
            "root" => base64_encode($this->filesystem_root),
        ];

        if ($this->current_file_meta !== null) {
            $cursor["path"] = base64_encode($this->current_file_meta["path"]);
            $cursor["ctime"] = $this->current_file_meta["ctime"];
            $cursor["bytes"] = $this->streaming_file_offset;
        } else if ($this->last_emitted_path !== null) {
            $cursor["path"] = base64_encode($this->last_emitted_path);
            $cursor["ctime"] = $this->last_emitted_ctime;
            $cursor["bytes"] = 0;
        }
        return json_encode($cursor);
    }

    /**
     * Returns progress metadata for logging and UI updates.
     */
    public function get_progress(): array
    {
        $progress = [
            "phase" => $this->phase,
        ];

        if ($this->phase === self::PHASE_STREAMING) {
            if ($this->last_emitted_path !== null) {
                $progress["last_path"] = base64_encode($this->last_emitted_path);
            }
            if ($this->current_file_meta) {
                $file = $this->current_file_meta;
                $progress["current_file"] = [
                    "path" => base64_encode($file["path"]),
                    "size" => $file["size"],
                    "bytes_read" => $this->streaming_file_offset,
                ];
            }
        }

        return $progress;
    }

    /**
     * Returns the filesystem root path.
     */
    public function get_filesystem_root(): ?string
    {
        return $this->filesystem_root;
    }

    /**
     * Returns the index of the first entry strictly greater than $last
     * in a sorted array, using binary search.
     */
    private function binary_search_next(array $entries, string $last): int
    {
        $low = 0;
        $high = count($entries);
        while ($low < $high) {
            $mid = integer_divide($low + $high, 2);
            if (strcmp($entries[$mid], $last) <= 0) {
                $low = $mid + 1;
            } else {
                $high = $mid;
            }
        }
        return $low;
    }

    /**
     * Classifies a path as file, dir, link, or other via a single lstat() call.
     *
     * @return array|null {type: 'file'|'dir'|'link'|'other', ctime: ?int, size: ?int}
     */
    private function lstat_path(string $path): ?array
    {
        clearstatcache(true, $path);
        $stat = @lstat($path);
        if ($stat === false) {
            return null;
        }

        $mode = $stat["mode"] & 0170000;
        $type = "other";
        if ($mode === 0120000) {
            $type = "link";
        } elseif ($mode === 0040000) {
            $type = "dir";
        } elseif ($mode === 0100000) {
            $type = "file";
        }

        return [
            "type" => $type,
            "ctime" => isset($stat["ctime"]) ? (int) $stat["ctime"] : null,
            "size" => isset($stat["size"]) ? (int) $stat["size"] : null,
        ];
    }
}
