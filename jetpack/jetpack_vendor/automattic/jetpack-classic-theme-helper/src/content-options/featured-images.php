<?php
/**
 * Theme Tools: functions for Featured Images.
 *
 * @package automattic/jetpack-classic-theme-helper
 */

if ( ! function_exists( 'jetpack_featured_images_remove_post_thumbnail' ) ) {

	/**
	 * The function to prevent for Featured Images to be displayed in a theme.
	 *
	 * @param array  $metadata Post metadata.
	 * @param int    $object_id Post ID.
	 * @param string $meta_key Metadata key.
	 */
	function jetpack_featured_images_remove_post_thumbnail( $metadata, $object_id, $meta_key ) {
		$opts = jetpack_featured_images_get_settings();

		/**
		 * Allow featured images to be displayed at all times for specific CPTs.
		 *
		 * @module theme-tools
		 *
		 * @since 9.1.0
		 *
		 * @param array $excluded_post_types Array of excluded post types.
		 */
		$excluded_post_types = apply_filters(
			'jetpack_content_options_featured_image_exclude_cpt',
			array( 'jp_pay_product' )
		);

		// Automatically return metadata for specific post types, when we don't want to hide the Featured Image.
		if ( in_array( get_post_type( $object_id ), $excluded_post_types, true ) ) {
			return $metadata;
		}

		// Return false if the archive option or singular option is unticked.
		if (
			( true === $opts['archive']
				&& ( is_home() || is_archive() || is_search() )
				&& ! jetpack_is_shop_page()
				&& ! $opts['archive-option']
				&& ( isset( $meta_key )
				&& '_thumbnail_id' === $meta_key )
				&& in_the_loop()
			)
			|| ( true === $opts['post']
				&& is_single()
				&& ! jetpack_is_product()
				&& ! $opts['post-option']
				&& ( isset( $meta_key )
				&& '_thumbnail_id' === $meta_key )
				&& in_the_loop()
			)
			|| ( true === $opts['page']
				&& is_singular()
				&& is_page()
				&& ! $opts['page-option']
				&& ( isset( $meta_key )
				&& '_thumbnail_id' === $meta_key )
				&& in_the_loop()
			)
			|| ( true === $opts['portfolio']
				&& post_type_exists( 'jetpack-portfolio' )
				&& is_singular( 'jetpack-portfolio' )
				&& ! $opts['portfolio-option']
				&& ( isset( $meta_key )
				&& '_thumbnail_id' === $meta_key )
				&& in_the_loop()
			)
		) {

			// Do not override thumbnail settings within blocks (eg. Latest Posts block).
			$trace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_debug_backtrace
			foreach ( $trace as $frame ) {
				if ( ! empty( $frame['class'] ) && class_exists( $frame['class'], false ) && is_a( $frame['class'], WP_Block::class, true ) ) {
						return $metadata;
				}
			}

			return false;
		} else {
			return $metadata;
		}
	}
	add_filter( 'get_post_metadata', 'jetpack_featured_images_remove_post_thumbnail', 3 );

}

if ( ! function_exists( 'jetpack_is_product' ) ) {

	/**
	 * Check if we are in a WooCommerce Product in order to exclude it from the is_single check.
	 */
	function jetpack_is_product() {
		return ( function_exists( 'is_product' ) ) ? is_product() : false; // @phan-suppress-current-line PhanUndeclaredFunction -- We only call the function if it exists.
	}

}

if ( ! function_exists( 'jetpack_is_shop_page' ) ) {

	/**
	 * Check if we are in a WooCommerce Shop in order to exclude it from the is_archive check.
	 */
	function jetpack_is_shop_page() {
		// Check if WooCommerce is active first.
		if ( ! class_exists( 'WooCommerce' ) ) {
			return false;
		}

		global $wp_query;

		$front_page_id        = get_option( 'page_on_front' );
		$current_page_id      = $wp_query->get( 'page_id' );
		$is_static_front_page = 'page' === get_option( 'show_on_front' );

		$is_shop_page = false;
		if ( $is_static_front_page && $front_page_id === $current_page_id ) {
			$is_shop_page = function_exists( 'wc_get_page_id' ) && wc_get_page_id( 'shop' ) === $current_page_id;  // @phan-suppress-current-line PhanUndeclaredFunction -- We're checking the function exists first.
		} elseif ( function_exists( 'is_shop' ) ) {
			$is_shop_page = is_shop();  // @phan-suppress-current-line PhanUndeclaredFunction -- We're checking the function exists first.
		}

		return $is_shop_page;
	}

}
