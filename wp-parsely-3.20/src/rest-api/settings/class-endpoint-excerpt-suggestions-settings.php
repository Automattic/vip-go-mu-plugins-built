<?php
/**
 * API Endpoint: Excerpt Suggestions Settings
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

/**
 * Endpoint for saving and retrieving Content Helper Excerpt Suggestions
 * settings.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Excerpt_Suggestions_Settings extends Base_Settings_Endpoint {
	/**
	 * Returns the endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'excerpt-suggestions';
	}

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.17.0
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_meta_key(): string {
		return 'parsely_content_helper_settings_excerpt_suggestions';
	}

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.17.0
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		return array(
			'Open'    => array(
				'values'  => array( true, false ),
				'default' => false,
			),
			'Persona' => array(
				'values'  => array(),
				'default' => 'journalist',
			),
			'Tone'    => array(
				'values'  => array(),
				'default' => 'neutral',
			),
		);
	}
}
