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
If a child page occupies a post's `/markdown` path, the child keeps that URL
and the parent uses `?markdown=true`. Discovery links use the query URL.
If another page's permalink resolves to the site root, no Markdown URL is
advertised because that URL cannot identify the page.

Clients can also request Markdown from a post's normal URL with
`Accept: text/markdown`. Header names are case insensitive. For the value, the
plugin supports a case-sensitive match for lowercase `text/markdown` anywhere
in the header. This means `text/markdown;q=0` and a quoted parameter containing
`text/markdown` select Markdown, while `TeXt/MaRkDoWn` does not. Other media
types and quality values do not affect this choice. This differs from normal
HTTP content negotiation to keep responses consistent within shared cache
variants on the supported hosting platform. A wildcard alone does not select
Markdown. Only GET and HEAD requests use this route.
HTML and Markdown responses at the normal URL vary by `Accept` in the page
cache. The explicit Markdown URLs remain available and take precedence over
the header.

Unprotected published posts of viewable post types are public. Opting a custom
post type into Content for Agents does not override WordPress's
`is_post_type_viewable()` check. For other statuses, WordPress must resolve a
singular post and grant the visitor read permission.
WordPress validates preview revisions and nonces before the plugin serves
them; an authenticated `?p=ID` request may also resolve a readable draft.
The query and Accept routes use the post selected by WordPress's original main
query. They do not use the mutable global post to identify the request.
The plugin does not look up unresolved drafts, pending posts, scheduled posts,
or custom statuses by ID. Trash, auto-drafts, revisions, and other internal
statuses are never served. Password-protected content requires the password
or edit permission as well as read permission. Authenticated and
password-authorized responses do not enter the shared cache.

Markdown paths use VIP's cached URL lookup first. If it misses a nested page,
WordPress's page-path lookup is used only when that page's permalink exactly
matches the requested path. The access check still applies. Local development
uses WordPress core URL lookup when VIP's API is unavailable.

Third-party paywall and access-control integrations must veto Markdown access
when the current visitor is not entitled to read a post. The `/markdown` path
runs before the normal page template, and the query endpoint runs early during
`template_redirect`. A redirect or login screen on the HTML page does not by
itself protect Markdown. Reuse the site's entitlement check in the filter below;
replace the `example_` functions with the site's own functions. Also disable
shared caching whenever entitlement depends on visitor-specific state such as a
cookie. This applies equally to the `Accept` route:

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
access rules change. Test the HTML page, both Markdown URL forms, and the
Accept route as an entitled and an unentitled visitor, including after the
cache has been warmed.

### Conversion

See the [conversion architecture](ARCHITECTURE.md) for the order of block
callbacks, HTML fallback, and response assembly.

Output contains YAML frontmatter, a default H1 from the WordPress post title,
and converted content. The title remains in frontmatter. The Markdown prefix
filter can change or omit the H1, or add content before the converted body.
Frontmatter descriptions use the WordPress excerpt, then the first
blank-line-delimited Markdown segment. Integrations can replace the description with
`content_for_agents_frontmatter`. Supported published HTML pages advertise
their Markdown URL.

The converter handles quotes, citations, lists, tables, links, images,
strikethrough, and code. Explicit `language-*` classes label fenced code.
Audio, video, iframe sources, and lite YouTube embeds become links; muted,
looping autoplay videos without controls are treated as decorative. Core embeds
use a readable WordPress preview when available; otherwise their URL remains.
Figures and captions stay inside their list item. Table captions become text
beside the table. WordPress 7.0 accordion headings, math text, and visible
status messages are retained. Interface controls are omitted, except buttons
that label headings.

HTML conversion targets CommonMark with GFM tables and strikethrough. Links
escape Markdown syntax; links inside inline code keep their styling and URLs.
`<br>` becomes a hard break where possible and remains HTML in headings, table
cells, and at formatting or block ends. Inline code containing `<br>` uses HTML
`<code>`. Preformatted code uses fenced blocks. Content marked `hidden` or
`aria-hidden="true"` is excluded unless a WordPress Interactivity binding
controls that attribute, as with alternate tab panes. Links without a
destination become plain text. The converter also applies WordPress's
same-site HTTP-to-HTTPS replacement.

Classic Editor posts and freeform HTML mixed with blocks use the same HTML
conversion path. Freeform content has no block name, so block-level callbacks
do not run for it. The plugin does not require the Block
Editor to be enabled.

Core post-title and post-excerpt blocks use the current post context.
Registered shortcodes in Shortcode blocks, ordinary rendered blocks, and
Classic Editor content run their callbacks, as they do in HTML. Wrapper-owned
HTML around child blocks follows the same path. Rendered shortcode
output is converted to Markdown; iframe players retain a link to the embedded
media. An unregistered shortcode with a recognizable `url` attribute or
positional URL becomes a link. Bracketed prose and shortcodes without a URL
remain literal. Registered block-level Markdown callbacks take precedence.
Conversion does not run `the_content` over the entire post;
other block render callbacks may still execute code.

