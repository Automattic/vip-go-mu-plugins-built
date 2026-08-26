<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Settings;

defined( 'ABSPATH' ) || exit();

final class Settings {
	private const SETTINGS_PAGE_SLUG = 'vip-real-time-collaboration-settings';
	private const ENABLED_SETTING_NAME = 'enable-vip-rtc';
	public const OPTION_NAME = 'vip_real_time_collaboration_settings';

	public const GUTENBERG_EXPERIMENTS_OPTION_NAME = 'gutenberg-experiments';

	public const GUTENBERG_RTC_EXPERIMENT_NAME = 'gutenberg-real-time-collaboration';

	public static function init(): void {
		add_action( 'admin_init', [ __CLASS__, 'register_settings' ] );
		add_action( 'admin_menu', [ __CLASS__, 'add_options_page' ] );
		add_filter( 'default_option_' . self::GUTENBERG_EXPERIMENTS_OPTION_NAME, [ __CLASS__, 'set_gutenberg_rtc_experiment' ], 99 );
		add_filter( 'option_' . self::GUTENBERG_EXPERIMENTS_OPTION_NAME, [ __CLASS__, 'set_gutenberg_rtc_experiment' ], 99 );
		add_filter( 'register_setting_args', [ __CLASS__, 'hide_gutenberg_rtc_experiment' ], 10, 4 );
	}

	public static function is_vip_rtc_enabled(): bool {
		$options = get_option( self::OPTION_NAME, self::get_default_options() );

		if ( ! is_array( $options ) || ! array_key_exists( self::ENABLED_SETTING_NAME, $options ) ) {
			return true;
		}

		return ! self::is_disabled_value( $options[ self::ENABLED_SETTING_NAME ] );
	}

	private static function is_disabled_value( mixed $value ): bool {
		return false === $value || 0 === $value || '0' === $value;
	}

	/**
	 * Set Gutenberg's real-time collaboration experiment from the plugin setting
	 * while preserving the state of all other experiments.
	 *
	 * @param mixed $experiments The configured Gutenberg experiments.
	 * @return array<array-key, mixed> The configured experiments with RTC matching the plugin setting.
	 * @psalm-suppress PossiblyUnusedReturnValue Psalm does not detect usage via add_filter.
	 */
	public static function set_gutenberg_rtc_experiment( mixed $experiments ): array {
		if ( ! is_array( $experiments ) ) {
			$experiments = [];
		}

		$experiments[ self::GUTENBERG_RTC_EXPERIMENT_NAME ] = self::is_vip_rtc_enabled();

		return $experiments;
	}

	/**
	 * Remove RTC from Gutenberg's experiments schema so this plugin is the only
	 * place where the feature can be enabled or disabled.
	 *
	 * @param mixed                $args The setting registration arguments.
	 * @param array<string, mixed> $_defaults The default registration arguments.
	 * @param string               $option_group The setting group.
	 * @param string               $option_name The setting name.
	 * @return mixed The filtered registration arguments.
	 * @psalm-suppress PossiblyUnusedReturnValue Psalm does not detect usage via add_filter.
	 */
	public static function hide_gutenberg_rtc_experiment( mixed $args, array $_defaults, string $option_group, string $option_name ): mixed {
		if ( self::GUTENBERG_EXPERIMENTS_OPTION_NAME !== $option_group || self::GUTENBERG_EXPERIMENTS_OPTION_NAME !== $option_name || ! is_array( $args ) ) {
			return $args;
		}

		if ( ! isset( $args['show_in_rest'] ) || ! is_array( $args['show_in_rest'] ) ) {
			return $args;
		}

		$show_in_rest = $args['show_in_rest'];
		if ( ! isset( $show_in_rest['schema'] ) || ! is_array( $show_in_rest['schema'] ) ) {
			return $args;
		}

		$schema = $show_in_rest['schema'];
		if ( isset( $schema['properties'] ) && is_array( $schema['properties'] ) ) {
			unset( $schema['properties'][ self::GUTENBERG_RTC_EXPERIMENT_NAME ] );
			$show_in_rest['schema'] = $schema;
			$args['show_in_rest'] = $show_in_rest;
		}

		return $args;
	}

