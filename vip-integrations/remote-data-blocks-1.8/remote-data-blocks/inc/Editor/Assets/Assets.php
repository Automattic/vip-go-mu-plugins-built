<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\Assets;

defined( 'ABSPATH' ) || exit();

use function plugins_url;
use function wp_die;
use function wp_enqueue_script;
use function wp_enqueue_style;
use function wp_style_is;

class Assets {
	public static function enqueue_build_asset( string $handle, string $slug, array $dependencies = [] ): void {
		// Ensure slug is not traversing directories.
		$slug = basename( $slug );

		$asset_file = REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . sprintf( '/build/%s/index.asset.php', $slug );
		$script_file = plugins_url( sprintf( 'build/%s/index.js', $slug ), REMOTE_DATA_BLOCKS__PLUGIN_ROOT );

		if ( ! file_exists( $asset_file ) ) {
			wp_die( sprintf( 'The asset file %s is missing. Run `npm run build` to generate it.', esc_html( $asset_file ) ) );
		}

		$asset = include $asset_file;

		wp_enqueue_script(
			$handle,
			$script_file,
			array_merge( $asset['dependencies'], $dependencies ?? [] ),
			$asset['version'],
			[
				'in_footer' => true,
			]
		);

		if ( file_exists( REMOTE_DATA_BLOCKS__PLUGIN_DIRECTORY . sprintf( '/build/%s/index.css', $slug ) ) ) {
			wp_enqueue_style(
				sprintf( '%s-style', $handle ),
				plugins_url( sprintf( 'build/%s/index.css', $slug ), REMOTE_DATA_BLOCKS__PLUGIN_ROOT ),
				array_filter(
					$asset['dependencies'],
					function ( $style ) {
						return wp_style_is( $style, 'registered' );
					}
				),
				$asset['version'],
			);
		}
	}
}
