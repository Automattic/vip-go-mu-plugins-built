<?php
/**
 * Remote API: Interface
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use WP_Error;

/**
 * Remote API Interface.
 */
interface Remote_API_Interface {
	/**
	 * Returns the items provided by this interface.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @param bool                 $associative (optional) When TRUE, returned objects will be converted into
	 *                             associative arrays.
	 * @return array<string, mixed>|object|WP_Error
	 */
	public function get_items( array $query, bool $associative = false );

	/**
	 * Checks if the current user is allowed to make the API call.
	 *
	 * @return bool
	 */
	public function is_user_allowed_to_make_api_call(): bool;
}
