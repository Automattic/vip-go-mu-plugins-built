<?php
/**
 * Source Media REST Field class
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
 * Registers the safe_publish_media REST field so the destination can bring
 * each inline image's source library metadata (alt, title, caption,
 * description) when it sideloads the image.
 *
 * Inline images are referenced by bare URL, which core REST cannot resolve to
 * an attachment; the source does it here by scanning the post content and
 * mapping each of its media URLs to the raw attachment values. Populated only
 * for HMAC-authenticated single-item requests, the same gate as the author field.
 */
class Source_Media_REST_Field {

	/**
	 * REST field name added to public post type responses.
	 *
	 * @var string
	 */
	const FIELD_NAME = 'safe_publish_media';

	/**
	 * HMAC authenticator used to gate access to the field value.
	 *
	 * @var HMAC_Authenticator
	 */
	private HMAC_Authenticator $authenticator;

	/**
	 * Constructs the Source_Media_REST_Field instance.
	 *
	 * @param HMAC_Authenticator $authenticator HMAC authenticator instance.
	 */
	public function __construct( HMAC_Authenticator $authenticator ) {
		$this->authenticator = $authenticator;
	}

	/**
	 * Registers the rest_api_init hook that adds the REST field.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'register_field' ) );
	}

	/**
	 * Registers the safe_publish_media field on every public, REST-exposed
	 * post type, excluding attachments (which carry no inline media of their
	 * own).
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
	 * Returns the source URL => library metadata map for HMAC-authenticated
	 * single-item requests, and null otherwise so the field carries no data for
	 * public, cookie-authenticated, third-party, or collection consumers.
	 *
	 * @param array           $post_array Post data as built by WP_REST_Posts_Controller.
	 * @param string          $_attribute Field name (unused).
	 * @param WP_REST_Request $request    Current REST request.
	 * @return array<string, array<string, string>>|null Source URL => metadata,
	 *         or null when not HMAC-authenticated or not a single-item request.
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

		$post_id = isset( $post_array['id'] ) ? (int) $post_array['id'] : 0;
		$post    = $post_id > 0 ? get_post( $post_id ) : null;

		if ( ! $post instanceof WP_Post ) {
			return array();
		}

		return $this->resolve_media_metadata( (string) $post->post_content );
	}

	/**
	 * Scans content for this site's media URLs and maps each that resolves to an
	 * attachment to its raw library values. Keyed by the query-stripped URL to
	 * match the destination's lookup at sideload time.
	 *
	 * @param string $content Raw post content.
	 * @return array<string, array<string, string>> Source URL => metadata.
	 */
	private function resolve_media_metadata( string $content ): array {
		$host = wp_parse_url( home_url(), PHP_URL_HOST );

		if ( ! is_string( $host ) || '' === $host || '' === $content ) {
			return array();
		}

		$pattern = '#https?://' . preg_quote( $host, '#' ) . '/[^\s"\'<>()]+#i';

		if ( ! preg_match_all( $pattern, $content, $matches ) ) {
			return array();
		}

		$uploads_prefix = $this->uploads_path_prefix();
		$map            = array();

		foreach ( array_unique( $matches[0] ) as $raw_url ) {
			$url = strtok( $raw_url, '?' );

			if ( false === $url || isset( $map[ $url ] ) ) {
				continue;
			}

			// Only URLs under the uploads directory can resolve to an
			// attachment, so skip the rest without a query.
			if (
				'' !== $uploads_prefix
				&& ! $this->is_under_uploads( $url, $uploads_prefix )
			) {
				continue;
			}

			$attachment_id = $this->attachment_id_from_url( $url );

			if ( 0 === $attachment_id ) {
				continue;
			}

			$map[ $url ] = array(
				'alt'         => (string) get_post_meta(
					$attachment_id,
					'_wp_attachment_image_alt',
					true
				),
				'title'       => (string) get_post_field(
					'post_title',
					$attachment_id,
					'raw'
				),
				'caption'     => (string) get_post_field(
					'post_excerpt',
					$attachment_id,
					'raw'
				),
				'description' => (string) get_post_field(
					'post_content',
					$attachment_id,
					'raw'
				),
			);
		}

		return $map;
	}

	/**
	 * Resolves a URL to its attachment ID, preferring the VIP-optimized lookup,
	 * and confirms the ID belongs to an attachment. A sized rendition URL that
	 * no attachment stores verbatim falls back to the parent it derives from.
	 *
	 * @param string $url Media URL.
	 * @return int Attachment ID, or 0 when the URL is not an attachment.
	 */
	private function attachment_id_from_url( string $url ): int {
		$id = $this->lookup_attachment_id( $url );

		if ( 0 === $id ) {
			$id = $this->resolve_sized_url_parent( $url );
		}

		return 'attachment' === get_post_type( $id ) ? $id : 0;
	}

