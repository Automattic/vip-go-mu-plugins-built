<?php
/**
 * Source Post Type Resolver class
 *
 * @package Safe_Publish
 */

declare(strict_types=1);

namespace Safe_Publish\API;

use Safe_Publish\Utils\Post_Type_Map;
use WP_Error;

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resolves source post type metadata used to fetch and validate source posts.
 *
 * The source's authenticated /catalog/post-types response pairs each eligible
 * slug with its REST base and the raw fields declared by its REST controller.
 * Fresh post data is accepted only when that metadata is current and valid.
 */
final class Source_Post_Type_Resolver {
	/**
	 * Raw post fields Safe Publish imports.
	 */
	private const RAW_FIELDS = array( 'title', 'content', 'excerpt' );

	/**
	 * Catalog fetches attempted per source within one request.
	 *
	 * Stops an unreachable source costing one request per bulk item. Keep
	 * below the threshold HTTP_Client passes to vip_safe_wp_remote_get, which
	 * throttles a host's GETs once that many time out.
	 */
	private const MAX_CATALOG_ATTEMPTS = 2;

	/**
	 * Per-request source metadata or definitive catalog error, keyed by URL.
	 *
	 * @var array<string, array<string, array{
	 *     rest_base: string,
	 *     raw_fields: array<string, bool>|WP_Error
	 * }>|WP_Error>
	 */
	private static array $metadata = array();

	/**
	 * Catalog fetches attempted this request, keyed by source URL.
	 *
	 * @var array<string, int>
	 */
	private static array $attempts = array();

	/**
	 * Resolves a post type slug to the REST base segment for its source.
	 *
	 * Built-ins use their fixed WordPress mapping. Custom types require an
	 * authoritative catalog entry and never fall back to the requested slug.
	 *
	 * @param string   $post_type       Source post type slug or REST endpoint.
	 * @param string   $source_site_url Source site URL.
	 * @param callable $make_request    fn($url, $action, $credentials): array|WP_Error.
	 * @param array    $credentials     Authentication credentials.
	 * @return string|WP_Error REST base segment, or a catalog error.
	 */
	public static function resolve_rest_base(
		string $post_type,
		string $source_site_url,
		callable $make_request,
		array $credentials
	): string|WP_Error {
		if ( Post_Type_Map::is_builtin( $post_type ) ) {
			return Post_Type_Map::to_rest_endpoint( $post_type );
		}

		$metadata = self::get_metadata(
			$source_site_url,
			$make_request,
			$credentials
		);
		if ( is_wp_error( $metadata ) ) {
			return $metadata;
		}

		$entry = self::find_entry( $post_type, $metadata );
		if ( null === $entry ) {
			return self::post_type_unresolved_error();
		}
		if ( is_wp_error( $entry['raw_fields'] ) ) {
			return $entry['raw_fields'];
		}

		return $entry['rest_base'];
	}

	/**
	 * Resolves and validates a source post response's type and raw fields.
	 *
	 * Catalog metadata makes response-type and declared-field checks
	 * authoritative. Missing, invalid, or unavailable metadata fails before any
	 * response values can be accepted.
	 *
	 * @param string   $post_type       Requested source slug or REST base.
	 * @param array    $data            Decoded source post response.
	 * @param string   $source_site_url Source site URL.
	 * @param callable $make_request    fn($url, $action, $credentials): array|WP_Error.
	 * @param array    $credentials     Authentication credentials.
	 * @return array{
	 *     post_type: string,
	 *     raw_values: array{title:string,content:string,excerpt:string}
	 * }|WP_Error Resolved type and raw values, or a validation error.
	 */
	public static function resolve_post_data(
		string $post_type,
		array $data,
		string $source_site_url,
		callable $make_request,
		array $credentials
	): array|WP_Error {
		$metadata = self::get_metadata(
			$source_site_url,
			$make_request,
			$credentials
		);
		if ( is_wp_error( $metadata ) ) {
			return $metadata;
		}

		$entry = self::find_entry( $post_type, $metadata );
		if ( null === $entry ) {
			return self::post_type_unresolved_error();
		}
		if ( is_wp_error( $entry['raw_fields'] ) ) {
			return $entry['raw_fields'];
		}

		$expected_type = $entry['slug'];

		if ( array_key_exists( 'type', $data ) ) {
			$response_type = $data['type'];
			if ( ! is_string( $response_type ) ) {
				return self::invalid_post_type_error();
			}

			$sanitized_type = sanitize_key( $response_type );
			if ( '' === $sanitized_type || $response_type !== $sanitized_type ) {
				return self::invalid_post_type_error();
			}

			if ( $expected_type !== $response_type ) {
				return self::post_type_mismatch_error();
			}

			$source_post_type = $response_type;
		} else {
			$source_post_type = $expected_type;
			$sanitized_type   = sanitize_key( $source_post_type );
			if (
				'' === $sanitized_type
				|| $source_post_type !== $sanitized_type
			) {
				return self::invalid_post_type_error();
			}
		}

		$raw_values = self::extract_raw_values(
			$data,
			$entry['raw_fields']
		);
		if ( is_wp_error( $raw_values ) ) {
			return $raw_values;
		}

		return array(
			'post_type'  => $source_post_type,
			'raw_values' => $raw_values,
		);
	}

