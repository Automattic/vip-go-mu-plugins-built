<?php

namespace WordPress\Reprint\Server;

// phpcs:disable WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Protocol errors, not HTML.

/** Shared WordPress code and one site's uploads, without sibling upload trees. */
class MultisiteFileSelection {

    /**
     * WordPress context for the site selected by the remote Reprint API URL.
     * Built by Plugin\get_multisite_export_context(), not from client paths.
     * See __construct() for the five required keys; other context keys are unused.
     *
     * @var array
     */
    private $source;

    /**
     * Stores the source paths after the plugin has checked the supported layout.
     *
     * Paths are absolute, use / separators, and have no trailing slash. This
     * constructor neither normalizes them nor resolves symlinks. For site 7:
     *
     *     [
     *         'site_id'      => 7,
     *         'abspath'      => '/srv/wordpress',
     *         'content_dir'  => '/srv/wordpress/wp-content',
     *         'uploads_dir'  => '/srv/wordpress/wp-content/uploads/sites/7',
     *         'exporter_dir' => '/srv/wordpress/wp-content/plugins/reprint-server',
     *     ]
     *
     * @param array $source {
     *     Source-side context from Plugin\get_multisite_export_context().
     *
     *     @type int    $site_id      Selected site ID; 1 uses the main uploads root.
     *     @type string $abspath      WordPress root on the source server.
     *     @type string $content_dir  The source's abspath/wp-content directory.
     *     @type string $uploads_dir  Whole-site upload basedir, not a URL or a
     *                                year/month directory. Site 1 uses
     *                                content_dir/uploads; site 7 uses
     *                                content_dir/uploads/sites/7.
     *     @type string $exporter_dir Reprint's actual plugin directory. Excluded
     *                                even when it sits inside shared plugins.
     * }
     */
    public function __construct(array $source)
    {
        $this->source = $source;
    }

    /**
     * Binds file cursors to this site's paths, including an empty completed cursor.
     * Hashes a fixed version marker, the site ID and four path strings, not file
     * lists or contents.
     */
    public function get_identity(): string
    {
        return hash('sha256', serialize([
            'files-v1', $this->source['site_id'], $this->source['abspath'],
            $this->source['content_dir'], $this->source['uploads_dir'], $this->source['exporter_dir'],
        ]));
    }

    /**
     * Checks whether one path is in this selection, using string operations only.
     *
     * Work and temporary memory depend on path length, not the number of files
     * or sites. No directory is read here. A true result does not establish that
     * the path exists or is free of symlinks; assert_path_allowed() checks links.
     */
    public function includes_path(string $remote_absolute_path): bool
    {
        // Reject alternate spellings such as uploads/sites/7/../8/photo.jpg.
        // The containment checks must see the same path that the caller uses.
        if (Utils::normalize_path($remote_absolute_path, Utils::native_path_format()) !== $remote_absolute_path) {
            return false;
        }
        $source = $this->source;
        // Reprint can contain secret.php. Exclude it before allowing the shared
        // plugin tree below, using its actual path rather than a directory name.
        if (Utils::path_is_same_as_or_descendant_of($remote_absolute_path, $source['exporter_dir'])) {
            return false;
        }
        // These core directories belong to the shared WordPress installation.
        foreach (['wp-admin', 'wp-includes'] as $directory) {
            if (Utils::path_is_same_as_or_descendant_of($remote_absolute_path, $source['abspath'] . '/' . $directory)) {
                return true;
            }
        }
        // Copy these shared trees in full, without checking activation or file
        // contents. A plugin can store secrets here; this is not a rule for
        // safely exposing shared files to individual site administrators.
        foreach (['plugins', 'themes', 'mu-plugins', 'languages'] as $directory) {
            if (Utils::path_is_same_as_or_descendant_of($remote_absolute_path, $source['content_dir'] . '/' . $directory)) {
                return true;
            }
        }
        // Site 1 uses uploads/ itself, which also contains the other sites'
        // uploads/sites/ tree. Exclude that tree BEFORE allowing uploads/ below.
        if ( (int) $source['site_id'] === 1 && Utils::path_is_same_as_or_descendant_of(
            $remote_absolute_path, $source['uploads_dir'] . '/sites'
        )) {
            return false;
        }
        // A numbered site's upload root is already separate. The helper checks
        // a slash boundary, so uploads/sites/7 cannot match uploads/sites/70.
        if (Utils::path_is_same_as_or_descendant_of($remote_absolute_path, $source['uploads_dir'])) {
            return true;
        }
        // Traversal must pass through wp-content, uploads and uploads/sites to
        // reach site 7. Allow those parents, but only as far up as abspath.
        // Their children still need their own check: allowing uploads/sites
        // does not allow uploads/sites/8 or the main site's uploads/photo.jpg.
        if (Utils::path_is_same_as_or_descendant_of($source['uploads_dir'], $remote_absolute_path)
            && Utils::path_is_same_as_or_descendant_of($remote_absolute_path, $source['abspath'])) {
            return true;
        }

        // The target receives a fresh wp-config.php; source credentials and
        // custom bootstrap includes must not become the target configuration.
        // Only these direct children of abspath are allowed. Other root files
        // and unlisted content paths, such as wp-content/debug.log, stay out.
        $core_files = [
            'index.php', 'wp-activate.php', 'wp-blog-header.php', 'wp-comments-post.php',
            'wp-cron.php', 'wp-links-opml.php', 'wp-load.php', 'wp-login.php',
            'wp-mail.php', 'wp-settings.php', 'wp-signup.php', 'wp-trackback.php',
            'xmlrpc.php', 'license.txt', 'readme.html',
        ];
        return dirname($remote_absolute_path) === $source['abspath']
            && in_array(basename($remote_absolute_path), $core_files, true);
    }

    /**
     * Rejects direct requests, resumed paths, and links which could widen the selection.
     *
     * Unlike includes_path(), this does filesystem I/O for one path and its
     * parents. It does not read file contents or scan a directory, but a slow
     * filesystem can still make these lookups slow. It does not lock the path
     * against changes between this check and the caller's later file access.
     */
    public function assert_path_allowed(string $remote_absolute_path): void
    {
        if (!$this->includes_path($remote_absolute_path)) {
            throw new \InvalidArgumentException('Path is outside the selected multisite site: ' . $remote_absolute_path);
        }
        // Check the current link state, not a result cached earlier in this
        // process. realpath() resolves an existing path, including parent links;
        // is_link() also catches a dangling link at the requested path. Even
        // links pointing inside the selection are rejected until we have an
        // explicit rule for transferring them. A false realpath() alone does
        // not reject a missing path; callers handle missing/unreadable files.
        clearstatcache(true, $remote_absolute_path);
        $resolved_absolute_path = realpath($remote_absolute_path);
        if (is_link($remote_absolute_path) || ( $resolved_absolute_path !== false && $resolved_absolute_path !== $remote_absolute_path )) {
            throw new \InvalidArgumentException('Symlinks require a separate multisite migration rule: ' . $remote_absolute_path);
        }
    }
}
