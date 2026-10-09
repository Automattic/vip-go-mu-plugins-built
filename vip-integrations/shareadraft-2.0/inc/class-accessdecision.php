<?php

namespace Automattic\ShareADraft;

/**
 * The outcome of {@see AccessPolicy::decide()}: allow or deny, plus a machine
 * reason so the request-time gate can log it and show the visitor an appropriate
 * page ("this link has expired" vs a bare 404).
 */
final class AccessDecision {
	public const REASON_ALLOWED    = 'allowed';
	public const REASON_NOT_FOUND  = 'not_found';
	public const REASON_EXPIRED    = 'expired';
	public const REASON_REVOKED    = 'revoked';
	public const REASON_EXHAUSTED  = 'exhausted';
	public const REASON_IP_BLOCKED = 'ip_blocked';

	/**
	 * The link is bound to named recipients and this visitor has not proved
	 * they are one. Unlike the other denials this one is an invitation: the
	 * gate answers it with the email-verification form, not a dead end.
	 */
	public const REASON_EMAIL_UNVERIFIED = 'email_unverified';

	private bool $allowed;
	private string $reason;

	private function __construct( bool $allowed, string $reason ) {
		$this->allowed = $allowed;
		$this->reason  = $reason;
	}

	public static function allow(): self {
		return new self( true, self::REASON_ALLOWED );
	}

	public static function deny( string $reason ): self {
		return new self( false, $reason );
	}

	public function is_allowed(): bool {
		return $this->allowed;
	}

	public function reason(): string {
		return $this->reason;
	}
}
