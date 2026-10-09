Feature: Preview links can be revoked from the command line

	Revoking leaves the tombstone the preview gate reads, so a visitor opening
	a revoked link is told why it stopped working rather than seeing a bare
	404. The wider scopes are the incident-response levers: `<post-id> --all`
	when a post's URL leaks, `--created-by` when someone leaves, and a bare
	`--all` as the break-glass revoke-everything.

	Background:
		Given a WP installation with the Share a Draft plugin

	Scenario: A link or --all must be given
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft revoke {POST_ID}`
		Then STDERR should be:
			"""
			Error: Specify the link to revoke (a token hint or full id), or --all.
			"""

	Scenario: A link and --all cannot be combined
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft revoke {POST_ID} abcd --all`
		Then STDERR should be:
			"""
			Error: Specify either a link or --all, not both.
			"""

	Scenario: Error when nothing matches
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft revoke {POST_ID} zzzz`
		Then STDERR should be:
			"""
			Error: No preview link matches "zzzz".
			"""

	Scenario: Revoke a link by the token hint the list shows
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		And I run `wp shareadraft list {POST_ID} --field=token_hint`
		And save STDOUT as {HINT}
		When I run `wp shareadraft revoke {POST_ID} {HINT}`
		Then STDOUT should be:
			"""
			Success: Revoked 1 preview link.
			"""
		When I run `wp shareadraft list {POST_ID} --format=count`
		Then STDOUT should be:
			"""
			0
			"""

	Scenario: Revoke every live link on the post at once
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		And I run `wp shareadraft create {POST_ID} --porcelain`
		When I run `wp shareadraft revoke {POST_ID} --all`
		Then STDOUT should be:
			"""
			Success: Revoked 2 preview links.
			"""
		When I run `wp shareadraft list {POST_ID} --format=count`
		Then STDOUT should be:
			"""
			0
			"""

	Scenario: A scope must be given
		When I try `wp shareadraft revoke`
		Then STDERR should be:
			"""
			Error: Specify a post ID, --created-by, or --all.
			"""

	Scenario: The creator sweep stands alone
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		When I try `wp shareadraft revoke {POST_ID} --created-by=admin`
		Then STDERR should be:
			"""
			Error: Specify --created-by on its own, without a post ID or --all.
			"""

	Scenario: Revoke every link one creator made, leaving other creators' links alone
		When I run `wp user create reviewer reviewer@example.com --role=editor --porcelain`
		And save STDOUT as {USER_ID}
		And I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --user=reviewer --porcelain`
		And I run `wp shareadraft create {POST_ID} --user=admin --porcelain`
		When I run `wp shareadraft revoke --created-by=reviewer`
		Then STDOUT should be:
			"""
			Success: Revoked 1 preview link.
			"""
		When I run `wp shareadraft list {POST_ID} --format=count`
		Then STDOUT should be:
			"""
			1
			"""

	Scenario: Break glass and revoke every live link on the site
		When I run `wp post create --post_status=draft --post_title="First draft" --porcelain`
		And save STDOUT as {FIRST_ID}
		And I run `wp shareadraft create {FIRST_ID} --porcelain`
		And I run `wp post create --post_status=draft --post_title="Second draft" --porcelain`
		And save STDOUT as {SECOND_ID}
		And I run `wp shareadraft create {SECOND_ID} --porcelain`
		When I run `wp shareadraft revoke --all --yes`
		Then STDOUT should be:
			"""
			Success: Revoked 2 preview links.
			"""
		When I run `wp shareadraft list --format=count`
		Then STDOUT should be:
			"""
			0
			"""
