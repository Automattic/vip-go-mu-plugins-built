# Abilities (MCP and AI clients)

Share a Draft registers its preview-link operations with the WordPress [Abilities API](https://developer.wordpress.org/apis/abilities/), so software acting on a user's behalf can create and manage links as well as people can. That includes AI assistants connected through the [MCP Adapter](https://github.com/WordPress/mcp-adapter), the WordPress AI Client, and scripts using the abilities REST endpoints.

An ability runs as the WordPress user who authorized the client, and applies exactly the same rules and permission checks as the block editor, the Preview Links screen, and the [WP-CLI commands](wp-cli.md). An assistant can never do more with a link than the person it acts for.

All six abilities are public, in the `shareadraft` category:

| Ability | What it does | Who can use it |
| ------- | ------------ | -------------- |
| `shareadraft/create-preview-link` | Create a link for a draft, with the same options as the editor (how long it lasts, how many people can open it, named reviewers, and allowed IP ranges), and return its shareable URL. | Anyone who can edit the post |
| `shareadraft/list-preview-links` | List a post's links that still work, or, without a post, every working link on the site, optionally only those one person created. Each entry shows its usage, expiry, and the last four characters of its token, but never the URL: a link's URL is only ever shown once, when it is created. | Anyone who can edit the post; editors and administrators for the whole site |
| `shareadraft/revoke-preview-link` | Revoke one link, all of a post's links, everything one person created, or every link on the site. | Anyone who can edit the post; editors for one person's links; administrators for the whole site |
| `shareadraft/prune-preview-links` | Delete expired and revoked links once their retention period is over, straight away rather than waiting for the daily cleanup. | Administrators |
| `shareadraft/set-preview-links-enabled` | Pause every link on the site, or let them work again. See [pausing every link](managing-links.md#pausing-every-link). | Administrators |
| `shareadraft/get-preview-links-status` | Report whether links currently work and, if they are paused, who paused them and when. | Anyone who can edit posts |

The Abilities API is part of WordPress 6.9 and later, so the abilities are available on every site that can run Share a Draft.
