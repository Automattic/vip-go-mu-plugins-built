<?php
/**
 * Endpoint: Traffic Boost
 * Parse.ly Content Intelligence `/traffic-boost` API endpoint class
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Content_Helper;

use Parsely\Models\Inbound_Smart_Link;
use Parsely\Models\Smart_Link_Status;
use Parsely\REST_API\Base_Endpoint;
use Parsely\REST_API\Use_Post_ID_Parameter_Trait;
use Parsely\Services\Suggestions_API\Suggestions_API_Service;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Traffic Boost API.
 *
 * Provides an endpoint for getting traffic boost suggestions for a given post.
 *
 * @since 3.19.0
 */
class Endpoint_Traffic_Boost extends Base_Endpoint {
	use Content_Helper_Feature;
	use Use_Post_ID_Parameter_Trait;

	/**
	 * The Suggestions API service.
	 *
	 * @since 3.19.0
	 *
	 * @var Suggestions_API_Service $suggestions_api
	 */
	protected $suggestions_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.19.0
	 *
	 * @param Content_Helper_Controller $controller The Content Intelligence controller.
	 */
	public function __construct( Content_Helper_Controller $controller ) {
		parent::__construct( $controller );
		$this->suggestions_api = $controller->get_parsely()->get_suggestions_api();
	}

	/**
	 * Returns the name of the endpoint.
	 *
	 * @since 3.19.0
	 *
	 * @return string The endpoint's name.
	 */
	public static function get_endpoint_name(): string {
		return 'traffic-boost';
	}

