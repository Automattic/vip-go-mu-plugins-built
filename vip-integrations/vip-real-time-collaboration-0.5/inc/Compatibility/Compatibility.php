<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Compatibility;

defined( 'ABSPATH' ) || exit();

/**
 * Inspects and adjusts the environment to ensure the plugin can load.
 */
final class Compatibility {
	private const MINIMUM_GUTENBERG_VERSION = '23.8.0';

	public static function admin_notices(): void {
		if ( ! self::is_gutenberg_plugin_active() ) {
			wp_admin_notice(
				__(
					'The Gutenberg plugin has not been installed. The VIP Real-Time Collaboration plugin has been disabled.',
					'vip_real_time_collaboration'
				),
				[ 'type' => 'error' ]
			);
		} elseif ( ! self::is_gutenberg_plugin_version_compatible() ) {
			wp_admin_notice(
				sprintf(
					/* translators: %s: Minimum required Gutenberg version. */
					__(
						'The VIP Real-Time Collaboration plugin requires Gutenberg %s or newer. The VIP Real-Time Collaboration plugin has been disabled.',
						'vip-real-time-collaboration'
					),
					self::MINIMUM_GUTENBERG_VERSION
				),
				[ 'type' => 'error' ]
			);
		}

		if ( ! self::is_websocket_url_defined() ) {
			wp_admin_notice(
				__(
					'The WebSocket URL has not been configured. The VIP Real-Time Collaboration plugin has been disabled.',
					'vip_real_time_collaboration'
				),
				[ 'type' => 'error' ]
			);
		}
	}

	/**
	 * Check if the Gutenberg plugin is active.
	 */
	private static function is_gutenberg_plugin_active(): bool {
		return defined( 'IS_GUTENBERG_PLUGIN' ) && constant( 'IS_GUTENBERG_PLUGIN' );
	}

	/**
	 * Check if the active Gutenberg plugin version is compatible.
	 */
	private static function is_gutenberg_plugin_version_compatible(): bool {
		if ( ! defined( 'GUTENBERG_VERSION' ) ) {
			return false;
		}

		return self::is_compatible_gutenberg_version( constant( 'GUTENBERG_VERSION' ) );
	}

	/**
	 * Check a Gutenberg version against the minimum supported version.
	 *
	 * @param mixed $version Gutenberg version value.
	 */
	private static function is_compatible_gutenberg_version( mixed $version ): bool {
		return is_string( $version ) && version_compare( $version, self::MINIMUM_GUTENBERG_VERSION, '>=' );
	}

	/**
	 * Check if the WebSocket URL has been defined.
	 *
	 * @return bool True if the WebSocket URL is defined, false otherwise.
	 */
	private static function is_websocket_url_defined(): bool {

		if ( ! defined( 'VIP_RTC_WS_URL' ) ) {
			return false;
		}

		/**
		 * @var string|null
		 */
		$value = constant( 'VIP_RTC_WS_URL' );

		return is_string( $value ) && '' !== $value;
	}

	/**
	 * Determine if the plugin should load by inspecting the environment.
	 */
	public static function should_plugin_load(): bool {
		// Always add admin notices to communicate issues to the user.
		add_action( 'admin_notices', [ __CLASS__, 'admin_notices' ], 10, 0 );

		return self::is_gutenberg_plugin_active()
			&& self::is_gutenberg_plugin_version_compatible()
			&& self::is_websocket_url_defined();
	}
}
