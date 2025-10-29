<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Compatibility;

defined( 'ABSPATH' ) || exit();

/**
 * Inspects and adjusts the environment to ensure the plugin can load.
 */
final class Compatibility {
	public function __construct() {
		add_filter( 'option_gutenberg-experiments', [ $this, 'enable_sync_collaboration_experiment' ], 10, 1 );
		add_filter( 'default_option_gutenberg-experiments', [ $this, 'enable_sync_collaboration_experiment' ], 10, 1 );
	}

	public static function admin_notices(): void {
		if ( ! self::is_gutenberg_plugin_active() ) {
			wp_admin_notice(
				__(
					'The Gutenberg plugin has not been installed. The VIP Real-Time Collaboration plugin has been disabled.',
					'vip_real_time_collaboration'
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
	 * Force-enable sync collaboration experiment.
	 *
	 * @psalm-suppress PossiblyUnusedReturnValue Psalm does not detect usage via add_filter.
	 */
	public function enable_sync_collaboration_experiment( mixed $experiments ): array {
		global $pagenow;

		if ( ! is_array( $experiments ) ) {
			$experiments = [];
		}

		unset( $experiments['gutenberg-sync-collaboration'] );

		// Do not enable on Site Editor.
		if ( 'site-editor.php' === $pagenow ) {
			return $experiments;
		}

		$experiments['gutenberg-sync-collaboration'] = true;

		return $experiments;
	}

	/**
	 * Get the supported post types for collaborative editing. This must be run
	 * after the init hook, as the post types are registered at that point.
	 *
	 * @return array<string>
	 */
	public static function get_supported_post_types(): array {
		return get_post_types_by_support( [ 'editor' ] );
	}

	/**
	 * Check if the Gutenberg plugin is active.
	 *
	 * TODO: Check GUTENBERG_VERSION in production to ensure it is running a
	 * compatible version.
	 */
	private static function is_gutenberg_plugin_active(): bool {
		return defined( 'IS_GUTENBERG_PLUGIN' ) && constant( 'IS_GUTENBERG_PLUGIN' );
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

		return self::is_gutenberg_plugin_active() && self::is_websocket_url_defined();
	}
}
