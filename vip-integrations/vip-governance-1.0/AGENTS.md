# AGENTS.md - AI Agent Guide for VIP Block Governance Plugin

## Project Overview

This is the **WordPress VIP Block Governance Plugin** — a WordPress plugin that adds governance capabilities to the Gutenberg block editor. It controls:

- **Block insertion**: Which blocks can be inserted (opt-in model — only explicitly allowed blocks are available).
- **Block interaction**: Which styling options and settings are available per block, at any nesting level.
- **Feature access**: Whether code editor and block locking are enabled.

The plugin uses a JSON-based rules system (`governance-rules.json`) with support for default rules, role-based rules, and post-type-based rules.

## Architecture

### Tech Stack

- **PHP 8.2+** — Backend logic, rule parsing, REST API, settings panel
- **JavaScript/JSX** — Block editor integration via WordPress filters
- **WordPress 6.8+** — Target platform
- **Webpack** — Build system (via `@wordpress/scripts`)
- **Composer** — PHP dependency management
- **npm** — JS dependency management

### Directory Structure

```
vip-governance.php              # Main plugin entry point (constants, require statements)
governance-rules.json           # Default governance rules (ships with plugin)
governance-schema.json          # JSON Schema for validating rules
governance/
  analytics.php                 # VIP-only usage and error analytics
  block-locking.php             # Block lock/unlock feature
  governance-utilities.php      # Core rule parsing and filtering logic
  init-governance.php           # Plugin initialization, asset loading
  nested-governance-processing.php  # Nested block settings and CSS generation
  rules-parser.php              # JSON parsing and runtime rule-logic validation
  rest/
    rest-api.php                # REST endpoint: vip-governance/v1/rules
  settings/
    settings.php                # Admin settings page registration
    settings-view.php           # Settings page HTML template
    settings.js                 # Settings page frontend logic
    settings.css                # Settings page styles
src/
  index.js                      # JS entry point — block editor filter setup
  block-utils.js                # Block name matching, hierarchy validation
  block-locking.jsx             # React UI for block locking
  nested-governance-loader.js   # Loads nested governance settings
bin/release                     # Creates and commits major/minor/patch release branches
build/                          # Compiled JS output (do not edit directly)
tests/
  GovernanceUtilitiesTest.php  # PHPUnit tests for rule logic
  RulesParserTest.php           # PHPUnit tests for schema validation
  NestedGovernanceProcessingTest.php  # PHPUnit tests for CSS generation
  e2e/                          # Playwright end-to-end tests
  private/                      # Test governance rules files
```

### Key Constants (PHP)

```php
WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_FILE       // Plugin file path
WPCOMVIP_GOVERNANCE_ROOT_PLUGIN_DIR        // Plugin directory path
WPCOMVIP__GOVERNANCE__PLUGIN_VERSION       // '1.0.16'
WPCOMVIP__GOVERNANCE__RULES_SCHEMA_VERSION // '1.0.0'
WPCOMVIP__GOVERNANCE__RULES_REST_ROUTE     // 'vip-governance/v1'
WPCOMVIP_GOVERNANCE_RULES_FILENAME         // 'governance-rules.json'
```

### JavaScript Global

The plugin exposes `VIP_GOVERNANCE` to the block editor with:

- `error` — Error string or `false`
- `governanceRules` — Parsed rules for the current user
- `nestedSettings` — Pre-computed nested block settings
- `urlSettingsPage` — URL to the admin settings page

## Governance Rules System

### Rule Types

| Type       | Required Field | Description                        |
| ---------- | -------------- | ---------------------------------- |
| `default`  | (none)         | Baseline rules for all users       |
| `role`     | `roles`        | Rules for specific WordPress roles |
| `postType` | `postTypes`    | Rules for specific post types      |

### Rule Properties

- `allowedFeatures` — Array: `"codeEditor"`, `"lockBlocks"`
- `allowedBlocks` — Array of block names or wildcards (e.g., `"core/*"`, `"core/paragraph"`)
- `blockSettings` — Nested object matching `theme.json` block settings structure

