<?php
/**
 * GraphQL API
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

use GraphQLRelay\Relay;

defined( 'ABSPATH' ) || die();

/**
 * GraphQL API to offer an alternative to the REST API.
 */
class GraphQLApi {
	/**
	 * Initiatilize the graphQL API by hooking into the graphql_register_types action,
	 * which only fires if WPGraphQL is installed and enabled, and is further controlled
	 * by the vip_block_data_api__is_graphql_enabled filter.
	 */
	public static function init() {
		add_action( 'graphql_register_types', [ __CLASS__, 'register_types' ] );
	}

	/**
	 * Extract the blocks data for a post, and return back in the format expected by the GraphQL API.
	 *
	 * @param  \WPGraphQL\Model\Post $post_model Post model for post.
	 *
	 * @return array
	 */
	public static function get_blocks_data( $post_model ) {
		$post_id = $post_model->ID;
		$post    = get_post( $post_id );

		$content_parser = new ContentParser();

		$parser_results = $content_parser->parse( $post->post_content, $post_id );

		// We need to not return a WP_Error object, and so a regular exception is returned.
		if ( is_wp_error( $parser_results ) ) {
			Analytics::record_error( $parser_results );

			// Return API-safe error with extra data (e.g. stack trace) removed.
			return new \Exception( $parser_results->get_error_message() );
		}

		$parser_results['blocks'] = array_map( function ( $block ) use ( $post_id ) {
			return self::transform_block_format( $block, $post_id );
		}, $parser_results['blocks'] );

		return $parser_results;
	}

	/**
	 * Transform the block's format to the format expected by the graphQL API.
	 *
	 * @param array $block   An associative array of parsed block data with keys 'name' and 'attributes'.
	 * @param array $post_id The associated post ID for the content being transformed. Used to produce unique block IDs.
	 *
	 * @return array
	 */
	public static function transform_block_format( $block, $post_id ) {
		// Generate a unique ID for the block.
		$block['id'] = Relay::toGlobalId( 'BlockData', sprintf( '%d:%d', $post_id, wp_unique_id() ) );

		// Convert the attributes to be in the name-value format that the schema expects.
		$block = self::map_attributes( $block );

		if ( isset( $block['innerBlocks'] ) && ! empty( $block['innerBlocks'] ) ) {
			$block['innerBlocks'] = array_map( function ( $block ) use ( $post_id ) {
				return self::transform_block_format( $block, $post_id );
			}, $block['innerBlocks'] );
		}

		return $block;
	}

	/**
	 * Convert the attributes to be in the name-value format that the schema expects.
	 *
	 * @param array $block An associative array of parsed block data with keys 'name' and 'attributes'.
	 *
	 * @return array
	 */
	public static function map_attributes( $block ) {
		// check if type of attributes is stdClass and unset it as that's not supported by graphQL.
		if ( isset( $block['attributes'] ) && is_object( $block['attributes'] ) ) {
			unset( $block['attributes'] );
		} elseif ( isset( $block['attributes'] ) && ! empty( $block['attributes'] ) ) {
			$block['attributes'] = array_map(
				[ __CLASS__, 'get_block_attribute_pair' ],
				array_keys( $block['attributes'] ),
				array_values( $block['attributes'] )
			);
		}

		return $block;
	}

	/**
	 * Flatten the inner blocks, no matter how many levels of nesting is there.
	 *
	 * @param array  $inner_blocks the inner blocks in the block.
	 * @param string $parent_id ID of the parent block, that the inner blocks belong to.
	 * @param array  $flattened_blocks the flattened blocks that's built up as we go through the inner blocks.
	 *
	 * @return array
	 */
	public static function flatten_inner_blocks( $inner_blocks, $parent_id, $flattened_blocks = [] ) {
		foreach ( $inner_blocks as $inner_block ) {
			// Set the parentId to be the ID of the parent block whose inner blocks are being flattened.
			$inner_block['parentId'] = $parent_id;

			if ( ! isset( $inner_block['innerBlocks'] ) ) {
				// This block doesnt have any inner blocks, so just add it to the flattened blocks.
				array_push( $flattened_blocks, $inner_block );
			} else {
				// This block is has inner blocks, so go through the inner blocks recursively.
				$inner_blocks_copy = $inner_block['innerBlocks'];
				unset( $inner_block['innerBlocks'] );

				// First add the current block to the flattened blocks, and then go through the inner blocks recursively.
				array_push( $flattened_blocks, $inner_block );
				$flattened_blocks = self::flatten_inner_blocks( $inner_blocks_copy, $inner_block['id'], $flattened_blocks );
			}
		}

		return $flattened_blocks;
	}

