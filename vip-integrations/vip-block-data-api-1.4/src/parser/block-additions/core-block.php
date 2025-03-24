<?php
/**
 * Enhancements for the core/block block, also known as synced patterns (formerly reusable blocks).
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi\ContentParser\BlockAdditions;

defined( 'ABSPATH' ) || die();

use WP_Block;
use WP_Post;
use WPCOMVIP\BlockDataApi\ContentParser;

use function add_filter;
use function get_post;
use function parse_blocks;

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
	 * Initialize the CoreBlock class.
	 *
	 * @access private
	 */
	public static function init(): void {
		add_filter( 'vip_block_data_api__sourced_block_inner_blocks', [ __CLASS__, 'get_inner_blocks' ], 5, 5 );
		add_filter( 'vip_block_data_api__sourced_block_result', [ __CLASS__, 'remove_content_array' ], 5, 2 );
	}

	/**
	 * Get the inner blocks of a synced pattern / reusable block. Intended for use
	 * with the `vip_block_data_api__sourced_block_inner_blocks` filter.
	 *
	 * Synced patterns are dynamic blocks, and core's method of rendering dynamic
	 * blocks severs the connection between the parent block and its inner blocks:
	 *
	 * https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/class-wp-block.php#L519
	 *
	 * A dynamic block's render callback function returns only an HTML string.
	 * This is suitable for most dynamic blocks, but synced patterns are just
	 * references to other blocks, so it can be frustrating to see their contents
	 * missing from the Block Data API. Capturing synced pattern content as inner
	 * blocks is extremely useful and avoids the need for additional API calls.
	 *
	 * This requires us to reimplement some logic from `render_block_core_block()`:
	 *
	 * https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/blocks/block.php#L19
	 *
	 * @param array    $inner_blocks Inner blocks.
	 * @param string   $block_name   Block name.
	 * @param int|null $post_id      Post ID.
	 * @param array    $parsed_block Parsed block data.
	 * @return array
	 */
	public static function get_inner_blocks( array $inner_blocks, string $block_name, int|null $post_id, array $parsed_block ): array {
		// Not a synced pattern? Return the inner blocks unchanged.
		if ( self::$block_name !== $block_name || ! isset( $parsed_block['attrs']['ref'] ) ) {
			return $inner_blocks;
		}

		$context = [];

		// Support synced pattern overrides. Copied and adapted from core:
		// https://github.com/WordPress/WordPress/blob/6.6.1/wp-includes/blocks/block.php#L81
		//
		// In our case, we don't need to filter the context since we can pass it in.
		if ( isset( $parsed_block['attrs']['content'] ) ) {
			$context['pattern/overrides'] = $parsed_block['attrs']['content'];
		}

		// Load, parse, and render the inner blocks of the synced pattern, passing
		// along its block context. We intentionally do not recursively call
		// ContentParser->parse() to avoid calling telemetry and filters again.
		$parser = new ContentParser();
		$post   = get_post( $parsed_block['attrs']['ref'] );

		if ( ! $post instanceof WP_Post ) {
			return [];
		}

		$blocks = parse_blocks( $post->post_content );

		return array_map( function ( array $block ) use ( $parser, $context, $post_id ): WP_Block {
			return $parser->render_parsed_block( $block, $post_id, $context );
		}, $blocks );
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
