<?php
/**
 * Endpoint: Smart Linking
 * Parse.ly Content Helper `/smart-linking` API endpoint class
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper;

use Parsely\Models\Smart_Link;
use Parsely\REST_API\Base_Endpoint;
use Parsely\REST_API\Use_Post_ID_Parameter_Trait;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Smart Linking API.
 *
 * Provides an endpoint for generating smart links for the given content.
 *
 * @since 3.17.0
 */
class Endpoint_Smart_Linking extends Base_Endpoint {
	use Content_Helper_Feature;
	use Use_Post_ID_Parameter_Trait;

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
		return 'smart-linking';
	}

	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The feature name.
	 */
	public function get_pch_feature_name(): string {
		return 'smart_linking';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * GET /smart-linking/generate
		 * Generates smart links for a post.
		 */
		$this->register_rest_route(
			'generate',
			array( 'POST' ),
			array( $this, 'generate_smart_links' ),
			array(
				'text'               => array(
					'required'    => true,
					'type'        => 'string',
					'description' => __( 'The text to generate smart links for.', 'wp-parsely' ),
				),
				'max_links'          => array(
					'type'        => 'integer',
					'description' => __( 'The maximum number of smart links to generate.', 'wp-parsely' ),
					'default'     => 10,
				),
				'url_exclusion_list' => array(
					'type'              => 'array',
					'description'       => __( 'The list of URLs to exclude from the smart links.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_url_exclusion_list' ),
					'default'           => array(),
				),
			)
		);

		/**
		 * GET /smart-linking/{post_id}/get
		 * Gets the smart links for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/get',
			array( 'GET' ),
			array( $this, 'get_smart_links' )
		);

		/**
		 * POST /smart-linking/{post_id}/add
		 * Adds a smart link to a post.
		 */
		$this->register_rest_route_with_post_id(
			'/add',
			array( 'POST' ),
			array( $this, 'add_smart_link' ),
			array(
				'link'   => array(
					'required'          => true,
					'type'              => 'object',
					'description'       => __( 'The smart link data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_smart_link_params' ),
				),
				'update' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to update the existing smart link.', 'wp-parsely' ),
					'default'     => false,
				),
			)
		);

		/**
		 * POST /smart-linking/{post_id}/add-multiple
		 * Adds multiple smart links to a post.
		 */
		$this->register_rest_route_with_post_id(
			'/add-multiple',
			array( 'POST' ),
			array( $this, 'add_multiple_smart_links' ),
			array(
				'links'  => array(
					'required'          => true,
					'type'              => 'array',
					'description'       => __( 'The multiple smart links data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_multiple_smart_links' ),
				),
				'update' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to update the existing smart links.', 'wp-parsely' ),
					'default'     => false,
				),
			)
		);

		/**
		 * POST /smart-linking/{post_id}/set
		 * Updates the smart links of a given post and removes the ones that are not in the request.
		 */
		$this->register_rest_route_with_post_id(
			'/set',
			array( 'POST' ),
			array( $this, 'set_smart_links' ),
			array(
				'links' => array(
					'required'          => true,
					'type'              => 'array',
					'description'       => __( 'The smart links data to set.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_multiple_smart_links' ),
				),
			)
		);

		/**
		 * POST /smart-linking/url-to-post-type
		 * Converts a URL to a post type.
		 */
		$this->register_rest_route(
			'url-to-post-type',
			array( 'POST' ),
			array( $this, 'url_to_post_type' )
		);
	}

	/**
	 * API Endpoint: GET /smart-linking/generate.
	 *
	 * Generates smart links for a post.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function generate_smart_links( WP_REST_Request $request ) {
		/**
		 * The text to generate smart links for.
		 *
		 * @var string $post_content
		 */
		$post_content = $request->get_param( 'text' );

		/**
		 * The maximum number of smart links to generate.
		 *
		 * @var int $max_links
		 */
		$max_links = $request->get_param( 'max_links' );

		/**
		 * The URL exclusion list.
		 *
		 * @var array<string> $url_exclusion_list
		 */
		$url_exclusion_list = $request->get_param( 'url_exclusion_list' ) ?? array();

		$response = $this->suggestions_api->get_smart_links(
			$post_content,
			array(
				'max_items' => $max_links,
			),
			$url_exclusion_list
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$smart_links = array_map(
			function ( Smart_Link $link ) {
				return $link->to_array();
			},
			$response
		);

		return new WP_REST_Response( array( 'data' => $smart_links ), 200 );
	}

	/**
	 * API Endpoint: GET /smart-linking/{post_id}/get.
	 *
	 * Gets the smart links for a post.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function get_smart_links( WP_REST_Request $request ): WP_REST_Response {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post = $request->get_param( 'post' );

		$outbound_links = Smart_Link::get_outbound_smart_links( $post->ID );
		$inbound_links  = Smart_Link::get_inbound_smart_links( $post->ID );

		$response = array(
			'outbound' => $this->serialize_smart_links( $outbound_links ),
			'inbound'  => $this->serialize_smart_links( $inbound_links ),
		);

		return new WP_REST_Response( array( 'data' => $response ), 200 );
	}


	/**
	 * API Endpoint: POST /smart-linking/{post_id}/add.
	 *
	 * Adds a smart link to a post.
	 * If the update parameter is set to true, the existing smart link will be updated.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function add_smart_link( WP_REST_Request $request ): WP_REST_Response {
		/**
		 * The Smart Link model.
		 *
		 * @var Smart_Link $smart_link
		 */
		$smart_link    = $request->get_param( 'smart_link' );
		$should_update = $request->get_param( 'update' ) === true;

		if ( $smart_link->exists() && ! $should_update ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'smart_link_exists',
						'message' => __( 'Smart link already exists.', 'wp-parsely' ),
					),
				),
				409 // HTTP Conflict.
			);
		}

		// The smart link properties are set in the validate callback.
		$saved = $smart_link->save();
		if ( ! $saved ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'add_smart_link_failed',
						'message' => __( 'Failed to add the smart link.', 'wp-parsely' ),
					),
				),
				500
			);
		}

		return new WP_REST_Response(
			array(
				'data' => json_decode( $smart_link->serialize() ),
			),
			200
		);
	}

	/**
	 * API Endpoint: POST /smart-linking/{post_id}/add_multiple.
	 *
	 * Adds multiple smart links to a post.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function add_multiple_smart_links( WP_REST_Request $request ): WP_REST_Response {
		/**
		 * Array of Smart Link models.
		 *
		 * @var Smart_Link[] $smart_links
		 */
		$smart_links   = $request->get_param( 'smart_links' );
		$should_update = $request->get_param( 'update' ) === true;

		$added_links   = array();
		$updated_links = array();
		$failed_links  = array();

		foreach ( $smart_links as $smart_link ) {
			if ( $smart_link->exists() && ! $should_update ) {
				$failed_links[] = $smart_link;
				continue;
			}

			$updated_link = $smart_link->exists() && $should_update;

			// The smart link properties are set in the validate callback.
			$saved = $smart_link->save();

			if ( ! $saved ) {
				$failed_links[] = $smart_link;
				continue;
			}

			if ( $updated_link ) {
				$updated_links[] = $smart_link;
			} else {
				$added_links[] = $smart_link;
			}
		}

		// If no link was added, return an error response.
		if ( count( $added_links ) === 0 && count( $updated_links ) === 0 ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'add_smart_link_failed',
						'message' => __( 'Failed to add all the smart links.', 'wp-parsely' ),
					),
				),
				500
			);
		}

		$response = array();
		if ( count( $added_links ) > 0 ) {
			$response['added'] = $this->serialize_smart_links( $added_links );
		}
		if ( count( $failed_links ) > 0 ) {
			$response['failed'] = $this->serialize_smart_links( $failed_links );
		}
		if ( count( $updated_links ) > 0 ) {
			$response['updated'] = $this->serialize_smart_links( $updated_links );
		}

		return new WP_REST_Response( array( 'data' => $response ), 200 );
	}

	/**
	 * API Endpoint: POST /smart-linking/{post_id}/set.
	 *
	 * Updates the smart links of a given post and removes the ones that are not in the request.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function set_smart_links( WP_REST_Request $request ): WP_REST_Response {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post = $request->get_param( 'post' );

		/**
		 * Array of Smart Link models provided in the request.
		 *
		 * @var Smart_Link[] $smart_links
		 */
		$smart_links = $request->get_param( 'smart_links' );

		// Get the current stored smart links.
		$existing_links = Smart_Link::get_outbound_smart_links( $post->ID );
		$removed_links  = array();

		foreach ( $existing_links as $existing_link ) {
			$found = false;
			foreach ( $smart_links as $smart_link ) {
				if ( $smart_link->get_uid() === $existing_link->get_uid() ) {
					$found = true;
					break;
				}
			}

			if ( ! $found ) {
				$removed_links[] = $existing_link;
				$existing_link->delete();
			}
		}

		$saved_links  = array();
		$failed_links = array();

		foreach ( $smart_links as $smart_link ) {
			// The smart link properties are set in the validate callback.
			$saved = $smart_link->save();

			if ( ! $saved ) {
				$failed_links[] = $smart_link;
				continue;
			}

			$saved_links[] = $smart_link;
		}

		$response = array(
			'saved'   => $this->serialize_smart_links( $saved_links ),
			'removed' => $this->serialize_smart_links( $removed_links ),
		);

		if ( count( $failed_links ) > 0 ) {
			$response['failed'] = $this->serialize_smart_links( $failed_links );
		}

		return new WP_REST_Response( array( 'data' => $response ), 200 );
	}


	/**
	 * API Endpoint: POST /smart-linking/url-to-post-type.
	 *
	 * Converts a URL to a post type.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function url_to_post_type( WP_REST_Request $request ): WP_REST_Response {
		$url = $request->get_param( 'url' );

		if ( ! is_string( $url ) ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'invalid_request',
						'message' => __( 'Invalid request body.', 'wp-parsely' ),
					),
				),
				400
			);
		}

		$post_id = 0;
		$cache   = wp_cache_get( $url, 'wp_parsely_smart_link_url_to_postid' );

		if ( is_integer( $cache ) ) {
			$post_id = $cache;
		} elseif ( function_exists( 'wpcom_vip_url_to_postid' ) ) {
			$post_id = wpcom_vip_url_to_postid( $url );
		} else {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$post_id = url_to_postid( $url );
			wp_cache_set( $url, $post_id, 'wp_parsely_smart_link_url_to_postid' );
		}

		$response = array(
			'data' => array(
				'post_id'   => false,
				'post_type' => false,
			),
		);

		if ( 0 !== $post_id ) {
			$response['data']['post_id']   = $post_id;
			$response['data']['post_type'] = get_post_type( $post_id );
		}

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * Validates the URL exclusion list parameter.
	 *
	 * The callback sets the URL exclusion list in the request object if the parameter is valid.
	 *
	 * @since 3.17.0
	 * @access private
	 *
	 * @param mixed           $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return true|WP_Error Whether the parameter is valid.
	 */
	public function validate_url_exclusion_list( $param, WP_REST_Request $request ) {
		if ( ! is_array( $param ) ) {
			return new WP_Error( 'invalid_url_exclusion_list', __( 'The URL exclusion list must be an array.', 'wp-parsely' ) );
		}

		$valid_urls = array_filter(
			$param,
			function ( $url ) {
				return is_string( $url ) && false !== filter_var( $url, FILTER_VALIDATE_URL );
			}
		);

		$request->set_param( 'url_exclusion_list', $valid_urls );

		return true;
	}

	/**
	 * Validates the smart link parameters.
	 *
	 * The callback sets the smart link object in the request object if the parameters are valid.
	 *
	 * @since 3.16.0
	 * @access private
	 *
	 * @param array<mixed>    $params  The parameters.
	 * @param WP_REST_Request $request The request object.
	 * @return bool Whether the parameters are valid.
	 */
	public function validate_smart_link_params( array $params, WP_REST_Request $request ): bool {
		$required_params = array( 'uid', 'href', 'title', 'text', 'offset' );

		foreach ( $required_params as $param ) {
			if ( ! isset( $params[ $param ] ) ) {
				return false;
			}
		}

		$encoded_data = wp_json_encode( $params );
		if ( false === $encoded_data ) {
			return false;
		}

		$post_id = $request->get_param( 'post_id' );
		if ( ! is_numeric( $post_id ) ) {
			return false;
		}

		if ( ! is_string( $params['uid'] ) ) {
			return false;
		}

		// Try to get the smart link from the UID.
		$smart_link = Smart_Link::get_smart_link( $params['uid'], intval( $post_id ) );
		if ( $smart_link->exists() ) {
			// Update the smart link with the new data.
			$smart_link->set_href( $params['href'] );
			$smart_link->title  = $params['title'];
			$smart_link->text   = $params['text'];
			$smart_link->offset = $params['offset'];
		} else {
			/**
			 * The Smart Link model.
			 *
			 * @var Smart_Link $smart_link
			 */
			$smart_link = Smart_Link::deserialize( $encoded_data );
			$smart_link->set_source_post_id( intval( $post_id ) );
		}

		// Set the smart link attribute in the request.
		$request->set_param( 'smart_link', $smart_link );

		return true;
	}

	/**
	 * Validates the multiple smart link parameters.
	 *
	 * The callback sets the smart links object in the request object if the parameters are valid.
	 *
	 * @since 3.16.0
	 * @access private
	 *
	 * @param array<array<mixed>> $param   The parameter value.
	 * @param WP_REST_Request     $request The request object.
	 * @return bool Whether the parameter is valid.
	 */
	public function validate_multiple_smart_links( array $param, WP_REST_Request $request ): bool {
		$smart_links = array();

		foreach ( $param as $link ) {
			if ( $this->validate_smart_link_params( $link, $request ) ) {
				$smart_link    = $request->get_param( 'smart_link' );
				$smart_links[] = $smart_link;
			} else {
				return false;
			}
		}
		$request->set_param( 'smart_link', null );
		$request->set_param( 'smart_links', $smart_links );

		return true;
	}

	/**
	 * Serializes an array of Smart Links.
	 *
	 * @since 3.16.0
	 *
	 * @param Smart_Link[] $links The Smart Links to serialize.
	 * @return array<mixed> The serialized Smart Links.
	 */
	private function serialize_smart_links( array $links ): array {
		return array_map(
			function ( Smart_Link $link ) {
				return json_decode( $link->serialize(), true );
			},
			$links
		);
	}
}
