# Hosting requirements

Share a Draft needs WordPress 6.9 or later and PHP 8.2 or later, and has nothing to configure. Most hosts need nothing more, but four things about the hosting environment are worth checking, particularly if you rely on the optional restrictions.

## Preview requests must not be served from a page cache

A preview link carries its token in the URL (`?p=13&preview=true&shareadraft-token=…`). When Share a Draft opens a draft for someone holding a valid link, it tells caches not to store the response (`nocache_headers()`), asks search engines not to index it (`X-Robots-Tag: noindex`), and stops the URL leaking to other sites (`Referrer-Policy: no-referrer`). Any full-page cache in front of WordPress, whether Varnish, nginx FastCGI cache, LiteSpeed, a caching plugin, or a CDN, must respect those headers and must never serve a cached response for a URL carrying `shareadraft-token`.

Almost every cache already skips requests with `preview=true` or an unrecognized query string. If yours does not, the first sign is usually that [maximum uses](managing-links.md#limiting-how-many-people-can-open-a-link) stop counting properly, because each visitor is recognized by a cookie that a cached response never sets. The worse and quieter failure is a cached copy of a draft being served to somebody with no link at all, so it is worth confirming rather than assuming.

## IP restrictions need the visitor's real IP address

A link can optionally be restricted to certain IP addresses or ranges. Share a Draft reads the visitor's address from `REMOTE_ADDR`, which is correct on any host where PHP talks directly to the visitor, and on hosts whose edge network already rewrites it to the visitor's address.

Behind any other reverse proxy or CDN, `REMOTE_ADDR` is the proxy's address, so every visitor would fail the check. Share a Draft deliberately refuses in that case, rather than trusting an `X-Forwarded-For` header that visitors can forge. If your site is behind a proxy, [tell Share a Draft the visitor's real address](customizing.md#behind-a-reverse-proxy-tell-share-a-draft-the-visitors-real-ip-address). Links without IP restrictions are unaffected either way.

An IP restriction limits *where* a link can be opened from, not *who* opens it: VPNs, mobile networks, and shared connections all blur it. It adds to the protection of the link itself, rather than replacing it.

## Links for named reviewers need working outgoing email

A link can optionally be bound to named reviewers. The first time a reviewer opens it in a browser, they enter their email address, Share a Draft emails them a six-digit code (only if their address is on the link's list), and the draft opens once they enter it.

Those emails are sent through `wp_mail()`, so your site must be able to deliver mail reliably. If it does not already, an SMTP plugin or a transactional email service is strongly recommended; otherwise reviewers will wait for a code that never arrives.

Each reviewer address gets 5 attempts at entering a code and 3 code emails per 15 minutes. Those limits are only watertight with a persistent object cache (such as Memcached or Redis), which every VIP site has. Without one, a burst of simultaneous guesses can get past them.

You can [change the wording of the email](customizing.md#change-the-verification-email), or [turn off named reviewers](customizing.md#turn-off-named-reviewer-or-ip-restriction-features) entirely if you would rather not depend on email.

## Scheduled events must run

When a link expires or is revoked, Share a Draft keeps a record of it for a while (21 days by default), so a reviewer who comes back to it is told why it stopped working rather than seeing "not found". A daily scheduled event then deletes those records.

If scheduled events never run, nothing breaks for reviewers, because expiry is checked whenever a link is opened, but the old records pile up. **Tools → Site Health** includes a *Preview link cleanup* check that reports whether the cleanup is scheduled and has run recently, so a stalled cleanup is visible rather than silent. You can also [change how long records are kept](customizing.md#keep-expired-and-revoked-links-for-more-or-less-time), or delete them on demand with [`wp shareadraft prune`](wp-cli.md).
