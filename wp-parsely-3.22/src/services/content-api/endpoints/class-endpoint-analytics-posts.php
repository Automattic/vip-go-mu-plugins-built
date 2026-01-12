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
	 * This function supports repeating keys in the URL, which is a Parse.ly API
	 * requirement for specifying multiple values (e.g. tag=tag1&tag=tag2).
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $query_args The arguments to pass to the API request.
	 * @return string The endpoint URL for the API request.
	 */
	public function get_endpoint_url( array $query_args = array() ): string {
		// Store the values of the parameters requiring repeating keys.
		/** @var array<string> $tags */
		$tags = $query_args['tag'] ?? array();

		/** @var array<string> $urls */
		$urls = $query_args['urls'] ?? array();

		// Remove the parameters requiring repeating keys.
		unset( $query_args['tag'] );
		unset( $query_args['urls'] );

		// Generate the endpoint URL.
		$endpoint_url = parent::get_endpoint_url( $query_args );

		// Append the parameters requiring repeating keys to the endpoint URL.
		$endpoint_url = $this->append_same_key_params_to_url( $endpoint_url, $tags, 'tag' );
		$endpoint_url = $this->append_same_key_params_to_url( $endpoint_url, $urls, 'url' );

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
	 * Appends multiple parameters with the same key to the passed URL.
	 *
	 * @since 3.17.0
	 *
	 * @param string        $url The URL to append the parameters to.
	 * @param array<string> $values The parameter values to append.
	 * @param string        $key The common key to be used for the parameters.
	 * @return string The URL with the appended parameters.
	 */
	protected function append_same_key_params_to_url(
		string $url,
		array $values,
		string $key
	): string {
		if ( '' === $key ) {
			return $url;
		}

		foreach ( $values as $value ) {
			if ( '' === $value ) {
				continue;
			}

			$value = rawurlencode( $value );

			if ( false === strpos( $url, '?' ) ) {
				$url .= '?' . $key . '=' . $value;
			} else {
				$url .= '&' . $key . '=' . $value;
			}
		}

		return $url;
	}
}
