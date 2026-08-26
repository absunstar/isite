# iSite Core v21 — Startup Bundle

Core v21 continues the startup-performance work without changing legacy API semantics.

## Startup changes

- The additive core initializers (`performance`, `core-v3` … `core-v18`) are loaded through one generated CommonJS startup bundle to reduce repeated module-resolution and file-loader overhead.
- Original `lib/core-v*.js` files remain present and public for direct legacy requires.
- `node:crypto` in v3/v5/v9 and `node:zlib` in v5 are first-use lazy where their public helpers allow it.
- Mongo preloads for words/storage/logs and security index maintenance start on the next event-loop turn. These operations were already asynchronous; their APIs, queries, callbacks, and resulting data remain unchanged.
- The trusted-online background request is scheduled on the next event-loop turn instead of competing with synchronous initialization.
- When MongoDB is disabled, the sessions collection wrapper is created lazily while preserving `sessions.$collection` on first access.

## Bundle integrity

Run:

```bash
npm run build:startup-bundle
npm run core-bundle-test
```

The integrity test fails if the generated bundle differs from its authoritative source modules.

## Compatibility

Core v21 keeps historical framework baselines from v14, v16, v17, v18, v19 and v20, and adds a v21 baseline. Legacy HTTP aliases and collection APIs remain unchanged.
