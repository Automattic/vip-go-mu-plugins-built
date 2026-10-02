# Architecture

`php-mcp-schema` validates protocol values against an explicitly selected Model
Context Protocol (MCP) schema revision and hydrates them into immutable PHP
records. Each supported revision has its own generated catalog, while compatible
named definitions share record classes. This preserves exact wire behavior
without maintaining a parallel PHP class tree for every revision.

This document explains the package's runtime model and source boundaries. See
the [README](../README.md) for public API examples, the
[migration guide](MIGRATION.md) when replacing the former DTO API, and the
[contributor guide](../CONTRIBUTING.md) for development procedures.

## Runtime model

The package separates revision-specific protocol rules from the PHP objects
consumers use:

- **Revision catalogs** describe the definitions and directional message
  availability for one exact MCP revision.
- **Shared records** represent named MCP objects such as `Tool`, `TextContent`,
  and `CallToolResult` wherever their public PHP contracts are compatible.

```text
Pinned schema.json files
          |
       Generator
          +-- exact-revision catalogs
          +-- shared records, contracts, and value constants

Input -> selected Schema -> validation -> hydration -> immutable Record -> JSON
```

Revision differences remain in the catalogs and the validation performed by a
selected `Schema`. They do not require consumers to choose between separate
revision namespaces.

The selected schema is the authority for both validation and construction. The
resulting record retains its finalized wire keys, field presence, and values. It
does not retain the schema service or a revision identifier.

## Exact revision selection

Consumers obtain a `Schema` through `Schemas::create()->forVersion()`. The
provider loads and caches a catalog lazily for each selected revision. Supported
identifiers are exposed as constants on `Schemas` and through
`Schemas::supportedVersions()`.

Selection is exact. An unknown identifier throws
`UnsupportedRevisionException`; the runtime never treats revisions as ranges and
never falls back to the newest catalog.

The package's public record and contract roster is the union of the types needed
by all supported revisions. The existence of a PHP symbol therefore does not
mean that it is valid under every selected schema. Constructing a type that is
not available in the selected revision throws `UnavailableTypeException`.

The same rule applies to protocol methods. A selected schema exposes directional
availability checks for client requests, client notifications, server requests,
server notifications, and embedded input requests. These maps answer whether a
message exists in the canonical revision; an application must still intersect
that result with the handlers and capabilities it implements.

## Records, contracts, and values

The public generated surface has three roles:

- `WP\McpSchema\Record` contains concrete immutable named objects.
- `WP\McpSchema\Contract` contains useful union construction roots.
- `WP\McpSchema\Value` contains constants for canonical enum-like scalar values.

Compatible same-named object definitions share one record class. Generated
getters cover the compatible fields used by any supported revision, while each
record instance retains a mask of the fields declared by the catalog that
created it. A getter returns `null` when its field is not declared or is omitted
for that instance; it does not reinterpret an open-schema extension as a field
removed by another revision.

When a canonical name changes kind, the runtime uses kind-specific public
symbols instead of inventing a false common contract. For example, a definition
that is a union in one revision and an object in another can have a construction
root under `Contract` for the first revision and a concrete symbol under
`Record` for the second. Exact-revision availability determines which root may
be constructed. The current same-short-name pairs are `ClientNotification` and
`ClientResult`; their generated class documentation links each `Contract` symbol
to its `Record` sibling and states exact availability.

Object aliases receive nominal record classes and hydrate directly from the
referenced fields. Scalar, list, and mixed aliases remain native values or
internal implementation details. Contracts are generated only for unions that
provide a useful public object boundary, not for every structural union in the
canonical schemas.

JSON Schema `anyOf` validity remains any-match. Hydration of an object that
matches more than one object member chooses the successful member declaring the
largest number of keys present in the input, with canonical order as the tie
breaker. This rule applies recursively to nested object unions. Scalar unions
retain canonical first-match hydration.

