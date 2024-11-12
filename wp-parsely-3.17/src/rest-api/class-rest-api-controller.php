<?php
/**
 * REST API Controller
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API;

use Parsely\REST_API\Content_Helper\Content_Helper_Controller;
use Parsely\REST_API\Settings\Settings_Controller;
use Parsely\REST_API\Stats\Stats_Controller;

/**
 * The REST API Controller.
 *
 * Used to define the namespace, version, and controllers for the REST API.
 *
 * @since 3.17.0
 */
class REST_API_Controller extends Base_API_Controller {
	/**
	 * The controllers for each namespace.
	 *
	 * @since 3.17.0
	 *
	 * @var Base_API_Controller[]
	 */
	public $controllers = array();

	/**
	 * Gets the namespace for the API.
	 *
	 * @since 3.17.0
	 *
	 * @return string The namespace.
	 */
	protected function get_namespace(): string {
		return 'wp-parsely';
	}

	/**
	 * Gets the version for the API.
	 *
	 * @since 3.17.0
	 *
	 * @return string The version.
	 */
	protected function get_version(): string {
		return 'v2';
	}

	/**
	 * Initializes the REST API controller.
	 *
	 * @since 3.17.0
	 */
	public function init(): void {
		// Register the controllers for each namespace.
		$controllers = array(
			new Content_Helper_Controller( $this->get_parsely() ),
			new Stats_Controller( $this->get_parsely() ),
			new Settings_Controller( $this->get_parsely() ),
		);

		// Initialize the controllers.
		foreach ( $controllers as $controller ) {
			$controller->init();
		}

		$this->controllers = $controllers;
	}

	/**
	 * Determines if the specified endpoint is available to the current user.
	 *
	 * @since 3.17.0
	 *
	 * @param string $endpoint The endpoint to check.
	 * @return bool True if the endpoint is available to the current user, false otherwise.
	 */
	public function is_available_to_current_user( string $endpoint ): bool {
		// Remove any forward or trailing slashes.
		$endpoint = trim( $endpoint, '/' );

		// Get the controller for the endpoint.
		$controller = $this->get_controller_for_endpoint( $endpoint );
		if ( null === $controller ) {
			return false;
		}

		// Get the endpoint object.
		$endpoint_obj = $controller->get_endpoint( $endpoint );
		if ( null === $endpoint_obj ) {
			return false;
		}

		// Check if the endpoint is available to the current user.
		$is_available = $endpoint_obj->is_available_to_current_user();
		if ( is_wp_error( $is_available ) ) {
			return false;
		}

		return $is_available;
	}

	/**
	 * Gets the controller for the specified endpoint.
	 *
	 * @since 3.17.0
	 *
	 * @param string $endpoint The endpoint to get the controller for.
	 * @return Base_API_Controller|null The controller for the specified endpoint.
	 */
	private function get_controller_for_endpoint( string $endpoint ): ?Base_API_Controller {
		foreach ( $this->controllers as $controller ) {
			if ( null !== $controller->get_endpoint( $endpoint ) ) {
				return $controller;
			}
		}

		return null;
	}
}
