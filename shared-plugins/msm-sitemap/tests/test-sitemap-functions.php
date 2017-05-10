<?php
/**
 * WP_Test_Sitemap_Functions
 *
 * @package Metro_Sitemap/unit_tests
 */

require_once( 'msm-sitemap-test.php' );

/**
 * Unit Tests to confirm Sitemaps are generated.
 *
 * @author Matthew Denton (mdbitz)
 */
class WP_Test_Sitemap_Functions extends WP_UnitTestCase {

	/**
	 * Base Test Class Instance
	 *
	 * @var MSM_SIteMap_Test
	 */
	private $test_base;

	/**
	 * Initialize MSM_SiteMap_Test
	 */
	function setup() {
		$this->test_base = new MSM_SiteMap_Test();

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
		update_option( 'msm_sitemap_indexed_url_count' , 0 );
		array_map( 'wp_delete_post', array_merge( $this->test_base->posts_created, $sitemaps ) );
	}

	/**
	 * Data Provider prividing map of recent variable and expected url count.
	 *
	 * @return array(int,int) Array of Test parameters.
	 */
	public function recentSitemapURLCountDataProvider() {
		return array(
		    array( 1,2 ),
		    array( 7,8 ),
		    array( 31,11 ),
		);
	}

	/**
	 * Verify get_recent_sitemap_url_counts returns correct count
	 *
	 * @dataProvider recentSitemapURLCountDataProvider
	 * @param int $n Days.
	 * @param in  $expected_count Expected Urls to be counted.
	 */
	function test_get_recent_sitemap_url_counts( $n, $expected_count ) {

		// Create Multiple Posts acorss various Dates.
		$date = time();
		// 3 for Today, 1 in "draft" status
		$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
		$this->test_base->create_dummy_post( $cur_day );
		$this->test_base->create_dummy_post( $cur_day );
		$this->test_base->create_dummy_post( $cur_day, 'draft' );

		// 1  for each day in last week
		for ( $i = 0; $i < 6; $i++ ) {
			$date = strtotime( '-1 day', $date );
			$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
			$this->test_base->create_dummy_post( $cur_day );
		}

		// 1 per week for previous 3 weeks
		for ( $i = 0; $i < 3; $i++ ) {
			$date = strtotime( '-7 day', $date );
			$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
			$this->test_base->create_dummy_post( $cur_day );
		}
		$this->assertCount( 12, $this->test_base->posts );
		$this->test_base->build_sitemaps();

		$stats = Metro_Sitemap::get_recent_sitemap_url_counts( $n );
		$tot_count = 0;
		// Check counts for each date.
		foreach ( $stats as $date => $count ) {
			$tot_count += $count;
		}
		// Verify Stat returned for each day in n.
		$this->assertEquals( $n, count( $stats ) );
		// Verify total Stats are per post count.
		$this->assertEquals( $expected_count, $tot_count );
	}

	/**
	 * Data Provider for post year ranges
	 *
	 * @return array(int,int) Array of Test parameters.
	 */
	public function postYearRangeDataProvider() {
		return array(
		    array( 'none',0 ),
		    array( 0,1 ),
		    array( 1,2 ),
		    array( 10,11 ),
		);
	}

	/**
	 * Verify get_post_year_range returns proper year ranges
	 *
	 * @dataProvider postYearRangeDataProvider
	 * @param int @years # of Years.
	 * @param int @range_values # of years in range.
	 */
	function test_get_post_year_range( $years, $range_values ) {
		// Add a post for each day in the last x years.
		if ( 'none' !== $years ) {
			$date = strtotime( "-$years year", time() );
			$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
			$this->test_base->create_dummy_post( $cur_day );
		}

		$year_range = Metro_Sitemap::get_post_year_range();
		$this->assertEquals( $range_values, count( $year_range ) );
	}

	/**
	 * Verify check_year_has_posts returns only years with posts
	 */
	function test_check_year_has_posts() {
		// Add a post for last year and 5 years ago.
		$date = strtotime( '-1 year', time() );
		$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
		$prev_year = date( 'Y', $date );
		$this->test_base->create_dummy_post( $cur_day );

		$date = strtotime( '-4 year', $date );
		$cur_day = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
		$prev5_year = date( 'Y', $date );
		$this->test_base->create_dummy_post( $cur_day );

		// Verify only Years for Posts are returned.
		$range_with_posts = Metro_Sitemap::check_year_has_posts();
		$this->assertContains( $prev_year, $range_with_posts );
		$this->assertContains( $prev5_year, $range_with_posts );
		$this->assertEquals( 2, count( $range_with_posts ) );

	}

