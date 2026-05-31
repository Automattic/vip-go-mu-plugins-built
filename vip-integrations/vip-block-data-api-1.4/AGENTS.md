# AGENTS.md — VIP Block Data API

## Project Overview

VIP Block Data API is a WordPress plugin that converts Gutenberg block editor content into structured JSON data. It provides both a REST API and a WPGraphQL integration. Primarily designed for decoupled/headless WordPress on the WordPress VIP platform. See `vip-block-data-api.php` for the current version.

- **Language:** PHP (8.1+)
- **WordPress:** 6.0+
- **Namespace:** `WPCOMVIP\BlockDataApi`
- **License:** GPL-2.0-or-later per `composer.json` (note: the plugin header in `vip-block-data-api.php` says GPL-3)
- **Repository:** https://github.com/Automattic/vip-block-data-api

## Directory Structure

```
vip-block-data-api.php          # Plugin entry point (constants, requires)
src/
  parser/
    content-parser.php           # ContentParser — core parsing engine
    block-additions/
      core-block.php             # CoreBlock — synced pattern / reusable block support
      core-image.php             # CoreImage — adds width/height to image blocks
  rest/
    rest-api.php                 # RestApi — REST endpoint registration
  graphql/
    graphql-api-v1.php           # GraphQLApiV1 — blocksData field (deprecated)
    graphql-api-v2.php           # GraphQLApiV2 — blocksDataV2 field (current)
  analytics/
    analytics.php                # Analytics — VIP-only usage/error tracking
tests/
  bootstrap.php                  # PHPUnit bootstrap (loads WP test env)
  registry-test-case.php         # RegistryTestCase base class (auto-cleans block registry)
  parser/                        # Parser integration tests
    sources/                     # Per-attribute-source-type tests (11 files)
    blocks/                      # Per-block-type tests
  graphql/                       # GraphQL API tests
  rest/                          # REST API tests
  mocks/                         # Test mocks (e.g. GraphQLRelay)
  data/                          # Test fixture files
vendor/                          # Composer deps (only production deps committed)
```

## Architecture

### How Block Parsing Works

1. `ContentParser::parse()` fires `vip_block_data_api__before_parse_post_content`, then calls WordPress core `parse_blocks()` on post content
2. `render_parsed_block()` creates a `WP_Block` instance and calls `->render()` to resolve block bindings and synced patterns
3. The block tree is walked recursively via `source_block()`, reading sourced attributes from block HTML using Symfony DomCrawler
4. Supports all Gutenberg attribute source types: `attribute`, `rich-text`, `html`, `text`, `tag`, `raw`, `query`, `meta`, `node`, `children`
5. Returns structured array of `{ name, attributes, innerBlocks? }`

### REST Request Flow

When a request hits `GET /wp-json/vip-block-data-api/v1/posts/{id}/blocks`:

1. **`RestApi::permission_callback()`** — fires `vip_block_data_api__rest_permission_callback` filter
2. **`RestApi::get_block_content()`** — validates post ID (fires `vip_block_data_api__rest_validate_post_id`), creates `new ContentParser()`, calls `->parse($post->post_content, $post_id, $filter_options)`
3. **`ContentParser::parse()`** — runs the parsing flow described above, fires `vip_block_data_api__after_parse_blocks` on the result before returning
4. **`RestApi`** measures parse time and logs `vip-block-data-api-parser-time` analytics error if it exceeds 500ms (configurable via `WPCOMVIP__BLOCK_DATA_API__PARSE_TIME_ERROR_MS`)

### APIs

**REST API:**
- Endpoint: `GET /wp-json/vip-block-data-api/v1/posts/{id}/blocks`
- Query params: `include` (allowlist block types), `exclude` (denylist block types)
- `include` and `exclude` are mutually exclusive

**GraphQL API (requires WPGraphQL):**
- Field: `blocksDataV2` on `NodeWithContentEditor` types (posts, pages, etc.)
- Returns a flattened block list with `id` and `parentId` for hierarchy reconstruction
- Attributes are `name`/`value` string pairs; complex values are JSON-encoded with `isValueJsonEncoded: true`
- Legacy field `blocksData` (v1) is deprecated

### Key Classes

| Class | File | Purpose |
|---|---|---|
| `ContentParser` | `src/parser/content-parser.php` | Core parsing engine |
| `RestApi` | `src/rest/rest-api.php` | REST endpoint |
| `GraphQLApiV2` | `src/graphql/graphql-api-v2.php` | GraphQL integration (current) |
| `GraphQLApiV1` | `src/graphql/graphql-api-v1.php` | GraphQL integration (deprecated) |
| `CoreBlock` | `src/parser/block-additions/core-block.php` | Synced pattern support |
| `CoreImage` | `src/parser/block-additions/core-image.php` | Image width/height metadata |
| `Analytics` | `src/analytics/analytics.php` | VIP-only analytics |

Each class calls its own static `init()` at the bottom of its file, hooking into WordPress actions/filters upon include.

### Runtime Dependencies

