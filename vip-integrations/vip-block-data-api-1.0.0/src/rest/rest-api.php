<?php

namespace WPCOMVIP\BlockDataApi;

use WP_Error;

defined( 'ABSPATH' ) || die();

defined( 'WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS' ) || define( 'WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS', 500 );

class RestApi {
	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
	}

	public static function validate_block_names( $param ) {
		$block_names = explode( ',', trim( $param ) );

		// Validate that all block names are valid
		foreach ( $block_names as $block_name ) {
			if ( ! is_string( $block_name ) || ! preg_match( '/^[a-z0-9-]+\/[a-z0-9-]+$/', $block_name ) ) {
				return false;
			}
		}

		return true;
	}

	public static function register_rest_routes() {
		register_rest_route( WPCOMVIP__BLOCK_DATA_API__REST_ROUTE, 'posts/(?P<id>[0-9]+)/blocks', [
			'methods'             => 'GET',
			'permission_callback' => [ __CLASS__, 'permission_callback' ],
			'callback'            => [ __CLASS__, 'get_block_content' ],
			'args'                => [
				'id'      => [
					'validate_callback' => function( $param ) {
						$post_id  = intval( $param );
						$is_valid = self::is_post_readable( $post_id );

						/**
						 * Validates that a post can be queried via the Block Data API REST endpoint.
						 * Return false to disable access to a post.
						 *
						 * @param boolean $is_valid Whether the post ID is valid for querying. Defaults to true
						 *                          when a post is available via the WordPress REST API.
						 * @param int $post_id The queried post ID.
						 */
						return apply_filters( 'vip_block_data_api__rest_validate_post_id', $is_valid, $post_id );
					},
					'sanitize_callback' => function( $param ) {
						return intval( $param );
					},
				],
				'include' => [
					'validate_callback' => [ __CLASS__, 'validate_block_names' ],
					'sanitize_callback' => function( $param ) {
						return explode( ',', trim( $param ) );
					},
				],
				// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
				'exclude' => [
					'validate_callback' => [ __CLASS__, 'validate_block_names' ],
					'sanitize_callback' => function( $param ) {
						return explode( ',', trim( $param ) );
					},
				],
			],
		] );
	}

	public static function permission_callback() {
		/**
		 * Validates that a request can access the Block Data API. This filter can be used to
		 * limit access to authenticated users.
		 * Return false to disable access.
		 *
		 * @param boolean $is_permitted Whether the request is permitted. Defaults to true.
		 */
		return apply_filters( 'vip_block_data_api__rest_permission_callback', true );
	}

	public static function get_block_content( $params ) {
		// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
		$filter_options['exclude'] = $params['exclude'];
		$filter_options['include'] = $params['include'];

		$post_id = $params['id'];
		$post    = get_post( $post_id );

		Analytics::record_usage();

		$parse_time_start = microtime( true );

		$content_parser = new ContentParser();
		$parser_results = $content_parser->parse( $post->post_content, $post_id, $filter_options );

		if ( is_wp_error( $parser_results ) ) {
			Analytics::record_error( $parser_results );

			$original_error_data = $parser_results->get_error_data();
			$wp_error_data       = '';

			// Forward HTTP status if present in WP_Error
			if ( isset( $original_error_data['status'] ) ) {
				$wp_error_data = [ 'status' => intval( $original_error_data['status'] ) ];
			}

			// Return API-safe error with extra data (e.g. stack trace) removed
			return new WP_Error( $parser_results->get_error_code(), $parser_results->get_error_message(), $wp_error_data );
		}

		$parse_time    = microtime( true ) - $parse_time_start;
		$parse_time_ms = floor( $parse_time * 1000 );

		if ( $parse_time_ms > WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS ) {
			$error_message = sprintf( 'Parse time for post ID %d exceeded threshold: %dms', $post_id, $parse_time_ms );

			// Record error silently, still return results
			Analytics::record_error( new WP_Error( 'vip-block-data-api-parser-time', $error_message ) );
		}

		return $parser_results;
	}

	private static function is_post_readable( $post_id ) {
		// Borrow logic from WP_REST_Posts_Controller->check_read_permission()
		// to only allow REST-accessible posts by default

		$post = get_post( $post_id );

		if ( empty( $post ) || empty( $post->ID ) ) {
			return false;
		}

		$post_type = get_post_type_object( $post->post_type );
		if ( empty( $post_type ) || empty( $post_type->show_in_rest ) ) {
			return false;
		}

		if ( 'publish' === $post->post_status || current_user_can( 'read_post', $post->ID ) ) {
			return true;
		}

		$post_status_obj = get_post_status_object( $post->post_status );
		if ( $post_status_obj && $post_status_obj->public ) {
			return true;
		}

		// Use parent status if inheriting
		if ( 'inherit' === $post->post_status && $post->post_parent > 0 ) {
			return self::is_post_readable( $post->post_parent );
		}

		/*
		 * If there isn't a parent, but the status is set to inherit, assume
		 * it's published (as per get_post_status()).
		 */
		if ( 'inherit' === $post->post_status ) {
			return true;
		}

		return false;
	}
}

RestApi::init();
