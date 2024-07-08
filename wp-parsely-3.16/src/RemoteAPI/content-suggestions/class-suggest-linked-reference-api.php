<?php
/**
 * Remote API: Content Suggestions Suggest Linked Reference (Smart Links) API
 *
 * @package Parsely
 * @since   3.14.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI\ContentSuggestions;

use Parsely\Models\Smart_Link;
use Parsely\Parsely;
use WP_Error;

/**
 * Class for Content Suggestions Suggest Linked Reference (Smart Links) API.
 *
 * @since 3.14.0
 *
 * @phpstan-import-type WP_HTTP_Request_Args from Parsely
 */
class Suggest_Linked_Reference_API extends Content_Suggestions_Base_API {
	protected const ENDPOINT     = '/suggest-linked-reference';
	protected const QUERY_FILTER = 'wp_parsely_suggest_linked_reference_endpoint_args';

	/**
	 * Gets suggested smart links for the given content.
	 *
	 * @since 3.14.0
	 *
	 * @param string   $content             The content to generate links for.
	 * @param int      $max_link_words      The maximum number of words in links.
	 * @param int      $max_links           The maximum number of links to return.
	 * @param string[] $url_exclusion_list  A list of URLs to exclude from the suggestions.
	 *
	 * @return Smart_Link[]|WP_Error The response from the remote API, or a WP_Error
	 *                                    object if the response is an error.
	 */
	public function get_links(
		string $content,
		int $max_link_words = 4,
		int $max_links = 10,
		array $url_exclusion_list = array()
	) {
		$body = array(
			'output_config' => array(
				'max_link_words' => $max_link_words,
				'max_items'      => $max_links,
			),
			'text'          => wp_strip_all_tags( $content ),
		);

		if ( count( $url_exclusion_list ) > 0 ) {
			$body['url_exclusion_list'] = $url_exclusion_list;
		}

		$decoded = $this->post_request( array(), $body );

		if ( is_wp_error( $decoded ) ) {
			return $decoded;
		}

		if ( ! property_exists( $decoded, 'result' ) ||
			! is_array( $decoded->result ) ) {
			return new WP_Error(
				400,
				__( 'Unable to parse suggested links from upstream API', 'wp-parsely' )
			);
		}

		// Convert the links to Smart_Link objects.
		$links = array();
		foreach ( $decoded->result as $link ) {
			$link     = apply_filters( 'wp_parsely_suggest_linked_reference_link', $link );
			$link_obj = new Smart_Link(
				esc_url( $link->canonical_url ),
				esc_attr( $link->title ),
				wp_kses_post( $link->text ),
				$link->offset
			);
			$links[]  = $link_obj;
		}

		return $links;
	}
}
