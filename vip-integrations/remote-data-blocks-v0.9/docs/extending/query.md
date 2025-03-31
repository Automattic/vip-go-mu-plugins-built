# Query

A query defines a request for data from a [data source](data-source.md). It defines input and output variables so that the Remote Data Blocks plugin knows how to interact with it.

A common approach is to define a data source on the settings screen and then commit a custom query in code to fetch and process the data. The following example code does just that.

## HttpQuery

Most HTTP-powered APIs can be queried using an `HttpQuery`. Here's an example of a query for US ZIP code data. This examples assumes you have configured the data source in the UI, and have the UUID.

```php
if ( ! defined( 'REMOTE_DATA_BLOCKS_EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID' ) ) {
	return;
}

$data_source = HttpDataSource::from_uuid( REMOTE_DATA_BLOCKS_EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID );

if ( ! $data_source instanceof HttpDataSource ) {
	return;
}

$query = HttpQuery::from_array( [
	'display_name' => 'Get location by Zip code',
	'data_source' => $data_source,
	'endpoint' => function( array $input_variables ) use ( $data_source ): string {
		return $data_source->get_endpoint() . $input_variables['zip_code'];
	},
	'input_schema' => [
		'zip_code' => [
			'name' => 'Zip Code',
			'type' => 'string',
		],
	],
	'output_schema' => [
		'is_collection' => false,
		'type' => [
			'zip_code' => [
				'name' => 'Zip Code',
				'path' => '$["post code"]',
				'type' => 'string',
			],
			'city'     => [
				'name' => 'City',
				'path' => '$.places[0]["place name"]',
				'type' => 'string',
			],
			'state'    => [
				'name' => 'State',
				'path' => '$.places[0].state',
				'type' => 'string',
			],
		],
	],
] );
```

