# iSite Core v20 — Ultra-Fast Init

Version: `2026.08.26-v20`

Core v20 focuses exclusively on the cold-start critical path while preserving the complete legacy API surface.

## Changes

- Avoid unconditional startup stdout output.
- When MongoDB is disabled, `storage`, `words`, and `logs` no longer create collection wrappers or preload queries during initialization. Their legacy `$collection` / `$collectoin` properties remain available and initialize on first access.
- When MongoDB is enabled, the existing preload behavior is unchanged.
- Diagnostic-only native dependencies (`node:events`, `node:perf_hooks`, `node:crypto`) in Core v3/v8 are loaded on first diagnostics/tracing use rather than during cold init.
- v19 event-driven `server.start()` readiness, TLS lazy loading, and deferred outbound WebSocket setup remain unchanged.

No legacy CRUD, router, parser, session, request, response, or collection API is automatically switched to a new execution path.

## Benchmark

Use:

```bash
ISITE_STARTUP_SAMPLES=15 node benchmarks/startup-v19.js
```

The benchmark launches independent Node processes and reports medians for `require`, framework `init`, `start -> listening callback`, and total cold-process readiness.
