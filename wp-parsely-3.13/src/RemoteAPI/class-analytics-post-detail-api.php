<?php
/**
 * Class for Analytics Post Detail API (`/analytics/post/detail`).
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Parsely;

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
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 * @var bool
	 */
	protected $is_public_endpoint = false;
}