- `masterminds/html5` (^2.8) — HTML5 parser
- `symfony/dom-crawler` (^6.0) — DOM traversal for sourced attributes
- `symfony/css-selector` (^6.0) — CSS selector support for DomCrawler

Only production dependencies are committed to `vendor/`.

## Filters and Actions

These are the plugin's extension points:

### Block Filtering
- **`vip_block_data_api__allow_block`** — Filter blocks in/out of output. Receives `(bool $is_included, string $block_name, array $parsed_block)`. The `$parsed_block` is the raw array from `parse_blocks()` with keys `blockName`, `attrs`, `innerHTML`, `innerBlocks`. Evaluated after `include`/`exclude` query params.

### Block Result Modification
- **`vip_block_data_api__sourced_block_result`** — Modify block attributes after parsing. Receives `(array $sourced_block, string $block_name, int $post_id, array $parsed_block)`. The `$parsed_block` is the raw array from `parse_blocks()`.
- **`vip_block_data_api__sourced_block_inner_blocks`** — Modify inner blocks before recursive iteration. Receives `(array $inner_blocks, string $block_name, int $post_id, array $parsed_block)`. The `$inner_blocks` are `WP_Block` instances, not raw arrays.

### Content Preprocessing
- **`vip_block_data_api__before_parse_post_content`** — Modify raw post content before parsing. Receives `($post_content, $post_id)`. Use with extreme care.

### API Result
- **`vip_block_data_api__after_parse_blocks`** — Modify REST endpoint response before returning. Receives `($result, $post_id)`.

### Render Hooks
- **`vip_block_data_api__before_block_render`** (action) — Fires before blocks are rendered by ContentParser.
- **`vip_block_data_api__after_block_render`** (action) — Fires after blocks are rendered.

### Access Control
- **`vip_block_data_api__rest_validate_post_id`** — Control which post IDs are queryable. Receives `($is_valid, $post_id)`.
- **`vip_block_data_api__rest_permission_callback`** — Control API access (e.g. require authentication). Receives `($is_permitted)`.

### GraphQL Toggle
- **`vip_block_data_api__is_graphql_enabled`** — Enable/disable GraphQL integration. Returns boolean.

## Development Setup

### Prerequisites
- Node.js + npm (for `@wordpress/env`)
- Docker (for `wp-env`)
- PHP 8.1+
- Composer

### Local Environment

```bash
npm -g install @wordpress/env
composer install
wp-env start
```

### Running Tests

```bash
composer test              # Run PHPUnit tests
composer test-multisite    # Run tests in multisite mode
composer test-watch        # Watch mode (requires nodemon)
```

Tests use PHPUnit 9.5 inside a WordPress environment via `@wordpress/env`. The base test class `RegistryTestCase` (in `tests/registry-test-case.php`) extends `WP_UnitTestCase` and auto-unregisters non-core blocks after each test.

### Linting

```bash
composer phpcs             # Run PHP CodeSniffer
composer phpcs-fix         # Auto-fix with phpcbf
```

**Coding standards:** WordPress-Extra, WordPress-VIP-Go, WordPress-Docs (docs excluded from tests/), PHPCompatibilityWP (PHP 8.1+).

## CI/CD

GitHub Actions workflows (trigger on PRs):

- **`phpcs.yml`** — Runs `composer phpcs` on PHP 8.1
- **`phpunit.yml`** — Test matrix: PHP 8.1 + WP 6.0, PHP 8.1 + WP latest, PHP 8.3 + WP latest. Runs both standard and multisite tests.
- **`release.yml`** — On push to `trunk`: detects version changes, validates version consistency between plugin header and `WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION` constant, creates GitHub Release with ZIP.

## Release Process

1. Bump version in **both** the plugin header (`Version: X.Y.Z`) and the `WPCOMVIP__BLOCK_DATA_API__PLUGIN_VERSION` constant in `vip-block-data-api.php`
2. Submit as a PR titled "Release X.Y.Z" and merge to `trunk`
3. The `release.yml` workflow auto-generates the tag, ZIP, and GitHub Release

## Key Limitations

- **Client-side-only blocks** that lack server-side registration via `register_block_type()` + `block.json` will have incomplete attributes (only delimiter-stored attrs available)
- **Deprecated blocks** may return different data shapes for the same block type depending on when the post was authored
- **Rich text attributes** (`html`-sourced) may contain inline HTML markup and must be rendered with `innerHTML`/`dangerouslySetInnerHTML`
- **Classic editor content** (pre-Gutenberg) is not supported and returns a `vip-block-data-api-no-blocks` error

## Writing Tests

Tests extend `RegistryTestCase` (`tests/registry-test-case.php`), which provides helper methods and automatic cleanup of custom block registrations after each test.

### Pattern

Every parser test follows the same structure:

1. **Register a test block** with its attribute definitions using `$this->register_block_with_attributes()`
2. **Define block HTML** as a string with WordPress block delimiters (`<!-- wp:test/block-name -->...<!-- /wp:test/block-name -->`)
3. **Define expected output** as an array of `[ 'name' => ..., 'attributes' => [...] ]`
4. **Parse and assert** using `ContentParser::parse()` and `assertArraySubset()` (from the `dms/phpunit-arraysubset-asserts` package, included via the `ArraySubsetAsserts` trait in `RegistryTestCase`)

