<?php
/**
 * A migration that stopped short on purpose and resumes on a later request.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Database;

/**
 * Thrown by a migration that has more to do and will carry on from where it
 * stopped: its time budget ran out, or another request holds the work.
 *
 * Not a failure. Schema::run_migrations() passes it through without logging,
 * and the schema version stays unbumped, so the next request runs the
 * migration again. The upgrade hook catches it without logging either.
 */
final class MigrationDeferred extends \RuntimeException {
}
