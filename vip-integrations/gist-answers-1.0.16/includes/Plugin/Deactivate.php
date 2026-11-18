<?php
/**
 * Deactivation class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use GistAnswers\Admin\AdminMain;
use GistAnswers\Plugin\CommonMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Deactivation class for the Gist Answers plugin.
 */
final class Deactivate {

	/**
	 * Deactivates the plugin.
	 *
	 * @param bool $network_wide Optional. Whether the plugin is being deactivated for the whole network. Defaults to false.
	 *
	 * @return void
	 */
	public static function deactivate( bool $network_wide = false ): void { // phpcs:ignore Generic.NamingConventions.ConstructorName.OldStyle -- False positive; the sniff matches the class name case-insensitively, but PHP 4-style constructors do not exist in namespaced classes or in PHP 8+.

		if ( is_multisite() ) {
			update_site_option( CommonMain::ACTIVATION_FLAG, false );
		} else {
			update_option( CommonMain::ACTIVATION_FLAG, false );
		}

		// Each site has its own WP-Cron events, and a network deactivation only runs this once, on the main site.
		AdminMain::clear_ingestion( is_multisite() && $network_wide );

		do_action( 'gist_answers_plugin_deactivated' );
	}
}
