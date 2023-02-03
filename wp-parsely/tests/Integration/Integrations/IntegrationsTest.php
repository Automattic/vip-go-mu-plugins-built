<?php
/**
 * Integration Tests: Integrations collection
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\Integrations;

use Parsely\Parsely;
use Parsely\Tests\Integration\TestCase;
use ReflectionClass;

use function Parsely\parsely_integrations;

/**
 * Integration Tests for the Integrations collection.
 *
 * @todo: Instantiate and then try to register something that doesn't implement
 * the Integration interface.
 */
final class IntegrationsTest extends TestCase {
	/**
	 * Verifies that an integration can be added via the
	 * wp_parsely_add_integration filter.
	 *
	 * @covers \Parsely\parsely_integrations
	 * @uses \Parsely\Integrations\Amp::integrate
	 * @uses \Parsely\Integrations\Facebook_Instant_Articles::integrate
	 * @uses \Parsely\Integrations\Google_Web_Stories::integrate
	 * @uses \Parsely\Integrations\Integrations::integrate
	 * @uses \Parsely\Integrations\Integrations::register
	 */
	public function test_an_integration_can_be_registered_via_the_filter(): void {
		add_action(
			'wp_parsely_add_integration',
			function( $integrations ) {
				$integrations->register( 'fake', new FakeIntegration() );

				return $integrations;
			}
		);

		$integrations = parsely_integrations( new Parsely() );

		// Use Reflection to look inside the collection.
		$reflector_property = ( new ReflectionClass( $integrations ) )->getProperty( 'integrations' );
		$reflector_property->setAccessible( true );
		$registered_integrations = $reflector_property->getValue( $integrations );

		self::assertCount( 4, $registered_integrations );
		self::assertSame( array( 'amp', 'fbia', 'webstories', 'fake' ), array_keys( $registered_integrations ) );

		// Use filter to override existing key.
		add_action(
			'wp_parsely_add_integration',
			function( $integrations ) {
				$integrations->register( 'amp', new FakeIntegration() );

				return $integrations;
			}
		);

		self::assertCount( 4, $registered_integrations );
		self::assertSame( array( 'amp', 'fbia', 'webstories', 'fake' ), array_keys( $registered_integrations ) );
	}

}
// phpcs:disable Generic.Files.OneObjectStructurePerFile.MultipleFound
/**
 * Class FakeIntegration
 */
class FakeIntegration {
	/**
	 * Stubs this method to avoid a fatal error.
	 */
	public function integrate(): void {
	}
}

