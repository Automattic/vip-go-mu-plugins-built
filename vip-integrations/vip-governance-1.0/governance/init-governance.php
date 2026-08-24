<?php
/**
 * Intialize Block Governance
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

use Throwable;

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
	public static array $governance_configuration = [];

	/**
	 * Initialize the class
	 *
	 * @return void
	 */
	public static function init(): void {
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
	public static function load_settings(): void {
		// Only load the settings if the plugin is enabled, from the wp-admin settings page or a post/page is being edited.
		if ( ! Settings::is_enabled() || ! self::should_load_for_current_page() ) {
			return;
		} elseif ( empty( self::$governance_configuration ) ) {
			self::$governance_configuration = self::load_governance_configuration();
		}

		$asset_file_path = WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR . '/build/index.asset.php';
		if ( ! is_readable( $asset_file_path ) ) {
			Analytics::record_error();
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'VIP Block Governance asset manifest is not readable: %s', $asset_file_path ) );
			return;
		}

		$asset_file = include $asset_file_path;
		if ( ! is_array( $asset_file ) || ! isset( $asset_file['dependencies'], $asset_file['version'] ) || ! is_array( $asset_file['dependencies'] ) ) {
			Analytics::record_error();
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'VIP Block Governance asset manifest is invalid: %s', $asset_file_path ) );
			return;
		}

		wp_enqueue_script(
			'wpcomvip-governance',
			plugins_url( '/build/index.js', WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE ),
			$asset_file['dependencies'],
			$asset_file['version'],
			true /* in_footer */
		);

		$nested_settings_and_css = self::$governance_configuration['nestedSettingsAndCss'];

		wp_localize_script(
			'wpcomvip-governance',
			'VIP_GOVERNANCE',
			[
				'error'           => self::$governance_configuration['error'],
				'governanceRules' => self::$governance_configuration['governanceRules'],
				'nestedSettings'  => $nested_settings_and_css['settings'] ?? [],
				'urlSettingsPage' => menu_page_url( Settings::MENU_SLUG, /* display */ false ),
			]
		);
	}

	/**
	 * Load the CSS necessary for the block editor UI.
	 *
	 * @return void
	 *
	 * @access private
	 */
	public static function load_css(): void {
		if ( ! Settings::is_enabled() ) {
			return;
		} elseif ( empty( self::$governance_configuration ) ) {
			self::$governance_configuration = self::load_governance_configuration();
		}

		$nested_settings_and_css = self::$governance_configuration['nestedSettingsAndCss'];

		// Hack to load the CSS dynamically for the block editor without needing a blank CSS file.
		wp_register_style( 'wpcomvip-governance', false, [], WPCOMVIP__GOVERNANCE__PLUGIN_VERSION );
		wp_enqueue_style( 'wpcomvip-governance' );
		wp_add_inline_style( 'wpcomvip-governance', $nested_settings_and_css['css'] ?? '' );
	}

	/**
	 * Check whether governance assets should load for the current admin page.
	 *
	 * @return bool Whether the current page is a post editor.
	 */
	private static function should_load_for_current_page(): bool {
		// ToDo: Turn this into a configurable rule in the future.
		$allowed_pages = [ 'page-new.php', 'post-new.php', 'post.php' ];

		return in_array( $GLOBALS['pagenow'] ?? '', $allowed_pages, true );
	}

	/**
	 * Load the governance configuration, based on the user role and ensure the rules are valid.
	 *
	 * @return array Governance rules, based on the user role.
	 */
	private static function load_governance_configuration(): array {
		$governance_error          = false;
		$governance_rules_for_user = [];
		$nested_settings_and_css   = [];

		try {
			$parsed_governance_rules = GovernanceUtilities::get_parsed_governance_rules();

			if ( is_wp_error( $parsed_governance_rules ) ) {
				$governance_error = __( 'Governance rules could not be loaded.', 'vip-governance' );
			} else {
				$governance_rules_for_user = empty( $parsed_governance_rules )
					? self::get_permissive_governance_rules()
					: GovernanceUtilities::get_rules_by_type( $parsed_governance_rules );
				$block_settings_for_user   = $governance_rules_for_user['blockSettings'];
				$nested_settings_and_css   = NestedGovernanceProcessing::get_nested_settings_and_css( $block_settings_for_user );
				BlockLocking::init( $governance_rules_for_user['allowedFeatures'] );

				if ( ( time() % 10 ) === 0 ) {
					// Sample results. Only send analytics on 10% of configuration loads.
					Analytics::record_usage();
				}
			}
		} catch ( Throwable $throwable ) {
			// This is an unexpected exception. Record error for follow-up with WPVIP customers.
			Analytics::record_error();
			// ToDo: Log the error to QueryMonitor instead of doing this.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $throwable->getMessage() );

			$governance_error = __( 'Governance rules could not be loaded due to a plugin error.', 'vip-governance' );
		}

		return [
			'error'                => $governance_error,
			'governanceRules'      => $governance_rules_for_user,
			'nestedSettingsAndCss' => $nested_settings_and_css,
		];
	}

	/**
	 * Return a no-op ruleset when no usable rules remain.
	 *
	 * Trunk effectively skips governance when parsing produces no rules. Keeping all blocks and
	 * supported features available preserves that customer-facing behavior without surfacing an
	 * editor error from attempting to process an unshaped empty rules array.
	 *
	 * @return array Permissive effective governance rules.
	 */
	private static function get_permissive_governance_rules(): array {
		return [
			'allowedBlocks'   => [ '*' ],
			'blockSettings'   => [],
			'allowedFeatures' => [ 'codeEditor', 'lockBlocks' ],
		];
	}
}

InitGovernance::init();
