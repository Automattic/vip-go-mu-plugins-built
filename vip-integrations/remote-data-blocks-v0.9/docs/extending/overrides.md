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
