# Tracks URL sanitization spec

This package gives every Tracks surface one allowlist and one algorithm for sanitizing URLs before they are recorded. It ships as two ports that must behave identically:

- **JS/TypeScript:** `@automattic/tracks-shared-utils` (npm)
- **PHP 7.2+:** `automattic/tracks-shared-utils` (Composer)

Both ports take their data from [`shared/url-sanitization.json`](shared/url-sanitization.json) (PHP through a generated copy, see [Repo layout](#repo-layout)) and must pass every case in [`shared/test-cases.json`](shared/test-cases.json). If this document and the test cases disagree, fix whichever one is wrong. Neither port may diverge from them.

## Shared data

`shared/url-sanitization.json` contains:

| Key | Meaning |
| --- | --- |
| `allowedParams.exact` | Query param names that are kept. |
| `allowedParams.prefixes` | A param whose name starts with one of these is kept (e.g. `utm_`). |
| `urlProps` | Tracks event props whose values are URLs and should be passed through `sanitizeUrl` by consumers (`_dl`, `_dr`, `_via_ref`, `_via_url`). |
| `limits.maxDepth` | How many layers of nested URLs are allowed (3). |
| `limits.maxDecodes` | Safety cap on repeated decoding of a single value (10). |

Names are stored in their conventional case for readability. Matching is case-insensitive (see below).

## Public API

| | JS | PHP |
| --- | --- | --- |
| Sanitize a URL | `sanitizeUrl( url: string ): string` | `sanitize_url( string $url ): string` |
| Allowlist | `ALLOWED_PARAMS` (`{ exact, prefixes }`) | `allowed_params(): array` (`[ 'exact' => …, 'prefixes' => … ]`) |
| URL props | `URL_PROPS` | `url_props(): array` |

PHP functions live in the `Automattic\TracksSharedUtils` namespace. PHP exposes the lists as functions rather than constants so the generated config is only loaded when it's first needed, not every time Composer loads the package.

`sanitizeUrl` takes an absolute URL string. It returns the same URL with disallowed query params removed, URL-valued params sanitized recursively, and the fragment removed. It never throws for string input.

**Scope:** query params, fragments and userinfo (`name:extra@` before the host) are sanitized, at the top level and in nested URLs. The scheme, host, port and path are copied through unchanged.

Consumers sanitize Tracks props themselves by calling `sanitizeUrl` on each prop named in `URL_PROPS` that has a string value. The package does not ship a props helper.

The namespace matters: a global `sanitize_url()` would collide with the WordPress core function of the same name.

## Algorithm

The algorithm works on the raw string. It does **not** use `new URL()`, `parse_url()`, `parse_str()`, `URLSearchParams` or `http_build_query()`. Those APIs normalize differently in JS and PHP, so using them would make the ports drift apart. Apart from removing userinfo, everything outside the query string is copied through byte-for-byte, including scheme, host, port and path. Nothing is normalized.

### `sanitizeAtDepth( url, depth )`

The public `sanitizeUrl( url )` is `sanitizeAtDepth( url, 0 )`.

1. **Remove the fragment:** cut `url` at the first `#`.
2. **Split off the query:** split at the first `?` into `base` and `query`. [Remove userinfo](#userinfo) from `base`. If there is no `?`, return `base`.
3. **Split the query into segments** on `&`. Drop empty segments.
4. **For each segment, in order:**
   1. Split at the first `=` into `rawName` and `rawValue`. If there is no `=`, the segment has no value.
   2. **Match the name.** Decode `rawName` once (see [Decoding](#decoding)), or use it raw if decoding fails. ASCII-lowercase it. The param is allowed if that string equals an ASCII-lowercased `exact` entry or starts with an ASCII-lowercased `prefixes` entry. If it's not allowed, drop the segment.
   3. If the segment has no value, or the value is empty, keep the segment exactly as written (`flags`, `ref=`).
   4. Otherwise run [`sanitizeValue( rawValue, depth )`](#sanitizevalue-rawvalue-depth-mink-). If it returns *drop*, drop the segment. Otherwise output `rawName=<result>`. `rawName` is always kept exactly as written.
5. Join the kept segments with `&`. If any were kept, return `base + "?" + joined`. Otherwise return `base`, with no trailing `?`.

### `sanitizeValue( rawValue, depth, minK )`

This decides what happens to one param value: it is kept as written, replaced with a sanitized URL, or dropped.

#### Layers

A value can be encoded more than once. Each round of encoding wraps the value in another layer. For example, `https%253A%252F%252Fa.com` has two layers. Peel one and you get `https%3A%2F%2Fa.com`. Peel another and you get `https://a.com`. Peeling a layer means [decoding](#decoding) it once.

The value as it's written in the query string is the outermost layer. `sanitizeValue` peels one layer at a time and checks each new layer as soon as it's uncovered. Below, the **current layer** is the one just uncovered, the **layer above** is the one it was peeled from, and the **layer below** is the one that peeling the current layer would uncover.

When in doubt, the value is dropped. If a query might be hiding somewhere in the value and it can't be sanitized, the whole value goes.

#### Peeling

Peel a layer, then ask these questions about the current layer, in order. Stop at the first one that gives an answer. If none does, peel the next layer and ask again.

1. **Did peeling fail?** Peeling fails on a `%` that isn't followed by two hex digits, or on invalid UTF-8. Nothing further down can be seen, so a query may be hiding there. If the layer above looks like a URL ([URL-shaped](#url-shaped)), or contains an encoded `?` (`%3F`, `%253F` and so on, matched by `/%(25)*3F/i`), drop the value. Otherwise keep the value as written. This catches both a plain URL with a broken `%` in it and an encoded URL whose query sits behind a broken `%`.
2. **Have more than `maxDecodes` (10) layers been peeled?** If the current layer is still different from the layer above, the value is too deeply encoded to reason about, so drop it. Otherwise keep the value as written.
3. **Does the current layer look like a URL?**
   1. If it's deeper than `maxDepth` (see [Depth](#depth)), drop the value.
   2. Otherwise sanitize it as a URL with `sanitizeAtDepth`. That also sanitizes any URLs nested inside it.
   3. If a query might still be hiding in a layer below the sanitized URL, [look below it](#looking-below-a-sanitized-url).
   4. Otherwise encode the sanitized URL once and output it.
4. **Is the current layer the same as the layer above?** Then peeling changed nothing: the value is fully decoded and no layer looked like a URL. Keep the value as written.

The first layer is checked for a URL even if peeling didn't change it, so a plain `https://a.com/?extra=1` is caught straight away. Each layer is checked as soon as it's uncovered, so a URL is sanitized even if the layers below it are broken or never stop changing.

#### Depth

Depth counts how many layers down a URL sits. The URL passed to `sanitizeUrl` is at depth 0. Each layer peeled from one of its param values goes one level deeper, and the same goes for URLs nested inside those.

In a properly encoded chain of nested URLs, each URL is one level below the URL that contains it, so the chain sits at depths 1, 2 and 3. A double-encoded URL in a top-level param takes two peels to uncover, so it's already at depth 2. A URL found deeper than `maxDepth` (3) is dropped.

#### Looking below a sanitized URL

`sanitizeAtDepth` only acts on a real `?`. After it runs, a query can still be hiding in a layer below, behind an encoded `?`:

- `a%3Fextra%3D1?notAllowed=1` looks like a URL only because of its real `?`. Sanitizing it leaves `a%3Fextra%3D1`, which no longer looks like a URL. But the layer below is `a?extra=1`.
- `https://a.com/%3Fextra%3D1` has no real `?`, so sanitizing leaves it as it is. But the layer below is `https://a.com/?extra=1`.

So look below when the sanitized URL has no real `?` left, and it either no longer looks like a URL or still contains an encoded `?`.

Looking below means treating the sanitized URL as the current layer and carrying on [peeling](#peeling) from there, one level deeper each time. The sanitized URL itself isn't checked again. Whatever turns up decides the output. If nothing below looks like a URL, the output is the sanitized URL, encoded once.

Each look below goes at least one layer deeper, so the depth limit guarantees it ends.

**Port notes:** `depth` is the depth of the URL the value belongs to. `minK` is the first layer that step 3 checks, normally 1. Looking below is the call `sanitizeValue( encode( sanitized ), depth + k - 1, 2 )`, where `k` is the number of layers peeled to reach the URL. Encoding `sanitized` makes it the first layer that call peels. `minK = 2` skips checking it again. `depth + k - 1` keeps it at its own depth, so the layer below it is one level deeper.

#### Output

A value that isn't a URL is kept exactly as written. A URL is encoded exactly once, however many layers it had, so a double-encoded URL comes out single-encoded and may not match the input byte-for-byte. The original proposal accepts this.

`sanitizeUrl` is idempotent: sanitizing its output returns the output unchanged.

| Value of a top-level param | Output |
| --- | --- |
| `hello%20world` | `hello%20world` (not a URL, kept as written) |
| `https%3A%2F%2Fa.com%2F%3Fextra%3D1%26utm_source%3Dz` | `https%3A%2F%2Fa.com%2F%3Futm_source%3Dz` |
| `https%253A%252F%252Fa.com%252F%253Fextra%253D1` | `https%3A%2F%2Fa.com%2F` (found at depth 2, encoded once) |
| `https%3A%2F%2Fa.com%2F%253Fextra%253D1` | `https%3A%2F%2Fa.com%2F` (found by looking below) |
| `a%253Fextra%253D1%3FnotAllowed%3D1` | `a` (found by looking below) |

### URL-shaped

A decoded value is URL-shaped if either:

- it has an authority: it matches `^([A-Za-z][A-Za-z0-9+.-]*:)?//`, meaning a scheme followed by `://` (including `android-app://` etc.) or a protocol-relative `//`, or
- it contains `?` anywhere.

The `?` rule fails closed. Anything that might have a query is sanitized, even if it isn't a well-formed URL: `example.com/?…`, `checkout?…`, ` https://…` with leading whitespace, `https:/…` with one slash, or plain text like `what?`. Text after the `?` is dropped unless it's an allowlisted param.

A value with no `?` and no authority (`/wp-admin/`, `mailto:…`) is not URL-shaped. It is kept as-is because it has no query or userinfo to sanitize.

### Userinfo

Only a `base` with an authority (see [URL-shaped](#url-shaped)) has userinfo. The authority runs from after the `//` to the first `/`, or to the end of `base`. If the authority contains `@`, or a percent-encoded `@` at any depth (`/%(25)*40/i`, left by double encoding), remove everything in it up to and including the last one.

- `https://name:extra@wordpress.com/` → `https://wordpress.com/`
- `//name@extra@wordpress.com/` → `//wordpress.com/` (the last `@` wins, as in browsers)
- `https://name%40wordpress.com/` → `https://wordpress.com/`

An `@` in the path or query (`/name@example.com?ref=a@b`) is left alone. So is one in a value with no authority, such as `name@example.com/checkout`, where it's ambiguous whether `name@` is userinfo or part of a path.

Port notes:
- **JS:** match the authority's userinfo with `/^[\s\S]*(?:@|%(?:25)*40)/i`. The greedy match ends at the last delimiter.
- **PHP:** a greedy regex backtracks once per byte, and past `pcre.backtrack_limit` (1,000,000 by default) `preg_match()` fails and the userinfo would be kept. Instead, find the first match of `/@|04(?:52)*%/` (the delimiter written backwards) in `strrev( $authority )`. The userinfo is the first `strlen( $authority ) - offset` bytes.

### Decoding

`decode( s )` follows `application/x-www-form-urlencoded` rules:

1. Replace every `+` with a space.
2. Percent-decode every `%XX` into a byte, then interpret the bytes as UTF-8.
3. **Decoding fails** if `s` contains a `%` not followed by two hex digits, or if the resulting bytes are not valid UTF-8. Invalid UTF-8 in `s` itself therefore also fails.

Port notes:
- **JS:** fail if `s` contains a lone UTF-16 surrogate, the JS equivalent of invalid UTF-8 input. `encodeURIComponent()` would otherwise throw on it later. Otherwise `decodeURIComponent( s.replace( /\+/g, ' ' ) )`, catching `URIError` as a failure.
- **PHP:** fail on `/%(?![0-9A-Fa-f]{2})/`. Otherwise use `urldecode( $s )` and fail if `preg_match( '//u', $result )` is not `1`.

### Encoding

`encode( s )` UTF-8 encodes `s` and percent-encodes every byte except the RFC 3986 unreserved characters `A–Z a–z 0–9 - _ . ~`, using uppercase hex. Spaces become `%20`, not `+`.

- **PHP:** `rawurlencode( $s )`.
- **JS:** `encodeURIComponent( s )`, then additionally encode `!'()*`.

### Case-insensitive matching

Lowercasing is **ASCII only** (`A–Z` → `a–z`). Before PHP 8.2, `strtolower()` depends on the locale, so the PHP port should use `strtr( $s, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz' )`.

## Known limitations (accepted)

- Non-URL values of allowed params are passed through verbatim, even if they contain an encoded `&notAllowed=…`. Values of allowed params are assumed to be safe to record.
- `;` is not a param separator, so `tab=a;extra=1` is kept.
- Host and path are out of scope (see **Scope** above), so values in path segments are kept.
- Top-level input that isn't an absolute URL still goes through the same string algorithm. It is not rejected, but it is not a supported input.

## Test cases

`shared/test-cases.json` is an array of `{ "description", "input", "expected" }` objects, where `expected === sanitizeUrl( input )`. Each port's test suite loads this file and runs every case. Any change in behavior starts as a change to this file.

Some inputs can't be written in JSON, such as lone surrogates in JS and invalid UTF-8 in PHP. Each port tests these in its own suite.

Beyond the shared cases:

- **Properties (JS):** on seeded fuzzed input, `sanitizeUrl` never throws, is idempotent, never outputs a fragment, and never outputs userinfo or a disallowed param name at any nesting level. The run is 5,000 inputs by default. Set `FUZZ_COUNT` and `FUZZ_SEED` for a longer one.
- **Parity (CI):** the built JS port runs over 100,000 fuzzed inputs, and the PHP port must give byte-identical output for each (`npm run parity:generate`, then `composer parity:check`).
- **Build (JS):** the shared cases also run against the built ESM and CJS bundles (`npm run check:dist`).

## Repo layout

```
shared/                   # single source of truth (data + test cases)
js/                       # TypeScript package, published to npm
php/src/, php/tests/      # PHP port
php/generated/            # PHP copy of shared/url-sanitization.json (generated, committed)
php/bin/                  # dev scripts: config generator, parity check
composer.json             # at the repo root, so Packagist can read it; autoloads php/src
```

**Versioning:** a git tag (`vX.Y.Z`) is the one shared version. Composer takes its version from the tag, and `js/package.json`'s `version` is bumped to match in the same release.

**Shared data in the builds:** the npm package can't reference `../shared` once it's published. Instead, the JS source imports `shared/url-sanitization.json` directly, and `tsup` inlines it into the build output. The PHP port loads `php/generated/url-sanitization.php`, which `composer build:config` generates from the JSON. It's a plain PHP array, so opcache caches it and nothing parses JSON at runtime. The generated file is committed, and CI fails if it's out of date. `shared/` is left out of the Composer archive.

## JS module format

The JS package ships both ESM and CJS, built with `tsup` and wired up through the `exports` map, along with TypeScript type declarations. This keeps older Node and Jest setups in consumers working.
