# Plugin guide

This guide describes the public behavior and extension contracts of Content for
Agents. For installation, see the [README](../README.md). For development
setup and checks, see the [contributor guide](CONTRIBUTING.md).

The plugin supports WordPress 7.0 or newer and PHP 8.2 or newer. When a VIP
application loader includes it on an unsupported runtime, it leaves its hooks
unregistered and shows an administrator notice.
Markdown and `/llms.txt` responses send `X-Content-Type-Options: nosniff` so
browsers do not interpret agent-facing text as another content type.
The published Markdown can contain editor-authored text and output from trusted
integration callbacks. Consumers that render it as HTML must sanitize the
rendered HTML for their own trust boundary.

## Content and discovery

For a published post at `/example/`, the canonical Markdown URL is
`/example/markdown`, with an optional trailing slash. With WordPress's plain
`?p=123` permalink structure, the canonical Markdown URL is
`?p=123&markdown=true`. Discovery links and `/llms.txt` use the appropriate form
for the active permalink structure. The static front page does not receive an
individual Markdown URL, leaving the root `/markdown` path available for a
normal WordPress page. A `markdown=true` parameter on the static homepage is
ignored, so WordPress continues with its normal HTML response. The page's former
slug does not provide a hidden `/markdown` path. Private content requires
permission to read it.
Password-protected content requires the password or edit permission and is
excluded from the public featured index.
Authenticated and password-authorized documents are not stored in the shared
Markdown cache. The `markdown=true` query endpoint works on published singular
URLs without authentication and is the advertised form under plain permalinks.
Private and other non-public content is served only when WordPress resolves it
as singular and the current user has permission to read it. The endpoint accepts
WordPress preview URLs; WordPress resolves and nonce-validates the preview
revision before the plugin serves it. WordPress may also resolve a normal
authenticated `?p=ID` request for a readable draft. The plugin does not perform
an independent ID fallback for unresolved drafts, pending posts, scheduled
posts, or custom editorial statuses. Trash, auto-drafts, revisions, and other
internal statuses are not served.

Third-party paywall and access-control integrations must veto Markdown access
when the current visitor is not entitled to read a post. They must also disable
shared caching whenever entitlement depends on visitor-specific state such as a
cookie:

```php
add_filter(
	'content_for_agents_can_serve_markdown',
	static function ( bool $allowed, \WP_Post $post, string $context ): bool {
		if ( ! example_is_gated( $post ) ) {
			return $allowed;
		}

		return 'discovery' !== $context && example_current_visitor_can_read( $post );
	},
	10,
	3
);

add_filter(
	'content_for_agents_can_cache_markdown',
	static function ( bool $cacheable, \WP_Post $post ): bool {
		return $cacheable && ! example_is_gated( $post );
	},
	10,
	2
);
```

Registering `content_for_agents_can_serve_markdown` automatically disables shared caching for `/llms.txt`, because discovery decisions may depend on the current visitor. Integrations with other visitor-specific discovery sections can also veto that cache directly:

```php
add_filter( 'content_for_agents_can_cache_llms_txt', '__return_false' );
```

These filters can only restrict the plugin's core access and cache decisions.
They cannot expose drafts, private posts, previews, or password-protected posts
that WordPress would otherwise deny. Access-control integrations are responsible
for invalidating the Markdown document and `/llms.txt` caches when their gating
configuration changes.

