<?php
/**
 * Posts list columns integration.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Admin;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Plugin;
use VIPWorkflows\Workflow\StagePalette;
use VIPWorkflows\Workflow\StatusManager;

/**
 * Adds workflow status column to posts list.
 */
class PostsColumns {


	/**
	 * Swatch shown for a stage whose sequence config sets no color.
	 *
	 * The shared palette's default slot, so the rendered column dot, the hidden
	 * row data, the Quick Edit box and every REST surface land on one color.
	 */
	private const DEFAULT_STAGE_COLOR = StagePalette::DEFAULT_COLOR;

	/**
	 * Initialize hooks.
	 */
	public function init(): void {
		add_action( 'admin_init', array( $this, 'register_columns' ) );
		add_action( 'quick_edit_custom_box', array( $this, 'add_quick_edit_workflow' ), 10, 2 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_quick_edit_assets' ) );
		add_filter( 'post_row_actions', array( $this, 'filter_row_actions' ), 10, 2 );
		add_filter( 'page_row_actions', array( $this, 'filter_row_actions' ), 10, 2 );
	}

	/**
	 * Remove the View link for workflow posts the user cannot act on.
	 *
	 * @param  array    $actions Row actions.
	 * @param  \WP_Post $post    Post object.
	 * @return array
	 */
	public function filter_row_actions( array $actions, \WP_Post $post ): array {
		$sequence_id = get_post_meta( $post->ID, '_vip_workflows_sequence_id', true );
		if ( ! $sequence_id ) {
			return $actions;
		}

		if ( ! current_user_can( 'edit_post', $post->ID ) ) {
			unset( $actions['view'] );
			unset( $actions['inline hide-if-no-js'] );
		}

		return $actions;
	}

	/**
	 * Register columns for post types.
	 */
	public function register_columns(): void {
		$registered = array();

		// Add to public post types.
		$post_types = get_post_types( array( 'public' => true ), 'names' );
		foreach ( $post_types as $post_type ) {
			$registered[ $post_type ] = true;
		}

		// Add to any post type a sequence drives.
		// Workflow sequences only: a phase sequence carries no `post_types`,
		// so get_post_types() falls back to `post` and would register the
		// workflow column and Quick Edit picker on every post screen.
		$repository = new \VIPWorkflows\Sequences\SequenceRepository();
		$sequences = $repository->get_workflow_sequences( array( 'status' => 'active' ) );
		foreach ( $sequences as $sequence ) {
			foreach ( $sequence->get_post_types() as $pt ) {
				if ( post_type_exists( $pt ) ) {
					$registered[ $pt ] = true;
				}
			}
		}

		// Register columns for all collected post types.
		foreach ( array_keys( $registered ) as $post_type ) {
			add_filter( "manage_{$post_type}_posts_columns", array( $this, 'add_column' ) );
			add_action( "manage_{$post_type}_posts_custom_column", array( $this, 'render_column' ), 10, 2 );
		}
	}

	/**
	 * Add workflow column.
	 *
	 * @param  array $columns Existing columns.
	 * @return array Modified columns.
	 */
	public function add_column( array $columns ): array {
		// Insert before date column.
		$new_columns = array();
		foreach ( $columns as $key => $label ) {
			if ( 'date' === $key ) {
				$new_columns['workflow_status'] = __( 'Workflow', 'vip-workflows' );
			}
			$new_columns[ $key ] = $label;
		}

		// If date wasn't found, append at end.
		if ( ! isset( $new_columns['workflow_status'] ) ) {
			$new_columns['workflow_status'] = __( 'Workflow', 'vip-workflows' );
		}

		return $new_columns;
	}

	/**
	 * Render workflow column.
	 *
	 * @param string $column  Column name.
	 * @param int    $post_id Post ID.
	 */
	public function render_column( string $column, int $post_id ): void {
		if ( 'workflow_status' !== $column ) {
			return;
		}

		$status_manager = Plugin::get_instance()->get_status_manager();
		if ( ! $status_manager ) {
			echo '<span class="vip-workflows-column vip-workflows-column--none">—</span>';
			return;
		}

		$sequence = $status_manager->get_sequence_for_post( $post_id );
		if ( ! $sequence ) {
			echo '<span class="vip-workflows-column vip-workflows-column--none">—</span>';

			// A post whose sequence row was deleted still carries the meta the
			// save-layer predicate reads, so it is still refused every status
			// change — it just has no workflow left to name. Emitting no row data
			// for it told both list-table preflights "not a workflow row", and the
			// user walked into that refusal with nothing to explain it. Marked
			// orphaned so the copy can say what is actually wrong.
			if ( $status_manager->has_dangling_sequence( $post_id ) ) {
				$this->render_row_data(
					(int) get_post_meta( $post_id, StatusManager::SEQUENCE_META_KEY, true ),
					'',
					(string) get_post_status( $post_id ),
					'',
					'',
					array(),
					null,
					self::DEFAULT_STAGE_COLOR,
					true
				);
			}

			return;
		}

		// The post's COMMITTED core status. Both list-table preflights need it:
		// only a genuine status CHANGE can cross a region boundary, and the
		// stage's region and the committed status legitimately differ (scheduling
		// reseats nothing, so `future` sits over a draft-region stage).
		$post_status = get_post_status( $post_id );
		if ( ! $post_status ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Post %d has no core status; cannot render its workflow column.', $post_id ) );
			echo '<span class="vip-workflows-column vip-workflows-column--none">—</span>';
			return;
		}

		$current_status = $status_manager->get_current_status( $post_id );
		if ( ! $current_status ) {
			// A post carrying a sequence but no resolvable stage (missing stage
			// meta, or a stage key the sequence no longer defines) is a
			// data-integrity condition — log it, don't just render the em dash.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( 'VIP Workflows: post %d is assigned sequence "%s" but its workflow stage does not resolve.', $post_id, $sequence->slug ) );
			echo '<span class="vip-workflows-column vip-workflows-column--none">—</span>';

			// The row is still workflow-managed, so it must still say so. The
			// server predicate reads the sequence meta, not the stage
			// (StatusManager::crosses_publish_boundary()), and would refuse a
			// crossing here; a row the client did not recognise as a workflow row
			// would sail past the preflight and hit that refusal with nothing to
			// explain it. The empty region is what makes the client refuse too.
			//
			// No entry-stage map either, even though the sequence has one: a post
			// whose stage does not resolve is dropped by
			// StatusManager::resolve_managed_stage() before any reseat is
			// considered, so nothing moves here whatever the sequence models.
			// Naming a destination would describe a move that cannot happen.
			$this->render_row_data( $sequence->id, $sequence->name, $post_status, '', '', array(), null, self::DEFAULT_STAGE_COLOR );
			return;
		}

		$color = $current_status['color'] ?? self::DEFAULT_STAGE_COLOR;

		// Visibility indicator: "Live" reflects the post's COMMITTED core status
		// only — never the stage's region. Several stages can share the publish
		// region, and a publish-region stage core holds as `future` (scheduled)
		// is not live yet.
		$live_pill = 'publish' === $post_status
			? ' <span class="vip-workflows-column__live">' . esc_html__( 'Live', 'vip-workflows' ) . '</span>'
			: '';

		// The swatch is the one part of this the stylesheet cannot own: its color
		// comes from the sequence's config, per stage. It arrives as a custom
		// property; every static rule lives in src/entries/classic-admin.css.
		//
		// The dot and the label carry their own classes because the Quick Edit
		// script updates them after a transition. Positional selectors could not:
		// a live post ends the row with the "Live" pill, so `span:last-child`
		// found that instead of the label.
		printf(
			'<span class="vip-workflows-column">
				<span class="vip-workflows-column__dot" style="--vip-workflows-stage-color: %s"></span>
				<span class="vip-workflows-column__label">%s [%s]</span>%s
			</span>',
			esc_attr( $color ),
			esc_html( $sequence->name ),
			esc_html( $current_status['label'] ?? $current_status['key'] ),
			$live_pill // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- pre-escaped above.
		);

		// Two regions ride on the row, and they are not the same question.
		//
		// $seated_region is the region the STAGE declares. It is what decides
		// whether a status change re-seats the post at all
		// (StatusManager::resolve_reseat_stage() compares the stage's region), so
		// it is what lets the Quick Edit copy say "already a Draft stage" instead
		// of promising a move that never happens.
		//
		// $stage_region is the side of the publish BOUNDARY the post is on,
		// resolved through the same authority the server predicate uses
		// (StatusManager::boundary_region(), which crosses_publish_boundary() also
		// calls) — never recomputed here. The two differ by design: boundary_region()
		// reports `publish` for any live post whatever its stage says.
		$entry_stages = array();

		try {
			$seated_region = $sequence->get_stage_status( (string) $current_status['key'] );
			$stage_region  = $status_manager->boundary_region( $post_id, $seated_region );
			$entry_stages  = $this->region_entry_labels( $sequence );
		} catch ( \InvalidArgumentException $e ) {
			// A stage with no region is a data-integrity condition. Log it and
			// emit an empty region: the client fails CLOSED on one (it refuses
			// the change) for the same reason crosses_publish_boundary() does.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot resolve the region of post %d\'s workflow stage: %s', $post_id, $e->getMessage() ) );
			$seated_region = '';
			$stage_region  = '';
		}

		$this->render_row_data( $sequence->id, $sequence->name, $post_status, $stage_region, $seated_region, $entry_stages, $current_status, $color );
	}

	/**
	 * Entry-stage labels for every region a sequence models, keyed by region.
	 *
	 * What the Quick Edit confirm needs in order to NAME the stage a status
	 * change would re-seat the post at, rather than describing its region. The
	 * preflight is contractually request-free — it runs over every selected row
	 * in Bulk Edit — so the map is rendered into the row data rather than
	 * fetched. Its React twin is `getEntryStageLabels()` in
	 * src/entries/confirm-workflow-side-effect.js, which builds the same shape
	 * from the status endpoint's `all_statuses`.
	 *
	 * A region is absent when Sequence::get_region_entry_stage() gives no
	 * checkpoint for it — the sequence models no stage there, or it models
	 * stages but marks none. Both are cases where
	 * StatusManager::resolve_reseat_stage() leaves the stage in place (the second
	 * by catching the same exception caught here), so an absent region and "this
	 * change moves nothing" are one fact.
	 *
	 * @param  Sequence $sequence Sequence managing the post.
	 * @return array<string, string> Region slug => entry stage label.
	 */
	private function region_entry_labels( Sequence $sequence ): array {
		$labels = array();

		foreach ( Sequence::EDITORIAL_STATUSES as $region ) {
			try {
				$entry_key = $sequence->get_region_entry_stage( $region );
			} catch ( \InvalidArgumentException $e ) {
				// A used region with no checkpoint is a broken sequence. The
				// reseat path logs and leaves the stage alone; so does this, by
				// leaving the region out of the map.
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot name the entry stage of region "%s" in sequence "%s": %s', $region, $sequence->slug, $e->getMessage() ) );
				continue;
			}

			if ( null === $entry_key ) {
				continue;
			}

			// A stage with no label is named by its key, exactly as the rendered
			// column above names it. Dropping it instead would claim the region
			// has no checkpoint — a statement about the workflow — when the only
			// thing missing is a display string.
			$stage             = $sequence->get_status( $entry_key );
			$labels[ $region ] = (string) ( $stage['label'] ?? $entry_key );
		}

		return $labels;
	}

	/**
	 * Emit the hidden row data both list-table preflights read.
	 *
	 * Present on every workflow-managed row, including one whose stage does not
	 * resolve — the client has to know the row is in a workflow before it can
	 * decide anything about it.
	 *
	 * Takes the sequence's id and name as scalars rather than the object: an
	 * orphaned row has an id and nothing else, because the row it names is gone.
	 *
	 * @param int                   $sequence_id   Sequence the post is assigned to.
	 * @param string                $sequence_name Sequence name, or '' when the sequence no longer exists.
	 * @param string                $post_status    The post's committed core status.
	 * @param string                $stage_region   Side of the publish boundary the post is on (StatusManager::boundary_region()), or '' when it cannot be resolved.
	 * @param string                $seated_region  Editorial region the current stage itself declares, or '' when it cannot be resolved. Decides whether a change re-seats at all.
	 * @param array<string, string> $entry_stages   Region => entry stage label, for the regions the sequence models. Empty when no reseat can happen whatever the target.
	 * @param array|null            $current_status The post's current stage, or null when it does not resolve.
	 * @param string                $color          Stage color already resolved by the caller, so the rendered dot and the Quick Edit dot cannot disagree.
	 * @param bool                  $orphaned       Whether the named sequence no longer exists.
	 */
	private function render_row_data( int $sequence_id, string $sequence_name, string $post_status, string $stage_region, string $seated_region, array $entry_stages, ?array $current_status, string $color, bool $orphaned = false ): void {
		printf(
			'<input type="hidden" class="vip-workflows-data" data-workflow="1" data-orphaned="%s" data-sequence-id="%d" data-sequence-name="%s" data-status-key="%s" data-status-label="%s" data-status-color="%s" data-stage-region="%s" data-seated-region="%s" data-entry-stages="%s" data-post-status="%s" />',
			esc_attr( $orphaned ? '1' : '' ),
			esc_attr( (string) $sequence_id ),
			esc_attr( $sequence_name ),
			esc_attr( $current_status['key'] ?? '' ),
			esc_attr( $current_status['label'] ?? $current_status['key'] ?? '' ),
			esc_attr( $color ),
			esc_attr( $stage_region ),
			esc_attr( $seated_region ),
			// Cast so an empty map renders as an object rather than PHP's `[]`:
			// the client indexes it by region.
			esc_attr( (string) wp_json_encode( (object) $entry_stages ) ),
			esc_attr( $post_status )
		);
	}

	/**
	 * Add workflow section to Quick Edit.
	 *
	 * @param string $column_name Column name.
	 * @param string $post_type   Post type.
	 */
	public function add_quick_edit_workflow( string $column_name, string $post_type ): void {
		if ( 'workflow_status' !== $column_name ) {
			return;
		}
		// `display` stays inline here, and belongs nowhere else: it is the box's
		// initial state, not its styling. The script shows the box by clearing
		// the inline value (`style.display = ''`), which a stylesheet rule would
		// survive — the box would never appear.
		?>
		<fieldset class="inline-edit-col-right vip-workflows-quick-edit" style="display:none;">
			<div class="inline-edit-col">
				<label class="inline-edit-group">
					<span class="title"><?php esc_html_e( 'Workflow', 'vip-workflows' ); ?></span>
					<span class="vip-workflows-quick-edit__content">
						<span class="vip-workflows-quick-edit__current"></span>
						<span class="vip-workflows-quick-edit__transitions"></span>
					</span>
				</label>
			</div>
		</fieldset>
		<?php
	}

	/**
	 * Enqueue Quick Edit assets.
	 *
	 * @param string $hook_suffix Current page hook.
	 */
	public function enqueue_quick_edit_assets( string $hook_suffix ): void {
		if ( 'edit.php' !== $hook_suffix ) {
			return;
		}

		// The column and Quick Edit styles, from src/entries/classic-admin.css.
		AdminStyles::enqueue_classic();

		// The shared warn/veto decision table and its copy
		// (src/entries/confirm-workflow-side-effect.js), built as its own
		// webpack entry. It is framework-free precisely so that this classic
		// inline script can consume it — through the `vipWorkflowsSideEffect`
		// global — exactly as the React surfaces import it. Quick Edit, Bulk Edit
		// and the block editor must never reach different answers, or use
		// different words, about the same change.
		//
		// Dependencies and version come from the generated manifest, never a
		// hardcoded list: a dependency added to the module later must not
		// silently fail to load.
		$asset_file = VIP_WORKFLOWS_PLUGIN_DIR . 'build/side-effect.asset.php';
		if ( file_exists( $asset_file ) ) {
			$asset = include $asset_file;

			wp_enqueue_script(
				'vip-workflows-side-effect',
				VIP_WORKFLOWS_PLUGIN_URL . 'build/side-effect.js',
				$asset['dependencies'],
				$asset['version'],
				true
			);

			// The module owns the single-post confirm and veto copy; the
			// aggregate Bulk Edit copy below is translated PHP-side. One dialog
			// flow must not speak two languages.
			wp_set_script_translations( 'vip-workflows-side-effect', 'vip-workflows' );
		} else {
			// A missing bundle is a build error, not a runtime condition. Say so
			// once, loudly. The inline script below then refuses the status
			// changes it cannot evaluate rather than guessing at them — every
			// other Quick Edit still works.
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( '[VIP Workflows] build/side-effect.asset.php is missing — run `npm run build`. Quick Edit and Bulk Edit cannot evaluate workflow status changes without it.' );
		}

		// Inline script.
		$nonce = wp_create_nonce( 'wp_rest' );
		$api_url = rest_url( 'vip-workflows/v1' );

		// The same default swatch the server renders with, handed to the script
		// rather than repeated in it: a stage color the REST response omits must
		// not redraw the row in a color no server-rendered row would ever use.
		$default_color = self::DEFAULT_STAGE_COLOR;

		// Only the copy the shared module does not own lives here: the two
		// aggregate Bulk Edit messages (it speaks about one post at a time) and
		// the fail-closed message shown when the guard itself cannot answer.
		$guard = wp_json_encode(
			array(
				'canBypass' => Settings::can_user_bypass_workflow(),
				'strings'   => array(
					// The publish boundary is symmetric, so the veto copy is
					// direction-aware: a user un-publishing was never trying to
					// publish, and telling them they can't would be a non-sequitur.
					/* translators: %1$s: number of affected posts, %2$s: number of selected posts, %3$s: comma-separated post titles. */
					'bulkVetoPublish'    => __( '%1$s of the %2$s selected posts are in workflows and can\'t be published directly: %3$s. Deselect them, or remove them from their workflows first.', 'vip-workflows' ),
					/* translators: %1$s: number of affected posts, %2$s: number of selected posts, %3$s: comma-separated post titles. */
					'bulkVetoUnpublish'  => __( '%1$s of the %2$s selected posts are published and in workflows, so their published status can\'t be changed directly: %3$s. Deselect them, or remove them from their workflows first.', 'vip-workflows' ),
					// DECISION: Bulk Edit stays region-level and names no stage,
					// unlike the single-post surfaces. One apply spans N posts
					// across up to N sequences, each with its own stage names
					// and its own answer to "does this even re-seat?" — a native
					// window.confirm listing them would be a wall of names for
					// workflows the user is not looking at, and cannot act on
					// individually anyway (the apply is all-or-nothing). So the
					// sentence describes the RANGE of outcomes rather than
					// asserting one: the old copy promised every selected post a
					// new stage, which is false for any post already seated in
					// the target region or whose workflow models no stage there.
					/* translators: %1$s: number of affected posts, %2$s: number of selected posts, %3$s: comma-separated post titles. */
					'bulkWarn'           => __( '%1$s of the %2$s selected posts are in workflows: %3$s. Changing their status moves each one to its workflow\'s entry stage for the new status, or leaves it where it is if its workflow has no stage there, and stops any AI agent working on them. Continue?', 'vip-workflows' ),
					'guardUnavailable'   => __( 'VIP Workflows could not check what this status change would do to the workflow, so the change was not applied. Reload the page and try again.', 'vip-workflows' ),
					// A stage with no region is a broken sequence, not a
					// transient failure — reloading re-renders the same broken
					// config, so the copy names the real cause instead.
					'stageMisconfigured' => __( 'This post\'s workflow stage is misconfigured, so VIP Workflows cannot tell what a status change would do to it. The change was not applied — ask an administrator to fix the workflow\'s configuration.', 'vip-workflows' ),
				),
			)
		);

		$script = <<<JS
(function($) {
	var apiUrl = '{$api_url}';
	var nonce = '{$nonce}';
	var guard = {$guard};

	// The shared decision table and copy
	// (src/entries/confirm-workflow-side-effect.js), published as a global for
	// the classic list-table surfaces. Never reimplemented here — a second copy
	// of the region math, or of the words, is exactly how the surfaces drift.
	function guardApi() {
		var api = window.vipWorkflowsSideEffect;
		if (
			!api ||
			typeof api.evaluateStatusChange !== 'function' ||
			typeof api.statusToRegion !== 'function' ||
			typeof api.getPublishVetoMessage !== 'function' ||
			typeof api.getOrphanedWorkflowMessage !== 'function' ||
			typeof api.getTransitionWarningsMessage !== 'function' ||
			typeof api.getStatusChangeWarning !== 'function'
		) {
			console.error('[VIP Workflows] The shared workflow side-effect module did not load; refusing to evaluate a status change.');
			return null;
		}
		return api;
	}

	function format(template, values) {
		var out = template;
		for (var i = 0; i < values.length; i++) {
			out = out.split('%' + (i + 1) + '\$s').join(String(values[i]));
		}
		return out;
	}

	function workflowDataFor(row) {
		return row ? row.querySelector('.vip-workflows-data') : null;
	}

	function isWorkflowRow(data) {
		return !!(data && data.dataset.workflow);
	}

	// The row's entry-stage map — which stage each region's checkpoint names — so
	// the confirm can say WHERE the post would land instead of naming its region.
	// Rendered by PHP because this preflight is request-free by contract.
	//
	// Null, and only null, means the map could not be read: a guard that cannot
	// answer, not a workflow that would move nothing. An empty map is a real
	// answer (nothing re-seats) and comes back as {}.
	function entryStagesFor(data) {
		var raw = data.dataset.entryStages;
		if (!raw) {
			console.error('[VIP Workflows] A workflow row carries no entry-stage map.');
			return null;
		}

		try {
			return JSON.parse(raw);
		} catch (e) {
			console.error('[VIP Workflows] A workflow row carries an unreadable entry-stage map: ' + e.message);
			return null;
		}
	}

	function titleFor(row, postId) {
		var titleEl = row.querySelector('.row-title');
		if (!titleEl) {
			console.error('[VIP Workflows] Row for post ' + postId + ' has no .row-title to name it with.');
			return '#' + postId;
		}
		return titleEl.textContent.trim();
	}

	// 'silent' | 'warn' | 'veto', or null when the guard cannot answer — a
	// workflow row with no stage region is a data-integrity condition and fails
	// CLOSED, the same way the server predicate does.
	function evaluateRow(api, data, targetStatus) {
		var region = data.dataset.stageRegion;
		// A bypass user is never vetoed server-side — PublishBoundaryGuard returns
		// before it ever consults the boundary predicate — so refusing them here
		// would block the one person able to fix the sequence, and in Bulk Edit
		// one broken row would cancel the apply for every healthy one. They fall
		// through to the shared table, which warns on an unresolved region.
		if (!region && !guard.canBypass) {
			console.error('[VIP Workflows] A workflow row carries no stage region; refusing the status change.');
			return null;
		}
		return api.evaluateStatusChange({
			currentRegion: region,
			targetStatus: targetStatus,
			canBypass: guard.canBypass
		});
	}

	// Only a genuine status CHANGE can cross a region boundary. This mirrors the
	// early returns in PublishBoundaryGuard::resolve_veto() — a write that names
	// no status, or names the one the post already has, changes nothing.
	//
	// Without it, the region the row carries would be compared against a status
	// the save is not actually altering, and a post whose stage and committed
	// status have legitimately drifted apart would be judged as crossing on every
	// save. They drift by design: `future` is an overlay for the reseat (a
	// scheduled post keeps its draft-region stage) but publish-side for the
	// boundary, so `data-stage-region="draft"` over `post_status=future` is a
	// normal, healthy row. Refusing a headline fix on it is not.
	function isStatusChange(data, targetStatus) {
		var committed = data.dataset.postStatus;
		if (!committed) {
			// The server always renders this. Its absence is a data-integrity
			// condition, so err towards evaluating the change rather than waving
			// it through unexamined.
			console.error('[VIP Workflows] A workflow row carries no committed post status.');
			return true;
		}

		// '' is not a status: it means the save writes none. Core leaves the
		// `_status` select with nothing selected whenever it removed the option
		// matching the post's status — single-row Quick Edit offers no `private`
		// option, and inline-edit-post.js removes `publish` for a future-dated
		// post — and an unselected select submits nothing. What core then does
		// with a statusless save is core's business; there is no user-chosen
		// target here for the workflow to guard, and the server veto is the
		// backstop either way.
		return targetStatus !== '' && targetStatus !== committed;
	}

	function block(message) {
		window.alert(message);
		return false;
	}

	// The guard itself could not load. Transient — reloading may well fix it.
	function blockUnavailable() {
		return block(guard.strings.guardUnavailable);
	}

	// The sequence is misconfigured. Not transient: reloading re-renders the
	// same broken config, so the copy has to name the real cause.
	function blockMisconfigured() {
		return block(guard.strings.stageMisconfigured);
	}

	// The status Quick Edit would save: `private` when the Private checkbox is
	// ticked (core resolves it that way ahead of the select, in
	// wp_ajax_inline_save), otherwise the native Status control's value.
	//
	// Returns null — and only null — when the row has no status control at all,
	// which is the one genuine failure. '' is core's own "this save names no
	// status" case, handled in isStatusChange().
	function quickEditTargetStatus(editRow) {
		var select = editRow.querySelector('select[name="_status"]');
		if (!select) return null;

		var keepPrivate = editRow.querySelector('input[name="keep_private"]');
		if (keepPrivate && keepPrivate.checked) return 'private';

		return select.value;
	}

	function quickEditAllowed(postId) {
		var row = document.getElementById('post-' + postId);
		var data = workflowDataFor(row);
		if (!isWorkflowRow(data)) return true;

		var editRow = document.getElementById('edit-' + postId);
		if (!editRow) {
			console.error('[VIP Workflows] No Quick Edit row for post ' + postId + '; cannot read the status being saved.');
			return blockUnavailable();
		}

		var targetStatus = quickEditTargetStatus(editRow);
		if (targetStatus === null) {
			console.error('[VIP Workflows] Quick Edit row for post ' + postId + ' has no status control.');
			return blockUnavailable();
		}

		// Evaluate nothing — and so refuse nothing — for a save that changes no
		// status. Every ordinary Quick Edit lands here.
		if (!isStatusChange(data, targetStatus)) return true;

		var api = guardApi();
		if (!api) return blockUnavailable();

		var decision = evaluateRow(api, data, targetStatus);
		if (decision === null) return blockMisconfigured();

		if (decision === 'veto') {
			// An orphaned row is refused for a different reason — its sequence
			// was deleted, so there is no workflow left to move the post through
			// and no name to call it by. Same guard, different sentence.
			window.alert(data.dataset.orphaned
				? api.getOrphanedWorkflowMessage({ title: titleFor(row, postId) })
				: api.getPublishVetoMessage({
					title: titleFor(row, postId),
					workflowName: data.dataset.sequenceName
				}));
			return false;
		}

		if (decision === 'warn') {
			var entryStages = entryStagesFor(data);
			if (entryStages === null) return blockUnavailable();

			// Two regions, two jobs: stageRegion is the region the STAGE
			// declares and decides whether anything re-seats at all, while
			// currentRegion is the boundary side (publish for any live post,
			// whatever its stage says) and only names the "from" half of the
			// sentence.
			//
			// agentPending is false here rather than unknown: the list table
			// cannot answer it without a per-row job-meta read (which also
			// writes, on a stale job) or a request per row, and the guard must
			// stay request-free. The block editor, which knows, says it there.
			return window.confirm(api.getStatusChangeWarning({
				currentRegion: data.dataset.stageRegion,
				stageRegion: data.dataset.seatedRegion,
				targetStatus: targetStatus,
				entryStageLabels: entryStages,
				agentPending: false
			}));
		}

		return true;
	}

	// Bulk Edit is all-or-nothing: one vetoed post in the selection fails the
	// whole apply, before any request goes out. Bulk Edit has no per-post error
	// channel, so a partial apply would report nothing and leave the user
	// believing every selected post moved.
	function bulkEditAllowed() {
		var bulkRow = document.getElementById('bulk-edit');
		if (!bulkRow) return true;

		var select = bulkRow.querySelector('select[name="_status"]');
		if (!select) {
			console.error('[VIP Workflows] The Bulk Edit row has no status control.');
			return blockUnavailable();
		}

		// '-1' is core's "— No Change —": nothing crosses a region.
		var targetStatus = select.value;
		if (targetStatus === '-1') return true;

		var checked = document.querySelectorAll('#the-list input[name="post[]"]:checked');
		var vetoed = [];
		var warned = [];
		var api = null;

		for (var i = 0; i < checked.length; i++) {
			var row = checked[i].closest('tr');
			var data = workflowDataFor(row);
			if (!isWorkflowRow(data)) continue;

			// A selected post that already holds the target status is not
			// changing, so it cannot cross anything — the same early return the
			// single-row preflight and the server veto make.
			if (!isStatusChange(data, targetStatus)) continue;

			if (!api) {
				api = guardApi();
				if (!api) return blockUnavailable();
			}

			var postId = parseInt(checked[i].value, 10);
			var decision = evaluateRow(api, data, targetStatus);
			if (decision === null) return blockMisconfigured();

			if (decision === 'veto') {
				vetoed.push(titleFor(row, postId));
			} else if (decision === 'warn') {
				warned.push(titleFor(row, postId));
			}
		}

		// Both messages name only the affected subset, never the whole selection.
		if (vetoed.length) {
			// The veto is symmetric, so the copy is too: one bulk apply has one
			// target status, so every vetoed post crosses the boundary in the
			// same direction. Direction comes from the shared region map, not a
			// second copy of it.
			var vetoMessage = api.statusToRegion(targetStatus) === 'publish'
				? guard.strings.bulkVetoPublish
				: guard.strings.bulkVetoUnpublish;
			window.alert(format(vetoMessage, [vetoed.length, checked.length, vetoed.join(', ')]));
			return false;
		}

		if (warned.length) {
			return window.confirm(format(guard.strings.bulkWarn, [warned.length, checked.length, warned.join(', ')]));
		}

		return true;
	}

	// Hook into Quick Edit.
	var origEdit = inlineEditPost.edit;
	inlineEditPost.edit = function(id) {
		origEdit.apply(this, arguments);

		var postId = 0;
		if (typeof id === 'object') {
			postId = parseInt(this.getId(id), 10);
		} else {
			postId = parseInt(id, 10);
		}
		if (!postId) return;

		var row = document.getElementById('post-' + postId);
		var editRow = document.getElementById('edit-' + postId);
		if (!row || !editRow) return;

		var workflowData = row.querySelector('.vip-workflows-data');
		var workflowSection = editRow.querySelector('.vip-workflows-quick-edit');

		// The native Status control stays visible for workflow posts: the
		// workflow warns about a status change, it does not take the control
		// away. The workflow box sits beside it.
		if (isWorkflowRow(workflowData)) {
			if (workflowSection) {
				workflowSection.style.display = '';
				loadWorkflowTransitions(postId, workflowSection, workflowData);
			}
		} else if (workflowSection) {
			workflowSection.style.display = 'none';
		}
	};

	// Quick Edit's Update button (and Enter) both land in save().
	var origSave = inlineEditPost.save;
	inlineEditPost.save = function(id) {
		var postId = (typeof id === 'object') ? parseInt(this.getId(id), 10) : parseInt(id, 10);
		if (postId && !quickEditAllowed(postId)) {
			return false;
		}
		return origSave.apply(this, arguments);
	};

	// Bulk Edit applies from core's own click handler on #bulk_edit. Listen in
	// the capture phase so the preflight runs BEFORE that handler and can reject
	// the whole apply outright.
	document.addEventListener('click', function(e) {
		var target = e.target;
		if (!target || !target.closest || !target.closest('#bulk_edit')) return;
		if (bulkEditAllowed()) return;

		e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
	}, true);

	// Build the current-status display via DOM APIs (never innerHTML) so a
	// crafted status label/color can't inject markup when read back from the
	// data attribute or the REST response.
	function renderCurrentStatus(el, color, label) {
		el.textContent = '';
		var dot = document.createElement('span');
		dot.className = 'vip-workflows-quick-edit__dot';
		dot.style.setProperty('--vip-workflows-stage-color', color || '{$default_color}');
		var labelSpan = document.createElement('span');
		labelSpan.className = 'vip-workflows-quick-edit__label';
		labelSpan.textContent = label || '';
		el.appendChild(dot);
		el.appendChild(labelSpan);
	}

	function loadWorkflowTransitions(postId, section, data) {
		var currentEl = section.querySelector('.vip-workflows-quick-edit__current');
		var transitionsEl = section.querySelector('.vip-workflows-quick-edit__transitions');

		// Show current status.
		renderCurrentStatus(currentEl, data.dataset.statusColor, data.dataset.statusLabel);

		// Fetch transitions.
		transitionsEl.innerHTML = '<span class="spinner is-active vip-workflows-quick-edit__spinner"></span>';

		fetch(apiUrl + '/workflow/post/' + postId + '/status', {
			headers: { 'X-WP-Nonce': nonce }
		})
		.then(function(r) { return r.json(); })
		.then(function(resp) {
			if (!resp.transitions || resp.transitions.length === 0) {
				transitionsEl.innerHTML = '<span class="vip-workflows-quick-edit__message">No transitions available</span>';
				return;
			}

			transitionsEl.innerHTML = '';
			resp.transitions.forEach(function(t) {
				var btn = document.createElement('button');
				btn.type = 'button';
				btn.className = 'button button-small vip-workflows-quick-edit__btn';
				btn.textContent = t.label;
				btn.onclick = function(e) {
					e.preventDefault();
					performTransition(postId, t.to, btn, section, transitionsEl);
				};
				transitionsEl.appendChild(btn);
			});
		})
		.catch(function() {
			transitionsEl.innerHTML = '<span class="vip-workflows-quick-edit__message">Error loading transitions</span>';
		});
	}

	// A region-crossing transition commits a new post_status. The native Status
	// control in the open Quick Edit row — and core's hidden `#inline_{id}` data
	// node it repopulates from — still hold the pre-transition value, and the
	// workflow no longer hides that control. Left alone, the very next Update on
	// the same row is read as a status change back to the old value: the
	// preflight either refuses a post the user just legitimately advanced, or a
	// bypass user confirms it and core un-does the transition.
	function syncInlineStatus(postId, status) {
		var hidden = document.querySelector('#inline_' + postId + ' ._status');
		if (hidden) hidden.textContent = status;

		var editRow = document.getElementById('edit-' + postId);
		if (!editRow) return;

		var keepPrivate = editRow.querySelector('input[name="keep_private"]');
		if (keepPrivate) keepPrivate.checked = (status === 'private');

		var select = editRow.querySelector('select[name="_status"]');
		if (!select) return;

		// Single-row Quick Edit offers no `private` option — the checkbox above
		// is how core expresses it — so leave the select unselected, exactly as
		// core does. An unselected select submits no status at all.
		select.value = (status === 'private') ? '' : status;
	}

	function performTransition(postId, toStatus, btn, section, transitionsEl, acknowledgeWarnings) {
		btn.disabled = true;
		btn.textContent = 'Working...';

		var body = { to_status: toStatus };
		if (acknowledgeWarnings) body.acknowledge_warnings = true;

		fetch(apiUrl + '/workflow/post/' + postId + '/transition', {
			method: 'POST',
			headers: {
				'X-WP-Nonce': nonce,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})
		.then(function(r) { return r.json(); })
		.then(function(resp) {
			if (resp.code) {
				// Error.
				alert(resp.message || 'Transition failed');
				btn.disabled = false;
				btn.textContent = 'Retry';
				return;
			}

			// A 200 carrying `warnings_pending` means the transition did NOT
			// happen: the server is waiting to be told to override a soft warning
			// — a required tool that soft-failed, or a stage agent mid-run whose
			// work this would discard. Falling through to the success path below,
			// as this did, redrew the row as if the post had moved.
			if (resp.warnings_pending) {
				var api = guardApi();
				var proceed = api
					? window.confirm(api.getTransitionWarningsMessage(resp.soft_warnings))
					: false;

				if (!proceed) {
					if (!api) alert('The workflow guard did not load, so this transition cannot be confirmed. Reload the page and try again.');
					btn.disabled = false;
					btn.textContent = 'Retry';
					return;
				}

				performTransition(postId, toStatus, btn, section, transitionsEl, true);
				return;
			}

			// Success - update the display.
			var currentEl = section.querySelector('.vip-workflows-quick-edit__current');
			if (resp.current) {
				renderCurrentStatus(currentEl, resp.current.color, resp.current.label || resp.current.key);
			}

			// Refresh transitions.
			if (!resp.transitions || resp.transitions.length === 0) {
				transitionsEl.innerHTML = '<span class="vip-workflows-quick-edit__message">Workflow complete</span>';
			} else {
				transitionsEl.innerHTML = '';
				resp.transitions.forEach(function(t) {
					var newBtn = document.createElement('button');
					newBtn.type = 'button';
					newBtn.className = 'button button-small vip-workflows-quick-edit__btn';
					newBtn.textContent = t.label;
					newBtn.onclick = function(e) {
						e.preventDefault();
						performTransition(postId, t.to, newBtn, section, transitionsEl);
					};
					transitionsEl.appendChild(newBtn);
				});
			}

			// Update the row in the table.
			var row = document.getElementById('post-' + postId);
			if (row) {
				var colSpan = row.querySelector('.vip-workflows-column');
				if (colSpan && resp.current) {
					// Both are found by class, never by position: a live row ends
					// with the "Live" pill, which `span:last-child` used to pick up
					// instead of the label.
					var dotSpan = colSpan.querySelector('.vip-workflows-column__dot');
					var labelSpan = colSpan.querySelector('.vip-workflows-column__label');
					if (dotSpan) dotSpan.style.setProperty('--vip-workflows-stage-color', resp.current.color || '{$default_color}');
					if (labelSpan) labelSpan.textContent = resp.current.label || resp.current.key;
				}
				var dataInput = row.querySelector('.vip-workflows-data');
				if (dataInput && resp.current) {
					dataInput.dataset.statusKey = resp.current.key;
					dataInput.dataset.statusLabel = resp.current.label || resp.current.key;
					dataInput.dataset.statusColor = resp.current.color || '{$default_color}';

					// Both preflight inputs move with the transition: the stage
					// changed region, and a region-crossing transition commits a
					// new post_status with it. Left at their page-load values, the
					// next Quick Edit on this row would be judged against a stage
					// the post has already left. An unresolved region arrives as
					// null and is stored as the same empty sentinel the server
					// renders, so the client fails closed on it either way.
					dataInput.dataset.stageRegion = (resp.guard && resp.guard.current_region) || '';

					// The stage's own region moves with it too. A stage config
					// calls it `status` — the region the stage lives in, not a
					// post_status — and it is what tells the next confirm
					// whether a change re-seats the post or leaves it put.
					dataInput.dataset.seatedRegion = resp.current.status || '';

					if (resp.current.wp_status) {
						dataInput.dataset.postStatus = resp.current.wp_status;
						syncInlineStatus(postId, resp.current.wp_status);
					} else {
						console.error('[VIP Workflows] The transition response for post ' + postId + ' carried no committed post status.');
					}
				}
			}
		})
		.catch(function(err) {
			alert('Error: ' + (err.message || 'Unknown error'));
			btn.disabled = false;
			btn.textContent = 'Retry';
		});
	}
})(jQuery);
JS;

		wp_add_inline_script( 'inline-edit-post', $script );
	}
}
