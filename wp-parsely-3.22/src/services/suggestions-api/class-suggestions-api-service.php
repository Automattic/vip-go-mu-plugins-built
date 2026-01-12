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
 * @phpstan-import-type Endpoint_Suggest_Brief_Options from Endpoints\Endpoint_Suggest_Brief
 * @phpstan-import-type Endpoint_Suggest_Headline_Options from Endpoints\Endpoint_Suggest_Headline
 * @phpstan-import-type Endpoint_Suggest_Linked_Reference_Options from Endpoints\Endpoint_Suggest_Linked_Reference
 * @phpstan-import-type Endpoint_Suggest_Inbound_Links_Options from Endpoints\Endpoint_Suggest_Inbound_Links
 * @phpstan-import-type Endpoint_Suggest_Inbound_Link_Positions_Options from Endpoints\Endpoint_Suggest_Inbound_Link_Positions
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
		return 'https://suggestions-api.parsely.com';
	}

	/**
	 * Registers the endpoints for the service.
	 *
	 * @since 3.17.0
	 */
	protected function register_endpoints(): void {
		$endpoints = array(
			new Endpoints\Endpoint_Check_Auth( $this ),
			new Endpoints\Endpoint_Suggest_Brief( $this ),
			new Endpoints\Endpoint_Suggest_Headline( $this ),
			new Endpoints\Endpoint_Suggest_Linked_Reference( $this ),
			new Endpoints\Endpoint_Suggest_Inbound_Links( $this ),
			new Endpoints\Endpoint_Suggest_Inbound_Link_Positions( $this ),
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
	 * Gets the Site ID's authorization status for the Suggestions API or
	 * Suggestions API feature.
	 *
	 * @since 3.19.0
	 *
	 * @param array<mixed> $options The options to pass to the API request.
	 * @return array<mixed>|WP_Error The response from the remote API, or a WP_Error
	 *                         object if the response is an error.
	 */
	public function get_check_auth( array $options ) {
		/** @var Endpoints\Endpoint_Check_Auth $endpoint */
		$endpoint = $this->get_endpoint( '/check-auth' );

		return $endpoint->get_check_auth_result( $options );
	}

	/**
	 * Gets suggested smart links for the given content.
	 *
	 * @since 3.14.0
	 * @since 3.17.0 Updated to use the new API service.
	 *
	 * @param string                                    $content             The content to generate links for.
	 * @param Endpoint_Suggest_Linked_Reference_Options $options             The options to pass to the API request.
	 *
	 * @return array<Smart_Link>|WP_Error The response from the remote API, or a WP_Error
	 *                                    object if the response is an error.
	 */
	public function get_smart_links( string $content, $options = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Linked_Reference $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-linked-reference' );

		return $endpoint->get_links( $content, $options );
	}

	/**
	 * Gets suggested inbound links for the given URL.
	 *
	 * @since 3.19.0
	 *
	 * @param \WP_Post                               $post    The post to get inbound link suggestions for.
	 * @param Endpoint_Suggest_Inbound_Links_Options $options The options to pass to the API request.
	 * @return array<\Parsely\Models\Inbound_Smart_Link>|WP_Error The response from the remote API, or a WP_Error
	 *                                                            object if the response is an error.
	 */
	public function get_inbound_links( \WP_Post $post, $options = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Inbound_Links $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-inbound-links' );

		return $endpoint->get_inbound_links( $post, $options );
	}

	/**
	 * Gets suggested inbound link positions for the given source and destination posts.
	 *
	 * @since 3.19.0
	 *
	 * @param \WP_Post                                        $source_post    The source post to get inbound link positions for.
	 * @param \WP_Post                                        $destination_post The destination post to get inbound link positions for.
	 * @param Endpoint_Suggest_Inbound_Link_Positions_Options $options The options to pass to the API request.
	 * @return \Parsely\Models\Inbound_Smart_Link[]|WP_Error The response from the remote API, or a WP_Error
	 *                                                            object if the response is an error.
	 */
	public function get_inbound_link_positions( \WP_Post $source_post, \WP_Post $destination_post, $options = array() ) {
		/** @var Endpoints\Endpoint_Suggest_Inbound_Link_Positions $endpoint */
		$endpoint = $this->get_endpoint( '/suggest-inbound-link-positions' );

		return $endpoint->get_inbound_link_positions( $source_post, $destination_post, $options );
	}
}
