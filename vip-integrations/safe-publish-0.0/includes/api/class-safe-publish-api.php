<?php
/**
 * Safe Publish API class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Admin\Content_Processor;
use Safe_Publish\Admin\Sanitizes_Content;
use Safe_Publish\Media\Media_Importer;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Safe_Publish API Class.
 */
final class Safe_Publish_API extends REST_Base {

	use Sanitizes_Content;

	/**
	 * REST API base route.
	 *
	 * @var string
	 */
	const REST_BASE = 'safe-publish/v1';

	/**
	 * Diff renderer instance.
	 *
	 * @var Diff_Renderer
	 */
	private Diff_Renderer $diff_renderer;

	/**
	 * Meta terms manager instance.
	 *
	 * @var Meta_Terms_Manager
	 */
	private Meta_Terms_Manager $meta_terms_manager;

	/**
	 * Media Importer instance.
	 *
	 * @var Media_Importer|null
	 */
	private ?Media_Importer $media_importer;

	/**
	 * Content Processor instance.
	 *
	 * @var Content_Processor|null
	 */
	private ?Content_Processor $content_processor;

	/**
	 * Constructor.
	 *
	 * @param Diff_Renderer|null      $diff_renderer      Optional. Diff Renderer instance.
	 * @param Meta_Terms_Manager|null $meta_terms_manager Optional. Meta Terms Manager instance.
	 * @param Content_Processor|null  $content_processor  Optional. Content Processor instance.
	 * @param Media_Importer|null     $media_importer     Optional. Media Importer instance.
	 */
	public function __construct(
		?Diff_Renderer $diff_renderer = null,
		?Meta_Terms_Manager $meta_terms_manager = null,
		?Content_Processor $content_processor = null,
		?Media_Importer $media_importer = null
	) {
		parent::__construct();
		$this->diff_renderer      = $diff_renderer ?? new Diff_Renderer();
		$this->meta_terms_manager = $meta_terms_manager ?? new Meta_Terms_Manager();
		$this->content_processor  = $content_processor;
		$this->media_importer     = $media_importer;
	}

