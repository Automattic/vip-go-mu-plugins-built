#!/usr/bin/env bash

# Cross-platform script which updates the wp-parsely version number.
# It will create a new branch and commit the changes.
#
# Usage: Specify the version to update to. For example:
#   `bin/update-version.sh 3.12.0`

set -e

export LC_ALL=C

if [ -z "$1" ]; then
  echo "Error: You must specify a version number."
  exit 1
fi

VERSION=$1

git checkout -b update/wp-parsely-version-to-$VERSION

# Function to perform in-place sed substitution.
sed_inplace() {
    local expression="$1"
    local file="$2"

    if [[ "$(uname)" == "Darwin" ]]; then
        # MacOS/BSD sed.
        sed -i '' -e "$expression" "$file"
    else
        # GNU sed (Linux).
        sed -i -e "$expression" "$file"
    fi
}

# Update version in files.
sed_inplace "s/Stable tag: .*  $/Stable tag: $VERSION  /" README.md
sed_inplace "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json
sed_inplace "s/export const PLUGIN_VERSION = '.*'/export const PLUGIN_VERSION = '$VERSION'/" tests/e2e/utils.ts
sed_inplace "s/ \* Version:           .*$/ \* Version:           $VERSION/" wp-parsely.php
sed_inplace "s/const PARSELY_VERSION = '.*'/const PARSELY_VERSION = '$VERSION'/" wp-parsely.php

npm install --ignore-scripts # Update package-lock.json with the new version.

git add README.md package.json package-lock.json tests/e2e/utils.ts wp-parsely.php && git commit -m "Update wp-parsely version number to $VERSION"
