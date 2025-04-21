<?php
/**
 * Stats API Endpoint: Post
 *
 * @package Parsely
 * @since   3.17.0
 */

declare(strict_types=1);

namespace Parsely\REST_API\Stats;

use Parsely\REST_API\Base_Endpoint;
use Parsely\REST_API\Use_Post_ID_Parameter_Trait;
use Parsely\Services\Content_API\Content_API_Service;
use Parsely\Utils\Utils;
use stdClass;
use WP_Error;
use WP_Post;
use WP_REST_Request;
use WP_REST_Response;

/**
 * The Stats API Post endpoint.
 *
 * Provides an endpoint for retrieving post details, referrers, and related
 * posts for a given post.
 *
 * @since 3.17.0
 *
 * @phpstan-type Referrer_Data array{
 *     metrics: array{
 *         referrers_views?: int
 *     },
 *     type?: string,
 *     name?: string
 * }
 *
 * @phpstan-type Referrer_Type_Data array{
 *     views: string,
 *     viewsPercentage: string
 * }
 *
 * @phpstan-type Referrers_Data_Item array{
 *     views: string,
 *     viewsPercentage: string,
 *     datasetViewsPercentage: string
 * }
 */
class Endpoint_Post extends Base_Endpoint {
	use Use_Post_ID_Parameter_Trait;
	use Post_Data_Trait;
	use Related_Posts_Trait;

	/**
	 * The Parse.ly Content API service.
	 *
	 * @since 3.17.0
	 *
	 * @var Content_API_Service $content_api
	 */
	public $content_api;

	/**
	 * The total views of the post.
	 *
	 * @since 3.17.0
	 *
	 * @var int
	 */
	private $total_views = 0;

	/**
	 * Constructor.
	 *
	 * @since 3.17.0
	 *
	 * @param Stats_Controller $controller The controller.
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
	 * @return string The endpoint name.
	 */
	public static function get_endpoint_name(): string {
		return 'post';
	}

