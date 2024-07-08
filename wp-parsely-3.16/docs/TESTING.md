# Testing

Besides the commands in this document, additional testing commands can be found within [composer.json](../composer.json) under the `scripts` and `scripts-descriptions` sections.

## PHP unit tests

```
# Run all single-site unit tests.
composer test

# Run all multisite unit tests.
composer test-ms
```

## PHP integration tests

### Installing requirements

In order to run integration tests, an installation script must be executed beforehand. For this to succeed, you will need to:

- Have the `svn` command installed into your system. If you don't have it, you can install subversion to get it (`brew install subversion` if you're using brew).
- Create a new dedicated test database in your local MySQL installation. Here we will assume that the database is named `wp_tests` with a username of `root` and an empty (`""`) password.
- If you're on Windows, please also refer to [WINDOWS.md](WINDOWS.md).

To run the installation script:

1. Navigate to the main plugin directory.
2. Run the script:

	```
	./bin/install-wp-tests.sh wp_tests root "" localhost latest true
	```

	If you are using different credentials/settings, the structure of the command is as follows:

	```
	./bin/install-wp-tests.sh <db-name> <db-user> <db-pass> [db-host] [wp-version] [skip-database-creation]"
	```

**Important Notes:**
- It is recommended to always use `latest` as the value for the `wp-version` argument.
- The installation takes place into a temporary directory, which means that the related files will get deleted between reboots. The way to remediate this is just to re-run the installation script whenever needed.
- The database will be completely overwritten every time integration tests are executed.

### Running integration tests

```
# Run all single-site integration tests.
composer testwp

# You can use double dashes to add PHPUnit parameters.
composer testwp -- --filter SettingsPageTest
# The above will only run the SettingsPage test.

# Run all multisite integration tests.
composer testwp-ms
```

### Troubleshooting
- If you encounter any `require` (class not found) issues, you can usually fix them by running `composer dump-autoload`.
- If you're getting an error like `ERROR: The WordPress native unit test bootstrap file could not be found. Please set either the WP_TESTS_DIR or the WP_DEVELOP_DIR environment variable, either in your OS or in a custom phpunit.xml file.`, then most probably you need to re-run the integration tests installation script, as the related files get regularly deleted.

## PHP code coverage

### Installing requirements

To be able to run coverage commands, you'll need to install `pcov`:

```
pecl install pcov
```

Some times, `pcov` does not work out of the box if `PHP` has been installed using Homebrew. Here are some possible troubleshooting steps (version strings should be updated to the ones you're using).

```
# If missing, create a symlink to pcre2.h.
ln -s /opt/homebrew/Cellar/pcre2/10.42/include/pcre2.h /opt/homebrew/Cellar/php@7.4/7.4.33_1/include/php/ext/pcre/pcre2.h

# If the /opt/homebrew/Cellar/php@7.4/7.4.33_1/pecl symlink points to a
# directory that does not exist, create the directory.
mkdir /opt/homebrew/lib/php/pecl
```

### Running code coverage

```
composer coverage
```

## JavaScript tests

```
# Run front-end tests.
npm run test
```

## End-to-end (E2E) tests

This suite is meant to simulate actual user actions as they interact with the plugin. Tests are run against a real WordPress instance and activities are performed in a real browser. The idea is that we can provide confidence that changes going forward have the intended effect on the DOM and rendered content that plugin users and site visitors will see under various specific conditions.

### How E2E tests work

In order for the tests to do their job, they need a WordPress instance. To that end, we spin up a bare-bones containerized site and configure it to the default values for the WordPress `e2e-tests` helper. We then leverage the `@wordpress/scripts` utility's [built-in functionality](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-scripts/#test-e2e) to launch a browser via [Puppeteer](https://pptr.dev/).

The tests use the [Jest framework](https://jestjs.io/) to drive a user flow and assert on expected outcomes. In addition to the [Puppeteer API](https://github.com/puppeteer/puppeteer/blob/main/docs/api.md), there are a number of helpers to accomplish frequently performed tasks in the [`@wordpress/e2e-test-utils` package](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-e2e-test-utils/).

See this post for more information: https://make.wordpress.org/core/2019/06/27/introducing-the-wordpress-e2e-tests/

### How to run E2E tests

- Make sure that [requirements](CONTRIBUTING.md#minimum-requirements) are installed and that you have the dependencies up to date by running `npm install`.

- Start the back-end:

  - From the `wp-parsely` directory, run `npm run dev:start`. Once you see a line that says `✔ Done! (in XXXs YYYms)`, you may proceed.

- Run the tests:

  - Once your environment is ready, you can launch the e2e tests suite by running `npm run test:e2e`. This will run the test suite using a headless browser.

  - For debugging purpose, you might want to follow the test visually. You can do so by running the tests in an interactive mode: `npm run test:e2e:interactive`

  - You can also run a given test file separately: `npm run test:e2e tests/e2e/specs/activation-flow.spec.js`

- Finish:

  - When you're finished testing, the back-end containers and storage can be stopped using `npm run dev:stop`.

### Automated E2E testing

Our E2E tests are hooked into a GitHub workflow called [End-to-end (e2e) Tests](../.github/workflows/e2e-tests.yml), which uses the same environment mentioned above to spin-up a WordPress environment. Commits pushed to GitHub will be tested against that environment using our E2E tests.

## Manual smoke test

Before releasing a new wp-parsely version, we should perform a basic manual smoke test which includes the following actions:

- Disable and re-enable the plugin
- Visit the settings page and click on the tabs
- Update a setting using the settings page
- Try to save an invalid Site ID and API Secret combination
- Try the Content Helper Widget and Sidebar with:
  - An empty API Secret
  - No Site ID
- Check that The Content Helper Post List Stats appears
- Check that "ld+json" and "parsely-cfg" are injected into the front-end

This list is currently a work in progress.
