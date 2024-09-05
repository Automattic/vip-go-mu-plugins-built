<?php
/**
 * Enhancements for the core/block block, also known as synced patterns (formerly reusable blocks).
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi\ContentParser\BlockAdditions;

defined( 'ABSPATH' ) || die();

use WP_Block;
use WP_Block_Supports;
use function add_action;
use function add_filter;
use function remove_filter;

/**
 * Enhance core/block block by capturing its inner blocks.
 */
class CoreBlock {
	/**
	 * The block name for synced patterns.
	 *
	 * @var string
	 */
	private static $block_name = 'core/block';

	/**
	 * A store of captured inner blocks. See `capture_inner_blocks`.
	 *
	 * @var array
	 *
	 * @access private
	 */
	protected static $captured_inner_blocks = [];

	/**
	 * Initialize the CoreBlock class.
	 *
	 * @access private
	 */
	public static function init(): void {
		add_action( 'vip_block_data_api__before_block_render', [ __CLASS__, 'setup_before_render' ], 10, 0 );
		add_action( 'vip_block_data_api__after_block_render', [ __CLASS__, 'cleanup_after_render' ], 10, 0 );
		add_filter( 'vip_block_data_api__sourced_block_inner_blocks', [ __CLASS__, 'get_inner_blocks' ], 5, 4 );
		add_filter( 'vip_block_data_api__sourced_block_result', [ __CLASS__, 'remove_content_array' ], 5, 2 );
	}

	/**
	 * Setup before render.
	 */
	public static function setup_before_render(): void {
		/**
		 * Hook into the `render_block` filter, which is near the end of WP_Block#render().
		 * This allows us to capture the inner blocks of synced patterns ("core/block").
		 * See `capture_inner_blocks`.
		 */
		add_filter( 'render_block', [ __CLASS__, 'capture_inner_blocks' ], 10, 3 );
	}

	/**
	 * Cleanup after render.
	 */
	public static function cleanup_after_render() {
		self::$captured_inner_blocks = [];
		remove_filter( 'render_block', [ __CLASS__, 'capture_inner_blocks' ], 10 );
	}

	/**
	 * Capture the inner blocks of synced patterns during block rendering. Intended
	 * for use with the `render_block` filter.
	 *
	 * We have no intention of filtering the rendered block content, but this hook
	 * is conveniently located near the end of WP_Block#render() after block
	 * processing is finished. We get access to the parent block via the global
	 * static class `WP_Block_Supports`.
	 *
	 * This approach is necessary because synced patterns (core/block) are dynamic
	 * blocks, and core's method of rendering dynamic blocks severs the connection
	 * between the parent block and its inner blocks:
	 *
	 * https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/class-wp-block.php#L519
	 *
	 * A dynamic block's render callback function returns only an HTML string.
	 * This is suitable for most dynamic blocks, but synced patterns are just
	 * references to other blocks, so it can be frustrating to see their contents
	 * missing from the Block Data API. Capturing synced pattern content as inner
	 * blocks is extremely useful and avoids the need for additional API calls.
	 *
	 * @param string   $block_content Rendered block content.
	 * @param array    $parsed_block  Parsed block data.
	 * @param WP_Block $block         Block instance.
	 * @return string
	 */
	public static function capture_inner_blocks( string $block_content, array $parsed_block, WP_Block $block ): string {
		// If this block is a synced pattern, that means it is finished rendering.
		// Lock its inner blocks to prevent further captures in case it is rendered
		// elsewhere in the tree.
		if ( self::$block_name === $block->name ) {
			$store_key = self::get_store_key( $parsed_block );
			if ( isset( self::$captured_inner_blocks[ $store_key ] ) ) {
				self::$captured_inner_blocks[ $store_key ]['locked'] = true;
			}
		}

		// Get the parent block that is currently being rendered. This is fragile,
		// but is currently the only way we can get access to the parent block from
		// inside a dynamic block's render callback function.
		//
		// https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/class-wp-block.php#L517
		$parent_block = isset( WP_Block_Supports::$block_to_render ) ? WP_Block_Supports::$block_to_render : [];

		// If the parent block is not a synced pattern, do nothing.
		if ( ! isset( $parent_block['attrs']['ref'] ) || self::$block_name !== $parent_block['blockName'] ) {
			return $block_content;
		}

		// Capture the inner block for this synced pattern.
		self::capture_inner_block( $parent_block, $block );

		return $block_content;
	}

