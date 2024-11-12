<?php
/**
 * Stats API Endpoint: Posts
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\REST_API\Base_Endpoint;
use Parsely\Services\Content_API\Content_API_Service;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use stdClass;

/**
 * The Stats API Posts endpoint.
 *
 * Provides an endpoint for retrieving posts.
 *
 * @since 3.17.0
 */
class Endpoint_Posts extends Base_Endpoint {
	use Post_Data_Trait;

	public const TOP_POSTS_DEFAULT_LIMIT = 5;
	public const SORT_DEFAULT            = 'views';

	/**
	 * The metrics that can be sorted by.
	 *
	 * @since 3.17.0
	 *
	 * @var array<int, string>
	 * @see https://docs.parse.ly/api-available-metrics/
	 */
	public const SORT_METRICS = array(
		'views',
		'mobile_views',
		'tablet_views',
		'desktop_views',
		'visitors',
		'visitors_new',
		'visitors_returning',
		'engaged_minutes',
		'avg_engaged',
		'avg_engaged_new',
		'avg_engaged_returning',
		'social_interactions',
		'fb_interactions',
		'tw_interactions',
		'pi_interactions',
		'social_referrals',
		'fb_referrals',
		'tw_referrals',
		'pi_referrals',
		'search_refs',
	);

	/**
	 * The Parse.ly Content API service.
	 *
	 * @since 3.17.0
	 *
	 * @var Content_API_Service
	 */
	public $content_api;

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Stats_Controller $controller The stats controller.
	 */
	public function __construct( Stats_Controller $controller ) {
		parent::__construct( $controller );
		$this->content_api = $this->parsely->get_content_api();
	}

	/**
	 * Returns the endpoint name.
	 *
	 * @since 3.17.0
	 *
	 * @return string
	 */
	public static function get_endpoint_name(): string {
		return 'posts';
	}

	/**
	 * Registers the routes for the objects of the controller.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * GET /posts
		 * Retrieves posts for the given criteria.
		 */
		$this->register_rest_route(
			'/',
			array( 'GET' ),
			array( $this, 'get_posts' ),
			array_merge(
				array(
					'period_start'   => array(
						'description' => 'The start of the period to query.',
						'type'        => 'string',
						'required'    => false,
					),
					'period_end'     => array(
						'description' => 'The end of the period to query.',
						'type'        => 'string',
						'required'    => false,
					),
					'pub_date_start' => array(
						'description' => 'The start of the publication date range to query.',
						'type'        => 'string',
						'required'    => false,
					),
					'pub_date_end'   => array(
						'description' => 'The end of the publication date range to query.',
						'type'        => 'string',
						'required'    => false,
					),
					'limit'          => array(
						'description' => 'The number of posts to return.',
						'type'        => 'integer',
						'required'    => false,
						'default'     => self::TOP_POSTS_DEFAULT_LIMIT,
					),
					'sort'           => array(
						'description' => 'The sort order of the posts.',
						'type'        => 'string',
						'enum'        => self::SORT_METRICS,
						'default'     => self::SORT_DEFAULT,
						'required'    => false,
					),
					'page'           => array(
						'description' => 'The page to fetch.',
						'type'        => 'integer',
						'required'    => false,
						'default'     => 1,
					),
					'author'         => array(
						'description'       => 'Comma-separated list of authors to filter by.',
						'type'              => 'string',
						'required'          => false,
						'validate_callback' => array( $this, 'validate_max_length_is_5' ),
						'sanitize_callback' => array( $this, 'sanitize_string_to_array' ),
					),
					'section'        => array(
						'description'       => 'Comma-separated list of sections to filter by.',
						'type'              => 'string',
						'required'          => false,
						'validate_callback' => array( $this, 'validate_max_length_is_5' ),
						'sanitize_callback' => array( $this, 'sanitize_string_to_array' ),
					),
					'tag'            => array(
						'description'       => 'Comma-separated list of tags to filter by.',
						'type'              => 'string',
						'required'          => false,
						'validate_callback' => array( $this, 'validate_max_length_is_5' ),
						'sanitize_callback' => array( $this, 'sanitize_string_to_array' ),
					),
					'segment'        => array(
						'description' => 'The segment to filter by.',
						'type'        => 'string',
						'required'    => false,
					),
				),
				$this->get_itm_source_param_args()
			)
		);
	}

	/**
	 * Sanitizes a string to an array, splitting it by commas.
	 *
	 * @since 3.17.0
	 *
	 * @param string|array<string> $str The string to sanitize.
	 * @return array<string> The sanitized array.
	 */
	public function sanitize_string_to_array( $str ): array {
		if ( is_array( $str ) ) {
			return $str;
		}

		return explode( ',', $str );
	}

	/**
	 * Validates that the parameter has at most 5 items.
	 *
	 * @since 3.17.0
	 *
	 * @param string|array<string> $string_or_array The string or array to validate.
	 * @return true|WP_Error
	 */
	public function validate_max_length_is_5( $string_or_array ) {
		if ( is_string( $string_or_array ) ) {
			$string_or_array = $this->sanitize_string_to_array( $string_or_array );
		}

		if ( count( $string_or_array ) > 5 ) {
			return new WP_Error( 'invalid_param', __( 'The parameter must have at most 5 items.', 'wp-parsely' ) );
		}

		return true;
	}

	/**
	 * API Endpoint: GET /stats/posts
	 *
	 * Retrieves the posts with the given query parameters.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request.
	 * @return array<string, stdClass>|WP_Error|WP_REST_Response
	 */
	public function get_posts( WP_REST_Request $request ) {
		$params = $request->get_params();

		// Setup the itm_source if it is provided.
		$this->set_itm_source_from_request( $request );

		/**
		 * The raw analytics data, received by the API.
		 *
		 * @var array<stdClass>|WP_Error $analytics_request
		 */
		$analytics_request = $this->content_api->get_posts(
			array(
				'period_start'   => $params['period_start'] ?? null,
				'period_end'     => $params['period_end'] ?? null,
				'pub_date_start' => $params['pub_date_start'] ?? null,
				'pub_date_end'   => $params['pub_date_end'] ?? null,
				'limit'          => $params['limit'] ?? self::TOP_POSTS_DEFAULT_LIMIT,
				'sort'           => $params['sort'] ?? self::SORT_DEFAULT,
				'page'           => $params['page'] ?? 1,
				'author'         => $params['author'] ?? null,
				'section'        => $params['section'] ?? null,
				'tag'            => $params['tag'] ?? null,
				'segment'        => $params['segment'] ?? null,
				'itm_source'     => $params['itm_source'] ?? null,
			)
		);

		if ( is_wp_error( $analytics_request ) ) {
			return $analytics_request;
		}

		// Process the data.
		$posts = array();

		/**
		 * The analytics data object.
		 *
		 * @var array<string,array<mixed>> $analytics_request
		 */
		foreach ( $analytics_request as $item ) {
			$posts[] = $this->extract_post_data( $item );
		}

		$response_data = array(
			'params' => $params,
			'data'   => $posts,
		);

		return new WP_REST_Response( $response_data, 200 );
	}
}
