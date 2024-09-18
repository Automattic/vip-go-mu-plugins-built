<?php
/**
 * Nested governance processing.
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

use WP_Theme_JSON;
use WP_Theme_JSON_Gutenberg;
use WP_Block_Type_Registry;

defined( 'ABSPATH' ) || die();

/**
 * Nested governance processing class that's used to process nested settings.
 */
class NestedGovernanceProcessing {
	/**
	 * Nested settings and css that's used to process nested settings.
	 *
	 * @var array
	 */
	private static $nested_settings_and_css = null;

	/**
	 * Default origin, and preset base for the settings.
	 *
	 * @var string
	 */
	private const DEFAULT_ORIGIN = 'theme';

	/**
	 * Get the nested settings and css that's used to process nested settings.
	 *
	 * @param array $governance_rules Ggovernance rules, specific to a user.
	 *
	 * @return array Nested settings and css.
	 *
	 * @access private
	 */
	public static function get_nested_settings_and_css( $governance_rules ) {
		if ( null !== self::$nested_settings_and_css ) {
			return self::$nested_settings_and_css;
		}

		// Get all the registered blocks from the server-side registry.
		$blocks_registered = WP_Block_Type_Registry::get_instance()->get_all_registered();
		// Get the map of paths to block settings, and their corresponding CSS selectors.
		$setting_nodes = static::get_settings_of_blocks( $blocks_registered, $governance_rules );

		if ( class_exists( 'WP_Theme_JSON_Gutenberg' ) ) {
			$presets_metadata = WP_Theme_JSON_Gutenberg::PRESETS_METADATA;
		} else {
			$presets_metadata = WP_Theme_JSON::PRESETS_METADATA;
		}

		// Get the massaged settings and css together for the nested blocks.
		self::$nested_settings_and_css = static::get_css_and_theme_settings( $governance_rules, $setting_nodes, $presets_metadata );

		return self::$nested_settings_and_css;
	}

	/**
	 * Builds the metadata for settings.blocks, whilst ensuring support for nested blocks. This returns in the form of:
	 *
	 *     [
	 *       [
	 *         'path'     => ['path', 'to', 'some', 'node' ],
	 *         'selector' => 'CSS selector for some node'
	 *       ],
	 *       [
	 *         'path'     => [ 'path', 'to', 'other', 'node' ],
	 *         'selector' => 'CSS selector for other node'
	 *       ],
	 *     ]
	 *
	 * @param array $blocks_registered List of valid blocks.
	 * @param array $current_block     The current block to break down.
	 * @param array $nodes             The metadata of the nodes that have been built so far.
	 * @param array $current_selector  The current selector of the current block.
	 * @param array $current_path      The current path to the block.
	 *
	 * @return array
	 */
	private static function get_settings_of_blocks( $blocks_registered, $current_block, $nodes = [], $current_selector = null, $current_path = [] ) {
		foreach ( $current_block as $block_name => $block ) {
			if ( ! self::is_block_supported( $block_name, $blocks_registered ) ) {
				continue;
			}

			$selector = is_null( $current_selector ) ? null : $current_selector;

			// If the block name ends with /* or is just *, then it's a wildcard rule and we need to use the wp-block selector to match against any block.
			if ( str_ends_with( $block_name, '/*' ) || ( '*' === $block_name ) ) {
				// Due to the fact that the paragraph block doesn't have a wp-block-paragraph class, we need to add it manually.
				// In addition, wp-block is prefixed to the block name so this allows us to target all blocks.
				$looked_up_selector = 'p, [class*=wp-block]';
			} elseif ( function_exists( ( 'wp_get_block_css_selector' ) ) ) {
				$looked_up_selector = wp_get_block_css_selector( $blocks_registered[ $block_name ] );
			} else {
				// ToDo: Once our minimum WordPress version >= 6.3, this can be deleted.
				$looked_up_selector = self::get_css_selector_for_block( $block_name, $blocks_registered );
			}

			if ( ! is_null( $looked_up_selector ) ) {
				$selector = $selector . ' ' . $looked_up_selector;
			}

			$path = empty( $current_path ) ? array( 'settings', 'blocks' ) : $current_path;
			array_push( $path, $block_name );

			$nodes[] = array(
				'path'     => $path,
				'selector' => $selector,
			);

			$nodes = static::get_settings_of_blocks( $blocks_registered, $block, $nodes, $selector, $path );
		}

		return $nodes;
	}

