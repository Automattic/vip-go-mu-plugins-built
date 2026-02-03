# Setup

## Developing locally

### Prerequisites

You'll need the VIP-CLI to create a local development environment to test this live.

### Setup

Run `vip dev-env create` to create a new development environment.
Once the environment has been created, you can start it with `composer start`, this will run, under the hood `npm run build:dev` and `vip dev-env start`.
The first piece is required for you to have the built JS for the Cookie Management Platform (CMP)

If you are actively developing the CMP assets use `npm run start:js` to have live-updates on edits.

### Environment Configuration (env.php)

Create an `env.php` file in the plugin root for local configuration. This file is gitignored and auto-loaded if present:

```php
<?php
define( 'VIP_AGENTFORCE_CONFIGS', [
    'ingestion_api_instance_url' => 'https://your-instance.salesforce.com',
    'ingestion_api_token'        => 'your-token',
    'ingestion_api_source_name'  => 'your-source',
    'ingestion_api_object_name'  => 'your-object',
    // ... other config values
] );
```

### Developer Mode

Enable developer mode for additional local testing tools:

```php
define( 'VIP_AGENTFORCE_DEVELOPER_MODE', true );
```

This loads `dev/setup.php` which provides dev-only features.

#### Mock Ingestion API

When testing ingestion locally without a real Salesforce instance, enable the mock API:

```php
define( 'VIP_AGENTFORCE_DEVELOPER_MODE', true );
define( 'VIP_AGENTFORCE_MOCK_INGESTION_API', true );
```

This intercepts all ingestion API calls and returns mock success responses, logging request details via `error_log()`.

## End-to-End Tests

The Playwright suite lives under `tests/e2e` and depends on a disposable VIP dev-env site. The npm scripts in that directory will provision the environment, run the tests, and tear everything down.

### Requirements

- VIP CLI with access to create local environments (`vip dev-env ...`).
- Node.js 20 (run `nvm use` against `tests/e2e/.nvmrc`).
- Playwright browsers (the install step below handles this).

### One-time install

```bash
cd tests/e2e
nvm use
npm install
npx playwright install --with-deps
```

The initial install downloads the Playwright browsers and ensures the CLI has the required dependencies.

### Running the full suite

Run the tests from the `tests/e2e` directory so the relative paths in the config resolve correctly:

```bash
cd tests/e2e
npx playwright test -c playwright.config.ts
```

The Playwright config uses `lib/global-setup.ts` to sign in as `vipgo` and saves the session in `e2eStorageState.json`. Tests that need to clear WordPress sessions opt-in to their own storage state so the shared admin login remains available to the rest of the suite.

`package.json` wires `npm test` to the same command and includes a `pretest` hook (`bin/setup-env.sh`) that creates a fresh site at the `e2e-agentforce-test-site` slug and a `posttest` hook that destroys it. If you stop the run early, clean up manually with:

```bash
vip dev-env destroy --slug=e2e-agentforce-test-site
```

### Running individual specs

To focus on a single spec, pass the relative path after the config:

```bash
cd tests/e2e
npx playwright test -c playwright.config.ts specs/highlight-mfa-users.spec.ts
```

The global setup still runs so the test inherits the signed-in state.
