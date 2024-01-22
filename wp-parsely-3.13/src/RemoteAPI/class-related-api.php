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
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 * @var bool
	 */
	protected $is_public_endpoint = true;
}
