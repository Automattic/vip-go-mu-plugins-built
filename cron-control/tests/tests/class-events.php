<?php
/**
 * Test the Event's class.
 *
 * @package a8c_Cron_Control
 * @phpcs:disable Squiz.Commenting.ClassComment.Missing
 * @phpcs:disable Squiz.Commenting.VariableComment.Missing
 * @phpcs:disable Squiz.Commenting.FunctionComment.Missing
 * @phpcs:disable WordPress.Arrays.ArrayDeclarationSpacing.AssociativeArrayFound
 */

namespace Automattic\WP\Cron_Control\Tests;
use Automattic\WP\Cron_Control\Events;

class Events_Tests extends \WP_UnitTestCase {
	private $registered_actions = [];

	function setUp() {
		parent::setUp();

		// make sure the schedule is clear.
		_set_cron_array( array() );
	}

	function tearDown() {
		foreach ( $this->registered_actions as $registered_action ) {
			remove_action( $registered_action, '__return_true' );
		}

		_set_cron_array( array() );
		parent::tearDown();
	}

	function test_get_events() {
		$events = Events::instance();

		$test_events = $this->register_test_events();

		// Fetch w/ default args = (10 + internal) max events, +30 seconds window.
		$results        = $events->get_events();
		$due_now_events = [ $test_events['test_event_1'], $test_events['test_event_2'], $test_events['test_event_3'] ];
		$this->check_get_events( $results, $due_now_events );

		// Fetch w/ 1 max queue size.
		$results     = $events->get_events( 1 );
		$first_event = [ $test_events['test_event_1'] ];
		$this->check_get_events( $results, $first_event );

		// Fetch w/ +11mins queue window (should exclude just our last event +30min event).
		$results       = $events->get_events( null, 60 * 11 );
		$window_events = [
			$test_events['test_event_1'],
			$test_events['test_event_2'],
			$test_events['test_event_3'],
			$test_events['test_event_4'],
			$test_events['test_event_5'],
		];
		$this->check_get_events( $results, $window_events );
	}

	private function check_get_events( $results, $desired_results ) {
		$this->assertEquals( count( $results['events'] ), count( $desired_results ), 'Incorrect number of events returned' );

		foreach ( $results['events'] as $event ) {
			$this->assertContains( $event['action'], wp_list_pluck( $desired_results, 'hashed' ), 'Missing registered event' );
		}
	}

	private function register_test_events() {
		$test_events = [
			[ 'timestamp' => strtotime( '-1 minute' ), 'action' => 'test_event_1' ],
			[ 'timestamp' => time(), 'action' => 'test_event_2' ],
			[ 'timestamp' => time(), 'action' => 'test_event_3' ],
			[ 'timestamp' => strtotime( '+5 minutes' ), 'action' => 'test_event_4' ],
			[ 'timestamp' => strtotime( '+10 minutes' ), 'action' => 'test_event_5' ],
			[ 'timestamp' => strtotime( '+30 minutes' ), 'action' => 'test_event_6' ],
		];

		$scheduled = [];
		foreach ( $test_events as $test_event ) {
			$scheduled[ $test_event['action'] ] = $this->register_test_event( $test_event );
		}

		return $scheduled;
	}

	private function register_test_event( $args = [] ) {
		$event = wp_parse_args( $args, [ 'timestamp' => time(), 'action' => 'test_event' ] );

		// Easier testing comparision.
		$event['hashed'] = md5( $event['action'] );

		// Plugin skips events with no callbacks.
		$this->registered_actions[] = $event['action'];
		add_action( $event['action'], '__return_true' );

		wp_schedule_single_event( $event['timestamp'], $event['action'] );

		return $event;
	}
}
