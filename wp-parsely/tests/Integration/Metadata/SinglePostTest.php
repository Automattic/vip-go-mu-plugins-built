<?php
/**
 * Integration Tests: Single Post pages metadata
 *
 * @package Parsely\Tests
 */

declare(strict_types=1);

namespace Parsely\Tests\Integration\StructuredData;

use Parsely\Metadata;
use Parsely\Tests\Integration\TestCase;

use Parsely\Parsely;

/**
 * Integration Tests for Single Post pages metadata.
 *
 * @see https://www.parse.ly/help/integration/jsonld
 */
final class SinglePostTest extends TestCase {
	/**
	 * Setup method called before each test.
	 */
	public function set_up(): void {
		parent::set_up();

		TestCase::set_options();
	}

	/**
	 * Verifies that the metadata generated for Single Post pages is as
	 * expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_single_post(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single post and set as global post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// Check the required properties exist.
		$this->assert_data_has_required_properties( $structured_data );
		// The metadata '@type' for the context should be 'NewsArticle' for a
		// single post page.
		self::assertSame( 'NewsArticle', $structured_data['@type'] );
	}

	/**
	 * Verifies that the metadata generated for Categories is as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_category_data_for_single_post(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Insert a single category term, and a Post with that category.
		$category = self::factory()->category->create( array( 'name' => 'Test Category' ) );
		$post_id  = self::factory()->post->create( array( 'post_category' => array( $category ) ) );
		$post     = get_post( $post_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The category in the structured data should match the category of the
		// post.
		self::assertSame( 'Test Category', $structured_data['articleSection'] );
	}

	/**
	 * Verifies that the "Lowercase All Tags" option works as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_tag_data_assigned_to_a_post_are_lowercase(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Create two tags with uppercase names and a single post.
		$tag1    = self::factory()->tag->create( array( 'name' => 'Sample' ) );
		$tag2    = self::factory()->tag->create( array( 'name' => 'Tag' ) );
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Assign the Tags to the Post.
		wp_set_object_terms( $post_id, array( $tag1, $tag2 ), 'post_tag' );

		// Set the Parsely plugin to use Lowercase tags.
		$parsely_options['lowercase_tags'] = true;
		update_option( 'parsely', $parsely_options );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain both tags in lowercase form.
		self::assertContains( 'sample', $structured_data['keywords'] );
		self::assertContains( 'tag', $structured_data['keywords'] );
	}

	/**
	 * Verifies that the "Add Categories to Tags" option works as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Metadata\Post_Builder::get_categories
	 * @uses \Parsely\Metadata\Post_Builder::get_custom_taxonomy_values
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_parsely_categories_as_tags_in_single_post(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Set the Categories as Tags option to true.
		$parsely_options['cats_as_tags']   = true;
		$parsely_options['lowercase_tags'] = false;
		update_option( 'parsely', $parsely_options );

		// Create 3 categories and a single post with those categories.
		$cat1    = self::factory()->category->create( array( 'name' => 'Test Category' ) );
		$cat2    = self::factory()->category->create( array( 'name' => 'Test Category 2' ) );
		$cat3    = self::factory()->category->create( array( 'name' => 'Test Category 3' ) );
		$post_id = self::factory()->post->create( array( 'post_category' => array( $cat1, $cat2, $cat3 ) ) );
		$post    = get_post( $post_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain all three categories as keywords.
		self::assertContains( 'Test Category', $structured_data['keywords'] );
		self::assertContains( 'Test Category 2', $structured_data['keywords'] );
		self::assertContains( 'Test Category 3', $structured_data['keywords'] );
	}

	/**
	 * Verifies that the "Add Categories to Tags" option works as expected with
	 * custom taxonomies.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Metadata\Post_Builder::get_categories
	 * @uses \Parsely\Metadata\Post_Builder::get_custom_taxonomy_values
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_custom_taxonomy_as_tags_in_single_post(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Set up the options to force lowercase tags.
		$parsely_options['cats_as_tags'] = true;
		update_option( 'parsely', $parsely_options );

		// Create a custom taxonomy and add a term for it.
		register_taxonomy( 'hockey', 'post' );
		$custom_tax_tag = self::factory()->tag->create(
			array(
				'name'     => 'Gretzky',
				'taxonomy' => 'hockey',
			)
		);

		// Create a tag and a category and a single post and assign the category to the post.
		$tag     = self::factory()->tag->create( array( 'name' => 'My Tag' ) );
		$cat     = self::factory()->category->create( array( 'name' => 'My Category' ) );
		$post_id = self::factory()->post->create( array( 'post_category' => array( $cat ) ) );

		$post = get_post( $post_id );

		// Assign the custom taxonomy term and tag to the post.
		wp_set_object_terms( $post_id, array( $custom_tax_tag ), 'hockey' );
		wp_set_object_terms( $post_id, array( $tag ), 'post_tag' );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain the category, the post tag, and the custom taxonomy term.
		self::assertContains( 'my category', $structured_data['keywords'] );
		self::assertContains( 'my tag', $structured_data['keywords'] );
		self::assertContains( 'gretzky', $structured_data['keywords'] );
	}

	/**
	 * Verifies that the "Use Top-Level Categories for Section" option works as
	 * expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Metadata\Post_Builder::get_top_level_term
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_use_top_level_cats_in_single_post(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Set Parsely to use top-level categories.
		$parsely_options['use_top_level_cats'] = true;
		update_option( 'parsely', $parsely_options );

		// Create 2 categories and a single post with those categories.
		$cat1    = self::factory()->category->create( array( 'name' => 'Parent Category' ) );
		$cat2    = self::factory()->category->create(
			array(
				'name'   => 'Child Category',
				'parent' => $cat1,
			)
		);
		$post_id = self::factory()->post->create( array( 'post_category' => array( $cat1, $cat2 ) ) );
		$post    = get_post( $post_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain the parent category.
		self::assertSame( 'Parent Category', $structured_data['articleSection'] );

		// Set Parsely to not use top-level categories.
		$parsely_options['use_top_level_cats'] = false;
		update_option( 'parsely', $parsely_options );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The structured data should contain the child category.
		self::assertSame( 'Child Category', $structured_data['articleSection'] );
	}

	/**
	 * Verifies that the "Use Custom Taxonomy for Section" option works as
	 * expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Metadata\Post_Builder::get_top_level_term
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_custom_taxonomy_as_section_in_single_post(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Set Parsely to use 'sports' as custom taxonomy for section.
		$parsely_options['custom_taxonomy_section'] = 'sports';

		// Create a custom taxonomy, add a term and child term to it, and create
		// a post.
		register_taxonomy( 'sports', 'post' );
		$custom_tax_tag       = self::factory()->term->create(
			array(
				'name'     => 'football',
				'taxonomy' => 'sports',
			)
		);
		$custom_tax_tag_child = self::factory()->term->create(
			array(
				'name'     => 'Premier League',
				'taxonomy' => 'sports',
				'parent'   => $custom_tax_tag,
			)
		);
		$post_id              = self::factory()->post->create();
		$post                 = get_post( $post_id );

		// Set the custom taxonomy terms to the post.
		wp_set_object_terms( $post_id, array( $custom_tax_tag, $custom_tax_tag_child ), 'sports' );

		// Make sure top-level categories are not set to be used.
		$parsely_options['use_top_level_cats'] = false;
		update_option( 'parsely', $parsely_options );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		self::assertSame( 'Premier League', $structured_data['articleSection'] );

		// Now make sure top-level categories are set to be used.
		$parsely_options['use_top_level_cats'] = true;
		update_option( 'parsely', $parsely_options );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		self::assertSame( 'football', $structured_data['articleSection'] );
	}

	/**
	 * Verifies that the "Force HTTPS Canonicals" option works as expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 * @group settings
	 */
	public function test_http_canonicals_for_single_post(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Create a single post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Set Parsely to not force https canonicals.
		$parsely_options['force_https_canonicals'] = false;
		update_option( 'parsely', $parsely_options );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The url scheme should be 'http'.
		$url = wp_parse_url( $structured_data['url'] );
		self::assertSame( 'http', $url['scheme'] );

		// Set Parsely to force https canonicals.
		$parsely_options['force_https_canonicals'] = true;
		update_option( 'parsely', $parsely_options );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// The url scheme should be 'https'.
		$url = wp_parse_url( $structured_data['url'] );
		self::assertSame( 'https', $url['scheme'] );
	}

