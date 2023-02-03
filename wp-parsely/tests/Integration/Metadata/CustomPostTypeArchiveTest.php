<?php
/**
 * Integration Tests: Custom Post Type Archive pages metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Metadata;
use Parsely\Parsely;

/**
 * Integration Tests for Custom Post Type Archive pages metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 * @covers \Parsely\Metadata::construct_metadata
 */
final class CustomPostTypeArchiveTest extends NonPostTestCase {
	/**
	 * Verifies that the metadata generated for Custom Post Type Archive pages
	 * is as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Category_Builder::build_headline
	 * @uses \Parsely\Metadata\Category_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_metadata_is_correctly_constructed_for_custom_post_type_archive(): void {
		// Set permalinks, as Parsely currently strips ?page_id=... from the URL
		// property. See https://github.com/Parsely/wp-parsely/issues/151.
		$this->set_permalink_structure( '/%postname%/' );

		// Setup Parsely object.
		$parsely = new Parsely();

		// Register Post Type with specific archive URL.
		register_post_type(
			'custom_post_type',
			array(
				'public'      => true,
				'has_archive' => 'cpt-archive',
			)
		);

		// Add post to custom post type.
		self::factory()->post->create(
			array(
				'title'     => 'Post Title',
				'post_type' => 'custom_post_type',
			)
		);

		// Flush rewrite rules after creating new post type with archive.
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules
		flush_rewrite_rules();

		// Go to the custom post type archive page.
		$this->go_to( home_url( '/cpt-archive' ) );

		// The query should be for a custom post type archive.
		self::assertQueryTrue( 'is_archive', 'is_post_type_archive' );

		// Create the structured data for that CPT. The CPT archive metadata
		// doesn't use the post data, but the // construction method requires it
		// for now.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( get_post() );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the CPT name.
		self::assertEquals( 'custom_post_type', $structured_data['headline'] );
		self::assertEquals( home_url( '/cpt-archive' ), $structured_data['url'] );
	}
}
