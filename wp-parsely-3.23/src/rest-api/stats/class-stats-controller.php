<?php
/**
 * Stats API Controller
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\REST_API\REST_API_Controller;

/**
 * The Stats API Controller.
 *
 * Used to define the namespace, version, and endpoints for the Stats API.
 *
 * @since 3.17.0
 */
class Stats_Controller extends REST_API_Controller {
	/**
	 * Gets the prefix for this API route.
	 *
	 * @since 3.17.0
	 *
	 * @return string The namespace.
	 */
	public static function get_route_prefix(): string {
		return 'stats';
	}

	/**
	 * Initializes the Stats API endpoints.
	 *
	 * @since 3.17.0
	 */
	public function init(): void {
		$endpoints = array(
			new Endpoint_Posts( $this ),
			new Endpoint_Post( $this ),
			new Endpoint_Related( $this ),
		);

		$this->register_endpoints( $endpoints );
	}
}
