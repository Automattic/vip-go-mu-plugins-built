<?php
/**
 * Parse.ly Suggestions API Endpoint: Suggest Brief
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API\Endpoints;

use WP_Error;

/**
 * The endpoint for the /suggest-brief API request.
 *
 * @since 3.17.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs#/default/suggest_brief_suggest_brief_post
 *
 * @phpstan-type Endpoint_Suggest_Brief_Options = array{
 *     persona?: string,
 *     style?: string,
 *     max_characters?: int,
 *     max_items?: int,
 * }
 */
class Endpoint_Suggest_Brief extends Suggestions_API_Base_Endpoint {
	/**
	 * Returns the endpoint for the API request.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint for the API request.
	 */
	public function get_endpoint(): string {
		return '/suggest-brief';
	}

	/**
	 * Gets the first brief (meta description) for a given content using the
	 * Parse.ly Content Suggestion API.
	 *
	 * @since 3.13.0
	 *
	 * @param string                         $title   The title of the content.
	 * @param string                         $content The query arguments to send to the remote API.
	 * @param Endpoint_Suggest_Brief_Options $options The options to pass to the API request.
	 * @return array<string>|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_suggestion(
		string $title,
		string $content,
		$options = array()
	) {
		$request_body = array(
			'output_config' => array(
				'persona'        => $options['persona'] ?? 'journalist',
				'style'          => $options['style'] ?? 'neutral',
				'max_characters' => $options['max_characters'] ?? 160,
				'max_items'      => $options['max_items'] ?? 1,
			),
			'title'         => $title,
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
		/** @var Endpoint_Suggest_Brief_Options $options */
		$options = $args['options'] ?? array();

		return $this->get_suggestion( $title, $content, $options );
	}
}