	/**
	 * Returns the name of the feature associated with the current endpoint.
	 *
	 * @since 3.19.0
	 *
	 * @return string The feature's name.
	 */
	public function get_pch_feature_name(): string {
		return 'traffic_boost';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.19.0
	 */
	public function register_routes(): void {
		/**
		 * POST /traffic-boost/{post_id}/generate
		 * Gets traffic boost suggestions for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/generate',
			array( 'POST' ),
			array( $this, 'generate_link_suggestions' ),
			array(
				'max_items'          => array(
					'type'        => 'integer',
					'description' => __( 'The maximum number of suggestions to return.', 'wp-parsely' ),
					'default'     => 10,
					'required'    => false,
				),
				'save'               => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to save the suggestions.', 'wp-parsely' ),
					'default'     => false,
					'required'    => false,
				),
				'discard_previous'   => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to discard the previous suggestions.', 'wp-parsely' ),
					'default'     => true,
					'required'    => false,
				),
				'url_exclusion_list' => array(
					'type'              => 'array',
					'description'       => __( 'The URLs to exclude from the suggestions.', 'wp-parsely' ),
					'required'          => false,
					'default'           => array(),
					'validate_callback' => array( Validations\Validate_Url_Exclusion_List::class, 'validate' ),
					'sanitize_callback' => array( Validations\Validate_Url_Exclusion_List::class, 'sanitize' ),
				),
			)
		);

		/**
		 * POST /traffic-boost/{post_id}/generate-placement/{source_post_id}.
		 * Suggests inbound link positions for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/generate-placement/(?P<source_post_id>[0-9]+)',
			array( 'POST' ),
			array( $this, 'generate_placement_suggestions' ),
			array(
				'source_post_id'         => array(
					'type'        => 'integer',
					'description' => __( 'The ID of the source post.', 'wp-parsely' ),
					'required'    => true,
				),
				'ignore_keywords'        => array(
					'type'        => 'array',
					'description' => __( 'The keywords to ignore.', 'wp-parsely' ),
					'required'    => false,
				),
				'keyword_exclusion_list' => array(
					'type'        => 'array',
					'description' => __( 'The keywords to exclude from the suggestions.', 'wp-parsely' ),
					'required'    => false,
					'default'     => array(),
				),
				'allow_duplicate_links'  => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to allow duplicate links.', 'wp-parsely' ),
					'default'     => false,
					'required'    => false,
				),
				'save'                   => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to save the suggestion.', 'wp-parsely' ),
					'default'     => true,
					'required'    => false,
				),
			)
		);

		/**
		 * GET /traffic-boost/{post_id}/get-suggestions.
		 * Gets the existing inbound smart links for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/get-suggestions',
			array( 'GET' ),
			array( $this, 'get_existing_suggestions' )
		);

		/**
		 * GET /traffic-boost/{post_id}/get-inbound.
		 * Gets the inbound smart links for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/get-inbound',
			array( 'GET' ),
			array( $this, 'get_inbound_smart_links' )
		);

		/**
		 * POST /traffic-boost/{post_id}/accept-suggestion/{smart_link_id}
		 * Accepts a specific suggestion for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/accept-suggestion/(?P<smart_link_id>[0-9]+)',
			array( 'POST' ),
			array( $this, 'accept_suggestion' ),
			array(
				'smart_link_id' => array(
					'type'              => 'integer',
					'description'       => __( 'The ID of the Smart Link to accept.', 'wp-parsely' ),
					'required'          => true,
					'validate_callback' => array( $this, 'validate_smart_link_id' ),
				),
				'text'          => array(
					'type'        => 'string',
					'description' => __( 'The text of the Smart Link.', 'wp-parsely' ),
					'required'    => false,
				),
				'offset'        => array(
					'type'        => 'integer',
					'description' => __( 'The offset of the Smart Link.', 'wp-parsely' ),
					'required'    => false,
				),
			)
		);

		/**
		 * DELETE /traffic-boost/{post_id}/discard-suggestions.
		 * Discards all existing suggestions for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/discard-suggestions',
			array( 'DELETE' ),
			array( $this, 'discard_suggestions' )
		);

		/**
		 * DELETE /traffic-boost/{post_id}/discard-suggestion/{smart_link_id}.
		 * Discards a specific suggestion for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/discard-suggestion/(?P<smart_link_id>[0-9]+)',
			array( 'DELETE' ),
			array( $this, 'discard_suggestion' ),
			array(
				'smart_link_id' => array(
					'type'              => 'integer',
					'description'       => __( 'The ID of the Smart Link to discard.', 'wp-parsely' ),
					'required'          => true,
					'validate_callback' => array( $this, 'validate_smart_link_id' ),
				),
			)
		);

		/**
		 * DELETE /traffic-boost/{post_id}/delete-inbound/{smart_link_id}.
		 * Deletes an inbound smart link for a post.
		 */
		$this->register_rest_route_with_post_id(
			'/delete-inbound/(?P<smart_link_id>[0-9]+)',
			array( 'DELETE' ),
			array( $this, 'delete_inbound' ),
			array(
				'smart_link_id'    => array(
					'type'              => 'integer',
					'description'       => __( 'The ID of the Smart Link to delete.', 'wp-parsely' ),
					'required'          => true,
					'validate_callback' => array( $this, 'validate_smart_link_id' ),
				),
				'restore_original' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to restore the original link.', 'wp-parsely' ),
					'default'     => false,
					'required'    => false,
				),
			)
		);

		/**
		 * POST /traffic-boost/{post_id}/update-inbound/{smart_link_id}.
		 * Updates an inbound smart link.
		 */
		$this->register_rest_route_with_post_id(
			'/update-inbound/(?P<smart_link_id>[0-9]+)',
			array( 'POST' ),
			array( $this, 'update_inbound' ),
			array(
				'smart_link_id'    => array(
					'type'              => 'integer',
					'description'       => __( 'The ID of the Smart Link to update.', 'wp-parsely' ),
					'required'          => true,
					'validate_callback' => array( $this, 'validate_smart_link_id' ),
				),
				'text'             => array(
					'type'        => 'string',
					'description' => __( 'The text of the Smart Link.', 'wp-parsely' ),
					'required'    => false,
				),
				'offset'           => array(
					'type'        => 'integer',
					'description' => __( 'The offset of the Smart Link.', 'wp-parsely' ),
					'required'    => false,
				),
				'restore_original' => array(
					'type'        => 'boolean',
					'description' => __( 'Whether to restore the original link.', 'wp-parsely' ),
					'default'     => false,
					'required'    => false,
				),
			)
		);
	}

	/**
	 * API Endpoint: POST /traffic-boost/{post_id}/generate.
	 *
	 * Gets traffic boost suggestions for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function generate_link_suggestions( WP_REST_Request $request ) {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post = $request->get_param( 'post' );

		/**
		 * The maximum number of suggestions to return.
		 *
		 * @var int $max_items
		 */
		$max_items = (int) $request->get_param( 'max_items' );

		/**
		 * Whether to save the suggestions.
		 *
		 * @var bool $save
		 */
		$save = (bool) $request->get_param( 'save' );

		/**
		 * Whether to discard the previous suggestions.
		 *
		 * @var bool $discard_previous
		 */
		$discard_previous = (bool) $request->get_param( 'discard_previous' );

