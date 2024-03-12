<?php
/**
 * Endpoints: Endpoint for saving and retrieving Content Helper Dashboard Widget
 * settings
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\User_Meta;

/**
 * Endpoint for saving and retrieving Content Helper Dashboard Widget settings.
 *
 * @since 3.13.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Endpoint_User_Meta
 */
final class Dashboard_Widget_Settings_Endpoint extends Base_Endpoint_User_Meta {
	protected const ENDPOINT = '/user-meta/content-helper/dashboard-widget-settings';

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.13.0
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
