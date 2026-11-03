<?php

namespace WordPress\Reprint\Server;

/**
 * Selects site tables and shared WordPress rows to export for one network site.
 *
 * For site 7 with base prefix `network_`, keep core tables such as
 * `network_7_posts`. Use `network_7_reprint_users` to store user IDs found in
 * that site's content and membership rows. Then use those IDs to select rows
 * from the shared `network_users` and `network_usermeta` tables.
 *
 * The SQL endpoint supplies the prefix and site/network IDs from WordPress
 * state on the source server. A client cannot supply a SQL condition here.
 * Shared plugin tables need their own rules to select one site's data.
 */
class MultisiteDatabaseSelection {

    /** @var string Network table prefix, for example `network_` in `network_users`. */
    private $base_prefix;
    /** @var string Site table prefix: `network_7_` for site 7, `network_` for site 1. */
    private $site_prefix;
    /** @var int Selected site's blog_id in the network's blogs table, for example 7. */
    private $site_id;
    /** @var int Selected network's id in the site table, for example 1. */
    private $network_id;

    /** @var mixed Source connection retained for this request's lock and ID writes. */
    private $db;
    /** @var string|null MySQL named lock held for this site's saved user table until close(). */
    private $lock_name;
    /** @var resource|null SQLite site lock; its file also stores the current export token. */
    private $lock_handle;
    /**
     * Random token set when this site's saved user table is created.
     * Stored in the table comment and export cursor. A new export replaces the
     * table and token, so an older cursor cannot resume against the new set.
     * This token does not track changes to the source WordPress rows.
     *
     * @var string|null Null until the saved user table is opened.
     */
    private $generation;

    /**
     * Builds selection rules without changing source site IDs or table names.
     * For example, ('network_', 7, 1) selects site 7 in network 1 and uses
     * `network_7_` as its site table prefix. This does not query WordPress to
     * check that the site exists; the caller must supply the source site's IDs.
     */
    public function __construct(string $base_prefix, int $site_id, int $network_id)
    {
        /**
         * WordPress restricts prefixes to ASCII letters, digits and underscores
         * in wpdb::set_prefix(); MySQL table names allow more characters.
         * WordPress already checks the source prefix during normal bootstrap.
         * Repeat the check here because the queries below insert the prefix
         * into backtick-quoted table names and single-quoted meta keys without
         * escaping it. Removing this guard requires quoting both SQL contexts.
         * /D rejects a final newline that $ would otherwise allow.
         *
         * @see https://developer.wordpress.org/reference/classes/wpdb/set_prefix/
         */
        if (!preg_match('/^[a-zA-Z0-9_]+$/D', $base_prefix) || $site_id < 1 || $network_id < 1) {
            throw new \InvalidArgumentException(
                "A multisite selection requires a WordPress table prefix and positive site and network IDs."
            );
        }
        $this->base_prefix = $base_prefix;
        // WordPress leaves only site ID 1 unnumbered. A different network's
        // main site still uses its numeric site ID in the table prefix.
        $this->site_prefix = $base_prefix . ( $site_id === 1 ? '' : $site_id . '_' );
        $this->site_id = $site_id;
        $this->network_id = $network_id;
    }

    /**
     * Returns a cursor check value for the source site and selection rules.
     *
     * Contains the rule version, base prefix, network ID and site ID, in that
     * order. Site 7 and site 8 cannot use each other's database cursor.
     *
     * The row reader compares this value on resume. Change the version when
     * selection, value-replacement rules or the cursor layout change, not for
     * an equivalent query plan. Source rows may change without changing this version.
     * This identifies the rules, not a snapshot of the mutable source records.
     */
    public function get_identity(): string
    {
        return 'site-tables-v1:' . $this->base_prefix . ':' . $this->network_id . ':' . $this->site_id;
    }

