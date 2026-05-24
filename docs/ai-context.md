# AI Context For isite

This file gives AI agents a compact understanding of how the isite library works.

## One Sentence

isite is a callback-oriented CommonJS Node.js framework that builds a mutable `site` object with routing, file serving/parsing, sessions, security, MongoDB, WebSockets, custom apps, and helper utilities.

## Mental Model

Think of `site` as a single application container:

- `index.js` creates it.
- `object-options/` configures it and attaches base utilities.
- `lib/*.js` modules add features to it.
- App modules receive it and register their own routes, words, vars, permissions, roles, and database logic.

Most framework APIs mutate this shared `site` object or register callbacks on it.

## Startup Flow

1. User calls `require('isite')(options)`.
2. `index.js` loads Node core modules and package dependencies onto the site object.
3. `object-options` merges defaults and attaches utilities.
4. File helpers from `lib/fsm.js` are assigned to aliases such as `site.html`, `site.readFile`, and `site.writeFile`.
5. Routing helpers from `lib/routing.js` are assigned to aliases such as `site.onGET`, `site.get`, `site.post`, and `site.run`.
6. Vars, MongoDB, words, storage, logs, security, cookies, sessions, parser, WebSocket, email, browser, helper, PDF, apps, eval, and proxy modules are loaded.
7. Default app folders may be auto-loaded.
8. Upload, download, and backup folders are created.
9. `site.run()` starts HTTP/HTTPS servers.

## Main Public API Families

### Routing

Use `site.onGET`, `site.onPOST`, `site.onPUT`, `site.onDELETE`, `site.onALL`, or `site.onREQUEST`.

Routes accept strings, route objects, file paths, callbacks, arrays of route names, dynamic parameters, and wildcard patterns.

### Request

Common request fields:

- `req.query` and `req.queryRaw`
- `req.body`, `req.data`, `req.bodyRaw`, and `req.dataRaw`
- `req.params` and `req.paramsRaw`
- `req.session`
- `req.files`
- `req.cookie(name)`
- `req.hasFeature(name)`
- `req.ip`, `req.port`, `req.ip2`, `req.port2`

### Response

Common response helpers:

- `res.status(code)`
- `res.set(name, value)`
- `res.render(file, data, options)`
- `res.html(file, data, options)`
- `res.css(name, data)`
- `res.js(name, data)`
- `res.json(obj)`
- `res.send(content)`
- `res.redirect(url, code)`
- `res.download(path, name)`
- `res.cookie(name, value)`

### Files

Use `site.html`, `site.css`, `site.js`, `site.json`, and `site.xml` for files inside `site_files`.

Use `site.readFile`, `site.readFiles`, `site.writeFile`, `site.removeFile`, and `site.createDir` for custom paths.

### MongoDB

Prefer:

```js
const users = site.connectCollection('users');
```

Then use high-level helpers such as:

- `insertOne`, `add`, `addOne`
- `insertMany`, `addMany`, `addAll`
- `findOne`, `find`, `get`, `select`
- `findMany`, `findAll`, `getAll`, `selectMany`
- `updateOne`, `update`, `edit`
- `updateMany`, `updateAll`, `editMany`
- `deleteOne`, `delete`, `remove`
- `deleteMany`, `deleteAll`, `removeMany`
- `count`, `aggregate`, `createIndex`, `createUnique`, `import`, `export`

Use `site.mongodb` only when a low-level wrapper is needed.

### Security

`site.security` exists when `options.security.enabled` is true. It manages users, roles, permissions, login, logout, registration, and permission checks.

### Events

Use:

```js
site.on('event name', callback);
site.call('event name', payload, callback);
site.quee('event name', payload, callback);
```

`quee` runs event handlers as a queued sequence.

## Code Style Notes

- Keep CommonJS syntax.
- Keep callback APIs unless deliberately adding a new async wrapper.
- Preserve existing aliases.
- Do not assume `site.security` exists when security is disabled.
- Route handlers commonly use normal functions, but arrow functions also appear.
- Many framework helpers tolerate flexible input types. Avoid narrowing accepted shapes without checking existing usage.

## Common Pitfalls

- `site.html('index', cb)` reads `site_files/html/index.html`; it does not render an arbitrary absolute path.
- Some request data is lowercased by default. Use `queryRaw` or `paramsRaw` for original casing.
- The file manager caches reads in memory.
- Collection calls are internally queued; do not bypass task state unless you understand `lib/collection.js`.
- The project extends `String.prototype` and `Array.prototype`; removing those helpers breaks `.like()` and `.contains()` usage.
- The folder originally requested as `Documention` has been moved to `docs` for GitHub Pages compatibility.

