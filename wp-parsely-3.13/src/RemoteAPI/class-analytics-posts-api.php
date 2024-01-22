<?php
/**
 * Class for Analytics Posts API (`/analytics/posts`).
 *
 * @package Parsely
 * @since   3.4.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Parsely;
use WP_Error;

/**
 * Class for Analytics Posts API (`/analytics/posts`).
 *
 * @since 3.4.0
 *
 * @phpstan-type Analytics_Post_API_Params array{
 *   apikey?: string,
 *   secret?: string,
 *   period_start?: string,
 *   period_end?: string,
 *   pub_date_start?: string,
 *   pub_date_end?: string,
 *   sort?: string,
 *   limit?: int<0, 2000>,
 * }
 *
 * @phpstan-type Analytics_Post array{
 *   title?: string,
 *   url?: string,
 *   link?: string,
 *   author?: string,
 *   authors?: string[],
 *   section?: string,
 *   tags?: string[],
 *   metrics?: Analytics_Post_Metrics,
 *   full_content_word_count?: int,
 *   image_url?: string,
 *   metadata?: string,
 *   pub_date?: string,
 *   thumb_url_medium?: string,
 * }
 *
 * @phpstan-type Analytics_Post_Metrics array{
 *   avg_engaged?: float,
 *   views?: int,
 *   visitors?: int,
 * }
 */
class Analytics_Posts_API extends Base_Endpoint_Remote {
	public const MAX_RECORDS_LIMIT        = 2000;
	public const ANALYTICS_API_DAYS_LIMIT = 7;

	protected const API_BASE_URL = Parsely::PUBLIC_API_BASE_URL;
	protected const ENDPOINT     = '/analytics/posts';
	protected const QUERY_FILTER = 'wp_parsely_analytics_posts_endpoint_args';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Calls Parse.ly Analytics API to get posts info.
	 *
	 * Main purpose of this function is to enforce typing.
	 *
	 * @param Analytics_Post_API_Params $api_params Parameters of the API.
	 * @return Analytics_Post[]|WP_Error|null
	 */
	public function get_posts_analytics( $api_params ) {
		return $this->get_items( $api_params, true ); // @phpstan-ignore-line
	}

	/**
	 * Returns the request's options for the remote API call.
	 *
	 * @since 3.9.0
	 *
	 * @return array<string, mixed> The array of options.
	 */
	protected function get_request_options(): array {
		return array(
			'timeout' => 30, // phpcs:ignore WordPressVIPMinimum.Performance.RemoteRequestTimeout.timeout_timeout
		);
	}
}