	/**
	 * Extracts raw title, content, and excerpt values from a source response.
	 *
	 * @param array               $data       Decoded source response.
	 * @param array<string, bool> $raw_fields Declared raw fields.
	 * @return array{title:string,content:string,excerpt:string}|WP_Error
	 */
	private static function extract_raw_values(
		array $data,
		array $raw_fields
	): array|WP_Error {
		$raw_values     = array(
			'title'   => '',
			'content' => '',
			'excerpt' => '',
		);
		$missing_fields = array();

		foreach ( self::RAW_FIELDS as $field ) {
			$field_value = $data[ $field ] ?? null;
			if (
				is_array( $field_value )
				&& array_key_exists( 'raw', $field_value )
				&& is_string( $field_value['raw'] )
			) {
				$raw_values[ $field ] = $field_value['raw'];
				continue;
			}

			if (
				'title' === $field
				|| array_key_exists( $field, $data )
				|| isset( $raw_fields[ $field ] )
			) {
				$missing_fields[] = $field;
				continue;
			}
		}

		if ( array() !== $missing_fields ) {
			return new WP_Error(
				'fresh_content_raw_fields_missing',
				sprintf(
					/* translators: %s: Comma-separated list of field names. */
					__(
						'The source response is missing required raw values for supported fields: %s.',
						'safe-publish'
					),
					implode( ', ', $missing_fields )
				),
				array( 'status' => 403 )
			);
		}

		return $raw_values;
	}

	/**
	 * Returns source post type metadata or a typed catalog error.
	 *
	 * Definitive metadata errors are memoized. Temporary request failures may be
	 * retried up to MAX_CATALOG_ATTEMPTS, after which the error is memoized so a
	 * bulk run cannot issue one catalog request per item.
	 *
	 * @param string   $source_site_url Source site URL.
	 * @param callable $make_request    fn($url, $action, $credentials): array|WP_Error.
	 * @param array    $credentials     Authentication credentials.
	 * @return array<string, array{
	 *     rest_base: string,
	 *     raw_fields: array<string, bool>|WP_Error
	 * }>|WP_Error Metadata keyed by post type slug, or a catalog error.
	 */
	private static function get_metadata(
		string $source_site_url,
		callable $make_request,
		array $credentials
	): array|WP_Error {
		if ( array_key_exists( $source_site_url, self::$metadata ) ) {
			return self::$metadata[ $source_site_url ];
		}

		$attempts                           = ( self::$attempts[ $source_site_url ] ?? 0 ) + 1;
		self::$attempts[ $source_site_url ] = $attempts;

		$url = trailingslashit( $source_site_url )
			. 'wp-json/safe-publish/v1/catalog/post-types';

		$response = $make_request(
			$url,
			Request_Actions::LIST_ITEMS,
			$credentials
		);
		if ( is_wp_error( $response ) ) {
			$error = self::catalog_unavailable_error();
			if ( self::MAX_CATALOG_ATTEMPTS <= $attempts ) {
				self::$metadata[ $source_site_url ] = $error;
			}
			return $error;
		}

		$response_code = wp_remote_retrieve_response_code( $response );
		if ( 200 > $response_code || 299 < $response_code ) {
			$error = self::catalog_unavailable_error();
			if ( self::MAX_CATALOG_ATTEMPTS <= $attempts ) {
				self::$metadata[ $source_site_url ] = $error;
			}
			return $error;
		}

		$data = json_decode( wp_remote_retrieve_body( $response ), true );
		if ( ! is_array( $data ) || ! array_is_list( $data ) ) {
			$error                              = self::catalog_invalid_error();
			self::$metadata[ $source_site_url ] = $error;
			return $error;
		}

		$metadata = array();
		foreach ( $data as $type ) {
			if ( ! is_array( $type ) ) {
				continue;
			}

			$slug      = $type['slug'] ?? null;
			$rest_base = $type['rest_base'] ?? null;
			if (
				! is_string( $slug )
				|| '' === $slug
				|| sanitize_key( $slug ) !== $slug
				|| ! is_string( $rest_base )
				|| 1 !== preg_match( '/^[A-Za-z0-9_-]+$/D', $rest_base )
			) {
				continue;
			}

			$raw_fields        = self::parse_raw_fields( $type );
			$metadata[ $slug ] = array(
				'rest_base'  => $rest_base,
				'raw_fields' => $raw_fields,
			);
		}

		self::$metadata[ $source_site_url ] = $metadata;

		return $metadata;
	}

