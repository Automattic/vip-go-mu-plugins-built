<?php
/**
 * Meta Terms Manager class
 *
 * Handles updating post metadata and taxonomies/terms.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Options;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Meta_Terms_Manager Class.
 *
 * Responsible for managing post meta and taxonomy term assignments.
 */
final class Meta_Terms_Manager {

	/**
	 * Updates post meta based on provided input.
	 *
	 * Accepts array or object; keys are meta keys, values are meta values.
	 *
	 * Returns true on success, or a WP_Error listing any keys that could not
	 * be written due to a database error.
	 *
	 * @param int          $post_id Post ID to update meta for.
	 * @param array|object $meta    Meta to set.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public function update_meta( int $post_id, array|object $meta ): true|WP_Error {
		// Update meta if provided (accept object or array).
		$meta_array = (array) $meta;
		if ( array() !== $meta_array ) {
			$failed_keys = array();

			foreach ( $meta_array as $meta_key => $meta_value ) {
				$key    = sanitize_text_field( (string) $meta_key );
				$result = update_post_meta( $post_id, $key, $meta_value );

				if ( false === $result ) {
					// update_post_meta() also returns false when the stored
					// value is already identical. Read it back to avoid
					// reporting a false failure on re-imports.
					if ( get_post_meta( $post_id, $key, true ) !== $meta_value ) {
						$failed_keys[] = $key;
					}
				}
			}

			if ( array() !== $failed_keys ) {
				return new WP_Error(
					'meta_update_failed',
					sprintf(
						/* translators: %s: comma-separated list of meta keys */
						__( 'Failed to update post meta key(s): %s.', 'safe-publish' ),
						implode( ', ', $failed_keys )
					)
				);
			}
		}

		return true;
	}

	/**
	 * Updates post terms (taxonomies) based on provided input.
	 *
	 * Accepts array or object; supports term IDs, slugs, names, or objects
	 * with id/term_id, slug, name, source_term_id. Creates terms if they do
	 * not exist. When `$source_site_url` is non-empty and an item carries a
	 * `source_term_id`, records the source ID and URL on the resolved term
	 * (both newly created and slug-matched) so later imports referencing the
	 * term by source ID can remap to the destination term.
	 *
	 * Returns true on success, or a WP_Error when a taxonomy does not exist on
	 * this site, when a term cannot be created, or when assigning terms fails.
	 *
	 * @param int          $post_id         Post ID to update terms for.
	 * @param array|object $terms           Terms to set, keyed by taxonomy.
	 * @param string       $source_site_url Source site URL paired with any
	 *                                      source_term_id meta written. Empty
	 *                                      string disables source-meta writes.
	 * @return true|WP_Error True on success, WP_Error on failure.
	 */
	public function update_terms(
		int $post_id,
		array|object $terms,
		string $source_site_url = ''
	): true|WP_Error {
		$terms_array = (array) $terms;
		if ( array() === $terms_array ) {
			return true;
		}

		foreach ( $terms_array as $raw_tax => $term_items ) {
			$tax = sanitize_key( (string) $raw_tax );

			if ( ! taxonomy_exists( $tax ) ) {
				return new WP_Error(
					'unknown_taxonomy',
					sprintf(
						/* translators: %s: taxonomy name */
						__( 'Taxonomy "%s" does not exist on this site.', 'safe-publish' ),
						$tax
					)
				);
			}

			$items    = is_array( $term_items ) ? $term_items : (array) $term_items;
			$term_ids = array();

			foreach ( $items as $item ) {
				$resolved = $this->resolve_term( $item, $tax, $source_site_url );

				if ( is_wp_error( $resolved ) ) {
					return $resolved;
				}

				if ( $resolved > 0 ) {
					$term_ids[] = $resolved;
				}
			}

			if ( ! empty( $term_ids ) ) {
				$result = wp_set_post_terms( $post_id, $term_ids, $tax, false );

				if ( is_wp_error( $result ) ) {
					return $result;
				}
			}
		}

		return true;
	}

	/**
	 * Resolves a single term item to a destination term ID, creating the term
	 * when needed and writing source-term metadata when a source ID is known.
	 *
	 * @param mixed  $item            Raw item: int, string, array, or object.
	 * @param string $tax             Taxonomy slug (already validated).
	 * @param string $source_site_url Source site URL for paired meta writes.
	 * @return int|WP_Error Destination term ID (0 when unresolvable), or
	 *                      WP_Error on insert failure.
	 */
	private function resolve_term(
		mixed $item,
		string $tax,
		string $source_site_url
	): int|WP_Error {
		$term_id        = 0;
		$term_name      = '';
		$term_slug      = '';
		$source_term_id = 0;

		if ( is_numeric( $item ) ) {
			$term_id = (int) $item;
		} elseif ( is_string( $item ) ) {
			$term_name = trim( wp_strip_all_tags( $item ) );
			$term_slug = sanitize_title( $term_name );
		} elseif ( is_array( $item ) || is_object( $item ) ) {
			$it             = (array) $item;
			$source_term_id = isset( $it['source_term_id'] )
				? absint( $it['source_term_id'] )
				: 0;

			if ( isset( $it['term_id'] ) ) {
				$term_id = (int) $it['term_id'];
			} elseif ( isset( $it['id'] ) ) {
				$term_id = (int) $it['id'];
			}
			if ( ! $term_id ) {
				$term_slug = isset( $it['slug'] )
					? sanitize_title( (string) $it['slug'] )
					: '';
				$term_name = isset( $it['name'] )
					? trim( wp_strip_all_tags( (string) $it['name'] ) )
					: $term_slug;
				if ( ! $term_slug && $term_name ) {
					$term_slug = sanitize_title( $term_name );
				}
			}
		}

		if ( ! $term_id && ( $term_slug || $term_name ) ) {
			$existing = $term_slug ? get_term_by( 'slug', $term_slug, $tax ) : false;
			if ( ! $existing && $term_name ) {
				$inserted = wp_insert_term(
					$term_name,
					$tax,
					$term_slug ? array( 'slug' => $term_slug ) : array()
				);
				if ( is_wp_error( $inserted ) ) {
					return $inserted;
				}
				$term_id = (int) $inserted['term_id'];
			} elseif ( $existing && ! is_wp_error( $existing ) ) {
				$term_id = (int) $existing->term_id;
			}
		}

		if ( $term_id > 0 && $source_term_id > 0 && '' !== $source_site_url ) {
			// Last-import wins on multi-source destinations — acceptable for
			// the block-ID remap use case the meta exists to support.
			update_term_meta(
				$term_id,
				Options::META_SOURCE_TERM_ID,
				$source_term_id
			);
			update_term_meta(
				$term_id,
				Options::META_SOURCE_TERM_URL,
				$source_site_url
			);
		}

		return $term_id;
	}
}
