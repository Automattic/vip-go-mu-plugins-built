# Releasing

Create an issue from the [Release template](../.github/ISSUE_TEMPLATE/release-template.md) and follow its steps. Merging `develop` into `trunk` starts **Release wp-parsely** (`release-plugin.yml`), which tests the exact source SHA and then publishes the same package to GitHub and WordPress.org. Pushes to `trunk` that don't change the plugin version publish nothing.

Version tags contain the compiled assets and production Composer dependencies, with a `Release-Source:` commit trailer recording the tested source SHA.

## Dry runs

Run **Release wp-parsely** with `ref` set to a branch or SHA and `dry_run` enabled. It runs the checks and builds the package, uploading the ZIP and release notes as an Actions artifact, but doesn't tag, publish, or use the SVN credentials.

## Failed releases and retries

To retry the same code, rerun the failed jobs, or dispatch **Release wp-parsely** from `trunk` with the original source SHA as `ref` and `dry_run` disabled. Reruns keep the SHA that `resolve` found, but rerunning a failed `resolve` in a run dispatched with a branch as `ref` resolves the branch again. If the fix needs a code change, merge it into `trunk`, then dispatch with `ref` set to `trunk`; the push alone publishes nothing, as the version is unchanged. The workflow only publishes the current trunk version, and only if it's newer than all other version tags. It reuses an existing tag only if it built that tag from the same source SHA, and tags are never replaced, so a code fix that comes after the version's tag needs the next version. A failed WordPress.org deployment leaves the GitHub release in draft.

Finish a failed release before merging the next version into `trunk`: once `trunk` has moved on, reruns and dispatches of the earlier version stop before publishing. If that version already reached WordPress.org, publish its draft GitHub release by hand, with `wp-parsely.zip` from the failed run's artifact.
