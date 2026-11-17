# Release steps

## 1. Bump plugin version

1. Run the **Create release PR** GitHub Actions workflow on `trunk` and choose `patch`, `minor`, or `major`. It creates `release/v<version>`, updates `package.json`, `package-lock.json`, the plugin header, and `WPCOMVIP__GOVERNANCE__PLUGIN_VERSION`, then opens a PR for review.
2. Review the PR and run the relevant checks. The PR checks build the plugin and verify that tracked `build/` files match. If a version bump changes the build output, commit the updated `build/` files to the release branch before merging. Commit any intentional production `vendor/` changes as well.
3. Merge the release PR into `trunk`. The release workflow verifies the plugin header against `WPCOMVIP__GOVERNANCE__PLUGIN_VERSION`, creates the version tag and ZIP, and publishes a GitHub release.

## 2. Update integrations

Patch updates (e.g. `1.2.3` -> `1.2.4`) do not require any additional steps.

This section applies if the plugin has increased by a minor (e.g. `1.2` -> `1.3`) or major (e.g. `1.2` -> `2.0`) version.

For an example updating an integration version, [see this mu-plugins PR](https://github.com/Automattic/vip-go-mu-plugins/pull/5409).

1. Ensure that the latest release of the VIP Governance plugin has been [pulled in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations). Updates are synced by minor version, so a patch update of `1.2.3` will be pulled into `vip-integrations/vip-governance-1.2`. If it's not, wait for the [**Update versioned external dependencies** workflow](https://github.com/Automattic/vip-go-mu-plugins-ext/actions/workflows/update-deps.yml) to pull in the latest changes, or run it manually.

2. Create a branch on [vip-go-mu-plugins](https://github.com/Automattic/vip-go-mu-plugins).
3. Update the `integrations/vip-governance.php` version to match the minor version of the plugin, e.g. `1.2`. This will correspond with the folder path for the plugin [in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations).
4. Submit the PR, get it approved, and merge.
