#!/usr/bin/env bash

# Script which updates the wp-parsely version number. It will create a new
# branch and commit the changes.
#
# Usage: Specify the version to update to. For example, to update to 3.7.0:
#   `bin/update-version.sh 3.7.0)`
# Note: This has only been tested with macOS sed.

git checkout -b update/wp-parsely-version-to-$1

sed -i '' "s/Stable tag: .*  $/Stable tag: $1  /" README.md
sed -i '' "s/\"version\": \".*\"/\"version\": \"$1\"/" package.json
sed -i '' "s/export const PLUGIN_VERSION = '.*'/export const PLUGIN_VERSION = '$1'/" tests/e2e/utils.ts
sed -i '' "s/ \* Version:           .*$/ \* Version:           $1/" wp-parsely.php
sed -i '' "s/const PARSELY_VERSION = '.*'/const PARSELY_VERSION = '$1'/" wp-parsely.php

npm install # Update version number in package.lock.json.

git add README.md package.json package-lock.json tests/e2e/utils.ts wp-parsely.php && git commit -m "Update wp-parsely version to $1"
