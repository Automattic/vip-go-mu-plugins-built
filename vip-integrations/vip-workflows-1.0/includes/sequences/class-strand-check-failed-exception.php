<?php
/**
 * StrandCheckFailedException — the strand check could not read the posts.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Sequences;

/**
 * Thrown by StageQuery::posts_holding_sequence() when one of its queries fails.
 *
 * The check guards a destructive write, so an unreadable answer must refuse the
 * write rather than pass as "nobody is affected". It has its own type so callers
 * can catch exactly this failure: catching the base \RuntimeException would also
 * report unrelated runtime failures as a failed strand check.
 */
class StrandCheckFailedException extends \RuntimeException {
}