	/**
	 * Data Provider for get_date_stamp
	 *
	 * @return array(int,int, int, string) Array of Test parameters.
	 */
	public function dateStampDataProvider() {
		return array(
		    array( 2016, 1, 7, '2016-01-07' ),
		    array( 2010, 8, 22, '2010-08-22' ),
		    array( 1985, 11, 5, '1985-11-05' ),
		    array( 100, 10, 12, '100-10-12' ),
		);
	}

	/**
	 * Verify get_date_stamp returns proper formatted date string
	 *
	 * @dataProvider dateStampDataProvider
	 * @param int $year Year.
	 * @param int $month Month.
	 * @param int $day Day.
	 * @param str $expected_string Expected DateStamp.
	 */
	function test_get_date_stamp( $year, $month, $day, $expected_string ) {
		$this->assertEquals( $expected_string, Metro_Sitemap::get_date_stamp( $year, $month, $day ) );
	}


	/**
	 * Data Provider for date_range_has_posts
	 *
	 * @return array( str, str, boolean ) Array of Test parameters.
	 */
	public function dateRangeHasPostsDataProvider() {
		return array(
		    array( '2016-11-01', '2016-12-15', false ),
		    array( '2016-10-01', '2016-10-15', false ),
		    array( '2016-01-01', '2016-01-01', true ),
		    array( '2016-01-01', '2016-01-10', true ),
		    array( '2015-12-28', '2016-01-01', true ),
		    array( '2014-12-28', '2016-05-04', true ),
		);
	}

	/**
	 * Verify date_range_has_posts returns expected value
	 *
	 * @dataProvider dateRangeHasPostsDataProvider
	 * @param Str     $start_date Start Date of Range in Y-M-D format.
	 * @param Str     $end_date  End Date of Range in Y-M-D format.
	 * @param boolean $has_post Does Range have Post.
	 */
	function test_date_range_has_posts( $start_date, $end_date, $has_post ) {

		// 1 for 2016-10-12 in "draft" status.
		$this->test_base->create_dummy_post( '2016-10-12 00:00:00', 'draft' );

		// 1 for 2016-01-01.
		$this->test_base->create_dummy_post( '2016-01-01 00:00:00' );

		// 1 for 2015-06-02.
		$this->test_base->create_dummy_post( '2015-06-02 00:00:00' );

		// Validate Range result.
		if ( $has_post ) {
			$this->assertNotNull( Metro_Sitemap::date_range_has_posts( $start_date, $end_date ) );
		} else {
			$this->assertNull( Metro_Sitemap::date_range_has_posts( $start_date, $end_date ) );
		}

	}


	/**
	 * Data Provider for get_post_ids_for_date
	 *
	 * @return array( str, int, int ) Array of Test parameters.
	 */
	public function postIdsForDateDataProvider() {
		return array(
		    array( '2016-10-01', 500, 0 ),
		    array( '2016-10-02', 500, 20 ),
		    array( '2016-10-02', 10, 10 ),
		    array( '2016-10-03', 500, 0 ),
		);
	}

	/**
	 * Verify get_post_ids_for_date returns expected value
	 *
	 * @dataProvider postIdsForDateDataProvider
	 * @param str $sitemap_date Date in Y-M-D format.
	 * @param str $limit max number of posts to return.
	 * @param int $expected_count Number of posts expected to be returned.
	 */
	function test_get_post_ids_for_date( $sitemap_date, $limit, $expected_count ) {

		// 1 for 2016-10-03 in "draft" status.
		$this->test_base->create_dummy_post( '2016-10-01 00:00:00', 'draft' );

		// 20 for 2016-10-02.
		for ( $i = 0; $i < 20; $i ++ ) {
			$this->test_base->create_dummy_post( '2016-10-02 00:00:00' );
		}

		$post_ids = Metro_Sitemap::get_post_ids_for_date( $sitemap_date, $limit );
		$this->assertEquals( $expected_count, count( $post_ids ) );

	}

}
