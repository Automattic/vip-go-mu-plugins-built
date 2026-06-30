<?php
/**
 * Auth Manager class.
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\Auth;

use Safe_Publish\API\Dispatch_Logger;
use Safe_Publish\API\Export_Logger;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;

/**
 * Coordinates authentication system initialization.
 *
 * Wires up all auth components (logger, authenticator, permission manager,
 * admin UI) and registers WordPress hooks on their behalf.
 */
class Auth_Manager {

	/**
	 * HMAC authenticator instance.
	 *
	 * @var HMAC_Authenticator
	 */
	private HMAC_Authenticator $authenticator;

	/**
	 * Permission manager instance.
	 *
	 * @var Permission_Manager
	 */
	private Permission_Manager $permission_manager;

	/**
	 * Constructor.
	 *
	 * Creates all auth components. Auth_Admin_UI registers its own admin hooks
	 * in its constructor; WordPress retains its reference via those callbacks.
	 */
	public function __construct() {
		$logger                   = new Auth_Logger();
		$this->permission_manager = new Permission_Manager(
			$logger,
			new Export_Logger(),
			new Dispatch_Logger()
		);
		$shared_secret            = Auth_Credential_Provider::get_shared_secret();
		$this->authenticator      = new HMAC_Authenticator(
			$logger,
			$this->permission_manager,
			$shared_secret,
			Options::get_value( Options::OPTION_CONNECTED_SITE_URL, '' )
		);
		new Auth_Admin_UI( $shared_secret );
	}

	/**
	 * Initializes authentication system hooks.
	 */
	public function init(): void {
		add_action( 'rest_api_init', array( $this, 'init_auth_handler' ) );
	}

	/**
	 * Returns the HMAC authenticator so callers can check whether the current
	 * REST request was authenticated by Safe Publish.
	 *
	 * @return HMAC_Authenticator HMAC authenticator instance.
	 */
	public function get_authenticator(): HMAC_Authenticator {
		return $this->authenticator;
	}

	/**
	 * Initializes authentication and permission filters for REST API.
	 */
	public function init_auth_handler(): void {
		add_filter( 'rest_pre_dispatch', array( $this->authenticator, 'authenticate_request' ), 10, 3 );
		add_filter( 'rest_request_before_callbacks', array( $this->permission_manager, 'handle_permission_check' ), 10, 3 );
	}
}
