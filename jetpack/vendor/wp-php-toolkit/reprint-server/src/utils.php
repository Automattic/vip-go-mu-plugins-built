<?php
/**
 * Shared utility functions used by both export.php and import.php.
 *
 * These helpers live in a namespace so they don't collide with global
 * functions of the same name declared by third-party plugins or
 * WordPress drop-ins. Generic names like parse_size() or normalize_path()
 * are guaranteed to clash sooner or later if they sit in the global
 * namespace, and more than one plugin on a WordPress.com site loads this
 * file.
 *
 * Consumers require this file when they need its helpers. Keep this file
 * limited to guarded function declarations: do not add I/O, hooks, mutable
 * global state, or eager class definitions here.
 *
 * The two str_* polyfills stay global on purpose: they backfill functions
 * unavailable before PHP 8.0, so callers reach them via the global namespace
 * without a use-statement.
 */

// Polyfill for PHP versions before 8.0, which lack str_starts_with().
namespace {
    if (!function_exists('str_starts_with')) {
        function str_starts_with(string $haystack, string $needle): bool {
            return $needle === '' || strncmp($haystack, $needle, strlen($needle)) === 0;
        }
    }

    // Polyfill for PHP versions before 8.0, which lack str_contains().
    if (!function_exists('str_contains')) {
        function str_contains(string $haystack, string $needle): bool {
            return $needle === '' || strpos($haystack, $needle) !== false;
        }
    }
}

