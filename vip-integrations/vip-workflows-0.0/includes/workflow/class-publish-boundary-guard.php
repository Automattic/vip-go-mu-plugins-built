<?php
/**
 * Publish Boundary Guard - the save-layer veto behind the workflow side-effect guard.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Admin\Settings;

/**
 * Vetoes a non-bypass user's post_status change across the publish boundary on
 * a workflow-managed post.
 *
 * This is the ONE place the workflow overrides a status change core would allow,
 * so it lives at the save layer and covers every path a person writes through —
 * block editor, Quick Edit, Bulk Edit, REST, and WP-CLI run as a user
 * (`wp --user=…`; a userless write is a system context, see resolve_veto()):
 *
 * - `wp_insert_post_data` is the universal backstop. A vetoed change is reverted
 *   to the post's currently stored status, so the write lands with the old
 *   status rather than failing outright.
 * - `rest_pre_insert_{post_type}` returns a WP_Error for REST writes (how the
 *   block editor saves), so the editor shows a real message instead of a silent
 *   revert.
 * - `admin_notices` surfaces the same message on the classic editor (post.php).
 *   Quick Edit and Bulk Edit cannot render it — see render_veto_notice().
 *
 * The veto changes capabilities in no way: it gates one action and always offers
 * a first-class, audited way through (StatusManager::remove_sequence(), or
 * moving the post through the workflow to a published stage).
 */
class PublishBoundaryGuard {


	/**
	 * Transient key prefix for a queued classic-path veto notice.
	 *
	 * Scoped by user AND post: the notice belongs to the person whose save was
	 * refused, on the screen they land on afterwards.
	 */
	private const NOTICE_TRANSIENT_PREFIX = 'vip_workflows_publish_veto_';

	/**
	 * Lifetime (seconds) of a queued veto notice.
	 *
	 * Long enough to survive the redirect that follows a classic save, short
	 * enough that a stale message never resurfaces on a later visit.
	 */
	private const NOTICE_TTL = 60;

	/**
	 * Status manager (the authority for the publish-boundary predicate).
	 *
	 * @var StatusManager
	 */
	private StatusManager $status_manager;

	/**
	 * Constructor.
	 *
	 * @param StatusManager $status_manager Status manager.
	 */
	public function __construct( StatusManager $status_manager ) {
		$this->status_manager = $status_manager;
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		// The universal backstop: every path that writes a post goes through here.
		add_filter( 'wp_insert_post_data', array( $this, 'veto_post_data' ), 10, 2 );

		// REST writes get a real error instead of a silent revert. Registered on
		// rest_api_init because the post types are only known once every plugin
		// and theme has registered them on `init`.
		add_action( 'rest_api_init', array( $this, 'register_rest_guards' ) );

		// Classic paths (post.php) surface the queued message.
		add_action( 'admin_notices', array( $this, 'render_veto_notice' ) );
	}

	/**
	 * Register the REST veto on every post type exposed to the REST API.
	 *
	 * Deliberately NOT scoped to the post types PostTypeManager currently maps to
	 * an active sequence. That map is built from active sequences only, while
	 * the veto predicate resolves a post's sequence from the post's own meta and
	 * does not filter on status — so a post assigned to a sequence that was
	 * later deactivated (or whose post_types list no longer covers it) is still
	 * vetoed by the wp_insert_post_data backstop. Registering from the narrower
	 * map would leave exactly those writes with a silent revert and no message,
	 * which is the invisible side effect this guard exists to remove. The two
	 * surfaces must therefore agree on coverage, and the wider one is the
	 * backstop's: every post type, never a hardcoded 'post'.
	 *
	 * The filter is a no-op for any post that is not workflow-managed.
	 */
	public function register_rest_guards(): void {
		foreach ( get_post_types( array( 'show_in_rest' => true ), 'names' ) as $post_type ) {
			add_filter( "rest_pre_insert_{$post_type}", array( $this, 'veto_rest_insert' ), 10, 2 );
		}
	}