Output includes YAML metadata, a single document title heading, and converted content. Published
singular HTML pages advertise their alternate Markdown URL when supported. The
front page advertises `/llms.txt`. The plugin preserves modern, nested, and
legacy quotes, citations, lists, tables, links, images, and code. Audio and video
sources and lite YouTube embeds become Markdown links, with captions retained.
Core embeds use WordPress's resolved preview when available and retain their
original URL when the preview contains no readable content. Link destinations escape
parentheses and backslashes, and encode whitespace and angle brackets for
Markdown syntax. Links nested inside inline code retain their code styling and
destinations.
Figures, captions, and following text stay inside their containing list item.
When WordPress upgrades legacy same-site HTTP URLs to HTTPS in HTML content,
Markdown applies the same core URL replacement.
Visual line breaks inside HTML headings become spaces so the whole heading
remains one Markdown heading.
When rendered content begins with the document title as an H1, that heading
is used instead of adding a duplicate title.
Text and descendants inside an element with `aria-hidden="true"` are excluded;
`aria-hidden="false"` and content without the attribute remain visible.
Unrecognized leaf blocks use HTML conversion; container blocks process children.
HTML fallback applies the same WordPress typography and capitalization filters
used for rendered content. Links without a destination become plain text, and
emphasis and captions keep boundary spaces outside Markdown delimiters.
WordPress 7.0 accordion headings become Markdown headings, their panels retain
body text, and math block text is preserved.
Classic Editor posts and freeform HTML mixed with blocks use the same HTML
conversion path. The plugin does not require the Block Editor to be enabled.
Buttons used as interface controls are omitted from Markdown. Buttons that
label headings, such as accordion titles, retain their text. Visible status
messages remain in the output, including widget loading messages when WordPress
renders them in the article; code stays in a fenced block.
Core post-title and post-excerpt blocks use the current post context. Direct
`core/shortcode` blocks remain literal because conversion does not run
`the_content`; other block render callbacks may still execute code.

Conversion intentionally reads the stored `post_content` and walks its parsed
block tree instead of applying WordPress's `the_content` filter. This preserves
block metadata and the callback precedence described below, and avoids mixing
HTML presentation filters with Markdown authorization. Integrations should use
`content_for_agents_pre_markdown` or `content_for_agents_after_markdown` for
content transformations and `content_for_agents_can_serve_markdown` for access
control. See [Site integrations](INTEGRATIONS.md) for a canonical URL retirement
example.

Markdown and `/llms.txt` responses include a `Content-Signal` header. Its
`ai-train`, `search`, and `ai-input` values default to `yes` and can be
configured with the `content_for_agents_content_signal` option.

The plugin handles `/markdown` and `/llms.txt` directly during `parse_request`.
The Markdown endpoint reads WordPress's normalized request path. The
`markdown=true` query endpoint runs during `template_redirect`, after
WordPress has resolved the post and any preview revision. `/llms.txt`
compares the requested URL path with its home URL so it also works when plain
permalinks leave the normalized request empty. This avoids activation-time
rewrite-rule flushes, which are not reliable for VIP application-loaded
plugins. Markdown paths use VIP's cached URL lookup first. If it misses a
nested page, WordPress's page-path lookup is used only when that page's
permalink exactly matches the requested path. The existing access check still
applies. Local development uses WordPress core URL lookup when VIP's API is
unavailable. WordPress's `robots_txt` filter
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

Callback Markdown is authoritative, including list markers and indentation.
Callbacks for list items must return complete Markdown such as `- Item` or
`1. Item`; the converter does not infer or prepend markers from `core/list`.
An integration that needs ordered-list position or nesting can instead own the
whole list with a `core/list` callback, which takes precedence over its children.

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
| `content_for_agents_can_serve_markdown`                               | Veto Markdown response or discovery access. Receives the post and `response` or `discovery` context. Cannot override core protection.   |
| `content_for_agents_can_cache_markdown`                               | Veto shared caching for visitor-specific Markdown responses. Receives the post. Cannot override core cache exclusions.                  |
| `content_for_agents_can_cache_llms_txt`                               | Veto shared object and HTTP caching for visitor-specific `/llms.txt` output. Cannot override core cache exclusions.                     |
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

The first call clears the article and its parent, including the `/markdown`
paths and query endpoint in supported page-cache purges. Moving a child also
clears its former parent. Category/tag edits and author display-name changes
clear affected documents, with the first 100 handled immediately and further
batches scheduled through WordPress for VIP Cron Control.
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
default is `yes` for all three signals. Legacy settings migration and filter
translation remain outside this base plugin.
