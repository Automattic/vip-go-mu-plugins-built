<?php
/**
 * Local wp-env only.
 *
 * On the VIP platform the runtime configuration constant is injected before the
 * plugin loads. wp-env has no VIP dashboard, so this mu-plugin mirrors that
 * injection, letting the plugin report "ready" while you review progress
 * locally. It is never shipped or activated in production.
 *
 * Nothing in it is required: defining the constant is the signal that matters,
 * and every value it can carry falls back to a built-in default.
 *
 * @package shareadraft-wp-env
 */

if ( ! defined( 'VIP_SHAREADRAFT_CONFIG' ) ) {
	define(
		'VIP_SHAREADRAFT_CONFIG',
		[
			// 7 days, in seconds — not the 21-day default, so it is obvious when
			// the injected value is the one in use.
			'dead_link_grace_period' => 604800,
			// No central IP ranges locally: links restrict by IP only when a
			// range is set per link. Add documentation-range CIDRs here (e.g.
			// '203.0.113.0/24') to exercise the central baseline and the
			// editor's "already added in the VIP Dashboard" notice.
			'ip_allowlist'           => '',
		]
	);
}
