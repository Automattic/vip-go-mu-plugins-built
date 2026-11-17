<?php
/**
 * API Content Intelligence Feature Trait
 * Provides a trait for Content Intelligence endpoints that require a feature to
 * be enabled, by providing a method to check if the current user has permission
 * to use the feature.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper;

use Parsely\Permissions;
use WP_Error;
use WP_REST_Request;

/**
 * Trait for Content Intelligence endpoints that require a feature to be enabled.
 *
 * @since 3.17.0
 */
trait Content_Helper_Feature {
	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The feature's name.
	 */
	abstract public function get_pch_feature_name(): string;

	/**
	 * Checks if the current user has permission to use the feature associated
	 * with the current endpoint.
	 *
	 * @since 3.17.0
	 * @since 3.23.6 Added the `$post_id` parameter.
	 *
	 * @param int $post_id The post ID, if the check is for a specific post.
	 * @return bool True if the user has permission, false otherwise.
	 */
	protected function is_pch_feature_enabled_for_user(
		int $post_id = 0
	): bool {
		return Permissions::current_user_can_use_pch_feature(
			$this->get_pch_feature_name(),
			$this->parsely->get_options()['content_helper'],
			$post_id
		);
	}

	/**
	 * Returns the IDs of the posts that the request operates on.
	 *
	 * @since 3.23.6
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return array<int> The post IDs referenced by the request.
	 */
	private function get_request_post_ids( ?WP_REST_Request $request ): array {
		if ( null === $request ) {
			return array();
		}

		$post_ids = array();

		foreach ( array( 'post_id', 'source_post_id' ) as $param_name ) {
			$param_value = $request->get_param( $param_name );

			if ( is_numeric( $param_value ) && (int) $param_value > 0 ) {
				$post_ids[] = (int) $param_value;
			}
		}

		return array_values( array_unique( $post_ids ) );
	}

	/**
	 * Checks if the endpoint is available to the current user.
	 *
	 * Overrides the method in the Base_Endpoint class to check if the current
	 * user has permission to use the feature, on each post the request
	 * references.
	 *
	 * @since 3.17.0
	 * @since 3.23.6 Added per-post permission checks.
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool|WP_Error True if the endpoint is available.
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ) {
		$post_ids = $this->get_request_post_ids( $request );

		if ( 0 === count( $post_ids ) ) {
			$post_ids = array( 0 );
		}

		foreach ( $post_ids as $post_id ) {
			if ( ! $this->is_pch_feature_enabled_for_user( $post_id ) ) {
				return new WP_Error(
					'ch_access_to_feature_disabled',
					'',
					array( 'status' => 403 )
				);
			}
		}

		return parent::is_available_to_current_user( $request );
	}
}
