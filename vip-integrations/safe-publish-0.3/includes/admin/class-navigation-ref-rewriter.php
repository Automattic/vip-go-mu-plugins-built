<?php
/**
 * Navigation Ref Rewriter class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Options;
use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Repoints stale core/navigation block references once a menu is imported.
 *
 * When a post is imported before the navigation menu it embeds via
 * <!-- wp:navigation {"ref":N} -->, the import-time remap cannot resolve N
 * (the menu is not on the destination yet), so it leaves the source ID in
 * place. Once the menu lands, this rewriter finds those posts and repoints
 * their ref to the menu's destination ID. The same trigger resolves in-batch
 * inter-nav references when one menu is imported before another it embeds.
 *
 * Writes post_content directly via $wpdb instead of wp_update_post so the
 * reconciliation neither bumps post_modified nor creates a revision: it is a
 * system-touched correction, not a user edit. The per-post audit meta is the
 * only trace of the change precisely because no revision is created — do not
 * switch to wp_update_post without revisiting that trade-off.
 *
 * Candidate discovery runs a post_content LIKE scan synchronously during the
 * menu import. Acceptable for the typical case, where few posts embed a menu
 * by hard-coded ref; move to a queued job if profiling shows pressure on
 * sites with very large post tables.
 */
class Navigation_Ref_Rewriter {

	/**
	 * Post meta key recording the unix timestamp at which a post's stale
	 * navigation ref was rewritten.
	 *
	 * @var string
	 */
	public const META_REWRITTEN_AT = '_safe_publish_nav_ref_rewritten_at';

	/**
	 * Repoints destination posts that reference a freshly imported menu by its
	 * source ID to the menu's destination ID.
	 *
	 * Refuses to act when the source site URL is empty: without it the
	 * candidate query cannot scope to the originating site, and an unscoped
	 * rewrite could corrupt refs on posts imported from a different source
	 * that happen to share the numeric ID.
	 *
	 * @param int    $source_nav_id   Menu's source post ID.
	 * @param int    $dest_nav_id     Menu's destination post ID.
	 * @param string $source_site_url Source site URL the posts were imported
	 *                                from; '' opts out and rewrites nothing.
	 * @return array{rewritten: int, failed: list<int>} Count of posts rewritten
	 *                                and the IDs of posts that matched but failed
	 *                                to persist.
	 */
	public function rewrite_cross_refs(
		int $source_nav_id,
		int $dest_nav_id,
		string $source_site_url
	): array {
		if ( '' === $source_site_url ) {
			return array(
				'rewritten' => 0,
				'failed'    => array(),
			);
		}

		$rewritten = 0;
		$failed    = array();

		$candidate_ids = $this->find_candidate_post_ids(
			$source_nav_id,
			$source_site_url
		);

		foreach ( $candidate_ids as $post_id ) {
			$status = $this->rewrite_post_content(
				$post_id,
				$source_nav_id,
				$dest_nav_id
			);

			if ( 'rewritten' === $status ) {
				++$rewritten;
			} elseif ( 'failed' === $status ) {
				$failed[] = $post_id;
			}
		}

		return array(
			'rewritten' => $rewritten,
			'failed'    => $failed,
		);
	}

