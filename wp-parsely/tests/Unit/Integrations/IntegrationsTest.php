<?php
/**
 * Unit Tests: Integrations collection
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Unit\Integrations;

use Parsely\Integrations\Integration;
use Parsely\Integrations\Integrations;
use Parsely\Parsely;
use ReflectionClass;
use Yoast\WPTestUtils\BrainMonkey\TestCase;

/**
 * Unit Tests for the Integrations collection.
 */
final class IntegrationsTest extends TestCase {
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
	 * Verifies that registering and overriding integrations works as expected.
	 *
	 * @covers \Parsely\Integrations\Integrations::register
	 */
	public function test_an_integration_can_be_registered_to_a_new_Integrations_object(): void {
		$integrations = new Integrations( self::$parsely );

		$integrations->register( 'class', FakeIntegration::class );
		$integrations->register( 'object', new FakeIntegration() );

		// Use Reflection to look inside the collection.
		$reflector          = new ReflectionClass( $integrations );
		$reflector_property = $reflector->getProperty( 'integrations' );
		$reflector_property->setAccessible( true );
		$registered_integrations = $reflector_property->getValue( $integrations );

		self::assertCount( 2, $registered_integrations );
		self::assertSame( array( 'class', 'object' ), array_keys( $registered_integrations ) );

		// Override an existing integration.
		$integrations->register( 'object', new FakeIntegration2() );

		self::assertCount( 2, $registered_integrations );
		self::assertSame( array( 'class', 'object' ), array_keys( $registered_integrations ) );
	}

	/**
	 * Verifies that integrations have their integrate() method called when
	 * looping through them.
	 *
	 * @covers \Parsely\Integrations\Integrations::integrate
	 * @uses \Parsely\Integrations\Integrations::register
	 */
	public function test_registered_integrations_have_their_integrate_method_called(): void {
		$mock_builder = $this->getMockBuilder( Integration::class );
		// See https://github.com/Parsely/wp-parsely/issues/426.
		if ( method_exists( $mock_builder, 'onlyMethods' ) ) {
			$mock_integration = $mock_builder->onlyMethods( array( 'integrate' ) )
				->setConstructorArgs( array( self::$parsely ) )
				->getMock();
		} else {
			$mock_integration = $mock_builder->setMethods( array( 'integrate' ) )
				->setConstructorArgs( array( self::$parsely ) )
				->getMock();
		}
		$mock_integration->expects( $this->once() )->method( 'integrate' );

		$integrations = new Integrations( self::$parsely );
		$integrations->register( 'mock-integration', $mock_integration );

		$integrations->integrate();
	}

}
// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound
/**
 * Class FakeIntegration
 */
class FakeIntegration {
}

/**
 * Class FakeIntegration2
 */
class FakeIntegration2 {
	/**
	 * Stubs this method to avoid a fatal error.
	 */
	public function integrate(): void {
	}
}

