<?php
/**
 * Shared helper functions for workflow ability tools.
 *
 * @package VIPWorkflows
 */

declare( strict_types=1 );

namespace VIPWorkflows\Abilities\Tools;

/**
 * Require edit access for a post-scoped ability.
 *
 * @param int $post_id Post ID.
 * @return \WP_Error|null Error when access is denied, otherwise null.
 */
function require_post_edit_permission( int $post_id ): ?\WP_Error {
	if ( current_user_can( 'edit_post', $post_id ) ) {
		return null;
	}

	// Note: no array error-data is attached here. AbilityExecutor treats a
	// WP_Error whose error-data is an array as a *success* payload, so an
	// array such as array( 'status' => 403 ) would cause permission denials
	// to be reported as successful ability results to direct executor callers.
	return new \WP_Error(
		'forbidden',
		__( 'Sorry, you are not allowed to edit this post.', 'vip-workflows' )
	);
}

/**
 * Read an integer input and keep it between two bounds.
 *
 * The tool's input schema states the same bounds, so a value outside them is
 * refused by WP_Ability::execute() before the tool runs. This is for a PHP
 * caller that calls the tool's function directly, which the schema never sees.
 *
 * @param array  $input    Ability input.
 * @param string $key      Input key.
 * @param int    $fallback Value used when the key is absent or null.
 * @param int    $min      Lowest value returned.
 * @param int    $max      Highest value returned.
 * @return int
 */
function bounded_int( array $input, string $key, int $fallback, int $min, int $max ): int {
	return max( $min, min( $max, (int) ( $input[ $key ] ?? $fallback ) ) );
}