Conversion intentionally reads the stored `post_content` and walks its parsed
block tree instead of applying WordPress's `the_content` filter. This preserves
the callback precedence described below and avoids mixing
HTML presentation filters with Markdown authorization. Integrations should use
`content_for_agents_pre_markdown` or `content_for_agents_after_markdown` for
content transformations and `content_for_agents_can_serve_markdown` for access
control. See [Site integrations](INTEGRATIONS.md) for a canonical URL retirement
example.

## Extend the base

All PHP classes live in `Content_For_Agents`. Public hooks, the
Content-Signal option, and cache groups use `content_for_agents` or
`content-for-agents` identifiers.

Register a block callback before `init` priority 5. Block types can be
registered through WordPress independently of the Markdown callback:

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

If a registered callback or its block output filter throws or returns a value
other than a string or `null`, or if block rendering or shortcode conversion
throws, the Markdown request returns HTTP 500. It does not serve or cache a partial
document. The response contains a generic error;
the server log identifies the site, post, and failing block when available,
then records the first message from the underlying `WP_Error`. Error codes,
additional messages, data, and exception traces are not logged. Conversion
stops at the first failing block, so later blocks are not run on that request.
Failures for the same post are logged at most once every five minutes. PHP
warnings retain normal WordPress behavior. An empty string or `null` still
intentionally suppresses a block. Direct calls to `post_to_markdown()` and
`blocks_to_markdown()` return `WP_Error` on a block conversion failure. Callers
must check for it before using the result as a string.
Callbacks that delegate to `blocks_to_markdown()` should also return its
`WP_Error` result when conversion fails.
Exceptions during document assembly follow the same generic response and
logging path.
The pre-Markdown, body, and prefix filters also fail conversion when they
return a value outside their documented types.

Callback Markdown is authoritative, including list markers and indentation.
Callbacks for list items must return complete Markdown such as `- Item` or
`1. Item`; the converter does not infer or prepend list markers. A parent
callback owns its entire subtree. It can select visible `innerBlocks` and pass
them to `Markdown_Converter::blocks_to_markdown()` to invoke child callbacks;
otherwise those callbacks do not run. Without a parent callback, the converter
walks saved `innerContent` when descendants need their own Markdown strategy,
including a child callback or `core/embed`. Each child callback can return `''`
to hide that child.

Integrations must keep these choices consistent with rendered HTML. If a
parent's WordPress renderer hides or rearranges children, give that parent a
Markdown callback using the same visibility rule. A child callback alone
cannot determine what an unrelated parent renderer will display.

Return `''` from a registered callback to omit a block and its children. To
omit only the wrapper, return
`( new Markdown_Converter() )->blocks_to_markdown( $block['innerBlocks'] ?? array(), $post )`.
Registry output passes through `content_for_agents_block_{block-name}`.

Public hooks:

- `content_for_agents_pre_markdown` receives the post. Return `null` to continue
  conversion, a string to supply the body, or `WP_Error` to stop conversion.
- `content_for_agents_after_markdown` filters the body when serving a document.
  Return a string for the body or `WP_Error` to stop assembly. Direct
  `post_to_markdown()` calls do not run it.
- `content_for_agents_can_serve_markdown` receives the post and a `response` or
  `discovery` context. Return `false` to deny access; it cannot grant access.
- `content_for_agents_can_cache_markdown` receives the post. Return `false` to
  keep visitor-specific output out of the shared cache. This is checked in
  `Markdown_Access::can_cache()` before `Markdown_Response` reads or writes its
  document cache.
- `content_for_agents_frontmatter` receives the post. Return the metadata array;
  replace its `authors` entry to provide custom bylines.
- `content_for_agents_markdown_prefix` receives the default title H1, the post,
  and the converted Markdown body. Return a Markdown string to place after
  frontmatter and before the body. The body is converted first so the filter can
  inspect it. Multiline output works; include the trailing blank line that
  separates it from the body. Return `''` to omit the prefix, or `WP_Error` to
  stop document assembly.
- `content_for_agents_content_signal_values` receives stored values or defaults.
  `Markdown_Response::get_content_signal_header()` applies it when building
  the Markdown response header and the `robots.txt` directive.
- `content_for_agents_set_context` and `content_for_agents_clear_context` set
  and clear an optional conversion context for external integrations. The base
  plugin does not set one. A block callback can read it with
  `Block_Markdown_Registry::get_context()`. Clear it in `try/finally`.

### Common filter examples

Replace the default author byline with provider-neutral post data and add a
frontmatter field:

