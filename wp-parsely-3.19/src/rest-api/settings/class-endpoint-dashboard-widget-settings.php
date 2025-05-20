<?php
/**
 * API Endpoint: Dashboard Widget Settings
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

/**
 * Endpoint for saving and retrieving Content Helper Dashboard Widget settings.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Dashboard_Widget_Settings extends Base_Settings_Endpoint {
	/**
	 * Returns the endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'dashboard-widget';
	}

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Dashboard_Widget_Settings_Endpoint.
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_meta_key(): string {
		return 'parsely_content_helper_settings_dashboard_widget';
	}

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Dashboard_Widget_Settings_Endpoint.
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		return array(
			'Metric' => array(
				'values'  => array( 'views', 'avg_engaged' ),
				'default' => 'views',
			),
			'Period' => array(
				'values'  => array( '10m', '1h', '2h', '4h', '24h', '7d', '30d' ),
				'default' => '7d',
			),
		);
	}
}
