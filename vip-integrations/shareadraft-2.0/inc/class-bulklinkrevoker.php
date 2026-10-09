<?php

namespace Automattic\ShareADraft;

/**
 * Coordinates the bulk revokes: every link on the site (break-glass), or every
 * link one user created (offboarding).
 *
 * Both act on the whole set, not a visible page, and both stamp `revoked_at` on
 * each canonical row — the row stays the source of truth, {@see AccessPolicy}
 * keeps reading only the link's own state, and the gate can still show the
 * friendly "this link was revoked" page. There is no out-of-band kill-flag.
 *
 * A sweep reuses the garbage collector's post-ID cursor: bounded batches, and a
 * scheduled continuation when a site overflows one run. While a sweep runs,
 * links on not-yet-swept posts still work for a short window — an accepted
 * trade rather than an oversight.
 *
 * Offboarding is default-on for hard deletion only (`deleted_user`). Role
 * changes are deliberately not automatic — demoting an editor should not
 * necessarily kill in-flight reviews — but customers can wire any hook to the
 * `shareadraft_revoke_user_links` action; see the README recipe.
 */
final class BulkLinkRevoker {
	/** Continuation hook for a sweep too large to finish in one run. */
	public const HOOK = 'shareadraft_bulk_revoke';

	/**
	 * Command action: fire it with a user ID to revoke every link they created.
	 * The supported extension point for custom offboarding (role changes,
	 * multisite removal, and so on).
	 */
	public const REVOKE_USER_ACTION = 'shareadraft_revoke_user_links';

	/** Event action fired after a user's links have all been revoked. */
	public const REVOKED_USER_ACTION = 'shareadraft_revoked_user_links';

	/** Queue of unfinished sweeps, oldest first. */
	private const JOBS_OPTION = 'shareadraft_bulk_revoke_jobs';

	/** Posts examined per run; mirrors the garbage collector's batch size. */
	private const BATCH_SIZE = 100;

	private PreviewLinkService $service;

	public function __construct( PreviewLinkService $service ) {
		$this->service = $service;
	}

	public function register(): void {
		// @phpstan-ignore return.void (The count is for callers and tests; WordPress discards an action's return value.)
		add_action( self::HOOK, [ $this, 'run' ] );

		// Offboarding hygiene: a hard-deleted user's links stop working.
		add_action( 'deleted_user', [ $this, 'handle_user_hook' ] );

		// The documented extension point for customer-wired offboarding.
		add_action( self::REVOKE_USER_ACTION, [ $this, 'handle_user_hook' ] );
	}

	/**
	 * Remove the continuation event. Called on deactivation.
	 *
	 * The queue itself is kept: a half-finished sweep has left live links on the
	 * posts it hadn't reached, so {@see BulkLinkRevoker::reschedule()} resumes it
	 * on reactivation. Uninstalling the plugin is what deletes it.
	 *
	 * @param bool $_network_wide Passed by register_deactivation_hook; unused.
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Signature is dictated by register_deactivation_hook, which passes the network flag.
	public static function unschedule( bool $_network_wide = false ): void {
		wp_clear_scheduled_hook( self::HOOK );
	}

	/**
	 * Re-arm the continuation for a sweep that deactivation interrupted. Called
	 * on activation.
	 *
	 * @param bool $_network_wide Passed by register_activation_hook; unused.
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Signature is dictated by register_activation_hook, which passes the network flag.
	public static function reschedule( bool $_network_wide = false ): void {
		if ( false !== get_option( self::JOBS_OPTION ) && false === wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + MINUTE_IN_SECONDS, self::HOOK );
		}
	}

	/**
	 * Revoke every link a user created, from any user-lifecycle hook. Accepts
	 * whatever the hook passes and acts only on a usable ID.
	 *
	 * @param mixed $user_id The user whose links should stop working.
	 */
	public function handle_user_hook( $user_id ): void {
		if ( is_numeric( $user_id ) && (int) $user_id > 0 ) {
			$this->revoke_by_creator( (int) $user_id );
		}
	}

	/**
	 * Revoke every live link on the site. The break-glass switch for incident
	 * response: callers gate it hard ({@see PreviewLinksAdminPage} requires
	 * `manage_options` plus a confirmation).
	 *
	 * @return int Links revoked in this run; a sweep too large for one run
	 *             continues on cron.
	 */
	public function revoke_all(): int {
		return $this->start( null );
	}

	/**
	 * Revoke every link a given user created, across the whole site.
	 *
	 * @return int Links revoked in this run; a sweep too large for one run
	 *             continues on cron.
	 */
	public function revoke_by_creator( int $user_id ): int {
		return $this->start( $user_id );
	}

	/**
	 * Whether a sweep still has posts left to walk, so the UI can say "the rest
	 * are being revoked in the background" instead of implying it finished.
	 */
	public function has_pending_work(): bool {
		return [] !== $this->jobs();
	}

