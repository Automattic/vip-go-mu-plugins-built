<?php
/**
 * Static helpers shared by the server and client packages.
 *
 * Composer's classmap autoloads this class; nothing requires it by path. Loading
 * it must not perform I/O, register hooks, or change mutable global state.
 *
 * Several plugins on one site may each ship a copy of this package, and only
 * the copy that autoloads first supplies this class. A method added here does
 * not reach a site where an older copy wins, so callers in other packages
 * cannot assume it exists.
 */

namespace WordPress\Reprint\Server;

use InvalidArgumentException;
use RuntimeException;

final class Utils
{
    /**
     * Polyfill for PHP versions before 8.0, which lack str_starts_with().
     *
     * @param string $haystack String to search in.
     * @param string $needle Prefix to look for.
     * @return bool Whether $haystack begins with $needle.
     */
    public static function str_starts_with(string $haystack, string $needle): bool
    {
        if (function_exists('str_starts_with')) {
            // phpcs:ignore PHPCompatibility.FunctionUse.NewFunctions.str_starts_withFound -- Guarded by function_exists() above.
            return \str_starts_with($haystack, $needle);
        }

        return $needle === '' || strncmp($haystack, $needle, strlen($needle)) === 0;
    }

    /**
     * Polyfill for PHP versions before 8.0, which lack str_contains().
     *
     * @param string $haystack String to search in.
     * @param string $needle Substring to look for.
     * @return bool Whether $haystack contains $needle.
     */
    public static function str_contains(string $haystack, string $needle): bool
    {
        if (function_exists('str_contains')) {
            // phpcs:ignore PHPCompatibility.FunctionUse.NewFunctions.str_containsFound -- Guarded by function_exists() above.
            return \str_contains($haystack, $needle);
        }

        return $needle === '' || strpos($haystack, $needle) !== false;
    }

    /**
     * Returns cryptographically secure random bytes on every supported PHP version.
     *
     * @param int $length Number of bytes to return.
     * @return string Random bytes.
     * @throws RuntimeException When the runtime has no secure random-byte source.
     */
    public static function generate_random_bytes(int $length): string
    {
        if (function_exists('random_bytes')) {
            return random_bytes($length);
        }

        if (function_exists('openssl_random_pseudo_bytes')) {
            $strong = false;
            $bytes = openssl_random_pseudo_bytes($length, $strong);
            if ($bytes !== false && $strong && strlen($bytes) === $length) {
                return $bytes;
            }
        }

        throw new RuntimeException('The PHP runtime has no cryptographically secure random-byte source.');
    }

    /**
     * Divides two integers and rounds the result toward zero.
     *
     * @param int $dividend Number to divide.
     * @param int $divisor Number to divide by.
     * @return int Integer quotient.
     */
    public static function integer_divide(int $dividend, int $divisor): int
    {
        if (function_exists('intdiv')) {
            return intdiv($dividend, $divisor);
        }

        return intval($dividend / $divisor);
    }

    /** @return array<string,string> PDO DSN fields, including escaped semicolons. */
    public static function parse_pdo_dsn(string $dsn): array {
        $settings = [];
        $parts = explode(':', $dsn, 2);
        foreach (explode(';', str_replace(';;', "\0", $parts[1] ?? '')) as $setting) {
            $pair = explode('=', str_replace("\0", ';', $setting), 2);
            if (count($pair) === 2) {
                $settings[ltrim($pair[0])] = $pair[1];
            }
        }
        return $settings;
    }

    /**
     * Opens a dedicated connection without booting WordPress or sharing $wpdb.
     *
     * @param array<int,mixed> $options PDO options used when pdo_mysql is available.
     * @return \PDO|MysqliDriverPDO Dedicated MySQL connection.
     */
    public static function connect_mysql(string $dsn, string $user, string $password, array $options = []) {
        if (extension_loaded('pdo_mysql')) {
            return new \PDO($dsn, $user, $password, $options + [\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION]);
        }
        if (!extension_loaded('mysqli')) {
            throw new \RuntimeException('A dedicated MySQL connection requires either pdo_mysql or mysqli.');
        }
        return new MysqliDriverPDO($dsn, $user, $password);
    }

    /**
     * Builds a PDO DSN string from a WordPress DB_HOST value.
     *
     * WordPress's DB_HOST supports several non-standard formats that shared
     * hosts commonly use:
     *   - "localhost"              → standard hostname
     *   - "db.host.com:3307"      → hostname with port
     *   - "localhost:/path/sock"   → hostname with Unix socket
     *   - "/path/to/mysql.sock"   → bare Unix socket path
     *   - "::1"                   → IPv6 address
     *   - "[::1]"                 → bracketed IPv6
     *   - "[::1]:3306"            → bracketed IPv6 with port
     *   - "[::1]:/path/to/socket" → bracketed IPv6 with Unix socket
     *
     * PDO needs these broken out into separate DSN parameters (host, port,
     * unix_socket), so we parse the value the same way WordPress core does.
     *
     * @param string $db_host  Raw DB_HOST value.
     * @param string $db_name  Database name.
     * @return string PDO DSN string.
     */
    public static function build_pdo_dsn(string $db_host, string $db_name): string
    {
        $socket = '';
        $host   = $db_host;
        $port   = '';

        if (self::str_starts_with($db_host, '/') && file_exists($db_host)) {
            // Bare socket path: "/var/run/mysqld/mysqld.sock"
            $socket = $db_host;
            $host   = '';
        } elseif (
            self::str_starts_with($db_host, '[') &&
            ($bracket_end = strpos($db_host, ']')) !== false
        ) {
            // Bracketed IPv6: "[::1]", "[::1]:3306", "[::1]:/path/to/socket"
            $host = substr($db_host, 1, $bracket_end - 1);
            $after = substr($db_host, $bracket_end + 1);
            $candidate_socket = self::str_starts_with($after, ':/') ? substr($after, 1) : '';
            if ($candidate_socket !== '' && file_exists($candidate_socket)) {
                $socket = $candidate_socket;
            } elseif (self::str_starts_with($after, ':')) {
                $port = substr($after, 1);
            }
        } elseif (($socket_pos = strpos($db_host, ':/')) !== false) {
            // "host:/path/to/socket" — check before general colon split
            // to avoid misinterpreting IPv6 addresses as host:port
            $candidate_socket = substr($db_host, $socket_pos + 1);
            if (file_exists($candidate_socket)) {
                $host   = substr($db_host, 0, $socket_pos);
                $socket = $candidate_socket;
            } elseif (substr_count($db_host, ':') === 1) {
                // Single colon but not a socket — treat as host:port
                [$host, $port] = explode(':', $db_host, 2);
            }
        } elseif (
            self::str_contains($db_host, ':') &&
            substr_count($db_host, ':') === 1
        ) {
            // Exactly one colon: "host:port" — not IPv6
            [$host, $port] = explode(':', $db_host, 2);
        }
        // Otherwise (multiple colons, no socket marker): bare IPv6 like "::1"
        // — $host stays as the full value.

        if ($socket !== '') {
            return "mysql:unix_socket={$socket};dbname={$db_name};charset=utf8mb4";
        }

        $dsn = "mysql:host={$host}";
        if ($port !== '') {
            $dsn .= ";port={$port}";
        }
        $dsn .= ";dbname={$db_name};charset=utf8mb4";
        return $dsn;
    }

