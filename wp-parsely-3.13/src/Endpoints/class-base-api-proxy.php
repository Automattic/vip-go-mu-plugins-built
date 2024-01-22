<?php
/**
 * Endpoints: Base API proxy endpoint class for all API proxy endpoints
 *
 * @package Parsely
 * @since   3.4.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints;

use Parsely\Parsely;
use Parsely\RemoteAPI\Remote_API_Interface;
use stdClass;
use WP_Error;
use WP_REST_Request;
use WP_REST_Server;

use function Parsely\Utils\convert_endpoint_to_filter_key;
use function Parsely\Utils\get_date_format;
use function Parsely\Utils\get_formatted_duration;

/**
 * Configures a REST API endpoint for use.
 */
abstract class Base_API_Proxy {
	/**
	 * Parsely object instance.
	 *
	 * @var Parsely
	 */
	protected $parsely;

	/**
	 * Proxy object which does the actual calls to the Parse.ly API.
	 *
	 * @var Remote_API_Interface
	 */
	private $api;

	/**
	 * The itm_source value to be used for some of the returned URLs.
	 *
	 * @var string|null
	 */
	protected $itm_source = null;

	/**
	 * Registers the endpoint's WP REST route.
	 */
	abstract public function run(): void;

	/**
	 * Generates the final data from the passed response.
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	abstract protected function generate_data( $response ): array;

	/**
	 * Cached "proxy" to the Parse.ly API endpoint.
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	abstract public function get_items( WP_REST_Request $request );

	/**
	 * Determines if there are enough permissions to call the endpoint.
	 *
	 * @return bool
	 */
	public function permission_callback(): bool {
		return $this->api->is_user_allowed_to_make_api_call();
	}

	/**
	 * Constructor.
	 *
	 * @param Parsely              $parsely Instance of Parsely class.
	 * @param Remote_API_Interface $api API object which does the actual calls to the Parse.ly API.
	 */
	public function __construct( Parsely $parsely, Remote_API_Interface $api ) {
		$this->parsely = $parsely;
		$this->api     = $api;
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @param string $endpoint The endpoint's route (e.g. /stats/posts).
	 */
	protected function register_endpoint( string $endpoint ): void {
		if ( ! apply_filters( 'wp_parsely_enable_' . convert_endpoint_to_filter_key( $endpoint ) . '_api_proxy', true ) ) {
			return;
		}

		$get_items_args = array(
			'query' => array(
				'default'           => array(),
				'sanitize_callback' => function ( array $query ) {
					$sanitized_query = array();
					foreach ( $query as $key => $value ) {
						$sanitized_query[ sanitize_key( $key ) ] = sanitize_text_field( $value );
					}

					return $sanitized_query;
				},
			),
		);

		$rest_route_args = array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_items' ),
				'permission_callback' => array( $this, 'permission_callback' ),
				'args'                => $get_items_args,
				'show_in_index'       => $this->permission_callback(),
			),
		);

		register_rest_route( 'wp-parsely/v1', $endpoint, $rest_route_args );
	}

	/**
	 * Cached "proxy" to the endpoint.
	 *
	 * @param WP_REST_Request $request            The request object.
	 * @param bool            $require_api_secret Specifies if the API Secret is required.
	 * @param string|null     $param_item         The param element to use to get the items.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	protected function get_data( WP_REST_Request $request, bool $require_api_secret = true, string $param_item = null ) {
		// Validate Site ID and secret.
		$validation = $this->validate_apikey_and_secret( $require_api_secret );
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		if ( null !== $param_item ) {
			$params = $request->get_param( $param_item );
		} else {
			$params = $request->get_params();
		}

		if ( is_array( $params ) && isset( $params['itm_source'] ) ) {
			$this->itm_source = $params['itm_source'];
		}

		// A proxy with caching behavior is used here.
		$response = $this->api->get_items( $params ); // @phpstan-ignore-line.

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return (object) array(
			'data' => $this->generate_data( $response ), // @phpstan-ignore-line.
		);
	}

	/**
	 * Validates that the Site ID and secret are set.
	 * If the API secret is not required, it will not be validated.
	 *
	 * @since 3.13.0
	 *
	 * @param bool $require_api_secret Specifies if the API Secret is required.
	 * @return WP_Error|bool
	 */
	protected function validate_apikey_and_secret( bool $require_api_secret = true ) {
		if ( false === $this->parsely->site_id_is_set() ) {
			return new WP_Error(
				'parsely_site_id_not_set',
				__( 'A Parse.ly Site ID must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( $require_api_secret && false === $this->parsely->api_secret_is_set() ) {
			return new WP_Error(
				'parsely_api_secret_not_set',
				__( 'A Parse.ly API Secret must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		return true;
	}

	/**
	 * Extracts the post data from the passed object.
	 *
	 * Should only be used with endpoints that return post data.
	 *
	 * @since 3.10.0
	 *
	 * @param stdClass $item The object to extract the data from.
	 * @return array<string, mixed> The extracted data.
	 */
	protected function extract_post_data( stdClass $item ): array {
		$data = array();

		if ( isset( $item->author ) ) {
			$data['author'] = $item->author;
		}

		if ( isset( $item->metrics->views ) ) {
			$data['views'] = number_format_i18n( $item->metrics->views );
		}

		if ( isset( $item->metrics->visitors ) ) {
			$data['visitors'] = number_format_i18n( $item->metrics->visitors );
		}

		// The avg_engaged metric can be in different locations depending on the
		// endpoint and passed sort/url parameters.
		$avg_engaged = $item->metrics->avg_engaged ?? $item->avg_engaged ?? null;
		if ( null !== $avg_engaged ) {
			$data['avgEngaged'] = get_formatted_duration( (float) $avg_engaged );
		}

		if ( isset( $item->pub_date ) ) {
			$data['date'] = wp_date( get_date_format(), strtotime( $item->pub_date ) );
		}

		if ( isset( $item->title ) ) {
			$data['title'] = $item->title;
		}

		if ( isset( $item->url ) ) {
			$site_id = $this->parsely->get_site_id();
			// phpcs:ignore WordPressVIPMinimum.Functions.RestrictedFunctions.url_to_postid_url_to_postid
			$post_id = url_to_postid( $item->url ); // 0 if the post cannot be found.

			$data['dashUrl'] = Parsely::get_dash_url( $site_id, $item->url );
			$data['id']      = Parsely::get_url_with_itm_source( $item->url, null ); // Unique.
			$data['postId']  = $post_id; // Might not be unique.
			$data['url']     = Parsely::get_url_with_itm_source( $item->url, $this->itm_source );

			// Set thumbnail URL, falling back to the Parse.ly thumbnail if needed.
			$thumbnail_url = get_the_post_thumbnail_url( $post_id, 'thumbnail' );
			if ( false !== $thumbnail_url ) {
				$data['thumbnailUrl'] = $thumbnail_url;
			} elseif ( isset( $item->thumb_url_medium ) ) {
				$data['thumbnailUrl'] = $item->thumb_url_medium;
			}
		}

		return $data;
	}

	/**
	 * Generates the post data from the passed response.
	 *
	 * Should only be used with endpoints that return post data.
	 *
	 * @since 3.10.0
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_post_data( array $response ): array {
		$data = array();

		foreach ( $response as $item ) {
			$data [] = (object) $this->extract_post_data( $item );
		}

		return $data;
	}
}
