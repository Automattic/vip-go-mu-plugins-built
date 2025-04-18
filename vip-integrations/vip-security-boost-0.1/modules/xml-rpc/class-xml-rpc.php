<?php
namespace Automattic\VIP\Security\XmlRpc;

use function Automattic\VIP\Security\Utils\get_module_configs;

class Xml_Rpc {
	private static $mode = 'RESTRICT';

	public static function init() {
		$xmlrpc_configs = get_module_configs( 'xml-rpc' );
		self::$mode     = strtoupper( $xmlrpc_configs['mode'] ?? 'RESTRICT' );

		if ( vip_is_jetpack_request() ) {
			// Jetpack is allowed to use XML-RPC.
			return;
		}

		switch ( self::$mode ) {
			case 'DISABLE':
				// Completely disable XML-RPC.
				self::disable_xml_rpc();
				break;

			case 'RESTRICT':
			default:
				// Restrict XML-RPC to only allow Application Passwords.
				self::restrict_xmlrpc();
				break;
		}
	}

	/**
	 * Disable XML-RPC
	 */
	public static function disable_xml_rpc() {
		// Disable XML-RPC methods that require authentication.
		add_filter( 'xmlrpc_enabled', '__return_false', PHP_INT_MAX );

		// Remove the "Really Simple Discovery" link from the header.
		remove_action( 'wp_head', 'rsd_link' );

		// Remove the X-Pingback HTTP header.
		add_filter( 'wp_headers', function ( $headers ) {
			if ( isset( $headers['X-Pingback'] ) ) {
				unset( $headers['X-Pingback'] );
			}
			return $headers;
		}, PHP_INT_MAX, 1 );

		// Return an empty array for all XML-RPC methods.
		add_filter( 'xmlrpc_methods', '__return_empty_array', PHP_INT_MAX );

		// TODO: Figure how to disable XML-RPC without returning a value.
		add_filter('wp_xmlrpc_server_class', function ( $server_class ) {
			exit( 'Access to XML-RPC is disabled on this site.' );
			// phpcs:ignore Squiz.PHP.NonExecutableCode.Unreachable
			return $server_class;
		});
	}

	/**
	 * Restrict XML-RPC
	 */
	public static function restrict_xmlrpc() {
		// Only act during XML-RPC requests.
		if ( self::is_xmlrpc_request() ) {
			// Remove the filters responsible for username/password and email/password authentication.
			// Priority 20 must match the priority used when they were added.
			// See https://github.com/WordPress/WordPress/blob/master/wp-includes/default-filters.php#L500-L503
			remove_filter( 'authenticate', 'wp_authenticate_username_password', 20 );
			remove_filter( 'authenticate', 'wp_authenticate_email_password', 20 );
		}
	}

	/**
	 * Check if the current request is an XML-RPC request.
	 *
	 * @return bool True if the request is an XML-RPC request, false otherwise.
	 */
	private static function is_xmlrpc_request() {
		return defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST;
	}
}

Xml_Rpc::init();
