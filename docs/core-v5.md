# iSite Core v5 — Adaptive Performance & Query Efficiency

Core v5 is additive and backward-compatible. Existing routing, collection, file, session, security and callback APIs remain unchanged.

## New capabilities

- `site.stableKey(...)`: deterministic bounded cache/query keys.
- `site.AdaptiveCache` / `site.adaptiveCache(name, options)`: bounded TTL/LRU caches with byte and entry budgets.
- `site.cacheTuner.tune(options)`: opt-in cache budget reduction under memory pressure.
- `site.staticAssets.chooseEncoding(header)`: quality-aware Brotli/gzip/deflate negotiation.
- `site.staticAssets.precompress(path)` / `precompressMany(paths)`: cached asynchronous precompression.
- `site.query.cached(...)`: query result cache with in-flight de-duplication.
- `collection.findOneParallel`, `findManyParallel`, `countParallel`: opt-in bounded-concurrency reads that bypass the legacy serialized queue.
- `collection.findManyFast`: single MongoDB read without the legacy total-count query.
- `collection.findPageFast`: page + total count in one MongoDB round trip using `$facet`.
- Cached variants: `findOneCached`, `findManyCached`, `findManyFastCached`, `findPageFastCached`.
- Successful legacy MongoDB writes automatically invalidate the new query cache for that collection.

## Compatibility rule

Legacy `find/get/findMany/count/add/update/delete` behavior is intentionally unchanged. In particular, the legacy collection queue remains serialized so older applications that rely on operation ordering are not affected.

## Verification

Run `npm run verify` to execute syntax, regression, HTTP integration, framework smoke, and performance benchmark checks.
