<?php
/**
 * Parse.ly Content API Endpoint: Referrers Post Detail
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use WP_Error;

/**
 * The endpoint for the /referrers/post/detail API request.
 *
 * @since 3.17.0
 *
 * @link https://docs.parse.ly/api-referrers-endpoint/#3-get-referrers-post-detail
 */
class Endpoint_Referrers_Post_Detail extends Content_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return '/referrers/post/detail';
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API request.
	 */
	public function call( array $args = array() ) {
		$query_args = array(
			'url'          => $args['url'],
			'period_start' => $args['period_start'],
			'period_end'   => $args['period_end'],
		);

		// Filter out the empty values.
		$query_args = array_filter( $query_args );

		return $this->request( 'GET', $query_args );
	}
}
