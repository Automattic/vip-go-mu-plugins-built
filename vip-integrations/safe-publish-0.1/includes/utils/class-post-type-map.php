<?php
/**
 * Post Type Map utility class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Maps between WordPress post type slugs and REST API endpoints.
 */
class Post_Type_Map {

	/**
	 * REST endpoint (plural) => WordPress slug (singular).
	 *
	 * @var array<string, string>
	 */
	private const ENDPOINT_TO_SLUG = array(
		'posts'          => 'post',
		'pages'          => 'page',
		'attachments'    => 'attachment',
		'revisions'      => 'revision',
		'nav_menu_items' => 'nav_menu_item',
		'media'          => 'media',
		'navigation'     => 'navigation',
	);

	/**
	 * Determines whether a post type is a known WordPress built-in.
	 *
	 * Accepts either the slug or endpoint form. Built-ins have a core-fixed
	 * REST base, so callers can resolve them without consulting the source
	 * site.
	 *
	 * @param string $post_type Post type slug or REST endpoint.
	 * @return bool True when the type is a known built-in.
	 */
	public static function is_builtin( string $post_type ): bool {
		return isset( self::ENDPOINT_TO_SLUG[ $post_type ] )
			|| in_array( $post_type, self::ENDPOINT_TO_SLUG, true );
	}

	/**
	 * Converts a post type to its REST API endpoint form.
	 *
	 * Accepts either form — if already an endpoint, returns as-is.
	 * Unknown types pass through unchanged.
	 *
	 * @param string $post_type Post type slug or endpoint.
	 * @return string REST API endpoint.
	 */
	public static function to_rest_endpoint( string $post_type ): string {
		// Already an endpoint.
		if ( isset( self::ENDPOINT_TO_SLUG[ $post_type ] ) ) {
			return $post_type;
		}

		// Slug → endpoint via reverse lookup.
		$endpoint = array_search( $post_type, self::ENDPOINT_TO_SLUG, true );

		return false !== $endpoint ? $endpoint : $post_type;
	}

	/**
	 * Converts a REST API endpoint to its WordPress post type slug.
	 *
	 * Accepts either form — if already a slug, returns as-is.
	 * Unknown types pass through unchanged.
	 *
	 * @param string $post_type REST endpoint or post type slug.
	 * @return string WordPress post type slug.
	 */
	public static function to_wp_slug( string $post_type ): string {
		// Known endpoint → slug.
		if ( isset( self::ENDPOINT_TO_SLUG[ $post_type ] ) ) {
			return self::ENDPOINT_TO_SLUG[ $post_type ];
		}

		// Already a slug or unknown — pass through.
		return $post_type;
	}
}
