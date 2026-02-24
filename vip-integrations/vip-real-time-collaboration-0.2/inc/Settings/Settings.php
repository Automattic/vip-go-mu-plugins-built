<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Settings;

defined( 'ABSPATH' ) || exit();

final class Settings {
	private const SETTINGS_PAGE_SLUG = 'vip-real-time-collaboration-settings';

	/**
	 * We now have a separate option in WordPress Writing settings that we need to
	 * target.
	 */
	public const GUTENBERG_OPTION_NAME = 'enable_real_time_collaboration';

	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_options_page' ] );
		add_filter( 'default_option_' . self::GUTENBERG_OPTION_NAME, [ $this, 'filter_gutenberg_rtc_option' ], 99 );
	}

	public static function is_vip_rtc_enabled(): bool {
		return (bool) get_option( self::GUTENBERG_OPTION_NAME );
	}

	/**
	 * Filter the Gutenberg RTC option to be enabled by defailt.
	 *
	 * @return int Whether RTC should be enabled in Gutenberg.
	 * @psalm-suppress PossiblyUnusedReturnValue Psalm does not detect usage via add_filter.
	 */
	public function filter_gutenberg_rtc_option(): int {
		return 1;
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
			<p>
				<?php
				// Add a link to the Writing settings page where real-time collaboration can be enabled or disabled.
				$writing_settings_url = admin_url( 'options-writing.php' );
				echo wp_kses(
					sprintf(
						/* translators: %s: URL to the Writing settings page */
						__( 'Real-time collaboration can be enabled or disabled on the <a href="%s">Writing settings page</a>.', 'vip-real-time-collaboration' ),
						esc_url( $writing_settings_url )
					),
					[ 'a' => [ 'href' => [] ] ]
				);
				?>
			</p>
		</div>
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
