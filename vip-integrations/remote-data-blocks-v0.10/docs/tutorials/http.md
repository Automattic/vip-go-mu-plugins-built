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
