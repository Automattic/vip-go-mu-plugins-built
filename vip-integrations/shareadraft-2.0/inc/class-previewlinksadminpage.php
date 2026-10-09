<?php

namespace Automattic\ShareADraft;

/**
 * The site-wide "Preview Links" admin screen: registers the menu, renders the
 * {@see PreviewLinksListTable}, and handles revoke actions.
 *
 * Gated at `edit_others_posts` (an editor), matching the audience that can
 * already view other authors' drafts, so the screen exposes nothing new. Revokes
 * run through a post-redirect-get flow — process the action, then redirect to a
 * clean URL — so a refresh cannot replay them, and every revoke is nonce-checked.
 */
final class PreviewLinksAdminPage {
	/** Menu slug; also the `page` query var. Referenced by the list table's row actions. */
	public const SLUG = 'shareadraft';

	/** Screen ID core derives from the slug, so other classes can spot this screen. */
	public const SCREEN_ID = 'toplevel_page_' . self::SLUG;

	/** Per-user "links per page" screen option; the `_page` suffix is core convention. */
	public const PER_PAGE_OPTION = 'shareadraft_links_per_page';

	/** Rows per page until the screen option overrides it. */
	public const DEFAULT_PER_PAGE = 20;

	private const CAPABILITY = 'edit_others_posts';

	/**
	 * The break-glass "revoke everything" switch has a far larger blast radius
	 * than per-row revoke, so it is gated above the table's own capability.
	 */
	private const REVOKE_ALL_CAPABILITY = 'manage_options';

	private PreviewLinkService $service;
	private Clock $clock;
	private BulkLinkRevoker $revoker;
	private LinkToggle $toggle;

	/**
	 * @var list<string> Central CIDR ranges from the VIP Dashboard config. Shown
	 *                   above the table so an auditor can see the baseline every
	 *                   link accepts, which no per-row column repeats.
	 */
	private array $central_ip_ranges;

	/**
	 * @var list<string> Entries in the VIP Dashboard's ranges that are not valid
	 *                   IP addresses or CIDR ranges, and so are not applied.
	 */
	private array $rejected_ip_ranges;

	/** Built lazily on the screen load, then reused when rendering the page. */
	private ?PreviewLinksListTable $table = null;

	/**
	 * @param list<string> $central_ip_ranges  Central CIDR ranges applying to
	 *                                         every link, or empty for none.
	 * @param list<string> $rejected_ip_ranges Central entries ignored as invalid.
	 */
	public function __construct( PreviewLinkService $service, Clock $clock, BulkLinkRevoker $revoker, ?LinkToggle $toggle = null, array $central_ip_ranges = [], array $rejected_ip_ranges = [] ) {
		$this->service            = $service;
		$this->clock              = $clock;
		$this->revoker            = $revoker;
		$this->toggle             = $toggle ?? new LinkToggle();
		$this->central_ip_ranges  = $central_ip_ranges;
		$this->rejected_ip_ranges = $rejected_ip_ranges;
	}

	/**
	 * The creator the table is filtered to, or null when showing everyone.
	 * Read-only display state, carried in the URL so pagination keeps it.
	 */
	public static function requested_creator(): ?int {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only display filter; every action derived from it is separately nonce-checked.
		$creator = isset( $_GET['creator'] ) && is_scalar( $_GET['creator'] ) ? (int) $_GET['creator'] : 0;

		return $creator > 0 ? $creator : null;
	}

