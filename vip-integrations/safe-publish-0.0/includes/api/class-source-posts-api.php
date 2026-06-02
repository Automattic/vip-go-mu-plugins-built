<?php
/**
 * Source Posts API class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Admin\Content_Logger;
use Safe_Publish\Auth\VIP_Safe_Auth;
use Safe_Publish\Utils\Auth_Credential_Provider;
use Safe_Publish\Utils\Options;
use Safe_Publish\Utils\Post_Type_Map;
use Safe_Publish\Validators\URL_Validator;
use WP_Error;
use WP_Post;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Source Posts API Class.
 */
class Source_Posts_API {

	/**
	 * HTTP Client instance.
	 *
	 * @var HTTP_Client
	 */
	private HTTP_Client $http_client;

	/**
	 * Logger instance.
	 *
	 * @var Content_Logger
	 */
	private Content_Logger $logger;

	/**
	 * Constructs the Source_Posts_API instance.
	 *
	 * @param HTTP_Client|null $http_client Optional. HTTP client for making requests.
	 */
	public function __construct( ?HTTP_Client $http_client = null ) {
		$this->http_client = $http_client ?? new HTTP_Client();
		$this->logger      = new Content_Logger();
	}

	/**
	 * Extracts taxonomy terms from an embedded REST API response.
	 *
	 * Parses the `wp:term` embedded data and groups term names by taxonomy.
	 * Terms with empty names are skipped.
	 *
	 * @param array $response_data Decoded REST API response for a single post.
	 * @return array<string, list<string>> Term names grouped by taxonomy slug.
	 */
	public static function extract_embedded_terms( array $response_data ): array {
		$terms = array();

		if (
			! isset( $response_data['_embedded']['wp:term'] ) ||
			! is_array( $response_data['_embedded']['wp:term'] ) ||
			count( $response_data['_embedded']['wp:term'] ) === 0
		) {
			return $terms;
		}

		foreach ( $response_data['_embedded']['wp:term'] as $term_group ) {
			foreach ( $term_group as $term ) {
				$tax = isset( $term['taxonomy'] ) ? $term['taxonomy'] : 'term';
				if ( ! isset( $terms[ $tax ] ) ) {
					$terms[ $tax ] = array();
				}
				if ( isset( $term['name'] ) && '' !== $term['name'] ) {
					$terms[ $tax ][] = $term['name'];
				}
			}
		}

		return $terms;
	}