    /**
     * Parse a human-readable size string (e.g. "16M", "1G", "512K") into bytes.
     * Accepts plain integers as well.
     */
    public static function parse_size(string $value): int
    {
        $value = trim($value);
        if (!preg_match('/^(\d+(?:\.\d+)?)\s*([KMGkmg])?[Bb]?$/', $value, $m)) {
            throw new InvalidArgumentException(
                "Invalid size value: '{$value}'. Use a number optionally followed by K, M, or G (e.g. 64M)."
            );
        }
        $num = (float) $m[1];
        $suffix = strtoupper($m[2] ?? "");
        switch ($suffix) {
            case "K":
                return (int) ($num * 1024);
            case "M":
                return (int) ($num * 1024 * 1024);
            case "G":
                return (int) ($num * 1024 * 1024 * 1024);
            default:
                return (int) $num;
        }
    }

    /**
     * Throws on json_encode failure instead of returning false.
     *
     * Do NOT use inside error/shutdown handlers — those need hardcoded fallback strings.
     */
    public static function json_encode_or_throw($value, int $flags = 0): string
    {
        $json = json_encode($value, $flags);
        if ($json === false) {
            throw new RuntimeException("json_encode failed: " . json_last_error_msg());
        }
        return $json;
    }

    /**
     * Resolves a link target with the supplied source path format and base directory.
     *
     * D:\photos is a relative Unix name and an absolute Windows drive path. The
     * caller supplies 'unix' or 'windows'; neither the target nor the source link's
     * prefix selects those rules. For example:
     *
     *     Source link       Target       Format    Absolute target
     *     /site/gallery     D:\photos    unix      /site/D:\photos
     *     E:/site/gallery   D:\photos    windows   D:/photos
     *
     * A Windows source link may also start with //server/share. Normalize that
     * spelling with Windows rules before taking its parent directory. A single
     * leading target separator uses the source drive or share root. Drive-relative
     * CLI inputs such as D:photos need a current directory and are rejected.
     * Select files with a full drive or share path, or a WordPress path token.
     *
     * @param string $symlink_path Absolute source link path.
     * @param string $target Target returned by the source's readlink().
     * @param string $path_format Source path format: 'unix' or 'windows'.
     * @return string Absolute source target with dot segments resolved lexically.
     */
    public static function resolve_symlink_target_path(string $symlink_path, string $target, string $path_format): string
    {
        self::assert_valid_path($symlink_path, $path_format, 'Source symlink path');
        $symlink_path = self::normalize_path_separators($symlink_path, $path_format);
        $target = self::normalize_path_separators($target, $path_format);
        if ($path_format === 'windows' && self::str_starts_with($target, '/')) {
            $root = self::windows_share_root($symlink_path) ?? substr($symlink_path, 0, 3);
            return self::normalize_path(self::wp_join_unix_paths($root, substr($target, 1)), $path_format);
        }
        return self::normalize_path(
            self::is_absolute_path($target, $path_format) ? $target : self::wp_join_unix_paths(dirname($symlink_path), $target),
            $path_format
        );
    }

    /**
     * Resolve ".." and "." segments in a path without touching the filesystem.
     *
     * Unlike realpath(), this works on paths that don't exist yet. Windows drive
     * paths use forward slashes and retain their drive or share root, even on a
     * Unix client. Parent segments cannot climb above a share root. The format
     * comes from the source, not the path text. Unix mode keeps backslashes as
     * filename bytes. This lexical helper does not supply a current directory;
     * callers must resolve relative inputs against their base first.
     *
     * @param string $path Path after any required base-directory resolution.
     * @param string $path_format Path format: 'unix' or 'windows'.
     * @return string Path with dot segments removed.
     */
    public static function normalize_path(string $path, string $path_format): string
    {
        $path = self::normalize_path_separators($path, $path_format);
        $share_root = $path_format === 'windows' ? self::windows_share_root($path) : null;
        $root = $share_root !== null ? $share_root . '/' : "/";
        if ($share_root !== null) {
            $path = ltrim(substr($path, strlen($share_root)), '/');
        } elseif ($path_format === 'windows' && preg_match('~^[A-Z]:/~', $path)) {
            $root = substr($path, 0, 3);
            $path = substr($path, 3);
        }
        $parts = explode("/", $path);
        $resolved = [];
        foreach ($parts as $part) {
            if ($part === "" || $part === ".") {
                continue;
            }
            if ($part === "..") {
                array_pop($resolved);
            } else {
                $resolved[] = $part;
            }
        }
        return $share_root !== null && $resolved === []
            ? $share_root
            : $root . implode("/", $resolved);
    }

    /**
     * Removes trailing slashes without changing the filesystem root into an empty path.
     *
     * Unlike rtrim($path, '/'), this returns `/` for both the filesystem root and
     * an empty input. Windows drive paths use forward slashes and keep `D:/`
     * intact. It only changes the lexical spelling; it does not validate the path
     * or resolve dot segments and symlinks.
     *
     * Examples:
     *
     *     Utils::trim_right_slash('/srv/site///', 'unix'); // '/srv/site'
     *     Utils::trim_right_slash('/', 'unix');            // '/'
     *     Utils::trim_right_slash('', 'unix');             // '/'
     *
     * @param string $path Path whose trailing slashes to remove.
     * @param string $path_format Path format: 'unix' or 'windows'.
     * @return string A path without trailing slashes, or `/` for the filesystem root.
     */
    public static function trim_right_slash(string $path, string $path_format): string
    {
        $path = self::normalize_path_separators($path, $path_format);
        $trimmed = rtrim($path, '/');
        if ($path_format === 'windows' && preg_match('~^[A-Z]:/+$~', $path)) {
            return $trimmed . '/';
        }
        return $trimmed ?: '/';
    }

