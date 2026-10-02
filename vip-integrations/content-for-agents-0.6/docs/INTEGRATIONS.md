# Site integrations

Content for Agents checks WordPress publication, password, preview, and post type
rules before it serves or advertises Markdown. A site can apply additional
visibility rules with `content_for_agents_can_serve_markdown`. Return `false` to
veto a post. The filter runs for both Markdown responses and `/llms.txt`
discovery, so the two surfaces follow the same site policy. It cannot override
the plugin's core access checks.

## Redirected or removed canonical URLs

A published post can have a canonical URL that a redirect manager, SEO plugin,
or custom site code redirects or marks as gone. The Markdown endpoint uses a
different URL, so that URL rule might not run for it. The general rule is: when
the canonical HTML URL no longer serves the post's content, veto its Markdown
response and discovery entry. Check the canonical URL through the site's own
read-only rule matcher. This avoids hard-coded post IDs and self-HTTP requests.
Add the integration to a site plugin or MU plugin that loads alongside Content
for Agents.

The filter and access decision are the same for any redirect system. Only the
matcher inside the callback changes. This example uses Rank Math's active
redirection matcher. It blocks Markdown and discovery for any canonical URL with
an active rule, including redirects and 410 Gone rules. If Rank Math or its
redirections module is not active, the callback leaves Content for Agents'
normal decision in place.

```php
add_filter(
	'content_for_agents_can_serve_markdown',
	static function ( bool $allowed, WP_Post $post ): bool {
		if ( ! $allowed
			|| ! class_exists( '\RankMath\Helper' )
			|| ! class_exists( '\RankMath\Redirections\DB' )
			|| ! \RankMath\Helper::is_module_active( 'redirections' ) ) {
			return $allowed;
		}

		$permalink = get_permalink( $post );
		$path      = is_string( $permalink ) ? wp_parse_url( $permalink, PHP_URL_PATH ) : null;
		$home_path = wp_parse_url( home_url( '/' ), PHP_URL_PATH );
		if ( ! is_string( $path ) || ! is_string( $home_path ) || ! str_starts_with( $path, $home_path ) ) {
			return $allowed;
		}

		$uri = trim( urldecode( substr( $path, strlen( $home_path ) ) ), '/' );
		if ( '' === $uri ) {
			return $allowed;
		}

		return false === \RankMath\Redirections\DB::match_redirections( $uri );
	},
	10,
	2
);
```

For another redirect system, replace the Rank Math class checks and matcher with
that system's read-only check of the canonical URL. Keep the same filter so
Markdown responses and discovery remain aligned. Test a live page, a redirected
page, a removed page, and an inactive rule after installing the integration.

An access filter may depend on the visitor, so registering one disables shared
`/llms.txt` caching. On sites with many posts, profile the matcher during
discovery and use a site-owned cache or batch lookup if needed. Invalidate that
data when the redirect rules change.
