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
use Parsely\Models\Smart_Link_Status;
use Parsely\REST_API\Base_Endpoint;
use Parsely\REST_API\Use_Post_ID_Parameter_Trait;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use Parsely\Utils\Utils;
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
	 * @return string The endpoint's name.
	 */
	public static function get_endpoint_name(): string {
		return 'smart-linking';
	}

	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @return string The feature's name.
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
					'description' => __( 'The text to generate Smart Links for.', 'wp-parsely' ),
				),
				'max_links'          => array(
					'type'        => 'integer',
					'description' => __( 'The maximum number of Smart Links to generate.', 'wp-parsely' ),
					'default'     => 10,
				),
				'url_exclusion_list' => array(
					'type'              => 'array',
					'description'       => __( 'The list of URLs to exclude from the Smart Links.', 'wp-parsely' ),
					'validate_callback' => array( Validations\Validate_Url_Exclusion_List::class, 'validate' ),
					'sanitize_callback' => array( Validations\Validate_Url_Exclusion_List::class, 'sanitize' ),
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
					'description'       => __( 'The Smart Link data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_smart_link_params' ),
				),
				'update' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to update the existing Smart Link.', 'wp-parsely' ),
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
					'description'       => __( 'The multiple Smart Links data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_multiple_smart_links' ),
				),
				'update' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to update the existing Smart Links.', 'wp-parsely' ),
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
					'description'       => __( 'The Smart Links data to set.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'validate_multiple_smart_links' ),
				),
			)
		);

		/**
		 * POST /smart-linking/get-post-meta-for-urls
		 * Gets the post meta information for the passed URLs.
		 */
		$this->register_rest_route(
			'get-post-meta-for-urls',
			array( 'POST' ),
			array( $this, 'get_post_meta_for_urls' ),
			array(
				'urls' => array(
					'required'    => true,
					'type'        => 'array',
					'description' => __( 'The URLs to get meta information for.', 'wp-parsely' ),
				),
			)
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
				'max_items'          => $max_links,
				'url_exclusion_list' => $url_exclusion_list,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		$smart_links = array_map(
			function ( Smart_Link $link ) {
				// Set the context to Smart Linking.
				$link->set_context( $this->get_pch_feature_name() );

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

		$outbound_links = Smart_Link::get_outbound_smart_links( $post->ID, Smart_Link_Status::APPLIED );
		$inbound_links  = Smart_Link::get_inbound_smart_links( $post->ID, Smart_Link_Status::APPLIED );

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
						'message' => __( 'Smart Link already exists.', 'wp-parsely' ),
					),
				),
				409 // HTTP Conflict.
			);
		}

		// Mark as applied.
		$smart_link->set_status( Smart_Link_Status::APPLIED );

		// If the context is not set, set it to Smart Linking.
		if ( null === $smart_link->get_context() ) {
			$smart_link->set_context( $this->get_pch_feature_name() );
		}

		// The smart link properties are set in the validate callback.
		$saved = $smart_link->save();
		if ( ! $saved ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'add_smart_link_failed',
						'message' => __( 'Failed to add the Smart Link.', 'wp-parsely' ),
					),
				),
				500
			);
		}

		// Clear the cache for the smart link.
		$smart_link->flush_all_cache();

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

			// Mark as applied.
			$smart_link->set_status( Smart_Link_Status::APPLIED );

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

			// Clear the cache for the smart link.
			$smart_link->flush_all_cache();
		}

		// If no link was added, return an error response.
		if ( count( $added_links ) === 0 && count( $updated_links ) === 0 ) {
			return new WP_REST_Response(
				array(
					'error' => array(
						'name'    => 'add_smart_link_failed',
						'message' => __( 'Failed to add all the Smart Links.', 'wp-parsely' ),
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
		$existing_links = Smart_Link::get_outbound_smart_links( $post->ID, Smart_Link_Status::APPLIED );
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

				// Clear the cache for the smart link.
				$existing_link->flush_all_cache();
			}
		}

		$saved_links  = array();
		$failed_links = array();

		foreach ( $smart_links as $smart_link ) {
			// Mark as applied.
			$smart_link->set_status( Smart_Link_Status::APPLIED );

			// The smart link properties are set in the validate callback.
			$saved = $smart_link->save();

			if ( ! $saved ) {
				$failed_links[] = $smart_link;
				continue;
			}

			$saved_links[] = $smart_link;

			// Clear the cache for the smart link.
			$smart_link->flush_all_cache();
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
	 * API Endpoint: POST /smart-linking/get-post-meta-for-urls.
	 *
	 * Returns post meta for the passed URLs.
	 *
	 * @since 3.18.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function get_post_meta_for_urls( WP_REST_Request $request ): WP_REST_Response {
		$urls       = $request->get_param( 'urls' );
		$posts_meta = array();

		foreach ( $urls as $url ) {
			$post_id = Utils::get_post_id_by_url( $url );

			if ( $post_id > 0 ) {
				$post = get_post( $post_id );

				if ( null !== $post ) {
					$post_type_obj  = get_post_type_object( $post->post_type );
					$post_type_name = $post_type_obj instanceof \WP_Post_Type ? $post_type_obj->labels->singular_name : '';

					$posts_meta[] = array(
						'author'    => get_the_author_meta( 'display_name', intval( $post->post_author ) ),
						'date'      => get_the_date( '', $post ),
						'id'        => $post_id,
						'title'     => $post->post_title,
						'thumbnail' => get_the_post_thumbnail_url( $post, 'thumbnail' ),
						'type'      => $post_type_name,
						'url'       => $url,
					);
				}
			}
		}

		return new WP_REST_Response( array( 'data' => $posts_meta ), 200 );
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

		if ( ! is_array( $params['href'] ) ) {
			return false;
		}

		if ( ! is_string( $params['href']['raw'] ) ) {
			return false;
		}

		// Try to get the smart link from the UID.
		$smart_link = Smart_Link::get_smart_link( $params['uid'], intval( $post_id ) );
		if ( $smart_link->exists() ) {
			// Update the smart link with the new data.
			$smart_link->set_href( $params['href']['raw'] );
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

		// If the context is not set, set it to Smart Linking.
		if ( null === $smart_link->get_context() ) {
			$smart_link->set_context( $this->get_pch_feature_name() );
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
