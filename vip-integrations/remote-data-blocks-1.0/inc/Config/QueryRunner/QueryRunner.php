<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\QueryRunner;

use Exception;
use GuzzleHttp\RequestOptions;
use RemoteDataBlocks\Config\Query\HttpQueryInterface;
use RemoteDataBlocks\Editor\DataBinding\Pagination;
use RemoteDataBlocks\HttpClient\HttpClient;
use RemoteDataBlocks\HttpClient\RdbCacheStrategy;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * QueryRunner class
 *
 * Class that executes queries.
 */
class QueryRunner implements QueryRunnerInterface {
	/**
	 * @var array<string, array|WP_Error>
	 */
	protected static array $in_memory_cache;

	protected HttpClient $http_client;

	/**
	 * @param HttpClient|null $http_client The HTTP client used to make HTTP requests.
	 * @param array|null $in_memory_cache The in-memory cache used to store query results.
	 */
	public function __construct( ?HttpClient $http_client = null, ?array $in_memory_cache = null ) {
		$this->http_client = $http_client ?? HttpClient::instance();
		self::$in_memory_cache = $in_memory_cache ?? self::$in_memory_cache ?? [];
	}

	/**
	 * Get the HTTP request details for the query
	 *
	 * @param array<string, mixed> $input_variables The input variables for the current request.
	 * @return WP_Error|array{
	 *   method: string,
	 *   options: array<string, mixed>,
	 *   origin: string,
	 *   ttl: int|null,
	 *   uri: string,
	 * }
	 */
	protected function get_request_details( HttpQueryInterface $query, array $input_variables ): array|WP_Error {
		$headers = $query->get_request_headers( $input_variables );

		if ( is_wp_error( $headers ) ) {
			return $headers;
		}

		$method = $query->get_request_method();
		$body = $query->get_request_body( $input_variables );
		$endpoint = $query->get_endpoint( $input_variables );
		$cache_ttl = $query->get_cache_ttl( $input_variables );
		$parsed_url = wp_parse_url( $endpoint );

		if ( false === $parsed_url ) {
			return new WP_Error( 'Unable to parse endpoint URL' );
		}

		/**
		 * Filters the allowed URL schemes for this request.
		 *
		 * @param array<string>    $allowed_url_schemes The allowed URL schemes.
		 * @param HttpQueryInterface $query The current query.
		 * @return array<string> The filtered allowed URL schemes.
		 */
		$allowed_url_schemes = apply_filters( 'remote_data_blocks_allowed_url_schemes', [ 'https' ], $query );

		if ( empty( $parsed_url['scheme'] ?? '' ) || ! in_array( $parsed_url['scheme'], $allowed_url_schemes, true ) ) {
			return new WP_Error( 'Invalid endpoint URL scheme' );
		}

		if ( empty( $parsed_url['host'] ?? '' ) ) {
			return new WP_Error( 'Invalid endpoint URL host' );
		}

		$scheme = $parsed_url['scheme'];
		$host = $parsed_url['host'];
		$user = $parsed_url['user'] ?? '';
		$path = $parsed_url['path'] ?? '';

		$query = ! empty( $parsed_url['query'] ?? '' ) ? '?' . $parsed_url['query'] : '';
		$port = ! empty( $parsed_url['port'] ?? '' ) ? ':' . $parsed_url['port'] : '';
		$pass = ! empty( $parsed_url['pass'] ?? '' ) ? ':' . $parsed_url['pass'] : '';
		$pass = ( $user || $pass ) ? $pass . '@' : '';
		$origin = sprintf( '%s://%s%s%s%s', $scheme, $user, $pass, $host, $port );

		$cache_headers = [];
		if ( intval( $cache_ttl ) > 0 ) {
			$cache_headers[ RdbCacheStrategy::CACHE_TTL_REQUEST_HEADER ] = $cache_ttl;
		}
		if ( intval( $cache_ttl ) < 0 ) {
			$cache_headers['Cache-Control'] = 'no-store';
		}

		$request_details = [
			'method' => $method,
			'options' => [
				RequestOptions::HEADERS => array_merge( $headers, $cache_headers ),
				RequestOptions::JSON => $body,
			],
			'origin' => $origin,
			'uri' => sprintf( '%s%s%s', $origin, $path, $query ),
		];

		/**
		 * Filters the request details before the HTTP request is dispatched.
		 *
		 * @param array<string, mixed> $request_details The request details.
		 * @param HttpQueryInterface $query The query being executed.
		 * @param array<string, mixed> $input_variables The input variables for the current request.
		 * @return array<string, array{
		 *   method: string,
		 *   options: array<string, mixed>,
		 *   origin: string,
		 *   uri: string,
		 * }>
		 */
		return apply_filters( 'remote_data_blocks_request_details', $request_details, $query, $input_variables );
	}

