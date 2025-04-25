<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\DataSource;

use RemoteDataBlocks\Config\ArraySerializable;
use RemoteDataBlocks\Validation\ConfigSchemas;
use RemoteDataBlocks\Validation\Validator;
use RemoteDataBlocks\WpdbStorage\DataSourceCrud;
use WP_Error;

/**
 * HttpDataSource class
 *
 * Implements the HttpDataSourceInterface to define a generic HTTP data source.
 */
class HttpDataSource extends ArraySerializable implements HttpDataSourceInterface {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

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

	final public function get_service_name(): string {
		return static::SERVICE_NAME;
	}

	/**
	 * @inheritDoc
	 *
	 * NOTE: This method uses late static bindings to allow child classes to
	 * define their own validation schema.
	 */
	public static function preprocess_config( array $config ): array|WP_Error {
		$service_config = $config['service_config'] ?? [];
		$validator = new Validator( static::get_service_config_schema(), static::class, '$service_config' );
		$validated = $validator->validate( $service_config );

		if ( is_wp_error( $validated ) ) {
			return $validated;
		}

		return array_merge(
			static::map_service_config( $service_config ),
			[
				// Store the exact data used to create the instance to preserve determinism.
				'service' => static::SERVICE_NAME,
				'service_config' => $service_config,
				'uuid' => $config['uuid'] ?? null,
			]
		);
	}

	public static function from_uuid( string $uuid ): DataSourceInterface|WP_Error {
		$config = DataSourceCrud::get_config_by_uuid( $uuid );

		if ( is_wp_error( $config ) ) {
			return $config;
		}

		return static::from_array( $config );
	}

	/**
	 * @inheritDoc
	 *
	 * TODO: Do we need to sanitize this to prevent leaking sensitive data?
	 */
	final public function to_array(): array {
		return [
			'__class' => static::class,
			'service' => static::SERVICE_NAME,
			'service_config' => $this->config['service_config'],
			'uuid' => $this->config['uuid'],
		];
	}

	/**
	 * @inheritDoc
	 */
	public static function get_config_schema(): array {
		return ConfigSchemas::get_http_data_source_config_schema();
	}

	protected static function get_service_config_schema(): array {
		return ConfigSchemas::get_http_data_source_service_config_schema();
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'] ?? static::SERVICE_NAME,
			'endpoint' => $service_config['endpoint'] ?? null, // Invalid, but we won't guess it.
			'request_headers' => $service_config['request_headers'] ?? [],
		];
	}

	/**
	 * @inheritDoc
	 */
	public static function migrate_config( array $config ): array|WP_Error {
		return $config;
	}
}
