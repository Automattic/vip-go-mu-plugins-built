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
class GraphQLApiV2 {
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

		$parser_results['blocks'] = self::flatten_blocks( $parser_results['blocks'] );
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
		$block['id'] = Relay::toGlobalId( 'BlockDataV2', sprintf( '%d:%d', $post_id, wp_unique_id() ) );

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
	 * Flatten blocks recursively.
	 *
	 * @param array  $blocks the inner blocks in the block.
	 * @param string $parent_id Optional. ID of the parent block that $blocks belong to.
	 *
	 * @return array
	 */
	public static function flatten_blocks( $blocks, $parent_id = null ) {
		$flattened_blocks = [];

		foreach ( $blocks as $block ) {
			// Gather innerBlocks from current block
			$inner_blocks = $block['innerBlocks'] ?? [];
			unset( $block['innerBlocks'] );

			// Set parent ID on current block
			$block['parentId'] = $parent_id;

			// Recurse into inner blocks
			$flattened_blocks[] = $block;
			$flattened_blocks   = array_merge( $flattened_blocks, self::flatten_blocks( $inner_blocks, $block['id'] ) );
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
		 * @param bool $is_graphql_enabled Whether the graphQL API should be enabled or not.
		 */
		$is_graphql_enabled = apply_filters( 'vip_block_data_api__is_graphql_enabled', true );

		if ( ! $is_graphql_enabled ) {
			return;
		}

		// Register the type corresponding to the attributes of each individual block.
		register_graphql_object_type(
			'BlockAttributeV2',
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
			'BlockDataV2',
			[
				'description' => 'Block data (v2)',
				'fields'      => [
					'id'         => [
						'type'        => [ 'non_null' => 'ID' ],
						'description' => 'ID of the block',
					],
					'parentId'   => [
						'type'        => 'ID',
						'description' => 'ID of the parent for this inner block, if it is an inner block. Otherwise, it will be null.',
					],
					'test'       => [
						'type'        => 'String',
						'description' => 'Test field',
					],
					'name'       => [
						'type'        => [ 'non_null' => 'String' ],
						'description' => 'Block name',
					],
					'attributes' => [
						'type'        => [
							'list_of' => 'BlockAttributeV2',
						],
						'description' => 'Block attributes',
					],
				],
			],
		);

		// Register the type corresponding to the list of individual blocks, with each item being the above type.
		register_graphql_type(
			'BlocksDataV2',
			[
				'description' => 'Data for all the blocks',
				'fields'      => [
					'blocks'   => [
						'type'        => [ 'list_of' => 'BlockDataV2' ],
						'description' => 'List of blocks data',
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
			'blocksDataV2',
			[
				'type'        => 'BlocksDataV2',
				'description' => 'A block representation of post content (v2)',
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
		// Non-string types (numbers, booleans, arrays, objects, for example) are encoded as JSON strings.
		$is_value_json_encoded = false;

		if ( ! is_string( $value ) ) {
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

GraphQLApiV2::init();
