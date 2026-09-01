<?php
/**
 * Term assignment state used when reverting post updates.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Captures and restores the term assignments an update can replace.
 */
final class Term_Assignment_State {

	/**
	 * Captures assignments for the taxonomies present in an update.
	 *
	 * @param int          $post_id Post ID.
	 * @param array|object $terms   Incoming terms keyed by taxonomy.
	 * @return array<string, int[]> Term IDs keyed by taxonomy.
	 */
	public static function capture( int $post_id, array|object $terms ): array {
		$assignments = array();

		foreach ( (array) $terms as $taxonomy => $_ ) {
			$taxonomy = sanitize_key( (string) $taxonomy );

			if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			$term_ids = wp_get_object_terms(
				$post_id,
				$taxonomy,
				array( 'fields' => 'ids' )
			);

			if ( ! is_wp_error( $term_ids ) ) {
				$assignments[ $taxonomy ] = array_map( 'intval', $term_ids );
			}
		}

		return $assignments;
	}

	/**
	 * Validates captured assignment structure before a rollback changes a post.
	 *
	 * @param array $assignments Term IDs keyed by taxonomy.
	 * @return true|WP_Error True when every recorded assignment is well formed.
	 */
	public static function validate( array $assignments ): true|WP_Error {
		foreach ( $assignments as $_ => $term_ids ) {
			if ( ! is_array( $term_ids ) ) {
				return new WP_Error(
					'invalid_term_assignment_snapshot',
					__( 'The saved term assignments are invalid.', 'safe-publish' )
				);
			}

			foreach ( $term_ids as $term_id ) {
				if ( ! is_int( $term_id ) || $term_id <= 0 ) {
					return new WP_Error(
						'invalid_term_assignment_snapshot',
						__( 'The saved term assignments are invalid.', 'safe-publish' )
					);
				}
			}
		}

		return true;
	}

	/**
	 * Returns why a taxonomy assignment cannot currently be restored.
	 *
	 * @param string $taxonomy Taxonomy slug.
	 * @param int[]  $term_ids Term IDs.
	 * @return string|null Unavailable reason, or null when restorable.
	 */
	public static function unavailable_reason(
		string $taxonomy,
		array $term_ids
	): ?string {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			return 'taxonomy_unavailable';
		}

		foreach ( $term_ids as $term_id ) {
			if ( null === term_exists( $term_id, $taxonomy ) ) {
				return 'term_unavailable';
			}
		}

		return null;
	}

	/**
	 * Restores captured assignments.
	 *
	 * @param int                  $post_id     Post ID.
	 * @param array<string, int[]> $assignments Term IDs keyed by taxonomy.
	 * @return true|WP_Error True on success, or an error from WordPress.
	 */
	public static function restore(
		int $post_id,
		array $assignments
	): true|WP_Error {
		$first_error = null;

		foreach ( $assignments as $taxonomy => $term_ids ) {
			$taxonomy = (string) $taxonomy;
			$reason   = self::unavailable_reason( $taxonomy, $term_ids );
			$result   = null === $reason ? null : new WP_Error(
				'rollback_' . $reason,
				__( 'A taxonomy term needed for this rollback is unavailable.', 'safe-publish' )
			);

			if ( null === $result ) {
				$result = wp_set_object_terms(
					$post_id,
					array_map( 'intval', $term_ids ),
					$taxonomy,
					false
				);
			}

			if ( is_wp_error( $result ) && null === $first_error ) {
				$first_error = $result;
			}
		}

		return null === $first_error ? true : $first_error;
	}
}
