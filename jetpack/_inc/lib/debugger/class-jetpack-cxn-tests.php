<?php
/**
 * Collection of tests to run on the Jetpack connection locally.
 *
 * @package automattic/jetpack
 */

use Automattic\Jetpack\Connection\Client;
use Automattic\Jetpack\Connection\Manager as Connection_Manager;
use Automattic\Jetpack\Connection\Tokens;
use Automattic\Jetpack\Redirect;
use Automattic\Jetpack\Status;
use Automattic\Jetpack\Sync\Health as Sync_Health;
use Automattic\Jetpack\Sync\Settings as Sync_Settings;

/**
 * Class Jetpack_Cxn_Tests contains all of the actual tests.
 */
class Jetpack_Cxn_Tests extends Jetpack_Cxn_Test_Base {

	/**
	 * Jetpack_Cxn_Tests constructor.
	 */
	public function __construct() {
		parent::__construct();

		$methods = get_class_methods( 'Jetpack_Cxn_Tests' );

		foreach ( $methods as $method ) {
			if ( ! str_contains( $method, 'test__' ) ) {
				continue;
			}
			$this->add_test( array( $this, $method ), $method, 'direct' );
		}

		/**
		 * Fires after loading default Jetpack Connection tests.
		 *
		 * @since 7.1.0
		 * @since 8.3.0 Passes the Jetpack_Cxn_Tests instance.
		 */
		do_action( 'jetpack_connection_tests_loaded', $this );

		/**
		 * Determines if the WP.com testing suite should be included.
		 *
		 * @since 7.1.0
		 * @since 8.1.0 Default false.
		 *
		 * @param bool $run_test To run the WP.com testing suite. Default false.
		 */
		if ( apply_filters( 'jetpack_debugger_run_self_test', false ) ) {
			/**
			 * Intentionally added last as it checks for an existing failure state before attempting.
			 * Generally, any failed location condition would result in the WP.com check to fail too, so
			 * we will skip it to avoid confusing error messages.
			 *
			 * Note: This really should be an 'async' test.
			 */
			$this->add_test( array( $this, 'last__wpcom_self_test' ), 'test__wpcom_self_test', 'direct' );
		}
	}

	/**
	 * Helper function to look up the expected master user and return the local WP_User.
	 *
	 * @return WP_User Jetpack's expected master user.
	 */
	protected function helper_retrieve_local_master_user() {
		$master_user = Jetpack_Options::get_option( 'master_user' );
		return new WP_User( $master_user );
	}

	/**
	 * Is Jetpack even connected and supposed to be talking to WP.com?
	 */
	protected function helper_is_jetpack_connected() {
		return Jetpack::is_connection_ready() && ! ( new Status() )->is_offline_mode();
	}

	/**
	 * Retrieve the `blog_token` if it exists.
	 *
	 * @return object|false
	 */
	protected function helper_get_blog_token() {
		return ( new Tokens() )->get_access_token();
	}

	/**
	 * Returns a support url based on using a development version.
	 */
	protected function helper_get_support_url() {
		return Jetpack::is_development_version()
			? Redirect::get_url( 'jetpack-contact-support-beta-group' )
			: Redirect::get_url( 'jetpack-contact-support' );
	}

	/**
	 * Returns the url to reconnect Jetpack.
	 *
	 * @return string The reconnect url.
	 */
	protected static function helper_get_reconnect_url() {
		return admin_url( 'admin.php?page=jetpack#/reconnect' );
	}

	/**
	 * Gets translated support text.
	 */
	protected function helper_get_support_text() {
		return __( 'Please contact Jetpack support.', 'jetpack' );
	}

	/**
	 * Returns the translated text to reconnect Jetpack.
	 *
	 * @return string The translated reconnect text.
	 */
	protected static function helper_get_reconnect_text() {
		return __( 'Reconnect Jetpack now', 'jetpack' );
	}

	/**
	 * Returns the translated text for failing tests due to timeouts.
	 *
	 * @return string The translated timeout text.
	 */
	protected static function helper_get_timeout_text() {
		return __( 'The test timed out which may sometimes indicate a failure or may be a false failure. Please relaunch tests.', 'jetpack' );
	}

