<?php
/**
 * WP_Test_Sitemap_Cron
 *
 * @package Metro_Sitemap/unit_tests
 */

require_once( 'msm-sitemap-test.php' );

/**
 * Unit Tests to confirm Cron is populated as expected
 *
 * @author Matthew Denton (mdbitz)
 */
class WP_Test_Sitemap_Cron extends WP_UnitTestCase {

	/**
	 * Humber of Posts to Create (1 per year)
	 *
	 * @var Integer
	 */
	private $num_years_data = 2;

	/**
	 * Base Test Class Instance
	 *
	 * @var MSM_SIteMap_Test
	 */
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

		// Add a post for each day in the last x years.
		$dates = array();
		$date = time();
		for ( $i = 0; $i < $this->num_years_data; $i++ ) {
			// Add a post for x years ago.
			$dates[] = date( 'Y', $date ) . '-' . date( 'm', $date ) . '-' . date( 'd', $date ) . ' 00:00:00';
			$date = strtotime( '-1 year', $date );
		}

		$this->test_base->create_dummy_posts( $dates );
		$this->assertCount( $this->num_years_data, $this->test_base->posts );
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
	 * Validate that Cron Jobs are scheduled as expected.
	 */
	function test_cron_jobs_scheduling() {

		// Reset Cron SitemapBuilder.
		MSM_Sitemap_Builder_Cron::reset_sitemap_data();
		delete_option( 'msm_stop_processing' );
		MSM_Sitemap_Builder_Cron::generate_full_sitemap();
		update_option( 'msm_sitemap_create_in_progress', true );

		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		// Validate initial Options is set to years for Posts.
		$expected_years = [
			date( 'Y' ),
			date( 'Y', strtotime( '-1 year' ) ),
		];

		// Validate initial option values.
		$this->assertSame( array_diff( $expected_years, $years_being_processed ), array_diff( $years_being_processed, $expected_years ), "Years Scheduled for Processing don't align with Posts." );

		// fake_cron.
		$this->test_base->fake_cron();

		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		// Validate Current Month is added to months_to_process.
		$month = date( 'n', time() );
		$this->assertContains( $month, $months_being_processed, 'Initial Year Processing should use Current Month if same year' );

		// fake_cron.
		$this->test_base->fake_cron();

		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		$expected_days = range( 1, date( 'j' ) );
		
		// Validate Current Month only processes days that have passed and today.
		$this->assertSame( array_diff( $expected_days, $days_being_processed ), array_diff( $days_being_processed, $expected_days ), "Current Month shouldn't process days in future." );

		$cur_year = date( 'Y' );
		while ( in_array( $cur_year, $years_being_processed ) ) {
			$this->test_base->fake_cron();
			$years_being_processed = (array) get_option( 'msm_years_to_process', array() );
		}

		// Check New Year.
		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		// Validate initial Options is set to years for Posts.
		$expected_years = [
			date( 'Y', strtotime( '-1 year' ) ),
		];

		// Validate initial option values.
		$this->assertSame( array_diff( $expected_years, $years_being_processed ), array_diff( $years_being_processed, $expected_years ), "Years Scheduled for Processing don't align when year finishes processing" );

		// fake_cron.
		$this->test_base->fake_cron();

		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		// Validate Current Month is added to months_to_process.
		$month = 12;
		$this->assertContains( $month, $months_being_processed, 'New Year Processing should start in December' );

		// fake_cron.
		$this->test_base->fake_cron();

		$days_being_processed = (array) get_option( 'msm_days_to_process', array() );
		$months_being_processed = (array) get_option( 'msm_months_to_process', array() );
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );

		$this->assertGreaterThanOrEqual( 27, count( $days_being_processed ), 'New Month Processing should star at end of Month' );

	}

	
}
