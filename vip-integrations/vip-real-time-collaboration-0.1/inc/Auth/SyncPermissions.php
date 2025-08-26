<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Auth;

use WP_Error;

defined( 'ABSPATH' ) || exit;

/**
 * Handles permission checking for sync objects using custom sync capabilities
 */
final class SyncPermissions {
	/**
	 * Initialize custom sync capabilities.
	 * Sets up meta capability mapping and role capabilities.
	 */
	public static function init(): void {
		add_filter( 'map_meta_cap', [ __CLASS__, 'map_sync_capabilities' ], 10, 4 );
		add_action( 'init', [ __CLASS__, 'setup_default_capabilities' ] );
	}

	/**
	 * Check if the current user can sync the specified object.
	 *
	 * @param string $sync_object_type The sync object type in format 'entity_kind/entity_name' (e.g., 'postType/Posts').
	 * @param string $sync_object_id   The sync object ID (e.g., post ID).
	 */
	public static function can_sync(
		string $sync_object_type,
		string $sync_object_id,
	): WP_Error|bool {
		$user_check_result = self::check_current_user();
		if ( is_wp_error( $user_check_result ) ) {
			return $user_check_result;
		}

		// Parse sync object type (format: kind/name)
		$parts = explode( '/', $sync_object_type, 2 );
		if ( count( $parts ) !== 2 ) {
			return new WP_Error(
				'invalid_sync_object_type',
				__( 'Invalid sync object type format. Expected: entity_kind/entity_name', 'vip-real-time-collaboration' )
			);
		}

		// Extract Gutenberg entity kind and name from sync object type
		[ $entity_kind, $entity_name ] = $parts;

		// Handle post type entities
		if ( 'postType' === $entity_kind ) {
			/**
			 * For post entities, we only need the sync object ID (post ID) for permission checking.
			 * The entity_name is Gutenberg's entity name which maps to post type name instead of
			 * post type slug, but we can determine the post type from the post ID by fetching post
			 * using the ID and then getting the post type from the post object.
			 */
			return self::check_post_sync_permissions( $sync_object_id );
		}

		// Allow extensions to handle other sync object types via filter
		return self::check_custom_sync_permissions( $entity_kind, $entity_name, $sync_object_id );
	}

	/**
	 * Check if the current user is logged in and has a valid user ID.
	 *
	 * @return WP_Error|bool True if the user is logged in and has a valid user ID, otherwise a WP_Error.
	 */
	private static function check_current_user(): WP_Error|bool {
		// Check if user is logged in
		if ( ! is_user_logged_in() ) {
			return new WP_Error(
				'user_not_logged_in',
				__( 'User is not logged in.', 'vip-real-time-collaboration' )
			);
		}

		$current_user = wp_get_current_user();

		// Check if user ID is valid (not 0)
		if ( 0 === $current_user->ID ) {
			return new WP_Error(
				'invalid_user_id',
				__( 'Invalid user.', 'vip-real-time-collaboration' )
			);
		}

		return true;
	}

	/**
	 * Check sync permission for a specific post.
	 *
	 * @param string $post_id The post ID.
	 */
	private static function check_post_sync_permissions(
		string $post_id
	): WP_Error|bool {
		// Validate post ID format
		if ( ! is_numeric( $post_id ) ) {
			return new WP_Error(
				'invalid_post_id',
				__( 'Post ID must be numeric', 'vip-real-time-collaboration' )
			);
		}

		/** @var int $parsed_post_id */
		$parsed_post_id = absint( $post_id );

		// Check sync_post capability (will be mapped to edit_post via map_meta_cap)
		/** @var bool|WP_Error $can_sync_post */
		$can_sync_post = true;
		if ( ! current_user_can( 'sync_post', $parsed_post_id ) ) {
			$can_sync_post = new WP_Error(
				'insufficient_sync_permissions',
				__( 'You do not have permission to sync this content', 'vip-real-time-collaboration' )
			);
		}

		/**
		 * Allow customizing the permission check for a specific post.
		 *
		 * @param bool|WP_Error $result  The result of the permission check.
		 * @param int           $post_id The post ID.
		 */
		/** @var bool|WP_Error */
		return apply_filters(
			'vip_rtc_post_sync_check_permission',
			$can_sync_post,
			$parsed_post_id
		);
	}

	/**
	 * Check permission for custom sync object types via filters.
	 * Currently resolves to true by default.
	 *
	 * @param string $entity_kind The Gutenberg entity kind (e.g., 'postType', 'root').
	 * @param string $entity_name The Gutenberg entity name (e.g., 'post', 'site').
	 * @param string $entity_id   The Gutenberg entity ID (e.g. '12' for postType).
	 */
	private static function check_custom_sync_permissions(
		string $entity_kind,
		string $entity_name,
		string $entity_id
	): WP_Error|bool {
		/**
		 * Allow customizing the permission check for a specific sync object type.
		 *
		 * @param bool|WP_Error $result            The result of the permission check.
		 * @param string        $entity_kind       The Gutenberg entity kind.
		 * @param string        $entity_name       The Gutenberg entity name.
		 * @param string        $entity_id    The Gutenberg entity ID (e.g. '12' for postType).
		 */
		/** @var bool|WP_Error */
		return apply_filters(
			'vip_rtc_entity_sync_check_permission',
			true,
			$entity_kind,
			$entity_name,
			$entity_id
		);
	}

	/**
	 * Map sync capabilities to WordPress post capabilities.
	 *
	 * @param string[] $caps    Primitive capabilities required.
	 * @param string   $cap     Capability being mapped.
	 * @param int      $user_id User ID.
	 * @param array    $args    Additional arguments.
	 * @return string[] Mapped capabilities.
	 * @psalm-suppress PossiblyUnusedReturnValue
	 */
	public static function map_sync_capabilities( array $caps, string $cap, int $user_id, array $args ): array {
		// Handle sync_post capability
		if ( 'sync_post' === $cap ) {
			/** @var int $post_id */
			$post_id = $args[0];

			// Map to edit_post capability with the same arguments
			return map_meta_cap( 'edit_post', $user_id, $post_id );
		}

		return $caps;
	}

	/**
	 * Set up default sync capabilities for WordPress roles.
	 */
	public static function setup_default_capabilities(): void {
		// Give sync_post capability to roles that can edit posts
		$roles_to_update = [ 'administrator', 'editor', 'author', 'contributor' ];

		foreach ( $roles_to_update as $role_name ) {
			$role = get_role( $role_name );
			if ( $role && ! $role->has_cap( 'sync_post' ) ) {
				$role->add_cap( 'sync_post' );
			}
		}
	}
}