	/**
	 * Gets translated reconnect long description.
	 *
	 * @param string $connection_error The connection specific error.
	 * @param string $recommendation The recommendation for resolving the connection error.
	 *
	 * @return string The translated long description for reconnection recommendations.
	 */
	protected static function helper_get_reconnect_long_description( $connection_error, $recommendation ) {

		return sprintf(
			'<p>%1$s</p>' .
			'<p><span class="dashicons fail"><span class="screen-reader-text">%2$s</span></span> %3$s</p><p><strong>%4$s</strong></p>',
			__( 'A healthy connection ensures Jetpack essential services are provided to your WordPress site, such as Stats and Site Security.', 'jetpack' ),
			/* translators: screen reader text indicating a test failed */
			__( 'Error', 'jetpack' ),
			$connection_error,
			$recommendation
		);
	}

	/**
	 * Helper function to return consistent responses for a connection failing test.
	 *
	 * @param string $name The raw method name that runs the test. Default unnamed_test.
	 * @param string $connection_error The connection specific error. Default 'Your site is not connected to Jetpack.'.
	 * @param string $recommendation The recommendation for resolving the connection error. Default 'We recommend reconnecting Jetpack.'.
	 *
	 * @return array Test results.
	 */
	public static function connection_failing_test( $name, $connection_error = '', $recommendation = '' ) {
		$connection_error = empty( $connection_error ) ? __( 'Your site is not connected to Jetpack.', 'jetpack' ) : $connection_error;
		$recommendation   = empty( $recommendation ) ? __( 'We recommend reconnecting Jetpack.', 'jetpack' ) : $recommendation;

		$args = array(
			'name'              => $name,
			'short_description' => $connection_error,
			'action'            => self::helper_get_reconnect_url(),
			'action_label'      => self::helper_get_reconnect_text(),
			'long_description'  => self::helper_get_reconnect_long_description( $connection_error, $recommendation ),
		);

		return self::failing_test( $args );
	}

	/**
	 * Gets translated text to enable outbound requests.
	 *
	 * @param string $protocol Either 'HTTP' or 'HTTPS'.
	 *
	 * @return string The translated text.
	 */
	protected function helper_enable_outbound_requests( $protocol ) {
		return sprintf(
			/* translators: %1$s - request protocol, either http or https */
			__(
				'Your server did not successfully connect to the Jetpack server using %1$s
				Please ask your hosting provider to confirm your server can make outbound requests to jetpack.com.',
				'jetpack'
			),
			$protocol
		);
	}

	/**
	 * Returns 30 for use with a filter.
	 *
	 * To allow time for WP.com to run upstream testing, this function exists to increase the http_request_timeout value
	 * to 30.
	 *
	 * @return int 30
	 */
	public static function increase_timeout() {
		return 30; // seconds.
	}

