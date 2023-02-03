<?php
/**
 * Integration Tests: Date Archive pages metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Tests\Integration\TestCase;
use Parsely\Metadata\Date_Builder;
use Parsely\Parsely;

/**
 * Integration Tests for Date Archive pages metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 */
final class DateArchiveTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var $date_builder Holds the Date_Builder object.
	 */
	private static $date_builder;

	/**
	 * Runs once before all tests.
	 */
	public static function set_up_before_class(): void {
		self::$date_builder = new Date_Builder( new Parsely() );

		self::factory()->post->create( array( 'post_date' => '2022-10-31 23:59:59' ) );
	}

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		$this->set_permalink_structure( '/%year%/%monthnum%/%day%/%hour%/%minute%/%second%/%postname%/' );

		// explicitly setting the date and time formats to avoid relying on WP core defaults.
		update_option( 'date_format', 'F j, Y' );
		update_option( 'time_format', 'g:i a' );
	}

	/**
	 * Verifies headline metadata of Yearly Archive page.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_yearly_archive(): void {
		$this->go_to( home_url( '/2022/' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Yearly Archive - 2022', $parsely_metadata['headline'] );
	}

	/**
	 * Verifies headline of Monthly Archive page.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_monthly_archive(): void {
		$this->go_to( home_url( '/2022/10/' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Monthly Archive - October, 2022', $parsely_metadata['headline'] );
	}

	/**
	 * Verifies headline of Daily Archive page.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_daily_archive(): void {
		$this->go_to( home_url( '/2022/10/31/' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Daily Archive - October 31, 2022', $parsely_metadata['headline'] );
	}

	/**
	 * Verifies headline of Daily Archive page with user's specified date format.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_daily_archive_with_users_specified_date_format(): void {
		update_option( 'date_format', 'Y-m-d' );
		$this->go_to( home_url( '/2022/10/31/' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Daily Archive - 2022-10-31', $parsely_metadata['headline'] );
	}

	/**
	 * Verifies headline of Time Archive page.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_time_archive(): void {
		$this->go_to( home_url( '/2022/10/31/23' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Hourly, Minutely, or Secondly Archive - October 31, 2022 11:59 pm', $parsely_metadata['headline'] );
	}

	/**
	 * Verifies headline of Time Archive page with user's specified time format.
	 *
	 * @covers \Parsely\Metadata\Date_Builder::build_headline
	 * @covers \Parsely\Metadata\Date_Builder::get_metadata
	 *
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Parsely::get_options
	 *
	 * @group metadata
	 */
	public function test_time_archive_with_users_specified_time_format(): void {
		update_option( 'date_format', 'Y/m/d' );
		update_option( 'time_format', 'H:i' );

		$this->go_to( home_url( '/2022/10/31/23' ) );

		$parsely_metadata = self::$date_builder->get_metadata();

		self::assertEquals( 'Hourly, Minutely, or Secondly Archive - 2022/10/31 23:59', $parsely_metadata['headline'] );
	}

	/**
	 * Teardown method called after each test.
	 */
	public function tear_down(): void {
		$this->set_permalink_structure( '' );

		update_option( 'date_format', 'F j, Y' ); // reset to default.
		update_option( 'time_format', 'g:i a' ); // reset to default.
	}

	/**
	 * Runs once after all tests.
	 */
	public static function tear_down_after_class(): void {
		self::$date_builder = null;
	}
}
