# iSite Core v3 — Reliability & Scalability

Core v3 is additive and keeps legacy iSite callback and routing APIs intact.

## New APIs

- `site.inflight.run(key, factory)` — deduplicate concurrent work.
- `site.TaggedCache` / `site.cacheV3` — bounded TTL/LRU cache with tags and stale reads.
- `site.cacheGetOrLoad(key, loader, options)` — cached loader with inflight deduplication and stale-while-revalidate.
- `site.events` — internal EventEmitter-based event bus.
- `site.hooks` — async extension hooks.
- `site.retry(factory, options)` — exponential backoff with jitter.
- `site.withTimeout(factory, ms)` — bounded async operations.
- `site.circuitBreaker(name, options)` — circuit breaker for external dependencies.
- `site.fetchReliable(url, options)` — fetch with optional timeout/retry/circuit breaker.
- `site.pipeline(...middleware)` — prebuilt async middleware pipeline for new code.
- `site.scheduler` — named cancellable timers with overlap protection.
- `site.workers.runFile()` — worker-thread execution for CPU-heavy jobs.
- `site.featuresV3` — feature flags.
- `site.capabilities` — one-time runtime capability detection.
- `site.profile()` / `site.profileReport()` — lightweight profiler.
- `site.memory` — memory pressure observation and conservative V3-cache pruning.
- `site.shutdown` / `site.closeGracefully()` — graceful shutdown registry and server/database closure path.
- `site.httpCache` — ETag/freshness and validated HTTP Range helpers.
- Collection additive Promise helpers: `findOneAsync`, `findManyAsync`, `countAsync`, `exists`, `existsAsync`, `addAsync`, `updateAsync`, `deleteAsync`.

## Diagnostics additions

`site.diagnostics.snapshot()` now includes response p50/p95/p99, V3 cache state and slow-request counts. `site.diagnostics.slowRequests()` returns a bounded list of recent slow requests.

## Compatibility policy

Core v3 does not remove or rename existing iSite APIs. New systems are exposed under new names; old callback APIs and prototypes remain supported and are covered by the regression suite.
