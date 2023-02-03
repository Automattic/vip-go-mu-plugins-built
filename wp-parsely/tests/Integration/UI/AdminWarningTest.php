<?php
/**
 * Integration Tests: wp-admin warning message
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\UI;

use Parsely\Parsely;
use Parsely\Tests\Integration\TestCase;
use Parsely\UI\Admin_Warning;

/**
 * Integration Tests for the wp-admin warning message.
 *
 * @since 3.0.0
 */
final class AdminWarningTest extends TestCase {
	/**
	 * Internal variable.
	 *
	 * @var Admin_Warning $admin_warning Holds the Admin_Warning object.
	 */
	private static $admin_warning;

	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		self::$admin_warning = new Admin_Warning( new Parsely() );
	}

	/**
	 * Verifies that test_display_admin_warning action returns a warning when
	 * there is no key.
	 *
	 * @covers \Parsely\UI\Admin_Warning::should_display_admin_warning
	 * @covers \Parsely\UI\Admin_Warning::__construct
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_display_admin_warning_without_key(): void {
		if ( version_compare( get_bloginfo( 'version' ), '5.9', '<' ) ) {
			self::markTestSkipped( "This test can't run below 5.9" );
		}

		$should_display_admin_warning = self::get_method( 'should_display_admin_warning', Admin_Warning::class );
		$this->set_options( array( 'apikey' => '' ) );

		$response = $should_display_admin_warning->invoke( self::$admin_warning );
		self::assertTrue( $response );
	}

	/**
	 * Verifies that test_display_admin_warning action returns a warning when
	 * there is no key.
	 *
	 * @covers \Parsely\UI\Admin_Warning::should_display_admin_warning
	 * @covers \Parsely\UI\Admin_Warning::__construct
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_display_admin_warning_without_key_old_wp(): void {
		$should_display_admin_warning = self::get_method( 'should_display_admin_warning', Admin_Warning::class );
		$this->set_options( array( 'apikey' => '' ) );
		set_current_screen( 'settings_page_parsely' );

		$response = $should_display_admin_warning->invoke( self::$admin_warning );
		self::assertTrue( $response );
	}

	/**
	 * Verifies that test_display_admin_warning action returns a warning when
	 * there is no key.
	 *
	 * @covers \Parsely\UI\Admin_Warning::should_display_admin_warning
	 * @covers \Parsely\UI\Admin_Warning::__construct
	 */
	public function test_display_admin_warning_network_admin(): void {
		$should_display_admin_warning = self::get_method( 'should_display_admin_warning', Admin_Warning::class );
		$this->set_options( array( 'apikey' => '' ) );
		set_current_screen( 'dashboard-network' );

		$response = $should_display_admin_warning->invoke( self::$admin_warning );
		self::assertFalse( $response );
	}

	/**
	 * Verifies that test_display_admin_warning action doesn't return a warning
	 * when there is a key.
	 *
	 * @covers \Parsely\UI\Admin_Warning::should_display_admin_warning
	 * @covers \Parsely\UI\Admin_Warning::__construct
	 * @uses \Parsely\Parsely::api_key_is_missing
	 * @uses \Parsely\Parsely::api_key_is_set
	 * @uses \Parsely\Parsely::get_options
	 */
	public function test_display_admin_warning_with_key(): void {
		$should_display_admin_warning = self::get_method( 'should_display_admin_warning', Admin_Warning::class );
		$this->set_options( array( 'apikey' => 'somekey' ) );

		$response = $should_display_admin_warning->invoke( self::$admin_warning );
		self::assertFalse( $response );
	}
}
