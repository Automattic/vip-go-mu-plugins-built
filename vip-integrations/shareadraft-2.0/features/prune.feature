Feature: Dead preview links can be pruned from the command line

	Expired and revoked links are deliberately retained for a grace period so
	the gate can explain a stale link to a returning reviewer; `prune` is the
	manual form of the daily sweep, and `--grace=0` the incident-cleanup form
	that forgets dead links immediately.

	Background:
		Given a WP installation with the Share a Draft plugin

	Scenario: Reject a negative grace period
		When I try `wp shareadraft prune --grace=-1`
		Then STDERR should be:
			"""
			Error: --grace must be a non-negative number of seconds.
			"""

	Scenario: Live links are never pruned
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		When I run `wp shareadraft prune --grace=0`
		Then STDOUT should be:
			"""
			Success: Pruned 0 preview links.
			"""
		When I run `wp shareadraft list {POST_ID} --format=count`
		Then STDOUT should be:
			"""
			1
			"""

	Scenario: A freshly revoked link is retained for the grace period
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		And I run `wp shareadraft revoke {POST_ID} --all`
		When I run `wp shareadraft prune`
		Then STDOUT should be:
			"""
			Success: Pruned 0 preview links.
			"""

	Scenario: Grace zero deletes dead links immediately, leaving live ones
		When I run `wp post create --post_status=draft --post_title="First draft" --porcelain`
		And save STDOUT as {FIRST_ID}
		And I run `wp shareadraft create {FIRST_ID} --porcelain`
		And I run `wp shareadraft revoke {FIRST_ID} --all`
		And I run `wp post create --post_status=draft --post_title="Second draft" --porcelain`
		And save STDOUT as {SECOND_ID}
		And I run `wp shareadraft create {SECOND_ID} --porcelain`
		When I run `wp shareadraft prune --grace=0`
		Then STDOUT should be:
			"""
			Success: Pruned 1 preview link.
			"""
		When I run `wp shareadraft list --format=count`
		Then STDOUT should be:
			"""
			1
			"""
