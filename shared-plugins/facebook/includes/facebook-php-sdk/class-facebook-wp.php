<?php

// parent class
if ( ! class_exists( 'WP_Facebook' ) )
	require_once( dirname( __FILE__ ) . '/facebook.php' );

/**
 * Override default Facebook PHP SDK behaviors with WordPress-friendly features
 *
 * @since 1.0
 */
class Facebook_WP_Extend extends WP_Facebook {

	/**
	 * Handle a response from the WordPress HTTP API
	 * Checks if the response is a WP_Error object. converts WP_Error to a WP_FacebookApiException for compatibility with the Facebook PHP SDK
	 * If the HTTP response code is not 200 OK then a WP_FacebookApiException is thrown with error information returned by Facebook
	 *
	 * @since 1.1.6
	 * @throws WP_FacebookApiException
	 * @param WP_Error|array $response WP_HTTP response
	 * @return string HTTP response body
	 */
	public static function handle_response( $response ) {
		if ( is_wp_error( $response ) ) {
			throw new WP_FacebookApiException( array( 'error_code' => $response->get_error_code(), 'error_msg' => $response->get_error_message() ) );
		} else if ( wp_remote_retrieve_response_code( $response ) != '200' ) {
			$fb_response = json_decode( wp_remote_retrieve_body( $response ) );

			throw new WP_FacebookApiException( array(
				'error_code' => $fb_response->error->code,
				'error' => array(
					'message' => $fb_response->error->message,
					'type' => $fb_response->error->type
				)
			) );
		}

		return wp_remote_retrieve_body( $response );
	}

	/**
	 * Override Facebook PHP SDK cURL function with WP_HTTP
	 * Facebook PHP SDK is POST-only
	 *
	 * @since 1.0
	 * @todo add file upload support if we care
	 * @param string $url request URL
	 * @param array $params parameters used in the POST body
	 * @param CurlHandler $ch Initialized curl handle. unused: here for compatibility with parent method parameters only
	 * @throws WP_FacebookApiException
	 * @return string HTTP response body
	 */
	protected function makeRequest( $url, $params, $ch=null ) {
		global $wp_version;

		if ( empty( $url ) || empty( $params ) )
			throw new WP_FacebookApiException( array( 'error_code' => 400, 'error' => array( 'type' => 'makeRequest', 'message' => 'Invalid parameters and/or URI passed to makeRequest' ) ) );

		return self::handle_response( wp_remote_post( $url, array(
			'redirection' => 0,
			'httpversion' => '1.1',
			'timeout' => 60,
			'user-agent' => apply_filters( 'http_headers_useragent', 'WordPress/' . $wp_version . '; ' . get_bloginfo( 'url' ) . '; facebook-php-' . self::VERSION . '-wp' ),
			'headers' => array( 'Connection' => 'close' , 'Content-Type' => 'application/x-www-form-urlencoded' ),
			'sslverify' => false, // warning: might be overridden by 'https_ssl_verify' filter
			'body' => http_build_query( $params, '', '&' )
		) ) );
	}

	/**
	 * GET request sent through WordPress HTTP API with custom parameters
	 *
	 * @since 1.1.6
	 * @param string absolute URL
	 * @return array decoded JSON response as an associative array
	 */
	public static function get_json_url( $url ) {
		global $wp_version;

		if ( ! is_string( $url ) && $url )
			return array();

		$response = self::handle_response( wp_remote_get( $url, array(
			'redirection' => 0,
			'httpversion' => '1.1',
			'timeout' => 5,
			'headers' => array( 'Connection' => 'close' ),
			'user-agent' => apply_filters( 'http_headers_useragent', 'WordPress/' . $wp_version . '; ' . get_bloginfo( 'url' ) . '; facebook-php-' . self::VERSION . '-wp' )
		) ) );

		if ( $response )
			return json_decode( $response, true );

		return array();
	}