	/**
	 * Registers REST API routes.
	 */
	#[\Override]
	public function register_routes(): void {
		register_rest_route(
			self::REST_BASE,
			'diff-preview',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( $this, 'check_diff_preview_permission' ),
				'args'                => array(
					'postId'   => array(
						'required' => true,
						'type'     => 'integer',
					),
					'postType' => array(
						'required' => false,
						'type'     => 'string',
						'default'  => 'post',
					),
					'mode'     => array(
						'required' => false,
						'type'     => 'string',
						'enum'     => array( 'split', 'inline' ),
						'default'  => 'split',
					),
					'cleanup'  => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => true,
					),
				),
				'callback'            => array( $this, 'render_diff' ),
			)
		);

		register_rest_route(
			self::REST_BASE,
			'update-post',
			array(
				'methods'             => 'POST',
				'permission_callback' => array( $this, 'check_edit_post_permission' ),
				'args'                => array(
					'postId'          => array(
						'required' => true,
						'type'     => 'integer',
					),
					'content'         => array(
						'required' => true,
						'type'     => 'string',
					),
					'title'           => array(
						'required' => false,
						'type'     => 'string',
					),
					'excerpt'         => array(
						'required' => false,
						'type'     => 'string',
					),
					'meta'            => array(
						'required' => false,
						'type'     => 'object',
					),
					'terms'           => array(
						'required' => false,
						'type'     => 'object',
					),
					'featuredMediaId' => array(
						'required' => false,
						'type'     => 'integer',
					),
				),
				'callback'            => array( $this, 'update_post_content' ),
			)
		);
	}

	/**
	 * Checks permission for the diff-preview route.
	 *
	 * The route receives a *source* post ID, so the capability check must be
	 * performed against the locally-mapped post rather than treating the
	 * source ID as a local one.
	 *
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return bool|WP_Error Whether the user can edit the mapped post; WP_Error
	 *                       with status 400 for invalid IDs, or 404 when the
	 *                       post is unmapped and the user has edit_others_posts.
	 */
	public function check_diff_preview_permission(
		WP_REST_Request $request
	): bool|WP_Error {
		$source_post_id = (int) $request->get_param( 'postId' );

		if ( $source_post_id < 1 ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Invalid post ID. Must be a positive integer.', 'safe-publish' ),
				array( 'status' => 400 )
			);
		}

		$post_type        = (string) $request->get_param( 'postType' );
		$mapped_post_type = Post_Type_Map::to_wp_slug( $post_type );
		$local_post       = $this->diff_renderer->find_local_post(
			$source_post_id,
			$mapped_post_type
		);

		if ( is_wp_error( $local_post ) ) {
			// Surface 404 only to users who could reasonably know the post exists.
			if ( current_user_can( 'edit_others_posts' ) ) {
				return new WP_Error(
					'rest_post_not_found',
					__( 'Post not found.', 'safe-publish' ),
					array( 'status' => 404 )
				);
			}

			return false;
		}

		return current_user_can( 'edit_post', $local_post->ID );
	}

	/**
	 * Checks if the current user can edit the specified post.
	 *
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return bool|WP_Error Whether the current user can edit the post,
	 *                       WP_Error if post ID is invalid or post not found.
	 */
	public function check_edit_post_permission( WP_REST_Request $request ): bool|WP_Error {
		$post_id = (int) $request->get_param( 'postId' );

		if ( $post_id < 1 ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Invalid post ID. Must be a positive integer.', 'safe-publish' ),
				array( 'status' => 400 )
			);
		}

		if ( null === get_post( $post_id ) ) {
			// Return 404 for users with enough capabilities.
			if ( current_user_can( 'edit_others_posts' ) ) {
				return new WP_Error(
					'rest_post_not_found',
					__( 'Post not found.', 'safe-publish' ),
					array( 'status' => 404 )
				);
			}

			return false;
		}

		return current_user_can( 'edit_post', $post_id );
	}

	/**
	 * Updates the content of a post.
	 *
	 * @param WP_REST_Request $req REST request object.
	 *
	 * @return WP_REST_Response
	 */
	public function update_post_content( WP_REST_Request $req ): WP_REST_Response {
		$post_id           = (int) $req->get_param( 'postId' );
		$content           = $req->get_param( 'content' );
		$title             = $req->get_param( 'title' );
		$excerpt           = $req->get_param( 'excerpt' );
		$meta              = $req->get_param( 'meta' );
		$terms             = $req->get_param( 'terms' );
		$featured_media_id = (int) $req->get_param( 'featuredMediaId' );

		if ( ! $post_id ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'error'   => __( 'Missing postId', 'safe-publish' ),
				),
				400
			);
		}

		$postarr = array( 'ID' => $post_id );

		if ( $req->has_param( 'title' ) && isset( $title ) ) {
			$postarr['post_title'] = sanitize_text_field( $title );
		}

		if ( $req->has_param( 'excerpt' ) && isset( $excerpt ) ) {
			$sanitized_excerpt = $this->sanitize_field(
				$excerpt,
				self::FIELD_EXCERPT
			);

			if ( is_wp_error( $sanitized_excerpt ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => $sanitized_excerpt->get_error_message(),
					),
					500
				);
			}

			$postarr['post_excerpt'] = $sanitized_excerpt;
		}

		if ( isset( $content ) ) {
			$processed_content = $this->process_content( $content );

			if ( is_wp_error( $processed_content ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => $processed_content->get_error_message(),
					),
					500
				);
			}

			$sanitized_content = $this->sanitize_field(
				$processed_content,
				self::FIELD_CONTENT
			);

			if ( is_wp_error( $sanitized_content ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => $sanitized_content->get_error_message(),
					),
					500
				);
			}

			$postarr['post_content'] = $sanitized_content;
		}

		$result = wp_update_post( $postarr, true );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array(
					'success' => false,
					'error'   => $result->get_error_message(),
				),
				500
			);
		}

		// Import/set featured image if provided.
		if ( $req->has_param( 'featuredMediaId' ) && $featured_media_id > 0 ) {
			if ( false === $this->import_and_set_featured_image(
				$post_id,
				$featured_media_id
			) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => __( 'Failed to import featured image.', 'safe-publish' ),
					),
					500
				);
			}
		}

		// Update meta only if supplied.
		if ( $req->has_param( 'meta' ) && array() !== $meta ) {
			$meta_result = $this->meta_terms_manager->update_meta(
				$post_id,
				$meta
			);

			if ( is_wp_error( $meta_result ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => $meta_result->get_error_message(),
					),
					500
				);
			}
		}

		// Update terms only if supplied.
		if ( $req->has_param( 'terms' ) && array() !== $terms ) {
			$terms_result = $this->meta_terms_manager->update_terms(
				$post_id,
				$terms
			);

			if ( is_wp_error( $terms_result ) ) {
				return new WP_REST_Response(
					array(
						'success' => false,
						'error'   => $terms_result->get_error_message(),
					),
					500
				);
			}
		}

		return new WP_REST_Response(
			array(
				'success' => true,
				'post_id' => $result,
			),
			200
		);
	}

	/**
	 * Imports and sets featured image for a post.
	 *
	 * Returns true when the import succeeds. Returns false when the import
	 * fails or when configuration required to import is missing.
	 *
	 * @param int $post_id           Post ID to set featured image for.
	 * @param int $featured_media_id Source featured media ID to import.
	 * @return bool True on success, false on failure or missing configuration.
	 */
	private function import_and_set_featured_image(
		int $post_id,
		int $featured_media_id
	): bool {
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		if ( null === $this->media_importer || empty( $source_site_url ) ) {
			return false;
		}

		$attachment_id = $this->media_importer->import_featured_image(
			$featured_media_id,
			$source_site_url
		);

		if ( false === $attachment_id ) {
			return false;
		}

		set_post_thumbnail( $post_id, $attachment_id );

		return true;
	}

	/**
	 * Processes post content by importing media and fixing links.
	 *
	 * @param string $content Raw post content.
	 * @return string|WP_Error Processed content, or WP_Error on failure.
	 */
	private function process_content( string $content ): string|WP_Error {
		if ( empty( $content ) || null === $this->content_processor ) {
			return $content;
		}

		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		return $this->content_processor->process_content( $content, $source_site_url );
	}

	/**
	 * Renders the diff preview for a source post.
	 *
	 * @param WP_REST_Request $req REST request object.
	 *
	 * @return array|WP_REST_Response Array on success, WP_REST_Response with error on failure.
	 */
	public function render_diff( WP_REST_Request $req ): array|WP_REST_Response {
		$result = $this->diff_renderer->render_diff(
			$req,
			array( $this, 'make_request' ),
			Auth_Credential_Provider::get_credentials()
		);

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				array( 'error' => $result->get_error_message() ),
				$result->get_error_data()['status'] ?? 500
			);
		}

		return $result;
	}
}
