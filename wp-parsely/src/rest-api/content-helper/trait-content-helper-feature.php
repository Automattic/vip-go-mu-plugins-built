<?php
/**
 * API Content Helper Feature Trait
 * Provides a trait for Content Helper endpoints that require a feature to be enabled, by
 * providing a method to check if the current user has permission to use the feature.
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
 * Trait for content helper endpoints that require a feature to be enabled.
 *
 * @since 3.17.0
 */
trait Content_Helper_Feature {
	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The feature name.
	 */
	abstract public function get_pch_feature_name(): string;

	/**
	 * Checks if the current user has permission to use the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return bool True if the user has permission, false otherwise.
	 */
	protected function is_pch_feature_enabled_for_user(): bool {
		return Permissions::current_user_can_use_pch_feature(
			$this->get_pch_feature_name(),
			$this->parsely->get_options()['content_helper']
		);
	}

	/**
	 * Checks if the endpoint is available to the current user.
	 *
	 * Overrides the method in the Base_Endpoint class to check if the
	 * current user has permission to use the feature.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool|WP_Error True if the endpoint is available.
	 */
	public function is_available_to_current_user( ?WP_REST_Request $request = null ) {
		$can_use_feature = $this->is_pch_feature_enabled_for_user();

		if ( ! $can_use_feature ) {
			return new WP_Error( 'ch_access_to_feature_disabled', '', array( 'status' => 403 ) );
		}

		return parent::is_available_to_current_user( $request );
	}
}
