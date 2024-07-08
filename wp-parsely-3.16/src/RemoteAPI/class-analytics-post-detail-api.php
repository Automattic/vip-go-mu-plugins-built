<?php
/**
 * Class for Analytics Post Detail API (`/analytics/post/detail`).
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Parsely;
use WP_REST_Request;

/**
 * Class for Analytics Post Detail API (`/analytics/post/detail`).
 *
 * @since 3.6.0
 */
class Analytics_Post_Detail_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_API_BASE_URL;
	protected const ENDPOINT     = '/analytics/post/detail';
	protected const QUERY_FILTER = 'wp_parsely_analytics_post_detail_endpoint_args';

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 * @since 3.16.0 Added the `$request` parameter.
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool
	 */
	public function is_available_to_current_user( $request = null ): bool {
		return current_user_can(
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined
			$this->apply_capability_filters(
				Base_Endpoint::DEFAULT_ACCESS_CAPABILITY
			)
		);
	}
}
