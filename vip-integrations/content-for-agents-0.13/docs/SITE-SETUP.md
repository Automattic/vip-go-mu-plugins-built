# Adapt Content for Agents to your site

Content for Agents works with standard WordPress posts and pages without a
custom integration. An integration is site-specific work that makes the
Markdown version match your site's content, permissions, and publishing rules.
For example, a site integration might account for custom article blocks or
metadata that the base plugin cannot know about.

The base plugin stays provider neutral. Your site team owns the integration and
any dependencies it needs.

## Decide what needs to change

Start with a small set of real articles. Open each HTML page and its Markdown
version, then record the differences that matter to readers or tools.

| If your site has...                   | Ask your site team to...                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Custom article types                  | Enable Markdown for each intended type and confirm that WordPress treats it as viewable.                 |
| Custom blocks                         | Make the Markdown reflect the text, links, and child content actually visible on the HTML page.          |
| Site-specific summaries or bylines    | Use the same source of truth for the Markdown metadata, then check the result on real articles.          |
| A paywall or login rule               | Apply the entitlement check to Markdown responses and keep visitor-specific output out of shared caches. |
| Redirected or removed articles        | Stop serving or advertising Markdown when the original HTML URL no longer represents the article.        |
| Data that changes outside a post save | Purge affected Markdown URLs when that data changes.                                                     |

A WordPress post or page that already converts correctly needs no custom rule.
Keep the integration limited to the cases your site actually uses.

### Match descriptions and redirects

If your HTML page uses an SEO description instead of the WordPress excerpt,
compare that description with the Markdown metadata. Your site team can supply
the same resolved description through `content_for_agents_frontmatter`. If the
SEO system returns no description, leave the plugin's excerpt or content
fallback in place. Check articles whose descriptions come from a template as
well as articles with a manually written description.

If a redirect or removal rule changes what the original HTML URL serves, have
the site integration check that rule before serving or advertising Markdown.
Test an active redirect, a removed article, and an inactive rule. If redirect
rules are cached by the integration, refresh that cache when the rules change.

## Check access before launch

WordPress's own post status, preview, and password rules apply to Markdown.
Other systems, such as a paywall, need an explicit integration. A redirect or
login screen on the HTML page alone does not protect `/markdown`,
`?markdown=true`, or the `Accept: text/markdown` route.

For a gated article, check all three Markdown routes with an entitled visitor
and an unentitled visitor. Repeat after the site's edge cache has been warmed.
The unentitled visitor should not receive the article, and one visitor's
response must not be served to another.

## Check the finished content

Use real examples from your site. At minimum, review:

1. A standard post that needs no integration.
2. An article with each custom block type the integration handles.
3. An article with a custom summary, byline, or other metadata.
4. A gated article, if the site has one.
5. A redirected or removed article, if the site has those rules.
6. An article after its content or integration-owned data changes.

Compare the Markdown with the visible HTML. Check that links lead to the right
place, hidden content stays hidden, and updated content appears after the cache
refreshes. If a custom block changes which child blocks are visible, its
Markdown should follow the same rule.

The [plugin guide](PLUGIN-GUIDE.md) describes the behavior customers can expect.

## Implementation reference for your site team

The sections below record the plugin contracts for the people implementing
your site integration. They are not needed to use standard posts and pages.

### Enable a post type

The plugin adds `content-for-agents` support to `post` and `page` at `init`
priority 5. Other types need that support flag and must pass WordPress's
`is_post_type_viewable()` check. Add support after registering the type:

```php
add_action( 'init', static function (): void {
	add_post_type_support( 'book', 'content-for-agents' );
}, 20 );
```

An integration can instead include `content-for-agents` in its
`register_post_type()` `supports` array.

### Block callbacks

`content_for_agents_register_block_callbacks` runs at `init` priority 5.
Register callbacks from a site plugin or MU plugin that loads before that
point:

```php
add_action( 'content_for_agents_register_block_callbacks', static function (): void {
	\Content_For_Agents\Block_Markdown_Registry::register(
		'example/summary',
		static function ( array $block, \WP_Post $post ): string {
			$text = $block['attrs']['summary'] ?? '';
			return is_string( $text ) ? sanitize_text_field( $text ) : '';
		}
	);
} );
```

