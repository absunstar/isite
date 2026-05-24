# isite Agent Guide

This file is for AI coding agents working in this repository.

## Project Summary

`isite` is a CommonJS Node.js web framework. The package entry point is `index.js`, which exports a factory:

```js
const isite = require('isite');
const site = isite(options);
```

The returned `site` object is the main framework instance. It is extended by modules in `lib/` and by helper modules in `object-options/`.

## Important Files

- `index.js`: Creates the `site` instance, loads all core modules, wires aliases, imports apps, and starts framework services.
- `object-options/index.js`: Applies default options and loads low-level utility helpers.
- `object-options/lib/fn.js`: General utilities such as JSON conversion, dates, numbers, Base64, content types, and object helpers.
- `object-options/lib/event.js`: Global event API: `site.on`, `site.call`, and `site.quee`.
- `object-options/lib/features.js`: Global feature registry.
- `object-options/lib/prototype.js`: Adds `like`, `contains`, `contain`, and `test` helpers to strings and arrays.
- `lib/routing.js`: HTTP routing, request parsing, sessions attachment, and response helper methods.
- `lib/fsm.js`: File-system and site file helpers.
- `lib/mongodb.js`: Low-level MongoDB wrapper.
- `lib/collection.js`: High-level collection wrapper returned by `site.connectCollection`.
- `lib/security.js`: Users, roles, permissions, login, logout, and security route helpers.
- `lib/sessions.js`: Session storage and language switching routes.
- `lib/ws.js`: WebSocket server routes.
- `lib/wsClient.js`: WebSocket client/support connection.
- `lib/app.js`: CRUD-style app connector helper.
- `lib/parser.js`: Server-side HTML/CSS/JS parsing and custom tags.
- `docs/`: Static documentation site for GitHub Pages.

## Architecture

1. `index.js` creates a function object named internally as `____0`.
2. `object-options` merges defaults into `site.options` and attaches utility functions.
3. `index.js` loads modules from `lib/`; each module mutates and returns the same `site` object or a feature object.
4. Routes are registered with `site.onGET`, `site.onPOST`, or `site.onREQUEST`.
5. Requests are normalized and decorated with `req.query`, `req.body`, `req.params`, `req.session`, `req.cookie`, and feature helpers.
6. Responses are decorated with helpers such as `res.render`, `res.json`, `res.download`, `res.redirect`, and `res.status`.
7. MongoDB access can be low-level through `site.mongodb` or high-level through `site.connectCollection`.

## Conventions

- This codebase uses CommonJS, not ESM.
- Most modules export `function init(site) { ... }` and mutate the `site` object.
- Many APIs have aliases. Preserve aliases when changing behavior.
- Existing code uses callback-style async APIs heavily.
- Route names and many parsed request values are lowercased, with raw variants such as `queryRaw` and `paramsRaw`.
- `site_files/` is the expected app asset structure: `html`, `css`, `js`, `json`, `images`, `fonts`, `xml`, and similar folders.
- Apps are loaded from `apps/`, external paths, or built-in package apps using `site.loadApp`, `site.loadLocalApp`, and `site.importApp`.

## Safe Editing Notes

- Avoid broad rewrites. The framework has many implicit aliases and side effects.
- When adding a function, consider whether it needs aliases in `index.js` or the relevant module.
- When editing routes or request handling, check `lib/routing.js` around request decoration and response helper definitions.
- When editing database behavior, check both `lib/mongodb.js` and `lib/collection.js`.
- When editing security behavior, verify permission helpers and the built-in `/x-security/api/...` routes.
- When editing file helpers, remember `lib/fsm.js` caches file content in memory.
- Do not remove prototype helpers unless the whole codebase is audited; many modules use `.like()` and `.contains()`.

## Documentation Files For Agents

- `docs/ai-context.md`: Human-readable agent orientation.
- `docs/api-map.json`: Machine-readable map of major APIs and source files.
- `docs/examples-for-ai.md`: Common implementation recipes.
- `llms.txt`: Short public index for LLM-oriented tools and crawlers.

