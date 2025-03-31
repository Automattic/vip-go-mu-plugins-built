# Block registration

Use the `register_remote_data_block` function to register your block and associate it with your query and data source. This example:

1. Creates a data source.
2. Associates the data source with a query.
3. Defines the output schema of a query, which tells the plugin how to map the query response to blocks.
4. Registers a remote data block.

We are assuming `https://api.example.com/` returns JSON that has a shape like:

```json
{
	"id": 12345,
	"title": "An awesome title"
}
```

```php
function register_your_custom_block() {
	$data_source = HttpDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'display_name' => 'Example API',
			'endpoint' => 'https://api.example.com/',
		],
	] );

	$render_query = HttpQuery::from_array( [
		'display_name' => 'Example Query',
		'data_source' => $data_source,
		'output_schema' => [
			'type' => [
				'id' => [
					'name' => 'ID',
					'path' => '$.id',
					'type' => 'id',
				],
				'title' => [
					'name' => 'Title',
					'path' => '$.title',
					'type' => 'string',
				],
			],
		],
	] );

	register_remote_data_block( [
		'title' => 'My Block',
		'render_query' => [
			'query' => $render_query,
		],
	] );
}
add_action( 'init', 'YourNamespace\\register_your_custom_block', 10, 0 );
```

## Configuration options

### `title`: string (required)

The human-friendly name of the block. It is also used to construct the block's name; a title of "My Block" will result in a block name of `remote-data-blocks/my-block`.

### `render_query`: array (required)

The render query is executed when the block is rendered and fetches the data that will be provided to block bindings. It is an array with the following properties:

- `query` (required): An instance of [`QueryInterface`](./query.md) that fetches the data.
- `loop`: A boolean that indicates if the query returns a collection of data. If `true`, the block will be rendered for each item in the collection. If not provided `false` is the default.

### `selection_queries`: array (optional)

Selection queries are used by content creators to select or curate remote data in the block editor. For example, you may wish to provide a list of products to users and allow them to select one to include in their post, or you may want to allow a user to search for a specific item. Selection queries are an array of objects with the following properties:

- `display_name`: A human-friendly name for the selection query.
- `query` (required): An instance of `QueryInterface` that fetches the data.
- `type`: A string that determines the type of selection query. Accepted values are currently `list` or `search`.

Example:

```php
'selection_queries' => [
    [
        'display_name' => 'Select a product',
        'query' => $list_products_query,
        'type' => 'list',
    ],
    [
        'display_name' => 'Search for a product',
        'query' => $search_products_query,
        'type' => 'search',
    ],
],
```

#### Search queries

Search queries must return a collection and must accept one input variable with the special type `ui:search_input`. The [Art Institute of Chicago](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/art-institute/README.md) example looks like this:

```php
$search_art_query = HttpQuery::from_array([
	'data_source' => $aic_data_source,
	'endpoint' => function ( array $input_variables ) use ( $aic_data_source ): string {
		$query = $input_variables['search'];
		$endpoint = $aic_data_source->get_endpoint() . '/search';

		return add_query_arg( [ 'q' => $query ], $endpoint );
	},
	'input_schema' => [
		'search' => [
			'name' => 'Search terms',
			'type' => 'ui:search_input',
		],
	],
	'output_schema' => [
		'is_collection' => true,
		'path' => '$.data[*]',
		'type' => [
			'id' => [
				'name' => 'Art ID',
				'type' => 'id',
			],
			'title' => [
				'name' => 'Title',
				'type' => 'string',
			],
		],
	],
]);
```

Here you can see the `search` input variable has a special type of `ui:search_input` and is used in the endpoint method to populate a query string. You can read more about [queries](./query.md) and how to construct them. End users enter the search term to find the specific item.

![Screenshot showing the search inputin the WordPress Editor](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/extending/search-input.png)

**Note:** The same search box appears for `list` query types. For this type, the form is only filtering the results returned by the initial list query. For `search` queries, an additional query is made for every search.

### `overrides`: array (optional)

[Overrides](./overrides.md) are used to customize the behavior of the block on a per-block basis.

### `patterns`: array (optional)

[Block patterns](./block-patterns.md) allow you to customize the display of your remote data.
