<?php
/**
 * Trait allowing to register a REST route with a post ID parameter
 *
 * @package Parsely
 * @since   3.17.0
 */

declare( strict_types = 1 );

namespace Parsely\REST_API;

use WP_Error;
use WP_Post;
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

		$this->register_rest_route(
			$route,
			$methods,
			$callback,
			$args,
			array( $this, 'can_access_request_post' )
		);
	}

	/**
	 * Validates the post ID parameter.
	 *
	 * @since 3.16.0
	 * @since 3.17.0 Moved from the `Smart_Linking_Endpoint` class.
	 * @since 3.24.2 Stopped storing the post object in the request object.
	 * @access private
	 *
	 * @param string               $param   The parameter value.
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool Whether the parameter is valid.
	 */
	public function validate_post_id( string $param, ?WP_REST_Request $request = null ): bool { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter
		if ( ! is_numeric( $param ) ) {
			return false;
		}

		$param = filter_var( $param, FILTER_VALIDATE_INT );

		if ( false === $param ) {
			return false;
		}

		return null !== get_post( $param );
	}

	/**
	 * Returns the post that the request's post ID parameter refers to.
	 *
	 * @since 3.24.2
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_Post|null The post object, or null if it doesn't exist.
	 */
	protected function get_request_post( WP_REST_Request $request ): ?WP_Post {
		$post_id = (int) $request->get_param( 'post_id' );

		return $post_id > 0 ? get_post( $post_id ) : null;
	}

	/**
	 * Checks whether the current user can access the post referenced by the
	 * request, on top of the endpoint's own access checks.
	 *
	 * Parse.ly data for a post is available to users who can edit that post,
	 * as the post itself might not be publicly available.
	 *
	 * @since 3.24.2
	 * @access private
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_Error|bool True if the request is allowed.
	 */
	public function can_access_request_post( WP_REST_Request $request ) {
		$endpoint_access = $this->is_available_to_current_user( $request );

		if ( true !== $endpoint_access ) {
			return $endpoint_access;
		}

		$post_id = (int) $request->get_param( 'post_id' );

		if ( $post_id > 0 && ! current_user_can( 'edit_post', $post_id ) ) {
			return new WP_Error(
				'parsely_post_access_denied',
				__(
					'Sorry, you are not allowed to access Parse.ly data for this post.',
					'wp-parsely'
				),
				array( 'status' => rest_authorization_required_code() )
			);
		}

		return true;
	}
}