	/**
	 * Get captured inner blocks for synced patterns. Intended for use with
	 * the `vip_block_data_api__sourced_block_inner_blocks` filter.
	 *
	 * @param array    $inner_blocks Inner blocks.
	 * @param string   $block_name   Block name.
	 * @param int|null $_post_id     Post ID (unused).
	 * @param array    $parsed_block Parsed block data.
	 * @return array
	 */
	public static function get_inner_blocks( array $inner_blocks, string $block_name, int|null $_post_id, array $parsed_block ): array {
		if ( self::$block_name !== $block_name || ! isset( $parsed_block['attrs']['ref'] ) ) {
			return $inner_blocks;
		}

		$store_key = self::get_store_key( $parsed_block );

		if ( ! isset( self::$captured_inner_blocks[ $store_key ] ) ) {
			return $inner_blocks;
		}

		return self::$captured_inner_blocks[ $store_key ]['inner_blocks'];
	}

	/**
	 * Create a unique key that can be used to identify a synced pattern. This
	 * allows us to store and retrieve inner blocks for synced patterns and avoid
	 * duplication when they are used multiple times within the same tree.
	 *
	 * Using a hash of attributes is important because they may contain synced
	 * pattern overrides, which can change the inner block content. The attributes
	 * contain the synced pattern post ID, so uniqueness is built-in.
	 *
	 * @param array $parsed_block Parsed block data.
	 * @return string
	 */
	protected static function get_store_key( array $parsed_block ): string {
		// Include the synced pattern ID in the key just for legibility.
		$synced_pattern_id = $parsed_block['attrs']['ref'] ?? null;
		$attribute_json    = wp_json_encode( $parsed_block['attrs'] );

		return sprintf( '%s_%s', strval( $synced_pattern_id ), sha1( $attribute_json ) );
	}

	/**
	 * Capture inner block for a synced pattern.
	 *
	 * @param array    $synced_pattern Synced pattern block (parsed block).
	 * @param WP_Block $block          Inner block.
	 */
	protected static function capture_inner_block( array $synced_pattern, WP_Block $block ): void {
		$store_key = self::get_store_key( $synced_pattern );
		if ( ! isset( self::$captured_inner_blocks[ $store_key ] ) ) {
			self::$captured_inner_blocks[ $store_key ] = [
				'inner_blocks' => [],
				'locked'       => false,
			];
		}

		// This pattern has already been rendered somewhere in the tree and is now locked.
		if ( self::$captured_inner_blocks[ $store_key ]['locked'] ) {
			return;
		}

		self::$captured_inner_blocks[ $store_key ]['inner_blocks'][] = $block;
	}

	/**
	 * Remove the empty array that gets assigned to the content attribute due to
	 * this bug / side effect in the code that implements synced pattern overrides:
	 *
	 * phpcs:disable Generic.Commenting.DocComment.LongNotCapital
	 * https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/blocks/block.php#L73
	 *
	 * @param array  $sourced_block Sourced block result.
	 * @param string $block_name    Block name.
	 * @return array
	 */
	public static function remove_content_array( array $sourced_block, string $block_name ): array {
		if ( self::$block_name !== $block_name ) {
			return $sourced_block;
		}

		// If the content attribute is set to an empty array, remove it.
		$content = $sourced_block['attributes']['content'] ?? null;
		if ( is_array( $content ) && empty( $content ) ) {
			unset( $sourced_block['attributes']['content'] );
		}

		return $sourced_block;
	}
}

CoreBlock::init();
