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
