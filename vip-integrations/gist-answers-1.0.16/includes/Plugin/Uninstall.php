<?php
/**
 * Uninstallation class for the Gist Answers plugin.
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
 * Uninstallation class for the Gist Answers plugin.
 */
final class Uninstall {

	/**
	 * Uninstalls the plugin.
	 *
	 * @return void
	 */
	public static function uninstall(): void { // phpcs:ignore Generic.NamingConventions.ConstructorName.OldStyle -- False positive; the sniff matches the class name case-insensitively, but PHP 4-style constructors do not exist in namespaced classes or in PHP 8+.

		if ( is_multisite() ) {
			delete_site_option( CommonMain::ACTIVATION_FLAG );
		} else {
			delete_option( CommonMain::ACTIVATION_FLAG );
		}

		AdminMain::clear_ingestion( true, true );

		do_action( 'gist_answers_plugin_uninstalled' );
	}
}
