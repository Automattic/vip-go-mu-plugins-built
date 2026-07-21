<?php
/**
 * Reconcile Logger class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Utils;

/**
 * Logger for reference-reconciliation events (channel "reconcile").
 *
 * Reconciliation re-runs a repair on a degraded cross-reference and records the
 * outcome. Producers (Retry today, any out-of-import producer later) log it
 * here for admins and update the user-facing issues store. The audit entry
 * records one outcome per reconciliation, not a per-row mirror: a target-scoped
 * reconciliation settles several issue rows but logs once. Scope every issue by
 * the affected post's stored META_SOURCE_SITE_URL, the path-bearing source
 * identity.
 *
 * Outcomes are type-agnostic: issue_type names the reference class reconciled,
 * so a new reference class reuses these helpers without adding events.
 */
class Reconcile_Logger extends Logger {

	/**
	 * Constructs the Reconcile_Logger instance.
	 */
	public function __construct() {
		$this->channel = 'reconcile';
	}

	/**
	 * Records a reconciliation outcome, routing it to the matching event.
	 *
	 * @param Reconcile_Outcome $outcome          What the reconciliation did.
	 * @param string            $issue_type       Tracked issue type reconciled.
	 * @param int               $affected_post_id Post holding the reference.
	 * @param int               $target_ref       Source id of the target.
	 * @param string            $target_kind      'post' or 'term'.
	 */
	public function record(
		Reconcile_Outcome $outcome,
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind
	): void {
		switch ( $outcome->type ) {
			case Reconcile_Outcome::RESOLVED:
				$this->resolved(
					$issue_type,
					$affected_post_id,
					$target_ref,
					$target_kind
				);
				return;
			case Reconcile_Outcome::WRITE_FAILED:
				$this->failed(
					$issue_type,
					$affected_post_id,
					$target_ref,
					$target_kind,
					$outcome->detail
				);
				return;
			case Reconcile_Outcome::TARGET_ABSENT:
				$this->target_absent(
					$issue_type,
					$affected_post_id,
					$target_ref,
					$target_kind,
					$outcome->detail
				);
				return;
			default:
				$this->unresolved(
					$issue_type,
					$affected_post_id,
					$target_ref,
					$target_kind,
					$outcome->detail
				);
		}
	}

	/**
	 * Logs a reference reconciled to its destination target.
	 *
	 * @param string $issue_type       Tracked issue type that was reconciled.
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id the reference now resolves to.
	 * @param string $target_kind      'post' or 'term'.
	 */
	public function resolved(
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind
	): void {
		$this->log_event(
			Log_Events::RECONCILE_RESOLVED,
			$this->payload(
				$issue_type,
				$affected_post_id,
				$target_ref,
				$target_kind
			)
		);
	}

	/**
	 * Logs a reference left unresolved after a reconciliation attempt that
	 * neither failed a write nor found the target absent.
	 *
	 * @param string $issue_type       Tracked issue type still unresolved.
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id the reference points at.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $reason           Optional detail on why it remains.
	 */
	public function unresolved(
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind,
		string $reason = ''
	): void {
		$data = $this->payload(
			$issue_type,
			$affected_post_id,
			$target_ref,
			$target_kind
		);

		if ( '' !== $reason ) {
			$data['reason'] = $reason;
		}

		$this->log_warning( Log_Events::RECONCILE_UNRESOLVED, $data );
	}

	/**
	 * Logs a reconciliation skipped because the target is not present on the
	 * destination, so the retry was a no-op and the issue stays open.
	 *
	 * @param string $issue_type       Tracked issue type being reconciled.
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id the reference points at.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $reason           Why the target is considered absent.
	 */
	public function target_absent(
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind,
		string $reason
	): void {
		$data           = $this->payload(
			$issue_type,
			$affected_post_id,
			$target_ref,
			$target_kind
		);
		$data['reason'] = $reason;

		$this->log_warning( Log_Events::RECONCILE_TARGET_ABSENT, $data );
	}

	/**
	 * Logs a reconciliation whose write was attempted and failed.
	 *
	 * @param string $issue_type       Tracked issue type being reconciled.
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id the reference points at.
	 * @param string $target_kind      'post' or 'term'.
	 * @param string $error            Detail on why the write failed.
	 */
	public function failed(
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind,
		string $error
	): void {
		$data          = $this->payload(
			$issue_type,
			$affected_post_id,
			$target_ref,
			$target_kind
		);
		$data['error'] = $error;

		$this->log_error( Log_Events::RECONCILE_FAILED, $data );
	}

	/**
	 * Builds the shared outcome payload.
	 *
	 * @param string $issue_type       Tracked issue type.
	 * @param int    $affected_post_id Post holding the reference.
	 * @param int    $target_ref       Source id of the target.
	 * @param string $target_kind      'post' or 'term'.
	 * @return array Outcome payload.
	 */
	private function payload(
		string $issue_type,
		int $affected_post_id,
		int $target_ref,
		string $target_kind
	): array {
		return array(
			'issue_type'       => $issue_type,
			'affected_post_id' => $affected_post_id,
			'target_ref'       => $target_ref,
			'target_kind'      => $target_kind,
		);
	}
}
