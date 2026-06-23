# Dev Environment

The default dev environment is `vip dev-env` with slug `vip-agentforce`.

Run `vip dev-env info --slug=vip-agentforce` to get current URLs and ports. Defaults:

- **Domain**: `http://vip-agentforce.vipdev.lndo.site/`
- **WP Admin**: `http://vip-agentforce.vipdev.lndo.site/wp-admin/`
- **phpMyAdmin**: `http://vip-agentforce-pma.vipdev.lndo.site/`
- **Mailpit**: `http://vip-agentforce-mailpit.vipdev.lndo.site/`
- **Multisite**: yes (single site at blog_id=1)

These values (especially ports and login URLs) may change between restarts.

## Running Multiple Worktrees

Use a unique VIP dev-env slug per worktree. The slug controls the local domain,
container names, and `vip dev-env` command target.

```bash
# From the worktree you want this environment to load:
pwd

# Use the printed path as --app-code. Pick a slug that identifies the worktree.
vip dev-env create --slug=vip-agentforce-pr48 --app-code=<absolute-path-to-this-worktree> --multisite=y --php=8.2
vip dev-env start --slug=vip-agentforce-pr48 --skip-wp-versions-check

# Get the current frontend, admin, auto-login, phpMyAdmin, and Mailpit URLs.
vip dev-env info --slug=vip-agentforce-pr48
```

Custom slugs sometimes need one extra restart cycle after the first creation.
If the login URL printed by `vip dev-env start` or `vip dev-env info` opens but
does not automatically log you in, treat the environment as not fully ready.
Use this flow before debugging app code:

```bash
vip dev-env create --slug=vip-agentforce-pr48 --app-code=<absolute-path-to-this-worktree> --multisite=y --php=8.2
vip dev-env start --slug=vip-agentforce-pr48 --skip-wp-versions-check
vip dev-env stop --slug=vip-agentforce-pr48
vip dev-env start --slug=vip-agentforce-pr48 --skip-wp-versions-check
```

Do not use `composer start-dev` for alternate slugs; that script runs
`vip dev-env start` without a slug. Build assets explicitly, then start the
named environment:

```bash
npm run build:dev
vip dev-env start --slug=vip-agentforce-pr48 --skip-wp-versions-check
vip dev-env info --slug=vip-agentforce-pr48
```

The default frontend URL pattern is usually
`http://<slug>.vipdev.lndo.site/`, but always use `vip dev-env info` as the
source of truth because login URLs and ports can change.

## Testing With An Additional Plugin

The dev-env template includes a commented volume mount for testing another
plugin alongside VIP Agentforce:

```yaml
<%# Uncomment this to add an additional plugin into the WordPress environment %>
<%# - /path/to/additional/plugin:/wp/wp-content/plugins/additional-plugin %>
```

To test a real plugin, edit `.wpvip/vip-dev-env.yml.ejs`, uncomment that second
line, and replace both sides with the correct local source path and target
plugin slug. Example:

```yaml
- /absolute/path/to/additional-plugin:/wp/wp-content/plugins/additional-plugin
```

After changing that mount line, destroy and recreate the local environment.
Restarting is not enough because the generated Lando configuration and mounts
can stay stale.

```bash
vip dev-env destroy
vip dev-env create
vip dev-env start --skip-wp-versions-check
```

For a custom slug, pass the same slug to each command:

```bash
vip dev-env destroy --slug=vip-agentforce-plugin-test
vip dev-env create --slug=vip-agentforce-plugin-test
vip dev-env start --slug=vip-agentforce-plugin-test --skip-wp-versions-check
```

Verify WordPress can see the plugin before debugging application behavior:

```bash
vip dev-env exec -- wp plugin list
vip dev-env exec -- wp plugin activate additional-plugin
```

## Local Configuration (`env.php`)

`env.php` lives in the plugin root, is gitignored, and is auto-loaded if present.
Use it to inject `VIP_AGENTFORCE_CONFIGS` and feature flags so the WP Admin
settings page and frontend behave as if the integration is wired up — without
hitting a real Salesforce org. See `docs/setup.md` for the full reference.

Use `env.php` for local-only test fixtures too, including temporary filters such
as `pre_http_request` API shims. Do not edit `.wpvip/plugin-loader.php` to inject
local config or mocks unless you are testing the loader itself. Remove temporary
`env.php` fixtures after the manual test so future dev-env runs do not inherit
fake config or mocked API responses.

Minimum useful template for agent-driven testing:

```php
<?php
// Pretend the org-level integration config came back from the VIP Config API.
define( 'VIP_AGENTFORCE_CONFIGS', [
    'salesforce_instance_url'    => 'https://example.my.salesforce.com',
    'ingestion_api_instance_url' => 'https://your-instance.salesforce.com',
    'ingestion_api_token'        => 'fake-token-for-local-dev',
    'ingestion_api_source_name'  => 'wpvip_agents',
    'ingestion_api_object_name'  => 'wordpress_post',
] );

// Unlocks `dev/setup.php` (extra admin tools, debug helpers).
define( 'VIP_AGENTFORCE_DEVELOPER_MODE', true );

// Short-circuits real Salesforce Ingestion API HTTP calls through
// `dev/mock-ingestion-api.php` when developer mode is enabled.
define( 'VIP_AGENTFORCE_MOCK_INGESTION_API', true );
```

For testing different integration shapes, keep named fixtures inside `env.php`
and switch the active fixture by changing one variable:

```php
<?php
$local_embedding_script = <<<'HTML'
<script>
function initEmbeddedMessaging() {
    window.__vipAgentforceLocalInit = true;
}
</script>
<script src="https://example.my.site.com/assets/js/bootstrap.min.js" onload="initEmbeddedMessaging()"></script>
HTML;

$agentforce_config_fixtures = [
    // Fixture names are local labels; only the nested array is assigned to
    // VIP_AGENTFORCE_CONFIGS.
    'chat_widget_enabled' => [
        'agentforce_js_sdk_activated' => true,
        'agentforce_embedding_script' => $local_embedding_script,
    ],
    'ingestion_enabled' => [
        'salesforce_instance_url'      => 'https://ingestion.example.my.salesforce.com',
        'ingestion_api_instance_url'   => 'https://ingestion-api.example.my.salesforce.com',
        'ingestion_api_token'          => 'fake-token-for-local-dev',
        'ingestion_api_source_name'    => 'wpvip_agents',
        'ingestion_api_object_name'    => 'wordpress_post',
        'ingestion_api_sync_all_posts' => true,
    ],
    'missing_ingestion_token' => [
        'salesforce_instance_url'    => 'https://missing-token.example.my.salesforce.com',
        'ingestion_api_instance_url' => 'https://ingestion-api.example.my.salesforce.com',
        'ingestion_api_source_name'  => 'wpvip_agents',
        'ingestion_api_object_name'  => 'wordpress_post',
    ],
];

$active_agentforce_config = 'ingestion_enabled';

define( 'VIP_AGENTFORCE_CONFIGS', $agentforce_config_fixtures[ $active_agentforce_config ] );
define( 'VIP_AGENTFORCE_DEVELOPER_MODE', true );
define( 'VIP_AGENTFORCE_MOCK_INGESTION_API', true );
```

Each worktree has its own plugin root, so each worktree can keep a different
gitignored `env.php` while using a different dev-env slug.

When one `env.php` needs to support multiple slugs, select the active fixture
from the request host:

```php
$active_agentforce_config = str_contains( $_SERVER['HTTP_HOST'] ?? '', 'vip-agentforce-pr48' )
    ? 'ingestion_enabled'
    : 'chat_widget_enabled';
```

`env.php` is `require_once`'d on every plugin bootstrap (see
`vip-agentforce.php`), so edits take effect on the next request — no
container restart required. Verify the constants are live:

```bash
vip dev-env exec --slug=vip-agentforce -- wp eval "
var_export( defined( 'VIP_AGENTFORCE_CONFIGS' ) ? VIP_AGENTFORCE_CONFIGS : 'undefined' );
echo PHP_EOL;
var_export( defined( 'VIP_AGENTFORCE_MOCK_INGESTION_API' ) ? VIP_AGENTFORCE_MOCK_INGESTION_API : false );
" --user=1
```

For a custom slug, run the same check against that environment:

```bash
vip dev-env exec --slug=vip-agentforce-pr48 -- wp eval "
var_export( defined( 'VIP_AGENTFORCE_CONFIGS' ) ? VIP_AGENTFORCE_CONFIGS : 'undefined' );
echo PHP_EOL;
var_export( defined( 'VIP_AGENTFORCE_MOCK_INGESTION_API' ) ? VIP_AGENTFORCE_MOCK_INGESTION_API : false );
" --user=1
```

## Local Smoke Tests

Use these checks after changing `env.php`. They do not require a Salesforce org
when the mock ingestion API is enabled.

### Browser Config and Prechat Data

Use the `chat_widget_enabled` fixture, build assets, then set the consent type
to Custom so the local custom CMP script is enqueued without a third-party CMP:

```bash
npm run build:dev
vip dev-env exec --slug=vip-agentforce -- wp option update vip_agentforce_consent_type Custom
```

Open the frontend URL from `vip dev-env info --slug=vip-agentforce`, then check
the browser console:

