<?php
/**
 * Fully configured example of the VIP_SHAREADRAFT_CONFIG runtime config
 * constant: every value the Integration Center offers, filled in.
 *
 * The retention period is deliberately not the built-in 21-day default, so it
 * is obvious when the platform value is the one being used.
 *
 * Mock values only — never put real credentials in fixtures.
 */

return [
	// 7 days, in seconds.
	'dead_link_grace_period' => 604800,
	// Deliberately empty: this fixture backs the local dev-env and the
	// integration bootstrap, where a populated central allowlist would block
	// every local visitor (their address is never in a real customer range).
	// Set ranges in a git-ignored config-local.php to exercise the baseline.
	'ip_allowlist'           => '',
];
