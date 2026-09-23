<?php

/**
 * Markdown access policy.
 *
 * @package Content_For_Agents
 */

declare( strict_types=1 );

namespace Content_For_Agents;

/**
 * Applies core access rules and provider-neutral integration vetoes.
 */
final class Markdown_Access {

	/**
	 * Access check for a Markdown response.
	 */
	public const CONTEXT_RESPONSE = 'response';

	/**
	 * Access check for public discovery output.
	 */
	public const CONTEXT_DISCOVERY = 'discovery';

	/**
	 * Whether Markdown may be served or advertised for a post.
	 *
	 * The filter can further restrict access, but cannot override the core post
	 * status, capability, preview, password, or post-type-support checks.
	 *
	 * @param \WP_Post $post    Post being checked.
	 * @param string   $context Access context.
	 * @return bool Whether access is allowed.
	 */
	public static function can_serve( \WP_Post $post, string $context = self::CONTEXT_RESPONSE ): bool {
		if ( ! post_type_supports( $post->post_type, 'content-for-agents' ) ) {
			return false;
		}

		if ( self::CONTEXT_DISCOVERY === $context ) {
			$core_allowed = 'publish' === $post->post_status && '' === $post->post_password;
		} else {
			$core_allowed = 'publish' === $post->post_status || current_user_can( 'read_post', $post->ID );

			if ( ! $core_allowed && ! empty( $_GET['preview'] ) && isset( $_GET['preview_nonce'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$nonce        = sanitize_text_field( wp_unslash( $_GET['preview_nonce'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
				$core_allowed = (bool) wp_verify_nonce( $nonce, 'post_preview_' . $post->ID );
			}

			if ( $core_allowed && post_password_required( $post ) && ! current_user_can( 'edit_post', $post->ID ) ) {
				$core_allowed = false;
			}
		}

		if ( ! $core_allowed ) {
			return false;
		}

		/**
		 * Filters whether Markdown access is allowed for a post.
		 *
		 * Returning false vetoes access. Returning true cannot override the core
		 * access checks above.
		 *
		 * @param bool     $allowed Whether access is allowed.
		 * @param \WP_Post $post    Post being checked.
		 * @param string   $context Access context: response or discovery.
		 */
		return (bool) apply_filters( 'content_for_agents_can_serve_markdown', true, $post, $context );
	}

	/**
	 * Whether a Markdown response may be stored in a shared cache.
	 *
	 * @param \WP_Post $post Post being checked.
	 * @return bool Whether shared caching is allowed.
	 */
	public static function can_cache( \WP_Post $post ): bool {
		$core_cacheable = 'publish' === $post->post_status && '' === $post->post_password
			&& ! is_user_logged_in() && ! is_preview() && ! isset( $_GET['preview'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

		if ( ! $core_cacheable ) {
			return false;
		}

		/**
		 * Filters whether a Markdown response may use the shared cache.
		 *
		 * Access-control integrations should return false when entitlement depends
		 * on cookies or other visitor-specific state.
		 *
		 * @param bool     $cacheable Whether shared caching is allowed.
		 * @param \WP_Post $post      Post being checked.
		 */
		return (bool) apply_filters( 'content_for_agents_can_cache_markdown', true, $post );
	}

	/**
	 * Whether public discovery output may use shared caches.
	 *
	 * Access filters may depend on visitor-specific state. When one is present,
	 * discovery output must bypass both the object cache and HTTP shared caches.
	 *
	 * @return bool Whether shared discovery caching is allowed.
	 */
	public static function can_cache_discovery(): bool {
		$core_cacheable = ! is_user_logged_in() && false === has_filter( 'content_for_agents_can_serve_markdown' );

		if ( ! $core_cacheable ) {
			return false;
		}

		/**
		 * Filters whether /llms.txt may use shared caches.
		 *
		 * Integrations that make discovery sections visitor-specific should return
		 * false. Returning true cannot override the core exclusions above.
		 *
		 * @param bool $cacheable Whether shared discovery caching is allowed.
		 */
		return (bool) apply_filters( 'content_for_agents_can_cache_llms_txt', true );
	}
}
