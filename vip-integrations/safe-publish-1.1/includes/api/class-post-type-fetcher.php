<?php
/**
 * Post Type Fetcher class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Validators\URL_Validator;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Post Type Fetcher Class.
 *
 * Fetches catalog-eligible post types from source WordPress sites. The
 * source's `/catalog/post-types` endpoint owns the filter, so this class
 * just relays the response.
 */
class Post_Type_Fetcher {

	/**
	 * HTTP Client instance.
	 *
	 * @var HTTP_Client
	 */
	private HTTP_Client $http_client;

	/**
	 * Constructs the Post_Type_Fetcher instance.
	 *
	 * @param HTTP_Client $http_client HTTP client for making requests.
	 */
	public function __construct( HTTP_Client $http_client ) {
		$this->http_client = $http_client;
	}

	/**
	 * Fetches catalog-eligible post types from the source site.
	 *
	 * @param string $source_site_url  Source site URL.
	 * @param array  $auth_credentials Optional. Authentication credentials array. Default empty array.
	 * @return array|WP_Error List of catalog-eligible post types or error.
	 */
	public function fetch_post_types( string $source_site_url, array $auth_credentials = array() ): array|WP_Error {
		// Validate URL first.
		if ( ! URL_Validator::is_valid_external_url( $source_site_url ) ) {
			return new WP_Error(
				'invalid_url',
				__( 'Invalid URL provided.', 'safe-publish' )
			);
		}

		// Build URL for the source's catalog-eligible post types. We hit the
		// safe-publish catalog endpoint (not wp/v2/types) so the source is
		// authoritative about which types the catalog can actually serve —
		// otherwise the dropdown would list back-office types that 400 when
		// selected.
		$api_url = trailingslashit( $source_site_url )
			. 'wp-json/safe-publish/v1/catalog/post-types';

		$response = $this->http_client->make_request(
			$api_url,
			Request_Actions::LIST_ITEMS,
			$auth_credentials
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$response_body   = wp_remote_retrieve_body( $response );
		$post_types_data = json_decode( $response_body, true );

		if ( is_array( $post_types_data ) && isset( $post_types_data['code'] ) ) {
			return new WP_Error(
				'api_error',
				$post_types_data['message'] ?? __( 'Unknown API error occurred.', 'safe-publish' )
			);
		}

		if ( ! is_array( $post_types_data ) || array() === $post_types_data ) {
			$error_msg = sprintf(
				/* translators: %s: Response body snippet */
				__( 'No post types found. Response: %s', 'safe-publish' ),
				substr( $response_body, 0, 200 ) . ( strlen( $response_body ) > 200 ? '…' : '' )
			);
			return new WP_Error(
				'no_post_types',
				$error_msg
			);
		}

		// Source filtered + shaped already; pass through.
		return $post_types_data;
	}
}
