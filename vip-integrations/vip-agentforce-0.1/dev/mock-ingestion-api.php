<?php
/**
 * Mock Ingestion API - logs to terminal instead of calling Salesforce.
 * 
 * Add to env.php: define('VIP_AGENTFORCE_MOCK_INGESTION_API', true);
 */

// Intercept all HTTP requests to Salesforce Ingestion API.
add_filter( 'pre_http_request', function ( $preempt, $parsed_args, $url ) {
	// Only intercept Salesforce Ingestion API calls.
	if ( strpos( $url, '/api/v1/ingest/sources/' ) === false ) {
		return $preempt;
	}

	$method = $parsed_args['method'] ?? 'UNKNOWN';
	$body   = $parsed_args['body'] ?? '';

	// Log to terminal (visible in WP-CLI output).
	if ( defined( 'WP_CLI' ) && WP_CLI ) {
		\WP_CLI::log( '' );
		\WP_CLI::log( '{{cyan}}┌────────────────────────────────────────────────────{{reset}}' );
		\WP_CLI::log( "{{cyan}}│ [MOCK API] $method request intercepted{{reset}}" );
		\WP_CLI::log( "{{cyan}}│{{reset}} URL: $url" );

		if ( 'POST' === $method ) {
			$data = json_decode( $body, true );
			if ( isset( $data['data'][0] ) ) {
				$record         = $data['data'][0];
				$record_id      = $record['site_id_blog_id_post_id'] ?? 'unknown';
				$title          = $record['post_title'] ?? 'unknown';
				$publish_status = $record['published'];
				\WP_CLI::log( "{{cyan}}│{{reset}} Record ID: $record_id" );
				\WP_CLI::log( "{{cyan}}│{{reset}} Title: $title" );
				\WP_CLI::log( "{{cyan}}│{{reset}} Published: $publish_status" );
			}
		} elseif ( 'DELETE' === $method ) {
			$data = json_decode( $body, true );
			if ( isset( $data['ids'][0] ) ) {
				\WP_CLI::log( '{{cyan}}│{{reset}} Deleting ID: ' . $data['ids'][0] );
			}
		}

		\WP_CLI::log( '{{cyan}}│{{reset}} Status: {{green}}202 Accepted (MOCKED){{reset}}' );
		\WP_CLI::log( '{{cyan}}└────────────────────────────────────────────────────{{reset}}' );
	}

	// Return a fake successful response (202 Accepted).
	return [
		'headers'  => [ 'content-type' => 'application/json' ],
		'body'     => wp_json_encode( [ 'status' => 'accepted' ] ),
		'response' => [
			'code'    => 202,
			'message' => 'Accepted',
		],
		'cookies'  => [],
		'filename' => null,
	];
}, 10, 3 );
