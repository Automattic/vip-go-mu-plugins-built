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
	 * The default user capability needed to access endpoints.
	 *
	 * @since 3.14.0
	 *
	 * @var string
	 */
	protected const DEFAULT_ACCESS_CAPABILITY = 'publish_posts';

	/**
	 * Parsely Instance.
	 *
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0 Replaced `is_public_endpoint`, `user_capability` and `permission_callback()`.
	 *
	 * @return bool
	 */
	abstract public function is_available_to_current_user(): bool;

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Parsely instance.
	 *
	 * @since 3.2.0
	 * @since 3.7.0 Added user capability checks based on `is_public_endpoint` attribute.
	 * @since 3.11.0 Moved from Base_Endpoint_Remote into Base_Endpoint.
	 * @since 3.14.0 Moved capability filters functionality outside of the constructor.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;
	}

	/**
	 * Returns the user capability allowing access to the endpoint, after having
	 * applied capability filters.
	 *
	 * `DEFAULT_ACCESS_CAPABILITY` is not passed here by default, to allow for
	 * a more explicit declaration in child classes.
	 *
	 * @since 3.14.0
	 *
	 * @param string $capability The original capability allowing access.
	 * @return string The capability allowing access after applying the filters.
	 */
	protected function apply_capability_filters( string $capability ): string {
			/**
			 * Filter to change the default user capability for all private endpoints.
			 *
			 * @var string
			 */
			$default_user_capability = apply_filters(
				'wp_parsely_user_capability_for_all_private_apis',
				$capability
			);

			/**
			 * Filter to change the user capability for the specific endpoint.
			 *
			 * @var string
			 */
			$endpoint_specific_user_capability = apply_filters(
				'wp_parsely_user_capability_for_' . convert_endpoint_to_filter_key( static::ENDPOINT ) . '_api',
				$default_user_capability
			);

		return $endpoint_specific_user_capability;
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
				'permission_callback' => array( $this, 'is_available_to_current_user' ),
				'args'                => $get_items_args,
				'show_in_index'       => static::is_available_to_current_user(),
			),
		);

		register_rest_route( 'wp-parsely/v1', $endpoint, $rest_route_args );
	}
}