```php
add_filter(
	'content_for_agents_frontmatter',
	static function ( array $data, \WP_Post $post ): array {
		$credit = get_post_meta( $post->ID, 'article_credit', true );
		if ( is_string( $credit ) && '' !== $credit ) {
			$data['authors'] = array( array( 'name' => $credit ) );
		}
		$data['language'] = get_post_meta( $post->ID, 'language', true ) ?: 'en';
		return $data;
	},
	10,
	2
);
```

The Markdown prefix defaults to the post title as an H1. These are independent
examples of changing it:

**Use a custom title** stored in `agent_heading`:

```php
add_filter(
	'content_for_agents_markdown_prefix',
	static function ( string $prefix, \WP_Post $post ): string {
		$title = get_post_meta( $post->ID, 'agent_heading', true );
		if ( ! is_string( $title ) || '' === trim( $title ) ) {
			return $prefix;
		}

		$title = ( new \Content_For_Agents\HTML_To_Markdown_Converter() )->convert( $title );
		return "# $title\n\n";
	},
	10,
	2
);
```

**Omit the title**:

```php
add_filter( 'content_for_agents_markdown_prefix', '__return_empty_string' );
```

**Add the WordPress excerpt** below the default title:

```php
add_filter(
	'content_for_agents_markdown_prefix',
	static function ( string $prefix, \WP_Post $post ): string {
		$excerpt = get_the_excerpt( $post );
		if ( '' === trim( $excerpt ) ) {
			return $prefix;
		}

		$excerpt = ( new \Content_For_Agents\HTML_To_Markdown_Converter() )->convert( $excerpt );
		return $prefix . $excerpt . "\n\n";
	},
	10,
	2
);
```

Use `$post->post_excerpt` instead of `get_the_excerpt( $post )` to include only
a manually saved excerpt.

See [Site integrations](INTEGRATIONS.md#seo-descriptions-in-frontmatter) for a
Rank Math description example using the frontmatter filter.

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

### Caching and invalidation

VIP's edge cache may serve a public Markdown URL without running WordPress. On
an origin request, the plugin checks access before reading its WordPress object
cache. For an anonymous request to a published, unprotected post, it reads the
complete Markdown document from the `content_for_agents_doc` cache group. A
miss builds the document and stores it for one hour. Logged-in, preview, and
password-authorized requests bypass this shared document cache and receive
private, no-store response headers. Integrations can also disable shared
caching with `content_for_agents_can_cache_markdown`.

`Markdown_Cache_Invalidator` deletes affected documents with `wp_cache_delete()`
and queues their public URLs with
`wpvip_purge_edge_cache_for_url()`. The URL list includes `/markdown` with and
without a trailing slash where applicable, `?markdown=true`, and the base
permalink because VIP purges its query-string variants. VIP also runs its
[automatic post purge](https://docs.wpvip.com/caching/page-cache/purging/automatic-purging-for-wp/)
on publication and post changes; the plugin adds Markdown URLs to that purge
through `wpcom_vip_cache_purge_{$post_type}_post_urls`.

| Change                                                           | Plugin action                                                                                                                                                      |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A supported post is saved or published                           | Clear the post and current parent's document caches and queue their current URLs. Autosaves and revisions are skipped.                                             |
| A previously published, supported post is updated                | Queue its old URLs before the update, so a changed slug, status, or parent does not leave the former URL cached. The save also clears the current post and parent. |
| A supported child moves to a new parent                          | Clear the former parent's document cache and queue its URLs, in addition to the current parent's purge on save.                                                    |
| A post is trashed or permanently deleted                         | Clear the post and current parent's document caches and queue their URLs through the WordPress trash and pre-deletion hooks.                                       |
| A category or tag is edited, or an author's display name changes | Find related published posts of supported types, then clear and queue purges for each post and its parent.                                                         |

Related-post invalidation processes up to 100 posts immediately. If a full
batch is found, it schedules the next batch with `wp_schedule_single_event()`;
VIP Cron Control runs scheduled batches. `wp_next_scheduled()` avoids queuing
the same batch twice.

VIP queues and deduplicates URL purges and sends them on `shutdown`, so
edge-cache refresh is not immediate.

When integration-owned data changes outside these hooks, integrations identify
the affected article IDs and call:

```php
\Content_For_Agents\Markdown_Cache_Invalidator::invalidate_post( $article_id );
```

The call clears the article and its parent and queues their Markdown URLs.
Call it before deletion when bypassing WordPress's normal deletion hooks, so
the old permalink remains available. A callback that changes output does not
automatically invalidate cached content.

## Metadata and Content-Signal contracts

Markdown responses include a `Content-Signal` header. The `robots_txt` filter
adds the same site-wide values to `robots.txt` where the platform permits it.

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
