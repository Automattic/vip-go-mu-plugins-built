<?php
/**
 * Integration Tests: Custom Taxonomy Term Archive pages metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Metadata;
use Parsely\Parsely;

/**
 * Integration Tests for Custom Taxonomy Term Archive pages metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 * @covers \Parsely\Metadata::construct_metadata
 */
class CustomTaxonomyTermArchiveTest extends NonPostTestCase {
	/**
	 * Verifies that the metadata generated for Custom Taxonomy Term Archive
	 * pages is as expected.
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
	public function test_metadata_is_correctly_constructed_for_custom_taxonomy_term_archive(): void {
		// Set permalinks, as Parsely currently strips ?page_id=... from the URL property.
		// See https://github.com/Parsely/wp-parsely/issues/151.
		$this->set_permalink_structure( '/%postname%/' );

		// Setup Parsely object.
		$parsely = new Parsely();

		// Register custom taxonomy.
		register_taxonomy( 'custom_tax', array( 'post' ) );

		// Insert a single term, and a post with the custom term.
		$term    = self::factory()->term->create(
			array(
				'taxonomy' => 'custom_tax',
				'slug'     => 'term',
				'name'     => 'Custom Taxonomy Term',
			)
		);
		$post_id = self::factory()->post->create();

		wp_set_post_terms( $post_id, $term, 'custom_tax' );

		$term_link = get_term_link( $term );

		// Flush rewrite rules after creating new taxonomy type.
		// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.flush_rewrite_rules_flush_rewrite_rules
		flush_rewrite_rules();

		// Go to the term archive page.
		$this->go_to( $term_link );

		// The query should be for a taxonomy archive.
		self::assertQueryTrue( 'is_archive', 'is_tax' );

		// Create the structured data for that term archive. The term archive
		// metadata doesn't use the post data, but the construction method
		// requires it for now.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( get_post( $post_id ) );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the term name.
		self::assertEquals( 'Custom Taxonomy Term', $structured_data['headline'] );
		self::assertEquals( $term_link, $structured_data['url'] );
	}
}
