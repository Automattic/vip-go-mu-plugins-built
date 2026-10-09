<?php

namespace Automattic\ShareADraft;

/**
 * The site-wide enable/disable switch for preview links.
 *
 * Disabling is a pause, not a revocation: every link keeps its own state
 * (expiry, viewer slots, revoked_at) and simply stops being honoured by the
 * gate until re-enabled. That makes it the first response to a suspected leak —
 * free to flip on suspicion and free to flip back on a false alarm, where
 * revoking everything would force re-minting and re-sharing every in-flight
 * link. The bulk revokes remain the tool for confirmed cases and offboarding.
 *
 * This is deliberately the one piece of out-of-band state in the plugin (the
 * rows stay the source of truth for everything per-link), so it is kept loud:
 * the admin table banners it, and the editor modals warn that new links will
 * not work until it is re-enabled.
 */
final class LinkToggle {
	/**
	 * Option holding `[ 'disabled_at' => int, 'disabled_by' => int ]` while
	 * links are disabled; absent while enabled. Who flipped it and when matters
	 * for incident response, so the switch records both.
	 */
	private const OPTION = 'shareadraft_disabled';

	public function is_disabled(): bool {
		return [] !== $this->state();
	}

	/** When links were disabled, or null while enabled. */
	public function disabled_at(): ?int {
		$state = $this->state();

		return isset( $state['disabled_at'] ) ? $state['disabled_at'] : null;
	}

	/** Who disabled links (0 when unknown or system-initiated), or null while enabled. */
	public function disabled_by(): ?int {
		$state = $this->state();

		return isset( $state['disabled_by'] ) ? $state['disabled_by'] : null;
	}

	/**
	 * Stop every preview link working until {@see enable()} is called.
	 * Idempotent: flipping an already-off switch keeps the original actor and
	 * time, which are the facts an investigation wants.
	 */
	public function disable(): void {
		if ( $this->is_disabled() ) {
			return;
		}

		update_option(
			self::OPTION,
			[
				'disabled_at' => time(),
				'disabled_by' => get_current_user_id(),
			]
		);
	}

	/** Let preview links work again, each according to its own state. */
	public function enable(): void {
		delete_option( self::OPTION );
	}

	/**
	 * The stored state, or an empty array while enabled or when the option is
	 * corrupt — a mangled value must read as "enabled", the state it can only
	 * have been flipped from by hand.
	 *
	 * @return array{disabled_at?: int, disabled_by?: int}
	 */
	private function state(): array {
		/** @var mixed $stored */
		$stored = get_option( self::OPTION, [] );

		if ( ! is_array( $stored ) || ! isset( $stored['disabled_at'] ) || ! is_numeric( $stored['disabled_at'] ) ) {
			return [];
		}

		return [
			'disabled_at' => (int) $stored['disabled_at'],
			'disabled_by' => isset( $stored['disabled_by'] ) && is_numeric( $stored['disabled_by'] ) ? (int) $stored['disabled_by'] : 0,
		];
	}
}
