<?php
/**
 * API Endpoint: Traffic Boost Settings
 *
 * @package Parsely
 * @since   3.19.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

/**
 * Endpoint for saving and retrieving Content Intelligence Traffic Boost
 * settings.
 *
 * @since 3.19.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Traffic_Boost_Settings extends Base_Settings_Endpoint {
	/**
	 * Returns the endpoint's name.
	 *
	 * @since 3.19.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'traffic-boost';
	}

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.19.0
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_meta_key(): string {
		return 'parsely_content_helper_settings_traffic_boost';
	}

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.19.0
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		return array();
	}
}
