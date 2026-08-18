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
	 * Validate OneTrust Group ID.
	 *
	 * OneTrust group IDs are renameable per customer and custom groups are common, so
	 * there is no allowlist to check against - this only rejects values that cannot be
	 * a group ID at all. A well-formed but wrong ID is caught at runtime by the console
	 * warning in cmp-onetrust.js.
	 *
	 * @param mixed $group_id The Group ID to validate. `null` when OneTrust is not the
	 *                        selected CMP, since options.php writes null for every
	 *                        registered setting whose field was not rendered.
	 *
	 * @return string|mixed The validated Group ID or old value if invalid.
	 */
	public function validate_onetrust_group_id( $group_id ) {
		$group_id              = sanitize_text_field( trim( (string) $group_id ) );
		$old_value             = sanitize_text_field( (string) get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID ) );
		$selected_consent_type = $this->get_submitted_consent_type();

		// No value submitted. When OneTrust is selected that is an empty field and an
		// error; otherwise the field simply was not rendered. Either way keep what is
		// stored - resetting would silently re-point gating at a group the customer
		// never chose, and the stock default exists in most OneTrust configs, so the
		// runtime warning would not fire.
		if ( '' === $group_id ) {
			if ( 'OneTrust' === $selected_consent_type ) {
				add_settings_error(
					'vip_agentforce_messages',
					'vip_agentforce_onetrust_group_id_error',
					__( 'OneTrust Group ID cannot be empty.', 'vip-agentforce' ),
					'error'
				);
			}

			return $old_value;
		}

		if ( ! preg_match( '/^[A-Za-z0-9_-]{1,64}$/', $group_id ) ) {
			add_settings_error(
				'vip_agentforce_messages',
				'vip_agentforce_onetrust_group_id_error',
				__( 'OneTrust Group ID must be 64 characters or fewer and may only contain letters, numbers, hyphens, and underscores.', 'vip-agentforce' ),
				'error'
			);

			return $old_value;
		}

		return $group_id;
	}

	/**
	 * Resolve the consent type being saved, falling back to the stored value.
	 *
	 * @return string The sanitized consent type.
	 */
	private function get_submitted_consent_type(): string {
		$selected_consent_type = $this->sanitize_consent_type( (string) get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP ) );

		if ( isset( $_POST['vip_agentforce_consent_type'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing
			// phpcs:ignore WordPress.Security.NonceVerification.Missing,WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- options.php verifies the nonce, and the value is sanitized after confirming it is a string.
			$submitted_consent_type = wp_unslash( $_POST['vip_agentforce_consent_type'] );

			if ( is_string( $submitted_consent_type ) ) {
				$selected_consent_type = $this->sanitize_consent_type( sanitize_text_field( $submitted_consent_type ) );
			}
		}

		return $selected_consent_type;
	}

	/**
	 * Validate iubenda Purpose ID.
	 *
	 * @param mixed $purpose_id The Purpose ID to validate. `null` when iubenda is not
	 *                          the selected CMP, since options.php writes null for
	 *                          every registered setting whose field was not rendered.
	 *
	 * @return string|mixed The validated Purpose ID or old value if invalid.
	 */
	public function validate_iubenda_category( $purpose_id ) {
		$purpose_id            = trim( (string) $purpose_id );
		$old_value             = (string) get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID );
		$selected_consent_type = $this->get_submitted_consent_type();

		// Same as OneTrust above: no submitted value means either an empty field or a
		// field that was not rendered, and neither is a reason to discard the stored ID.
		if ( '' === $purpose_id ) {
			if ( 'iubenda' === $selected_consent_type ) {
				add_settings_error(
					'vip_agentforce_messages',
					'vip_agentforce_iubenda_category_error',
					__( 'iubenda Purpose ID cannot be empty.', 'vip-agentforce' ),
					'error'
				);
			}

			return $old_value;
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
	 * Validate CookieYes category value.
	 *
	 * @param mixed $category The CookieYes category value to validate. `null` when
	 *                        CookieYes is not the selected CMP.
	 *
	 * @return string Validated CookieYes category or default if invalid.
	 */
	public function validate_cookieyes_category( $category ): string {
		// Nothing submitted means the field was not rendered, so keep the stored value
		// rather than resetting a category the customer deliberately chose.
		if ( ! is_string( $category ) || '' === trim( $category ) ) {
			$category = (string) get_option( 'vip_agentforce_cookieyes_category', Constants::DEFAULT_COOKIEYES_CATEGORY );
		}

		$category = strtolower( trim( $category ) );

		return in_array( $category, Constants::COOKIEYES_CATEGORIES, true ) ? $category : Constants::DEFAULT_COOKIEYES_CATEGORY;
	}

	/**
	 * Validate Cookiebot category value.
	 *
	 * @param mixed $category The Cookiebot category value to validate. `null` when
	 *                        Cookiebot is not the selected CMP.
	 *
	 * @return string Validated Cookiebot category or default if invalid.
	 */
	public function validate_cookiebot_category( $category ): string {
		// Nothing submitted means the field was not rendered. This matters more since
		// the default moved from "marketing" to "preferences": resetting would loosen
		// the gate on a site that had deliberately picked the stricter category.
		if ( ! is_string( $category ) || '' === trim( $category ) ) {
			$category = (string) get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY );
		}

		$category = strtolower( trim( $category ) );

		return in_array( $category, Constants::COOKIEBOT_CATEGORIES, true ) ? $category : Constants::DEFAULT_COOKIEBOT_CATEGORY;
	}

	/**
	 * Add settings page to the admin menu.
	 */
	public function add_settings_page(): void {
		add_menu_page(
			__( 'Answers Agent Settings', 'vip-agentforce' ),
			__( 'Answers Agent', 'vip-agentforce' ),
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
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_onetrust_group_id',
			array(
				'sanitize_callback' => array( $this, 'validate_onetrust_group_id' ),
			)
		);
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_cookieyes_category',
			array(
				'sanitize_callback' => array( $this, 'validate_cookieyes_category' ),
			)
		);
		register_setting(
			'agentforce_settings_group',
			'vip_agentforce_cookiebot_category',
			array(
				'sanitize_callback' => array( $this, 'validate_cookiebot_category' ),
			)
		);
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
	}

	/**
	 * Sanitize consent type.
	 *
	 * Renamed values are mapped to their current name first, so sites still storing
	 * a pre-rename value keep the CMP they configured instead of being downgraded
	 * to the default. Matching is otherwise exact.
	 *
	 * @param mixed $value The consent type value. Deliberately untyped: options.php
	 *                     passes `null` for any registered setting whose field was not
	 *                     rendered, which a `string` hint would turn into a TypeError.
	 * @return string The sanitized consent type.
	 */
	public function sanitize_consent_type( $value ): string {
		$value = sanitize_text_field( trim( (string) $value ) );
		$value = Constants::LEGACY_CMP_ALIASES[ $value ] ?? $value;

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
				'consentType'       => $this->sanitize_consent_type( (string) get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP ) ),
				'oneTrustGroupId'   => get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID ),
				'cookieyesCategory' => $this->validate_cookieyes_category( get_option( 'vip_agentforce_cookieyes_category', Constants::DEFAULT_COOKIEYES_CATEGORY ) ),
				'cookiebotCategory' => $this->validate_cookiebot_category( get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY ) ),
				'iubendaPurposeId'  => get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID ),
				'alignment'         => get_option( 'vip_agentforce_alignment', 'bottom-right' ),
			),
		);
		?>
		<div class="wrap agentforce-wrap">
			<h1><?php esc_html_e( 'Answers Agent Settings', 'vip-agentforce' ); ?></h1>
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
