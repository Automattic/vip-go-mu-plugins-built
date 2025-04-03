<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\SalesforceD2C;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Validation\Types;
use function plugins_url;

defined( 'ABSPATH' ) || exit();

class SalesforceD2CDataSource extends HttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_SALESFORCE_D2C_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'display_name' => Types::string(),
			'client_id' => Types::string(),
			'client_secret' => Types::string(),
			'enable_blocks' => Types::nullable( Types::boolean() ),
			'domain' => Types::string(),
			'store_id' => Types::string(),
		] );
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => 'https://' . $service_config['domain'] . '.my.salesforce.com',
			'image_url' => plugins_url( './assets/salesforce_commerce_cloud_logo.png', __FILE__ ),
			'request_headers' => [
				'Content-Type' => 'application/json',
			],
		];
	}
}