    /**
     * Canonicalizes an absolute path through the nearest ancestor realpath() can resolve.
     *
     * The final components need not exist. The function resolves a real ancestor,
     * then appends the missing components without creating them. A broken symlink
     * cannot be resolved safely, so its normalized lexical spelling is retained.
     *
     * Examples:
     *
     *     Utils::realpath_with_missing_tail('/srv/site');
     *     // '/srv/site' when /srv/site exists
     *
     *     Utils::realpath_with_missing_tail('/srv/site/state/push');
     *     // '/srv/site/state/push' when /srv/site exists but state/push do not
     *
     *     Utils::realpath_with_missing_tail('/links/site/state');
     *     // '/srv/site/state' when /links/site is a symlink to /srv/site
     *
     * This does not create, remove, or otherwise modify filesystem entries.
     *
     * @throws InvalidArgumentException When $absolute_path is not absolute.
     */
    public static function realpath_with_missing_tail(string $absolute_path): string
    {
        if ($absolute_path === '' || $absolute_path[0] !== '/') {
            throw new InvalidArgumentException('Path must be absolute: ' . $absolute_path);
        }

        $normalized_path = self::normalize_path($absolute_path, 'unix');
        $missing_components = [];
        $existing_ancestor = $normalized_path;
        $canonical_existing_ancestor = realpath($existing_ancestor);

        while ($canonical_existing_ancestor === false) {
            // Keep a broken symlink lexical: resolving past it would change what a
            // future replacement of that link means.
            if (is_link($existing_ancestor)) {
                return $normalized_path;
            }

            $parent = dirname($existing_ancestor);
            if ($parent === $existing_ancestor) {
                return $normalized_path;
            }
            array_unshift($missing_components, basename($existing_ancestor));
            $existing_ancestor = $parent;
            $canonical_existing_ancestor = realpath($existing_ancestor);
        }

        if ($missing_components === []) {
            return self::normalize_path($canonical_existing_ancestor, 'unix');
        }

        return self::normalize_path(
            $canonical_existing_ancestor . '/' . implode('/', $missing_components),
            'unix'
        );
    }

    /**
     * Normalizes document-root-relative excluded paths.
     *
     * Rejects non-string, empty, absolute, NUL-containing, backslash-containing,
     * and empty/dot/parent-component paths, then sorts and deduplicates them.
     *
     * @param string[] $excluded_paths Paths which a push must not change.
     * @phpstan-param array<mixed> $excluded_paths
     * @return list<string> Validated excluded paths in bytewise order.
     */
    public static function normalize_excluded_paths(array $excluded_paths): array
    {
        // phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- These validation exceptions are never rendered, and arbitrary path bytes are represented as base64.
        $normalized_excluded_paths = [];
        foreach ($excluded_paths as $path) {
            if (!is_string($path)) {
                throw new InvalidArgumentException('Each excluded path must be a string; observed ' . gettype($path) . '.');
            }
            if ($path !== '' && $path[0] === '/') {
                throw new InvalidArgumentException('Excluded path must be document-root-relative: ' . base64_encode($path) . '.');
            }
            self::assert_valid_relative_path($path, 'Excluded path');
            $normalized_excluded_paths[] = $path;
        }
        sort($normalized_excluded_paths, SORT_STRING);
        $normalized_excluded_paths = array_values(array_unique($normalized_excluded_paths));
        if (count($normalized_excluded_paths) > 100) {
            throw new InvalidArgumentException(
                'Push supports at most 100 excluded paths; received '
                . count($normalized_excluded_paths)
                . ' after normalization.'
            );
        }
        return $normalized_excluded_paths;
    }

    /**
     * Validates a document-root-relative path carried as raw bytes.
     *
     * A valid path has one or more slash-delimited components. It cannot be
     * absolute, use Windows separators, include a NUL byte, or contain empty,
     * current-directory, or parent-directory components. It deliberately does
     * not trim whitespace: spaces and other non-reserved bytes are valid file
     * name bytes.
     *
     * Examples:
     *
     *     Utils::assert_valid_relative_path('wp-content/plugins', 'Excluded path');
     *     Utils::assert_valid_relative_path('index.php', 'Document-root-relative path');
     *
     * @param string $path Raw path bytes to validate.
     * @param string $label Human-readable name at the start of validation errors.
     * @throws InvalidArgumentException When the path has a reserved form.
     */
    public static function assert_valid_relative_path(string $path, string $label): void
    {
        if ($path === '') {
            throw new InvalidArgumentException("{$label} must not be empty.");
        }
        if ($path[0] === '/') {
            throw new InvalidArgumentException("{$label} must not be absolute: " . base64_encode($path) . '.');
        }
        if (strpos($path, "\0") !== false) {
            throw new InvalidArgumentException("{$label} must not contain a NUL byte: " . base64_encode($path) . '.');
        }
        if (strpos($path, '\\') !== false) {
            throw new InvalidArgumentException("{$label} must not contain a backslash: " . base64_encode($path) . '.');
        }
        foreach (explode('/', $path) as $component) {
            if ($component === '') {
                throw new InvalidArgumentException("{$label} must not contain an empty component: " . base64_encode($path) . '.');
            }
            if ($component === '.') {
                throw new InvalidArgumentException("{$label} must not contain a dot component: " . base64_encode($path) . '.');
            }
            if ($component === '..') {
                throw new InvalidArgumentException("{$label} must not contain a parent component: " . base64_encode($path) . '.');
            }
        }
    }

    // phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped

