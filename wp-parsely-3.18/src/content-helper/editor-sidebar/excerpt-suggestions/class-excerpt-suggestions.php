<?php
/**
 * Content Helper: Excerpt Suggestions feature class
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper;

use Parsely\Content_Helper\Editor_Sidebar\Editor_Sidebar_Feature;

/**
 * Content Helper: Excerpt Suggestions feature class
 *
 * @since 3.13.0
 * @since 3.17.0 Renamed to Excerpt Suggestions and converted to an Editor Sidebar feature.
 */
class Excerpt_Suggestions extends Editor_Sidebar_Feature {
	/**
	 * Returns the feature's name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_feature_name(): string {
		return 'excerpt_suggestions';
	}

	/**
	 * Returns the feature's filter name.
	 *
	 * This is deprecated in favor of the new wp_parsely_current_user_can_use_pch_feature filter.
	 *
	 * @since 3.17.0
	 *
	 * @return string The filter name.
	 */
	public static function get_feature_filter_name(): string {
		return self::get_global_filter_name() . '_excerpt_generator';
	}

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Editor_Sidebar $editor_sidebar Instance of Editor_Sidebar class.
	 */
	public function __construct( Editor_Sidebar $editor_sidebar ) {
		parent::__construct( $editor_sidebar );

		// Check if the feature is disabled using the global and feature filters.
		if ( has_filter( self::get_feature_filter_name() ) ) {
			add_filter(
				'wp_parsely_current_user_can_use_pch_feature',
				array( $this, 'callback_is_feature_enabled' ),
				10,
				2
			);
		}
	}

	/**
	 * Checks if the feature is disabled via the global or feature filters.
	 *
	 * If the feature is disabled via the global or feature filters, return false,
	 * thereby disabling the feature.
	 *
	 * This throws a deprecated notice if the feature filter name is in use.
	 *
	 * @since 3.17.0
	 *
	 * @param ?bool  $current_user_can_use_pch_feature Whether the current user can use the feature.
	 * @param string $feature_name The feature's name.
	 * @return ?bool  Returns false if the feature is disabled via filters.
	 */
	public function callback_is_feature_enabled(
		?bool $current_user_can_use_pch_feature,
		string $feature_name
	): ?bool {
		if ( static::get_feature_name() === $feature_name ) {
			// Check if the feature is disabled using the global and feature filters.
			$feature_enabled_with_filter = apply_filters_deprecated(
				self::get_feature_filter_name(),
				array( true ),
				'3.17.0',
				'wp_parsely_current_user_can_use_pch_feature'
			);

			// If the feature is disabled via the global or feature filters, return false.
			if ( false === $feature_enabled_with_filter ) {
				return false;
			}
		}

		return $current_user_can_use_pch_feature;
	}

	/**
	 * Inserts Content Helper Excerpt Suggestions inline scripts.
	 *
	 * @since 3.17.0
	 */
	public function run(): void {
		// Do nothing.
	}
}
