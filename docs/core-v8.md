# iSite Core v8 - Observability, Resource Lifecycle and Incremental Pipelines

Version: `2026.08.26-v8`

Core v8 is additive. It does not replace or change legacy routing, collection CRUD, parser, file, session, WebSocket, or response APIs.

## Structured trace API

```js
site.trace.info('user loaded', { id: 10 });
site.trace.warn('slow query', { ms: 250 });
site.trace.error('job failed', error);

console.log(site.trace.recent(50));
console.log(site.trace.stats());
```

When `site.context` is active, trace rows inherit context/request/operation identifiers automatically.

Child logger:

```js
const log = site.trace.child({ component: 'payments' });
log.info('started', { id: 1 });
```

## Resource registry

Track resources that expose `close`, `destroy`, `terminate`, `end`, or `stop`:

```js
site.resources.add(cursor, { id: 'export-cursor' });
site.resources.add(watcher, { id: 'watcher' });

await site.resources.close('export-cursor');
await site.resources.closeAll();
```

The registry integrates with the v3 shutdown registry when available.

## Concurrency helpers

```js
const result = await site.async.mapLimit(items, 8, async item => {
    return processItem(item);
});

await site.async.eachLimit(items, 4, processItem);
const filtered = await site.async.filterLimit(items, 4, predicate);
```

## JSON-array streaming

```js
const cursor = await collection.streamFast({ where: { active: true } });
await site.stream.jsonArray(cursor, res);
```

This streams a valid JSON array and honors writable backpressure without buffering the full iterable.

## Incremental static prewarm

```js
const previous = await site.staticAssets.buildManifest(site.dir);
// ... files change ...
const current = await site.staticAssets.buildManifest(site.dir);
const diff = site.staticAssets.diffManifest(previous, current);

const result = await site.staticAssets.prewarmChanged(previous, current, {
    encoding: 'br',
    concurrency: 4,
});
```

Only added or changed files are precompressed.

## Query-plan cache

The query-plan API is opt-in and never executes or rewrites legacy CRUD calls.

```js
const plan = site.queryPlan.compile('main.users', 'findMany', {
    where: { active: true },
    sort: { id: -1 },
    limit: 50,
});

const page2 = site.queryPlan.instantiate(plan, { skip: 50 });
```

```js
site.queryPlan.stats();
site.queryPlan.clear();
```

## Health additions

`site.health()` now also reports:

- trace buffer statistics,
- tracked resource count,
- query-plan cache statistics.

## Compatibility

Legacy APIs remain untouched, including collection aliases such as `find/get/findOne`, serialized legacy reads/writes, parser hidden-token behavior, route APIs, file APIs, and response download APIs.
