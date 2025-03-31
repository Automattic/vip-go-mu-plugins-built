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
