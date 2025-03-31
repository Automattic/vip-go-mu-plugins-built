<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\VipBlockDataApi;

use RemoteDataBlocks\Editor\DataBinding\BlockBindings;
use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;

defined( 'ABSPATH' ) || exit();

class VipBlockDataApi {
	/**
	 * @var array<string, mixed>
	 */
	private static array $debug = [];

	public static function init(): void {
		add_filter( 'vip_block_data_api__sourced_block_result', [ __CLASS__, 'resolve_remote_data' ], 5, 4 );
		add_filter( 'vip_block_data_api__after_parse_blocks', [ __CLASS__, 'add_debug_info' ], 10, 2 );
	}

	/**
	 * Filters sourced block and, if a remote data block with remote data bindings metadata, executes
	 * necessary queries to resolve the data within.
	 *
	 * @param array  $sourced_block The sourced block data.
	 * @param string $block_name    The name of the block.
	 * @param int    $post_id       The ID of the post.
	 * @param array  $parsed_block  The parsed block data.
	 * @return array The filtered sourced block data.
	 *
	 * @phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
	 * @psalm-suppress PossiblyUnusedParam
	 */
	public static function resolve_remote_data( array $sourced_block, string $block_name, int $post_id, array $parsed_block ): array {
		if ( ! ConfigStore::is_registered_block( $block_name ) ) {
			return $sourced_block;
		}

		$block_context = self::extract_block_context( $parsed_block );
		$resolved_block = [
			'name' => $sourced_block['name'],
			'attributes' => array_diff_key( $sourced_block['attributes'], [ 'remoteData' => '' ] ),
		];

		$block_callback = function ( $block ) use ( $block_context ) {
			// @TODO: look at this more closely. This is a hack to get around the fact that the block data API
			// sometimes returns objects for attributes, but the block bindings code expects arrays.
			if ( is_object( $block['attributes'] ) ) {
				$block['attributes'] = (array) $block['attributes'];
			}

			if ( ! isset( $block['attributes']['metadata']['bindings'] ) ) {
				return $block;
			}

			$block['context'] = $block_context;

			foreach ( $block['attributes']['metadata']['bindings'] as $attr_name => $binding ) {
				$block['attributes'][ $attr_name ] = BlockBindings::get_value( $binding['args'], $block );
			}

			unset( $block['context'] );
			return $block;
		};

		if ( isset( $sourced_block['innerBlocks'] ) ) {
			$resolved_block['innerBlocks'] = self::iterate_blocks( $sourced_block['innerBlocks'], $block_callback );
		}

		return $resolved_block;
	}

	// Hacky dance to match up the data (from DB) with the context key core expects in remote-data-container block.json
	private static function extract_block_context( array $parsed_block ): array {
		$attrs[ BlockBindings::$context_name ] = $parsed_block['attrs']['remoteData'];
		unset( $parsed_block['attrs']['remoteData'] );
		return $attrs;
	}

	private static function iterate_blocks( array $blocks, callable $block_callback ): array {
		foreach ( $blocks as &$block ) {
			$block = call_user_func( $block_callback, $block );

			if ( isset( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = self::iterate_blocks( $block['innerBlocks'], $block_callback );
			}
		}

		return $blocks;
	}

	/** @psalm-suppress UnusedParam */
	public static function add_debug_info( array $result, int $post_id ): array {
		$debug = array_merge( $result['debug'] ?? [], self::$debug );

		if ( ! empty( $debug ) ) {
			$result = [
				'debug' => $debug,
				...$result,
			];
		}

		return $result;
	}
}
