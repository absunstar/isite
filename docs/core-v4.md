# iSite Core v4 — Scalability, Lifecycle & HTTP Streaming

Version: `2026.08.26-v4`

Core v4 is additive and backward-compatible by design. Existing callback APIs, route APIs, arrays and legacy public properties remain available. New indexes and reliability primitives sit behind the existing contracts.

## New APIs

### Async context

```js
const context = site.context.create({ operation: 'job' });
await site.context.run(context, async () => {
  console.log(site.context.get());
});
```

HTTP requests automatically enter an AsyncLocalStorage context and expose it as `req.context`.

### Bounded concurrency

```js
const pool = site.pool('external-api', { limit: 8 });
await pool.run(() => callExternalApi());
```

### Micro batching

```js
const users = site.createBatcher(async (ids) => loadUsers(ids));
const [a, b] = await Promise.all([users.load(1), users.load(2)]);
```

### Async memoization

```js
const loadUser = site.memoizeAsync(fetchUser, {
  ttl: 30_000,
  maxEntries: 1000,
  key: id => id,
});
```

### Metrics and health

```js
site.metrics.inc('jobs.completed');
site.metrics.set('queue.depth', 4);
await site.metrics.time('job.duration', doWork);

console.log(site.metrics.snapshot());
console.log(site.health());
```

## Runtime improvements

- MongoDB database and collection connections are indexed and de-duplicated per database/collection instead of one global busy/polling gate.
- WebSocket routes, clients and supported clients are indexed with `Map` while legacy arrays remain available.
- Storage keys, app memory/cache items, proxies, words, Telegram bots and PDF fonts use internal indexes for hot lookups.
- WebSocket heartbeat/reconnect timers, browser retry timers, trusted-online retry timers, proxy timeout and periodic save scheduling no longer unnecessarily keep short-lived processes alive.
- Graceful shutdown clears scheduler/heartbeat state through the existing Core v3 shutdown registry.
- HTTP file downloads now stream once, support metadata ETag, Last-Modified, conditional `304`, validated `Range`/`416`, `If-Range`, and avoid passing raw streams through the response compression wrapper.
- Diagnostics now attach to response `finish/close`, so raw streaming responses are measured too.
- HTTP request metrics are recorded automatically.

## Compatibility policy

Core v4 keeps these legacy contracts intact:

- Existing `site.get/post/all/onGET/onPOST/...` APIs.
- Existing collection callback APIs and legacy collection list.
- Existing MongoDB `connectDB` / `connectCollection` callback signatures.
- Existing `site.ws.clientList`, `supportedClientList`, `routeList` arrays.
- Existing app `add/update/delete/view/all` methods.
- Existing `res.download` / `res.download2` signatures.
- Existing prototype helpers introduced by older iSite versions.

Internal `Map` indexes mirror legacy arrays rather than replacing them.

## Verification

Run:

```bash
npm run verify
```

The verification pipeline includes:

1. Syntax/static check.
2. Regression/compatibility tests.
3. Real HTTP streaming/ETag/Range integration test.
4. Full framework smoke initialization with optional dependencies kept lazy.
5. Routing/pattern benchmark.
