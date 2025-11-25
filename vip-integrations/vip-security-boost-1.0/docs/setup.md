# Setup

## Developing locally

### Prerequisites

You'll need the VIP-CLI to create a local development environment to test this live.

### Setup

Run `vip dev-env create` to create a new development environment.
Once the environment has been created, you can start it with `vip dev-env start`.

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

`package.json` wires `npm test` to the same command and includes a `pretest` hook (`bin/setup-env.sh`) that creates a fresh site at the `e2e-sb-test-site` slug and a `posttest` hook that destroys it. If you stop the run early, clean up manually with:

```bash
vip dev-env destroy --slug=e2e-sb-test-site
```

### Running individual specs

To focus on a single spec, pass the relative path after the config:

```bash
cd tests/e2e
npx playwright test -c playwright.config.ts specs/highlight-mfa-users.spec.ts
```

The global setup still runs so the test inherits the signed-in state.