	private function start( ?int $creator ): int {
		$jobs   = $this->jobs();
		$jobs[] = [
			'id'      => wp_generate_uuid4(),
			'creator' => $creator,
			'cursor'  => 0,
			'count'   => 0,
			'actor'   => get_current_user_id(),
		];
		$this->save_jobs( $jobs );

		// ponytail: if another sweep was already mid-flight, this run advances
		// that one first and its count is what the caller sees; jobs are rare
		// enough that fairness beats bookkeeping.
		return $this->run();
	}

	/**
	 * Advance the oldest unfinished sweep by one batch of posts, scheduling a
	 * continuation if anything is left.
	 *
	 * The batch is slow, and other requests may queue sweeps (or finish this
	 * one) while it runs, so the queue is re-read afterwards and only this
	 * sweep's entry is touched.
	 *
	 * @return int Links revoked in this batch.
	 */
	public function run(): int {
		$jobs = $this->jobs();

		if ( [] === $jobs ) {
			return 0;
		}

		$job      = $jobs[0];
		$post_ids = $this->service->post_ids_with_links( $job['cursor'], self::BATCH_SIZE );
		$revoked  = 0;

		foreach ( $post_ids as $post_id ) {
			$revoked += null === $job['creator']
				? $this->service->revoke_all_for_post( $post_id )
				: $this->service->revoke_for_post_by_creator( $post_id, $job['creator'] );
		}

		$done = count( $post_ids ) < self::BATCH_SIZE;

		// ponytail: re-read-then-write narrows the race to the moment between
		// the two, not the whole batch; a lock if that window ever matters.
		$jobs  = $this->jobs();
		$index = array_search( $job['id'], array_column( $jobs, 'id' ), true );

		if ( false !== $index ) {
			$count = $jobs[ $index ]['count'] + $revoked;

			if ( $done ) {
				// Walked past the last post carrying links: this sweep is done.
				array_splice( $jobs, $index, 1 );
			} else {
				$entry           = $jobs[ $index ];
				$entry['cursor'] = max( $entry['cursor'], (int) end( $post_ids ) );
				$entry['count']  = $count;
				$jobs[ $index ]  = $entry;
			}

			$this->save_jobs( $jobs );

			if ( $done && null !== $job['creator'] ) {
				/**
				 * Fires after every link a user created has been revoked, so
				 * customers can log offboarding or extend it.
				 *
				 * @param int $user_id The user whose links were revoked.
				 * @param int $count   How many links were revoked.
				 * @param int $actor   Who initiated it (0 when system-initiated).
				 */
				do_action( self::REVOKED_USER_ACTION, $job['creator'], $count, $job['actor'] );
			}
		}

		if ( [] !== $jobs && false === wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_single_event( time() + MINUTE_IN_SECONDS, self::HOOK );
		}

		return $revoked;
	}

	/**
	 * The queued sweeps, oldest first, rebuilt defensively: a corrupt option must
	 * degrade to "no work", never fatal. An entry without an ID or a usable
	 * `creator` is dropped rather than read as a null creator, which would turn
	 * it into a revoke-all.
	 *
	 * @return list<array{id: string, creator: int|null, cursor: int, count: int, actor: int}>
	 */
	private function jobs(): array {
		/** @var mixed $stored */
		$stored = get_option( self::JOBS_OPTION, [] );

		if ( ! is_array( $stored ) ) {
			return [];
		}

		$jobs = [];

		/** @var mixed $job */
		foreach ( $stored as $job ) {
			if (
				! is_array( $job )
				|| ! isset( $job['id'] ) || ! is_string( $job['id'] )
				|| ! array_key_exists( 'creator', $job )
				|| ( null !== $job['creator'] && ! is_numeric( $job['creator'] ) )
			) {
				continue;
			}

			$jobs[] = [
				'id'      => $job['id'],
				'creator' => null === $job['creator'] ? null : (int) $job['creator'],
				'cursor'  => isset( $job['cursor'] ) && is_numeric( $job['cursor'] ) ? (int) $job['cursor'] : 0,
				'count'   => isset( $job['count'] ) && is_numeric( $job['count'] ) ? (int) $job['count'] : 0,
				'actor'   => isset( $job['actor'] ) && is_numeric( $job['actor'] ) ? (int) $job['actor'] : 0,
			];
		}

		return $jobs;
	}

	/**
	 * @param list<array{id: string, creator: int|null, cursor: int, count: int, actor: int}> $jobs
	 */
	private function save_jobs( array $jobs ): void {
		if ( [] === $jobs ) {
			delete_option( self::JOBS_OPTION );

			return;
		}

		update_option( self::JOBS_OPTION, $jobs, false );
	}
}
