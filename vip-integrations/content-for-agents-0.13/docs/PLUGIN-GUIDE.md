# Using Content for Agents

Content for Agents lets readers and tools get a Markdown version of a WordPress
post or page. The HTML page stays in place. The Markdown version contains the
article text and useful details such as its title, date, author, and original
URL.

> **Beta:** Updates may introduce breaking changes. Do not use Content for
> Agents in production environments yet.

This guide explains what to expect after your site team installs the plugin.
It requires WordPress 7.0 or newer, PHP 8.2 or newer, and the WordPress VIP
platform. Your site team installs and activates the plugin.

## Find the Markdown version

Open a published post or page and add `/markdown` to its URL. For example:

| HTML page                         | Markdown version                          |
| --------------------------------- | ----------------------------------------- |
| `https://example.com/news/story/` | `https://example.com/news/story/markdown` |

The plugin also places a Markdown discovery link in the HTML page for supported,
public content. Your site can use that link rather than constructing the URL.
If a page already exists at `/markdown`, the plugin uses a query URL instead,
such as `/news/story/?markdown=true`.

Some sites use plain permalinks rather than readable paths. On those sites, a
post's Markdown URL looks like `?p=123&markdown=true`. A static front page uses
`/?markdown=true`. Tools can also request the normal post URL with
`Accept: text/markdown` on a GET or HEAD request. The header value must contain
lowercase `text/markdown`; mixed-case spelling does not match. The plugin also
matches that text when it appears in a parameter, even with `q=0`, so use an
explicit Markdown URL when standard content negotiation matters to your client.

## What you receive

The Markdown response starts with metadata, followed by a title heading and
the converted post content. Metadata includes the title, description, date,
author, original URL, categories, and tags when available. The description
uses the WordPress excerpt or the first segment of converted Markdown. The
plugin works with Block Editor content, Classic Editor HTML, and posts that mix
the two. It converts common content such as
headings, paragraphs, lists, links, images, tables, and code. Custom blocks may
need a site-specific integration to produce the result you expect.

The response points back to the original HTML page. It also includes a rough
token count and a site-wide Content-Signal header. Markdown responses carry a
`noindex` header so search engines are directed to the HTML page. If you put
Markdown into an HTML viewer, that viewer must sanitize it first.

Review a few representative articles before relying on the output, especially
ones with custom blocks, embeds, tables, or access restrictions. Compare the
Markdown with what a reader can see on the HTML page. Embedded media may appear
as a link instead of an interactive player. If a custom block fails to convert,
the request returns an error instead of a partial article; ask your site team
to inspect the failure.

## Who can read it

A public, unprotected post can have a public Markdown version. For drafts,
private posts, previews, and password-protected posts, the plugin uses
WordPress's post resolution and access checks. It does not make a private post
public. The HTML page advertises a Markdown alternative only for a published,
unprotected post that passes the plugin's discovery check.

A separate paywall or login rule on an HTML page does not automatically cover
the Markdown version. If your site has one, ask your site team to apply the same
entitlement rule to every Markdown route and prevent visitor-specific output
from entering a shared cache. See [Adapting the plugin to your site](SITE-SETUP.md).

## When your site needs an integration

The plugin supports standard WordPress posts and pages by default. Ask your site
team to plan an integration when your site has:

- A custom post type that should have Markdown versions.
- A custom block whose Markdown does not match its visible HTML.
- Article metadata that should appear in the Markdown version.
- A paywall or another visitor-specific access rule.
- Redirected or removed articles whose old Markdown URL should stop working.

[Adapting the plugin to your site](SITE-SETUP.md) explains what to check with your site team.

## Updates and site settings

The plugin queues VIP edge-cache purges when supported post content changes.
Changes in separate integration data may need an additional purge from your
site team. An edge-cached Markdown response may take a little time to refresh.

On production WordPress VIP sites, the plugin samples Markdown requests for
two site-level usage counters. It does not send post IDs, URLs, or content.
The site-wide Content-Signal values appear in Markdown response headers and,
on public WordPress sites, in `robots.txt`. All three signals default to `yes`:
`ai-train`, `search`, and `ai-input`. Your site team can configure those values.
