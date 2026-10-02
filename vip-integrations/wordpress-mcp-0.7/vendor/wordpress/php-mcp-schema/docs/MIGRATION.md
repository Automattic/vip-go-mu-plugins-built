# Migrating from generated DTOs to the schema runtime

The exact-revision schema runtime replaces every generated DTO, union factory,
enum object, validation flag, and `toArray()` variant. There are no aliases or
parallel construction paths.

Applications select the revision from their own negotiation or request context,
then intersect canonical availability with the handlers and capabilities they
implement. This package does not define application defaults, transport policy,
or dispatch behavior.

## Select an exact revision

Construction now starts with a selected schema:

```php
use WP\McpSchema\Schemas;

$schemas = Schemas::create();
$schema = $schemas->forVersion(Schemas::V2025_11_25);
```

Supported identifiers are exactly `2025-11-25` and `2026-07-28`. Unknown
identifiers throw `UnsupportedRevisionException`. `Schema` has no public
constructor, so a custom document or false revision label cannot bypass this
selection boundary.

## Update imports

| Removed import pattern | Replacement |
| --- | --- |
| `WP\McpSchema\Client\...\DTO\Name` | `WP\McpSchema\Record\Name` when generated |
| `WP\McpSchema\Common\...\DTO\Name` | `WP\McpSchema\Record\Name` when generated |
| `WP\McpSchema\Server\...\DTO\Name` | `WP\McpSchema\Record\Name` when generated |
| `...\Union\NameInterface` | `WP\McpSchema\Contract\Name` when generated |
| `...\Enum\Name` | `WP\McpSchema\Value\Name` when generated |

Records represent named canonical objects. Anonymous nested objects use
`stdClass`; the former `ToolInputSchema`, `ToolOutputSchema`, and
`ServerCapabilitiesTools` DTOs have no corresponding record classes. Remove
their imports and use property access on the objects returned by their parent
records.

A public symbol can exist in the package but be unavailable under one selected
revision. Construction then throws `UnavailableTypeException`. This is how the
union public roster remains source-compatible without pretending a removed
protocol type is valid.

## Replace constructors and `fromArray()` statics

Before:

```php
use WP\McpSchema\Server\Tools\DTO\Tool;

$tool = Tool::fromArray(array(
    'name' => 'weather',
    'inputSchema' => array('type' => 'object'),
));
```

After:

```php
use WP\McpSchema\Record\Tool;
use WP\McpSchema\Schemas;

$schema = Schemas::create()->forVersion(Schemas::V2026_07_28);
$tool = $schema->fromArray(Tool::class, array(
    'name' => 'weather',
    'inputSchema' => array('type' => 'object'),
));
```

Use the entry point that matches the source value:

- `fromArray()` for programmatic PHP associative arrays and lists.
- `fromValue()` for decoded `stdClass`/list graphs or an existing immutable
  record that must be revalidated under the target revision.
- `fromJson()` for raw JSON text. This is the safest ingress path when `{}`
  versus `[]` or numeric-string object keys matter.

Every entry point validates against the selected canonical schema. Validation-off
flags and filters have no replacement.

## Read nested objects

For the tool above, `getInputSchema()` returns a `stdClass`. Read its fields as
properties instead of calling DTO getters:

```php
// Before: $tool->getInputSchema()->getType();
$inputSchema = $tool->getInputSchema();
echo $inputSchema->type; // object

$properties = $inputSchema->properties ?? new \stdClass();
```

`Tool::getOutputSchema()` and `ServerCapabilities::getTools()` also return
`stdClass` when present, or `null` when omitted. Named nested objects, such as
`ToolAnnotations`, remain records with getters. JSON lists remain PHP arrays.

## Replace union factories

Construct through a useful generated contract and inspect the concrete record:

```php
use WP\McpSchema\Contract\ContentBlock;
use WP\McpSchema\Record\TextContent;

$block = $schema->fromArray(ContentBlock::class, array(
    'type' => 'text',
    'text' => 'Hello',
));

if ($block instanceof TextContent) {
    echo $block->getText();
}
```

For overlapping object unions, hydration now chooses the valid member declaring
the most input keys; canonical order breaks a tie. Scalar unions keep canonical
first-match behavior, and JSON Schema `anyOf` validity is unchanged. Same-name
kind changes are intentionally represented by different roots. For example,
`Contract\ClientNotification` is a `2025-11-25` union root, while
`Record\ClientNotification` is a `2026-07-28` object root.

The same split applies to `ClientResult`: its `Contract` root is available only
under `2025-11-25`, and its `Record` root only under `2026-07-28`. Selecting the
other root throws `UnavailableTypeException`.

When the method is known, use its concrete record if it is available in the
selected revision. For example, `CancelledNotification` works with either
supported revision without choosing between the two `ClientNotification` roots:

```php
use WP\McpSchema\Record\CancelledNotification;

$json = '{"jsonrpc":"2.0","method":"notifications/cancelled","params":{"requestId":1}}';
$notification = $schema->fromJson(CancelledNotification::class, $json);
echo $notification->getParams()->getRequestId(); // 1
```

For generic message handling, `Contract\JSONRPCMessage` and
`Contract\JSONRPCResponse` are available in both revisions. They hydrate generic
envelopes, so consumers must still check method availability and validate the
concrete request, notification, or result before using it.

## Validate results for the originating method

Generic result roots and JSON-RPC envelopes validate their own schema, not the
result expected by a particular method. An open `Result` can preserve malformed
method-specific fields as extension data. Select the concrete payload record
using the originating request method and, under `2026-07-28`, `resultType`.

For example, a completed `tools/call` result must pass `CallToolResult` validation:

```php
use WP\McpSchema\Contract\ServerResult;
use WP\McpSchema\Record\CallToolResult;

$schema = Schemas::create()->forVersion(Schemas::V2026_07_28);
$json = '{"resultType":"complete","content":"oops"}';

$result = $schema->fromJson(ServerResult::class, $json); // Valid generic Result.
$schema->fromValue(CallToolResult::class, $result); // Throws ValidationException at /content.
```

Under `2026-07-28`, selecting `CallToolResultResponse` alone is also insufficient:
its result union can accept that same payload as `InputRequiredResult`. Choose
the concrete payload before constructing the response wrapper or using a received
result. This method and result-type dispatch belongs to the consumer; the schema
runtime does not infer it from the fields present.

## Enforce protocol workflow rules in the consumer

Schema validation does not enforce every requirement written in the protocol.
Under `2026-07-28`, an `InputRequiredResult` containing only `resultType` passes
the canonical schema. The MRTR protocol nevertheless requires servers to include
at least one of `inputRequests` or `requestState`, and permits these responses
only for `tools/call`, `prompts/get`, and `resources/read`. The consumer's
protocol layer must enforce those requirements. See the
[MRTR specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/patterns/mrtr).

The canonical `resultType` field accepts any string, including extension-defined
values. A record does not establish that the consumer understands that result
type. Consumers interpret it according to the selected protocol and supported
extensions; the schema runtime does not restrict it to `complete` and
`input_required`.

## Read and serialize records

Generated named getters remain available for fields declared by the selected
schema. Shared getters cover compatible fields across supported revisions and
return `null` when a field is not declared by the selected revision.

Use generic access for presence and open-schema extensions:

```php
$record->has('field'); // distinguishes omitted from explicit null
$record->get('field'); // declared field or present extension
```

An absent unknown extension throws `UnknownFieldException` rather than silently
returning `null`.

Replace every `toArray()` variant with `jsonSerialize()` or direct JSON
encoding:

```php
$wireObject = $record->jsonSerialize();
$json = json_encode($record, JSON_THROW_ON_ERROR);
```

The output is a defensive `stdClass`. Mutating it cannot mutate the record.

## Account for intentional wire corrections

The runtime now enforces JSON behavior that the DTO implementation could not
represent consistently:

- omitted and explicit `null` are distinct;
- JSON objects remain `stdClass` and lists remain PHP lists;
- non-empty sequential arrays do not satisfy object union members;
- integral JSON Schema numbers preserve their PHP `int` or integral `float`
  kind;
- native-integer overflow, non-finite numbers, malformed UTF-8 values or keys,
  resources, closures, unsupported objects, cycles, and excessive nesting are
  rejected; and
- validation failures include JSON Pointer paths where applicable.

PHP converts numeric-string array keys such as `"0"` to integers, so
`fromArray()` cannot represent an object consisting only of sequential numeric
keys. Use `fromJson()` or an explicit `stdClass` when those keys matter.

For empty values, `fromArray()` interprets `array()` as an object only where the
selected schema requires an object; otherwise it remains the JSON list `[]`.
For example, empty `structuredContent` becomes `{}` under `2025-11-25`, where
that field is object-constrained, and remains `[]` under unconstrained
`2026-07-28`. Use `new stdClass()` when an unconstrained empty object must be
unambiguous.

## Account for revision removals and replacements

Do not assume that a method or field from one revision exists in another.
Notable differences include:

- `ping`, initialization, logging-level requests, root-list changes, core
  tasks, and the earlier resource-subscription flow are absent or replaced in
  `2026-07-28`.
- `server/discover`, per-request metadata, result discriminators, cache fields,
  embedded input requests, and typed protocol errors are introduced in
  `2026-07-28`.
- `Tool.execution` is declared under `2025-11-25` but not under `2026-07-28`.
  Peer-supplied data with that key can still round-trip as opaque extension data;
  the named getter does not revive removed semantics.
- `CallToolResult.structuredContent` widens from object-only in `2025-11-25` to
  any JSON value in `2026-07-28`.
- Fractional `ElicitResult.content` values and fractional
  `NumberSchema.default`/`minimum`/`maximum` values are accepted in both
  revisions. `JSONValue` additionally accepts fractional numbers and `null`
  in `2026-07-28`. Integer-constrained fields accept only integral values, and
  integral floats that fit the native PHP integer range retain their float kind.
- Under `2025-11-25`, `Task.ttl` is required and accepts `null` for unlimited
  retention.

Use the selected schema's directional availability methods before dispatch or
advertisement. Schema availability is complete; an application must still
intersect it with handlers it actually implements.

## Catch runtime exceptions

Every exception thrown by the runtime extends `SchemaException`, which extends
`\InvalidArgumentException`. The removed DTO factories also threw
`\InvalidArgumentException`, so an existing catch clause that maps it to a
JSON-RPC invalid params error keeps working. Catch `ValidationException` to read
the failing JSON Pointer through `getPointer()`.

A rejected union root reports only that no member matched. Dispatch on the
method or content type and construct the concrete record to get a field-level
pointer, as the official SDKs do.

## Removed API checklist

Remove consumer references to:

- `WP\McpSchema\Client`, `WP\McpSchema\Common`, and `WP\McpSchema\Server`;
- `AbstractDataTransferObject`, `AbstractEnum`, DTO contracts, and validation
  traits;
- DTO and union factories;
- DTO constructors and static `fromArray()` calls;
- enum instances;
- validation flags or validation-mode filters; and
- `toArray()`, `toArrayWithSkippedNullValues()`, and similar output variants.

Then select an exact schema, construct through `Schema`, use generated getters
or `get()`/`has()`, and serialize with `jsonSerialize()`.
