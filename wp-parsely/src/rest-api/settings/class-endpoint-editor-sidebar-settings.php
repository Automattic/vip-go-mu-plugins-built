<?php
/**
 * API Endpoint: Editor Sidebar Settings
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

/**
 * Endpoint for saving and retrieving Content Helper Editor Sidebar settings.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Editor_Sidebar_Settings extends Base_Settings_Endpoint {
	/**
	 * Returns the endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'editor-sidebar';
	}

	/**
	 * Returns the meta entry's key.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Editor_Sidebar_Settings_Endpoint.
	 *
	 * @return string The meta entry's key.
	 */
	protected function get_meta_key(): string {
		return 'parsely_content_helper_settings_editor_sidebar';
	}

	/**
	 * Returns the endpoint's subvalues specifications.
	 *
	 * @since 3.13.0
	 * @since 3.17.0 Moved from Editor_Sidebar_Settings_Endpoint.
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		return array(
			'ExcerptSuggestions' => array(
				'values'  => array(
					'Open'    => array( true, false ),
					'Persona' => array(),
					'Tone'    => array(),
				),
				'default' => array(
					'Open'    => false,
					'Persona' => 'journalist',
					'Tone'    => 'neutral',
				),
			),
			'InitialTabName'     => array(
				'values'  => array( 'tools', 'performance' ),
				'default' => 'tools',
			),
			'PerformanceStats'   => array(
				'values'  => array(
					'Period'            => array( '10m', '1h', '2h', '4h', '24h', '7d', '30d' ),
					'VisibleDataPoints' => array( 'views', 'visitors', 'avgEngaged', 'recirculation' ),
					'VisiblePanels'     => array( 'overview', 'categories', 'referrers' ),
				),
				'default' => array(
					'Period'            => '7d',
					'VisibleDataPoints' => array( 'views', 'visitors', 'avgEngaged', 'recirculation' ),
					'VisiblePanels'     => array( 'overview', 'categories', 'referrers' ),
				),
			),
			'RelatedPosts'       => array(
				'values'  => array(
					'FilterBy'    => array( 'unavailable', 'tag', 'section', 'author' ),
					'FilterValue' => array(),
					'Metric'      => array( 'views', 'avg_engaged' ),
					'Open'        => array( true, false ),
					'Period'      => array( '10m', '1h', '2h', '4h', '24h', '7d', '30d' ),
				),
				'default' => array(
					'FilterBy'    => 'unavailable',
					'FilterValue' => '',
					'Metric'      => 'views',
					'Open'        => false,
					'Period'      => '7d',
				),
			),
			'SmartLinking'       => array(
				'values'  => array(
					'MaxLinks'     => array(),
					'MaxLinkWords' => array(),
					'Open'         => array( true, false ),
				),
				'default' => array(
					'MaxLinks'     => 10,
					'MaxLinkWords' => 4,
					'Open'         => false,
				),
			),
			'TitleSuggestions'   => array(
				'values'  => array(
					'Open'    => array( true, false ),
					'Persona' => array(),
					'Tone'    => array(),
				),
				'default' => array(
					'Open'    => false,
					'Persona' => 'journalist',
					'Tone'    => 'neutral',
				),
			),
		);
	}
}
