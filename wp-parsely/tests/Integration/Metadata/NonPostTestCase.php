<?php
/**
 * Integration Tests: Abstract base class for non-post metadata tests
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Tests\Integration\TestCase;

/**
 * Base class that all non-post metadata tests should extend from.
 */
abstract class NonPostTestCase extends TestCase {
	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		TestCase::set_options();
	}

	/**
	 * Asserts that the metadata contains all required properties.
	 *
	 * @param array $structured_data The metadata array to check.
	 */
	public function assert_data_has_required_properties( array $structured_data ): void {
		$required_properties = $this->get_required_properties();

		array_walk(
			$required_properties,
			static function( $property, $index ) use ( $structured_data ) {
				self::assertArrayHasKey( $property, $structured_data, 'Data does not have required property: ' . $property );
			}
		);
	}

	/**
	 * Returns the required properties for non-posts.
	 *
	 * @return array<string>
	 */
	private function get_required_properties(): array {
		return array(
			'@context',
			'@type',
			'headline',
			'url',
		);
	}
}
