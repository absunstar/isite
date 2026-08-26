# iSite Core v30 — Lazy Collection Read Pools

Version: `2026.08.26-v30`

## Goal

Reduce cold startup latency without changing any legacy collection API or queue semantics.

## Root cause

The additive parallel-read APIs introduced a `readPool` on every collection wrapper. Creating the pool during collection initialization accessed `site.pool`, which materialized Core v3 and the advanced Core v4→v18 stack even when an application only used legacy collection methods.

## Change

`collection.readPool` is now an own enumerable lazy property. It materializes synchronously on first access and then becomes a normal writable value property.

Legacy collection APIs are unchanged, including `find`, `get`, `findOne`, `findMany`, `add`, `update`, `edit`, and `delete`, plus their callback and serialized queue behavior.

The parallel APIs continue to use the same pool once first invoked.

## Startup benchmark

Interleaved cold-process medians against v29:

- Minimal: 17.976 ms → 17.703 ms total ready.
- Mongo: 38.999 ms → 20.335 ms total ready.
- Mongo + Security: 41.351 ms → 23.964 ms total ready.

The large Mongo/Security gain comes from keeping the advanced core outside the startup critical path until a parallel-read feature actually needs it.

## Compatibility

- 86/86 regression tests PASS.
- 339 site APIs protected.
- 105 collection APIs protected.
- 32 namespaces protected.
- 0 missing APIs.
- 0 type changes.
- 0 broken aliases.
- Smart Code full compatibility gate PASS over 1019 JavaScript files / 14,728,177 bytes.
