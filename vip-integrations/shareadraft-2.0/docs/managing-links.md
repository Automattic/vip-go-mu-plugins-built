# Managing preview links

Every preview link can limit how many people open it and can be revoked on its own. Editors and administrators can also revoke links in bulk and make sure links do not outlive the people who created them, and administrators can pause every link on the site at once. This page covers each of those. Everything here can also be done from the shell with [WP-CLI](wp-cli.md), or by AI assistants through the [Abilities API](abilities.md).

None of this applies to links made with Share a Draft 1.x. Each of those keeps working until it expires, and only the person who made it can delete it, under Posts → Share a Draft (Old). Support for 1.x links is removed in 2.1.0.

## Limiting how many people can open a link

When you generate a link, **Maximum uses** sets how many people can open it. Leave it empty for no limit. Once that many people have opened the link, anyone new is told it has been used up, while the people who already opened it can keep coming back until it expires.

Share a Draft tells people apart by browser, not by who they are, since reviewers do not log in. The first time a browser opens the link, it is given a cookie that counts it as one person, so:

- A reviewer who opens the link in another browser, on another device, or in a private window counts as another person.
- A reviewer who clears their cookies counts again the next time they open the link.
- Several people sharing one browser count as one.
- A browser is remembered for a week. If your site offers links that last longer than that, a reviewer who returns after a week counts again.
- The cookie is signed with your site's security keys, so if those keys change, every reviewer counts again the next time they open the link.

Chat apps and crawlers that fetch the link to show a preview are never counted, nor are link checkers and browser prefetches.

Take care when emailing a link with a limit. Many organizations route incoming mail through a security service (such as Microsoft Defender Safe Links, Proofpoint, or Mimecast) that opens every link in a message before the recipient sees it, posing as an ordinary browser so that sites cannot hide anything from it. Share a Draft cannot tell that visit from a real reviewer's, so it counts, and a link limited to one person can be used up before the reviewer clicks it. To email a link to someone at an organization like that, [bind it to them as a named reviewer](hosting.md#links-for-named-reviewers-need-working-outgoing-email): nothing is counted until they have confirmed their email address, which a scanner cannot do.

If you expect a reviewer to switch devices, allow for it when you set the limit. For a link only certain people should open, whatever browser they use, [bind it to named reviewers](hosting.md#links-for-named-reviewers-need-working-outgoing-email) instead.

## Revoking a link

A revoked link stops working immediately. There are two places to do it:

- **In the post editor.** Choose **Manage preview links** in the draft's Share a Draft panel (or, on the classic editing screen, the Share a Draft box) to see each of its links, with how often it has been used and when it expires, and revoke any of them.
- **On the Preview Links screen.** Every link on the site is listed under **Preview Links** in the admin menu, with the post it belongs to, who created it, its usage, reviewers, IP restrictions, and expiry. Revoke a link from its row, or select several and use the **Revoke** bulk action.

A reviewer who opens a revoked link is told it has been revoked, rather than seeing a bare "not found". Links are also discarded automatically when their draft is published, made private, or moved to the trash, and none can be made for a post in those states.

## Pausing every link

If you suspect a link has leaked but do not know which one, an administrator can switch off every preview link on the site at once, with the toggle at the top of the Preview Links screen.

Pausing does not change any link. While links are paused, none of them work, and new links cannot be used either. When you switch them back on, each link works exactly as it did before: its expiry, its usage limit, and its reviewers are untouched, and links that expired in the meantime stay expired. That makes pausing safe to use on suspicion, and safe to undo after a false alarm, unlike revoking everything, which would mean creating and resending every link people are still using.

While links are paused, the Preview Links screen shows who paused them and when, the block editor warns anyone creating or managing links that they will not work, and reviewers who open a link are told that preview links are temporarily disabled on the site. A link that has expired, been revoked, or reached its viewing limit says so instead, since it will not work once links are back on either.

## Revoking in bulk

To revoke more than one page of links at once, select the checkbox at the top of the table to select the page. If there are more links than the page shows, a **Select all** option extends the selection across every page. Choose **Revoke** from the bulk actions to revoke the whole selection.

To revoke everything one person created, click their name in the **Created by** column first, so the table shows only their links, then select all. Revoking every link on the whole site, for a confirmed leak, is limited to administrators.

Bulk revoking works through links in batches. On a site with a very large number of shared posts, the remainder is finished in the background within a few minutes, and links not yet reached keep working until then. A bulk revoke covers the links that existed when it started, so a link created while it is still finishing is not revoked.

## When someone leaves

When a user account is deleted, every link that person created is revoked automatically. On a multisite network, deleting the account from the network revokes their links on every site they belong to. A super admin's links on sites they are not a member of are not revoked this way, so revoke those on each site before deleting the account.

Changing someone's role deliberately does not revoke their links: moving an editor to author should not necessarily cut off reviews already under way. If your process should revoke links on other events, such as a role change or a user being removed from a site on a multisite network, a few lines of code can [revoke a person's links on other events](customizing.md#revoke-a-persons-links-on-other-events). Another hook lets you [record when a person's links are revoked](customizing.md#record-when-a-persons-links-are-revoked), for example in an audit log.

For other ways to adjust how links behave, see [customizing Share a Draft](customizing.md).
