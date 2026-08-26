# iSite Core v22 — Startup Compile Cache

Core v22 continues the startup-only optimization track while preserving the complete legacy API surface.

## Changes

- Adds an opt-in Node CommonJS/V8 compile-cache fast path (`ISITE_COMPILE_CACHE=1`) when `node:module.enableCompileCache()` is available. It is deliberately not enabled by default because creation of a brand-new cache can slightly slow the first-ever process.
- Adds a compatibility-safe fast path for the internal numeric `from123()` decoder. Malformed/non-numeric inputs fall back to the exact legacy algorithm.
- Routes the WebSocket-ready startup message through `site.log()` so `log:false` avoids unnecessary stdout I/O.
- No legacy route, collection, parser, session, MongoDB, request, or response API is replaced.

## Startup behavior

The first process with an empty Node compile cache remains close to the previous cold-start cost. Later processes can reuse compiled bytecode and avoid repeating much of the JavaScript parse/compile work.

The optimization is transparent: it does not change source files exposed through direct legacy `require()` calls and does not require application changes.
