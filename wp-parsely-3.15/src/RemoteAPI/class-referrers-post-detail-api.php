<?php
/**
 * Class for Referrers Post Detail API (`/referrers/post/detail`).
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Parsely;

/**
 * Class for Referrers Post Detail API (`/referrers/post/detail`).
 *
 * @since 3.6.0
 */
class Referrers_Post_Detail_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_API_BASE_URL;
	protected const ENDPOINT     = '/referrers/post/detail';
	protected const QUERY_FILTER = 'wp_parsely_referrers_post_detail_endpoint_args';

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 *
	 * @return bool
	 */
	public function is_available_to_current_user(): bool {
		return current_user_can(
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined
			$this->apply_capability_filters(
				Base_Endpoint::DEFAULT_ACCESS_CAPABILITY
			)
		);
	}
}
