<?php
/**
 * Class for Related API (`/related`).
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Parsely;
use WP_REST_Request;

/**
 * Class for Related API (`/related`).
 *
 * @since 3.2.0
 */
class Related_API extends Base_Endpoint_Remote {
	protected const API_BASE_URL = Parsely::PUBLIC_API_BASE_URL;
	protected const ENDPOINT     = '/related';
	protected const QUERY_FILTER = 'wp_parsely_related_endpoint_args';

	/**
	 * Returns whether the endpoint is available for access by the current
	 * user.
	 *
	 * @since 3.14.0
	 * @since 3.16.0 Added the `$request` parameter.
	 *
	 * @param WP_REST_Request|null $request The request object.
	 * @return bool
	 */
	public function is_available_to_current_user( $request = null ): bool {
		return true;
	}
}