- The `endpoint` property is a callback function that constructs the query endpoint. In this case, the endpoint is constructed by appending the `zip_code` input variable to the data source endpoint.
- The `input_schema` property defines the input variables the query expects. For some queries, input variables might be used to construct a request body. In this case, the `zip_code` input variable is used to customize the query endpoint via the `endpoint` callback function.
- The `output_schema` property defines the output data that will be extracted from the API response. The `path` property uses [JSONPath](https://jsonpath.com/) expressions to allow concise, no-code references to nested data.

This example features a small subset of the customization available for a query; see the full documentation below for details.

## HttpQuery configuration

### display_name: string (required)

The `display_name` property defines the query's human-friendly name.

### data_source: HttpDataSourceInterface (required)

The `data_source` property provides the [data source](./data-source.md) the query uses.

### endpoint: string|callable

The `endpoint` property defines the query endpoint. It can be a string or a callable function that constructs the endpoint. The callable function accepts an associative array of input variables (`[ $var_name => $value ]`). If omitted, the query will use the endpoint defined by the data source.

#### Example

```php
'endpoint' => function( array $input_variables ) use ( $data_source ): string {
	return $data_source->get_endpoint() . $input_variables['zip_code'];
},
```

### input_schema: array

The `input_schema` property defines the input variables expected by the query. The property should be an associative array of input variable definitions. The keys of the array are machine-friendly input variable names, and the values are associative arrays with the following structure:

- `name` (optional): The human-friendly display name of the input variable
- `default_value` (optional): The default value for the input variable.
- `type` (required): The primitive type of the input variable. Supported types are:
  - `boolean`
  - `id`
  - `integer`
  - `null`
  - `number`
  - `string`

#### Example

```php
'input_schema' => [
	'zip_code' => [
		'name' => 'Zip Code',
		'type' => 'string',
	],
],
```

There are also some special input variable types:

- `ui:search_input`: A variable with this type indicates that the query supports searching. It must accept a `string` containing search terms.
- `ui:pagination_offset`: A variable with this type indicates that the query supports offset pagination. It must accept an `integer` containing the requested offset. See `pagination_schema` for additional information and requirements.
- `ui:pagination_page`: A variable with this type indicates that the query supports page-based pagination. It must accept an `integer` containing the requested results page. See `pagination_schema` for additional information and requirements.
- `ui:pagination_per_page`: A variable with this type indicates that the query supports controlling the number of resultsper page. It must accept an `integer` containing the number of requested results.
- `ui:pagination_cursor_next` and `ui_pagination_cursor_previous`: Variables with these types indicate that the query supports cursor pagination. They accept `strings` containing the requested cursor. See `pagination_schema` for additional information and requirements.

#### Example with search and pagination input variables

```php
'input_schema' => [
	'search' => [
		'name' => 'Search terms',
		'type' => 'ui:search_input',
	],
	'limit' => [
		'default_value' => 10,
		'name' => 'Pagination limit',
		'type' => 'ui:pagination_per_page',
	],
	'page' => [
		'default_value' => 1,
		'name' => 'Pagination page',
		'type' => 'ui:pagination_page',
	],
],
```

If omitted, `input_schema` defaults to an empty array.

### output_schema: array (required)

The `output_schema` property defines how to extract data from the API response. The property should be an associative array with the following structure:

- `format` (optional): A callable function that formats the output variable value.
- `generate` (optional): A callable function that generates or extracts the output variable value from the response, as an alternative to `path`.
- `is_collection` (optional, default `false`): A boolean indicating whether the response data is a collection. If false, only a single item will be returned.
- `name` (optional): The human-friendly display name of the output variable.
- `default_value` (optional): The default value for the output variable.
- `path` (optional): A [JSONPath](https://jsonpath.com/) expression to extract the variable value.
- `type` (required): A primitive type (e.g., `string`, `boolean`) or a nested output schema.

Accepted primitive types are:

- `boolean`
- `button_url`
- `email_address`
- `html`
- `id`
- `image_alt`
- `image_url`
- `integer`
- `markdown`
- `null`
- `number`
- `string`
- `url`
- `uuid`

#### Example

```php
'output_schema' => [
    'is_collection' => false,
    'type' => [
        'zip_code' => [
            'name' => 'Zip Code',
            'path' => '$["post code"]',
            'type' => 'string',
        ],
        'city_state' => [
            'name' => 'City, State',
            'default_value' => 'Unknown',
            'generate' => function(array $response_data): string {
                return $response_data['places'][0]['place name'] . ', ' . $response_data['places'][0]['state'];
            },
            'type' => 'string',
        ],
    ],
],
```

We have more in-depth [`output_schema`](./query-output_schema.md) examples.

### pagination_schema: array

If your query supports pagination, the `pagination_schema` property defines how to extract pagination-related values from the query response. If defined, the property should be an associative array with the following structure:

- `total_items` (required): A variable definition that extracts the total number of items across every page of results.
- `cursor_next`: If your query supports cursor pagination, a variable definition that extracts the cursor for the next page of results.
- `cursor_previous`: If your query supports cursor pagination, a variable definition that extracts the cursor for the previous page of results.

Note that the `total_items` variable is required for all types of pagination.

#### Example

```php
'pagination_schema' => [
	'total_items' => [
		'name' => 'Total items',
		'path' => '$.pagination.totalItems',
		'type' => 'integer',
	],
	'cursor_next' => [
		'name' => 'Next page cursor',
		'path' => '$.pagination.nextCursor',
		'type' => 'string',
	],
	'cursor_previous' => [
		'name' => 'Previous page cursor',
		'path' => '$.pagination.previousCursor',
		'type' => 'string',
	],
],
```

### request_method: string

The `request_method` property defines the HTTP request method used by the query. By default, it is `'GET'`.

### request_headers: array|callable

The `request_headers` property defines the request headers for the query. It can be an associative array or a callable function that returns an associative array. The callable function accepts an associative array of input variables (`[ $var_name => $value ]`). If omitted, the query will use the request headers defined by the data source.

### Example

```php
'request_headers' => function( array $input_variables ) use ( $data_source ): array {
	return array_merge(
		$data_source->get_request_headers(),
		[ 'X-Foo' => $input_variables['foo'] ]
	);
},
```

### request_body: array|callable

The `request_body` property defines the request body for the query. It can be an associative array or a callable function that returns an associative array. The callable function accepts an associative array of input variables (`[ $var_name => $value ]`). If omitted, the query will not have a request body.

### cache_ttl: int|null|callable

The `cache_ttl` property defines how long the query response should be cached in seconds. It can be an integer, a callable function that returns an integer, or `null`. The callable function accepts an associative array of input variables (`[ $var_name => $value ]`).

A value of `-1` indicates the query should not be cached. A value of `null` indicates the default TTL should be used (60 seconds). If omitted, the default TTL is used.

Remote data blocks utilize the WordPress object cache (`wp_cache_get()` / `wp_cache_set()`) for response caching. Ensure that your platform provides or installs a persistent object cache plugin so that this value is respected.

If you do not have a peristent object cache, no caching will be available. We do not recommend running the Remote Data Blocks plugin in this configuration.

### image_url: string|null

The `image_url` property defines an image URL that represents the query in the UI. If omitted, the query will use the image URL defined by the data source.

### preprocess_response: callable

If you need to pre-process the response in some way before the output variables are extracted, provide a `preprocess_response` function. The function will receive the deserialized response.

#### Example

```php
'preprocess_response' => function( mixed $response_data, array $input_variables ): array {
	$some_computed_property = compute_property( $response_data['foo']['bar'] ?? '' );

	return array_merge(
		$response_data,
		[ 'computed_property' => $some_computed_property ]
	);
},
```

### query_runner: QueryRunnerInterface

Use the `query_runner` property to provide a custom [query runner](./query-runner.md) for the query. If omitted, the query will use the default query runner, which works well with most HTTP-powered APIs.
