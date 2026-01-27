<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Assets;

defined( 'ABSPATH' ) || exit();

use function add_action;
use function plugins_url;
use function wp_add_inline_script;
use function wp_die;
use function wp_enqueue_script;

/**
 * Enqueues the necessary JavaScript and CSS assets for the plugin.
 */
final class Assets {
	public function __construct() {
		add_action( 'admin_init', [ $this, 'load_assets' ], 10, 0 );
		add_action( 'enqueue_block_assets', [ $this, 'enqueue_block_assets' ], 10, 0 );
	}

	public function load_assets(): void {
		$vip_rtc_ws_url = null;

		// Error checking for the WebSocket URL is already done in the main plugin file.
		// This is here just for safety.
		if ( defined( 'VIP_RTC_WS_URL' ) ) {
			/**
			 * @var string
			 */
			$vip_rtc_ws_url = constant( 'VIP_RTC_WS_URL' );
		}

		$asset_file = dirname( constant( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_ROOT' ) ) . '/build/index.asset.php';
		$script_file = plugins_url( 'build/index.js', constant( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_ROOT' ) );

		if ( ! file_exists( $asset_file ) ) {
			wp_die( sprintf( 'The asset file %s is missing. Run `npm run build` to generate it.', esc_html( $asset_file ) ) );
		}

		/**
		 * @var array{
		 *   dependencies: array{string},
		 *   version: string,
		 * }
		 */
		$asset = include $asset_file;

		$dependencies = array_unique( array_merge( $asset['dependencies'], [ 'wp-sync' ] ) );

		wp_enqueue_script(
			'vip-real-time-collaboration',
			$script_file,
			$dependencies,
			$asset['version'],
			[ 'in_footer' => false ]
		);

		$script_data = wp_json_encode( [
			'debug' => [],
			'wsUrl' => $vip_rtc_ws_url,
			'blogId' => get_current_blog_id(),
		], JSON_HEX_TAG | JSON_UNESCAPED_SLASHES );

		/** @psalm-suppress DocblockTypeContradiction */ // wp_json_encode() can return an empty string.
		if ( ! is_string( $script_data ) || '' === $script_data ) {
			$script_data = '{}';
		}

		wp_add_inline_script(
			'vip-real-time-collaboration',
			"var VIP_RTC = $script_data;",
			'before'
		);
	}

	public function enqueue_block_assets(): void {
		wp_enqueue_style( 'vip-real-time-collaboration', plugins_url( 'build/index.css', constant( 'VIP_REAL_TIME_COLLABORATION__PLUGIN_ROOT' ) ), [], VIP_REAL_TIME_COLLABORATION__PLUGIN_VERSION );
	}
}
