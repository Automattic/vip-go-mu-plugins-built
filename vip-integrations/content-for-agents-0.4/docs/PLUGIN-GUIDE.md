# Plugin guide

This guide describes the public behavior and extension contracts of Content for
Agents. For installation, see the [README](../README.md). For development
setup and checks, see the [contributor guide](https://github.com/Automattic/content-for-agents/blob/trunk/docs/CONTRIBUTING.md).

## Content and discovery

For a published post at `/example/`, the following return the same Markdown:

- `/example.md`
- `/example/markdown` (also accepts a trailing slash)
- `/example/?markdown=true`

Sites using plain permalinks advertise the query-string form instead. Private
content requires permission to read it. Password-protected content requires
the password or edit permission and is excluded from the public featured index.
Authenticated, preview, and password-authorized documents are not stored in the
shared Markdown cache.

Output includes YAML metadata, the title, and converted content. HTML pages
advertise alternate Markdown links and `/llms.txt`. The plugin preserves modern,
nested, and legacy quotes, citations, lists, tables, links, images, and code.
Text and descendants inside an element with `aria-hidden="true"` are excluded;
`aria-hidden="false"` and content without the attribute remain visible.
Unrecognized leaf blocks use HTML conversion; container blocks process children.
Classic Editor and other freeform post HTML use the same HTML conversion path,
so the plugin does not require the Block Editor to be enabled.

`Accept: text/markdown` negotiation is disabled by default. Enable
`CONTENT_FOR_AGENTS_ENABLE_ACCEPT_NEGOTIATION` only after verifying that the
site's cache separates negotiated Markdown from HTML. Discovery and dedicated
URLs do not require it. The existing Content-Signal defaults are retained and
can be configured with the `content_for_agents_content_signal` option.

The plugin uses VIP URL lookup and edge-purge APIs when available, with core
fallbacks for local development. `/llms.txt` is handled during `parse_request`,
without stored rewrite rules or a helper file. WordPress's `robots_txt` filter
adds discovery where the platform permits it; VIP test-domain crawler
restrictions still apply. Actual edge-cache refresh requires deployment
verification.

## Extend the base

All PHP classes live in `Content_For_Agents`. Hook names, options, cache groups,
and the REST namespace use `content_for_agents` / `content-for-agents`.

Register a block callback before `init` priority 5. Integrations should register
block types on `init`, after the plugin has installed its metadata filter:

```php
add_action( 'content_for_agents_register_block_callbacks', static function () {
    \Content_For_Agents\Block_Markdown_Registry::register(
        'example/quote',
        static function ( array $block, \WP_Post $post ): string {
            return '> ' . sanitize_text_field( $block['attrs']['text'] ?? '' );
        }
    );
} );
```

Callbacks receive the parsed block and its post and return Markdown. An empty
string suppresses the block. Registry methods `register()`, `get()`, and `has()`
are public. A later registration for the same block name replaces the earlier
one.

A block can alternatively declare metadata in `block.json`:

```json
{
	"contentForAgents": {
		"callback": "Example\\Markdown::convert"
	}
}
```

The callable must be loaded before conversion. Metadata modes `strip` and
`children-only` take precedence over metadata callbacks; metadata handling takes
precedence over registry callbacks. Registry output then passes through
`content_for_agents_block_{block-name}`. That filter does not run for the
metadata path. Preserve this distinction when adding integrations.

| Extension point                                                       | Contract                                                                                                                                |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `content_for_agents_pre_markdown`                                     | Return `null` to continue, or a string to supply the document body before block conversion. Receives the post.                          |
| `content_for_agents_after_markdown`                                   | Filter the body when serving a document. Direct `post_to_markdown()` calls do not run this filter.                                      |
| `content_for_agents_authors`                                          | Return author entries containing `name` and optional `job_title` and `link`; receives the post.                                         |
| `content_for_agents_frontmatter`                                      | Filter the metadata array; receives the post.                                                                                           |
| `content_for_agents_llms_txt_sections`                                | Append section arrays with `slug`, `title`, `links`, and optional `description`. Duplicate slugs keep the first section.                |
| `content_for_agents_additional_resources_blocks`                      | Filter resource blocks containing `id`, `title`, and `body`.                                                                            |
| `content_for_agents_settings_defaults`                                | Supply defaults for unsaved settings without overwriting saved values.                                                                  |
| `content_for_agents_set_context` / `content_for_agents_clear_context` | Set or clear a conversion context. Read it with `Block_Markdown_Registry::get_context()`. Use `try/finally` to clear it after failures. |

### Common filter examples

Replace the default author byline with provider-neutral post data, or add
frontmatter fields:

```php
add_filter(
	'content_for_agents_authors',
	static function ( array $authors, \WP_Post $post ): array {
		$credit = get_post_meta( $post->ID, 'article_credit', true );

		return is_string( $credit ) && '' !== $credit
			? array( array( 'name' => $credit ) )
			: $authors;
	},
	10,
	2
);

add_filter(
	'content_for_agents_frontmatter',
	static function ( array $data, \WP_Post $post ): array {
		$data['language'] = get_post_meta( $post->ID, 'language', true ) ?: 'en';
		return $data;
	},
	10,
	2
);
```

Append a small link section directly to `/llms.txt`:

```php
add_filter(
	'content_for_agents_llms_txt_sections',
	static function ( array $sections ): array {
		$sections[] = array(
			'slug'  => 'policies',
			'title' => 'Policies',
			'links' => array(
				array(
					'title' => 'Editorial policy',
					'url'   => home_url( '/editorial-policy/' ),
				),
			),
		);
		return $sections;
	}
);
```

Additional resource blocks become subsections under Additional Resources.
Defaults provide editable starter values only when no saved value overrides
them:

```php
add_filter(
	'content_for_agents_additional_resources_blocks',
	static function ( array $blocks ): array {
		$blocks[] = array(
			'id'    => 'help',
			'title' => 'Help',
			'body'  => 'Contact the site team for help using this content.',
		);
		return $blocks;
	}
);

add_filter(
	'content_for_agents_settings_defaults',
	static function ( array $defaults ): array {
		$defaults['site_summary'] = 'A concise description of this site.';
		return $defaults;
	}
);
```

If any of these filters reads data maintained outside the post or plugin
settings, invalidate the affected Markdown documents or `/llms.txt` when that
data changes. Returning different filtered output does not invalidate an
already cached response.

Posts and pages are enabled automatically. Enable a custom post type after it is
registered:

```php
add_action(
	'init',
	static function (): void {
		add_post_type_support( 'book', 'content-for-agents' );
	},
	20
);
```

An integration that owns the post type can instead include
`content-for-agents` in its `register_post_type()` `supports` array. Declare
the separate `content-for-agents-llms-txt` support when changes to that post
type affect content the integration contributes to the index. Provider-specific
data, queries, and dependencies remain outside the base plugin.

### Cache invalidation

When related data changes, integrations identify the affected article IDs and call:

```php
\Content_For_Agents\Markdown_Cache_Invalidator::invalidate_post( $article_id );
\Content_For_Agents\Llms_Txt_Cache_Invalidator::purge_cache();
```

The first call clears the article and its parent, including supported page-cache
purges. Moving a child also clears its former parent. Category/tag edits and
author display-name changes clear affected documents, with the first 100 handled
immediately and further batches scheduled through WordPress for VIP Cron Control.
The 100-document limit bounds each callback's work. VIP queues and deduplicates
URL purge requests; this does not synchronously purge the edge cache. The second
call clears `/llms.txt`. Call before permanent deletion if a purge needs the old
permalink. A callback that only generates different output does not itself
invalidate a previously cached response.

## Metadata and settings contracts

Frontmatter accepts nested PHP arrays (maps or lists), strings, finite numbers,
booleans, and null, with a maximum nesting depth of 32. Empty arrays render as
empty lists. Objects and resources are unsupported. Mapping keys and strings
are quoted; Unicode and escaped line breaks survive a YAML round trip.

Settings defaults are calculated when read. Saving a section stores that
section's overrides without copying defaults or filtered resources from other
sections into the option. The additional-resources filter still represents
integration-maintained output; use the defaults filter for editable starter text.

Content-Signal accepts `yes`/`no`, `true`/`false`, booleans, and `1`/`0` for
`ai-train`, `search`, and `ai-input`. Unknown keys and values are omitted. The
original all-yes defaults remain in place. Legacy settings migration and filter
translation remain outside this base plugin.