	public function register(): void {
		add_action( 'admin_menu', [ $this, 'add_menu' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );

		// Registered on init, not the page load: core saves screen options in
		// wp-admin/admin.php before the load-{hook} action fires, and a custom
		// per-page option is discarded unless this filter returns its value.
		add_filter(
			'set_screen_option_' . self::PER_PAGE_OPTION,
			[ $this, 'save_per_page' ],
			10,
			3
		);
	}

	public function add_menu(): void {
		$hook = add_menu_page(
			esc_html__( 'Preview Links', 'shareadraft' ),
			esc_html__( 'Preview Links', 'shareadraft' ),
			self::CAPABILITY,
			self::SLUG,
			[ $this, 'render' ],
			'dashicons-share'
		);

		if ( '' !== $hook ) {
			// Handle revoke actions before any output, so we can redirect cleanly,
			// then wire up the screen options and contextual help.
			add_action( "load-{$hook}", [ $this, 'handle_actions' ] );
			add_action( "load-{$hook}", [ $this, 'configure_screen' ] );
		}
	}

	/**
	 * Enqueue the select-all wiring on this screen only.
	 *
	 * The script is built by @wordpress/scripts into build/admin.js. As with
	 * {@see EditorAssets}, an unbuilt checkout skips the enqueue rather than
	 * fatal: the banner then simply stays hidden, and the ordinary per-page
	 * bulk revoke still works.
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( self::SCREEN_ID !== $hook_suffix ) {
			return;
		}

		$asset_file = plugin_dir_path( VIP_SHAREADRAFT_FILE ) . 'build/admin.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		// $asset_file is derived solely from the plugin's own directory and a
		// hard-coded, build-generated filename, never from user input, so the
		// variable include is safe.
		/** @var mixed $asset */
		$asset = require $asset_file; // phpcs:ignore WordPressVIPMinimum.Files.IncludingFile.UsingVariable
		if ( ! is_array( $asset ) ) {
			return;
		}

		/** @var list<non-empty-string> $dependencies */
		$dependencies = isset( $asset['dependencies'] ) && is_array( $asset['dependencies'] )
			? $asset['dependencies']
			: [];
		$version      = isset( $asset['version'] ) && is_string( $asset['version'] )
			? $asset['version']
			: VIP_SHAREADRAFT_VERSION;

		wp_enqueue_script(
			'shareadraft-admin',
			plugins_url( 'build/admin.js', VIP_SHAREADRAFT_FILE ),
			$dependencies,
			$version,
			true
		);
	}

	public function handle_actions(): void {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			return;
		}

		$toggled = $this->process_toggle();

		if ( null !== $toggled ) {
			// No success notice on the other side: the slider's new position and
			// the warning banner (while disabled) already say everything.
			wp_safe_redirect( $this->page_url() );
			exit;
		}

		$revoked = $this->process_request();

		if ( null === $revoked ) {
			return;
		}

		$args = [ 'shareadraft_revoked' => $revoked ];

		if ( $this->revoker->has_pending_work() ) {
			// A sweep overflowed this run and continues on cron; say so rather
			// than implying the count above was everything.
			$args['shareadraft_pending'] = 1;
		}

