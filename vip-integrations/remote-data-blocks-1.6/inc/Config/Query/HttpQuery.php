<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Config\Query;

use RemoteDataBlocks\Config\ArraySerializable;
use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Config\DataSource\HttpDataSourceInterface;
use RemoteDataBlocks\Config\QueryRunner\QueryRunner;
use RemoteDataBlocks\Validation\ConfigSchemas;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * HttpQuery class
 *
 * This class can be used to implement most HTTP queries.
 */
class HttpQuery extends ArraySerializable implements HttpQueryInterface {
	/**
	 * Execute the query with the provided input variables. Execution can be
	 * customized by providing a custom query runner.
	 */
	public function execute( array $input_variables ): array|WP_Error {
		$query_runner = $this->config['query_runner'] ?? new QueryRunner();

		return $query_runner->execute( $this, $input_variables );
	}

	/**
	 * Execute the query multiple times for an array of input variables
	 * representing multiple runs. Execution can be customized by providing a
	 * custom query runner.
	 */
	public function execute_batch( array $array_of_input_variables ): array|WP_Error {
		$query_runner = $this->config['query_runner'] ?? new QueryRunner();

		return $query_runner->execute_batch( $this, $array_of_input_variables );
	}

	/**
	 * Define the cache object TTL for the current query execution's responses:
	 * - Return a positive integer to set a custom TTL in seconds.
	 * - Return -1 to disable caching.
	 * - Return null to use the global default cache TTL (300 seconds).
	 *
	 * @return int|null The cache object TTL in seconds.
	 */
	public function get_cache_ttl( array $input_variables ): null|int {
		if ( isset( $this->config['cache_ttl'] ) ) {
			return $this->get_or_call_from_config( 'cache_ttl', $input_variables );
		}

		// For most HTTP requests, we only want to cache GET requests. This is
		// overridden for GraphQL queries when using GraphqlQuery
		if ( 'GET' !== strtoupper( $this->get_request_method() ) ) {
			// Disable caching.
			return -1;
		}

		// Use default cache TTL.
		return null;
	}

	/**
	 * Get the data source associated with this query.
	 */
	public function get_data_source(): HttpDataSourceInterface {
		if ( is_array( $this->config['data_source'] ) ) {
			$this->config['data_source'] = HttpDataSource::from_array( $this->config['data_source'] );
		}

		return $this->config['data_source'];
	}

	/**
	 * Get the HTTP endpoint for the current query execution.
	 */
	public function get_endpoint( array $input_variables ): string {
		return $this->get_or_call_from_config( 'endpoint', $input_variables ) ?? $this->get_data_source()->get_endpoint();
	}

	/**
	 * Get the image URL that will represent this query in the UI. Return null to
	 * use the default image.
	 */
	public function get_image_url(): string|null {
		return $this->config['image_url'] ?? $this->get_data_source()->get_image_url();
	}

	/**
	 * Get the input schema for this query.
	 */
	public function get_input_schema(): array {
		return $this->config['input_schema'] ?? [];
	}

	/**
	 * Get the output schema for this query.
	 */
	public function get_output_schema(): array {
		return $this->config['output_schema'];
	}

	/**
	 * Get the pagination schema for this query. If null, pagination will be
	 * disabled.
	 */
	public function get_pagination_schema(): ?array {
		return $this->config['pagination_schema'];
	}

	/**
	 * Get the request body for the current query execution. Any non-null result
	 * will be converted to JSON using `wp_json_encode`.
	 *
	 * @param array $input_variables The input variables for this query.
	 */
	public function get_request_body( array $input_variables ): ?array {
		return $this->get_or_call_from_config( 'request_body', $input_variables );
	}

	/**
	 * Get the request headers for the current query execution.
	 *
	 * @param array $input_variables The input variables for this query.
	 */
	public function get_request_headers( array $input_variables ): array|WP_Error {
		return $this->get_or_call_from_config( 'request_headers', $input_variables ) ?? $this->get_data_source()->get_request_headers();
	}

	/**
	 * Get the request method for this query.
	 */
	public function get_request_method(): string {
		return $this->config['request_method'] ?? 'GET';
	}

	/**
	 * @inheritDoc
	 */
	public static function get_config_schema(): array {
		return ConfigSchemas::get_http_query_config_schema();
	}

	/**
	 * Preprocess the response data before it is passed to the response parser.
	 * This is normally not necessary since the output schema allows for flexible
	 * data parsing and value extraction, but it can be useful when the response
	 * shape needs significant transformation.
	 *
	 * @param mixed $response_data The raw deserialized response data.
	 * @param array $request_details The request details.
	 * @return mixed Preprocessed response data.
	 */
	public function preprocess_response( mixed $response_data, array $request_details ): mixed {
		return $this->get_or_call_from_config( 'preprocess_response', $response_data, $request_details ) ?? $response_data;
	}
}