### Rule Priority (ascending)

1. Post Type rules
2. Role rules (highest priority — overrides post type rules)

Only the first matching rule of each type is used. A role rule replaces fields it defines from a matching post-type rule; omitted fields retain the post-type value. The default rule is then added to the selected non-default values. Schema: `https://api.wpvip.com/schemas/plugins/governance.json`

### Wildcard Limitation

`allowedBlocks` is not respected when a parent `blockSettings` uses a wildcard key. Specify `allowedBlocks` on individual parent blocks instead.

## PHP Filters (Hooks)

| Filter                                                | Language | Purpose                                                                |
| ----------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| `vip_governance__governance_file_path`                | PHP      | Change which rules file is loaded                                      |
| `vip_governance__governance_rules_json`               | PHP      | Modify or dynamically set rules JSON                                   |
| `vip_governance__is_block_allowed_for_insertion`      | JS       | Override block insertion decisions                                     |
| `vip_governance__is_block_allowed_for_editing`        | JS       | Override block editing decisions                                       |
| `vip_governance__is_block_allowed_in_hierarchy`       | JS       | Toggle cascading vs restrictive mode                                   |
| `vip_governance__default_role_for_user_without_roles` | PHP      | Provide fallback role for roleless users (e.g., multisite superadmins) |

## Development

### Prerequisites

- Docker (for `wp-env`)
- Node.js 24
- PHP 8.2+
- Composer

### Setup

```bash
npm ci               # Installs JavaScript and production Composer dependencies
composer install     # Adds PHP development tools
npx wp-env start     # Starts the local WordPress environments
```

### Building

```bash
npm run build        # Production build (webpack)
npm run dev          # Watch mode for development
```

### Linting

```bash
npm run lint         # Runs Prettier check, ESLint, and PHPCS
npm run format       # Auto-format with Prettier
```

### Testing

**PHP unit tests:**

```bash
wp-env start
composer install
composer run test
```

**JS unit tests:**

```bash
npm install
npm run test:js
```

**E2E tests:**

```bash
wp-env start
composer install
npm install
npx playwright install chromium --with-deps
npx playwright test
```

**Combined unit tests:**

```bash
npm run test         # Runs both PHP and JS unit tests
```

### Code Standards

- **PHP**: WordPress-VIP-Go + WordPress-Extra via PHPCS
- **JS**: `@automattic/eslint-plugin-wpvip`
- **Formatting**: Prettier with `@automattic/eslint-plugin-wpvip/prettierrc`

### CI Matrix (GitHub Actions)

- **PHP versions**: 8.2, 8.3, 8.4, 8.5
- **WordPress versions**: 6.8, latest
- **Checks on PR**: JS lint, JS unit tests, PHPCS, PHPUnit (5 matrix combinations)
- **Release on trunk push**: Auto-creates a GitHub release and ZIP when the plugin header version changes

## Writing Tests

### PHP Unit Tests

- **Location**: `tests/*Test.php`
- **Namespace**: `WPCOMVIP\Governance\Tests`
- **Base class**: `PHPUnit\Framework\TestCase`
- **Naming**: Class `FooTest extends TestCase`, methods `test_descriptive_name()`
- **Fixtures**: Test governance rules live in `tests/private/governance-rules.json`
- **Run one file**: `composer run test -- --filter=GovernanceUtilitiesTest`
- **Multisite tests**: `composer test-multisite` (uses `tests/phpunit/multisite.xml`)

Example structure:

```php
namespace WPCOMVIP\Governance\Tests;

use WPCOMVIP\Governance\GovernanceUtilities;
use PHPUnit\Framework\TestCase;

class MyNewTest extends TestCase {
    public function test_my_feature() {
        // ...
        $this->assertEquals( $expected, $actual );
    }
}
```

### JS Unit Tests (Jest)

- **Location**: Co-located with source as `src/foo.test.js` next to `src/foo.js`
- **Framework**: Jest with `@wordpress/jest-preset-default`
- **WordPress mocks**: Mock `@wordpress/hooks`, `@wordpress/data`, etc. via `jest.mock()`
- **Style**: `describe` / `it` blocks
- **Run one file**: `npx jest src/block-utils.test.js`

