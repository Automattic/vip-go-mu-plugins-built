<?php
/**
 * Smart Linking endpoint: Provides endpoints for managing smart links
 *
 * @package Parsely
 * @since   3.16.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\Content_Helper;

use Parsely\Endpoints\Base_Endpoint;
use Parsely\Models\Smart_Link;
use Parsely\Permissions;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

/**
 * Smart Linking endpoint class.
 *
 * Provides endpoints for managing smart links.
 *
 * @since 3.16.0
 */
class Smart_Linking_Endpoint extends Base_Endpoint {

	/**
	 * The endpoint base path.
	 *
	 * @since 3.16.0
	 * @var string
	 */
	protected const ENDPOINT = '/smart-linking';

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.16.0
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool
	 */
	public function is_available_to_current_user( $request = null ): bool {
		$post_id = false;
		if ( $request instanceof WP_REST_Request ) {
			$temp_post_id = $request->get_param( 'post_id' );
			if ( is_numeric( $temp_post_id ) ) {
				$post_id = intval( $temp_post_id );
			}
		}

		$can_access_pch = Permissions::current_user_can_use_pch_feature(
			'smart_linking',
			$this->parsely->get_options()['content_helper'],
			$post_id
		);

		// Check if the current user has the smart linking capability.
		$has_capability = current_user_can(
			// phpcs:ignore WordPress.WP.Capabilities.Undetermined
			$this->apply_capability_filters(
				Base_Endpoint::DEFAULT_ACCESS_CAPABILITY
			)
		);

		return $can_access_pch && $has_capability;
	}

	/**
	 * Registers the endpoints.
	 *
	 * @since 3.16.0
	 */
	public function run(): void {
		/**
		 * POST /smart-linking/url-to-post-type
		 * Converts a URL to a post type.
		 */
		$this->register_endpoint(
			static::ENDPOINT . '/url-to-post-type',
			'url_to_post_type',
			array( 'POST' )
		);

		/**
		 * GET /smart-linking/{post_id}/get
		 * Gets the smart links for a post.
		 */
		$this->register_endpoint_with_args(
			static::ENDPOINT . '/(?P<post_id>\d+)/get',
			'get_smart_links',
			array( 'GET' ),
			array(
				'post_id' => array(
					'required'          => true,
					'description'       => __( 'The post ID.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_post_id' ),
				),
			)
		);

		/**
		 * POST /smart-linking/{post_id}/add
		 * Adds a smart link to a post.
		 */
		$this->register_endpoint_with_args(
			static::ENDPOINT . '/(?P<post_id>\d+)/add',
			'add_smart_link',
			array( 'POST' ),
			array(
				'post_id' => array(
					'required'          => true,
					'description'       => __( 'The post ID.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_post_id' ),
				),
				'link'    => array(
					'required'          => true,
					'type'              => 'array',
					'description'       => __( 'The smart link data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_smart_link_params' ),
				),
				'update'  => array(
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
		$this->register_endpoint_with_args(
			static::ENDPOINT . '/(?P<post_id>\d+)/add-multiple',
			'add_multiple_smart_links',
			array( 'POST' ),
			array(
				'post_id' => array(
					'required'          => true,
					'description'       => __( 'The post ID.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_post_id' ),
				),
				'links'   => array(
					'required'          => true,
					'type'              => 'array',
					'description'       => __( 'The multiple smart links data to add.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_multiple_smart_links' ),
				),
				'update'  => array(
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
		$this->register_endpoint_with_args(
			static::ENDPOINT . '/(?P<post_id>\d+)/set',
			'set_smart_links',
			array( 'POST' ),
			array(
				'post_id' => array(
					'required'          => true,
					'description'       => __( 'The post ID.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_post_id' ),
				),
				'links'   => array(
					'required'          => true,
					'type'              => 'array',
					'description'       => __( 'The smart links data to set.', 'wp-parsely' ),
					'validate_callback' => array( $this, 'private_api_request_validate_multiple_smart_links' ),
				),
			)
		);
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
	 * Validates the post ID parameter.
	 *
	 * The callback sets the post object in the request object if the parameter is valid.
	 *
	 * @since 3.16.0
	 * @access private
	 *
	 * @param string          $param   The parameter value.
	 * @param WP_REST_Request $request The request object.
	 * @return bool Whether the parameter is valid.
	 */
	public function private_api_request_validate_post_id( string $param, WP_REST_Request $request ): bool {
		if ( ! is_numeric( $param ) ) {
			return false;
		}

		$param = filter_var( $param, FILTER_VALIDATE_INT );

		if ( false === $param ) {
			return false;
		}

		// Validate if the post ID exists.
		$post = get_post( $param );
		// Set the post attribute in the request.
		$request->set_param( 'post', $post );

		return null !== $post;
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
	public function private_api_request_validate_smart_link_params( array $params, WP_REST_Request $request ): bool {
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
	public function private_api_request_validate_multiple_smart_links( array $param, WP_REST_Request $request ): bool {
		$smart_links = array();

		foreach ( $param as $link ) {
			if ( $this->private_api_request_validate_smart_link_params( $link, $request ) ) {
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
