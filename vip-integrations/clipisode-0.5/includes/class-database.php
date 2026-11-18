<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Database {

	/**
	 * Schema version, bumped whenever create_tables() changes.
	 *
	 * Tracked separately from CLIPISODE_VERSION so a release that touches no
	 * tables doesn't make every site re-run dbDelta, and so a schema change
	 * can't be missed by forgetting to bump the plugin version.
	 *
	 * History:
	 *   1  Initial seven-table schema.
	 *   2  Query-path indexes on clipisode_replies and clipisode_topics.
	 *   3  clipisode_outputs.composition for saved Remotion compositions.
	 */
	const DB_VERSION = '3';

	const VERSION_OPTION = 'clipisode_db_version';

	const LOCK_OPTION = 'clipisode_db_upgrade_lock';

	/**
	 * Seconds before a held upgrade lock is considered abandoned.
	 *
	 * A request that dies mid-dbDelta (fatal, timeout, worker kill) leaves the
	 * lock option behind. Without an expiry the site's schema would stay stuck
	 * at the old version forever.
	 */
	const LOCK_TIMEOUT = 60;

	public static function activate(): void {
		self::upgrade();
		self::ensure_default_host();
		Clipisode_Post_Types::ensure_default_invitation();
		Clipisode_Post_Types::ensure_default_preview();
	}

	/**
	 * Brings the current site's schema up to DB_VERSION if it isn't already.
	 *
	 * Hooked on `init` so every site self-heals on its next request. That one
	 * mechanism covers every way a site can end up with a stale or absent
	 * schema, which is why there is no separate code path for any of them:
	 *
	 *   - Plugin upgraded in place. Activation hooks do NOT fire when files
	 *     are overwritten by an update, so this was previously the case where
	 *     a schema change would silently never be applied.
	 *   - Network-activated on multisite. register_activation_hook() runs once,
	 *     against whichever site happened to be current, leaving every other
	 *     subsite with no tables at all.
	 *   - A subsite created later. Also covered explicitly by the
	 *     wp_initialize_site hook, so its tables exist at creation rather than
	 *     on first request.
	 *   - A site restored from a backup taken before a schema change.
	 *
	 * Costs one autoloaded option read per request in the common case.
	 *
	 * Note the option is per-site (get_option, not get_site_option): tables are
	 * created with $wpdb->prefix, so on multisite each subsite has its own set
	 * and tracks its own version.
	 */
	public static function maybe_upgrade(): void {
		if ( get_option( self::VERSION_OPTION ) === self::DB_VERSION ) {
			return;
		}

		if ( ! self::acquire_lock() ) {
			return;
		}

		try {
			self::upgrade();
		} finally {
			self::release_lock();
		}
	}

	/**
	 * Creates a new subsite's tables at the moment the site is created.
	 *
	 * Without this the subsite's first request would do it instead, which
	 * works but leaves a window where anything querying during site setup
	 * (seeding, an admin redirect) hits missing tables.
	 *
	 * VIPCS warns that switch_to_blog() changes only the database context and
	 * does not load the target site's plugins, theme, or hooks. That is exactly
	 * what is wanted here: creating tables needs the new site's $wpdb->prefix
	 * and nothing else. One switch per site creation, never in a loop.
	 */
	public static function initialize_site( WP_Site $site ): void {
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.switch_to_blog_switch_to_blog -- DB context is all this needs; see docblock.
		switch_to_blog( (int) $site->blog_id );
		try {
			self::maybe_upgrade();
		} finally {
			restore_current_blog();
		}
	}

	private static function upgrade(): void {
		self::create_tables();
		update_option( self::VERSION_OPTION, self::DB_VERSION, true );
	}

	/**
	 * Takes the upgrade lock, or reports that someone else holds it.
	 *
	 * add_option() is a single INSERT against a UNIQUE option_name, so it
	 * succeeds for exactly one caller among concurrent requests. That matters
	 * on a deploy, where many workers pick up new code at once and would
	 * otherwise all run ALTER TABLE against the same tables simultaneously.
	 *
	 * A lock older than LOCK_TIMEOUT is treated as abandoned and taken over.
	 */
	private static function acquire_lock(): bool {
		if ( add_option( self::LOCK_OPTION, (string) time(), '', false ) ) {
			return true;
		}

		$held_since = (int) get_option( self::LOCK_OPTION );
		if ( $held_since > 0 && ( time() - $held_since ) < self::LOCK_TIMEOUT ) {
			return false;
		}

		// Abandoned. Delete and re-add rather than update, so the re-add stays
		// the same atomic test-and-set and only one of several requests that
		// noticed the stale lock proceeds.
		delete_option( self::LOCK_OPTION );

		return (bool) add_option( self::LOCK_OPTION, (string) time(), '', false );
	}

	private static function release_lock(): void {
		delete_option( self::LOCK_OPTION );
	}

	/**
	 * Seeds a default host row on a site that has none.
	 *
	 * Runs at activation only, so the uncached count is a one-shot rather than a
	 * request-path query — caching it would add an invalidation problem for no
	 * gain. %i (identifier placeholder) is used for the table name rather than
	 * interpolating it; available since WP 6.2 and this plugin requires 6.5.
	 */
	private static function ensure_default_host(): void {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table, activation-time one-shot; see docblock.
		$count = (int) $wpdb->get_var( $wpdb->prepare( 'SELECT COUNT(*) FROM %i', $table ) );
		if ( $count > 0 ) {
			return;
		}

		$user = wp_get_current_user();
		if ( ! $user || ! $user->ID ) {
			return;
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table; $wpdb->insert() is the supported API for one.
		$wpdb->insert( $table, [
			'name'       => $user->display_name,
			'is_default' => 1,
		] );
	}

	/**
	 * Declares the schema. Safe to re-run: dbDelta diffs against what exists.
	 *
	 * Index policy: every KEY here is justified by a query that actually runs.
	 * Indexes cost write throughput and disk, and an index nothing reads is
	 * pure overhead, so candidates were checked against the real query paths
	 * before being added. `media.attachment_id` and `topics.status` were
	 * considered and rejected — nothing looks a row up by either.
	 *
	 * dbDelta only ever ADDS indexes; it never drops one. So the older
	 * single-column `replies.topic_id` and `replies.status` keys stay declared
	 * below even though the composites added in DB_VERSION 2 supersede them
	 * for reads. Removing the declarations would not remove them from any
	 * existing site's tables, and would only make this file disagree with
	 * reality. Dropping them needs a deliberate migration, worth doing once
	 * the index set has been confirmed with EXPLAIN against realistic data
	 * (see docs/decision-log.md — the staging data generator).
	 */
	private static function create_tables(): void {
		global $wpdb;
		$charset = $wpdb->get_charset_collate();

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_media (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
type VARCHAR(20) NOT NULL,
label VARCHAR(40) NOT NULL,
storage VARCHAR(20) NOT NULL DEFAULT 'local',
path TEXT NOT NULL,
parent_id BIGINT UNSIGNED DEFAULT NULL,
attachment_id BIGINT UNSIGNED DEFAULT NULL,
mime_type VARCHAR(100) DEFAULT NULL,
file_size BIGINT UNSIGNED DEFAULT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
KEY type (type),
KEY parent_id (parent_id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_topics (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
title VARCHAR(255) NOT NULL,
intro_media_id BIGINT UNSIGNED DEFAULT NULL,
social_image_media_id BIGINT UNSIGNED DEFAULT NULL,
hosted_by VARCHAR(255),
brand_terms_id BIGINT UNSIGNED NOT NULL,
custom_terms_id BIGINT UNSIGNED DEFAULT NULL,
invitation_id BIGINT UNSIGNED DEFAULT NULL,
status VARCHAR(20) NOT NULL DEFAULT 'active',
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
KEY invitation_id (invitation_id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_invitation_links (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
topic_id BIGINT UNSIGNED NOT NULL,
slug VARCHAR(20) NOT NULL,
type VARCHAR(20) NOT NULL,
status VARCHAR(20) NOT NULL DEFAULT 'open',
social_image_media_id BIGINT UNSIGNED DEFAULT NULL,
clicks BIGINT UNSIGNED NOT NULL DEFAULT 0,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
UNIQUE KEY slug (slug),
KEY topic_id (topic_id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_hosts (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
name VARCHAR(255) NOT NULL,
is_default TINYINT(1) NOT NULL DEFAULT 0,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
UNIQUE KEY name (name)
) $charset;"
		);

		// topic_status_created serves the moderation queue, which is the hot
		// admin path: WHERE topic_id AND status ORDER BY created_at.
		// topic_created serves the same listing unfiltered by status, where a
		// three-column index starting topic_id,status cannot help the sort.
		// invitation_link_id serves the per-link reply counts in
		// Clipisode_REST_API::list_invitation_links().
		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_replies (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
topic_id BIGINT UNSIGNED NOT NULL,
invitation_link_id BIGINT UNSIGNED,
name VARCHAR(255) NOT NULL,
media_id BIGINT UNSIGNED DEFAULT NULL,
transcript TEXT,
social_handle VARCHAR(255),
social_network VARCHAR(50),
tag VARCHAR(100),
status VARCHAR(20) NOT NULL DEFAULT 'unapproved',
email VARCHAR(255),
brand_terms_id BIGINT UNSIGNED DEFAULT NULL,
brand_terms_revision_id BIGINT UNSIGNED DEFAULT NULL,
custom_terms_id BIGINT UNSIGNED DEFAULT NULL,
custom_terms_revision_id BIGINT UNSIGNED DEFAULT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
KEY topic_id (topic_id),
KEY status (status),
KEY topic_status_created (topic_id,status,created_at),
KEY topic_created (topic_id,created_at),
KEY invitation_link_id (invitation_link_id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_outputs (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
topic_id BIGINT UNSIGNED DEFAULT NULL,
name VARCHAR(255) NOT NULL,
slug VARCHAR(255) NOT NULL,
upload_token VARCHAR(64) DEFAULT NULL,
media_id BIGINT UNSIGNED DEFAULT NULL,
composition LONGTEXT DEFAULT NULL,
created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY  (id),
UNIQUE KEY slug (slug),
KEY topic_id (topic_id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_contents (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
output_id BIGINT UNSIGNED NOT NULL,
media_id BIGINT UNSIGNED NOT NULL,
position INT UNSIGNED NOT NULL,
role VARCHAR(20) NOT NULL,
trim_start DECIMAL(10,3) NOT NULL,
trim_end DECIMAL(10,3) NOT NULL,
duration DECIMAL(10,3) NOT NULL,
PRIMARY KEY  (id),
KEY output_id (output_id),
KEY media_id (media_id)
) $charset;"
		);
	}
}
