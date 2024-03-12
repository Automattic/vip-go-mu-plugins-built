<?php
/**
 * Remote API: Content Suggestions Suggest Headline API
 *
 * @package Parsely
 * @since 3.12.0
 */

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Parsely;
use WP_Error;

/**
 * Class for Content Suggestions Suggest Headline API.
 *
 * @since 3.12.0
 * @since 3.14.0 Renamed from Write_Title_API to Suggest_Headline_API.
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Suggest_Headline_API extends Content_Suggestions_Base_API {
	protected const ENDPOINT     = '/suggest-headline';
	protected const QUERY_FILTER = 'wp_parsely_suggest_headline_endpoint_args';

	/**
	 * Generates titles for a given content using the Parse.ly
	 * Content Suggestion API.
	 *
	 * @since 3.12.0
	 *
	 * @param  string $content The content to generate titles for.
	 * @param  int    $limit The number of titles to generate.
	 * @param  string $persona The persona to use when generating titles.
	 * @param  string $tone The tone to use when generating titles.
	 * @return array<string>|WP_Error The response from the remote API, or a WP_Error
	 *                                object if the response is an error.
	 */
	public function get_titles(
		string $content,
		int $limit,
		string $persona = 'journalist',
		string $tone = 'neutral'
	) {
		$body = array(
			'output_config' => array(
				'persona'   => $persona,
				'style'     => $tone,
				'max_items' => $limit,
			),
			'text'          => $content,
		);

		$decoded = $this->post_request( array(), $body );

		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		if ( ! property_exists( $decoded, 'result' ) || ! is_array( $decoded->result ) ) {
			return new WP_Error(
				400,
				__( 'Unable to parse titles from upstream API', 'wp-parsely' )
			);
		}

		return $decoded->result;
	}
}
