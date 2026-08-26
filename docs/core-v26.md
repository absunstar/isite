# iSite Core v26 — Lazy Advanced Core Startup

Core v26 reduces the cold-start critical path without removing or renaming public APIs.

`core-v3` remains eager because the legacy startup path uses its scheduler and base primitives. The additive Core v4–v18 layers are exposed immediately as enumerable own properties and initialize synchronously on first access.

This keeps the public API available to applications that access advanced APIs immediately after `init()`, while normal applications that only register routes and call `start()` do not parse and execute the advanced core bundle before the HTTP listener is ready.

The original `lib/core-v*.js` modules and the generated `lib/core-startup-bundle.js` remain unchanged and directly require-able.

## Compatibility rule

No legacy route, parser, collection, session, filesystem, response or server API is removed or renamed. Accessing any advanced Core v4–v18 API initializes the full advanced layer in the same historical order.

## Startup trade-off

The work is deferred, not deleted. A first request that uses request context/telemetry may activate the advanced core. Applications that prefer repeated first-request latency over minimum listen latency may explicitly warm it with:

```js
site._initAdvancedCore();
```

This helper is non-enumerable and internal; existing public APIs remain the preferred activation mechanism.
