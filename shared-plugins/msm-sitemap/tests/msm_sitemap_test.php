<?php

/**
 * A base class for MSM SiteMap Tests that exposes a few handy functions for test cases.
 *
 * @author michaelblouin
 */
class MSM_SiteMap_Test {
	public $posts = array();
	public $posts_created = array();
	
	/**
	 * Creates a new post for every day in $dates.
	 * 
	 * Does not trigger building of sitemaps.
	 * 
	 * @param array(str) $dates The days to create posts on
	 * @throws Exception
	 */
	function create_dummy_posts($dates) {
		// Add a post for the last few days
		foreach ( $dates as $day ) {
			$post_data = array(
				'post_title' => (string) uniqid(),
				'post_type' => 'post',
				'post_content' => (string) uniqid(),
				'post_status' => 'publish',
				'post_author' => 1,
			);
			
			$post_data['post_date'] = $post_data['post_modified'] = date_format( new DateTime($day), 'Y-m-d H:i:s' );
			$post_data['ID'] = wp_insert_post( $post_data, true );
			
			if ( is_wp_error($post_data['ID']) || 0 == $post_data['ID'] )
				throw new Exception ("Error: WP Error encountered inserting post. {$post_data['ID']->errors}, {$post_data['ID']->error_data}");
			
			$this->posts_created[] = $post_data['ID'];
			$this->posts[] = $post_data;
		}
	}

	/**
	 * Checks that the stats are correct for each individual created post
	 */
	function check_stats_for_created_posts() {
		$dates = array();

		// Count the number of posts for each date
		foreach ( $this->posts as $post ) {
			$date = date_format( new DateTime( $post['post_date'] ), 'Y-m-d' );

			if ( isset( $dates[$date] ) ) {
				$dates[$date]++;
			} else {
				$dates[$date] = 1;
			}
		}

		// Check counts for each date
		foreach ( $dates as $date => $count ) {
			list( $year, $month, $day ) = explode( '-', $date, 3 );

			$indexed_url_count = Metro_Sitemap::get_indexed_url_count( $year, $month, $day );
			if ( $indexed_url_count != $count ) {
				echo "\nExpected url count of $indexed_url_count but had count of $count on $year-$month-$day\n";
				return false;
			}
		}

		return true;
	}
		
	/**
	 * Generate sitemaps; pretends to run cron six times
	 */
	function build_sitemaps() {
		MSM_Sitemap_Builder_Cron::reset_sitemap_data();
		delete_option( 'msm_stop_processing' );
		MSM_Sitemap_Builder_Cron::generate_full_sitemap();
		update_option( 'msm_sitemap_create_in_progress', true );
		
		$days_being_processed = (array) get_option( 'msm_days_to_process', array());
		$months_being_processed = (array) get_option( 'msm_months_to_process', array());
		$years_being_processed = (array) get_option( 'msm_years_to_process', array() );
		
		while ( count($days_being_processed) || count($months_being_processed) || count($years_being_processed) ) {
			$this->fake_cron();
			$this->fake_cron();
			$this->fake_cron();

			$days_being_processed = (array) get_option( 'msm_days_to_process', array());
			$months_being_processed = (array) get_option( 'msm_months_to_process', array());
			$years_being_processed = (array) get_option( 'msm_years_to_process', array() );
		}
		
	}

	/**
	 * Fakes a cron job
	 */
	function fake_cron() {
		$schedule = _get_cron_array();
		foreach ( $schedule as $timestamp => $cron ) {
			foreach ( $cron as $hook => $arg_wrapper ) {
				if ( substr( $hook, 0, 3 ) !== 'msm' ) continue; // only run our own jobs.
				$arg_struct = array_pop( $arg_wrapper );
				$args = $arg_struct['args'][0];
				wp_unschedule_event( $timestamp, $hook, $arg_struct['args'] );
				do_action( $hook, $args );
			}
		}
	}
}

?>
