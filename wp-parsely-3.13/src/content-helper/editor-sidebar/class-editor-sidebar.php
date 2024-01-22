<?php
/**
 * PCH Editor Sidebar class
 *
 * @package Parsely
 * @since 3.5.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use Parsely\Endpoints\User_Meta\Editor_Sidebar_Settings_Endpoint;
use Parsely\Parsely;
use Parsely\Content_Helper\Content_Helper_Feature;

use function Parsely\Utils\get_asset_info;

use const Parsely\PARSELY_FILE;

/**
 * Class that generates and manages the PCH Editor Sidebar.
 *
 * @since 3.5.0
 * @since 3.9.0 Renamed FQCN from `Parsely\Content_Helper` to `Parsely\Content_Helper\Editor_Sidebar`.
 */
class Editor_Sidebar extends Content_Helper_Feature {
	/**
	 * Constructor.
	 *
	 * @since 3.9.0
	 *
	 * @param Parsely $parsely Instance of Parsely class.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Returns the feature's filter name.
	 *
	 * @since 3.9.0
	 *
	 * @return string The filter name.
	 */
	public static function get_feature_filter_name(): string {
		return self::get_global_filter_name() . '_editor_sidebar';
	}

	/**
	 * Returns the feature's script ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The script ID.
	 */
	public static function get_script_id(): string {
		return 'wp-parsely-block-content-helper';
	}

	/**
	 * Returns the feature's style ID.
	 *
	 * @since 3.9.0
	 *
	 * @return string The style ID.
	 */
	public static function get_style_id(): string {
		return static::get_script_id();
	}

	/**
	 * Inserts the PCH Editor Sidebar assets.
	 *
	 * @since 3.5.0
	 */
	public function run(): void {
		if ( ! $this->can_enable_feature() ) {
			return;
		}

		$asset_php        = get_asset_info( 'build/content-helper/editor-sidebar.asset.php' );
		$built_assets_url = plugin_dir_url( PARSELY_FILE ) . 'build/content-helper/';

		wp_enqueue_script(
			static::get_script_id(),
			$built_assets_url . 'editor-sidebar.js',
			$asset_php['dependencies'],
			$asset_php['version'],
			true
		);

		$this->inject_inline_scripts( Editor_Sidebar_Settings_Endpoint::get_route() );

		wp_enqueue_style(
			static::get_style_id(),
			$built_assets_url . 'editor-sidebar.css',
			array(),
			$asset_php['version']
		);
	}
}