    /**
     * Indicates whether a candidate path is the same as or a descendant of an
     * ancestor. Both inputs must already use slash-delimited path components.
     * Convert Windows inputs with their explicit format before comparing them.
     * This comparison preserves backslashes, case, and all other name bytes.
     *
     * Either argument may be a list. The result is true when any candidate-and-
     * ancestor pair matches. `/` matches Unix absolute paths; a drive root such as
     * `D:/` matches only that drive. Roots cannot use the normal ancestor-plus-slash
     * prefix because that would add a second slash.
     *
     * Examples:
     *
     *     Utils::path_is_same_as_or_descendant_of('/srv/site', '/srv/site');            // true
     *     Utils::path_is_same_as_or_descendant_of('/srv/site/wp-content', '/srv/site'); // true
     *     Utils::path_is_same_as_or_descendant_of('/srv/site-old', '/srv/site');        // false
     *     Utils::path_is_same_as_or_descendant_of('/', '/');                             // true
     *
     * @param string|list<string> $path Candidate path or paths.
     * @param string|list<string> $ancestor Ancestor path or paths.
     * @return bool Whether a candidate is the same as or a descendant of an
     *              ancestor.
     * @throws InvalidArgumentException If either scalar value is not a string.
     */
    public static function path_is_same_as_or_descendant_of($path, $ancestor): bool
    {
        if (is_array($path)) {
            foreach ($path as $candidate_path) {
                if (self::path_is_same_as_or_descendant_of($candidate_path, $ancestor)) {
                    return true;
                }
            }
            return false;
        }
        if (is_array($ancestor)) {
            foreach ($ancestor as $candidate_ancestor) {
                if (self::path_is_same_as_or_descendant_of($path, $candidate_ancestor)) {
                    return true;
                }
            }
            return false;
        }
        if (!is_string($path) || !is_string($ancestor)) {
            throw new InvalidArgumentException('Path containment expects strings or lists of strings.');
        }
        if (substr($ancestor, -1) === "/") {
            return self::str_starts_with($path, $ancestor);
        }
        return $path === $ancestor || self::str_starts_with($path, $ancestor . "/");
    }

    /**
     * Indicates whether a slash-delimited path is a descendant of an ancestor.
     * Inputs follow the same no-conversion contract as path_is_same_as_or_descendant_of().
     *
     * Either argument may be a list. The result is true when any candidate-and-
     * ancestor pair has a component-boundary match below the ancestor. Unlike
     * path_is_same_as_or_descendant_of(), equal paths do not match. The
     * filesystem root contains every absolute descendant, but not itself.
     *
     * Examples:
     *
     *     Utils::path_is_descendant_of('/srv/site/wp-content', '/srv/site'); // true
     *     Utils::path_is_descendant_of('/srv/site', '/srv/site');            // false
     *     Utils::path_is_descendant_of('/srv/site-old', '/srv/site');        // false
     *     Utils::path_is_descendant_of('/wp-content', '/');                  // true
     *     Utils::path_is_descendant_of('/', '/');                             // false
     *
     * @param string|list<string> $path Candidate path or paths.
     * @param string|list<string> $ancestor Ancestor path or paths.
     * @return bool Whether a candidate is a descendant of an ancestor.
     * @throws InvalidArgumentException If either scalar value is not a string.
     */
    public static function path_is_descendant_of($path, $ancestor): bool
    {
        if (is_array($path)) {
            foreach ($path as $candidate_path) {
                if (self::path_is_descendant_of($candidate_path, $ancestor)) {
                    return true;
                }
            }
            return false;
        }
        if (is_array($ancestor)) {
            foreach ($ancestor as $candidate_ancestor) {
                if (self::path_is_descendant_of($path, $candidate_ancestor)) {
                    return true;
                }
            }
            return false;
        }
        if (!self::path_is_same_as_or_descendant_of($path, $ancestor)) {
            return false;
        }
        return $path !== $ancestor;
    }

    /**
     * Returns the remainder of slash-delimited $path underneath $prefix.
     * Neither argument is converted; callers normalize with the known format first.
     *
     * An exact match returns an empty string. A descendant returns the remainder
     * beginning with "/". A path outside $prefix returns null.
     */
    public static function path_remainder_under(string $path, string $prefix): ?string
    {
        $path = rtrim($path, "/");
        $prefix = rtrim($prefix, "/");

        if ($path === $prefix) {
            return "";
        }

        if (self::str_starts_with($path, $prefix . "/")) {
            return substr($path, strlen($prefix));
        }

        return null;
    }

    /**
     * Returns a path relative to a slash-delimited root, or null when it is not
     * equal to or below that root.
     *
     * Use this when a caller needs a path for a root-relative field. It performs
     * the component-boundary test and removes the separating slash in one step,
     * rather than letting a byte-offset slice treat `/srv/site-old` as below
     * `/srv/site`.
     *
     * Examples:
     *
     *     Utils::relative_path_under('/srv/site/wp-content', '/srv/site'); // 'wp-content'
     *     Utils::relative_path_under('/srv/site', '/srv/site');            // ''
     *     Utils::relative_path_under('/srv/site-old', '/srv/site');        // null
     *     Utils::relative_path_under('/wp-content', '/');                  // 'wp-content'
     *     Utils::relative_path_under('wp-content/plugins', '');            // 'wp-content/plugins'
     *
     * Trailing slashes do not change the result. This is a lexical operation: it
     * does not resolve dot segments or symlinks, and it also accepts relative
     * slash-delimited paths. An empty root contains every relative path, but no
     * absolute path.
     *
     * @param string $path Candidate path to make relative.
     * @param string $root Root that must contain the candidate path.
     * @return string|null A path without a leading slash, an empty string for an
     *                     exact match, or null when the path is outside the root.
     */
    public static function relative_path_under(string $path, string $root): ?string
    {
        if ($root === "") {
            return self::str_starts_with($path, "/") ? null : rtrim($path, "/");
        }
        $remainder = self::path_remainder_under($path, $root);
        return $remainder === null ? null : ltrim($remainder, "/");
    }

