<?php

namespace Automattic\ShareADraft;

/**
 * Plugs reviewer email addresses into core's Export and Erase Personal Data
 * tools (Tools → Export/Erase Personal Data).
 *
 * Recipient-bound links store their reviewers' addresses, and those reviewers
 * are not WordPress users, so without this core cannot find them. The exporter
 * lists every link an address is bound to; the eraser forgets the address on
 * each, revoking any link it leaves with no reviewers so erasure never turns a
 * bound link into one anyone can open.
 *
 * Both walk the posts carrying the address in bounded pages, so a large site is
 * handled across several of core's requests rather than one that times out.
 * Verification codes (hashed, 15-minute transients) and the verified-reviewer
 * cookie (held in the reviewer's own browser) are out of scope: neither stores
 * the address in a form this could usefully export or needs to erase.
 */
final class PersonalData {
	/** Posts examined per page of an export or erasure. */
	private const BATCH_SIZE = 100;

	private PreviewLinkService $service;

	public function __construct( PreviewLinkService $service ) {
		$this->service = $service;
	}

	public function register(): void {
		add_filter( 'wp_privacy_personal_data_exporters', [ $this, 'register_exporter' ] );
		add_filter( 'wp_privacy_personal_data_erasers', [ $this, 'register_eraser' ] );
	}

	/**
	 * @param array<string, mixed> $exporters
	 * @return array<string, mixed>
	 */
	public function register_exporter( array $exporters ): array {
		$exporters['shareadraft'] = [
			'exporter_friendly_name' => __( 'Share a Draft preview links', 'shareadraft' ),
			'callback'               => [ $this, 'export' ],
		];

		return $exporters;
	}

	/**
	 * @param array<string, mixed> $erasers
	 * @return array<string, mixed>
	 */
	public function register_eraser( array $erasers ): array {
		$erasers['shareadraft'] = [
			'eraser_friendly_name' => __( 'Share a Draft preview links', 'shareadraft' ),
			'callback'             => [ $this, 'erase' ],
		];

		return $erasers;
	}

	/**
	 * One page of the links bound to an address. Read-only, so plain offset
	 * paging is stable.
	 *
	 * @param string $email_address Address to export.
	 * @param int    $page          1-based page number.
	 * @return array{data: list<array{group_id: string, group_label: string, group_description: string, item_id: string, data: list<array{name: string, value: string}>}>, done: bool}
	 */
	public function export( string $email_address, int $page = 1 ): array {
		$post_ids = $this->service->post_ids_with_recipient(
			$email_address,
			( max( 1, $page ) - 1 ) * self::BATCH_SIZE,
			self::BATCH_SIZE
		);
		$items    = [];

		foreach ( $post_ids as $post_id ) {
			foreach ( $this->service->list_for_post( $post_id ) as $link ) {
				if ( $link->is_recipient( $email_address ) ) {
					$items[] = $this->export_item( $link );
				}
			}
		}

		return [
			'data' => $items,
			'done' => count( $post_ids ) < self::BATCH_SIZE,
		];
	}

	/**
	 * Forget an address on the next page of links bound to it.
	 *
	 * Always reads the first page: a post whose links no longer name the
	 * address drops out of the match, so the next request picks up the rest.
	 * A page that erases nothing stops the run instead, so a row that can
	 * never be rewritten cannot make core ask for pages forever.
	 *
	 * @param string $email_address Address to erase.
	 * @param int    $_page         1-based page number; unused, see above.
	 * @return array{items_removed: bool, items_retained: bool, messages: list<string>, done: bool}
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Signature is dictated by core's eraser contract.
	public function erase( string $email_address, int $_page = 1 ): array {
		$post_ids = $this->service->post_ids_with_recipient( $email_address, 0, self::BATCH_SIZE );
		$removed  = 0;
		$failed   = 0;

		foreach ( $post_ids as $post_id ) {
			$result   = $this->service->forget_recipient( $post_id, $email_address );
			$removed += $result['removed'];
			$failed  += $result['failed'];
		}

		$done     = count( $post_ids ) < self::BATCH_SIZE || 0 === $removed;
		$retained = $done && $failed > 0;

		return [
			'items_removed'  => $removed > 0,
			'items_retained' => $retained,
			'messages'       => $retained
				? [ __( 'Some Share a Draft preview links were changing while this ran and still name this address. Run the erasure again.', 'shareadraft' ) ]
				: [],
			'done'           => $done,
		];
	}

	/**
	 * @return array{group_id: string, group_label: string, group_description: string, item_id: string, data: list<array{name: string, value: string}>}
	 */
	private function export_item( PreviewLink $link ): array {
		$format     = PreviewLinksListTable::datetime_format();
		$title      = get_the_title( $link->post_id() );
		$revoked_at = $link->revoked_at();

		return [
			'group_id'          => 'shareadraft-preview-links',
			'group_label'       => __( 'Preview links', 'shareadraft' ),
			'group_description' => __( 'Draft preview links shared with this email address.', 'shareadraft' ),
			'item_id'           => 'shareadraft-link-' . $link->token_hash(),
			'data'              => [
				[
					'name'  => __( 'Post', 'shareadraft' ),
					/* translators: %d: post ID */
					'value' => '' !== $title ? $title : sprintf( __( '(post #%d)', 'shareadraft' ), $link->post_id() ),
				],
				[
					'name'  => __( 'Link', 'shareadraft' ),
					'value' => '····' . $link->token_hint(),
				],
				[
					'name'  => __( 'Created', 'shareadraft' ),
					'value' => (string) wp_date( $format, $link->created_at() ),
				],
				[
					'name'  => __( 'Expires', 'shareadraft' ),
					'value' => (string) wp_date( $format, $link->expires_at() ),
				],
				[
					'name'  => __( 'Revoked', 'shareadraft' ),
					'value' => null !== $revoked_at ? (string) wp_date( $format, $revoked_at ) : __( 'No', 'shareadraft' ),
				],
			],
		];
	}
}
