<?php
/**
 * PCH Editor Sidebar class
 *
 * @package Parsely
 * @since 3.5.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use Parsely\Dashboard_Link;
use Parsely\Endpoints\User_Meta\Editor_Sidebar_Settings_Endpoint;
use Parsely\Parsely;
use Parsely\Content_Helper\Content_Helper_Feature;

use WP_Post;
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
	 * Returns the Parse.ly post dashboard URL for the current post.
	 *
	 * @since 3.14.0
	 *
	 * @param int|null|WP_Post $post_id The post ID or post object. Default is the current post.
	 * @return string|null The Parse.ly post dashboard URL, or false if the post ID is invalid.
	 */
	private function get_parsely_post_url( $post_id = null ): ?string {
		// Get permalink for the post.
		$post_id = $post_id ?? get_the_ID();
		if ( false === $post_id ) {
			return null;
		}

		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post = get_post( $post_id );

		if ( ! Dashboard_Link::can_show_link( $post, $this->parsely ) ) {
			return null;
		}

		return Dashboard_Link::generate_url( $post, $this->parsely->get_site_id(), 'wp-page-single', 'editor-sidebar' );
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

		// Inject inline variables for the editor sidebar.
		$parsely_post_url = $this->get_parsely_post_url();
		if ( null !== $parsely_post_url ) {
			wp_add_inline_script(
				static::get_script_id(),
				'wpParselyPostUrl = ' . wp_json_encode( $parsely_post_url ) . ';',
				'before'
			);
		}

		wp_enqueue_style(
			static::get_style_id(),
			$built_assets_url . 'editor-sidebar.css',
			array(),
			$asset_php['version']
		);
	}
}
