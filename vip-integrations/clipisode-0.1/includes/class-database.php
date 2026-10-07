<?php

defined( 'ABSPATH' ) || exit;

class Clipisode_Database {

	private const VERSION = '2';

	public static function maybe_upgrade(): void {
		if ( self::VERSION !== get_option( 'clipisode_database_version' ) ) {
			self::create_tables();
		}
	}

	public static function activate(): void {
		self::create_tables();
		self::ensure_default_host();
		Clipisode_Post_Types::ensure_default_invitation();
		Clipisode_Post_Types::ensure_default_preview();
	}

	private static function ensure_default_host(): void {
		global $wpdb;
		$table = $wpdb->prefix . 'clipisode_hosts';
		$count = (int) $wpdb->get_var( "SELECT COUNT(*) FROM $table" );
		if ( $count > 0 ) {
			return;
		}

		$user = wp_get_current_user();
		if ( ! $user || ! $user->ID ) {
			return;
		}

		$wpdb->insert( $table, [
			'name'       => $user->display_name,
			'is_default' => 1,
		] );
	}

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
PRIMARY KEY  (id)
) $charset;"
		);

		dbDelta(
			"CREATE TABLE {$wpdb->prefix}clipisode_invitation_links (
id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
topic_id BIGINT UNSIGNED NOT NULL,
slug VARCHAR(20) NOT NULL,
type VARCHAR(20) NOT NULL,
status VARCHAR(20) NOT NULL DEFAULT 'open',
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
KEY status (status)
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
		if ( $wpdb->get_var( "SHOW COLUMNS FROM {$wpdb->prefix}clipisode_outputs LIKE 'composition'" ) ) {
			update_option( 'clipisode_database_version', self::VERSION );
		}
	}
}
