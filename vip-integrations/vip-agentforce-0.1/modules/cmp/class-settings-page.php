<?php
/**
 * Class for Settings Page using WP Settings API.
 */

namespace Automattic\VIP\Salesforce\Agentforce\Cmp;

use Automattic\VIP\Salesforce\Agentforce\Utils\Configs;
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
		$purpose_id = trim( $purpose_id );
		$old_value  = get_option( 'vip_agentforce_iubenda_category' );

		if ( empty( $purpose_id ) ) {
			add_settings_error(
				'vip_agentforce_messages',
				'vip_agentforce_iubenda_category_error',
				__( 'iubenda Purpose ID cannot be empty.', 'vip-agentforce' ),
				'error'
			);

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
	 * Sanitize toggle checkbox value.
	 *
	 * @param mixed $val The value to sanitize.
	 *
	 * @return int Sanitized value (1 for checked, 0 for unchecked).
	 */
	public function sanitize_toggle( $val ) {
		return ! empty( $val ) ? 1 : 0;
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
	 * Sanitize custom CSS.
	 *
	 * @param mixed $css The CSS to sanitize.
	 *
	 * @return string Sanitized CSS.
	 */
	public function sanitize_custom_css( $css ) {
		$css = is_string( $css ) ? $css : '';

		return wp_kses( $css, array() );
	}

	/** Render: Enable log checkbox */
	public function render_oplog_field(): void {
		$value = (int) get_option( 'vip_agentforce_enable_oplog', 1 );
		echo '<label><input type="checkbox" name="vip_agentforce_enable_oplog" value="1" ' . checked( 1, $value, false ) . '> ' . esc_html__( 'Enable log', 'vip-agentforce' ) . '</label>';
	}

	/** Render: Alignment radio buttons */
	public function render_alignment_field(): void {
		$value   = get_option( 'vip_agentforce_alignment', 'bottom-right' );
		$options = array(
			'bottom-right' => __( 'Bottom right', 'vip-agentforce' ),
			'bottom-left'  => __( 'Bottom left', 'vip-agentforce' ),
		);
		echo '<fieldset class="agentforce-radios">';
		foreach ( $options as $k => $label ) {
			echo '<label style="display:block;margin:6px 0;">';
			echo '<input type="radio" name="vip_agentforce_alignment" value="' . esc_attr( $k ) . '" ' . checked( $value, $k, false ) . '> ' . esc_html( $label );
			echo '</label>';
		}
		echo '</fieldset>';
	}

	/** Render: Custom CSS textarea */
	public function render_custom_css_field(): void {
		$value = get_option( 'vip_agentforce_custom_css', '' );
		echo '<textarea name="vip_agentforce_custom_css" rows="3" class="large-text code" placeholder="/* Paste CSS to override agentforce styles */">' . esc_textarea( $value ) . '</textarea>';
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
	 * Register settings, sections, and fields.
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
			'vip_agentforce_enable_oplog',
			array(
				'sanitize_callback' => array(
					$this,
					'sanitize_toggle',
				),
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
					$this,
					'sanitize_custom_css',
				),
			)
		);

		add_settings_section(
			'agentforce_settings_section',
			__( 'General Settings', 'vip-agentforce' ),
			'__return_false',
			'vip-agentforce-settings'
		);

		add_settings_field(
			'agentforce_js_sdk_url',
			__( 'Salesforce SDK URL', 'vip-agentforce' ),
			array( $this, 'render_sdk_url_field' ),
			'vip-agentforce-settings',
			'agentforce_settings_section'
		);

		add_settings_field(
			'vip_agentforce_consent_type',
			__( 'Consent Type', 'vip-agentforce' ),
			array( $this, 'render_consent_type_field' ),
			'vip-agentforce-settings',
			'agentforce_settings_section'
		);

		add_settings_field(
			'vip_agentforce_onetrust_group_id',
			__( 'OneTrust Group ID', 'vip-agentforce' ),
			array( $this, 'render_onetrust_group_id_field' ),
			'vip-agentforce-settings',
			'agentforce_settings_section'
		);

		add_settings_field(
			'vip_agentforce_cookiebot_category',
			__( 'Cookiebot Category', 'vip-agentforce' ),
			array( $this, 'render_cookiebot_category_field' ),
			'vip-agentforce-settings',
			'agentforce_settings_section'
		);

		add_settings_field(
			'vip_agentforce_iubenda_category',
			__( 'iubenda Purpose ID', 'vip-agentforce' ),
			array( $this, 'render_iubenda_category_field' ),
			'vip-agentforce-settings',
			'agentforce_settings_section'
		);

		add_settings_section(
			'agentforce_bot_ui_section',
			__( 'Agent UI', 'vip-agentforce' ),
			'__return_false',
			'vip-agentforce-settings'
		);

		add_settings_field(
			'vip_agentforce_alignment',
			__( 'Alignment', 'vip-agentforce' ),
			array( $this, 'render_alignment_field' ),
			'vip-agentforce-settings',
			'agentforce_bot_ui_section'
		);

		add_settings_field(
			'vip_agentforce_custom_css',
			__( 'Custom CSS (optional)', 'vip-agentforce' ),
			array( $this, 'render_custom_css_field' ),
			'vip-agentforce-settings',
			'agentforce_bot_ui_section'
		);

		add_settings_section(
			'agentforce_debug_section',
			__( 'Debug', 'vip-agentforce' ),
			'__return_false',
			'vip-agentforce-settings'
		);

		add_settings_field(
			'vip_agentforce_enable_oplog',
			__( 'Enable log', 'vip-agentforce' ),
			array( $this, 'render_oplog_field' ),
			'vip-agentforce-settings',
			'agentforce_debug_section'
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
	 * Render the Enable SDK activation status.
	 */
	public function render_enable_sdk_field(): void {
		$is_activated = Configs::is_js_sdk_activated();
		$status       = $is_activated ? 'active' : 'inactive';
		$status_label = $is_activated ? __( 'Activated', 'vip-agentforce' ) : __( 'Not activated', 'vip-agentforce' );

		printf(
			'<span id="agentforce-sdk-activation-status" data-status="%s">%s</span>',
			esc_attr( $status ),
			esc_html( $status_label )
		);
	}

	/**
	 * Render the Salesforce SDK URL.
	 */
	public function render_sdk_url_field(): void {
		$value = Configs::get_js_sdk_url();
		if ( ! empty( $value ) ) {
			printf(
				'<code id="agentforce-sdk-url" data-url="%s">%s</code>',
				esc_attr( $value ),
				esc_html( $value )
			);
		} else {
			printf(
				'<code id="agentforce-sdk-url" data-url="">%s</code>',
				esc_html__( 'Not configured', 'vip-agentforce' )
			);
		}
	}

	/**
	 * Render the consent type dropdown.
	 */
	public function render_consent_type_field(): void {
		$value = get_option( 'vip_agentforce_consent_type', Constants::DEFAULT_CMP );
		?>
		<select name="vip_agentforce_consent_type">
			<option
				value="CookieYes" <?php selected( $value, 'CookieYes' ); ?>><?php esc_html_e( 'CookieYes', 'vip-agentforce' ); ?>
			</option>
			<option
				value="CookieBot" <?php selected( $value, 'CookieBot' ); ?>><?php esc_html_e( 'CookieBot', 'vip-agentforce' ); ?>
			</option>
			<option
				value="OneTrust" <?php selected( $value, 'OneTrust' ); ?>><?php esc_html_e( 'OneTrust', 'vip-agentforce' ); ?>
			</option>
			<option
				value="iubenda" <?php selected( $value, 'iubenda' ); ?>><?php esc_html_e( 'iubenda', 'vip-agentforce' ); ?>
			</option>
			<option
				value="Custom" <?php selected( $value, 'Custom' ); ?>><?php esc_html_e( 'Custom', 'vip-agentforce' ); ?>
			</option>
		</select>
		<?php
	}

	/**
	 * Render the OneTrust Group ID text field.
	 */
	public function render_onetrust_group_id_field(): void {
		// Use the constant from Constants class.
		$value = get_option( 'vip_agentforce_onetrust_group_id', Constants::DEFAULT_ONETRUST_GROUP_ID );
		printf(
			'<input type="text" name="vip_agentforce_onetrust_group_id" value="%s" class="regular-text" />',
			esc_attr( $value )
		);
	}

	/**
	 * Render the Cookiebot category text field.
	 */
	public function render_cookiebot_category_field(): void {
		$value = get_option( 'vip_agentforce_cookiebot_category', Constants::DEFAULT_COOKIEBOT_CATEGORY );
		printf(
			'<input type="text" name="vip_agentforce_cookiebot_category" value="%s" class="regular-text" />',
			esc_attr( $value )
		);
		printf(
			'<p class="description">%s<br>%s<br><code>window.Cookiebot.consent</code></p>',
			esc_html__( 'Enter the Cookiebot category (e.g., necessary, preferences, statistics, marketing).', 'vip-agentforce' ),
			esc_html__( 'To see all available categories for your site, open browser console and run:', 'vip-agentforce' )
		);
	}

	/**
	 * Render the iubenda Purpose ID text field.
	 */
	public function render_iubenda_category_field(): void {
		$value = get_option( 'vip_agentforce_iubenda_category', Constants::DEFAULT_IUBENDA_PURPOSE_ID );
		printf(
			'<input type="number" name="vip_agentforce_iubenda_category" value="%s" class="small-text" min="1" max="5" />',
			esc_attr( $value )
		);
		printf(
			'<p class="description">%s %s <a href="https://www.iubenda.com/en/help/1205-how-to-configure-your-cookie-solution-advanced-guide#per-category-consent" target="_blank">%s</a><br>%s<br><code>_iub.cs.api.getPreferences().purposes</code></p>',
			esc_html__( 'Enter the iubenda Purpose ID (1-5).', 'vip-agentforce' ),
			esc_html__( 'See the', 'vip-agentforce' ),
			esc_html__( 'iubenda documentation', 'vip-agentforce' ),
			esc_html__( 'To see all available purpose IDs for your site, open browser console and run:', 'vip-agentforce' )
		);
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page(): void {
		$php_version = PHP_VERSION;

		do_action( 'vip_agentforce_track_event', 'cmp_page_viewed', [] );
		do_action( 'vip_agentforce_track_stat', 'cmp_page_viewed' );
		$xdebug   = extension_loaded( 'xdebug' ) ? __( 'Enabled', 'vip-agentforce' ) : __( 'Disabled', 'vip-agentforce' );
		$site_url = home_url();
		?>
		<div class="wrap agentforce-wrap">
			<h1><?php esc_html_e( 'Agentforce Settings', 'vip-agentforce' ); ?></h1>
			<?php settings_errors( 'vip_agentforce_messages' ); ?>
			<form method="post" action="options.php">
				<?php settings_fields( 'agentforce_settings_group' ); ?>

				<div class="af-grid">
					<div class="af-col">
						<div class="af-card">
							<h2><?php esc_html_e( 'General', 'vip-agentforce' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr id="row_enable_sdk">
									<th scope="row"><?php esc_html_e( 'SDK activation', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_enable_sdk_field(); ?></td>
								</tr>
								<tr id="row_sdk">
									<th scope="row"><?php esc_html_e( 'Salesforce SDK URL', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_sdk_url_field(); ?><p
											class="description"><?php esc_html_e( 'This is read-only and comes from the VIP integration configuration.', 'vip-agentforce' ); ?></p>
									</td>
								</tr>
								<tr id="row_consent">
									<th scope="row"><?php esc_html_e( 'Consent Type', 'vip-agentforce' ); ?></th>
									<td>
										<?php $this->render_consent_type_field(); ?>
									</td>
								</tr>
								<tr id="row_onetrust">
									<th scope="row"><?php esc_html_e( 'OneTrust Group ID', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_onetrust_group_id_field(); ?></td>
								</tr>
								<tr id="row_cookiebot">
									<th scope="row"><?php esc_html_e( 'Cookiebot Category', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_cookiebot_category_field(); ?></td>
								</tr>
								<tr id="row_iubenda">
									<th scope="row"><?php esc_html_e( 'iubenda Purpose ID', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_iubenda_category_field(); ?></td>
								</tr>
							</table>
						</div>

						<div class="af-card">
							<h2><?php esc_html_e( 'Agent UI', 'vip-agentforce' ); ?></h2>
							<p><?php esc_html_e( 'Alignment and custom styles for the launcher/widget.', 'vip-agentforce' ); ?></p>
							<table class="form-table" role="presentation">
								<tr id="row_alignment">
									<th scope="row"><?php esc_html_e( 'Alignment', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_alignment_field(); ?></td>
								</tr>
								<tr id="row_custom_css">
									<th scope="row"><?php esc_html_e( 'Custom CSS (optional)', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_custom_css_field(); ?></td>
								</tr>
							</table>
						</div>

						<div class="af-card">
							<h2><?php esc_html_e( 'Debug', 'vip-agentforce' ); ?></h2>
							<table class="form-table" role="presentation">
								<tr id="row_oplog">
									<th scope="row"><?php esc_html_e( 'Enable log', 'vip-agentforce' ); ?></th>
									<td><?php $this->render_oplog_field(); ?></td>
								</tr>
							</table>
						</div>

						<p class="submit">
							<button type="submit"
									class="button button-primary button-hero"><?php esc_html_e( 'Save Changes', 'vip-agentforce' ); ?></button>
							<span
								class="af-note"><?php esc_html_e( 'Changes apply on next page load.', 'vip-agentforce' ); ?></span>
						</p>
					</div>

					<aside class="af-col af-sidebar">
						<div class="af-card">
							<h2><?php esc_html_e( 'Documentation', 'vip-agentforce' ); ?></h2>
							<ul class="af-docs">
								<li><span class="dashicons dashicons-info-outline" aria-hidden="true"></span><a href="#"
																												target="_blank"
																												rel="noopener">Install
										/ Embed</a></li>
								<li><span class="dashicons dashicons-info-outline" aria-hidden="true"></span><a href="#"
																												target="_blank"
																												rel="noopener">Consent
										integration</a></li>
								<li><span class="dashicons dashicons-info-outline" aria-hidden="true"></span><a href="#"
																												target="_blank"
																												rel="noopener">Debugging</a>
								</li>
								<li><span class="dashicons dashicons-info-outline" aria-hidden="true"></span><a href="#"
																												target="_blank"
																												rel="noopener">JS
										API</a></li>
							</ul>
						</div>

						<div class="af-card">
							<h2><?php esc_html_e( 'Status', 'vip-agentforce' ); ?></h2>
							<table class="af-status">
								<tr>
									<th><?php esc_html_e( 'PHP version', 'vip-agentforce' ); ?></th>
									<td><?php echo esc_html( $php_version ); ?></td>
								</tr>
								<tr>
									<th><?php esc_html_e( 'Xdebug', 'vip-agentforce' ); ?></th>
									<td><?php echo esc_html( $xdebug ); ?></td>
								</tr>
								<tr>
									<th><?php esc_html_e( 'Site URL', 'vip-agentforce' ); ?></th>
									<td><a href="<?php echo esc_url( $site_url ); ?>"><?php echo esc_html( $site_url ); ?></a></td>
								</tr>
							</table>
						</div>
					</aside>
				</div>

			</form>
		</div>
		<?php
	}
}
