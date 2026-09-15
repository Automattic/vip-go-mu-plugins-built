<?php
/**
 * Attention inbox read service.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Admin;

use Safe_Publish\Utils\Options;
use WP_Error;

/**
 * Reads the connected source's failure and degradation inbox.
 */
final class Attention_Read_Service {

	/**
	 * Issue types supported by the reconciliation retry handlers.
	 *
	 * @var string[]
	 */
	public const ATTENTION_ISSUE_RETRYABLE_TYPES = array(
		'unmapped_block_reference',
		'unmapped_gallery_reference',
		'nav_ref_rewrite_failed',
		'parent_orphaned',
	);

	/**
	 * Constructs the inbox reader.
	 *
	 * @param History_Repository          $repository          Import history.
	 * @param Attention_Issues_Repository $attention_issues    Attention issues.
	 * @param Post_Import_Service         $post_import_service Resolvability reader.
	 */
	public function __construct(
		private History_Repository $repository,
		private Attention_Issues_Repository $attention_issues,
		private Post_Import_Service $post_import_service
	) {}

	/**
	 * Lists failures before degradations with the open inbox count.
	 *
	 * Inputs are unslashed request values. Source identity always comes from
	 * the configured connection, including its subsite path.
	 *
	 * @param array{page?: mixed, per_page?: mixed, view?: mixed} $input Inbox query.
	 * @return array{items: array[], has_more: bool, needs_attention_count: int}|WP_Error
	 *     Inbox payload. Repository reads currently produce no errors.
	 */
	public function list_needs_attention( array $input ): array|WP_Error {
		$page     = max( 1, absint( $input['page'] ?? 1 ) );
		$per_page = max( 1, min( 100, absint( $input['per_page'] ?? 20 ) ) );
		$ignored  = 'ignored' === sanitize_key( $input['view'] ?? 'open' );

		$offset          = ( $page - 1 ) * $per_page;
		$source_site_url = Options::get_connected_site_url_with_path();

		// The tab label always reflects the open (unignored) total, whichever
		// view is being listed.
		$open_failed    = $this->repository->count_failures( $source_site_url );
		$open_attention = $this->attention_issues->count_open_issues(
			$source_site_url
		);
		$open_total     = $open_failed + $open_attention;

		if ( $ignored ) {
			$failed_count    = $this->repository->count_failures(
				$source_site_url,
				true
			);
			$attention_count = $this->attention_issues->count_open_issues(
				$source_site_url,
				true
			);
		} else {
			$failed_count    = $open_failed;
			$attention_count = $open_attention;
		}

		$items = $this->collect_needs_attention_page(
			$offset,
			$per_page,
			$failed_count,
			$source_site_url,
			$ignored
		);

		$total = $failed_count + $attention_count;

		return array(
			'items'                 => $items,
			'has_more'              => $offset + count( $items ) < $total,
			'needs_attention_count' => $open_total,
		);
	}

	/**
	 * Assembles one page of the concatenated inbox stream, with failures
	 * before degradations, via offset arithmetic over the two
	 * source counts, so a page can straddle the boundary.
	 *
	 * @param int    $offset          Global row offset.
	 * @param int    $limit           Page size.
	 * @param int    $failed_count    Total failures (the block boundary).
	 * @param string $source_site_url Connected source identity.
	 * @param bool   $ignored         Page the ignored set instead of the open one.
	 * @return array[] Unified inbox rows.
	 */
	private function collect_needs_attention_page(
		int $offset,
		int $limit,
		int $failed_count,
		string $source_site_url,
		bool $ignored
	): array {
		if ( $offset >= $failed_count ) {
			return $this->format_attention_rows(
				$this->attention_issues->list_open_issues(
					$source_site_url,
					$offset - $failed_count,
					$limit,
					$ignored
				),
				$source_site_url,
				! $ignored
			);
		}

		$items     = $this->format_failure_rows(
			$this->repository->list_failures(
				$source_site_url,
				$offset,
				$limit,
				$ignored
			),
			$source_site_url
		);
		$shortfall = $limit - count( $items );

		if ( $shortfall > 0 ) {
			// Failures ran out mid-page; fill from the degradations head.
			$items = array_merge(
				$items,
				$this->format_attention_rows(
					$this->attention_issues->list_open_issues(
						$source_site_url,
						0,
						$shortfall,
						$ignored
					),
					$source_site_url,
					! $ignored
				)
			);
		}

		return $items;
	}

