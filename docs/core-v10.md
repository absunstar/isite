# iSite Core v10 — Cache Coherence & Query Budgets

Version: `2026.08.26-v10`

Core v10 is additive and keeps legacy iSite APIs unchanged.

## Response cache collection bindings

Bind MongoDB collections to HTTP response-cache tags:

```js
site.responseCache.bindCollection('main.users', ['users', 'dashboard']);
```

After a successful MongoDB insert/update/delete/bulk write on `main.users`, only those bound tags are invalidated automatically.

No collection is bound by default. Existing applications therefore keep their old behavior until this feature is explicitly enabled.

```js
site.responseCache.collectionBinding('main.users');
site.responseCache.collectionBindings();
site.responseCache.unbindCollection('main.users');
site.responseCache.invalidationStats();
```

Manual collection invalidation:

```js
site.responseCache.invalidateCollection('main.users', {
  operation: 'manual',
});
```

## Background response-cache warming

Warm one response:

```js
await site.responseCache.warm(
  { method: 'GET', host: 'app', url: '/dashboard' },
  async () => ({
    status: 200,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(await loadDashboard()),
  }),
  { ttl: 30000, tags: ['dashboard'] }
);
```

Warm many with bounded concurrency:

```js
await site.responseCache.warmMany([
  { key: 'dashboard', loader: loadDashboardResponse, options: { tags: ['dashboard'] } },
  { key: 'users', loader: loadUsersResponse, options: { tags: ['users'] } },
], {
  concurrency: 4,
  cache: { ttl: 30000 },
});
```

Schedule warming:

```js
site.responseCache.scheduleWarm(
  'home-data',
  60000,
  async () => [
    { key: 'dashboard', loader: loadDashboardResponse },
    { key: 'news', loader: loadNewsResponse },
  ],
  { concurrency: 2, cache: { ttl: 60000 } }
);
```

Cancel:

```js
site.responseCache.cancelWarm('home-data');
```

Statistics:

```js
site.responseCache.warmStats();
```

Concurrent warming of the same key is de-duplicated through the existing response-cache inflight layer.

## Mongo query budgets

Budgets can observe query latency without modifying legacy query behavior:

```js
site.mongoBudget.set('main.users', 'findManyFast', {
  warnMs: 100,
  maxTimeMS: 1000,
});
```

`warnMs` is observational and can produce trace/events when telemetry exceeds the threshold.

`maxTimeMS` is enforced only through the new opt-in budgeted collection APIs.

```js
const docs = await users.findManyBudgeted({
  where: { active: true },
  limit: 100,
});
```

Page + total count:

```js
const { list, count } = await users.findPageBudgeted({
  where: { active: true },
  skip: 0,
  limit: 50,
});
```

Batch IDs:

```js
const docs = await users.findByIdsBudgeted(
  [10, 11, 12],
  { field: 'id' }
);
```

Per-call budget override:

```js
const docs = await users.findManyBudgeted(
  { where: { active: true } },
  { maxTimeMS: 500 }
);
```

Budget management:

```js
site.mongoBudget.get('main.users', 'findManyFast');
site.mongoBudget.list();
site.mongoBudget.delete('main.users', 'findManyFast');
site.mongoBudget.clear();
site.mongoBudget.stats();
```

Telemetry remains available through:

```js
site.mongoTelemetry.recent();
site.mongoTelemetry.report();
site.mongoTelemetry.inefficient();
```

## Health

`site.health()` now includes:

```text
mongoBudget
responseCacheInvalidation
responseCacheWarming
```

## Backward compatibility

The following legacy APIs remain unchanged and continue using their previous paths:

```js
collection.find()
collection.get()
collection.findOne()
collection.findMany()
collection.add()
collection.update()
collection.delete()

site.get()
site.post()
site.readFile()
site.writeFile()
res.download()
```

Core v10 does not add MongoDB `maxTimeMS` to old reads. It is only used by the new `findManyBudgeted`, `findPageBudgeted`, and `findByIdsBudgeted` APIs.
