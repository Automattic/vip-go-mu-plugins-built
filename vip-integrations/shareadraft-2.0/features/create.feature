Feature: Preview links can be created from the command line

	The URL a link mints is the only moment the secret token exists in
	plaintext, so `create` prints it once; everything else in the plugin only
	ever sees the hash.

	Background:
		Given a WP installation with the Share a Draft plugin

	Scenario: Error when the post does not exist
		When I try `wp shareadraft create 999999`
		Then STDERR should be:
			"""
			Error: The post could not be found.
			"""

	Scenario: Error when the post type has no front-end view
		When I run `wp post create --post_type=wp_block --post_status=draft --post_title="A pattern" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft create {POST_ID}`
		Then STDERR should be:
			"""
			Error: Preview links are only available for content that can be viewed on the site.
			"""

	Scenario: Create a link for a draft with the default lifetime
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I run `wp shareadraft create {POST_ID}`
		Then STDOUT should contain:
			"""
			shareadraft-token=
			"""
		And STDOUT should contain:
			"""
			Success: Link expires
			"""

	Scenario: Porcelain output is just the URL, for scripts
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I run `wp shareadraft create {POST_ID} --expiration=3600 --max-uses=1 --porcelain`
		Then STDOUT should contain:
			"""
			shareadraft-token=
			"""
		And STDOUT should not match /Success/

	Scenario: Warn when preview links are disabled site-wide
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp option update shareadraft_disabled '{"disabled_at":1757300000,"disabled_by":1}' --format=json`
		When I run `wp shareadraft create {POST_ID}`
		Then STDOUT should contain:
			"""
			Warning: Preview links are currently disabled site-wide. The link was created, but it will not work until an administrator re-enables preview links.
			"""
		And STDOUT should contain:
			"""
			shareadraft-token=
			"""

	Scenario: Reject a lifetime outside the allowed set
		When I try `wp shareadraft create 1 --expiration=123`
		Then STDERR should contain:
			"""
			123 is not an allowed lifetime.
			"""

	Scenario: Reject an out-of-range viewer cap
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft create {POST_ID} --max-uses=1001`
		Then STDERR should be:
			"""
			Error: Maximum uses must be between 1 and 1000.
			"""

	Scenario: A link created without a viewer cap gets the site's maximum
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I run `wp shareadraft create {POST_ID}`
		And I run `wp shareadraft list {POST_ID} --field=max_uses`
		Then STDOUT should be:
			"""
			1000
			"""

	Scenario: Reject an invalid IP range
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft create {POST_ID} --allowed-ips=999.0.0.1`
		Then STDERR should contain:
			"""
			is not a valid IP address or CIDR range.
			"""

	Scenario: Bind a link to named reviewers
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I run `wp shareadraft create {POST_ID} --recipients=legal@example.com`
		Then STDOUT should contain:
			"""
			shareadraft-token=
			"""
		When I run `wp shareadraft list {POST_ID} --field=recipients`
		Then STDOUT should be:
			"""
			legal@example.com
			"""

	Scenario: Reject an invalid reviewer address
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft create {POST_ID} --recipients=not-an-email`
		Then STDERR should contain:
			"""
			is not a valid email address.
			"""
