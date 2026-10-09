<?php

namespace Automattic\ShareADraft;

/**
 * Prunes preview links that are finished with.
 *
 * Expired and revoked links are kept on purpose for a while: the gate reads them
 * to tell a visitor "this link has expired" rather than dumping them at a 404,
 * which is worth a lot when a reviewer's link goes stale mid-review. Past that
 * grace period they are just rows, one per link, on every post that ever had one.
 *
 * Sweeping them needs the one thing the repository deliberately avoids on the
 * request path: a cross-post query. Doing it here keeps that cost on a cron job,
 * in bounded batches, walking a post-ID cursor so a large site is swept across
 * several runs instead of one query that times out.
 */
final class LinkGarbageCollector {
	public const HOOK = 'shareadraft_prune_links';

	/** Where the last sweep got to, so the next run resumes rather than restarts. */
	private const CURSOR_OPTION = 'shareadraft_gc_cursor';

	/**
	 * When a sweep last ran. Nothing in the sweep needs it; it exists so
	 * {@see SiteHealth} can tell "scheduled" apart from "actually running".
	 */
	private const LAST_RUN_OPTION = 'shareadraft_gc_last_run';

	/** Posts examined per run. Small enough to finish well inside a cron slot. */
	private const BATCH_SIZE = 100;

	/**
	 * How long a dead link is kept so the gate can still explain it. Long enough
	 * to cover a reviewer coming back to a stale link after a fortnight off.
	 */
	private const DEFAULT_GRACE = 21 * DAY_IN_SECONDS;

	private PreviewLinkService $service;

	public function __construct( PreviewLinkService $service ) {
		$this->service = $service;
	}

	public function register(): void {
		// @phpstan-ignore return.void (The count is for callers and tests; WordPress discards an action's return value.)
		add_action( self::HOOK, [ $this, 'run' ] );

		if ( false === wp_next_scheduled( self::HOOK ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::HOOK );
		}
	}

	/**
	 * Remove the scheduled sweep. Called on deactivation so an uninstalled plugin
	 * does not leave a cron entry firing into nothing.
	 *
	 * @param bool $_network_wide Passed by register_deactivation_hook; unused.
	 */
	// phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.Found -- Signature is dictated by register_deactivation_hook, which passes the network flag.
	public static function unschedule( bool $_network_wide = false ): void {
		wp_clear_scheduled_hook( self::HOOK );
		delete_option( self::CURSOR_OPTION );
		delete_option( self::LAST_RUN_OPTION );
	}

	/**
	 * When a sweep last completed, or null if one never has.
	 *
	 * Read by {@see SiteHealth}: a scheduled event that never fires leaves this
	 * behind, which is the difference between "set up correctly" and "working".
	 *
	 * @phpstan-impure
	 */
	public static function last_run(): ?int {
		$value = get_option( self::LAST_RUN_OPTION, null );

		return is_numeric( $value ) ? (int) $value : null;
	}

	/**
	 * Sweep one batch of posts, and queue another run if there is more to do.
	 *
	 * @return int Links deleted in this batch.
	 */
	public function run(): int {
		// Recorded first, and for every run rather than only productive ones: the
		// question it answers is "did cron fire?", to which "yes, and there was
		// nothing to delete" is still a yes.
		update_option( self::LAST_RUN_OPTION, time(), false );

		$cursor   = get_option( self::CURSOR_OPTION, 0 );
		$cursor   = is_numeric( $cursor ) ? (int) $cursor : 0;
		$post_ids = $this->service->post_ids_with_links( $cursor, self::BATCH_SIZE );

		if ( [] === $post_ids ) {
			// Swept to the end; start from the top on the next scheduled run.
			delete_option( self::CURSOR_OPTION );

			return 0;
		}

		$grace   = $this->grace_period();
		$deleted = 0;

		foreach ( $post_ids as $post_id ) {
			$deleted += $this->service->prune_dead( $post_id, $grace );
		}

		update_option( self::CURSOR_OPTION, end( $post_ids ), false );

		if ( count( $post_ids ) === self::BATCH_SIZE ) {
			// A full batch means there is probably more; continue shortly rather
			// than waiting a day per hundred posts. No wp_next_scheduled() guard:
			// cron reschedules the daily event before running it, so one always
			// exists. Core and Cron Control already refuse a second follow-up
			// within ten minutes of a pending one.
			wp_schedule_single_event( time() + MINUTE_IN_SECONDS, self::HOOK );
		}

		return $deleted;
	}

	/**
	 * Sweep every post in one call, for the CLI's `prune` command.
	 *
	 * Unlike {@see run()}, this walks its own cursor from the start, so it
	 * neither reads nor moves the scheduled sweep's stored one, and it does not
	 * touch the last-run marker — that records whether *cron* is firing, and a
	 * manual sweep reporting there would mask a broken schedule.
	 *
	 * @param int|null $grace_seconds Retention override in seconds (0 deletes
	 *                                every dead link immediately), or null for
	 *                                the configured grace period.
	 * @return int Links deleted.
	 */
	public function sweep_all( ?int $grace_seconds = null ): int {
		$grace   = null === $grace_seconds ? $this->grace_period() : max( 0, $grace_seconds );
		$deleted = 0;
		$cursor  = 0;

		while ( true ) {
			$post_ids = $this->service->post_ids_with_links( $cursor, self::BATCH_SIZE );

			if ( [] === $post_ids ) {
				return $deleted;
			}

			foreach ( $post_ids as $post_id ) {
				$deleted += $this->service->prune_dead( $post_id, $grace );
			}

			$cursor = (int) end( $post_ids );
		}
	}

	private function grace_period(): int {
		/**
		 * Filters how long an expired or revoked preview link is kept before the
		 * garbage collector deletes it. Until then the gate can still tell a
		 * visitor why their link stopped working.
		 *
		 * A value injected by the platform seeds the default, so a site can set
		 * this without shipping code; the filter still has the last word.
		 *
		 * @param int $grace_seconds Retention period in seconds (21 days).
		 */
		$grace = (int) apply_filters( 'shareadraft_dead_link_grace_period', $this->configured_grace_period() );

		return max( 0, $grace );
	}

	/**
	 * The retention period the platform config asks for, or the built-in default
	 * when it says nothing usable. A nonsensical value (zero, negative, a string)
	 * falls back rather than silently deleting links the moment they expire.
	 */
	private function configured_grace_period(): int {
		/** @var mixed $configured */
		$configured = Config::get_instance()->get( 'dead_link_grace_period' );

		return is_numeric( $configured ) && (int) $configured > 0
			? (int) $configured
			: self::DEFAULT_GRACE;
	}
}
