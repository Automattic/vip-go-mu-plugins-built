# Query runner

A query runner executes a query and processes the results of a query. The default `QueryRunner` used by the [`HttpQuery` class](query.md) is designed to work with most APIs that transact over HTTP and return JSON, but you may want to provide a custom query runner if:

- Your API does not respond with JSON or requires custom deserialization logic.
- Your API uses a non-HTTP transport.
- You want to implement custom processing of the response data, which is not possible with the [provided filters](./hooks.md).

## Custom QueryRunner for HTTP queries

If your API transacts over HTTP and you want to customize the query runner, consider extending the `QueryRunner` class and providing an instance to your query via the `query_runner` option. Here are the methods:

### execute( HttpQueryInterface $query, array $input_variables ): array|WP_Error

The `execute` method executes the query and returns the parsed data. The input variables for the current request are provided as an associative array (`[ $var_name => $value ]`).

### deserialize_response( string $raw_response_data, array $input_variables ): mixed

By default, the `deserialize_response` assumes a JSON string and deserializes it using `json_decode`. Override this method to provide custom deserialization logic.

### get_request_details( HttpQueryInterface $query, array $input_variables ): array|WP_Error

The `get_request_details` method extracts and validates the request details provided by the query. The input variables for the current request are provided as an associative array (`[ $var_name => $value ]`). The return value is an associative array that provides the HTTP method, request options, origin, and URI.

### get_raw_response_data( HttpQueryInterface $query, array $input_variables ): array|WP_Error

The `get_raw_response_data` method dispatches the HTTP request and assembles the raw (pre-processed) response data. The input variables for the current request are provided as an associative array (`[ $var_name => $value ]`). The return value is an associative array that provides the response metadata and the raw response data.

### get_response_metadata( HttpQueryInterface $query, array $response_metadata, array $query_results ): array

The `get_response_metadata` method returns the response metadata for the query, which are available as bindings for [field shortcodes](../concepts/field-shortcodes.md).

## Custom query execution

If your API uses a non-HTTP transport or you want full control over query execution, you should implement your own query that implements `QueryInterface` and provides a custom `execute` method.
