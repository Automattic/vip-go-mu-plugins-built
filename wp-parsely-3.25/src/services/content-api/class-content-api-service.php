<?php
/**
 * Parse.ly Content API Service class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Content_API;

use Parsely\Services\Base_API_Service;
use Parsely\Services\Base_Service_Endpoint;
use WP_Error;

/**
 * The Parse.ly Content API Service class.
 *
 * This class is responsible for handling the API requests to the Parse.ly Content API.
 *
 * @since 3.17.0
 */
class Content_API_Service extends Base_API_Service {
	/**
	 * Returns the base URL for the Parse.ly Content API, aka Public API.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_base_url(): string {
		return 'https://api.parsely.com/v2';
	}

	/**
	 * Registers the endpoints for the Parse.ly Content API.
	 *
	 * @since 3.17.0
	 */
	protected function register_endpoints(): void {
		/**
		 * The endpoints for the Parse.ly Content API.
		 *
		 * @var array<Base_Service_Endpoint> $endpoints
		 */
		$endpoints = array(
			new Endpoints\Endpoint_Validate( $this ),
		);

		foreach ( $endpoints as $endpoint ) {
			$this->register_endpoint( $endpoint );
		}

		/**
		 * The cached endpoints.
		 *
		 * The second element in the array is the time-to-live for the cache, in seconds.
		 *
		 * @var array<array{0: Base_Service_Endpoint, 1: int}> $cached_endpoints
		 */
		$cached_endpoints = array(
			array( new Endpoints\Endpoint_Analytics_Posts( $this ), 300 ), // 5 minutes.
			array( new Endpoints\Endpoint_Related( $this ), 600 ), // 10 minutes.
			array( new Endpoints\Endpoint_Referrers_Post_Detail( $this ), 300 ), // 5 minutes.
			array( new Endpoints\Endpoint_Analytics_Post_Details( $this ), 300 ), // 5 minutes.
		);

		foreach ( $cached_endpoints as $cached_endpoint ) {
			$this->register_cached_endpoint( $cached_endpoint[0], $cached_endpoint[1] );
		}
	}

	/**
	 * Returns the post’s metadata, as well as total views and visitors in the metrics field.
	 *
	 * By default, this returns the total pageviews on the link for the last 90 days.
	 *
	 * @since 3.17.0
	 *
	 * @link https://docs.parse.ly/api-analytics-endpoint/#2-get-analytics-post-detail
	 *
	 * @param string      $url The URL of the post.
	 * @param string|null $period_start The start date of the period to get the data for.
	 * @param string|null $period_end The end date of the period to get the data for.
	 * @return array<mixed>|WP_Error Returns the post details or a WP_Error object in case of an error.
	 */
	public function get_post_details(
		string $url,
		?string $period_start = null,
		?string $period_end = null
	) {
		/** @var Endpoints\Endpoint_Analytics_Post_Details $endpoint */
		$endpoint = $this->get_endpoint( '/analytics/post/detail' );

		$args = array(
			'url'          => $url,
			'period_start' => $period_start,
			'period_end'   => $period_end,
		);

		return $endpoint->call( $args );
	}

	/**
	 * Returns the referrers for a given post URL.
	 *
	 * @since 3.17.0
	 *
	 * @link https://docs.parse.ly/api-referrers-endpoint/#3-get-referrers-post-detail
	 *
	 * @param string      $url The URL of the post.
	 * @param string|null $period_start The start date of the period to get the data for.
	 * @param string|null $period_end The end date of the period to get the data for.
	 * @return array<mixed>|WP_Error Returns the referrers or a WP_Error object in case of an error.
	 */
	public function get_post_referrers(
		string $url,
		?string $period_start = null,
		?string $period_end = null
	) {
		/** @var Endpoints\Endpoint_Referrers_Post_Detail $endpoint */
		$endpoint = $this->get_endpoint( '/referrers/post/detail' );

		$args = array(
			'url'          => $url,
			'period_start' => $period_start,
			'period_end'   => $period_end,
		);

		return $endpoint->call( $args );
	}

	/**
	 * Returns the related posts for a given URL.
	 *
	 * @since 3.17.0
	 *
	 * @link https://docs.parse.ly/content-recommendations/#h-get-related
	 *
	 * @param string              $url The URL of the post.
	 * @param array<string,mixed> $params The parameters to pass to the API request.
	 * @return array<mixed>|WP_Error Returns the related posts or a WP_Error object in case of an error.
	 */
	public function get_related_posts_with_url( string $url, array $params = array() ) {
		/** @var Endpoints\Endpoint_Related $endpoint */
		$endpoint = $this->get_endpoint( '/related' );

		$args = array(
			'url' => $url,
		);

		// Merge the optional params.
		$args = array_merge( $params, $args );

		return $endpoint->call( $args );
	}

	/**
	 * Returns the related posts for a given UUID.
	 *
	 * @since 3.17.0
	 *
	 * @link https://docs.parse.ly/content-recommendations/#h-get-related
	 *
	 * @param string              $uuid The UUID of the user.
	 * @param array<string,mixed> $params The parameters to pass to the API request.
	 * @return array<mixed>|WP_Error Returns the related posts or a WP_Error object in case of an error.
	 */
	public function get_related_posts_with_uuid( string $uuid, array $params = array() ) {
		/** @var Endpoints\Endpoint_Related $endpoint */
		$endpoint = $this->get_endpoint( '/related' );

		$args = array(
			'uuid' => $uuid,
		);

		// Merge the optional params.
		$args = array_merge( $params, $args );

		return $endpoint->call( $args );
	}

	/**
	 * Returns the posts analytics.
	 *
	 * @since 3.17.0
	 *
	 * @link https://docs.parse.ly/api-analytics-endpoint/#1-get-analytics-posts
	 *
	 * @param array<string,mixed|array<string,mixed>> $params The parameters to pass to the API request.
	 * @return array<mixed>|WP_Error Returns the posts analytics or a WP_Error object in case of an error.
	 */
	public function get_posts( array $params = array() ) {
		/** @var Endpoints\Endpoint_Analytics_Posts $endpoint */
		$endpoint = $this->get_endpoint( '/analytics/posts' );

		return $endpoint->call( $params );
	}

	/**
	 * Validates the Parse.ly API credentials.
	 *
	 * The API will return a 200 response if the credentials are valid and a 401 response if they are not.
	 *
	 * @since 3.17.0
	 *
	 * @param string $api_key The API key to validate.
	 * @param string $secret_key The secret key to validate.
	 * @return bool|WP_Error Returns true if the credentials are valid, false otherwise.
	 */
	public function validate_credentials( string $api_key, string $secret_key ) {
		/** @var Endpoints\Endpoint_Validate $endpoint */
		$endpoint = $this->get_endpoint( '/validate/secret' );

		$args = array(
			'apikey' => $api_key,
			'secret' => $secret_key,
		);

		$response = $endpoint->call( $args );

		if ( is_wp_error( $response ) ) {
			/** @var WP_Error $response */
			return $response;
		}

		if ( true === $response['success'] ) {
			return true;
		}

		return false;
	}
}
