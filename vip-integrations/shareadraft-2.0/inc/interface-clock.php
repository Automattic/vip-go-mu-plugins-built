<?php

namespace Automattic\ShareADraft;

/**
 * The current time, as an injectable dependency.
 *
 * Expiry and one-time-use rules turn on "now". Injecting the clock keeps those
 * rules unit-testable without sleeping or touching the system time: tests pass a
 * frozen clock, production passes {@see SystemClock}.
 */
interface Clock {
	/**
	 * The current Unix timestamp, in seconds.
	 */
	public function now(): int;
}
