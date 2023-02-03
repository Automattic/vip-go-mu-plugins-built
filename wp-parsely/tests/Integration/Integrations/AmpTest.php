<?php
/**
 * Integration Tests: AMP Integration
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\Integrations;

use Parsely\Parsely;
use Parsely\Integrations\Amp;
use Parsely\Tests\Integration\TestCase;

/**
 * Integration Tests for the AMP Integration.
 */
final class AmpTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var Parsely $parsely Holds the Parsely object.
	 */
	private static $parsely;

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		self::$parsely = new Parsely();
	}

	/**
	 * Verifies that the integration is active only if the AMP plugin is active.
	 *
	 * @covers \Parsely\Integrations\Amp::integrate
	 */
	public function test_integration_only_runs_when_AMP_plugin_is_active(): void {
		$amp = new Amp( self::$parsely );

		// AMP plugin inactive.
		$amp->integrate();
		self::assertFalse( has_action( 'template_redirect', array( $amp, 'add_actions' ) ) );

		// AMP plugin active.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
		define( 'AMP__VERSION', '1.2.3' );
		$amp->integrate();
		self::assertNotFalse( has_action( 'template_redirect', array( $amp, 'add_actions' ) ) );
	}

	/**
	 * Verifies that the integration runs only if the request is an AMP request.
	 *
	 * @covers \Parsely\Integrations\Amp::add_actions
	 * @uses \Parsely\Parsely::get_options
	 * @group amp
	 */
	public function test_integration_only_runs_if_we_can_handle_an_AMP_request(): void {
		// Mock the Amp class, but only the can_handle_amp_request() method.
		// This leaves the other methods unmocked, and therefore testable.

		$amp_mock = $this->getMockBuilder( Amp::class )->setMethods( array( 'can_handle_amp_request' ) )
			->setConstructorArgs( array( self::$parsely ) )
			->getMock();

		// On the first run, let can_handle_amp_request() return false, then
		// true on second run.
		$amp_mock->method( 'can_handle_amp_request' )->willReturnOnConsecutiveCalls( false, true );

		$amp_mock->add_actions();
		self::assertFalse( has_filter( 'amp_post_template_analytics', array( $amp_mock, 'register_parsely_for_amp_analytics' ) ) );
		self::assertFalse( has_filter( 'amp_analytics_entries', array( $amp_mock, 'register_parsely_for_amp_native_analytics' ) ) );

		$amp_mock->add_actions();
		self::assertNotFalse( has_filter( 'amp_post_template_analytics', array( $amp_mock, 'register_parsely_for_amp_analytics' ) ) );
		self::assertNotFalse( has_filter( 'amp_analytics_entries', array( $amp_mock, 'register_parsely_for_amp_native_analytics' ) ) );
	}

	/**
	 * Verifies that any AMP requests will not be handled if AMP support is
	 * disabled.
	 *
	 * @covers \Parsely\Integrations\Amp::can_handle_amp_request
	 * @uses \Parsely\Parsely::get_options
	 * @group amp
	 */
	public function test_AMP_request_is_not_handled_when_support_is_disabled(): void {
		// Mock the Amp class, but only the is_amp_request() method. This leaves
		// the other methods unmocked, and therefore testable.

		$amp_mock = $this->getMockBuilder( Amp::class )->setMethods( array( 'is_amp_request' ) )
			->setConstructorArgs( array( self::$parsely ) )
			->getMock();

		// Make is_amp_request() always return true.
		$amp_mock->method( 'is_amp_request' )->willReturn( true );

		// AMP disabled.
		self::set_options( array( 'disable_amp' => true ) );
		self::assertFalse( $amp_mock->can_handle_amp_request() );

		// AMP enabled.
		self::set_options( array( 'disable_amp' => false ) );
		self::assertTrue( $amp_mock->can_handle_amp_request() );
	}

	/**
	 * Verifies that the plugin can be registered for AMP analytics.
	 *
	 * @covers \Parsely\Integrations\Amp::add_actions
	 * @covers \Parsely\Integrations\Amp::register_parsely_for_amp_analytics
	 * @covers \Parsely\Integrations\Amp::construct_amp_config
	 * @uses \Parsely\Parsely::get_options
	 * @group amp
	 * @group settings
	 */
	public function test_can_register_Parsely_for_AMP_analytics(): void {
		$amp       = new Amp( self::$parsely );
		$analytics = array();

		// If apikey is empty, $analytics are returned.
		self::assertSame( $analytics, $amp->register_parsely_for_amp_analytics( $analytics ) );

		// Now set the key and test for changes.
		self::set_options( array( 'apikey' => 'my-api-key.com' ) );

		$output = $amp->register_parsely_for_amp_analytics( $analytics );

		self::assertSame( 'parsely', $output['parsely']['type'] );
		self::assertSame( 'my-api-key.com', $output['parsely']['config_data']['vars']['apikey'] );
	}

	/**
	 * Verifies that the plugin can be registered for AMP native analytics.
	 *
	 * @covers \Parsely\Integrations\Amp::add_actions
	 * @covers \Parsely\Integrations\Amp::register_parsely_for_amp_native_analytics
	 * @covers \Parsely\Integrations\Amp::construct_amp_config
	 * @covers \Parsely\Integrations\Amp::construct_amp_json
	 * @uses \Parsely\Parsely::get_options
	 * @group amp
	 * @group settings
	 */
	public function test_can_register_Parsely_for_AMP_native_analytics(): void {
		$amp       = new Amp( self::$parsely );
		$analytics = array();

		// If apikey is empty, $analytics are returned.
		self::assertSame( $analytics, $amp->register_parsely_for_amp_native_analytics( $analytics ) );

		// Check with AMP marked as disabled.
		self::set_options( array( 'disable_amp' => true ) );

		self::assertSame( $analytics, $amp->register_parsely_for_amp_native_analytics( $analytics ) );

		// Now enable AMP, and set the API key and test for changes.
		self::set_options(
			array(
				'disable_amp' => false,
				'apikey'      => 'my-api-key.com',
			)
		);

		$output = $amp->register_parsely_for_amp_native_analytics( $analytics );
		self::assertSame( 'parsely', $output['parsely']['type'] );
		self::assertStringContainsString( 'my-api-key.com', $output['parsely']['config'] );
	}
}
