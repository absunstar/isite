# iSite Core v16 — Cancellation, Backpressure, Leak Diagnostics and Validation

Core v16 is additive. It does not change the signatures or semantics of legacy routing, collection, parser, request, response, session, file, or MongoDB APIs.

## Cancellation

New APIs:

- `site.abort.create({ signal, signals, timeoutMs })`
- `site.abort.link(controller, signal)`
- `site.abort.throwIfAborted(signal)`
- `site.abort.withSignal(signal, fn)`
- `site.async.mapLimitAbortable(...)`
- `site.async.eachLimitAbortable(...)`
- `site.async.filterLimitAbortable(...)`

No legacy operation receives a timeout or AbortSignal automatically.

## Backpressure

`site.BackpressureQueue` and `site.backpressureQueue(name, options)` provide bounded queued work with explicit producer backpressure, concurrency limits, `onIdle()`, statistics, resize and close support.

## Leak diagnostics

`site.leaks` provides observational snapshots and optional explicit budgets:

- `snapshot()`
- `baseline(name)`
- `compare(nameOrSnapshot, budgets)`
- `assert(nameOrSnapshot, budgets)`
- `watch(options)` / `stop(id)` / `stopAll()` / `watches()`

Nothing is watched automatically in production. Watch timers are unref'ed and shutdown-aware.

## Validation

`site.validate.routes()` reports duplicate, invalid and potentially overlapping routes without changing route order or matching behavior.

`site.validate.options()` validates common configuration value types/ranges without changing configuration.

`site.validate.all()` combines both. Assertion mode is opt-in.
