<?php
/**
 * Execute cron via WP-CLI
 *
 * Not intended for human use, rather it powers the Go-based Runner. Use the `events` command instead.
 *
 * @package a8c_Cron_Control
 */

namespace Automattic\WP\Cron_Control\CLI;


/**
 * Commands used by the Go-based runner to list sites
 */
class Orchestrate_Sites extends \WP_CLI_Command {
	const RUNNER_HOST_HEARTBEAT_KEY = 'a8c_cron_control_host_heartbeats';

	/**
	 * Record a heartbeat
	 *
	 * [--heartbeat-interval=<duration>]
	 * : The polling interval used by the runner to retrieve events and sites
	 */
	public function heartbeat( $args, $assoc_args ) {
		$assoc_args = wp_parse_args( $assoc_args, [
			'heartbeat-interval' => 60,
		] );

		$this->do_heartbeat( intval( $assoc_args[ 'heartbeat-interval' ] ) );
	}

	/**
	 * List sites
	 */
	public function list() {
		$hosts = $this->get_hosts();

		// Use 2 hosts per site
		$num_groups = count( $hosts ) / 2;
		if ( $num_groups < 2 ) {
			// Every host runs every site
			return $this->display_sites();
		}

		$id = array_search( gethostname(), $hosts );
		$this->display_sites( $num_groups, $id % $num_groups );
	}

	private function display_sites( $num_groups = 1, $group = 0 ) {
		$sites = get_sites( [ 'number' => 10000 ] );

		// Only return sites in our group
		$sites = array_filter( $sites, function( $id ) use ( $num_groups, $group ) {
			return $id % $num_groups === $group;
		}, ARRAY_FILTER_USE_KEY );

		// Add the site URL to each site object
		$sites = array_map( function( $site ) {
			// Don't use home or siteurl since those don't always match up with the `wp_blogs` entry.
			// That can result in a "site not found" when passed via the `--url` WP-CLI param.
			// Instead, construct the URL from data in the `wp_blogs` table.

			// Have to grab scheme from the home URL; not exposed in `$site`.
			$home_url = get_home_url( $site->blog_id );
			$scheme = parse_url( $home_url, PHP_URL_SCHEME );

			$domain = $site->domain;

			$path = '';
			if ( $site->path && '/' !== $site->path ) {
				$path= $site->path;
			}

			$site->url = sprintf( '%s://%s%s', $scheme, $domain, $path );

			return $site;
		}, $sites );

		$assoc_args = [
			'fields' => 'url',
			'format' => 'json',
		];

		$formatter = new \WP_CLI\Formatter( $assoc_args, null, 'site' );
		$formatter->display_items( $sites );
	}

	private function do_heartbeat( $heartbeat_interval = 60 ) {
		if ( defined( 'WPCOM_SANDBOXED' ) && true === WPCOM_SANDBOXED ) {
			return;
		}

		$heartbeats = wp_cache_get( self::RUNNER_HOST_HEARTBEAT_KEY );
		if ( ! $heartbeats ) {
			$heartbeats = [];
		}

		// Remove stale hosts
		// If a host has missed 2 heartbeats, remove it from jobs processing
		$heartbeats = array_filter( $heartbeats, function( $timestamp ) use ( $heartbeat_interval ) {
			if ( time() - ( $heartbeat_interval * 2 ) > $timestamp ) {
				return false;
			}

			return true;
		} );

		$heartbeats[ gethostname() ] = time();
		wp_cache_set( self::RUNNER_HOST_HEARTBEAT_KEY, $heartbeats );
	}

	private function get_hosts() {
		$heartbeats = wp_cache_get( self::RUNNER_HOST_HEARTBEAT_KEY );
		if ( ! $heartbeats ) {
			return [];
		}

		return array_keys( $heartbeats );
	}
}

\WP_CLI::add_command( 'cron-control orchestrate sites', 'Automattic\WP\Cron_Control\CLI\Orchestrate_Sites' );
