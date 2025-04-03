<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\Airtable;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Validation\Types;

class AirtableDataSource extends HttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_AIRTABLE_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'access_token' => Types::string(),
			'base' => Types::object( [
				'id' => Types::string(),
				'name' => Types::nullable( Types::string() ),
			] ),
			'enable_blocks' => Types::nullable( Types::boolean() ),
			'display_name' => Types::string(),
			'tables' => Types::list_of(
				Types::object( [
					'id' => Types::id(),
					'name' => Types::nullable( Types::string() ),
					'output_query_mappings' => Types::list_of(
						Types::object( [
							'key' => Types::string(),
							'name' => Types::nullable( Types::string() ),
							'path' => Types::nullable( Types::json_path() ),
							'type' => Types::nullable( Types::string() ),
						] )
					),
				] )
			),
		] );
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => sprintf( 'https://api.airtable.com/v0/%s', $service_config['base']['id'] ),
			'request_headers' => [
				'Authorization' => sprintf( 'Bearer %s', $service_config['access_token'] ),
				'Content-Type' => 'application/json',
			],
		];
	}
}
