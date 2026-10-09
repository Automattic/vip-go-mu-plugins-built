# Changelog

All notable changes to Share a Draft are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-07

**Requires WordPress 6.9 or later and PHP 8.2 or later.**

Share a Draft 2.0 is a rewrite, built from the Live Previews plugin: safe-to-share,
time- and usage-limited preview links that let a reviewer without a WordPress
account view a draft, created from the block editor and managed from a new
top-level Preview Links screen. Designed for WordPress VIP but runs on any host.

Links made with 1.x keep working until they expire. Their owners can review and
delete them under Posts → Share a Draft (Old), which only appears while they
have one; new links are made from the block editor. Support for 1.x links is
removed in 2.1.0. None of 2.0's controls apply to 1.x links: pausing links,
trusted IP ranges, viewer limits, named reviewers, the Preview Links screen,
bulk revoking, WP-CLI and the Abilities API all cover 2.0 links only, and a
1.x link keeps working even if its post is made private or trashed.

### Added

- Generate a safe-to-share preview link for a draft from the block editor, reusing WordPress's own preview flow so a logged-out reviewer sees the draft as it will publish. ([#9](https://github.com/Automattic/live-previews/pull/9), [#10](https://github.com/Automattic/live-previews/pull/10))
- Set how long each link lasts, from a configurable, filterable set of expiration options, including an optional effectively-indefinite lifetime. The editor pre-selects 8 hours, changeable with the `shareadraft_default_expiration` filter. ([#10](https://github.com/Automattic/live-previews/pull/10), [#17](https://github.com/Automattic/live-previews/pull/17))
- Limit a link by the number of distinct viewers, including one-time links; crawlers, chat unfurlers, link checkers' `HEAD` requests, and browser prefetches never spend a view. A link allows at most 1,000 viewers, which is also what a link gets when no limit is entered. The `shareadraft_max_uses_limit` filter lowers or raises that ceiling, or removes it to allow unlimited links. ([#11](https://github.com/Automattic/live-previews/pull/11))
- Manage a post's preview links from the editor — see each link's usage and time remaining, identify it by a token hint, and revoke it. ([#12](https://github.com/Automattic/live-previews/pull/12), [#17](https://github.com/Automattic/live-previews/pull/17))
- Audit and revoke every preview link on the site from a top-level Preview Links screen, with per-page screen options and contextual help. ([#34](https://github.com/Automattic/live-previews/pull/34))
- Revoke preview links in bulk: filter the Preview Links screen to one creator and revoke everything they made, or — as an administrator — revoke every link on the site in one guarded action. Links a user created are revoked automatically when their account is deleted, other offboarding flows can trigger the same sweep through the `shareadraft_revoke_user_links` action, and `shareadraft_revoked_user_links` fires afterwards for audit logging. Sweeps run in bounded batches and finish in the background on large sites. ([#46](https://github.com/Automattic/live-previews/pull/46))
- Temporarily disable all preview links with a reversible, administrator-only switch on the Preview Links screen — the first response to a suspected leak. Nothing is revoked: links keep their own expiry and usage and resume working when re-enabled. While disabled, the admin screen banners who disabled links and when, the editor's Generate and Manage modals warn that links will not work, and visitors see a "temporarily disabled" notice. ([#46](https://github.com/Automattic/live-previews/pull/46))
- Show a friendly notice when a link has expired, been revoked, or been exhausted, while unknown links stay a plain 404 so drafts cannot be enumerated. How much of the reason is disclosed is filterable, for sites that would rather say less. The notices — and the reviewer verification steps — render as a branded standalone card with the site's icon and name rather than a bare error screen, adjustable through the `shareadraft_notice_content` filter. ([#15](https://github.com/Automattic/live-previews/pull/15), [#31](https://github.com/Automattic/live-previews/pull/31))
- Sweep expired and revoked links automatically after a retention period, so a reviewer returning to a stale link is told why it stopped working rather than seeing a 404. The period is set from the VIP Dashboard through the optional `dead_link_grace_period` value and overridden by the `shareadraft_dead_link_grace_period` filter, falling back to 21 days whenever the value is absent or unusable — a blank field never means "delete links the moment they expire". ([#32](https://github.com/Automattic/live-previews/pull/32))
- Create and list preview links through the Abilities API, so MCP clients, the AI Client, and the abilities REST runner mint links under the same rules as the editor. ([#28](https://github.com/Automattic/live-previews/pull/28), [#30](https://github.com/Automattic/live-previews/pull/30))
- Manage preview links fully from MCP clients and the AI Client: abilities now also cover listing every link on the site (optionally by creator), revoking at four scopes (one link, a post's links, a creator's links for offboarding, or every link on the site), pruning dead links, flipping the site-wide switch, and a read-only status check — each behind the same capability its admin-page counterpart requires. ([#57](https://github.com/Automattic/live-previews/pull/57))
- Manage preview links from the shell with WP-CLI: `wp shareadraft create`, `list`, `revoke`, and `prune` share the same rules and telemetry as every other surface, so developers, scripts, and terminal-based agents can mint, audit, and kill links without wp-admin — including `revoke --all` when a URL leaks and `prune --grace=0` for immediate cleanup. `list` shows who created each link, matching the admin table's Created by column. While preview links are temporarily disabled site-wide, `create` and `list` warn that links will not work, matching the editor's modals. Each command is pinned by a Behat feature test against a real WordPress. The shell has since reached full parity with the Preview Links screen: `disable`/`enable` flip the site-wide switch, `revoke --created-by` sweeps one person's links, a bare `revoke --all` is the confirmed break-glass revoke-everything, and `list --created-by` mirrors the admin table's creator filter. ([#49](https://github.com/Automattic/live-previews/pull/49), [#55](https://github.com/Automattic/live-previews/pull/55), [#57](https://github.com/Automattic/live-previews/pull/57))
- Restrict where a preview link can be opened from with an optional IP allowlist: per-link CIDR ranges (IPv4 and IPv6) set when generating the link, unioned with an optional central baseline set once in the VIP Dashboard through the `ip_allowlist` value. A link must pass both the token checks and the IP check; with no ranges anywhere, behavior is unchanged. Visitors outside the allowlist see a plain 404, learning nothing about the draft. Per-link ranges are shown in the editor's Manage modal and on the Preview Links screen. ([#45](https://github.com/Automattic/live-previews/pull/45))
- Bind a preview link to named reviewers by email. A bound link asks the visitor for their address, emails a six-digit code (only ever to an address the author listed, and rate-limited), and unlocks the draft once the code is entered — so the link works for the people it was issued to, not for anyone it gets forwarded to. Verification is remembered per browser with a signed cookie, and revoking the link or removing a reviewer locks them out immediately. Reviewers are shown in the editor's Manage modal, on the Preview Links screen, and in `wp shareadraft list`; every minting surface can bind them (the Generate modal, REST, the Abilities API, and `wp shareadraft create --recipients`), and the code email is customizable with the `shareadraft_verification_email` filter.
- Switch either optional restriction off in code — `shareadraft_recipients_enabled` and `shareadraft_ip_allowlist_enabled` filters — for sites that never want them, removing the fields from the editor modals, the Preview Links screen, and the REST/ability schemas. Existing restricted links remain enforced; only minting new ones is stopped.
- Offer preview links only for post types that have a front-end view (`is_post_type_viewable()`): the editor panel does not appear for other types, and REST, the Abilities API and `wp shareadraft create` refuse them, rather than minting a link that could only 404.
- Respect a draft's post password on a preview link: the reviewer is asked for it as usual, then returned to the preview rather than a 404, and a wrong password is announced as an error instead of silently showing the form again.
- Report whether the cleanup sweep is scheduled and actually running, as a Site Health check under Tools → Site Health.
- Find and remove named reviewers' email addresses with WordPress's own Export Personal Data and Erase Personal Data tools. The export lists every preview link an address is bound to; erasing removes the address from each link, and revokes any link left with no reviewers rather than letting it open to anyone.
- Remove everything the plugin stored when it is deleted, on every site of a network: preview links and the reviewer emails bound to them, settings, and scheduled jobs.
- Ship translatable strings with a bundled POT; translations are delivered as language packs from [translate.wordpress.org](https://translate.wordpress.org/projects/wp-plugins/shareadraft/).

### Changed

- Creating and managing shared drafts moves from the Posts → Share a Draft screen to the block editor's Share a Draft panel and the Preview Links screen. The 1.x screen remains only for reviewing and deleting 1.x links, as Share a Draft (Old).
- Links carry their token as `?shareadraft-token=` on WordPress's own preview URL, and last for a chosen lifetime rather than a number of minutes, hours, days, or weeks.

### Fixed

- A draft split into pages with page breaks lets a link holder follow the links to its later pages, rather than stopping at the first.

### Removed

- Extending a link's lifetime. Generate a new link instead; the old one can be revoked.
- The bundled Bulgarian, Danish, French, and Italian translations, whose strings no longer exist. Translations now come from translate.wordpress.org.

### Security

- Store only a hash of each 2.0 link's token, enforce every link limit server-side, and keep drafts visible to link holders alone — preview requests are also marked no-index so a shared link cannot be indexed by search engines. ([#18](https://github.com/Automattic/live-previews/pull/18))
- Send reviewer verification codes only after the response has been flushed to the visitor, so a listed and an unlisted address answer the email form in the same time and response timing cannot enumerate a link's reviewer list. The code email also names the site's domain and warns never to share the code, giving reviewers concrete checks against phishing imitations. ([#63](https://github.com/Automattic/live-previews/pull/63))
- Treat a Private post as closed to preview links, as a trashed one already was: making a post Private discards its links, the editor panel does not appear on it, every minting surface refuses it, and a link left over from before still will not open it. Private means staff only, and a link must not reopen it to anonymous visitors.
- Cap guesses at a reviewer verification code per reviewer address rather than per code, so requesting a fresh code no longer brings fresh guesses, and count each guess before checking it, so parallel guesses cannot slip past the cap. With a persistent object cache, as on VIP, the counters are atomic.

### Notes for VIP

- Every value in `VIP_SHAREADRAFT_CONFIG` is optional. Defining the constant is what enables the integration; the plugin reads only `dead_link_grace_period` and `ip_allowlist`, and it runs on its built-in defaults without them. ([#35](https://github.com/Automattic/live-previews/pull/35))
- VIP support links in contextual help appear only on VIP-hosted sites, where VIP support can answer them; elsewhere they point at the plugin's own support channel. ([#35](https://github.com/Automattic/live-previews/pull/35))

## [1.7] - 2026-07-24

### Added

- A one-click button to copy a shared draft's link to the clipboard.

### Changed

- Redesigned the Share a Draft screen: the new-share form is now a collapsible "Add draft link" panel, with clearer column labels and a mobile-friendly layout.
- The "Extend" action opens in a roomy inline row instead of a cramped cell.
- Shares whose post has been deleted are cleaned up automatically.
- Internal code cleanup.

### Fixed

- Shared draft previews breaking the header and other template parts on block themes (e.g. Twenty Twenty-Five).

### Security

- Shared draft titles are escaped on output.

## [1.6] - 2026-07-23

### Fixed

- PHP 8.x deprecation notices for undeclared class properties.
- Warnings from shares whose post has since been deleted; such shares can now be removed.
- Expiry times reading "14 days, 0 hours, 0 minutes".
- A post ID comparison that could cause a valid share link to 404.

### Changed

- Tested with WordPress 7.0 and PHP 8.4.

## [1.5] - 2026-07-23

### Changed

- Tested with newer WordPress versions.
- Updated copy.
- Light cleanup of the almost 10-year-old code.

### Removed

- Seconds as a granularity level for how long a link lasts.

## [1.4] - 2012-01-01

### Added

- Your own scheduled posts are included in the list of drafts to share.
- Italian translation, thanks to gidibao's Cafe (http://gidibao.net/).
- French translation, thanks to Nicolas Brisebois-Tetreault.

### Changed

- The draft link is now a real link.
- Internal improvements.

### Removed

- PHP 4 support.

## [1.3] - 2010-05-03

### Fixed

- Draft links on installs where the WordPress URL differs from the site URL.

## [1.2] - 2009-02-05

### Added

- Plugin metadata is translatable, through a `Text Domain` header.
- A new screenshot.

### Changed

- Focus moves to the expiry field when the share form opens.
- Buttons are styled the WordPress 2.7 way.
- Updated the POT and the Bulgarian translation.
- Reindented the code and removed camel case.

## [1.1] - 2008-05-10

### Added

- Danish translation.

## [1.0] - 2008-05-10

### Changed

- Actions are split into separate columns, with their styling fixed for WordPress 2.3.x.

### Fixed

- The plugin URL.

## [0.7] - 2008-05-10

### Changed

- Consistent "Share a Draft" naming in strings.

## [0.6] - 2008-05-10

### Added

- An "Extend" action for shared drafts.

## [0.5] - 2008-05-10

### Added

- The "Delete" action is translatable.

## [0.4] - 2008-05-09

### Changed

- Language files moved to the `languages/` directory.

### Fixed

- Internationalization issues.

## [0.3] - 2008-03-11

### Changed

- Readme update.

## [0.2] - 2008-03-10

### Added

- First public release: share a time-limited link to a draft with anyone, with internationalization support.

[Unreleased]: https://github.com/Automattic/shareadraft/compare/2.0.0...develop
[2.0.0]: https://github.com/Automattic/shareadraft/compare/1.7...2.0.0
[1.7]: https://github.com/Automattic/shareadraft/compare/1.6...1.7
[1.6]: https://github.com/Automattic/shareadraft/compare/1.5...1.6
[1.5]: https://github.com/Automattic/shareadraft/compare/1.4...1.5
[1.4]: https://github.com/Automattic/shareadraft/compare/1.3...1.4
[1.3]: https://github.com/Automattic/shareadraft/compare/1.2...1.3
[1.2]: https://github.com/Automattic/shareadraft/compare/1.1...1.2
[1.1]: https://github.com/Automattic/shareadraft/compare/1.0...1.1
[1.0]: https://github.com/Automattic/shareadraft/compare/0.7...1.0
[0.7]: https://github.com/Automattic/shareadraft/compare/0.6...0.7
[0.6]: https://github.com/Automattic/shareadraft/compare/0.5...0.6
[0.5]: https://github.com/Automattic/shareadraft/compare/0.4...0.5
[0.4]: https://github.com/Automattic/shareadraft/compare/0.3...0.4
[0.3]: https://github.com/Automattic/shareadraft/compare/0.2...0.3
[0.2]: https://github.com/Automattic/shareadraft/releases/tag/0.2
