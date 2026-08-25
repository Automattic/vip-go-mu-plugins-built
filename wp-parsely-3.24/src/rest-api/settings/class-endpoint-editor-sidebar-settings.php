<?php
/**
 * API Endpoint: Editor Sidebar Settings
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Settings;

use Parsely\Content_Helper\Suggestion_Defaults;

/**
 * Endpoint for saving and retrieving Content Intelligence Editor Sidebar
 * settings.
 *
 * @since 3.17.0
 *
 * @phpstan-import-type Subvalue_Spec from Base_Settings_Endpoint
 */
class Endpoint_Editor_Sidebar_Settings extends Base_Settings_Endpoint {
	/**
	 * The minimum desired excerpt length, in characters.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const MIN_EXCERPT_LENGTH = Suggestion_Defaults::MIN_LENGTH;

	/**
	 * The maximum desired excerpt length, in characters.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const MAX_EXCERPT_LENGTH = Suggestion_Defaults::MAX_LENGTH;

	/**
	 * The default desired excerpt length, in characters.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const DEFAULT_EXCERPT_LENGTH = Suggestion_Defaults::DEFAULT_LENGTH;

	/**
	 * The default persona used when generating excerpts.
	 *
	 * @since 3.24.0
	 *
	 * @var string
	 */
	public const DEFAULT_EXCERPT_PERSONA = Suggestion_Defaults::DEFAULT_PERSONA;

	/**
	 * The default tone used when generating excerpts.
	 *
	 * @since 3.24.0
	 *
	 * @var string
	 */
	public const DEFAULT_EXCERPT_TONE = Suggestion_Defaults::DEFAULT_TONE;

	/**
	 * Returns the endpoint's name.
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
	 * @since 3.24.0 Added the ExcerptSuggestions `Length` setting.
	 * @since 3.24.0 Removed the ExcerptSuggestions `Open` setting, as the panel's
	 *               collapsed state is now persisted by the block editor itself.
	 * @since 3.24.0 The ExcerptSuggestions and TitleSuggestions defaults come
	 *               from the site-wide settings of their respective features.
	 *
	 * @return array<string, Subvalue_Spec>
	 */
	protected function get_subvalues_specs(): array {
		$excerpt_options = Suggestion_Defaults::get_feature_options( $this->parsely, 'excerpt_suggestions' );
		$title_options   = Suggestion_Defaults::get_feature_options( $this->parsely, 'title_suggestions' );

		return array(
			'ExcerptSuggestions' => array(
				'values'  => array(
					'Length'  => array(),
					'Persona' => array(),
					'Tone'    => array(),
				),
				'default' => array(
					'Length'  => Suggestion_Defaults::get_default_length( $excerpt_options ),
					'Persona' => Suggestion_Defaults::get_default_persona( $excerpt_options ),
					'Tone'    => Suggestion_Defaults::get_default_tone( $excerpt_options ),
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
					'Metric' => array( 'views', 'avg_engaged' ),
					'Open'   => array( true, false ),
					'Period' => array( '10m', '1h', '2h', '4h', '24h', '7d', '30d' ),
				),
				'default' => array(
					'Metric' => 'views',
					'Open'   => false,
					'Period' => '7d',
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
					'Persona' => Suggestion_Defaults::get_default_persona( $title_options ),
					'Tone'    => Suggestion_Defaults::get_default_tone( $title_options ),
				),
			),
		);
	}

	/**
	 * Sanitizes the passed subvalue.
	 *
	 * Extends the parent implementation with a range check for the desired
	 * excerpt length, which the enumerated valid values cannot express.
	 *
	 * @since 3.24.0
	 *
	 * @param string $composite_key The subvalue's key.
	 * @param mixed  $value         The value to sanitize.
	 * @return mixed The sanitized subvalue.
	 */
	protected function sanitize_subvalue( string $composite_key, $value ) {
		if ( 'ExcerptSuggestions.Length' === $composite_key ) {
			if ( ! is_int( $value ) ||
				$value < self::MIN_EXCERPT_LENGTH ||
				$value > self::MAX_EXCERPT_LENGTH
			) {
				return Suggestion_Defaults::get_default_length(
					Suggestion_Defaults::get_feature_options( $this->parsely, 'excerpt_suggestions' )
				);
			}

			return $value;
		}

		return parent::sanitize_subvalue( $composite_key, $value );
	}
}
