<?php
/**
 * PCH Editor Sidebar class
 *
 * @package Parsely
 * @since 3.5.0
 */

declare(strict_types=1);

namespace Parsely;

use function Parsely\Utils\get_asset_info;

/**
 * Class that generates and manages the PCH Editor Sidebar.
 *
 * @since 3.5.0
 */
class Content_Helper {

	/**
	 * Inserts the PCH Editor Sidebar assets.
	 *
	 * @since 3.5.0
	 */
	public function run(): void {
		$content_helper_asset = get_asset_info( 'build/content-helper.asset.php' );

		wp_enqueue_script(
			'wp-parsely-block-content-helper',
			plugin_dir_url( PARSELY_FILE ) . 'build/content-helper.js',
			$content_helper_asset['dependencies'],
			$content_helper_asset['version'],
			true
		);

		wp_enqueue_style(
			'wp-parsely-block-content-helper',
			plugin_dir_url( PARSELY_FILE ) . 'build/content-helper.css',
			array(),
			$content_helper_asset['version']
		);
	}

}
