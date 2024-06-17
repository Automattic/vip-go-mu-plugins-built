# Release steps

## 1. Create a release branch

1. Before merging a feature, create a release branch for the next target version, e.g.

    ```bash
    git checkout trunk
    git checkout -b planned-release/0.2.1
    ```

2. In GitHub, select the base branch as the `planned-release/...` branch.
3. Merge feature branches into the `planned-release/...` branch.

## 2. Bump plugin version

1. When the version is ready for release, inside the `planned-release/...` branch, bump the version number in `vip-block-data-api.php`. Change plugin header and `WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION` to match new version.
2. Push the `planned-release/...` branch to GitHub.
3. PR version changes with feature changes and merge to `trunk`.

## 3. Tag branch for release

1. In `trunk`, add a signed tag for the release:

    ```bash
    git checkout trunk
    git pull
    git tag -s -a <version> -m "Release <version>"

    # e.g. git tag -s -a 1.0.2 -m "Release 1.0.2"
    ```

2. Run `git push --tags`.

## 4. Create a release

1. In the `vip-block-data-api` folder, run this command to create a plugin ZIP:

    ```bash
    git archive --prefix "vip-block-data-api/" <version> -o vip-block-data-api-<version>.zip

    # e.g. git archive --prefix "vip-block-data-api/" 1.0.2 -o vip-block-data-api-1.0.2.zip
    #
    # Creates a ZIP archive with the prefix folder "vip-block-data-api/" containing files from tag 1.0.2
    ```

2. Visit the [vip-block-data-api create release page](https://github.com/Automattic/vip-block-data-api/releases/new).
3. Select the newly created version tag in the dropdown.
4. For the title, enter the release version name (e.g. `1.0.2`)
5. Add a description of release changes.
6. Attach the plugin ZIP.
7. Click "Publish release."

## 5. Update integrations

Patch updates (e.g. `1.2.3` -> `1.2.4`) do not require any additional steps.

This section applies if the plugin has increased by a minor (e.g. `1.2` -> `1.3`) or major (e.g. `1.2` -> `2.0`) version. 

For an example updating an integration version, [see this mu-plugins PR](https://github.com/Automattic/vip-go-mu-plugins/pull/5409).

1. Ensure that the latest release of the Block Data API plugin has been [pulled in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations). Updates are synced by minor version, so a patch update of `1.2.3` will be pulled into `vip-integrations/vip-block-data-api-1.2`. If it's not, wait for the [**Update versioned external dependencies** workflow](https://github.com/Automattic/vip-go-mu-plugins-ext/actions/workflows/update-deps.yml) to pull in the latest changes, or run it manually.

2. Create a branch on [vip-go-mu-plugins](https://github.com/Automattic/vip-go-mu-plugins).
3. Update the `integrations/block-data-api.php` version to match the minor version of the plugin, e.g. `1.2`. This will correspond with the folder path for the plugin [in `vip-go-mu-plugins-ext`](https://github.com/Automattic/vip-go-mu-plugins-ext/tree/trunk/vip-integrations).
4. Submit the PR, get it approved, and merge.