```js
window.vipAgentforceConsentData?.embedding
window.vipAgentforceConsentData?.prechatFields
Object.keys( window.vipAgentforceConsentData?.prechatFields || {} )
```

Expected: `embedding.bootstrapSrc` is present, `prechatFields.site_id_blog_id`
is present, and the only default prechat key is `site_id_blog_id`.

Only call `window.AgentforceCMP.loadSDK()` when the fixture contains a real
Salesforce embedding script. A placeholder bootstrap URL is enough to verify
localization, but it cannot load a working chat widget.

### Mock Ingestion CLI

Use the `ingestion_enabled` fixture with `VIP_AGENTFORCE_MOCK_INGESTION_API`
enabled. The fixture must include the four ingestion API fields and either
`ingestion_api_sync_all_posts` or `ingestion_api_categories`, otherwise the sync
preflight should fail closed.

The built-in mock returns `202` by default. To exercise specific failure paths
without replacing the mock, use a local-only token value such as `mock:401`,
`mock:403`, `mock:429`, `mock:500`, `mock:network`, or `mock:rotate-recover`.
The mock also accepts `vip_agentforce_mock_scenario` from request query/body
params and records intercepted calls in `vip_agentforce_mock_ingestion_requests`.

```bash
vip dev-env exec -- wp vip-agentforce ingestion sync --preflight-check --format=json
vip dev-env exec -- wp post create --post_title="Agentforce Local Smoke" --post_status=publish
vip dev-env exec -- wp vip-agentforce ingestion sync --reset
vip dev-env exec -- wp vip-agentforce ingestion sync
vip dev-env exec -- wp vip-agentforce ingestion process-queue --all
vip dev-env exec -- wp vip-agentforce ingestion sync --status
```

Expected: preflight reports `ready: true`, queue processing prints mock API
output instead of calling Salesforce, and sync status shows the test post was
processed.

## WP-CLI (via vip dev-env exec)

All `wp` commands go through `vip dev-env exec`:

```bash
# Run any WP-CLI command
vip dev-env exec --slug=vip-agentforce -- wp <command>

# Evaluate arbitrary PHP in the WordPress context
vip dev-env exec --slug=vip-agentforce -- wp eval "<php code>"

# Run as a specific user (needed for permissions)
vip dev-env exec --slug=vip-agentforce -- wp eval "<code>" --user=1
```

## Ingestion CLI Commands

```bash
# Sync status
vip dev-env exec --slug=vip-agentforce -- wp vip-agentforce ingestion sync-status

# Queue status
vip dev-env exec --slug=vip-agentforce -- wp vip-agentforce ingestion queue-status

# Trigger a sync
vip dev-env exec --slug=vip-agentforce -- wp vip-agentforce ingestion sync

# Process the queue
vip dev-env exec --slug=vip-agentforce -- wp vip-agentforce ingestion process-queue

# Delete records from Salesforce
vip dev-env exec --slug=vip-agentforce -- wp vip-agentforce ingestion delete <record-id>
```

## Logs

```bash
# PHP logs (errors, warnings, error_log() output)
vip dev-env logs --slug=vip-agentforce --service=php

# Nginx access/error logs
vip dev-env logs --slug=vip-agentforce --service=nginx

# Database logs
vip dev-env logs --slug=vip-agentforce --service=database

# Follow logs in real-time
vip dev-env logs --slug=vip-agentforce --service=php --follow

# Write a test log entry, then read it back
vip dev-env exec --slug=vip-agentforce -- wp eval "error_log('TEST: my message');"
vip dev-env logs --slug=vip-agentforce --service=php 2>&1 | grep "TEST:"
```

Note: `WP_DEBUG_LOG` is set to `/dev/stderr` which routes to the PHP service logs.

## Database

```bash
# Run SQL queries
vip dev-env exec --slug=vip-agentforce -- wp db query "SELECT option_name FROM wp_options WHERE option_name LIKE '%agentforce%';"

# Check options
vip dev-env exec --slug=vip-agentforce -- wp option get <option_name> --format=json

# List transients
vip dev-env exec --slug=vip-agentforce -- wp transient list --format=table

# phpMyAdmin and DB port — get current values from:
#   vip dev-env info --slug=vip-agentforce
```

## Shell Access

```bash
# Open a shell inside the container
vip dev-env shell --slug=vip-agentforce

# Run a single command inside the container (as root)
vip dev-env shell --slug=vip-agentforce --root -- <command>
```

## Cron

```bash
# List cron events
vip dev-env exec --slug=vip-agentforce -- wp cron event list --format=table

# Run a specific cron event
vip dev-env exec --slug=vip-agentforce -- wp cron event run <hook-name>
```
