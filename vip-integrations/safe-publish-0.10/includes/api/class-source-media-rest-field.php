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
 * Registers three sibling REST fields the destination reads when it sideloads a
 * post's media, all gated to HMAC-authenticated single-item requests. Each
 * resolves what core REST cannot expose on its own:
 *
 * - safe_publish_media: Source library metadata (alt, title, caption,
 *   description) and source parent for each inline image, keyed by media URL,
 *   which core cannot resolve to an attachment.
 * - safe_publish_attached_media: The ordered { id, menu_order } set a bare
 *   [gallery]/[playlist] renders, referenced by neither URL nor id and whose
 *   menu_order the media REST omits.
 * - safe_publish_referenced_media: The post's attached image/audio/video
 *   children grouped by type, each an ordered { id, menu_order } set, so a
 *   cross-post [gallery id="B"] elsewhere can pull the set B renders. Not
 *   content-gated: The referencing post, not this one, renders the set.
 */
class Source_Media_REST_Field {

	/**
	 * REST field name added to public post type responses.
	 *
	 * @var string
	 */
	const FIELD_NAME = 'safe_publish_media';

	/**
	 * REST field name carrying the bare gallery/playlist attached-media set.
	 *
	 * @var string
	 */
	const ATTACHED_FIELD_NAME = 'safe_publish_attached_media';

	/**
	 * REST field name carrying a post's attached media grouped by type, for a
	 * cross-post gallery/playlist reference to pull.
	 *
	 * @var string
	 */
	const REFERENCED_FIELD_NAME = 'safe_publish_referenced_media';

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

		register_rest_field(
			array_values( $post_types ),
			self::ATTACHED_FIELD_NAME,
			array(
				'get_callback' => array( $this, 'get_attached_callback' ),
				'schema'       => null,
			)
		);

