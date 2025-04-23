<?php
/**
 * Parse.ly Content API Endpoint: Analytics Posts
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API\Endpoints;

use WP_Error;

/**
 * The endpoint for the /analytics/posts API request.
 *
 * @since 3.17.0
 *
 * @link https://docs.parse.ly/api-analytics-endpoint/#0-get-analytics-type-
 *
 * @phpstan-type Analytics_Posts_API_Params array{
 *    apikey?: string,
 *    secret?: string,
 *    period_start?: string,
 *    period_end?: string,
 *    pub_date_start?: string,
 *    pub_date_end?: string,
 *    sort?: string,
 *    limit?: int<0, 2000>,
 *  }
 *
 * @phpstan-type Analytics_Post array{
 *    title?: string,
 *    url?: string,
 *    link?: string,
 *    author?: string,
 *    authors?: string[],
 *    section?: string,
 *    tags?: string[],
 *    metrics?: Analytics_Post_Metrics,
 *    full_content_word_count?: int,
 *    image_url?: string,
 *    metadata?: string,
 *    pub_date?: string,
 *    thumb_url_medium?: string,
 *  }
 *
 * @phpstan-type Analytics_Post_Metrics array{
 *    avg_engaged?: float,
 *    views?: int,
 *    visitors?: int,
 *  }
 */
class Endpoint_Analytics_Posts extends Content_API_Base_Endpoint {
	private const MAX_RECORDS_LIMIT        = 2000;
	private const ANALYTICS_API_DAYS_LIMIT = 7;

	/**
	 * Maximum limit for the number of records to return, to be
	 * used in the limit parameter.
	 *
	 * @since 3.17.0
	 *
	 * @var string
	 */
	public const MAX_LIMIT = 'max';

	/**
	 * Maximum period for the API request, to be used in the period_start parameter.
	 *
	 * @since 3.17.0
	 *
	 * @var string
	 */
	public const MAX_PERIOD = 'max_days';

	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return '/analytics/posts';
	}

	/**
	 * Returns the endpoint URL for the API request.
	 *
	 * This method appends the author, tag, and section parameters to the
	 * endpoint URL, if they are set. Since the Parse.ly API needs a key for
	 * every value (e.g. tag=tag1&tag=tag2), we need to append them manually.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $query_args The arguments to pass to the API request.
	 * @return string The endpoint URL for the API request.
	 */
	public function get_endpoint_url( array $query_args = array() ): string {
		// Store the author, tag, and section parameters.
		/** @var array<string> $authors */
		$authors = $query_args['author'] ?? array();

		/** @var array<string> $tags */
		$tags = $query_args['tag'] ?? array();

		/** @var array<string> $sections */
		$sections = $query_args['section'] ?? array();

		// Remove the author, tag, and section parameters from the query args.
		unset( $query_args['author'] );
		unset( $query_args['tag'] );
		unset( $query_args['section'] );

		// Generate the endpoint URL.
		$endpoint_url = parent::get_endpoint_url( $query_args );

		// Append the author, tag, and section parameters to the endpoint URL.
		$endpoint_url = $this->append_multiple_params_to_url( $endpoint_url, $authors, 'author' );
		$endpoint_url = $this->append_multiple_params_to_url( $endpoint_url, $tags, 'tag' );
		$endpoint_url = $this->append_multiple_params_to_url( $endpoint_url, $sections, 'section' );

		return $endpoint_url;
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
		// Filter out the empty values.
		$query_args = array_filter( $args );

		// If the period_start is set to 'max_days', set it to the maximum days limit.
		if ( isset( $query_args['period_start'] ) && self::MAX_PERIOD === $query_args['period_start'] ) {
			$query_args['period_start'] = self::ANALYTICS_API_DAYS_LIMIT . 'd';
		}

		// If the limit is set to 'max' or greater than the maximum records limit,
		// set it to the maximum records limit.
		if ( isset( $query_args['limit'] ) && (
			self::MAX_LIMIT === $query_args['limit'] || $query_args['limit'] > self::MAX_RECORDS_LIMIT )
		) {
			$query_args['limit'] = self::MAX_RECORDS_LIMIT;
		}

		return $this->request( 'GET', $query_args );
	}


	/**
	 * Appends multiple parameters to the URL.
	 *
	 * This is required because the Parsely API requires the multiple values for the author, tag,
	 * and section parameters to share the same key.
	 *
	 * @since 3.17.0
	 *
	 * @param string        $url The URL to append the parameters to.
	 * @param array<string> $params The parameters to append.
	 * @param string        $param_name The name of the parameter.
	 * @return string The URL with the appended parameters.
	 */
	protected function append_multiple_params_to_url( string $url, array $params, string $param_name ): string {
		foreach ( $params as $param ) {
			$param = rawurlencode( $param );
			if ( strpos( $url, $param_name . '=' ) === false ) {
				$url = add_query_arg( $param_name, $param, $url );
			} else {
				$url .= '&' . $param_name . '=' . $param;
			}
		}

		return $url;
	}
}