	/**
	 * Universal backstop: revert a vetoed status change before it is written.
	 *
	 * Reverting (rather than failing the write) keeps the rest of the save —
	 * title, content, meta — intact; only the status the user is not allowed to
	 * set is put back to the post's stored value.
	 *
	 * @param  array $data    Sanitized post data about to be written.
	 * @param  array $postarr Raw post data as passed to wp_insert_post().
	 * @return array Post data, with post_status reverted when the change is vetoed.
	 */
	public function veto_post_data( array $data, array $postarr ): array {
		$post_id = (int) ( $postarr['ID'] ?? 0 );
		$veto    = $this->resolve_veto( $post_id, (string) ( $data['post_status'] ?? '' ) );

		if ( null === $veto ) {
			return $data;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( sprintf( '[VIP Workflows] Vetoed a publish-boundary status change on post %d by user %d: "%s" -> "%s"; the post is in a workflow and the user cannot bypass it.', $post_id, get_current_user_id(), $veto['current_status'], $veto['target_status'] ) );

		$this->queue_veto_notice( $post_id, $veto['message'] );

		$data['post_status'] = $veto['current_status'];

		// Putting the status back is not enough on its own. wp_insert_post()
		// derives the slug and the GMT date from the status BEFORE this filter
		// runs — `post_name` is generated for any status outside
		// draft/pending/auto-draft, and `post_date`/`post_date_gmt` are what turn
		// a publish into a `future`. Leaving those behind writes a draft carrying
		// a public slug and a future date, and the next legitimate workflow
		// publish then silently coerces to `future` off that stale date. Revert
		// the whole shape of the write core prepared for a status the user may
		// not set; the rest of the save (title, content, meta) still lands.
		$data['post_name']     = $veto['post_name'];
		$data['post_date']     = $veto['post_date'];
		$data['post_date_gmt'] = $veto['post_date_gmt'];

		return $data;
	}

	/**
	 * REST veto: refuse the write with a message the editor can display.
	 *
	 * Runs before wp_insert_post_data, so a refused REST write never reaches the
	 * backstop's silent revert.
	 *
	 * @param  \stdClass        $prepared_post Post object prepared for the database.
	 * @param  \WP_REST_Request $request       The REST request.
	 * @return \stdClass|\WP_Error The prepared post, or WP_Error when the change is vetoed.
	 */
	public function veto_rest_insert( $prepared_post, $request ) {
		$post_id = (int) ( $prepared_post->ID ?? 0 );
		$veto    = $this->resolve_veto( $post_id, (string) ( $prepared_post->post_status ?? '' ) );

		if ( null === $veto ) {
			return $prepared_post;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( sprintf( '[VIP Workflows] Vetoed a publish-boundary status change on post %d by user %d via REST: "%s" -> "%s".', $post_id, get_current_user_id(), $veto['current_status'], $veto['target_status'] ) );

		return new \WP_Error(
			'vip_workflows_publish_boundary',
			$veto['message'],
			array(
				'status'  => 409,
				'post_id' => $post_id,
			)
		);
	}

	/**
	 * Render (once) a veto notice queued for the post currently being edited.
	 *
	 * Reaches post.php, and only post.php. Quick Edit saves over AJAX and never
	 * fires admin_notices at all; Bulk Edit redirects to edit.php, where there is
	 * no post in scope to match the queued message against. On both, the message
	 * queued here is consumed on the next full admin page load for that post, or
	 * expires unread — so a vetoed Quick Edit or Bulk Edit currently reads as a
	 * no-op with a success message from core.
	 *
	 * That is a known gap, and it is the CLIENT preflight's to close, not this
	 * one's: the spec puts the loud rejection on those two surfaces in the
	 * inline/bulk scripts, which have the row data to evaluate the crossing
	 * before the request is ever made. The server veto stays the backstop
	 * underneath them.
	 */
	public function render_veto_notice(): void {
		$post = get_post();
		if ( ! $post ) {
			return;
		}

		$key     = $this->notice_key( get_current_user_id(), (int) $post->ID );
		$message = get_transient( $key );

		if ( ! is_string( $message ) || '' === $message ) {
			return;
		}

		delete_transient( $key );

		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			esc_html( $message )
		);
	}

	/**
	 * Decide whether a status change on a post must be vetoed.
	 *
	 * All of these must hold: the post is workflow-managed, the status genuinely
	 * changes, the actor is a non-bypass user, the change crosses the publish
	 * boundary, and the write is not a system context.
	 *
	 * @param  int    $post_id       Post ID (0 for an insert of a brand-new post).
	 * @param  string $target_status Status the write would set.
	 * @return array{message: string, current_status: string, target_status: string, post_name: string, post_date: string, post_date_gmt: string}|null Veto details (including the stored slug/date the write must be reverted to), or null when the change is allowed.
	 */
	private function resolve_veto( int $post_id, string $target_status ): ?array {
		// A brand-new post has no workflow yet, and a write that names no status
		// changes none.
		if ( $post_id <= 0 || '' === $target_status ) {
			return null;
		}

		// The cheapest and most selective test first: this filter runs on EVERY
		// post write on the site, and a post carrying no sequence meta is not
		// workflow-managed, so crosses_publish_boundary() would answer "no
		// crossing" for it anyway. Short-circuiting here keeps the user lookup,
		// the option read and the sequence resolution off the hot path.
		if ( ! get_post_meta( $post_id, StatusManager::SEQUENCE_META_KEY, true ) ) {
			return null;
		}

		if ( $this->is_system_context( $post_id ) ) {
			return null;
		}

		$post = get_post( $post_id );
		if ( ! $post ) {
			return null;
		}

		// Revisions carry their parent's content, never its workflow.
		if ( 'revision' === $post->post_type ) {
			return null;
		}

		// Only a genuine status CHANGE can cross the boundary. Without this, every
		// ordinary save of a post whose stage and status have drifted apart would
		// be refused.
		$current_status = (string) $post->post_status;
		if ( $current_status === $target_status ) {
			return null;
		}

		// `future` -> `publish` is not a user's move, it is core's. wp_insert_post()
		// rewrites a due `future` to `publish` BEFORE this filter runs, so an
		// ordinary save (a title fix over Quick Edit, a content save) of a
		// scheduled post whose time has arrived reaches here as a boundary
		// crossing nobody asked for. Vetoing it reverts the post to `future`,
		// pushes go-live to the next cron tick — and, if cron is late or broken,
		// every subsequent save silently reverts it again. Scheduling already
		// passed the boundary check when the post was scheduled; going live is
		// the outcome of that decision, not a new one.
		if ( 'future' === $current_status && 'publish' === $target_status ) {
			return null;
		}

		// A post already in the Trash sits outside the boundary, in both
		// directions. `trash` is an overlay: it suspends the workflow in place
		// without moving the stage, so the stage still names the region the post
		// was working in when it was trashed — a value that no longer describes
		// where the post is. crosses_publish_boundary() reads the current side of
		// the boundary from that stage, and carves `trash` out only as a TARGET
		// status, so without this every restore of a trashed workflow post seated
		// in the publish region reads as an out-of-publish crossing.
		//
		// Vetoing a restore is not merely wrong, it is silently destructive:
		// wp_untrash_post() has already deleted `_wp_trash_meta_status` /
		// `_wp_trash_meta_time` by the time it calls wp_update_post(), and reads
		// the truthy return of the reverted write as success — so the post stays
		// trashed, loses its trash bookkeeping, and wp-admin reports it restored.
		// (The block editor and the posts DataView restore by writing
		// status=draft over REST instead, which the same veto would refuse with a
		// 409.) Coming out of the Trash is core putting the post back where it
		// was, not a user crossing the boundary; StatusManager::on_status_transition()
		// reseats the stage afterwards exactly as it does today.
		//
		// The carve-out stops short of the publish region, though. Exempting EVERY
		// target would make the Trash a laundry for the one act this guard exists
		// to refuse: trash the post, then write status=publish straight out of the
		// Trash (the block editor, the DataView and Quick Edit all restore by
		// writing a status over REST), and the publish lands unvetoed. Leaving
		// publish-region targets to the ordinary predicate costs restores nothing —
		// a post that was live when it was trashed is seated at a publish-region
		// stage, so restoring it to `publish` compares publish to publish and is
		// not a crossing — while a post that was never published cannot be
		// laundered into the publish region by way of the Trash.
		if ( 'trash' === $current_status
			&& 'publish' !== $this->status_manager->status_to_region( $target_status ) ) {
			return null;
		}

		// A userless write is a trusted system actor (WP-CLI, seeder, importer),
		// not a person the role-based bypass list can describe — the same rule
		// StatusManager::assign_sequence() applies to its region-crossing gate.
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return null;
		}

		// Bypass users get the warn/confirm treatment on the client instead.
		if ( Settings::can_user_bypass_workflow( $user_id ) ) {
			return null;
		}

		// The shared predicate is the sole authority for the boundary (and is
		// false for a post with no sequence, so it settles "workflow-managed"
		// too).
		if ( ! $this->status_manager->crosses_publish_boundary( $post_id, $target_status ) ) {
			return null;
		}

		return array(
			'message'        => $this->veto_message( $post_id, (string) $post->post_title ),
			'current_status' => $current_status,
			'target_status'  => $target_status,
			'post_name'      => (string) $post->post_name,
			'post_date'      => (string) $post->post_date,
			'post_date_gmt'  => (string) $post->post_date_gmt,
		);
	}

