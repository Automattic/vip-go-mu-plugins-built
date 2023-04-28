# Release steps

## 1. Bump plugin version in `trunk`

1. Update plugin version in `vip-block-data-api.php`. Change plugin header and `WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION` to match new version.
2. PR and merge to `trunk`.

## 2. Tag branch for release

1. Add a tag for the release:

    ```bash
    git tag -a <version> -m "Release <version>"

    # e.g. git tag -a v0.1.0-alpha -m "Release v0.1.0-alpha"
    ```

2. Run `git push --tags`.

## 3. Create a release

1. In the `vip-block-data-api` folder, run this command to create a plugin ZIP:

    ```bash
    git archive --prefix "vip-block-data-api/" <version> -o vip-block-data-api-<version>.zip

	# e.g. git archive --prefix "vip-block-data-api/" v0.2.0 -o vip-block-data-api-v0.2.0.zip
	#
	# Creates a ZIP archive with the prefix folder "vip-block-data-api/" containing files from tag v0.2.0
    ```

2. Visit the [vip-block-data-api create release page](https://github.com/Automattic/vip-block-data-api/releases/new).
3. Select the newly created version tag in the dropdown.
4. For the title, enter the release version name (e.g. `v0.1.0-alpha`)
5. Add a description of release changes.
6. Attach the plugin ZIP.
7. Click "Publish release."
