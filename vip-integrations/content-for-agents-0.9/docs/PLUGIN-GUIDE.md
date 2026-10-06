# Plugin guide

This guide describes the public behavior and extension contracts of Content for
Agents. For installation, see the [README](../README.md). For development
setup and checks, see the [contributor guide](CONTRIBUTING.md).

The plugin requires WordPress 7.0 or newer and PHP 8.2 or newer. On an
unsupported runtime, it registers no hooks and shows an administrator notice.
Markdown responses send `X-Content-Type-Options: nosniff`. Applications that
render the Markdown as HTML must sanitize the result: posts and integration
callbacks can supply content.

## Content and discovery

### URLs and access

For a published post at `/example/`, the canonical Markdown URL is
`/example/markdown`, with an optional trailing slash. With plain permalinks,
it is `?p=123&markdown=true`. Discovery links use the appropriate form. The
static front page uses `/?markdown=true`; `/markdown` remains available as a
normal page. Its old slug does not provide a hidden Markdown path.

Unprotected published posts are public. For other statuses, WordPress must
resolve a singular post and grant the visitor read permission.
WordPress validates preview revisions and nonces before the plugin serves
them; an authenticated `?p=ID` request may also resolve a readable draft.
The plugin does not look up unresolved drafts, pending posts, scheduled posts,
or custom statuses by ID. Trash, auto-drafts, revisions, and other internal
statuses are never served. Password-protected content requires the password
or edit permission as well as read permission. Authenticated and
password-authorized responses do not enter the shared cache.

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

These filters can restrict access and caching, but cannot grant access that
WordPress denies. Integrations must invalidate cached Markdown when their
access rules change.

### Conversion

Output contains YAML metadata and converted content. The plugin adds a title
heading only when the body has no H1; the stored title remains in frontmatter.
Supported published HTML pages advertise their Markdown URL. The converter
handles modern and legacy quotes, citations, lists, tables, links, images,
and code. Audio, video, iframe sources, and lite YouTube embeds become links
with captions.
Core embeds use WordPress's resolved preview when available, or retain their
URL when the preview has no readable content. Links escape characters that
would break Markdown syntax. Links inside inline code keep their styling and
destinations. Figures and captions stay inside their list item. The converter
also follows WordPress's same-site HTTP-to-HTTPS replacement. Line breaks
inside HTML headings become spaces. A visible H1 takes precedence over the
stored title, even when it follows introductory text.
Content inside `aria-hidden="true"` is excluded; other content remains visible.
Unrecognized leaf blocks use HTML conversion, while containers process their
children. HTML fallback applies WordPress typography, capitalization, and
smiley filters. Links without a destination become plain text.
WordPress 7.0 accordion headings become Markdown headings, their panels retain
body text, and math block text is preserved.
Classic Editor posts and freeform HTML mixed with blocks use the same HTML
conversion path. Freeform content has no block name, so block metadata and
block-level callbacks do not run for it. The plugin does not require the Block
Editor to be enabled.
Interface buttons are omitted, but buttons that label headings retain their
text. Visible status messages remain, including loading messages rendered in
the article. Preformatted code uses fenced blocks.

Core post-title and post-excerpt blocks use the current post context.
Registered shortcodes in Shortcode blocks, ordinary rendered blocks, and
Classic Editor content run their callbacks, as they do in HTML. Wrapper-owned
HTML around child blocks follows the same path. Rendered shortcode
output is converted to Markdown; iframe players retain a link to the embedded
media. An unregistered shortcode with a recognizable `url` attribute or
positional URL becomes a link. Bracketed prose and shortcodes without a URL
remain literal. Block metadata and registered block-level Markdown callbacks
take precedence. Conversion does not run `the_content` over the entire post;
other block render callbacks may still execute code.

Conversion intentionally reads the stored `post_content` and walks its parsed
block tree instead of applying WordPress's `the_content` filter. This preserves
block metadata and the callback precedence described below, and avoids mixing
HTML presentation filters with Markdown authorization. Integrations should use
`content_for_agents_pre_markdown` or `content_for_agents_after_markdown` for
content transformations and `content_for_agents_can_serve_markdown` for access
control. See [Site integrations](INTEGRATIONS.md) for a canonical URL retirement
example.

