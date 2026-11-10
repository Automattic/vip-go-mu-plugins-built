<?php
/**
 * Database schema management.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Database;

use VIPWorkflows\Sequences\Sequence;
use VIPWorkflows\Sequences\SequenceRepository;

/**
 * Handles database table creation and migrations.
 */
class Schema {


	/**
	 * Database version.
	 */
	public const VERSION = '2.27.0';

	/**
	 * Option name for storing DB version.
	 */
	private const VERSION_OPTION = 'vip_workflows_db_version';

	/**
	 * Routing event ids the old System Events matrix wrote, mapped to the ids the
	 * dispatcher actually fires.
	 *
	 * NotificationDispatcher::get_event_types() advertised `sla_breach` while
	 * dispatch() emitted `sla.breached`, and should_notify_channel() matches on a
	 * plain isset() — so every row an admin ticked for those three events was
	 * stored under a key nothing ever looked up. The dotted ids won because
	 * build_notification() keys its templates on them too; this map exists only to
	 * carry the already-stored rows across, and has no runtime reader.
	 */
	private const LEGACY_ROUTING_EVENT_IDS = array(
		'sla_breach'   => 'sla.breached',
		'sla_warning'  => 'sla.warning',
		'goal_at_risk' => 'goal.at_risk',
	);

	/**
	 * Option listing every sequence the stored-config replay changed or could not change.
	 *
	 * Written by replay_stored_stage_configs(), which runs as the 2.17.0 migration and
	 * again — with the duplicate-target collapse enabled — as the 2.19.0 one.
	 *
	 * One flat list of per-sequence records, each carrying the facts about that row:
	 *
	 * - `stage_keys` — stages whose region had to be inferred. The migration can prove
	 *   the publish region from a legacy `publish` flag, but it cannot know whether a
	 *   review-ish stage belongs in `pending`; nothing in the stored row says so. Those
	 *   land in the conservative `draft` default, which is safe but changes behavior.
	 * - `reaches_publish` — false when the result cannot publish at all, which is the
	 *   sharpest consequence of that default.
	 * - `dropped` — transitions the migration had to remove because the stage arrived
	 *   holding two to one target; the gate that wrote the row allowed the shape.
	 *   Only the second and later ones go, so the target stays reachable.
	 * - `error` — set when the row could NOT be normalized. Those rows are left
	 *   untouched in the database and still fatal on read, so they are the reason a
	 *   record exists at all rather than a footnote to it.
	 *
	 * The two are deliberately different problems and the notice keeps them apart: an
	 * inferred region is a repaired sequence someone should confirm; a failed row is a
	 * broken sequence someone has to fix. Deleted once an admin acknowledges it.
	 */
	public const REGION_REVIEW_OPTION = 'vip_workflows_sequences_need_region_review';

	/**
	 * Where the pending-assignee backfill has got to: the last post ID done,
	 * or ASSIGNEE_BACKFILL_COMPLETE once it has finished.
	 *
	 * Kept after the backfill finishes, so a request that started the upgrade
	 * before another finished it does nothing. A later migration that wants to
	 * rebuild this index has to delete this option first, or the backfill will
	 * see itself as done.
	 */
	public const ASSIGNEE_BACKFILL_CURSOR_OPTION = 'vip_workflows_assignee_index_backfill_cursor';

	/**
	 * The cursor value that records a finished backfill.
	 */
	public const ASSIGNEE_BACKFILL_COMPLETE = 'complete';

	/**
	 * Option naming the one request allowed to write the backfill, as
	 * "<token>|<expiry timestamp>".
	 */
	public const ASSIGNEE_BACKFILL_LEASE_OPTION = 'vip_workflows_assignee_index_backfill_lease';

	/**
	 * Seconds a backfill lease lasts without renewal. The owner renews it
	 * before every page, which takes well under a second, so only an owner
	 * that has died lets it run out.
	 */
	public const ASSIGNEE_BACKFILL_LEASE_TTL = 120;

	/**
	 * Seconds of backfill work one request does before it stops and leaves the
	 * rest to the next request.
	 *
	 * The upgrade runs on an ordinary request, so a site with many assigned
	 * posts would otherwise spend a visitor's whole request, and its time
	 * limit, on the backfill. Static so the tests can shorten it.
	 *
	 * @var float
	 */
	private static float $assignee_backfill_budget = 10.0;

	/**
	 * Posts per backfill page. Static so the tests can shorten it.
	 *
	 * @var int
	 */
	private static int $assignee_backfill_page_size = 500;

	/**
	 * Install or upgrade database tables.
	 */
	public function install(): void {
		$current_version = get_option( self::VERSION_OPTION, '0.0.0' );

		if ( version_compare( $current_version, self::VERSION, '>=' ) ) {
			return;
		}

		// Another request is backfilling the pending-assignee index, and bumps
		// the version when it finishes. Running the upgrade here would only
		// re-check every table and then stop at the lease, on every request
		// for as long as the backfill takes, and log each time.
		if ( self::assignee_backfill_running_elsewhere() ) {
			return;
		}

		$this->create_tables();
		$this->run_migrations( $current_version );
		update_option( self::VERSION_OPTION, self::VERSION );
	}

	/**
	 * Run versioned migrations for non-additive schema changes that dbDelta cannot handle.
	 *
	 * DbDelta silently no-ops DROP COLUMN, RENAME COLUMN, MODIFY COLUMN, and DROP INDEX.    * Add those changes here so they execute exactly once on the affected upgrade path.
	 *
	 * To add a migration:
	 *   1. Bump Schema::VERSION.
	 *   2. Append an entry to get_migrations(): [ 'version' => '2.x.0', 'run' => callable ].
	 *   3. Keep entries in ascending version order.
	 *   4. All callables MUST be idempotent — a failed migration re-runs on the next request, and
	 *      fresh installs run every migration against an already-current schema. Use IF EXISTS /
	 *      IF NOT EXISTS guards on all DDL statements.
	 *
	 * @param string $from_version Installed DB version before this upgrade run.
	 * @throws MigrationDeferred When a migration stopped short and resumes on a later request.
	 * @throws \RuntimeException When a migration query fails.
	 * @throws \InvalidArgumentException If a migration definition is invalid.
	 */
	protected function run_migrations( string $from_version ): void {
		global $wpdb;

		foreach ( $this->get_migrations() as $migration ) {
			if ( ! isset( $migration['version'], $migration['run'] ) || ! is_callable( $migration['run'] ) ) {
				throw new \InvalidArgumentException( 'Malformed migration entry: ' . wp_json_encode( array_keys( (array) $migration ) ) );
			}

			if ( version_compare( $from_version, $migration['version'], '<' ) ) {
				// Reset last_error so stale errors from create_tables() / dbDelta do not false-trigger.
				$wpdb->last_error = '';

				try {
					( $migration['run'] )();
				} catch ( MigrationDeferred $e ) {
					// Not a failure: the migration resumes on a later request, and
					// the version stays unbumped until it finishes.
					throw $e;
				} catch ( \Throwable $e ) {
					$message = sprintf( 'VIP Workflows schema migration to %s threw: %s', $migration['version'], $e->getMessage() );
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( $message );
					// phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- $e is the chained previous Throwable, not message output; the message is escaped above.
					throw new \RuntimeException( esc_html( $message ), 0, $e );
				}

				if ( $wpdb->last_error ) {
					$message = sprintf( 'VIP Workflows schema migration to %s failed: %s', $migration['version'], $wpdb->last_error );
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( $message );
					throw new \RuntimeException( esc_html( $message ) );
				}
			}
		}
	}