	/**
	 * Fetches a page of posts from the source site's catalog endpoint.
	 *
	 * Returns the source's `{ items, has_more }` envelope after each item
	 * is shape-validated (see normalize_listing_item). HMAC vouches for
	 * the source's identity, not the content's honesty.
	 *
	 * @param string $source_site_url  Source site URL.
	 * @param array  $auth_credentials Optional. Authentication credentials. Default empty array.
	 * @param array  $args             Optional. Catalog query args (post_type, page, per_page,
	 *                                 search, name, status[], published_after, published_before,
	 *                                 orderby, order, include). `include` (int[]) short-circuits
	 *                                 the source-side query to a `post__in` lookup, skipping the
	 *                                 search/date/order/pagination args. Default empty.
	 * @return array|WP_Error Envelope { items, has_more } or WP_Error on failure.
	 */
	public function fetch_posts(
		string $source_site_url,
		array $auth_credentials = array(),
		array $args = array()
	): array|WP_Error {
		if ( ! URL_Validator::is_valid_external_url( $source_site_url ) ) {
			return new WP_Error(
				'invalid_url',
				__( 'Invalid URL provided.', 'safe-publish' )
			);
		}

		$api_url = $this->build_catalog_url( $source_site_url, $args );

		$response = $this->make_request(
			$api_url,
			Request_Actions::LIST_ITEMS,
			$auth_credentials
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return $this->process_catalog_response( $response );
	}

	/**
	 * Builds the source catalog endpoint URL with query arguments.
	 *
	 * @param string $source_site_url Source site URL.
	 * @param array  $args            Catalog query args.
	 * @return string Final URL.
	 */
	private function build_catalog_url(
		string $source_site_url,
		array $args
	): string {
		$api_endpoint = trailingslashit( $source_site_url )
			. 'wp-json/safe-publish/v1/catalog/posts';

		$post_type = (string) ( $args['post_type'] ?? 'post' );

		$query_args = array_filter(
			array(
				'post_type'        => Post_Type_Map::to_wp_slug( $post_type ),
				'page'             => $args['page'] ?? null,
				'per_page'         => $args['per_page'] ?? null,
				'search'           => $args['search'] ?? null,
				'name'             => $args['name'] ?? null,
				'published_after'  => $args['published_after'] ?? null,
				'published_before' => $args['published_before'] ?? null,
				'orderby'          => $args['orderby'] ?? null,
				'order'            => $args['order'] ?? null,
			),
			static fn( $v ): bool => null !== $v && '' !== $v
		);

		if (
			isset( $args['status'] )
			&& is_array( $args['status'] )
			&& array() !== $args['status']
		) {
			$query_args['status'] = array_values(
				array_map( 'strval', $args['status'] )
			);
		}

		if (
			isset( $args['include'] )
			&& is_array( $args['include'] )
			&& array() !== $args['include']
		) {
			$query_args['include'] = array_values(
				array_map( 'intval', $args['include'] )
			);
		}

		return add_query_arg( $query_args, $api_endpoint );
	}

	/**
	 * Makes HTTP request using shared HTTP client.
	 *
	 * @param string $url              Request URL.
	 * @param string $action           Declared request action (see Request_Actions).
	 * @param array  $auth_credentials Optional. Authentication credentials. Default empty array.
	 * @return array|WP_Error Response or error.
	 */
	private function make_request(
		string $url,
		string $action,
		array $auth_credentials = array()
	): array|WP_Error {
		return $this->http_client->make_request( $url, $action, $auth_credentials );
	}

	/**
	 * Decodes and validates the source catalog envelope.
	 *
	 * @param array $response HTTP response from wp_remote_request.
	 * @return array|WP_Error { items, has_more } or WP_Error on malformed body.
	 */
	private function process_catalog_response( array $response ): array|WP_Error {
		$body    = wp_remote_retrieve_body( $response );
		$decoded = json_decode( $body, true );

		if (
			! is_array( $decoded )
			|| ! isset( $decoded['items'] )
			|| ! is_array( $decoded['items'] )
		) {
			return new WP_Error(
				'safe_publish_catalog_invalid_response',
				__( 'Invalid response from source API.', 'safe-publish' ),
				array( 'response_body' => $body )
			);
		}

		$items = array();
		foreach ( $decoded['items'] as $item ) {
			$normalized = self::normalize_listing_item( $item );
			if ( null !== $normalized ) {
				$items[] = $normalized;
			}
		}

		return array(
			'items'    => $items,
			'has_more' => isset( $decoded['has_more'] ) && true === (bool) $decoded['has_more'],
		);
	}

	/**
	 * Shape-validates a single listing item received from the source.
	 *
	 * HMAC authenticates the source's identity, not its honesty: a
	 * compromised source could return malicious fields the destination
	 * renders. We type-coerce here, and additionally lock down two fields
	 * the destination interpolates into HTML attributes/CSS class names:
	 *
	 * - `link` is forced through esc_url_raw with an http/https-only
	 *   protocol allowlist so a hostile `javascript:` URL can't become an
	 *   active anchor href.
	 * - `status` is clamped to the catalog's status allowlist so a hostile
	 *   value can't escape the `safe-publish-status-badge--<status>` class
	 *   template (React doesn't escape className contents).
	 *
	 * Items without an id or title are dropped so the destination's listing
	 * UI has stable shape guarantees regardless of source plugin version.
	 *
	 * @param mixed $item Raw item from the catalog response.
	 * @return array|null Shape-valid item or null when required fields are missing.
	 */
	private static function normalize_listing_item( mixed $item ): ?array {
		if ( ! is_array( $item ) ) {
			return null;
		}

		$id = isset( $item['id'] ) ? absint( $item['id'] ) : 0;
		if ( 0 === $id ) {
			return null;
		}

		$title = isset( $item['title'] ) ? (string) $item['title'] : '';
		if ( '' === $title ) {
			return null;
		}

		$raw_link  = (string) ( $item['link'] ?? '' );
		$safe_link = '' === $raw_link
			? ''
			: esc_url_raw( $raw_link, array( 'http', 'https' ) );

		$raw_status  = (string) ( $item['status'] ?? '' );
		$safe_status = in_array( $raw_status, self::CATALOG_STATUS_ALLOWLIST, true )
			? $raw_status
			: '';

		return array(
			'id'           => $id,
			'link'         => $safe_link,
			'title'        => $title,
			'post_type'    => (string) ( $item['post_type'] ?? 'post' ),
			'date_gmt'     => (string) ( $item['date_gmt'] ?? '' ),
			'modified_gmt' => (string) ( $item['modified_gmt'] ?? '' ),
			'status'       => $safe_status,
		);
	}

	/**
	 * Post statuses the catalog endpoint may return. Mirrors
	 * Catalog_REST_Controller::ALLOWED_STATUSES — duplicated here to keep
	 * the destination from depending on the source-only controller class.
	 *
	 * @var string[]
	 */
	private const CATALOG_STATUS_ALLOWLIST = array(
		'publish',
		'draft',
		'pending',
		'private',
		'future',
	);

	/**
	 * Prepares a single WP_Post for the catalog listing payload.
	 *
	 * The shape mirrors what the destination's listing UI expects.
	 *
	 * @param WP_Post $post Source post.
	 * @return array Listing payload.
	 */
	public static function prepare_listing_payload_from_post( WP_Post $post ): array {
		$permalink = get_permalink( $post );

		return array(
			'id'           => $post->ID,
			'link'         => is_string( $permalink ) ? esc_url_raw( $permalink ) : '',
			'title'        => sanitize_text_field(
				wp_strip_all_tags(
					html_entity_decode(
						$post->post_title,
						ENT_QUOTES | ENT_HTML5,
						'UTF-8'
					)
				)
			),
			'post_type'    => $post->post_type,
			'date_gmt'     => self::format_gmt_iso( $post->post_date_gmt ),
			'modified_gmt' => self::format_gmt_iso( $post->post_modified_gmt ),
			'status'       => $post->post_status,
		);
	}

	/**
	 * Converts a MySQL GMT datetime ("Y-m-d H:i:s") to ISO 8601 with a Z
	 * marker. Empty/zero values yield an empty string.
	 *
	 * @param string $mysql_gmt MySQL GMT datetime.
	 * @return string ISO 8601 GMT string or empty when input is unset.
	 */
	private static function format_gmt_iso( string $mysql_gmt ): string {
		if ( '' === $mysql_gmt || str_starts_with( $mysql_gmt, '0000' ) ) {
			return '';
		}

		return str_replace( ' ', 'T', $mysql_gmt ) . 'Z';
	}

	/**
	 * Tests API connection.
	 *
	 * Delegates to the shared-secret probe so the result reflects whether the
	 * connected site actually grants edit context, not just whether a public
	 * endpoint responds.
	 *
	 * @param string $connected_site_url Connected site URL to test.
	 * @param array  $auth_credentials   Authentication credentials.
	 * @return array Test results: success, status, response_time, message.
	 */
	public function test_connection(
		string $connected_site_url,
		array $auth_credentials
	): array {
		$start_time = microtime( true );
		$probe      = VIP_Safe_Auth::test_authorization(
			$connected_site_url,
			$auth_credentials
		);
		$end_time   = microtime( true );

		$status = $probe['status'] ?? VIP_Safe_Auth::STATUS_UNREACHABLE;

		return array(
			'success'       => VIP_Safe_Auth::STATUS_AUTHORIZED === $status,
			'status'        => $status,
			'response_time' => round( ( $end_time - $start_time ) * 1000, 2 ),
			'message'       => self::describe_auth_status( $status ),
		);
	}

	/**
	 * Returns a human-readable message for an auth probe status.
	 *
	 * @param string $status Status from VIP_Safe_Auth::test_authorization().
	 * @return string Translated description for display.
	 */
	public static function describe_auth_status( string $status ): string {
		switch ( $status ) {
			case VIP_Safe_Auth::STATUS_AUTHORIZED:
				return __(
					'Connected site accepts the shared secret and grants edit context.',
					'safe-publish'
				);
			case VIP_Safe_Auth::STATUS_UNAUTHORIZED:
				return __(
					'Connected site rejected the shared secret. Verify SAFE_PUBLISH_SHARED_SECRET matches on both sites in wp-config.php.',
					'safe-publish'
				);
			case VIP_Safe_Auth::STATUS_UNREACHABLE:
				return __(
					'Connected site could not be reached. Verify the URL and that the site is online.',
					'safe-publish'
				);
			case VIP_Safe_Auth::STATUS_URL_UNSET:
				return __(
					'Connected site URL is not configured.',
					'safe-publish'
				);
			default:
				return __( 'Unknown authentication status.', 'safe-publish' );
		}
	}

	/**
	 * Fetches fresh post content from source site.
	 *
	 * `content`, `meta`, and `terms` are returned unsanitized. `content` must
	 * pass through the block processor first, and `meta`/`terms` require
	 * type-aware sanitization in Meta_Terms_Manager.
	 *
	 * @param int    $source_post_id    Source post ID.
	 * @param string $source_site_url   Source site URL.
	 * @param array  $auth_credentials  Optional. Authentication credentials. Default empty array.
	 * @param string $post_type         Optional. Post type slug or REST endpoint. Default 'post'.
	 * @return array|false Post data array on success, false on failure.
	 */
	public function fetch_fresh_post_content(
		int $source_post_id,
		string $source_site_url,
		array $auth_credentials = array(),
		string $post_type = 'post'
	): array|false {
		// Validate URL first.
		if ( ! URL_Validator::is_valid_external_url( $source_site_url ) ) {
			return false;
		}

		// Build API URL for single post.
		$endpoint     = Source_Post_Type_Resolver::resolve_rest_base(
			$post_type,
			$source_site_url,
			array( $this->http_client, 'make_request' ),
			$auth_credentials
		);
		$api_endpoint = trailingslashit( $source_site_url ) . 'wp-json/wp/v2/' . $endpoint . '/' . $source_post_id;

		$query_args = array(
			'_embed' => '1',
		);

		// Edit context provides raw field values (title, content, excerpt)
		// needed to preserve data parity during import.
		if ( VIP_Safe_Auth::has_valid_credential_format( $auth_credentials ) ) {
			$query_args['context'] = 'edit';
		}

		$api_url = add_query_arg( $query_args, $api_endpoint );

		// Make request.
		$response = $this->make_request(
			$api_url,
			Request_Actions::IMPORT,
			$auth_credentials
		);

		if ( is_wp_error( $response ) ) {
			$this->logger->content_fetch_failed(
				$source_post_id,
				$source_site_url,
				$response->get_error_message()
			);

			return false;
		}

		$body = wp_remote_retrieve_body( $response );
		$data = json_decode( $body, true );

		if ( ! is_array( $data ) || array() === $data ) {
			$this->logger->content_fetch_invalid_response(
				$source_post_id,
				$source_site_url
			);

			return false;
		}

		// Require raw field values (edit context) to preserve data parity.
		if (
			! isset( $data['title']['raw'] ) ||
			! isset( $data['content']['raw'] ) ||
			! isset( $data['excerpt']['raw'] )
		) {
			$this->logger->content_fetch_raw_fields_missing(
				$source_post_id,
				$source_site_url
			);

			return false;
		}

		// Extract post data.
		$post_data = array();

		$post_data['title']          = sanitize_text_field( $data['title']['raw'] );
		$post_data['featured_media'] = absint( $data['featured_media'] ?? 0 );
		$post_data['slug']           = sanitize_text_field( $data['slug'] ?? '' );
		$post_data['comment_status'] = sanitize_text_field( $data['comment_status'] ?? '' );
		$post_data['ping_status']    = sanitize_text_field( $data['ping_status'] ?? '' );
		$post_data['menu_order']     = absint( $data['menu_order'] ?? 0 );
		$post_data['password']       = sanitize_text_field( $data['password'] ?? '' );
		$post_data['parent']         = absint( $data['parent'] ?? 0 );

		if ( isset( $data['link'] ) ) {
			$post_data['link'] = esc_url_raw( $data['link'] );
		}

		// HTML fields: sanitized at the import point with modification
		// detection to prevent silent data loss during migration.
		$post_data['content'] = $data['content']['raw'];
		$post_data['excerpt'] = $data['excerpt']['raw'];

		$post_data['meta'] = isset( $data['meta'] ) && is_array( $data['meta'] ) ? $data['meta'] : array();

		$post_data['terms'] = self::extract_embedded_terms( $data );

		// `null` distinguishes "source did not provide the field" (older plugin
		// version on the source) from "field present but author cannot be
		// resolved on the source" (empty strings).
		$post_data['source_author'] = self::extract_source_author( $data );

		return $post_data;
	}

	/**
	 * Extracts the safe_publish_author payload from a REST response.
	 *
	 * @param array $data Decoded REST response for a single post.
	 * @return array{email: string, login: string, display_name: string}|null
	 *         Sanitized author payload, or null when the source did not
	 *         include the field.
	 */
	private static function extract_source_author( array $data ): ?array {
		if ( ! array_key_exists( 'safe_publish_author', $data ) ) {
			return null;
		}

		$author = $data['safe_publish_author'];

		if ( ! is_array( $author ) ) {
			return null;
		}

		return array(
			'email'        => isset( $author['email'] )
				? sanitize_email( (string) $author['email'] )
				: '',
			'login'        => isset( $author['login'] )
				? sanitize_user( (string) $author['login'], true )
				: '',
			'display_name' => isset( $author['display_name'] )
				? sanitize_text_field( (string) $author['display_name'] )
				: '',
		);
	}

	/**
	 * Fetches fresh post content using the configured connected site URL.
	 *
	 * Convenience wrapper around fetch_fresh_post_content() that reads the
	 * connected site URL from options, obtains credentials, and converts
	 * the underlying false return into a WP_Error so callers can abort
	 * the import on a uniform error type.
	 *
	 * @param int    $source_post_id Source post ID to fetch.
	 * @param string $post_type      Post type slug or REST endpoint.
	 * @return array|WP_Error Fresh post data, or an error on failure.
	 */
	public function fetch_fresh_post(
		int $source_post_id,
		string $post_type
	): array|WP_Error {
		$source_site_url = get_option( Options::OPTION_CONNECTED_SITE_URL, '' );

		if ( '' === $source_site_url ) {
			return new WP_Error(
				'fresh_content_fetch_no_connected_site_url',
				__( 'No connected site URL is configured.', 'safe-publish' )
			);
		}

		$auth_credentials = Auth_Credential_Provider::get_credentials();

		$fresh_data = $this->fetch_fresh_post_content(
			$source_post_id,
			$source_site_url,
			$auth_credentials,
			$post_type
		);

		if ( false === $fresh_data ) {
			return new WP_Error(
				'fresh_content_fetch_failed',
				__( 'Could not fetch fresh content from the source site. The post was not imported.', 'safe-publish' )
			);
		}

		return $fresh_data;
	}
}
