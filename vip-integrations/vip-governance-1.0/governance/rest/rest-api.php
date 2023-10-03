<?php
/**
 * Rest API
 * 
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

use WP_Error;

defined( 'ABSPATH' ) || die();

/**
 * The REST API used for fetching role specific governance rules.
 */
class RestApi {
	/**
	 * Initiatlize the class.
	 *
	 * @return void
	 * 
	 * @access private 
	 */
	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
	}

	/**
	 * Register the rest routes.
	 *
	 * @return void
	 * 
	 * @access private 
	 */
	public static function register_rest_routes() {
		register_rest_route( WPCOMVIP__GOVERNANCE__RULES_REST_ROUTE, '/rules', [
			'methods'             => 'GET',
			'permission_callback' => [ __CLASS__, 'permission_callback' ],
			'callback'            => [ __CLASS__, 'get_governance_rules_for_rule_type' ],
			'args'                => [
				'role'     => [
					'validate_callback' => function ( $param ) {
						$all_roles = array_keys( wp_roles()->roles );
						$roles     = [ strval( $param ) ];
						return array_intersect( $all_roles, $roles );
					},
					'sanitize_callback' => function ( $param ) {
						return strval( $param );
					},
				],
				'postType' => [
					'validate_callback' => function ( $param ) {
						$post_types = [ strval( $param ) ];
						return array_intersect( get_post_types(), $post_types );
					},
					'sanitize_callback' => function ( $param ) {
						return strval( $param );
					},
				],
			],
		] );
	}

	/**
	 * Restrict the users that can access this rest API to be who can manage options only.
	 *
	 * @return bool True, if they are allow or false otherwise.
	 * 
	 * @access private 
	 */
	public static function permission_callback() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get the governance rules specifically for a role.
	 *
	 * @param array $params Rest parameters.
	 * 
	 * @return array Response containing the rules.
	 * 
	 * @access private
	 */
	public static function get_governance_rules_for_rule_type( $params ) {
		$role      = isset( $params['role'] ) ? [ $params['role'] ] : [];
		$post_type = $params['postType'] ?? '';

		try {
			$parsed_governance_rules = GovernanceUtilities::get_parsed_governance_rules();

			if ( is_wp_error( $parsed_governance_rules ) ) {
				return new WP_Error( 'vip-governance-rules-error', 'Error: Governance rules could not be loaded.', [ 'status' => 400 ] );
			} else {
				return GovernanceUtilities::get_rules_by_type( $parsed_governance_rules, $role, $post_type );
			}
		} catch ( Exception | Error $e ) {
			return new WP_Error( 'vip-governance-rules-error', 'Error: Governance rules could not be loaded due to a plugin error.', [ 'status' => 500 ] );
		}
	}
}

RestApi::init();
