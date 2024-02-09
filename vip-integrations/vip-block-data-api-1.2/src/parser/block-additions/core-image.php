<?php
/**
 * Enhancements for the core/image block
 * 
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi\ContentParser\BlockAdditions;

defined( 'ABSPATH' ) || die();

/**
 * Enhance the core/image block with attributes related to its size.
 */
class CoreImage {
	/**
	 * Initialize the CoreImage class.
	 * 
	 * @access private
	 */
	public static function init() {
		add_filter( 'vip_block_data_api__sourced_block_result', [ __CLASS__, 'add_image_metadata' ], 5, 2 );
	}

	/**
	 * Add size metadata to core/image blocks
	 * 
	 * @param array  $sourced_block Sourced block result.
	 * @param string $block_name Name of the block.
	 * 
	 * @access private
	 *
	 * @return array Updated sourced block with new metadata information
	 */
	public static function add_image_metadata( $sourced_block, $block_name ) {
		if ( 'core/image' !== $block_name ) {
			return $sourced_block;
		}

		$attachment_id = $sourced_block['attributes']['id'] ?? null;

		if ( empty( $attachment_id ) ) {
			return $sourced_block;
		}

		$attachment_metadata = wp_get_attachment_metadata( $attachment_id );

		if ( empty( $attachment_metadata ) ) {
			return $sourced_block;
		}

		$size_metadata               = self::get_size_metadata( $sourced_block['attributes'], $attachment_metadata );
		$sourced_block['attributes'] = array_merge( $sourced_block['attributes'], $size_metadata );

		return $sourced_block;
	}

	/**
	 * Get the size metadata for an image block
	 * 
	 * @param array $attributes Attributes of the block.
	 * @param array $attachment_metadata Metadata of the attachment.
	 * 
	 * @return array the size metadata
	 */
	private static function get_size_metadata( $attributes, $attachment_metadata ) {
		$size_metadata = [];

		if ( isset( $attachment_metadata['width'] ) ) {
			$size_metadata['width'] = $attachment_metadata['width'];
		}

		if ( isset( $attachment_metadata['height'] ) ) {
			$size_metadata['height'] = $attachment_metadata['height'];
		}

		// If the attached image uses a thumbnail size, find the altered width and height.
		$size_slug = $attributes['sizeSlug'] ?? null;

		if ( null !== $size_slug && isset( $attachment_metadata['sizes'][ $size_slug ] ) ) {
			$size                    = $attachment_metadata['sizes'][ $size_slug ];
			$size_metadata['width']  = $size['width'];
			$size_metadata['height'] = $size['height'];
		}

		return $size_metadata;
	}
}

CoreImage::init();