Aggregate result validation does not establish validity for the originating
method. The open base `Result` accepts extension fields, so a malformed
method-specific payload can still satisfy a generic result or JSON-RPC envelope
schema. Consumers select the concrete payload using their request context and
result discriminator, then validate it through the selected `Schema`. A
method-specific response wrapper may itself contain a permissive result union;
it does not replace concrete payload validation. See the
[result validation example](MIGRATION.md#validate-results-for-the-originating-method).

Records also expose generic field access:

- `has()` distinguishes an omitted field from a field explicitly containing
  `null`.
- `get()` reads a declared field or an instance-present extension field. An
  absent unknown field throws `UnknownFieldException`.
- `jsonSerialize()` returns the complete wire representation as a defensive
  `stdClass`.

The declared-field mask is intentionally not a public API. Consumers use
`has()` to distinguish omission and the generated nullable getter to observe
whether a revision-declared field has a value.

Named nested objects become records. Anonymous JSON objects remain `stdClass`
instances, and JSON arrays remain PHP lists. Mutable native values returned by a
record are copied so callers cannot mutate the record indirectly.

## Validation and wire identity

`Schema` provides three construction boundaries for different input sources:

- `fromArray()` accepts programmatic PHP arrays and uses schema context to
  interpret ambiguous empty arrays.
- `fromValue()` accepts already-decoded values, including `stdClass`, lists, and
  existing records.
- `fromJson()` decodes raw JSON while preserving object/list identity and
  numeric-string object keys.

All three paths converge on the same validator and hydrator. Validation is
always enabled and completes before a record is returned. Existing records used
as input are serialized defensively and validated again, so passing a record
from one revision into another revision never bypasses the target schema.

The interpreter implements the JSON Schema vocabulary and combinations required
by the pinned MCP documents. It is not a general-purpose JSON Schema library.
Canonical `format` values are retained as annotations and are not validated by
the runtime or the AJV oracle; applications may apply format-specific policy at
their own boundary.

Among other canonical constraints, construction preserves or enforces:

- JSON object versus list identity, including `{}` versus `[]`;
- omitted fields versus fields explicitly containing `null`;
- required fields, closed-object fields, and union membership;
- native integer bounds and rejection of non-finite numbers, while finite
  decimal tokens round to IEEE 754 binary64 exactly as the AJV oracle and
  RFC 8259 interoperable parsers do;
- valid UTF-8 and JSON escapes;
- acyclic, serializable input within the shared depth boundary; and
- instance-present extension keys where the canonical object permits them.

Validation failures use the package exception hierarchy and include value paths
where applicable. There is no unchecked public constructor, alternate record
representation, or validation-disabled mode.

## Generated and handwritten source ownership

The canonical inputs are commit-pinned MCP `schema.json` files under
`resources/schema/`. Their SHA-256 digests are reviewed and recorded by the
generator. Normal generation is offline and rejects unexpected source changes.

Generated PHP is restricted to these paths:

```text
src/Record/
src/Contract/
src/Value/
src/Internal/Catalog/
src/Internal/TypeRegistry.php
```

Public generated symbols use domain-oriented namespaces. Generated runtime
metadata remains internal. Handwritten revision selection, validation,
hydration, immutable storage, JSON decoding, and exceptions live outside the
generated paths.

Generation completes in a staging tree and then replaces only the allowlisted
paths. This prevents generation from deleting handwritten siblings such as
`src/Record.php`, `src/Schema.php`, and other files under `src/Internal/`.

The generator audits each new revision against every still-supported revision.
Structural, field, and directional-message changes are generated evidence.
Human review is limited to rationale-bearing decisions for same-name kind
changes and getter changes that cross native PHP value categories. The
generator recomputes each such classification from the commit-pinned canonical
documents and records the per-revision evidence and pinned commits in the
compatibility manifest, so a review file carries only the rationale and cannot
assert a classification the pinned sources do not support. Unknown
schema constructs, semantic `$ref` siblings, and missing review decisions fail
generation instead of being ignored.

AJV is a development-only conformance oracle for the canonical documents and
structural fixtures. Production Composer installations do not include AJV,
Node.js, the canonical JSON files, or any other runtime dependency. See the
[generator guide](../generator/README.md) for the generation workflow and the
[contributor guide](../CONTRIBUTING.md) for required checks.

## Application boundary

This package owns MCP schema shape, validation, hydration, serialization, type
availability, and directional message availability. It does not implement an
MCP client, server, transport, lifecycle, session, capability policy, handler
registry, permissions, or execution system.

Applications select an exact revision using their negotiation or request
context, construct incoming and outgoing protocol records through the selected
schema, and map package exceptions to their own protocol or transport errors.
They also decide which canonically available methods they implement and
advertise.

Canonical schema validation is distinct from protocol workflow validation.
For example, the `2026-07-28` schema permits an `InputRequiredResult` with only
`resultType`, while the MRTR protocol requires `inputRequests` or `requestState`
and limits the methods that may return it. The consumer's protocol layer owns
these checks. The canonical `resultType` is an open string; applications also
decide which result types they understand. See the
[consumer validation boundary](MIGRATION.md#enforce-protocol-workflow-rules-in-the-consumer).

The runtime validates the MCP record containing a tool's `inputSchema` or
`outputSchema`; it does not become the validator for arbitrary application data
described by those user-authored schemas. That validation remains the
responsibility of the application or tool system.

## Adding or removing a revision

Adding a revision requires a commit-pinned canonical source, a reviewed digest,
and a compatibility classification against every revision that remains
supported. The generator combines field types for shared object records, adds
symbols for new named concepts, and records exact type and message availability.

Generation requires reviewed decisions for same-name kind changes and getter
changes across native PHP value categories. Other field changes, such as an
object `$ref` swap or a required field becoming optional, are recorded in the
compatibility manifest but do not require a separate decision. Shared getters
can therefore gain nullability or a PHPDoc union without a native return type.
For example, `Tool::getMeta()` represents `MetaObject|stdClass|null` in PHPDoc.

Contributors must review the generated public API diff as well as the
compatibility manifest. Passing the generation gate does not establish that
every getter signature is unchanged. Normal package versioning applies when a
new revision requires a public API break.

Removing a revision is also potentially breaking. Records, contracts, or values
used only by that revision may leave the public roster, and consumers can no
longer select its catalog. Revision support therefore changes through deliberate
package releases rather than runtime version approximation.

## Design consequences

This architecture keeps one consumer-facing record model while preserving exact
revision validation. It avoids mechanically duplicating the complete class tree
for each breaking MCP revision and localizes most protocol differences to
generated catalogs and availability metadata.

The tradeoff is explicit revision context: consumers must select a schema before
construction, and a public symbol can exist even when it is unavailable under
that schema. Cross-revision reuse must pass through the target schema, and some
future canonical changes may still require a normal breaking package release.
