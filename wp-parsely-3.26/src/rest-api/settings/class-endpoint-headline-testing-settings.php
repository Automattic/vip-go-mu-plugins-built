<?php
/**
 * Headline Testing Settings Endpoint
 *
 * @package Parsely
 * @since   3.21.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

use Parsely\REST_API\Settings\Base_Settings_Endpoint;

/**
 * Endpoint for managing Headline Testing settings.
 *
 * @since 3.21.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Headline_Testing_Settings extends Base_Settings_Endpoint {
	/**
	 * Returns the endpoint's name.
	 *
	 * @since 3.21.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'headline-testing';
	}

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.21.0
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_meta_key(): string {
		return 'headline_testing';
	}

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.21.0
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		return array(
			'enabled'                  => array(
				'values'  => array( true, false ),
				'default' => false,
			),
			'installation_method'      => array(
				'values'  => array( 'one_line', 'advanced' ),
				'default' => 'one_line',
			),
			'enable_flicker_control'   => array(
				'values'  => array( true, false ),
				'default' => false,
			),
			'enable_live_updates'      => array(
				'values'  => array( true, false ),
				'default' => false,
			),
			'live_update_timeout'      => array(
				'values'  => range( 1000, 60000, 1000 ),
				'default' => 30000,
			),
			'allow_after_content_load' => array(
				'values'  => array( true, false ),
				'default' => false,
			),
		);
	}
}
