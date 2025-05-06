<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName
/**
 * Factory class for creating sitemap buffers.
 *
 * @since 14.6
 * @package automattic/jetpack
 */

/**
 * Creates the appropriate sitemap buffer based on available PHP extensions.
 *
 * @since 14.6
 */
class Jetpack_Sitemap_Buffer_Factory {

	/**
	 * Create a new sitemap buffer instance.
	 *
	 * @since 14.6
	 *
	 * @param string $type       The type of sitemap buffer ('page', 'image', 'video', etc.).
	 * @param int    $item_limit The maximum number of items in the buffer.
	 * @param int    $byte_limit The maximum number of bytes in the buffer.
	 * @param string $time       The initial datetime of the buffer.
	 *
	 * @return Jetpack_Sitemap_Buffer|null The created buffer or null if type is invalid.
	 */
	public static function create( $type, $item_limit, $byte_limit, $time = '1970-01-01 00:00:00' ) {
		// First try XMLWriter if available
		if ( class_exists( 'XMLWriter' ) ) {
			$class_name = 'Jetpack_Sitemap_Buffer_' . ucfirst( $type ) . '_XMLWriter';
			if ( class_exists( $class_name ) ) {
				return new $class_name( $item_limit, $byte_limit, $time );
			}
		}

		// Then try DOMDocument
		if ( class_exists( 'DOMDocument' ) ) {
			$class_name = 'Jetpack_Sitemap_Buffer_' . ucfirst( $type );
			if ( class_exists( $class_name ) ) {
				return new $class_name( $item_limit, $byte_limit, $time );
			}
		}

		// Finally fall back to the basic implementation
		$class_name = 'Jetpack_Sitemap_Buffer_' . ucfirst( $type ) . '_Fallback';
		if ( class_exists( $class_name ) ) {
			return new $class_name( $item_limit, $byte_limit, $time );
		}

		return null;
	}
}
