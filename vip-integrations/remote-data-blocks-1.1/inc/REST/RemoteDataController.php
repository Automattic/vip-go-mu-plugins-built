<?php declare(strict_types = 1);

namespace RemoteDataBlocks\REST;

defined( 'ABSPATH' ) || exit();

use RemoteDataBlocks\Editor\BlockManagement\ConfigStore;
use WP_Error;
use WP_REST_Request;
use function wp_generate_uuid4;

class RemoteDataController {
	private static string $slug = 'remote-data';

	public static function init(): void {
		add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
	}

	public static function get_url(): string {
		$url = rest_url( sprintf( '/%s/%s', REMOTE_DATA_BLOCKS__REST_NAMESPACE, self::$slug ) );
		return add_query_arg( [ '_envelope' => 'true' ], $url );
	}

	public static function register_rest_routes(): void {
		register_rest_route( REMOTE_DATA_BLOCKS__REST_NAMESPACE, '/' . self::$slug, [
			'methods' => 'POST',
			'callback' => [ __CLASS__, 'execute_queries' ],
			'permission_callback' => [ __CLASS__, 'permission_callback' ],
			'args' => [
				'block_name' => [
					'required' => true,
					'sanitize_callback' => function ( $value ) {
						return strval( $value );
					},
					'validate_callback' => function ( $value ) {
						return null !== ConfigStore::get_block_configuration( $value );
					},
				],
				'query_key' => [
					'required' => true,
					'sanitize_callback' => function ( $value ) {
						return strval( $value );
					},
				],
				'query_inputs' => [
					'required' => true,
					'validate_callback' => function ( $value ) {
						return is_array( $value );
					},
				],
			],
		] );
	}

	public static function execute_queries( WP_REST_Request $request ): array|WP_Error {
		$block_name = $request->get_param( 'block_name' );
		$query_key = $request->get_param( 'query_key' );
		$query_inputs = $request->get_param( 'query_inputs' );

		$block_config = ConfigStore::get_block_configuration( $block_name );
		$query = $block_config['queries'][ $query_key ];
		$query_response = $query->execute_batch( $query_inputs );

		if ( is_wp_error( $query_response ) ) {
			$error_code = $query_response->get_error_code() ?? 'unknown_error';
			$error_message = $query_response->get_error_message();

			return new WP_Error( $error_code, $error_message, [ 'status' => 500 ] );
		}

		return array_merge(
			[
				'block_name' => $block_name,
				'result_id' => wp_generate_uuid4(),
				'query_key' => $query_key,
			],
			$query_response
		);
	}

	public static function permission_callback(): bool {
		return true;
	}
}
