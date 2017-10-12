<?php
/**
 * REST endpoints
 */

namespace Automattic\VIP\Support_User;
use WP_Error;
use WP_REST_Server;
use WP_REST_Request;

class REST_Controller {

	private static $namespace;

	function __construct() {
		self::$namespace = 'vip/v1';
		add_action( 'rest_api_init', [ $this, 'rest_api_init' ] );
	}

	function permission_callback() {
		return wpcom_vip_go_rest_api_request_allowed( self::$namespace );
	}

	function rest_api_init() {
		register_rest_route( self::$namespace, '/support-user', array(

			// POST /vip/v1/support-user
			array(
				'methods' => WP_REST_Server::CREATABLE,
				'permission_callback' => array( $this, 'permission_callback' ),
				'args' => array(
					'user_login' => array(
						'required' => true,
					),
					'user_pass' => array(
						'required' => true,
						'validate_callback' => function( $param, $request, $key ) {
							if ( strlen( $param ) < 10 ) {
								return new WP_Error( 'invalid-password', 'Password must be at least 10 characters' );
							}

							return true;
						},
					),
					'user_email' => array(
						'required' => true,
						'validate_callback' => function( $param, $request, $key ) {
							if ( ! is_email( $param ) ) {
								return new WP_Error( 'invalid-email', 'Must be a valid email address' );
							}

							return true;
						},
					),
					'display_name' => array(
						'default' => 'VIP Support',
					),
				),
				'callback' => function( WP_REST_Request $request ) {
					$user_login = $request->get_param( 'user_login' );
					$user_pass = $request->get_param( 'user_pass' );
					$email = $request->get_param( 'user_email' );
					$name = $request->get_param( 'display_name' );

					$user_data = array(
						'user_login' => $user_login,
						'user_pass' => $user_pass,
						'user_email' => $email,
						'display_name' => $name,
					);

					$user_id = User::add( $user_data );

					if ( is_wp_error( $user_id ) ) {
						return $user_id;
					}

					return array( 'success' => true, 'user_id' => $user_id );
				},
			),
		) );

		register_rest_route( self::$namespace, '/support-user/(?P<id>[\d]+)', array(

			// DELETE /vip/v1/support-user/:id
			array(
				'methods' => WP_REST_Server::DELETABLE,
				'permission_callback' => array( $this, 'permission_callback' ),
				'args' => array(
					'id' => array(
						'required' => true,
					),
				),
				'callback' => function( WP_REST_Request $request ) {
					$id = $request->get_param( 'id' );
					$success = User::remove( $id, 'id' );

					if ( is_wp_error( $success ) ) {
						return $success;
					}

					return array( 'success' => true );
				},
			),
		) );
	}
}

new REST_Controller;