	/**
	 * Looks up an attachment ID by exact URL, preferring the VIP-optimized
	 * function. Returns the raw match without confirming the post type.
	 *
	 * @param string $url Media URL.
	 * @return int Attachment ID candidate, or 0 when there is no exact match.
	 */
	private function lookup_attachment_id( string $url ): int {
		if ( function_exists( 'wpcom_vip_attachment_url_to_postid' ) ) {
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.attachment_url_to_postid_wpcom_vip_attachment_url_to_postid
			return (int) wpcom_vip_attachment_url_to_postid( $url );
		}

		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.attachment_url_to_postid_attachment_url_to_postid
		return (int) attachment_url_to_postid( $url );
	}

	/**
	 * Resolves a sized image URL to the parent attachment it derives from.
	 * Strips the size suffix and looks up the parent, then confirms the URL is
	 * one of that parent's registered sizes, so metadata is never borrowed from
	 * an unrelated attachment that merely shares the base filename.
	 *
	 * @param string $url Sized media URL.
	 * @return int Parent attachment ID, or 0 when not a known rendition.
	 */
	private function resolve_sized_url_parent( string $url ): int {
		$parent_url = preg_replace( '/-\d+x\d+(?=\.[a-zA-Z0-9]+$)/', '', $url );

		if ( ! is_string( $parent_url ) || $parent_url === $url ) {
			return 0;
		}

		$parent_id = $this->lookup_attachment_id( $parent_url );

		if (
			$parent_id > 0
			&& $this->is_rendition_of( $url, $parent_id )
		) {
			return $parent_id;
		}

		return 0;
	}

	/**
	 * Checks whether a URL's filename is one of the sizes WordPress registered
	 * for the given attachment, marking it a genuine rendition of that item.
	 *
	 * @param string $url       Sized media URL.
	 * @param int    $parent_id Candidate parent attachment.
	 * @return bool True when the URL matches a registered size file.
	 */
	private function is_rendition_of( string $url, int $parent_id ): bool {
		$metadata = wp_get_attachment_metadata( $parent_id );

		if (
			! is_array( $metadata )
			|| ! isset( $metadata['sizes'] )
			|| ! is_array( $metadata['sizes'] )
		) {
			return false;
		}

		$filename = wp_basename( (string) wp_parse_url( $url, PHP_URL_PATH ) );

		foreach ( $metadata['sizes'] as $size ) {
			if (
				is_array( $size )
				&& isset( $size['file'] )
				&& $size['file'] === $filename
			) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns the uploads directory path used to skip non-media URLs before an
	 * attachment lookup, or an empty string when it is not usable as a filter
	 * (uploads at the web root), so every match is scanned instead.
	 *
	 * @return string Uploads path without a trailing slash, or empty string.
	 */
	private function uploads_path_prefix(): string {
		$uploads = wp_get_upload_dir();
		$baseurl = (string) ( $uploads['baseurl'] ?? '' );
		$path    = wp_parse_url( $baseurl, PHP_URL_PATH );

		if ( ! is_string( $path ) || '' === $path || '/' === $path ) {
			return '';
		}

		return untrailingslashit( $path );
	}

	/**
	 * Checks whether a URL's path lies under the uploads directory. Compares by
	 * path so a scheme or CDN-host difference never excludes a real attachment;
	 * a different host would already be dropped by the host-anchored scan.
	 *
	 * @param string $url            Media URL.
	 * @param string $uploads_prefix Uploads path without a trailing slash.
	 * @return bool True when the URL path is under the uploads directory.
	 */
	private function is_under_uploads( string $url, string $uploads_prefix ): bool {
		$path = wp_parse_url( $url, PHP_URL_PATH );

		return is_string( $path )
			&& str_starts_with( $path, $uploads_prefix . '/' );
	}

	/**
	 * Detects whether the request resolves a single post via its id route
	 * parameter, rather than a collection route carrying an id query parameter.
	 *
	 * @param WP_REST_Request $request Current REST request.
	 * @return bool True when the route bound a positive numeric id.
	 */
	private function is_single_item_request( WP_REST_Request $request ): bool {
		$request_id = $request->get_url_params()['id'] ?? null;

		return is_numeric( $request_id ) && (int) $request_id > 0;
	}
}
