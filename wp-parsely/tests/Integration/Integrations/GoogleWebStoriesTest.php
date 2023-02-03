<?php
/**
 * Integration Tests: Google Web Stories Integration
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\Integrations;

use Parsely\Integrations\Google_Web_Stories;
use Parsely\Parsely;
use Parsely\Tests\Integration\TestCase;

/**
 * Integration Tests for the Google Web Stories Integration.
 */
final class GoogleWebStoriesTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var GoogleWebStoriesTest $google Holds the Google_Web_Stories object.
	 */
	private static $google;

	/**
	 * Setup method called before tests get executed.
	 */
	public static function set_up_before_class(): void {
		parent::set_up_before_class();

		// Mock the existence of the plugin for the sake of testing.
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedConstantFound
		define( 'WEBSTORIES_PLUGIN_FILE', __DIR__ );
	}

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		self::$google = new Google_Web_Stories( new Parsely() );
	}

	/**
	 * Verifies that the Google Web Stories analytics get enqueued.
	 *
	 * @since 3.2.0
	 *
	 * @covers \Parsely\Integrations\Google_Web_Stories::integrate
	 * @uses \Parsely\Integrations\Amp::construct_amp_config
	 * @uses \Parsely\Integrations\Amp::construct_amp_json
	 * @group scripts
	 */
	public function test_web_stories_script_is_enqueued(): void {
		self::assertFalse( has_action( 'web_stories_print_analytics', array( self::$google, 'render_amp_analytics_tracker' ) ) );

		self::$google->integrate();
		self::assertSame(
			10,
			has_action( 'web_stories_print_analytics', array( self::$google, 'render_amp_analytics_tracker' ) )
		);
	}

	/**
	 * Verifies that the AMP tracker output is correct.
	 *
	 * @since 3.2.0
	 *
	 * @covers \Parsely\Integrations\Google_Web_Stories::render_amp_analytics_tracker
	 * @uses \Parsely\Integrations\Amp::construct_amp_config
	 * @uses \Parsely\Integrations\Amp::construct_amp_json
	 * @group scripts
	 */
	public function test_render_amp_analytics_tracker(): void {
		$expected = '			<amp-analytics type="parsely">
				<script type="application/json">
					{"vars":{"apikey":"blog.parsely.com"}}				</script>
			</amp-analytics>
			';

		self::expectOutputString( $expected );

		$this::set_options( array( 'apikey' => 'blog.parsely.com' ) );
		$this::$google->render_amp_analytics_tracker();
	}
}