    /**
     * Validates that a path is a non-empty absolute string without NUL bytes
     * or dot-segments (. or ..). Windows drive and UNC paths may use either
     * separator below their root; drive-relative paths such as `D:site` are rejected.
     *
     * Useful anywhere untrusted or remote paths need to be checked before
     * use — both the exporter (directory config) and the importer (remote
     * paths from the server) share this validation.
     *
     * The caller must supply the source format. D:\photos passes in Windows
     * mode and fails in Unix mode because that Unix name has no absolute root.
     * Validation cannot determine the format or the base of a relative path.
     *
     * @param string $path  The path to validate.
     * @param string $path_format Path format: 'unix' or 'windows'.
     * @param string $label Human-readable label for error messages (e.g. "directory", "remote path").
     * @throws InvalidArgumentException When the path fails any check.
     */
    public static function assert_valid_path(string $path, string $path_format, string $label = "path"): void
    {
        $path = self::normalize_path_separators($path, $path_format);
        if ($path === "") {
            throw new InvalidArgumentException("{$label} must be a non-empty string");
        }
        if (!self::is_absolute_path($path, $path_format)) {
            throw new InvalidArgumentException("{$label} must be an absolute path: {$path}");
        }
        if (strpos($path, "\0") !== false) {
            throw new InvalidArgumentException("{$label} must not contain NUL bytes");
        }
        foreach (explode("/", $path) as $segment) {
            if ($segment === "." || $segment === "..") {
                throw new InvalidArgumentException(
                    "{$label} must not contain dot-segments (. or ..): {$path}"
                );
            }
        }
    }

    /**
     * Converts separators using an explicit path format, without resolving the path.
     *
     * The same bytes can have different meanings. The format must come from the
     * source preflight for remote paths, or from the local OS for local paths.
     * Never select the format from the path prefix. For example:
     *
     *     Input                              Format    Output
     *     D:\photos                          unix      D:\photos
     *     D:\photos                          windows   D:/photos
     *     //server/share/photos              unix      //server/share/photos
     *     //server/share/photos              windows   \\SERVER\SHARE/photos
     *     /site/workspace\group\user/www      unix      /site/workspace\group\user/www
     *
     * Unix mode returns every byte unchanged, including Windows-looking relative
     * names. Windows mode accepts both separators, including in relative targets.
     * It gives drive letters and share roots a stable spelling for indexes and
     * path rules. It preserves filename case, trailing dots and spaces. A share
     * keeps a \\SERVER\SHARE root; separators below it become forward slashes.
     *
     * This does not make a relative path absolute. Link targets also need the
     * source link's directory; use resolve_symlink_target_path(). Windows CLI
     * inputs such as D:photos need a current directory and are rejected.
     * CLI selections also reject namespace prefixes; use a full drive or share path.
     * Dot segments remain intact so validation can reject them before removal.
     *
     * @param string $path Native or remote path, absolute or relative.
     * @param string $path_format Path format: 'unix' or 'windows'. No inferred default.
     * @return string Path with separators interpreted only under the supplied format.
     */
    public static function normalize_path_separators(string $path, string $path_format): string
    {
        self::assert_valid_path_format($path_format);
        if ($path_format === 'unix') {
            return $path;
        }
        $path = str_replace('\\', '/', $path);
        $share_root = self::windows_share_root($path);
        if ($share_root !== null) {
            $tail = preg_replace('~/+~', '/', substr($path, strlen($share_root)));
            return $share_root . ( $tail === '/' ? '' : $tail );
        }
        if (preg_match('~^[a-zA-Z]:/~', $path)) {
            $path = strtoupper($path[0]) . substr($path, 1);
        }
        return preg_replace('~/+~', '/', $path);
    }

    /**
     * Checks for a complete root under the supplied path format.
     *
     * D:\photos is absolute only in Windows mode. /photos is absolute only in
     * Unix mode; on Windows it still needs a drive. A Windows share may use
     * either separator. This checks spelling, not existence or link targets.
     *
     * @param string $path Native or remote filesystem path.
     * @param string $path_format Path format: 'unix' or 'windows'.
     * @return bool Whether the path is independent of a base directory or drive.
     */
    public static function is_absolute_path(string $path, string $path_format): bool
    {
        $path = self::normalize_path_separators($path, $path_format);
        if ($path_format === 'unix') {
            return self::str_starts_with($path, '/');
        }
        return preg_match('~^[A-Z]:/~', $path) === 1 || self::windows_share_root($path) !== null;
    }

    /**
     * Reads the source format without guessing from a path or a capability flag.
     *
     * Servers without the field use the earlier Unix-only path contract. A present
     * invalid value must fail rather than acquire that compatibility default.
     *
     * @param array $preflight_data { Source preflight data.
     *     @type string $path_format Optional 'unix' or 'windows'; absent on older servers.
     * }
     * @return string Validated source path format.
     */
    public static function preflight_path_format(array $preflight_data): string
    {
        $path_format = array_key_exists('path_format', $preflight_data) ? $preflight_data['path_format'] : 'unix';
        self::assert_valid_path_format($path_format);
        return $path_format;
    }

    /**
     * Rejects a missing or unknown format instead of guessing from a path string.
     *
     * @param mixed $path_format Format supplied by a caller or preflight response.
     * @throws InvalidArgumentException When the value is not 'unix' or 'windows'.
     */
    public static function assert_valid_path_format($path_format): void
    {
        if (!in_array($path_format, ['unix', 'windows'], true)) {
            throw new InvalidArgumentException('Path format must be "unix" or "windows"; received ' . json_encode($path_format) . '.');
        }
    }

    /**
     * Returns the path format of this PHP process, never the remote host's format.
     */
    public static function native_path_format(): string
    {
        return PHP_OS === 'WINNT' ? 'windows' : 'unix';
    }

    /**
     * Returns the server and share of an explicitly Windows UNC path.
     *
     * The caller must already know that the path uses Windows rules. Both
     * //server/share and \\server\share are accepted here. Do not use this parser
     * to identify a source OS: the first spelling is also an absolute Unix path.
     * Device namespaces and incomplete shares return null. CLI selections reject
     * these forms; use a full drive path or a complete ordinary share path.
     *
     * @param string $path Native or remote filesystem path.
     * @return string|null Canonical `\\SERVER\SHARE` root, or null for other paths.
     */
    public static function windows_share_root(string $path): ?string
    {
        $path = str_replace('/', '\\', $path);
        if (
            preg_match('~^\\\\\\\\([^\\\\/]+)[\\\\/]([^\\\\/]+)~', $path, $parts) !== 1
            || in_array($parts[1], ['.', '..', '?'], true)
            || in_array($parts[2], ['.', '..'], true)
        ) {
            return null;
        }
        return '\\\\' . strtoupper($parts[1]) . '\\' . strtoupper($parts[2]);
    }