	/**
	 * The test verifies the blog token exists.
	 *
	 * @return array
	 */
	protected function test__blog_token_if_exists() {
		$name = __FUNCTION__;

		if ( ! $this->helper_is_jetpack_connected() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is not connected. No blog token to check.', 'jetpack' ),
				)
			);
		}
		$blog_token = $this->helper_get_blog_token();

		if ( $blog_token ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$connection_error = __( 'Blog token is missing.', 'jetpack' );

			$result = self::connection_failing_test( $name, $connection_error );
		}

		return $result;
	}

	/**
	 * Test if Jetpack is connected.
	 */
	protected function test__check_if_connected() {
		$name = __FUNCTION__;

		if ( ! $this->helper_get_blog_token() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Blog token is missing.', 'jetpack' ),
				)
			);
		}

		if ( $this->helper_is_jetpack_connected() ) {
			$result = self::passing_test(
				array(
					'name'             => $name,
					'label'            => __( 'Your site is connected to Jetpack', 'jetpack' ),
					'long_description' => sprintf(
						'<p>%1$s</p>' .
						'<p><span class="dashicons pass"><span class="screen-reader-text">%2$s</span></span> %3$s</p>',
						__( 'A healthy connection ensures Jetpack essential services are provided to your WordPress site, such as Stats and Site Security.', 'jetpack' ),
						/* translators: Screen reader text indicating a test has passed */
						__( 'Passed', 'jetpack' ),
						__( 'Your site is connected to Jetpack.', 'jetpack' )
					),
				)
			);
		} elseif ( ( new Status() )->is_offline_mode() ) {
			$result = self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is in Offline Mode:', 'jetpack' ) . ' ' . Jetpack::development_mode_trigger_text(),
				)
			);
		} else {
			$connection_error = __( 'Your site is not connected to Jetpack', 'jetpack' );

			$result = self::connection_failing_test( $name, $connection_error );
		}

		return $result;
	}

	/**
	 * Test that the master user still exists on this site.
	 *
	 * @return array Test results.
	 */
	protected function test__master_user_exists_on_site() {
		$name = __FUNCTION__;
		if ( ! $this->helper_is_jetpack_connected() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is not connected. No master user to check.', 'jetpack' ),
				)
			);
		}
		if ( ! ( new Connection_Manager() )->get_connection_owner_id() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is running without a connected user. No master user to check.', 'jetpack' ),
				)
			);
		}
		$local_user = $this->helper_retrieve_local_master_user();

		if ( $local_user->exists() ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$connection_error = __( 'The user who setup the Jetpack connection no longer exists on this site.', 'jetpack' );

			$result = self::connection_failing_test( $name, $connection_error );
		}

		return $result;
	}

	/**
	 * Test that the master user has the manage options capability (e.g. is an admin).
	 *
	 * Generic calls from WP.com execute on Jetpack as the master user. If it isn't an admin, random things will fail.
	 *
	 * @return array Test results.
	 */
	protected function test__master_user_can_manage_options() {
		$name = __FUNCTION__;
		if ( ! $this->helper_is_jetpack_connected() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is not connected.', 'jetpack' ),
				)
			);
		}
		if ( ! ( new Connection_Manager() )->get_connection_owner_id() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is running without a connected user. No master user to check.', 'jetpack' ),
				)
			);
		}
		$master_user = $this->helper_retrieve_local_master_user();

		if ( user_can( $master_user, 'manage_options' ) ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			/* translators: a WordPress username */
			$connection_error = sprintf( __( 'The user (%s) who setup the Jetpack connection is not an administrator.', 'jetpack' ), $master_user->user_login );
			/* translators: a WordPress username */
			$recommendation = sprintf( __( 'We recommend either upgrading the user (%s) or reconnecting Jetpack.', 'jetpack' ), $master_user->user_login );

			$result = self::connection_failing_test( $name, $connection_error, $recommendation );
		}

		return $result;
	}

	/**
	 * Test that the PHP's XML library is installed.
	 *
	 * While it should be installed by default, increasingly in PHP 7, some OSes require an additional php-xml package.
	 *
	 * @return array Test results.
	 */
	protected function test__xml_parser_available() {
		$name = __FUNCTION__;
		if ( function_exists( 'xml_parser_create' ) ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$result = self::failing_test(
				array(
					'name'              => $name,
					'label'             => __( 'PHP XML manipulation libraries are not available.', 'jetpack' ),
					'short_description' => __( 'Please ask your hosting provider to refer to our server requirements and enable PHP\'s XML module.', 'jetpack' ),
					'action_label'      => __( 'View our server requirements', 'jetpack' ),
					'action'            => Redirect::get_url( 'jetpack-support-server-requirements' ),
				)
			);
		}
		return $result;
	}

	/**
	 * Test that the server is able to send an outbound http communication.
	 *
	 * @return array Test results.
	 */
	protected function test__outbound_http() {
		$name    = __FUNCTION__;
		$request = wp_remote_get( preg_replace( '/^https:/', 'http:', JETPACK__API_BASE ) . 'test/1/' );
		$code    = wp_remote_retrieve_response_code( $request );

		if ( 200 === (int) $code ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$result = self::failing_test(
				array(
					'name'              => $name,
					'short_description' => $this->helper_enable_outbound_requests( 'HTTP' ),
				)
			);
		}

		return $result;
	}

	/**
	 * Test that the server is able to send an outbound https communication.
	 *
	 * @return array Test results.
	 */
	protected function test__outbound_https() {
		$name    = __FUNCTION__;
		$request = wp_remote_get( preg_replace( '/^http:/', 'https:', JETPACK__API_BASE ) . 'test/1/' );
		$code    = wp_remote_retrieve_response_code( $request );

		if ( 200 === (int) $code ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$result = self::failing_test(
				array(
					'name'              => $name,
					'short_description' => $this->helper_enable_outbound_requests( 'HTTPS' ),
				)
			);
		}

		return $result;
	}

	/**
	 * Check for an IDC.
	 *
	 * @return array Test results.
	 */
	protected function test__identity_crisis() {
		$name = __FUNCTION__;
		if ( ! $this->helper_is_jetpack_connected() ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Jetpack is not connected.', 'jetpack' ),
				)
			);
		}
		$identity_crisis = Jetpack::check_identity_crisis();

		if ( ! $identity_crisis ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} else {
			$result = self::failing_test(
				array(
					'name'              => $name,
					'short_description' => sprintf(
						/* translators: Two URLs. The first is the locally-recorded value, the second is the value as recorded on WP.com. */
						__( 'Your url is set as `%1$s`, but your WordPress.com connection lists it as `%2$s`!', 'jetpack' ),
						$identity_crisis['home'],
						$identity_crisis['wpcom_home']
					),
					'action_label'      => $this->helper_get_support_text(),
					'action'            => $this->helper_get_support_url(),
				)
			);
		}
		return $result;
	}

	/**
	 * Tests the health of the Connection tokens.
	 *
	 * This will always check the blog token health. It will also check the user token health if
	 * a user is logged in and connected, or if there's a connected owner.
	 *
	 * @since 9.0.0
	 * @since 9.6.0 Checks only blog token if current user not connected or site does not have a connected owner.
	 *
	 * @return array Test results.
	 */
	protected function test__connection_token_health() {
		$name    = __FUNCTION__;
		$m       = new Connection_Manager();
		$user_id = get_current_user_id();

		// Check if there's a connected logged in user.
		if ( $user_id && ! $m->is_user_connected( $user_id ) ) {
				$user_id = false;
		}

		// If no logged in user to check, let's see if there's a master_user set.
		if ( ! $user_id ) {
				$user_id = Jetpack_Options::get_option( 'master_user' );
			if ( $user_id && ! $m->is_user_connected( $user_id ) ) {
				return self::connection_failing_test( $name, __( 'Missing token for the connection owner.', 'jetpack' ) );
			}
		}

		if ( $user_id ) {
			return $this->check_tokens_health( $user_id );
		} else {
			return $this->check_blog_token_health();
		}
	}

	/**
	 * Tests blog and user's token against wp.com's check-token-health endpoint.
	 *
	 * @since 9.6.0
	 *
	 * @return array Test results.
	 */
	protected function check_blog_token_health() {
		$name  = 'test__connection_token_health';
		$valid = ( new Tokens() )->validate_blog_token();

		if ( ! $valid ) {
			return self::connection_failing_test( $name, __( 'Blog token validation failed.', 'jetpack' ) );
		} else {
			return self::passing_test( array( 'name' => $name ) );
		}
	}

	/**
	 * Tests blog token against wp.com's check-token-health endpoint.
	 *
	 * @since 9.6.0
	 *
	 * @param int $user_id The user ID to check the tokens for.
	 *
	 * @return array Test results.
	 */
	protected function check_tokens_health( $user_id ) {
		$name             = 'test__connection_token_health';
		$validated_tokens = ( new Tokens() )->validate( $user_id );

		if ( ! is_array( $validated_tokens ) || count( array_diff_key( array_flip( array( 'blog_token', 'user_token' ) ), $validated_tokens ) ) ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Token health check failed to validate tokens.', 'jetpack' ),
				)
			);
		}

		$invalid_tokens_exist = false;
		foreach ( $validated_tokens as $validated_token ) {
			if ( ! $validated_token['is_healthy'] ) {
				$invalid_tokens_exist = true;
				break;
			}
		}

		if ( false === $invalid_tokens_exist ) {
			return self::passing_test( array( 'name' => $name ) );
		}

		$connection_error = __( 'Invalid Jetpack connection tokens.', 'jetpack' );

		return self::connection_failing_test( $name, $connection_error );
	}

	/**
	 * Tests connection status against wp.com's test-connection endpoint.
	 *
	 * @todo: Compare with the wpcom_self_test. We only need one of these.
	 *
	 * @return array Test results.
	 */
	protected function test__wpcom_connection_test() {
		$name = __FUNCTION__;

		$status = new Status();
		if ( ! Jetpack::is_connection_ready() || $status->is_offline_mode() || $status->in_safe_mode() || ! $this->pass ) {
			return self::skipped_test( array( 'name' => $name ) );
		}

		add_filter( 'http_request_timeout', array( 'Jetpack_Cxn_Tests', 'increase_timeout' ) );
		$response = Client::wpcom_json_api_request_as_blog(
			sprintf( '/jetpack-blogs/%d/test-connection', Jetpack_Options::get_option( 'id' ) ),
			Client::WPCOM_JSON_API_VERSION
		);
		remove_filter( 'http_request_timeout', array( 'Jetpack_Cxn_Tests', 'increase_timeout' ) );

		if ( is_wp_error( $response ) ) {
			if ( str_contains( $response->get_error_message(), 'cURL error 28' ) ) { // Timeout.
				$result = self::skipped_test(
					array(
						'name'              => $name,
						'short_description' => self::helper_get_timeout_text(),
					)
				);
			} else {
				/* translators: %1$s is the error code, %2$s is the error message */
				$message = sprintf( __( 'Connection test failed (#%1$s: %2$s)', 'jetpack' ), $response->get_error_code(), $response->get_error_message() );

				$result = self::connection_failing_test( $name, $message );
			}

			return $result;
		}

		$body = wp_remote_retrieve_body( $response );
		if ( ! $body ) {
			return self::failing_test(
				array(
					'name'              => $name,
					'short_description' => __( 'Connection test failed (empty response body)', 'jetpack' ) . wp_remote_retrieve_response_code( $response ),
					'action_label'      => $this->helper_get_support_text(),
					'action'            => $this->helper_get_support_url(),
				)
			);
		}

		if ( 404 === wp_remote_retrieve_response_code( $response ) ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'The WordPress.com API returned a 404 error.', 'jetpack' ),
				)
			);
		}

		$result       = json_decode( $body );
		$is_connected = ! empty( $result->connected );
		$message      = $result->message . ': ' . wp_remote_retrieve_response_code( $response );

		if ( $is_connected ) {
			$res = self::passing_test( array( 'name' => $name ) );
		} else {
			$res = self::connection_failing_test( $name, $message );
		}

		return $res;
	}

	/**
	 * Tests the port number to ensure it is an expected value.
	 *
	 * We expect that sites on be on one of:
	 * port 80,
	 * port 443 (https sites only),
	 * the value of JETPACK_SIGNATURE__HTTP_PORT,
	 * unless the site is intentionally on a different port (e.g. example.com:8080 is the site's URL).
	 *
	 * If the value isn't one of those and the site's URL doesn't include a port, then the signature verification will fail.
	 *
	 * This happens most commonly on sites with reverse proxies, so the edge (e.g. Varnish) is running on 80/443, but nginx
	 * or Apache is responding internally on a different port (e.g. 81).
	 *
	 * @return array Test results
	 */
	protected function test__server_port_value() {
		$name = __FUNCTION__;
		if ( ! isset( $_SERVER['HTTP_X_FORWARDED_PORT'] ) && ! isset( $_SERVER['SERVER_PORT'] ) ) {
			return self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => __( 'The server port values are not defined. This is most common when running PHP via a CLI.', 'jetpack' ),
				)
			);
		}
		$site_port   = wp_parse_url( home_url(), PHP_URL_PORT );
		$server_port = isset( $_SERVER['HTTP_X_FORWARDED_PORT'] ) ? (int) $_SERVER['HTTP_X_FORWARDED_PORT'] : (int) $_SERVER['SERVER_PORT'];
		$http_ports  = array( 80 );
		$https_ports = array( 80, 443 );

		if ( defined( 'JETPACK_SIGNATURE__HTTP_PORT' ) ) {
			$http_ports[] = JETPACK_SIGNATURE__HTTP_PORT;
		}

		if ( defined( 'JETPACK_SIGNATURE__HTTPS_PORT' ) ) {
			$https_ports[] = JETPACK_SIGNATURE__HTTPS_PORT;
		}

		if ( $site_port ) {
			return self::skipped_test( array( 'name' => $name ) ); // Not currently testing for this situation.
		}

		if ( is_ssl() && in_array( $server_port, $https_ports, true ) ) {
			return self::passing_test( array( 'name' => $name ) );
		} elseif ( in_array( $server_port, $http_ports, true ) ) {
			return self::passing_test( array( 'name' => $name ) );
		} else {
			if ( is_ssl() ) {
				$needed_constant = 'JETPACK_SIGNATURE__HTTPS_PORT';
			} else {
				$needed_constant = 'JETPACK_SIGNATURE__HTTP_PORT';
			}
			return self::failing_test(
				array(
					'name'              => $name,
					'short_description' => sprintf(
						/* translators: %1$s - a PHP code snippet */
						__(
							'The server port value is unexpected.
						Try adding the following to your wp-config.php file: %1$s',
							'jetpack'
						),
						"define( '$needed_constant', $server_port )"
					),
				)
			);
		}
	}

	/**
	 * Sync Health Tests.
	 *
	 * Disabled: Results in a failing test (recommended)
	 * Delayed: Results in failing test (recommended)
	 * Error: Results in failing test (critical)
	 */
	protected function test__sync_health() {

		$name = __FUNCTION__;

		if ( ! $this->helper_is_jetpack_connected() ) {
			// If the site is not connected, there is no point in testing Sync health.
			return self::skipped_test(
				array(
					'name'                => $name,
					'show_in_site_health' => false,
				)
			);
		}

		// Sync is disabled.
		if ( ! Sync_Settings::is_sync_enabled() ) {
			return self::failing_test(
				array(
					'name'              => $name,
					'label'             => __( 'Jetpack Sync has been disabled on your site.', 'jetpack' ),
					'severity'          => 'recommended',
					'action'            => 'https://github.com/Automattic/jetpack/blob/trunk/projects/packages/sync/src/class-settings.php',
					'action_label'      => __( 'See Github for more on Sync Settings', 'jetpack' ),
					'short_description' => __( 'Jetpack Sync has been disabled on your site. This could be impacting some of your site’s Jetpack-powered features. Developers may enable / disable syncing using the Sync Settings API.', 'jetpack' ),
				)
			);
		}
		// Sync has experienced Data Loss.
		if ( Sync_Health::get_status() === Sync_Health::STATUS_OUT_OF_SYNC ) {
			return self::failing_test(
				array(
					'name'              => $name,
					'label'             => __( 'Jetpack has detected a problem with the communication between your site and WordPress.com', 'jetpack' ),
					'severity'          => 'critical',
					'action'            => Redirect::get_url( 'jetpack-contact-support' ),
					'action_label'      => __( 'Contact Jetpack Support', 'jetpack' ),
					'short_description' => __( 'There is a problem with the communication between your site and WordPress.com. This could be impacting some of your site’s Jetpack-powered features. If you continue to see this error, please contact support for assistance.', 'jetpack' ),
				)
			);

		}

		return self::passing_test( array( 'name' => $name ) );
	}

	/**
	 * Calls to WP.com to run the connection diagnostic testing suite.
	 *
	 * Intentionally added last as it will be skipped if any local failed conditions exist.
	 *
	 * @since 7.1.0
	 * @since 7.9.0 Timeout waiting for a WP.com response no longer fails the test. Test is marked skipped instead.
	 *
	 * @return array Test results.
	 */
	protected function last__wpcom_self_test() {
		$name = 'test__wpcom_self_test';

		$status = new Status();
		if ( ! Jetpack::is_connection_ready() || $status->is_offline_mode() || $status->in_safe_mode() || ! $this->pass ) {
			return self::skipped_test( array( 'name' => $name ) );
		}

		$self_xml_rpc_url = site_url( 'xmlrpc.php' );

		$testsite_url = JETPACK__API_BASE . 'testsite/1/?url=';

		// Using PHP_INT_MAX - 1 so that there is still a way to override this if needed and since it only impacts this one call.
		add_filter( 'http_request_timeout', array( 'Jetpack_Cxn_Tests', 'increase_timeout' ), PHP_INT_MAX - 1 );

		$response = wp_remote_get( $testsite_url . $self_xml_rpc_url );

		remove_filter( 'http_request_timeout', array( 'Jetpack_Cxn_Tests', 'increase_timeout' ), PHP_INT_MAX - 1 );

		if ( 200 === wp_remote_retrieve_response_code( $response ) ) {
			$result = self::passing_test( array( 'name' => $name ) );
		} elseif ( is_wp_error( $response ) && str_contains( $response->get_error_message(), 'cURL error 28' ) ) { // Timeout.
			$result = self::skipped_test(
				array(
					'name'              => $name,
					'short_description' => self::helper_get_timeout_text(),
				)
			);
		} else {
			$result = self::failing_test(
				array(
					'name'              => $name,
					'short_description' => sprintf(
						/* translators: %1$s - A debugging url */
						__( 'Jetpack.com detected an error on the WP.com Self Test. Visit the Jetpack Debug page for more info: %1$s, or contact support.', 'jetpack' ),
						Redirect::get_url( 'jetpack-support-debug', array( 'query' => 'url=' . rawurlencode( site_url() ) ) )
					),
					'action_label'      => $this->helper_get_support_text(),
					'action'            => $this->helper_get_support_url(),
				)
			);
		}

		return $result;
	}
}
