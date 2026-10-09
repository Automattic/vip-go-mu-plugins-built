<?php

namespace Automattic\ShareADraft;

use WP_List_Table;

/**
 * The site-wide audit table of every issued preview link.
 *
 * Read-only but for one action. Because only the token *hash* is stored, the
 * table can identify a link by a four-character hint and revoke it, but can
 * never show or re-copy its shareable URL — that keeps the "no re-copy by
 * design" hardening intact. Rows come from {@see PreviewLinkService} one page at
 * a time, so a large site is never loaded whole.
 *
 * The screen's own gate is `edit_others_posts`, but a post type with its own
 * capabilities (or a trimmed-down editor role) can leave the viewer unable to
 * edit some posts. Those rows are redacted rather than filtered out — no title,
 * reviewers, IP ranges, or revoke — because `edit_post` cannot be expressed in
 * the paging SQL, so filtering would leave short pages and a total that
 * counts rows the viewer never sees.
 */
final class PreviewLinksListTable extends WP_List_Table {
	/** Ties the bulk-action nonce emitted here to the check in {@see PreviewLinksAdminPage}. */
	public const PLURAL = 'preview-links';

	private PreviewLinkService $service;
	private int $now;
	private LinkToggle $toggle;

	public function __construct( PreviewLinkService $service, int $now, ?LinkToggle $toggle = null ) {
		parent::__construct(
			[
				'singular' => 'preview-link',
				'plural'   => self::PLURAL,
				'ajax'     => false,
			]
		);

		$this->service = $service;
		$this->now     = $now;
		$this->toggle  = $toggle ?? new LinkToggle();
	}

