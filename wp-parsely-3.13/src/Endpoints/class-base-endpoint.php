<?php
/**
 * Endpoints: Base endpoint class
 *
 * @package Parsely
 * @since   3.11.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use Parsely\Parsely;
use WP_REST_Server;

use function Parsely\Utils\convert_endpoint_to_filter_key;

/**
 * Base class for API endpoints.
 *
 * Most endpoint classes should derive from this class. Child classes must add a
 * protected `ENDPOINT` constant.
 *
 * @since 3.2.0
 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 *
 * @phpstan-type API_Error array{
 *   code: int,
 *   message: string,
 *   htmlMessage: string,
 * }
 */
abstract class Base_Endpoint {
	protected const ENDPOINT = '';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Parsely Instance.
	 *
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * User capability based on which we should allow access to the endpoint.
	 *
	 * `null` should be used for all public endpoints.
	 *
	 * @since 3.7.0
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @var string|null
	 */
	protected $user_capability;

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Parsely instance.
	 *
	 * @since 3.2.0
	 * @since 3.7.0 Added user capability checks based on `is_public_endpoint` attribute.
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;

		if ( $this->is_public_endpoint ) {
			$this->user_capability = null;
		} else {
			/**
			 * Filter to change the default user capability for all private endpoints.
			 *
			 * @var string
			 */
			$default_user_capability = apply_filters(
				'wp_parsely_user_capability_for_all_private_apis',
				'publish_posts'
			);

			/**
			 * Filter to change the user capability for the specific API endpoint.
			 *
			 * @var string
			 */
			$endpoint_specific_user_capability = apply_filters(
				'wp_parsely_user_capability_for_' . convert_endpoint_to_filter_key( static::ENDPOINT ) . '_api',
				$default_user_capability
			);

			$this->user_capability = $endpoint_specific_user_capability;
		}
	}

	/**
	 * Checks if the current user is allowed to make the API call.
	 *
	 * @since 3.7.0
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @return bool
	 */
	public function is_user_allowed_to_make_api_call(): bool {
		// This endpoint does not require any capability checks.
		if ( is_null( $this->user_capability ) ) {
			return true;
		}

		// The user has the required capability to access this endpoint.
		// phpcs:ignore WordPress.WP.Capabilities.Undetermined
		if ( current_user_can( $this->user_capability ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @param string        $endpoint The endpoint's route.
	 * @param string        $callback The callback function to call when the endpoint is hit.
	 * @param array<string> $methods The HTTP methods to allow for the endpoint.
	 */
	public function register_endpoint(
		string $endpoint,
		string $callback,
		array $methods = array( 'GET' )
	): void {
		if ( ! apply_filters( 'wp_parsely_enable_' . convert_endpoint_to_filter_key( $endpoint ) . '_api_proxy', true ) ) {
			return;
		}

		$get_items_args = array(
			'query' => array(
				'default'           => array(),
				'sanitize_callback' => function ( array $query ) {
					$sanitized_query = array();
					foreach ( $query as $key => $value ) {
						$sanitized_query[ sanitize_key( $key ) ] = sanitize_text_field( $value );
					}

					return $sanitized_query;
				},
			),
		);

		$rest_route_args = array(
			array(
				'methods'             => $methods,
				'callback'            => array( $this, $callback ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => $get_items_args,
				'show_in_index'       => static::permission_callback(),
			),
		);

		register_rest_route( 'wp-parsely/v1', $endpoint, $rest_route_args );
	}

	/**
	 * Determines if there are enough permissions to call the endpoint.
	 *
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @return bool
	 */
	public function permission_callback(): bool {
		return $this->is_user_allowed_to_make_api_call();
	}
}
