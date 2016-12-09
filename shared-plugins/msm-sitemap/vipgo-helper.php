<?php

// On VIP Go we're blocking using cron as it creates a mess of cron for large datasets
add_filter( 'msm_sitemap_use_cron_builder', '__return_false', 9999 );

// Add the update cron, since this is necessary for ongoing updates
add_action( 'msm_update_sitemap_for_year_month_date', 'vipgo_schedule_sitemap_update_for_year_month_date', 10, 2 );
add_action( 'msm_vipgo_cron_generate_sitemap_for_year_month_day', 'vipgo_generate_sitemap_for_year_month_day' );

function vipgo_schedule_sitemap_update_for_year_month_date( $date, $time ) {
	list( $year, $month, $day ) = $date;

	wp_schedule_single_event(
		$time,
		'msm_vipgo_cron_generate_sitemap_for_year_month_day',
		array(
			array(
				'year' => (int) $year,
				'month' => (int) $month,
				'day' => (int) $day,
			),
		)
	);
}

function vipgo_generate_sitemap_for_year_month_day( $args ) {
	$year = $args['year'];
	$month = $args['month'];
	$day = $args['day'];
	$date_stamp = Metro_Sitemap::get_date_stamp( $year, $month, $day );
	if ( Metro_Sitemap::date_range_has_posts( $date_stamp, $date_stamp ) ) {
		Metro_Sitemap::generate_sitemap_for_date( $date_stamp );
	} else {
		Metro_Sitemap::delete_sitemap_for_date( $date_stamp );
	}
}