		/**
		 * The URLs to exclude from the suggestions.
		 *
		 * @var array<string> $url_exclusion_list
		 */
		$url_exclusion_list = $request->get_param( 'url_exclusion_list' );

		$inbound_suggestions = $this->suggestions_api->get_inbound_links(
			$post,
			array(
				'max_items'          => $max_items,
				'url_exclusion_list' => $url_exclusion_list,
			)
		);

		if ( is_wp_error( $inbound_suggestions ) ) {
			return $inbound_suggestions;
		}

		$discard_result = null;

		// If the discard_previous flag is set, discard the previous suggestions.
		if ( $discard_previous ) {
			$discard_result = Inbound_Smart_Link::delete_pending_suggestions( $post->ID );
		}

		$suggestions = array_map(
			function ( Inbound_Smart_Link $link ) use ( $save ) {
				$link->set_status( Smart_Link_Status::PENDING );

				// Set the context to Traffic Boost.
				$link->set_context( $this->get_pch_feature_name() );

				// If the save flag is set, save the smart link.
				if ( $save ) {
					$link->save();
				}

				return $link->to_array();
			},
			$inbound_suggestions
		);

		$response = array(
			'data' => $suggestions,
		);

		if ( null !== $discard_result ) {
			$response['discarded'] = $discard_result;
		}

