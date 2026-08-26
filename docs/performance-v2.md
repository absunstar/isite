# iSite Performance v2 — 2026-08-26

This release focuses on runtime efficiency while preserving the existing public APIs used by current iSite applications.

## Runtime changes

- Indexed router with O(1)-style exact-route lookup and precompiled dynamic route patterns.
- Event-driven collection queue; removed the global 10 ms polling loop.
- Session access-token/user indexes backed by `Map` while retaining `sessions.list` compatibility.
- Authenticated-user session cache with configurable TTL and explicit invalidation after security mutations.
- File cache backed by `Map`, LRU-style eviction, byte/entry budgets, positive and negative path caches.
- Truly asynchronous atomic `writeFile` implementation.
- Async Brotli/gzip/deflate response compression with a small-response threshold.
- Bounded shared-response cache with TTL and memory limits.
- Bounded `Map`-based route rate limiting instead of growing IP arrays.
- Request-body byte limits and multipart upload limits.
- Cached string/pattern matchers while retaining `.test()`, `.like()` and `.contains()` compatibility.
- Cached parser token compilation.
- Cached User-Agent feature detection.
- Indexed security users, roles and permissions.
- Lazy loading for optional/heavy dependencies such as MongoDB, WebSocket, PDF, mail, archive and image tooling.
- Native Node `fetch` for normal requests; lazy `node-fetch` fallback remains for legacy proxy/agent compatibility.
- Lightweight runtime diagnostics exposed at `site.diagnostics.snapshot()`.

## New/updated options

- `session.userCacheTTL` — defaults to 30 seconds.
- `request.maxBodyBytes` — defaults to 10 MiB.
- `request.maxFileBytes` — defaults to 50 MiB.

## Verification commands

```bash
npm run check
npm test
npm run smoke
npm run benchmark
npm run verify
```

The benchmark is a microbenchmark intended to compare routing/matcher implementations, not to predict end-to-end application throughput.
