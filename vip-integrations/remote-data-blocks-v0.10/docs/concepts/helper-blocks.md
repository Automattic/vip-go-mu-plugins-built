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