Example structure:

```js
import { myFunction } from './my-module';

describe( 'myFunction', () => {
	it( 'should do something', () => {
		expect( myFunction( input ) ).toBe( expected );
	} );
} );
```

### E2E Tests (Playwright)

- **Location**: `tests/e2e/*.spec.js`
- **Framework**: Playwright with `@wordpress/e2e-test-utils-playwright`
- **Global setup**: `tests/e2e/globalSetup.js` — authenticates as admin, resets posts/blocks/preferences
- **Auth state**: Saved to `artifacts/storage-states/admin.json`
- **Fixtures**: Uses WordPress `admin`, `editor`, and `page` fixtures from `@wordpress/e2e-test-utils-playwright`
- **Run one file**: `npx playwright test tests/e2e/my-test.spec.js`

Example structure:

```js
import { expect, test } from '@wordpress/e2e-test-utils-playwright';

test.describe( 'My Feature', () => {
	test.beforeEach( async ( { admin } ) => {
		await admin.createNewPost( { legacyCanvas: true } );
	} );

	test( 'should do something', async ( { editor, page } ) => {
		// interact with the block editor
	} );
} );
```

## Debugging

### Local Environment

- **URL**: `http://localhost:8889` (wp-env default for tests; main instance on `localhost:8888`)
- **Admin credentials**: `admin` / `password` (wp-env defaults)
- **Private dir mapping**: `wp-content/private` maps to `./tests/private` (configured in `.wp-env.json`)

### Debugging Governance Rules

1. **Admin settings page**: Navigate to `VIP Block Governance` in the WordPress admin. It shows:
   - Whether the plugin is active
   - All parsed rules, with JSON and rule-logic errors highlighted
   - Combined rules preview for a specific role and/or post type
2. **REST API**: `GET /wp-json/vip-governance/v1/rules?role=<role>&postType=<post-type>` — returns merged rules for an optional role and/or post type (requires `manage_options` capability)
3. **Browser devtools**: Inspect the `VIP_GOVERNANCE` global in the console. It contains:
   - `governanceRules` — the resolved rules for the current user
   - `nestedSettings` — pre-computed nested block settings
   - `error` — any error string, or `false`

### Common Debugging Steps

- **Rules not applying?** Check that `governance-rules.json` is in the private directory and validates against the schema. Use the admin settings page to verify.
- **Block still visible?** Starting from WordPress 6.8, the block inserter shows all blocks — disallowed ones trigger a snackbar on insert attempt.
- **JS not updating?** Run `npm run build` or `npm run dev` (watch mode). Check that `build/index.js` was regenerated.
- **PHP changes not reflecting?** Ensure `wp-env` is running. No build step needed for PHP.
- **Test failures in CI?** Check the CI matrix — tests run against PHP 8.2–8.5 and WP 6.8/latest. Failures may be version-specific.
- **Unexpected vendor changes?** Composer regenerates tracked metadata under `vendor/composer`. Only commit those changes when intentionally updating the production dependency bundle.

## REST API

### `GET vip-governance/v1/rules?role=<role>&postType=<post-type>`

Returns merged governance rules for an optional role and/or post type. Requires `manage_options` capability.

**Response shape:**

```json
{
  "allowedBlocks": [...],
  "blockSettings": {...},
  "allowedFeatures": [...]
}
```

## Important Notes

- The plugin takes an **opt-in approach**: an empty effective rule set severely limits the editor. The bundled fallback rule explicitly allows all blocks and supported features.
- Always include `core/paragraph` in `allowedBlocks` for default rules — the editor uses it as an insertion primitive.
- The plugin only works in the **post editor** (not site-editor, widgets, etc.).
- Starting from WordPress 6.8, the block inserter sidebar shows all blocks regardless; disallowed blocks show a snackbar error on insertion attempt.
- Analytics are VIP-only and contain no content/metadata — just counters with site ID. Usage is sampled on roughly 10% of configuration loads.
