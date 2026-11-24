<?php
/**
 * Workflow Requirement Guard - the save-layer rule behind "require a workflow".
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Workflow;

use VIPWorkflows\Admin\Settings;

/**
 * Refuses publishing a post that has no workflow when the site requires one.
 *
 * With the enforcement mode set to "require", a non-override user can't move an
 * unassigned post of a covered post type into the publish region (`publish` or
 * `future`) on any save path. Drafts, pending and private stay allowed: the rule
 * is about publishing without a workflow, not about saving.
 *
 * The editor's workflow modal is unchanged; this is the server rule under it,
 * and it uses the same three hooks as PublishBoundaryGuard:
 *
 * - `wp_insert_post_data` is the universal backstop (classic editor, Quick Edit,
 *   Bulk Edit, XML-RPC, plugins calling wp_insert_post() or wp_update_post()).
 *   A refused write lands with the stored status, or as a draft for a new post,
 *   so the rest of the save (title, content, meta) is kept.
 * - `rest_pre_insert_{post_type}` returns a 409 for REST writes, so the block
 *   editor and REST clients get a message instead of a silent revert.
 * - `admin_notices` surfaces the message on the classic editor (post.php).
 *
 * The two guards apply to disjoint posts: PublishBoundaryGuard handles posts
 * that are in a workflow, and this one handles posts that aren't.
 *
 * Covered: every save that goes through wp_insert_post() (so also
 * wp_update_post(), the classic editor, Quick Edit, Bulk Edit, XML-RPC and
 * the REST posts endpoints, which the block editor uses). Not covered:
 * wp_publish_post(). It writes `publish` to the database directly, without
 * `wp_insert_post_data` or the REST hooks, so code that calls it on an
 * unpublished post (draft, pending or private) publishes that post without
 * this check. Core's only call is the scheduled-post job
 * (check_and_publish_future_post()), which publishes a `future` post that is
 * already in the publish region, so it skips nothing this rule enforces.
 * docs/SPEC.md lists the same gap.
 */
class WorkflowRequirementGuard {


	/**
	 * REST error code for a refused publish.
	 */
	public const ERROR_CODE = 'vip_workflows_workflow_required';

	/**
	 * Transient key prefix for a queued classic-path notice.
	 *
	 * Scoped by user and post: the notice belongs to the person whose save was
	 * refused, on the screen they land on afterwards.
	 */
	private const NOTICE_TRANSIENT_PREFIX = 'vip_workflows_workflow_required_';

	/**
	 * Lifetime (seconds) of a queued notice.
	 *
	 * Long enough to survive the redirect that follows a classic save, short
	 * enough that a stale message never resurfaces on a later visit.
	 */
	private const NOTICE_TTL = 60;

	/**
	 * GMT date core writes for a date-floating status (draft, pending, auto-draft).
	 */
	private const FLOATING_GMT_DATE = '0000-00-00 00:00:00';

	/**
	 * Status manager (the authority for status regions).
	 *
	 * @var StatusManager
	 */
	private StatusManager $status_manager;

	/**
	 * Post type manager (the authority for which sequences cover a post).
	 *
	 * @var PostTypeManager
	 */
	private PostTypeManager $post_type_manager;

	/**
	 * Constructor.
	 *
	 * @param StatusManager   $status_manager    Status manager.
	 * @param PostTypeManager $post_type_manager Post type manager.
	 */
	public function __construct( StatusManager $status_manager, PostTypeManager $post_type_manager ) {
		$this->status_manager    = $status_manager;
		$this->post_type_manager = $post_type_manager;
	}

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		add_filter( 'wp_insert_post_data', array( $this, 'filter_post_data' ), 10, 2 );

		// Registered on rest_api_init because post types are only all known once
		// every plugin and theme has registered them on `init`.
		add_action( 'rest_api_init', array( $this, 'register_rest_guards' ) );
		add_action( 'registered_post_type', array( $this, 'register_late_rest_guard' ), 10, 2 );