	/**
	 * Get the default plugin settings.
	 *
	 * @return array{enable-vip-rtc: bool}
	 */
	public static function get_default_options(): array {
		return [ self::ENABLED_SETTING_NAME => true ];
	}

	/**
	 * Sanitize settings before saving.
	 * Only an explicit disabled value turns RTC off; invalid input remains enabled.
	 *
	 * @param mixed $input The submitted settings.
	 * @return array{enable-vip-rtc: bool}
	 * @psalm-suppress PossiblyUnusedMethod Psalm does not detect usage via register_setting.
	 */
	public static function sanitize_settings( mixed $input ): array {
		$is_enabled = true;
		if ( is_array( $input ) && array_key_exists( self::ENABLED_SETTING_NAME, $input ) ) {
			$is_enabled = ! self::is_disabled_value( $input[ self::ENABLED_SETTING_NAME ] );
		}

		return [
			self::ENABLED_SETTING_NAME => $is_enabled,
		];
	}

	/**
	 * Register the plugin settings.
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

		add_settings_section(
			'plugin-settings',
			'',
			'__return_null',
			self::SETTINGS_PAGE_SLUG
		);

		add_settings_field(
			self::ENABLED_SETTING_NAME,
			__( 'Real-Time Collaboration', 'vip-real-time-collaboration' ),
			[ __CLASS__, 'display_settings_radio' ],
			self::SETTINGS_PAGE_SLUG,
			'plugin-settings'
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
		$is_enabled = self::is_vip_rtc_enabled();
		?>
		<div id="vip-real-time-collaboration-settings-wrapper" class="wrap">
			<h1><?php esc_html_e( 'VIP Real-Time Collaboration', 'vip-real-time-collaboration' ); ?></h1>

			<form action="options.php" method="post">
				<?php
				settings_fields( self::SETTINGS_PAGE_SLUG );
				do_settings_sections( self::SETTINGS_PAGE_SLUG );
				submit_button();
				?>
			</form>

			<?php if ( ! $is_enabled ) : ?>
				<div class="notice notice-warning inline">
					<p>
						<?php esc_html_e( 'Real-time collaboration is disabled in the plugin settings. Re-enable it when it is safe to do so.', 'vip-real-time-collaboration' ); ?>
					</p>
				</div>
			<?php endif; ?>

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
	 * Display the enable/disable radio buttons.
	 */
	public static function display_settings_radio(): void {
		$is_enabled = self::is_vip_rtc_enabled();
		$field_name = self::OPTION_NAME . '[' . self::ENABLED_SETTING_NAME . ']';
		?>
		<fieldset>
			<label>
				<input
					type="radio"
					name="<?php echo esc_attr( $field_name ); ?>"
					id="<?php echo esc_attr( self::ENABLED_SETTING_NAME . '-enabled' ); ?>"
					value="1"
					<?php checked( $is_enabled ); ?>
				/>
				<?php esc_html_e( 'Enabled (recommended)', 'vip-real-time-collaboration' ); ?>
			</label>
			<br />
			<label>
				<input
					type="radio"
					name="<?php echo esc_attr( $field_name ); ?>"
					id="<?php echo esc_attr( self::ENABLED_SETTING_NAME . '-disabled' ); ?>"
					value="0"
					<?php checked( $is_enabled, false ); ?>
				/>
				<?php esc_html_e( 'Disabled (emergency fallback)', 'vip-real-time-collaboration' ); ?>
			</label>
			<p class="description">
				<?php esc_html_e( 'Real-time collaboration is enabled by default, allowing multiple users to work together in the editor. Disable only in an emergency.', 'vip-real-time-collaboration' ); ?>
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