The callback receives a parsed block array and the post. Return a Markdown
string, `''` or `null` to suppress the block, or `WP_Error` to fail conversion.
A callback's result is authoritative, including list markers and children.
To delegate selected children, call
`( new \Content_For_Agents\Markdown_Converter() )->blocks_to_markdown( $blocks, $post )`
and propagate any `WP_Error`. Without a parent callback, the converter can
walk child blocks that need their own Markdown strategy. Keep a parent's
Markdown visibility consistent with its HTML renderer.

`Block_Markdown_Registry::register()`, `get()`, and `has()` are public. A later
registration for the same block name replaces the earlier one. A registered
callback's result passes through `content_for_agents_block_{block-name}` with
the parsed block and post. A missing callback uses the plugin's built-in
handling or rendered-HTML conversion.

Invalid callback or block-output-filter return types, thrown exceptions, and
`WP_Error` results stop conversion. The response is a generic HTTP 500 and is
not cached. Direct `post_to_markdown()` and `blocks_to_markdown()` callers must
check for `WP_Error` before treating the result as a string.

### Filters and actions

| Hook                                       | Contract                                                                                                                                                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_for_agents_pre_markdown`          | Receives `null` and the post. Return `null` for normal conversion, a string for the body, or `WP_Error` to stop.                                                                                                                         |
| `content_for_agents_after_markdown`        | Receives the converted body and post during response assembly. Return a string or `WP_Error`. Direct `post_to_markdown()` calls do not run it.                                                                                           |
| `content_for_agents_frontmatter`           | Receives the metadata array and post. Return an array. Replace `authors` to change bylines.                                                                                                                                              |
| `content_for_agents_markdown_prefix`       | Receives the default title heading, post, and converted body. Return Markdown between frontmatter and body, `''` to omit the heading, or `WP_Error` to stop. Include any spacing needed before the body.                                 |
| `content_for_agents_can_serve_markdown`    | Receives `true`, post, and `response` or `discovery`. Return `false` to veto access. It cannot override WordPress access checks.                                                                                                         |
| `content_for_agents_can_cache_markdown`    | Receives `true` and post when core rules permit shared caching. Return `false` for private, no-store response headers.                                                                                                                   |
| `content_for_agents_block_{block-name}`    | Receives a registered callback result, parsed block, and post. Return a string (including `''`) or `null`; empty output suppresses the block and `WP_Error` stops conversion. This filter runs only when a block callback is registered. |
| `content_for_agents_content_signal_values` | Receives the stored values or defaults. Return an array of site-wide values for `ai-train`, `search`, and `ai-input`, or an empty array to omit the signal.                                                                              |

`content_for_agents_register_block_callbacks` is the registration action used
above. `content_for_agents_set_context` and `content_for_agents_clear_context`
are optional actions for integrations that need a conversion context. The base
plugin does not set one. Block callbacks can read it with
`Block_Markdown_Registry::get_context()`. Clear a context in `try/finally`.

The frontmatter defaults to `title`, `description`, `date`, `authors`, `url`,
`categories`, and `tags`. Empty values are removed. Values may be nested
arrays, strings, finite numbers, booleans, or null, up to 32 levels deep.
Objects and resources are unsupported. The description uses the WordPress
excerpt or the first blank-line-delimited Markdown segment.

Content-Signal defaults to `yes` for `ai-train`, `search`, and `ai-input`.
The filter accepts booleans, `yes`/`no`, `true`/`false`, and `1`/`0`. Unknown
keys and values are omitted. Its result takes precedence over the stored
option. The header and public site's `robots.txt` use the same site-wide
values.

### Access and cache rules

The plugin applies WordPress post type, status, password, and preview checks
before calling the access filter. Discovery is limited to published,
unprotected posts. A separate entitlement system must veto both Markdown
responses and discovery for visitors who cannot see the article. If entitlement
depends on a cookie or session, also return `false` from
`content_for_agents_can_cache_markdown` for that post.

The Markdown path runs during `parse_request`; the query and Accept routes run
during `template_redirect`. The Accept route uses a case-sensitive substring
match for lowercase `text/markdown`, including values with `q=0`, and only
handles GET and HEAD. Eligible HTML responses vary by `Accept` in the page
cache. Do not rely on an HTML template redirect to gate Markdown.

The plugin purges supported URLs when posts change and queues related purges
for category, tag, and author display-name changes. For integration-owned data
changed outside these hooks, call:

```php
\Content_For_Agents\Markdown_Cache_Invalidator::invalidate_post( $post_id );
```

This queues the post and its parent's Markdown and base URLs for VIP edge-cache
purging. Call before permanent deletion if the former permalink must be
purged. VIP sends queued purges asynchronously, so the edge may not refresh
immediately.
