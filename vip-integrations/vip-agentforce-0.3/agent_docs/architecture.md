# Architecture

## Directory Structure

```
vip-agentforce.php          # Main plugin file — entry point
modules/
  index.php                 # Module loader
  cmp/                      # Conversational Messaging Platform (chatbot UI)
    class-agentforce.php    # Agentforce API integration
    class-assets.php        # Frontend asset enqueueing
    class-cmp.php           # Core CMP logic
    class-settings-page.php # WP admin settings page
  ingestion/                # Content ingestion to Salesforce
    class-ingestion.php     # Core ingestion orchestrator
    class-ingestion-cli.php # WP-CLI commands
    class-ingestion-cron.php
    class-ingestion-queue.php
    class-ingestion-rest.php
    class-ingestion-config-filters.php
    class-ingestion-post-record.php
    class-ingestion-sync-progress.php
    class-default-transformer.php
    class-ingestion-api-result.php
    class-sync-result.php
    class-ingestion-failure.php
    class-deletion-failure.php
utils/
  class-configs.php         # Plugin configuration
  class-constants.php       # Shared constants
  class-logger.php          # Logging utility
  class-collector.php       # Data collector
  class-tracking.php        # Event tracking
  dev-env.php               # Dev environment helpers
  metrics.php               # Metrics collection
  traits/                   # Shared PHP traits
assets/                     # Frontend source (JS/CSS)
tests/
  bootstrap.php             # Test bootstrap
  phpunit/                  # PHPUnit test files (test-*.php)
    doubles/                # Test doubles / stubs
  e2e/                      # Playwright end-to-end tests
bin/                        # Shell scripts (test runner, PHPCBF)
docs/                       # Project documentation
vip-config/                 # WordPress VIP config
mu-plugins/                 # Must-use plugins (platform-managed)
```

## Key Modules

- **CMP (modules/cmp/)**: Salesforce Agentforce chatbot widget — settings page, asset loading, API communication
- **Ingestion (modules/ingestion/)**: Syncs WordPress content to Salesforce — CLI, REST API, cron, queue-based processing

## Configuration

- Plugin config via `VIP_AGENTFORCE_CONFIGS` constant and WordPress filters
- Environment config via `env.php` (gitignored)
- PHPStan config: `phpstan.neon` (level 6)
- PHPCS config: `.phpcs.xml.dist`
- Webpack config: `webpack.config.js`
- Babel config: `babel.config.js`