	public static function graph_api( $path, $method = 'GET', $params = array() ) {
		global $wp_version;

		if ( ! is_string( $path ) )
			return;

		$path = ltrim( $path, '/' ); // normalize the leading slash
		if ( ! $path )
			return;

		// pass a reference to WordPress plugin origin with each request
		if ( ! is_array( $params ) )
			$params = array();
		if ( ! isset( $params['ref'] ) )
			$params['ref'] = 'fbwpp';
		foreach ( $params as $key => $value ) {
			if ( ! is_string( $value ) )
				$params[$key] = json_encode( $value );
		}

		$url = self::$DOMAIN_MAP['graph'] . $path;
		$http_args = array(
			'redirection' => 0,
			'httpversion' => '1.1',
			'sslverify' => false, // warning: might be overridden by 'https_ssl_verify' filter
			'headers' => array( 'Connection' => 'close' ),
			'user-agent' => apply_filters( 'http_headers_useragent', 'WordPress/' . $wp_version . '; ' . get_bloginfo( 'url' ) . '; facebook-php-' . self::VERSION . '-wp' )
		);

		if ( $method === 'GET' ) {
			if ( ! empty( $params ) )
				$url .= '?' . http_build_query( $params, '', '&' );
			$http_args['timeout'] = 5;
			$response = self::handle_response( wp_remote_get( $url, $http_args ) );
		} else {
			// POST
			// WP_HTTP does not support DELETE verb. store as method param for interpretation by Facebook Graph API server
			if ( $method === 'DELETE' )
				$params['method'] = 'DELETE';
			$http_args['timeout'] = 60;
			$http_args['body'] = http_build_query( $params, '', '&' );
			$http_args['headers']['Content-Type'] = 'application/x-www-form-urlencoded';

			$response = self::handle_response( wp_remote_post( $url, $http_args ) );
		}

		if ( isset( $response ) && $response )
			return json_decode( $response, true );
	}

	/**
	 * Invoke the Graph API for server-to-server communication using an application access token (no user session)
	 *
	 * @since 1.2
	 * @param string $path The Graph API URI endpoint path component
	 * @param string $method The HTTP method (default 'GET')
	 * @param array $params The query/post data
	 *
	 * @return mixed The decoded response object
	 * @throws WP_FacebookApiException
	 */
	public static function graph_api_with_app_access_token( $path, $method = 'GET', $params = array() ) {
		global $facebook_loader;

		if ( ! ( isset( $facebook_loader ) && $facebook_loader->app_access_token_exists() ) )
			return;

		if ( ! is_array( $params ) )
			$params = array();
		$params['access_token'] = $facebook_loader->credentials['access_token'];

		return self::graph_api( $path, $method, $params );
	}

	/**
	 * Request current application permissions for an authenticated Facebook user
	 *
	 * @since 1.1
	 * @return array user permissions as flat array
	 */
	public function get_current_user_permissions( $current_user = '' ) {
		if ( ! $current_user ) {
			// load user functions
			if ( ! class_exists( 'Facebook_User' ) )
				require_once( dirname( dirname( dirname(__FILE__) ) ) . '/facebook-user.php' );

			// simply verify a connection between user and app
			$current_user = Facebook_User::get_current_user( array( 'id' ) );
			if ( ! $current_user )
				return array();
		}

		try {
			$response = $this->api( '/me/permissions', 'GET', array( 'ref' => 'fbwpp' ) );
		} catch ( WP_FacebookApiException $e ) {
			$error_result = $e->getResult();
			if ( $error_result && isset( $error_result['error_code'] ) ) {
				// try to extend access token if request failed
				if ( $error_result['error_code'] === 2500 )
					$this->setExtendedAccessToken();
			}
			return array();
		}

		if ( is_array( $response ) && isset( $response['data'][0] ) ) {
			$permissions = array();
			foreach( $response['data'][0] as $permission => $exists ) {
				$permissions[$permission] = true;
			}
			return $permissions;
		}

		return array();
	}

	/**
	 * Retrieve Facebook permissions assigned to the application by a specific Facebook user id
	 *
	 * @since 1.2
	 * @param string $facebook_id Facebook user identifier
	 * @return array Facebook permissions
	 */
	public static function get_permissions_by_facebook_user_id( $facebook_id ) {
		if ( ! ( is_string( $facebook_id ) && $facebook_id ) )
			return array();

		$response = self::graph_api_with_app_access_token( $facebook_id . '/permissions', 'GET' );

		if ( is_array( $response ) && isset( $response['data'][0] ) ) {
			$response = $response['data'][0];
			$permissions = array();
			foreach( $response as $permission => $exists ) {
				$permissions[$permission] = true;
			}
			return $permissions;
		}

		return array();
	}

