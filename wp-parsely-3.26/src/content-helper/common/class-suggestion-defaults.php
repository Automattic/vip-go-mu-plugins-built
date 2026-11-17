<?php
/**
 * Content Intelligence: Suggestion defaults
 *
 * @package Parsely
 * @since   3.24.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use Parsely\Parsely;

/**
 * Holds the vocabulary and the site-wide generation defaults shared by the
 * suggestion features.
 *
 * This is the single source of the tones and personas. They are injected into
 * the Editor Sidebar, so that the plugin's settings page can offer the same
 * choices as the editor without restating them.
 *
 * @since 3.24.0
 */
class Suggestion_Defaults {
	/**
	 * The minimum desired excerpt length, in characters.
	 *
	 * Kept in sync with MIN_EXCERPT_LENGTH in excerpt-suggestions/constants.ts.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const MIN_LENGTH = 50;

	/**
	 * The maximum desired excerpt length, in characters.
	 *
	 * Kept in sync with MAX_EXCERPT_LENGTH in excerpt-suggestions/constants.ts.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const MAX_LENGTH = 300;

	/**
	 * The default desired excerpt length, in characters.
	 *
	 * Kept in sync with DEFAULT_EXCERPT_LENGTH in
	 * excerpt-suggestions/constants.ts.
	 *
	 * @since 3.24.0
	 *
	 * @var int
	 */
	public const DEFAULT_LENGTH = 160;

	/**
	 * The tone used when none is configured.
	 *
	 * Kept in sync with DEFAULT_TONE in common/utils/constants.ts.
	 *
	 * @since 3.24.0
	 *
	 * @var string
	 */
	public const DEFAULT_TONE = 'neutral';

	/**
	 * The persona used when none is configured.
	 *
	 * Kept in sync with DEFAULT_PERSONA in common/utils/constants.ts.
	 *
	 * @since 3.24.0
	 *
	 * @var string
	 */
	public const DEFAULT_PERSONA = 'journalist';

	/**
	 * Returns a Content Intelligence feature's site-wide options.
	 *
	 * @since 3.24.0
	 *
	 * @param Parsely $parsely    The Parsely instance holding the options.
	 * @param string  $feature_id The feature's name.
	 * @return array<string, mixed> The feature's options.
	 */
	public static function get_feature_options( Parsely $parsely, string $feature_id ): array {
		/** @var array<string, mixed> $options */
		$options = $parsely->get_options()['content_helper'][ $feature_id ] ?? array();

		return $options;
	}

	/**
	 * Returns the predefined tones, keyed by their stored value.
	 *
	 * The custom tone is absent, as the Tone Selector adds it. It is a UI
	 * affordance rather than part of the vocabulary, and a site-wide default
	 * cannot carry the free-text value that gives it meaning.
	 *
	 * @since 3.24.0
	 *
	 * @return array<string, string> The tones, as value => label pairs.
	 */
	public static function get_tones(): array {
		return array(
			'neutral'        => __( 'Neutral', 'wp-parsely' ),
			'formal'         => __( 'Formal', 'wp-parsely' ),
			'humorous'       => __( 'Humorous', 'wp-parsely' ),
			'confident'      => __( 'Confident', 'wp-parsely' ),
			'provocative'    => __( 'Provocative', 'wp-parsely' ),
			'serious'        => __( 'Serious', 'wp-parsely' ),
			'inspirational'  => __( 'Inspirational', 'wp-parsely' ),
			'skeptical'      => __( 'Skeptical', 'wp-parsely' ),
			'conversational' => __( 'Conversational', 'wp-parsely' ),
			'analytical'     => __( 'Analytical', 'wp-parsely' ),
		);
	}

	/**
	 * Returns the predefined personas, keyed by their stored value.
	 *
	 * The custom persona is absent, for the same reason as the custom tone.
	 *
	 * @since 3.24.0
	 *
	 * @return array<string, string> The personas, as value => label pairs.
	 */
	public static function get_personas(): array {
		return array(
			'journalist'              => __( 'Journalist', 'wp-parsely' ),
			'editorialWriter'         => __( 'Editorial Writer', 'wp-parsely' ),
			'investigativeReporter'   => __( 'Investigative Reporter', 'wp-parsely' ),
			'techAnalyst'             => __( 'Tech Analyst', 'wp-parsely' ),
			'businessAnalyst'         => __( 'Business Analyst', 'wp-parsely' ),
			'culturalCommentator'     => __( 'Cultural Commentator', 'wp-parsely' ),
			'scienceCorrespondent'    => __( 'Science Correspondent', 'wp-parsely' ),
			'politicalAnalyst'        => __( 'Political Analyst', 'wp-parsely' ),
			'healthWellnessAdvocate'  => __( 'Health and Wellness Advocate', 'wp-parsely' ),
			'environmentalJournalist' => __( 'Environmental Journalist', 'wp-parsely' ),
		);
	}

	/**
	 * Returns a feature's site-wide default excerpt length.
	 *
	 * Falls back to the shipped default when the option is missing, which is
	 * the case for installations that predate these settings, or when it holds
	 * an out-of-range value.
	 *
	 * @since 3.24.0
	 *
	 * @param array<string, mixed> $feature_options The feature's options.
	 * @return int The default length, in characters.
	 */
	public static function get_default_length( array $feature_options ): int {
		$length = $feature_options['default_length'] ?? self::DEFAULT_LENGTH;

		if ( ! is_int( $length ) ||
			$length < self::MIN_LENGTH ||
			$length > self::MAX_LENGTH
		) {
			return self::DEFAULT_LENGTH;
		}

		return $length;
	}

	/**
	 * Returns a feature's site-wide default tone.
	 *
	 * @since 3.24.0
	 *
	 * @param array<string, mixed> $feature_options The feature's options.
	 * @return string The default tone.
	 */
	public static function get_default_tone( array $feature_options ): string {
		$tone = $feature_options['default_tone'] ?? self::DEFAULT_TONE;

		if ( ! is_string( $tone ) || ! isset( self::get_tones()[ $tone ] ) ) {
			return self::DEFAULT_TONE;
		}

		return $tone;
	}

	/**
	 * Returns a feature's site-wide default persona.
	 *
	 * @since 3.24.0
	 *
	 * @param array<string, mixed> $feature_options The feature's options.
	 * @return string The default persona.
	 */
	public static function get_default_persona( array $feature_options ): string {
		$persona = $feature_options['default_persona'] ?? self::DEFAULT_PERSONA;

		if ( ! is_string( $persona ) || ! isset( self::get_personas()[ $persona ] ) ) {
			return self::DEFAULT_PERSONA;
		}

		return $persona;
	}
}
