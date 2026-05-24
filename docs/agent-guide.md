# isite Agent Guide

This is the GitHub Pages copy of `../AGENTS.md`.

## Project Summary

`isite` is a CommonJS Node.js web framework. The package entry point is `index.js`, which exports:

```js
const isite = require('isite');
const site = isite(options);
```

The returned `site` object is the main framework instance. Modules in `lib/` and `object-options/` mutate this object to add routing, file helpers, sessions, security, MongoDB, WebSocket support, custom apps, parser behavior, and utilities.

## Important Source Files

- `index.js`: Creates and wires the `site` object.
- `object-options/index.js`: Merges defaults and loads base utilities.
- `object-options/lib/fn.js`: General helpers.
- `object-options/lib/event.js`: `site.on`, `site.call`, and `site.quee`.
- `lib/routing.js`: Routing, request parsing, and response helpers.
- `lib/fsm.js`: File-system and site file helpers.
- `lib/mongodb.js`: Low-level MongoDB wrapper.
- `lib/collection.js`: High-level collection wrapper.
- `lib/security.js`: Users, roles, permissions, login, and logout.
- `lib/sessions.js`: Session storage and language switching.
- `lib/ws.js`: WebSocket routes.
- `lib/app.js`: CRUD-style app connector.
- `lib/parser.js`: Server-side HTML/CSS/JS parser.

## Conventions

- Keep CommonJS syntax.
- Preserve aliases when editing public APIs.
- Prefer callback-style APIs for consistency.
- Most modules export `function init(site) { ... }`.
- Many request values are normalized to lowercase; raw variants often exist.
- `site_files/` contains app assets grouped by type.
- Apps are loaded with `site.loadApp`, `site.loadLocalApp`, and `site.importApp`.
- Prototype helpers such as `.like()` and `.contains()` are used throughout the codebase.

## Safe Editing Notes

- Avoid broad rewrites.
- Check `lib/routing.js` before changing request or response behavior.
- Check both `lib/mongodb.js` and `lib/collection.js` before changing database behavior.
- Check `lib/security.js` before changing auth, roles, or permissions.
- Remember `lib/fsm.js` caches file content in memory.
- Do not remove aliases or prototype helpers without a full audit.

