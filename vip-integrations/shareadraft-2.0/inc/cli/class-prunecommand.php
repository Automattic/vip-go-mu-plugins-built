<?php

namespace Automattic\ShareADraft\Cli;

use Automattic\ShareADraft\LinkGarbageCollector;
use WP_CLI;

/**
 * The `wp shareadraft prune` command.
 *
 * A manual lever for the sweep {@see LinkGarbageCollector} runs on cron: the
 * same batched walk, on demand. `--grace=0` is the incident-cleanup form —
 * delete every expired and revoked link now, rather than after the retention
 * period that normally keeps them explainable to returning visitors.
 * Behaviour is pinned by features/prune.feature.
 */
final class PruneCommand {
	private LinkGarbageCollector $collector;

	public function __construct( LinkGarbageCollector $collector ) {
		$this->collector = $collector;
	}

	/**
	 * Delete expired and revoked preview links past their retention period.
	 *
	 * The scheduled sweep does this daily; running it here is useful when waiting is not acceptable, or to verify the sweep's effect. Until a dead link is pruned, a visitor opening it is told why it stopped working; after, they see a plain 404.
	 *
	 * ## OPTIONS
	 *
	 * [--grace=<seconds>]
	 * : Override the retention period for dead links, in seconds. `0` deletes every expired or revoked link immediately. Defaults to the configured grace period (21 days unless the platform sets `dead_link_grace_period` or the `shareadraft_dead_link_grace_period` filter says otherwise).
	 *
	 * ## EXAMPLES
	 *
	 *     # Prune with the configured retention period.
	 *     $ wp shareadraft prune
	 *     Success: Pruned 3 preview links.
	 *
	 *     # Delete every dead link immediately.
	 *     $ wp shareadraft prune --grace=0
	 *     Success: Pruned 2 preview links.
	 *
	 * @when after_wp_load
	 *
	 * @param string[]                  $_args      Positional arguments (unused).
	 * @param array<string, string|bool> $assoc_args Associative arguments.
	 */
	public function __invoke( array $_args, array $assoc_args ): void {
		$grace = null;

		if ( isset( $assoc_args['grace'] ) ) {
			if ( ! is_numeric( $assoc_args['grace'] ) || (int) $assoc_args['grace'] < 0 ) {
				WP_CLI::error( '--grace must be a non-negative number of seconds.' );
				return;
			}

			$grace = (int) $assoc_args['grace'];
		}

		$deleted = $this->collector->sweep_all( $grace );

		WP_CLI::success(
			1 === $deleted ? 'Pruned 1 preview link.' : sprintf( 'Pruned %d preview links.', $deleted )
		);
	}
}
