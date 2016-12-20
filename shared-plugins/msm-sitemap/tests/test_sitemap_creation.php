<?php

require_once( 'msm_sitemap_test.php');

class WP_Test_Sitemap_Creation extends WP_UnitTestCase {
	
	public $core = null;
	
	private $num_days = 4;
	private $posts = array();
	private $posts_created = array();
	private $test_base;

	/**
	 * Generate posts and build the sitemap
	 */
	function setup() {
		if ( ! class_exists( 'MSM_Sitemap_Builder_Cron' ) ) {
			require dirname( dirname( __FILE__ ) ) . '/includes/msm-sitemap-builder-cron.php';
			MSM_Sitemap_Builder_Cron::setup();
		}

		$this->test_base = new MSM_SiteMap_Test();
		
		// Create posts for the last num_days days
		$dates = array();
		for ( $i = 0; $i < $this->num_days; $i++ )
			$dates[] = date( 'Y' ). '-' . date('m') . '-' . ( (int) date('d') - $i - 1 );
		
		$this->test_base->create_dummy_posts($dates);
		
		$this->assertCount($this->num_days, $this->test_base->posts);
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
	 * Examines the XML stored in the database after sitemap generation
	 */
	function test_sitemap_posts_were_created() {
		global $post;
		
		$sitemaps = get_posts( array(
			'post_type' => Metro_Sitemap::SITEMAP_CPT,
			'fields' => 'ids',
			'posts_per_page' => -1,
		) );
		
		$this->assertCount( $this->num_days, $sitemaps );
		
		foreach ( $sitemaps as $i => $map_id ) {
			$xml = get_post_meta( $map_id, 'msm_sitemap_xml', true );
			$post_id = $this->test_base->posts[$i]['ID'];
			$this->assertContains( 'p=' . $post_id, $xml );

			$xml_struct = simplexml_load_string( $xml );
			$this->assertNotEmpty( $xml_struct->url );
			$this->assertNotEmpty( $xml_struct->url->loc );
			$this->assertNotEmpty( $xml_struct->url->lastmod );
			$this->assertContains( 'p=' . $post_id, (string) $xml_struct->url->loc );

			$post = get_post( $post_id );
			setup_postdata( $post );
			$mod_date = get_the_modified_date( 'Y-m-d' ) . 'T' . get_the_modified_date( 'H:i:s' ) . 'Z';
			$this->assertSame( $mod_date, (string) $xml_struct->url->lastmod );
			wp_reset_postdata();
		}
	}

	function test__get_sitemap_post_id() {
		// Get yesterday's sitemap post
		$sitemap_year = date( 'Y' );
		$sitemap_month = date( 'm' );
		$sitemap_day = date( 'd' ) - 1;
		$sitemap_ymd = sprintf( '%s-%s-%s', $sitemap_year, $sitemap_month, $sitemap_day );

		$sitemap_post_id = Metro_Sitemap::get_sitemap_post_id( $sitemap_year, $sitemap_month, $sitemap_day );
		$sitemap_post = get_post( $sitemap_post_id );

		$this->assertTrue( is_a( $sitemap_post, 'WP_Post' ), 'get_sitemap_post_id returned non-WP_Post value' );
		$this->assertEquals( $sitemap_ymd, $sitemap_post->post_title );
	}

	/**
	 * This is a long and convoluted test.
	 *
	 * Checks to see that a sitemap for a day is deleted when all posts for that day are deleted too.
	 */
	function test_delete_empty_sitemap() {
		global $wpdb;

		list( $sitemap ) = get_posts( array(
			'post_type' => Metro_Sitemap::SITEMAP_CPT,
			'posts_per_page' => 1,
		) );

		$sitemap_date = date( 'Y-m-d', strtotime( $sitemap->post_date ) );
		list( $year, $month, $day ) = explode( '-', $sitemap_date );
		$start_date = $sitemap_date . ' 00:00:00';
		$end_date = $sitemap_date . ' 23:59:59';
		$post_ids = $wpdb->get_col( $wpdb->prepare( "SELECT ID FROM $wpdb->posts WHERE post_status = 'publish' AND post_date >= %s AND post_date <= %s AND post_type = 'post' LIMIT 1", $start_date, $end_date ) );

		$expected_total_urls = Metro_Sitemap::get_total_indexed_url_count() - count( $post_ids );

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}

		MSM_Sitemap_Builder_Cron::generate_sitemap_for_year_month_day( array(
			'year' => $year,
			'month' => $month,
			'day' => $day,
		) );

		$this->assertEmpty( get_post( $sitemap->ID ), 'Sitemap with no posts was not deleted' );
		$this->assertEquals( $expected_total_urls, Metro_Sitemap::get_total_indexed_url_count(), 'Mismatch in total indexed URLs' );
		$this->assertEquals( 1, did_action( 'msm_delete_sitemap_post' ), 'msm_delete_sitemap_post action did not fire' );
	}
}
