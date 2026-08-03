#!/bin/bash

# This script assumes it's run from the project root.
# It executes the PHP script responsible for compiling MJML files
# using the spatie/mjml-php library, which itself requires the
# mjml Node.js package.

# Ensure Composer dependencies are installed before running this,
# as the PHP script requires vendor/autoload.php and spatie/mjml-php.

set -eo pipefail

# The mjml version is pinned because the committed templates in email/templates/
# are build artifacts. MJML 5 disables mj-include by default as a security measure,
# and these templates are assembled almost entirely from includes (head, header,
# footer) -- so an unpinned install rewrites every template, losing the custom
# @font-face, the link colour, the title and the footer, while still exiting 0.
# --prefix . keeps node_modules inside the plugin; without it npm walks up the
# directory tree and installs into a parent project, since a package.json at this
# repo's root is intentionally gitignored.
MJML_VERSION="4.15.3"

echo "Ensuring local mjml Node.js package (${MJML_VERSION}) is installed..."
npm i "mjml@${MJML_VERSION}" --no-save --prefix .

# The PHP build shells out to this binary. If npm installed somewhere unexpected,
# fail here rather than part-way through the templates.
if [ ! -x ./node_modules/.bin/mjml ]; then
    echo "Expected the mjml binary at ./node_modules/.bin/mjml but it is missing." >&2
    exit 1
fi

echo "Compiling MJML templates using PHP script (email/mjml/build-mjml.php)..."
if php email/mjml/build-mjml.php; then
    echo "MJML compilation successful. HTML templates should be updated in email/templates/"
else
    echo "MJML compilation failed. Check output from the PHP script and npm." >&2
    exit 1
fi