	/**
	 * Validates if a block is supported.
	 *
	 * Supported blocks are blocks that are registered in the block registry, or blocks that are wildcard blocks.
	 *
	 * @param string $block_name     The name of the block.
	 * @param array  $blocks_registered The blocks that are registered in the block registry.
	 * @return boolean True if the block is supported, false otherwise.
	 */
	private static function is_block_supported( $block_name, $blocks_registered ) {
		return array_key_exists( $block_name, $blocks_registered ) || str_ends_with( $block_name, '/*' ) || ( '*' === $block_name );
	}

	/**
	 * Combine the block metadata with the presets to generate the nested settings and css, that would be used for nested governance
	 *
	 * @param [type] $governance_rules  Governance rules to be used.
	 * @param [type] $path_and_selector_of_blocks the map of paths and selectors for each block.
	 * @param [type] $presets_metadata Preset metadata from Gutenberg/WordPress.
	 *
	 * @return array
	 */
	private static function get_css_and_theme_settings( $governance_rules, $path_and_selector_of_blocks, $presets_metadata ) {
		// Expected theme.json path.
		$theme_json = array(
			'settings' => array(
				'blocks' => $governance_rules,
			),
		);

		$stylesheet = '';

		foreach ( $path_and_selector_of_blocks as $path_and_selector_of_block ) {
			foreach ( $presets_metadata as $preset_metadata ) {
				// Append the path of the property with the path from the block settings.
				$path = array_merge( $path_and_selector_of_block['path'], $preset_metadata['path'] );
				// Get the preset value from the theme.json.
				$preset = _wp_array_get( $theme_json, $path, null );
				if ( null !== $preset ) {
					// If the preset is not already keyed with an origin.
					if ( isset( $preset[0] ) || empty( $preset ) ) {
						// Add theme as the top level item for each preset value.
						_wp_array_set( $theme_json, $path, array( self::DEFAULT_ORIGIN => $preset ) );
					}
				}

				if ( null === $path_and_selector_of_block['selector'] ) {
					continue;
				}

				$setting        = _wp_array_get( $theme_json, $path_and_selector_of_block['path'], [] );
				$declarations   = [];
				$values_by_slug = static::get_settings_values_by_slug( $setting, $preset_metadata );
				foreach ( $values_by_slug as $slug => $value ) {
					$declarations[] = array(
						'name'  => static::replace_slug_in_string( $preset_metadata['css_vars'], $slug ),
						'value' => $value,
					);
				}

				$stylesheet .= static::to_ruleset( $path_and_selector_of_block['selector'], $declarations );

				$slugs = static::get_settings_slugs( $setting, $preset_metadata );
				foreach ( $preset_metadata['classes'] as $class => $property ) {
					foreach ( $slugs as $slug ) {
						$css_var    = static::replace_slug_in_string( $preset_metadata['css_vars'], $slug );
						$class_name = static::replace_slug_in_string( $class, $slug );

						// $selector is often empty, so we can save ourselves the `append_to_selector()` call then.
						$new_selector = '' === $path_and_selector_of_block['selector'] ? $class_name : static::append_to_selector( $path_and_selector_of_block['selector'], $class_name );
						$stylesheet  .= static::to_ruleset(
							$new_selector,
							array(
								array(
									'name'  => $property,
									'value' => 'var(' . $css_var . ') !important',
								),
							)
						);
					}
				}
			}
		}

		return array(
			'settings' => $theme_json['settings']['blocks'],
			'css'      => $stylesheet,
		);
	}

	/**
	 * Appends a sub-selector to an existing one.
	 *
	 * Given the compounded $selector "h1, h2, h3"
	 * and the $to_append selector ".some-class" the result will be
	 * "h1.some-class, h2.some-class, h3.some-class".
	 *
	 * @since 5.8.0
	 * @since 6.1.0 Added append position.
	 * @since 6.3.0 Removed append position parameter.
	 *
	 * @param string $selector  Original selector.
	 * @param string $to_append Selector to append.
	 *
	 * @return string New selector.
	 */
	private static function append_to_selector( $selector, $to_append ) {
		if ( ! str_contains( $selector, ',' ) ) {
			return $selector . $to_append;
		}
		$new_selectors = [];
		$selectors     = explode( ',', $selector );
		foreach ( $selectors as $sel ) {
			$new_selectors[] = $sel . $to_append;
		}
		return implode( ',', $new_selectors );
	}

	/**
	 * Similar to get_settings_values_by_slug, but doesn't compute the value.
	 *
	 * @since 5.9.0
	 *
	 * @param array $settings        Settings to process.
	 * @param array $preset_metadata One of the PRESETS_METADATA values.
	 *
	 * @return array Array of presets where the key and value are both the slug.
	 */
	private static function get_settings_slugs( $settings, $preset_metadata ) {
		$preset_per_origin = _wp_array_get( $settings, $preset_metadata['path'], [] );

		$result = [];
		if ( isset( $preset_per_origin[ self::DEFAULT_ORIGIN ] ) ) {
			foreach ( $preset_per_origin[ self::DEFAULT_ORIGIN ] as $preset ) {
				$slug = _wp_to_kebab_case( $preset['slug'] );

				$result[ $slug ] = $slug;
			}
		}

		return $result;
	}