	/**
	 * Dispatch the HTTP request and assemble the raw (pre-processed) response data.
	 *
	 * @param array<string, mixed> $request_details The parsed request details for the current request.
	 * @param array<string, mixed> $input_variables The input variables for the current request.
	 * @return array{
	 *   metadata:      array<string, string|int|null>,
	 *   response_data: string|array|object|null|WP_Error,
	 * }
	 */
	protected function get_raw_response_data( array $request_details, array $input_variables ): array|WP_Error {
		try {
			$response = $this->http_client->request( $request_details['method'], $request_details['uri'], $request_details['options'] );
		} catch ( Exception $e ) {
			return new WP_Error( 'remote-data-blocks-unexpected-exception', $e->getMessage() );
		}

		$response_code = $response->getStatusCode();

		if ( $response_code < 200 || $response_code >= 300 ) {
			return new WP_Error( 'remote-data-blocks-bad-status-code', $response->getReasonPhrase() );
		}

		// The body is a stream... if we need to read it in chunks, etc. we can do so here.
		$raw_response_string = $response->getBody()->getContents();

		return [
			'metadata' => [
				'age' => $response->getHeaderLine( RdbCacheStrategy::CACHE_AGE_RESPONSE_HEADER ),
				'status_code' => $response_code,
			],
			'response_data' => $this->deserialize_response( $raw_response_string, $input_variables ),
		];
	}

