<?php

namespace Automattic\ShareADraft;

/**
 * Reports on the preview-link cleanup sweep through Site Health.
 *
 * {@see LinkGarbageCollector} is the only part of the plugin that depends on
 * something outside WordPress itself actually happening: a scheduled event has
 * to fire. When it does not, nothing breaks loudly — dead links simply pile up
 * as postmeta forever, and the only symptom is a slowly growing table.
 *
 * The test therefore measures the outcome (is the sweep scheduled, and is it
 * running?) rather than the mechanism. Checking `DISABLE_WP_CRON` would be the
 * obvious shortcut and the wrong one: VIP defines it and runs cron through its
 * own runner, so that check would cry wolf on the platform while missing a
 * standalone site whose system cron is silently broken.
 */
final class SiteHealth {
	private const TEST_ID = 'shareadraft_link_cleanup';

	/**
	 * How far past its due time the daily sweep may drift before we call it
	 * stuck. Cron runs on traffic, so a quiet site legitimately runs late.
	 */
	private const OVERDUE_GRACE = DAY_IN_SECONDS;

	/** How long since the last completed sweep before we treat it as stalled. */
	private const STALE_AFTER = 3 * DAY_IN_SECONDS;

	private Clock $clock;

	public function __construct( Clock $clock ) {
		$this->clock = $clock;
	}

	public function register(): void {
		add_filter( 'site_status_tests', [ $this, 'add_test' ] );
	}

	/**
	 * @param mixed $tests Site Health tests, keyed by `direct` and `async`.
	 * @return mixed
	 */
	public function add_test( $tests ) {
		if ( ! is_array( $tests ) ) {
			return $tests;
		}

		if ( ! isset( $tests['direct'] ) || ! is_array( $tests['direct'] ) ) {
			$tests['direct'] = [];
		}

		$tests['direct'][ self::TEST_ID ] = [
			'label' => __( 'Preview link cleanup', 'shareadraft' ),
			'test'  => [ $this, 'run_test' ],
		];

		return $tests;
	}

	/**
	 * @return array{label: string, status: string, badge: array{label: string, color: string}, description: string, test: string}
	 */
	public function run_test(): array {
		$next     = wp_next_scheduled( LinkGarbageCollector::HOOK );
		$last_run = LinkGarbageCollector::last_run();
		$now      = $this->clock->now();

		if ( false === $next ) {
			return $this->result(
				'recommended',
				__( 'Expired preview links are not being cleaned up', 'shareadraft' ),
				__( 'The daily sweep that removes expired and revoked preview links is not scheduled, so they will accumulate in the database. Deactivating and reactivating Share a Draft will schedule it again.', 'shareadraft' )
			);
		}

		$overdue = $now - (int) $next > self::OVERDUE_GRACE;
		$stalled = null !== $last_run && $now - $last_run > self::STALE_AFTER;

		if ( $overdue || $stalled ) {
			return $this->result(
				'recommended',
				__( 'The preview link cleanup sweep is running late', 'shareadraft' ),
				sprintf(
					/* translators: %s: human-readable time difference, e.g. "4 days". */
					__( 'The cleanup sweep was last due %s ago but has not run. Scheduled events on this site may not be firing, which means expired and revoked preview links will accumulate in the database. Preview links themselves are unaffected: expiry is checked when a link is opened, not by this sweep.', 'shareadraft' ),
					human_time_diff( (int) $next, $now )
				)
			);
		}

		return $this->result(
			'good',
			__( 'Expired preview links are being cleaned up', 'shareadraft' ),
			null === $last_run
				? sprintf(
					/* translators: %s: human-readable time difference, e.g. "6 hours". */
					__( 'The daily sweep that removes expired and revoked preview links is scheduled and due to run in %s.', 'shareadraft' ),
					human_time_diff( $now, (int) $next )
				)
				: sprintf(
					/* translators: 1: human-readable time difference since the last run, 2: human-readable time difference until the next run. */
					__( 'The daily sweep that removes expired and revoked preview links last ran %1$s ago, and is due again in %2$s.', 'shareadraft' ),
					human_time_diff( $last_run, $now ),
					human_time_diff( $now, (int) $next )
				)
		);
	}

	/**
	 * @return array{label: string, status: string, badge: array{label: string, color: string}, description: string, test: string}
	 */
	private function result( string $status, string $label, string $description ): array {
		return [
			'label'       => $label,
			'status'      => $status,
			'badge'       => [
				'label' => __( 'Performance', 'shareadraft' ),
				'color' => 'blue',
			],
			'description' => '<p>' . esc_html( $description ) . '</p>',
			'test'        => self::TEST_ID,
		];
	}
}
