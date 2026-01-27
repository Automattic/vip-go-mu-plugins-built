<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Settings;

defined( 'ABSPATH' ) || exit();

final class Settings {
	private const SETTINGS_PAGE_SLUG = 'vip-real-time-collaboration-settings';
	public const OPTION_NAME = 'vip_real_time_collaboration_settings';

	public function __construct() {
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_menu', [ $this, 'add_options_page' ] );
	}

	public static function is_vip_rtc_enabled(): bool {
		/** @var array<string, mixed> */
		$options = get_option( self::OPTION_NAME, self::get_default_options() );

		return ! empty( $options['enable-vip-rtc'] );
	}

	/**
	 * Get the default options for the plugin.
	 *
	 * @return array The default options.
	 */
	public static function get_default_options(): array {
		return [ 'enable-vip-rtc' => true ];
	}

	/**
	 * Sanitize settings before saving.
	 *
	 * Converts radio button values ('1' for enabled, '0' for disabled) to boolean.
	 *
	 * @param array $input The input values from the form.
	 * @return array The sanitized settings.
	 * @psalm-suppress PossiblyUnusedMethod Psalm does not detect usage via add_filter.
	 */
	public static function sanitize_settings( ?array $input = [] ): array {
		return [
			'enable-vip-rtc' => isset( $input['enable-vip-rtc'] ) && '1' === $input['enable-vip-rtc'],
		];
	}

	/**
	 * Register the settings for the settings page
	 */
	public static function register_settings(): void {
		register_setting(
			self::SETTINGS_PAGE_SLUG,
			self::OPTION_NAME,
			[
				'type' => 'array',
				'default' => self::get_default_options(),
				'sanitize_callback' => [ __CLASS__, 'sanitize_settings' ],
			]
		);

		// Add instructions section.
		add_settings_section(
			'plugin-settings',
			'',
			'__return_null',
			self::SETTINGS_PAGE_SLUG
		);

		/** @psalm-suppress InvalidArgument */ // WordPress Settings API allows custom args.
		add_settings_field(
			'enable-vip-rtc',
			__( 'Real-Time Collaboration', 'vip-real-time-collaboration' ),
			[ __CLASS__, 'display_settings_radio' ],
			self::SETTINGS_PAGE_SLUG,
			'plugin-settings',
			[
				'field_id' => 'enable-vip-rtc',
				'enabled_label' => __( 'Enable real-time collaboration', 'vip-real-time-collaboration' ),
				'disabled_label' => __( 'Disable real-time collaboration', 'vip-real-time-collaboration' ),
				'description' => __( 'Disable functionality in case of an emergency.', 'vip-real-time-collaboration' ),
			]
		);
	}

	/**
	 * Add the settings page to the WordPress admin menu.
	 */
	public static function add_options_page(): void {
		add_options_page(
			__( 'VIP Real-Time Collaboration Settings', 'vip-real-time-collaboration' ),
			__( 'VIP Real-Time Collaboration', 'vip-real-time-collaboration' ),
			'manage_options',
			self::SETTINGS_PAGE_SLUG,
			[ __CLASS__, 'settings_page_content' ]
		);
	}

	/**
	 * Display the settings page content.
	 */
	public static function settings_page_content(): void {
		?>
		<div id="vip-real-time-collaboration-settings-wrapper" class="wrap">
			<h1><?php esc_html_e( 'VIP Real-Time Collaboration', 'vip-real-time-collaboration' ); ?></h1>

			<h2><?php esc_html_e( 'Plugin Settings', 'vip-real-time-collaboration' ); ?></h2>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::SETTINGS_PAGE_SLUG );
				do_settings_sections( self::SETTINGS_PAGE_SLUG );
				submit_button();
				?>
			</form>

			<h2><?php esc_html_e( 'Debug Information', 'vip-real-time-collaboration' ); ?></h2>
			<p>
				<?php
				/* translators: %s: Plugin version */
				echo esc_html( sprintf( __( 'Plugin Version: %s', 'vip-real-time-collaboration' ), self::get_vip_rtc_version() ) );
				?>
			</p>
			<p>
				<?php
				/* translators: %s: Gutenberg version */
				echo esc_html( sprintf( __( 'Gutenberg Version: %s', 'vip-real-time-collaboration' ), self::get_gutenberg_version() ) );
				?>
			</p>
			<p>
				<?php
				/* translators: %s: Gutenberg commit hash */
				echo esc_html( sprintf( __( 'Gutenberg Commit Hash: %s', 'vip-real-time-collaboration' ), self::get_gutenberg_commit_hash() ) );
				?>
			</p>
		</div>
		<?php
	}

	/**
	 * Display radio button fields for enabling/disabling a setting.
	 *
	 * @param array{field_id: string, enabled_label: string, disabled_label: string, description: string} $args Field configuration.
	 */
	public static function display_settings_radio( array $args ): void {
		/** @var array<string, mixed> */
		$options = get_option( self::OPTION_NAME, self::get_default_options() );
		$value = ! empty( $options[ $args['field_id'] ] );
		$field_name = self::OPTION_NAME . '[' . $args['field_id'] . ']';
		?>
		<fieldset>
			<label>
				<input
					type="radio"
					name="<?php echo esc_attr( $field_name ); ?>"
					id="<?php echo esc_attr( $args['field_id'] . '-enabled' ); ?>"
					value="1"
					<?php checked( $value ); ?>
				/>
				<?php echo esc_html( $args['enabled_label'] ); ?>
			</label>
			<br />
			<label>
				<input
					type="radio"
					name="<?php echo esc_attr( $field_name ); ?>"
					id="<?php echo esc_attr( $args['field_id'] . '-disabled' ); ?>"
					value="0"
					<?php checked( $value, false ); ?>
				/>
				<?php echo esc_html( $args['disabled_label'] ); ?>
			</label>
			<p class="description">
				<?php echo esc_html( $args['description'] ); ?>
			</p>
		</fieldset>
		<?php
	}

	/**
	 * Get a string constant value safely.
	 *
	 * @param string $constant_name The constant name to check.
	 * @return string The constant value or 'Unknown' if not defined or not a string.
	 */
	private static function get_string_constant( string $constant_name ): string {
		if ( ! defined( $constant_name ) || ! is_string( constant( $constant_name ) ) ) {
			return 'Unknown';
		}

		/** @var string $value */
		$value = constant( $constant_name );

		return $value;
	}

	public static function get_vip_rtc_version(): string {
		return self::get_string_constant( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION' );
	}

	public static function get_gutenberg_version(): string {
		// For dev builds, this is defined in the Gutenberg plugin's main file.
		if ( defined( 'GUTENBERG_DEVELOPMENT_MODE' ) && constant( 'GUTENBERG_DEVELOPMENT_MODE' ) ) {
			return 'Development';
		}

		return self::get_string_constant( 'GUTENBERG_VERSION' );
	}

	public static function get_gutenberg_commit_hash(): string {
		return self::get_string_constant( 'GUTENBERG_GIT_COMMIT' );
	}
}