	/**
	 * Versioned schema migrations in ascending version order.
	 *
	 * Each entry: [ 'version' => string, 'run' => callable ]
	 *
	 * Example — drop a column no longer present in create_tables():
	 *
	 *   [
	 *       'version' => '2.16.0',
	 *       'run'     => function (): void {
	 *           global $wpdb;
	 *           $wpdb->query( "ALTER TABLE {$wpdb->prefix}vip_example DROP COLUMN deprecated_col" ); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
	 *       },
	 *   ],
	 *
	 * @return array<int, array{ version: string, run: callable }>
	 */
	protected function get_migrations(): array {
		return array(
			// The Pitch subsystem was removed. Drop the claim queue table,
			// the pitch-type sequences, and the vip_pitch posts + their meta.
			array(
				'version' => '2.15.0',
				'run'     => function (): void {
					global $wpdb;

                    // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_claim_queue; runs once per schema version
					$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}vip_claim_queue" );

                    // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_sequences; runs once per schema version
					$wpdb->query( "DELETE FROM {$wpdb->prefix}vip_sequences WHERE type = 'pitch'" );

					// Delete vip_pitch posts and their orphaned postmeta.
                    // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-off migration deleting retired post types and their postmeta from the core posts and postmeta tables, which no API can do in one statement; runs once per schema version, and the deleted posts' object-cache entries are left to expire rather than flushed
					$wpdb->query(
						"DELETE p, pm FROM {$wpdb->prefix}posts p
						LEFT JOIN {$wpdb->prefix}postmeta pm ON pm.post_id = p.ID
						WHERE p.post_type = 'vip_pitch'"
					);
				},
			),
			// The Workflow Notes (assets) subsystem was removed. Delete the
			// vip_workflows_note posts + their orphaned postmeta. The _vip_workflows_asset
			// media attachments are intentionally left in place (no custom table involved).
			array(
				'version' => '2.16.0',
				'run'     => function (): void {
					global $wpdb;

					// Delete vip_workflows_note posts and their orphaned postmeta.
                    // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-off migration deleting retired post types and their postmeta from the core posts and postmeta tables, which no API can do in one statement; runs once per schema version, and the deleted posts' object-cache entries are left to expire rather than flushed
					$wpdb->query(
						"DELETE p, pm FROM {$wpdb->prefix}posts p
						LEFT JOIN {$wpdb->prefix}postmeta pm ON pm.post_id = p.ID
						WHERE p.post_type = 'vip_workflows_note'"
					);
				},
			),
			// Replay every stored stage-based sequence config through the write
			// gate, so rows persisted before a gate rule existed gain what that
			// rule guarantees. See replay_stored_stage_configs() for why that is
			// the only place those invariants can be established.
			//
			// This pass has no repair for a row the gate rejects outright: the row
			// is recorded for the admin notice and left exactly as stored. 2.19.0
			// adds the one repair that can be inferred.
			array(
				'version' => '2.17.0',
				'run'     => function (): void {
					self::replay_stored_stage_configs( false );
				},
			),
			// Repair audit rows whose stage label is a fabrication rather than a
			// snapshot.
			//
			// StatusManager::log_transition() snapshots the stage label into each
			// `status_transition` row, and its old fallback for a stage the
			// sequence could not answer was `ucfirst( $stage_key )`. Stage keys are
			// minted by the sequence editor as `status_1`, `status_2`, … so that
			// fallback durably wrote "Status_3" into history, where it renders as
			// the stage's name forever — the bug this repairs, and the reason the
			// fallback is now null.
			//
			// Replacing those values with the sequence's current stage label does
			// NOT rewrite history. History is immutable: a genuine snapshot is left
			// exactly as written, even when the stage has since been renamed. A
			// fabricated `ucfirst()` value was never a snapshot — no label was ever
			// captured — so seeding it is the first snapshot, not a second one.
			//
			// Only a label that is EXACTLY `ucfirst()` of a `status_<n>` key is
			// touched. That shape can only come from the editor's generated keys, so
			// an author-written label (including one for a `draft`/`review` style key
			// whose label happens to be its own ucfirst) is never overwritten.
			//
			// Logs and continues per row: a row whose sequence or stage cannot be
			// resolved is reported and skipped rather than aborting the upgrade,
			// which would re-run the migration on every subsequent request.
			//
			// Idempotent: a repaired row no longer matches the fabrication shape, so
			// a re-run skips it. A row whose sequence genuinely labels the stage
			// "Status_3" resolves to the same value and is not written.
			array(
				'version' => '2.18.0',
				'run'     => function (): void {
					self::repair_fabricated_stage_labels();
				},
			),
			// Replay the stored configs again, this time applying the one repair a
			// gate rejection can be inferred from: a stage holding two transitions
			// to one target keeps the first. That rule was added to the gate after
			// these rows were written, and a rule added to the gate may never leave
			// a stored row permanently unmigratable.
			//
			// A NEW version rather than an edit to 2.17.0's body, because 2.17.0 has
			// already run everywhere it was going to. install() returns early when
			// the stored version is at or past Schema::VERSION, and run_migrations()
			// skips every entry the stored version has already passed, so a repair
			// added to 2.17.0's body would reach no install that had taken 2.17.0 —
			// which is every install this repair exists for.
			//
			// It replays the whole normalization rather than only the repairs,
			// because the rows it has to reach are exactly the ones 2.17.0 gave up
			// on: still stored raw, still carrying no `status` region, still fatal
			// on the first read that touches one. Repairing alone would leave them
			// that way.
			//
			// Idempotent: the gate is a pure normalization and the collapse is a
			// no-op on a config with no duplicate targets, so a replay of an
			// already-repaired row produces byte-identical JSON, writes nothing, and
			// records nothing.
			array(
				'version' => '2.19.0',
				'run'     => function (): void {
					self::replay_stored_stage_configs( true );
				},
			),
			// Seed event routing from the per-channel event lists the old System
			// Events matrix wrote.
			//
			// Two places used to answer "does this event go to this channel": the
			// `vip_workflows_notification_routing` option, and an `events` array
			// inside each channel's own settings. The dispatcher read routing first
			// and fell back to the per-channel list, so a site that only ever used
			// the old matrix is answered entirely by the fallback. The admin no
			// longer writes that list, and the fallback is gone in this release —
			// so without this pass those sites would silently stop notifying.
			//
			// Read at the options level rather than through the channel registry:
			// migrations run before channels are registered, and the storage is a
			// plain `vip_workflows_channel_{id}` option per channel. Slack and ntfy
			// never persisted `events` at all (their update_settings() merges a
			// fixed key list), so there is nothing of theirs to carry over.
			//
			// Idempotent, and deliberately narrow: an event the routing table
			// already answers for is left exactly as it is, because routing is the
			// authority wherever it has an entry. Only events routing has never
			// heard of are seeded.
			array(
				'version' => '2.20.0',
				'run'     => function (): void {
					self::seed_routing_from_channel_events();
				},
			),

			// Re-key routing onto the ids the dispatcher fires.
			//
			// The Routing screen offered `sla_breach`, `sla_warning` and
			// `goal_at_risk`; dispatch() has always emitted `sla.breached`,
			// `sla.warning` and `goal.at_risk`. should_notify_channel() is a plain
			// isset() lookup, so every row an admin ticked for those three was
			// stored under a key nothing asks about — SLA and goal notifications
			// could not fire at all, on any channel. `published` matched, which is
			// why the screen looked like it worked.
			//
			// Runs after the seed so a site arriving from the old per-channel
			// matrix has its rows in place first; both write canonical ids, and a
			// site holding both spellings has them merged rather than overwritten.
			array(
				'version' => '2.21.0',
				'run'     => function (): void {
					self::rekey_routing_to_dispatched_event_ids();
				},
			),
			// Move what a transition captures onto the list shape.
			//
			// A transition used to capture exactly one thing, stored as a singular
			// `input` whose `none` type meant "captures nothing". It now captures
			// any number, stored as `inputs`, and the readers have no fallback for
			// the old key — so every stored row has to be converted or the inputs
			// authors configured stop being collected, silently.
			array(
				'version' => '2.22.0',
				'run'     => function (): void {
					self::replay_stored_stage_configs( true );
				},
			),
			// `blueprint` was this plugin's word for a sequence. It collided with
			// WordPress Playground's own Blueprints, which this repo ships to boot
			// the demo environment, so the concept was renamed. Storage is the only
			// part a running site carries.
			//
			// Every other migration names vip_sequences too, including ones that
			// predate this. That is only correct because the plugin is unreleased:
			// the upgrade path in existence is 2.21 or 2.22 to 2.23.
			array(
				'version' => '2.23.0',
				'run'     => function (): void {
					global $wpdb;

					$old_table = $wpdb->prefix . 'vip_blueprints';
					$new_table = $wpdb->prefix . 'vip_sequences';

					// Not RENAME: install() runs create_tables() before the migrations,
					// so the new table already exists and a rename would fail on it.
					// Move the rows instead, and only when the new table is empty —
					// that is what tells an upgrade from a fresh install.
					//
					// Table names cannot be bound as parameters; every name here is
					// built from $wpdb->prefix and a literal, never from input.
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration check for plugin table vip_blueprints; runs once per schema version
					$has_old = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $old_table ) ) === $old_table;

					if ( $has_old ) {
						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_sequences; runs once per schema version
						$new_rows = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$new_table}`" );
						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_blueprints; runs once per schema version
						$old_rows = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$old_table}`" );

						// Rows on both sides is not a state this can reconcile — the new
						// table was written to before the move finished. create_tables()
						// runs before the migrations and the version is written after, so
						// a request that dies in between leaves exactly that. Stop with
						// both tables intact rather than pick a copy to destroy.
						if ( 0 !== $new_rows ) {
							throw new \RuntimeException(
								esc_html(
									sprintf(
										'%1$s already holds %2$d row(s) while %3$s still exists. Neither table was changed; resolve by hand.',
										$new_table,
										$new_rows,
										$old_table
									)
								)
							);
						}

						// Columns named, not `SELECT *`: a positional copy is correct only
						// while both CREATE TABLE statements agree on column order, and
						// nothing enforces that.
						$columns = '`id`, `uuid`, `type`, `name`, `slug`, `description`, `version`, `status`, `config`, `created_by`, `created_at`, `updated_at`';

						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_sequences; runs once per schema version
						$wpdb->query( "INSERT INTO `{$new_table}` ({$columns}) SELECT {$columns} FROM `{$old_table}`" );

						// The copy has to prove itself here. $wpdb->last_error cannot do it:
						// run_migrations() reads that after this callable returns, and every
						// later query in here clears it first — so a failed INSERT would be
						// invisible by the time it is checked, and the version would be
						// written as complete. Count the rows and throw, which is what
						// run_migrations() does catch.
						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_sequences; runs once per schema version
						$copied = (int) $wpdb->get_var( "SELECT COUNT(*) FROM `{$new_table}`" );

						if ( $copied !== $old_rows ) {
							throw new \RuntimeException(
								esc_html(
									sprintf(
										'Copied %1$d of %2$d row(s) into %3$s; %4$s was left in place.',
										$copied,
										$old_rows,
										$new_table,
										$old_table
									)
								)
							);
						}

						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_blueprints; runs once per schema version
						$wpdb->query( "DROP TABLE `{$old_table}`" );
					}

					// Re-runnable by construction: a second pass matches no rows.
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-off migration renaming a meta key across all posts, which no meta API can do in one statement; runs once per schema version, and affected posts' meta caches are not flushed here
					$wpdb->update(
						$wpdb->postmeta,
						array( 'meta_key' => '_vip_workflows_sequence_id' ),
						array( 'meta_key' => '_vip_workflows_blueprint_id' )
					);

					// vip_automation_flows.blueprint_id became sequence_id. dbDelta cannot
					// rename a column — it no-ops the rename and ADDS the new one — so
					// create_tables() above has already left an all-NULL `sequence_id`
					// beside the populated `blueprint_id`, and every scoped flow would read
					// as global. Carry the values over and retire the old column.
					$flows = $wpdb->prefix . 'vip_automation_flows';

