<?php
/**
 * Editor Sidebar: Base class for all Editor Sidebar features
 *
 * @package Parsely
 * @since 3.17.0
 */

declare(strict_types=1);

namespace Parsely\Content_Helper\Editor_Sidebar;

use Parsely\Content_Helper\Content_Helper_Feature;
use Parsely\Content_Helper\Editor_Sidebar;
use Parsely\Permissions;

/**
 * Base class for all Editor Sidebar features.
 *
 * @since 3.17.0
 */
abstract class Editor_Sidebar_Feature extends Content_Helper_Feature {
	/**
	 * Returns the feature's name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	abstract public static function get_feature_name(): string;

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Editor_Sidebar $editor_sidebar Instance of Editor_Sidebar class.
	 */
	public function __construct( Editor_Sidebar $editor_sidebar ) {
		$this->parsely = $editor_sidebar->parsely;
	}

	/**
	 * Returns whether the feature can be enabled for the current user.
	 *
	 * @since 3.16.0
	 * @since 3.17.0 Moved to Editor_Sidebar_Feature class.
	 *
	 * @param bool ...$conditions Conditions that need to be met besides filters
	 *                            for the function to return true.
	 * @return bool Whether the feature can be enabled.
	 */
	protected function can_enable_feature( bool ...$conditions ): bool {
		if ( ! parent::can_enable_feature( ...$conditions ) ) {
			return false;
		}

		return Permissions::current_user_can_use_pch_feature(
			static::get_feature_name(),
			$this->parsely->get_options()['content_helper'],
			get_the_ID()
		);
	}

	/**
	 * Returns the feature's filter name. The feature filter controls the
	 * enabled/disabled state of a particular Content Helper feature.
	 *
	 * Not in use for Editor Sidebar features.
	 *
	 * @since 3.17.0
	 *
	 * @return string The filter name.
	 */
	public static function get_feature_filter_name(): string {
		return ''; // Not in use for this feature.
	}

	/**
	 * Returns the feature's script ID.
	 *
	 * Not in use for Editor Sidebar features.
	 *
	 * @since 3.17.0
	 *
	 * @return string The script ID.
	 */
	public static function get_script_id(): string {
		return '';
	}

	/**
	 * Returns the feature's style ID.
	 *
	 * Not in use for Editor Sidebar features.
	 *
	 * @since 3.17.0
	 *
	 * @return string The style ID.
	 */
	public static function get_style_id(): string {
		return '';
	}
}
