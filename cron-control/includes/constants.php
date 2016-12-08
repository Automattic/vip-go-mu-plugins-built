<?php

namespace Automattic\WP\Cron_Control;

/**
 * Job queues
 */
const JOB_QUEUE_SIZE                  = 10;
const JOB_QUEUE_WINDOW_IN_SECONDS     = 60;
const JOB_TIMEOUT_IN_MINUTES          = 10;
const JOB_CONCURRENCY_LIMIT           = 10;

/**
 * Job creation
 */
const JOB_CREATION_CONCURRENCY_LIMIT = 5;

/**
 * Locks
 */
const LOCK_DEFAULT_LIMIT = 10;
