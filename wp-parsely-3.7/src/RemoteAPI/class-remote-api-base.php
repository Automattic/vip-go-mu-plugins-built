<?php
/**
 * Remote API: Base class for all Parse.ly API endpoints
 *
 * @package Parsely
 * @since   3.2.0
 */

declare(strict_types=1);

namespace Parsely\RemoteAPI;

use Parsely\Parsely;
use UnexpectedValueException;
use WP_Error;

use function Parsely\Utils\convert_endpoint_to_filter_key;
use function Parsely\Utils\convert_to_associative_array;

/**
 * Base API for all Parse.ly API endpoints.
 *
 * Child classes must add a protected `ENDPOINT` constant, and a protected
 * QUERY_FILTER constant.
 *
 * @since 3.2.0
 *
 * @phpstan-type Remote_API_Error array{
 *   code: int,
 *   message: string,
 *   htmlMessage: string,
 * }
 */
abstract class Remote_API_Base implements Remote_API_Interface {
	protected const ENDPOINT     = '';
	protected const QUERY_FILTER = '';

	/**
	 * Indicates whether the endpoint is public or protected behind permissions.
	 *
	 * @since 3.7.0
	 *
	 * @var bool
	 */
	protected $is_public_endpoint = false;

	/**
	 * Parsely Instance.
	 *
	 * @var Parsely
	 */
	private $parsely;

	/**
	 * User capability based on which we should allow access to the endpoint.
	 *
	 * `null` should be used for all public endpoints.
	 *
	 * @since 3.7.0
	 *
	 * @var string|null
	 */
	private $user_capability;

	/**
	 * Constructor.
	 *
	 * @param Parsely $parsely Parsely instance.
	 *
	 * @since 3.2.0
	 * @since 3.7.0 Added user capability checks based on `is_public_endpoint` attribute.
	 */
	public function __construct( Parsely $parsely ) {
		$this->parsely = $parsely;

		if ( $this->is_public_endpoint ) {
			$this->user_capability = null;
		} else {
			/**
			 * Filter to change the default user capability for all private remote apis.
			 *
			 * @var string
			 */
			$default_user_capability = apply_filters( 'wp_parsely_user_capability_for_all_private_apis', 'publish_posts' );

			/**
			 * Filter to change the user capability for specific remote api.
			 *
			 * @var string
			 */
			$endpoint_specific_user_capability = apply_filters( 'wp_parsely_user_capability_for_' . convert_endpoint_to_filter_key( static::ENDPOINT ) . '_api', $default_user_capability );

			$this->user_capability = $endpoint_specific_user_capability;
		}
	}

	/**
	 * Gets Parse.ly API endpoint.
	 *
	 * @since 3.6.2
	 *
	 * @return string
	 */
	public function get_endpoint(): string {
		return static::ENDPOINT;
	}

	/**
	 * Gets the URL for a particular Parse.ly API endpoint.
	 *
	 * @since 3.2.0
	 *
	 * @throws UnexpectedValueException If the endpoint constant is not defined.
	 * @throws UnexpectedValueException If the query filter constant is not defined.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @return string
	 */
	public function get_api_url( array $query ): string {
		if ( static::ENDPOINT === '' ) {
			throw new UnexpectedValueException( 'ENDPOINT constant must be defined in child class.' );
		}
		if ( static::QUERY_FILTER === '' ) {
			throw new UnexpectedValueException( 'QUERY_FILTER constant must be defined in child class.' );
		}

		$query['apikey'] = $this->parsely->get_site_id();
		if ( $this->parsely->api_secret_is_set() ) {
			$query['secret'] = $this->parsely->get_api_secret();
		}
		$query = array_filter( $query );

		// Sort by key so the query args are in alphabetical order.
		ksort( $query );

		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.DynamicHooknameFound -- Hook names are defined in child classes.
		$query = apply_filters( static::QUERY_FILTER, $query );
		return add_query_arg( $query, Parsely::PUBLIC_API_BASE_URL . static::ENDPOINT );
	}

	/**
	 * Gets items from the specified endpoint.
	 *
	 * @since 3.2.0
	 * @since 3.7.0 Added $associative param.
	 *
	 * @param array<string, mixed> $query The query arguments to send to the remote API.
	 * @param bool                 $associative When TRUE, returned objects will be converted into associative arrays.
	 *
	 * @return WP_Error|array<string, mixed>
	 */
	public function get_items( $query, $associative = false ) {
		$full_api_url = $this->get_api_url( $query );

		$result = wp_safe_remote_get( $full_api_url, array() );

		if ( is_wp_error( $result ) ) {
			return $result;
		}

		$body    = wp_remote_retrieve_body( $result );
		$decoded = json_decode( $body );

		if ( ! is_object( $decoded ) ) {
			return new WP_Error( 400, __( 'Unable to decode upstream API response', 'wp-parsely' ) );
		}

		if ( ! property_exists( $decoded, 'data' ) ) {
			return new WP_Error( $decoded->code ?? 400, $decoded->message ?? __( 'Unable to read data from upstream API', 'wp-parsely' ) );
		}

		if ( ! is_array( $decoded->data ) ) {
			return new WP_Error( 400, __( 'Unable to parse data from upstream API', 'wp-parsely' ) );
		}

		$response = $decoded->data;

		return $associative ? convert_to_associative_array( $response ) : $response;
	}

	/**
	 * Checks if the current user is allowed to make the API call.
	 *
	 * @since 3.7.0
	 *
	 * @return bool
	 */
	public function is_user_allowed_to_make_api_call(): bool {
		// This endpoint does not require any capability checks.
		if ( is_null( $this->user_capability ) ) {
			return true;
		}

		// The user has the required capability to access this endpoint.
		if ( current_user_can( $this->user_capability ) ) {
			return true;
		}

		return false;
	}
}