Markdown responses include a `Content-Signal` header, and `robots.txt` carries
the same site-wide values. See [Metadata and Content-Signal contracts](#metadata-and-content-signal-contracts)
for configuration.

The plugin handles `/markdown` directly during `parse_request`. The
`markdown=true` query endpoint runs during `template_redirect`, after
WordPress has resolved the post and any preview revision. This avoids
activation-time rewrite-rule flushes, which are not reliable for VIP
application-loaded plugins. Markdown paths use VIP's cached URL lookup first.
If it misses a nested page, WordPress's page-path lookup is used only when
that page's permalink exactly matches the requested path. The existing access
check still applies. Local development uses WordPress core URL lookup when
VIP's API is unavailable. The `robots_txt` filter adds Content-Signal guidance
where the platform permits it; VIP test-domain crawler restrictions still
apply. Actual edge-cache refresh requires deployment verification.

## Extend the base

All PHP classes live in `Content_For_Agents`. Public hooks, the
Content-Signal option, and cache groups use `content_for_agents` or
`content-for-agents` identifiers.

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

`content_for_agents_register_block_callbacks` is an action for registering
callbacks, not a filter that converts blocks. During conversion, `get()` returns
the registered callback for a block name, or `null` when none exists. A missing
callback lets the plugin use its built-in handling or rendered-HTML fallback.
Callbacks receive the parsed block and its post and return Markdown. Their
result is authoritative: an empty string suppresses the block, and `null` is
not a fallthrough signal. Registry methods `register()`, `get()`, and `has()`
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
precedence over registry callbacks. A metadata callback's empty or `null`
result also suppresses the block. An absent or non-callable metadata callback
lets conversion continue. Registry output then passes through
`content_for_agents_block_{block-name}`. That filter does not run for the
metadata path. Preserve this distinction when adding integrations.

Public hooks:

- `content_for_agents_pre_markdown` receives the post. Return `null` to continue
  conversion, or a string to supply the body.
- `content_for_agents_after_markdown` filters the body when serving a document.
  Direct `post_to_markdown()` calls do not run it.
- `content_for_agents_can_serve_markdown` receives the post and a `response` or
  `discovery` context. Return `false` to deny access; it cannot grant access.
- `content_for_agents_can_cache_markdown` receives the post. Return `false` to
  keep visitor-specific output out of the shared cache.
- `content_for_agents_authors` receives the post. Return author entries with a
  `name` and optional `job_title` and `link`.
- `content_for_agents_frontmatter` receives the post. Return the metadata array.
- `content_for_agents_content_signal_values` receives stored values or defaults.
  Return site-wide values for Markdown headers and `robots.txt`.
- `content_for_agents_set_context` and `content_for_agents_clear_context` set
  and clear a conversion context. Read it with
  `Block_Markdown_Registry::get_context()` and clear it in `try/finally`.

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

The plugin enables WordPress `post` and `page` by default. Other post types,
including custom post types and attachments, need the `content-for-agents`
support flag. Add it after registering the type:

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
`content-for-agents` in its `register_post_type()` `supports` array.
Provider-specific data, queries, and dependencies remain outside the base plugin.

### Cache invalidation

When related data changes, integrations identify the affected article IDs and call:

```php
\Content_For_Agents\Markdown_Cache_Invalidator::invalidate_post( $article_id );
```

The call clears the article and its parent, and purges their Markdown paths
and query endpoints. Moving a child also clears its former parent. Category,
tag, and author display-name changes clear affected documents in batches of
100; WordPress schedules later batches through VIP Cron Control. VIP queues
and deduplicates URL purges, so edge-cache refresh is not immediate. Call
before permanent deletion if the old permalink must be purged. A callback
that changes output does not automatically invalidate cached content.

## Metadata and Content-Signal contracts

Frontmatter accepts nested PHP arrays (maps or lists), strings, finite numbers,
booleans, and null, with a maximum nesting depth of 32. Empty arrays render as
empty lists. Objects and resources are unsupported. Mapping keys and strings
are quoted; Unicode and escaped line breaks survive a YAML round trip.

Content-Signal accepts `yes`/`no`, `true`/`false`, booleans, and `1`/`0` for
`ai-train`, `search`, and `ai-input`. Unknown keys and values are omitted. The
default is `yes` for all three signals. The filter receives the option value
before validation and takes precedence over it. Return an empty array to omit
the signal from both outputs. Use a consistent site-wide value so cached
responses and `robots.txt` express the same policy:

```php
add_filter(
	'content_for_agents_content_signal_values',
	static function (): array {
		return array(
			'ai-train' => 'no',
			'search'   => 'yes',
			'ai-input' => 'no',
		);
	}
);
```