	/**
	 * Verifies that the modified date field in the generated metadata is as
	 * expected.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @uses \Parsely\Parsely::update_metadata_endpoint
	 * @group metadata
	 */
	public function test_metadata_post_modified_date(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create a post with a date in the past.
		$time_format      = 'Y-m-d\TH:i:s\Z';
		$time_yesterday   = time() - DAY_IN_SECONDS;
		$date_created     = gmdate( $time_format, $time_yesterday );
		$date_created_gmt = gmdate( $time_format, ( $time_yesterday + get_option( 'gmt_offset' ) * HOUR_IN_SECONDS ) );
		$post_id          = self::factory()->post->create(
			array(
				'post_date'     => $date_created,
				'post_date_gmt' => $date_created_gmt,
			)
		);
		$post             = get_post( $post_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$meta     = new Metadata( $parsely );
		$metadata = $meta->construct_metadata( $post );

		self::assertSame( $date_created, $metadata['dateCreated'] );
		self::assertSame( $date_created, $metadata['dateModified'] );

		// Update the post and reload metadata.
		wp_update_post( array( 'ID' => $post_id ) );
		$post_updated     = get_post( $post_id );
		$metadata_updated = $meta->construct_metadata( $post_updated );

		// In the metadata, check that the last modified date has been updated.
		self::assertSame( $date_created, $metadata_updated['dateCreated'] );
		self::assertNotSame( $date_created, $metadata_updated['dateModified'] );
	}

	/**
	 * Verifies that date fields in the generated metadata are as expected when
	 * the post doesn't contain a creation date.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_empty_post_date_has_dates_omitted_from_metadata(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create a single post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		unset( $post->post_date );
		unset( $post->post_date_gmt );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// Without a post date, there should not be the following in the
		// metadata.
		self::assertArrayNotHasKey( 'dateCreated', $structured_data );
		self::assertArrayNotHasKey( 'datePublished', $structured_data );
		self::assertArrayNotHasKey( 'dateModified', $structured_data );
	}

	/**
	 * Verifies that date fields in the generated metadata are as expected when
	 * the post has identical creation and modified dates.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_post_date_with_same_create_modified_dates_included_in_metadata(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create the post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Annotate it with the timestamps to test against.
		$singular_datetime       = '2021-12-30 20:11:42';
		$post->post_date         = $singular_datetime;
		$post->post_date_gmt     = $singular_datetime;
		$post->post_modified     = $singular_datetime;
		$post->post_modified_gmt = $singular_datetime;

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// Identical post creation and modified dates should be present in the
		// metadata.
		$expected_singular_datetime = '2021-12-30T20:11:42Z';

		self::assertSame( $expected_singular_datetime, $structured_data['dateCreated'] );
		self::assertSame( $expected_singular_datetime, $structured_data['datePublished'] );
		self::assertSame( $expected_singular_datetime, $structured_data['dateModified'] );
	}

	/**
	 * Verifies that date fields in the generated metadata are as expected when
	 * the post has a modified date that is prior to its creation date.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_post_date_with_modified_before_created_date_in_metadata(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create the post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Annotate it with the timestamps to test against.
		$modified_datetime       = '2021-12-30 20:11:41';
		$created_datetime        = '2021-12-30 20:11:42';
		$post->post_date         = $created_datetime;
		$post->post_date_gmt     = $created_datetime;
		$post->post_modified     = $modified_datetime;
		$post->post_modified_gmt = $modified_datetime;

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// Modified dates earlier than created dates should be "promoted" to the latter.
		$expected_singular_datetime = '2021-12-30T20:11:42Z';

		self::assertSame( $expected_singular_datetime, $structured_data['dateCreated'] );
		self::assertSame( $expected_singular_datetime, $structured_data['datePublished'] );
		self::assertSame( $expected_singular_datetime, $structured_data['dateModified'] );
	}

	/**
	 * Verifies that date fields in the generated metadata are as expected when
	 * the post has a modified date that is after its creation date.
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_post_date_with_modified_after_created_date_in_metadata(): void {
		// Setup Parsely object.
		$parsely = new Parsely();

		// Create the post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Annotate it with the timestamps to test against.
		$created_datetime        = '2021-12-30 20:11:42';
		$modified_datetime       = '2021-12-30 20:11:43';
		$post->post_date         = $created_datetime;
		$post->post_date_gmt     = $created_datetime;
		$post->post_modified     = $modified_datetime;
		$post->post_modified_gmt = $modified_datetime;

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		// Create the structured data for that post.
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		// Modified dates later than created dates should be present in the
		// metadata.
		$expected_created_datetime  = '2021-12-30T20:11:42Z';
		$expected_modified_datetime = '2021-12-30T20:11:43Z';

		self::assertSame( $expected_created_datetime, $structured_data['dateCreated'] );
		self::assertSame( $expected_created_datetime, $structured_data['datePublished'] );
		self::assertSame( $expected_modified_datetime, $structured_data['dateModified'] );
	}

	/**
	 * Asserts whether metadata properties have been correctly set.
	 *
	 * @param array $structured_data Array of metadata to check.
	 */
	public function assert_data_has_required_properties( $structured_data ): void {
		$required_properties = $this->get_required_properties();

		array_walk(
			$required_properties,
			static function( $property, $index ) use ( $structured_data ) {
				self::assertArrayHasKey( $property, $structured_data, 'Data does not have required property: ' . $property );
			}
		);
	}

	/**
	 * Verifies that the keywords field in the generated metadata is as expected
	 * when the option "Add Categories to Tags" is enabled but the post has no
	 * categories.
	 *
	 * @since 3.0.3
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_categories
	 * @uses \Parsely\Metadata\Post_Builder::get_custom_taxonomy_values
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_post_with_categories_as_tags_without_categories(): void {
		// Setup Parsely object.
		$parsely         = new Parsely();
		$parsely_options = $parsely->get_options();

		// Create a single post.
		$post_id = self::factory()->post->create();
		$post    = get_post( $post_id );

		// Set Parsely to not force https canonicals.
		$parsely_options['cats_as_tags'] = true;
		update_option( 'parsely', $parsely_options );

		$default_category_slug = get_category( get_option( 'default_category' ) )->slug;
		wp_remove_object_terms( $post_id, $default_category_slug, 'category' );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post_id ) );

		$expected        = array();
		$metadata        = new Metadata( $parsely );
		$structured_data = $metadata->construct_metadata( $post );

		self::assertSame( $expected, $structured_data['keywords'] );
	}

	/**
	 * Verifies that the image fields in the generated metadata are as
	 * expected.
	 *
	 * @since 3.3.0
	 *
	 * @covers \Parsely\Metadata::__construct
	 * @covers \Parsely\Metadata::construct_metadata
	 * @covers \Parsely\Metadata\Metadata_Builder::get_current_url
	 * @uses \Parsely\Metadata\Metadata_Builder::__construct
	 * @uses \Parsely\Metadata\Metadata_Builder::build_basic
	 * @uses \Parsely\Metadata\Metadata_Builder::clean_value
	 * @uses \Parsely\Metadata\Post_Builder::__construct
	 * @uses \Parsely\Metadata\Post_Builder::build_article_section
	 * @uses \Parsely\Metadata\Post_Builder::build_author
	 * @uses \Parsely\Metadata\Post_Builder::build_headline
	 * @uses \Parsely\Metadata\Post_Builder::build_image
	 * @uses \Parsely\Metadata\Post_Builder::build_keywords
	 * @uses \Parsely\Metadata\Post_Builder::build_main_entity
	 * @uses \Parsely\Metadata\Post_Builder::build_metadata_post_times
	 * @uses \Parsely\Metadata\Post_Builder::build_publisher
	 * @uses \Parsely\Metadata\Post_Builder::build_thumbnail_url
	 * @uses \Parsely\Metadata\Post_Builder::build_type
	 * @uses \Parsely\Metadata\Post_Builder::build_url
	 * @uses \Parsely\Metadata\Post_Builder::get_author_names
	 * @uses \Parsely\Metadata\Post_Builder::get_bottom_level_term
	 * @uses \Parsely\Metadata\Post_Builder::get_category_name
	 * @uses \Parsely\Metadata\Post_Builder::get_coauthor_names
	 * @uses \Parsely\Metadata\Post_Builder::get_metadata
	 * @uses \Parsely\Metadata\Post_Builder::get_tags
	 * @uses \Parsely\Parsely::get_options
	 * @uses \Parsely\Parsely::post_has_trackable_status
	 * @group metadata
	 */
	public function test_post_featured_image_urls_in_metadata_are_correct(): void {
		// Initialize required objects.
		$metadata = new Metadata( new Parsely() );

		// Create a post with a featured image.
		$post            = self::factory()->post->create_and_get();
		$attachment_path = dirname( __DIR__, 3 ) . '/.wordpress-org/banner-1544x500.png';
		$attachment_id   = self::factory()->attachment->create_upload_object( $attachment_path, $post->ID );
		set_post_thumbnail( $post, $attachment_id );

		// Go to current post to update WP_Query with correct data.
		$this->go_to( get_permalink( $post->ID ) );

		// Generate metadata and expected results.
		$actual_metadata    = $metadata->construct_metadata( $post );
		$expected_image_url = get_the_post_thumbnail_url( $post, 'full' );
		$expected_thumb_url = get_the_post_thumbnail_url( $post, 'thumbnail' );

		self::assertSame( $expected_image_url, $actual_metadata['image']['url'] );
		self::assertSame( $expected_thumb_url, $actual_metadata['thumbnailUrl'] );
	}

	/**
	 * Returns the required properties for posts.
	 *
	 * @return array<string>
	 */
	private function get_required_properties(): array {
		return array(
			'@context',
			'@type',
			'headline',
			'url',
			'thumbnailUrl',
			'datePublished',
			'articleSection',
			'creator',
			'keywords',
		);
	}
}
