<?php
// phpcs:ignoreFile

/**
 * This script creates a new branch, updates the wp-parsely version number and
 * changelog, and commits the changes into 2 separate commits. Once this is
 * done, it also asks whether it should push those changes as a PR on GitHub.
 * It will also include the changelog into the PR's body, so it can be easily
 * copy/pasted into the related GitHub release.
 *
 * Requirements: GitHub CLI (`brew install gh`).
 *
 * Usage: Run the command from a terminal that is logged into GitHub. Upgrading
 * from 3.6.2 to 3.7.0 example:
 *   `bin/release.php 3.6.2 3.7.0`
 */

// Exit if the GitHub CLI is not available.
if ( null === shell_exec( 'gh --version' ) ) {
	exit(
		'The GitHub CLI (https://cli.github.com/) is not installed. Please ' .
		'install it before running this script.'
	);
}

// Examine and assign arguments passed to the script.
if ( count( $argv ) < 3 ) {
	exit(
		'Wrong number of arguments. Should be: bin/' .
		basename( __FILE__ ) . ' $milestone_from $milestone_to'
	);
}
$milestone_from = $argv[1];
$milestone_to   = $argv[2];

// Update and commit version number.
echo "Updating and committing version number...\n";
shell_exec( 'bin/update-version.sh ' . $milestone_to );
echo "DONE\n";

// Update and commit the changelog.
echo "Updating and committing the changelog...\n";
$release_log = generate_release_log( $milestone_to );
write_to_changelog_file( $release_log, $milestone_from, $milestone_to );
shell_exec(
	'git add CHANGELOG.md && git commit -m "Update CHANGELOG.md for version "' .
	$milestone_to
);
echo "DONE! Please review the changes and amend if needed\n";

// Show a prompt to create a PR on GitHub.
echo 'Do you want to create a release PR on GitHub? [y/n]';
$confirmation = trim( (string) fgets( STDIN ) );
if ( $confirmation === 'y' ) {
	create_pull_request( $milestone_to, $release_log );
}

/**
 * Generates the changelog for the passed milestone.
 *
 * @param string $milestone The milestone for which to generate the changelog.
 * @return string The resulting changelog for the specified milestone.
 */
function generate_release_log( string $milestone ): string {
	$result = '';
	$delay  = 500; // Delay between API calls in milliseconds.
	$labels = array( // GitHub labels for which to get data.
		'Added',
		'Changed',
		'Deprecated',
		'Removed',
		'Fixed',
		'Security',
	);

	foreach ( $labels as $label ) {
		echo "Getting PRs with label \"{$label}\"...\n";
		$data = get_pull_request_data( $milestone, 'Changelog: ' . $label );
		if ( '' !== (string) $data ) {
			$result .= "### {$label}\n\n{$data}\n";
		}

		usleep( $delay * 1000 );
	}

	// Include a dependency updates link if there are any dependency updates.
	echo "Adding \"Dependency Updates\" entry\n";
	$data = get_pull_request_data( $milestone, 'Component: Dependencies', 1 );
	if ( '' !== (string) $data ) {
		$link    = "- The list of all dependency updates for this release is available [here](https://github.com/Parsely/wp-parsely/pulls?q=is%3Apr+is%3Amerged+milestone%3A{$milestone}+label%3A%22Component%3A+Dependencies%22).";
		$result .= "### Dependency Updates\n\n{$link}\n";
	}

	return $result;
}

/**
 * Gets the data of the Pull Requests that comply to the passed arguments.
 *
 * @param string $milestone The milestone of the PRs that we want to fetch.
 * @param string $label The label of the PRs that we want to fetch.
 * @param int    $limit The maximum number of results to be returned.
 * @return string|false|null The result of the `shell_exec` function.
 */
function get_pull_request_data( string $milestone, string $label, $limit = 100 ) {
	return shell_exec(
		'gh pr list --repo Parsely/wp-parsely --search "milestone:' . $milestone .
		'" --label "' . $label . '" --state merged --limit ' . $limit .
		' --json title,number,url --jq \'.[] | "- \(.title) ([#\(.number)](\(.url)))"\''
	);
}

/**
 * Creates a Pull Request on GitHub according to the specified arguments.
 *
 * @param string $milestone The milestone of the PR we're creating.
 * @param string $changelog The changelog to be added to the PR's body.
 * @return string|false|null The result of the `shell_exec` function.
 */
function create_pull_request( string $milestone, string $changelog ) {
	$title = 'Update version number and changelog for ' . $milestone . ' release';
	$body  = addcslashes( // Escape double quotes and replace h3 with h2.
		"This PR updates the plugin's version number and changelog in preparation " .
		"for the {$milestone} release.\n\n" . str_replace( '###', '##', $changelog ),
		'"'
	);

	// Create origin branch on GitHub.
	shell_exec(
		'git push --set-upstream origin update/wp-parsely-version-to-' .
		$milestone
	);

	// Push PR to GitHub.
	return shell_exec(
		'gh pr create --repo Parsely/wp-parsely --assignee "@me" --base develop ' .
		'--body "' . $body . '" --milestone "' . $milestone . '" --title "' . $title . '"'
	);
}

/**
 * Writes the passed string to the changelog file.
 *
 * @param string $release_log The string to be written to the changelog file.
 * @param string $milestone_from The milestone we're upgrading from.
 * @param string $milestone_to The milestone we're upgrading to.
 */
function write_to_changelog_file(
	string $release_log,
	string $milestone_from,
	string $milestone_to
): void {
	$date        = date( 'Y-m-d' );
	$header      = "## [{$milestone_to}](https://github.com/Parsely/wp-parsely/compare/{$milestone_from}...{$milestone_to}) - {$date}";
	$release_log = "{$header}\n\n{$release_log}";

	$find               = "## [{$milestone_from}]";
	$changelog_contents = file_get_contents( 'CHANGELOG.md' );

	if ( false === $changelog_contents ) {
		exit( 'Error: Failed getting CHANGELOG.md contents' );
	}

	$changelog_contents = str_replace(
		$find,
		$release_log . "\n" . $find,
		$changelog_contents
	);

	file_put_contents( 'CHANGELOG.md', $changelog_contents );
}