		add_action( 'admin_notices', array( $this, 'render_notice' ) );
	}

	/**
	 * Register the REST check on every post type exposed to the REST API.
	 *
	 * Not scoped to the post types an active sequence covers today: eligibility
	 * is decided per post (the `vip_workflows_sequences_for_post` filter can
	 * narrow or widen it), so the REST check has to see every write the
	 * backstop sees, or a refused REST write would revert silently.
	 */
	public function register_rest_guards(): void {
		foreach ( get_post_types( array( 'show_in_rest' => true ), 'names' ) as $post_type ) {
			add_filter( "rest_pre_insert_{$post_type}", array( $this, 'filter_rest_insert' ), 10, 2 );
		}
	}

	/**
	 * Register the REST check on a post type registered after `rest_api_init`.
	 *
	 * The enumeration above sees only the post types known when the REST server
	 * starts. A type registered later would otherwise get the backstop's silent
	 * draft instead of the 409.
	 *
	 * @param string        $post_type Post type name.
	 * @param \WP_Post_Type $post_type_object Post type object.
	 */
	public function register_late_rest_guard( string $post_type, $post_type_object ): void {
		if ( ! did_action( 'rest_api_init' ) || ! $post_type_object instanceof \WP_Post_Type || empty( $post_type_object->show_in_rest ) ) {
			return;
		}

		add_filter( "rest_pre_insert_{$post_type}", array( $this, 'filter_rest_insert' ), 10, 2 );
	}

	/**
	 * Universal backstop: keep a refused publish from being written.
	 *
	 * An existing post keeps its stored status, slug and dates. wp_insert_post()
	 * derives the slug and GMT date from the status before this filter runs, so
	 * putting only the status back would leave a draft carrying a public slug
	 * and, for a schedule, a future date that the next legitimate publish would
	 * silently coerce to `future`. A new post (or an auto-draft) is written the
	 * way core writes the same call as a draft. A post coming out of the Trash
	 * is restored as a draft rather than sent back to the Trash, because by now
	 * wp_untrash_post() has already removed its trash bookkeeping.
	 *
	 * @param  array $data    Sanitized post data about to be written.
	 * @param  array $postarr Raw post data as passed to wp_insert_post().
	 * @return array Post data, with the publish replaced when it is refused.
	 */
	public function filter_post_data( array $data, array $postarr ): array {
		$post_id = (int) ( $postarr['ID'] ?? 0 );
		// The filter receives slashed data; the eligibility filter should not.
		// Unslashed only when a write gets that far: this runs on every post
		// write on the site, and most are settled by the cheap tests first.
		$refusal = $this->resolve_refusal(
			$post_id,
			(string) ( $data['post_status'] ?? '' ),
			static fn (): \stdClass => (object) wp_unslash( $data )
		);

		if ( null === $refusal ) {
			return $data;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( sprintf( '[VIP Workflows] Refused publishing post %d by user %d: "%s" -> "%s"; the site requires a workflow and the post has none.', $post_id, get_current_user_id(), $refusal['current_status'], $refusal['target_status'] ) );

		$stored = $refusal['post'];

		if ( $stored && ! in_array( $stored->post_status, array( 'auto-draft', 'trash' ), true ) ) {
			$data['post_status']   = $stored->post_status;
			$data['post_name']     = $stored->post_name;
			$data['post_date']     = $stored->post_date;
			$data['post_date_gmt'] = $stored->post_date_gmt;
		} elseif ( $stored && 'trash' === $stored->post_status ) {
			// Core has already restored the desired slug into $data; a draft
			// may keep it. The dates stay as they were before the Trash.
			$data['post_status']   = 'draft';
			$data['post_date']     = $stored->post_date;
			$data['post_date_gmt'] = $stored->post_date_gmt;
		} else {
			$data = $this->as_new_draft( $data, $postarr );
		}

		if ( $post_id > 0 ) {
			$this->queue_notice( $post_id, $refusal['message'] );
		}

		return $data;
	}

	/**
	 * REST: refuse the write with a message the editor can display.
	 *
	 * Runs before wp_insert_post_data, so a refused REST write never reaches the
	 * backstop, and a refused create writes nothing.
	 *
	 * @param  \stdClass|\WP_Error $prepared_post Post object prepared for the database, or an earlier filter's error.
	 * @param  \WP_REST_Request    $request       The REST request.
	 * @return \stdClass|\WP_Error The prepared post, or WP_Error when publishing is refused.
	 */
	public function filter_rest_insert( $prepared_post, $request ) { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- required by rest_pre_insert_{post_type} filter
		// An earlier callback (PublishBoundaryGuard, a validator) already refused
		// the write; its error is the response.
		if ( is_wp_error( $prepared_post ) || ! $prepared_post instanceof \stdClass ) {
			return $prepared_post;
		}

		$post_id = (int) ( $prepared_post->ID ?? 0 );
		$refusal = $this->resolve_refusal( $post_id, (string) ( $prepared_post->post_status ?? '' ), $prepared_post );

		if ( null === $refusal ) {
			return $prepared_post;
		}

		// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
		error_log( sprintf( '[VIP Workflows] Refused publishing post %d by user %d via REST: "%s" -> "%s"; the site requires a workflow and the post has none.', $post_id, get_current_user_id(), $refusal['current_status'], $refusal['target_status'] ) );

		return new \WP_Error(
			self::ERROR_CODE,
			$refusal['message'],
			array(
				'status'  => 409,
				'post_id' => $post_id,
			)
		);
	}

	/**
	 * Render (once) a notice queued for the post currently being edited.
	 *
	 * Reaches post.php only. Quick Edit saves over AJAX and Bulk Edit redirects
	 * to edit.php, so on those screens a refused publish reads as a save with
	 * the status unchanged, the same as PublishBoundaryGuard's veto.
	 */
	public function render_notice(): void {
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
	 * Decide whether a write publishes a post that needs a workflow.
	 *
	 * Cheapest and most selective tests first, because this runs on every post
	 * write on the site: the enforcement mode, the target region, the post's
	 * own workflow, then the exemptions, and last the eligibility filter.
	 *
	 * @param  int                $post_id       Post ID (0 for a brand-new post).
	 * @param  string             $target_status Status the write would set.
	 * @param  \stdClass|callable $incoming      The post as the write would leave it, or a callable returning it (built only when needed).
	 * @return array{message: string, current_status: string, target_status: string, post: ?\WP_Post}|null Refusal details, or null when the write is allowed.
	 */
	private function resolve_refusal( int $post_id, string $target_status, $incoming ): ?array {
		if ( '' === $target_status || 'require' !== Settings::get_workflow_enforcement_mode() ) {
			return null;
		}

		if ( 'publish' !== $this->status_manager->status_to_region( $target_status ) ) {
			return null;
		}

		$stored = null;
		if ( $post_id > 0 ) {
			// The post's own workflow is PublishBoundaryGuard's to judge.
			if ( get_post_meta( $post_id, StatusManager::SEQUENCE_META_KEY, true ) ) {
				return null;
			}

			$stored = get_post( $post_id );
			if ( ! $stored instanceof \WP_Post ) {
				return null;
			}

			// Already live or scheduled: re-saving, rescheduling and going live
			// (`future` -> `publish`, which core rewrites before this filter) are
			// the outcome of an earlier publish, not a new one.
			if ( 'publish' === $this->status_manager->status_to_region( (string) $stored->post_status ) ) {
				return null;
			}
		}

		if ( is_callable( $incoming ) ) {
			$incoming = $incoming();
		}

		// A save can change the post type; eligibility follows the type the
		// post will have once this write lands.
		$target_type = (string) ( $incoming->post_type ?? '' );
		if ( '' === $target_type && $stored ) {
			$target_type = (string) $stored->post_type;
		}

		if ( ( $stored && 'revision' === $stored->post_type ) || $this->is_exempt( $post_id, $target_type ) ) {
			return null;
		}

		if ( $stored && $target_type !== $stored->post_type ) {
			$post            = clone $stored;
			$post->post_type = $target_type;
		} else {
			$post = $stored ?? $this->post_from_incoming( $incoming );
		}
		if ( ! $post || array() === $this->post_type_manager->get_sequences_for_post( $post ) ) {
			// No sequence will take this post, so requiring one would trap it.
			return null;
		}

		return array(
			'message'        => self::message( (string) $post->post_title ),
			'current_status' => $stored ? (string) $stored->post_status : 'new',
			'target_status'  => $target_status,
			'post'           => $stored,
		);
	}

	/**
	 * Whether this write is exempt from the rule.
	 *
	 * WP-CLI is exempt outright, with or without `--user`: imports and
	 * maintenance scripts run there. The constant is read directly and can't be
	 * filtered. Cron, a write to an autosave or a revision, a workflow commit
	 * in progress and writes with no logged-in user are system contexts, as for
	 * PublishBoundaryGuard; wp_doing_cron() can be filtered, so DOING_CRON is
	 * checked too. Override roles may publish without a workflow.
	 *
	 * The autosave exemption follows the row that is written, not the request:
	 * an autosave request that writes to the post itself is checked like any
	 * other save. One that only saves content sets no publish-side status, so
	 * it passes.
	 *
	 * @param  int    $post_id   Post ID (0 for a new post).
	 * @param  string $post_type Post type of the write.
	 * @return bool
	 */
	private function is_exempt( int $post_id, string $post_type ): bool {
		if ( defined( 'WP_CLI' ) && WP_CLI ) {
			return true;
		}

		if ( wp_doing_cron() || ( defined( 'DOING_CRON' ) && DOING_CRON ) ) {
			return true;
		}

		if ( 'revision' === $post_type ) {
			return true;
		}

		if ( $post_id > 0 && ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) || StatusManager::is_transition_in_progress( $post_id ) ) ) {
			return true;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return true;
		}

		return Settings::can_user_bypass_workflow( $user_id );
	}

	/**
	 * Build a post object for a write that has no stored post yet.
	 *
	 * The eligibility filter takes a WP_Post. A new post has no ID, so a filter
	 * that reads terms or meta sees none; it sees the post type, title and
	 * every other field the write carries.
	 *
	 * @param  \stdClass $incoming The post as the write would leave it.
	 * @return \WP_Post|null
	 */
	private function post_from_incoming( \stdClass $incoming ): ?\WP_Post {
		if ( empty( $incoming->post_type ) ) {
			return null;
		}

		$fields         = clone $incoming;
		$fields->ID     = 0;
		$fields->filter = 'raw';

		return new \WP_Post( $fields );
	}

	/**
	 * Shape a refused new post the way core writes the same call as a draft.
	 *
	 * Core gives a draft a slug only when the caller named one, and a floating
	 * GMT date unless the caller supplied one.
	 *
	 * @param  array $data    Sanitized post data about to be written.
	 * @param  array $postarr Raw post data as passed to wp_insert_post().
	 * @return array
	 */
	private function as_new_draft( array $data, array $postarr ): array {
		$data['post_status'] = 'draft';

		$requested_slug = (string) ( $postarr['post_name'] ?? '' );
		// The `save` context, as wp_insert_post() applies to a new post's slug.
		$data['post_name'] = '' === $requested_slug ? '' : sanitize_title( $requested_slug );

		$requested_gmt = (string) ( $postarr['post_date_gmt'] ?? '' );
		if ( '' === $requested_gmt || self::FLOATING_GMT_DATE === $requested_gmt ) {
			$data['post_date_gmt'] = self::FLOATING_GMT_DATE;
		}

		return $data;
	}

	/**
	 * The refusal message: what's missing, and the way through.
	 *
	 * @param  string $post_title Post title (may be empty).
	 * @return string
	 */
	public static function message( string $post_title ): string {
		if ( '' === trim( $post_title ) ) {
			return __( 'This post can’t be published without a workflow. Choose one, then move the post through it to a published stage.', 'vip-workflows' );
		}

		return sprintf(
			/* translators: %s: post title. */
			__( '“%s” can’t be published without a workflow. Choose one, then move the post through it to a published stage.', 'vip-workflows' ),
			$post_title
		);
	}

	/**
	 * Queue a message for the classic-path admin notice.
	 *
	 * @param int    $post_id Post ID.
	 * @param string $message Message to show.
	 */
	private function queue_notice( int $post_id, string $message ): void {
		set_transient( $this->notice_key( get_current_user_id(), $post_id ), $message, self::NOTICE_TTL );
	}

	/**
	 * Transient key for a queued notice.
	 *
	 * @param  int $user_id User the notice belongs to.
	 * @param  int $post_id Post the refusal was raised on.
	 * @return string
	 */
	private function notice_key( int $user_id, int $post_id ): string {
		return self::NOTICE_TRANSIENT_PREFIX . $user_id . '_' . $post_id;
	}
}
