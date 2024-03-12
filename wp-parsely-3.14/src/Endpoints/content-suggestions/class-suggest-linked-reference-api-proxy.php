<?php
/**
 * Endpoints: Parse.ly Content Suggestions `/suggest-linked-reference` API proxy endpoint
 * class
 *
 * @package Parsely
 * @since   3.14.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\ContentSuggestions;

use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Parsely;
use Parsely\RemoteAPI\ContentSuggestions\Suggest_Linked_Reference_API;
use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/content-suggestions/suggest-linked-reference` REST API endpoint.
 *
 * @since 3.14.0
 */
final class Suggest_Linked_Reference_API_Proxy extends Base_API_Proxy {
	/**
	 * The Suggest Linked Reference API instance.
	 *
	 * @var Suggest_Linked_Reference_API $suggest_linked_reference_api
	 */
	private $suggest_linked_reference_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.14.0
	 *
	 * @param Parsely $parsely The Parsely plugin instance.
	 */
	public function __construct( Parsely $parsely ) {
		$this->suggest_linked_reference_api = new Suggest_Linked_Reference_API( $parsely );
		parent::__construct( $parsely, $this->suggest_linked_reference_api );
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.14.0
	 */
	public function run(): void {
		$this->register_endpoint( '/content-suggestions/suggest-linked-reference', array( 'POST' ) );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.14.0
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( $response ): array {
		// Unused function.
		return $response;
	}

	/**
	 * Cached "proxy" to the Parse.ly API endpoint.
	 *
	 * @since 3.14.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error
	 *                           object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		$validation = $this->validate_apikey_and_secret();
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		/**
		 * The post content to be sent to the API.
		 *
		 * @var string|null $post_content
		 */
		$post_content = $request->get_param( 'content' );

		/**
		 * The maximum amount of words of the link text.
		 *
		 * @var string|null $max_link_words
		 */
		$max_link_words = $request->get_param( 'max_link_words' );

		/**
		 * The maximum number of links to return.
		 *
		 * @var string|null $max_links
		 */
		$max_links = $request->get_param( 'max_links' );

		if ( null === $post_content ) {
			return new WP_Error(
				'parsely_content_not_set',
				__( 'A post content must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( is_numeric( $max_link_words ) ) {
			$max_link_words = (int) $max_link_words;
		} else {
			$max_link_words = 4;
		}

		if ( is_numeric( $max_links ) ) {
			$max_links = (int) $max_links;
		} else {
			$max_links = 10;
		}

		$response = $this->suggest_linked_reference_api->get_links(
			$post_content,
			$max_link_words,
			$max_links
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return (object) array(
			'data' => $response,
		);
	}
}