	/**
	 * Parses a required catalog raw_fields property.
	 *
	 * @param array $type Catalog post type entry.
	 * @return array<string, bool>|WP_Error Parsed fields, or a metadata error.
	 */
	private static function parse_raw_fields( array $type ): array|WP_Error {
		if ( ! array_key_exists( 'raw_fields', $type ) ) {
			return self::catalog_incompatible_error();
		}

		$fields = $type['raw_fields'];
		if ( ! is_array( $fields ) || ! array_is_list( $fields ) ) {
			return self::catalog_invalid_error();
		}

		$raw_fields = array();
		foreach ( $fields as $field ) {
			if (
				! is_string( $field )
				|| ! in_array(
					$field,
					self::RAW_FIELDS,
					true
				)
			) {
				return self::catalog_invalid_error();
			}
			$raw_fields[ $field ] = true;
		}

		return $raw_fields;
	}

	/**
	 * Finds metadata by either a post type slug or REST base.
	 *
	 * @param string $post_type Source slug or REST base.
	 * @param array  $metadata  Source metadata keyed by slug.
	 * @return array{
	 *     slug: string,
	 *     rest_base: string,
	 *     raw_fields: array<string, bool>|WP_Error
	 * }|null Matching entry, or null.
	 */
	private static function find_entry(
		string $post_type,
		array $metadata
	): ?array {
		$slug = Post_Type_Map::to_wp_slug( $post_type );
		if ( isset( $metadata[ $slug ] ) ) {
			return array(
				'slug'       => $slug,
				'rest_base'  => $metadata[ $slug ]['rest_base'],
				'raw_fields' => $metadata[ $slug ]['raw_fields'],
			);
		}

		foreach ( $metadata as $candidate_slug => $entry ) {
			if ( $post_type === $entry['rest_base'] ) {
				return array(
					'slug'       => $candidate_slug,
					'rest_base'  => $entry['rest_base'],
					'raw_fields' => $entry['raw_fields'],
				);
			}
		}

		return null;
	}

	/**
	 * Returns the invalid source post type error.
	 *
	 * @return WP_Error Invalid-type error.
	 */
	private static function invalid_post_type_error(): WP_Error {
		return new WP_Error(
			'source_post_type_invalid',
			__(
				'The source response did not identify a valid post type.',
				'safe-publish'
			),
			array( 'status' => 502 )
		);
	}

	/**
	 * Returns the source post type mismatch error.
	 *
	 * @return WP_Error Type-mismatch error.
	 */
	private static function post_type_mismatch_error(): WP_Error {
		return new WP_Error(
			'fresh_content_post_type_mismatch',
			__(
				'The source response does not match the requested post type.',
				'safe-publish'
			),
			array( 'status' => 502 )
		);
	}

	/**
	 * Returns the error for a type the source catalog does not list.
	 *
	 * @return WP_Error Unresolved-type error.
	 */
	private static function post_type_unresolved_error(): WP_Error {
		return new WP_Error(
			'fresh_content_post_type_unresolved',
			__(
				'The source site does not list this post type in its catalog. Confirm it is registered on the source with show_in_rest enabled.',
				'safe-publish'
			),
			array( 'status' => 502 )
		);
	}

	/**
	 * Returns the temporary source catalog request error.
	 *
	 * @return WP_Error Retryable catalog error.
	 */
	private static function catalog_unavailable_error(): WP_Error {
		return new WP_Error(
			'fresh_content_catalog_unavailable',
			__(
				'The source post type catalog could not be retrieved. Try again.',
				'safe-publish'
			),
			array(
				'status'    => 503,
				'retryable' => true,
			)
		);
	}

	/**
	 * Returns the incompatible source catalog error.
	 *
	 * @return WP_Error Incompatible-source error.
	 */
	private static function catalog_incompatible_error(): WP_Error {
		return new WP_Error(
			'fresh_content_catalog_incompatible',
			__(
				'The source site is running an incompatible version of Safe Publish. Update it and try again.',
				'safe-publish'
			),
			array( 'status' => 409 )
		);
	}

	/**
	 * Returns the invalid source catalog metadata error.
	 *
	 * @return WP_Error Invalid-metadata error.
	 */
	private static function catalog_invalid_error(): WP_Error {
		return new WP_Error(
			'fresh_content_catalog_invalid',
			__(
				'The source site returned invalid post type field metadata.',
				'safe-publish'
			),
			array( 'status' => 502 )
		);
	}

	/**
	 * Clears the per-request memoized metadata.
	 *
	 * For tests that exercise multiple source responses for the same URL
	 * within a single process.
	 */
	public static function reset_cache(): void {
		self::$metadata = array();
		self::$attempts = array();
	}
}
