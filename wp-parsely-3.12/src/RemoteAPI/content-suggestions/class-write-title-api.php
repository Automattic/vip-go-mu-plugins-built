<?php
/**
 * Remote API: Content Suggestions Write Title API
 *
 * @package Parsely
 * @since 3.12.0
 */

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Parsely;
use WP_Error;

/**
 * Class for Content Suggestions Write Title API.
 *
 * @since 3.12.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Write_Title_API extends Content_Suggestions_Base_API {
	protected const ENDPOINT     = '/write-title';
	protected const QUERY_FILTER = 'wp_parsely_write_title_endpoint_args';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.12.0
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Gets the URL for the Parse.ly API credentials validation endpoint.
	 *
	 * @since 3.12.0
	 *
	 * @param  string $content The query arguments to send to the remote API.
	 * @param  int    $limit The query arguments to send to the remote API.
	 * @return array<string>|WP_Error The response from the remote API, or a WP_Error
	 *                                object if the response is an error.
	 */
	public function get_titles( string $content, int $limit ) {
		$query = array(
			'persona' => 'journalist',
			'style'   => 'neutral',
			'limit'   => $limit,
		);

		$full_api_url = $this->get_api_url( $query );

		/**
		 * GET request options.
		 *
		 * @var WP_HTTP_Request_Args $options
		 */
		$options         = $this->get_request_options();
		$options['body'] = wp_json_encode( array( 'text' => $content ) );

		if ( false === $options['body'] ) {
			return new WP_Error( 400, __( 'Unable to encode request body', 'wp-parsely' ) );
		}

		$response = wp_safe_remote_post( $full_api_url, $options );
		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body );

		if ( ! is_object( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		if ( ! property_exists( $decoded, 'titles' ) ) {
			$error = $response['response'];

			return new WP_Error( $error['code'], $error['message'] );
		}

		if ( ! is_array( $decoded->titles ) ) {
			return new WP_Error( 400, __( 'Unable to parse titles from upstream API', 'wp-parsely' ) );
		}

		return $decoded->titles;
	}
}
