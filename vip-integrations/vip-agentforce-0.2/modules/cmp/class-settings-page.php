<?php
/**
 * Class for Settings Page using WP Settings API.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Cmp;

use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\Singleton;
use Automattic\VIP\Salesforce\Agentforce\Utils\Traits\WithPluginPaths;
use Automattic\VIP\Salesforce\Agentforce\Constants;

/**
 * Class Settings_Page
 */
class Settings_Page {

	use Singleton;
	use WithPluginPaths;

	/**
	 * Construct method.
	 */
	protected function __construct() {
		$this->setup_hooks();
	}

	/**
	 * To setup action/filter.
	 *
	 * @return void
	 */
	protected function setup_hooks() {
		add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );
		add_action( 'admin_notices', array( $this, 'handle_settings_saved' ) );
	}

	/**
	 * Handle settings saved message.
	 */
	public function handle_settings_saved(): void {
		$screen = get_current_screen();
		if ( $screen && 'toplevel_page_vip-agentforce-settings' === $screen->id &&
			isset( $_GET['settings-updated'] ) && sanitize_text_field( $_GET['settings-updated'] ) ) { //phpcs:ignore WordPress.Security.NonceVerification.Recommended

			if ( ! get_settings_errors( 'vip_agentforce_messages' ) ) {
				add_settings_error(
					'vip_agentforce_messages',
					'vip_agentforce_message',
					__( 'Settings Saved', 'vip-agentforce' ),
					'success'
				);
			}
		}
	}

	/**
	 * Validate iubenda Purpose ID.
	 *
	 * @param string $purpose_id The Purpose ID to validate.
	 *
	 * @return string|mixed The validated Purpose ID or old value if invalid.
	 */
	public function validate_iubenda_category( $purpose_id ) {
		$purpose_id            = trim( (string) $purpose_id );
		$old_value             = get_option( 'vip_agentforce_iubenda_category' );
		$selected_consent_type = $this->sanitize_consent_type( (string) get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP ) );

		if ( isset( $_POST['vip_agentforce_consent_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			// phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- options.php verifies the nonce, and the value is sanitized after confirming it is a string.
			$submitted_consent_type = wp_unslash( $_POST['vip_agentforce_consent_type'] );

			if ( is_string( $submitted_consent_type ) ) {
				$selected_consent_type = $this->sanitize_consent_type( sanitize_text_field( $submitted_consent_type ) );
			}
		}

		if ( empty( $purpose_id ) ) {
			if ( 'iubenda' === $selected_consent_type ) {
				add_settings_error(
					'vip_agentforce_messages',
					'vip_agentforce_iubenda_category_error',
					__( 'iubenda Purpose ID cannot be empty.', 'vip-agentforce' ),
					'error'
				);

				return $old_value;
			}

			return Constants::DEFAULT_IUBENDA_PURPOSE_ID;
		}

		$purpose_id = intval( $purpose_id );
		if ( $purpose_id < 1 || $purpose_id > 5 ) {
			add_settings_error(
				'vip_agentforce_messages',
				'vip_agentforce_iubenda_category_error',
				__( 'iubenda Purpose ID must be between 1 and 5.', 'vip-agentforce' ),
				'error'
			);

			return $old_value;
		}

		return strval( $purpose_id );
	}

	/**
	 * Validate alignment value.
	 *
	 * @param string $val The alignment value to validate.
	 *
	 * @return string Validated alignment value or default if invalid.
	 */
	public function validate_alignment( $val ) {
		$allowed = array( 'bottom-right', 'bottom-left' );
		$val     = is_string( $val ) ? strtolower( trim( $val ) ) : 'bottom-right';

		return in_array( $val, $allowed, true ) ? $val : 'bottom-right';
	}

	/**
	 * Sanitize custom CSS so valid selectors are preserved while HTML payloads are stripped.
	 *
	 * @param mixed $css The CSS to sanitize.
	 *
	 * @return string Sanitized CSS.
	 */
	public static function sanitize_custom_css( $css ): string {
		$css = is_string( $css ) ? $css : '';
		$css = html_entity_decode( $css, ENT_QUOTES | ENT_HTML5, 'UTF-8' );

		return wp_strip_all_tags( $css );
	}

	/**
	 * Add settings page to the admin menu.
	 */
	public function add_settings_page(): void {
		add_menu_page(
			__( 'Agentforce Settings', 'vip-agentforce' ),
			__( 'Agentforce', 'vip-agentforce' ),
			'manage_options',
			'vip-agentforce-settings',
			array( $this, 'render_settings_page' ),
			$this->get_integration_url() . '/assets/images/agentforce-icon.svg',
		);
	}

	/**
	 * Register settings.
	 */
	public function register_settings(): void {
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_consent_type',
			array(
				'sanitize_callback' => array( $this, 'sanitize_consent_type' ),
			)
		);
		register_setting( 'agentforce_settings_group', 'vip_agentforce_onetrust_group_id' );
		register_setting( 'agentforce_settings_group', 'vip_agentforce_cookiebot_category' );
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_iubenda_category',
			array(
				'sanitize_callback' => array( $this, 'validate_iubenda_category' ),
			)
		);
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_alignment',
			array(
				'sanitize_callback' => array(
					$this,
					'validate_alignment',
				),
			)
		);
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_custom_css',
			array(
				'sanitize_callback' => array(
					self::class,
					'sanitize_custom_css',
				),
			)
		);
	}

	/**
	 * Sanitize consent type.
	 * @param string $value The consent type value.
	 * @return string The sanitized consent type.
	 */
	public function sanitize_consent_type( string $value ): string {
		return in_array( $value, Constants::SUPPORTED_CMPS, true ) ? $value : Constants::DEFAULT_CMP;
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page(): void {
		do_action( 'vip_agentforce_track_event', 'cmp_page_viewed', [] );
		do_action( 'vip_agentforce_track_stat', 'cmp_page_viewed' );

		$settings_data = array(
			'values' => array(
				'consentType'       => get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP ),
				'oneTrustGroupId'   => get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID ),
				'cookiebotCategory' => get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY ),
				'iubendaPurposeId'  => get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID ),
				'alignment'         => get_option( 'vip_agentforce_alignment', 'bottom-right' ),
				'customCss'         => self::sanitize_custom_css( get_option( 'vip_agentforce_custom_css', '' ) ),
			),
		);
		?>
		<div class="wrap agentforce-wrap">
			<h1><?php esc_html_e( 'Agentforce Settings', 'vip-agentforce' ); ?></h1>
			<p class="af-page-description"><?php esc_html_e( 'Saved changes will be applied on the next page load.', 'vip-agentforce' ); ?></p>
			<?php settings_errors( 'vip_agentforce_messages' ); ?>
			<form method="post" action="options.php">
				<?php settings_fields( 'agentforce_settings_group' ); ?>
				<div id="vip-agentforce-settings-app" data-settings="<?php echo esc_attr( wp_json_encode( $settings_data ) ); ?>"></div>
			</form>
		</div>
		<?php
	}
}
