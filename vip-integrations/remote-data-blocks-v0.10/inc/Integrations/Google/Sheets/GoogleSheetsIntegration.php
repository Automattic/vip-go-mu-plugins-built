<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Google\Sheets;

use RemoteDataBlocks\Store\DataSource\DataSourceConfigManager;
use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Formatting\StringFormatter;
use RemoteDataBlocks\Snippet\Snippet;
use WP_Error;

class GoogleSheetsIntegration {
	public static function init(): void {
		add_action( 'init', [ __CLASS__, 'register_blocks' ], 10, 0 );
	}

	public static function register_blocks(): void {
		$data_source_configs = DataSourceConfigManager::get_all( [
			'service' => REMOTE_DATA_BLOCKS_GOOGLE_SHEETS_SERVICE,
			'enable_blocks' => true,
		] );

		foreach ( $data_source_configs as $config ) {
			$data_source = GoogleSheetsDataSource::from_array( $config );

			self::register_blocks_for_google_sheets_data_source( $data_source );
			self::register_loop_blocks_for_google_sheets_data_source( $data_source );
		}
	}

	public static function register_blocks_for_google_sheets_data_source(
		GoogleSheetsDataSource $data_source,
		array $block_overrides = []
	): void {
		$sheets = $data_source->to_array()['service_config']['sheets'];

		foreach ( $sheets as $sheet ) {
			$query = self::get_query( $data_source, $sheet );
			$list_query = self::get_list_query( $data_source, $sheet );

			register_remote_data_block(
				array_merge(
					[
						'title' => $data_source->get_display_name() . '/' . $sheet['name'],
						'icon' => 'media-spreadsheet',
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

	public static function register_loop_blocks_for_google_sheets_data_source(
		GoogleSheetsDataSource $data_source,
		array $block_overrides = []
	): void {
		$sheets = $data_source->to_array()['service_config']['sheets'];

		foreach ( $sheets as $sheet ) {
			$list_query = self::get_list_query( $data_source, $sheet );

			register_remote_data_block(
				array_merge(
					[
						'title' => sprintf( '%s/%s Loop', $data_source->get_display_name(), $sheet['name'] ),
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

	private static function get_query(
		GoogleSheetsDataSource $data_source,
		array $sheet,
	): HttpQuery|WP_Error {
		$input_schema = [
			'row_id' => [
				'name' => 'Row ID',
				'type' => 'id',
			],
		];

		$output_schema = [
			'is_collection' => false,
			'type' => self::get_output_schema_mappings( $sheet ),
		];

		return HttpQuery::from_array( [
			'data_source' => $data_source,
			'endpoint' => $data_source->get_endpoint() . '/values/' . rawurlencode( $sheet['name'] ),
			'input_schema' => $input_schema,
			'output_schema' => $output_schema,
			'preprocess_response' => function ( mixed $response_data, array $input_variables ): array {
				return GoogleSheetsDataSource::preprocess_get_response( $response_data, $input_variables );
			},
		] );
	}

	private static function get_list_query(
		GoogleSheetsDataSource $data_source,
		array $sheet,
	): HttpQuery|WP_Error {
		$output_schema = [
			'is_collection' => true,
			'path' => '$.values[*]',
			'type' => self::get_output_schema_mappings( $sheet ),
		];

		return HttpQuery::from_array( [
			'data_source' => $data_source,
			'endpoint' => $data_source->get_endpoint() . '/values/' . rawurlencode( $sheet['name'] ),
			'input_schema' => [],
			'output_schema' => $output_schema,
			'preprocess_response' => function ( mixed $response_data ): array {
				return GoogleSheetsDataSource::preprocess_list_response( $response_data );
			},
		] );
	}

	private static function get_output_schema_mappings( array $sheet ): array {
		$output_schema = [
			'row_id' => [
				'name' => 'Row ID',
				'path' => '$["RowId"]',
				'type' => 'id',
			],
		];

		foreach ( $sheet['output_query_mappings'] as $mapping ) {
			$mapping_key = $mapping['key'];
			$output_schema[ $mapping_key ] = [
				'name' => $mapping['name'] ?? $mapping_key,
				'path' => $mapping['path'] ?? '$.fields["' . $mapping_key . '"]',
				'type' => $mapping['type'] ?? 'string',
			];
		}

		return $output_schema;
	}

	private static function get_output_schema_mappings_snippet( array $sheet ): string {
		$output_schema_mappings = self::get_output_schema_mappings( $sheet );
		return StringFormatter::export_array_as_code( $output_schema_mappings, 3 );
	}

	/**
	 * Get the block registration snippets for the Google Sheets integration.
	 *
	 * @param array $data_source_config The data source configuration.
	 * @return array<Snippet> The block registration snippets.
	 */
	public static function get_block_registration_snippets( array $data_source_config ): array {
		$snippets = [];
		$raw_snippet = file_get_contents( __DIR__ . '/templates/block_registration.template' );

		$service_config = $data_source_config['service_config'];
		$display_name = $service_config['display_name'];

		foreach ( $service_config['sheets'] as $sheet ) {
			$block_reg_fn_slug = StringFormatter::normalize_function_name( [
				$display_name,
				$sheet['name'],
			] );

			$code = strtr( $raw_snippet, [
				'{{DATA_SOURCE_UUID}}' => $data_source_config['uuid'],
				'{{BLOCK_REG_FN_SLUG}}' => $block_reg_fn_slug,
				'{{SHEET_NAME}}' => $sheet['name'],
				'{{SHEETS_OUTPUT_SCHEMA_MAPPINGS}}' => self::get_output_schema_mappings_snippet( $sheet ),
			] );

			$snippets[] = new Snippet( $sheet['name'], $code );
		}

		return $snippets;
	}
}
