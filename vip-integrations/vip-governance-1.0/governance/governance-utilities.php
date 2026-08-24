<?php
/**
 * Utilities for Block Governance.
 *
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

defined( 'ABSPATH' ) || die();

use WP_Error;

/**
 * Utilities class that has helper functions for processing the governance rules.
 */
class GovernanceUtilities {

	/**
	 * Retrieve parsed governance rules from the private directory, or the plugin directory if not found.
	 *
	 * @return array|WP_Error
	 *
	 * @access private
	 */
	public static function get_parsed_governance_rules(): array|WP_Error {
		$governance_rules_json = self::get_governance_rules_json();
		if ( is_wp_error( $governance_rules_json ) ) {
			return $governance_rules_json;
		}

		$parse_result = RulesParser::parse_with_warnings( $governance_rules_json );

		return is_wp_error( $parse_result ) ? $parse_result : $parse_result['rules'];
	}

	/**
	 * Get raw governance rules content from the private directory, or the plugin directory if not found.
	 *
	 * @return string|WP_Error
	 *
	 * @access private
	 */
	public static function get_governance_rules_json(): string|WP_Error {
		// Default rules file within the plugin, that's used for demo purposes.
		$governance_file_path = WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR . '/' . WPCOMVIP_GOVERNANCE_RULES_FILENAME;

		// Only on VIP sites, the private directory exists as well as its config so that use that instead.
		if ( defined( 'WPCOM_VIP_PRIVATE_DIR' ) && file_exists( WPCOM_VIP_PRIVATE_DIR . '/' . WPCOMVIP_GOVERNANCE_RULES_FILENAME ) ) {
			$governance_file_path = WPCOM_VIP_PRIVATE_DIR . '/' . WPCOMVIP_GOVERNANCE_RULES_FILENAME;
		}

		// Filter options that can be used to customize the governance rules that could be used.
		$filter_options = [
			'site_id' => get_current_blog_id(),
		];

		/**
		 * Filter the governance file path, based on the filter options provided.
		 *
		 * Currently supported keys:
		 *
		 * site_id: The site ID for the current site.
		 *
		 * @param string $governance_file_path Path to the governance file.
		 * @param array $filter_options Options that can be used as a filter for determining the right file.
		 */
		$filter_file_path = apply_filters( 'vip_governance__governance_file_path', $governance_file_path, $filter_options );
		if ( ! is_string( $filter_file_path ) || '' === $filter_file_path ) {
			return new WP_Error( 'governance-file-path-invalid', __( 'Governance rules path must be a non-empty string.', 'vip-governance' ) );
		}

		// Make sure the path is normalized. Note that file_exists() is still needed at times.
		$filter_file_path = realpath( $filter_file_path );

		// if the value is false, throw a file not found error right away.
		if ( false === $filter_file_path ) {
			return new WP_Error( 'governance-file-not-found', __( 'Governance rules could not be found.', 'vip-governance' ) );
		}

		// Make sure the file is a JSON file.
		if ( $filter_file_path && $filter_file_path !== $governance_file_path && ! str_ends_with( $filter_file_path, '.json' ) ) {
			/* translators: %s: filter file path */
			return new WP_Error( 'governance-file-not-json', sprintf( __( 'Governance rules (%s) must be a JSON file.', 'vip-governance' ), $filter_file_path ) );
		}

		$governance_file_path = $filter_file_path;

		// Make sure the file exists.
		if ( ! file_exists( $governance_file_path ) ) {
			/* translators: %s: governance file name */
			return new WP_Error( 'governance-file-not-found', sprintf( __( 'Governance rules (%s) could not be found.', 'vip-governance' ), $governance_file_path ) );
		}

		// phpcs:ignore WordPressVIPMinimum.Performance.FetchingRemoteData.FileGetContentsUnknown
		$governance_rules_json = file_get_contents( $governance_file_path );

		if ( false === $governance_rules_json ) {
			return new WP_Error( 'governance-file-not-readable', __( 'Governance rules could not be read from specified folder.', 'vip-governance' ) );
		}

		/**
		 * Filter the governance rules, based on the filter options provided.
		 *
		 * Currently supported keys:
		 *
		 * site_id: The site ID for the current site.
		 *
		 * This filter can be used to either modify the governance rules content before it's parsed, or to generate the content dynamically.
		 *
		 * @param string $governance_rules_json Governance rules content.
		 * @param array $filter_options Options that can be used as a filter for determining the right rules.
		 */
		$governance_rules_json = apply_filters( 'vip_governance__governance_rules_json', $governance_rules_json, $filter_options );
		if ( ! is_string( $governance_rules_json ) ) {
			return new WP_Error( 'governance-rules-invalid', __( 'Governance rules content must be a string.', 'vip-governance' ) );
		}

		return $governance_rules_json;
	}

