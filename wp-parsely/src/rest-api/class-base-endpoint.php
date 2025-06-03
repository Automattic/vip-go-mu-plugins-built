<?php
/**
 * Base API Endpoint
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API;

use Parsely\Parsely;
use Parsely\Utils\Utils;
use WP_Error;
use WP_REST_Request;

/**
 * Base class for API endpoints.
 *
 * Most endpoint classes should derive from this class. Child classes should
 * implement the `get_endpoint_name` and `register_routes` methods.
 *
 * @since 3.17.0
 */
abstract class Base_Endpoint {
	/**
	 * The Parsely instance.
	 *
	 * @since 3.17.0
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * The REST API instance.
	 *
	 * @since 3.17.0
	 *
	 * @var Base_API_Controller $api_controller
	 */
	protected $api_controller;

	/**
	 * The registered routes.
	 *
	 * @since 3.17.0
	 *
	 * @var array<string>
	 */
	protected $registered_routes = array();

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Base_API_Controller $controller The REST API controller.
	 */
	public function __construct( Base_API_Controller $controller ) {
		$this->api_controller = $controller;
		$this->parsely        = $controller->get_parsely();
	}

	/**
	 * Initializes the API endpoint, by registering the routes.
	 *
	 * Allows for the endpoint to be disabled via the
	 * `wp_parsely_api_{endpoint}_endpoint_enabled` filter.
	 *
	 * @since 3.17.0
	 */
	public function init(): void {
		/**
		 * Filter to enable/disable the endpoint.
		 *
		 * @return bool
		 */
		$filter_name = 'wp_parsely_api_' .
						Utils::convert_endpoint_to_filter_key( static::get_endpoint_name() ) .
						'_endpoint_enabled';
		if ( ! apply_filters( $filter_name, true ) ) { // phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound
			return;
		}

		// Register the routes.
		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	/**
	 * Returns the endpoint name.
	 *
	 * This method should be overridden by child classes and used to return the
	 * endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	abstract public static function get_endpoint_name(): string;

	/**
	 * Returns the default access capability for the endpoint.
	 *
	 * This method can be overridden by child classes to return a different
	 * default access capability.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	protected function get_default_access_capability(): string {
		return 'publish_posts';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * This method should be overridden by child classes and used to register
	 * the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	abstract public function register_routes(): void;

	/**
	 * Registers a REST route.
	 *
	 * @since 3.17.0
	 *
	 * @param string       $route The route to register.
	 * @param string[]     $methods Array with the allowed methods.
	 * @param callable     $callback Callback function to call when the endpoint is hit.
	 * @param array<mixed> $args The endpoint arguments definition.
	 */
	public function register_rest_route( string $route, array $methods, callable $callback, array $args = array() ): void {
		// Trim any possible slashes from the route.
		$route = trim( $route, '/' );

		// Store the route for later reference.
		$this->registered_routes[] = $route;

		// Create the full route for the endpoint.
		$route = static::get_endpoint_name() . '/' . $route;

		// Register the route.
		register_rest_route(
			$this->api_controller->get_full_namespace(),
			$this->api_controller->prefix_route( $route ),
			array(
				array(
					'methods'             => $methods,
					'callback'            => $callback,
					'permission_callback' => array( $this, 'is_available_to_current_user' ),
					'args'                => $args,
					'show_in_index'       => ! is_wp_error( $this->is_available_to_current_user() ),
				),
			)
		);
	}

	/**
	 * Returns the full endpoint path for a given route.
	 *
	 * @since 3.17.0
	 *
	 * @param string $route The route.
	 * @return string
	 */
	public function get_full_endpoint( string $route = '' ): string {
		$route = trim( $route, '/' );

		if ( '' !== $route ) {
			$route = static::get_endpoint_name() . '/' . $route;
		} else {
			$route = static::get_endpoint_name();
		}

		return '/' .
				$this->api_controller->get_full_namespace() .
				'/' .
				$this->api_controller->prefix_route( $route );
	}

	/**
	 * Returns the endpoint slug.
	 *
	 * The slug is the endpoint name prefixed with the route prefix, from
	 * the API controller.
	 *
	 * Used as an identifier for the endpoint, when registering routes.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_endpoint_slug(): string {
		return $this->api_controller->prefix_route( '' ) . static::get_endpoint_name();
	}

	/**
	 * Returns the registered routes.
	 *
	 * @since 3.17.0
	 *
	 * @return array<string>
	 */
	public function get_registered_routes(): array {
		return $this->registered_routes;
	}

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0 Replaced `is_public_endpoint`, `user_capability` and `permission_callback()`.
	 * @since 3.16.0 Added the `$request` parameter.
	 * @since 3.17.0 Moved to the new API structure.
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return WP_Error|bool True if the endpoint is available.
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found
		// Validate the API key and secret.
		$api_key_validation = $this->validate_site_id_and_secret();
		if ( is_wp_error( $api_key_validation ) ) {
			return $api_key_validation;
		}

		// Validate the user capability.
		$capability = $this->get_default_access_capability();
		return current_user_can(
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined
			$this->apply_capability_filters( $capability )
		);
	}

	/**
	 * Returns the user capability allowing access to the endpoint, after having
	 * applied capability filters.
	 *
	 * The default access capability is not passed here by default, to allow for
	 * a more explicit declaration in child classes.
	 *
	 * @since 3.14.0
	 * @since 3.17.0 Moved to the new API structure.
	 *
	 * @param string $capability The original capability allowing access.
	 * @return string The capability allowing access after applying the filters.
	 */
	public function apply_capability_filters( string $capability ): string {
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
			'wp_parsely_user_capability_for_' .
				Utils::convert_endpoint_to_filter_key( static::get_endpoint_name() ) .
			'_api',
			$default_user_capability
		);

		return $endpoint_specific_user_capability;
	}

	/**
	 * Validates that the Site ID and secret are set.
	 * If the API secret is not required, it will not be validated.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved to the new API structure and renamed from `validate_apikey_and_secret`.
	 *
	 * @param bool $require_api_secret Specifies if the API Secret is required.
	 * @return WP_Error|bool
	 */
	public function validate_site_id_and_secret( bool $require_api_secret = true ) {
		if ( false === $this->parsely->site_id_is_set() ) {
			return new WP_Error(
				'parsely_site_id_not_set',
				__( 'A Parse.ly Site ID must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( $require_api_secret && false === $this->parsely->api_secret_is_set() ) {
			return new WP_Error(
				'parsely_api_secret_not_set',
				__( 'A Parse.ly API Secret must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}
}
