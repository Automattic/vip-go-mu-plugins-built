<?php
/**
 * Term Reconcile Report collector.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * What one reconcile pass left unwritten and what it brought back in line with
 * the source.
 *
 * Appended to as terms are reconciled, so the caller reads one report per pass.
 * A pass over a single term collects only conflicts; whether that term counts
 * as resolved is the caller's call.
 */
final class Term_Reconcile_Report {

	/**
	 * Fields the reconcile could not write.
	 *
	 * @var list<Term_Conflict>
	 */
	private array $conflicts = array();

	/**
	 * Source term IDs of the terms brought current.
	 *
	 * @var list<int>
	 */
	private array $resolved = array();

	/**
	 * Records one conflict.
	 *
	 * @param Term_Conflict $conflict Field the reconcile could not write.
	 */
	public function add_conflict( Term_Conflict $conflict ): void {
		$this->conflicts[] = $conflict;
	}

	/**
	 * Records several conflicts.
	 *
	 * @param Term_Conflict[] $conflicts Fields the reconcile could not write.
	 */
	public function add_conflicts( array $conflicts ): void {
		foreach ( $conflicts as $conflict ) {
			$this->conflicts[] = $conflict;
		}
	}

	/**
	 * Records a term now matching the source.
	 *
	 * @param int $source_term_id Source term ID of the reconciled term.
	 */
	public function mark_resolved( int $source_term_id ): void {
		$this->resolved[] = $source_term_id;
	}

	/**
	 * Lists the fields the reconcile could not write.
	 *
	 * @return list<Term_Conflict>
	 */
	public function conflicts(): array {
		return $this->conflicts;
	}

	/**
	 * Lists the source term IDs of the terms brought current.
	 *
	 * @return list<int>
	 */
	public function resolved(): array {
		return $this->resolved;
	}
}