	/**
	 * Get user roles for governance checks, applying filter when user has no roles.
	 *
	 * In WordPress multisite environments, superadmins may have no role for a specific site.
	 * This function applies a filter to allow custom code to provide an alternative role
	 * instead of falling back to the default ruleset.
	 *
	 * @since 1.1.0
	 *
	 * @param array $user_roles Optional. User roles array. If empty or not provided, will retrieve from current user.
	 * @return array User roles array, potentially filtered if originally empty.
	 */
	private static function get_user_roles_for_governance( array $user_roles = [] ): array {
		// If roles are provided and not empty, use them as-is (e.g., from REST API with explicit role).
		if ( ! empty( $user_roles ) ) {
			return $user_roles;
		}

		// Get roles from current user if not provided or empty.
		$current_user = wp_get_current_user();
		$user_roles   = $current_user->roles;

		// If user has no roles (e.g., superadmin in multisite), allow filter to provide an alternative role.
		if ( empty( $user_roles ) ) {
			/**
			 * Filter the role to use when a user has no assigned roles.
			 *
			 * In WordPress multisite environments, superadmins may have no role for a specific site.
			 * This filter allows custom code to provide an alternative role to use instead of
			 * falling back to the default ruleset.
			 *
			 * @since 1.1.0
			 *
			 * @param string|array|null $default_role The role(s) to use when user has no roles. Can be a single role string, array of roles, or null to use default ruleset.
			 * @param WP_User $current_user The current user object.
			 * @param int $site_id The current site ID.
			 */
			$filtered_role = apply_filters( 'vip_governance__default_role_for_user_without_roles', null, $current_user, get_current_blog_id() );

			if ( null !== $filtered_role ) {
				// Normalize to array format.
				$filtered_roles = [];
				if ( is_string( $filtered_role ) ) {
					$filtered_roles = [ $filtered_role ];
				} elseif ( is_array( $filtered_role ) ) {
					$filtered_roles = $filtered_role;
				}

				// Validate that all returned roles exist in WordPress to prevent privilege escalation.
				if ( ! empty( $filtered_roles ) ) {
					$all_roles   = array_keys( wp_roles()->roles );
					$valid_roles = array_intersect( $filtered_roles, $all_roles );

					// Only use validated roles. If none are valid, fall back to default ruleset.
					if ( ! empty( $valid_roles ) ) {
						$user_roles = array_values( $valid_roles );
					}
				}
			}
		}

		return $user_roles;
	}

	/**
	 * Get the rules using the provided type.
	 *
	 * The default rule is the base upon which the other rules are built. Currently, that's postType and role.
	 *
	 * @param array  $governance_rules Governance rules, not filtered based on the user role.
	 * @param array  $user_roles       User roles for the current WP site.
	 * @param string $post_type Post type for the current post.
	 *
	 * @return array Governance rules, filtered by the matching user role or post type.
	 *
	 * @access private
	 */
	public static function get_rules_by_type( array $governance_rules, array $user_roles = [], string $post_type = '' ): array {
		if ( empty( $governance_rules ) ) {
			return [];
		}

		// This is the case where its not called by the admin UI, but in fact by the editor.
		if ( empty( $post_type ) ) {
			$post_type = get_post_type();
		}

		// Always apply the filter to get user roles, which handles empty roles case.
		$user_roles = self::get_user_roles_for_governance( $user_roles );

		$allowed_features = [];
		$allowed_blocks   = [];
		$block_settings   = [];

		// Because PHP doesn't allow passing this in directly.
		$type_to_rules_map = RulesParser::TYPE_TO_RULES_MAP;

		// Assumption is that it's been ordered by priority, so it will process those rules first followed by default last.
		foreach ( RulesParser::RULE_TYPES as $priority ) {
			// look up the rule in $governance_rules where the field type matches priority.
			$governance_rules_for_priority = array_filter( $governance_rules, function ( $rule ) use ( $priority, $user_roles, $post_type, $type_to_rules_map ): bool {
				// Its required to have the type, and its corresponding types set unless you are the default rule in which case you only need type set to default.
				if ( isset( $rule['type'] ) && $priority === $rule['type'] && ( 'default' === $priority || isset( $rule[ $type_to_rules_map[ $priority ] ] ) ) ) {
					if ( 'default' === $priority ) {
						return true;
					} elseif ( 'role' === $priority ) {
						// Only give back true if the roles match the current user.
						return ! empty( array_intersect( $user_roles, $rule['roles'] ) );
					} elseif ( 'postType' === $priority ) {
						// Only give back true if the current post type matches the post types allowed.
						return in_array( $post_type, $rule['postTypes'], true );
					}
				}

				// Rule should be ignored if it doesn't match the needed criteria for priorities.
				return false;
			} );

			if ( ! empty( $governance_rules_for_priority ) ) {
				// Re-order the rule so that the 0 index is what's first, otherwise the index is preserved.
				$governance_rules_for_priority = array_values( $governance_rules_for_priority );

				$allowed_blocks   = self::get_allowed_blocks_or_features_for_rule_type( 'allowedBlocks', $allowed_blocks, $governance_rules_for_priority[0], $priority );
				$block_settings   = self::get_block_settings_for_rule_type( $block_settings, $governance_rules_for_priority[0], $priority );
				$allowed_features = self::get_allowed_blocks_or_features_for_rule_type( 'allowedFeatures', $allowed_features, $governance_rules_for_priority[0], $priority );
			}
		}

		// return array of allowed_blocks and block_settings.
		return [
			'allowedBlocks'   => $allowed_blocks,
			'blockSettings'   => $block_settings,
			'allowedFeatures' => $allowed_features,
		];
	}

