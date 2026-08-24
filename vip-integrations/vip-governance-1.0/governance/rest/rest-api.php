<?php
/**
 * Rest API
 * 
 * @package vip-governance
 */

namespace WPCOMVIP\Governance;

use Throwable;
use WP_Error;
use WP_REST_Request;

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
	public static function init(): void {
		add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
	}

	/**
	 * Register the rest routes.
	 *
	 * @return void
	 * 
	 * @access private 
	 */
	public static function register_rest_routes(): void {
		register_rest_route( WPCOMVIP__GOVERNANCE__RULES_REST_ROUTE, '/rules', [
			'methods'             => 'GET',
			'permission_callback' => [ __CLASS__, 'permission_callback' ],
			'callback'            => [ __CLASS__, 'get_governance_rules_for_rule_type' ],
			'args'                => [
				'role'     => [
					'type'              => 'string',
					'validate_callback' => function ( $param ) {
						return in_array( (string) $param, array_keys( wp_roles()->roles ), true );
					},
					'sanitize_callback' => function ( $param ) {
						return strval( $param );
					},
				],
				'postType' => [
					'type'              => 'string',
					'validate_callback' => function ( $param ) {
						return in_array( (string) $param, get_post_types(), true );
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
	public static function permission_callback(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Get the governance rules specifically for a role.
	 *
	 * @param WP_REST_Request $request REST request.
	 * 
	 * @return array|WP_Error Response containing the rules, or an error when rules cannot be loaded.
	 * 
	 * @access private
	 */
	public static function get_governance_rules_for_rule_type( WP_REST_Request $request ): array|WP_Error {
		$role      = $request->has_param( 'role' ) ? [ (string) $request->get_param( 'role' ) ] : [];
		$post_type = (string) ( $request->get_param( 'postType' ) ?? '' );

		try {
			$parsed_governance_rules = GovernanceUtilities::get_parsed_governance_rules();

			if ( is_wp_error( $parsed_governance_rules ) ) {
				return new WP_Error( 'vip-governance-rules-error', __( 'Error: Governance rules could not be loaded.', 'vip-governance' ), [ 'status' => 400 ] );
			} else {
				return GovernanceUtilities::get_rules_by_type( $parsed_governance_rules, $role, $post_type );
			}
		} catch ( Throwable ) {
			return new WP_Error( 'vip-governance-rules-error', __( 'Error: Governance rules could not be loaded due to a plugin error.', 'vip-governance' ), [ 'status' => 500 ] );
		}
	}
}

RestApi::init();