		return new WP_REST_Response( $response, 200 );
	}

	/**
	 * API Endpoint: POST /traffic-boost/{post_id}/generate-placement.
	 *
	 * Generates placement suggestions for a specific post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function generate_placement_suggestions( WP_REST_Request $request ) {
		/**
		 * The destination post, that the inbound link links to.
		 *
		 * @var WP_Post $destination_post
		 */
		$destination_post = $request->get_param( 'post' );

		/**
		 * The source post ID, where the inbound link will be placed.
		 *
		 * @var int $source_post_id
		 */
		$source_post_id = $request->get_param( 'source_post_id' );

		/**
		 * The source post.
		 *
		 * @var WP_Post|null $source_post
		 */
		$source_post = get_post( $source_post_id );

		/**
		 * The keyword exclusion list.
		 *
		 * @var array<string> $keyword_exclusion_list
		 */
		$keyword_exclusion_list = $request->get_param( 'keyword_exclusion_list' );

		/**
		 * Whether to allow duplicate links.
		 *
		 * @var bool $allow_duplicate_links
		 */
		$allow_duplicate_links = $request->get_param( 'allow_duplicate_links' );

		/**
		 * Whether to save the suggestion.
		 *
		 * @var bool $save
		 */
		$save = $request->get_param( 'save' );

		if ( null === $source_post ) {
			return new WP_Error(
				'parsely_invalid_source_post',
				__( 'Invalid source post.', 'wp-parsely' )
			);
		}

		$suggestions = $this->suggestions_api->get_inbound_link_positions(
			$source_post,
			$destination_post,
			array(
				'keyword_exclusion_list' => $keyword_exclusion_list,
			)
		);

		if ( is_wp_error( $suggestions ) ) {
			return $suggestions;
		}

		$valid_suggestion = null;
		$errors           = array();
		// Try to find the first suggestion that has a valid placement.
		foreach ( $suggestions as $suggestion ) {
			// If the ignore keywords are set and the suggested text is in the ignore keywords, skip it.
			if ( in_array( $suggestion->text, $keyword_exclusion_list, true ) ) {
				continue;
			}

			/** @var WP_Error|bool $valid_placement Whether the suggestion has a valid placement. */
			$valid_placement = $suggestion->has_valid_placement( true, $allow_duplicate_links );
			if ( ! is_wp_error( $valid_placement ) ) {
				$valid_suggestion = $suggestion;
				break;
			} else {
				$errors[] = $valid_placement;
			}
		}

		if ( null === $valid_suggestion ) {
			return new WP_Error(
				'parsely_no_valid_placement',
				__( 'No valid placement found.', 'wp-parsely' ),
				array(
					'suggestions' => $suggestions,
					'errors'      => $errors,
				)
			);
		}

		// Set the context to Traffic Boost.
		$valid_suggestion->set_context( $this->get_pch_feature_name() );

		// Check if there's already a smart link with the same source and destination posts.
		$existing_smart_link = Inbound_Smart_Link::get_smart_link_by_source_and_destination( $source_post_id, $destination_post->ID );

		// If so, update the smart link with the new text and offset.
		if ( false !== $existing_smart_link ) {
			$existing_smart_link->text   = $valid_suggestion->text;
			$existing_smart_link->offset = $valid_suggestion->offset;

			$valid_suggestion = $existing_smart_link;
		}

		// Save the suggestion to the database.
		if ( $save ) {
			$valid_suggestion->save();
		}

		return new WP_REST_Response( array( 'data' => $valid_suggestion->to_array() ), 200 );
	}

	/**
	 * API Endpoint: GET /traffic-boost/{post_id}/get-suggestions.
	 *
	 * Gets the existing inbound smart links for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function get_existing_suggestions( WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );

		$suggestions = Inbound_Smart_Link::get_existing_suggestions( $post_id );

		// Convert the inbound smart links to an array.
		$suggestions = array_map(
			function ( Inbound_Smart_Link $link ) {
				if ( ! (bool) $link->has_valid_placement() ) {
					// Delete the link if it doesn't have a valid placement.
					$link->delete();
					return null;
				}

				return $link->to_array();
			},
			$suggestions
		);

		// Filter out null values.
		$suggestions = array_values(
			array_filter(
				$suggestions,
				function ( $suggestion ) {
					return null !== $suggestion;
				}
			)
		);

		return new WP_REST_Response( array( 'data' => $suggestions ), 200 );
	}

	/**
	 * API Endpoint: GET /traffic-boost/{post_id}/get-inbound.
	 *
	 * Gets the inbound smart links for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function get_inbound_smart_links( WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );

		// Get the inbound smart links for the post.
		$inbound_links = Inbound_Smart_Link::get_inbound_smart_links( $post_id, Smart_Link_Status::APPLIED );

		// Convert the inbound smart links to an array.
		$inbound_links = array_map(
			function ( Inbound_Smart_Link $link ) {
				return $link->to_array();
			},
			$inbound_links
		);

		return new WP_REST_Response( array( 'data' => $inbound_links ), 200 );
	}

	/**
	 * API Endpoint: DELETE /traffic-boost/{post_id}/discard-suggestions.
	 *
	 * Discards all existing suggestions for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function discard_suggestions( WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );

		$result = Inbound_Smart_Link::delete_pending_suggestions( $post_id );

		return new WP_REST_Response( array( 'data' => $result ), 200 );
	}

	/**
	 * API Endpoint: DELETE /traffic-boost/{post_id}/discard-suggestion/{smart_link_id}.
	 *
	 * Discards a specific suggestion for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response The response object.
	 */
	public function discard_suggestion( WP_REST_Request $request ) {
		/**
		 * The inbound smart link.
		 *
		 * @var Inbound_Smart_Link $inbound_link
		 */
		$inbound_link = $request->get_param( 'inbound_link' );

		$deleted = $inbound_link->delete();

		return new WP_REST_Response( array( 'data' => array( 'success' => $deleted ) ), 200 );
	}

	/**
	 * API Endpoint: DELETE /traffic-boost/{post_id}/delete-inbound/{smart_link_id}.
	 *
	 * Deletes an inbound smart link for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function delete_inbound( WP_REST_Request $request ) {
		/**
		 * The inbound smart link.
		 *
		 * @var Inbound_Smart_Link $inbound_link
		 */
		$inbound_link = $request->get_param( 'inbound_link' );

		/**
		 * Whether to restore the original link.
		 *
		 * @var bool $restore_original_link
		 */
		$restore_original_link = $request->get_param( 'restore_original' );

		$deleted = $inbound_link->remove( $restore_original_link );

		if ( is_wp_error( $deleted ) ) {
			return $deleted;
		}

		return new WP_REST_Response(
			array(
				'data' => array(
					'success'          => $deleted,
					'restore_original' => $restore_original_link,
				),
			),
			200
		);
	}

	/**
	 * API Endpoint: POST /traffic-boost/{post_id}/update-inbound/{smart_link_id}.
	 *
	 * Updates an inbound smart link.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function update_inbound( WP_REST_Request $request ) {
		/**
		 * The inbound smart link.
		 *
		 * @var Inbound_Smart_Link $inbound_link
		 */
		$inbound_link = $request->get_param( 'inbound_link' );

		/**
		 * The text of the smart link.
		 *
		 * @var string $text
		 */
		$text = $request->get_param( 'text' );

		/**
		 * The offset of the smart link.
		 *
		 * @var int $offset
		 */
		$offset = $request->get_param( 'offset' );

		/**
		 * Whether to restore the original link.
		 *
		 * @var bool $restore_original_link
		 */
		$restore_original_link = (bool) $request->get_param( 'restore_original' );

		$updated = $inbound_link->update_link_text( $text, $offset, $restore_original_link );

		$post = get_post( $inbound_link->source_post_id );
		if ( null === $post ) {
			return new WP_Error(
				'parsely_post_not_found',
				__( 'Source post not found.', 'wp-parsely' )
			);
		}

		if ( is_wp_error( $updated ) ) {
			return $updated;
		}

		return new WP_REST_Response(
			array(
				'data' => array(
					'success'          => $updated,
					'smart_link'       => $inbound_link->to_array(),
					'restore_original' => $restore_original_link,
					'did_replace_link' => $inbound_link->did_replace_link(),
					'post_content'     => $post->post_content,
				),
			),
			200
		);
	}

	/**
	 * API Endpoint: POST /traffic-boost/{post_id}/accept-suggestion/{smart_link_id}.
	 *
	 * Accepts a specific suggestion for a post.
	 *
	 * @since 3.19.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function accept_suggestion( WP_REST_Request $request ) {
		/**
		 * The inbound smart link.
		 *
		 * @var Inbound_Smart_Link $inbound_link
		 */
		$inbound_link = $request->get_param( 'inbound_link' );

		/**
		 * The text of the smart link.
		 *
		 * @var string|null $text
		 */
		$text = $request->get_param( 'text' );

		/**
		 * The offset of the smart link.
		 *
		 * @var int|null $offset
		 */
		$offset = $request->get_param( 'offset' );

		// If the text is set and the offset is not, or the other way around, return an error.
		if ( ( null !== $text && null === $offset ) || ( null !== $offset && null === $text ) ) {
			return new WP_Error(
				'parsely_invalid_smart_link_override',
				__( 'If you provide a text, you must also provide an offset.', 'wp-parsely' )
			);
		} elseif ( null !== $text && null !== $offset ) {
			$inbound_link->text   = $text;
			$inbound_link->offset = $offset;
		}

		if ( $inbound_link->is_applied() ) {
			return new WP_Error(
				'parsely_smart_link_already_applied',
				__( 'Smart Link already applied.', 'wp-parsely' )
			);
		}

		$applied = $inbound_link->apply();

		if ( is_wp_error( $applied ) ) {
			return $applied;
		}

		$post = get_post( $inbound_link->source_post_id );
		if ( null === $post ) {
			return new WP_Error(
				'parsely_post_not_found',
				__( 'Source post not found.', 'wp-parsely' )
			);
		}

		// Clear the cache for the smart link.
		$inbound_link->flush_all_cache();

		return new WP_REST_Response(
			array(
				'data' => array(
					'success'          => $applied,
					'did_replace_link' => $inbound_link->did_replace_link(),
					'post_content'     => $post->post_content,
				),
			),
			200
		);
	}

	/**
	 * Validates a smart link ID.
	 *
	 * @since 3.19.0
	 *
	 * @param int             $smart_link_id The smart link ID.
	 * @param WP_REST_Request $request The request object.
	 * @return bool|WP_Error True if the smart link ID is valid, WP_Error on failure.
	 */
	public function validate_smart_link_id( int $smart_link_id, WP_REST_Request $request ) {
		/** @var Inbound_Smart_Link|false $inbound_link */
		$inbound_link = Inbound_Smart_Link::get_smart_link_by_id( $smart_link_id );

		if ( false === $inbound_link ) {
			return new WP_Error(
				'parsely_smart_link_not_found',
				__( 'Smart Link not found', 'wp-parsely' )
			);
		}

		// If the context is not set, set it to Traffic Boost.
		if ( null === $inbound_link->get_context() ) {
			$inbound_link->set_context( $this->get_pch_feature_name() );
		}

		// Set the inbound link in the request.
		$request->set_param( 'inbound_link', $inbound_link );

		// Validate if the smart link is associated with the post.
		$post_id = intval( $request->get_param( 'post_id' ) );

		if ( $inbound_link->destination_post_id !== $post_id ) {
			return new WP_Error(
				'parsely_invalid_smart_link',
				__( 'Smart Link is not associated with this post', 'wp-parsely' )
			);
		}

		return true;
	}
}