	/**
	 * Shapes failure rows for the inbox. A failed update resolves an edit link
	 * from its still-live destination post; a first-import failure has none.
	 *
	 * @param array[] $rows            Failure rows from list_failures().
	 * @param string  $source_site_url Connected source scoping the lookup.
	 * @return array[] Unified inbox rows of kind 'failure'.
	 */
	private function format_failure_rows(
		array $rows,
		string $source_site_url
	): array {
		$source_ids = array();
		foreach ( $rows as $row ) {
			$source_id = (int) ( $row['source_post_id'] ?? 0 );
			if ( $source_id > 0 ) {
				$source_ids[] = $source_id;
			}
		}

		$active_by_source = 0 === count( $source_ids )
			? array()
			: $this->repository->get_active_items_by_source_ids(
				$source_site_url,
				$source_ids
			);

		return array_map(
			function ( array $row ) use ( $active_by_source ): array {
				$source_id  = (int) ( $row['source_post_id'] ?? 0 );
				$item_id    = (int) $row['id'];
				$active_row = $active_by_source[ $source_id ] ?? null;
				$post_id    = null !== $active_row && isset( $active_row['post_id'] )
					? (int) $active_row['post_id']
					: 0;

				return array(
					'kind'            => 'failure',
					'row_id'          => 'failure:' . $item_id,
					'item_id'         => $item_id,
					'source_post_id'  => $source_id > 0 ? $source_id : null,
					'title'           => (string) $row['title'],
					'error_message'   => (string) ( $row['error_message'] ?? '' ),
					'import_date_gmt' => (string) $row['import_date_gmt'],
					'source_site_url' => (string) $row['source_site_url'],
					'edit_url'        => $this->live_edit_url( $post_id ),
				);
			},
			$rows
		);
	}

	/**
	 * Shapes degradation rows for the inbox, computing the batched resolvable
	 * hint only when the caller will show it.
	 *
	 * @param array[] $rows            Open issue rows from list_open_issues().
	 * @param string  $source_site_url Connected source identity scoping lookups.
	 * @param bool    $with_resolvable Compute the hint; the Ignored view skips it.
	 * @return array[] Unified inbox rows of kind 'degradation'.
	 */
	private function format_attention_rows(
		array $rows,
		string $source_site_url,
		bool $with_resolvable
	): array {
		$resolvable = array();
		if ( $with_resolvable ) {
			$resolvable = $this->post_import_service->degradation_resolvability(
				$rows,
				$source_site_url
			);
		}

		$formatted = array();
		foreach ( $rows as $index => $row ) {
			$issue               = $this->format_attention_issue( $row );
			$issue['kind']       = 'degradation';
			$issue['resolvable'] = $resolvable[ $index ] ?? false;
			$issue['row_id']     = sprintf(
				'degradation:%d:%s:%d:%s:%s',
				$issue['affected_post_id'],
				$issue['issue_type'],
				$issue['target_ref'],
				$issue['target_kind'],
				$issue['target_slug']
			);
			$formatted[]         = $issue;
		}

		return $formatted;
	}

	/**
	 * Returns the edit URL for a destination post that is present and not
	 * trashed, or an empty string.
	 *
	 * @param int $post_id Destination post id (0 when none).
	 * @return string Edit URL, or empty string.
	 */
	private function live_edit_url( int $post_id ): string {
		if ( $post_id < 1 ) {
			return '';
		}

		$status = get_post_status( $post_id );
		if ( false === $status || 'trash' === $status ) {
			return '';
		}

		$edit_url = get_edit_post_link( $post_id, 'raw' );

		return is_string( $edit_url ) ? $edit_url : '';
	}

	/**
	 * Shapes an issue row for the client, adding the affected post's title and
	 * an edit link (empty when the user cannot edit that post).
	 *
	 * @param array $row Open issue row from the repository.
	 * @return array Client-facing issue payload.
	 */
	private function format_attention_issue( array $row ): array {
		$affected_post_id  = (int) $row['affected_post_id'];
		$edit_url          = get_edit_post_link( $affected_post_id, 'raw' );
		$detail            = is_array( $row['detail'] ?? null )
			? $row['detail']
			: array();
		$is_reusable_block = 'core/block' === ( $detail['block'] ?? '' );
		$target_terms      = is_array( $detail['terms'] ?? null )
			? array_values( array_map( 'strval', $detail['terms'] ) )
			: array();

		return array(
			'affected_post_id'         => $affected_post_id,
			'issue_type'               => (string) $row['issue_type'],
			'target_ref'               => (int) $row['target_ref'],
			'target_kind'              => (string) $row['target_kind'],
			'target_slug'              => (string) $row['target_slug'],
			'target_is_reusable_block' => $is_reusable_block,
			'target_terms'             => $target_terms,
			'target_reason'            => (string) ( $detail['reason'] ?? '' ),
			'severity'                 => (string) $row['severity'],
			'source_site_url'          => (string) $row['source_site_url'],
			'first_detected_gmt'       => (string) $row['first_detected_gmt'],
			'last_seen_gmt'            => (string) $row['last_seen_gmt'],
			'affected_title'           => get_the_title( $affected_post_id ),
			'affected_edit_url'        => is_string( $edit_url ) ? $edit_url : '',
			'retryable'                => in_array(
				(string) $row['issue_type'],
				self::ATTENTION_ISSUE_RETRYABLE_TYPES,
				true
			),
		);
	}
}
