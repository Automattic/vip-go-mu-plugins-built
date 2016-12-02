<?php
/**
 * Class REST_API_Tests
 *
 * @package Automattic_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

/**
 * Sample test case.
 */
class REST_API_Tests extends \WP_UnitTestCase {
	/**
	 * Prepare for REST API tests
	 */
	public function setUp() {
		parent::setUp();

		global $wp_rest_server;
		$this->server = $wp_rest_server = new \WP_REST_Server;
		do_action( 'rest_api_init' );
	}

	/**
	 * Verify that GET requests to the endpoint fail
	 */
	public function test_invalid_request() {
		$request = new \WP_REST_Request( 'GET', '/' . \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_LIST );
		$response = $this->server->dispatch( $request );
		$this->assertResponseStatus( 404, $response );
	}

	/**
	 * Test that list endpoint returns expected format
	 */
	public function test_get_items() {
		$ev = Utils::create_test_event();

		$request = new \WP_REST_Request( 'POST', '/' . \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_LIST );
		$request->set_body( wp_json_encode( array( 'secret' => \WP_CRON_CONTROL_SECRET, ) ) );
		$request->set_header( 'content-type', 'application/json' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertResponseStatus( 200, $response );
		$this->assertArrayHasKey( 'events', $data );
		$this->assertArrayHasKey( 'endpoint', $data );

		$this->assertResponseData( array(
			'events'   => array(
				array(
					'timestamp' => $ev['timestamp'],
					'action'    => md5( $ev['action'] ),
					'instance'  => md5( maybe_serialize( $ev['args'] ) ),
				),
			),
			'endpoint' => get_rest_url( null, \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_RUN ),
		), $response );
	}

	/**
	 * Test that list endpoint returns expected format
	 */
	public function test_run_event() {
		$ev = Utils::create_test_event();
		$ev['action'] = md5( $ev['action'] );
		$ev['instance'] = md5( maybe_serialize( $ev['args'] ) );
		$ev['secret'] = \WP_CRON_CONTROL_SECRET;
		unset( $ev['args'] );

		$request = new \WP_REST_Request( 'PUT', '/' . \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_RUN );
		$request->set_body( wp_json_encode( $ev ) );
		$request->set_header( 'content-type', 'application/json' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertResponseStatus( 200, $response );
		$this->assertArrayHasKey( 'success', $data );
		$this->assertArrayHasKey( 'message', $data );


	}

	/**
	 * Check response code
	 */
	protected function assertResponseStatus( $status, $response ) {
		$this->assertEquals( $status, $response->get_status() );
	}

	/**
	 * Ensure response includes the expected data
	 */
	protected function assertResponseData( $data, $response ) {
		Utils::compare_arrays( $data, $response->get_data(), $this );
	}

	/**
	 * Clean up
	 */
	public function tearDown() {
		parent::tearDown();

		global $wp_rest_server;
		$wp_rest_server = null;
	}

}