#!/bin/bash

# This script assumes it's run from the project root.
# It executes the PHP script responsible for compiling MJML files
# using the spatie/mjml-php library, which itself requires the
# mjml Node.js package.

# Ensure Composer dependencies are installed before running this,
# as the PHP script requires vendor/autoload.php and spatie/mjml-php.

echo "Ensuring local mjml Node.js package is installed..."
npm i mjml # Install/update local mjml package

echo "Compiling MJML templates using PHP script (email/mjml/build-mjml.php)..."
php email/mjml/build-mjml.php

if [ $? -eq 0 ]; then
    echo "MJML compilation successful. HTML templates should be updated in email/templates/"
else
    echo "MJML compilation failed. Check output from the PHP script and npm."
    exit 1
fi
