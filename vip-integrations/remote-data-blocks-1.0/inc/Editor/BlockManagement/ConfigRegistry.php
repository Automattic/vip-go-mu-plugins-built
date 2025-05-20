<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Editor\BlockManagement;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Logging\Logger;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Config\Query\QueryInterface;
use RemoteDataBlocks\Editor\BlockPatterns\BlockPatterns;
use RemoteDataBlocks\Logging\LoggerInterface;
use RemoteDataBlocks\Validation\ConfigSchemas;
use RemoteDataBlocks\Validation\Validator;
use WP_Error;

use function parse_blocks;
use function register_block_pattern;
use function serialize_blocks;

class ConfigRegistry {
	private static LoggerInterface $logger;

	public const RENDER_QUERY_KEY = 'render_query';
	public const SELECTION_QUERIES_KEY = 'selection_queries';
	public const DISPLAY_QUERY_KEY = 'display';
	public const LIST_QUERY_KEY = 'list';
	public const SEARCH_QUERY_KEY = 'search';

	public static function init( ?LoggerInterface $logger = null ): void {
		self::$logger = $logger ?? new Logger();
		ConfigStore::init( self::$logger );
	}

	public static function register_block( array $block_config = [] ): bool|WP_Error {
		// Validate the provided user configuration.
		$schema = ConfigSchemas::get_remote_data_block_config_schema();
		$validator = new Validator( $schema, static::class, '$block_config' );
		$validated = $validator->validate( $block_config );

		if ( is_wp_error( $validated ) ) {
			return $validated;
		}

		// Check if the block has already been registered.
		$block_title = $block_config['title'];
		$block_name = ConfigStore::get_block_name( $block_title );
		if ( ConfigStore::is_registered_block( $block_name ) ) {
			return self::create_error( $block_title, sprintf( 'Block %s has already been registered', $block_name ) );
		}

		$display_query = self::inflate_query( $block_config[ self::RENDER_QUERY_KEY ]['query'] );
		$input_schema = $display_query->get_input_schema();
		$output_schema = $display_query->get_output_schema();
		$is_collection = true === ( $output_schema['is_collection'] ?? false );

		// Check if any variables are required
		$has_required_variables = array_reduce(
			array_column( $input_schema, 'required' ),
			fn( $carry, $required ) => $carry || ( $required ?? true ),
			false
		);

		// Build the base configuration for the block. This is our own internal
		// configuration, not what will be passed to WordPress's register_block_type.
		// @see BlockRegistration::register_block_type::register_blocks.
		$config = [
			'description' => '',
			'icon' => $block_config['icon'] ?? 'cloud',
			'instructions' => $block_config['instructions'] ?? null,
			'name' => $block_name,
			'overrides' => $block_config['overrides'] ?? [],
			'patterns' => [],
			'queries' => [
				self::DISPLAY_QUERY_KEY => $display_query,
			],
			'selectors' => [
				[
					'image_url' => $display_query->get_image_url(),
					'inputs' => self::map_input_variables( $input_schema ),
					'name' => $has_required_variables ? 'Manual input' : ( $is_collection ? 'Load collection' : 'Load item' ),
					'query_key' => self::DISPLAY_QUERY_KEY,
					'type' => $has_required_variables ? 'manual-input' : 'load-without-input',
				],
			],
			'title' => $block_title,
		];

		// Register "selectors" which allow the user to use a query to assist in
		// selecting data for display by the block.
		foreach ( $block_config[ self::SELECTION_QUERIES_KEY ] ?? [] as $selection_query ) {
			$from_query = self::inflate_query( $selection_query['query'] );
			$from_query_type = $selection_query['type'];
			$to_query = $display_query;

			$config['queries'][ $from_query::class ] = $from_query;

			$from_input_schema = $from_query->get_input_schema();
			$from_output_schema = $from_query->get_output_schema();

			foreach ( array_keys( $to_query->get_input_schema() ) as $to ) {
				if ( ! isset( $from_output_schema['type'][ $to ] ) ) {
					return self::create_error( $block_title, sprintf( 'Cannot map key "%1$s" from %2$s query. The display query for this block requires a "%1$s" key as an input, but it is not present in the output schema for the %2$s query. Try adding a "%1$s" mapping to the output schema for the %2$s query.', esc_html( $to ), $from_query_type ) );
				}
			}

			if ( self::SEARCH_QUERY_KEY === $from_query_type ) {
				$search_input_count = count( array_filter( $from_input_schema, function ( array $input_var ): bool {
					return 'ui:search_input' === $input_var['type'];
				} ) );

				if ( 1 !== $search_input_count ) {
					return self::create_error( $block_title, 'A search query must have one input variable with type "ui:search_input"' );
				}
			}

			// Add the selector to the configuration.
			array_unshift(
				$config['selectors'],
				[
					'image_url' => $from_query->get_image_url(),
					'inputs' => self::map_input_variables( $input_schema ),
					'name' => $selection_query['display_name'] ?? ucfirst( $from_query_type ),
					'query_key' => $from_query::class,
					'type' => $from_query_type,
				]
			);
		}

		// Register patterns which can be used with the block.
		foreach ( $block_config['patterns'] ?? [] as $pattern ) {
			$parsed_blocks = parse_blocks( $pattern['html'] );
			$parsed_blocks = BlockPatterns::add_block_arg_to_bindings( $block_name, $parsed_blocks );
			$pattern_content = serialize_blocks( $parsed_blocks );

			$pattern_name = self::register_block_pattern( $block_name, $pattern['title'], $pattern_content );

			// If the pattern role is specified and recognized, add it to the block configuration.
			$recognized_roles = [ 'inner_blocks' ];
			if ( isset( $pattern['role'] ) && in_array( $pattern['role'], $recognized_roles, true ) ) {
				$config['patterns'][ $pattern['role'] ] = $pattern_name;
			}
		}

		ConfigStore::set_block_configuration( $block_name, $config );

		return true;
	}

	private static function register_block_pattern( string $block_name, string $pattern_title, string $pattern_content ): string {
		// Add the block arg to any bindings present in the pattern.
		$pattern_name = 'remote-data-blocks/' . sanitize_title_with_dashes( $pattern_title, '', 'save' );

		// Create the pattern properties, allowing overrides via pattern options.
		$pattern_properties = [
			'blockTypes' => [ $block_name ],
			'categories' => [ 'Remote Data' ],
			'content' => $pattern_content,
			'inserter' => true,
			'source' => 'plugin',
			'title' => $pattern_title,
		];

		// Register the pattern.
		register_block_pattern( $pattern_name, $pattern_properties );

		return $pattern_name;
	}

	private static function create_error( string $block_title, string $message ): WP_Error {
		$error_message = sprintf( 'Error registering block %s: %s', esc_html( $block_title ), esc_html( $message ) );
		self::$logger->error( $error_message );
		return new WP_Error( 'block_registration_error', $error_message );
	}

	private static function inflate_query( array|QueryInterface $config ): QueryInterface {
		if ( is_array( $config ) ) {
			return HttpQuery::from_array( $config );
		}

		return $config;
	}

	private static function map_input_variables( array $input_schema ): array {
		return array_map(
			function ( string $slug, array $input_var ): array {
				return [
					'default_value' => isset( $input_var['default_value'] ) ? strval( $input_var['default_value'] ) : null,
					'name' => $input_var['name'] ?? '',
					'slug' => $slug,
					'type' => $input_var['type'] ?? 'string',
					'required' => $input_var['required'] ?? false,
				];
			},
			array_keys( $input_schema ),
			array_values( $input_schema )
		);
	}
}
