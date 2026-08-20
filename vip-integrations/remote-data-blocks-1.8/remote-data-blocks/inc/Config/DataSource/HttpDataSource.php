<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\DataSource;

use RemoteDataBlocks\Config\ArraySerializable;
use RemoteDataBlocks\Validation\ConfigSchemas;
use RemoteDataBlocks\WpdbStorage\DataSourceCrud;
use WP_Error;

/**
 * HttpDataSource class
 *
 * Implements the HttpDataSourceInterface to define a generic HTTP data source.
 */
class HttpDataSource extends ArraySerializable implements HttpDataSourceInterface {
	final public function get_display_name(): string {
		return $this->config['display_name'];
	}

	public function get_endpoint(): string {
		return $this->config['endpoint'];
	}

	public function get_request_headers(): array|WP_Error {
		return $this->get_or_call_from_config( 'request_headers' ) ?? [];
	}

	public function get_image_url(): ?string {
		return $this->config['image_url'] ?? null;
	}

	public static function from_uuid( string $uuid ): DataSourceInterface|WP_Error {
		return DataSourceCrud::get_inflated_config_by_uuid( $uuid );
	}

	/**
	 * @inheritDoc
	 */
	public static function get_config_schema(): array {
		return ConfigSchemas::get_http_data_source_config_schema();
	}
}
