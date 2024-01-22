<?php
/**
 * Remote API: Content Suggestions Suggest Meta Description API
 *
 * @package Parsely
 * @since 3.13.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Parsely;
use WP_Error;

/**
 * Class for Content Suggestions Suggest Meta Description API.
 *
 * @since 3.13.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Suggest_Meta_Description_API extends Content_Suggestions_Base_API {
	protected const ENDPOINT     = '/suggest-meta-description';
	protected const QUERY_FILTER = 'wp_parsely_suggest_meta_description_endpoint_args';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.13.0
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Gets the meta description for a given content using the Parse.ly
	 * Content Suggestion API.
	 *
	 * @since 3.13.0
	 *
	 * @param string $title   The title of the content.
	 * @param string $content The query arguments to send to the remote API.
	 * @return string|WP_Error The response from the remote API, or a WP_Error
	 *                                object if the response is an error.
	 */
	public function get_suggestion( string $title, string $content ) {
		$query = array(
			'title' => $title,
		);

		$decoded = $this->post_request( $query, array( 'content' => $content ) );

		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		if ( ! property_exists( $decoded, 'meta_description' ) ||
			! is_string( $decoded->meta_description ) ) {
			return new WP_Error( 400, __( 'Unable to parse meta description from upstream API', 'wp-parsely' ) );
		}

		return $decoded->meta_description;
	}
}
