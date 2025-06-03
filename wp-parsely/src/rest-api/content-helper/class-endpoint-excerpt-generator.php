<?php
/**
 * Endpoint: Excerpt Suggestions
 * Parse.ly Content Helper `/excerpt-generator` API endpoint class
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper;

use Parsely\REST_API\Base_Endpoint;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Excerpt Suggestions API.
 *
 * Provides an endpoint for generating excerpts for the given content.
 *
 * @since 3.17.0
 */
class Endpoint_Excerpt_Generator extends Base_Endpoint {
	use Content_Helper_Feature;

	/**
	 * The Suggestions API service.
	 *
	 * @since 3.17.0
	 *
	 * @var Suggestions_API_Service $suggestions_api
	 */
	protected $suggestions_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.17.0
	 *
	 * @param Content_Helper_Controller $controller The content helper controller.
	 */
	public function __construct( Content_Helper_Controller $controller ) {
		parent::__construct( $controller );
		$this->suggestions_api = $controller->get_parsely()->get_suggestions_api();
	}

	/**
	 * Returns the name of the endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The endpoint name.
	 */
	public static function get_endpoint_name(): string {
		return 'excerpt-generator';
	}

	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The feature name.
	 */
	public function get_pch_feature_name(): string {
		return 'excerpt_suggestions';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * POST /excerpt-generator/generate
		 * Generates an excerpt for the given content.
		 */
		$this->register_rest_route(
			'generate',
			array( 'POST' ),
			array( $this, 'generate_excerpt' ),
			array(
				'text'           => array(
					'description' => __( 'The text to generate the excerpt from.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => true,
				),
				'title'          => array(
					'description' => __( 'The title of the content.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => true,
				),
				'persona'        => array(
					'description' => __( 'The persona to use for the suggestion.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
					'default'     => 'journalist',
				),
				'style'          => array(
					'description' => __( 'The style to use for the suggestion.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
					'default'     => 'neutral',
				),
				'max_items'      => array(
					'description' => __( 'The maximum number of items to generate.', 'wp-parsely' ),
					'type'        => 'integer',
					'required'    => false,
					'default'     => 1,
				),
				'max_characters' => array(
					'description' => __( 'The maximum number of characters to generate.', 'wp-parsely' ),
					'type'        => 'integer',
					'required'    => false,
					'default'     => 160,
				),
			)
		);
	}

	/**
	 * API Endpoint: POST /excerpt-generator/generate
	 *
	 * Generates an excerpt for the passed content.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function generate_excerpt( WP_REST_Request $request ) {
		/**
		 * The post content to be sent to the API.
		 *
		 * @var string $post_content
		 */
		$post_content = $request->get_param( 'text' );

		/**
		 * The post title to be sent to the API.
		 *
		 * @var string $post_title
		 */
		$post_title = $request->get_param( 'title' );

		/**
		 * The persona to be sent to the API.
		 *
		 * @var string $persona
		 */
		$persona = $request->get_param( 'persona' );

		/**
		 * The style to be sent to the API.
		 *
		 * @var string $style
		 */
		$style = $request->get_param( 'style' );

		/**
		 * The maximum number of items to generate.
		 *
		 * @var int $max_items
		 */
		$max_items = $request->get_param( 'max_items' );

		/**
		 * The maximum number of characters to generate.
		 *
		 * @var int $max_characters
		 */
		$max_characters = $request->get_param( 'max_characters' );

		$response = $this->suggestions_api->get_brief_suggestions(
			$post_title,
			$post_content,
			array(
				'persona'        => $persona,
				'style'          => $style,
				'max_items'      => $max_items,
				'max_characters' => $max_characters,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		// TODO: For now, only return the first suggestion. When the UI is ready to handle multiple suggestions, we can return the entire array.
		$response = $response[0] ?? '';
		return new WP_REST_Response( array( 'data' => $response ), 200 );
	}
}
