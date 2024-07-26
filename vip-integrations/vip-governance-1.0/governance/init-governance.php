<?php
/**
 * Intialize Block Governance
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

use Exception;
use Error;

/**
 * Initializes the block governance plugin.
 */
class InitGovernance {
	/**
	 * Governance configuration.
	 *
	 * @var array
	 *
	 * @access private
	 */
	public static $governance_configuration = [];

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public static function init() {
		// Assets for block editor UI.
		add_action( 'enqueue_block_editor_assets', [ __CLASS__, 'load_settings' ] );

		// Assets for iframed block editor and editor UI.
		add_action( 'enqueue_block_assets', [ __CLASS__, 'load_css' ] );
	}

	/**
	 * Load the settings necessary for the block editor UI.
	 *
	 * @return void
	 *
	 * @access private
	 */
	public static function load_settings() {
		// ToDo: Turn this into a configurable rule in the future.
		// Only load the settings for the post/page editor.
		$allowed_pages                         = [ 'page-new.php', 'post-new.php', 'post.php' ];
		$should_load_settings_for_current_page = in_array( $GLOBALS['pagenow'], $allowed_pages, true );

		// Only load the settings if the plugin is enabled, from the wp-admin settings page or a post/page is being edited.
		if ( ! Settings::is_enabled() || ! $should_load_settings_for_current_page ) {
			return;
		} elseif ( empty( self::$governance_configuration ) ) {
			self::$governance_configuration = self::load_governance_configuration();
		}

		$asset_file = include WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR . '/build/index.asset.php';

		wp_enqueue_script(
			'wpcomvip-governance',
			plugins_url( '/build/index.js', WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE ),
			$asset_file['dependencies'],
			$asset_file['version'],
			true /* in_footer */
		);

		$nested_settings_and_css = self::$governance_configuration['nestedSettingsAndCss'];

		wp_localize_script('wpcomvip-governance', 'VIP_GOVERNANCE', [
			'error'           => self::$governance_configuration['error'],
			'governanceRules' => self::$governance_configuration['governanceRules'],
			'nestedSettings'  => isset( $nested_settings_and_css['settings'] ) ? $nested_settings_and_css['settings'] : [],
			'urlSettingsPage' => menu_page_url( Settings::MENU_SLUG, /* display */ false ),
		]);
	}

	/**
	 * Load the CSS necessary for the block editor UI.
	 *
	 * @return void
	 *
	 * @access private
	 */
	public static function load_css() {
		if ( ! Settings::is_enabled() ) {
			return;
		} elseif ( empty( self::$governance_configuration ) ) {
			self::$governance_configuration = self::load_governance_configuration();
		}

		$nested_settings_and_css = self::$governance_configuration['nestedSettingsAndCss'];

		wp_enqueue_style(
			'wpcomvip-governance',
			plugins_url( '/css/vip-governance.css', WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE ),
			/* dependencies */ [],
			WPCOMVIP__GOVERNANCE__PLUGIN_VERSION
		);

		wp_add_inline_style( 'wpcomvip-governance', $nested_settings_and_css['css'] ?? '' );
	}

	/**
	 * Load the governance configuration, based on the user role and ensure the rules are valid.
	 *
	 * @return array Governance rules, based on the user role.
	 */
	private static function load_governance_configuration() {
		$governance_error          = false;
		$governance_rules_for_user = [];
		$nested_settings_and_css   = [];

		try {
			$parsed_governance_rules = GovernanceUtilities::get_parsed_governance_rules();

			if ( is_wp_error( $parsed_governance_rules ) ) {
				$governance_error = __( 'Governance rules could not be loaded.' );
			} else {
				$governance_rules_for_user = GovernanceUtilities::get_rules_by_type( $parsed_governance_rules );
				$block_settings_for_user   = $governance_rules_for_user['blockSettings'];
				$nested_settings_and_css   = NestedGovernanceProcessing::get_nested_settings_and_css( $block_settings_for_user );
				BlockLocking::init( $governance_rules_for_user['allowedFeatures'] );
				Analytics::record_usage();
			}
		} catch ( Exception | Error $e ) {
			// This is an unexpected exception. Record error for follow-up with WPVIP customers.
			Analytics::record_error();
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $e->getMessage() );

			$governance_error = __( 'Governance rules could not be loaded due to a plugin error.' );
		}

		return [
			'error'                => $governance_error,
			'governanceRules'      => $governance_rules_for_user,
			'nestedSettingsAndCss' => $nested_settings_and_css,
		];
	}
}

InitGovernance::init();