### Example: Basic block test

```php
<?php

namespace WPCOMVIP\BlockDataApi;

class MyNewBlockTest extends RegistryTestCase {
    public function test_parse_custom_block() {
        // 1. Register a test block with attribute definitions
        $this->register_block_with_attributes( 'test/my-block', [
            'title' => [
                'type'     => 'string',
                'source'   => 'html',
                'selector' => 'h2',
            ],
            'url' => [
                'type'      => 'string',
                'source'    => 'attribute',
                'selector'  => 'a',
                'attribute' => 'href',
            ],
        ] );

        // 2. Define block HTML
        $html = '
            <!-- wp:test/my-block -->
            <div>
                <h2>My Title</h2>
                <a href="https://example.com">Link</a>
            </div>
            <!-- /wp:test/my-block -->
        ';

        // 3. Define expected output
        $expected_blocks = [
            [
                'name'       => 'test/my-block',
                'attributes' => [
                    'title' => 'My Title',
                    'url'   => 'https://example.com',
                ],
            ],
        ];

        // 4. Parse and assert
        // In tests, pass the block registry explicitly. In production (RestApi),
        // ContentParser is instantiated with no args and uses the global registry.
        $content_parser = new ContentParser( $this->get_block_registry() );
        $blocks         = $content_parser->parse( $html );
        $this->assertArrayHasKey( 'blocks', $blocks, sprintf( 'Unexpected parser output: %s', wp_json_encode( $blocks ) ) );
        $this->assertArraySubset( $expected_blocks, $blocks['blocks'], true );
    }
}
```

### Example: Testing a filter

When testing filters, add the filter before parsing and remove it after:

```php
public function test_my_filter() {
    $this->register_block_with_attributes( 'test/block', [ /* ... */ ] );

    $html = '<!-- wp:test/block -->...<!-- /wp:test/block -->';

    $filter_fn = function ( $sourced_block, $block_name ) {
        $sourced_block['attributes']['extra'] = 'value';
        return $sourced_block;
    };

    add_filter( 'vip_block_data_api__sourced_block_result', $filter_fn, 10, 2 );
    $content_parser = new ContentParser( $this->get_block_registry() );
    $result         = $content_parser->parse( $html );
    remove_filter( 'vip_block_data_api__sourced_block_result', $filter_fn, 10, 2 );

    // Assert on $result...
}
```

### Key helpers from `RegistryTestCase`

- `$this->register_block_with_attributes( string $block_name, array $attributes, array $additional_args = [] )` — Registers a block type for testing
- `$this->get_block_registry()` — Returns `WP_Block_Type_Registry` instance
- `$this->register_block_bindings_source( string $source, array $args )` — Registers a block bindings source for testing
- `tearDown()` automatically unregisters all non-`core/` blocks and block binding sources

### Test file placement

- Source-type tests → `tests/parser/sources/test-source-{type}.php`
- Block-specific tests → `tests/parser/blocks/test-{block-name}.php`
- General parser tests → `tests/parser/test-{feature}.php`
- GraphQL tests → `tests/graphql/test-graphql-api-{version}.php`
- REST tests → `tests/rest/test-rest-api.php`

### Naming conventions

- Test files: `test-{descriptive-name}.php` — the `test-` prefix is **required** by `phpunit.xml.dist` (`<directory prefix="test-" suffix=".php">`); files without it won't be discovered
- Test classes: `{DescriptiveName}Test extends RegistryTestCase`
- Test methods: `test_{what_is_being_tested}` (use double underscores `__` to separate variants, e.g. `test_parse_attribute_source__with_default_value`)
- Block names in tests: use `test/` namespace (e.g. `test/my-block`) — these are auto-cleaned by `tearDown()`

## Error Codes

The plugin returns `WP_Error` instances with these codes:

| Code | HTTP Status | When |
|---|---|---|
| `vip-block-data-api-no-blocks` | 400 | Post content has no block data (classic editor or pre-Gutenberg content) |
| `vip-block-data-api-parser-error` | 500 | Unexpected exception during block parsing (stack trace logged server-side) |
| `vip-block-data-api-invalid-params` | 400 | Both `include` and `exclude` query params provided simultaneously |
| `vip-block-data-api-parser-time` | — | Parse time exceeded threshold (500ms); logged as analytics error, does **not** fail the request |

## Debugging

Define the constant `VIP_BLOCK_DATA_API__PARSE_DEBUG` as `true` to include raw parsed blocks and post content in the API output. This adds extra data to the response for debugging purposes.

## Coding Conventions

- PHP files use tabs for indentation, LF line endings, UTF-8 encoding
- YAML files use 2-space indentation
- Follow WordPress coding standards (WordPress-Extra, WordPress-VIP-Go)
- Short array syntax `[]` is allowed
- All classes are in the `WPCOMVIP\BlockDataApi` namespace
- Block additions use the sub-namespace `WPCOMVIP\BlockDataApi\ContentParser\BlockAdditions`
