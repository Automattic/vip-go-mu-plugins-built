<?php
/**
 * Dashboard link utility class
 *
 * @package Parsely
 * @since   3.1.0
 */

declare(strict_types=1);

namespace Parsely;

use WP_Post;
use Parsely\Parsely;

/**
 * Utility methods to build and generate dashboard links.
 *
 * @since 3.1.0
 */
class Dashboard_Link {
	/**
	 * Generates the Parse.ly dashboard URL for the post. Returns an empty
	 * string if the URL could not be generated.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to class-dashboard-link.php. Added source parameter.
	 * @since 3.16.1 Made the $campaign and $source parameters optional.
	 *
	 * @param WP_Post $post   Which post object or ID to check.
	 * @param string  $site_id Site ID or empty string.
	 * @param string  $campaign Campaign name for the `utm_campaign` URL parameter.
	 * @param string  $source Source name for the `utm_source` URL parameter.
	 * @return string
	 */
	public static function generate_url( WP_Post $post, string $site_id, string $campaign = '', string $source = '' ): string {
		/**
		 * Internal variable.
		 *
		 * @var string|false
		 */
		$permalink = get_permalink( $post );
		if ( ! is_string( $permalink ) ) {
			return '';
		}

		$query_args = array(
			'url'          => rawurlencode( $permalink ),
			'utm_campaign' => $campaign,
			'utm_source'   => $source,
			'utm_medium'   => 'wp-parsely',
		);

		if ( '' === $campaign ) {
			unset( $query_args['utm_campaign'] );
		}

		if ( '' === $source ) {
			unset( $query_args['utm_source'] );
		}

		if ( ! isset( $query_args['utm_campaign'] ) && ! isset( $query_args['utm_source'] ) ) {
			unset( $query_args['utm_medium'] );
		}

		return add_query_arg( $query_args, Parsely::get_dash_url( $site_id ) );
	}

	/**
	 * Determines whether Parse.ly dashboard link should be shown or not.
	 *
	 * @since 2.6.0
	 * @since 3.1.0 Moved to class-dashboard-link.php. Renamed from `cannot_show_parsely_link`.
	 *
	 * @param WP_Post $post    Which post object or ID to check.
	 * @param Parsely $parsely Parsely object.
	 * @return bool True if the link can be shown, false otherwise.
	 */
	public static function can_show_link( WP_Post $post, Parsely $parsely ): bool {
		return Parsely::post_has_trackable_status( $post ) && is_post_type_viewable( $post->post_type ) && ! $parsely->site_id_is_missing();
	}
}
