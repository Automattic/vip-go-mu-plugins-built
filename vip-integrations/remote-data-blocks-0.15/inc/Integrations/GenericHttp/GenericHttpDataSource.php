<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Integrations\GenericHttp;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Validation\Types;
use RemoteDataBlocks\Validation\Validator;
use WP_Error;

class GenericHttpDataSource extends HttpDataSource {
	protected const SERVICE_NAME = REMOTE_DATA_BLOCKS_GENERIC_HTTP_SERVICE;
	protected const SERVICE_SCHEMA_VERSION = 1;

	protected static function get_service_config_schema(): array {
		return Types::object( [
			'__version' => Types::integer(),
			'auth' => Types::nullable(
				Types::object( [
					'add_to' => Types::nullable( Types::enum( 'header', 'query' ) ),
					'key' => Types::nullable( Types::skip_sanitize( Types::string() ) ),
					'type' => Types::enum( 'basic', 'bearer', 'api-key', 'none' ),
					'value' => Types::skip_sanitize( Types::string() ),
				] )
			),
			'display_name' => Types::string(),
			'endpoint' => Types::string(),
		] );
	}

	public static function get_endpoint_from_service_config( array $service_config ): string {
		$endpoint = $service_config['endpoint'];
		$auth_config = $service_config['auth'] ?? null;
		$auth_type = $auth_config['type'] ?? null;

		if ( 'api-key' === $auth_type && 'queryparams' === $auth_config['add_to'] ) {
			return add_query_arg( $auth_config['key'], $auth_config['value'], $endpoint );
		}

		return $endpoint;
	}

	public static function get_request_headers_from_service_config( array $service_config ): array {
		$auth_config = $service_config['auth'] ?? null;
		$auth_type = $auth_config['type'] ?? null;

		switch ( $auth_type ) {
			case 'bearer':
				return [ 'Authorization' => 'Bearer ' . $auth_config['value'] ];

			case 'basic':
				return [ 'Authorization' => 'Basic ' . base64_encode( $auth_config['value'] ) ];

			case 'api-key':
				if ( 'header' === $auth_config['add_to'] ) {
					return [ $auth_config['key'] => $auth_config['value'] ];
				}
		}

		return [];
	}

	final public function get_service_name(): string {
		return static::SERVICE_NAME;
	}

	protected static function map_service_config( array $service_config ): array {
		return [
			'display_name' => $service_config['display_name'],
			'endpoint' => self::get_endpoint_from_service_config( $service_config ),
			'request_headers' => self::get_request_headers_from_service_config( $service_config ),
		];
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
}