	/**
	 * Given a selector and a declaration list,
	 * creates the corresponding ruleset.
	 *
	 * @since 5.8.0
	 *
	 * @param string $selector     CSS selector.
	 * @param array  $declarations List of declarations.
	 *
	 * @return string Resulting CSS ruleset.
	 */
	private static function to_ruleset( $selector, $declarations ) {
		if ( empty( $declarations ) ) {
			return '';
		}

		$declaration_block = array_reduce(
			$declarations,
			static function ( $carry, $element ) {
				return $carry .= $element['name'] . ': ' . $element['value'] . ';'; },
			''
		);

		return $selector . '{' . $declaration_block . '}';
	}

	/**
	 * Gets preset values keyed by slugs based on settings and metadata.
	 *
	 * <code>
	 * $settings = array(
	 *     'typography' => array(
	 *         'fontFamilies' => array(
	 *             array(
	 *                 'slug'       => 'sansSerif',
	 *                 'fontFamily' => '"Helvetica Neue", sans-serif',
	 *             ),
	 *             array(
	 *                 'slug'   => 'serif',
	 *                 'colors' => 'Georgia, serif',
	 *             )
	 *         ),
	 *     ),
	 * );
	 * $meta = array(
	 *    'path'      => array( 'typography', 'fontFamilies' ),
	 *    'value_key' => 'fontFamily',
	 * );
	 * $values_by_slug = get_settings_values_by_slug();
	 * // $values_by_slug === array(
	 * //   'sans-serif' => '"Helvetica Neue", sans-serif',
	 * //   'serif'      => 'Georgia, serif',
	 * // );
	 * </code>
	 *
	 * @since 5.9.0
	 *
	 * @param array $settings        Settings to process.
	 * @param array $preset_metadata One of the PRESETS_METADATA values.
	 *
	 * @return array Array of presets where each key is a slug and each value is the preset value.
	 */
	private static function get_settings_values_by_slug( $settings, $preset_metadata ) {
		$preset_per_origin = _wp_array_get( $settings, $preset_metadata['path'], [] );

		$result = [];

		if ( isset( $preset_per_origin[ self::DEFAULT_ORIGIN ] ) ) {
			foreach ( $preset_per_origin[ self::DEFAULT_ORIGIN ] as $preset ) {
				$slug = _wp_to_kebab_case( $preset['slug'] );

				$value = '';
				if ( isset( $preset_metadata['value_key'], $preset[ $preset_metadata['value_key'] ] ) ) {
					$value_key = $preset_metadata['value_key'];
					$value     = $preset[ $value_key ];
				} elseif (
					isset( $preset_metadata['value_func'] ) &&
					is_callable( $preset_metadata['value_func'] )
				) {
					$value_func = $preset_metadata['value_func'];
					$value      = call_user_func( $value_func, $preset );
				} else {
					// If we don't have a value, then don't add it to the result.
					continue;
				}

				$result[ $slug ] = $value;
			}
		}

		return $result;
	}

	/**
	 * Transforms a slug into a CSS Custom Property.
	 *
	 * @since 5.9.0
	 *
	 * @param string $input String to replace.
	 * @param string $slug  Slug value to use to generate the custom property.
	 *
	 * @return string CSS Custom Property. Something along the lines of `--wp--preset--color--black`.
	 */
	private static function replace_slug_in_string( $input, $slug ) {
		return strtr( $input, array( '$slug' => $slug ) );
	}

	/**
	 * Get the CSS selector for a block using the block name
	 *
	 * This method is only used for WordPress versions below 6.3. After 6.3, we have a built in
	 * way of accessing this selector. This will be deprecated once 6.3 is available for a
	 * majority of VIP sites.
	 *
	 * @param string $block_name Name of the block.
	 * @param array  $blocks_registered Blocks that are allowed via the block registry.
	 *
	 * @return string the css selector for the block.
	 */
	private static function get_css_selector_for_block( $block_name, $blocks_registered ) {
		$block = $blocks_registered[ $block_name ];
		if (
			isset( $block->supports['__experimentalSelector'] ) &&
			is_string( $block->supports['__experimentalSelector'] )
		) {
			return $block->supports['__experimentalSelector'];
		} else {
			return '.wp-block-' . str_replace( '/', '-', str_replace( 'core/', '', $block_name ) );
		}
	}
}
