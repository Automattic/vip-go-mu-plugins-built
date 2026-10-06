# Site integrations

Content for Agents applies WordPress status, password, preview, and post type
rules before serving or advertising Markdown. Sites can add visibility rules
with `content_for_agents_can_serve_markdown`. Return `false` to hide a post
from both responses and per-page discovery. The filter cannot grant access.

## Redirected or removed canonical URLs

A redirect manager, SEO plugin, or site code may redirect a post's canonical
HTML URL or mark it as gone. Its separate Markdown URL may remain accessible.
If the HTML URL no longer serves the post, veto its Markdown response and
discovery link. Use the site's read-only rule matcher to check the canonical
URL. Put the filter in a site plugin or MU plugin that loads with Content for
Agents.

The filter works with any redirect system; only its matcher changes. This
example uses Rank Math's active-rule matcher, including redirects and 410 Gone
rules. If its redirections module is inactive, the callback keeps the normal
access decision.

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

On sites with many posts, profile the matcher and use a site-owned cache or
batch lookup if needed. Invalidate that data when redirect rules change.
