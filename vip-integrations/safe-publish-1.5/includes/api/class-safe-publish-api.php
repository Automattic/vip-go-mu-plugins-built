<?php
/**
 * Safe Publish API class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Auth\Permissions;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use WP_Error;
use WP_Post_Type;
use WP_REST_Request;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Safe_Publish API Class.
 */
final class Safe_Publish_API extends REST_Base {

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
	 * Constructor.
	 *
	 * @param Diff_Renderer|null $diff_renderer Optional. Diff Renderer instance.
	 */
	public function __construct( ?Diff_Renderer $diff_renderer = null ) {
		parent::__construct();
		$this->diff_renderer = $diff_renderer ?? new Diff_Renderer();
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
				),
				'callback'            => array( $this, 'render_diff' ),
			)
		);
	}

	/**
	 * Checks permission for the diff-preview route.
	 *
	 * The route receives a *source* post ID, so the capability check must be
	 * performed against the locally-mapped post rather than treating the
	 * source ID as a local one. The first gate accepts either the management
	 * capability or the post type's edit_posts capability; the mapped post
	 * always requires edit_post.
	 *
	 * @param WP_REST_Request $request REST request object.
	 *
	 * @return bool|WP_Error Whether the user can edit the mapped post; WP_Error
	 *                       with status 500 when no source is connected, 400 for
	 *                       invalid IDs, or 404 when the post is unmapped and the
	 *                       user has edit_others_posts.
	 */
	public function check_diff_preview_permission(
		WP_REST_Request $request
	): bool|WP_Error {
		$mapped_post_type = Post_Type_Map::to_wp_slug(
			(string) $request->get_param( 'postType' )
		);

		// Surface the connection refusal only to users who could act on it.
		if ( ! current_user_can( Permissions::manage_capability() ) ) {
			$post_type_object = get_post_type_object( $mapped_post_type );
			$capability       = $post_type_object instanceof WP_Post_Type
				? $post_type_object->cap->edit_posts
				: 'edit_posts';

			if ( ! current_user_can( $capability ) ) {
				return false;
			}
		}

		$source_site_url = Options::get_connected_site_url_with_path();

		if ( '' === $source_site_url ) {
			return new WP_Error(
				'no_connected_site_url',
				__(
					'No source site is connected. Configure a valid connected site URL in the settings page before comparing.',
					'safe-publish'
				),
				array( 'status' => 500 )
			);
		}

		$source_post_id = (int) $request->get_param( 'postId' );

		if ( $source_post_id < 1 ) {
			return new WP_Error(
				'rest_invalid_param',
				__( 'Invalid post ID. Must be a positive integer.', 'safe-publish' ),
				array( 'status' => 400 )
			);
		}

		$local_post = $this->diff_renderer->find_local_post(
			$source_post_id,
			$mapped_post_type,
			$source_site_url
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
	 * Renders the diff preview for a source post.
	 *
	 * @param WP_REST_Request $req REST request object.
	 *
	 * @return array|WP_Error Diff payload, or the renderer's error.
	 */
	public function render_diff( WP_REST_Request $req ): array|WP_Error {
		return $this->diff_renderer->render_diff(
			$req,
			array( $this, 'make_request' ),
			Auth_Credential_Provider::get_credentials()
		);
	}
}
