<?php

class WPCOM_Concat_Utils {
	public static function is_internal_url( $test_url, $site_url ) {
		$test_url_parsed = parse_url( $test_url );
		$site_url_parsed = parse_url( $site_url );

		if ( isset( $test_url_parsed['host'] )
			&& $test_url_parsed['host'] !== $site_url_parsed['host'] ) {
			return false;
		}

		if ( isset( $site_url_parsed['path'] )
			&& 0 !== strpos( $test_url_parsed['path'], $site_url_parsed['path'] )
			&& isset( $test_url_parsed['host'] ) //and if the URL of enqueued style is not relative
		) {
			return false;
		}	

		return true;
	}

	public static function realpath( $url, $site_url ) {
		$url_path = parse_url( $url, PHP_URL_PATH );
		$site_url_path = parse_url( $site_url, PHP_URL_PATH );
		// To avoid partial matches; subdir install at `/wp` would match `/wp-includes`
		$site_url_path = trailingslashit( $site_url_path );

		// If this is a subdirectory site, we need to strip off the subdir from the URL.
		// In a multisite install, the subdir is virtual and therefore not needed in the path.
		// In a single-site subdir install, the subdir is included in the ABSPATH and therefore ends up duplicated.
		if ( $site_url_path && '/' !== $site_url_path
			&& 0 === strpos( $url_path, $site_url_path ) ) {
			$url_path_without_subdir = preg_replace( '#^' . $site_url_path . '#', '', $url_path, 1 );
			return realpath( ABSPATH . $url_path_without_subdir );
		}

		return realpath( ABSPATH . $url_path );
	}
}
