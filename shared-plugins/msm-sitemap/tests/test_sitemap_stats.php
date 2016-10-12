<?php

require_once( 'msm_sitemap_test.php');

/**
 * Description of test_sitemap_stats
 *
 * @author michaelblouin
 */
class WP_Test_Sitemap_Stats extends WP_UnitTestCase {
	private $num_years_data = 3;
	private $test_base;
	
	/**
	 * Generate posts and build the sitemap
	 */
	function setup() {
		_delete_all_posts();

		$this->test_base = new MSM_SiteMap_Test();

		// Add a post for each day in the last x years
		$dates = array();
		for ( $i = 0; $i < $this->num_years_data; $i++ ) {
			// Add a post for x years ago
			$dates[] = ( (int) date( 'Y' ) - $i ). '-' . date( 'm' ) . '-' . date( 'd' ) . ' 00:00:00';
		}

		$this->test_base->create_dummy_posts($dates);

		$this->assertCount( $this->num_years_data, $this->test_base->posts );

		$this->test_base->build_sitemaps();
	}

	/**
	 * Remove the sample posts and the sitemap posts
	 */
	function teardown() {
		$this->test_base->posts = array();
		$sitemaps = get_posts( array(
			'post_type' => Metro_Sitemap::SITEMAP_CPT,
			'fields' => 'ids',
			'posts_per_page' => -1,
		) );
		array_map( 'wp_delete_post', array_merge( $this->test_base->posts_created, $sitemaps ) );
	}

	/**
	 * Checks that the stats are correct for the dummy data
	 */
	function test_site_stats_creation() {
		// Check that we've indexed the proper total number of URLs
		$this->assertEquals( $this->num_years_data, Metro_Sitemap::get_total_indexed_url_count() );

		// Check specific stats
		$this->assertTrue( $this->test_base->check_stats_for_created_posts() );
	}
	
	/**
	 * Checks that site stats are correct after inserting a new post on a day
	 * that already has a sitemap.
	 */
	function test_site_stats_for_new_post() {
		$today_str = date( 'Y' ) . '-' . date( 'm' ) . '-' . date( 'd' );

		// Insert a new post for today
		$this->test_base->create_dummy_posts( array( $today_str . ' 00:00:00' ) );

		// Build sitemaps
		$this->test_base->build_sitemaps();

		// Check stats
		$this->assertEquals( $this->num_years_data + 1, Metro_Sitemap::get_total_indexed_url_count() );

		// Check specific stats
		$this->assertTrue( $this->test_base->check_stats_for_created_posts() );
	}

	function test_site_stats_for_deleted_post() {
		$today_str = date( 'Y' ) . '-' . date( 'm' ) . '-' . date( 'd' );

		// Insert a new post for today
		$this->test_base->create_dummy_posts( array( $today_str . ' 00:00:00' ) );

		// Build sitemaps
		$this->test_base->build_sitemaps();

		// Delete all posts (going backwards in time)
		$post_count = count( $this->test_base->posts );
		$deleted_dates = array();
		while ( $post_count ) {
			$last_post = array_pop( $this->test_base->posts );
			wp_delete_post( $last_post['ID'], true );
			$post_count -= 1;
			$deleted_dates[trim( substr( $last_post['post_date'], 0, 10 ) )] = 0;

			// Build sitemaps
			$this->test_base->build_sitemaps();

			// Check stats
			$this->assertEquals( $post_count, Metro_Sitemap::get_total_indexed_url_count() );

			// Check specific stats
			$this->assertTrue( $this->test_base->check_stats_for_created_posts() );
		}

		// Make sure that there is nothing left over
		$this->assertEquals( 0, Metro_Sitemap::count_sitemaps() );
		$this->assertEquals( 0, Metro_Sitemap::get_total_indexed_url_count() );
	}
}

?>
