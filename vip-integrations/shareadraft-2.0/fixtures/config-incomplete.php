<?php
/**
 * Setup in progress: the customer has opened the field in the VIP Dashboard but
 * not filled it in, so it arrives as an empty string.
 *
 * The plugin must not fatal, and must not take the value at face value either —
 * an unusable retention period falls back to the 21-day default rather than
 * deleting links the moment they expire.
 */

return [
	'dead_link_grace_period' => '',
];
