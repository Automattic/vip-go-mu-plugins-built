Feature: Preview links can be listed from the command line

	`list` shows live links only — the same rule as the editor and REST — and
	never the token itself, which is not stored; the token hint is how a link
	in the list is matched to a URL that was shared.

	Background:
		Given a WP installation with the Share a Draft plugin

	Scenario: Error when the post does not exist
		When I try `wp shareadraft list 999999`
		Then STDERR should be:
			"""
			Error: The post could not be found.
			"""

	Scenario: A post with no links says so
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I run `wp shareadraft list {POST_ID}`
		Then STDOUT should be:
			"""
			No preview links found.
			"""

	Scenario: A created link is listed with its fields
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		When I run `wp shareadraft list {POST_ID} --format=csv`
		Then STDOUT should contain:
			"""
			token_hint,created_by,created_at,expires_at,expires_in,use_count,max_uses,recipients,allowed_ips
			"""
		When I run `wp shareadraft list {POST_ID} --format=count`
		Then STDOUT should be:
			"""
			1
			"""

	Scenario: The creator is attributed when minting with --user
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --user=admin --porcelain`
		When I run `wp shareadraft list {POST_ID} --field=created_by`
		Then STDOUT should contain:
			"""
			admin
			"""

	Scenario: The token hint is the last characters of the token
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		When I run `wp shareadraft list {POST_ID} --field=token_hint`
		Then STDOUT should match /^[0-9a-f]{4}$/

	Scenario: Warn when preview links are disabled site-wide
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		And I run `wp option update shareadraft_disabled '{"disabled_at":1757300000,"disabled_by":1}' --format=json`
		When I run `wp shareadraft list {POST_ID}`
		Then STDOUT should contain:
			"""
			Warning: Preview links are currently disabled site-wide. None of the listed links will work until an administrator re-enables preview links.
			"""

	Scenario: The creator filter belongs to the site-wide listing
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft list {POST_ID} --created-by=admin`
		Then STDERR should be:
			"""
			Error: Specify either a post ID or --created-by, not both.
			"""

	Scenario: The site-wide listing filters by creator
		When I run `wp user create reviewer reviewer@example.com --role=editor --porcelain`
		And I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --user=reviewer --porcelain`
		And I run `wp shareadraft create {POST_ID} --user=admin --porcelain`
		When I run `wp shareadraft list --created-by=reviewer --format=count`
		Then STDOUT should be:
			"""
			1
			"""

	Scenario: Listing the whole site includes every post's links
		When I run `wp post create --post_status=draft --post_title="First draft" --porcelain`
		And save STDOUT as {FIRST_ID}
		And I run `wp shareadraft create {FIRST_ID} --porcelain`
		And I run `wp post create --post_status=draft --post_title="Second draft" --porcelain`
		And save STDOUT as {SECOND_ID}
		And I run `wp shareadraft create {SECOND_ID} --porcelain`
		When I run `wp shareadraft list --format=count`
		Then STDOUT should be:
			"""
			2
			"""
		When I run `wp shareadraft list --field=post_id`
		Then STDOUT should contain:
			"""
			{FIRST_ID}
			"""
		And STDOUT should contain:
			"""
			{SECOND_ID}
			"""
