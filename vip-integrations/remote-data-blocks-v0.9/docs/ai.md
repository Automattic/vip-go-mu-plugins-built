This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded

## Additional Info

# Directory Structure
```
airtable/
  events/
    README.md
    register.php
  leaflet-map/
    build/
      blocks/
        leaflet-map/
          block.json
          index.asset.php
          index.js
          render.php
          view.asset.php
          view.js
    src/
      blocks/
        leaflet-map/
          block.json
          edit.js
          index.js
          render.php
          view.js
    README.md
    register.php
    webpack.config.js
concepts/
  block-bindings.md
  field-shortcodes.md
  helper-blocks.md
  index.md
extending/
  block-patterns.md
  block-registration.md
  data-source.md
  hooks.md
  index.md
  overrides.md
  query-output_schema.md
  query-runner.md
  query.md
github/
  markdown-file/
    inc/
      patterns/
        file-render.html
    github-query-runner.php
    markdown-links.php
    README.md
    register.php
google-sheets/
  westeros-houses/
    README.md
    register.php
  README.md
rest-api/
  art-institute/
    art-institute.php
    README.md
  zip-code/
    README.md
    zip-code.php
shopify/
  product/
    README.md
    register.php
theme/
  functions.php
  README.md
  style-remote-data-blocks.css
  style.css
  theme.json
tutorials/
  bruno-collections/
    Salesforce D2C APIs.json
  airtable.md
  google-sheets.md
  http.md
  index.md
  salesforce-commerce.md
  shopify.md
index.md
local-development.md
quickstart.md
README.md
releasing.md
troubleshooting.md
```

# Files

## File: concepts/block-bindings.md
````markdown
# Block bindings

Remote Data Blocks takes advantage of the [Block Bindings API](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/). This Core WordPress API allows you to “bind” dynamic data to the block's attributes, which are then reflected in the final HTML markup.

The Block Bindings API allows Remote Data Blocks to read from different sources without needing to write custom block boilerplate, React, block registration, and other particulars of writing custom blocks from scratch for each new data source.

