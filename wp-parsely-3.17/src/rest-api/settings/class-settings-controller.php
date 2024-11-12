<?php
/**
 * API Settings Controller
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

use Parsely\REST_API\REST_API_Controller;

/**
 * The Settings API Controller.
 *
 * Used to define the namespace, version, and endpoints for the Settings API.
 *
 * @since 3.17.0
 */
class Settings_Controller extends REST_API_Controller {
	/**
	 * Gets the prefix for this API route.
	 *
	 * @since 3.17.0
	 *
	 * @return string The namespace.
	 */
	public static function get_route_prefix(): string {
		return 'settings';
	}

	/**
	 * Initializes the Settings API endpoints.
	 *
	 * @since 3.17.0
	 */
	public function init(): void {
		$endpoints = array(
			new Endpoint_Dashboard_Widget_Settings( $this ),
			new Endpoint_Editor_Sidebar_Settings( $this ),
		);

		$this->register_endpoints( $endpoints );
	}
}