    /**
     * Starts or resumes the single saved user set for this site.
     *
     * The importer lock covers only its local state directory. Hold a source
     * lock for this request; compare the saved generation on the next request.
     * A fresh export replaces a paused one rather than retaining several sets.
     *
     * @param mixed $db Dedicated PDO MySQL connection or the active SQLite adapter.
     * @param string|null $generation Saved cursor generation, or null for a fresh export.
     */
    public function open_user_set($db, ?string $generation): void
    {
        if ($db instanceof SqliteDriverPDO) {
            $sqlite = $db->get_sqlite_pdo();
            if ($sqlite->inTransaction()) {
                throw new \RuntimeException('Selected-site SQL export requires an autocommit connection without an open transaction. End the source transaction before starting the export.');
            }
            $database_file = $sqlite->query('PRAGMA database_list')->fetch(\PDO::FETCH_ASSOC)['file'];
            if ($database_file === '') {
                throw new \RuntimeException('Selected-site SQL export requires a persistent SQLite database file; an in-memory database cannot resume across requests.');
            }
            // SQLite's translator implements GET_LOCK as a no-op. A separate
            // file lock protects site 7's set across commits without holding a
            // write transaction that would block WordPress and other sites.
            // Keep the file after close: unlinking it could split waiters across
            // two inodes. The OS releases the handle when the process dies.
            $lock_path = $database_file . '.' . $this->get_user_table_name() . '.lock';
            $handle = fopen($lock_path, 'c+');
            if ($handle === false) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Plain source-side JSON error, never HTML.
                throw new \RuntimeException('Cannot open the SQLite selected-site export lock: ' . $lock_path);
            }
            if (!flock($handle, LOCK_EX | LOCK_NB)) {
                fclose($handle);
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Plain source-side JSON error, never HTML.
                throw new \RuntimeException("Another SQL export request is using the saved users for site {$this->site_id}; try again after it finishes.");
            }
            $this->lock_handle = $handle;
        } else {
            // wpdb may route reads and writes to different connections or retain
            // a plugin's transaction. Neither can protect these source-side writes
            // with one named lock and commit them before an export cursor leaves.
            if (!$db instanceof \PDO || $db->getAttribute(\PDO::ATTR_DRIVER_NAME) !== 'mysql') {
                throw new \RuntimeException('Selected-site SQL export requires a direct PDO MySQL connection. Enable pdo_mysql and allow direct access using the source WordPress database credentials.');
            }
            if ($db->inTransaction() || (string) $db->query('SELECT @@autocommit')->fetchColumn() !== '1') {
                throw new \RuntimeException('Selected-site SQL export requires an autocommit connection without an open transaction. End the source transaction before starting the export.');
            }
            $database = $db->query('SELECT DATABASE()')->fetchColumn();
            // Named locks are server-wide and limited to 64 bytes. Include the
            // database as well as the site table. Fold case for servers with
            // case-insensitive table names. Locks survive commits, not connection death.
            $lock_name = 'reprint-users:' . sha1(strtolower($database . '.' . $this->get_user_table_name()));
            $result = $db->query("SELECT GET_LOCK('{$lock_name}', 0)")->fetchColumn();
            if ( (string) $result !== '1') {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Plain source-side JSON error, never HTML.
                throw new \RuntimeException("Another SQL export request is using the saved users for site {$this->site_id}; try again after it finishes.");
            }
            $this->lock_name = $lock_name;
        }
        $this->db = $db;
        try {
            $table = $this->get_user_table_name();
            if ($db instanceof SqliteDriverPDO) {
                // SQLite 2.x discards table comments. Keep this site's generation
                // in its already-locked file instead; read only the fixed marker.
                $exists = $db->get_sqlite_pdo()->query("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = '{$table}'")->fetchColumn();
                $schema_marker = $exists ? (string) fgets($this->lock_handle, 64) : false;
            } else {
                $schema_marker = $db->query("SELECT TABLE_COMMENT FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '{$table}'")->fetchColumn();
            }
            if ($generation !== null) {
                if (!preg_match('/^[a-f0-9]{32}$/D', $generation) || $schema_marker !== 'reprint-users-v1:' . $generation) {
                    throw new \RuntimeException("The saved users for site {$this->site_id} were replaced or are missing. Run db-pull --abort and start again.");
                }
                $this->generation = $generation;
                return;
            }
            if ($schema_marker !== false && !preg_match('/^reprint-users-v1:[a-f0-9]{32}$/D', $schema_marker)) {
                throw new \RuntimeException("Cannot create the saved user set: table {$table} already exists without Reprint's schema marker.");
            }
            // Starting again replaces one site's set, including abandoned work.
            // Do not delete it at completion: the last HTTP response may be lost
            // and the importer may still need to replay an earlier cursor.
            $this->generation = bin2hex(Utils::generate_random_bytes(16));
            $table_comment = " COMMENT='reprint-users-v1:{$this->generation}'";
            if ($db instanceof SqliteDriverPDO) {
                // Invalidate old cursors BEFORE replacing their rows. If this
                // process dies after DROP or CREATE, no caller has the new token
                // yet. A fresh export can replace the unfinished set safely.
                $marker = 'reprint-users-v1:' . $this->generation;
                rewind($this->lock_handle);
                if (fwrite($this->lock_handle, $marker) !== strlen($marker)
                    || !ftruncate($this->lock_handle, strlen($marker)) || !fflush($this->lock_handle)) {
                    throw new \RuntimeException('Cannot save the SQLite export generation in the selected-site lock file. Check free disk space and filesystem permissions.');
                }
                $table_comment = '';
            }
            $db->exec("DROP TABLE IF EXISTS `{$table}`");
            $db->exec("CREATE TABLE `{$table}` (user_id bigint unsigned NOT NULL PRIMARY KEY, reference_kind tinyint unsigned NOT NULL, reference_id bigint unsigned NOT NULL) ENGINE=InnoDB" . $table_comment);
        } catch (\Throwable $error) {
            $this->close();
            throw $error;
        }
    }

    /** Releases the request's lock; keeps the saved rows available for resume. */
    public function close(): void
    {
        if ($this->lock_name !== null) {
            $lock_name = $this->lock_name;
            $this->lock_name = null;
            $this->db->query("SELECT RELEASE_LOCK('{$lock_name}')")->fetchColumn();
        }
        if ($this->lock_handle !== null) {
            flock($this->lock_handle, LOCK_UN);
            fclose($this->lock_handle);
            $this->lock_handle = null;
        }
        $this->db = null;
    }

    /** Returns the saved user table's token for the cursor, or null before open_user_set(). */
    public function get_generation(): ?string
    {
        return $this->generation;
    }

    /**
     * Returns the table that stores collected IDs, for example `network_7_reprint_users`.
     * This is Reprint's source state table, not WordPress's shared `network_users` table.
     */
    public function get_user_table_name(): string
    {
        return $this->site_prefix . 'reprint_users';
    }

    /**
     * Identifies Reprint's saved user tables, such as `network_7_reprint_users`.
     * The row reader excludes them from SQL output, even without selected-site rules.
     */
    public static function is_internal_table(string $table): bool
    {
        return (bool) preg_match('/^[a-zA-Z0-9_]+reprint_users$/iD', $table);
    }

    /**
     * Tables visited before membership collection and user export.
     *
     * A users-only or profiles-only export must still read author IDs from
     * posts, comments and links. Add those tables to the content walk; the
     * reader omits their SQL when the caller did not select their contents.
     * For site 7, input ['network_users'] returns ['network_7_posts',
     * 'network_7_comments', 'network_7_links']. This only builds the list.
     *
     * @param string[] $tables Tables selected for SQL export.
     * @return string[] Content tables, including any needed ID-only reads.
     */
    public function get_content_tables(array $tables): array
    {
        $user_tables = $this->get_user_tables($tables);
        $content_tables = array_values(array_diff($tables, $user_tables));
        if ($user_tables) {
            $content_tables = array_values(array_unique(array_merge($content_tables, [
                $this->site_prefix . 'posts', $this->site_prefix . 'comments', $this->site_prefix . 'links',
            ])));
        }
        return $content_tables;
    }

    /**
     * Users precede profiles even when the caller lists the tables backwards.
     *
     * @param string[] $tables Tables selected for SQL export.
     * @return string[] Selected users and usermeta tables, in that order.
     */
    public function get_user_tables(array $tables): array
    {
        return array_values(array_intersect([$this->base_prefix . 'users', $this->base_prefix . 'usermeta'], $tables));
    }

    /** Returns the shared membership and profile table, for example `network_usermeta`. */
    public function get_usermeta_table_name(): string
    {
        return $this->base_prefix . 'usermeta';
    }

    /**
     * Runs one ID query and saves its users before the reader moves its cursor.
     *
     * For post ID 100 with post_author 42, save user 42 with reference_kind 1
     * and reference_id 100. Keep only the first saved reference for each user.
     * Ignore user ID 0. For usermeta, save only the selected site's capabilities
     * rows. The caller must put a LIMIT on the query to bound this step.
     *
     * @param string $table Source table supported by get_reference_columns().
     * @param string $query SELECT ordered by primary key, limited to one reader
     *                      batch. Must return the primary key and user column,
     *                      plus meta_key for usermeta.
     * @return string Last source primary key read, including rows which added
     *                no user IDs; '0' when the query was empty.
     */
    public function collect_user_references(string $table, string $query): string
    {
        $columns = $this->get_reference_columns($table);
        $result = $this->db->query($query);
        $values = [];
        $last_id = '0';
        $row = $result->fetch(PdoConstants::fetch_assoc());
        while ($row !== false) {
            $last_id = (string) $row[$columns['primary_key']];
            $user_id = ltrim( (string) $row[$columns['user_column']], '0');
            if (ctype_digit($user_id) &&
                ( $columns['kind'] !== 4 || $row['meta_key'] === $this->site_prefix . 'capabilities' )) {
                $values[] = '(' . $user_id . ',' . $columns['kind'] . ',' . $last_id . ')';
            }
            $row = $result->fetch(PdoConstants::fetch_assoc());
        }
        // The result is fully consumed before writing, including with PDO's
        // unbuffered mode. Only IDs from this bounded query are held in PHP.
        $result = null;
        if ($values) {
            $this->db->exec("INSERT INTO `{$this->get_user_table_name()}` (user_id, reference_kind, reference_id) VALUES " . implode(',', $values) . ' ON DUPLICATE KEY UPDATE user_id=user_id');
        }
        return $last_id;
    }

    /**
     * Returns a SQL expression that checks a row's link to the saved user set.
     *
     * For content, check that its user ID is zero or already saved. For users
     * and usermeta, check that the saved source row still refers to that user.
     * For example, if user 42 was saved from post 100, check that post 100
     * still has post_author 42. Use its primary key, not a scan of post_author.
     * The reader runs this expression in its SELECT and rejects a failed check.
     *
     * One saved reference per user bounds storage by distinct users, not comments.
     * If that reference changes, stop rather than scan for another one. Another
     * valid relationship may still exist; a fresh export discovers it again.
     * New relationships behind the discovery cursor need a fresh export too.
     *
     * @return string|null SQL check, or null for a table with no user references.
     */
    public function get_user_reference_check(string $table): ?string
    {
        if (!$this->is_shared_user_table($table)) {
            $columns = $this->get_reference_columns($table);
            if ($columns === null) {
                return null;
            }
            // Discovery and the content SELECT are separate statements. Reject
            // a newly assigned author absent from the set rather than sending
            // content whose user could never be included by this export.
            $user_expression = "`{$table}`.`{$columns['user_column']}`";
            return "({$user_expression} = 0 OR " . $this->related_user_condition($user_expression) . ')';
        }
        $user_column = $table === $this->base_prefix . 'users' ? 'ID' : 'user_id';
        return "(SELECT CASE saved.reference_kind " .
            "WHEN 1 THEN EXISTS (SELECT 1 FROM `{$this->site_prefix}posts` WHERE ID=saved.reference_id AND post_author=saved.user_id) " .
            "WHEN 2 THEN EXISTS (SELECT 1 FROM `{$this->site_prefix}comments` WHERE comment_ID=saved.reference_id AND user_id=saved.user_id) " .
            "WHEN 3 THEN EXISTS (SELECT 1 FROM `{$this->site_prefix}links` WHERE link_id=saved.reference_id AND link_owner=saved.user_id) " .
            "WHEN 4 THEN EXISTS (SELECT 1 FROM `{$this->base_prefix}usermeta` WHERE umeta_id=saved.reference_id AND user_id=saved.user_id AND meta_key='{$this->site_prefix}capabilities') " .
            "ELSE 0 END FROM `{$this->get_user_table_name()}` saved WHERE saved.user_id=`{$table}`.`{$user_column}` LIMIT 1)";
    }

    /**
     * Whether this table has a defined selection rule.
     *
     * '1=0' keeps a known table's schema without rows. '0=1' marks a table
     * without a rule for this selection, so the reader skips the whole table.
     * Keep these spellings distinct even though both SQL conditions are false.
     */
    public function includes_table(string $table): bool
    {
        return $this->get_row_condition($table) !== '0=1';
    }

    /**
     * Returns a WHERE condition for the selected site's rows; does not run SQL.
     * For site 7, `network_blogs` gets `blog_id = 7`. Shared users and profiles
     * use the saved user IDs; profile rows also need an allowed metadata key.
     * Returns '1=0' for a schema-only table, or '0=1' to omit the whole table.
     */
    public function get_row_condition(string $table): string
    {
        // Apply exact core rules first, especially the options and shared-user
        // filters. The numbered plugin-table prefix rule comes after them.
        $site_tables = [
            'posts', 'postmeta', 'comments', 'commentmeta', 'terms',
            'termmeta', 'term_taxonomy', 'term_relationships', 'links',
        ];
        foreach ($site_tables as $suffix) {
            if ($table === $this->site_prefix . $suffix) {
                return '1=1';
            }
        }
        if ($table === $this->site_prefix . 'options') {
            // Remove Reprint's source connection and authorization state.
            // Other plugin settings in this site-specific table still travel;
            // this is not a general filter for plugin secrets.
            return "`option_name` NOT IN ('reprint_server_connection_token', 'reprint_server_push_authorized_token_fingerprint', 'site_export_secret', 'site_export_push_authorized_token_fingerprint')";
        }
        // WordPress calls sites "blogs" here; the singular "site" table holds
        // networks. Filter each shared table by the corresponding kind of ID.
        if ($table === $this->base_prefix . 'blogs' || $table === $this->base_prefix . 'blogmeta') {
            return "`blog_id` = {$this->site_id}";
        }
        if ($table === $this->base_prefix . 'site') {
            return "`id` = {$this->network_id}";
        }
        if ($table === $this->base_prefix . 'sitemeta') {
            /**
             * Network plugin/theme settings describe code available to the
             * site; WPLANG supplies its network language fallback. Retain the
             * upload policy and network name/contact metadata alongside the
             * selected network record. These remain network metadata in the
             * dump, not automatically converted single-site options.
             */
            // Counters, signups, source administrators, and unknown plugin settings
            // describe the old network. The target supplies its own network identity.
            return "`site_id` = {$this->network_id} AND `meta_key` IN (" .
                "'active_sitewide_plugins', 'allowedthemes', 'site_name', 'admin_email', " .
                "'upload_filetypes', 'fileupload_maxk', 'upload_space_check_disabled', " .
                "'blog_upload_space', 'WPLANG')";
        }
        if ($table === $this->base_prefix . 'users') {
            return $this->related_user_condition("`{$table}`.`ID`");
        }
        if ($table === $this->base_prefix . 'usermeta') {
            /**
             * A selected user's metadata can also contain data for other sites.
             * Filtering user IDs alone would copy those roles and credentials.
             * Keep this explicit subset, not every key attached to the user:
             *
             * - first_name, last_name, nickname and description retain the
             *   user's profile and author biography.
             * - rich_editing, syntax_highlighting and comment_shortcuts retain
             *   editor and comment-moderation preferences.
             * - admin_color, show_admin_bar_front, locale and use_ssl retain
             *   the color scheme, toolbar, language and admin HTTPS preference.
             * - The selected prefix's capabilities stores roles and direct
             *   grants/denials; user_level preserves the legacy numeric level.
             *   Keep their keys unchanged because the target adopts that prefix.
             *
             * Other-site roles, session_tokens, _application_passwords and
             * unlisted core/plugin metadata stay out. An unlisted field is not
             * necessarily secret, but adding it requires an export decision.
             * The user-ID condition also excludes unrelated users' profiles.
             *
             * @see https://developer.wordpress.org/reference/functions/wp_insert_user/
             * @see https://developer.wordpress.org/reference/classes/wp_user/for_site/
             * @see https://developer.wordpress.org/reference/classes/wp_user/update_user_level_from_caps/
             */
            $keys = [
                'first_name', 'last_name', 'nickname', 'description', 'rich_editing',
                'syntax_highlighting', 'comment_shortcuts', 'admin_color', 'use_ssl',
                'show_admin_bar_front', 'locale',
                $this->site_prefix . 'capabilities', $this->site_prefix . 'user_level',
            ];
            return $this->related_user_condition("`{$table}`.`user_id`") .
                " AND `meta_key` IN ('" . implode("', '", $keys) . "')";
        }
        if ($table === $this->base_prefix . 'signups' || $table === $this->base_prefix . 'registration_log') {
            // Pending registrations and registration history describe the
            // network, not this site's content. Retain empty core tables only.
            return '1=0';
        }
        // Plugins using $wpdb->prefix store site 7's data in network_7_*.
        // Keep these names: the standalone target adopts that same prefix.
        // Include the final underscore so site 70 cannot match site 7.
        // This is a storage convention for network-authorized exports, not a
        // guarantee that arbitrary plugin data is safe for site-only admins.
        // Site 1 has no numbered prefix: network_orders could contain main-site
        // or network-wide orders, so it still needs an explicit migration rule.
        if ($this->site_id !== 1 && strpos($table, $this->site_prefix) === 0
            && !self::is_internal_table($table)) {
            return '1=1';
        }
        return '0=1';
    }

    /**
     * Returns a SQL lookup for a user ID in the site's saved user table.
     * For example, `network_users`.`ID` is checked against user_id in
     * `network_7_reprint_users` when site 7 is selected.
     *
     * A capabilities row includes members who have no content. Post, registered
     * comment and link references also retain users who no longer have a role
     * on this site, so existing content keeps its original user IDs. Both users
     * and usermeta use this test; selecting a content author does not create a
     * capabilities row or grant that author a role.
     */
    private function related_user_condition(string $user_expression): string
    {
        // A scalar primary-key lookup cannot rebuild a materialized user set
        // for each batch. WordPress tables and their indexes stay unchanged.
        return "(SELECT saved.user_id FROM `{$this->get_user_table_name()}` saved WHERE saved.user_id={$user_expression} LIMIT 1) IS NOT NULL";
    }
    /**
     * Returns the columns used to save a user ID and the source row that refers to it.
     * For `network_7_posts`, read ID and post_author, then save the reference
     * as kind 1. The kind tells get_user_reference_check() which table to check.
     *
     * @return array|null {
     *     Columns for a supported source table; null for other tables.
     *
     *     @type string $primary_key Column name for the source row ID, such as ID.
     *     @type string $user_column Column name for its user ID, such as post_author.
     *     @type int    $kind Saved reference_kind: 1 posts, 2 comments, 3 links, 4 usermeta.
     * }
     */
    public function get_reference_columns(string $table): ?array
    {
        $sources = [
            $this->site_prefix . 'posts' => ['primary_key' => 'ID', 'user_column' => 'post_author', 'kind' => 1],
            $this->site_prefix . 'comments' => ['primary_key' => 'comment_ID', 'user_column' => 'user_id', 'kind' => 2],
            $this->site_prefix . 'links' => ['primary_key' => 'link_id', 'user_column' => 'link_owner', 'kind' => 3],
            $this->base_prefix . 'usermeta' => ['primary_key' => 'umeta_id', 'user_column' => 'user_id', 'kind' => 4],
        ];
        return $sources[$table] ?? null;
    }

    /** Checks for shared WordPress users or usermeta, not Reprint's saved ID table. */
    public function is_shared_user_table(string $table): bool
    {
        return $table === $this->base_prefix . 'users' || $table === $this->base_prefix . 'usermeta';
    }
}
