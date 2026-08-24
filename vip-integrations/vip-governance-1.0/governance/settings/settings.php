<?php
/**
 * Settings
 * 
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

/**
 * Settings class used for the settings page.
 */
class Settings {
	public const MENU_SLUG              = 'vip-block-governance';
	public const OPTIONS_KEY            = 'vip-governance';
	public const OPTIONS_KEY_IS_ENABLED = 'is-enabled';

	/**
	 * Initialize the class.
	 *
	 * @return void
	 * 
	 * @access private
	 */
	public static function init(): void {
		add_action( 'admin_init', [ __CLASS__, 'register_settings' ] );
		add_action( 'admin_menu', [ __CLASS__, 'register_menu' ] );
	}

	/**
	 * Register the settings in the settings page.
	 * 
	 * @return void
	 * 
	 * @access private
	 */
	public static function register_settings(): void {
		register_setting(
			self::OPTIONS_KEY,
			self::OPTIONS_KEY,
			[
				'type'              => 'array',
				'sanitize_callback' => [ __CLASS__, 'validate_options' ],
				'default'           => [ self::OPTIONS_KEY_IS_ENABLED => true ],
			]
		);

		$section_id = 'plugin-settings';
		add_settings_section( $section_id, __( 'Plugin Settings', 'vip-governance' ), '__return_null', self::MENU_SLUG );
		add_settings_field( self::OPTIONS_KEY_IS_ENABLED, __( 'Enable governance', 'vip-governance' ), [ __CLASS__, 'render_is_enabled' ], self::MENU_SLUG, $section_id, [
			'label_for' => self::OPTIONS_KEY_IS_ENABLED,
		] );
	}

	/**
	 * Register the menu in wp-admin
	 *
	 * @return void
	 * 
	 * @access private
	 */
	public static function register_menu(): void {
		$hook = add_menu_page( __( 'VIP Block Governance', 'vip-governance' ), __( 'VIP Block Governance', 'vip-governance' ), 'manage_options', self::MENU_SLUG, [ __CLASS__, 'render' ], 'dashicons-groups' );
		add_action( 'load-' . $hook, [ __CLASS__, 'enqueue_scripts' ] );
		add_action( 'load-' . $hook, [ __CLASS__, 'enqueue_resources' ] );
	}

	/**
	 * Load the CSS for the settings page.
	 *
	 * @return void
	 * 
	 * @access private
	 */
	public static function enqueue_resources(): void {
		wp_enqueue_style(
			'wpcomvip-governance-settings',
			plugins_url( '/governance/settings/settings.css', WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE ),
			/* dependencies */ [],
			WPCOMVIP__GOVERNANCE__PLUGIN_VERSION
		);
	}

	/**
	 * Load the JS for the settings page.
	 *
	 * @return void
	 *
	 * @access private
	 */
	public static function enqueue_scripts(): void {
		wp_enqueue_script(
			'wpcomvip-governance-settings',
			plugins_url( '/governance/settings/settings.js', WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE ),
			/* dependencies */ [ 'wp-api' ],
			WPCOMVIP__GOVERNANCE__PLUGIN_VERSION,
			/* in footer */ true
		);
	}

	/**
	 * Render the view for the setting page, which includes form to enable/disable the plugin
	 * and to show the rules along with its errors.
	 *
	 * @return void
	 * 
	 * @access private
	 */
	public static function render(): void {
		$post_types_available  = get_post_types();
		$user_roles_available  = array_keys( wp_roles()->roles );
		$governance_rules_json = GovernanceUtilities::get_governance_rules_json();
		$governance_error      = false;
		$governance_warnings   = [];
		if ( is_wp_error( $governance_rules_json ) ) {
			$governance_error      = $governance_rules_json->get_error_message();
			$governance_rules_json = false;
		} else {
			$parse_result = RulesParser::parse_with_warnings( $governance_rules_json );

			if ( is_wp_error( $parse_result ) ) {
				$governance_error = $parse_result->get_error_message();
			} else {
				$governance_warnings = $parse_result['warnings'];
			}
		}

		include __DIR__ . '/settings-view.php';
	}

	/**
	 * Setting used to enable/disable the plugin.
	 *
	 * @return void
	 * 
	 * @access private
	 */
	public static function render_is_enabled(): void {
		$options    = get_option( self::OPTIONS_KEY, [] );
		$options    = is_array( $options ) ? $options : [];
		$is_enabled = $options[ self::OPTIONS_KEY_IS_ENABLED ] ?? true;

		printf( '<input id="%1$s" name="%2$s[%1$s]" type="checkbox" value="yes" %3$s />', esc_attr( self::OPTIONS_KEY_IS_ENABLED ), esc_attr( self::OPTIONS_KEY ), checked( $is_enabled, true, false ) );
		printf( '<label for="%s"><p class="description" style="display: inline-block; margin-left: 0.25rem">%s</p></label>', esc_attr( self::OPTIONS_KEY_IS_ENABLED ), esc_html__( 'Enable block editor governance rules for all users.', 'vip-governance' ) );
	}

	/**
	 * Ensure that the options are valid.
	 *
	 * @param mixed $options Options that have been submitted.
	 * 
	 * @return array Sanitized settings.
	 */
	public static function validate_options( $options ): array {
		return [
			self::OPTIONS_KEY_IS_ENABLED => is_array( $options )
				&& isset( $options[ self::OPTIONS_KEY_IS_ENABLED ] )
				&& 'yes' === $options[ self::OPTIONS_KEY_IS_ENABLED ],
		];
	}

	/**
	 * Check if the plugin is to be enabled or not.
	 *
	 * @return boolean True, if it is or false otherwise.
	 * 
	 * @access private
	 */
	public static function is_enabled(): bool {
		$options = get_option( self::OPTIONS_KEY, [] );
		$options = is_array( $options ) ? $options : [];
		return true === ( $options[ self::OPTIONS_KEY_IS_ENABLED ] ?? true );
	}
}

Settings::init();
