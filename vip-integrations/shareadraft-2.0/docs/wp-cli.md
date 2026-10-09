# WP-CLI commands

Share a Draft adds a `wp shareadraft` command to [WP-CLI](https://wp-cli.org/), so everything you can do with preview links in the block editor and on the Preview Links screen can also be done from the shell, in scripts, or by terminal-based tools. A link created or revoked here follows exactly the same rules as one created in the editor, or through the [Abilities API](abilities.md). Run `wp help shareadraft <command>` for every option and more examples.

| Command | What it does |
| ------- | ------------ |
| `wp shareadraft create <post-id>` | Create a link and print its shareable URL (the one moment the secret token exists in plaintext). `--expiration=<seconds>`, `--max-uses=<count>`, `--allowed-ips=<ranges>`, and `--recipients=<emails>` match the editor's options; `--porcelain` prints just the URL for scripts. |
| `wp shareadraft list [<post-id>]` | List a post's live links, or every live link on the site when no post is given. `--created-by=<user>` narrows the site-wide listing to one creator, like the admin table's filter. Supports `--format=table\|csv\|json\|count\|yaml`, `--fields=`, and `--field=`. |
| `wp shareadraft revoke [<post-id>] [<link>]` | Revoke one link (a token hint from `list`, or a full link id), a post's live links (`<post-id> --all`), everything one user created (`--created-by=<user>`, for offboarding), or every live link on the site (a bare `--all`, the break-glass lever — it asks for confirmation unless `--yes`). |
| `wp shareadraft disable` / `enable` | Pause every preview link on the site, or let them work again. This is the same switch as on the Preview Links screen: see [pausing every link](managing-links.md#pausing-every-link). |
| `wp shareadraft prune` | Delete expired and revoked links past their retention period, straight away rather than waiting for the daily cleanup. `--grace=0` deletes every dead link immediately. |

There is deliberately no `update` command: a link's token, expiry, and limits are fixed when it is created, so changing a link means revoking it and creating a new one.

Because WP-CLI runs without a logged-in user, links created from the shell are attributed to no one unless the global [`--user=`](https://make.wordpress.org/cli/handbook/references/config/#global-parameters) flag says otherwise. Pass `--user` if you want the link to show up under someone's name on the Preview Links screen, and to be revoked if they leave.

While preview links are [paused site-wide](managing-links.md#pausing-every-link), `create` and `list` warn — on STDERR, so `--porcelain` and formatted output stay clean — that links will not work until an administrator switches them back on, just as the editor does.