		wp_safe_redirect( add_query_arg( $args, $this->page_url() ) );
		exit;
	}

	/**
	 * Flip the site-wide switch if the request asks for it. Submitted by the
	 * toggle slider at the top of the screen: the new state is simply whether
	 * the checkbox arrived, so replaying a submission is idempotent.
	 *
	 * @return string|null 'disabled' or 'enabled' when the switch was flipped,
	 *                     null when the request carried no toggle action.
	 */
	public function process_toggle(): ?string {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Verified below via check_admin_referer() before anything changes.
		$action = isset( $_POST['action'] ) && is_string( $_POST['action'] ) ? sanitize_key( wp_unslash( $_POST['action'] ) ) : '';

		if ( 'toggle_links' !== $action ) {
			return null;
		}

		check_admin_referer( 'shareadraft_toggle_links' );

		if ( ! current_user_can( self::REVOKE_ALL_CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to change whether preview links work on this site.', 'shareadraft' ) );
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce checked above; the checkbox's presence is the requested state.
		if ( isset( $_POST['shareadraft_enabled'] ) ) {
			$this->toggle->enable();

			return 'enabled';
		}

		$this->toggle->disable();

		return 'disabled';
	}

	/**
	 * Carry out whichever revoke the request asks for.
	 *
	 * @return int|null Number of links revoked, or null if the request carried no
	 *                  revoke action (an ordinary page view).
	 */
	public function process_request(): ?int {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Verified below via check_admin_referer(); inputs are read only to build the per-link nonce action.
		$get_action = isset( $_GET['action'] ) && is_string( $_GET['action'] ) ? sanitize_key( wp_unslash( $_GET['action'] ) ) : '';

		if ( 'revoke' === $get_action ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- See above.
			$post_id = isset( $_GET['post'] ) && is_scalar( $_GET['post'] ) ? (int) $_GET['post'] : 0;
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- See above.
			$token = isset( $_GET['token'] ) && is_string( $_GET['token'] ) ? sanitize_text_field( wp_unslash( $_GET['token'] ) ) : '';

			check_admin_referer( 'shareadraft_revoke_' . $post_id . '_' . $token );

			// The table offers no revoke on a row the viewer cannot edit, so
			// this only refuses a hand-built request.
			return current_user_can( 'edit_post', $post_id ) && $this->service->revoke( $post_id, $token ) ? 1 : 0;
		}

		if ( 'revoke' === $this->requested_bulk_action() ) {
			check_admin_referer( 'bulk-' . PreviewLinksListTable::PLURAL );

			// "Select all across pages" upgrades the bulk revoke from the ticked
			// rows to the whole filtered set, the way Gmail's select-all does.
			// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce verified above.
			if ( isset( $_POST['shareadraft_all'] ) && '' !== $_POST['shareadraft_all'] ) {
				$creator = self::requested_creator();

				// Deliberately not scoped to posts the viewer can edit: this is
				// offboarding, and a sweep that quietly left some of a leaver's
				// links working would be worse than one that over-revokes.
				if ( null !== $creator ) {
					return $this->revoker->revoke_by_creator( $creator );
				}

				// Unfiltered select-all is the break-glass "revoke everything",
				// whose blast radius warrants more than the table's own gate.
				if ( ! current_user_can( self::REVOKE_ALL_CAPABILITY ) ) {
					wp_die( esc_html__( 'You are not allowed to revoke all preview links.', 'shareadraft' ) );
				}

				return $this->revoker->revoke_all();
			}

			return $this->revoke_selected();
		}

		return null;
	}

	public function render(): void {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( esc_html__( 'You are not allowed to manage preview links.', 'shareadraft' ) );
		}

		$table = $this->table();
		$table->prepare_items();

		echo '<div class="wrap">';
		printf( '<h1>%s</h1>', esc_html__( 'Preview Links', 'shareadraft' ) );

		$this->render_toggle_form();
		$this->maybe_render_disabled_banner();
		$this->maybe_render_rejected_ranges();
		$this->maybe_render_central_ranges();
		$this->maybe_render_notice();
		$this->maybe_render_creator_filter();

		echo '<form method="post" id="shareadraft-links">';
		printf( '<input type="hidden" name="page" value="%s" />', esc_attr( self::SLUG ) );
		echo '<input type="hidden" name="shareadraft_all" value="" id="shareadraft-all" />';
		$this->maybe_render_select_all( $table );
		$table->display();
		echo '</form>';

		echo '</div>';
	}

	/**
	 * The small form behind the enable/disable slider. The visible control
	 * lives on the table's bulk-actions line ({@see
	 * PreviewLinksListTable::extra_tablenav()}), inside the table's own form
	 * where a second <form> cannot nest — so its checkbox points here via the
	 * HTML `form` attribute, and this form carries the nonce and action.
	 */
	private function render_toggle_form(): void {
		if ( ! current_user_can( self::REVOKE_ALL_CAPABILITY ) ) {
			return;
		}

		echo '<style>
			.shareadraft-switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; margin-left: 24px; }
			.shareadraft-switch input[type="checkbox"] { position: absolute; opacity: 0; width: 36px; height: 20px; margin: 0; cursor: pointer; }
			.shareadraft-switch .shareadraft-track { box-sizing: border-box; width: 36px; height: 20px; border-radius: 10px; background: #8c8f94; position: relative; transition: background 0.15s ease; }
			.shareadraft-switch .shareadraft-track::before { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: transform 0.15s ease; }
			.shareadraft-switch input:checked ~ .shareadraft-track { background: #2271b1; }
			.shareadraft-switch input:checked ~ .shareadraft-track::before { transform: translateX(16px); }
			.shareadraft-switch input:focus-visible ~ .shareadraft-track { outline: 2px solid #2271b1; outline-offset: 2px; }
			#shareadraft-select-all { background: #f6f7f7; border: 1px solid #c3c4c7; padding: 8px 12px; margin: 4px 0 8px; }
		</style>';

		echo '<form method="post" id="shareadraft-toggle" action="' . esc_url( $this->page_url() ) . '">';
		wp_nonce_field( 'shareadraft_toggle_links' );
		echo '<input type="hidden" name="action" value="toggle_links" /></form>';
	}

	/**
	 * The Gmail-style "select all across pages" offer, shown once the header
	 * checkbox selects the whole page. Ticking it upgrades the ordinary bulk
	 * Revoke — dropdown plus Apply, two deliberate steps — to the whole
	 * filtered set, so revoking everything a user made (filter to them first)
	 * and the break-glass revoke-everything are the same familiar flow rather
	 * than separate always-visible controls.
	 */
	private function maybe_render_select_all( PreviewLinksListTable $table ): void {
		$creator = self::requested_creator();
		$total   = $this->service->count_links( $creator );

		// Pointless when one page holds everything; the header checkbox
		// already selects the whole set.
		if ( $total <= count( $table->items ) ) {
			return;
		}

		// Site-wide select-all is the break-glass revoke; only offer it to
		// those allowed to pull that handle. A creator-filtered select-all is
		// within the table's own capability.
		if ( null === $creator && ! current_user_can( self::REVOKE_ALL_CAPABILITY ) ) {
			return;
		}

		if ( null !== $creator ) {
			/* translators: 1: number of links, 2: user display name */
			$offer = sprintf( __( 'Select all %1$d links created by %2$s', 'shareadraft' ), $total, $this->creator_name( $creator ) );
			/* translators: 1: number of links, 2: user display name */
			$active = sprintf( __( 'All %1$d links created by %2$s are selected.', 'shareadraft' ), $total, $this->creator_name( $creator ) );
		} else {
			/* translators: %d: number of links */
			$offer = sprintf( __( 'Select all %d links across the whole site', 'shareadraft' ), $total );
			/* translators: %d: number of links */
			$active = sprintf( __( 'All %d links across the whole site are selected.', 'shareadraft' ), $total );
		}

		printf(
			'<div id="shareadraft-select-all" hidden>
				<span id="shareadraft-select-all-offer">%s <button type="button" class="button-link" id="shareadraft-select-all-btn">%s</button></span>
				<span id="shareadraft-select-all-active" hidden>%s <button type="button" class="button-link" id="shareadraft-clear-selection-btn">%s</button></span>
			</div>',
			esc_html__( 'All links on this page are selected.', 'shareadraft' ),
			esc_html( $offer ),
			esc_html( $active ),
			esc_html__( 'Clear selection', 'shareadraft' )
		);

		// The wiring that binds this banner to the table's checkboxes lives in
		// src/admin.js, enqueued by enqueue_assets() on this screen only.
	}

	/** A creator's display name, or a placeholder when the account is gone. */
	private function creator_name( int $user_id ): string {
		$user = get_userdata( $user_id );

		/* translators: %d: user ID */
		return false !== $user ? $user->display_name : sprintf( __( 'User #%d', 'shareadraft' ), $user_id );
	}

	/**
	 * A loud, undismissable banner while the site-wide switch is off. This is
	 * deliberately the one piece of out-of-band state in the plugin, so every
	 * editor on this screen must see it — a table of "Active" links that quietly
	 * do not work would generate exactly the support tickets it exists to avoid.
	 */
	private function maybe_render_disabled_banner(): void {
		if ( ! $this->toggle->is_disabled() ) {
			return;
		}

		$since = $this->toggle->disabled_at();
		$actor = $this->toggle->disabled_by();

		$who = null;
		if ( null !== $actor && 0 !== $actor ) {
			$user = get_userdata( $actor );
			$who  = false !== $user ? $user->display_name : null;
		}

		$when = null !== $since ? wp_date( PreviewLinksListTable::datetime_format(), $since ) : false;

		if ( null !== $who && false !== $when ) {
			/* translators: 1: user display name, 2: date and time */
			$detail = sprintf( __( 'Disabled by %1$s on %2$s.', 'shareadraft' ), $who, $when );
		} elseif ( false !== $when ) {
			/* translators: %s: date and time */
			$detail = sprintf( __( 'Disabled on %s.', 'shareadraft' ), $when );
		} else {
			$detail = '';
		}

		printf(
			'<div class="notice notice-warning"><p><strong>%s</strong> %s %s</p></div>',
			esc_html__( 'Preview links are disabled site-wide.', 'shareadraft' ),
			esc_html__( 'No preview link works while this is off — including newly generated ones. Each link keeps its own expiry and usage, and links that are still valid start working again when re-enabled.', 'shareadraft' ),
			esc_html( $detail )
		);
	}


	/**
	 * When the table is filtered to one creator, say so. Revoking everything
	 * they created is the select-all-across-pages flow on this filtered view,
	 * not a separate control.
	 */
	private function maybe_render_creator_filter(): void {
		$creator = self::requested_creator();

		if ( null === $creator ) {
			return;
		}

		printf(
			'<p>%s <a href="%s">%s</a></p>',
			esc_html(
				/* translators: %s: user display name */
				sprintf( __( 'Showing links created by %s.', 'shareadraft' ), $this->creator_name( $creator ) )
			),
			esc_url( $this->page_url() ),
			esc_html__( 'Show all creators', 'shareadraft' )
		);
	}

	/**
	 * The revoke bulk action requested, if any. Reads the list table's own
	 * `action`/`action2` fields; the selection is only acted on after the caller
	 * has verified the bulk nonce.
	 */
	private function requested_bulk_action(): string {
		foreach ( [ 'action', 'action2' ] as $key ) {
			// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Acted on only after check_admin_referer() in process_request().
			if ( isset( $_REQUEST[ $key ] ) && is_string( $_REQUEST[ $key ] ) && '-1' !== $_REQUEST[ $key ] ) {
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- See above.
				return sanitize_key( wp_unslash( $_REQUEST[ $key ] ) );
			}
		}

		return '';
	}

	/**
	 * Revoke every link ticked in the table, returning how many were revoked. Each
	 * value is a `post_id:token_hash` pair emitted by the checkbox column. The
	 * bulk nonce is shared by every row, so each pair is checked against the
	 * viewer's right to edit its post rather than trusting the table to have
	 * offered only those.
	 */
	private function revoke_selected(): int {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing, WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Nonce verified in process_request(); each pair is sanitised with sanitize_text_field() in the loop below.
		$selected = isset( $_POST['links'] ) ? wp_unslash( $_POST['links'] ) : [];

		if ( ! is_array( $selected ) ) {
			return 0;
		}

		$count = 0;

		foreach ( $selected as $pair ) {
			if ( ! is_string( $pair ) ) {
				continue;
			}

			$parts = explode( ':', sanitize_text_field( $pair ), 2 );

			if ( 2 === count( $parts ) && current_user_can( 'edit_post', (int) $parts[0] ) && $this->service->revoke( (int) $parts[0], $parts[1] ) ) {
				++$count;
			}
		}

		return $count;
	}

	/**
	 * Name any VIP Dashboard ranges that were ignored as malformed. The
	 * Dashboard field is free text, and if every entry is a typo the site
	 * silently has no IP restriction at all while its owner believes it does.
	 */
	private function maybe_render_rejected_ranges(): void {
		if ( [] === $this->rejected_ip_ranges ) {
			return;
		}

		$entries = implode(
			', ',
			array_map(
				static fn ( string $entry ): string => sprintf( '<code>%s</code>', esc_html( $entry ) ),
				$this->rejected_ip_ranges
			)
		);

		printf(
			'<div class="notice notice-warning"><p>%s %s %s</p></div>',
			esc_html__( 'Some trusted IP ranges set in the VIP Dashboard are not valid IP addresses or CIDR ranges, so they are ignored:', 'shareadraft' ),
			$entries, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each entry is passed through esc_html() above; the only markup is static <code> tags.
			[] === $this->central_ip_ranges
				? esc_html__( 'No site-wide IP restriction applies until they are corrected.', 'shareadraft' )
				: esc_html__( 'Only the valid ranges below apply.', 'shareadraft' )
		);
	}

	/**
	 * State the central baseline once, above the table. The IP ranges column
	 * shows only each link's own ranges, so without this line a table full of
	 * dashes would read as "no IP restrictions" on a site where the Dashboard
	 * restricts every link.
	 */
	private function maybe_render_central_ranges(): void {
		if ( [] === $this->central_ip_ranges ) {
			return;
		}

		$ranges = implode(
			', ',
			array_map(
				static fn ( string $range ): string => sprintf( '<code>%s</code>', esc_html( $range ) ),
				$this->central_ip_ranges
			)
		);

		printf(
			'<p>%s %s</p>',
			esc_html__( 'Every link opens only from these IP ranges, set in the VIP Dashboard, plus any ranges shown on the link itself below:', 'shareadraft' ),
			$ranges // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Each range is passed through esc_html() above; the only markup is static <code> tags.
		);
	}

	private function maybe_render_notice(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read only to render a result notice after our own post-revoke redirect; no action is taken here.
		if ( ! isset( $_GET['shareadraft_revoked'] ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- See above.
		$count = is_scalar( $_GET['shareadraft_revoked'] ) ? (int) $_GET['shareadraft_revoked'] : 0;
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Set by our own post-revoke redirect; read only to phrase the notice.
		$pending = isset( $_GET['shareadraft_pending'] );

		// Nothing revoked and nothing still running: the links were already gone
		// (a double click, a second tab, a colleague) or none were ticked. Not a
		// success, so not green.
		if ( 0 === $count && ! $pending ) {
			printf(
				'<div class="notice notice-warning is-dismissible"><p>%s</p></div>',
				esc_html__( 'No preview links were revoked. Any you selected may already have been revoked.', 'shareadraft' )
			);

			return;
		}

		$message = sprintf(
			/* translators: %d: number of preview links revoked */
			_n( '%d preview link revoked.', '%d preview links revoked.', $count, 'shareadraft' ),
			$count
		);

		if ( $pending ) {
			$message .= ' ' . __( 'The remaining links are being revoked in the background.', 'shareadraft' );
		}

		printf(
			'<div class="notice notice-success is-dismissible"><p>%s</p></div>',
			esc_html( $message )
		);
	}

	/**
	 * Register the per-page screen option, the hideable columns, and the help tabs
	 * once the screen exists. Runs on the page load, after any revoke.
	 */
	public function configure_screen(): void {
		$screen = get_current_screen();

		if ( ! $screen instanceof \WP_Screen ) {
			return;
		}

		add_screen_option(
			'per_page',
			[
				'label'   => __( 'Links per page', 'shareadraft' ),
				'default' => self::DEFAULT_PER_PAGE,
				'option'  => self::PER_PAGE_OPTION,
			]
		);

		// Let WordPress render the column show/hide checkboxes in Screen Options.
		add_filter( "manage_{$screen->id}_columns", [ $this, 'screen_columns' ] );

		$this->add_help( $screen );
	}

	/**
	 * The columns offered as show/hide checkboxes in Screen Options. WordPress
	 * drops the checkbox column itself.
	 *
	 * @return array<string, string>
	 */
	public function screen_columns(): array {
		return $this->table()->get_columns();
	}

	/**
	 * Persist the "links per page" screen option. Core discards a custom per-page
	 * option unless a filter returns its value.
	 *
	 * @param mixed  $_screen_option Incoming value; unused.
	 * @param string $_option        Option name; unused.
	 * @param mixed  $value          The submitted value.
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter -- Signature is dictated by the set_screen_option filter.
	public function save_per_page( mixed $_screen_option, string $_option, mixed $value ): int {
		return is_scalar( $value ) ? min( 999, max( 1, (int) $value ) ) : self::DEFAULT_PER_PAGE;
	}

	private function add_help( \WP_Screen $screen ): void {
		$screen->add_help_tab(
			[
				'id'      => 'shareadraft-overview',
				'title'   => __( 'Overview', 'shareadraft' ),
				'content' => '<p>' . esc_html__( 'This screen lists every preview link across the site, so you can see at a glance which drafts are shared, how far each link has been used, and when it expires. It is read-only apart from revoking, and is shown to editors because they can already view the drafts these links point at.', 'shareadraft' ) . '</p>',
			]
		);

		$reading  = '<p>' . esc_html__( 'The table identifies a link by the last four characters of its token and can revoke it, but it never shows or re-copies the shareable URL: only a hash of the token is stored, never the token itself. If a link is lost, revoke it and generate a fresh one from the post editor.', 'shareadraft' ) . '</p>';
		$reading .= '<p>' . esc_html__( 'A link on a post you cannot edit is listed without its title, reviewers, or IP ranges, and cannot be revoked from its row.', 'shareadraft' ) . '</p>';
		$reading .= '<p><strong>' . esc_html__( 'Status', 'shareadraft' ) . '</strong></p><ul>';
		$reading .= '<li>' . esc_html__( 'Active: the link works.', 'shareadraft' ) . '</li>';
		$reading .= '<li>' . esc_html__( 'Expired: past its expiry time.', 'shareadraft' ) . '</li>';
		$reading .= '<li>' . esc_html__( 'Exhausted: opened by as many people as it allows.', 'shareadraft' ) . '</li>';
		$reading .= '<li>' . esc_html__( 'Revoked: switched off by hand.', 'shareadraft' ) . '</li>';
		$reading .= '</ul><p>' . esc_html__( 'Uses counts how many people have opened the link, against its maximum; an infinity sign means no maximum.', 'shareadraft' ) . '</p>';
		$reading .= '<p>' . esc_html__( 'Each browser counts as one person. A reviewer who opens the link in another browser, on another device, or in a private window, or who clears their cookies, counts again, while people sharing one browser count once. A browser is remembered for a week, so on a link that lasts longer, a reviewer returning after a week counts again.', 'shareadraft' ) . '</p>';

		// The optional restriction columns only exist while their feature is
		// enabled, so their explanations come and go with them.
		if ( Features::recipients_enabled() ) {
			$reading .= '<p>' . esc_html__( 'Reviewers shows the email addresses a link is bound to. Each reviewer proves control of their address with an emailed code before the draft opens, so the link works for the people it names rather than for anyone it gets forwarded to. A dash means anyone with the link can view. To change the reviewer list, revoke the link and generate a new one.', 'shareadraft' ) . '</p>';
		}

		if ( Features::ip_allowlist_enabled() ) {
			// Central ranges change what a link's own ranges mean: without them,
			// a link's ranges restrict it; with them, they widen it.
			$ranges   = [] === $this->central_ip_ranges
				? __( 'IP ranges shows the addresses a link is restricted to: a link with ranges opens only from them.', 'shareadraft' )
				: __( 'IP ranges shows the ranges a link has of its own. Every link opens only from the ranges set in the VIP Dashboard, and a link\'s own ranges let it open from further places too.', 'shareadraft' );
			$reading .= '<p>' . esc_html( $ranges ) . ' ' . esc_html__( 'A dash means the link has no ranges of its own. A link cannot be edited once shared: to change its ranges, revoke it and generate a new one.', 'shareadraft' ) . '</p>';
		}

		$screen->add_help_tab(
			[
				'id'      => 'shareadraft-reading',
				'title'   => __( 'Reading a row', 'shareadraft' ),
				'content' => $reading,
			]
		);

		$screen->add_help_tab(
			[
				'id'      => 'shareadraft-revoking',
				'title'   => __( 'Revoking', 'shareadraft' ),
				'content' => '<p>' . esc_html__( 'Revoking a link stops it working immediately. For a short period the visitor sees a "no longer available" notice, and after that a plain "not found" page. Revoking cannot be undone: generate a new link to restore access. Use the row action to revoke one link, or tick several and choose the Revoke bulk action.', 'shareadraft' ) . '</p>'
					. '<p>' . esc_html__( 'To revoke at scale, tick the checkbox in the table header. If more links exist than the page shows, you are offered "Select all" across every page — covering the whole site, or, if you first clicked a name in the Created by column, everything that person created, including links on posts you cannot edit (useful when someone leaves). Then apply the Revoke bulk action as usual. Selecting every link site-wide is limited to administrators. When a user account is deleted, their links are revoked automatically.', 'shareadraft' ) . '</p>'
					. '<p>' . esc_html__( 'Not sure yet whether to revoke? Preview links can also be paused site-wide — see the Pausing all links tab.', 'shareadraft' ) . '</p>',
			]
		);

		$screen->add_help_tab(
			[
				'id'      => 'shareadraft-pausing',
				'title'   => __( 'Pausing all links', 'shareadraft' ),
				'content' => '<p>' . esc_html__( 'The toggle next to the bulk actions switches every preview link off at once — the first response when links may be leaking but you are not yet sure. It is a reversible pause, not a revocation: nothing is deleted, each link keeps its own expiry and usage, and links that are still valid resume working the moment an administrator re-enables them.', 'shareadraft' ) . '</p>'
					. '<p>' . esc_html__( 'While links are paused, this screen banners who paused them and when, the editor warns authors that new and existing links will not work, and visitors opening a link see a "temporarily disabled" notice. Only administrators can flip the switch.', 'shareadraft' ) . '</p>',
			]
		);

		$screen->set_help_sidebar( $this->help_sidebar() );
	}

	/**
	 * Where to send someone who needs more help.
	 *
	 * VIP support can only help VIP customers, so pointing every install at it
	 * would send most people to a desk that cannot answer them. On VIP the links
	 * go to the platform's documentation and support; everywhere else, to the
	 * plugin's own support forum.
	 */
	private function help_sidebar(): string {
		$links = Platform::is_vip()
			? [
				'https://docs.wpvip.com/'  => __( 'WordPress VIP documentation', 'shareadraft' ),
				'mailto:support@wpvip.com' => __( 'Contact VIP support', 'shareadraft' ),
			]
			: [
				'https://wordpress.org/support/plugin/shareadraft/' => __( 'Support forum', 'shareadraft' ),
			];

		$sidebar = '<p><strong>' . esc_html__( 'For more information', 'shareadraft' ) . '</strong></p>';

		foreach ( $links as $url => $label ) {
			$sidebar .= '<p><a href="' . esc_url( $url ) . '">' . esc_html( $label ) . '</a></p>';
		}

		return $sidebar;
	}

	private function table(): PreviewLinksListTable {
		if ( null === $this->table ) {
			if ( ! class_exists( 'WP_List_Table' ) ) {
				require_once ABSPATH . 'wp-admin/includes/class-wp-list-table.php';
			}

			$this->table = new PreviewLinksListTable( $this->service, $this->clock->now(), $this->toggle );
		}

		return $this->table;
	}

	private function page_url(): string {
		return add_query_arg( 'page', self::SLUG, admin_url( 'admin.php' ) );
	}
}
