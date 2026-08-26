# iSite Core v19 — Startup Fast Path

Core v19 focuses on time-to-listen while preserving the full legacy API surface.

## Changes

- HTTP-only startup no longer reads TLS key/certificate files or loads `node:https`.
- `server.start()` readiness is event-driven from the native `listen` callback instead of a 100ms polling interval.
- Outbound WebSocket integration starts after HTTP readiness and no longer blocks the HTTP startup critical path.
- Expensive capability probes (`http2`, Brotli/zlib, worker_threads, CPU enumeration) are lazy while preserving `site.capabilities.*` values on access.
- Non-critical Node built-ins (`http2`, `https`, `net`, `child_process`, `readline`, `zlib`, `querystring`) are exposed through lazy getters.
- Added `npm run startup-test` and `npm run benchmark:startup`.

No legacy route, collection, parser, request, response, or application API is removed or renamed.
