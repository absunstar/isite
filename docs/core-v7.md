# iSite Core v7 - Safe Scale & Query Intelligence

Core v7 is additive and keeps legacy APIs unchanged. It is built on the UTF-8 + parser compatibility-fixed v6 baseline.

## New APIs

### Mongo query-shape advisor

```js
site.mongoAdvisor.report();
site.mongoAdvisor.suggest({ minCount: 5 });
site.mongoAdvisor.clear();
site.mongoAdvisor.stats();
```

The advisor observes query shapes and suggests candidate compound indexes. It never creates indexes automatically and never changes query execution.

### Automatic ID batching

```js
const user = await users.findByIdBatched(123);
const rows = await users.findIdsBatched([1, 2, 3]);
users.batchStats();
```

Same-tick ID reads are coalesced through the existing `findByIdsFast()` path. Legacy `find/get/findOne/findMany` remain serialized and unchanged.

### Generic ID batcher

```js
const batcher = site.createIdBatcher(async ids => loadMany(ids));
const value = await batcher.load(id);
```

### NDJSON streaming

```js
await site.stream.ndjson(asyncIterable, writable);
```

Writes incrementally and respects writable backpressure instead of buffering the whole dataset in memory.

### Named compatibility contracts

```js
site.compat.pin('my-app-v1', site, ['get', 'post', 'connectCollection']);
site.compat.check('my-app-v1');
site.compat.contracts();
```

## Compatibility

No existing API is removed or renamed. Legacy collection methods keep the same aliases and serialized path. Parser legacy hidden tokens remain covered by regression tests.

## Verification

Run:

```bash
npm run verify
```

The verification suite includes JavaScript syntax, UTF-8 validation, compatibility/regression tests, HTTP integration, full framework smoke, and benchmarks.