		register_rest_field(
			array_values( $post_types ),
			self::REFERENCED_FIELD_NAME,
			array(
				'get_callback' => array( $this, 'get_referenced_callback' ),
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
	 * Returns the ordered { id, menu_order } attached-media set a bare
	 * [gallery]/[playlist] renders, for HMAC-authenticated single-item requests,
	 * and null otherwise so the field carries no data for other consumers.
	 *
	 * @param array           $post_array Post data as built by WP_REST_Posts_Controller.
	 * @param string          $_attribute Field name (unused).
	 * @param WP_REST_Request $request    Current REST request.
	 * @return list<array{id: int, menu_order: int}>|null Attached-media set, or
	 *         null when not HMAC-authenticated or not a single-item request.
	 */
	public function get_attached_callback(
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

		return $this->resolve_attached_media( $post );
	}

	/**
	 * Returns the post's attached media grouped by type for HMAC-authenticated
	 * single-item requests, and null otherwise. Serves a cross-post reference
	 * on another post, so it is not content-gated.
	 *
	 * @param array           $post_array Post data as built by WP_REST_Posts_Controller.
	 * @param string          $_attribute Field name (unused).
	 * @param WP_REST_Request $request    Current REST request.
	 * @return array<string, list<array{id: int, menu_order: int}>>|null Grouped
	 *         attached media, or null when not HMAC-authenticated or not a
	 *         single-item request.
	 */
	public function get_referenced_callback(
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

		return $this->resolve_referenced_media( $post );
	}

	/**
	 * Groups the post's attached image, audio, and video children into ordered
	 * { id, menu_order } sets, keyed by media type. Empty types are omitted.
	 *
	 * @param WP_Post $post Post being requested.
	 * @return array<string, list<array{id: int, menu_order: int}>> Grouped sets.
	 */
	private function resolve_referenced_media( WP_Post $post ): array {
		$groups = array();

		foreach ( array( 'image', 'audio', 'video' ) as $mime_type ) {
			$items = array();

			foreach ( $this->attached_children( $post->ID, $mime_type ) as $child ) {
				$items[] = array(
					'id'         => (int) $child->ID,
					'menu_order' => (int) $child->menu_order,
				);
			}

			if ( array() !== $items ) {
				$groups[ $mime_type ] = $items;
			}
		}

		return $groups;
	}

	/**
	 * Normalizes a raw { id, menu_order } list decoded from an attached- or
	 * referenced-media field, dropping malformed entries and any without a
	 * positive id. The canonical validator for both consumer-side fields.
	 *
	 * @param mixed $items Raw list from a decoded REST field.
	 * @return list<array{id: int, menu_order: int}> Validated set.
	 */
	public static function normalize_menu_order_set( mixed $items ): array {
		if ( ! is_array( $items ) ) {
			return array();
		}

		$set = array();

		foreach ( $items as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}

			$id = isset( $item['id'] ) ? absint( $item['id'] ) : 0;
			if ( 0 === $id ) {
				continue;
			}

			$set[] = array(
				'id'         => $id,
				'menu_order' => isset( $item['menu_order'] ) ? (int) $item['menu_order'] : 0,
			);
		}

		return $set;
	}

	/**
	 * Collects the attached children the post's bare gallery/playlist shortcodes
	 * render, as an ordered { id, menu_order } list. Empty when no bare shortcode
	 * is present, so the whole attached library is never returned.
	 *
	 * @param WP_Post $post Post being requested.
	 * @return list<array{id: int, menu_order: int}> Ordered attached-media set.
	 */
	private function resolve_attached_media( WP_Post $post ): array {
		$items = array();

		foreach ( $this->bare_shortcode_mime_types( $post ) as $mime_type ) {
			foreach ( $this->attached_children( $post->ID, $mime_type ) as $child ) {
				$items[] = array(
					'id'         => (int) $child->ID,
					'menu_order' => (int) $child->menu_order,
				);
			}
		}

		return $items;
	}

	/**
	 * Returns the attachment MIME types the post's bare gallery/playlist
	 * shortcodes render: image for a bare gallery, audio or video (per its type)
	 * for a bare playlist. Non-bare shortcodes are skipped.
	 *
	 * @param WP_Post $post Post whose content is scanned.
	 * @return list<string> MIME type prefixes to collect, empty when none is bare.
	 */
	private function bare_shortcode_mime_types( WP_Post $post ): array {
		$content = (string) $post->post_content;

		if (
			false === stripos( $content, '[gallery' )
			&& false === stripos( $content, '[playlist' )
		) {
			return array();
		}

		$pattern = '/' . get_shortcode_regex( array( 'gallery', 'playlist' ) ) . '/s';
		$count   = preg_match_all( $pattern, $content, $matches, PREG_SET_ORDER );

		if ( ! is_int( $count ) || 0 === $count ) {
			return array();
		}

		$mime_types = array();

		foreach ( $matches as $match ) {
			// Escaped [[gallery]] literal, not a live shortcode.
			if ( '[' === $match[1] && ']' === $match[6] ) {
				continue;
			}

			$atts = shortcode_parse_atts( $match[3] );
			$atts = is_array( $atts ) ? $atts : array();

			if ( ! $this->is_bare_own_shortcode( $atts, (int) $post->ID ) ) {
				continue;
			}

			$mime_type = 'playlist' === $match[2]
				? $this->playlist_mime_type( $atts )
				: 'image';

			if ( ! in_array( $mime_type, $mime_types, true ) ) {
				$mime_types[] = $mime_type;
			}
		}

		return $mime_types;
	}

	/**
	 * Reports whether a gallery/playlist shortcode renders the post's own
	 * attached media: No non-empty ids/include/exclude selector, and no id
	 * naming a different post.
	 *
	 * @param array<string, string> $atts    Parsed shortcode attributes.
	 * @param int                   $post_id Post the shortcode belongs to.
	 * @return bool True when the shortcode is bare and self-referential.
	 */
	private function is_bare_own_shortcode( array $atts, int $post_id ): bool {
		if (
			$this->has_selector_att( $atts, 'ids' )
			|| $this->has_selector_att( $atts, 'include' )
			|| $this->has_selector_att( $atts, 'exclude' )
		) {
			return false;
		}

		return ! isset( $atts['id'] ) || (int) $atts['id'] === $post_id;
	}

	/**
	 * Reports whether a shortcode selector attribute holds a non-empty value,
	 * mirroring core's ! empty() gate on ids/include/exclude: An absent or empty
	 * selector (including "0") leaves the shortcode bare.
	 *
	 * @param array<string, string> $atts Parsed shortcode attributes.
	 * @param string                $key  Selector attribute name.
	 * @return bool True when the attribute selects an explicit set.
	 */
	private function has_selector_att( array $atts, string $key ): bool {
		return isset( $atts[ $key ] )
			&& '' !== $atts[ $key ]
			&& '0' !== $atts[ $key ];
	}

	/**
	 * Returns the MIME type a playlist renders, mirroring wp_playlist_shortcode:
	 * audio only when the type attribute is exactly audio (its default), video
	 * for every other value.
	 *
	 * @param array<string, string> $atts Parsed shortcode attributes.
	 * @return string 'audio' or 'video'.
	 */
	private function playlist_mime_type( array $atts ): string {
		$type = isset( $atts['type'] ) ? (string) $atts['type'] : 'audio';

		return 'audio' === $type ? 'audio' : 'video';
	}

	/**
	 * Returns the post's attached children of a MIME type in the order a bare
	 * gallery/playlist renders them (menu_order then ID), matching core's
	 * get_children query.
	 *
	 * @param int    $post_id   Parent post ID.
	 * @param string $mime_type Attachment MIME type prefix.
	 * @return list<WP_Post> Attached children in render order.
	 */
	private function attached_children( int $post_id, string $mime_type ): array {
		$children = get_children(
			array(
				'post_parent'    => $post_id,
				'post_status'    => 'inherit',
				'post_type'      => 'attachment',
				'post_mime_type' => $mime_type,
				'orderby'        => 'menu_order ID',
				'order'          => 'ASC',
				// TODO: Paginate while preserving the complete rendered set.
				// phpcs:ignore WordPressVIPMinimum.Performance.NoPaging
				'numberposts'    => -1,
			)
		);

		return array_values(
			array_filter(
				$children,
				static fn ( $child ): bool => $child instanceof WP_Post
			)
		);
	}

	/**
	 * Scans content for this site's media URLs and maps each that resolves to an
	 * attachment to its raw library values and source parent post. Keyed by the
	 * query-stripped URL to match the destination's lookup at sideload time.
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
		$count   = preg_match_all( $pattern, $content, $matches );

		if ( ! is_int( $count ) || 0 === $count ) {
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
				// Source parent post, so the destination can re-parent its copy.
				'parent'      => (string) (int) wp_get_post_parent_id( $attachment_id ),
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
