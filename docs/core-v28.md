# iSite Core v28 — Fastest-Version Startup Champion

v28 is adopted only because it beats the previous startup champion under measured cold-process benchmarks while preserving all legacy contracts.

## Dual service startup bundles

The normal Mongo-enabled path still uses the exact full generated service bundle used by v27. This preserves the existing initialization order and semantics.

When `mongodb.enabled === false`, iSite selects a generated no-Mongo service bundle that omits `lib/mongodb.js`. `site.mongodb` remains an enumerable own property and materializes the original Mongo module synchronously on first access.

This removes Mongo parse and initialization cost only from applications that explicitly disable MongoDB. Applications that enable MongoDB stay on the historical full-bundle path.

## Champion policy

Startup changes are candidates until they win interleaved cold-process benchmarks against the current champion and pass the full compatibility suite. Candidates that regress an important runtime profile are rejected rather than promoted merely because they have a newer version number.
