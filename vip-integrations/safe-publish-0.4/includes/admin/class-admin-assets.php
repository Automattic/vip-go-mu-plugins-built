<?php
/**
 * Shared admin asset enqueueing helper.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueues a built admin bundle plus the shared style/data wiring.
 *
 * The Manage, Exports, and Audit Log admin pages each enqueue the same
 * shape: one entry script, the design tokens, the shared compiled
 * stylesheet, the static admin stylesheet, and an inline
 * `window.safePublishAdminData = {...}` for the React side. This helper
 * centralizes that wiring so a new page can opt in by calling
 * {@see self::enqueue_bundle()} with its own entry name and inline data.
 */
final class Admin_Assets {

	/**
	 * Enqueues a built entry script, the shared stylesheets, and the page's
	 * inline admin-data global.
	 *
	 * Returns early when the build output is missing/malformed or when
	 * `$inline_data` fails to JSON-encode — surfaces an admin notice in
	 * `WP_DEBUG` so developers can diagnose.
	 *
	 * @param string               $entry         Bundle entry name (`posts`/`exports`/`audit-log`),
	 *                                            locating `build/{entry}.js` and
	 *                                            `build/{entry}.asset.php`.
	 * @param string               $script_handle Handle to register the entry script under.
	 * @param string               $style_handle  Handle to register the shared compiled
	 *                                            stylesheet under, when the build output exists.
	 * @param array<string, mixed> $inline_data   JSON-encodable payload assigned to
	 *                                            `window.safePublishAdminData`.
	 */
	public static function enqueue_bundle(
		string $entry,
		string $script_handle,
		string $style_handle,
		array $inline_data
	): void {
		$base_path = plugin_dir_path( dirname( __DIR__ ) );
		$base_url  = plugin_dir_url( dirname( __DIR__ ) );

		$asset_file_path = $base_path . 'build/' . $entry . '.asset.php';
		$script_url      = $base_url . 'build/' . $entry . '.js';
		$script_path     = $base_path . 'build/' . $entry . '.js';

		if ( ! file_exists( $script_path ) || ! file_exists( $asset_file_path ) ) {
			self::queue_missing_build_notice();
			return;
		}

		// Path is built from plugin_dir_path() and a hardcoded filename.
		// phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		$asset_file = include $asset_file_path;

		if (
			! is_array( $asset_file )
			|| ! isset( $asset_file['version'], $asset_file['dependencies'] )
		) {
			self::queue_missing_build_notice();
			return;
		}

		$script_version = $asset_file['version'];

		wp_enqueue_script(
			$script_handle,
			$script_url,
			$asset_file['dependencies'],
			$script_version,
			true
		);

		wp_enqueue_style(
			'safe-publish-tokens',
			$base_url . 'assets/css/tokens.css',
			array(),
			$script_version
		);

		// All entries share one compiled stylesheet (see webpack.config.js).
		$style_file_path = $base_path . 'build/style-safe-publish.css';
		$style_file_url  = $base_url . 'build/style-safe-publish.css';

		if ( file_exists( $style_file_path ) ) {
			wp_enqueue_style(
				$style_handle,
				$style_file_url,
				array( 'wp-components', 'safe-publish-tokens' ),
				$script_version
			);
			// Serve the RTLCSS-built -rtl variant on RTL locales.
			wp_style_add_data( $style_handle, 'rtl', 'replace' );
		}

		wp_enqueue_style(
			'safe-publish-admin-style',
			$base_url . 'assets/css/admin.css',
			array( 'safe-publish-tokens' ),
			$script_version
		);

		$json_data = wp_json_encode( $inline_data );

		if ( false === $json_data || '' === $json_data ) {
			self::queue_admin_build_error_notice(
				esc_html__(
					'Failed to encode admin data as JSON.',
					'safe-publish'
				)
			);
			return;
		}

		wp_add_inline_script(
			$script_handle,
			sprintf( 'window.safePublishAdminData = %s;', $json_data ),
			'before'
		);
	}

	/**
	 * Convenience wrapper around {@see self::queue_admin_build_error_notice()}
	 * for the "Build assets are missing" case.
	 */
	private static function queue_missing_build_notice(): void {
		self::queue_admin_build_error_notice(
			sprintf(
				/* translators: %s: the "npm run build" command. */
				esc_html__(
					'Build assets are missing. Run %s to generate them.',
					'safe-publish'
				),
				'<code>npm run build</code>'
			)
		);
	}

	/**
	 * Surfaces a localized admin error notice when WP_DEBUG is on.
	 *
	 * Skips REST/AJAX so the notice only renders on real admin pageviews.
	 *
	 * @param string $message Translated message body. May contain `<code>`.
	 */
	private static function queue_admin_build_error_notice( string $message ): void {
		add_action(
			'admin_notices',
			static function () use ( $message ): void {
				if (
					wp_doing_ajax()
					|| ( defined( 'REST_REQUEST' ) && constant( 'REST_REQUEST' ) )
				) {
					return;
				}

				if ( ! defined( 'WP_DEBUG' ) || ! constant( 'WP_DEBUG' ) ) {
					return;
				}

				echo '<div class="notice notice-error"><p>';
				echo '<strong>' . esc_html__( 'Safe Publish:', 'safe-publish' ) . '</strong> ';
				echo wp_kses( $message, array( 'code' => array() ) );
				echo '</p></div>';
			}
		);
	}
}
