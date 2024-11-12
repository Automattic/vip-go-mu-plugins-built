<?php
/**
 * Parse.ly Suggestions API Endpoint: Suggest Linked Reference
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use Parsely\Models\Smart_Link;
use WP_Error;

/**
 * The endpoint for the Suggest Linked Reference (Smart Links) API request.
 *
 * @since 3.17.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs#/default/suggest_linked_reference_suggest_linked_reference_post
 *
 * @phpstan-type Traffic_Source = array{
 *     source: string,
 *     weight: float
 * }
 *
 * @phpstan-type Endpoint_Suggest_Linked_Reference_Options = array{
 *     blending_weight?: float,
 *     max_items?: int,
 *     max_link_words?: int,
 *     traffic_sources?: array<int, Traffic_Source>
 * }
 */
class Endpoint_Suggest_Linked_Reference extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/suggest-linked-reference';
	}

	/**
	 * Gets suggested smart links for the given content using the Parse.ly
	 * Content Suggestion API.
	 *
	 * @since 3.14.0
	 * @since 3.17.0 Updated to use the new API service.
	 *
	 * @param string                                    $content             The content to generate links for.
	 * @param Endpoint_Suggest_Linked_Reference_Options $options The options to pass to the API request.
	 * @param array<string>                             $url_exclusion_list  A list of URLs to exclude from the suggestions.
	 * @return array<Smart_Link>|WP_Error The response from the remote API, or a WP_Error
	 *                                    object if the response is an error.
	 */
	public function get_links(
		string $content,
		$options = array(),
		array $url_exclusion_list = array()
	) {
		$request_body = array(
			'output_config' => array(
				'max_link_words' => $options['max_link_words'] ?? 4,
				'max_items'      => $options['max_items'] ?? 10,
			),
			'text'          => wp_strip_all_tags( $content ),
		);

		if ( count( $url_exclusion_list ) > 0 ) {
			$request_body['url_exclusion_list'] = $url_exclusion_list;
		}

		$response = $this->request( 'POST', array(), $request_body );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// Convert the links to Smart_Link objects.
		$links = array();
		foreach ( $response as $link ) {
			$link     = apply_filters( 'wp_parsely_suggest_linked_reference_link', $link );
			$link_obj = new Smart_Link(
				esc_url( $link['canonical_url'] ),
				esc_attr( $link['title'] ),
				wp_kses_post( $link['text'] ),
				$link['offset']
			);
			$links[]  = $link_obj;
		}

		return $links;
	}

	/**
	 * Executes the API request.
	 *
	 * @since 3.17.0
	 *
	 * @param array<mixed> $args The arguments to pass to the API request.
	 * @return WP_Error|array<mixed> The response from the API.
	 */
	public function call( array $args = array() ) {
		/** @var string $content */
		$content = $args['content'] ?? '';
		/** @var Endpoint_Suggest_Linked_Reference_Options $options */
		$options = $args['options'] ?? array();
		/** @var string[] $url_exclusion_list */
		$url_exclusion_list = $args['url_exclusion_list'] ?? array();

		return $this->get_links( $content, $options, $url_exclusion_list );
	}
}