For a quick overview, the [announcement post](https://make.wordpress.org/core/2024/03/06/new-feature-the-block-bindings-api/) is very helpful. The Block Bindings API is evolving, and an in-depth understanding isn't necessary for day-to-day use.

But if you want to dig deeper into the internals of how Remote Data Blocks works, the [public documentation](https://developer.wordpress.org/block-editor/reference-guides/block-api/block-bindings/) is available.
````

## File: concepts/field-shortcodes.md
````markdown
# Field shortcodes

One of the current limitations of the [block bindings API](./block-bindings.md) is that it is restricted to a small number of core blocks and attributes. For example, currently, you cannot bind to the content of a table block or a custom block. You also cannot bind to a _subset_ of a block's content.

As a partial workaround, this plugin provides a way to use remote data in some places where block bindings are not supported. We call this feature "field shortcodes," and it is available in any block that uses [rich text](https://developer.wordpress.org/block-editor/reference-guides/richtext/), such as tables, lists, and custom blocks. Look for the field shortcode button in the rich text formatting toolbar:

<img width="535" alt="Field shortcode button" src="https://github.com/user-attachments/assets/8ce0bd18-367e-46d5-a870-22819c42ff4a" />

Clicking this button will open a modal that allows you to select a field from a remote data source, resulting in an inline remote data binding. Just like remote data blocks, this binding will load the latest data from the remote source when the content is rendered.

<img width="684" alt="A bulleted list using several field shortcodes to describe three conference events" src="https://github.com/user-attachments/assets/6527dcc0-c0ed-42ab-9655-b8fc2510e15b" />

Field shortcodes compile to HTML, so they are portable, safe, and have a built-in fallback.
````

## File: concepts/helper-blocks.md
````markdown
# Helper Blocks

Remote Data Blocks adds some accessory blocks for bindings, listed below.

## Remote HTML Block

Use this block to bind to HTML from a remote data source. This block only works when placed inside a remote data block container and bound to an attribute.

![Screen recording showing the insertion and binding of a Remote HTML Block in the editor](./block-insert-remote-html.gif)

Bindings in the `output_schema` of a remote data container must have type `html` in order to be rendered by the Remote HTML block:

```php
$my_query = \RemoteDataBlocks\Config\Query\HttpQuery::from_array( [
    /* ... */
    'output_schema' =>
        'is_collection' => false,
        'output_schema' => [
        'type' => [
            'header' => [
                'name' => 'Header',
                'path' => '$.header',
                'type' => 'string',
            ],
            'myHtmlContent' => [
                'name' => 'My HTML Content',
                'path' => '$.myHtmlContent',
                'type' => 'html',            // Must be type 'html' for binding
            ],
        ],
    ],
] );

register_remote_data_block( [
    'title' => 'My HTML API',
    'render_query' => [
        'query' => $my_query,
    ],
] );
```
````

## File: concepts/index.md
````markdown
# Core concepts

Remote Data Blocks allows you to integrate remote data into posts, pages, patterns, or anywhere else on your site where you use the block editor. This guide will help you understand the core concepts of the plugin and how they work.

## Supported use cases

Like WordPress, Remote Data Blocks is flexible. It can be used to enable advanced integrations with external data.

Below, you'll find specific use cases where Remote Data Blocks shines. We are working to expand these use cases, but before you start, consider if Remote Data Blocks is the right tool for the job.

### Remote Data Blocks is a good fit if:

- Your remote data represents entities with a consistent schema.
  - **Example:** Product data representing items of clothing with defined attributes like “Name,” “Price,” “Color,” “Size,” etc.
- You want humans to select specific entities for display within the block editor.
  - **Example:** Select and display an item of clothing within a marketing post.
- You want to display arbitrary remote data based on a URL parameter and are willing to write a small amount of code.
  - **Example:** Create a page and rewrite rule for /products/{product_id}/ and configure a Remote Data Block on that page to display the referenced product.
- Your presentation of remote data aligns with the capabilities of Block Bindings.
  - **Example:** Display an item of clothing using a core paragraph, heading, image, and button blocks.
- You do not require complex filtering.
  - **Example:** To select an item of clothing, load a list of top-selling products or search all products by a specific term.
- Your data is denormalized and relatively flat.
  - **Example:** A row from a Google Sheet with no references to external entities.

### Remote Data Blocks may not be a good fit if:

- Your remote data is schema-less, or the schema changes over time.
  - Queries for remote data must define a schema for their return data. Schema changes result in broken blocks.
- You want to display remote data outside the context of the block editor.
  - Block bindings are only available in block content—posts, pages, or full-site editing. Using our plugin may still provide some benefit (e.g., caching) but could require significant custom PHP code.
- Your data is normalized (and cannot be denormalized automatically by your API).
  - Some APIs can denormalize data by automatically “inflating” referenced records for you. For example, data representing an item of clothing might reference a color by ID instead of a renderable string like “forest green.” If your API does not denormalize this relationship automatically, you will need to write custom code to perform additional queries and stitch the responses together.
  - This can lead to a large number of API requests that your API may not tolerate. Airtable’s API, for example, imposes a rate limit of five requests per second, making multiple calls impractical.
- You have multiple remote data sources that require interaction. Or, you want to implement a complex content architecture using Remote Data Blocks instead of leveraging WordPress custom post types and/or taxonomies.
  - These two challenges are directly related to the issues with normalized data. If you have data sources that relate to one another, you have to write custom code to query missing data and stitch them together.
  - Judging complexity is difficult, but implementing large applications using Remote Data Blocks is not advisable.
- You require complex filtering or have complex pagination needs.
  - Our UI components for filtering are pagination still under development.

Over time, Remote Data Blocks will grow and improve and these guidelines will change.

## Remote data source

**Remote data source** refers to data that is fetched from an external source, such as an API or a third-party service. This might be a product in your Shopify store, data in an Airtable or Google Sheet, or a file in a GitHub repository. Remote data is usually fetched via HTTP requests, but you can [extend the plugin](../extending/index.md) to support other transports.

Simple data sources can be configured via the plugin's settings screen, while others may require custom PHP code (see [extending](../extending/index.md)).

## Queries

**Queries** define how data is fetched, processed, and displayed. Queries delegate some logic to a **data source**, which can be reused by multiple queries. For example, one query to retrieve a single item, and one to retrieve a list.

Simple queries can be configured via the plugin's settings screen, while others may require custom PHP code (see [extending](../extending/index.md)).

## Remote data block

A **remote data block** is a custom block connected to a specific query. Each remote data block has a unique name and is strictly tied to a data source.

For example, you might have a remote data block named "Shopify Product" that fetches a product from your Shopify store and displays the product's name, description, price, and image. Or, you might have a remote data block named "Conference event" that displays rows from an Airtable and displays the event's name, location, and type.

Remote data blocks are **container blocks** that contain other blocks and provide remote data to them. You retain complete control over the layout, design, and content. You can leverage patterns to enable consistent styling and customize the block's appearance using the block editor or `theme.json`.

Remote data blocks are custom blocks, but they are created and registered by our plugin and don't require custom block development. Remote data is loaded via [the block bindings API](./block-bindings.md) or [field shortcodes](./field-shortcodes.md).

## Data fetching

The plugin handles data fetching and wraps [`wp_remote_request`](https://developer.wordpress.org/reference/functions/wp_remote_request/).

When a request to your site renders one or more remote data blocks, our plugin will fetch and potentially cache the remote data. Multiple requests for the same data within a single page load will be deduped, even if the requests are not cacheable.

### Caching

The plugin offers a caching layer for optimal performance and helps avoid rate limiting from remote data sources. It will be used if your WordPress environment configures a [persistent object cache](https://developer.wordpress.org/reference/classes/wp_object_cache/#persistent-cache-plugins). Otherwise, the plugin will utilize in-memory (per-page-load) caching. Deploying to production without a persistent object cache is not recommended.

The default TTL for all cache objects is 60 seconds, but it can be [configured per query or request](../extending/query.md#get_cache_ttl).

## Theming

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Patterns

Since remote data blocks are container blocks, you can associate a remote data block with a pattern to create reusable layouts. You link a pattern to a particular remote data block in the Site Editor. You will see a new Remote Data Blocks section in the right-hand panel when editing a pattern.

![Screenshot showing the right hand panel of the WordPress Site Editor](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/concepts/patterns-right-panel.png)

Select the specific block that is appropriate for this pattern. Once saved, content creators can select this pattern when adding the associated remote data block.

You can also create a pattern directly from the content.
<video src="https://github.com/user-attachments/assets/358d9d40-557b-4f39-b943-ed73d6f18adb"></video>

The plugin supports both synced and unsynced patterns.

## Technical concepts

If you want to understand the internals of Remote Data Blocks so that you can extend its functionality, head over to the [extending guide](../extending/index.md).
````

## File: extending/block-patterns.md
````markdown
# Block patterns

Patterns allow you to represent your remote data in different ways.

The plugin registers an unstyled block pattern any time you register a remote data block either in the WordPress admin or with `register_remote_data_block`.

You can create additional patterns in the WordPress Site Editor or programmatically by passing a `patterns` property to your block options.

You cannot edit the default pattern, but you can duplicate it and make changes.

We recommend duplicating the default pattern and then making changes in the Site Editor. Once you've created your preferred pattern, you can associate it with the block in the `register_remote_data_block` call.

If you want to make the pattern uneditable in the Site Editor, you can copy the block markup to a file and commit it to your repository.

## Example

```html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group">
	<!-- wp:heading {"metadata":{"bindings":{"content":{"source":"remote-data/binding","args":{"field":"title"}}}}} -->
	<h2 class="wp-block-heading"></h2>
	<!-- /wp:heading -->
	<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"remote-data/binding","args":{"field":"description"}}}}} -->
	<p></p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

You could save this file as `my-pattern.html` in the same directory as the code that registers your block.

```php
register_remote_data_block( [
    'title' => 'My Remote Data Block',
    'render_query' => [ /* ... */ ],
    'patterns' => [
        [
            'title' => 'My Pattern',
            'content' => file_get_contents( __DIR__ . '/my-pattern.html' ),
        ],
    ],
] );
```
````

## File: extending/block-registration.md
````markdown
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
````

## File: extending/data-source.md
````markdown
# Data source

A data source defines the basic reusable properties of an API and is used by a [query](query.md) to reduce repeating code with every query. It also helps define how your data source looks in the WordPress admin.

## Example

Most HTTP-powered APIs can be represented by defining a class that extends `HttpDataSource`. Here's an example of a data source for an example HTTP API:

```php
$data_source = HttpDataSource::from_array( [
    'service_config' => [
        '__version' => 1,
        'display_name' => 'Example API',
        'endpoint' => 'https://api.example.com/',
        'request_headers' => [
            'Content-Type' => 'application/json',
            'X-Api-Key' => MY_API_KEY_CONSTANT,
        ],
    ],
] );
```

## HttpDataSource configuration

### **version**: number (required)

There is no built-in versioning logic, but a version number is required for best practice reasons. Changes to the data source could significantly affect [queries](query.md). Checking the data source version is a sensible defensive practice.

### display_name: string (required)

The display name is used in the UI to identify your data source.

### endpoint: string

This is the default endpoint for the data source and can save repeated use in queries. We would suggest putting the root API URL here and then manipulating it as necessary in individual [queries](query.md).

### request_headers: array

Headers will be set according to the properties of the array. When providing authentication credentials, take care to keep them from appearing in code repositories. We strongly recommend using environment variables or other secure means for storage.

## Additional parameters

You can add any additional parameters that are necessary for your data source. In our [Airtable example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/airtable/events/register.php), you can see that we are setting values for the Airtable `base` and `table`.

Consider adding whatever configuration would be useful to queries. As an example, queries have an `endpoint` property. Our [Zip code example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/zip-code.php) sets the endpoint with a function:

```php
$zipcode_query = HttpQuery::from_array( [
    'data_source' => $zipcode_data_source,
    'endpoint' => function ( array $input_variables ) use ( $zipcode_data_source ): string {
        return $zipcode_data_source->get_endpoint() . $input_variables['zip_code'];
    },
])
```

In this case the `data_source` has a built in `get_endpoint()` method. Other configuration options can be retrieved directly:

```php
$data_source = HttpDataSource::from_array( [
    'service_config' => [
        '__version' => 1,
        'display_name' => 'More Complicated Example API',
        'endpoint' => 'https://api.complexexample.com/',
        'request_headers' => [
            'Content-Type' => 'application/json',
            'X-Api-Key' => MY_API_KEY_CONSTANT,
        ],
    ],
] );

$my_config = [
 'some_identifier' => 'id-123'
];

$zipcode_query = HttpQuery::from_array( [
    'data_source' => $data_source,
    'endpoint' => function ( array $input_variables ) use ( $data_source, $my_config ): string {
        return  return $data_source->get_endpoint() . $my_config['some_identifier'] . "/" . $input_variables['search'];
    },
] )
```

The goal with design was to provide you with flexibility you need to represent any data source.

## HttpDataSource configuration

### **version**: number (required)

There is no built-in versioning logic, but a version number is required for best practice reasons. Changes to the data source could significantly affect [queries](query.md). Checking the data source version is a sensible defensive practice.

### display_name: string (required)

The display name is used in the UI to identify your data source.

### endpoint: string

This is the default endpoint for the data source and can save repeated use in queries. We would suggest putting the root API URL here and then manipulating it as necessary in individual [queries](query.md).

### request_headers: array

Headers will be set according to the properties of the array. When providing authentication credentials, take care to keep them from appearing in code repositories. We strongly recommend using environment variables or other secure means for storage.

## Additional parameters

You can add any additional parameters that are necessary for your data source. In our [Airtable example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/airtable/events/register.php), you can see that we are setting values for the Airtable `base` and `table`.

Consider adding whatever configuration would be useful to queries. As an example, queries have an `endpoint` property. Our [Zip code example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/zip-code.php) sets the endpoint with a function:

```php
$zipcode_query = HttpQuery::from_array( [
    'data_source' => $zipcode_data_source,
    'endpoint' => function ( array $input_variables ) use ( $zipcode_data_source ): string {
        return $zipcode_data_source->get_endpoint() . $input_variables['zip_code'];
    },
])
```

The goal with design was to provide you with flexibility you need to represent any data source.

## Custom data sources

The configuration array passed to `from_array` is very flexible, so it's usually not necessary to extend `HttpDataSource`, but you can do so if you need to add custom behavior.

For APIs that use non-HTTP transports, you can also implement `DataSourceInterface` and provide methods that define reusable properties of your API. The actual implementation of your transport will need to be provided by a [custom query runner](./query-runner.md).

Here is a theoretical example of a data source for a WebDAV server:

```php
class WebDavFilesDataSource implements DataSourceInterface {
    public function get_display_name(): string {
        return 'My WebDAV Files';
    }

    public function get_image_url(): string {
        return 'https://example.com/webdav-icon.png';
    }

    public function get_webdav_root(): string {
        return 'webdavs://webdav.example.com/';
    }
}
```
````

## File: extending/hooks.md
````markdown
# Hooks

Hooks are a way for one piece of code to interact/modify another piece of code at specific, pre-defined spots.

There are two types of hooks: Actions and Filters. To use either, you need to write a custom function known as a Callback, and then register it with a WordPress hook for a specific action or filter.

[Read more about Hooks](https://developer.wordpress.org/plugins/hooks/)

## Actions

Actions allow you to add data or change how WordPress operates. Actions will run at a specific point in the execution of plugin. Callback functions for an Action do not return anything back to the calling Action hook.

### wpcomvip_log

If you want to send debugging information to another source besides [Query Monitor](../troubleshooting.md#query-monitor), use the `wpcomvip_log` action.

```php
function custom_log( string $namespace, string $level, string $message, array $context ): void {
    // Send the log to a custom destination.
}
add_action( 'wpcomvip_log', 'custom_log', 10, 4 );
```

## Filters

Filters give you the ability to change data during the execution of the plugin. Callback functions for Filters will accept a variable, modify it, and return it. They are meant to work in an isolated manner, and should never have side effects such as affecting global variables and output.

### wpcomvip_log_to_query_monitor

Filter whether to log a message to Query Monitor (default: `true`).

```php
add_filter( 'wpcomvip_log_to_query_monitor', '__return_false' );
```

### remote_data_blocks_register_example_block

Filter whether to register the included example API block ("Conference Event") (default: `true`).

```php
add_filter( 'remote_data_blocks_register_example_block', '__return_false' );
```

### remote_data_blocks_allowed_url_schemes

Filter the allowed URL schemes for this request. Only HTTPS is allowed by default, but it might be useful to relax this restriction in local environments.

```php
function custom_allowed_url_schemes( array $allowed_url_schemes, HttpQueryInterface $query ): array {
	// Modify the allowed URL schemes.
	return $allowed_url_schemes;
}
add_filter( 'remote_data_blocks_allowed_url_schemes', 'custom_allowed_url_schemes', 10, 2 );
```

### remote_data_blocks_request_details

Filter the request details (method, options, url) before the HTTP request is dispatched.

```php
function custom_request_details( array $request_details, HttpQueryInterface $query, array $input_variables ): array {
	// Modify the request details.
	return $request_details;
}
add_filter( 'remote_data_blocks_request_details', 'custom_request_details', 10, 3 );
```

### remote_data_blocks_query_input_variables

Filter the query input variables prior to query execution. This filter is useful for modifying the input variables for the current page-load, e.g., by pulling in data from query variables or other context. See [Overrides](overrides.md) for more information.

```php
add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides, string $block_name, array $block_context ): array {
	if ( true === in_array( 'my_override', $enabled_overrides, true ) ) {
		$override_value = get_query_var( 'override_id' );

		if ( ! empty( $override_value ) ) {
			$input_variables['id'] = $override_value;
		}
	}

	return $input_variables;
}, 10, 4 );
```

Keep in mind that modifying query input variables will affect the object cache key used for query execution. This could result in a cache miss.

### remote_data_blocks_query_response

Filter the query response just after query execution. This filter is useful for modifying the query response for the current page-load, e.g., by pulling in data from query variables or other context. See [Overrides](overrides.md) for more information.

```php
add_filter( 'remote_data_blocks_query_response', function ( array $query_response, array $enabled_overrides, string $block_name, array $block_context ): array {
	if ( true === in_array( 'alternate_date_format', $enabled_overrides, true ) ) {
		$query_response['results'] = array_map( function ( array $result ) {
			$date = new DateTime( $result['date'] );
			$result['date'] = $date->format( 'Y F d' );
			return $result;
		}, $query_response['results'] );
	}

	return $input_variables;
}, 10, 4 );
```

The result of this filter is not cached, and will run for every block binding.

### remote_data_blocks_query_response_metadata

Filter the query response metadata, which are available as bindings for field shortcodes. In most cases, it is better to provide a custom query class and override the `get_response_metadata` method, but this filter is available in case that is not possible.

```php
function custom_query_response_metadata( array $metadata, HttpQueryInterface $query, array $input_variables ): array {
	// Modify the response metadata.
	return $metadata;
}
add_filter( 'remote_data_blocks_query_response_metadata', 'custom_query_response_metadata', 10, 3 );
```

### remote_data_blocks_bypass_cache

Filter to bypass the cache for a specific request (default: `false`).

```php
add_filter( 'remote_data_blocks_bypass_cache', '__return_true' );
```

### remote_data_blocks_http_client_retry_delay

Filter to change the defualt 1 second delapy after an HTTP request fails. The Remote Data Blocks Plugin uses the [Guzzle](https://github.com/guzzle/guzzle) HTTP client. You can read about the response interface in their [documentation](https://docs.guzzlephp.org/en/stable/).

```php
function custom_response_retry_delay( int $retry_after_ms, int $retries, ?ResponseInterface $response ): int {
	// Implement a custom exponential backoff strategy.
	return floor( pow( 1.5, $retries ) * 1000 );
}
add_filter( 'remote_data_blocks_http_client_retry_delay', 'custom_response_retry_delay', 10, 3 );
```

### remote_data_blocks_http_client_retry_decider

Filter the default HTTP retry logic when an HTTP request fails or encounters an exception. The Remote Data Blocks Plugin uses the [Guzzle](https://github.com/guzzle/guzzle) HTTP client. You can read about the request, response, and exception interfaces in their [documentation](https://docs.guzzlephp.org/en/stable/).

```php
function custom_retry_decider( bool $should_retry, int $retries, RequestInterface $request, ?ResponseInterface $response, ?Exception $exception ): bool {
	// Retry on a 408 error if the number of retries is less than 5.
	if ( $retries < 5 && $response && 408 === $response->getStatusCode ) {
		return true;
	}
	return $should_retry;
}
add_filter( 'remote_data_blocks_http_client_retry_decider', 'custom_response_retry_on_exception', 10, 5 );
```
````

## File: extending/index.md
````markdown
# Extending

> [!TIP]
> Make sure you've read the [core concepts](../concepts/index.md) behind Remote Data Blocks before extending the plugin.

Data sources and queries can be configured in the plugin UI, but sometimes, you need to extend the plugin to implement custom functionality. Remote Data Blocks provides extendable classes, global functions, hooks, and filters to help you connect to any data source, parse responses, and customize the display of data.

## Data Flow

Here's a short overview of how data flows through the plugin when a post with a remote data block is rendered:

1. WordPress core loads the post content, parses the blocks, and recognizes that a paragraph block has a [block binding](../concepts/block-bindings.md).
2. WordPress core calls the block binding callback function: `BlockBindings::get_value()`.
3. The callback function inspects the paragraph block. Using the block context supplied by the parent remote data block, it determines which [query](./query.md) to execute.
4. The query is executed: `$query->execute()` (usually by delegating to a [query runner](./query-runner.md)).
5. Various properties of the query are requested by the query runner, including the endpoint, request headers, request method, and request body. Some of these properties are delegated to the data source (`$query->get_data_source()`).
6. The query is dispatched, and the response data is inspected, formatted into a consistent shape, and returned to the block binding callback function.
7. The callback function extracts the requested field from the response data and returns it to WordPress core for rendering.

## Customization

Providing a custom data source, query, or query runner gives you complete control over how data is fetched, processed, and rendered. In most cases, you only need to extend one of these classes to implement custom behavior. A common approach is to define a data source on the settings screen and then commit a custom query in code to fetch and process the data.

Here are some detailed overviews of these classes with notes on how and why to extend them:

- [Data Source](data-source.md)
- [Query](query.md)

Once you've defined your data source and queries, you can [register a remote data block](block-registration.md) that uses them. That block can use a [pattern](block-patterns.md) for display. You can also use [overrides](./overrides.md) to dynamically select the displayed content.

### Additional customization

- [Hooks (actions and filters)](hooks.md)
- [Query runner](query-runner.md)

## Examples

The [examples](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/README.md) provide detailed code samples of interacting with the plugin various methods of extending the plugin.

## Create a local development environment

This repository includes tools for quickly starting a [local development environment](../local-development.md).
````

## File: extending/overrides.md
````markdown
# Overrides

Overrides provide a way to customize the behavior of remote data blocks on a per-block basis. You can use them to modify the underlying query input variables, adjust the query response, or change the caching behavior. Overrides are defined when you register a remote data block and can be enabled or disabled via the block settings in the WordPress editor.

If you have multiple instances of the same remote data block in a piece of content, each instance can have different overrides enabled. By default, no overrides are enabled.

Here is an example of an override that modifies the query input variables based on the URL.

You could use this to build a "product page" in the WordPress admin that would be able to display any product, using an ID from the URL, e.g.: https://example.com/product/123456

The example takes advantage of the [`add_rewrite_rule`](https://developer.wordpress.org/reference/functions/add_rewrite_rule/) function and the [`query_vars`](https://developer.wordpress.org/reference/hooks/query_vars/) filter that are built into WordPress.

```php
register_remote_data_block( [
    'title' => 'Acme Product',
    'render_query' => [
        'query' => $get_product_query,
    ],
    'overrides' => [
        [
            'name' => 'product_id_override',
            'display_name' => __( 'Use product ID from URL', 'my-text-domain' ),
            'help_text' => __( 'For use on the /products/ page', 'my-text-domain' ),
        ],
    ],
] );

add_rewrite_rule( '^products/([0-9]+)/?', 'index.php?pagename=products&acme_product_id=$matches[1]', 'top' );

add_filter( 'query_vars', function ( array $query_vars ): array {
    $query_vars[] = 'acme_product_id';
    return $query_vars;
}, 10, 1 );

add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
    if ( true === in_array( 'product_id_override', $enabled_overrides, true ) ) {
        $product_id = get_query_var( 'acme_product_id' );

        if ( ! empty( $product_id ) ) {
            $input_variables['product_id'] = $product_id;
        }
    }

    return $input_variables;
}, 10, 2 );
```

As you can see, the `remote_data_blocks_query_input_variables` filter is passed a list of enabled overrides. You need to add logic to identify which filters are enabled and act accordingly.

The `overrides` property in the block registration array enables a panel in the block settings that allows content authors to enable or disable the override:

<img width="276" alt="An overrides panel in a remote data block settings panel" src="https://github.com/user-attachments/assets/e701e621-99f9-4c2e-b34d-cfef352af2ae" />
````

## File: extending/query-output_schema.md
````markdown
# Query `output_schema` property

The `output_schema` property is where your data shape definition happens. It should be created with care and requires updates whenever the incoming response changes.

Unless your API returns a single value, `type` will be constructed of an associative array of nested output schemas that eventually resolve to one of the accepted primitive types:

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

## Single Entry Example

Using the [Zip Code example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/README.md), the JSON response returned by the API looks like this:

```json
{
	"post code": "17057",
	"country": "United States",
	"country abbreviation": "US",
	"places": [
		{
			"place name": "Middletown",
			"longitude": "-76.7331",
			"state": "Pennsylvania",
			"state abbreviation": "PA",
			"latitude": "40.2041"
		}
	]
}
```

And the `output_schema` definiton would look like this.

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
			'generate' => function( array $response_data ): string {
				return $response_data['places'][0]['place name'] . ', ' . $response_data['places'][0]['state'];
			},
			'type' => 'string',
		],
	],
],
```

You can see how the `type` property contains a nested output schema. The `zip_code` array index starts a new definiton using `path` to find the specific value.

Where `city_state` uses the genrate function to combine two elements from inside the response. In this case we assume that the first returned place is accurate for the zip. This is a safe assumption for U.S. zip codes.

## Collection Example

An example of collection JSON can be found in the [Chicago Institue of Art example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/art-institute/README.md). That API returns (in part):

```json
{
	"preference": null,
	"pagination": {
		"total": 183,
		"limit": 10,
		"offset": 0,
		"total_pages": 19,
		"current_page": 1
	},
	"data": [
		{
			"_score": 155.49371,
			"thumbnail": {
				"alt_text": "Color pastel drawing of ballerinas in tutus on stage, watched by audience.",
				"width": 3000,
				"lqip": "data:image/gif;base64,R0lGODlhCgAFAPUAADtMRVJPRFlOQlBNSFFNSEVURU1USldSS1dSTVRXTV9ZTldVUl1ZU2hbTVdkU19kVV5tX2FkUGFjVWVoVGhoVGZhW29lXGVtXG1rWmlpXW5tXmZxX3VxX1toZG5oYG5uZ3ZsY3BqZGN1a3RxYnFyZXRxZntxan19bnl9cnh7dX57doJ/dpGEeJKOhaCUjKebk6yflsGupQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAAAAAAALAAAAAAKAAUAAAYuQIjoQuGQTqhOyrEZYSQJA6AweURYrxIoxAhoMp9VywWLmRYqj6BxQFQshIEiCAA7",
				"height": 1502
			},
			"api_model": "artworks",
			"is_boosted": true,
			"api_link": "https://api.artic.edu/api/v1/artworks/61603",
			"id": 61603,
			"title": "Ballet at the Paris Opéra",
			"timestamp": "2025-01-14T22:26:21-06:00"
		},
		{
			"_score": 152.35487,
			"thumbnail": {
				"alt_text": "Impressionist painting of woman wearing green dress trying on hats.",
				"width": 5003,
				"lqip": "data:image/gif;base64,R0lGODlhBgAFAPQAAEMtIk40KE83KlhHLVxELlNPN1hLMVJOP19UN1dYM1lUOVpUP2dAIWlKKHZKKXZLKWRNPGpbMGpaNGtaOkxUTF9dRlJaS15YSV5kUnZpRH12W4ZkM49uRI52VQAAAAAAACH5BAAAAAAALAAAAAAGAAUAAAUY4AUtFWZxHZIdExFEybAJQGE00sNQmqOEADs=",
				"height": 4543
			},
			"api_model": "artworks",
			"is_boosted": true,
			"api_link": "https://api.artic.edu/api/v1/artworks/14572",
			"id": 14572,
			"title": "The Millinery Shop",
			"timestamp": "2025-01-14T23:26:12-06:00"
		}
	],
	"info": {
		"license_text": "The `description` field in this response is licensed under a Creative Commons Attribution 4.0 Generic License (CC-By) and the Terms and Conditions of artic.edu. All other data in this response is licensed under a Creative Commons Zero (CC0) 1.0 designation and the Terms and Conditions of artic.edu.",
		"license_links": [
			"https://creativecommons.org/publicdomain/zero/1.0/",
			"https://www.artic.edu/terms"
		],
		"version": "1.10"
	},
	"config": {
		"iiif_url": "https://www.artic.edu/iiif/2",
		"website_url": "http://www.artic.edu"
	}
}
```

And the output schema is defined as:

```php
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
```

Here we can see at the top level a `path` variable is defined explictly as an array and we are capturing all elements `[*]`. From there the output variables used for each entry are named to match the property names in the JSON. This is a shortcut. This output schemea would also work:

```php
'output_schema' => [
	'is_collection' => true,
	'path' => '$.data[*]',
	'type' => [
		'id' => [
			'name' => 'Art ID',
			'type' => 'id',
		],
		'name' => [
			'path' => '$.title',
			'name' => 'Title',
			'type' => 'string',
		],
	],
],
```

If we wanted to go further and pull out more data from each item, the schema could look like:

```php
'output_schema' => [
	'is_collection' => true,
	'path' => '$.data[*]',
	'type' => [
		'id' => [
			'name' => 'Art ID',
			'type' => 'id',
		],
		'name' => [
			'path' => '$.title',
			'name' => 'Title',
			'type' => 'string',
		],
		'description' => [
			'path' => '$.thumbnail.alt_text',
			'name' => 'Description',
			'type' => 'string',
		],
		'dimensions' => [
			'generate' => function( array $response_data ): string {
				return $response_data['thumbnail']['width'] . '×' . $response_data['thumbnail']['height'];
			},
			'name' => 'Demensions (px)',
			'type' => 'string',
		],

	],
],
```

In this example you can see that `$` in the path is redfined to be the specifc entry in the collection. Similarly the `$response_data` variable contains just this single entry.
````

## File: extending/query-runner.md
````markdown
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
````

## File: extending/query.md
````markdown
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
````

## File: tutorials/bruno-collections/Salesforce D2C APIs.json
````json
{
  "name": "Salesforce D2C APIs",
  "version": "1",
  "items": [
    {
      "type": "http",
      "name": "Auth",
      "seq": 2,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/oauth2/token?grant_type=client_credentials&client_id=<client-id>&client_secret=<client-secret>",
        "method": "POST",
        "headers": [
          {
            "name": "Content-Type",
            "value": "application/x-www-form-urlencoded",
            "enabled": true
          }
        ],
        "params": [
          {
            "name": "grant_type",
            "value": "client_credentials",
            "type": "query",
            "enabled": true
          },
          {
            "name": "client_id",
            "value": "<client-id>",
            "type": "query",
            "enabled": true
          },
          {
            "name": "client_secret",
            "value": "<client-secret>",
            "type": "query",
            "enabled": true
          }
        ],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "none"
        }
      }
    },
    {
      "type": "http",
      "name": "Products",
      "seq": 3,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/products?skus=6010009",
        "method": "GET",
        "headers": [],
        "params": [
          {
            "name": "skus",
            "value": "6010009",
            "type": "query",
            "enabled": true
          }
        ],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Product",
      "seq": 4,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/products?skus=6010053",
        "method": "GET",
        "headers": [],
        "params": [
          {
            "name": "skus",
            "value": "6010053",
            "type": "query",
            "enabled": true
          }
        ],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Search",
      "seq": 5,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/search/products?searchTerm=Energy",
        "method": "GET",
        "headers": [],
        "params": [
          {
            "name": "searchTerm",
            "value": "Energy",
            "type": "query",
            "enabled": true
          }
        ],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Check Token",
      "seq": 6,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/oauth2/introspect",
        "method": "POST",
        "headers": [
          {
            "name": "Content-Type",
            "value": "application/x-www-form-urlencoded",
            "enabled": true
          }
        ],
        "params": [],
        "body": {
          "mode": "json",
          "json": "token=<token>&client_id=<client-id>&client_secret=<client-secret>",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "none"
        }
      }
    },
    {
      "type": "http",
      "name": "StoreLookup",
      "seq": 7,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/query/?q=SELECT name,id from webstore",
        "method": "GET",
        "headers": [],
        "params": [
          {
            "name": "q",
            "value": "SELECT name,id from webstore",
            "type": "query",
            "enabled": true
          }
        ],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Start Cart",
      "seq": 8,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/carts/current",
        "method": "GET",
        "headers": [],
        "params": [],
        "body": {
          "mode": "none",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Add to Cart",
      "seq": 9,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/carts/0a6Ws000001MUGbIAO/cart-items",
        "method": "POST",
        "headers": [],
        "params": [],
        "body": {
          "mode": "json",
          "json": "{\n  \"quantity\": 2,\n  \"type\": \"Product\",\n  \"productId\":\"01tWs000005QwjpIAC\"\n}",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Update Cart",
      "seq": 10,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/carts/0a6Ws000001MUGbIAO/cart-items/0a9Ws000002aFx3IAE",
        "method": "PATCH",
        "headers": [],
        "params": [],
        "body": {
          "mode": "json",
          "json": "{\n  \"quantity\": 1\n}",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Get Cart Items",
      "seq": 11,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/carts/0a6Ws000001MUGbIAO/cart-items",
        "method": "GET",
        "headers": [],
        "params": [],
        "body": {
          "mode": "json",
          "json": "",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    },
    {
      "type": "http",
      "name": "Delete Cart Item",
      "seq": 12,
      "request": {
        "url": "https://<salesforce-url>.my.salesforce.com/services/data/v63.0/commerce/webstores/0ZEWs000001OtArOAK/carts/0a6Ws000001MUGbIAO/cart-items/0a9Ws000002aFx3IAE",
        "method": "DELETE",
        "headers": [],
        "params": [],
        "body": {
          "mode": "json",
          "json": "",
          "formUrlEncoded": [],
          "multipartForm": []
        },
        "script": {},
        "vars": {},
        "assertions": [],
        "tests": "",
        "docs": "",
        "auth": {
          "mode": "bearer",
          "bearer": {
            "token": ""
          }
        }
      }
    }
  ],
  "environments": [],
  "brunoConfig": {
    "version": "1",
    "name": "Salesforce D2C APIs",
    "type": "collection",
    "ignore": [ "node_modules", ".git" ]
  }
}
````

## File: tutorials/airtable.md
````markdown
# Create an Airtable remote data block

This tutorial will walk you through connecting an [Airtable](https://airtable.com/) data source and how to use the automatically created block in the WordPress editor.

## Base and personal access token

First, identify an Airtable base and table that you want to use as a data source. This example uses a base created from the default [“Event planning” template](https://www.airtable.com/templates/event-planning/exppdJtYjEgfmd6Sq), accessible from the Airtable home screen after logging in. We will target the “Schedule” table from that base.

<p><img width="375" alt="airtable-template" src="https://github.com/user-attachments/assets/a5be04c6-d72c-4cf2-9e62-814af54f9a35"></p>

Next, [create a personal access token](https://airtable.com/create/tokens) that has the `data.records:read` and `schema.bases:read` scopes and has access to the base or bases you wish to use.

<p><img width="939" alt="create-pat" src="https://github.com/user-attachments/assets/16b43ea3-ebf9-4904-8c65-a3040de902d4"></p>

You should not commit this token directly to your code or share it publicly. The Remote Data Blocks plugin stores the token in the WordPress database.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Airtable" from the dropdown menu as the data source type.
4. Name this data source. This name is only used for display purposes.
5. Enter the access token you created in Airtable.

If the personal access token is correct, you will be able to proceed to the other steps. If you receive an error, check the token and try again.

6. Select your desired base and tables.
7. Save the data source and return the data source list.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

<video src="https://github.com/user-attachments/assets/67f22710-b1bd-4f2c-a410-2e20fe27b348"></video>

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Airtable integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/airtable/events) will replicate what we've done in this tutorial.
````

## File: tutorials/google-sheets.md
````markdown
# Create a Google Sheets remote data block

This tutorial will walk you through connecting a [Google Sheets](https://workspace.google.com/products/sheets/) data source and how to use the automatically created block in the WordPress editor.

## Google Sheets API Access

Google Sheets API access is required to connect to Google Sheets. The plugin uses a [service account](https://cloud.google.com/iam/docs/service-account-overview?hl=en) to authenticate requests to the Google Sheets API. The following steps are required to set up Google Sheets API access:

- [Create a project](https://developers.google.com/workspace/guides/create-project) in Google Cloud Platform. `resourcemanager.projects.create` permission is needed to create a new project. You can skip this step if you already have a project available in your organization via the Google Cloud Platform.
- Enable the Google [Sheets API](https://console.cloud.google.com/apis/library/sheets.googleapis.com) and [Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) (required for listing spreadsheets) for your project. You can access these from the links above or by clicking "Enabled APIs & services" in the left-hand menu and then "+ ENABLE APIS AND SERVICES" at the top center of the screen.
- [Create a service account](https://cloud.google.com/iam/docs/service-accounts-create), which will be used to authenticate the requests to the Google Sheets API. You will need to enable the IAM API first, and then if you scroll down further on the page linked above, you can click the button to "Go to Create service account."
- Select the "Owner" role and note the service account email address.
- You will need to create the JSON key for this account. You can access the key by clicking on the three dots under Actions in the Service account table and choosing "Manage Keys."
  ![Screenshot showing a portion of the Google Console](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/tutorials/google-console.png)
- Click on "Add Key" and choose the JSON type. The file will be automatically downloaded. Keep this file safe, as it will be used to authenticate the block.
- Grant access to the service account email to the Google Sheet. The service account will authenticate the requests to the Google Sheets API for the given sheet.

## Setting up the Google Sheet

- Identify the Google Sheet that you want to connect to.
- Share the Google Sheet with the service account email address you noted above. Viewer access is sufficient.
- Note down the Google Sheet ID from the URL. For example, in the URL `https://docs.google.com/spreadsheets/d/test_spreadsheet_id/edit?gid=0#gid=0`, the Google Sheet ID is `test_spreadsheet_id`. The Google Sheet ID is the unique identifier for the Google Sheet.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Google Sheets" from the dropdown menu as the data source type.
4. Name this data source (this name is only used internally).
5. Enter the contents of the JSON file you downloaded.

If the credentials are correct, you will be able to proceed to the other steps. If you receive an error, check the token and try again.

6. Select your desired spreadsheet and sheets.
7. Save the data source and return the data source list.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four. You will notice both a loop and a single block are available.

The loop block will return all the entries in the spreadsheet.

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Google Sheets integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/google-sheets/westeros-houses) will replicate what we've done in this tutorial.
````

## File: tutorials/http.md
````markdown
# Create a remote data block using an HTTP data source

This page will walk you through registering a remote data block that loads data from a Zip code REST API. It will require you to commit code to a WordPress theme or plugin.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "HTTP" from the dropdown menu as the data source type.
4. Fill in the following details:
   - Data Source Name: Zip Code API
   - URL: https://api.zippopotam.us/us/
5. If your API requires authentication, enter those details. This API does not.
6. Save the data source and return the data source list.
7. In the Actions column, click the three-dot menu, then "Copy UUID" to copy the data source's UUID to your clipboard.

## Register the block

In code, we'll define a query using the data source we just created. We'll use the UUID we copied from the configuration page to reference the data source in our query.

```php
$data_source = HttpDataSource::from_uuid( $uuid );

$query = HttpQuery::from_array( [
   'data_source' => $data_source,
   'endpoint' => function ( array $input_variables ) use ( $data_source ): string {
		return $data_source->get_endpoint() . $input_variables['foo'];
   },
   'input_schema' => [ ... ],
   'output_schema' => [ ... ],
] );
```

And then register a block using the query.

```php
register_remote_data_block( [
   'title' => 'Block Title',
   'render_query' => [
      'query' => $query,
   ],
] );
```

Check out [a working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/rest-api/zip-code) of the concepts above in the Remote Data Blocks GitHub repository.

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure HTTP integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/rest-api/zip-code) will replicate what we've done in this tutorial.
````

## File: tutorials/index.md
````markdown
# Tutorials

This section will guide you through configuring data sources in the plugin UI and via code.

- [Airtable](airtable.md)
- [Google Sheets integration](google-sheets.md)
- [HTTP](http.md)
- [Salesforce Commerce D2C](salesforce-commerce.md)
- [Shopify](shopify.md)
````

## File: tutorials/salesforce-commerce.md
````markdown
# Create a Salesforce Commerce D2C remote data block

This tutorial will walk you through connecting a [Salesforce Commerce D2C](https://developer.salesforce.com/docs/commerce/salesforce-commerce/guide) data source and how to use the automatically created block in the WordPress editor.

## Salesforce Commerce D2C API Access

We have provided a pre-configured Bruno Collection for interacting with the Salesforce Commerce D2C APIs. These are located [here](../bruno-collections/Salesforce D2C APIs.json). These can be imported into the [Bruno API Client](https://www.usebruno.com/docs/api-client/introduction) to interact with the APIs.

In order to use the collection, you will need to provide the following variables:

- `salesforce domain`
- `client_id`
- `client_secret`

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Salesforce Commerce D2C" from the dropdown menu as the data source type.
4. Name the data source. This name is only used for display purposes.
5. Provide the Salesforce Commerce domain.
6. Provide the client ID and the client secret. Ensure these are correct or else authentication will fail.
7. Click Continue.
8. The stores for the provided domain will be listed. Select the store you wish to use.
9. Click Continue.
10. If you wish to have the blocks automatically be registered, ensure the `Auto-generate blocks` checkbox is checked.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Salesforce Commerce D2C integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.
````

## File: tutorials/shopify.md
````markdown
# Create a Shopify remote data block

This tutorial will walk you through connecting a [Shopify](https://www.shopify.com/) data source and how to use the automatically created block in the WordPress editor.

## Shopify API Access

To use the Shopify data source, you need to have an access token. You can create one by following these steps:

1. Login to your Shopify admin account.
2. Click "Apps" in the left sidebar.
3. Click "Apps and sales channels" in the dropdown menu.
4. Click "Develop apps".
5. Click "Create an app".
6. Give the app a name and click "Create app".
7. Give the app `unauthenticated_read_product_listings` permissions and click "Install".
8. Copy the access token from the "API Credentials" section.

## Create the data source

1. Go to Settings > Remote Data Blocks in your WordPress admin.
2. Click on the "Connect new" button.
3. Choose "Shopify" from the dropdown menu as the data source type.
4. Name the data source. This name is only used for display purposes.
5. Enter the subdomain of your Shopify store. To find this, log into Shopify, the subdomain of your store is the portion of the URL before `myshopify.com`.
6. Enter your access token.

If the credentials are correct, you can save the data source. If you receive an error, check the token and try again.

## Insert the block

Create or edit a page or post, then using the Block Inserter, search for the block using the name you provided in step four.

![How inserting a Shopify block looks in the WordPress Editor](https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/docs/tutorials/insert-shopify-block.gif)

## Patterns and styling

You can use patterns to create a consistent, reusable layout for your remote data. You can read more about [patterns and other Core Concepts](../concepts/index.md#patterns).

Remote data blocks can be styled using the block editor's style settings, `theme.json`, or custom stylesheets. See the [example child theme](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/theme) for more details.

## Code reference

You can also configure Shopify integrations with code. These integrations appear in the WordPress admin but can not be modified. You may wish to do this to have more control over the data source or because you have more advanced data processing needs.

This [working example](https://github.com/Automattic/remote-data-blocks/tree/trunk/example/shopify/product) will replicate what we've done in this tutorial.
````

## File: index.md
````markdown
# Documentation

For plugin overview and getting started guide, see [README](../README.md).

## Table of Contents

- [Quickstart](quickstart.md)
- [Core Concepts](concepts/index.md)

  - [Block Bindings](concepts/block-bindings.md)
  - [Helper Blocks](concepts/helper-blocks.md)
  - [Field Shortcodes](concepts/field-shortcodes.md)

- [Extending](extending/index.md)

  - [Data Source](extending/data-source.md)
  - [Query](extending/query.md)
  - [Block Registration](extending/block-registration.md)
  - [Block Patterns](extending/block-patterns.md)
  - [Overrides](extending/overrides.md)
  - [Hooks](extending/hooks.md)
  - [Query Runner](extending/query-runner.md)

- [Tutorials](tutorials/index.md)

  - [Airtable](tutorials/airtable.md)
  - [Google Sheets integration](tutorials/google-sheets.md)
  - [HTTP](tutorials/http.md)
  - [Salesforce Commerce D2C](tutorials/salesforce-commerce.md)
  - [Shopify](tutorials/shopify.md)

- [Development](local-development.md)
- [Troubleshooting](troubleshooting.md)
- [Releasing](releasing.md)

## Additional Documentation

- [AI Documentation](ai.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Security Policy](../SECURITY.md)
- [Code of Conduct](https://make.wordpress.org/handbook/community-code-of-conduct/)
````

## File: local-development.md
````markdown
# Local Development

This repository includes tools for starting a local development environment using [`@wordpress/env`](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/), which requires Docker and Docker Compose.

## Set up

Clone this repository and install Node.js and PHP dependencies:

```sh
npm install
composer install
```

To start a development environment with Xdebug enabled:

```sh
npm run dev
```

This will spin up a WordPress environment and a Valkey (Redis) instance for object cache. It will also build the block editor scripts, watch for changes, and open a Node.js debugging port. The WordPress environment will be available at `http://localhost:8888` (admin user: `admin`, password: `password`).

Stop the development environment with `Ctrl+C` and resume it by running the same command. You can also manually stop the environment with `npm run dev:stop`. Stopping the environment optionally stops the WordPress containers but preserves their state.

### Testing

Run unit tests:

```sh
npm run test
```

For e2e tests, ensure the development environment is running, then execute:

```sh
npm run test:e2e
```

### Logs

Watch logs from the WordPress container:

```sh
npx wp-env logs
```

### WP-CLI

Run WP-CLI commands:

```sh
npm run wp-cli option get siteurl
```

### Destroy

Destroy your local environment and irreversibly delete all content, configuration, and data:

```sh
npm run dev:destroy
```

## Local playground

While not suitable for local developement, it can sometimes be useful to quickly spin up a local WordPress playground using `@wp-now/wp-now`:

```sh
npm run build # or `npm start` in a separate terminal
npm run playground
```

Playgrounds do not closely mirror production environments and are missing persistent object cache, debugging tools, and other important features. Use `npm run dev` for local development.
````

## File: quickstart.md
````markdown
# Quickstart

The easiest way to see Remote Data Blocks in action is to launch the plugin in WordPress Playground.

[![Launch in WordPress Playground](https://img.shields.io/badge/Launch%20in%20WordPress%20Playground-DA9A45?style=for-the-badge&logo=wordpress)](https://playground.wordpress.net/?blueprint-url=https://raw.githubusercontent.com/Automattic/remote-data-blocks/trunk/blueprint.json)

However, the more advanced use case is providing your own custom configuration through code. This guide will walk you through the steps to do this.

## Step 1: Install the plugin

Download [the latest release of the plugin](https://github.com/Automattic/remote-data-blocks/releases/latest/download/remote-data-blocks.zip), unzip, and add it to the `plugins/` directory of your WordPress site.

## Step 2: Create a data source

In the WordPress admin, go to **Settings** > **Remote Data Blocks** and click **Connect new**. Give the data source a display name and enter `https://api.zippopotam.us/us/` as the URL. Save the data source.

Back on the data source list, click the three dots on the right of the row for your new data source and copy the UUID.

## Step 3: Copy the zip code data source example

Copy the [zip code data source example](https://github.com/Automattic/remote-data-blocks/blob/trunk/example/rest-api/zip-code/zip-code.php) into your `/plugins` directory, set `EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID` to the UUID copied above and then activate the plugin titled `Zip Code RDB Example`.

## Step 4: Customize the configuration

Try making changes to the configuration. For example, rename the block in the `register_remote_data_block` function call.

## Step 5: Test the block

Go to the page where you want to use the block and add the block to the page. Click `Provide manual input`, enter a US ZIP code and then hit save. Then, choose a pattern to use to display the data on the page.
````

## File: releasing.md
````markdown
# Releasing

## Versioning

Remote Data Blocks uses [Semantic Versioning](https://semver.org/).

## Release process

1. Checkout the `trunk` branch and ensure it is up to date.
2. Run the release script: `./bin/release <major|minor|patch>`
3. Push the new release branch to the remote repository and create a pull request.
4. Merge the pull request into `trunk`.

The release process from there is automated using GitHub Actions and will publish a new release on GitHub if the version has changed.
````

## File: troubleshooting.md
````markdown
# Troubleshooting and debugging

This plugin provides a [local development environment](local-development.md) with built-in debugging tools.

## Query monitor

When the [Query Monitor plugin](https://wordpress.org/plugins/query-monitor/) is installed and activated, Remote Data Blocks will output debugging information to the Query Monitor "Logs" panel, including error details, stack traces, query execution details, and cache hit/miss status.

> [!TIP]
> By default, the block editor is rendered in "Fullscreen mode" which hides the Admin Bar and Query Monitor. Open the three-dot menu in the top-right corner and toggle off "Fullscreen mode", or press `⇧⌥⌘F`.

The provided local development environment includes Query Monitor by default. You can also install it in non-local environments, but be aware that it may expose sensitive information in production environments.

## Debugging

The [local development environment](local-development.md) includes Xdebug for debugging PHP code and a Node.js debugging port for debugging block editor scripts.

## Resetting config

If you need to reset the Remote Data Blocks configuration in your local development environment, you can use WP-CLI to delete the configuration option. This will permanently delete all configuration values, including access tokens and API keys.

```sh
npm run wp-cli option delete remote_data_blocks_config
```
````

## File: airtable/events/README.md
````markdown
# Example: "Event Planning" Airtable blocks

This example registers remote data blocks for an Airtable base that contains information about conference events. This base was created from the official ["Event Planning" template](https://www.airtable.com/templates/event-planning/expKIiL87pUceFRjc) provided by Airtable.

For most use cases, you can register these blocks [without writing any code](../../../docs/tutorials/airtable.md). However, if you want to customize the block output or behavior, registering these blocks in code can give you more flexibility.
````

## File: airtable/events/register.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\Events;

use RemoteDataBlocks\Integrations\Airtable\AirtableDataSource;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;

function register_airtable_events_block(): void {
	if ( ! defined( 'EXAMPLE_AIRTABLE_EVENTS_ACCESS_TOKEN' ) ) {
		return;
	}

	$access_token = constant( 'EXAMPLE_AIRTABLE_EVENTS_ACCESS_TOKEN' );
	$base_id = 'appVQ2PAl95wQSo9S'; // Airtable base ID
	$table_id = 'tblyGtuxblLtmoqMI'; // Airtable table ID

	// Define the data source
	$airtable_data_source = AirtableDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'access_token' => $access_token,
			'base' => [
				'id' => $base_id,
				'name' => 'Conference Events',
			],
			'display_name' => 'Conference Events',
			'tables' => [
				[
					'id' => $table_id,
					'name' => 'Conference Events',
					'output_query_mappings' => [
						[
							'key' => 'record_id',
							'name' => 'ID',
							'path' => '$.id',
							'type' => 'id',
						],
						[
							'key' => 'title',
							'name' => 'Title',
							'path' => '$.fields.Activity',
							'type' => 'string',
						],
						[
							'key' => 'type',
							'name' => 'Type',
							'path' => '$.fields.Type',
							'type' => 'string',
						],
						[
							'key' => 'location',
							'name' => 'Location',
							'path' => '$.fields.Location',
							'type' => 'string',
						],
						[
							'key' => 'notes',
							'name' => 'Notes',
							'path' => '$.fields.Notes',
							'type' => 'string',
						],
					],
				],
			],
		],
	] );

	AirtableIntegration::register_blocks_for_airtable_data_source( $airtable_data_source );
	AirtableIntegration::register_loop_blocks_for_airtable_data_source( $airtable_data_source );
}

add_action( 'init', __NAMESPACE__ . '\\register_airtable_events_block' );
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/block.json
````json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "example/leaflet-map",
  "version": "1.0.0",
  "title": "Leaflet Map",
  "category": "widgets",
  "icon": "location-alt",
  "example": {},
  "supports": {
    "html": false
  },
  "textdomain": "remote-data-blocks-examples",
  "editorScript": [
    "file:./index.js",
    "leaflet-script"
  ],
  "editorStyle": [
    "leaflet-style"
  ],
  "render": "file:./render.php",
  "viewScript": [
    "file:./view.js",
    "leaflet-script"
  ],
  "viewStyle": [
    "leaflet-style"
  ]
}
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/index.asset.php
````php
<?php return array('dependencies' => array('wp-blocks', 'wp-dom-ready', 'wp-element', 'wp-server-side-render'), 'version' => '5d1f10b97d60c293e33d');
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/index.js
````javascript
(()=>{"use strict";var e={955:(e,t,a)=>{a.d(t,{Y:()=>o});const r=window.wp.domReady;function o(e){e.forEach((e=>{const t=e?.dataset.mapCoordinates??"";let a=[];try{a=JSON.parse(t)??[]}catch(e){}delete e.dataset.mapCoordinates;const r=leaflet.map(e).setView([a[0].x,a[0].y],25),o=leaflet.layerGroup().addTo(r);leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:4}).addTo(r),a.filter((e=>e.x&&e.y)).forEach((e=>{leaflet.marker([e.x,e.y],{title:e.name}).addTo(o)})),r.flyTo([a[0].x,a[0].y])}))}a.n(r)()((()=>{o(document.querySelectorAll(".wp-block-example-leaflet-map[data-map-coordinates]"))}))}},t={};function a(r){var o=t[r];if(void 0!==o)return o.exports;var l=t[r]={exports:{}};return e[r](l,l.exports,a),l.exports}a.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return a.d(t,{a:t}),t},a.d=(e,t)=>{for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},a.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);const r=window.wp.blocks,o=JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"example/leaflet-map","version":"1.0.0","title":"Leaflet Map","category":"widgets","icon":"location-alt","example":{},"supports":{"html":false},"textdomain":"remote-data-blocks-examples","editorScript":["file:./index.js","leaflet-script"],"editorStyle":["leaflet-style"],"render":"file:./render.php","viewScript":["file:./view.js","leaflet-script"],"viewStyle":["leaflet-style"]}'),l=window.wp.element,n=window.wp.serverSideRender;var s=a.n(n),c=a(955);(0,r.registerBlockType)(o.name,{...o,edit:function(){return(0,l.useEffect)((()=>{const e=document.querySelector('iframe[name="editor-canvas"]')?.contentDocument??document,t=setInterval((()=>{const a=e.querySelector(".wp-block-example-leaflet-map[data-map-coordinates]");a&&((0,c.Y)([a]),clearInterval(t))}),100);return()=>clearInterval(t)}),[]),React.createElement(s(),{block:o.name})},save:()=>null})})();
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/render.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\LeafletMap;

use RemoteDataBlocks\Integrations\Airtable\AirtableDataSource;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;

$access_token = constant( 'EXAMPLE_AIRTABLE_LEAFLET_MAP_ACCESS_TOKEN' );
$base_id = 'appqI3sJ9R2NcML8Y';
$table_id = 'tblc82R9msH4Yh6ZX';

$table = [
	'id' => $table_id,
	'name' => 'Map locations',
	'output_query_mappings' => [
		[
			'key' => 'id',
			'name' => 'ID',
			'path' => '$.id',
			'type' => 'id',
		],
		[
			'key' => 'name',
			'name' => 'Location name',
			'path' => '$.fields.Name',
			'type' => 'string',
		],
		[
			'key' => 'x',
			'name' => 'Latitude',
			'path' => '$.fields.x',
			'type' => 'number',
		],
		[
			'key' => 'y',
			'name' => 'Longitude',
			'path' => '$.fields.y',
			'type' => 'number',
		],
	],
];

$map_data_source = AirtableDataSource::from_array( [
	'service_config' => [
		'__version' => 1,
		'access_token' => $access_token,
		'base' => [
			'id' => $base_id,
			'name' => 'Map locations',
		],
		'display_name' => 'Map locations',
		'tables' => [ $table ],
	],
] );

$get_locations_query = AirtableIntegration::get_list_query( $map_data_source, $table );
$response = $get_locations_query->execute( [] );
$coordinates = [];

if ( ! is_wp_error( $response ) ) {
	$coordinates = array_map( function ( $value ) {
		$result = $value['result'];
		return [
			'name' => $result['name']['value'],
			'x' => $result['x']['value'],
			'y' => $result['y']['value'],
		];
	}, $response['results'] );
}

?>
<div
	<?php echo get_block_wrapper_attributes(); ?>
	data-map-coordinates="<?php echo( esc_attr( wp_json_encode( $coordinates ) ) ); ?>"
	style="height: 400px;"
>
</div>
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/view.asset.php
````php
<?php return array('dependencies' => array('wp-dom-ready'), 'version' => '5f60017d131145c81278');
````

## File: airtable/leaflet-map/build/blocks/leaflet-map/view.js
````javascript
(()=>{"use strict";var e={n:t=>{var a=t&&t.__esModule?()=>t.default:()=>t;return e.d(a,{a}),a},d:(t,a)=>{for(var o in a)e.o(a,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:a[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.wp.domReady;e.n(t)()((()=>{document.querySelectorAll(".wp-block-example-leaflet-map[data-map-coordinates]").forEach((e=>{const t=e?.dataset.mapCoordinates??"";let a=[];try{a=JSON.parse(t)??[]}catch(e){}delete e.dataset.mapCoordinates;const o=leaflet.map(e).setView([a[0].x,a[0].y],25),r=leaflet.layerGroup().addTo(o);leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:4}).addTo(o),a.filter((e=>e.x&&e.y)).forEach((e=>{leaflet.marker([e.x,e.y],{title:e.name}).addTo(r)})),o.flyTo([a[0].x,a[0].y])}))}))})();
````

## File: airtable/leaflet-map/src/blocks/leaflet-map/block.json
````json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "example/leaflet-map",
  "version": "1.0.0",
  "title": "Leaflet Map",
  "category": "widgets",
  "icon": "location-alt",
  "example": {},
  "supports": {
    "html": false
  },
  "textdomain": "remote-data-blocks-examples",
  "editorScript": [ "file:./index.js", "leaflet-script" ],
  "editorStyle": [ "leaflet-style" ],
  "render": "file:./render.php",
  "viewScript": [ "file:./view.js", "leaflet-script" ],
  "viewStyle": [ "leaflet-style" ]
}
````

## File: airtable/leaflet-map/src/blocks/leaflet-map/edit.js
````javascript
import { useEffect } from '@wordpress/element';
import ServerSideRender from '@wordpress/server-side-render';

import metadata from './block.json';
import { initMaps } from './view';

/* global document */

/**
 * The map elements are rendered differently in the block editor vs the WordPress
 * frontend. This hook handles the differences.
 */
function useMapInit() {
	useEffect( () => {
		// In the block editor, the document can be iframed.
		const parentDocument =
			document.querySelector( 'iframe[name="editor-canvas"]' )?.contentDocument ?? document;

		// Use an interval to make sure we get elements that might arrive "late" due
		// to client-side rendering or because they are rendered in the block editor.
		//
		// Using `ServerSideRender` allows us to rely on the markup generated by
		// `render.php`, which is good. But we don't have a way to know when the
		// render is finished, so we need to poll.
		const timer = setInterval( () => {
			const mapElement = parentDocument.querySelector(
				'.wp-block-example-leaflet-map[data-map-coordinates]'
			);

			if ( mapElement ) {
				initMaps( [ mapElement ] );
				clearInterval( timer );
			}
		}, 100 );

		return () => clearInterval( timer );
	}, [] );
}

export function Edit() {
	useMapInit();

	// ServerSideRender allows us to reuse the markup generated by `render.php`
	// instead of duplicating the rendering logic in JavaScript.
	return <ServerSideRender block={ metadata.name } />;
}
````

## File: airtable/leaflet-map/src/blocks/leaflet-map/index.js
````javascript
/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import { Edit } from './edit';

registerBlockType( metadata.name, {
	...metadata,
	edit: Edit,
	save: () => null, // A pure dynamic block only serializes its attributes.
} );
````

## File: airtable/leaflet-map/src/blocks/leaflet-map/render.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\LeafletMap;

use RemoteDataBlocks\Integrations\Airtable\AirtableDataSource;
use RemoteDataBlocks\Integrations\Airtable\AirtableIntegration;

$access_token = constant( 'EXAMPLE_AIRTABLE_LEAFLET_MAP_ACCESS_TOKEN' );
$base_id = 'appqI3sJ9R2NcML8Y';
$table_id = 'tblc82R9msH4Yh6ZX';

$table = [
	'id' => $table_id,
	'name' => 'Map locations',
	'output_query_mappings' => [
		[
			'key' => 'id',
			'name' => 'ID',
			'path' => '$.id',
			'type' => 'id',
		],
		[
			'key' => 'name',
			'name' => 'Location name',
			'path' => '$.fields.Name',
			'type' => 'string',
		],
		[
			'key' => 'x',
			'name' => 'Latitude',
			'path' => '$.fields.x',
			'type' => 'number',
		],
		[
			'key' => 'y',
			'name' => 'Longitude',
			'path' => '$.fields.y',
			'type' => 'number',
		],
	],
];

$map_data_source = AirtableDataSource::from_array( [
	'service_config' => [
		'__version' => 1,
		'access_token' => $access_token,
		'base' => [
			'id' => $base_id,
			'name' => 'Map locations',
		],
		'display_name' => 'Map locations',
		'tables' => [ $table ],
	],
] );

$get_locations_query = AirtableIntegration::get_list_query( $map_data_source, $table );
$response = $get_locations_query->execute( [] );
$coordinates = [];

if ( ! is_wp_error( $response ) ) {
	$coordinates = array_map( function ( $value ) {
		$result = $value['result'];
		return [
			'name' => $result['name']['value'],
			'x' => $result['x']['value'],
			'y' => $result['y']['value'],
		];
	}, $response['results'] );
}

?>
<div
	<?php echo get_block_wrapper_attributes(); ?>
	data-map-coordinates="<?php echo( esc_attr( wp_json_encode( $coordinates ) ) ); ?>"
	style="height: 400px;"
>
</div>
````

## File: airtable/leaflet-map/src/blocks/leaflet-map/view.js
````javascript
import domReady from '@wordpress/dom-ready';

/* global document, leaflet */

export function initMaps( mapElements ) {
	mapElements.forEach( element => {
		const data = element?.dataset.mapCoordinates ?? '';

		let coordinates = [];
		try {
			coordinates = JSON.parse( data ) ?? [];
		} catch ( error ) {}

		delete element.dataset.mapCoordinates;

		const map = leaflet.map( element ).setView( [ coordinates[ 0 ].x, coordinates[ 0 ].y ], 25 );
		const layerGroup = leaflet.layerGroup().addTo( map );

		leaflet
			.tileLayer( 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 4 } )
			.addTo( map );

		coordinates
			.filter( location => location.x && location.y )
			.forEach( location => {
				leaflet.marker( [ location.x, location.y ], { title: location.name } ).addTo( layerGroup );
			} );

		map.flyTo( [ coordinates[ 0 ].x, coordinates[ 0 ].y ] );
	} );
}

// When the document is ready, find all maps and initialize them with Leaflet.
domReady( () => {
	initMaps( document.querySelectorAll( '.wp-block-example-leaflet-map[data-map-coordinates]' ) );
} );
````

## File: airtable/leaflet-map/README.md
````markdown
# Example: "Leaflet Map" block

This example illustrates the flexibility of the Remote Data Blocks plugin. Instead of registering a block via `register_remote_data_block`, this example builds a custom dynamic block that uses the [Leaflet library](https://leafletjs.com) to display a map with marked locations.

The map locations are loaded from an Airtable base that contains longitude and latitude coordinates. Instead of using block bindings, this example creates a data source and a query and executes it manually in `render.php`.

The result is a registered "Leaflet Map" block that renders remote data in the block editor and on the WordPress frontend.

<p><img width="700" alt="A Leaflet Map block in the block editor" src="https://github.com/user-attachments/assets/25f23e1a-2088-4b7e-896a-781c656294a5" /></p>

<p><img width="700" alt="A Leaflet Map block in the WordPress frontend" src="https://github.com/user-attachments/assets/979e60ae-c5f4-47f4-8cd8-69c5d3fa2c52" /></p>

## Build step

Because the custom block uses JSX, it requires a build step, which is provided by this repository. You can rebuild the example after changes by running `npm run build:examples`.

If you copy this example code to your own repository, we recommend using [the `@wordpress/create-block` utility](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-create-block/) to scaffold your custom block and configure the build step.
````

## File: airtable/leaflet-map/register.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Airtable\LeafletMap;

function register_leaflet_map_block(): void {
	// If the access token is not provided via a constant, do not register the block.
	if ( ! defined( 'EXAMPLE_AIRTABLE_LEAFLET_MAP_ACCESS_TOKEN' ) ) {
		return;
	}

	// Register the Leaflet script and stylesheet. The handles are referenced in
	// `block.json` for use in the block editor and the WordPress frontend.
	wp_register_style( 'leaflet-style', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', [], '1.9.4' );
	wp_register_script( 'leaflet-script', 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', [], '1.9.4', true );

	// Register the block using the build artifact.
	register_block_type( __DIR__ . '/build/blocks/leaflet-map' );
}
add_action( 'init', __NAMESPACE__ . '\\register_leaflet_map_block' );
````

## File: airtable/leaflet-map/webpack.config.js
````javascript
const { modernize, moduleConfig, scriptConfig } = require( '../../../webpack.utils' );

module.exports = [ modernize( scriptConfig ), modernize( moduleConfig ) ];
````

## File: github/markdown-file/inc/patterns/file-render.html
````html
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group github-file-content">
	<!-- wp:paragraph {"metadata":{"bindings":{"content":{"source":"remote-data/binding","args":{"field":"file_content"}}},"name":"File Content"}} -->
	<p></p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
````

## File: github/markdown-file/github-query-runner.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GitHub;

use RemoteDataBlocks\Config\Query\HttpQueryInterface;
use RemoteDataBlocks\Config\QueryRunner\QueryRunner;
use WP_Error;

defined( 'ABSPATH' ) || exit();

/**
 * Custom query runner that process custom processing for GitHub API responses
 * that return HTML / Markdown instead of JSON. This also provides custom
 * processing to adjust embedded links.
 *
 * Data fetching and caching is still delegated to the parent QueryRunner class.
 */
class GitHubQueryRunner extends QueryRunner {
	private string $default_file_extension = '.md';

	public function execute( HttpQueryInterface $query, array $input_variables ): array|WP_Error {
		$input_variables['file_path'] = $this->ensure_file_extension( $input_variables['file_path'] );

		return parent::execute( $query, $input_variables );
	}

	/**
	 * @inheritDoc
	 *
	 * The API response is raw HTML, so we return an object construct containing
	 * the HTML as a property.
	 */
	protected function deserialize_response( string $raw_response_data, array $input_variables ): array {
		return [
			'content' => $raw_response_data,
			'path' => $input_variables['file_path'],
		];
	}

	private function ensure_file_extension( string $file_path ): string {
		return str_ends_with( $file_path, $this->default_file_extension ) ? $file_path : $file_path . $this->default_file_extension;
	}
}
````

## File: github/markdown-file/markdown-links.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GitHub;

use DOMDocument;
use DOMElement;
use DOMXPath;

/**
 * Updates the relative/absolute markdown links in href attributes.
 * This adjusts the links so they work correctly when the file structure changes.
 * - All relative paths go one level up.
 * - All absolute paths are converted to relative paths one level up.
 * - Handles URLs with fragment identifiers (e.g., '#section').
 * - Removes the '.md' extension from the paths.
 *
 * @param string $html The HTML response data.
 * @param string $current_file_path The current file's path.
 * @return string The updated HTML response data.
 */
function update_markdown_links( string $html, string $current_file_path = '' ): string {
	// Load the HTML into a DOMDocument
	$dom = new DOMDocument();

	// Convert HTML to UTF-8 using htmlspecialchars instead of mb_convert_encoding
	$html = '<?xml encoding="UTF-8">' . $html;

	// Suppress errors due to malformed HTML
	// phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
	@$dom->loadHTML( $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD );

	// Create an XPath to query href attributes
	$xpath = new DOMXPath( $dom );

	// Query all elements with href attributes
	$nodes = $xpath->query( '//*[@href]' );
	foreach ( $nodes as $node ) {
		if ( ! $node instanceof DOMElement ) {
			continue;
		}
		$href = $node->getAttribute( 'href' );

		// Check if the href is non-empty, points to a markdown file, and is a local path
		if ( $href &&
			preg_match( '/\.md($|#)/', $href ) &&
			! preg_match( '/^(https?:)?\/\//', $href )
		) {
			// Adjust the path
			$new_href = adjust_markdown_file_path( $href, $current_file_path );

			// Set the new href
			$node->setAttribute( 'href', $new_href );
		}
	}

	// Save and return the updated HTML
	return $dom->saveHTML();
}


/**
 * Adjusts the markdown file path by resolving relative paths to absolute paths.
 * Preserves fragment identifiers (anchors) in the URL.
 *
 * @param string $path The original path.
 * @param string $current_file_path The current file's path.
 * @return string The adjusted path.
 */
function adjust_markdown_file_path( string $path, string $current_file_path = '' ): string {
	global $post;
	$page_slug = $post->post_name;

	// Parse the URL to separate the path and fragment
	$parts = wp_parse_url( $path );

	// Extract the path and fragment
	$original_path = isset( $parts['path'] ) ? $parts['path'] : '';
	$fragment = isset( $parts['fragment'] ) ? '#' . $parts['fragment'] : '';

	// Get the directory of the current file
	$current_dir = dirname( $current_file_path );

	// Resolve the absolute path based on the current directory
	if ( str_starts_with( $original_path, '/' ) ) {
		// Already an absolute path from root, just remove leading slash
		$absolute_path = ltrim( $original_path, '/' );
	} else {
		// Use realpath to resolve relative paths
		$temp_path = $current_dir . '/' . $original_path;
		$parts = explode( '/', $temp_path );
		$absolute_parts = [];

		foreach ( $parts as $part ) {
			if ( '.' === $part || '' === $part ) {
				continue;
			}
			if ( '..' === $part ) {
				array_pop( $absolute_parts );
			} else {
				$absolute_parts[] = $part;
			}
		}

		$absolute_path = implode( '/', $absolute_parts );
	}

	// Remove the .md extension
	$absolute_path = preg_replace( '/\.md$/', '', $absolute_path );

	// Ensure the path starts with a forward slash and includes the page slug
	return '/' . $page_slug . '/' . $absolute_path . $fragment;
}
````

## File: github/markdown-file/README.md
````markdown
# Example: "GitHub Markdown File" block

This example registers a remote data block that renders a Markdown file from a GitHub repository. This is more than just a theoretical example: We use this code on [remotedatablocks.com](https://remotedatablocks.com) to render the plugin documentation from [Markdown files in this repo](https://github.com/Automattic/remote-data-blocks/tree/trunk/docs)!

## Custom query runner

This plugin expects APIs to return JSON, but we instruct GitHub's API to return HTML (converted from Markdown). To handle this, we provide a custom [query runner](../../../docs/extending/query-runner.md) that wraps the HTML in an object structure.

## Markdown link resolution

The syntax for linking between Markdown files is different from the syntax for linking between HTML pages, so we use a `generate` function in the query's output schema to transform the HTML output and update the links. See `markdown-links.php` if you are interested in how that works.
````

## File: github/markdown-file/register.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GitHub;

use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Integrations\GitHub\GitHubDataSource;

require_once __DIR__ . '/github-query-runner.php';
require_once __DIR__ . '/markdown-links.php';

function register_github_file_as_html_block(): void {
	// Note: This repository is public, so GitHub's API does not require authorization.
	$service_config = [
		'__version' => 1,
		'display_name' => 'Automattic/remote-data-blocks#trunk',
		'ref' => 'trunk',
		'repo_owner' => 'Automattic',
		'repo_name' => 'remote-data-blocks',
	];

	$block_title = sprintf( 'GitHub Markdown File (%s/%s)', $service_config['repo_owner'], $service_config['repo_name'] );
	$file_extension = '.md';
	$github_data_source = GitHubDataSource::from_array( [ 'service_config' => $service_config ] );

	$github_get_file_as_html_query = HttpQuery::from_array( [
		'data_source' => $github_data_source,
		'endpoint' => function ( array $input_variables ) use ( $service_config ): string {
			return sprintf(
				'https://api.github.com/repos/%s/%s/contents/%s?ref=%s',
				$service_config['repo_owner'],
				$service_config['repo_name'],
				$input_variables['file_path'],
				$service_config['ref']
			);
		},
		'input_schema' => [
			'file_path' => [
				'name' => 'File Path',
				'type' => 'string',
			],
		],
		'output_schema' => [
			'is_collection' => false,
			'type' => [
				'file_content' => [
					'name' => 'File Content',
					'generate' => static function ( array $response_data ): string {
						$file_content = $response_data['content'] ?? '';
						$file_path = $response_data['path'] ?? '';

						// Update the markdown links so that they point to the correct location.
						return update_markdown_links( $file_content, $file_path );
					},
					'type' => 'html',
				],
				'file_path' => [
					'name' => 'File Path',
					'path' => '$.path',
					'type' => 'string',
				],
			],
		],
		'request_headers' => [
			// This request header instructs GitHub's API to convert the Markdown to HTML.
			'Accept' => 'application/vnd.github.html+json',
		],
		// A custom query runner allows us to work with raw HTML responses (instead of JSON).
		'query_runner' => new GitHubQueryRunner(),
	] );

	$github_get_list_files_query = HttpQuery::from_array( [
		'data_source' => $github_data_source,
		'input_schema' => [
			'file_extension' => [
				'name' => 'File Extension',
				'type' => 'string',
			],
		],
		'output_schema' => [
			'is_collection' => true,
			'path' => sprintf( '$.tree[?(@.path =~ /\\.%s$/)]', ltrim( $file_extension, '.' ) ),
			'type' => [
				'file_path' => [
					'name' => 'File Path',
					'path' => '$.path',
					'type' => 'string',
				],
				'sha' => [
					'name' => 'SHA',
					'path' => '$.sha',
					'type' => 'string',
				],
				'size' => [
					'name' => 'Size',
					'path' => '$.size',
					'type' => 'integer',
				],
				'url' => [
					'name' => 'URL',
					'path' => '$.url',
					'type' => 'string',
				],
			],
		],
	] );

	register_remote_data_block( [
		'title' => $block_title,
		'render_query' => [
			'query' => $github_get_file_as_html_query,
		],
		'selection_queries' => [
			[
				'query' => $github_get_list_files_query,
				'type' => 'list',
			],
		],
		'overrides' => [
			[
				'name' => 'github_file_path',
				'display_name' => __( 'Use GitHub file path from URL', 'rdb-example' ),
				'help_text' => __( 'Enable this override when using this block on the /gh/ page.', 'rdb-example' ),
			],
		],
		'patterns' => [
			[
				'html' => file_get_contents( __DIR__ . '/inc/patterns/file-render.html' ),
				'role' => 'inner_blocks', // Bypass the pattern selection step.
				'title' => 'GitHub File Render',
			],
		],
	] );
}
add_action( 'init', __NAMESPACE__ . '\\register_github_file_as_html_block' );

function handle_github_file_path_override(): void {
	// This rewrite targets a page with the slug "gh", which must be created.
	add_rewrite_rule( '^gh/(.+)/?', 'index.php?pagename=gh&file_path=$matches[1]', 'top' );

	// Add the "file_path" query variable to the list of recognized query variables.
	add_filter( 'query_vars', function ( array $query_vars ): array {
		$query_vars[] = 'file_path';
		return $query_vars;
	}, 10, 1 );

	// Filter the query input variables to inject the "file_path" value from the
	// URL. Note that the override must match the override name defined in the
	// block registration above.
	add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
		if ( true === in_array( 'github_file_path', $enabled_overrides, true ) ) {
			$file_path = get_query_var( 'file_path' );

			if ( ! empty( $file_path ) ) {
				$input_variables['file_path'] = $file_path;
			}
		}

		return $input_variables;
	}, 10, 2 );
}
add_action( 'init', __NAMESPACE__ . '\\handle_github_file_path_override' );
````

## File: google-sheets/westeros-houses/README.md
````markdown
# Example: "Westeros Houses" blocks

This example registers remote data blocks for a Google Sheet that contains information about [the noble houses of Westeros](https://awoiaf.westeros.org/index.php/Houses_of_Westeros).

Like the [Airtable Events example](../../airtable/events/README.md), you can register these blocks [without writing any code](../../../docs/tutorials/google-sheets.md). However, if you'd like to replicate this code-based example, you'll need to set up a Google Sheet with the required data.

1. [Configure the Google Sheet API Access](../../../docs/tutorials/google-sheets.md).
2. Base64 encode the JSON key file and make it available via the `EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ENCODED_CREDENTIALS` constant.
3. Add a sheet named `Houses` with the follong columns headers in the first row:

- House
- Seat
- Region
- Words
- Sigil

4. Add some data to the sheet.
````

## File: google-sheets/westeros-houses/register.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\GoogleSheets\WesterosHouses;

use RemoteDataBlocks\Config\Query\HttpQuery;
use RemoteDataBlocks\Integrations\Google\Sheets\GoogleSheetsDataSource;

function register_google_sheets_westeros_houses_blocks(): void {
	if ( ! defined( 'EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ENCODED_CREDENTIALS' ) ) {
		return;
	}

	$encoded_credentials = constant( 'EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ENCODED_CREDENTIALS' );
	$spreadsheet_id = '1EHdQg53Doz0B-ImrGz_hTleYeSvkVIk_NSJCOM1FQk0'; // Spreadsheet ID
	$sheet_id = '1'; // Sheet ID / GID
	$sheet_name = 'Houses';
	$credentials = json_decode( base64_decode( $encoded_credentials ), true );

	$westeros_houses_data_source = GoogleSheetsDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'credentials' => $credentials,
			'display_name' => 'Westeros Houses',
			'spreadsheet' => [
				'id' => $spreadsheet_id,
			],
			'sheets' => [
				[
					'id' => $sheet_id,
					'name' => $sheet_name,
					'output_query_mappings' => [],
				],
			],
		],
	] );

	$list_westeros_houses_query = HttpQuery::from_array( [
		'data_source' => $westeros_houses_data_source,
		'endpoint' => sprintf( '%s/values/%s', $westeros_houses_data_source->get_endpoint(), $sheet_name ),
		'output_schema' => [
			'is_collection' => true,
			'path' => '$.values[*]',
			'type' => [
				'row_id' => [
					'name' => 'Row ID',
					'path' => '$.RowId',
					'type' => 'id',
				],
				'house' => [
					'name' => 'House',
					'path' => '$.House',
					'type' => 'string',
				],
				'seat' => [
					'name' => 'Seat',
					'path' => '$.Seat',
					'type' => 'string',
				],
				'region' => [
					'name' => 'Region',
					'path' => '$.Region',
					'type' => 'string',
				],
				'words' => [
					'name' => 'Words',
					'path' => '$.Words',
					'type' => 'string',
				],
				'image_url' => [
					'name' => 'Sigil',
					'path' => '$.Sigil',
					'type' => 'image_url',
				],
			],
		],
		'preprocess_response' => function ( mixed $response_data ): array {
			return GoogleSheetsDataSource::preprocess_list_response( $response_data );
		},
	] );

	$get_westeros_houses_query = HttpQuery::from_array( [
		'data_source' => $westeros_houses_data_source,
		'endpoint' => sprintf( '%s/values/%s', $westeros_houses_data_source->get_endpoint(), $sheet_name ),
		'input_schema' => [
			'row_id' => [
				'name' => 'Row ID',
				'type' => 'id',
			],
		],
		'output_schema' => [
			'type' => [
				'row_id' => [
					'name' => 'Row ID',
					'path' => '$.RowId',
					'type' => 'id',
				],
				'house' => [
					'name' => 'House',
					'path' => '$.House',
					'type' => 'string',
				],
				'seat' => [
					'name' => 'Seat',
					'path' => '$.Seat',
					'type' => 'string',
				],
				'region' => [
					'name' => 'Region',
					'path' => '$.Region',
					'type' => 'string',
				],
				'words' => [
					'name' => 'Words',
					'path' => '$.Words',
					'type' => 'string',
				],
				'image_url' => [
					'name' => 'Sigil',
					'path' => '$.Sigil',
					'type' => 'image_url',
				],
			],
		],
		'preprocess_response' => function ( mixed $response_data, array $input_variables ): array {
			return GoogleSheetsDataSource::preprocess_get_response( $response_data, $input_variables );
		},
	] );

	register_remote_data_block( [
		'title' => 'Westeros House',
		'render_query' => [
			'query' => $get_westeros_houses_query,
		],
		'selection_queries' => [
			[
				'query' => $list_westeros_houses_query,
				'type' => 'list',
			],
		],
		'overrides' => [
			[
				'display_name' => 'Use Westeros House from URL',
				'name' => 'westeros_house',
			],
		],
	] );

	register_remote_data_block( [
		'title' => 'Westeros Houses List',
		'render_query' => [
			'loop' => true,
			'query' => $list_westeros_houses_query,
		],
	] );
}
add_action( 'init', __NAMESPACE__ . '\\register_google_sheets_westeros_houses_blocks' );

function handle_westeros_house_override(): void {
	// This rewrite targets a page with the slug "westeros-houses", which must be created.
	add_rewrite_rule( '^westeros-houses/([^/]+)/?', 'index.php?pagename=westeros-houses&row_id=$matches[1]', 'top' );

	// Add the "file_path" query variable to the list of recognized query variables.
	add_filter( 'query_vars', function ( array $query_vars ): array {
		$query_vars[] = 'row_id';
		return $query_vars;
	}, 10, 1 );

	// Filter the query input variables to inject the "row_id" value from the
	// URL. Note that the override must match the override name defined in the
	// block registration above.
	add_filter( 'remote_data_blocks_query_input_variables', function ( array $input_variables, array $enabled_overrides ): array {
		if ( true === in_array( 'westeros_house', $enabled_overrides, true ) ) {
			$row_id = get_query_var( 'row_id' );

			if ( ! empty( $row_id ) ) {
				$input_variables['row_id'] = $row_id;
			}
		}

		return $input_variables;
	}, 10, 2 );
}
add_action( 'init', __NAMESPACE__ . '\\handle_westeros_house_override' );
````

## File: google-sheets/README.md
````markdown
# Westeros Houses Example Setup

Follow following setup steps to get the Westeros Houses example working:

- [Configure the Google Sheet API Access](../../docs/tutorials/google-sheets.md#google-sheets-api-access) and [Create a new Google Sheet](../../docs/tutorials/google-sheets.md##setting-up-the-google-sheet) by following the steps in the tutorial.
- Add sheet named `Houses` inside the newly created Google Sheet with the follong columns headers in the first row.
  - House
  - Seat
  - Region
  - Words
  - Sigil
- Add some data to the sheet.
- Base64 encode the JSON key file and set it so that its available via `REMOTE_DATA_BLOCKS_EXAMPLE_GOOGLE_SHEETS_WESTEROS_HOUSES_ACCESS_TOKEN` constant.

Now the blocks with name `Westeros House` and `Westeros Houses List` should be available in the editor.
````

## File: rest-api/art-institute/art-institute.php
````php
<?php declare(strict_types = 1);

/**
 * Plugin Name: Art Institute RDB Example
 * Description: Creates a custom block to be used with Remote Data Blocks in order to retrieve artwork from the Art Institute of Chicago.
 * Author: WPVIP
 * Author URI: https://remotedatablocks.com/
 * Text Domain: remote-data-blocks
 * Version: 1.0.0
 * Requires Plugins: remote-data-blocks
 */

namespace RemoteDataBlocks\Example\ArtInstituteOfChicago;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Config\Query\HttpQuery;
use function add_query_arg;

function register_aic_block(): void {
	$aic_data_source = HttpDataSource::from_array([
		'service_config' => [
			'__version' => 1,
			'display_name' => 'Art Institute of Chicago',
			'endpoint' => 'https://api.artic.edu/api/v1/artworks',
			'request_headers' => [
				'Content-Type' => 'application/json',
			],
		],
	]);

	$get_art_query = HttpQuery::from_array([
		'data_source' => $aic_data_source,
		'endpoint' => function ( array $input_variables ) use ( $aic_data_source ): string {
			return sprintf( '%s/%s', $aic_data_source->get_endpoint(), $input_variables['id'] ?? '' );
		},
		'input_schema' => [
			'id' => [
				'name' => 'Art ID',
				'type' => 'id',
			],
		],
		'output_schema' => [
			'is_collection' => false,
			'path' => '$.data',
			'type' => [
				'id' => [
					'name' => 'Art ID',
					'type' => 'id',
				],
				'title' => [
					'name' => 'Title',
					'type' => 'string',
				],
				'image_id' => [
					'name' => 'Image ID',
					'type' => 'id',
				],
				'image_url' => [
					'name' => 'Image URL',
					'generate' => function ( $data ): string {
						return 'https://www.artic.edu/iiif/2/' . $data['image_id'] . '/full/843,/0/default.jpg';
					},
					'type' => 'image_url',
				],
			],
		],
	]);

	$search_art_query = HttpQuery::from_array([
		'data_source' => $aic_data_source,
		'endpoint' => function ( array $input_variables ) use ( $aic_data_source ): string {
			$endpoint = $aic_data_source->get_endpoint();
			$search_terms = $input_variables['search'] ?? '';

			if ( ! empty( $search_terms ) ) {
				$endpoint = add_query_arg( [ 'q' => $search_terms ], $endpoint . '/search' );
			}

			return add_query_arg( [
				'limit' => $input_variables['limit'],
				'page' => $input_variables['page'],
			], $endpoint );
		},
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
		'pagination_schema' => [
			'total_items' => [
				'name' => 'Total items',
				'path' => '$.pagination.total',
				'type' => 'integer',
			],
		],
	]);

	register_remote_data_block([
		'title' => 'Art Institute of Chicago',
		'render_query' => [
			'query' => $get_art_query,
		],
		'selection_queries' => [
			[
				'query' => $search_art_query,
				'type' => 'search',
			],
		],
	]);
}
add_action( 'init', __NAMESPACE__ . '\\register_aic_block' );
````

## File: rest-api/art-institute/README.md
````markdown
# Example: "Art Institute of Chicago" block

This example plugin registers a remote data block representing an artwork from the [Art Institute of Chicago's public API](http://api.artic.edu/docs/). The source is defined in the plugin code directly, as opposed to the in settings screen like the Zip Code example.

To enable it, simply copy the art-institute.php file to your plugins folder and activate it. This will expose a new custom block called `Art Institute of Chicago`
````

## File: rest-api/zip-code/README.md
````markdown
# Example: "Zip Code" block

This example plugin registers a remote data block to represent the city and state from a US ZIP code. The block fetches data from the [Zippopotam.us API](http://www.zippopotam.us/).

When working with REST APIs that do not have a first-class integration (like Airtable, Google Sheets, Shopify, et al.), a common approach is to define a data source on the settings screen and then commit a custom query in code to fetch and process the data.

This example illustrates this approach, and assumes you have configured the data source in the UI and have provided the UUID via the `EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID` constant.

To enable it, simply copy the zipcode.php file to your plugins folder, replace the UUID, and activate it. This will expose a new custom block called `Zip Code'
````

## File: rest-api/zip-code/zip-code.php
````php
<?php declare(strict_types = 1);

/**
 * Plugin Name: Zip Code RDB Example
 * Description: Creates a custom block to be used with Remote Data Blocks in order to retrieve the city and state from a US zip code.
 * Author: WPVIP
 * Author URI: https://remotedatablocks.com/
 * Text Domain: remote-data-blocks
 * Version: 1.0.0
 * Requires Plugins: remote-data-blocks
 */

namespace RemoteDataBlocks\Example\ZipCode;

use RemoteDataBlocks\Config\DataSource\HttpDataSource;
use RemoteDataBlocks\Config\Query\HttpQuery;

define( 'EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID', 'xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxxxxxxx' );

function register_zipcode_block(): void {
	if ( !defined( 'EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID' ) ) {
		return;
	}

	$zipcode_data_source = HttpDataSource::from_uuid( EXAMPLE_ZIP_CODE_DATA_SOURCE_UUID );

	if ( !$zipcode_data_source instanceof HttpDataSource ) {
		return;
	}

	$zipcode_query = HttpQuery::from_array([
		'data_source' => $zipcode_data_source,
		'endpoint' => function ( array $input_variables ) use ( $zipcode_data_source ): string {
			return $zipcode_data_source->get_endpoint() . $input_variables['zip_code'];
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
				'city' => [
					'name' => 'City',
					'path' => '$.places[0]["place name"]',
					'type' => 'string',
				],
				'state' => [
					'name' => 'State',
					'path' => '$.places[0].state',
					'type' => 'string',
				],
			],
		],
	]);

	register_remote_data_block([
		'title' => 'Zip Code',
		'render_query' => [
			'query' => $zipcode_query,
		],
	]);
}
add_action( 'init', __NAMESPACE__ . '\\register_zipcode_block' );
````

## File: shopify/product/README.md
````markdown
# Example: "Shopify Product" block

This example a registers remote data block representing a product from a Shopify store.

Like the [Airtable Events example](../../airtable/events/README.md), you can register these blocks [without writing any code](../../../docs/tutorials/shopify.md). However, if you want to customize the block output or behavior, registering this block in code can give you more flexibility.
````

## File: shopify/product/register.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Shopify;

use RemoteDataBlocks\Integrations\Shopify\ShopifyDataSource;
use RemoteDataBlocks\Integrations\Shopify\ShopifyIntegration;

function register_shopify_block(): void {
	if ( ! defined( 'EXAMPLE_SHOPIFY_ACCESS_TOKEN' ) ) {
		return;
	}

	$access_token = constant( 'EXAMPLE_SHOPIFY_ACCESS_TOKEN' );
	$store_slug = 'stoph-test';

	$shopify_data_source = ShopifyDataSource::from_array( [
		'service_config' => [
			'__version' => 1,
			'access_token' => $access_token,
			'display_name' => 'Shopify Example',
			'store_name' => $store_slug,
		],
	] );

	ShopifyIntegration::register_blocks_for_shopify_data_source( $shopify_data_source );
}
add_action( 'init', __NAMESPACE__ . '\\register_shopify_block' );
````

## File: theme/functions.php
````php
<?php declare(strict_types = 1);

namespace RemoteDataBlocks\Example\Theme;

use function add_action;
use function get_stylesheet_directory_uri;
use function wp_enqueue_style;
use function wp_get_theme;

defined( 'ABSPATH' ) || exit();

/**
 * Enqueue the Remote Data Blocks styles.
 */
function remote_data_blocks_example_theme_enqueue_block_styles(): void {
	wp_enqueue_style(
		'remote-data-blocks-example-theme-style',
		get_stylesheet_directory_uri() . '/style-remote-data-blocks.css',
		[],
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\remote_data_blocks_example_theme_enqueue_block_styles', 15, 0 );
add_action( 'enqueue_block_assets', __NAMESPACE__ . '\\remote_data_blocks_example_theme_enqueue_block_styles', 15, 0 );
````

## File: theme/README.md
````markdown
# Remote Data Blocks Example Theme

This folder contains a simple example theme that provides custom styling of Remote Data Blocks via a `theme.json` file. It is a child theme of `twentytwentyfour` and delegates all rendering to the parent theme.
````

## File: theme/style-remote-data-blocks.css
````css
/**
 * This file may also contain CSS overrides that are difficult or impossible to
 * implement using `theme.json` alone. For example, each bound inner block of a
 * Remote Data Block has a class name corresponding to the field it is bound to.
 *
 * Therefore, a Remote Data Block named "Shopify Product" containing a paragraph
 * block bound to a field named `description` can be targeted with a selector:
 *
 * .wp-block-remote-data-blocks-shopify-product p.rdb-block-data-description {
 *   /* styles here * /
 * }
 */

.wp-block-remote-data-blocks-shopify-product p.rdb-block-data-price {
	font-weight: 700;
}
````

## File: theme/style.css
````css
/*!
 * Theme Name:        Remote Data Blocks Example Theme
 * Description:       Example theme that provides styling for remote data blocks
 * Version:           1.0.0
 * Template:          twentytwentyfour
 * Tags:              remote-data-blocks
 * Text Domain:       remote-data-blocks
 * Tested up to:      6.6
 * Requires at least: 6.6
 * Requires PHP:      8.1
 * License:           GNU General Public License v2.0
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 */

/* This file is not enqueued and exists only to provide the theme manifest. */
````

## File: theme/theme.json
````json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "blocks": {
      "remote-data-blocks/conference-event": {
        "custom": {
          "remote-data-blocks": {}
        }
      }
    }
  },
  "styles": {
    "elements": {},
    "blocks": {
      "remote-data-blocks/conference-event": {
        "color": {
          "background": "#e9c9f9",
          "text": "#290939"
        },
        "css": "& p { margin: 0.25rem 0; }",
        "shadow": "rgb(38, 57, 77) 0px 20px 30px -10px",
        "spacing": {
          "margin": {
            "bottom": "2rem",
            "top": "2rem"
          },
          "padding": {
            "bottom": "1.5rem",
            "left": "1.5rem",
            "right": "1.5rem",
            "top": "1.5rem"
          }
        },
        "typography": {
          "fontFamily": "Inter, Helvetica Neue, Helvetica, Arial, sans-serif",
          "fontSize": "1.25rem"
        },
        "elements": {
          "heading": {
            "border": {
              "bottom": {
                "color": "#593969",
                "style": "solid",
                "width": "3px"
              }
            },
            "color": {
              "text": "#290939"
            },
            "spacing": {
              "margin": {
                "top": "0.5rem"
              },
              "padding": {
                "bottom": "0.5rem"
              }
            },
            "typography": {
              "fontFamily": "Inter, Helvetica Neue, Helvetica, Arial, sans-serif",
              "fontSize": "2rem",
              "fontWeight": "800"
            }
          }
        }
      },
      "remote-data-blocks/shopify-product": {
        "css": "& .wp-block-columns { flex-direction: row-reverse }",
        "spacing": {
          "margin": {
            "bottom": "2rem",
            "top": "2rem"
          },
          "padding": {
            "bottom": "1.5rem",
            "left": "1.5rem",
            "right": "1.5rem",
            "top": "1.5rem"
          }
        },
        "typography": {
          "fontSize": "1rem"
        },
        "elements": {
          "heading": {
            "color": {
              "text": "#290939"
            },
            "spacing": {
              "margin": {
                "top": "0.5rem"
              },
              "padding": {
                "bottom": "0.5rem"
              }
            },
            "typography": {
              "fontFamily": "Helvetica Neue, Helvetica, Arial, sans-serif",
              "fontSize": "1.25rem",
              "fontWeight": "900"
            }
          }
        }
      }
    }
  }
}
````

## File: README.md
````markdown
# Example code

The example code in this directory can help you get started with the Remote Data Blocks plugin. Note that many tasks can be performed in the UI without writing any code. However, other tasks require custom code, especially when you want to work with generic REST APIs or customize the block output or behavior.

## Block examples

- Airtable
  - ["Event Planning" Airtable blocks](./airtable/events/README.md)
  - ["Leaflet Map" Airtable block](./airtable/leaflet-map/README.md)
- Google Sheets
  - ["Westeros Houses" blocks](./google-sheets/westeros-houses/README.md)
- GitHub
  - ["GitHub Markdown File" block](./github/markdown-file/README.md)
- Shopify
  - ["Shopify Product" block](./shopify/product/README.md)
- REST API
  - ["Art Institute of Chicago" block](./rest-api/art-institute/README.md)
  - ["Zip Code" block](./rest-api/zip-code/README.md)

## Theme examples

- [Block theme example](./theme/README.md)
````
