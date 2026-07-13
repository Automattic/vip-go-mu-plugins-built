# Testing

- Do NOT mock the file you are testing.
- Write tests without mocking first, then mock only external calls (API, DB, logger).
- Verify call counts on mocked dependencies to catch unintended behavior.

## Runner

PHPUnit 9, run via Docker: `composer test-noninteractive`

## File Conventions

- Test files: `tests/phpunit/test-*.php`
- Test doubles: `tests/phpunit/doubles/`
- Class naming: `<ClassName>_Test` extending `WP_UnitTestCase` (e.g. `Ingestion_Test`, `Cmp_Tests`)
- Method naming: `test_<description>()`

## Running Tests

```bash
# All tests
composer test-noninteractive

# Specific test class
composer test -- --filter Ingestion_Test

# Specific test method
composer test -- --filter test_some_method

# Integration tests
composer test:integration
```

## Adding Tests for New Modules

1. If the module is outside `./modules/` or `./utils/` (already classmapped), add its path to `autoload-dev.classmap` in `composer.json`
2. Run `composer dump-autoload`
3. If module has global `::init()` call at file end, re-run init in `setUp()` to reset state
