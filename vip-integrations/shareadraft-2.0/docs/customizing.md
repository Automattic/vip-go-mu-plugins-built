# Customizing Share a Draft

Share a Draft works without any configuration. When a site needs something different, these filters and actions change how it behaves. Add the snippets to a small plugin or your theme's `functions.php`.

## Offer different link lifetimes

The editor offers links that last 1 hour, 8 hours, 24 hours, or 7 days, with 8 hours selected. To offer other lifetimes, return your own list from `shareadraft_expiration_options`. Each option is a number of seconds and a label, in the order they should appear:

```php
add_filter(
	'shareadraft_expiration_options',
	function ( array $options ): array {
		$options[] = array(
			'seconds' => 30 * DAY_IN_SECONDS,
			'label'   => __( '30 days', 'my-plugin' ),
		);

		return $options;
	}
);
```

Only lifetimes in this list are accepted, whether a link is created in the editor, with WP-CLI, or through the Abilities API. To change which lifetime is selected when the editor opens, return a number of seconds from `shareadraft_default_expiration`:

```php
add_filter( 'shareadraft_default_expiration', fn () => DAY_IN_SECONDS );
```

The default must be one of the offered lifetimes. If it is not (for example, you remove 8 hours from the list but leave the default alone), the first option in the list is selected instead. Options without a positive whole number of seconds and a text label are ignored, and if none are left the built-in list is used.

## Change how many viewers a link may allow

A link allows at most 1,000 viewers, and a link created without a limit gets 1,000. To set a different ceiling, return it from `shareadraft_max_uses_limit`:

```php
add_filter( 'shareadraft_max_uses_limit', fn () => 50 );
```

To allow any number of viewers, and links with no limit at all, return null:

```php
add_filter( 'shareadraft_max_uses_limit', '__return_null' );
```

The ceiling applies whether a link is created in the editor, with WP-CLI, or through the Abilities API. Anything other than null or a positive whole number is ignored, and the ceiling stays at 1,000. Changing it only affects new links: existing links keep the limit they were created with.

## Turn off named reviewer or IP restriction features

Binding a link to named reviewers, and restricting it to IP ranges, are both optional. If your site never wants one of them, switch it off: its fields disappear from the editor, the Preview Links screen, and the Abilities API, and WP-CLI refuses to use it.

```php
add_filter( 'shareadraft_recipients_enabled', '__return_false' );
add_filter( 'shareadraft_ip_allowlist_enabled', '__return_false' );
```

Links that already use a restriction keep enforcing it. Switching a feature off only stops new links from using it.

## Behind a reverse proxy: tell Share a Draft the visitor's real IP address

IP restrictions compare the visitor's address with the link's allowed ranges. By default that address comes from `REMOTE_ADDR`, which behind a reverse proxy or CDN is the proxy's address, so every visitor fails the check. Return the real address from the header your proxy sets, and only from a proxy you trust:

```php
add_filter(
	'shareadraft_client_ip',
	function ( string $remote_addr ): string {
		// Only trust the header when the request really came through your proxy.
		if ( '203.0.113.10' === $remote_addr && isset( $_SERVER['HTTP_X_REAL_IP'] ) ) {
			return sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_REAL_IP'] ) );
		}

		return $remote_addr;
	}
);
```

Never return a raw `X-Forwarded-For` value without checking where the request came from, because visitors can set that header themselves. See the [hosting requirements](hosting.md#ip-restrictions-need-the-visitors-real-ip-address) for more.

## Change the verification email

When a link is bound to named reviewers, each one is emailed a six-digit code. To change the subject or wording, filter `shareadraft_verification_email`. It receives the subject and plain-text message, the recipient's address, and the code; if you replace the message entirely, include the code in it:

```php
add_filter(
	'shareadraft_verification_email',
	function ( array $mail, string $email, string $code ): array {
		/* translators: %s: Site title. */
		$mail['subject'] = sprintf( __( 'Your review code for %s', 'my-plugin' ), get_bloginfo( 'name' ) );

		/* translators: %s: Six-digit verification code. */
		$mail['message'] = sprintf( __( 'Your code is %s. It expires in a few minutes; please do not share it.', 'my-plugin' ), $code );

		return $mail;
	},
	10,
	3
);
```

## Change what reviewers are told

When a link has expired, been revoked, or been used up, the reviewer sees a short notice on a simple page carrying your site's name and icon. The same page hosts the email-verification steps.

To change the text inside that page, filter `shareadraft_notice_content`. It receives the page's HTML content and its title and HTTP status, and whatever you return is output as it is, so escape anything you add. To replace the whole page rather than its content, hook WordPress's `wp_die_handler`, because every notice is shown through `wp_die()`.

To say less about why a link stopped working, return `false` from `shareadraft_disclose_denial_reason`, and every reason collapses into one general message. It also receives the reason (`expired`, `revoked`, `exhausted`, or `links_disabled`), so you can hide only some:

```php
// Say when a link has expired, but not when it has been revoked.
add_filter(
	'shareadraft_disclose_denial_reason',
	fn ( bool $disclose, string $reason ): bool => 'revoked' !== $reason,
	10,
	2
);
```

Only someone holding a genuine link for that draft ever reaches these notices, so this is a matter of tone rather than security.

## Keep expired and revoked links for more or less time

Expired and revoked links are kept for 21 days, so a returning reviewer is told why their link stopped working, and are then deleted by a daily cleanup. Return a different number of seconds from `shareadraft_dead_link_grace_period`:

```php
add_filter( 'shareadraft_dead_link_grace_period', fn () => 7 * DAY_IN_SECONDS );
```

Returning `0` deletes them at the next cleanup. To delete them straight away, run [`wp shareadraft prune`](wp-cli.md).

## Recognize more link previewers

Chat apps and social networks fetch a link as soon as it is pasted, to show a preview. Share a Draft recognizes these, and crawlers, by their user agent, and shows them an empty placeholder instead of the draft, so they neither see its content nor count toward the link's maximum uses. Link checkers that send a `HEAD` request, and browsers prefetching a link before it is clicked, are treated the same way. To add another service, extend the regular expression in `shareadraft_bot_user_agent_pattern`:

```php
add_filter(
	'shareadraft_bot_user_agent_pattern',
	fn ( string $pattern ): string => str_replace( '/bot|', '/bot|mattermost|', $pattern )
);
```

## Revoke a person's links on other events

A person's links are revoked automatically when their user account is deleted, but not when their role changes (see [when someone leaves](managing-links.md#when-someone-leaves)). To revoke them on other events, trigger the `shareadraft_revoke_user_links` action with the user's ID:

```php
// Revoke a user's preview links when they lose edit access.
add_action(
	'set_user_role',
	function ( int $user_id, string $role ): void {
		if ( ! in_array( $role, array( 'administrator', 'editor', 'author' ), true ) ) {
			do_action( 'shareadraft_revoke_user_links', $user_id );
		}
	},
	10,
	2
);

// Multisite: revoke when a user is removed from this site.
add_action(
	'remove_user_from_blog',
	function ( int $user_id ): void {
		do_action( 'shareadraft_revoke_user_links', $user_id );
	}
);
```

## Record when a person's links are revoked

Once all of a user's links have been revoked, however that was triggered, the `shareadraft_revoked_user_links` action runs with the user's ID, how many links were revoked, and the ID of the user who started it (0 when it happened automatically). Use it to record offboarding in an audit log:

```php
add_action(
	'shareadraft_revoked_user_links',
	function ( int $user_id, int $count, int $actor ): void {
		// For example, send to your audit log.
	},
	10,
	3
);
```
