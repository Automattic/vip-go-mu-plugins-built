<?php
/**
 * Admin menu items for the Gist Answers plugin.
 *
 * @package GistAnswers
 */

namespace GistAnswers\Admin;

use GistAnswers\Admin\NetworkMenu;
use GistAnswers\Plugin\Utilities;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin menu items for the Gist Answers plugin.
 */
final class MenuItems {

	private const DEVELOPER_MENU_FLAG_NAME = 'GIST_ANSWERS_SHOW_DEVELOPER_MENU';

	/**
	 * Get the list of public menu items (always visible).
	 *
	 * @return array<object> Array of public menu item objects.
	 */
	private static function get_public(): array {
		return array(
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Dashboard',
			),
		);
	}

	/**
	 * Get the list of protected menu items (visible only when connected).
	 *
	 * @return array<object> Array of protected menu item objects.
	 */
	private static function get_protected(): array {
		return array(
			(object) array(
				'type' => 'divider_heading',
				'name' => 'Manage',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Widgets',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Questions',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Sandbox',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Website Settings',
			),
			(object) array(
				'type' => 'divider_heading',
				'name' => 'Reports',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Answers',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Content Usage',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Revenue',
			),
		);
	}

	/**
	 * Get the list of developer menu items (visible only when the flag is set).
	 *
	 * @return array<object> Array of developer menu item objects.
	 */
	public static function get_developer(): array {
		return array(
			(object) array(
				'type' => 'divider_heading',
				'name' => 'Developer',
			),
			(object) array(
				'type'       => 'menu_subitem',
				'class_name' => 'Tools Options',
			),
		);
	}

	/**
	 * Determine whether the developer menu should be shown based on the defined constant.
	 *
	 * @return bool True if the developer menu should be shown, false otherwise.
	 */
	public static function should_show_developer_menu(): bool {
		return defined( self::DEVELOPER_MENU_FLAG_NAME ) && constant( self::DEVELOPER_MENU_FLAG_NAME );
	}

	/**
	 * Get the list of all available menu items.
	 *
	 * @return array<object> Array of all menu item objects.
	 */
	public static function get_all(): array {
		return array_merge(
			self::get_public(),
			self::get_protected(),
			self::should_show_developer_menu() ? self::get_developer() : array(),
		);
	}

	/**
	 * Get the list of menu items that are available when connected.
	 *
	 * @return array<object> Array of menu item objects.
	 */
	public static function get_connected(): array {
		return array_merge(
			self::get_public(),
			self::get_protected(),
			self::should_show_developer_menu() ? self::get_developer() : array(),
		);
	}

	/**
	 * Get the list of menu items that are available when disconnected.
	 */
	public static function get_disconnected(): array {
		return array_merge(
			self::get_public(),
			self::should_show_developer_menu() ? self::get_developer() : array(),
		);
	}

	/**
	 * Validate the given menu items against the expected format.
	 *
	 * @param array<object> $menu_items The list of menu items to be validated.
	 *
	 * @return bool
	 */
	public static function are_valid( array $menu_items = array() ): bool {

		if ( empty( $menu_items ) ) {
			$menu_items = self::get_all();
		}

		$found_errors = false;

		foreach ( $menu_items as $menu_item ) {
			switch ( $menu_item->type ?? null ) {
				case 'divider_heading':
					$name = $menu_item->name ?? null;

					if ( empty( $name ) ) {
						$found_errors = true;
					}

					break;

				case 'menu_subitem':
					$class_name = $menu_item->class_name ?? null;

					if ( empty( $class_name ) ) {
						$found_errors = true;
					}

					break;

				default:
					$found_errors = true;
			}
		}

		return ! $found_errors;
	}

	/**
	 * Determine whether the given menu templates exist.
	 *
	 * @param array<object> $menu_items The list of menu items to be validated.
	 *
	 * @return bool
	 */
	public static function templates_exist( array $menu_items = array() ): bool {

		if ( empty( $menu_items ) ) {
			$menu_items = self::get_all();
		}

		$found_errors = false;

		foreach ( $menu_items as $menu_item ) {
			switch ( $menu_item->type ?? null ) {
				case 'menu_subitem':
					[ , $slug ] = Utilities::extract_class_name_details( $menu_item->class_name ?? '' );

					$template_path = GIST_ANSWERS_PLUGIN_DIR . "templates/admin-menu/$slug.php";

					if ( ! file_exists( $template_path ) ) {
						$found_errors = true;
					}
			}
		}

		return ! $found_errors;
	}

	/**
	 * Get the admin menu subpath (the part that comes after /wp-admin/) for a given class name.
	 *
	 * @param string $class_name The name of the class for the desired admin submenu path.
	 *
	 * @return string The admin menu subpath corresponding to the given class name.
	 */
	public static function get_admin_menu_subpath_for_class( string $class_name ): string {

		[ , $slug ] = Utilities::extract_class_name_details( $class_name );

		return self::get_admin_menu_subpath_for_slug( $slug );
	}

	/**
	 * Get the admin menu subpath (the part that comes after /wp-admin/) for a given class slug.
	 *
	 * @param string $slug The slug of the class for the desired admin submenu path.
	 *
	 * @return string The admin menu subpath corresponding to the given class slug.
	 */
	public static function get_admin_menu_subpath_for_slug( string $slug ): string {
		return "admin.php?page=gist-answers-$slug";
	}

	/**
	 * Get the admin menu full URL for a given class name.
	 *
	 * @param string $class_name The name of the class for the desired admin menu URL.
	 *
	 * @return string The full URL to the admin menu corresponding to the given class name.
	 */
	public static function get_admin_menu_url_for_class( string $class_name ): string {
		return admin_url( self::get_admin_menu_subpath_for_class( $class_name ) );
	}

	/**
	 * Get the translated menu item name for a given class name.
	 *
	 * @param string $class_name The name of the class for the desired menu item.
	 *
	 * @return string The translated menu item name corresponding to the given class name.
	 */
	public static function get_translated_menu_item_name_for( string $class_name ): string {

		[ $display_name ] = Utilities::extract_class_name_details( $class_name );

		return $display_name;
	}

	/**
	 * Get the admin menu URL for the Gist Answers network settings page.
	 *
	 * @return string The full URL to the Gist Answers network settings page.
	 */
	public static function get_admin_menu_url_for_network(): string {
		return network_admin_url( 'admin.php?page=' . NetworkMenu::NETWORK_MENU_SLUG );
	}

	/**
	 * Get the admin menu slug for a given class name.
	 *
	 * @param string $class_name The name of the class for the desired admin menu slug.
	 *
	 * @return string The admin menu slug corresponding to the given class name.
	 */
	public static function get_admin_menu_slug_for( string $class_name ): string {

		[ , $slug ] = Utilities::extract_class_name_details( $class_name );

		return "gist-answers-$slug";
	}

	/**
	 * Translate the given class display name.
	 *
	 * @param string $display_name The class display name to be translated.
	 * @param string $fallback     Optional fallback value to be used if translation is not available.
	 *
	 * @return string Translated display name for the class.
	 */
	public static function translate_class_display_name( string $display_name, string $fallback = '' ): string {

		$fallback = $fallback ? $fallback : $display_name;

		$translated_names = array(
			'Dashboard'        => __( 'Dashboard', 'gist-answers' ),
			'Widgets'          => __( 'Widgets', 'gist-answers' ),
			'Questions'        => __( 'Questions', 'gist-answers' ),
			'Sandbox'          => _x( 'Sandbox', 'noun', 'gist-answers' ),
			'Website Settings' => __( 'Website Settings', 'gist-answers' ),
			'Answers'          => _x( 'Answers', 'plural noun', 'gist-answers' ),
			'Content Usage'    => __( 'Content Usage', 'gist-answers' ),
			'Revenue'          => __( 'Revenue', 'gist-answers' ),
			'Tools Options'    => __( 'Tools & Options', 'gist-answers' ),
		);

		return $translated_names[ $display_name ] ?? $fallback;
	}

	/**
	 * Translate the given divider heading display name.
	 *
	 * @param string $display_name The divider heading display name to be translated.
	 * @param string $fallback     Optional fallback value to be used if translation is not available.
	 *
	 * @return string Translated display name for the divider heading.
	 */
	public static function translate_divider_heading_display_name( string $display_name, string $fallback = '' ): string {

		$fallback = $fallback ? $fallback : $display_name;

		$translated_names = array(
			'Manage'    => __( 'Manage', 'gist-answers' ),
			'Reports'   => _x( 'Reports', 'plural noun', 'gist-answers' ),
			'Developer' => __( 'Developer', 'gist-answers' ),
		);

		return $translated_names[ $display_name ] ?? $fallback;
	}
}
