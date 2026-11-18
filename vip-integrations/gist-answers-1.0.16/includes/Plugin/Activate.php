<?php
/**
 * Activation class for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Plugin;

use GistAnswers\Plugin\CommonMain;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Activation class for the Gist Answers plugin.
 */
final class Activate {

	public const NEW_ACTIVATION_FLAG = 'gist_answers_plugin_new_activation';

	/**
	 * Activates the plugin.
	 *
	 * @return void
	 */
	public static function activate(): void { // phpcs:ignore Generic.NamingConventions.ConstructorName.OldStyle -- False positive; the sniff matches the class name case-insensitively, but PHP 4-style constructors do not exist in namespaced classes or in PHP 8+.

		if ( is_multisite() ) {

			set_site_transient( self::NEW_ACTIVATION_FLAG, true, 60 );

			update_site_option( CommonMain::ACTIVATION_FLAG, true );

		} else {

			set_transient( self::NEW_ACTIVATION_FLAG, true, 60 );

			update_option( CommonMain::ACTIVATION_FLAG, true );
		}

		do_action( 'gist_answers_plugin_activated' );
	}
}