	/**
	 * Get the new allowedBlocks or allowedFeatures based on the rule type
	 *
	 * The default rule's allowedBlocks and allowedFeatures is combined with the other rule types.
	 * For non-default rule types, only one allowedBlocks and allowedFeatures can be picked. It's not combined together.
	 *
	 * @param string $allowed_type allowedBlocks or allowedFeatures.
	 * @param array  $allowed_blocks_or_features allowedBlocks or allowedFeatures that have been combined so far.
	 * @param array  $governance_rule current rule being processed.
	 * @param string $rule_type type of rule being processed.
	 * @return array allowedBlocks or allowedFeatures that have been combined so far.
	 */
	private static function get_allowed_blocks_or_features_for_rule_type( string $allowed_type, array $allowed_blocks_or_features, array $governance_rule, string $rule_type ): array {
		if ( isset( $governance_rule[ $allowed_type ] ) ) {
			// For the default rule the allowedBlocks and allowedFeatures are combined together.
			// Otherwise, there can only be one.
			if ( 'default' === $rule_type ) {
				return [ ...$allowed_blocks_or_features, ...$governance_rule[ $allowed_type ] ];
			} else {
				$allowed_blocks_or_features = $governance_rule[ $allowed_type ];
			}
		}

		return $allowed_blocks_or_features;
	}

	/**
	 * Get the new blockSettings based on the rule type
	 *
	 * The default rule's blockSettings is combined with the other rule types.
	 * For non-default rule types, only one blockSettings can be picked. It's not combined together.
	 *
	 * @param array  $block_settings blockSettings that have been combined so far.
	 * @param array  $governance_rule current rule being processed.
	 * @param string $rule_type type of rule being processed.
	 * @return array blockSettings that have been combined so far.
	 */
	private static function get_block_settings_for_rule_type( array $block_settings, array $governance_rule, string $rule_type ): array {
		if ( isset( $governance_rule['blockSettings'] ) ) {
			// For the default rule the blockSettings are combined together.
			// Otherwise, there can only be one.
			if ( 'default' === $rule_type ) {
				return self::merge_block_settings_with_defaults( $block_settings, $governance_rule['blockSettings'] );
			} else {
				$block_settings = $governance_rule['blockSettings'];
			}
		}

		return $block_settings;
	}

	/**
	 * Recursively add default block settings without overriding higher-priority values.
	 *
	 * List values remain additive, while conflicting scalar values retain the value from the
	 * matching role or post-type rule.
	 *
	 * @param array $block_settings  Higher-priority block settings.
	 * @param array $default_settings Default block settings to add.
	 *
	 * @return array Merged block settings.
	 */
	private static function merge_block_settings_with_defaults( array $block_settings, array $default_settings ): array {
		foreach ( $default_settings as $key => $default_value ) {
			if ( ! array_key_exists( $key, $block_settings ) ) {
				$block_settings[ $key ] = $default_value;
				continue;
			}

			$specific_value = $block_settings[ $key ];
			if ( ! is_array( $specific_value ) || ! is_array( $default_value ) ) {
				continue;
			}

			$specific_is_list = array_is_list( $specific_value );
			$default_is_list  = array_is_list( $default_value );

			// Empty JSON objects and arrays both decode to []; either way, defaults are additive.
			if ( [] === $specific_value ) {
				$block_settings[ $key ] = $default_value;
				continue;
			}

			if ( [] === $default_value ) {
				continue;
			}

			if ( $specific_is_list && $default_is_list ) {
				$block_settings[ $key ] = array_merge( $specific_value, $default_value );
				continue;
			}

			// A higher-priority value also controls the value's shape.
			if ( $specific_is_list !== $default_is_list ) {
				continue;
			}

			$block_settings[ $key ] = self::merge_block_settings_with_defaults( $specific_value, $default_value );
		}

		return $block_settings;
	}
}
