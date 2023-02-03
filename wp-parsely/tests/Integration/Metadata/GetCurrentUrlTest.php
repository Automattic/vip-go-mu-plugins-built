<?php
/**
 * Integration Tests: \Parsely\Metadata\Metadata_Builder->get_current_url()
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration;

use Parsely\Metadata\Front_Page_Builder;
use Parsely\Parsely;

/**
 * Integration Tests for \Parsely\MetadataMetadata_Builder->get_current_url().
 */
final class GetCurrentUrlTest extends TestCase {
	/**
	 * Provides the data for test_get_current_url().
	 *
	 * @return iterable
	 */
	public function data_for_test_get_current_url() {
		yield 'Home is http with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'http://example.com',
			'expected'    => 'https://example.com',
		);

		yield 'Home is https with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'https://example.com',
			'expected'    => 'https://example.com',
		);

		yield 'Home is http with port with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'http://example.com:1234',
			'expected'    => 'https://example.com:1234',
		);

		yield 'Home is https with port with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'https://example.com:1234',
			'expected'    => 'https://example.com:1234',
		);

		yield 'Home is http with port and path with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'http://example.com:1234/foo/bar',
			'expected'    => 'https://example.com:1234/foo/bar',
		);

		yield 'Home is https with port and path with force HTTPS true' => array(
			'force_https' => true,
			'home'        => 'https://example.com:1234/foo/bar',
			'expected'    => 'https://example.com:1234/foo/bar',
		);

		// Start cases with 'force_https_canonicals' = false.
		yield 'Home is http with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'http://example.com',
			'expected'    => 'http://example.com',
		);

		yield 'Home is https with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'https://example.com',
			'expected'    => 'http://example.com',
		);

		yield 'Home is http with port with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'http://example.com:1234',
			'expected'    => 'http://example.com:1234',
		);

		yield 'Home is https with port with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'https://example.com:1234',
			'expected'    => 'http://example.com:1234',
		);

		yield 'Home is http with port and path with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'http://example.com:1234/foo/bar',
			'expected'    => 'http://example.com:1234/foo/bar',
		);

		yield 'Home is https with port and path with force HTTPS false' => array(
			'force_https' => false,
			'home'        => 'https://example.com:1234/foo/bar',
			'expected'    => 'http://example.com:1234/foo/bar',
		);
	}

	/**
	 * Verifies that getting the current URL works as expected.
	 *
	 * @testdox Given Force HTTPS is $force_https, when home is $home, then
	 *          expect URLs starting with $expected.
	 * @dataProvider data_for_test_get_current_url
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata::__construct
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 *
	 * @param bool   $force_https Force HTTPS Canonical setting value.
	 * @param string $home        Home URL.
	 * @param string $expected    Expected current URL.
	 */
	public function test_get_current_url( bool $force_https, string $home, string $expected ): void {
		$this->set_options( array( 'force_https_canonicals' => $force_https ) );
		update_option( 'home', $home );

		$this->assert_current_url_for_homepage( $expected );
		$this->assert_current_url_for_post_with_id( $expected );
		$this->assert_current_url_for_random_url( $expected );
	}

	/**
	 * Asserts the correct current URL for the homepage.
	 *
	 * @param string $expected Expected start of the URL.
	 */
	private function assert_current_url_for_homepage( string $expected ): void {
		$this->go_to( '/' );

		// Using Front_Page_Builder since we can't instantiate abstract
		// Metadata_Builder.
		$builder         = new Front_Page_Builder( new Parsely() );
		$get_current_url = self::get_method( 'get_current_url', Front_Page_Builder::class );
		$res             = $get_current_url->invoke( $builder );

		self::assertEquals( $expected . '/', $res, 'Homepage page does not match.' );
	}

	/**
	 * Asserts the correct current URL for a post by ID.
	 *
	 * @param string $expected Expected start of the URL.
	 */
	private function assert_current_url_for_post_with_id( string $expected ): void {
		$post_id = $this->go_to_new_post();

		// Using Front_Page_Builder since we can't instantiate abstract
		// Metadata_Builder.
		$builder         = new Front_Page_Builder( new Parsely() );
		$get_current_url = self::get_method( 'get_current_url', Front_Page_Builder::class );
		$res             = $get_current_url->invoke( $builder, 'post', $post_id );

		self::assertEquals( $expected . '/?p=' . $post_id, $res, 'Specific post by ID does not match.' );
	}

	/**
	 * Asserts the correct current URL for a random URL with trailing slash.
	 *
	 * @param string $expected Expected start of the URL.
	 */
	private function assert_current_url_for_random_url( string $expected ): void {
		$this->go_to( '/random/url/' );

		// Using Front_Page_Builder since we can't instantiate abstract
		// Metadata_Builder.
		$builder         = new Front_Page_Builder( new Parsely() );
		$get_current_url = self::get_method( 'get_current_url', Front_Page_Builder::class );
		$res             = $get_current_url->invoke( $builder );

		$constructed_expected = $expected . '/random/url/';
		self::assertEquals( $constructed_expected, $res, 'Random URL does not match.' );
	}
}