	/**
	 * Trade an application id and a application secret for an application token used for future requests
	 *
	 * @since 1.1.6
	 * @return bool|string access token or false if error
	 */
	public function getAppAccessToken() {
		try {
			// need to circumvent json_decode by calling _oauthRequest
			// directly, since response isn't JSON format.
			$access_token_response = $this->makeRequest(
				$this->getUrl( 'graph', 'oauth/access_token' ),
				array(
					'client_id' => $this->getAppId(),
					'client_secret' => $this->getAppSecret(),
					'grant_type' => 'client_credentials'
				)
			);
		} catch ( WP_FacebookApiException $e ) {
			return false;
		}

		if ( empty( $access_token_response ) )
			return false;

		$response_params = array();
		parse_str( $access_token_response, $response_params );
		if ( isset( $response_params['access_token'] ) && $response_params['access_token'] )
			return $response_params['access_token'];

		return false;
	}

	/**
	 * Get application details including app name, namespace, link, and more.
	 *
	 * @param string $app_id application identifier. uses appId property if set
	 * @return array application data response from Facebook API
	 */
	public function get_app_details( $app_id = '' ) {
		if ( ! ( is_string( $app_id ) && $app_id ) ) {
			$app_id = $this->getAppId();
			if ( ! $app_id )
				return array();
		}

		$url = $this->getUrl( 'graph', $app_id );

		// switch to HTTP for server configurations not supporting HTTPS
		if ( substr_compare( $url, 'https://', 0, 8 ) === 0 && ! wp_http_supports( array( 'ssl' => true ) ) )
			$url = 'http://' . substr( $url, 8 );

		if ( ! $url )
			return array();

		try {
			$app_info = self::get_json_url( $url );
		} catch( WP_FacebookApiException $e ) {
			return array();
		}

		if ( is_array( $app_info ) && isset( $app_info['id'] ) )
			return $app_info;

		return array();
	}

	/**
	 * Get application details based on an application access token
	 *
	 * @since 1.1.6
	 * @param string $access_token application access token
	 * @return array application information returned by Facebook servers
	 */
	public function get_app_details_by_access_token( $access_token ) {
		if ( ! ( is_string( $access_token ) && $access_token ) )
			return array();

		$url = $this->getUrl( 'graph', 'app', array( 'access_token' => $access_token ) );

		if ( ! $url )
			return array();

		try {
			$app_info = self::get_json_url( $url );
		} catch( WP_FacebookApiException $e ) {
			return array();
		}

		if ( is_array( $app_info ) && isset( $app_info['id'] ) )
			return $app_info;

		return array();
	}

	/**
	 * Provides the implementations of the inherited abstract
	 * methods.  The implementation uses user meta to maintain
	 * a store for authorization codes, user ids, CSRF states, and
	 * access tokens.
	 */
	protected function setPersistentData( $key, $value ) {
		if ( ! in_array( $key, self::$kSupportedKeys ) ) {
			self::errorLog( 'Unsupported key passed to setPersistentData.' );
			return;
		}

		// load user functions
		if ( ! class_exists( 'Facebook_User' ) )
			require_once( dirname( dirname( dirname(__FILE__) ) ) . '/facebook-user.php' );
		Facebook_User::update_user_meta( get_current_user_id(), $key, $value );
	}

	/**
	 * Get data persisted by the Facebook PHP SDK using WordPress-specific access methods
	 *
	 * @since 1.0
	 */
	protected function getPersistentData( $key, $default = false ) {
		if ( ! in_array( $key, self::$kSupportedKeys ) ) {
			self::errorLog( 'Unsupported key passed to getPersistentData.' );
			return $default;
		}

		// load user functions
		if ( ! class_exists( 'Facebook_User' ) )
			require_once( dirname( dirname( dirname(__FILE__) ) ) . '/facebook-user.php' );
		return Facebook_User::get_user_meta( get_current_user_id(), $key, true );
	}

	/**
	 * Delete data persisted by the Facebook PHP SDK using WordPress-specific access method
	 *
	 * @since 1.0
	 */
	protected function clearPersistentData( $key ) {
		if ( ! in_array( $key, self::$kSupportedKeys ) ) {
			self::errorLog( 'Unsupported key passed to clearPersistentData.' );
			return;
		}

		// load user functions
		if ( ! class_exists( 'Facebook_User' ) )
			require_once( dirname( dirname( dirname(__FILE__) ) ) . '/facebook-user.php' );
		Facebook_User::delete_user_meta( get_current_user_id(), $key );
	}

	/**
	 * Delete data persisted by the Facebook PHP SDK for every possible Facebook PHP SDK data key
	 *
	 * @since 1.0
	 */
	protected function clearAllPersistentData() {
		foreach ( self::$kSupportedKeys as $key ) {
			$this->clearPersistentData($key);
		}
	}
}
?>
