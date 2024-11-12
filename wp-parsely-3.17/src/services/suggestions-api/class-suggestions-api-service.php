<?php
/**
 * Parse.ly Suggestions API service class.
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\Services\Suggestions_API;

use Parsely\Models\Smart_Link;
use Parsely\Services\Base_API_Service;
use WP_Error;

/**
 * The service for the Suggestions API.
 *
 * @since 3.17.0
 *
 * @link https://content-suggestions-api.parsely.net/prod/docs
 *
 * @phpstan-import-type Endpoint_Suggest_Brief_Options from Endpoints\Endpoint_Suggest_Brief
 * @phpstan-import-type Endpoint_Suggest_Headline_Options from Endpoints\Endpoint_Suggest_Headline
 * @phpstan-import-type Endpoint_Suggest_Linked_Reference_Options from Endpoints\Endpoint_Suggest_Linked_Reference
 */
class Suggestions_API_Service extends Base_API_Service {
	/**
	 * Returns the base URL for the API service.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_base_url(): string {
		return 'https://content-suggestions-api.parsely.net/prod';
	}

	/**
	 * Registers the endpoints for the service.
	 *
	 * @since 3.17.0
	 */
	protected function register_endpoints(): void {
		$endpoints = array(
			new Endpoints\Endpoint_Suggest_Brief( $this ),
			new Endpoints\Endpoint_Suggest_Headline( $this ),
			new Endpoints\Endpoint_Suggest_Linked_Reference( $this ),
		);

		foreach ( $endpoints as $endpoint ) {
			$this->register_endpoint( $endpoint );
		}
	}

	/**
	 * Gets the first brief (meta description) for a given content using the
	 * Parse.ly Content Suggestion API.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Updated to use the new API service.
	 *
	 * @param string                         $title   The title of the content.
	 * @param string                         $content The query arguments to send to the remote API.
	 * @param Endpoint_Suggest_Brief_Options $options The options to pass to the API request.
	 * @return array<string>|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_brief_suggestions( string $title, string $content, $options = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Brief $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-brief' );

		return $endpoint->get_suggestion( $title, $content, $options );
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
	public function get_title_suggestions( string $content, $options = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Headline $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-headline' );

		return $endpoint->get_headlines( $content, $options );
	}

	/**
	 * Gets suggested smart links for the given content.
	 *
	 * @since 3.14.0
	 * @since 3.17.0 Updated to use the new API service.
	 *
	 * @param string                                    $content             The content to generate links for.
	 * @param Endpoint_Suggest_Linked_Reference_Options $options             The options to pass to the API request.
	 * @param array<string>                             $url_exclusion_list  A list of URLs to exclude from the suggestions.
	 *
	 * @return array<Smart_Link>|WP_Error The response from the remote API, or a WP_Error
	 *                                    object if the response is an error.
	 */
	public function get_smart_links( string $content, $options = array(), array $url_exclusion_list = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Linked_Reference $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-linked-reference' );

		return $endpoint->get_links( $content, $options, $url_exclusion_list );
	}
}