	/**
	 * Registers the routes for the endpoint.
	 *
	 * @since 3.17.0
	 */
	public function register_routes(): void {
		/**
		 * GET /stats/post/{post_id}/details
		 * Returns the analytics details of a post.
		 */
		$this->register_rest_route_with_post_id(
			'/details',
			array( 'GET' ),
			array( $this, 'get_post_details' ),
			array_merge(
				array(
					'period_start' => array(
						'description' => __( 'The start of the period.', 'wp-parsely' ),
						'type'        => 'string',
						'required'    => false,
					),
					'period_end'   => array(
						'description' => __( 'The end of the period.', 'wp-parsely' ),
						'type'        => 'string',
						'required'    => false,
					),
				),
				$this->get_itm_source_param_args()
			)
		);

		/**
		 * GET /stats/post/{post_id}/referrers
		 * Returns the referrers of a post.
		 */
		$this->register_rest_route_with_post_id(
			'/referrers',
			array( 'GET' ),
			array( $this, 'get_post_referrers' ),
			array(
				'period_start' => array(
					'description' => __( 'The start of the period.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'period_end'   => array(
					'description' => __( 'The end of the period.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
				),
				'total_views'  => array(
					'description' => __( 'The total views of the post.', 'wp-parsely' ),
					'type'        => 'string',
					'required'    => false,
					'default'     => '0',
				),
			)
		);

		/**
		 * GET /stats/post/{post_id}/related
		 * Returns the related posts of a post.
		 */
		$this->register_rest_route_with_post_id(
			'/related',
			array( 'GET' ),
			array( $this, 'get_related_posts' ),
			$this->get_related_posts_param_args()
		);
	}

	/**
	 * API Endpoint: GET /stats/post/{post_id}/details
	 *
	 * Gets the details of a post.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function get_post_details( WP_REST_Request $request ) {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post      = $request->get_param( 'post' );
		$permalink = get_permalink( $post->ID );

		if ( ! is_string( $permalink ) ) {
			return new WP_Error( 'invalid_post', __( 'Invalid post.', 'wp-parsely' ), array( 'status' => 404 ) );
		}

		// Set the itm_source parameter.
		$this->set_itm_source_from_request( $request );

		// Get the data from the API.
		$analytics_request = $this->content_api->get_post_details(
			$permalink,
			$request->get_param( 'period_start' ),
			$request->get_param( 'period_end' )
		);

		if ( is_wp_error( $analytics_request ) ) {
			return $analytics_request;
		}

		$post_data = array();

		/**
		 * The analytics data object.
		 *
		 * @var array<string,array<mixed>> $analytics_request
		 */
		foreach ( $analytics_request as $data ) {
			$post_data[] = $this->extract_post_data( $data );
		}

		$response_data = array(
			'params' => $request->get_params(),
			'data'   => $post_data,
		);

		return new WP_REST_Response( $response_data, 200 );
	}

	/**
	 * API Endpoint: GET /stats/post/{post_id}/referrers
	 *
	 * Gets the referrers of a post.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response object.
	 */
	public function get_post_referrers( WP_REST_Request $request ) {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post      = $request->get_param( 'post' );
		$permalink = get_permalink( $post->ID );

		if ( ! is_string( $permalink ) ) {
			return new WP_Error( 'invalid_post', __( 'Invalid post.', 'wp-parsely' ), array( 'status' => 404 ) );
		}

		// Set the itm_source parameter.
		$this->set_itm_source_from_request( $request );

		// Get the total views.
		$total_views = $request->get_param( 'total_views' ) ?? 0;

		if ( is_string( $total_views ) ) {
			$total_views = Utils::convert_to_positive_integer( $total_views );
		}

		$this->total_views = $total_views;

		// Get the data from the API.
		$analytics_request = $this->content_api->get_post_referrers(
			$permalink,
			$request->get_param( 'period_start' ),
			$request->get_param( 'period_end' )
		);

		if ( is_wp_error( $analytics_request ) ) {
			return $analytics_request;
		}

		/**
		 * The analytics data object.
		 *
		 * @var array<Referrer_Data> $analytics_request
		 */
		$referrers_types = $this->generate_referrer_types_data( $analytics_request );
		$direct_views    = Utils::convert_to_positive_integer(
			$referrers_types['direct']['views'] ?? '0'
		);
		$referrers_top   = $this->generate_referrers_data( 5, $analytics_request, $direct_views );

		$response_data = array(
			'params' => $request->get_params(),
			'data'   => array(
				'top'   => $referrers_top,
				'types' => $referrers_types,
			),
		);

		return new WP_REST_Response( $response_data, 200 );
	}

	/**
	 * API Endpoint: GET /stats/post/{post_id}/related
	 *
	 * Gets the related posts of a post.
	 *
	 * @since 3.17.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return WP_REST_Response|WP_Error The response data.
	 */
	public function get_related_posts( WP_REST_Request $request ) {
		/**
		 * The post object.
		 *
		 * @var WP_Post $post
		 */
		$post = $request->get_param( 'post' );

		/**
		 * The post permalink.
		 *
		 * @var string $permalink
		 */
		$permalink = get_permalink( $post->ID );

		$related_posts = $this->get_related_posts_of_url( $request, $permalink );

		$response_data = array(
			'params' => $request->get_params(),
			'data'   => $related_posts,
		);

		return new WP_REST_Response( $response_data, 200 );
	}

	/**
	 * Generates the referrer types data.
	 *
	 * Referrer types are:
	 * - `social`:   Views coming from social media.
	 * - `search`:   Views coming from search engines.
	 * - `other`:    Views coming from other referrers, like external websites.
	 * - `internal`: Views coming from linking pages of the same website.
	 *
	 * Returned object properties:
	 * - `views`:           The number of views.
	 * - `viewsPercentage`: The number of views as a percentage, compared to the
	 *                      total views of all referrer types.
	 *
	 * @since 3.6.0
	 * @since 3.17.0 Moved from the `Referrers_Post_Detail_API_Proxy` class.
	 *
	 * @param array<Referrer_Data> $response The response received by the proxy.
	 * @return array<string, Referrer_Type_Data> The generated data.
	 */
	private function generate_referrer_types_data( array $response ): array {
		$result               = array();
		$total_referrer_views = 0; // Views from all referrer types combined.

		// Set referrer type order as it is displayed in the Parse.ly dashboard.
		$referrer_type_keys = array( 'social', 'search', 'other', 'internal', 'direct' );
		foreach ( $referrer_type_keys as $key ) {
			$result[ $key ] = array( 'views' => 0 );
		}

		// Set views and views totals.
		foreach ( $response as $referrer_data ) {
			/**
			 * @var int $current_views
			 */
			$current_views         = $referrer_data['metrics']['referrers_views'] ?? 0;
			$total_referrer_views += $current_views;

			/**
			 * @var string $current_key
			 */
			$current_key = $referrer_data['type'] ?? '';
			if ( '' !== $current_key ) {
				if ( ! isset( $result[ $current_key ]['views'] ) ) {
					$result[ $current_key ] = array( 'views' => 0 );
				}

				$result[ $current_key ]['views'] += $current_views;
			}
		}

		// Add direct and total views to the object.
		$result['direct']['views'] = $this->total_views - $total_referrer_views;
		$result['totals']          = array( 'views' => $this->total_views );

		// Remove referrer types without views.
		foreach ( $referrer_type_keys as $key ) {
			if ( 0 === $result[ $key ]['views'] ) {
				unset( $result[ $key ] );
			}
		}

		// Set percentage values and format numbers.
		foreach ( $result as $key => $value ) {
			// Set and format percentage values.
			$result[ $key ]['viewsPercentage'] = $this->get_i18n_percentage(
				absint( $value['views'] ),
				$this->total_views
			);

			// Format views values.
			$result[ $key ]['views'] = number_format_i18n( $result[ $key ]['views'] );
		}

		return $result;
	}

	/**
	 * Generates the top referrers data.
	 *
	 * Returned object properties:
	 * - `views`:                  The number of views.
	 * - `viewsPercentage`:        The number of views as a percentage, compared to the
	 *                             total views of all referrer types.
	 * - `datasetViewsPercentage`: The number of views as a percentage, compared
	 *                             to the total views of the current dataset.
	 *
	 * @since 3.6.0
	 * @since 3.17.0 Moved from the `Referrers_Post_Detail_API_Proxy` class.
	 *
	 * @param int                  $limit        The limit of returned referrers.
	 * @param array<Referrer_Data> $response     The response received by the proxy.
	 * @param int                  $direct_views The count of direct views.
	 * @return array<string, Referrers_Data_Item>   The generated data.
	 */
	private function generate_referrers_data(
		int $limit,
		array $response,
		int $direct_views
	): array {
		$temp_views     = array();
		$totals         = 0;
		$referrer_count = count( $response );

		// Set views and views totals.
		$loop_count = $referrer_count > $limit ? $limit : $referrer_count;
		for ( $i = 0; $i < $loop_count; $i++ ) {
			$data = $response[ $i ];

			/**
			 * @var int $referrer_views
			 */
			$referrer_views = $data['metrics']['referrers_views'] ?? 0;
			$totals        += $referrer_views;
			if ( isset( $data['name'] ) ) {
				$temp_views[ $data['name'] ] = $referrer_views;
			}
		}

		// If applicable, add the direct views.
		if ( isset( $referrer_views ) && $direct_views >= $referrer_views ) {
			$temp_views['direct'] = $direct_views;
			$totals              += $direct_views;
			arsort( $temp_views );
			if ( count( $temp_views ) > $limit ) {
				$totals -= array_pop( $temp_views );
			}
		}

		// Convert temporary array to result object and add totals.
		$result = array();
		foreach ( $temp_views as $key => $value ) {
			$result[ $key ] = array( 'views' => $value );
		}
		$result['totals'] = array( 'views' => $totals );

		// Set percentage values and format numbers.
		foreach ( $result as $key => $value ) {
			// Percentage against all referrer views, even those not included
			// in the dataset due to the $limit argument.
			$result[ $key ]['viewsPercentage'] = $this
				->get_i18n_percentage( absint( $value['views'] ), $this->total_views );

			// Percentage against the current dataset that is limited due to the
			// $limit argument.
			$result[ $key ]['datasetViewsPercentage'] = $this
				->get_i18n_percentage( absint( $value['views'] ), $totals );

			// Format views values.
			$result[ $key ]['views'] = number_format_i18n( $result[ $key ]['views'] );
		}

		return $result;
	}

	/**
	 * Returns the passed number compared to the passed total, in an
	 * internationalized percentage format.
	 *
	 * @since 3.6.0
	 * @since 3.17.0 Moved from the `Referrers_Post_Detail_API_Proxy` class.
	 *
	 * @param int $number The number to be calculated as a percentage.
	 * @param int $total  The total number to compare against.
	 * @return string|false The internationalized percentage or false on error.
	 */
	private function get_i18n_percentage( int $number, int $total ) {
		if ( 0 === $total ) {
			return false;
		}

		return number_format_i18n( $number / $total * 100, 2 );
	}
}
