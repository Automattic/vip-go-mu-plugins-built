# Release steps

## 1. Bump plugin version

1. Run the **Create release PR** workflow from GitHub Actions, selecting `trunk` and a `patch`, `minor`, or `major` version bump.
2. Review the generated PR and approve its checks if GitHub prompts you. Merging it to `trunk` creates the tag and release ZIP.

To prepare a release locally, run `bash bin/release patch` from the repository root on a clean `trunk` checkout. The script creates the branch and commits the version bump. Push the branch and open a PR when ready.

If the workflow pushes a branch but fails to open the PR, check for an existing PR or open one from that branch.

## 2. Update integrations

Patch updates (e.g. `1.2.3` -> `1.2.4`) do not require any additional steps.

This section applies if the plugin has increased by a minor (e.g. `1.2` -> `1.3`) or major (e.g. `1.2` -> `2.0`) version.

For an example updating an integration version, [see this mu-plugins PR](https://github.com/Automattic/vip-go-mu-plugins/pull/5409).

1. Ensure that the latest release of the Block Data API plugin has been [pulled in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations). Updates are synced by minor version, so a patch update of `1.2.3` will be pulled into `vip-integrations/vip-block-data-api-1.2`. If it's not, wait for the [**Update versioned external dependencies** workflow](https://github.com/Automattic/vip-go-mu-plugins-ext/actions/workflows/update-deps.yml) to pull in the latest changes, or run it manually.

2. Create a branch on [vip-go-mu-plugins](https://github.com/Automattic/vip-go-mu-plugins).
3. Update the `integrations/block-data-api.php` version to match the minor version of the plugin, e.g. `1.2`. This will correspond with the folder path for the plugin [in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations).
4. Submit the PR, get it approved, and merge.
