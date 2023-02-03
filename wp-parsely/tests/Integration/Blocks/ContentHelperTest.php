<?php
/**
 * Integration Tests: Content Helper
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Blocks;

use Parsely\Content_Helper;
use Parsely\Tests\Integration\TestCase;

/**
 * Integration Tests for the Content Helper.
 */
final class ContentHelperTest extends TestCase {
	private const BLOCK_NAME = 'wp-parsely-block-content-helper';

	/**
	 * Verifies that the Content Helper's run() method enqueues the required
	 * files.
	 *
	 * @since 3.5.0
	 *
	 * @covers \Parsely\Content_Helper::run
	 *
	 * @group blocks
	 */
	public function test_content_helper_files_get_enqueued_on_run(): void {
		( new Content_Helper() )->run();
		self::assertTrue( wp_script_is( self::BLOCK_NAME ) );
		self::assertTrue( wp_style_is( self::BLOCK_NAME ) );
	}
}