	/**
	 * Get the response metadata for the query, which are available as targets for
	 * inline bindings.
	 *
	 * @param array $response_metadata The response metadata returned by the query runner.
	 * @param array $query_results     The results of the query.
	 * @return array array<string, array{
	 *   name:  string,
	 *   type:  string,
	 *   value: string|int|null,
	 * }>,
	 */
	protected function get_response_metadata( HttpQueryInterface $query, array $response_metadata, array $query_results ): array {
		$age = intval( $response_metadata['age'] ?? 0 );
		$time = time() - $age;

		$query_response_metadata = [
			'last_updated' => [
				'name' => 'Last updated',
				'type' => 'string',
				'value' => gmdate( 'Y-m-d H:i:s', $time ),
			],
			'total_count' => [
				'name' => 'Total count',
				'type' => 'integer',
				'value' => count( $query_results ),
			],
		];

		/**
		 * Filters the query response metadata, which are available as targets for
		 * inline bindings.
		 *
		 * @param array $query_response_metadata The query response metadata.
		 * @param HttpQueryInterface $query The query context.
		 * @param array $response_metadata The response metadata returned by the query runner.
		 * @param array $query_results The results of the query.
		 * @return array The filtered query response metadata.
		 */
		return apply_filters( 'remote_data_blocks_query_response_metadata', $query_response_metadata, $query, $response_metadata, $query_results );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( HttpQueryInterface $query, array $input_variables ): array|WP_Error {
		$input_schema = $query->get_input_schema();

		// Only include input variables defined by the query's input schema.
		$input_variables = array_intersect_key( $input_variables, $input_schema );

		// Set default input variables.
		foreach ( $input_schema as $key => $schema ) {
			if ( ! array_key_exists( $key, $input_variables ) && isset( $schema['default_value'] ) ) {
				$input_variables[ $key ] = $schema['default_value'];
			}

			// If the input variable is required and not provided, return an error.
			if ( ! array_key_exists( $key, $input_variables ) && isset( $schema['required'] ) && $schema['required'] ) {
				return new WP_Error( 'remote-data-blocks-missing-required-input-variable', sprintf( 'Missing required input variable: %s', $key ) );
			}
		}

		$request_details = $this->get_request_details( $query, $input_variables );

		if ( is_wp_error( $request_details ) ) {
			return $request_details;
		}

		// Try to resolve the request from the in-memory cache using a hash of
		// the query and input. This is not 1:1 with the object caching that is
		// implemented by HttpClient, but it is good enough to de-duplicate
		// requests that occur in the same process.
		//
		// This avoids redundant post-processing (QueryResponseParser) and
		// object cache requests.
		$in_memory_cache_key = sprintf( 'query-runner:%s', md5( wp_json_encode( $request_details ) ) );
		$cached_result = $this->cache_get( $in_memory_cache_key );

		if ( null !== $cached_result ) {
			return $cached_result;
		}

		$raw_response_data = $this->get_raw_response_data( $request_details, $input_variables );

		// Errors are also cached in-memory to prevent repeating failed requests.
		if ( is_wp_error( $raw_response_data ) ) {
			return $this->cache_save( $in_memory_cache_key, $raw_response_data );
		}

		// Preprocess the response data.
		$response_data = $this->preprocess_response( $query, $raw_response_data['response_data'], $input_variables );

		// Determine if the response data is expected to be a collection.
		$output_schema = $query->get_output_schema();
		$is_collection = $output_schema['is_collection'] ?? false;

		// The parser always returns an array, even if it's a single item. This
		// ensures a consistent response shape. The requestor is expected to inspect
		// is_collection and unwrap if necessary.
		$parser = new QueryResponseParser();
		$results = $parser->parse( $response_data, $output_schema );
		$results = $is_collection ? $results : [ $results ];
		$metadata = $this->get_response_metadata( $query, $raw_response_data['metadata'], $results );

		// Pagination schema defines how to extract pagination data from the response.
		$pagination = null;
		$pagination_schema = $query->get_pagination_schema();

		if ( is_array( $pagination_schema ) ) {
			$pagination_data = $parser->parse( $response_data, [ 'type' => $pagination_schema ] )['result'] ?? null;

			if ( is_array( $pagination_data ) ) {
				$pagination = [];
				foreach ( $pagination_data as $key => $value ) {
					$pagination[ $key ] = $value['value'];
				}
			}
		}

		$result = [
			'metadata' => $metadata,
			'pagination' => Pagination::format_pagination_data_for_query_response( $pagination, $input_schema, $input_variables ),
			'results' => $results,
			'query_id' => $query->get_id(),
			'query_inputs' => [ $input_variables ],
		];

		return $this->cache_save( $in_memory_cache_key, $result );
	}

	/**
	 * @inheritDoc
	 */
	public function execute_batch( HttpQueryInterface $query, array $array_of_input_variables ): array|WP_Error {
		// If the query supports a `id:list` input variable and the query inputs
		// consist entirely of variables that match that variable type, we can
		// consolidate the queries into a single request.
		$input_schema = $query->get_input_schema();
		$id_list_input = array_filter( $input_schema, function ( string $slug ) use ( $input_schema ): bool {
			return 'id:list' === $input_schema[ $slug ]['type'];
		}, ARRAY_FILTER_USE_KEY );

		if ( 1 === count( $id_list_input ) ) {
			$id_list_slug = array_key_first( $id_list_input );
			$ids = array_reduce(
				array_column( $array_of_input_variables, $id_list_slug ),
				function ( array $carry, mixed $item ): array {
					if ( is_array( $item ) ) {
						return array_merge( $carry, $item );
					}

					return array_merge( $carry, [ $item ] );
				},
				[]
			);

			return $this->execute( $query, [ $id_list_slug => $ids ] );
		}

		if ( 1 === count( $array_of_input_variables ) ) {
			return $this->execute( $query, $array_of_input_variables[0] );
		}

		$merged_results = [];
		$merged_query_inputs = [];

		foreach ( $array_of_input_variables as $input_variables ) {
			$query_response = $query->execute( $input_variables );

			if ( is_wp_error( $query_response ) ) {
				return $query_response;
			}

			$merged_results = array_merge( $merged_results, $query_response['results'] );
			$merged_query_inputs = array_merge( $merged_query_inputs, $query_response['query_inputs'] );
		}

		return [
			'metadata' => $this->get_response_metadata( $query, [ 'batch' => true ], $merged_results ),
			'pagination' => null, // Pagination is always disabled for batch executions.
			'results' => $merged_results,
			'query_id' => $query->get_id(),
			'query_inputs' => $merged_query_inputs,
		];
	}

	/**
	 * Deserialize the raw response data into an associative array. By default we
	 * assume a JSON string, but this method can be overridden to handle custom
	 * deserialization logic and/or transformation.
	 *
	 * @param string $raw_response_data The raw response data.
	 * @return mixed The deserialized response data.
	 */
	protected function deserialize_response( string $raw_response_data, array $input_variables ): mixed {
		return json_decode( $raw_response_data, true );
	}

	/**
	 * Preprocess the response data before it is passed to the response parser.
	 *
	 * @param array $response_data The raw response data.
	 * @return array Preprocessed response. The deserialized response data or (re-)serialized JSON.
	 */
	protected function preprocess_response( HttpQueryInterface $query, mixed $response_data, array $input_variables ): mixed {
		return $query->preprocess_response( $response_data, $input_variables );
	}

	/**
	 * Cache the response data in memory.
	 *
	 * @param string $cache_key The cache key.
	 * @return array|WP_Error|null The cached data or null if not found.
	 */
	protected function cache_get( string $cache_key ): array|WP_Error|null {
		return self::$in_memory_cache[ $cache_key ] ?? null;
	}

	/**
	 * Cache the response data in memory.
	 *
	 * @param string $cache_key The cache key.
	 * @param array|WP_Error $data The data to cache.
	 * @return array|WP_Error The cached data.
	 */
	protected function cache_save( string $cache_key, array|WP_Error $data ): array|WP_Error {
		self::$in_memory_cache[ $cache_key ] = $data;
		return $data;
	}
}