	/**
	 * Finds imported posts whose content references the given source menu ID.
	 *
	 * The LIKE prefilter is a coarse net: it also matches longer IDs sharing
	 * the prefix (42 matches 420) and ignores externally produced spacing
	 * variants such as {"ref": 42} or {"ref":"42"}. The exact match in the
	 * block walk discards over-matches, and spacing variants never reach it.
	 * The META_SOURCE_SITE_URL join both scopes to the right source and
	 * excludes revisions and autosaves, which never carry the meta.
	 *
	 * @param int    $source_nav_id   Menu's source post ID.
	 * @param string $source_site_url Source site URL the posts were imported from.
	 * @return list<int> Candidate destination post IDs.
	 */
	private function find_candidate_post_ids(
		int $source_nav_id,
		string $source_site_url
	): array {
		global $wpdb;

		// phpcs:disable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT p.ID FROM {$wpdb->posts} p
				 INNER JOIN {$wpdb->postmeta} pm ON pm.post_id = p.ID
				 WHERE p.post_content LIKE %s
					 AND pm.meta_key = %s
					 AND pm.meta_value = %s
					 AND p.post_status NOT IN ( 'auto-draft', 'trash' )",
				'%wp:navigation {%"ref":' . absint( $source_nav_id ) . '%',
				Options::META_SOURCE_SITE_URL,
				$source_site_url
			)
		);
		// phpcs:enable WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

		return array_map( 'intval', $ids );
	}

	/**
	 * Rewrites a single post's stale menu refs and persists the result.
	 *
	 * @param int $post_id       Destination post ID.
	 * @param int $source_nav_id Menu's source post ID to match.
	 * @param int $dest_nav_id   Menu's destination post ID to write.
	 * @return string 'rewritten' on a persisted change, 'unchanged' when the
	 *                post held no matching ref (a LIKE over-match), or 'failed'
	 *                when the write did not succeed.
	 */
	private function rewrite_post_content(
		int $post_id,
		int $source_nav_id,
		int $dest_nav_id
	): string {
		$post = get_post( $post_id );

		if ( ! $post instanceof WP_Post || '' === $post->post_content ) {
			return 'unchanged';
		}

		$blocks  = parse_blocks( $post->post_content );
		$changed = false;
		$blocks  = $this->walk_blocks(
			$blocks,
			$source_nav_id,
			$dest_nav_id,
			$changed
		);

		if ( ! $changed ) {
			return 'unchanged';
		}

		$persisted = $this->persist_rewritten_content(
			$post_id,
			serialize_blocks( $blocks )
		);

		if ( ! $persisted ) {
			return 'failed';
		}

		clean_post_cache( $post_id );
		update_post_meta( $post_id, self::META_REWRITTEN_AT, time() );

		return 'rewritten';
	}

	/**
	 * Recursively repoints core/navigation refs matching the source menu ID.
	 *
	 * @param array<array<string, mixed>> $blocks        Parsed block tree.
	 * @param int                         $source_nav_id Source menu ID to match.
	 * @param int                         $dest_nav_id   Destination menu ID to write.
	 * @param bool                        $changed       Set to true, by reference,
	 *                                                   when a ref is repointed.
	 * @return array<array<string, mixed>> Mutated block tree.
	 */
	private function walk_blocks(
		array $blocks,
		int $source_nav_id,
		int $dest_nav_id,
		bool &$changed
	): array {
		foreach ( $blocks as $i => $block ) {
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] )
				? $block['attrs']
				: array();
			$ref   = $attrs['ref'] ?? null;

			if (
				'core/navigation' === ( $block['blockName'] ?? '' )
				&& is_numeric( $ref )
				&& (int) $ref === $source_nav_id
			) {
				$attrs['ref']          = $dest_nav_id;
				$blocks[ $i ]['attrs'] = $attrs;
				$changed               = true;
			}

			if (
				isset( $block['innerBlocks'] )
				&& is_array( $block['innerBlocks'] )
				&& array() !== $block['innerBlocks']
			) {
				$blocks[ $i ]['innerBlocks'] = $this->walk_blocks(
					$block['innerBlocks'],
					$source_nav_id,
					$dest_nav_id,
					$changed
				);
			}
		}

		return $blocks;
	}

	/**
	 * Persists the rewritten content via a direct write, bypassing
	 * wp_update_post. Isolated so tests can force a write failure.
	 *
	 * @param int    $post_id     Destination post ID.
	 * @param string $new_content Serialized block content to write.
	 * @return bool True when the row was updated.
	 */
	protected function persist_rewritten_content(
		int $post_id,
		string $new_content
	): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$result = $wpdb->update(
			$wpdb->posts,
			array( 'post_content' => $new_content ),
			array( 'ID' => $post_id )
		);

		return false !== $result;
	}
}
