# Release steps

## 1. Bump plugin version

1. When the version is ready for release, bump the version number in `vip-block-data-api.php`. Change plugin header and `WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION` to match new version.
2. PR version changes (e.g. "Release 1.2.3") and merge to `trunk`. When a version change is detected, the `release` workflow will generate a new tag and release ZIP.

## 2. Update integrations

Patch updates (e.g. `1.2.3` -> `1.2.4`) do not require any additional steps.

This section applies if the plugin has increased by a minor (e.g. `1.2` -> `1.3`) or major (e.g. `1.2` -> `2.0`) version.

For an example updating an integration version, [see this mu-plugins PR](https://github.com/Automattic/vip-go-mu-plugins/pull/5409).

1. Ensure that the latest release of the Block Data API plugin has been [pulled in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations). Updates are synced by minor version, so a patch update of `1.2.3` will be pulled into `vip-integrations/vip-block-data-api-1.2`. If it's not, wait for the [**Update versioned external dependencies** workflow](https://github.com/Automattic/vip-go-mu-plugins-ext/actions/workflows/update-deps.yml) to pull in the latest changes, or run it manually.

2. Create a branch on [vip-go-mu-plugins](https://github.com/Automattic/vip-go-mu-plugins).
3. Update the `integrations/block-data-api.php` version to match the minor version of the plugin, e.g. `1.2`. This will correspond with the folder path for the plugin [in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations).
4. Submit the PR, get it approved, and merge.
