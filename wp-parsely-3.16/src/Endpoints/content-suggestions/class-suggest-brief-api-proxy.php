<?php
/**
 * Endpoints: Parse.ly Content Suggestion `/suggest-brief` API proxy endpoint
 * class
 *
 * @package Parsely
 * @since   3.13.0
 */

declare(strict_types=1);

namespace Parsely\Endpoints\ContentSuggestions;

use Parsely\Endpoints\Base_API_Proxy;
use Parsely\Parsely;
use Parsely\Permissions;
use Parsely\RemoteAPI\ContentSuggestions\Suggest_Brief_API;
use stdClass;
use WP_REST_Request;
use WP_Error;

/**
 * Configures the `/content-suggestions/suggest-brief` REST API endpoint.
 *
 * @since 3.13.0
 * @since 3.14.0 Renamed from Suggest_Meta_Description_API_Proxy to Suggest_Brief_API_Proxy.
 */
final class Suggest_Brief_API_Proxy extends Base_API_Proxy {

	/**
	 * The Suggest Brief API instance.
	 *
	 * @var Suggest_Brief_API $suggest_brief_api
	 */
	private $suggest_brief_api;

	/**
	 * Initializes the class.
	 *
	 * @since 3.13.0
	 *
	 * @param Parsely $parsely The Parsely plugin instance.
	 */
	public function __construct( Parsely $parsely ) {
		$this->suggest_brief_api = new Suggest_Brief_API( $parsely );
		parent::__construct( $parsely, $this->suggest_brief_api );
	}

	/**
	 * Registers the endpoint's WP REST route.
	 *
	 * @since 3.13.0
	 */
	public function run(): void {
		$this->register_endpoint( '/content-suggestions/suggest-brief', array( 'POST' ) );
	}

	/**
	 * Generates the final data from the passed response.
	 *
	 * @since 3.13.0
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
	 * @since 3.13.0
	 *
	 * @param WP_REST_Request $request The request object.
	 * @return stdClass|WP_Error stdClass containing the data or a WP_Error object on failure.
	 */
	public function get_items( WP_REST_Request $request ) {
		$validation = $this->validate_apikey_and_secret();
		if ( is_wp_error( $validation ) ) {
			return $validation;
		}

		$pch_options = $this->parsely->get_options()['content_helper'];
		if ( ! Permissions::current_user_can_use_pch_feature( 'excerpt_suggestions', $pch_options ) ) {
			return new WP_Error( 'ch_access_to_feature_disabled', '', array( 'status' => 403 ) );
		}

		/**
		 * The post content to be sent to the API.
		 *
		 * @var string|null $post_content
		 */
		$post_content = $request->get_param( 'content' );

		/**
		 * The post title to be sent to the API.
		 *
		 * @var string|null $post_title
		 */
		$post_title = $request->get_param( 'title' );

		/**
		 * The persona to be sent to the API.
		 *
		 * @var string|null $persona
		 */
		$persona = $request->get_param( 'persona' );

		/**
		 * The style to be sent to the API.
		 *
		 * @var string|null $style
		 */
		$style = $request->get_param( 'style' );

		if ( null === $post_content ) {
			return new WP_Error(
				'parsely_content_not_set',
				__( 'A post content must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( null === $post_title ) {
			return new WP_Error(
				'parsely_title_not_set',
				__( 'A post title must be set to use this endpoint', 'wp-parsely' ),
				array( 'status' => 403 )
			);
		}

		if ( null === $persona ) {
			$persona = 'journalist';
		}

		if ( null === $style ) {
			$style = 'neutral';
		}

		$response = $this->suggest_brief_api->get_suggestion( $post_title, $post_content, $persona, $style );

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return (object) array(
			'data' => $response,
		);
	}
}
