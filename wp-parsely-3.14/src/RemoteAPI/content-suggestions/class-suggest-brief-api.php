<?php
/**
 * Remote API: Content Suggestions Suggest Brief API
 *
 * @package Parsely
 * @since 3.13.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Parsely;
use WP_Error;

/**
 * Class for Content Suggestions Suggest Brief API.
 * This class is used to get the meta description for a given content.
 *
 * @since 3.13.0
 * @since 3.14.0 Renamed from Suggest_Meta_Description_API to Suggest_Brief_API.
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Suggest_Brief_API extends Content_Suggestions_Base_API {
	protected const ENDPOINT     = '/suggest-brief';
	protected const QUERY_FILTER = 'wp_parsely_suggest_brief_endpoint_args';

	/**
	 * Gets the first brief (meta description) for a given content using the
	 * Parse.ly Content Suggestion API.
	 *
	 * @since 3.13.0
	 *
	 * @param string $title   The title of the content.
	 * @param string $content The query arguments to send to the remote API.
	 * @param string $persona The persona to use for the suggestion.
	 * @param string $style   The style to use for the suggestion.
	 * @return string|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_suggestion(
		string $title,
		string $content,
		string $persona = 'journalist',
		string $style = 'neutral'
	) {
		$body = array(
			'output_config' => array(
				'persona' => $persona,
				'style'   => $style,
			),
			'title'         => $title,
			'text'          => $content,
		);

		$decoded = $this->post_request( array(), $body );

		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		if ( ! property_exists( $decoded, 'result' ) ||
			! is_string( $decoded->result[0] ) ) {
			return new WP_Error(
				400,
				__( 'Unable to parse meta description from upstream API', 'wp-parsely' )
			);
		}

		return $decoded->result[0];
	}
}
