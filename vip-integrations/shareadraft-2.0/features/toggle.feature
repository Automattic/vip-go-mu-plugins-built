Feature: Preview links can be paused and restored from the command line

	`disable` flips the same site-wide switch as the admin page's toggle: a
	reversible pause, not a revocation. Every link keeps its own state and
	simply stops working until `enable` flips the switch back, which makes it
	the first response to a suspected leak.

	Background:
		Given a WP installation with the Share a Draft plugin

	Scenario: Disable and re-enable preview links
		When I run `wp shareadraft disable`
		Then STDOUT should be:
			"""
			Success: Preview links disabled.
			"""
		When I run `wp shareadraft enable`
		Then STDOUT should be:
			"""
			Success: Preview links enabled.
			"""

	Scenario: Flipping to the state already held says so
		When I run `wp shareadraft enable`
		Then STDOUT should be:
			"""
			Success: Preview links are already enabled.
			"""
		When I run `wp shareadraft disable`
		And I run `wp shareadraft disable`
		Then STDOUT should be:
			"""
			Success: Preview links are already disabled.
			"""

	Scenario: Listing warns while links are disabled
		When I run `wp post create --post_status=draft --post_title="A draft" --porcelain`
		And save STDOUT as {POST_ID}
		And I run `wp shareadraft create {POST_ID} --porcelain`
		And I run `wp shareadraft disable`
		When I run `wp shareadraft list {POST_ID}`
		Then STDOUT should contain:
			"""
			Warning: Preview links are currently disabled site-wide.
			"""
