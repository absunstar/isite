# iSite Core v13 — Smart Code Hot-Path Optimization

Version: `2026.08.26-v13`

Core v13 uses the full Smart Code source tree as the real-world compatibility and prioritization target. The release intentionally keeps all legacy API names, callback signatures, parser behavior, collection serialization, and response behavior intact.

## Real-world usage baseline

The Smart Code source scan covers:

- 1019 JavaScript files
- 14,728,177 source bytes
- 0 scan/read errors
- 638 server-side `site.*` names observed
- 21 collection method names observed
- 3 legacy prototype helpers observed

Highest framework hot paths include `site.post`, `site.get_RegExp`, `site.get`, `site.on`, `site.call`, `site.connectCollection`, `site.security.getUserFinger`, `res.json`, `collection.findMany`, `collection.add`, `collection.edit`, `collection.delete`, `.test()`, `.like()`, and `.contains()`.

## Safe optimizations

### JSON reference cleanup

`removeRefObject()` was rewritten to reduce temporary allocations while preserving the old depth-first traversal and mutation semantics exactly:

- repeated object references are still removed,
- `_id` is still not traversed,
- property traversal order stays based on own enumerable keys,
- the original object is still mutated exactly as before.

Parity tests compare the old and new algorithms across repeated/shared-reference fixtures.

### `res.json()` content-type fast path

`res.json()` now uses an internal `_setContentType()` path for the framework-owned `application/json` header. Public `res.set()` remains unchanged.

The output header remains equivalent to the legacy behavior:

```text
application/json; charset=utf-8
```

### `security.getUserFinger()` date cache

The legacy date value returned by `site.getDate()` is stable for a local calendar day. v13 caches the underlying noon-UTC timestamp until the next local midnight and returns a fresh `Date` instance on every call.

This preserves:

- the exact date value,
- `Date` type,
- object identity semantics (new Date object per call),
- caller mutability.

## Smart Code compatibility gate

The Smart Code scanner no longer initializes the whole iSite runtime. Compatibility scanning is source-based and independent from optional integrations such as WebP, PDF, mail, or MongoDB packages.

Run the real project compatibility gate:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:verify
```

Generate the usage matrix:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:scan
```

Show ranked hot paths:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:usage
```

Run the targeted microbenchmark:

```bash
npm run smart-code:hotpaths
```

## v13 measured hot-path results

Representative final run:

```text
smartcode-json-clean-legacy: 141,977 ops/s
smartcode-json-clean-v13:    232,553 ops/s
speedup:                     1.64x

content-type-legacy:         7,032,981 ops/s
content-type-v13:           11,166,858 ops/s
speedup:                     1.59x

user-finger-date-legacy:     5,773,804 ops/s
user-finger-date-v13:       10,122,040 ops/s
speedup:                     1.75x
```

These are microbenchmarks for the individual operations, not end-to-end Smart Code speedup claims.

## Verification

Core v13 final verification:

- 50 JavaScript files: syntax PASS
- 288 text files: UTF-8 PASS
- 69/69 regression tests: PASS
- parser legacy hidden-token regression: PASS
- HTTP streaming/download integration: PASS
- full framework smoke initialization: PASS
- Smart Code full compatibility gate: PASS
- standard performance benchmark: PASS

The legacy collection queue and legacy CRUD functions were not converted to parallel execution. Faster database APIs remain opt-in.
