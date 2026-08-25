<?php
/**
 * Reconcile Outcome value object.
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
 * Immutable result of one reconciliation attempt.
 *
 * Names what a retry actually did so the audit log records the true outcome
 * rather than inferring it from the issue's severity. The write_failed,
 * target_absent, and unresolved outcomes carry a detail string naming the
 * specific cause.
 */
final class Reconcile_Outcome {

	// Outcome types.
	public const RESOLVED      = 'resolved';
	public const TARGET_ABSENT = 'target_absent';
	public const WRITE_FAILED  = 'write_failed';
	public const UNRESOLVED    = 'unresolved';

	/**
	 * Outcome type; one of the class constants.
	 *
	 * @var string
	 */
	public readonly string $type;

	/**
	 * Cause detail for write_failed, target_absent, and unresolved; empty
	 * otherwise.
	 *
	 * @var string
	 */
	public readonly string $detail;

	/**
	 * Constructs the outcome. Use the named constructors instead of calling
	 * this directly.
	 *
	 * @param string $type   Outcome type.
	 * @param string $detail Optional cause detail.
	 */
	private function __construct( string $type, string $detail = '' ) {
		$this->type   = $type;
		$this->detail = $detail;
	}

	/**
	 * Builds a resolved outcome.
	 *
	 * @return self
	 */
	public static function resolved(): self {
		return new self( self::RESOLVED );
	}

	/**
	 * Builds a target-absent outcome.
	 *
	 * @param string $reason Why the target is not present on the destination.
	 * @return self
	 */
	public static function target_absent( string $reason ): self {
		return new self( self::TARGET_ABSENT, $reason );
	}

	/**
	 * Builds a write-failed outcome.
	 *
	 * @param string $detail Why the reconciliation write failed.
	 * @return self
	 */
	public static function write_failed( string $detail ): self {
		return new self( self::WRITE_FAILED, $detail );
	}

	/**
	 * Builds an unresolved outcome.
	 *
	 * @param string $reason Optional reason the issue remains unresolved.
	 * @return self
	 */
	public static function unresolved( string $reason = '' ): self {
		return new self( self::UNRESOLVED, $reason );
	}

	/**
	 * Whether the reconciliation cleared the issue.
	 *
	 * @return bool
	 */
	public function is_resolved(): bool {
		return self::RESOLVED === $this->type;
	}
}
