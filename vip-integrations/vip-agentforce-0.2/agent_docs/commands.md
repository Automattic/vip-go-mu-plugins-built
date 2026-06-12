# Commands

## Build

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Watch mode (dev server)
npm run start
```

## Lint

```bash
# All linters (parallel)
npm run lint

# PHP — coding standards (PHPCS)
composer lint
# or: vendor/bin/phpcs --standard=.phpcs.xml.dist

# PHP — auto-fix (PHPCBF)
composer format

# PHP — static analysis (PHPStan level 6)
composer analyze
# or: vendor/bin/phpstan analyse --memory-limit=1024M

# JS
npm run lint:js
npm run lint:js:fix

# CSS
npm run lint:css
npm run lint:css:fix
```

## Test

```bash
# Unit tests (PHPUnit via Docker)
composer test

# Non-interactive (CI / Claude in VSCode/Cursor)
composer test-noninteractive

# Filter specific test class
composer test -- --filter Ingestion_Test

# Filter specific test method
composer test -- --filter test_some_method

# Integration tests
composer test:integration

# Multisite tests
composer test:multisite

# E2E tests (Playwright)
# See tests/e2e/
```

## Dev Environment

```bash
# Start dev environment
composer start-dev

# Regenerate autoload after modifying composer.json autoload-dev
composer dump-autoload

# Generate translation POT file
npm run pot
```
