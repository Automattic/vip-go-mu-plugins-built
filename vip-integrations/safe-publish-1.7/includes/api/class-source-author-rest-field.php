<?php
/**
 * Source Author REST Field class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Auth\HMAC_Authenticator;
use WP_Post;
use WP_REST_Request;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the `safe_publish_author` REST field on public, REST-exposed post
 * types so the destination site can resolve the source author when importing.
 *
 * The field is only populated for requests authenticated by Safe Publish HMAC.
 * For any other consumer (public, cookie-authenticated admin, third-party
 * client) the callback returns null, so no source author PII is exposed.
 */
class Source_Author_REST_Field {

	/**
	 * REST field name added to public post type responses.
	 *
	 * @var string
	 */
	const FIELD_NAME = 'safe_publish_author';

	/**
	 * HMAC authenticator used to gate access to the field value.
	 *
	 * @var HMAC_Authenticator
	 */
	private HMAC_Authenticator $authenticator;

	/**
	 * Constructs the Source_Author_REST_Field instance.
	 *
	 * @param HMAC_Authenticator $authenticator HMAC authenticator instance.
	 */
	public function __construct( HMAC_Authenticator $authenticator ) {
		$this->authenticator = $authenticator;
	}

	/**
	 * Registers the `rest_api_init` hook that adds the REST field.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_field' ) );
	}

	/**
	 * Registers the `safe_publish_author` field on every public, REST-exposed
	 * post type, excluding attachments.
	 *
	 * Attachments are public and REST-exposed but the destination never reads
	 * source author info from media responses — it only needs source_url. We
	 * exclude them so attachment uploader PII is not transmitted on every
	 * featured-image fetch.
	 */
	public function register_field(): void {
		$post_types = get_post_types(
			array(
				'public'       => true,
				'show_in_rest' => true,
			)
		);

		unset( $post_types['attachment'] );

		register_rest_field(
			array_values( $post_types ),
			self::FIELD_NAME,
			array(
				'get_callback' => array( $this, 'get_callback' ),
				'schema'       => null,
			)
		);
	}

	/**
	 * Returns the source author payload for HMAC-authenticated single-item
	 * requests.
	 *
	 * Returns null for non-HMAC requests, so the field carries no source author
	 * PII for public, cookie-authenticated, or third-party consumers, and for
	 * collection requests, to keep author PII off list responses.
	 *
	 * @param array           $post_array Post data as built by WP_REST_Posts_Controller.
	 * @param string          $_attribute Field name (unused).
	 * @param WP_REST_Request $request    Current REST request.
	 * @return array{email: string, login: string, display_name: string}|null
	 *         Author payload, or null when not HMAC-authenticated or not a
	 *         single-item request.
	 */
	public function get_callback(
		array $post_array,
		// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed
		string $_attribute,
		WP_REST_Request $request
	): ?array {
		if ( ! $this->authenticator->is_authenticated() ) {
			return null;
		}

		if ( ! $this->is_single_item_request( $request ) ) {
			return null;
		}

		$post_id     = isset( $post_array['id'] ) ? (int) $post_array['id'] : 0;
		$post_object = $post_id > 0 ? get_post( $post_id ) : null;

		if ( ! $post_object instanceof WP_Post ) {
			return $this->empty_author();
		}

		$author_id = (int) $post_object->post_author;
		$user      = $author_id > 0 ? get_userdata( $author_id ) : false;

		if ( false === $user ) {
			return $this->empty_author();
		}

		return array(
			'email'        => (string) $user->user_email,
			'login'        => (string) $user->user_login,
			'display_name' => (string) $user->display_name,
		);
	}

	/**
	 * Returns an empty author payload used when the source post has no
	 * resolvable author (author ID 0, or the user has been deleted).
	 *
	 * The destination distinguishes this case from "field absent" to surface a
	 * specific error message to the operator.
	 *
	 * @return array{email: string, login: string, display_name: string} Empty author payload.
	 */
	private function empty_author(): array {
		return array(
			'email'        => '',
			'login'        => '',
			'display_name' => '',
		);
	}

	/**
	 * Detects whether the request resolves a single post via its `id` route
	 * parameter (e.g. `/wp/v2/{post_type}/{id}`).
	 *
	 * Reads the matched URL parameter rather than get_param() so a query string
	 * such as `?id=5` on a collection route is not mistaken for a single-item
	 * request.
	 *
	 * @param WP_REST_Request $request Current REST request.
	 * @return bool True when the route bound a positive numeric `id`.
	 */
	private function is_single_item_request( WP_REST_Request $request ): bool {
		$request_id = $request->get_url_params()['id'] ?? null;

		return is_numeric( $request_id ) && (int) $request_id > 0;
	}
}