					// The automation-flow engine was removed in 2.24.0, so create_tables()
					// no longer makes this table and a fresh install replays every
					// migration from 0.0.0 — this one included. Ask whether the table is
					// there before naming it in a statement: SHOW COLUMNS against a table
					// that does not exist sets $wpdb->last_error, and run_migrations()
					// turns any last_error into a thrown RuntimeException. Without this
					// guard, installing the plugin fresh fails here.
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration check for plugin table vip_automation_flows; runs once per schema version
					$has_flows_table = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $flows ) ) === $flows;

					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_automation_flows; runs once per schema version
					$has_old_column = $has_flows_table && (bool) $wpdb->get_var( $wpdb->prepare( "SHOW COLUMNS FROM `{$flows}` LIKE %s", 'blueprint_id' ) );

					if ( $has_old_column ) {
						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_automation_flows; runs once per schema version
						$wpdb->query( "UPDATE `{$flows}` SET sequence_id = blueprint_id WHERE sequence_id IS NULL" );

						// The indexes naming the old column have to go before it can.
						foreach ( array( 'blueprint_id', 'status_blueprint_priority' ) as $index ) {
							// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_automation_flows; runs once per schema version
							$exists = $wpdb->get_var( $wpdb->prepare( "SHOW INDEX FROM `{$flows}` WHERE Key_name = %s", $index ) );
							if ( $exists ) {
								// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_automation_flows; runs once per schema version
								$wpdb->query( "ALTER TABLE `{$flows}` DROP INDEX `{$index}`" );
							}
						}

						// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_automation_flows; runs once per schema version
						$wpdb->query( "ALTER TABLE `{$flows}` DROP COLUMN blueprint_id" );
					}

					self::migrate_sequence_event_history();

					// Move what a transition captures onto the list shape. The readers
					// have no fallback for the retired singular `input` key, so replay
					// the copied rows through the sequence write gate after the storage
					// rename has completed.
					self::replay_stored_stage_configs( true );
				},
			),
			// The automation-flow engine was removed. Drop its two tables.
			//
			// Nothing could ever author a flow: no UI, no REST route and no CLI
			// wrote vip_automation_flows, so the engine that read it — condition
			// evaluation, action dispatch, execution tracking — ran against an
			// always-empty table on every event the bus emitted. The one
			// automation the seeder shipped was sequence-level and keyed
			// `action`, which the dispatcher never read.
			//
			// Both tables are dropped rather than left orphaned: neither can hold
			// a row a site would miss, and get_owned_tables() no longer lists them
			// for uninstall to reach.
			//
			// The same release retires SLA and `goal.at_risk`, which were offered
			// as routable notification events; drop_retired_event_routing() below
			// forgets whatever a site had ticked for them.
			array(
				'version' => '2.24.0',
				'run'     => function (): void {
					global $wpdb;

					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_automation_executions; runs once per schema version
					$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}vip_automation_executions" );

					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- migration on plugin table vip_automation_flows; runs once per schema version
					$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}vip_automation_flows" );

					self::drop_retired_event_routing();
				},
			),
			// Clear two retired transition fields off stored rows, in one replay.
			//
			// The restrict-to-assignee gate, `requires_assignment`: nothing has
			// read it since the gate was removed, and the write gate now strips
			// it. Stored rows still carry it, and GET and export re-emit it as a
			// restriction nothing enforces.
			//
			// Free-text notes (`textarea`, or the older `text`): the editor
			// stopped collecting them, and the write gate now refuses any input
			// that is not an assignment, so a stored note is a row nothing reads
			// and no save can carry.
			//
			// The gate strips `requires_assignment` itself. Notes are dropped
			// ahead of the gate by drop_retired_transition_inputs(), which every
			// replay runs, so earlier replays on a fresh upgrade do not reject a
			// note-bearing row either. Only the known note types are dropped; an
			// unknown input type is left for the gate, so its row is recorded for
			// review rather than silently changed. Import runs the same cleanup.
			//
			// Idempotent: a replayed row carries neither field, so a second pass
			// produces byte-identical JSON and writes nothing.
			array(
				'version' => '2.25.0',
				'run'     => function (): void {
					self::replay_stored_stage_configs( true );
				},
			),
			// Flag the stage new posts start in.
			//
			// The start stage used to be read from array order: the stage marked
			// `is_initial`, or else the first stage. The Sequence editor's stages
			// list saves its order as that array, so dragging a later stage to the
			// top quietly changed where new posts start. The write gate now
			// guarantees exactly one flagged stage, and the read path no longer
			// consults order at all — so every stored row has to carry the flag.
			//
			// The replay stamps it where the old rule would have put new posts:
			// on a row with no flag, the first stage. Nothing about where posts
			// start changes on upgrade; only a later reorder stops changing it.
			// A row that already flags exactly one stage is a byte-identical
			// no-op, and a row that flags two is rejected and recorded for the
			// admin notice like any other row the gate refuses.
			array(
				'version' => '2.26.0',
				'run'     => function (): void {
					self::replay_stored_stage_configs( true );
				},
			),
			// My Work finds a user's pending assignments through an index
			// that every assignment write now keeps in step. Assignments made
			// before it existed have no index rows, so build them once.
			array(
				'version' => '2.27.0',
				'run'     => function (): void {
					self::backfill_pending_assignee_index();
				},
			),
		);
	}

	/**
	 * Build the pending-assignee index for every post that has an assignment.
	 *
	 * Only the request holding the backfill lease writes (see
	 * acquire_backfill_lease()); another request running the upgrade at the
	 * same time stops without writing, and the holder bumps the schema
	 * version when it finishes. A finished backfill is recorded, so a request
	 * that starts after it does nothing.
	 *
	 * It runs on an ordinary request after the upgrade, so it does a page at a
	 * time: one read of a page of posts' assignment rows, one delete and one
	 * multi-row insert, rather than several queries per post. Each page is
	 * read back after it is written, which settles a live assignment made
	 * between the read and the write (see settle_pending_assignee_page()), and
	 * only then is the page's last post ID saved, so an owner that dies
	 * mid-page leaves that page to be redone, from a fresh read, by the next
	 * owner once its lease expires.
	 *
	 * A request works for a few seconds at most ($assignee_backfill_budget),
	 * then releases the lease and throws MigrationDeferred, so no visitor's
	 * request carries the whole backfill; the next request resumes at the
	 * cursor.
	 *
	 * Malformed slots are logged and left out, as
	 * AssignmentManager::pending_user_ids_from_slots() describes.
	 *
	 * @throws MigrationDeferred When this request's time budget ran out. The
	 *                           helpers it calls also throw MigrationDeferred
	 *                           when another request holds the lease, and
	 *                           RuntimeException when the lease is lost or the
	 *                           rows cannot be read or written.
	 */
	private static function backfill_pending_assignee_index(): void {
		$lease = self::acquire_backfill_lease();

		try {
			$cursor = self::read_option_from_primary( self::ASSIGNEE_BACKFILL_CURSOR_OPTION );
			if ( self::ASSIGNEE_BACKFILL_COMPLETE === $cursor ) {
				// Another request finished it after this one decided to upgrade.
				return;
			}

			if ( ! self::write_backfill_pages( $lease, (int) $cursor ) ) {
				// The time budget ran out. The cursor marks where the next
				// request picks up; the lease is released below so it can.
				throw new MigrationDeferred( 'The pending-assignee backfill used its time budget and resumes on the next request.' );
			}

			// Still the owner when recording the finish, or a request that took
			// over could be told there is nothing left to do.
			$lease = self::renew_backfill_lease( $lease );
			self::write_option_to_primary( self::ASSIGNEE_BACKFILL_CURSOR_OPTION, self::ASSIGNEE_BACKFILL_COMPLETE );
		} finally {
			self::release_backfill_lease( $lease );
		}
	}

	/**
	 * Write the backfill a page at a time, from the post after $last_id.
	 *
	 * @param string $lease   This request's lease value, by reference: each
	 *                        renewal changes it, and the caller releases the
	 *                        lease by its latest value.
	 * @param int    $last_id Last post ID already done.
	 * @return bool True when every assigned post is done; false when the time
	 *              budget ran out first.
	 * @throws \RuntimeException When the rows cannot be read or written, or the lease was lost.
	 */
	private static function write_backfill_pages( string &$lease, int $last_id ): bool {
		global $wpdb;

		$index_key = \VIPWorkflows\Workflow\AssignmentManager::PENDING_ASSIGNEE_INDEX_KEY;
		$like      = $wpdb->esc_like( \VIPWorkflows\Workflow\AssignmentManager::STORAGE_PREFIX ) . '%';
		$page_size = self::$assignee_backfill_page_size;
		$deadline  = microtime( true ) + self::$assignee_backfill_budget;

		do {
			$post_ids = array_map(
				'intval',
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-off backfill over postmeta, paged by post ID; runs once per schema version
				$wpdb->get_col(
					$wpdb->prepare(
						'SELECT DISTINCT post_id FROM %i WHERE meta_key LIKE %s AND post_id > %d ORDER BY post_id ASC LIMIT %d',
						$wpdb->postmeta,
						$like,
						$last_id,
						$page_size
					)
				)
			);

			if ( '' !== $wpdb->last_error ) {
				throw new \RuntimeException( esc_html( 'Could not read assigned posts to index: ' . $wpdb->last_error ) );
			}

			if ( $post_ids ) {
				// Still the owner, or stop before writing: a request whose lease
				// ran out and was taken over must not write a page it read
				// before the takeover.
				$lease = self::renew_backfill_lease( $lease );

				// Integers only, so the list is safe to inline.
				$in = implode( ', ', $post_ids );

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- one-off backfill; $in holds only integers.
				$rows = $wpdb->get_results( $wpdb->prepare( "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id IN ( {$in} ) AND meta_key LIKE %s", $like ) );
				if ( null === $rows || '' !== $wpdb->last_error ) {
					throw new \RuntimeException( esc_html( 'Could not read assignments to index: ' . $wpdb->last_error ) );
				}

				$slots = array();
				foreach ( $rows as $row ) {
					$slots[ (int) $row->post_id ][ (string) $row->meta_key ] = $row->meta_value;
				}

				$values = array();
				foreach ( $post_ids as $post_id ) {
					$user_ids = \VIPWorkflows\Workflow\AssignmentManager::pending_user_ids_from_slots( $post_id, $slots[ $post_id ] ?? array() );
					foreach ( $user_ids as $user_id ) {
						$values[] = $wpdb->prepare( '( %d, %s, %s )', $post_id, $index_key, (string) $user_id );
					}
				}

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- one-off backfill; $in holds only integers.
				$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id IN ( {$in} )", $index_key ) );
				if ( $values && '' === $wpdb->last_error ) {
					// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.NotPrepared -- one-off backfill; every row in $values was prepared above.
					$wpdb->query( "INSERT INTO {$wpdb->postmeta} ( post_id, meta_key, meta_value ) VALUES " . implode( ', ', $values ) );
				}
				if ( '' !== $wpdb->last_error ) {
					throw new \RuntimeException( esc_html( 'Could not write the pending-assignee index: ' . $wpdb->last_error ) );
				}

				foreach ( $post_ids as $post_id ) {
					wp_cache_delete( $post_id, 'post_meta' );
				}

				self::settle_pending_assignee_page( $post_ids, $in, $like, $index_key );

				// Saved only after the page is read back and settled, so an owner
				// that dies before then leaves the page to be redone, from a fresh
				// read, by the next owner.
				$last_id = (int) end( $post_ids );
				self::write_option_to_primary( self::ASSIGNEE_BACKFILL_CURSOR_OPTION, (string) $last_id );
			}

			$done = count( $post_ids ) < $page_size;
		} while ( ! $done && microtime( true ) < $deadline );

		return $done;
	}

	/**
	 * Whether another request holds a live backfill lease.
	 *
	 * A cheap check before the upgrade starts, not the guard: it is a plain
	 * read, which HyperDB may answer from a replica, so two requests can both
	 * see no lease. The lease claim in acquire_backfill_lease() decides which
	 * of them writes.
	 *
	 * @return bool
	 */
	private static function assignee_backfill_running_elsewhere(): bool {
		$held = self::read_option_from_primary( self::ASSIGNEE_BACKFILL_LEASE_OPTION );

		return null !== $held && (int) substr( (string) strrchr( $held, '|' ), 1 ) >= time();
	}

	/**
	 * Take the backfill lease, or throw because another request holds it.
	 *
	 * Two requests can run the schema upgrade at once. Two backfill writers
	 * could then leave a stale page behind: one finishes and marks the schema
	 * current, the other overwrites a page from an older read and dies before
	 * reading it back, and nothing runs the backfill again. So only the lease
	 * holder writes. The lease is an option row inserted with INSERT IGNORE, so
	 * exactly one request creates it; a write, it goes to the primary under
	 * HyperDB, unlike a SELECT GET_LOCK. A lease past its expiry belonged to a
	 * request that died, and is taken over with a compare-and-set.
	 *
	 * It throws MigrationDeferred, which is not logged as a failure, and leaves
	 * the schema version unbumped for this request, which is right: the holder
	 * bumps it when it finishes.
	 *
	 * @return string This request's lease value.
	 * @throws MigrationDeferred When another request holds a live lease.
	 * @throws \RuntimeException When the claim fails in the database.
	 */
	private static function acquire_backfill_lease(): string {
		global $wpdb;

		$lease = wp_generate_uuid4() . '|' . ( time() + self::ASSIGNEE_BACKFILL_LEASE_TTL );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- an atomic claim on a unique option name; the options API would overwrite an existing row.
		$claimed = $wpdb->query( $wpdb->prepare( "INSERT IGNORE INTO {$wpdb->options} ( option_name, option_value, autoload ) VALUES ( %s, %s, 'off' )", self::ASSIGNEE_BACKFILL_LEASE_OPTION, $lease ) );
		if ( false === $claimed ) {
			throw new \RuntimeException( esc_html( 'Could not claim the pending-assignee backfill lease: ' . $wpdb->last_error ) );
		}
		if ( 1 === $claimed ) {
			return $lease;
		}

		$held = (string) self::read_option_from_primary( self::ASSIGNEE_BACKFILL_LEASE_OPTION );
		if ( (int) substr( (string) strrchr( $held, '|' ), 1 ) < time() ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- compare-and-set takeover of an expired lease.
			$taken = $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND option_value = %s", $lease, self::ASSIGNEE_BACKFILL_LEASE_OPTION, $held ) );
			if ( 1 === $taken ) {
				return $lease;
			}
		}

		throw new MigrationDeferred( 'The pending-assignee backfill is running in another request.' );
	}

	/**
	 * Extend this request's lease, or throw because it was taken over.
	 *
	 * @param string $lease This request's lease value.
	 * @return string The renewed lease value.
	 * @throws \RuntimeException When the lease is no longer this request's.
	 */
	private static function renew_backfill_lease( string $lease ): string {
		global $wpdb;

		$token   = strtok( $lease, '|' );
		$renewed = $token . '|' . ( time() + self::ASSIGNEE_BACKFILL_LEASE_TTL );

		// Matched on the token, which is this request's, not on the whole
		// value, whose expiry moves with every renewal.
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- compare-and-set renewal of this request's own lease.
		$rows = $wpdb->query( $wpdb->prepare( "UPDATE {$wpdb->options} SET option_value = %s WHERE option_name = %s AND option_value LIKE %s", $renewed, self::ASSIGNEE_BACKFILL_LEASE_OPTION, $wpdb->esc_like( $token . '|' ) . '%' ) );

		// MySQL counts changed rows, so a renewal in the same second as the
		// last one changes nothing and reports 0. Read the row to tell that
		// apart from a takeover, which replaces the token.
		if ( 1 !== $rows && strtok( (string) self::read_option_from_primary( self::ASSIGNEE_BACKFILL_LEASE_OPTION ), '|' ) !== $token ) {
			throw new \RuntimeException( 'The pending-assignee backfill lease was taken over; stopping before writing.' );
		}

		return $renewed;
	}


	/**
	 * Give the lease back, if it is still this request's.
	 *
	 * Matched on the token, so a value whose expiry has moved since it was
	 * claimed is still released, and a lease another request took over is not.
	 *
	 * @param string $lease This request's lease value.
	 */
	private static function release_backfill_lease( string $lease ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- deletes only this request's own lease row.
		$wpdb->query( $wpdb->prepare( "DELETE FROM {$wpdb->options} WHERE option_name = %s AND option_value LIKE %s", self::ASSIGNEE_BACKFILL_LEASE_OPTION, $wpdb->esc_like( strtok( $lease, '|' ) . '|' ) . '%' ) );
	}


	/**
	 * Read an option row straight from the database, past every cache.
	 *
	 * Used after this request has written to the options table, so HyperDB
	 * sends it to the primary.
	 *
	 * @param string $name Option name.
	 * @return string|null The stored value, or null when there is none.
	 */
	private static function read_option_from_primary( string $name ): ?string {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- the backfill's own coordination rows, read past the cache.
		return $wpdb->get_var( $wpdb->prepare( "SELECT option_value FROM {$wpdb->options} WHERE option_name = %s", $name ) );
	}

	/**
	 * Write an option row straight to the database, and drop its cache entry.
	 *
	 * @param string $name  Option name.
	 * @param string $value Value.
	 */
	private static function write_option_to_primary( string $name, string $value ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- the backfill's own coordination row.
		$wpdb->query( $wpdb->prepare( "INSERT INTO {$wpdb->options} ( option_name, option_value, autoload ) VALUES ( %s, %s, 'off' ) ON DUPLICATE KEY UPDATE option_value = VALUES( option_value )", $name, $value ) );
		wp_cache_delete( $name, 'options' );
	}

	/**
	 * Check a backfilled page against its slots as stored now, and rebuild
	 * any post that disagrees.
	 *
	 * The page was read before it was written, so a live assignment made in
	 * between, or another upgrade request backfilling the same page, can leave
	 * a post with a stale or doubled row. Reading the page again after the
	 * write sees those, and AssignmentManager::sync_pending_assignee_index(),
	 * which checks its own work, settles each post that disagrees.
	 *
	 * @param int[]  $post_ids  The page's post IDs.
	 * @param string $in        Those IDs as an inlined integer list.
	 * @param string $like      LIKE pattern for assignment slot keys.
	 * @param string $index_key The index meta key.
	 * @throws \RuntimeException When the page cannot be read back.
	 */
	private static function settle_pending_assignee_page( array $post_ids, string $in, string $like, string $index_key ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- one-off backfill; $in holds only integers.
		$slot_rows = $wpdb->get_results( $wpdb->prepare( "SELECT post_id, meta_key, meta_value FROM {$wpdb->postmeta} WHERE post_id IN ( {$in} ) AND meta_key LIKE %s", $like ) );
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- one-off backfill; $in holds only integers.
		$index_rows = $wpdb->get_results( $wpdb->prepare( "SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id IN ( {$in} )", $index_key ) );
		if ( null === $slot_rows || null === $index_rows || '' !== $wpdb->last_error ) {
			throw new \RuntimeException( esc_html( 'Could not read back the pending-assignee index: ' . $wpdb->last_error ) );
		}

		$slots = array();
		foreach ( $slot_rows as $row ) {
			$slots[ (int) $row->post_id ][ (string) $row->meta_key ] = $row->meta_value;
		}
		$indexed = array();
		foreach ( $index_rows as $row ) {
			$indexed[ (int) $row->post_id ][] = (int) $row->meta_value;
		}

		$manager = new \VIPWorkflows\Workflow\AssignmentManager();
		foreach ( $post_ids as $post_id ) {
			$expected = \VIPWorkflows\Workflow\AssignmentManager::pending_user_ids_from_slots( $post_id, $slots[ $post_id ] ?? array(), false );
			$actual   = $indexed[ $post_id ] ?? array();
			sort( $expected );
			sort( $actual );

			if ( $expected !== $actual ) {
				// The page pass above already logged this post's malformed slots.
				$manager->sync_pending_assignee_index( $post_id, false );
			}
		}
	}

	/**
	 * Move stored workflow-event types and payload keys onto sequence terms.
	 *
	 * Configuration events changed their concrete type ids, and several other
	 * event families carried sequence identity in their payload. Historical rows
	 * are part of the public audit/event stream, so leaving the old shape in place
	 * would make type filters miss events and give consumers two payload contracts.
	 *
	 * @throws \RuntimeException When a stored event cannot be migrated safely.
	 */
	private static function migrate_sequence_event_history(): void {
		global $wpdb;

		$events_table = $wpdb->prefix . 'vip_workflows_events';
		$type_map     = array(
			'blueprint.updated'     => 'sequence.updated',
			'blueprint.activated'   => 'sequence.activated',
			'blueprint.deactivated' => 'sequence.deactivated',
		);
		$key_map      = array(
			'blueprint_id'   => 'sequence_id',
			'blueprint_name' => 'sequence_name',
			'blueprint_slug' => 'sequence_slug',
			'blueprint_type' => 'sequence_type',
			'blueprint'      => 'sequence',
		);

		foreach ( $type_map as $old_type => $new_type ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_workflows_events; runs once per schema version
			$updated = $wpdb->update(
				$events_table,
				array( 'event_type' => $new_type ),
				array( 'event_type' => $old_type )
			);

			if ( false === $updated ) {
				throw new \RuntimeException( esc_html( sprintf( 'Could not migrate workflow event type %1$s to %2$s.', $old_type, $new_type ) ) );
			}
		}

		$last_id = 0;
		do {
			// Payload identity is always top-level. Page by id so the migration has a
			// fixed memory ceiling even on a long-lived site's audit table.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$rows = $wpdb->get_results(
				$wpdb->prepare(
					// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Table names cannot be value placeholders.
					"SELECT id, event_data FROM `{$events_table}` WHERE id > %d AND event_data LIKE %s ORDER BY id ASC LIMIT 500",
					$last_id,
					'%"blueprint%'
				)
			);

			foreach ( (array) $rows as $row ) {
				$last_id = max( $last_id, (int) $row->id );
				$data    = json_decode( (string) $row->event_data, true );

				if ( ! is_array( $data ) ) {
					throw new \RuntimeException(
						esc_html(
							sprintf(
								'Workflow event %d contains sequence identity in malformed event_data JSON.',
								(int) $row->id
							)
						)
					);
				}

				$changed = false;
				foreach ( $key_map as $old_key => $new_key ) {
					if ( ! array_key_exists( $old_key, $data ) ) {
						continue;
					}

					if ( array_key_exists( $new_key, $data ) && $data[ $new_key ] !== $data[ $old_key ] ) {
						throw new \RuntimeException(
							esc_html(
								sprintf(
									'Workflow event %1$d contains conflicting %2$s and %3$s payload values.',
									(int) $row->id,
									$old_key,
									$new_key
								)
							)
						);
					}

					$data[ $new_key ] = $data[ $old_key ];
					unset( $data[ $old_key ] );
					$changed = true;
				}

				if ( 'blueprint' === ( $data['source'] ?? null ) ) {
					$data['source'] = 'sequence';
					$changed        = true;
				}

				if ( ! $changed ) {
					continue;
				}

				$encoded = wp_json_encode( $data );
				if ( false === $encoded ) {
					throw new \RuntimeException( esc_html( sprintf( 'Could not encode migrated workflow event %d.', (int) $row->id ) ) );
				}

				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- migration on plugin table vip_workflows_events; runs once per schema version
				$updated = $wpdb->update(
					$events_table,
					array( 'event_data' => $encoded ),
					array( 'id' => (int) $row->id )
				);

				if ( false === $updated ) {
					throw new \RuntimeException( esc_html( sprintf( 'Could not migrate workflow event %d.', (int) $row->id ) ) );
				}
			}
			$row_count = count( $rows );
		} while ( 500 === $row_count );
	}

	/**
	 * Move stored routing entries from the retired event ids onto the dispatched ones.
	 *
	 * Union rather than overwrite: a site can hold both spellings — the stale one
	 * written by the old screen, the canonical one written by the seed above — and
	 * the channels an admin chose under either are channels they asked for.
	 */
	protected static function rekey_routing_to_dispatched_event_ids(): void {
		$routing = get_option( 'vip_workflows_notification_routing', array() );
		if ( ! is_array( $routing ) ) {
			return;
		}

		$changed = false;
		foreach ( self::LEGACY_ROUTING_EVENT_IDS as $legacy => $canonical ) {
			if ( ! isset( $routing[ $legacy ] ) ) {
				continue;
			}

			$merged = array_merge(
				(array) ( $routing[ $canonical ] ?? array() ),
				(array) $routing[ $legacy ]
			);

			$routing[ $canonical ] = array_values( array_unique( $merged ) );
			unset( $routing[ $legacy ] );
			$changed = true;
		}

		if ( $changed ) {
			update_option( 'vip_workflows_notification_routing', $routing, false );
		}
	}

	/**
	 * Forget notification routing for the events retired in 2.24.0.
	 *
	 * SLA had no input: nothing set a stage's target duration, so the check that
	 * would have fired `sla.warning` and `sla.breached` never had one to read.
	 * `goal.at_risk` had no emitter at all — two listeners disagreeing about the
	 * payload, and no caller in any commit. All three were offered on the
	 * Notifications screen as routable events, so a site can hold rows for them.
	 *
	 * Both spellings are dropped. The 2.21.0 migration re-keys the underscored
	 * ids the old System Events matrix wrote onto the dotted ones the dispatcher
	 * fired, and it runs first — but a site can arrive here having skipped it,
	 * and asking about four keys is cheaper than reasoning about which.
	 *
	 * The rows are inert — should_notify_channel() is an isset() lookup against
	 * ids nothing dispatches — but leaving them means the option keeps
	 * describing features that are gone, and a later event reusing one of these
	 * ids would silently inherit whatever an admin ticked years earlier.
	 */
	protected static function drop_retired_event_routing(): void {
		$routing = get_option( 'vip_workflows_notification_routing', array() );
		if ( ! is_array( $routing ) ) {
			return;
		}

		$retired = array(
			'sla.warning',
			'sla.breached',
			'sla_warning',
			'sla_breach',
			'goal.at_risk',
			'goal_at_risk',
		);

		$changed = false;
		foreach ( $retired as $event_id ) {
			if ( array_key_exists( $event_id, $routing ) ) {
				unset( $routing[ $event_id ] );
				$changed = true;
			}
		}

		if ( $changed ) {
			update_option( 'vip_workflows_notification_routing', $routing, false );
		}
	}

	/**
	 * Build the routing option from each channel's stored `events` list.
	 *
	 * Collects every channel's events first, then writes, so two channels that
	 * both carried one event both reach that event's routing entry.
	 */
	protected static function seed_routing_from_channel_events(): void {
		global $wpdb;

		$routing = get_option( 'vip_workflows_notification_routing', array() );
		if ( ! is_array( $routing ) ) {
			$routing = array();
		}

		$prefix = 'vip_workflows_channel_';

		// phpcs:disable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- one-off migration listing options by prefix; options API cannot do this in one statement; runs once per schema version
		$option_names = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( $prefix ) . '%'
			)
		);
		// phpcs:enable WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching

		$collected = array();
		foreach ( (array) $option_names as $option_name ) {
			$settings = get_option( $option_name, array() );
			if ( ! is_array( $settings ) || ! isset( $settings['events'] ) || ! is_array( $settings['events'] ) ) {
				continue;
			}

			$channel_id = substr( $option_name, strlen( $prefix ) );
			foreach ( $settings['events'] as $event_type ) {
				if ( ! is_string( $event_type ) || '' === $event_type ) {
					continue;
				}
				// The stored list speaks the old matrix's vocabulary, which for
				// three of the four events is not what dispatch() fires. Seed the
				// id the dispatcher will actually ask about, or the carried-over
				// row is as unreachable as the one it came from.
				$canonical                 = self::LEGACY_ROUTING_EVENT_IDS[ $event_type ] ?? $event_type;
				$collected[ $canonical ][] = $channel_id;
			}
		}

		$changed = false;
		foreach ( $collected as $event_type => $channel_ids ) {
			if ( isset( $routing[ $event_type ] ) ) {
				continue;
			}
			$routing[ $event_type ] = array_values( array_unique( $channel_ids ) );
			$changed                = true;
		}

		if ( $changed ) {
			update_option( 'vip_workflows_notification_routing', $routing, false );
		}
	}

	/**
	 * Replay every stored stage-based sequence config through the write gate.
	 *
	 * Sequence::prepare_config_for_write() is the ONLY place the stage invariants
	 * are established — it runs on create/update and nowhere else. The read path
	 * deliberately has no fallbacks: a stage with no `status` region throws in
	 * Sequence::require_stage_region(), and a used region with no `region_entry`
	 * checkpoint throws in Sequence::get_region_entry_stage(). That is correct for
	 * a row the gate has seen. It is a latent fatal for a row written before the
	 * rule landed, because nothing ever re-ran the gate over stored data.
	 *
	 * Replaying is the same repair SequenceRepository::repair_stage_regions()
	 * performs for one sequence on author request; this applies it to every row
	 * once, unattended, so no stored sequence stays a fatal waiting for the first
	 * read that happens to touch its regions.
	 *
	 * A row that cannot be normalized is recorded for the admin notice and left
	 * exactly as stored, rather than skipped in silence: it keeps no regions and
	 * stays fatal on read, so it is the one row an operator most needs named.
	 *
	 * A row is only ever LEFT as stored, never half-written, and the loop moves on
	 * to the next one: a rejection here must not abort the migration. run_migrations()
	 * turns any Throwable out of a migration body into a RuntimeException and stops,
	 * and install() bumps the version option only after run_migrations() returns — so
	 * a throw would leave the version behind and re-run the whole replay on every
	 * subsequent request. The per-row `continue` below is what keeps that from
	 * happening; run_migrations() itself has no per-entry tolerance.
	 *
	 * On a site that has run NEITHER version, both passes run in the same request,
	 * in ascending order, and a row the 2.17.0 pass rejects is reported twice: once
	 * as an `error_log` line and an error record, and then — moments later, in the
	 * 2.19.0 pass — as a repaired row whose record REPLACES the error one, because
	 * record_sequence_needing_review() merges by sequence id. The end state is the
	 * repaired row and the repaired record; the intermediate error record never
	 * reaches an admin, because nothing renders the notice mid-upgrade. The log line
	 * does survive, which is the honest trace of what the upgrade found.
	 *
	 * Idempotent: the gate is a pure normalization, so a second replay of an
	 * already-normalized config produces byte-identical JSON and the row is skipped.
	 *
	 * Each write is conditional on the row still holding the config this pass read
	 * (see write_normalized_config()). The upgrade runs on `init`, so a REST save can
	 * land between the read and the write; an unconditional write by id would put
	 * the pre-save config back and lose that save. A row that changed is read again
	 * and normalized from what it holds now, once. A row that changes again is
	 * logged and recorded for review, and the loop moves on.
	 *
	 * @since 0.0.1
	 *
	 * @param bool $collapse_duplicate_transitions Whether a row the gate rejects gets
	 *                                            the duplicate-target collapse — the
	 *                                            one repair that rewrites an author's
	 *                                            transitions — before it is given up
	 *                                            on.
	 *
	 *                                            2.17.0 leaves it off. NOT because
	 *                                            that reproduces what 2.17.0 did as
	 *                                            released: it cannot. The gate a
	 *                                            migration replays is always current
	 *                                            code, and 2.17.0 as released (see git
	 *                                            history) shipped a gate without the
	 *                                            one-transition-per-target rule, so a
	 *                                            row carrying that shape migrated
	 *                                            cleanly under it and is rejected by
	 *                                            the 2.17.0 pass today no matter what
	 *                                            this flag says. It is off so that a
	 *                                            repair which removes an edge the
	 *                                            author drew happens exactly ONCE, in
	 *                                            2.19.0, where the review record that
	 *                                            names the change is written — rather
	 *                                            than in a pass that predates the
	 *                                            report and would leave an author with
	 *                                            a reshaped sequence and nothing
	 *                                            telling them so.
	 *
	 *                                            2.19.0 turns it on, which is the only
	 *                                            way it reaches an install that has
	 *                                            already run 2.17.0.
	 */
	private static function replay_stored_stage_configs( bool $collapse_duplicate_transitions ): void {
		global $wpdb;

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			"SELECT id, name, slug, type, config FROM {$wpdb->prefix}vip_sequences WHERE type != 'phase'"
		);

		foreach ( (array) $rows as $row ) {
			$encoded = self::normalize_stored_row( $row, $collapse_duplicate_transitions );

			if ( null === $encoded || self::write_normalized_config( $row, $encoded ) ) {
				continue;
			}

			// The row changed after it was read: a save landed in between. Read it
			// again and normalize what it holds now, so the save is kept and the
			// cleanup still applies to it.
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$current = $wpdb->get_row(
				$wpdb->prepare(
					"SELECT id, name, slug, type, config FROM {$wpdb->prefix}vip_sequences WHERE id = %d", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
					(int) $row->id
				)
			);

			if ( null === $current ) {
				// Deleted in between. There is nothing left to clean or to review.
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Sequence %d ("%s") was deleted while the upgrade was normalizing it; nothing was written.', (int) $row->id, (string) $row->slug ) );
				continue;
			}

			$encoded = self::normalize_stored_row( $current, $collapse_duplicate_transitions );

			if ( null === $encoded || self::write_normalized_config( $current, $encoded ) ) {
				continue;
			}

			// It changed again. Leave it as the latest save wrote it, and name it
			// for review rather than retrying without end or overwriting a save.
			self::record_sequence_needing_review(
				self::unrepairable_record( (int) $current->id, (string) $current->name, 'It changed while the upgrade was updating it, so the upgrade left it as it was. Check it in the Sequence editor.' )
			);

			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot normalize sequence %d ("%s"): it changed twice while the upgrade was writing it. It was left as last saved and recorded for review.', (int) $current->id, (string) $current->slug ) );
		}

		// Direct SQL bypassed the repository, so its cached reads would otherwise
		// keep serving the pre-migration configs.
		wp_cache_flush_group( SequenceRepository::CACHE_GROUP );
	}

	/**
	 * Normalize one stored sequence row, and say what to write.
	 *
	 * Records and logs what the row needs reviewed as it goes, exactly as the
	 * replay always has. Recording happens before any write, so a run that dies
	 * between the two still names the sequence.
	 *
	 * @since 0.0.1
	 *
	 * @param  object $row                            Row with id, name, slug, type and config.
	 * @param  bool   $collapse_duplicate_transitions See replay_stored_stage_configs().
	 * @return string|null The normalized JSON to store, or null when nothing is
	 *                     written: the row could not be normalized (and was
	 *                     recorded), or it is already normalized.
	 */
	private static function normalize_stored_row( object $row, bool $collapse_duplicate_transitions ): ?string {
		$config = json_decode( (string) $row->config, true );

		if ( ! is_array( $config ) ) {
			// Unparseable stored JSON is beyond the gate's reach. Recorded and
			// moved past: throwing here would abort the migration and re-run it
			// on every subsequent request, and skipping in silence would leave
			// an operator with a sequence that is broken and never mentioned.
			self::record_sequence_needing_review(
				self::unrepairable_record( (int) $row->id, (string) $row->name, 'The stored configuration is not valid JSON.' )
			);

			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Cannot normalize sequence %d ("%s"): its stored config is not valid JSON.', (int) $row->id, (string) $row->slug ) );
			return null;
		}

		$config = self::drop_core_status_transition_targets( $config, (int) $row->id, (string) $row->slug );
		$config = self::drop_retired_transition_inputs( $config, (int) $row->id, (string) $row->slug );

		$assigned = self::assign_regions_from_legacy_flags( $config, (int) $row->id, (string) $row->slug );
		$config   = $assigned['config'];

		$repair = array( 'dropped' => array() );

		try {
			$normalized = Sequence::prepare_config_for_write( $config, (string) $row->type );
		} catch ( \InvalidArgumentException $rejected ) {
			// Malformed beyond normalization (duplicate stage keys, a dangling
			// transition target, two checkpoints in one region). Only the author
			// can resolve those in the Sequence editor.
			//
			// The row is left exactly as stored — which means it keeps no
			// regions and stays fatal on read — so it is recorded for the admin
			// notice rather than logged and forgotten. A repair that goes silent
			// about the rows it could not repair is the silent behavior this
			// whole migration exists to end.
			if ( ! $collapse_duplicate_transitions ) {
				self::record_sequence_needing_review(
					self::unrepairable_record( (int) $row->id, (string) $row->name, $rejected->getMessage() )
				);

				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot normalize sequence %d ("%s"); it needs manual repair in the Sequence editor: %s', (int) $row->id, (string) $row->slug, $rejected->getMessage() ) );
				return null;
			}

			// One gate rule has an inferable repair, and it was added after these
			// rows were written: a second transition to a target the stage already
			// reaches collapses onto the first. That is not a guess — the target
			// stays reachable either way — and it is reported below rather than
			// applied quietly.
			try {
				$repair     = Sequence::collapse_duplicate_transitions( $config, (string) $row->type );
				$normalized = Sequence::prepare_config_for_write( $repair['config'], (string) $row->type );
			} catch ( \InvalidArgumentException $unrepairable ) {
				self::record_sequence_needing_review(
					self::unrepairable_record( (int) $row->id, (string) $row->name, $unrepairable->getMessage() )
				);

				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot normalize sequence %d ("%s"); it needs manual repair in the Sequence editor: %s', (int) $row->id, (string) $row->slug, $unrepairable->getMessage() ) );
				return null;
			}

			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Sequence %d ("%s"): removed %d transition(s) that would have left a stage holding two to one target. Originally rejected as: %s', (int) $row->id, (string) $row->slug, count( $repair['dropped'] ), $rejected->getMessage() ) );
		}

		// A sequence whose regions were inferred rather than declared, or whose
		// transitions had to be removed, needs a human to confirm the result.
		// Recorded so the admin notice can name it — the migration silently
		// reshaping a workflow would be the same broken promise this repair
		// exists to end.
		//
		// Recorded before the write, and independent of whether the row actually
		// changed, so a re-run after a partial failure still reports every
		// affected sequence. This stays idempotent on its own terms: once a row
		// carries regions and one transition per target, nothing is inferred or
		// removed, so an already-migrated row contributes nothing and a dismissed
		// notice does not come back.
		if ( ! empty( $assigned['defaulted'] ) || ! empty( $repair['dropped'] ) ) {
			self::record_sequence_needing_review(
				array(
					'id'              => (int) $row->id,
					'name'            => (string) $row->name,
					'stage_keys'      => $assigned['defaulted'],
					'reaches_publish' => self::config_reaches_publish_region( $normalized ),
					'dropped'         => $repair['dropped'],
					'error'           => null,
				)
			);
		}

		$encoded = wp_json_encode( $normalized );

		if ( false === $encoded || $encoded === $row->config ) {
			return null;
		}

		return $encoded;
	}

	/**
	 * Store a normalized config, only if the row still holds the config that was read.
	 *
	 * The comparison is on HEX(config) rather than `config = %s`. The column uses
	 * the site collation, which is usually case-insensitive, so a plain comparison
	 * treats a save that only changed a label's case as no change and overwrites
	 * it. HEX() compares the stored bytes, and works on MySQL and on SQLite.
	 *
	 * Callers skip rows that need no change, so the new config always differs from
	 * the one read. Zero affected rows therefore means the WHERE did not match: the
	 * row changed or was deleted. It never means "nothing to change".
	 *
	 * @since 0.0.1
	 *
	 * @param  object $row     The row as read, with id and config.
	 * @param  string $encoded The normalized config JSON to store.
	 * @return bool True when the row was written; false when it changed after it was read.
	 * @throws \RuntimeException When the update query fails.
	 */
	private static function write_normalized_config( object $row, string $encoded ): bool {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$affected = $wpdb->query(
			$wpdb->prepare(
				"UPDATE {$wpdb->prefix}vip_sequences SET config = %s, updated_at = %s WHERE id = %d AND HEX(config) = %s", // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
				$encoded,
				current_time( 'mysql' ),
				(int) $row->id,
				strtoupper( bin2hex( (string) $row->config ) )
			)
		);

		if ( false === $affected ) {
			throw new \RuntimeException( esc_html( sprintf( 'Could not update sequence %d: %s', (int) $row->id, (string) $wpdb->last_error ) ) );
		}

		return $affected > 0;
	}

	/**
	 * A review record for a row the replay could not normalize at all.
	 *
	 * Nothing was written, so there are no inferred stages and no removed transitions
	 * to report: the row still has whatever it was stored with, which is why `error`
	 * is the whole record.
	 *
	 * @since 0.0.1
	 *
	 * @param  int    $id    Sequence ID.
	 * @param  string $name  Sequence name, so an admin can find it.
	 * @param  string $error Why the row could not be normalized.
	 * @return array
	 */
	private static function unrepairable_record( int $id, string $name, string $error ): array {
		return array(
			'id'              => $id,
			'name'            => $name,
			'stage_keys'      => array(),
			'reaches_publish' => false,
			'dropped'         => array(),
			'error'           => $error,
		);
	}

	/**
	 * Record one sequence for the admin notice, as soon as it is known.
	 *
	 * Written per row rather than accumulated and saved once after the loop: a run
	 * that dies partway through has still named every sequence it reached, and the
	 * migration runner re-runs the whole entry on the next request, which would
	 * otherwise be a second attempt that reports only what the first one never got
	 * to.
	 *
	 * Merged by sequence id rather than appended, so a re-run — or a later replay
	 * that repairs what an earlier one could only report — replaces that sequence's
	 * record instead of listing it twice, and never discards the records another
	 * pass wrote for other sequences.
	 *
	 * A row that needs no record writes nothing at all, so a notice an admin has
	 * dismissed does not come back.
	 *
	 * @since 0.0.1
	 *
	 * @param array $record One review record, keyed by its `id`.
	 */
	private static function record_sequence_needing_review( array $record ): void {
		$records = array();

		foreach ( (array) get_option( self::REGION_REVIEW_OPTION, array() ) as $existing ) {
			if ( is_array( $existing ) && (int) ( $existing['id'] ?? 0 ) === (int) $record['id'] ) {
				continue;
			}

			$records[] = $existing;
		}

		$records[] = $record;

		update_option( self::REGION_REVIEW_OPTION, $records, false );
	}

	/**
	 * Replace `ucfirst( $stage_key )` stage labels in the audit trail with real labels.
	 *
	 * Extracted from the 2.18.0 migration so the repair is directly testable.
	 *
	 * @since 0.0.1
	 *
	 * @return int Number of event rows rewritten.
	 */
	protected static function repair_fabricated_stage_labels(): int {
		global $wpdb;

		$events_table    = self::get_table_name( 'workflows_events' );
		$sequences_table = $wpdb->prefix . 'vip_sequences';

		// `_` is a single-character LIKE wildcard, so this only narrows the scan;
		// every candidate is re-verified exactly in PHP below.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
		$sql = "SELECT id, event_data FROM {$events_table}
			WHERE event_type = 'status_transition'
			AND ( event_data LIKE '%\"from_label\":\"Status_%' OR event_data LIKE '%\"to_label\":\"Status_%' )";

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results( $sql );

		if ( empty( $rows ) ) {
			return 0;
		}

		// Sequences are keyed by name because that is the only sequence identity a
		// `status_transition` row carries. A name shared by more than one sequence
		// cannot identify one, so it resolves to nothing and those rows are skipped.
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$sequence_rows = $wpdb->get_results( "SELECT name, config FROM {$sequences_table}" );

		$labels_by_name = array();
		$ambiguous      = array();

		foreach ( (array) $sequence_rows as $sequence_row ) {
			$name = (string) $sequence_row->name;

			if ( isset( $labels_by_name[ $name ] ) || isset( $ambiguous[ $name ] ) ) {
				unset( $labels_by_name[ $name ] );
				$ambiguous[ $name ] = true;
				continue;
			}

			$config = json_decode( (string) $sequence_row->config, true );
			if ( ! is_array( $config ) || ! isset( $config['statuses'] ) || ! is_array( $config['statuses'] ) ) {
				continue;
			}

			$stage_labels = array();
			foreach ( $config['statuses'] as $stage ) {
				if ( isset( $stage['key'], $stage['label'] ) && '' !== $stage['label'] ) {
					$stage_labels[ (string) $stage['key'] ] = (string) $stage['label'];
				}
			}

			$labels_by_name[ $name ] = $stage_labels;
		}

		$repaired = 0;

		foreach ( $rows as $row ) {
			$data = json_decode( (string) $row->event_data, true );

			if ( ! is_array( $data ) ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot repair stage labels on workflow event %d: its stored event_data is not valid JSON.', (int) $row->id ) );
				continue;
			}

			$sequence_name = (string) ( $data['sequence_name'] ?? '' );
			$stage_labels  = $labels_by_name[ $sequence_name ] ?? null;

			if ( null === $stage_labels ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot repair stage labels on workflow event %d: it names sequence "%s", which does not resolve to exactly one stored sequence.', (int) $row->id, $sequence_name ) );
				continue;
			}

			$changed = false;

			foreach ( array( 'from', 'to' ) as $side ) {
				$key_field   = $side . '_status';
				$label_field = $side . '_label';

				$stage_key = (string) ( $data[ $key_field ] ?? '' );
				$label     = $data[ $label_field ] ?? null;

				if ( ! is_string( $label ) || ! self::is_fabricated_stage_label( $stage_key, $label ) ) {
					continue;
				}

				if ( ! isset( $stage_labels[ $stage_key ] ) ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( sprintf( '[VIP Workflows] Cannot repair the %s stage label on workflow event %d: sequence "%s" no longer defines stage "%s".', $side, (int) $row->id, $sequence_name, $stage_key ) );
					continue;
				}

				if ( $stage_labels[ $stage_key ] === $label ) {
					continue;
				}

				$data[ $label_field ] = $stage_labels[ $stage_key ];
				$changed              = true;
			}

			if ( ! $changed ) {
				continue;
			}

			$encoded = wp_json_encode( $data );
			if ( false === $encoded ) {
				// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
				error_log( sprintf( '[VIP Workflows] Cannot repair stage labels on workflow event %d: its repaired event_data could not be encoded.', (int) $row->id ) );
				continue;
			}

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$wpdb->update(
				$events_table,
				array( 'event_data' => $encoded ),
				array( 'id' => (int) $row->id )
			);

			++$repaired;
		}

		return $repaired;
	}

	/**
	 * Whether a stored stage label is the old `ucfirst( $stage_key )` fabrication.
	 *
	 * True only for a generated stage key (`status_<n>`, minted by the sequence
	 * editor) whose stored label is exactly that key with its first character
	 * upper-cased. Anything else is treated as an author-written label and left
	 * alone — history is immutable, and a real snapshot must survive a rename.
	 *
	 * @since 0.0.1
	 *
	 * @param  string $stage_key Stage key recorded on the event.
	 * @param  string $label     Label recorded on the event.
	 * @return bool
	 */
	private static function is_fabricated_stage_label( string $stage_key, string $label ): bool {
		if ( ! preg_match( '/^status_\d+$/', $stage_key ) ) {
			return false;
		}

		return ucfirst( $stage_key ) === $label;
	}

	/**
	 * Supply a `status` region for stages that declare none, from evidence in the row.
	 *
	 * The write gate defaults an absent region to `draft`. On its own that is a
	 * silent behavior change for a pre-matrix sequence: its publishing stage lands in
	 * the draft region, so transitioning to it no longer crosses a region boundary,
	 * no post_status is written, and the post stays a draft with no error. The
	 * default sequence's Publish step would quietly stop publishing.
	 *
	 * So the region is derived first, wherever the row actually proves it, and the
	 * gate's default is left to cover only what cannot be proven.
	 *
	 * The one reliable marker is the legacy `publish` flag. Back when a stage WAS a
	 * post status it meant "this stage publishes the post", and sequence 32 — the
	 * only stored row that carries explicit regions — confirms the mapping: its sole
	 * `publish: true` stage is exactly its sole `publish`-region stage.
	 *
	 * Flags deliberately NOT used:
	 *
	 * - `is_terminal` marks the end of a pipeline, not publication. A hiring sequence
	 *   ends at both `hired` and `rejected`; a scouting sequence at both `drafted`
	 *   (which does carry `publish`) and `passed` (a rejection). Promoting on
	 *   terminality would publish posts that were declined.
	 * - `show_in_queue` is a claim-queue UI concern. It appears on `review` in a
	 *   pending region and on `screening`/`interview` in a hiring pipeline that never
	 *   publishes — no consistent region meaning.
	 * - `is_initial` / `is_in_progress` describe position and reporting, not region.
	 *
	 * Stage names, labels and ordering are never consulted. `review` and `ready` look
	 * like `pending` candidates and may well be, but nothing in the row says so, and
	 * guessing workflow semantics is worse than a conservative default a human can
	 * correct — provided the human is told, which is what the returned `defaulted`
	 * list is for.
	 *
	 * A stage that already declares a region is left untouched: this only ever
	 * supplies a region where none was declared, so an author's explicit choice can
	 * never be overridden.
	 *
	 * @param  array  $config Stored sequence config.
	 * @param  int    $id     Sequence ID, for logging.
	 * @param  string $slug   Sequence slug, for logging.
	 * @return array{config: array, promoted: string[], defaulted: string[]}
	 */
	private static function assign_regions_from_legacy_flags( array $config, int $id, string $slug ): array {
		$promoted  = array();
		$defaulted = array();

		if ( empty( $config['statuses'] ) || ! is_array( $config['statuses'] ) ) {
			return array(
				'config'    => $config,
				'promoted'  => $promoted,
				'defaulted' => $defaulted,
			);
		}

		foreach ( $config['statuses'] as &$stage ) {
			if ( ! is_array( $stage ) ) {
				continue;
			}

			// "Declares no region" must match the write gate's own definition of
			// absent — no key, null, or the empty string — so this helper and the
			// gate never disagree about which stages need a region.
			$declares_region = array_key_exists( 'status', $stage )
				&& null !== $stage['status']
				&& '' !== $stage['status'];

			if ( $declares_region ) {
				continue;
			}

			$key = (string) ( $stage['key'] ?? '' );

			if ( ! empty( $stage['publish'] ) ) {
				$stage['status'] = 'publish';
				$promoted[]      = $key;
				continue;
			}

			$defaulted[] = $key;
		}
		unset( $stage );

		if ( ! empty( $promoted ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Sequence %d ("%s"): seated stage(s) "%s" in the publish region, proven by their legacy publish flag.', $id, $slug, implode( '", "', $promoted ) ) );
		}

		if ( ! empty( $defaulted ) ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log(
				sprintf(
					'[VIP Workflows] Sequence %d ("%s"): stage(s) "%s" declared no status region and nothing in the stored config proves one, so they were seated in the least-privileged "draft" region. Review them in the Sequence editor — any stage that should submit for review belongs in "pending", and any that publishes belongs in "publish".',
					$id,
					$slug,
					implode( '", "', $defaulted )
				)
			);
		}

		return array(
			'config'    => $config,
			'promoted'  => $promoted,
			'defaulted' => $defaulted,
		);
	}

	/**
	 * Whether a normalized config has any stage in the publish region.
	 *
	 * A sequence with none cannot publish: no transition inside it crosses into the
	 * publish region, so no post_status write ever happens. Recorded per sequence so
	 * the admin notice can say which ones lost the ability.
	 *
	 * @param  array $config Normalized sequence config.
	 * @return bool
	 */
	private static function config_reaches_publish_region( array $config ): bool {
		foreach ( (array) ( $config['statuses'] ?? array() ) as $stage ) {
			if ( is_array( $stage ) && 'publish' === ( $stage['status'] ?? '' ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Drop transition targets that name a core post status rather than a stage.
	 *
	 * Before stage was decoupled from post_status, a stage key WAS a post status,
	 * so "Schedule" was modelled as a transition to `future` and publishing as a
	 * transition to `publish`. Under the stage x status matrix those values are
	 * regions and overlays, never stages: `future` is core-owned "in transit" and
	 * cannot be a destination the author picks.
	 *
	 * Such a target is already unreachable — Sequence::get_stage_status() has
	 * nothing to resolve for it, so offering the transition fatals — and
	 * prepare_config_for_write() rightly rejects it as dangling. That rejection
	 * would leave these rows unmigrated and still latently fatal, so the remnant is
	 * removed here, ahead of the gate.
	 *
	 * Deliberately narrow: only a target that is BOTH undefined as a stage in this
	 * same config AND one of the core statuses the matrix models is dropped. A
	 * dangling target that is anything else is a typo or a deleted stage — possibly
	 * a lost destination the author still wants — and is left for the gate to
	 * reject so a human decides.
	 *
	 * @param  array  $config Stored sequence config.
	 * @param  int    $id     Sequence ID, for logging.
	 * @param  string $slug   Sequence slug, for logging.
	 * @return array Config with legacy core-status targets removed.
	 */
	private static function drop_core_status_transition_targets( array $config, int $id, string $slug ): array {
		if ( empty( $config['statuses'] ) || ! is_array( $config['statuses'] ) ) {
			return $config;
		}

		$core_statuses = array_merge( Sequence::EDITORIAL_STATUSES, Sequence::OVERLAY_STATUSES );

		$defined = array();
		foreach ( $config['statuses'] as $stage ) {
			if ( is_array( $stage ) && isset( $stage['key'] ) && is_string( $stage['key'] ) ) {
				$defined[ sanitize_key( $stage['key'] ) ] = true;
			}
		}

		foreach ( $config['statuses'] as &$stage ) {
			if ( ! is_array( $stage ) || empty( $stage['transitions'] ) || ! is_array( $stage['transitions'] ) ) {
				continue;
			}

			$kept = array();
			foreach ( $stage['transitions'] as $transition ) {
				if ( ! is_array( $transition ) || ! isset( $transition['to'] ) || ! is_string( $transition['to'] ) ) {
					// Malformed shape — leave it for the gate to reject loudly.
					$kept[] = $transition;
					continue;
				}

				$to = sanitize_key( $transition['to'] );

				if ( ! isset( $defined[ $to ] ) && in_array( $to, $core_statuses, true ) ) {
					// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
					error_log( sprintf( '[VIP Workflows] Sequence %d ("%s"): dropped the legacy transition from stage "%s" to core status "%s", which is a status region or overlay rather than a stage.', $id, $slug, (string) ( $stage['key'] ?? '' ), $to ) );
					continue;
				}

				$kept[] = $transition;
			}

			$stage['transitions'] = $kept;
		}
		unset( $stage );

		return $config;
	}

	/**
	 * Drop the capture inputs a transition no longer collects, and log each drop.
	 *
	 * The cleanup itself is Sequence::drop_retired_note_inputs(), shared with
	 * import so an old stored row and an old exported file upgrade the same way.
	 * It removes only the known retired note types (`textarea`, `text`). Every
	 * replay runs this, so earlier replays on a fresh upgrade do not reject a
	 * note-bearing row either.
	 *
	 * An input of any other non-assignment type, or one with no type, is left in
	 * place: the gate then refuses the row, and the replay records it for the
	 * sequences-needing-review notice like any other row it cannot normalize.
	 *
	 * @param  array  $config Stored sequence config.
	 * @param  int    $id     Sequence ID, for logging.
	 * @param  string $slug   Sequence slug, for logging.
	 * @return array Config with every retired note input removed.
	 */
	private static function drop_retired_transition_inputs( array $config, int $id, string $slug ): array {
		$result = Sequence::drop_retired_note_inputs( $config );

		foreach ( $result['dropped'] as $drop ) {
			// phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
			error_log( sprintf( '[VIP Workflows] Sequence %d ("%s"): dropped %d retired capture input(s) from the transition on stage "%s" to "%s"; a transition captures only an assignment.', $id, $slug, $drop['count'], $drop['from'], $drop['to'] ) );
		}

		return $result['config'];
	}

	/**
	 * Create all database tables.
	 */
	private function create_tables(): void {
		global $wpdb;

		$charset_collate = $wpdb->get_charset_collate();

		include_once ABSPATH . 'wp-admin/includes/upgrade.php';

		// Sequences table (supports workflow and phase sequences).
		$sql = "CREATE TABLE {$wpdb->prefix}vip_sequences (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			uuid char(36) NOT NULL,
			type varchar(20) NOT NULL DEFAULT 'workflow',
			name varchar(255) NOT NULL,
			slug varchar(255) NOT NULL,
			description text,
			version int(10) unsigned NOT NULL DEFAULT 1,
			status varchar(20) NOT NULL DEFAULT 'draft',
			config longtext NOT NULL,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY uuid (uuid),
			UNIQUE KEY type_slug_version (type, slug, version),
			KEY status (status),
			KEY type (type),
			KEY created_by (created_by)
		) $charset_collate;";
		dbDelta( $sql );

		// Workflow Roles table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_workflows_roles (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			role_key varchar(100) NOT NULL,
			display_name varchar(255) NOT NULL,
			description text,
			capabilities longtext,
			metadata longtext,
			PRIMARY KEY (id),
			UNIQUE KEY role_key (role_key)
		) $charset_collate;";
		dbDelta( $sql );

		// Workflow Desks table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_workflows_desks (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			name varchar(255) NOT NULL,
			slug varchar(255) NOT NULL,
			description text,
			parent_id bigint(20) unsigned DEFAULT NULL,
			metadata longtext,
			PRIMARY KEY (id),
			UNIQUE KEY slug (slug),
			KEY parent_id (parent_id)
		) $charset_collate;";
		dbDelta( $sql );

		// User-to-Desk mapping table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_workflows_user_desks (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			desk_id bigint(20) unsigned NOT NULL,
			role_key varchar(100) DEFAULT NULL,
			PRIMARY KEY (id),
			UNIQUE KEY user_desk (user_id, desk_id),
			KEY desk_id (desk_id)
		) $charset_collate;";
		dbDelta( $sql );

		// Workflow Events table (audit log for posts).
		$sql = "CREATE TABLE {$wpdb->prefix}vip_workflows_events (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			post_id bigint(20) unsigned DEFAULT NULL,
			event_type varchar(100) NOT NULL,
			event_data longtext,
			actor_id bigint(20) unsigned DEFAULT NULL,
			actor_type varchar(20) NOT NULL DEFAULT 'user',
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY post_id (post_id),
			KEY event_type (event_type),
			KEY actor_id (actor_id),
			KEY created_at (created_at),
			KEY post_event (post_id, event_type)
		) $charset_collate;";
		dbDelta( $sql );

		// Notifications table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_workflows_notifications (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			user_id bigint(20) unsigned NOT NULL,
			post_id bigint(20) unsigned DEFAULT NULL,
			type varchar(50) NOT NULL,
			title varchar(255) NOT NULL,
			message text NOT NULL,
			data longtext,
			is_read tinyint(1) NOT NULL DEFAULT 0,
			created_at datetime NOT NULL,
			read_at datetime DEFAULT NULL,
			PRIMARY KEY (id),
			KEY user_id (user_id),
			KEY post_id (post_id),
			KEY type (type),
			KEY is_read (is_read),
			KEY created_at (created_at)
		) $charset_collate;";
		dbDelta( $sql );

		// Ability results table (execution history).
		$sql = "CREATE TABLE {$wpdb->prefix}vip_ability_results (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			ability_id varchar(100) NOT NULL,
			post_id bigint(20) unsigned DEFAULT NULL,
			success tinyint(1) NOT NULL DEFAULT 1,
			summary text,
			result_data longtext,
			duration_ms int(10) unsigned DEFAULT 0,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY ability_id (ability_id),
			KEY post_id (post_id),
			KEY created_at (created_at)
		) $charset_collate;";
		dbDelta( $sql );

		// Ideation Sources table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_ideation_sources (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			project_id bigint(20) unsigned NOT NULL,
			source_id varchar(20) NOT NULL,
			url varchar(2048) DEFAULT NULL,
			title varchar(500) DEFAULT NULL,
			domain varchar(255) DEFAULT NULL,
			favicon varchar(500) DEFAULT NULL,
			image varchar(500) DEFAULT NULL,
			published_at datetime DEFAULT NULL,
			author varchar(255) DEFAULT NULL,
			excerpt text,
			content longtext,
			is_trusted tinyint(1) NOT NULL DEFAULT 0,
			source_type varchar(20) NOT NULL DEFAULT 'article',
			origin varchar(20) NOT NULL DEFAULT 'search',
			ability_id varchar(100) DEFAULT NULL,
			group_id varchar(100) DEFAULT NULL,
			search_query varchar(500) DEFAULT NULL,
			attachment_id bigint(20) unsigned DEFAULT NULL,
			file_type varchar(100) DEFAULT NULL,
			file_size bigint(20) unsigned DEFAULT NULL,
			processing_status varchar(20) DEFAULT NULL,
			tags text,
			notes text,
			ai_analysis longtext,
			added_by bigint(20) unsigned NOT NULL,
			added_at datetime NOT NULL,
			updated_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY project_id (project_id),
			KEY domain (domain),
			KEY is_trusted (is_trusted),
			KEY source_type (source_type),
			KEY origin (origin),
			KEY ability_id (ability_id),
			KEY added_at (added_at),
			UNIQUE KEY project_source (project_id, source_id)
		) $charset_collate;";
		dbDelta( $sql );

		// Ideation Analyses table (AI tool outputs).
		$sql = "CREATE TABLE {$wpdb->prefix}vip_ideation_analyses (
			id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
			project_id bigint(20) unsigned NOT NULL,
			tool_type varchar(50) NOT NULL,
			query text,
			source_ids text,
			result longtext NOT NULL,
			tokens_used int(10) unsigned DEFAULT NULL,
			created_by bigint(20) unsigned NOT NULL,
			created_at datetime NOT NULL,
			PRIMARY KEY (id),
			KEY project_id (project_id),
			KEY tool_type (tool_type),
			KEY created_at (created_at)
		) $charset_collate;";
		dbDelta( $sql );

		// Story-to-object join table.
		$sql = "CREATE TABLE {$wpdb->prefix}vip_story_objects (
			story_id bigint(20) unsigned NOT NULL,
			object_id bigint(20) unsigned NOT NULL,
			object_type varchar(20) NOT NULL,
			added_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (story_id, object_id),
			KEY object_lookup (object_id),
			KEY story_type (story_id, object_type)
		) $charset_collate;";
		dbDelta( $sql );
	}

	/**
	 * Get table name with prefix.
	 *
	 * @param  string $table Base table name without prefix.
	 * @return string Full table name with prefix.
	 */
	public static function get_table_name( string $table ): string {
		global $wpdb;
		return $wpdb->prefix . 'vip_' . $table;
	}

	/**
	 * Get all table names owned by this plugin.
	 *
	 * @return array Full table names with prefix.
	 */
	public static function get_owned_tables(): array {
		global $wpdb;

		return array(
			$wpdb->prefix . 'vip_ability_results',
			$wpdb->prefix . 'vip_workflows_notifications',
			$wpdb->prefix . 'vip_workflows_events',
			$wpdb->prefix . 'vip_workflows_user_desks',
			$wpdb->prefix . 'vip_workflows_desks',
			$wpdb->prefix . 'vip_workflows_roles',
			$wpdb->prefix . 'vip_sequences',
			$wpdb->prefix . 'vip_ideation_sources',
			$wpdb->prefix . 'vip_ideation_analyses',
			$wpdb->prefix . 'vip_story_objects',
		);
	}

	/**
	 * Drop all plugin tables.
	 * Use with caution - this deletes all data!
	 */
	public function uninstall(): void {
		global $wpdb;

		foreach ( self::get_owned_tables() as $table_name ) {
			$wpdb->query( "DROP TABLE IF EXISTS {$table_name}" ); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared, WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching, WordPress.DB.DirectDatabaseQuery.SchemaChange -- uninstall drops each plugin-owned table; one-off, nothing to cache
		}

		delete_option( self::VERSION_OPTION );
	}
}
