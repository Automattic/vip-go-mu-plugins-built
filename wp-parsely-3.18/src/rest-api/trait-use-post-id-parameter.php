<?php
/**
 * Trait allowing to register a REST route with a post ID parameter
 *
 * @package Parsely
 * @since   3.17.0
 */

declare( strict_types = 1 );

namespace Parsely\REST_API;

use WP_REST_Request;

/**
 * Trait to register a REST route with a post ID parameter.
 *
 * @since 3.17.0
 */
trait Use_Post_ID_Parameter_Trait {
	/**
	 * Registers a REST route with a post ID parameter in the route.
	 *
	 * @since 3.17.0
	 *
	 * @param string        $route    The route.
	 * @param array<string> $methods  The HTTP methods.
	 * @param callable      $callback The callback function.
	 * @param array<mixed>  $args     The route arguments.
	 */
	public function register_rest_route_with_post_id(
		string $route,
		array $methods,
		callable $callback,
		array $args = array()
	): void {
		// Append the post_id parameter to the route.
		$route = '/(?P<post_id>\d+)/' . trim( $route, '/' );

		// Add the post_id parameter to the args.
		$args = array_merge(
			$args,
			array(
				'post_id' => array(
					'description'       => __( 'The ID of the post.', 'wp-parsely' ),
					'type'              => 'integer',
					'required'          => true,
					'validate_callback' => array( $this, 'validate_post_id' ),
				),
			)
		);

		// Register the route.
		$this->register_rest_route( $route, $methods, $callback, $args );
	}

	/**
	 * Validates the post ID parameter.
	 *
	 * The callback sets the post object in the request object if the parameter is valid.
	 *
	 * @since 3.16.0
	 * @since 3.17.0 Moved from the `Smart_Linking_Endpoint` class.
	 * @access private
	 *
	 * @param string          $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return bool Whether the parameter is valid.
	 */
	public function validate_post_id( string $param, WP_REST_Request $request ): bool {
		if ( ! is_numeric( $param ) ) {
			return false;
		}

		$param = filter_var( $param, FILTER_VALIDATE_INT );

		if ( false === $param ) {
			return false;
		}

		// Validate if the post ID exists.
		$post = get_post( $param );

		// Set the post attribute in the request.
		$request->set_param( 'post', $post );

		return null !== $post;
	}
}
