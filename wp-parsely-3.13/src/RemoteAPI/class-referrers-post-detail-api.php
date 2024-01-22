<?php
/**
 * Class for Referrers Post Detail API (`/referrers/post/detail`).
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

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
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 * @var bool
	 */
	protected $is_public_endpoint = false;
}
