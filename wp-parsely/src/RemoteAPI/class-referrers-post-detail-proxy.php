<?php
/**
 * Remote API: `/referrers/post/detail` REST API Proxy class
 *
 * @package Parsely
 * @since   3.6.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

/**
 * Proxy for the `/referrers/post/detail` endpoint.
 *
 * @since 3.6.0
 */
class Referrers_Post_Detail_Proxy extends Base_Proxy {
	protected const ENDPOINT     = 'https://api.parsely.com/v2/referrers/post/detail';
	protected const QUERY_FILTER = 'wp_parsely_referrers_post_detail_endpoint_args';
}
