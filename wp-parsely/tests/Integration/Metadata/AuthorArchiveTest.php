<?php
/**
 * Integration Tests: Author Archive pages metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Metadata;
use Parsely\Parsely;

/**
 * Integration Tests for Author Archive pages metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 * @covers \Parsely\Metadata::construct_metadata
 */
final class AuthorArchiveTest extends NonPostTestCase {
	/**
	 * Verifies that the metadata generated for Author Archive pages is as
	 * expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Author_Archive_Builder::build_headline
	 * @uses \Parsely\Metadata\Author_Archive_Builder::get_display_name_from_coauthors
	 * @uses \Parsely\Metadata\Author_Archive_Builder::get_metadata
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::build_url
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_author_archive(): void {
		// Set permalinks, as Parsely currently strips ?page_id=... from the URL
		// property. See https://github.com/Parsely/wp-parsely/issues/151.
		$this->set_permalink_structure( '/%postname%/' );

		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single user, and a Post assigned to them.
		$user = self::factory()->user->create( array( 'user_login' => 'parsely' ) );
		self::factory()->post->create( array( 'post_author' => $user ) );

		// Make a request to that page to set the global $wp_query object.
		$author_posts_url = get_author_posts_url( $user );
		$this->go_to( $author_posts_url );

		// Reset permalinks to default.
		$this->set_permalink_structure( '' );

		// Create the structured data for that category.
		// The author archive metadata doesn't use the post data, but the
		// construction method requires it for now.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( get_post() );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );

		// The headline should be the category name.
		self::assertEquals( 'Author - parsely', $structured_data['headline'] );
		self::assertEquals( $author_posts_url, $structured_data['url'] );
	}
}
