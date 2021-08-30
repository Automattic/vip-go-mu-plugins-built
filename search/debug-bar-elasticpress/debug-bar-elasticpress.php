<?php
/**
 * Plugin Name:  Debug Bar ElasticPress
 * Plugin URI:   https://wordpress.org/plugins/debug-bar-elasticpress
 * Description:  Extends the debug bar plugin for ElasticPress queries.
 * Author:       10up
 * Version:      2.1.0
 * Author URI:   https://10up.com
 * Requires PHP: 5.4
 * License:      GPLv2
 * License URI:  https://www.gnu.org/licenses/old-licenses/gpl-2.0.html
 *
 * @package DebugBarElasticPress
 */

define( 'EP_DEBUG_VERSION', '2.1.0' );
define( 'EP_DEBUG_URL', plugin_dir_url( __FILE__ ) );

/**
 * Register panel
 *
 * @param  array $panels Debug Bar Panels
 * @return array
 */
function ep_add_debug_bar_panel( $panels ) {
	include_once __DIR__ . '/classes/class-ep-debug-bar-elasticpress.php';
	$panels[] = new EP_Debug_Bar_ElasticPress();
	return $panels;
}
add_filter( 'debug_bar_panels', 'ep_add_debug_bar_panel' );

/**
 * Register status
 *
 * @since 2.1.0
 * @param array $stati Debug Bar Stati
 * @return array
 */
function ep_add_debug_bar_stati( $stati ) {
	$stati[] = array(
		'ep_version',
		esc_html__( 'ElasticPress Version', 'debug-bar-elasticpress' ),
		defined( 'EP_VERSION' ) ? EP_VERSION : '',
	);

	$elasticsearch_version = '';
	if (
		class_exists( '\ElasticPress\Elasticsearch' ) &&
		method_exists( \ElasticPress\Elasticsearch::factory(), 'get_elasticsearch_version' )
	) {
		$elasticsearch_version = \ElasticPress\Elasticsearch::factory()->get_elasticsearch_version();
	}
	if ( function_exists( '\ElasticPress\Utils\is_epio' ) && \ElasticPress\Utils\is_epio() ) {
		$elasticsearch_version = esc_html__( 'ElasticPress.io Managed Platform', 'debug-bar-elasticpress' );
	}
	$stati[] = array(
		'es_version',
		esc_html__( 'Elasticsearch Version', 'debug-bar-elasticpress' ),
		$elasticsearch_version,
	);
	return $stati;
}
add_filter( 'debug_bar_statuses', 'ep_add_debug_bar_stati' );

/**
 * Add explain=true to elastic post query
 *
 * @param  array $formatted_args Formatted Elasticsearch query
 * @param  array $args           Query variables
 * @return array
 */
function ep_add_explain_args( $formatted_args, $args ) {
	if ( isset( $_GET['explain'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification
		$formatted_args['explain'] = true;
	}
	return $formatted_args;
}
add_filter( 'ep_formatted_args', 'ep_add_explain_args', 10, 2 );

require_once __DIR__ . '/classes/class-ep-query-log.php';
require_once __DIR__ . '/classes/class-ep-debug-bar-query-output.php';

/**
 * Set up error log
 *
 * @since 1.3
 */
function ep_setup_query_log() {
	EP_Debug_Bar_Query_Log::factory();
}
add_action( 'plugins_loaded', 'ep_setup_query_log' );
