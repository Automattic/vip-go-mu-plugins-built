<?php declare(strict_types = 1);

namespace VIPRealTimeCollaboration\Overrides;

defined( 'ABSPATH' ) || exit();

use VIPRealTimeCollaboration\Compatibility\Compatibility;
use function add_filter;
use function get_post;

use WP_Post;

/**
 * Class to handle overrides for the Block Editor functionality.
 *
 * This class disables the post lock functionality in the Block Editor,
 * allowing multiple users to edit the same post simultaneously.
 */
final class Overrides {
	/**
	 * Constructor to initialize the overrides.
	 */
	public function __construct() {
		// Ensure that the _edit_lock meta key is never returned, effectively disabling the post lock functionality just for revisions.php.
		add_filter( 'get_post_metadata', [ $this, 'filter_post_meta' ], 10, 3 );
	}

	/**
	 * Set the _edit_lock meta key to empty string, to disable post locking on revisions.php only.
	 *
	 * @param mixed $value the current meta value.
	 * @param int   $object_id the object ID.
	 * @param string $meta_key the meta key.
	 * @return mixed the filtered meta value.
	 * @psalm-suppress PossiblyUnusedReturnValue
	 */
	public function filter_post_meta( mixed $value, int $object_id, string $meta_key ): mixed {
		global $pagenow;

		// Skip if not on the revisions.php page, or the meta_key is not _edit_lock.
		if ( 'revision.php' !== $pagenow || '_edit_lock' !== $meta_key ) {
			return $value;
		}

		// Get the post, and supported post types for collaboration.
		$supported_post_types = Compatibility::get_supported_post_types();
		/** @var WP_Post|null $post */
		$post = get_post( $object_id );

		// If the post exists, and supports collaboration, return an empty string to disable the lock.
		if ( $post && in_array( $post->post_type, $supported_post_types, true ) ) {
			return '';
		}

		// Otherwise, return the original value.
		return $value;
	}
}
