<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Airtable;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Formatting\StringFormatter;
use RemoteDataBlocks\Snippet\Snippet;
use WP_Error;

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
				$query = self::get_query( $data_source, $table );
				$list_query = self::get_list_query( $data_source, $table );

				register_remote_data_block(
					array_merge(
						[
							'title' => $data_source->get_display_name() . '/' . $table['name'],
							'render_query' => [
								'query' => $query,
							],
							'selection_queries' => [
								[
									'query' => $list_query,
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

	public static function get_query( AirtableDataSource $data_source, array $table ): HttpQuery|WP_Error {
		$input_schema = [
			'record_id' => [
				'name' => 'Record ID',
				'type' => 'id',
			],
		];

		$output_schema = [
			'is_collection' => false,
			'type' => self::get_airtable_output_schema_mappings( $table ),
		];

		return HttpQuery::from_array( [
			'data_source' => $data_source,
			'endpoint' => function ( array $input_variables ) use ( $data_source, $table ): string {
				return $data_source->get_endpoint() . '/' . $table['id'] . '/' . $input_variables['record_id'];
			},
			'input_schema' => $input_schema,
			'output_schema' => $output_schema,
		] );
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

	public static function get_list_query( AirtableDataSource $data_source, array $table ): HttpQuery|WP_Error {
		$output_schema = [
			'is_collection' => true,
			'path' => '$.records[*]',
			'type' => self::get_airtable_output_schema_mappings( $table ),
		];

		return HttpQuery::from_array( [
			'data_source' => $data_source,
			'endpoint' => $data_source->get_endpoint() . '/' . $table['id'],
			'input_schema' => [],
			'output_schema' => $output_schema,
		] );
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
