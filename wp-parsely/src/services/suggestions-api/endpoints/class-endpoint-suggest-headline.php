<?php
/**
 * Parse.ly Suggestions API Endpoint: Suggest Headline
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use WP_Error;

/**
 * The endpoint for the /suggest-headline API request.
 *
 * @since 3.17.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs#/default/suggest_headline_suggest_headline_post
 *
 * @phpstan-type Traffic_Source = array{
 *     source: string,
 *     weight: float
 * }
 *
 * @phpstan-type Endpoint_Suggest_Headline_Options = array{
 *     persona?: string,
 *     style?: string,
 *     blending_weight?: float,
 *     max_items?: int,
 *     traffic_sources?: array<int, Traffic_Source>
 * }
 */
class Endpoint_Suggest_Headline extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/suggest-headline';
	}

	/**
	 * Gets titles (headlines) for a given content using the Parse.ly Content
	 * Suggestion API.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Updated to use the new API service.
	 *
	 * @param string                            $content The query arguments to send to the remote API.
	 * @param Endpoint_Suggest_Headline_Options $options The options to pass to the API request.
	 * @return array<string>|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_headlines(
		string $content,
		$options = array()
	) {
		$request_body = array(
			'output_config' => array(
				'persona'   => $options['persona'] ?? 'journalist',
				'style'     => $options['style'] ?? 'neutral',
				'max_items' => $options['max_items'] ?? 1,
			),
			'text'          => wp_strip_all_tags( $content ),
		);

		/** @var array<string>|WP_Error $response */
		$response = $this->request( 'POST', array(), $request_body );

		return $response;
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
		/** @var string $title */
		$title = $args['title'] ?? '';
		/** @var string $content */
		$content = $args['content'] ?? '';
		/** @var Endpoint_Suggest_Headline_Options $options */
		$options = $args['options'] ?? array();

		return $this->get_headlines( $content, $options );
	}
}
