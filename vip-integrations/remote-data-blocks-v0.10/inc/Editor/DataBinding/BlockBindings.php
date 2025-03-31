<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\DataBinding;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Config\BlockAttribute\RemoteDataBlockAttribute;
use RemoteDataBlocks\Editor\BlockManagement\ConfigRegistry;
use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;
use RemoteDataBlocks\Logging\LoggerManager;
use RemoteDataBlocks\Sanitization\Sanitizer;
use WP_Block;

use function register_block_bindings_source;

class BlockBindings {
	public static string $context_name = 'remote-data-blocks/remoteData';
	public static string $binding_source = 'remote-data/binding';

	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_block_bindings' ], 50, 0 );
		add_filter( 'register_block_type_args', [ __CLASS__, 'inject_context_for_synced_patterns' ], 10, 2 );
	}

	/**
	 * Register the block bindings source for our plugin.
	 */
	public static function register_block_bindings(): void {
		register_block_bindings_source( self::$binding_source, [
			'label' => __( 'Remote Data Blocks', 'remote-data-blocks' ),
			'get_value_callback' => [ __CLASS__, 'get_value' ],
			'uses_context' => [ self::$context_name ],
		] );
	}

	/**
	 * WORKAROUND FOR WP CORE ISSUE: CONTEXT INHERITANCE FOR SYNCED PATTERNS
	 * ===
	 *
	 * Synced patterns are implemented as a special block type (`core/block`) with
	 * a `ref` attribute that points to the post ID of the synced pattern. It is a
	 * dynamic block, so it has a render callback function that is responsible for
	 * loading the pattern and rendering it.
	 *
	 * https://github.com/WordPress/wordpress/blob/6.6.1/wp-includes/class-wp-block.php#L519
	 * https://github.com/WordPress/wordpress/blob/6.6.1/wp-includes/blocks/block.php#L109
	 * https://github.com/WordPress/wordpress/blob/6.6.1/wp-includes/blocks/block.php#L19
	 * https://github.com/WordPress/wordpress/blob/6.6.1/wp-includes/blocks/block.php#L90
	 *
	 * Unfortunately, the render callback function delegates to `do_blocks()`,
	 * which does not allow passing context and therefore breaks the context
	 * inheritance chain for its inner blocks. Many block bindings rely on this
	 * context inheritance to work, including ours. :/
	 *
	 * Core faces this exact same issue for sync pattern overrides, which are
	 * implemented as a block binding. Core added a narrowly targeted workaround
	 * for their binding, which adds a temporary filter to supply context
	 * to the inner blocks of synced patterns. However, their workaround is
	 * hardcoded for synced patterns, so we cannot benefit from it:
	 *
	 * https://github.com/WordPress/wordpress/blob/6.6.1/wp-includes/blocks/block.php#L83-L87
	 *
	 * However, we can add our own similar workaround. It requires filtering the
	 * block type args for the `core/block` block type to make two changes:
	 *
	 * 1. Add our context to the `uses_context` array so the the synced pattern
	 *    block has access to it. We do this only to make the context available to
	 *    our changes in step 2.
	 *
	 * 2. Wrap the block render callback function with a new function. This function
	 *    adds a temporary filter to inject the context for inner blocks.
	 */
	public static function inject_context_for_synced_patterns( array $block_type_args, string $block_name ): array {
		if ( 'core/block' !== $block_name ) {
			return $block_type_args;
		}

		// Add our context to the `uses_context` array so the the synced pattern block
		// has access to it.
		$block_type_args['uses_context'] = array_merge(
			$block_type_args['uses_context'] ?? [],
			[ self::$context_name ]
		);

		// Wrap the existing block render callback.
		$block_type_args['render_callback'] = static function ( array $attributes, string $content, WP_Block $synced_pattern_block ) use ( $block_type_args ): string {

			// Add a temporary filter to inject the context for inner blocks.
			$filter_block_context = static function ( array $context ) use ( $synced_pattern_block ): array {
				if ( isset( $synced_pattern_block->context ) ) {
					return array_merge( $context, $synced_pattern_block->context );
				}

				return $context;
			};
			add_filter( 'render_block_context', $filter_block_context, 10, 1 );

			// Call the original render callback.
			$rendered_content = call_user_func( $block_type_args['render_callback'], $attributes, $content, $synced_pattern_block );

			// Remove the temporary filter.
			remove_filter( 'render_block_context', $filter_block_context, 10 );

			return $rendered_content;
		};

		return $block_type_args;
	}

	private static function execute_queries( array $block_context, array $source_args, string $operation_name ): array|null {
		// If this binding is inside a remote data block, we should have hydrated
		// results already present. Use them.
		if ( isset( $source_args['hydrated_results'] ) ) {
			return $source_args['hydrated_results'];
		}

		// Load the attribute data and validate it.
		$remote_data = RemoteDataBlockAttribute::from_array( $block_context );

		if ( is_wp_error( $remote_data ) ) {
			self::log_error( sprintf( 'Missing or malformed block context for block binding %s', self::$context_name ), $operation_name );
			return null;
		}

		// Extract block and query information. In cases where the binding has become
		// disconencted from the ancestor remote data block, allow the binding source
		// args to override.
		$remote_data = $remote_data->to_array();
		$block_name = $source_args['block'] ?? $remote_data['blockName'];
		$enabled_overrides = $source_args['enabledOverrides'] ?? $remote_data['enabledOverrides'];
		$query_key = $source_args['queryKey'] ?? $remote_data['queryKey'] ?? ConfigRegistry::DISPLAY_QUERY_KEY;

		// Extract the input variables. Support the previous property name used
		// before we allowed multiple query inputs.
		$array_of_input_variables = $source_args['queryInputs'] ?? $remote_data['queryInputs'];

		$block_config = ConfigStore::get_block_configuration( $block_name );
		$query = $block_config['queries'][ $query_key ] ?? null;

		if ( null === $query ) {
			self::log_error( sprintf( 'Cannot load query %s for block binding', $query_key ), $block_name, $operation_name );
			return null;
		}

		$array_of_input_variables = array_map( function ( $input_variables ) use ( $enabled_overrides, $block_name ): array {
			/**
			 * Filter the query input overrides for a block binding.
			 *
			 * @param array $input_variables The original query input variables.
			 * @param array<string> $enabled_overrides The names of overrides that have been enabled for the current block.
			 * @param string $block_name The current block name.
			 * @return array The filtered query input variables.
			 */
			return apply_filters(
				'remote_data_blocks_query_input_variables',
				$input_variables,
				$enabled_overrides,
				$block_name,
			);
		}, $array_of_input_variables );

		try {
			$query_response = $query->execute_batch( $array_of_input_variables );

			/**
			 * Filter the query response for a block binding.
			 *
			 * @param array $query_results The original query response.
			 * @param array<string> $enabled_overrides The names of overrides that have been enabled for the current block.
			 * @param string $block_name The current block name.
			 * @return array|WP_Error The filtered query response.
			 */
			$query_response = apply_filters(
				'remote_data_blocks_query_response',
				$query_response,
				$enabled_overrides,
				$block_name,
			);

			if ( is_wp_error( $query_response ) ) {
				self::log_error( 'Error executing query for block binding: ' . $query_response->get_error_message(), $block_name, $operation_name );
				return null;
			}

			return $query_response;
		} catch ( \Exception $e ) {
			self::log_error( 'Unexpected exception for block binding: ' . $e->getMessage(), $block_name, $operation_name );
			return null;
		}
	}

	public static function get_value( array $source_args, WP_Block|array $block, string $attribute_name ): ?string {
		// We may be passed a block instance (by core block bindings) or a block
		// array (by our hooks into the Block Data API).
		if ( $block instanceof WP_Block ) {
			$block_context = $block->context[ self::$context_name ] ?? [];
			$block_attributes = $block->attributes;
		} else {
			$block_context = $block['context'][ self::$context_name ] ?? [];
			$block_attributes = $block['attributes'] ?? [];
		}

		// Provide some flexibility for external callers to pass the block name.
		$block_name = $source_args['block'] ?? $block_context['blockName'] ?? null;
		$block_context['blockName'] = $block_name;

		// Extract field information from the binding source args.
		$field_label = $source_args['label'] ?? null;
		$field_name = $source_args['field'] ?? null;
		$field_type = $source_args['type'] ?? 'field';
		$result_index = $source_args['index'] ?? 0;

		// Query results are serialized and stored in the block context when the
		// block is created in the block editor.
		$serialized_results = $block_context['results'] ?? [];

		// Fallback to the serialized query results or the block content if we don't
		// have the expected context.
		$fallback_content = self::get_block_fallback_content( $field_name, $block_attributes, $attribute_name, $serialized_results, $result_index );

		if ( null === $field_name ) {
			self::log_error( 'Missing field mapping for block binding', $block_name, $field_name );
			return $fallback_content;
		}

		$query_response = self::execute_queries( $block_context, $source_args, $field_name );

		if ( empty( $query_response ) ) {
			self::log_error( 'Cannot resolve query response for block binding', $block_name, $field_name );
			return $fallback_content;
		}

		if ( 'meta' === $field_type ) {
			$value = $query_response['metadata'][ $field_name ]['value'] ?? null;
		} else {
			$value = $query_response['results'][ $result_index ]['result'][ $field_name ]['value'] ?? null;
		}

		if ( null === $value ) {
			self::log_error( sprintf( 'Cannot resolve %s %s for block binding', $field_type, $field_name ), $block_name, $field_name );
			return $fallback_content;
		}

		// Convert the value to a string.
		$value = strval( $value );

		// Prepend label to value if provided. Class name should match the one
		// generated by the block editor script.
		if ( ! empty( $field_label ) && 'content' === $attribute_name ) {
			return sprintf( '<span class="rdb-block-label">%s</span> %s', $source_args['label'], $value );
		}

		return $value;
	}

	private static function get_block_fallback_content( string $field_name, array $block_attributes, string $attribute_name, array $serialized_results = [], int $result_index = 0 ): ?string {
		$fallback_content = $serialized_results[ $result_index ]['result'][ $field_name ] ?? $block_attributes[ $attribute_name ] ?? null;

		// NOTE: Returning null from get_value() cancels the binding and allows the default saved content to show.
		if ( null === $fallback_content ) {
			return null;
		}

		return Sanitizer::sanitize_primitive_type( 'string', $fallback_content );
	}

	public static function remote_data_block_render_callback( array $attributes, string $content, WP_Block $block ): string {
		// This is the parent block that provides the context, so we don't have
		// context available on the block's context property. However, context for
		// children blocks comes from this block's `remoteData` attribtue (see
		// block.json#providesContext), so we can access it directly.
		$block_context = $attributes['remoteData'] ?? [];
		$block_name = $block_context['blockName'] ?? null;
		$operation_name = 'remote_data_block_render_callback';

		$query_response = self::execute_queries( $block_context, [], $operation_name );

		if ( null === $query_response ) {
			self::log_error( 'Cannot resolve query response for block binding', $block_name, $operation_name );
			return $content;
		}

		$source_args_for_each_item = array_map( function ( $index ) use ( $query_response ): array {
			return [
				'hydrated_results' => $query_response,
				'index' => $index,
			];
		}, array_keys( $query_response['results'] ) );

		$loop_template = $block->parsed_block['innerBlocks'];
		$loop_template_content = $block->parsed_block['innerContent'];

		$block->parsed_block['innerBlocks'] = [];
		$block->parsed_block['innerContent'] = [];

		// Loop through the query results and make a copy of the template for each
		// result, updating the bindings with the result index. This will be used
		// by the binding source to render the correct result.
		foreach ( $source_args_for_each_item as $source_args ) {

			// Loop over the inner blocks of the template and update the bindings to
			// include the current index.
			$updated_inner_blocks = self::add_source_args_to_inner_blocks( $loop_template, $source_args );
			$block->parsed_block['innerBlocks'] = array_merge( $block->parsed_block['innerBlocks'], $updated_inner_blocks );

			// We don't care too much what the content is, we just need to make sure
			// it's there so that it can be looped over by WP_Block#render.
			$block->parsed_block['innerContent'] = array_merge( $block->parsed_block['innerContent'], $loop_template_content );
		}

		// Create an updated block with the new inner blocks and content.
		$updated_block = new WP_Block( $block->parsed_block );

		// Render the updated block but set dynamic to false so that we don't have
		// recursion.
		return $updated_block->render( [ 'dynamic' => false ] );
	}

	/**
	 * Recursively add source args to the bindings of the inner blocks that are
	 * being dynamically rendered.
	 *
	 * @param array $inner_blocks The inner blocks to update.
	 * @param array $source_args  The source args to add to bindings.
	 * @return array The updated inner blocks.
	 */
	private static function add_source_args_to_inner_blocks( array $inner_blocks, array $source_args ): array {
		foreach ( $inner_blocks as &$inner_block ) {
			// Update bindings with the result index.
			foreach ( $inner_block['attrs']['metadata']['bindings'] ?? [] as $target => $binding ) {
				if ( ! isset( $binding['source'] ) || $binding['source'] !== self::$binding_source ) {
					continue; // Not our binding.
				}

				// Add the source args to the binding so that it can be read by
				// get_value() when rendered. Access the &$inner_block reference so that
				// the mutation is preserved.
				$inner_block['attrs']['metadata']['bindings'][ $target ]['args'] = array_merge(
					$binding['args'] ?? [],
					$source_args
				);
			}

			// If this block has inner blocks, recurse.
			if ( isset( $inner_block['innerBlocks'] ) ) {
				$inner_block['innerBlocks'] = self::add_source_args_to_inner_blocks( $inner_block['innerBlocks'], $source_args );
			}
		}

		return $inner_blocks;
	}

	public static function log_error( string $message, ?string $block_name = 'unknown', ?string $operation_name = 'unknown' ): void {
		$logger = LoggerManager::instance();
		$logger->error( sprintf( '%s %s (block: %s; operation: %s)', $message, self::$context_name, $block_name, $operation_name ) );
	}
}
