<?php
/**
 * Test plugin's REST API
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\Tests;

use Automattic\WP\Cron_Control\Events_Store;

/**
 * REST API tests
 */
class REST_API_Tests extends \WP_UnitTestCase {
	/**
	 * Prepare for REST API tests
	 */
	public function setUp() {
		parent::setUp();

		global $wp_rest_server;
		$wp_rest_server = new \WP_REST_Server;
		$this->server   = $wp_rest_server;
		do_action( 'rest_api_init' );

		// make sure the schedule is clear.
		_set_cron_array( array() );
	}

	/**
	 * Clean up after our tests
	 */
	function tearDown() {
		global $wp_rest_server;
		$wp_rest_server = null;

		// make sure the schedule is clear.
		_set_cron_array( array() );

		parent::tearDown();
	}

	/**
	 * Verify that GET requests to the endpoint fail
	 */
	public function test_invalid_request() {
		$request  = new \WP_REST_Request( 'GET', '/' . \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_LIST );
		$response = $this->server->dispatch( $request );
		$this->assertResponseStatus( 404, $response );
	}

	/**
	 * Test that list endpoint returns expected format
	 */
	public function test_get_items() {
		$ev = Utils::create_test_event();

		// Don't test internal events with this test.
		$internal_events = array(
			'a8c_cron_control_force_publish_missed_schedules',
			'a8c_cron_control_confirm_scheduled_posts',
			'a8c_cron_control_clean_legacy_data',
			'a8c_cron_control_purge_completed_events',
		);
		foreach ( $internal_events as $internal_event ) {
			wp_clear_scheduled_hook( $internal_event );
		}

		$request = new \WP_REST_Request( 'POST', '/' . \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_LIST );
		$request->set_body(
			wp_json_encode(
				array(
					'secret' => \WP_CRON_CONTROL_SECRET,
				)
			)
		);
		$request->set_header( 'content-type', 'application/json' );

		$response = $this->server->dispatch( $request );
		$data     = $response->get_data();

		$this->assertResponseStatus( 200, $response );
		$this->assertArrayHasKey( 'events', $data );
		$this->assertArrayHasKey( 'endpoint', $data );
		$this->assertArrayHasKey( 'total_events_pending', $data );

		$this->assertResponseData(
			array(
				'events'               => array(
					array(
						'timestamp' => $ev['timestamp'],
						'action'    => md5( $ev['action'] ),
						'instance'  => Events_Store::instance()->generate_instance_identifier( $ev['args'] ),
					),
				),
				'endpoint'             => get_rest_url( null, \Automattic\WP\Cron_Control\REST_API::API_NAMESPACE . '/' . \Automattic\WP\Cron_Control\REST_API::ENDPOINT_RUN ),
				'total_events_pending' => 1,
			),
			$response
		);
	}

	/**
	 * Test that list endpoint returns expected format
	 */
	public function test_run_event() {
		$ev             = Utils::create_test_event();
		$ev['action']   = md5( $ev['action'] );
		$ev['instance'] = Events_Store::instance()->generate_instance_identifier( $ev['args'] );
		$ev['secret']   = \WP_CRON_CONTROL_SECRET;
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
	 *
	 * @param string $status Status code.
	 * @param object $response REST API response object.
	 */
	protected function assertResponseStatus( $status, $response ) {
		$this->assertEquals( $status, $response->get_status() );
	}

	/**
	 * Ensure response includes the expected data
	 *
	 * @param array  $data Expected data.
	 * @param object $response REST API response object.
	 */
	protected function assertResponseData( $data, $response ) {
		Utils::compare_arrays( $data, $response->get_data(), $this );
	}
}
