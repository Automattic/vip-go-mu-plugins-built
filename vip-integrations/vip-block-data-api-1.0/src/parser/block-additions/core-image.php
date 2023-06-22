<?php

namespace WPCOMVIP\BlockDataApi\ContentParser\BlockAdditions;

defined( 'ABSPATH' ) || die();

class CoreImage {
	public static function init() {
		add_filter( 'vip_block_data_api__sourced_block_result', [ __CLASS__, 'add_image_metadata' ], 5, 4 );
	}

	/**
	 * @param array[string]array $sourced_block
	 * @param string $block_name
	 * @param int $post_id
	 * @param array[string]array $block
	 *
	 * @return array[string]array
	 */
	public static function add_image_metadata( $sourced_block, $block_name, $post_id, $block ) {
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

	private static function get_size_metadata( $attributes, $attachment_metadata ) {
		$size_metadata = [];

		if ( isset( $attachment_metadata['width'] ) ) {
			$size_metadata['width'] = $attachment_metadata['width'];
		}

		if ( isset( $attachment_metadata['height'] ) ) {
			$size_metadata['height'] = $attachment_metadata['height'];
		}

		// If the attached image uses a thumbnail size, find the altered width and height
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
