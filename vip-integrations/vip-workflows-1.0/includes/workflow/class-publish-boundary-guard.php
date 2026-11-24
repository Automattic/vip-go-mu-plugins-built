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
 * a workflow-managed post, and a status change that would reseat the stage in
 * a way the user couldn't take as a transition.
 *
 * The two rules are asked in that order, under the same exemptions: a change
 * that crosses the publish boundary is refused by the first, and one that
 * doesn't is held to the transition rules of the reseat it would cause
 * (StatusManager::core_status_change_refusal()).
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
 * - `pre_untrash_post` refuses a wp_untrash_post() before it starts when the
 *   status it would restore to is refused, so a refused restore leaves the
 *   post in the Trash untouched — see check_untrash().
 *
 * The veto changes capabilities in no way: it gates one action, and its message
 * names the way through — moving the post through the workflow to a published
 * stage — and who to ask otherwise: the workflow override roles, the only users
 * it never applies to and the only ones who can remove a post from its
 * workflow (StatusManager::remove_sequence()).
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

		// wp_untrash_post() asks before it deletes its Trash bookkeeping. Last,
		// so a plugin that has already decided the restore keeps its answer.
		add_filter( 'pre_untrash_post', array( $this, 'check_untrash' ), PHP_INT_MAX, 3 );
	}

	/**
	 * Refuse a wp_untrash_post() up front when the status it would write is refused.
	 *
	 * Core's wp_untrash_post() deletes `_wp_trash_meta_status` and
	 * `_wp_trash_meta_time` and only then writes the status, and it reads any
	 * truthy result of that write as success. A refusal at the save layer would revert the status and
	 * leave the post trashed, without its bookkeeping, and reported as restored.
	 * So the question is asked here, on `pre_untrash_post`, before anything
	 * changes: the status the restore would write is worked out the way core
	 * works it out (`draft`, or `inherit` for an attachment, through the
	 * `wp_untrash_post_status` filter with core's arguments) and put to
	 * resolve_veto(), the same decision the write itself gets.
	 *
	 * A refused restore returns false, which is how wp_untrash_post() reports
	 * a restore that didn't happen (wp-admin shows its "Error in restoring"
	 * screen). The post stays in the Trash with its bookkeeping intact, and a
	 * later restore by someone who can make the move goes through. A restore
	 * to `draft` is never refused (see resolve_veto()), so the default restore
	 * and the block editor's always work.
	 *
	 * Nothing is recorded between this check and the write. The
	 * `wp_untrash_post_status` filter runs twice, once here and once in core;
	 * its result is only read here. The one write the check can cause is the
	 * routing check settling an expired AI-stage job record as failed, the
	 * same recovery a workflow panel read performs
	 * (StatusManager::core_status_change_refusal()).
	 *
	 * @param  mixed    $untrash         Whether to go ahead; null unless another callback has decided.
	 * @param  \WP_Post $post            Post being restored.
	 * @param  string   $previous_status Status the post had when it was trashed.
	 * @return mixed The value given, or false when the restore is refused.
	 */
	public function check_untrash( $untrash, $post, $previous_status = '' ) {
		if ( null !== $untrash || ! $post instanceof \WP_Post || 'trash' !== $post->post_status ) {
			return $untrash;
		}

		// Cheap tests first, so most restores on a site never run the status
		// filter a second time: a post with no workflow, no user, or a user in
		// the override roles is never refused.
		if ( ! get_post_meta( (int) $post->ID, StatusManager::SEQUENCE_META_KEY, true ) ) {
			return $untrash;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id || Settings::can_user_bypass_workflow( $user_id ) ) {
			return $untrash;
		}

		$default_status = 'attachment' === $post->post_type ? 'inherit' : 'draft';
		$restore_status = apply_filters( 'wp_untrash_post_status', $default_status, (int) $post->ID, (string) $previous_status );

		$veto = $this->resolve_veto( (int) $post->ID, (string) $restore_status );
		if ( null === $veto ) {
			return $untrash;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log(
			sprintf(
				'[VIP Workflows] Refused restoring post %d from the Trash to "%s" for user %d before anything changed. %s',
				(int) $post->ID,
				(string) $restore_status,
				$user_id,
				$veto['log'] ?? 'The restore would cross the publish boundary, and the user is not on the workflow override list.'
			)
		);

		$this->queue_veto_notice( (int) $post->ID, $veto['message'] );

		return false;
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
	 * title, content, meta — intact; the status the user is not allowed to set
	 * is put back to the post's stored value. The stored slug and dates are put
	 * back with it, except between `draft`, `pending` and `auto-draft`, where
	 * core prepares them the same way for both statuses and the save's own
	 * slug and date edits are kept (see prepares_slug_and_dates_alike()).
	 *
	 * @param  array $data    Sanitized post data about to be written.
	 * @param  array $postarr Raw post data as passed to wp_insert_post().
	 * @return array Post data, with post_status (and, outside draft and pending, the slug and dates) reverted when the change is vetoed.
	 */
	public function veto_post_data( array $data, array $postarr ): array {
		$post_id = (int) ( $postarr['ID'] ?? 0 );
		$veto    = $this->resolve_veto( $post_id, (string) ( $data['post_status'] ?? '' ) );

		if ( null === $veto ) {
			return $data;
		}

		if ( isset( $veto['log'] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $veto['log'] );
		} else {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Vetoed a publish-boundary status change on post %d by user %d: "%s" -> "%s"; the post is in a workflow and the user is not on the workflow override list.', $post_id, get_current_user_id(), $veto['current_status'], $veto['target_status'] ) );
		}

		$this->queue_veto_notice( $post_id, $veto['message'] );

		$data['post_status'] = $veto['current_status'];

		// When core prepares the slug and dates the same way for both statuses
		// (draft and pending), a slug or date edit made in the same save is
		// kept. Every other refused change also puts the stored slug and dates
		// back.
		if ( $this->prepares_slug_and_dates_alike( $veto['current_status'], $veto['target_status'] ) ) {
			// One difference remains: core empties the slug of a `pending` post
			// the user can't publish, and keeps it for a draft. When either
			// status is `pending` and the user can't publish the post, the slug
			// core prepared doesn't match the status the post keeps, so keep
			// the stored slug. This is the same `publish_post` meta capability
			// check core makes for an update.
			$pending = in_array( 'pending', array( $veto['current_status'], $veto['target_status'] ), true );
			if ( $pending && ! current_user_can( 'publish_post', $post_id ) ) {
				$data['post_name'] = $veto['post_name'];
			}

			return $data;
		}

		// Putting the status back is not enough on its own. wp_insert_post()
		// derives the slug and the GMT date from the status BEFORE this filter
		// runs — `post_name` is made unique for any status outside
		// draft/pending/auto-draft, and `post_date`/`post_date_gmt` are what turn
		// a publish into a `future`. Leaving those behind writes a draft carrying
		// a public slug and a future date, and the next legitimate workflow
		// publish then silently coerces to `future` off that stale date. Going
		// the other way, a published or scheduled post would keep a slug that
		// was never checked for uniqueness. Revert the whole shape of the write
		// core prepared for a status the user may not set; the rest of the save
		// (title, content, meta) still lands.
		$data['post_name']     = $veto['post_name'];
		$data['post_date']     = $veto['post_date'];
		$data['post_date_gmt'] = $veto['post_date_gmt'];

		return $data;
	}

	/**
	 * Whether core prepares the slug and dates of a save the same way for both statuses.
	 *
	 * True only when both are `draft`, `pending` or `auto-draft`. For those,
	 * wp_unique_post_slug() returns the slug unchanged and core leaves an unset
	 * GMT date floating (all three are registered `date_floating`), so the slug
	 * and dates core prepared for the refused status are the ones it would have
	 * prepared for the status the post keeps. A custom `date_floating` status
	 * is not on the list: its slug is still made unique.
	 *
	 * @param  string $current_status Status the post keeps.
	 * @param  string $target_status  Status the refused change would have set.
	 * @return bool
	 */
	private function prepares_slug_and_dates_alike( string $current_status, string $target_status ): bool {
		$floating = array( 'draft', 'pending', 'auto-draft' );

		return in_array( $current_status, $floating, true ) && in_array( $target_status, $floating, true );
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
	public function veto_rest_insert( $prepared_post, $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- required by rest_pre_insert_{post_type} filter
		$post_id = (int) ( $prepared_post->ID ?? 0 );
		$veto    = $this->resolve_veto( $post_id, (string) ( $prepared_post->post_status ?? '' ) );

		if ( null === $veto ) {
			return $prepared_post;
		}

		if ( isset( $veto['log'] ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( $veto['log'] . ' (REST)' );
		} else {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Vetoed a publish-boundary status change on post %d by user %d via REST: "%s" -> "%s".', $post_id, get_current_user_id(), $veto['current_status'], $veto['target_status'] ) );
		}

		// A transition-rules refusal is a 403 (the user may not make this
		// move); a publish-boundary refusal stays a 409.
		return new \WP_Error(
			$veto['code'] ?? 'vip_workflows_publish_boundary',
			$veto['message'],
			array(
				'status'  => $veto['status'] ?? 409,
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
	 * changes, the actor is a non-bypass user, the write is not a system
	 * context, and either the change crosses the publish boundary or it would
	 * reseat the stage in a way the user couldn't take as a transition.
	 *
	 * @param  int    $post_id       Post ID (0 for an insert of a brand-new post).
	 * @param  string $target_status Status the write would set.
	 * @return array{message: string, current_status: string, target_status: string, post_name: string, post_date: string, post_date_gmt: string, code?: string, status?: int, log?: string}|null Veto details (including the stored slug/date the write must be reverted to; a transition-rules refusal adds its REST code, HTTP status and log line), or null when the change is allowed.
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
		// in the publish region reads as an out-of-publish crossing. Coming out
		// of the Trash to a non-publish status is therefore not a crossing.
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
		//
		// Leaving the Trash for `draft` is also exempt from the transition rules.
		// It is what wp_untrash_post() writes by default and what the block
		// editor and the DataView write to restore, so every restore path
		// works. on_status_transition() still reseats it: the stage stays if it
		// is in the draft region, otherwise it moves to the draft region's entry
		// stage, which can be a stage that comes after the one the post was
		// trashed from. Any other status written to a trashed post is held to
		// the transition rules below, by whatever path it arrives. For
		// wp_untrash_post() that question is asked earlier, in check_untrash(),
		// before core deletes its Trash bookkeeping.
		$leaving_trash = 'trash' === $current_status
			&& 'publish' !== $this->status_manager->status_to_region( $target_status );
		if ( $leaving_trash && 'draft' === $target_status ) {
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
		// too). A non-publish status out of the Trash skips it (see above) and
		// is asked only the transition rules.
		if ( $leaving_trash || ! $this->status_manager->crosses_publish_boundary( $post_id, $target_status ) ) {
			return $this->transition_rules_veto( $post, $target_status, $user_id );
		}

		return array(
			'message'        => $this->veto_message( $post_id, (string) $post->post_title, $target_status ),
			'current_status' => $current_status,
			'target_status'  => $target_status,
			'post_name'      => (string) $post->post_name,
			'post_date'      => (string) $post->post_date,
			'post_date_gmt'  => (string) $post->post_date_gmt,
		);
	}

	/**
	 * Refuse a status change that would reseat the stage against the transition's rules.
	 *
	 * Asked only once every exemption above has passed and the change does not
	 * cross the publish boundary. StatusManager::core_status_change_refusal()
	 * decides; this shapes its answer like a publish veto, so the revert, the
	 * notice and the REST error all work the same way, with a 403 instead of
	 * the boundary's 409.
	 *
	 * @param  \WP_Post $post          Post being written, as stored.
	 * @param  string   $target_status Status the write would set.
	 * @param  int      $user_id       User making the change.
	 * @return array|null Veto details, as resolve_veto(), or null when the change is allowed.
	 */
	private function transition_rules_veto( \WP_Post $post, string $target_status, int $user_id ): ?array {
		$refusal = $this->status_manager->core_status_change_refusal( (int) $post->ID, $target_status, $user_id );
		if ( null === $refusal ) {
			return null;
		}

		$data = (array) $refusal->get_error_data();

		return array(
			'message'        => $refusal->get_error_message(),
			'current_status' => (string) $post->post_status,
			'target_status'  => $target_status,
			'post_name'      => (string) $post->post_name,
			'post_date'      => (string) $post->post_date,
			'post_date_gmt'  => (string) $post->post_date_gmt,
			'code'           => $refusal->get_error_code(),
			'status'         => (int) ( $data['status'] ?? 403 ),
			'log'            => sprintf(
				'[VIP Workflows] Refused a status change on post %d by user %d: "%s" -> "%s" would move the stage from "%s" to "%s", and the user can\'t take that transition (failed check: %s).',
				(int) $post->ID,
				$user_id,
				(string) $post->post_status,
				$target_status,
				(string) ( $data['from_stage'] ?? '' ),
				(string) ( $data['to_stage'] ?? '' ),
				(string) ( $data['check'] ?? '' )
			),
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
	 * A write to an autosave or a revision is core bookkeeping, not an editorial
	 * decision, and a plugin-driven workflow commit (a crossing written by
	 * StatusManager::transition()/assign_sequence()) is the workflow moving the
	 * post itself.
	 *
	 * The exemption follows the row that is written, not the request: an
	 * autosave request that writes to the post itself is checked like any other
	 * save. One that only saves content sets no new status, so it passes.
	 *
	 * @param  int $post_id Post ID.
	 * @return bool
	 */
	private function is_system_context( int $post_id ): bool {
		if ( wp_doing_cron() || ( defined( 'DOING_CRON' ) && DOING_CRON ) ) {
			return true;
		}

		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return true;
		}

		return StatusManager::is_transition_in_progress( $post_id );
	}

	/**
	 * Build the veto message: the change can't be made directly, the way through, and who to ask.
	 *
	 * The way through is the workflow. Removing the post from its workflow is
	 * not offered: only the override roles can, and the person reading this is
	 * never one of them (the veto does not apply to them). Instead a second
	 * sentence names those roles (Settings::get_override_role_names()) as the
	 * people to ask (ask_sentence()). With no override role configured there is
	 * no one to name, and the message is the first sentence alone.
	 *
	 * The veto refuses a crossing in either direction, so the sentences follow
	 * the target: publishing names a published stage, and anything else
	 * (unpublishing, making private) says the status can't be changed directly.
	 *
	 * The client builds the same message (getPublishVetoMessage() and
	 * getOrphanedWorkflowMessage() in src/common/confirm-workflow-side-effect.js)
	 * from the same role names, served as `guard.override_roles`. The two MUST
	 * stay identical to the character; change them together.
	 *
	 * @param  int    $post_id       Post ID.
	 * @param  string $post_title    Post title.
	 * @param  string $target_status Core status the refused change would write.
	 * @return string
	 */
	private function veto_message( int $post_id, string $post_title, string $target_status ): string {
		$sequence = $this->status_manager->get_sequence_for_post( $post_id );
		$roles    = Settings::get_override_role_names();

		if ( ! $sequence ) {
			// crosses_publish_boundary() reported a crossing, so the post carries
			// sequence meta; a sequence that will not resolve from it is a
			// data-integrity bug. The veto stands (fail closed). There is no
			// workflow to move the post through, so removal is the only way out,
			// and only the override roles can take it. This is the orphaned post
			// the client calls a deleted workflow, so it gets the client's
			// sentences word for word (getOrphanedWorkflowMessage()): one message
			// for one situation.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d is workflow-managed but its sequence could not be resolved while building the publish-veto message.', $post_id ) );

			return self::with_ask_sentence(
				sprintf(
					/* translators: %s: post title. */
					__( '“%s” is in a deleted workflow, so its status can’t be changed.', 'vip-workflows' ),
					$post_title
				),
				'remove',
				$roles
			);
		}

		if ( '' === $target_status ) {
			// The sentence names the direction of the refused change, and an
			// empty status names none; the generic sentence below is what's left.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] The publish-veto message for post %d was built without the target status, so it cannot name the direction of the refused change.', $post_id ) );
		}

		if ( 'publish' === $this->status_manager->status_to_region( $target_status ) ) {
			return self::with_ask_sentence(
				sprintf(
					/* translators: 1: post title, 2: workflow (sequence) name. */
					__( '“%1$s” is in the “%2$s” workflow, so it can’t be published directly. Move it through the workflow to a published stage.', 'vip-workflows' ),
					$post_title,
					$sequence->name
				),
				'publish',
				$roles
			);
		}

		return self::with_ask_sentence(
			sprintf(
				/* translators: 1: post title, 2: workflow (sequence) name. */
				__( '“%1$s” is in the “%2$s” workflow, so its status can’t be changed directly. Move it through the workflow instead.', 'vip-workflows' ),
				$post_title,
				$sequence->name
			),
			'change',
			$roles
		);
	}

	/**
	 * Append the sentence naming who to ask, when there is anyone to name.
	 *
	 * A separate sentence, not a clause of the first, so each translatable
	 * string is a whole sentence and the message stays readable when no role
	 * holds the override.
	 *
	 * @param  string   $message First sentence of the veto message.
	 * @param  string   $action  What to ask for: `publish`, `change` or `remove`.
	 * @param  string[] $roles   Override role display names.
	 * @return string
	 */
	private static function with_ask_sentence( string $message, string $action, array $roles ): string {
		if ( empty( $roles ) ) {
			return $message;
		}

		$list = implode( ', ', $roles );
		$one  = 1 === count( $roles );

		switch ( $action ) {
			case 'publish':
				$ask = $one
					/* translators: %s: role name, e.g. "Administrator". */
					? sprintf( __( 'Ask someone with the %s role to publish it.', 'vip-workflows' ), $list )
					/* translators: %s: comma-separated role names, e.g. "Editor, Administrator". */
					: sprintf( __( 'Ask someone with one of these roles to publish it: %s.', 'vip-workflows' ), $list );
				break;
			case 'remove':
				$ask = $one
					/* translators: %s: role name, e.g. "Administrator". */
					? sprintf( __( 'Ask someone with the %s role to remove it from the workflow.', 'vip-workflows' ), $list )
					/* translators: %s: comma-separated role names, e.g. "Editor, Administrator". */
					: sprintf( __( 'Ask someone with one of these roles to remove it from the workflow: %s.', 'vip-workflows' ), $list );
				break;
			default:
				$ask = $one
					/* translators: %s: role name, e.g. "Administrator". */
					? sprintf( __( 'Ask someone with the %s role to change it.', 'vip-workflows' ), $list )
					/* translators: %s: comma-separated role names, e.g. "Editor, Administrator". */
					: sprintf( __( 'Ask someone with one of these roles to change it: %s.', 'vip-workflows' ), $list );
				break;
		}

		return $message . ' ' . $ask;
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