    /**
     * Remove selected local files and directories after the caller saves their push exclusions.
     *
     * @param string[] $excluded_local_paths Paths relative to the local site root.
     * @param string   $local_document_root  Local site root with the standard wp-content layout.
     * @return string[] Paths removed, relative to the local site root. Absent paths are omitted.
     */
    public static function remove_local_files_and_directories(array $excluded_local_paths, string $local_document_root): array
    {
        $removed_paths = [];
        foreach ($excluded_local_paths as $relative_path) {
            $full_path = self::wp_join_unix_paths($local_document_root, $relative_path);
            if (!file_exists($full_path) && !is_link($full_path)) {
                continue;
            }
            if (is_dir($full_path) && !is_link($full_path)) {
                self::remove_directory_and_its_contents($full_path);
            } else {
                unlink($full_path);
            }
            clearstatcache(true, $full_path);
            if (file_exists($full_path) || is_link($full_path)) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- CLI filesystem error, not HTML.
                throw new RuntimeException("Could not remove source-host path: {$full_path}.");
            }
            $removed_paths[] = $relative_path;
        }
        return $removed_paths;
    }

    /**
     * Recursively remove a directory and all its contents.
     *
     * Child symlinks are unlinked, not followed. Removal errors are left to callers
     * to check; runtime-file refresh tolerates them, host-plugin cleanup does not.
     *
     * @param string $directory Directory to remove.
     */
    public static function remove_directory_and_its_contents(string $directory): void
    {
        if (!is_dir($directory)) {
            return;
        }
        $entries = scandir($directory);
        if (false === $entries) {
            return;
        }
        foreach ($entries as $entry) {
            if ('.' === $entry || '..' === $entry) {
                continue;
            }
            $path = self::wp_join_unix_paths($directory, $entry);
            if (is_dir($path) && !is_link($path)) {
                self::remove_directory_and_its_contents($path);
            } else {
                @unlink($path);
            }
        }
        @rmdir($directory);
    }

    // ---------------------------------------------------------------------------
    // Vendored from wp-php-toolkit/filesystem.
    //
    // This is a copy of WordPress\Filesystem\wp_join_unix_paths(), kept in sync by
    // hand. Do not "fix" it by importing the original: reprint-server must require
    // nothing but PHP.
    //
    // Consumers vendor this package into Composer autoloaders that are not scoped
    // to one plugin — Jetpack's is the one that bites. It folds every installed
    // package's psr-4, classmap and files entries into site-global manifests that
    // arbitrate class and function names, by version, across every plugin on the
    // site. Requiring wp-php-toolkit/filesystem would publish WordPress\Filesystem
    // site-wide, where it would be arbitrated against the copy WordPress Importer
    // already ships through data-liberation. Two copies of one namespace in one
    // version-arbitrated manifest is what produced Automattic/jetpack#51027.
    //
    // WordPress core's path_join() is not a substitute. It takes two arguments
    // rather than being variadic, does not collapse duplicate slashes, and returns
    // the second argument alone when that is absolute, discarding the base. Its
    // path_is_absolute() check also calls realpath() plus a stream-wrapper lookup,
    // and class-file-index-processor.php calls this once per directory entry in
    // the file walk.
    // ---------------------------------------------------------------------------
    /**
     * Joins path segments into one Unix path, collapsing duplicate slashes.
     *
     * Empty segments are skipped. A leading slash on the first non-empty segment
     * is preserved. Trailing slashes are left as the caller wrote them.
     *
     * Examples:
     *
     *     Utils::wp_join_unix_paths('/srv/site', 'wp-content'); // '/srv/site/wp-content'
     *     Utils::wp_join_unix_paths('/srv/site/', '/uploads');  // '/srv/site/uploads'
     *     Utils::wp_join_unix_paths('', 'wp-content', '');      // 'wp-content'
     *
     * @param string ...$path_segments Segments to join.
     * @return string The joined path.
     */
    public static function wp_join_unix_paths(...$path_segments)
    {
        $input_starts_with_slash = null;

        $paths = [];
        foreach ($path_segments as $path_segment) {
            if ($path_segment !== '') {
                $paths[] = $path_segment;
                if ($input_starts_with_slash === null) {
                    $input_starts_with_slash = strncmp($path_segment, '/', strlen('/')) === 0;
                }
            }
        }
        $path = implode('/', $paths);

        $result = preg_replace('#/+#', '/', $path);
        if ($input_starts_with_slash && strncmp($result, '/', strlen('/')) !== 0) {
            $result = '/' . $result;
        }

        return $result;
    }

    /**
     * Prepares a native source path for PHP file access without changing filenames.
     *
     * Call this before source file I/O, including lstat() and realpath(). For two
     * files named report and report., Windows PHP can return report's metadata
     * for report. even though it cannot open report. itself. A trailing space
     * has the same problem. Reject the whole path before PHP can select a sibling.
     * This also catches literal names returned by a directory listing, not just
     * paths supplied by the user. Unix filenames pass through unchanged.
     *
     * PHP can read long UNC paths through the \\.\UNC\ spelling even when ordinary
     * UNC metadata lookup fails. Keep ordinary paths on their usual PHP path,
     * including its open_basedir checks. Use the prefix only at I/O; indexes and cursors
     * retain the shared path. source_realpath() removes the I/O prefix on return.
     * The source process's OS selects this behavior, never a remote path's prefix.
     * No native extension or external command is used to bypass PHP file access.
     */
    public static function source_io_path(string $path): string {
        if (PHP_OS === 'WINNT' && preg_match('~[. ](?:[/\\\\]|$)~', $path)) {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- This is an API error, not HTML.
            throw new \RuntimeException('Cannot read the exact Windows filename ' . $path . '. PHP cannot safely read a name ending in a dot or space. Rename it on the source before migration.');
        }
        if (PHP_OS === 'WINNT' && self::windows_share_root($path) !== null && @lstat($path) === false) {
            return '\\\\.\\UNC\\' . ltrim(str_replace('/', '\\', $path), '\\');
        }
        return $path;
    }

    /**
     * Checks the source metadata, including Windows junctions that is_link() misses.
     */
    public static function source_is_link(string $path): bool {
        $stat = @self::source_lstat($path);
        return $stat !== false && ( $stat['mode'] & 0170000 ) === 0120000;
    }

    /**
     * Reads source metadata and identifies Windows junctions through PHP readlink().
     *
     * Windows PHP lstat() reports symbolic links, but leaves the type bits at zero
     * for junctions. is_link() therefore returns false and would let a no-follow
     * pull traverse the target. Obtain the target before reporting a link type.
     * An unrecognized reparse point that leads back to itself must fail rather
     * than become a fabricated self-link or disappear as an unknown file type.
     *
     * Windows PHP exposes creation time as ctime. Keep that same convention in
     * the index and post-read checks; changing clocks would invalidate existing
     * change records. Same-size edits can escape these fields.
     *
     * @return array|false { PHP stat fields, or false on failure. Numeric keys 0-12
     *     repeat these fields in the same order, as in lstat().
     *     @type int $dev     Device number.
     *     @type int $ino     File identifier.
     *     @type int $mode    Type and permissions; junctions have link type bits.
     *     @type int $nlink   Number of hard links.
     *     @type int $uid     User ID.
     *     @type int $gid     Group ID.
     *     @type int $rdev    Device type, when applicable.
     *     @type int $size    File size in bytes.
     *     @type int $atime   Access time.
     *     @type int $mtime   Modification time.
     *     @type int $ctime   Change time on Unix; creation time on Windows.
     *     @type int $blksize Filesystem block size, or -1 when unavailable.
     *     @type int $blocks  Allocated blocks, or -1 when unavailable.
     * }
     */
    public static function source_lstat(string $path) {
        $stat = lstat(self::source_io_path($path));
        if (PHP_OS === 'WINNT' && $stat !== false && ( $stat['mode'] & 0170000 ) === 0) {
            $target = self::source_readlink($path);
            if (self::normalize_path_separators($target, 'windows') === self::normalize_path_separators($path, 'windows')) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- This is an API error, not HTML.
                throw new \RuntimeException('PHP cannot identify the Windows reparse point: ' . $path . '. Copy it to an ordinary file or directory before migration.');
            }
            $stat['mode'] |= 0120000;
            $stat[2] = $stat['mode'];
        }
        return $stat;
    }

    /**
     * Resolves source paths through PHP and returns the shared index spelling.
     *
     * Windows PHP realpath() can fail on a link whose stored target starts at the
     * drive root, even when readlink() returns its accessible absolute target.
     * Resolve that target through PHP too. No file bytes are read through the
     * original link; the index schedules the resolved path for the later fetch.
     * A target that PHP still cannot resolve remains false, like ordinary realpath.
     *
     * Normalize the result using this source process's format. PHP on Windows
     * returns backslashes; index comparisons must not compare those bytes against
     * slash-delimited configured roots. Unix backslashes remain filename bytes.
     *
     * @return string|false Resolved source path, or false when PHP cannot resolve it.
     */
    public static function source_realpath(string $path) {
        $resolved = realpath(self::source_io_path($path));
        if ($resolved === false && PHP_OS === 'WINNT' && self::source_is_link($path)) {
            $target = self::source_readlink($path);
            $resolved = realpath(self::source_io_path(self::resolve_symlink_target_path($path, $target, 'windows')));
        }
        if ($resolved !== false && PHP_OS === 'WINNT' && strncasecmp($resolved, '\\\\.\\UNC\\', 8) === 0) {
            $resolved = '\\\\' . substr($resolved, 8);
        }
        return $resolved === false ? false : self::normalize_path_separators($resolved, self::native_path_format());
    }

    /**
     * Reads a link through PHP, stopping if Windows cannot return its target.
     *
     * Windows PHP can follow a relative forward-slash target while readlink()
     * fails with error 123. Returning an empty target would lose a readable link.
     * Do not replace it with realpath(): that would hide intermediate links.
     */
    public static function source_readlink(string $path) {
        $target = readlink(self::source_io_path($path));
        if ($target === false && PHP_OS === 'WINNT') {
            // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- This is an API error, not HTML.
            throw new \RuntimeException('PHP cannot read the Windows link target: ' . $path . '. Recreate the link with a backslash target before migration.');
        }
        return $target;
    }

    /** @var bool|null Test-only override; null means ask the runtime. */
    private static $key_auth_required_override = null;

    /**
     * Whether this host accepts public-key signatures and refuses HMAC.
     *
     * function_exists, not extension_loaded: a host that ships the extension
     * but blocks openssl_verify through disable_functions cannot verify a key
     * and must stay on HMAC. There is no option, constant, or environment
     * variable behind this; the host's capability is the whole decision.
     *
     * @return bool
     */
    public static function key_auth_required(): bool
    {
        if (self::$key_auth_required_override !== null) {
            return self::$key_auth_required_override;
        }
        return function_exists('openssl_verify');
    }

    /**
     * Forces key_auth_required() for tests that must exercise the HMAC branch
     * on a machine that has OpenSSL, or the reverse. Not configuration: only
     * PHP already running in the process can call it, and nothing in
     * production does. Pass null to clear.
     *
     * @param bool|null $value Forced answer, or null to ask the runtime again.
     */
    public static function override_key_auth_required_for_tests(?bool $value): void
    {
        self::$key_auth_required_override = $value;
    }

    /**
     * Returns a request header by its HTTP name or its $_SERVER name, or null
     * when it is absent or empty. No auth header means anything when empty.
     *
     * @param array<string|int,mixed> $headers Request headers, either convention.
     */
    public static function request_header(array $headers, string $name): ?string
    {
        $server_name = 'HTTP_' . strtoupper(str_replace('-', '_', $name));
        foreach ($headers as $key => $value) {
            if (!is_string($value)) {
                continue;
            }
            $header_key = (string) $key;
            if (strcasecmp($header_key, $name) === 0 || strcasecmp($header_key, $server_name) === 0) {
                return $value === '' ? null : $value;
            }
        }
        return null;
    }

    /**
     * Returns the current request's headers: getallheaders() where the SAPI
     * provides it, followed by every HTTP_* entry of $_SERVER.
     *
     * @return array<string,string>
     */
    public static function request_headers(): array
    {
        $headers = [];
        if (function_exists('getallheaders')) {
            $all_headers = getallheaders();
            if (is_array($all_headers)) {
                $headers = $all_headers;
            }
        }
        foreach ($_SERVER as $key => $value) {
            if (strpos( (string) $key, 'HTTP_') !== 0 || !is_string($value)) {
                continue;
            }
            $headers[$key] = $value;
        }
        return $headers;
    }

    /** The protocol generation every plugin authentication error reports as auth_version. */
    public const AUTH_VERSION = 2;

    /** The first client release that signs tokens with the v2 message. */
    public const AUTH_VERSION_CLIENT_RELEASE = '0.11.0';

    /**
     * Refuses a released token client. Every released token client sends
     * X-Auth-Content-Hash on every request, and no key client or v2 token
     * client sends it. Released key clients sign the key message this server
     * verifies, so they pass here.
     *
     * @param array<string,mixed> $headers Request headers in either convention.
     * @return string|null Null unless the request comes from a released token client.
     */
    public static function client_update_error(array $headers): ?string {
        if (self::request_header($headers, 'X-Auth-Content-Hash') === null) {
            return null;
        }
        return 'Update the Reprint client to version ' . self::AUTH_VERSION_CLIENT_RELEASE . ' or later.';
    }

    /**
     * Checks the freshness fields of a signed request: a decimal timestamp
     * within the tolerance of now, then a hexadecimal nonce of at least 16
     * characters. The timestamp is strictly digits with an optional fraction,
     * as every client writes it, so it cannot carry whitespace into the signed
     * message.
     *
     * @param string     $nonce               Value of X-Auth-Nonce.
     * @param string     $timestamp           Value of X-Auth-Timestamp.
     * @param int        $timestamp_tolerance Seconds either side of now.
     * @param float|null $now                 Current time. Null reads the clock.
     * @return array{0:string,1:string}|null Null when fresh, else the failure reason and message.
     */
    public static function freshness_error(string $nonce, string $timestamp, int $timestamp_tolerance, ?float $now): ?array {
        if (!preg_match('/^[0-9]+(\.[0-9]+)?\z/', $timestamp)) {
            return ['auth_failed', 'Invalid timestamp format'];
        }
        $time_difference = abs(( $now === null ? microtime(true) : $now ) - (float) $timestamp);
        if ($time_difference > $timestamp_tolerance) {
            return [
                'timestamp_expired',
                sprintf('Request timestamp expired. Difference: %.2f seconds, max allowed: %d seconds', $time_difference, $timestamp_tolerance),
            ];
        }
        if (!preg_match('/^[0-9a-fA-F]{16,}\z/', $nonce)) {
            return ['auth_failed', 'Nonce must be at least 16 hexadecimal characters'];
        }
        return null;
    }

    /**
     * Returns the URL of one endpoint. The endpoint travels in the query so
     * the signed request target names the operation.
     *
     * @param string              $api_url    API URL as supplied, routing query included.
     * @param string              $endpoint   Endpoint name.
     * @param array<string,mixed> $parameters Further query parameters, after the endpoint.
     */
    public static function endpoint_url(string $api_url, string $endpoint, array $parameters = []): string {
        $api_url = rtrim($api_url, '?&');
        $query = http_build_query(array_merge(['endpoint' => $endpoint], $parameters), '', '&', PHP_QUERY_RFC3986);
        return $api_url . ( strpos($api_url, '?') === false ? '?' : '&' ) . $query;
    }

    /**
     * Reduces a public key to its one-line base64 body.
     *
     * Accepts exactly one BEGIN PUBLIC KEY block or the bare body. Strips the
     * armour and every whitespace byte, so CRLF, trailing newlines and
     * indentation all produce the same result. This one-line form is what the
     * site stores, what the administrator pastes, and what the key id hashes.
     *
     * @param string $pem_or_one_line PEM text or one-line base64.
     * @return string One-line base64 body.
     * @throws InvalidArgumentException When the input is not one public key block or
     *                                  bare body, or the body is empty or not strict base64.
     */
    public static function normalize_public_key(string $pem_or_one_line): string
    {
        $trimmed = trim($pem_or_one_line);
        if (preg_match('/\A-----BEGIN PUBLIC KEY-----([^-]*)-----END PUBLIC KEY-----\z/', $trimmed, $matches) === 1) {
            $body = $matches[1];
        } elseif (strpos($trimmed, '-----') === false) {
            $body = $trimmed;
        } else {
            throw new InvalidArgumentException('Public key must be one BEGIN PUBLIC KEY block or one line of base64.');
        }
        $one_line = preg_replace('/\s+/', '', $body);
        if (!is_string($one_line) || $one_line === '') {
            throw new InvalidArgumentException('Public key is empty.');
        }
        if (base64_decode($one_line, true) === false) {
            throw new InvalidArgumentException('Public key is not valid base64.');
        }
        return $one_line;
    }

    /**
     * Re-wraps a one-line public key as the PEM block OpenSSL parses.
     *
     * @param string $one_line One-line base64 body from normalize_public_key().
     * @return string PEM text with a trailing newline.
     * @throws InvalidArgumentException When the input is not one line of strict base64.
     */
    public static function public_key_to_pem(string $one_line): string
    {
        if (preg_match('/\A[A-Za-z0-9+\/]+={0,2}\z/', $one_line) !== 1) {
            throw new InvalidArgumentException('Public key must be one line of base64. Pass it through normalize_public_key() first.');
        }
        return "-----BEGIN PUBLIC KEY-----\n"
            . chunk_split($one_line, 64, "\n")
            . "-----END PUBLIC KEY-----\n";
    }

    /**
     * Computes the key id: the first 16 hex characters of SHA-256 over the
     * DER bytes. Both sides compute it from the same bytes, so nothing has to
     * be coordinated.
     *
     * @param string $pem_or_one_line PEM text or one-line base64.
     * @return string Sixteen lowercase hex characters.
     * @throws InvalidArgumentException When the key cannot be normalized.
     */
    public static function public_key_fingerprint(string $pem_or_one_line): string
    {
        $one_line = self::normalize_public_key($pem_or_one_line);
        $der = base64_decode($one_line, true);
        return substr(hash('sha256', (string) $der), 0, 16);
    }

    /**
     * Empties the OpenSSL error queue so a later, unrelated call does not
     * report an error left behind by an earlier one.
     *
     * The loop is bounded: PHP keeps OpenSSL errors in a ring buffer of
     * ERR_NUM_ERRORS (16) slots, and each call removes one.
     */
    public static function drain_openssl_error_queue(): void
    {
        // phpcs:ignore Generic.CodeAnalysis.EmptyStatement.DetectedWhile -- Draining the queue is the entire purpose of this loop.
        while (openssl_error_string() !== false) {
        }
    }

}
