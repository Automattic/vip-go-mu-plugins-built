<?php
/**
 * API Utils Controller
 *
 * @package Parsely
 * @since   3.20.5
 */

declare(strict_types=1);

namespace Parsely\REST_API\Utils;

use Parsely\REST_API\REST_API_Controller;
use Parsely\REST_API\Utils\Endpoint_Post;

/**
 * The Utils API Controller.
 *
 * Used to define the namespace, version, and endpoints for the Utils API.
 *
 * @since 3.20.5
 */
class Utils_Controller extends REST_API_Controller {
	/**
	 * Gets the prefix for this API route.
	 *
	 * @since 3.20.5
	 *
	 * @return string The namespace.
	 */
	public static function get_route_prefix(): string {
		return 'utils';
	}

	/**
	 * Initializes the Utils API endpoints.
	 *
	 * @since 3.20.5
	 */
	public function init(): void {
		$endpoints = array(
			new Endpoint_Post( $this ),
		);

		$this->register_endpoints( $endpoints );
	}
}
