<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Airtable;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Formatting\StringFormatter;
use RemoteDataBlocks\Snippet\Snippet;

class AirtableIntegration {
	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_blocks' ], 10, 0 );
	}

	public static function register_blocks(): void {
		$data_source_configs = DataSourceConfigManager::get_all( [
			'service' => REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE,
			'enable_blocks' => true,
		] );

		foreach ( $data_source_configs as $config ) {
			$data_source = AirtableDataSource::from_array( $config );

			self::register_blocks_for_airtable_data_source( $data_source );
			self::register_loop_blocks_for_airtable_data_source( $data_source );
		}
	}

	public static function register_blocks_for_airtable_data_source(
		AirtableDataSource $data_source,
		array $block_overrides = []
	): void {
		$tables = $data_source->to_array()['service_config']['tables'];

		foreach ( $tables as $table ) {
				register_remote_data_block(
					array_merge(
						[
							'title' => $data_source->get_display_name() . '/' . $table['name'],
							'icon' => 'editor-table',
							'render_query' => [
								'query' => self::get_item_query( $data_source, $table ),
							],
							'selection_queries' => [
								[
									'query' => self::get_list_query( $data_source, $table ),
									'type' => 'list',
								],
							],
						],
						$block_overrides
					)
				);
		}
	}

	public static function register_loop_blocks_for_airtable_data_source(
		AirtableDataSource $data_source,
		array $block_overrides = []
	): void {
		$tables = $data_source->to_array()['service_config']['tables'];

		foreach ( $tables as $table ) {
			$list_query = self::get_list_query( $data_source, $table );

			register_remote_data_block(
				array_merge(
					[
						'title' => sprintf( '%s/%s Loop', $data_source->get_display_name(), $table['name'] ),
						'render_query' => [
							'loop' => true,
							'query' => $list_query,
						],
					],
					$block_overrides
				)
			);
		}
	}

	public static function get_item_query( AirtableDataSource $data_source, array $table ): array {
		return [
			'__class' => HttpQuery::class,
			'data_source' => $data_source,
			'endpoint' => function ( array $input_variables ) use ( $data_source, $table ): string {
				// Build the formula
				$formula_parts = array_map( function ( $id ) {
					return sprintf( 'RECORD_ID()="%s"', addslashes( $id ) );
				}, $input_variables['record_id'] );

				$formula = count( $formula_parts ) === 1 ? $formula_parts[0] : 'OR(' . implode( ',', $formula_parts ) . ')';

				return $data_source->get_endpoint() . '/' . $table['id'] . '?filterByFormula=' . urlencode( $formula );
			},
			'input_schema' => [
				'record_id' => [
					'name' => 'Record ID',
					'type' => 'id:list',
				],
			],
			'output_schema' => [
				'is_collection' => true,
				'path' => '$.records[*]',
				'type' => self::get_airtable_output_schema_mappings( $table ),
			],
		];
	}

	private static function get_airtable_output_schema_mappings( array $table ): array {
		$output_schema = [
			'record_id' => [
				'name' => 'Record ID',
				'path' => '$["id"]',
				'type' => 'id',
			],
		];

		foreach ( $table['output_query_mappings'] as $mapping ) {
			$mapping_key = $mapping['key'];
			$output_schema[ $mapping_key ] = [
				'name' => $mapping['name'] ?? $mapping_key,
				'path' => $mapping['path'] ?? '$.fields["' . $mapping_key . '"]',
				'type' => $mapping['type'] ?? 'string',
			];
		}

		return $output_schema;
	}

	public static function get_list_query( AirtableDataSource $data_source, array $table ): array {
		return [
			'__class' => HttpQuery::class,
			'data_source' => $data_source,
			'endpoint' => function ( array $input_variables ) use ( $data_source, $table ): string {
				$endpoint = $data_source->get_endpoint() . '/' . $table['id'];

				if ( isset( $input_variables['cursor'] ) ) {
					// While named as "offset", this is implemented as a string cursor.
					$endpoint = add_query_arg( 'offset', $input_variables['cursor'], $endpoint );
				}

				if ( isset( $input_variables['page_size'] ) ) {
					$endpoint = add_query_arg( 'pageSize', $input_variables['page_size'], $endpoint );
				}

				return $endpoint;
			},
			'input_schema' => [
				'cursor' => [
					'name' => 'Pagination cursor',
					'required' => false,
					'type' => 'ui:pagination_cursor',
				],
				'page_size' => [
					'default_value' => 20,
					'name' => 'Page Size',
					'required' => false,
					'type' => 'ui:pagination_per_page',
				],
			],
			'output_schema' => [
				'is_collection' => true,
				'path' => '$.records[*]',
				'type' => self::get_airtable_output_schema_mappings( $table ),
			],
			'pagination_schema' => [
				'cursor_next' => [
					'name' => 'Next page cursor',
					'path' => '$.offset', // named "offset" but functions as cursor
					'type' => 'string',
				],
			],
		];
	}

	private static function get_output_schema_mappings_snippet( array $table ): string {
		$output_schema_mappings = self::get_airtable_output_schema_mappings( $table );
		return StringFormatter::export_array_as_code( $output_schema_mappings, 3 );
	}

	/**
	 * Get the block registration snippets for the Airtable integration.
	 *
	 * @param array $data_source_config The data source configuration.
	 * @return array<Snippet> The block registration snippets.
	 */
	public static function get_block_registration_snippets( array $data_source_config ): array {
		$snippets = [];
		$raw_snippet = file_get_contents( __DIR__ . '/templates/block_registration.template' );

		$service_config = $data_source_config['service_config'];
		$display_name = $service_config['display_name'];

		foreach ( $service_config['tables'] as $table ) {
			$block_reg_fn_slug = StringFormatter::normalize_function_name( [
				$display_name,
				$table['name'],
			] );

			$code = strtr( $raw_snippet, [
				'{{DATA_SOURCE_UUID}}' => $data_source_config['uuid'],
				'{{BLOCK_REG_FN_SLUG}}' => $block_reg_fn_slug,
				'{{TABLE_ID}}' => $table['id'],
				'{{TABLE_NAME}}' => $table['name'],
				'{{AIRTABLE_OUTPUT_SCHEMA_MAPPINGS}}' => self::get_output_schema_mappings_snippet( $table ),
			] );

			$snippets[] = new Snippet( $table['name'], $code );
		}

		return $snippets;
	}
}