	/**
	 * The site-wide enable/disable slider, on the same line as the bulk
	 * actions. The checkbox belongs to the small `shareadraft-toggle` form the admin
	 * page renders *outside* this table's own form (forms cannot nest), wired
	 * up via the HTML `form` attribute.
	 *
	 * @param string $which 'top' or 'bottom'.
	 */
	protected function extra_tablenav( $which ): void {
		if ( 'top' !== $which || ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$enabled = ! $this->toggle->is_disabled();

		echo '<div class="alignleft actions">';
		echo '<label class="shareadraft-switch">';
		printf(
			'<input type="checkbox" name="shareadraft_enabled" value="1" form="shareadraft-toggle" %s onchange="document.getElementById(\'shareadraft-toggle\').submit()" />',
			checked( $enabled, true, false )
		);
		echo '<span class="shareadraft-track" aria-hidden="true"></span>';
		printf(
			'<span>%s</span>',
			$enabled
				? esc_html__( 'Preview links are enabled', 'shareadraft' )
				: esc_html__( 'Preview links are disabled', 'shareadraft' )
		);
		echo '</label>';
		printf(
			'<noscript><button type="submit" class="button" form="shareadraft-toggle">%s</button></noscript>',
			esc_html__( 'Apply', 'shareadraft' )
		);
		echo '</div>';
	}

	/**
	 * Columns for switched-off restriction features are left out entirely, so
	 * a site that never uses them is not shown a column of em dashes.
	 *
	 * @return array<string, string>
	 */
	public function get_columns(): array {
		$columns = [
			'cb'         => '<input type="checkbox" />',
			'post'       => esc_html__( 'Post', 'shareadraft' ),
			'created_by' => esc_html__( 'Created by', 'shareadraft' ),
			'usage'      => esc_html__( 'Uses', 'shareadraft' ),
		];

		if ( Features::recipients_enabled() ) {
			$columns['recipients'] = esc_html__( 'Reviewers', 'shareadraft' );
		}

		if ( Features::ip_allowlist_enabled() ) {
			$columns['ip_ranges'] = esc_html__( 'IP ranges', 'shareadraft' );
		}

		return $columns + [
			'expiry' => esc_html__( 'Expires', 'shareadraft' ),
			'status' => esc_html__( 'Status', 'shareadraft' ),
			'token'  => esc_html__( 'Link', 'shareadraft' ),
		];
	}

	/**
	 * @return array<string, string>
	 */
	protected function get_bulk_actions(): array {
		return [ 'revoke' => esc_html__( 'Revoke', 'shareadraft' ) ];
	}

	protected function get_default_primary_column_name(): string {
		return 'post';
	}

	public function no_items(): void {
		esc_html_e( 'No preview links have been created yet.', 'shareadraft' );
	}

	public function prepare_items(): void {
		$per_page = $this->get_items_per_page( PreviewLinksAdminPage::PER_PAGE_OPTION, PreviewLinksAdminPage::DEFAULT_PER_PAGE );
		$offset   = ( $this->get_pagenum() - 1 ) * $per_page;
		$creator  = PreviewLinksAdminPage::requested_creator();

		$this->items = $this->service->page_of_links( $offset, $per_page, $creator );

		$total = $this->service->count_links( $creator );

		$this->set_pagination_args(
			[
				'total_items' => $total,
				'per_page'    => $per_page,
				'total_pages' => (int) ceil( $total / $per_page ),
			]
		);

		$this->_column_headers = [ $this->get_columns(), get_hidden_columns( $this->screen ), [] ];
	}

	/**
	 * The site's date and time formats joined, as the admin screens show them.
	 */
	public static function datetime_format(): string {
		$date = get_option( 'date_format' );
		$time = get_option( 'time_format' );

		return ( is_string( $date ) ? $date : '' ) . ' ' . ( is_string( $time ) ? $time : '' );
	}

	/**
	 * @param array<mixed>|object $item
	 */
	public function column_cb( $item ): string {
		if ( ! $item instanceof PreviewLink || ! self::can_edit( $item ) ) {
			return '';
		}

		return sprintf(
			'<input type="checkbox" name="links[]" value="%s" />',
			esc_attr( $item->post_id() . ':' . $item->token_hash() )
		);
	}

	public function column_post( PreviewLink $item ): string {
		if ( ! self::can_edit( $item ) ) {
			// Naming the type tells the viewer which permission they lack, and
			// so who to ask, without revealing anything about the post itself.
			$type  = get_post_type_object( (string) get_post_type( $item->post_id() ) );
			$label = null !== $type && is_string( $type->labels->singular_name ) ? $type->labels->singular_name : __( 'post', 'shareadraft' );

			/* translators: %s: post type singular name, e.g. "Product" */
			return esc_html( sprintf( __( '(You cannot edit this %s)', 'shareadraft' ), $label ) );
		}

		$post_id = $item->post_id();
		$title   = get_the_title( $post_id );

		if ( '' === $title ) {
			/* translators: %d: post ID */
			$title = sprintf( __( '(post #%d)', 'shareadraft' ), $post_id );
		}

		$edit_link = get_edit_post_link( $post_id );
		$label     = is_string( $edit_link ) && '' !== $edit_link
			? sprintf( '<a href="%s">%s</a>', esc_url( $edit_link ), esc_html( $title ) )
			: esc_html( $title );

		return $label . $this->row_actions( $this->row_action_links( $item ) );
	}

	public function column_created_by( PreviewLink $item ): string {
		if ( ! $item->has_known_creator() ) {
			return esc_html( '—' );
		}

		$user_id = $item->created_by();
		$user    = get_userdata( $user_id );

		/* translators: %d: user ID */
		$name = false !== $user ? $user->display_name : sprintf( __( 'User #%d', 'shareadraft' ), $user_id );

		// The name links to the creator-filtered view of this table, which is
		// where the "revoke everything this user created" action lives.
		$url = add_query_arg(
			[
				'page'    => PreviewLinksAdminPage::SLUG,
				'creator' => $user_id,
			],
			admin_url( 'admin.php' )
		);

		return sprintf( '<a href="%s">%s</a>', esc_url( $url ), esc_html( $name ) );
	}

	public function column_usage( PreviewLink $item ): string {
		$max = $item->max_uses();

		return esc_html(
			sprintf(
				'%d / %s',
				$item->use_count(),
				null === $max ? '∞' : (string) $max
			)
		);
	}

	/**
	 * The link's own IP restriction. Central Dashboard ranges apply to every
	 * link and are not repeated per row. Read-only, like the rest of the table:
	 * a link is immutable once shared, so to change its ranges you revoke it and
	 * mint a fresh one — the same rule as every other property of a link.
	 */
	public function column_ip_ranges( PreviewLink $item ): string {
		if ( ! self::can_edit( $item ) ) {
			return esc_html__( 'Hidden', 'shareadraft' );
		}

		if ( ! $item->has_ip_restriction() ) {
			return esc_html( '—' );
		}

		$ranges = $item->allowed_ips();

		return implode(
			'<br />',
			array_map(
				static fn ( string $range ): string => sprintf( '<code>%s</code>', esc_html( $range ) ),
				$ranges
			)
		);
	}

	/**
	 * The named reviewers a link is bound to, or a dash for a bearer link.
	 */
	public function column_recipients( PreviewLink $item ): string {
		if ( ! self::can_edit( $item ) ) {
			return esc_html__( 'Hidden', 'shareadraft' );
		}

		$recipients = $item->recipients();

		if ( [] === $recipients ) {
			return esc_html( '—' );
		}

		return implode(
			'<br />',
			array_map(
				static fn ( string $recipient ): string => esc_html( $recipient ),
				$recipients
			)
		);
	}

	public function column_expiry( PreviewLink $item ): string {
		$expires  = $item->expires_at();
		$absolute = wp_date( self::datetime_format(), $expires );

		if ( $item->is_expired( $this->now ) ) {
			/* translators: %s: human-readable duration, e.g. "2 hours" */
			$relative = sprintf( __( '%s ago', 'shareadraft' ), human_time_diff( $expires, $this->now ) );
		} else {
			/* translators: %s: human-readable duration, e.g. "2 hours" */
			$relative = sprintf( __( 'in %s', 'shareadraft' ), human_time_diff( $this->now, $expires ) );
		}

		return sprintf(
			'%s<br /><small>%s</small>',
			esc_html( false === $absolute ? '' : $absolute ),
			esc_html( $relative )
		);
	}

	public function column_status( PreviewLink $item ): string {
		if ( $item->is_revoked() ) {
			$label = __( 'Revoked', 'shareadraft' );
		} elseif ( $item->is_expired( $this->now ) ) {
			$label = __( 'Expired', 'shareadraft' );
		} elseif ( $item->is_exhausted() ) {
			$label = __( 'Exhausted', 'shareadraft' );
		} else {
			$label = __( 'Active', 'shareadraft' );
		}

		return esc_html( $label );
	}

	public function column_token( PreviewLink $item ): string {
		return sprintf( '<code>%s</code>', esc_html( '····' . $item->token_hint() ) );
	}

	/** Whether the viewer may see this link's details and revoke it. */
	private static function can_edit( PreviewLink $item ): bool {
		return current_user_can( 'edit_post', $item->post_id() );
	}

	/**
	 * Row actions for a link: a Revoke link, but only while the link is still
	 * live. Revoking an already-dead link would be a no-op.
	 *
	 * @return array<string, string>
	 */
	private function row_action_links( PreviewLink $item ): array {
		if ( $item->is_revoked() || $item->is_expired( $this->now ) ) {
			return [];
		}

		$url = wp_nonce_url(
			add_query_arg(
				[
					'page'   => PreviewLinksAdminPage::SLUG,
					'action' => 'revoke',
					'post'   => $item->post_id(),
					'token'  => $item->token_hash(),
				],
				admin_url( 'admin.php' )
			),
			'shareadraft_revoke_' . $item->post_id() . '_' . $item->token_hash()
		);

		return [
			'revoke' => sprintf(
				'<a href="%s" class="submitdelete">%s</a>',
				esc_url( $url ),
				esc_html__( 'Revoke', 'shareadraft' )
			),
		];
	}
}
