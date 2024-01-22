<?php
/**
 * Endpoints: Parse.ly Content Suggestion `/write-title` API proxy endpoint
 * class
 *
 * @package Parsely
 * @since   3.12.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\ContentSuggestions;

use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Parsely;
use Parsely\RemoteAPI\ContentSuggestions\Write_Title_API;
use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/content-suggestions/write-title` REST API endpoint.
 *
 * @since 3.12.0
 */
final class Write_Title_API_Proxy extends Base_API_Proxy {

	/**
	 * The Write Title API instance.
	 *
	 * @var Write_Title_API $write_title_api
	 */
	private $write_title_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.12.0
	 *
	 * @param Parsely $parsely The Parsely plugin instance.
	 */
	public function __construct( Parsely $parsely ) {
		$this->write_title_api = new Write_Title_API( $parsely );
		parent::__construct( $parsely, $this->write_title_api );
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.12.0
	 */
	public function run(): void {
		$this->register_endpoint( '/content-suggestions/write-title' );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.12.0
	 *
	 * @param array<stdClass> $response The response received by the proxy.
	 * @return array<stdClass> The generated data.
	 */
	protected function generate_data( $response ): array {
		// Unused function.
		return $response;
	}

	/**
	 * Cached "proxy" to the Parse.ly API endpoint.
	 *
	 * @since 3.12.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		if ( false === $this->parsely->site_id_is_set() ) {
			return new WP_Error(
				'parsely_site_id_not_set',
				__( 'A Parse.ly Site ID must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( false === $this->parsely->api_secret_is_set() ) {
			return new WP_Error(
				'parsely_api_secret_not_set',
				__( 'A Parse.ly API Secret must be set in site options to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		/**
		 * The post content to be sent to the API.
		 *
		 * @var string|null $post_content
		 */
		$post_content = $request->get_param( 'content' );

		if ( null === $post_content ) {
			return new WP_Error(
				'parsely_content_not_set',
				__( 'A post content must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		$limit   = is_numeric( $request->get_param( 'limit' ) ) ? intval( $request->get_param( 'limit' ) ) : 3;
		$tone    = is_string( $request->get_param( 'tone' ) ) ? $request->get_param( 'tone' ) : 'neutral';
		$persona = is_string( $request->get_param( 'persona' ) ) ? $request->get_param( 'persona' ) : 'journalist';

		if ( 0 === $limit ) {
			$limit = 3;
		}

		$response = $this->write_title_api->get_titles( $post_content, $limit, $persona, $tone );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return (object) array(
			'data' => $response,
		);
	}
}
