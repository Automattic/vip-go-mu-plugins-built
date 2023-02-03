<?php
/**
 * Unit Tests: GraphQL Metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Unit\Endpoints;

use Mockery;
use Parsely\Parsely;
use Parsely\Endpoints\GraphQL_Metadata;
use Yoast\WPTestUtils\BrainMonkey\TestCase;
use Brain\Monkey\Functions;

/**
 * Unit Tests for GraphQL Metadata.
 */
final class GraphQLMetadataTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var GraphQL_Metadata $graphql Holds the GraphQL object.
	 */
	private static $graphql;

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
		self::$graphql = new GraphQL_Metadata( self::$parsely );
	}

	/**
	 * Verifies that the functions to register items into GraphQL have been
	 * called.
	 *
	 * @since 3.2.0
	 *
	 * @covers \Parsely\Endpoints\GraphQL_Metadata::register_meta
	 */
	public function test_graphql_registers_types(): void {
		// Arrange.
		Functions\when( '__' )->returnArg( 1 );

		// Assert (set expectations).
		Functions\expect( 'register_graphql_object_type' )
			->once()
			->with( 'ParselyMetaContainer', Mockery::type( 'array' ) );
		Functions\expect( 'register_graphql_field' )
			->once()
			->with( 'ContentNode', 'parsely', Mockery::type( 'array' ) );

		// Act.
		self::$graphql->register_meta();
	}
}
