<?php

namespace Automattic\WP\Cron_Control;

/**
 * Adjustable queue size and concurrency limits, to facilitate scaling
 */
$job_queue_size = 10;
if ( defined( 'CRON_CONTROL_JOB_QUEUE_SIZE' ) && is_numeric( \CRON_CONTROL_JOB_QUEUE_SIZE ) ) {
	$job_queue_size = absint( \CRON_CONTROL_JOB_QUEUE_SIZE );
	$job_queue_size = max( 1, min( $job_queue_size, 250 ) );
}
define( __NAMESPACE__ . '\JOB_QUEUE_SIZE', $job_queue_size );
unset( $job_queue_size );

$job_concurrency_limit = 10;
if ( defined( 'CRON_CONTROL_JOB_CONCURRENCY_LIMIT' ) && is_numeric( \CRON_CONTROL_JOB_CONCURRENCY_LIMIT ) ) {
	$job_concurrency_limit = absint( \CRON_CONTROL_JOB_CONCURRENCY_LIMIT );
	$job_concurrency_limit = max( 1, min( $job_concurrency_limit, 250 ) );
}
define( __NAMESPACE__ . '\JOB_CONCURRENCY_LIMIT', $job_concurrency_limit );
unset( $job_concurrency_limit );

/**
 * Job runtime constraints
 */
const JOB_QUEUE_WINDOW_IN_SECONDS = 60;
const JOB_TIMEOUT_IN_MINUTES      = 10;
const JOB_LOCK_EXPIRY_IN_MINUTES  = 30;

/**
 * Locks
 */
const LOCK_DEFAULT_LIMIT              = 10;
const LOCK_DEFAULT_TIMEOUT_IN_MINUTES = 10;