	/**
	 * Register types and fields graphql integration.
	 *
	 * @return void
	 */
	public static function register_types() {
		/**
		 * Filter to enable/disable the graphQL API. By default, it is enabled.
		 *
		 * @param bool $is_graphql_to_be_enabled Whether the graphQL API should be enabled or not.
		 */
		$is_graphql_to_be_enabled = apply_filters( 'vip_block_data_api__is_graphql_enabled', true );

		if ( ! $is_graphql_to_be_enabled ) {
			return;
		}

		// Register the type corresponding to the attributes of each individual block.
		register_graphql_object_type(
			'BlockAttribute',
			[
				'description' => 'Block attribute',
				'fields'      => [
					'name'               => [
						'type'        => [ 'non_null' => 'String' ],
						'description' => 'Block data attribute name',
					],
					'value'              => [
						'type'        => [ 'non_null' => 'String' ],
						'description' => 'Block data attribute value',
					],
					'isValueJsonEncoded' => [
						'type'        => [ 'non_null' => 'Boolean' ],
						'description' => 'True if value is a complex JSON-encoded field. This is used to encode attribute types like arrays and objects.',
					],
				],
			],
		);

		// Register the type corresponding to the individual block, with the above attribute.
		register_graphql_type(
			'BlockData',
			[
				'description' => 'Block data',
				'fields'      => [
					'id'          => [
						'type'        => [ 'non_null' => 'ID' ],
						'description' => 'ID of the block',
					],
					'parentId'    => [
						'type'        => 'ID',
						'description' => 'ID of the parent for this inner block, if it is an inner block. Otherwise, it will be null.',
					],
					'name'        => [
						'type'        => [ 'non_null' => 'String' ],
						'description' => 'Block name',
					],
					'attributes'  => [
						'type'        => [
							'list_of' => 'BlockAttribute',
						],
						'description' => 'Block attributes',
					],
					'innerBlocks' => [
						'type'        => [ 'list_of' => 'BlockData' ],
						'description' => 'Flattened list of inner blocks of this block',
					],
				],
			],
		);

		// Register the type corresponding to the list of individual blocks, with each item being the above type.
		register_graphql_type(
			'BlocksData',
			[
				'description' => 'Data for all the blocks',
				'fields'      => [
					'blocks'   => [
						'type'        => [ 'list_of' => 'BlockData' ],
						'description' => 'List of blocks data',
						'args'        => [
							'flatten' => [
								'type'        => 'Boolean',
								'description' => 'Collate the inner blocks under each root block into a single list with a parent-child relationship. This is set to true by default, and setting it to false will preserve the original block hierarchy, but will require nested inner block queries to the desired depth. Default: true',
							],
						],
						'resolve'     => function ( $blocks, $args ) {
							if ( ! isset( $args['flatten'] ) || true === $args['flatten'] ) {
								$blocks['blocks'] = array_map( function ( $block ) {
									// Flatten the inner blocks, if any.
									if ( isset( $block['innerBlocks'] ) ) {
										$block['innerBlocks'] = self::flatten_inner_blocks( $block['innerBlocks'], $block['id'] );
									}

									return $block;
								}, $blocks['blocks'] );
							}

							return $blocks['blocks'];
						},
					],
					'warnings' => [
						'type'        => [ 'list_of' => 'String' ],
						'description' => 'List of warnings related to processing the blocks data',
					],
				],
			],
		);

		// Register the field on every post type that supports 'editor'.
		register_graphql_field(
			'NodeWithContentEditor',
			'blocksData',
			[
				'type'        => 'BlocksData',
				'description' => 'A block representation of post content',
				'resolve'     => [ __CLASS__, 'get_blocks_data' ],
			]
		);
	}

	/**
	 * Given a block attribute name and value, return a BlockAttribute array.
	 *
	 * @param string $name The name of the block attribute.
	 * @param mixed  $value The value of the block attribute.
	 *
	 * @return array
	 */
	public static function get_block_attribute_pair( $name, $value ) {
		// Unknown array types (table cells, for example) are encoded as JSON strings.
		$is_value_json_encoded = false;

		if ( ! is_scalar( $value ) ) {
			$value                 = wp_json_encode( $value );
			$is_value_json_encoded = true;
		}

		return [
			'name'               => $name,
			'value'              => strval( $value ),
			'isValueJsonEncoded' => $is_value_json_encoded,
		];
	}
}

GraphQLApi::init();
