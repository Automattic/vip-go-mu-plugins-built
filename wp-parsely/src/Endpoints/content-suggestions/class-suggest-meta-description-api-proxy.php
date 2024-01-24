<?php
/**
 * Endpoints: Parse.ly Content Suggestion `/suggest-meta-description` API proxy endpoint
 * class
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\ContentSuggestions;

use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Parsely;
use Parsely\RemoteAPI\ContentSuggestions\Suggest_Meta_Description_API;
use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/content-suggestions/suggest-meta-description` REST API endpoint.
 *
 * @since 3.13.0
 */
final class Suggest_Meta_Description_API_Proxy extends Base_API_Proxy {

	/**
	 * The Write Title API instance.
	 *
	 * @var Suggest_Meta_Description_API $suggest_meta_description_api
	 */
	private $suggest_meta_description_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.13.0
	 *
	 * @param Parsely $parsely The Parsely plugin instance.
	 */
	public function __construct( Parsely $parsely ) {
		$this->suggest_meta_description_api = new Suggest_Meta_Description_API( $parsely );
		parent::__construct( $parsely, $this->suggest_meta_description_api );
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.13.0
	 */
	public function run(): void {
		$this->register_endpoint( '/content-suggestions/suggest-meta-description' );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.13.0
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
	 * @since 3.13.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
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
		 * The post title to be sent to the API.
		 *
		 * @var string|null $post_title
		 */
		$post_title = $request->get_param( 'title' );

		if ( null === $post_content ) {
			return new WP_Error(
				'parsely_content_not_set',
				__( 'A post content must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( null === $post_title ) {
			return new WP_Error(
				'parsely_title_not_set',
				__( 'A post title must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		$response = $this->suggest_meta_description_api->get_suggestion( $post_title, $post_content );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return (object) array(
			'data' => $response,
		);
	}
}
