# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-11

This release is breaking; see the [migration guide](docs/MIGRATION.md).

### Changed

- **Breaking:** construction now starts with
  `Schemas::create()->forVersion($revision)` and uses `Schema::fromArray()`,
  `fromValue()`, or `fromJson()` to return immutable records. Validation is
  always enabled and exact for `2025-11-25` or `2026-07-28`.
- **Breaking:** public protocol objects now live under `Record`, useful object
  unions under `Contract`, and enum-like scalar constants under `Value`.
  Compatible objects share records while exact-revision catalogs retain wire
  shape and availability.
- **Breaking:** overlapping object unions hydrate the valid record declaring the
  most input keys, with canonical order as a tie-breaker. Scalar unions retain
  canonical first-match behavior.
- Fractional `ElicitResult.content` values are accepted in both revisions;
  `2026-07-28` `JSONValue` accepts fractional numbers and `null`; and
  `2025-11-25` `NumberSchema.default`, `minimum`, and `maximum` accept fractional
  numbers, matching the pinned TypeScript sources.
- Safe inline `allOf` refinements of the canonical `Error` definition now
  hydrate `Record\Error` rather than an anonymous `stdClass`.
- `SchemaException` and every runtime exception extend
  `\InvalidArgumentException`, matching the removed DTO factories and the
  official MCP PHP SDK's invalid params mapping.

### Fixed

- Raw JSON numeric scanning is linear for dense numeric documents and rejects
  non-finite or native-overflowing numeric tokens with bounded diagnostics.
- Programmatic input rejects NUL-prefixed object keys, aligns its nesting limit
  with raw JSON, and rejects out-of-native-range integral floats only where an
  integer schema requires them.
- Numeric-literal getters preserve validated integral floats such as
  `-32700.0` instead of throwing a PHP return-type error.
- Large validated inputs use less peak memory; the 8 MiB regression payload
  completes within a 128 MiB PHP memory limit.
- A `type` list containing `array` and `null` accepts `null`; list rules apply
  to list values only.

### Removed

- **Breaking:** the former `Client`, `Common`, and `Server` DTO namespaces,
  generated DTO constructors and factories, class-based enum objects,
  validation flags, and `toArray()` variants have no compatibility aliases.
- Generated `skill/` type reference and lookup scripts.
- Per-class `@since` protocol-history annotations.

## [0.1.3] - 2026-08-10

### Fixed

- Open MCP schema types now preserve unrecognized fields during `fromArray()` and `toArray()` round trips, including additional JSON Schema keywords such as `$defs` in tool input and output schemas.

## [0.1.2] - 2026-06-05

### Fixed

- `ToolInputSchema::toArray()` and `ToolOutputSchema::toArray()` now always emit the `properties` key as a JSON object, even for tools that declare no parameters. Parameter-less tools previously produced `{"type":"object"}` (key omitted) or `[]` (JSON array), both of which strict JSON Schema validators such as OpenAI strict function-calling mode reject with `object schema missing properties`. Tools with parameters are unchanged. The fix is mirrored in the TypeScript generator so a clean regeneration reproduces the patched output.

## [0.1.1] - 2026-04-10

### Fixed

- Exclude `skill/` directory from Composer dist archives. It contains dev-only helper scripts and reference docs that have no runtime purpose for package consumers and should not ship in the `vendor/` folder.
- Exclude `CLAUDE.md` from Composer dist archives. It contains dev-only project instructions with no runtime purpose for package consumers.

## [0.1.0] - 2026-03-02

### Added

- PHP 7.4+ Data Transfer Objects (DTOs) for the Model Context Protocol (MCP) 2025-11-25 specification
- `fromArray()` static factory methods for deserializing arrays into typed DTOs
- `toArray()` methods for serializing DTOs to arrays suitable for `json_encode()`
- Factory classes for union/polymorphic type resolution
- Class-based enums for MCP enumerated values (PHP 7.4 compatible)
- Complete MCP domain coverage: Server (Tools, Resources, Prompts, Logging), Client (Sampling, Elicitation, Roots), Common (JSON-RPC, Protocol, Content)
- JSON-RPC 2.0 message types (Request, Notification, Result, Error)
- PSR-4 autoloading under `WP\McpSchema\` namespace
- PHPStan level max static analysis validation
