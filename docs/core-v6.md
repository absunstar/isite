# iSite Core v6 — Compatibility, Query Generations, Batch & Streaming DB

Version: `2026.08.26-v6`

Core v6 is additive and keeps legacy iSite APIs intact. No legacy collection CRUD method is replaced or made parallel implicitly.

## Query cache generation invalidation

The v5 `site.query.cached()` and `site.query.invalidate()` signatures are preserved. Internally, invalidation now increments a per-collection generation instead of scanning the full query cache. This makes invalidation O(1). Old-generation entries remain bounded by the existing AdaptiveCache TTL/LRU budgets and become unreachable immediately.

New inspection helpers:

```js
site.query.generation('main.users');
site.query.stats();
site.query.invalidateAll();
```

## Compatibility contracts

Applications can snapshot and assert the public API shape they depend on:

```js
const contract = site.compat.snapshot(site, [
  'get', 'post', 'connectCollection', 'readFile', 'writeFile'
]);

site.compat.assert(contract);
```

Helpers:

```js
site.compat.snapshot(target, names)
site.compat.compare(expected, target)
site.compat.assert(expected, target)
```

This is intended for regression/upgrade testing and does not alter any legacy API.

## Static asset manifests and prewarming

New opt-in APIs build a manifest once and precompress eligible static assets using the v5 bounded compression cache:

```js
const manifest = await site.staticAssets.buildManifest('./site_files');
const result = await site.staticAssets.prewarmManifest(manifest, {
  encoding: 'br',
  concurrency: 4,
});
```

Additional helpers:

```js
site.staticAssets.manifest(root)
site.staticAssets.clearManifest(root)
```

## Batch ID reads

New API for one MongoDB query instead of N independent reads:

```js
const users = await usersCollection.findByIdsFast([1, 2, 3]);
```

Options:

```js
await usersCollection.findByIdsFast(ids, {
  field: 'id',
  where: { active: true },
  select: { id: 1, name: 1 },
  sort: { id: 1 },
});
```

Cached variant:

```js
await usersCollection.findByIdsFastCached(ids, options, cacheOptions);
```

## Bulk writes

New opt-in API uses MongoDB `bulkWrite()` and performs query-cache invalidation once after success:

```js
await collection.bulkWriteFast([
  { updateOne: { filter: { id: 1 }, update: { $set: { active: true } } } },
  { deleteOne: { filter: { id: 2 } } },
]);
```

Legacy `add/update/delete/...` methods are unchanged.

## Streaming MongoDB reads

New API returns a MongoDB cursor instead of materializing the entire result set in memory:

```js
const cursor = await collection.streamFast({
  where: { active: true },
  select: { id: 1, name: 1 },
  batchSize: 500,
});

for await (const doc of cursor) {
  // process one document at a time
}
```

This is useful for exports, migrations, large reports and maintenance tasks.

## Validation

Core v6 verification includes:

- static syntax validation
- 36 regression/compatibility tests
- HTTP streaming/ETag/Range integration test
- full framework lazy-dependency smoke initialization
- performance benchmark

Run everything with:

```bash
npm run verify
```
