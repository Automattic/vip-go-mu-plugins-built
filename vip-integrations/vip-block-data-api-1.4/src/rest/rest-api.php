<?php
/**
 * Rest API
 *
 * @package vip-block-data-api
 */

namespace WPCOMVIP\BlockDataApi;

use Throwable;
use WP_Error;
use WP_REST_Request;

defined( 'ABSPATH' ) || die();

defined( 'WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS' ) || define( 'WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS', 500 );

/**
 * Rest API that will be used to fetch block data.
 */
class RestApi {
	/**
	 * Initialize the Rest API class.
	 *
	 * @access private
	 */
	public static function init() {
		add_action( 'rest_api_init', [ __CLASS__, 'register_rest_routes' ] );
	}

	/**
	 * Validate block names are non-empty and match a `<namespace>/<block-name>` naming convention.
	 *
	 * @param string $param the block names to validate.
	 *
	 * @return bool true, if they are valid or false otherwise
	 */
	public static function validate_block_names( $param ) {
		$block_names = explode( ',', trim( $param ) );

		foreach ( $block_names as $block_name ) {
			if ( ! is_string( $block_name ) || ! preg_match( '/^[a-z0-9-]+\/[a-z0-9-]+$/', $block_name ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Register the rest routes
	 *
	 * @return void
	 */
	public static function register_rest_routes() {
		register_rest_route( WPCOMVIP__BLOCK_DATA_API__REST_ROUTE, 'posts/(?P<id>[0-9]+)/blocks', [
			'methods'             => 'GET',
			'permission_callback' => [ __CLASS__, 'permission_callback' ],
			'callback'            => [ __CLASS__, 'get_block_content' ],
			'args'                => [
				'id'      => [
					'required'          => true,
					'validate_callback' => function ( $param ) {
						$post_id     = intval( $param );
						$is_readable = self::is_post_readable( $post_id );

						/**
						 * Validates that a post can be queried via the Block Data API REST endpoint.
						 * Return false to disable access to a post.
						 *
						 * This filter can restrict access or intentionally override the default access
						 * decision when an integration provides its own authorization logic.
						 *
						 * @param boolean $is_readable Whether the post ID is valid for querying. Defaults to true
						 *                             when the post's REST controller permits access and the
						 *                             post is not password-protected for the current user.
						 * @param int $post_id The queried post ID.
						 */
						$is_allowed = apply_filters( 'vip_block_data_api__rest_validate_post_id', $is_readable, $post_id );

						return $is_allowed;
					},
					'sanitize_callback' => function ( $param ) {
						return intval( $param );
					},
				],
				'include' => [
					'validate_callback' => [ __CLASS__, 'validate_block_names' ],
					'sanitize_callback' => function ( $param ) {
						return explode( ',', trim( $param ) );
					},
				],
				// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
				'exclude' => [
					'validate_callback' => [ __CLASS__, 'validate_block_names' ],
					'sanitize_callback' => function ( $param ) {
						return explode( ',', trim( $param ) );
					},
				],
			],
		] );
	}

	/**
	 * Validates if a request can access the Block Data API or not.
	 *
	 * @return bool true, if it can be accessed or false otherwise
	 */
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

	/**
	 * Returns the block contents for a post.
	 *
	 * @param array $params the params provided to the REST endpoint which include:
	 *                 - id: the post ID
	 *                 - (optional) include: an array of block names to include
	 *                 - (optional) exclude: an array of block names to exclude.
	 *
	 * @access private
	 *
	 * @return array|WPError the block contents of the post
	 */
	public static function get_block_content( $params ) {
		$filter_options = [];
		if ( ! empty( $params['exclude'] ) ) {
			// phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_exclude
			$filter_options['exclude'] = $params['exclude'];
		}

		if ( ! empty( $params['include'] ) ) {
			$filter_options['include'] = $params['include'];
		}

		$post_id = $params['id'];
		$post    = get_post( $post_id );

		$parse_time_start = microtime( true );

		$content_parser = new ContentParser();
		$parser_results = $content_parser->parse( $post->post_content, $post_id, $filter_options );

		if ( is_wp_error( $parser_results ) ) {
			Analytics::record_error( $parser_results );

			$original_error_data = $parser_results->get_error_data();
			$wp_error_data       = '';

			// Forward HTTP status if present in WP_Error.
			if ( isset( $original_error_data['status'] ) ) {
				$wp_error_data = [ 'status' => intval( $original_error_data['status'] ) ];
			}

			// Return API-safe error with extra data (e.g. stack trace) removed.
			return new WP_Error( $parser_results->get_error_code(), $parser_results->get_error_message(), $wp_error_data );
		}

		$parse_time    = microtime( true ) - $parse_time_start;
		$parse_time_ms = floor( $parse_time * 1000 );

		if ( $parse_time_ms > WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS ) {
			$error_message = sprintf( 'Parse time for post ID %d exceeded threshold: %dms', $post_id, $parse_time_ms );

			// Record error silently, still return results.
			Analytics::record_error( new WP_Error( 'vip-block-data-api-parser-time', $error_message ) );
		}

		return $parser_results;
	}

	/**
	 * Validates that a post is valid or not, based on:
	 *
	 * - That it exists.
	 * - Is a post type that is REST-accessible.
	 * - Is readable by the current user according to that post type's REST controller.
	 * - Is not password-protected, unless the current user can edit the post.
	 *
	 * @param int $post_id the post ID to validate.
	 *
	 * @return bool true if it is, false otherwise.
	 */
	private static function is_post_readable( $post_id ) {
		$post = get_post( $post_id );

		if ( empty( $post ) || empty( $post->ID ) ) {
			return false;
		}

		$post_type = get_post_type_object( $post->post_type );
		if ( empty( $post_type ) || empty( $post_type->show_in_rest ) ) {
			return false;
		}

		// The REST posts controller permits the item itself, then redacts password-protected
		// content while preparing the response. Since this endpoint parses raw post_content,
		// require edit access before returning password-protected content.
		if ( ! empty( $post->post_password ) && ! current_user_can( 'edit_post', $post->ID ) ) {
			return false;
		}

		// Use the registered controller rather than copying the base posts controller's
		// permission logic. Post types such as wp_block add stricter checks in subclasses.
		// Custom controllers can throw during construction or permission checks, so fail
		// closed instead of letting the exception reach the REST server.
		try {
			$rest_controller = $post_type->get_rest_controller();
			if ( empty( $rest_controller ) || ! is_callable( [ $rest_controller, 'get_item_permissions_check' ] ) ) {
				return false;
			}

			$request = new WP_REST_Request( 'GET' );
			$request->set_param( 'id', $post->ID );
			$request->set_param( 'context', 'view' );

			return true === $rest_controller->get_item_permissions_check( $request );
		} catch ( Throwable $error ) {
			Analytics::record_error( new WP_Error( 'vip-block-data-api-rest-controller-error', sprintf( 'REST controller for post ID %d failed during permission check: %s', $post->ID, $error->getMessage() ) ) );

			return false;
		}
	}
}

RestApi::init();