namespace WordPress\Reprint\Server {

use InvalidArgumentException;
use RuntimeException;

// Every declaration below carries its own function_exists() guard, and the
// guards are deliberately per-function rather than one block-wide check.
//
// Two plugins on the same site can each ship a copy of this package — wpcomsh
// and Jetpack both do on WordPress.com — so one of them declares these
// functions first and the other must not redeclare them. A single guard keyed
// on one sentinel function would work only while both copies declare exactly
// the same set: the moment one ships a helper the other lacks, the second copy
// skips the whole block and the first call to that helper is a fatal.
// Per-function guards degrade to "whoever loaded first wins the functions it
// has, this copy supplies the rest" instead.
//
// The guards earn their keep when two copies are loaded: a monorepo checkout
// that loads both packages/reprint-server/src/utils.php and the vendor/ mirror
// of it, or a site still carrying reprint-exporter v0.1.47
// under its old package name. That older copy declares its helpers in
// WordPress\Reprint\Exporter, a namespace nothing here uses any more, so it
// cannot reach these names at all — but the guards cost nothing and they
// document the hazard.
//
// Function bodies stay unindented inside their guards, matching how the
// bracketed namespace blocks in this file are written.

if (!function_exists(__NAMESPACE__ . '\\generate_random_bytes')) {
/**
 * Returns cryptographically secure random bytes on every supported PHP version.
 *
 * @param int $length Number of bytes to return.
 * @return string Random bytes.
 * @throws RuntimeException When the runtime has no secure random-byte source.
 */
function generate_random_bytes(int $length): string
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
}

if (!function_exists(__NAMESPACE__ . '\\integer_divide')) {
/**
 * Divides two integers and rounds the result toward zero.
 *
 * @param int $dividend Number to divide.
 * @param int $divisor Number to divide by.
 * @return int Integer quotient.
 */
function integer_divide(int $dividend, int $divisor): int
{
    if (function_exists('intdiv')) {
        return intdiv($dividend, $divisor);
    }

    return intval($dividend / $divisor);
}
}

if (!function_exists(__NAMESPACE__ . '\\build_pdo_dsn')) {
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
function build_pdo_dsn(string $db_host, string $db_name): string
{
    $socket = '';
    $host   = $db_host;
    $port   = '';

    if (str_starts_with($db_host, '/') && file_exists($db_host)) {
        // Bare socket path: "/var/run/mysqld/mysqld.sock"
        $socket = $db_host;
        $host   = '';
    } elseif (
        str_starts_with($db_host, '[') &&
        ($bracket_end = strpos($db_host, ']')) !== false
    ) {
        // Bracketed IPv6: "[::1]", "[::1]:3306", "[::1]:/path/to/socket"
        $host = substr($db_host, 1, $bracket_end - 1);
        $after = substr($db_host, $bracket_end + 1);
        $candidate_socket = str_starts_with($after, ':/') ? substr($after, 1) : '';
        if ($candidate_socket !== '' && file_exists($candidate_socket)) {
            $socket = $candidate_socket;
        } elseif (str_starts_with($after, ':')) {
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
        str_contains($db_host, ':') &&
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
}

if (!function_exists(__NAMESPACE__ . '\\parse_size')) {
/**
 * Parse a human-readable size string (e.g. "16M", "1G", "512K") into bytes.
 * Accepts plain integers as well.
 */
function parse_size(string $value): int
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
}

if (!function_exists(__NAMESPACE__ . '\\json_encode_or_throw')) {
/**
 * Throws on json_encode failure instead of returning false.
 *
 * Do NOT use inside error/shutdown handlers — those need hardcoded fallback strings.
 */
function json_encode_or_throw($value, int $flags = 0): string
{
    $json = json_encode($value, $flags);
    if ($json === false) {
        throw new RuntimeException("json_encode failed: " . json_last_error_msg());
    }
    return $json;
}
}

if (!function_exists(__NAMESPACE__ . '\\normalize_path')) {
/**
 * Resolve ".." and "." segments in a path without touching the filesystem.
 *
 * Unlike realpath(), this works on paths that don't exist yet.
 */
function normalize_path(string $path): string
{
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
    return "/" . implode("/", $resolved);
}
}

if (!function_exists(__NAMESPACE__ . '\\trim_right_slash')) {
/**
 * Removes trailing slashes without changing the filesystem root into an empty path.
 *
 * Unlike rtrim($path, '/'), this returns `/` for both the filesystem root and
 * an empty input. It only changes the lexical spelling; it does not validate
 * the path or resolve dot segments and symlinks.
 *
 * Examples:
 *
 *     trim_right_slash('/srv/site///'); // '/srv/site'
 *     trim_right_slash('/');            // '/'
 *     trim_right_slash('');             // '/'
 *
 * @param string $path Path whose trailing slashes to remove.
 * @return string A path without trailing slashes, or `/` for the filesystem root.
 */
function trim_right_slash(string $path): string
{
    return rtrim($path, '/') ?: '/';
}
}

if (!function_exists(__NAMESPACE__ . '\\realpath_with_missing_tail')) {
/**
 * Canonicalizes an absolute path through the nearest ancestor realpath() can resolve.
 *
 * The final components need not exist. The function resolves a real ancestor,
 * then appends the missing components without creating them. A broken symlink
 * cannot be resolved safely, so its normalized lexical spelling is retained.
 *
 * Examples:
 *
 *     realpath_with_missing_tail('/srv/site');
 *     // '/srv/site' when /srv/site exists
 *
 *     realpath_with_missing_tail('/srv/site/state/push');
 *     // '/srv/site/state/push' when /srv/site exists but state/push do not
 *
 *     realpath_with_missing_tail('/links/site/state');
 *     // '/srv/site/state' when /links/site is a symlink to /srv/site
 *
 * This does not create, remove, or otherwise modify filesystem entries.
 *
 * @throws InvalidArgumentException When $absolute_path is not absolute.
 */
function realpath_with_missing_tail(string $absolute_path): string
{
    if ($absolute_path === '' || $absolute_path[0] !== '/') {
        throw new InvalidArgumentException('Path must be absolute: ' . $absolute_path);
    }

    $normalized_path = normalize_path($absolute_path);
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
        return normalize_path($canonical_existing_ancestor);
    }

    return normalize_path(
        $canonical_existing_ancestor . '/' . implode('/', $missing_components)
    );
}
}

if (!function_exists(__NAMESPACE__ . '\\normalize_excluded_paths')) {
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
function normalize_excluded_paths(array $excluded_paths): array
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
        assert_valid_relative_path($path, 'Excluded path');
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
}

if (!function_exists(__NAMESPACE__ . '\\assert_valid_relative_path')) {
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
 *     assert_valid_relative_path('wp-content/plugins', 'Excluded path');
 *     assert_valid_relative_path('index.php', 'Document-root-relative path');
 *
 * @param string $path Raw path bytes to validate.
 * @param string $label Human-readable name at the start of validation errors.
 * @throws InvalidArgumentException When the path has a reserved form.
 */
function assert_valid_relative_path(string $path, string $label): void
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
}

// phpcs:enable WordPress.Security.EscapeOutput.ExceptionNotEscaped

if (!function_exists(__NAMESPACE__ . '\\path_is_same_as_or_descendant_of')) {
/**
 * Indicates whether a candidate path is the same as or a descendant of an
 * ancestor.
 *
 * Either argument may be a list. The result is true when any candidate-and-
 * ancestor pair matches. The filesystem root matches every absolute path and
 * cannot use the normal ancestor-plus-slash prefix because that would produce
 * `//`.
 *
 * Examples:
 *
 *     path_is_same_as_or_descendant_of('/srv/site', '/srv/site');            // true
 *     path_is_same_as_or_descendant_of('/srv/site/wp-content', '/srv/site'); // true
 *     path_is_same_as_or_descendant_of('/srv/site-old', '/srv/site');        // false
 *     path_is_same_as_or_descendant_of('/', '/');                             // true
 *
 * @param string|list<string> $path Candidate path or paths.
 * @param string|list<string> $ancestor Ancestor path or paths.
 * @return bool Whether a candidate is the same as or a descendant of an
 *              ancestor.
 * @throws InvalidArgumentException If either scalar value is not a string.
 */
function path_is_same_as_or_descendant_of($path, $ancestor): bool
{
    if (is_array($path)) {
        foreach ($path as $candidate_path) {
            if (path_is_same_as_or_descendant_of($candidate_path, $ancestor)) {
                return true;
            }
        }
        return false;
    }
    if (is_array($ancestor)) {
        foreach ($ancestor as $candidate_ancestor) {
            if (path_is_same_as_or_descendant_of($path, $candidate_ancestor)) {
                return true;
            }
        }
        return false;
    }
    if (!is_string($path) || !is_string($ancestor)) {
        throw new InvalidArgumentException('Path containment expects strings or lists of strings.');
    }
    if ($ancestor === "/") {
        return str_starts_with($path, "/");
    }
    return $path === $ancestor || str_starts_with($path, $ancestor . "/");
}
}

if (!function_exists(__NAMESPACE__ . '\\path_is_descendant_of')) {
/**
 * Indicates whether a candidate path is a descendant of an ancestor.
 *
 * Either argument may be a list. The result is true when any candidate-and-
 * ancestor pair has a component-boundary match below the ancestor. Unlike
 * path_is_same_as_or_descendant_of(), equal paths do not match. The
 * filesystem root contains every absolute descendant, but not itself.
 *
 * Examples:
 *
 *     path_is_descendant_of('/srv/site/wp-content', '/srv/site'); // true
 *     path_is_descendant_of('/srv/site', '/srv/site');            // false
 *     path_is_descendant_of('/srv/site-old', '/srv/site');        // false
 *     path_is_descendant_of('/wp-content', '/');                  // true
 *     path_is_descendant_of('/', '/');                             // false
 *
 * @param string|list<string> $path Candidate path or paths.
 * @param string|list<string> $ancestor Ancestor path or paths.
 * @return bool Whether a candidate is a descendant of an ancestor.
 * @throws InvalidArgumentException If either scalar value is not a string.
 */
function path_is_descendant_of($path, $ancestor): bool
{
    if (is_array($path)) {
        foreach ($path as $candidate_path) {
            if (path_is_descendant_of($candidate_path, $ancestor)) {
                return true;
            }
        }
        return false;
    }
    if (is_array($ancestor)) {
        foreach ($ancestor as $candidate_ancestor) {
            if (path_is_descendant_of($path, $candidate_ancestor)) {
                return true;
            }
        }
        return false;
    }
    if (!path_is_same_as_or_descendant_of($path, $ancestor)) {
        return false;
    }
    return $path !== $ancestor;
}
}

if (!function_exists(__NAMESPACE__ . '\\path_remainder_under')) {
/**
 * Returns the remainder of $path underneath $prefix.
 *
 * An exact match returns an empty string. A descendant returns the remainder
 * beginning with "/". A path outside $prefix returns null.
 */
function path_remainder_under(string $path, string $prefix): ?string
{
    $path = rtrim($path, "/");
    $prefix = rtrim($prefix, "/");

    if ($path === $prefix) {
        return "";
    }

    if (str_starts_with($path, $prefix . "/")) {
        return substr($path, strlen($prefix));
    }

    return null;
}
}

if (!function_exists(__NAMESPACE__ . '\\relative_path_under')) {
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
 *     relative_path_under('/srv/site/wp-content', '/srv/site'); // 'wp-content'
 *     relative_path_under('/srv/site', '/srv/site');            // ''
 *     relative_path_under('/srv/site-old', '/srv/site');        // null
 *     relative_path_under('/wp-content', '/');                  // 'wp-content'
 *     relative_path_under('wp-content/plugins', '');            // 'wp-content/plugins'
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
function relative_path_under(string $path, string $root): ?string
{
    if ($root === "") {
        return str_starts_with($path, "/") ? null : rtrim($path, "/");
    }
    $remainder = path_remainder_under($path, $root);
    return $remainder === null ? null : ltrim($remainder, "/");
}
}

if (!function_exists(__NAMESPACE__ . '\\assert_valid_path')) {
/**
 * Validates that a path is a non-empty absolute string without NUL bytes
 * or dot-segments (. or ..).
 *
 * Useful anywhere untrusted or remote paths need to be checked before
 * use — both the exporter (directory config) and the importer (remote
 * paths from the server) share this validation.
 *
 * @param string $path  The path to validate.
 * @param string $label Human-readable label for error messages (e.g. "directory", "remote path").
 * @throws InvalidArgumentException When the path fails any check.
 */
function assert_valid_path(string $path, string $label = "path"): void
{
    $path = trim($path);
    if ($path === "") {
        throw new InvalidArgumentException("{$label} must be a non-empty string");
    }
    if ($path[0] !== "/") {
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
if (!function_exists(__NAMESPACE__ . '\\wp_join_unix_paths')) {
/**
 * Joins path segments into one Unix path, collapsing duplicate slashes.
 *
 * Empty segments are skipped. A leading slash on the first non-empty segment
 * is preserved. Trailing slashes are left as the caller wrote them.
 *
 * Examples:
 *
 *     wp_join_unix_paths('/srv/site', 'wp-content'); // '/srv/site/wp-content'
 *     wp_join_unix_paths('/srv/site/', '/uploads');  // '/srv/site/uploads'
 *     wp_join_unix_paths('', 'wp-content', '');      // 'wp-content'
 *
 * @param string ...$path_segments Segments to join.
 * @return string The joined path.
 */
function wp_join_unix_paths(...$path_segments)
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
}

}
