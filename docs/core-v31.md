# iSite Core v31 — Lazy Security Startup

Version: `2026.08.26-v31`

Core v31 keeps the full legacy Security API contract while moving the heavy `lib/security.js` initializer off the pre-listen critical path.

- `site.$users` and `site.$roles` are still created eagerly when Security is enabled.
- `site.security` remains an own enumerable public property.
- First access to `site.security` materializes the original Security initializer synchronously.
- The original collection objects are reused; no collection identity changes.
- No legacy CRUD, routing, parser, session, or callback semantics are changed.

This optimization primarily reduces cold startup latency for applications with `security.enabled: true`.
