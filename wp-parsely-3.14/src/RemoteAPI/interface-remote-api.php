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
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0 Renamed from `is_user_allowed_to_make_api_call()`.
	 *
	 * @return bool
	 */
	public function is_available_to_current_user(): bool;
}
