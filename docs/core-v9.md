# iSite Core v9 - Query Telemetry and HTTP Response Cache

Version: `2026.08.26-v9`

Core v9 is additive. Legacy route, parser, collection CRUD, file, session and response APIs keep their existing signatures and behavior.

## Mongo execution telemetry

`site.mongoTelemetry` records execution timing and, when explain data is supplied, index effectiveness metrics.

```js
console.log(site.mongoTelemetry.stats());
console.log(site.mongoTelemetry.recent(50));
console.log(site.mongoTelemetry.report());
console.log(site.mongoTelemetry.inefficient({
  minScanRatio: 10,
  minDocsExamined: 100,
}));
```

A telemetry row may include:

```js
{
  collection: 'main.users',
  operation: 'findMany',
  ms: 4.8,
  docsExamined: 120,
  keysExamined: 120,
  nReturned: 10,
  scanRatio: 12,
  keyRatio: 12,
  indexName: 'active_1',
  stage: 'IXSCAN'
}
```

Normal Mongo reads record elapsed time automatically. This is observability only and does not change query behavior.

## Explain a query

Use the new opt-in collection helper:

```js
const explain = await users.explainFast({
  where: { active: true },
  sort: { createdAt: -1 },
  limit: 50,
});
```

Or low-level:

```js
site.mongodb.explainQuery({
  dbName: 'main',
  collectionName: 'users',
  where: { active: true },
  verbosity: 'executionStats',
}, (err, explain) => {
  // ...
});
```

Explain results are recorded into `site.mongoTelemetry` automatically.

## HTTP response cache

`site.responseCache` is an opt-in tagged response cache. No existing route is cached automatically.

```js
const key = site.responseCache.key({
  method: req.method,
  host: req.host,
  url: req.url,
  vary: {
    language: req.session?.language?.id,
  },
});

const cached = await site.responseCache.getOrLoad(
  key,
  async () => {
    return {
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(await loadData()),
    };
  },
  {
    ttl: 15000,
    staleTTL: 60000,
    staleWhileRevalidate: true,
    tags: ['users', 'dashboard'],
  }
);

site.responseCache.apply(res, cached);
```

Invalidate dependent responses:

```js
site.responseCache.invalidateTag('users');
```

Other APIs:

```js
site.responseCache.get(key);
site.responseCache.set(key, value, options);
site.responseCache.delete(key);
site.responseCache.clear();
site.responseCache.stats();
```

## Health

`site.health()` now additionally includes:

```js
{
  mongoTelemetry: site.mongoTelemetry.stats(),
  responseCache: site.responseCache.stats(),
}
```

## Compatibility

Core v9 does not replace legacy APIs such as:

```js
collection.find();
collection.get();
collection.findOne();
collection.findMany();
collection.add();
collection.update();
collection.delete();

site.get();
site.post();
site.readFile();
site.writeFile();
res.download();
```

The parser legacy hidden-token regression test also remains part of `npm run verify`.