	/**
	 * Whether this write is a system context the veto must never touch.
	 *
	 * Cron matters most: `future` is publish-side for the boundary predicate, so
	 * without this exemption cron's `future` → `publish` write would be refused
	 * and no scheduled post on the site would ever go live. wp_doing_cron() is
	 * filterable, so the DOING_CRON constant is checked too — no filter may
	 * disarm this.
	 *
	 * Autosaves and revisions are core bookkeeping, not editorial decisions, and
	 * a plugin-driven workflow commit (a crossing written by
	 * StatusManager::transition()/assign_sequence()) is the workflow moving the
	 * post itself.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool
	 */
	private function is_system_context( int $post_id ): bool {
		if ( wp_doing_cron() || ( defined( 'DOING_CRON' ) && DOING_CRON ) ) {
			return true;
		}

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return true;
		}

		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return true;
		}

		return StatusManager::is_transition_in_progress( $post_id );
	}

	/**
	 * Build the veto message: what is blocking the change, and both ways through.
	 *
	 * @param  int    $post_id    Post ID.
	 * @param  string $post_title Post title.
	 * @return string
	 */
	private function veto_message( int $post_id, string $post_title ): string {
		$sequence = $this->status_manager->get_sequence_for_post( $post_id );

		if ( ! $sequence ) {
			// crosses_publish_boundary() reported a crossing, so the post carries
			// sequence meta; a sequence that will not resolve from it is a
			// data-integrity bug. The veto stands (fail closed) and the escape
			// hatch — which is exactly the cure for a dangling reference — is still
			// offered, but the workflow cannot be named.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d is workflow-managed but its sequence could not be resolved while building the publish-veto message.', $post_id ) );

			return sprintf(
				/* translators: %s: post title. */
				__( "'%s' is in a workflow. To publish it directly, remove it from the workflow (this is logged), or move it through the workflow to a published stage.", 'vip-workflows' ),
				$post_title
			);
		}

		return sprintf(
			/* translators: 1: post title, 2: workflow (sequence) name. */
			__( "'%1\$s' is in the '%2\$s' workflow. To publish it directly, remove it from the workflow (this is logged), or move it through the workflow to a published stage.", 'vip-workflows' ),
			$post_title,
			$sequence->name
		);
	}

	/**
	 * Queue a veto message for the classic-path admin notice.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $message Message to show.
	 */
	private function queue_veto_notice( int $post_id, string $message ): void {
		set_transient( $this->notice_key( get_current_user_id(), $post_id ), $message, self::NOTICE_TTL );
	}

	/**
	 * Transient key for a queued veto notice.
	 *
	 * @param  int $user_id User the notice belongs to.
	 * @param  int $post_id Post the veto was raised on.
	 * @return string
	 */
	private function notice_key( int $user_id, int $post_id ): string {
		return self::NOTICE_TRANSIENT_PREFIX . $user_id . '_' . $post_id;
	}
}
