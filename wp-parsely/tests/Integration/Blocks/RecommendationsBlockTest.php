<?php
/**
 * Integration Tests: Recommendations Block
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Blocks;

use Parsely\Recommendations_Block;
use Parsely\Tests\Integration\TestCase;
use WP_Block_Type_Registry;

/**
 * Integration Tests for the Recommendations Block.
 */
final class RecommendationsBlockTest extends TestCase {
	private const BLOCK_NAME = 'wp-parsely/recommendations';

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		// Don't run tests on WordPress versions unsupported by the Block.
		$minimum_version = Recommendations_Block::MINIMUM_WORDPRESS_VERSION;
		global $wp_version;
		if ( true === version_compare( $wp_version, $minimum_version, '<' ) ) {
			self::markTestSkipped( 'The Recommendations Block is not supported by WordPress versions lower than ' . $minimum_version );
		}
	}

	/**
	 * Verifies that the Recommendations Block's run() method registers the
	 * Block.
	 *
	 * @since 3.3.0
	 *
	 * @covers \Parsely\Recommendations_Block::run
	 * @uses \Parsely\Recommendations_Block::register_block
	 *
	 * @group blocks
	 */
	public function test_recommendations_block_gets_registered_on_run(): void {
		$recommendations_block = new Recommendations_Block();
		$recommendations_block->run();

		self::assertTrue( WP_Block_Type_Registry::get_instance()->is_registered( self::BLOCK_NAME ) );
	}
}
