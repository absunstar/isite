# iSite

**Current version:** `2026.08.26-v18`

iSite is a Node.js web framework used by Social Browser and other applications. It provides routing, file serving, server-side parsing, sessions, security integration, MongoDB helpers, WebSocket support, caching, diagnostics, reliability primitives, high-throughput database helpers, and backward-compatible legacy APIs.

> **Backward compatibility rule**
>
> Existing iSite APIs are kept intact. New high-performance and reliability APIs are additive and opt-in when their behavior could differ from legacy serialized execution.

---

## Table of Contents

- [Highlights](#highlights)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Routing](#routing)
- [Request Data](#request-data)
- [Response Helpers](#response-helpers)
- [Files, Static Assets, Uploads and Downloads](#files-static-assets-uploads-and-downloads)
- [Server-Side Parser and HTML Tags](#server-side-parser-and-html-tags)
- [Cookies and Sessions](#cookies-and-sessions)
- [Events, Hooks and Middleware](#events-hooks-and-middleware)
- [WebSocket](#websocket)
- [MongoDB - Legacy Compatible APIs](#mongodb---legacy-compatible-apis)
- [MongoDB - Promise APIs](#mongodb---promise-apis)
- [MongoDB - Parallel, Fast and Cached Reads](#mongodb---parallel-fast-and-cached-reads)
- [MongoDB - Batch, Bulk and Streaming APIs](#mongodb---batch-bulk-and-streaming-apis)
- [MongoDB Query Advisor](#mongodb-query-advisor)
- [Caching APIs](#caching-apis)
- [Inflight Deduplication and Batching](#inflight-deduplication-and-batching)
- [Reliability APIs](#reliability-apis)
- [Async Context and Concurrency](#async-context-and-concurrency)
- [Scheduler and Worker Threads](#scheduler-and-worker-threads)
- [Metrics, Diagnostics, Profiling and Health](#metrics-diagnostics-profiling-and-health)
- [HTTP Cache and Range Helpers](#http-cache-and-range-helpers)
- [Streaming Helpers](#streaming-helpers)
- [Feature Flags and Runtime Capabilities](#feature-flags-and-runtime-capabilities)
- [Memory and Adaptive Cache Tuning](#memory-and-adaptive-cache-tuning)
- [Graceful Shutdown](#graceful-shutdown)
- [Compatibility Contracts](#compatibility-contracts)
- [Helper Functions](#helper-functions)
- [Verification and Benchmarks](#verification-and-benchmarks)
- [UTF-8 Policy](#utf-8-policy)

---

## Core v14: Smart Code `findMany` optimization

Core v14 keeps legacy `collection.findMany()` unchanged and adds explicit faster choices discovered from the full Smart Code usage scan:

```js
const docs = await collection.findManyNoCount(options);
const { list, count } = await collection.findManyConcurrent(options);
```

Cached forms are also available:

```js
collection.findManyNoCountCached(options, { ttl: 15000 });
collection.findManyConcurrentCached(options, { ttl: 15000 });
```

Analyze a Smart Code checkout:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:findmany
```

See `docs/core-v14.md` for details.

---

# Highlights

- Fast indexed routing for exact routes.
- Precompiled dynamic and wildcard route matching.
- Backward-compatible route APIs such as `site.onGET`, `site.onPOST`, `site.get`, and `site.post`.
- Event-driven collection queues; legacy collection execution order is preserved.
- MongoDB integration with legacy callback APIs and new Promise/fast/batch/streaming APIs.
- File cache, response cache, adaptive caches, tagged TTL caches, and query cache.
- Async Brotli/gzip/deflate support.
- ETag, Last-Modified, `304`, Range, `206`, `416`, and `If-Range` support for downloads.
- Sessions, security integration, roles and permissions.
- WebSocket support.
- Server-side HTML parser and iSite tags.
- Request/query inflight de-duplication.
- Retries, timeouts, circuit breakers and reliable fetch.
- AsyncLocalStorage request/operation context.
- Bounded concurrency pools and micro-batching.
- Metrics, health snapshots, slow-request diagnostics and profiling.
- Graceful shutdown and central timer scheduler.
- MongoDB query-shape/index advisor.
- Compatibility-contract API for preventing accidental API breakage.
- UTF-8 validation built into the verification pipeline.

---

# Installation

```bash
npm install isite
```

Check the installed version:

```js
const isite = require('isite');

console.log(require('isite/package.json').version);
```

---

# Quick Start

```js
const isite = require('isite');

const site = isite({
  port: 8080,
});

site.onGET('/', (req, res) => {
  res.end('Hello from iSite');
});

site.run();
```

Multiple ports:

```js
const site = require('isite')();

site.run([8080, 5555, 9090]);
```

Load local applications:

```js
site.loadLocalApp('client-side');
site.loadLocalApp('security');

site.run();
```

---

# Configuration

Typical configuration:

```js
const site = require('isite')({
  port: process.env.port || 80,

  cwd: process.cwd(),
  dir: process.cwd() + '/site_files',

  upload_dir: process.cwd() + '/../uploads',
  download_dir: process.cwd() + '/../downloads',
  backup_dir: process.cwd() + '/../backup',

  apps: true,
  apps_dir: process.cwd() + '/apps',

  name: 'Your Site',

  log: true,
  lang: 'en',

  language: {
    id: 'en',
    dir: 'ltr',
    text: 'left',
  },

  theme: 'default',
  help: true,
  stdin: true,

  https: {
    enabled: false,
    port: null,
    ports: [],
    key: null,
    cert: null,
  },

  mongodb: {
    enabled: true,
    host: 'localhost',
    port: '27017',
    username: null,
    password: null,

    db: 'default_db',
    collection: 'default_collection',
    limit: 10,

    prefix: {
      db: '',
      collection: '',
    },

    identity: {
      enabled: true,
      start: 1,
      step: 1,
    },
  },

  session: {
    enabled: true,
    timeout: 60 * 24 * 30,
    storage: 'file',
    db: null,
    collection: 'users_sessions',

    // Modern cache option:
    userCacheTTL: 30 * 1000,
  },

  request: {
    // Modern safety/performance limits:
    maxBodyBytes: 10 * 1024 * 1024,
    maxFileBytes: 50 * 1024 * 1024,
  },

  security: {
    enabled: true,
    db: null,
    users_collection: 'users_info',
    roles_collection: 'users_roles',

    admin: {
      email: 'admin@isite',
      password: 'P@$$w0rd',
    },

    users: [],
  },

  cache: {
    enabled: true,
    html: 0,
    txt: 60 * 24 * 30,
    js: 60 * 24 * 30,
    css: 60 * 24 * 30,
    fonts: 60 * 24 * 30,
    images: 60 * 24 * 30,
    json: 60 * 24 * 30,
    xml: 60 * 24 * 30,
  },

  proto: {
    object: true,
  },
});

site.run();
```

---

# Project Structure

A typical project:

```text
server.js
package.json
apps/
site_files/
  html/
  css/
  js/
  json/
  fonts/
  images/
  xml/
uploads/
downloads/
backup/
```

---

# Routing

## Basic routes

```js
site.onGET('/', (req, res) => {
  res.end('Home');
});

site.onPOST('/api/users', (req, res) => {
  res.json({ done: true });
});

site.onPUT('/api/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

site.onDELETE('/api/users/:id', (req, res) => {
  res.json({ deleted: req.params.id });
});
```

Legacy route aliases remain supported:

```js
site.get('/hello', (req, res) => res.end('hello'));
site.post('/save', (req, res) => res.end('saved'));
```

## Route object

```js
site.onGET({
  name: '/',
  path: site.dir + '/html/index.html',
  parser: 'html',
  compress: true,
  cache: false,
});
```

## Multiple route names

```js
site.onGET({
  name: ['/', '/home', '/index'],
  path: site.dir + '/html/index.html',
});
```

## Merge multiple files into one route

```js
site.onGET({
  name: '/css/style.css',
  path: [
    site.dir + '/css/base.css',
    site.dir + '/css/theme.css',
  ],
});
```

## Dynamic parameters

```js
site.onGET('/post/:id/category/:categoryId', (req, res) => {
  res.json({
    id: req.params.id,
    categoryId: req.params.categoryId,
  });
});
```

## Wildcards

```js
site.onGET('/post/*', (req, res) => {
  res.end('Matched a post route');
});

site.onGET('*', (req, res) => {
  res.status(404).end('Not Found');
});
```

## Call another route

```js
site.onGET('/home2', (req, res) => {
  site.callRoute('/home', req, res);
});
```

## Route an entire folder

```js
site.onGET({
  name: '/js',
  path: site.dir + '/js',
});

site.onGET({
  name: '/css',
  path: site.dir + '/css',
});
```

---

# Request Data

## Query string

```js
site.onGET('/search', (req, res) => {
  console.log(req.query.name);
  console.log(req.queryRaw.name);

  res.end('ok');
});
```

## Request body

```js
site.onPOST('/api', (req, res) => {
  console.log(req.body);
  res.json({ done: true });
});
```

## Dynamic params

```js
site.onGET('/user/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.paramsRaw.id);

  res.end('ok');
});
```

## Request information

```js
site.onGET('/request-info', (req, res) => {
  res.json({
    ip: req.ip,
    port: req.port,
    serverIp: req.ip2,
    serverPort: req.port2,
    features: req.features,
  });
});
```

## Feature detection

```js
if (req.hasFeature('browser.chrome')) {
  // Chrome / Chromium-compatible client
}

if (req.hasFeature('os.windows')) {
  // Windows
}

if (req.hasFeature('os.android')) {
  // Android
}
```

Modern request contexts also expose:

```js
site.onGET('/context', (req, res) => {
  console.log(req.context);
  res.json(req.context);
});
```

---

# Response Helpers

```js
site.onGET('/', (req, res) => {
  res.code = 200;

  res.status(200);

  res.set('Content-Type', 'text/plain');
  res.remove('Content-Type');
  res.delete('Content-Type');

  res.redirect('/home', 302);

  res.send('text or object');
});
```

Render helpers:

```js
site.onGET('/', (req, res) => {
  res.render(
    'index.html',
    {
      name: 'Amr',
      age: 36,
    },
    {
      compress: true,
      cache: false,
      parser: 'html css js',
    }
  );
});
```

Other helpers:

```js
res.htmlContent('<h1>Hello</h1>');
res.html('index');
res.css('bootstrap');
res.js('jquery');
res.json({ done: true });
```

---

# Files, Static Assets, Uploads and Downloads

## Read files

```js
site.readFile('/path/to/file.txt', (err, content, file) => {
  if (err) return console.error(err);

  console.log(content);
  console.log(file.stat);
});
```

Convenience readers:

```js
site.html('index', (err, content) => {});
site.css('bootstrap', (err, content) => {});
site.js('app', (err, content) => {});
site.json('items', (err, content) => {});
site.xml('rss', (err, content) => {});
```

Read and merge files:

```js
site.readFiles(
  [
    site.dir + '/html/header.html',
    site.dir + '/html/content.html',
    site.dir + '/html/footer.html',
  ],
  (err, content) => {
    if (err) throw err;

    console.log(content);
  }
);
```

## File checks

```js
site.isFileExists('/path/to/file', (yes) => {
  console.log(yes);
});

const yes = site.isFileExistsSync('/path/to/file');
```

File stats:

```js
site.fileStat('/path/to/file', (err, stats) => {
  console.log(stats);
});

const stats = site.fileStatSync('/path/to/file');
```

## Write and delete

```js
site.writeFile('/tmp/data.json', JSON.stringify({ done: true }), (err) => {
  if (err) console.error(err);
});
```

```js
site.removeFile('/tmp/data.json', (err) => {});
site.deleteFile('/tmp/data.json', (err) => {});
```

Create a directory:

```js
site.createDir('/tmp/new-folder', (err, path) => {});
site.makeDir('/tmp/new-folder', (err, path) => {});
```

## File uploads

HTML:

```html
<form action="/uploadFile" method="post" enctype="multipart/form-data">
  <input type="file" name="fileToUpload">
  <button type="submit">Upload</button>
</form>
```

Server:

```js
site.onPOST('/uploadFile', (req, res) => {
  const file = req.files.fileToUpload;
  const newPath = site.upload_dir + '/' + file.originalFilename;

  site.mv(file.filepath, newPath, (err) => {
    res.json({
      done: !err,
      error: err || null,
    });
  });
});
```

## Downloads

```js
site.onGET('/download', (req, res) => {
  res.download(site.download_dir + '/file.zip');
});
```

Custom download name:

```js
site.onGET('/download', (req, res) => {
  res.download(
    site.download_dir + '/file.zip',
    'backup.zip'
  );
});
```

Modern iSite download handling supports:

- streaming instead of loading the entire file into memory,
- ETag,
- Last-Modified,
- `304 Not Modified`,
- HTTP Range requests,
- `206 Partial Content`,
- invalid-range `416`,
- `If-Range`.

The old `res.download()` and `res.download2()` signatures remain supported.

---

# Static Asset Precompression

Modern optional static asset APIs:

```js
const result = await site.staticAssets.precompress(
  site.dir + '/js/app.js',
  {
    encoding: 'br',
    minSize: 1024,
  }
);

console.log(result);
```

Multiple files:

```js
const results = await site.staticAssets.precompressMany(
  [
    site.dir + '/js/app.js',
    site.dir + '/css/app.css',
  ],
  {
    encoding: 'br',
    concurrency: 4,
  }
);
```

Encoding negotiation:

```js
const encoding = site.staticAssets.chooseEncoding(
  'gzip;q=0.8, br;q=1'
);

// "br"
```

Compression cache statistics:

```js
console.log(site.staticAssets.cacheStats());
```

## Static asset manifest

```js
const manifest = await site.staticAssets.buildManifest(
  site.dir,
  {
    extensions: [
      '.js',
      '.css',
      '.html',
      '.json',
      '.svg',
    ],
  }
);
```

Prewarm compressed assets:

```js
const result = await site.staticAssets.prewarmManifest(
  manifest,
  {
    encoding: 'br',
    concurrency: 4,
  }
);

console.log(result);
```

Retrieve cached manifest:

```js
const manifest = site.staticAssets.manifest(site.dir);
```

Clear manifest:

```js
site.staticAssets.clearManifest(site.dir);
```

---

# Server-Side Parser and HTML Tags

Enable parser on a route:

```js
site.onGET({
  name: '/',
  path: site.dir + '/html/index.html',
  parser: 'html',
});
```

## Server variables

```js
site.var('siteName', 'My Site');
site.var('siteBrand', 'iSite');
```

HTML:

```html
<title>##var.siteName##</title>
<h1>##var.siteBrand##</h1>
```

Other parser values:

```html
<div>##session.language.id##</div>
<div>##session.theme##</div>

<div>##query.name##</div>
<div>##data.name##</div>

<div>##params.id##</div>
```

## Import server-side files

```html
<style x-import="page.css"></style>

<div x-import="navbar.html"></div>
<div x-import="content.html"></div>

<script x-import="page.js"></script>
```

## Language

```html
<div x-lang="Ar">Arabic content</div>
<div x-lang="En">English content</div>
```

## Permissions

```html
<div x-permission="admin">
  Visible to admin permission.
</div>
```

## Feature conditions

```html
<div x-feature="login">
  Logged-in users only
</div>

<div x-feature="!login">
  Guests only
</div>

<div x-feature="os.windows">
  Windows users
</div>

<div x-feature="browser.chrome">
  Chrome users
</div>
```

Multiple conditions:

```html
<div x-features="os.mobile || os.android">
  Mobile or Android
</div>
```

> Legacy hidden parser-token syntax remains supported and is covered by regression tests.

---

# Cookies and Sessions

## Cookies

```js
site.onGET('/cookie/set', (req, res) => {
  res.cookie('name', 'Amr');
  res.cookie('ip', req.ip);

  res.end('cookie saved');
});
```

Read:

```js
site.onGET('/cookie/get', (req, res) => {
  res.end(req.cookie('name'));
});
```

## Sessions

```js
site.onGET('/session/set', (req, res) => {
  req.session.user_name = 'Amr';

  site.saveSession(req.session);

  res.end('saved');
});
```

Read:

```js
site.onGET('/session/get', (req, res) => {
  res.json(req.session);
});
```

Authenticated-user data is internally indexed and can use `session.userCacheTTL` to avoid unnecessary repeated database reads.

---

# Custom Apps

A local iSite app:

```js
module.exports = function (site) {
  site.onGET('/app/hello', (req, res) => {
    res.end('Hello from app');
  });
};
```

Import a local app folder:

```js
site.importApp('/path/to/app');
```

---

# Master Pages

```js
site.addMasterPage({
  name: 'main',
  header: site.dir + '/html/header.html',
  footer: site.dir + '/html/footer.html',
});
```

Use it:

```js
site.onGET({
  name: '/contact',
  masterPage: 'main',
  path: site.dir + '/html/contact.html',
  parser: 'html',
});
```

---

# Events, Hooks and Middleware

## Legacy global events

```js
site.on('event name', (obj) => {
  console.log(obj);
});

site.call('event name', {
  id: 1,
});
```

Legacy queued events:

```js
site.quee('sync event name', {
  id: 1,
});
```

## Modern Event Bus

The modern event bus is separate from the old `site.on()` API.

```js
const off = site.events.on(
  'user.updated',
  (user) => {
    console.log(user);
  }
);

site.events.emit(
  'user.updated',
  {
    id: 10,
  }
);

// unsubscribe
off();
```

One-time listener:

```js
site.events.once(
  'startup.ready',
  () => {
    console.log('ready');
  }
);
```

Other methods:

```js
site.events.off(name, fn);
site.events.listenerCount(name);
site.events.removeAll(name);
```

## Async Hooks

```js
const remove = site.hooks.add(
  'before-job',
  async (context, site) => {
    context.startedAt = Date.now();
  }
);

const context = {};

await site.hooks.run(
  'before-job',
  context
);

console.log(context.startedAt);

remove();
```

Other methods:

```js
site.hooks.remove(name, fn);
site.hooks.list(name);
```

## Compiled middleware pipeline

```js
const pipeline = site.pipeline(
  async (ctx, next) => {
    ctx.started = true;

    await next();
  },

  async (ctx, next) => {
    ctx.user = {
      id: 1,
    };

    await next();
  }
);

const context = {};

await pipeline(context);

console.log(context);
```

---

# WebSocket

Server:

```js
site.onWS('/chat', (client) => {
  client.onMessage = function (message) {
    if (message.type === 'connected') {
      client.send({
        type: 'ready',
      });
    }
  };
});
```

Browser/client:

```js
site.ws(
  'ws://localhost/chat',
  (server) => {
    server.onOpen = () => {
      server.send({
        type: 'connected',
      });
    };

    server.onMessage = (message) => {
      console.log(message);
    };
  }
);
```

Internally, routes and clients are indexed with `Map` for fast lookup while the old public arrays remain available for compatibility.

---

# MongoDB - Legacy Compatible APIs

Connect to a collection:

```js
const employees =
  site.connectCollection('employees');
```

Specific database:

```js
const employees =
  site.connectCollection(
    'employees',
    'company'
  );
```

Object form:

```js
const employees =
  site.connectCollection({
    collection: 'employees',
    db: 'company',
  });
```

## Insert one

```js
employees.insertOne(
  {
    name: 'Amr',
    salary: 50000,
  },
  (err, doc) => {
    if (err) throw err;

    console.log(doc);
  }
);
```

Legacy aliases include:

```text
add
addOne
insert
insertOne
```

## Insert many

```js
employees.insertMany(
  [
    { name: 'A' },
    { name: 'B' },
  ],
  (err, docs) => {
    console.log(docs);
  }
);
```

## Find one

```js
employees.findOne(
  {
    where: {
      id: 5,
    },

    select: {
      name: 1,
      salary: 1,
    },
  },
  (err, doc) => {
    console.log(doc);
  }
);
```

Simple form:

```js
employees.findOne(
  {
    id: 5,
  },
  (err, doc) => {
    console.log(doc);
  }
);
```

Legacy aliases include:

```text
get
getOne
find
findOne
select
selectOne
```

## Find many

```js
employees.findMany(
  {
    where: {
      name: /a/i,
    },

    select: {
      name: 1,
      salary: 1,
    },

    limit: 50,
    skip: 10,

    sort: {
      salary: -1,
    },
  },
  (err, docs, count) => {
    console.log(docs);
    console.log(count);
  }
);
```

Legacy aliases include:

```text
getAll
getMany
findAll
findMany
selectAll
selectMany
```

## Update

```js
employees.updateOne(
  {
    where: {
      id: 5,
    },

    set: {
      salary: 60000,
    },
  },
  (err, result) => {
    console.log(result);
  }
);
```

## Delete

```js
employees.deleteOne(
  {
    where: {
      id: 5,
    },
  },
  (err, result) => {
    console.log(result);
  }
);
```

## Count

```js
employees.count(
  {
    active: true,
  },
  (err, count) => {
    console.log(count);
  }
);
```

## Indexes

```js
employees.createIndex(
  {
    name: 1,
  },
  {},
  (err, result) => {
    console.log(result);
  }
);
```

Unique:

```js
employees.createUnique(
  {
    email: 1,
  },
  (err, result) => {
    console.log(result);
  }
);
```

## Import / Export

```js
employees.import(
  '/path/to/data.json',
  (result) => {
    console.log(result);
  }
);
```

```js
employees.export(
  {
    limit: 100,
  },
  '/path/to/export.json',
  (err, docs) => {
    console.log(docs);
  }
);
```

## Remove duplicates

```js
employees.deleteDuplicate(
  'email',
  (err, result) => {
    console.log(result);
  }
);
```

Composite duplicate key:

```js
employees.deleteDuplicate(
  {
    name: 1,
    mobile: 1,
  },
  (err, result) => {
    console.log(result);
  }
);
```

---

# MongoDB - Promise APIs

These APIs are additive wrappers over existing legacy collection methods.

## `findOneAsync`

```js
const user =
  await employees.findOneAsync({
    id: 10,
  });
```

## `findManyAsync`

Returns both list and total count:

```js
const {
  list,
  count,
} = await employees.findManyAsync({
  where: {
    active: true,
  },

  limit: 50,
});
```

## `countAsync`

```js
const count =
  await employees.countAsync({
    active: true,
  });
```

## `exists`

Callback:

```js
employees.exists(
  {
    email: 'user@example.com',
  },
  (err, yes) => {
    console.log(yes);
  }
);
```

Promise:

```js
const yes =
  await employees.exists({
    email: 'user@example.com',
  });
```

Explicit Promise alias:

```js
const yes =
  await employees.existsAsync({
    email: 'user@example.com',
  });
```

## `addAsync`

```js
const inserted =
  await employees.addAsync({
    name: 'New User',
  });
```

## `updateAsync`

```js
const result =
  await employees.updateAsync({
    where: {
      id: 10,
    },

    set: {
      active: true,
    },
  });
```

## `deleteAsync`

```js
const result =
  await employees.deleteAsync({
    where: {
      id: 10,
    },
  });
```

---

# MongoDB - Parallel, Fast and Cached Reads

> These methods are **opt-in**.
>
> Legacy `find`, `get`, `findOne`, `findMany`, `count`, `add`, `update`, and `delete` keep the original serialized execution path.

## `findOneParallel`

```js
const user =
  await employees.findOneParallel({
    where: {
      id: 10,
    },

    select: {
      id: 1,
      name: 1,
    },
  });
```

Callback is also supported:

```js
employees.findOneParallel(
  {
    id: 10,
  },
  (err, user) => {
    console.log(user);
  }
);
```

## `findManyParallel`

```js
const {
  list,
  count,
} = await employees.findManyParallel({
  where: {
    active: true,
  },

  limit: 100,
});
```

## `countParallel`

```js
const count =
  await employees.countParallel({
    active: true,
  });
```

## `findManyFast`

Use this when you need the records but **do not need a total count**.

```js
const list =
  await employees.findManyFast({
    where: {
      active: true,
    },

    limit: 100,

    sort: {
      id: -1,
    },
  });
```

Unlike legacy `findMany`, this avoids a separate total-count query.

## `findPageFast`

Use this when you need both the page and total count.

```js
const {
  list,
  count,
} = await employees.findPageFast({
  where: {
    active: true,
  },

  skip: 0,
  limit: 50,

  sort: {
    createdAt: -1,
  },
});
```

The implementation uses one MongoDB aggregation round trip with `$facet`.

## Cached variants

```js
const user =
  await employees.findOneCached(
    {
      where: {
        id: 10,
      },
    },
    {
      ttl: 30000,
    }
  );
```

```js
const result =
  await employees.findManyCached(
    {
      where: {
        active: true,
      },
    },
    {
      ttl: 15000,
    }
  );
```

```js
const list =
  await employees.findManyFastCached(
    {
      where: {
        active: true,
      },
    },
    {
      ttl: 15000,
    }
  );
```

```js
const page =
  await employees.findPageFastCached(
    {
      where: {
        active: true,
      },

      limit: 50,
    },
    {
      ttl: 15000,
    }
  );
```

Successful MongoDB writes invalidate the query cache generation automatically.

Manual invalidation:

```js
employees.invalidateQueryCache();
```

---

# MongoDB - Batch, Bulk and Streaming APIs

## `findByIdsFast`

Fetch many IDs in one MongoDB query:

```js
const users =
  await employees.findByIdsFast(
    [
      10,
      11,
      12,
    ]
  );
```

Options:

```js
const users =
  await employees.findByIdsFast(
    [
      10,
      11,
      12,
    ],
    {
      field: 'id',

      where: {
        active: true,
      },

      select: {
        id: 1,
        name: 1,
      },

      sort: {
        id: 1,
      },
    }
  );
```

Cached:

```js
const users =
  await employees.findByIdsFastCached(
    [10, 11, 12],

    {
      field: 'id',
    },

    {
      ttl: 30000,
    }
  );
```

## `bulkWriteFast`

```js
const result =
  await employees.bulkWriteFast([
    {
      updateOne: {
        filter: {
          id: 10,
        },

        update: {
          $set: {
            active: true,
          },
        },
      },
    },

    {
      deleteOne: {
        filter: {
          id: 11,
        },
      },
    },
  ]);
```

With native MongoDB bulk options:

```js
await employees.bulkWriteFast(
  operations,
  {
    ordered: false,
  }
);
```

The new query cache is invalidated once after a successful bulk operation.

## `streamFast`

Use a MongoDB cursor instead of loading the full result set into RAM:

```js
const cursor =
  await employees.streamFast({
    where: {
      active: true,
    },

    select: {
      id: 1,
      name: 1,
    },

    sort: {
      id: 1,
    },

    batchSize: 500,
  });

for await (const doc of cursor) {
  console.log(doc);
}
```

Ideal for:

- exports,
- migrations,
- large reports,
- maintenance,
- batch processing.

---

# Automatic ID Batching

## `findByIdBatched`

Concurrent same-window ID requests are automatically grouped through `findByIdsFast()`:

```js
const [
  user10,
  user11,
  user12,
] = await Promise.all([
  employees.findByIdBatched(10),
  employees.findByIdBatched(11),
  employees.findByIdBatched(12),
]);
```

Options:

```js
const user =
  await employees.findByIdBatched(
    10,
    {
      field: 'id',

      where: {
        active: true,
      },

      select: {
        id: 1,
        name: 1,
      },

      maxBatchSize: 250,
      batchDelay: 1,
    }
  );
```

## `findIdsBatched`

```js
const users =
  await employees.findIdsBatched(
    [
      10,
      11,
      12,
    ]
  );
```

## `batchStats`

```js
console.log(
  employees.batchStats()
);
```

---

# MongoDB Query Advisor

The advisor is observational only.

It:

- records query shapes,
- tracks repeated `where` and `sort` patterns,
- tracks frequency and timing metadata,
- suggests candidate compound indexes,
- never creates indexes automatically,
- never modifies queries.

Report:

```js
console.log(
  site.mongoAdvisor.report({
    minCount: 2,
    limit: 50,
  })
);
```

Suggestions:

```js
console.log(
  site.mongoAdvisor.suggest({
    minCount: 5,
    limit: 25,
  })
);
```

Statistics:

```js
console.log(
  site.mongoAdvisor.stats()
);
```

Clear collected shapes:

```js
site.mongoAdvisor.clear();
```

Manual recording is also possible:

```js
site.mongoAdvisor.record(
  'main.users',
  'findMany',
  {
    where: {
      active: true,
      group: {
        id: 10,
      },
    },

    sort: {
      createdAt: -1,
    },
  },

  {
    ms: 12.5,
  }
);
```

---

# Low-Level MongoDB Access

Low-level APIs remain available:

```js
site.mongodb.findOne(
  {
    dbName: 'company',
    collectionName: 'employees',

    where: {
      id: 10,
    },

    select: {
      name: 1,
    },
  },

  (err, doc) => {
    console.log(doc);
  }
);
```

Other low-level methods include the existing insert/update/delete helpers and modern fast helpers used by collection wrappers.

Native client access remains available:

```js
site.mongodb.client
```

---

# Database Backup and Restore

Backup current database:

```js
site.backupDB();
```

Custom options:

```js
site.backupDB({
  db: 'company',
  path: '/backup/path',
});
```

Restore:

```js
site.restoreDB();
```

```js
site.restoreDB({
  db: 'company',
  path: '/backup/path',
});
```

---

# Caching APIs

## Inflight de-duplication

```js
const value =
  await site.inflight.run(
    'user:10',
    async () => {
      return loadUserFromDatabase(10);
    }
  );
```

If many callers use the same key before the first operation finishes, they share the same Promise.

Other helpers:

```js
site.inflight.has('user:10');
site.inflight.size();
site.inflight.clear();
```

---

## Tagged cache

Create a custom cache:

```js
const cache =
  new site.TaggedCache({
    maxEntries: 1000,
    maxBytes: 32 * 1024 * 1024,
    ttl: 60000,
  });
```

Set:

```js
cache.set(
  'user:10',
  {
    id: 10,
    name: 'Amr',
  },
  {
    ttl: 30000,

    tags: [
      'users',
      'user:10',
    ],
  }
);
```

Get:

```js
const user =
  cache.get('user:10');
```

Invalidate by tag:

```js
cache.invalidateTag('user:10');
```

Other methods:

```js
cache.getEntry(key);
cache.has(key);
cache.delete(key);
cache.clear();
cache.stats();
```

Default Core v3 cache:

```js
site.cacheV3
```

## `cacheGetOrLoad`

```js
const user =
  await site.cacheGetOrLoad(
    'user:10',

    async () => {
      return loadUser(10);
    },

    {
      ttl: 30000,

      tags: [
        'user:10',
      ],
    }
  );
```

Stale-while-revalidate:

```js
const value =
  await site.cacheGetOrLoad(
    'settings',

    loadSettings,

    {
      ttl: 10000,
      staleTTL: 60000,
      staleWhileRevalidate: true,
    }
  );
```

---

# Adaptive Cache

```js
const cache =
  site.adaptiveCache(
    'my-cache',
    {
      maxEntries: 1000,
      maxBytes: 16 * 1024 * 1024,
      ttl: 30000,
    }
  );
```

Or instantiate directly:

```js
const cache =
  new site.AdaptiveCache({
    maxEntries: 1000,
    maxBytes: 16 * 1024 * 1024,
    ttl: 30000,
  });
```

Common methods:

```js
cache.set(key, value);
cache.get(key);
cache.has(key);
cache.delete(key);
cache.clear();
cache.resize({
  maxEntries: 500,
  maxBytes: 8 * 1024 * 1024,
});
cache.stats();
```

---

# Stable Cache / Query Keys

`stableKey()` creates deterministic bounded keys.

Object property order does not change the key:

```js
const a =
  site.stableKey({
    a: 1,
    b: 2,
  });

const b =
  site.stableKey({
    b: 2,
    a: 1,
  });

console.log(a === b);
// true
```

Multiple values:

```js
const key =
  site.stableKey(
    'users',
    'findMany',
    {
      active: true,
    }
  );
```

---

# Query Cache

Cache arbitrary query-style operations:

```js
const result =
  await site.query.cached(
    'main.users',
    'findOne',

    {
      where: {
        id: 10,
      },
    },

    async () => {
      return loadUser(10);
    },

    {
      ttl: 30000,
    }
  );
```

Manual invalidation:

```js
site.query.invalidate(
  'main.users'
);
```

Current generation:

```js
console.log(
  site.query.generation(
    'main.users'
  )
);
```

Statistics:

```js
console.log(
  site.query.stats()
);
```

Invalidate all:

```js
site.query.invalidateAll();
```

`site.query.invalidate()` uses generation/epoch invalidation so cache invalidation is O(1).

---

# Inflight Deduplication and Batching

## Generic micro-batcher

```js
const batcher =
  site.createBatcher(
    async (keys) => {
      const rows =
        await loadMany(keys);

      return rows;
    },
    {
      maxBatchSize: 100,
      delay: 1,
    }
  );
```

Load:

```js
const [
  a,
  b,
] = await Promise.all([
  batcher.load(1),
  batcher.load(2),
]);
```

Other methods:

```js
batcher.flush();
batcher.clear();
batcher.stats();
```

## Generic ID batcher

```js
const batcher =
  site.createIdBatcher(
    async (ids) => {
      return loadUsers(ids);
    },

    {
      maxBatchSize: 250,
      delay: 1,
      valueKey: 'id',
    }
  );
```

```js
const user =
  await batcher.load(10);
```

```js
const users =
  await batcher.loadMany([
    10,
    11,
    12,
  ]);
```

Manual flush:

```js
await batcher.flush();
```

Statistics:

```js
console.log(
  batcher.stats()
);
```

Clear waiting items:

```js
batcher.clear();
```

---

# Async Memoization

```js
const loadUser =
  site.memoizeAsync(
    async (id) => {
      return fetchUser(id);
    },

    {
      ttl: 30000,
      maxEntries: 1000,

      key: (id) => id,
    }
  );
```

Usage:

```js
const user =
  await loadUser(10);
```

Concurrent calls with the same key share work.

---

# Reliability APIs

## Timeout

```js
const result =
  await site.withTimeout(
    async () => {
      return slowOperation();
    },

    5000
  );
```

Custom error:

```js
await site.withTimeout(
  slowOperation,

  5000,

  {
    code: 'MY_TIMEOUT',
    message: 'Operation took too long',
  }
);
```

## Retry

```js
const result =
  await site.retry(
    async (attempt) => {
      console.log('attempt', attempt);

      return callRemoteService();
    },

    {
      retries: 3,
      minDelay: 100,
      maxDelay: 3000,
      factor: 2,
      jitter: 0.2,
    }
  );
```

Conditional retry:

```js
await site.retry(
  request,

  {
    retries: 3,

    shouldRetry(err, attempt) {
      return err.code !== 'AUTH_FAILED';
    },
  }
);
```

## Circuit Breaker

```js
const breaker =
  site.circuitBreaker(
    'payment-api',
    {
      failureThreshold: 5,
      resetTimeout: 30000,
    }
  );
```

Run:

```js
const result =
  await breaker.run(
    async () => {
      return callPaymentApi();
    }
  );
```

State:

```js
console.log(
  breaker.snapshot()
);
```

Reset:

```js
breaker.reset();
```

## Reliable Fetch

```js
const response =
  await site.fetchReliable(
    'https://example.com/api',

    {
      method: 'GET',

      reliability: {
        timeout: 5000,
        retries: 2,

        minDelay: 100,
        maxDelay: 1000,

        circuit: 'example-api',

        circuitOptions: {
          failureThreshold: 5,
          resetTimeout: 30000,
        },
      },
    }
  );
```

---

# Async Context and Concurrency

## AsyncLocalStorage Context

Create:

```js
const context =
  site.context.create({
    operation: 'import-users',
  });
```

Run inside context:

```js
await site.context.run(
  context,

  async () => {
    console.log(
      site.context.get()
    );
  }
);
```

Create a child/merged object:

```js
const child =
  site.context.bind({
    step: 'validation',
  });
```

HTTP requests automatically receive a request context internally.

## AsyncPool

Create/retrieve a named pool:

```js
const pool =
  site.pool(
    'external-api',
    {
      limit: 8,
    }
  );
```

Run work:

```js
const result =
  await pool.run(
    async () => {
      return callExternalApi();
    }
  );
```

Statistics:

```js
console.log(
  pool.stats()
);
```

Resize:

```js
pool.resize(16);
```

Clear queued tasks:

```js
pool.clear();
```

You can also create an independent pool:

```js
const pool =
  new site.AsyncPool(4);
```

---

# Scheduler and Worker Threads

## Central Scheduler

Run later:

```js
site.scheduler.later(
  'refresh-cache',
  5000,

  async () => {
    await refreshCache();
  }
);
```

Recurring task:

```js
site.scheduler.every(
  'cleanup',
  60000,

  async () => {
    await cleanup();
  }
);
```

The scheduler prevents overlapping runs of the same recurring task.

Cancel:

```js
site.scheduler.cancel(
  'cleanup'
);
```

List:

```js
console.log(
  site.scheduler.list()
);
```

Clear all:

```js
site.scheduler.clear();
```

## Worker Threads

For CPU-heavy work:

```js
const result =
  await site.workers.runFile(
    '/path/to/worker.js',

    {
      input: 123,
    },

    {
      timeout: 10000,
    }
  );
```

Worker example:

```js
const {
  parentPort,
  workerData,
} = require('node:worker_threads');

const result =
  workerData.input * 2;

parentPort.postMessage(result);
```

---

# Metrics, Diagnostics, Profiling and Health

## Diagnostics

Snapshot:

```js
console.log(
  site.diagnostics.snapshot()
);
```

Includes values such as:

- request count,
- completed requests,
- requests per second,
- average latency,
- p50 response latency,
- p95 response latency,
- p99 response latency,
- max response latency,
- event-loop delay,
- process memory,
- cache statistics,
- status-code counts,
- slow-request count.

Slow requests:

```js
console.log(
  site.diagnostics.slowRequests(20)
);
```

Configure slow threshold:

```js
site.diagnostics.configure({
  slowThresholdMs: 200,
});
```

Route diagnostics:

```js
console.log(
  site.diagnostics.routes()
);
```

Cache diagnostics:

```js
console.log(
  site.diagnostics.cache()
);
```

Reset metrics:

```js
site.diagnostics.reset();
```

## Custom Metrics

Counter:

```js
site.metrics.inc(
  'jobs.completed'
);
```

Increment by amount:

```js
site.metrics.inc(
  'items.processed',
  50
);
```

Gauge:

```js
site.metrics.set(
  'queue.depth',
  4
);
```

Read:

```js
site.metrics.get(
  'queue.depth'
);
```

Time an operation:

```js
await site.metrics.time(
  'users.import',
  async () => {
    await importUsers();
  }
);
```

Manual timer:

```js
const end =
  site.metrics.time(
    'manual.operation'
  );

// work...

const ms =
  end();
```

Snapshot:

```js
console.log(
  site.metrics.snapshot()
);
```

Reset:

```js
site.metrics.reset();
```

## Profiler

Function style:

```js
await site.profile(
  'load-user',
  async () => {
    await loadUser(10);
  }
);
```

Manual style:

```js
const end =
  site.profile(
    'manual-work'
  );

// work

const ms =
  end();
```

Report:

```js
console.log(
  site.profileReport()
);
```

Example result:

```js
{
  'load-user': {
    count: 100,
    avgMs: 3.4,
    maxMs: 20.1,
    p50Ms: 2.8,
    p95Ms: 7.5,
    p99Ms: 15.2,
  }
}
```

## Health

```js
const health =
  site.health();

console.log(health);
```

Health includes:

- memory,
- diagnostics,
- async pools,
- custom metrics,
- MongoDB state,
- WebSocket state,
- adaptive caches,
- query-cache state,
- Mongo Advisor state.

---

# HTTP Cache and Range Helpers

## ETag

```js
const etag =
  site.httpCache.etag(
    'hello world'
  );
```

Strong ETag:

```js
const etag =
  site.httpCache.etag(
    buffer,
    false
  );
```

## Freshness check

```js
if (
  site.httpCache.isFresh(
    req,
    etag,
    lastModified
  )
) {
  res.status(304).end();
  return;
}
```

## Range parser

```js
const range =
  site.httpCache.range(
    req.headers.range,
    fileSize
  );
```

Possible result:

```js
{
  start: 100,
  end: 199,
  length: 100,
  size: 1000,
}
```

Unsatisfiable:

```js
{
  unsatisfiable: true,
  size: 1000,
}
```

---

# Streaming Helpers

## NDJSON / JSON Lines

Stream an async iterable without buffering all records:

```js
const cursor =
  await employees.streamFast({
    where: {
      active: true,
    },
  });

await site.stream.ndjson(
  cursor,
  res
);
```

Alias:

```js
site.stream.jsonLines
```

Do not automatically end the writable:

```js
await site.stream.ndjson(
  cursor,
  writable,
  {
    end: false,
  }
);
```

Return value:

```js
{
  rows,
  bytes,
}
```

---

# Feature Flags and Runtime Capabilities

## Feature flags

Enable:

```js
site.featuresV3.enable(
  'new-search'
);
```

Enable with value:

```js
site.featuresV3.enable(
  'query-mode',
  'fast'
);
```

Disable:

```js
site.featuresV3.disable(
  'new-search'
);
```

Check:

```js
if (
  site.featuresV3.isEnabled(
    'new-search'
  )
) {
  // ...
}
```

Get:

```js
const value =
  site.featuresV3.get(
    'query-mode',
    'legacy'
  );
```

Set:

```js
site.featuresV3.set(
  'query-mode',
  'fast'
);
```

List:

```js
console.log(
  site.featuresV3.list()
);
```

Clear:

```js
site.featuresV3.clear(
  'query-mode'
);
```

## Runtime capabilities

```js
console.log(
  site.capabilities
);
```

Typical fields:

```js
{
  nativeFetch: true,
  abortController: true,
  webStreams: true,
  workerThreads: true,
  brotli: true,
  http2: false,
  platform: 'win32',
  arch: 'x64',
  node: '...',
  cpus: 16,
}
```

---

# Memory and Adaptive Cache Tuning

## Memory snapshot

```js
console.log(
  site.memory.snapshot()
);
```

## Memory pressure check

```js
const level =
  site.memory.check({
    rssLimit:
      1024 *
      1024 *
      1024,
  });
```

Pressure levels:

```text
0 = normal
1 = moderate
2 = high
3 = critical
```

At higher levels, the v3 cache is conservatively reduced.

## Adaptive cache tuner

```js
const result =
  site.cacheTuner.tune({
    ratio: 0.80,
    factor: 0.75,
  });

console.log(result);
```

This is opt-in. It reduces cache budgets when memory pressure is high.

---

# Graceful Shutdown

Register a shutdown handler:

```js
site.shutdown.add(
  async () => {
    await flushPendingData();

    return {
      component: 'my-app',
      done: true,
    };
  },

  100
);
```

Number of handlers:

```js
site.shutdown.count();
```

Run registered handlers directly:

```js
await site.shutdown.run({
  reason: 'manual',
});
```

Recommended application shutdown:

```js
await site.closeGracefully({
  timeout: 10000,
});
```

This augments the old shutdown behavior without replacing legacy `site.close()` APIs.

---

# Compatibility Contracts

Compatibility contracts are intended to detect accidental breaking changes before deployment.

## Snapshot

```js
const contract =
  site.compat.snapshot(
    site,
    [
      'get',
      'post',
      'connectCollection',
      'readFile',
      'writeFile',
    ]
  );
```

## Compare

```js
const result =
  site.compat.compare(
    contract,
    site
  );

console.log(result);
```

Possible result:

```js
{
  ok: true,
  missing: [],
  changed: [],
}
```

## Assert

```js
site.compat.assert(
  contract,
  site
);
```

A mismatch throws:

```text
ISITE_COMPAT_MISMATCH
```

## Named contracts

Pin a contract:

```js
site.compat.pin(
  'social-browser-v1',
  site,
  [
    'get',
    'post',
    'connectCollection',
    'readFile',
    'writeFile',
  ]
);
```

Check later:

```js
const result =
  site.compat.check(
    'social-browser-v1',
    site
  );
```

List pinned contracts:

```js
console.log(
  site.compat.contracts()
);
```

---

# Helper Functions

## Copy object

```js
const person = {
  name: 'Amr',
  email: 'user@example.com',
};

const copy =
  site.copy(person);
```

## MD5

```js
const hash =
  site.md5(
    'content'
  );
```

## Base64

```js
const encoded =
  site.toBase64(
    'hello'
  );

const decoded =
  site.fromBase64(
    encoded
  );
```

## JSON

```js
const text =
  site.toJson({
    id: 1,
  });

const obj =
  site.fromJson(
    text
  );
```

## Legacy pattern helpers

```js
const name =
  'absunstar';

if (
  name.like('*sun*')
) {
  console.log('matched');
}
```

Existing prototype helpers such as `.like()`, `.contains()` and `.test()` remain supported.

---

# Multi-Language Words

Example `words.json`:

```json
[
  {
    "name": "user_name",
    "En": "User Name",
    "Ar": "اسم المستخدم"
  },
  {
    "name": "user_email",
    "En": "Email",
    "Ar": "البريد الإلكتروني"
  }
]
```

Use in HTML:

```html
<label>##word.user_name##</label>
<label>##word.user_email##</label>
```

---


# Smart Code Real-World Compatibility

Smart Code is the primary real-world compatibility target for iSite. Core v11 adds a project scanner and compatibility gate that can analyze a local Smart Code checkout without executing its business logic.

Scan a checkout:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:scan
```

Verify APIs used by Smart Code against the current iSite runtime:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:verify
```

Generate a full usage manifest:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:baseline
```

Run the normal iSite verification and then the Smart Code gate:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run verify:full
```

Programmatic API:

```js
const report = site.compat.scanProject('/path/to/smart-code');

console.log(report.summary);
console.log(report.usage.site);
console.log(report.usage.collection);
```

Verify a project with explicitly required legacy APIs:

```js
const result = site.compat.verifyProject('/path/to/smart-code', {
  requiredSiteApis: [
    'get',
    'post',
    'callRoute',
    'connectCollection',
    'readFileSync',
    'writeFile',
    'security.getUserFinger',
  ],
  requiredCollectionApis: [
    'addOne',
    'findMany',
    'removeMany',
  ],
});

if (!result.ok) {
  throw new Error('Smart Code compatibility failed');
}
```

The scanner separates server-side files from `site_files/js` client code so browser-side `site.*` calls do not become false server compatibility failures. Application-defined `site.*` helpers are reported separately and are not treated as missing iSite APIs unless they are explicitly pinned as required.

Compare two project usage manifests:

```js
const diff = site.compat.compareProjectUsage(oldReport, newReport);

console.log(diff.missing);
console.log(diff.added);
```

Write a UTF-8 manifest:

```js
site.compat.writeProjectManifest(
  '/path/to/smart-code',
  './smart-code-usage.json'
);
```

---

# Verification and Benchmarks

Run JavaScript syntax and UTF-8 validation:

```bash
npm run check
```

Run regression and compatibility tests:

```bash
npm test
```

Run HTTP streaming/download integration tests:

```bash
npm run http-test
```

Run framework initialization smoke test:

```bash
npm run smoke
```

Run performance microbenchmarks:

```bash
npm run benchmark
```

Run the entire verification pipeline:

```bash
npm run verify
```

Current Core v7 verification covers:

- JavaScript syntax,
- UTF-8 text-file validation,
- backward-compatibility regression tests,
- parser legacy hidden-token behavior,
- HTTP streaming,
- ETag and Range requests,
- framework initialization,
- lazy optional dependencies,
- router and string matcher benchmarks.

---

# UTF-8 Policy

All text files in the project are required to be valid UTF-8.

The verification process rejects:

- invalid UTF-8,
- UTF-16 text files,
- UTF-8 BOM,
- NUL bytes inside normal text files.

Run:

```bash
npm run check
```

before packaging or deployment.

---

# Compatibility Guidance for Existing Applications

Existing applications can continue to use old APIs unchanged:

```js
collection.find(...)
collection.get(...)
collection.findOne(...)
collection.findMany(...)

collection.add(...)
collection.update(...)
collection.delete(...)

site.onGET(...)
site.onPOST(...)

site.get(...)
site.post(...)

site.readFile(...)
site.writeFile(...)

res.download(...)
```

Use modern APIs only where you specifically want the newer behavior.

Examples:

```js
// Keep old serialized behavior
collection.findMany(options, callback);

// Promise wrapper, same legacy operation
await collection.findManyAsync(options);

// Opt-in bounded parallel read
await collection.findManyParallel(options);

// Faster read when total count is not needed
await collection.findManyFast(options);

// One Mongo round trip for page + total
await collection.findPageFast(options);

// Query-cached fast read
await collection.findPageFastCached(
  options,
  {
    ttl: 15000,
  }
);

// Stream large datasets
const cursor =
  await collection.streamFast(options);
```

---

# Recommended Patterns

## High-traffic user lookup

```js
const user =
  await users.findOneCached(
    {
      where: {
        id: userId,
      },
    },
    {
      ttl: 30000,
    }
  );
```

## Many simultaneous ID lookups

```js
const users =
  await Promise.all(
    ids.map(
      (id) =>
        collection.findByIdBatched(id)
    )
  );
```

## Large export

```js
const cursor =
  await collection.streamFast({
    where: {},
    batchSize: 500,
  });

await site.stream.ndjson(
  cursor,
  outputStream
);
```

## Reliable external API

```js
const response =
  await site.fetchReliable(
    apiUrl,

    {
      reliability: {
        timeout: 5000,
        retries: 2,
        circuit: 'external-api',
      },
    }
  );
```

## Prevent duplicate expensive work

```js
const report =
  await site.inflight.run(
    'report:daily',
    generateDailyReport
  );
```

## Diagnose slow production routes

```js
site.diagnostics.configure({
  slowThresholdMs: 100,
});

console.log(
  site.diagnostics.slowRequests(50)
);
```

## Verify API compatibility during an upgrade

```js
site.compat.pin(
  'app-api',
  site,
  [
    'get',
    'post',
    'connectCollection',
    'readFile',
    'writeFile',
  ]
);

// after loading modules
site.compat.assert(
  site.compat.snapshot(
    site,
    [
      'get',
      'post',
      'connectCollection',
      'readFile',
      'writeFile',
    ]
  ),
  site
);
```

---

# Core v8 APIs

Core v8 adds structured tracing, resource lifecycle tracking, generic concurrency helpers, JSON-array streaming, incremental static-asset prewarming, and reusable query-plan caching. All APIs are additive.

```js
site.trace.info('request completed', { ms: 12 });
console.log(site.trace.recent(20));

const id = site.resources.add(resource, { id: 'worker-1' });
await site.resources.close(id);

const rows = await site.async.mapLimit(items, 8, async item => processItem(item));

await site.stream.jsonArray(asyncIterable, writable);

const diff = site.staticAssets.diffManifest(oldManifest, newManifest);
await site.staticAssets.prewarmChanged(oldManifest, newManifest, { encoding: 'br' });

const plan = site.queryPlan.compile('main.users', 'findMany', { limit: 50, sort: { id: -1 } });
const nextPageOptions = site.queryPlan.instantiate(plan, { skip: 50 });
```



## Core v10 — Cache Coherence & Query Budgets

### Bind Mongo writes to response-cache tags

```js
site.responseCache.bindCollection('main.users', ['users', 'dashboard']);
```

After successful writes on `main.users`, only the bound response-cache tags are invalidated. No bindings are enabled by default.

```js
site.responseCache.collectionBindings();
site.responseCache.invalidateCollection('main.users');
site.responseCache.invalidationStats();
```

### Background cache warming

```js
await site.responseCache.warm('dashboard', loadDashboardResponse, {
  ttl: 30000,
  tags: ['dashboard'],
});

await site.responseCache.warmMany(entries, { concurrency: 4 });

site.responseCache.scheduleWarm('dashboard', 60000, entriesProvider);
site.responseCache.cancelWarm('dashboard');
site.responseCache.warmStats();
```

### Mongo query budgets

```js
site.mongoBudget.set('main.users', 'findManyFast', {
  warnMs: 100,
  maxTimeMS: 1000,
});
```

Budget enforcement is opt-in through new methods only:

```js
const docs = await users.findManyBudgeted({ where: { active: true } });
const page = await users.findPageBudgeted({ where: { active: true }, limit: 50 });
const batch = await users.findByIdsBudgeted([10, 11, 12]);
```

Legacy `find/get/findOne/findMany/add/update/delete` behavior is unchanged.

# License

See the project package/license information for the current distribution terms.

---

# Contact / Project

- Social Browser: https://social-browser.com
- GitHub: https://github.com/absunstar/isite



---

# Core v9: Mongo Execution Telemetry

Core v9 adds execution telemetry without changing normal MongoDB query behavior.

```js
console.log(site.mongoTelemetry.stats());
console.log(site.mongoTelemetry.recent(50));
console.log(site.mongoTelemetry.report());
```

Find inefficient query executions:

```js
console.log(
  site.mongoTelemetry.inefficient({
    minScanRatio: 10,
    minDocsExamined: 100,
  })
);
```

Inspect a query using MongoDB `executionStats`:

```js
const explain = await users.explainFast({
  where: {
    active: true,
  },
  sort: {
    createdAt: -1,
  },
  limit: 50,
});
```

This records metrics such as `docsExamined`, `keysExamined`, `nReturned`, `scanRatio`, `indexName`, and execution time in `site.mongoTelemetry`.

# Core v9: HTTP Response Cache

The response cache is opt-in; existing routes are not cached automatically.

```js
const key = site.responseCache.key({
  method: req.method,
  host: req.host,
  url: req.url,
  vary: {
    language: req.session?.language?.id,
  },
});

const cached = await site.responseCache.getOrLoad(
  key,
  async () => ({
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(await loadDashboard()),
  }),
  {
    ttl: 15000,
    staleTTL: 60000,
    staleWhileRevalidate: true,
    tags: ['dashboard', 'users'],
  }
);

site.responseCache.apply(res, cached);
```

Invalidate all response entries dependent on a resource:

```js
site.responseCache.invalidateTag('users');
```

Statistics:

```js
console.log(site.responseCache.stats());
```

Core v9 remains additive. Existing collection CRUD, routing, parser, file and response APIs keep their existing contracts.

---

# Core v13 — Smart Code Hot-Path Optimization

Core v13 uses the complete Smart Code project as a real-world compatibility and performance-priority baseline.

Run the Smart Code compatibility gate:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:verify
```

Rank the APIs Smart Code uses most often:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:usage
```

Run targeted hot-path microbenchmarks:

```bash
npm run smart-code:hotpaths
```

v13 safely optimizes the internal JSON reference-cleaning path used by `res.json()`, the framework-owned JSON Content-Type setup, and the date creation path used by `security.getUserFinger()`. Public legacy APIs and parser behavior are unchanged.

See `docs/core-v13.md` for details and compatibility guarantees.

---

# Core v15 - Universal No-Break Compatibility

iSite Core v15 adds a framework-wide compatibility gate that is independent from any single application.

The v14 public surface is pinned in `tests/compat/isite-v14-public-surface.json`, covering the root `site` object, collection wrapper, public namespaces, HTTP request/response helpers, legacy aliases, and prototype helpers.

```bash
npm run compat:framework
npm run http-compat
npm run verify
```

For every application that uses iSite, keep a project-specific usage baseline:

```bash
npm run project:baseline -- /path/to/project /path/to/project-isite-baseline.json
npm run project:verify -- /path/to/project /path/to/project-isite-baseline.json
```

New compatibility APIs:

```js
site.compat.captureSurface(target)
site.compat.compareSurface(contract, target)
site.compat.assertSurface(contract, target)

site.compat.captureFrameworkSurface()
site.compat.compareFrameworkSurface(manifest)
site.compat.assertFrameworkSurface(manifest)
site.compat.writeFrameworkManifest(file)

site.compat.probes.add(name, fn)
site.compat.probes.run({ assert: true })
```

Core v15 does not automatically freeze objects, change function signatures, or switch legacy execution paths. Compatibility checks are verification tools, so existing applications can continue to extend `site` and collection objects as before.

## Core v16: cancellation, backpressure and stability diagnostics

Core v16 adds opt-in infrastructure without changing legacy API behavior:

- `site.abort.create/link/throwIfAborted/withSignal` for explicit cancellation.
- `site.async.mapLimitAbortable`, `eachLimitAbortable`, and `filterLimitAbortable`.
- `site.BackpressureQueue` / `site.backpressureQueue()` for bounded producer queues.
- `site.leaks.snapshot/baseline/compare/assert/watch` for observational leak diagnostics.
- `site.validate.routes/options/all` for report-only route and configuration validation.

No existing route, MongoDB, collection, parser, request, response, file, session, or security method is given new timeout/cancellation behavior automatically. The framework compatibility gate now checks both the historical v14 surface and a new v16 baseline so APIs added in v15/v16 are protected in future releases too.


## Core v17 — HTTP Execution & Attribution

Core v17 adds request-bound `AbortSignal` support (`req.signal` / `req.abortSignal`), bounded request telemetry with slow-resource attribution, Mongo-to-request correlation, and opt-in compiled HTTP execution plans via `site.httpPlan`. Legacy routing and request/response APIs are unchanged. See `docs/core-v17.md`.


## Core v18 — Mongo Query Shapes & Execution Intelligence

Core v18 correlates Mongo query structure with execution telemetry without changing legacy query behavior. Query fingerprints store field/operator structure and value types, not the actual query values.

```js
site.mongoShapes.stats();
site.mongoShapes.report();
site.mongoShapes.slow();
site.mongoShapes.recommend();
```

Index recommendations are advisory only; iSite never creates an index automatically. Explicit explain sampling is available through `site.mongoShapes.sampleExplain(...)`. Legacy `find`, `findMany`, `findOne`, `count`, and `aggregate` signatures and execution semantics remain unchanged.

See `docs/core-v18.md`.

## Core v19 — Startup Fast Path

Core v19 optimizes time-to-listen without changing legacy APIs. HTTP-only startup no longer reads TLS files; readiness uses the native `listen` event instead of 100ms polling; outbound WebSocket support is deferred until after HTTP readiness; and expensive capability/native-module probes are lazy.

Use `npm run benchmark:startup` to measure require/init/start-ready time and `npm run startup-test` to verify startup invariants.



## Core v20 — Ultra-Fast Init

Core v20 reduces cold initialization work without changing legacy APIs. When MongoDB is disabled, the built-in storage/words/logs services keep their legacy collection properties but initialize those wrappers lazily. Diagnostics-only native modules are also deferred until first use. See `docs/core-v20.md`.


## Core v21 — Startup Bundle

Core v21 reduces cold `init()` time by loading the additive core modules through a generated startup bundle while keeping every original `lib/core-v*.js` file available for compatibility. Mongo/security background setup that was already asynchronous is started on the next event-loop turn so `server.start()` reaches the listener sooner. Use `npm run core-bundle-test` to verify that the generated bundle is synchronized with the authoritative source modules. See `docs/core-v21.md`.

---

## Core v22 — Startup Fast Path

Version `2026.08.26-v22` continues the startup-performance work without replacing any legacy API.

### Default startup improvements

- WebSocket ready logging now uses `site.log()` instead of unconditional stdout, so `log: false` avoids startup I/O.
- `from123()` has a numeric fast path used by iSite's internal encoded constants; malformed or non-numeric input falls back to the exact legacy decoder.
- The parser hidden-token compatibility regression remains protected.

### Optional repeated-process compile cache

On Node versions that expose `node:module.enableCompileCache()`, repeated process startup can additionally use Node's built-in compile cache:

```bash
ISITE_COMPILE_CACHE=1 node server.js
```

This is intentionally **not enabled by default**. Creating a brand-new compile cache can make the first-ever process slightly slower, while subsequent processes can start substantially faster. Older Node versions simply ignore this optional fast path.

### Verification

```bash
npm run verify
SMART_CODE_DIR=/path/to/project npm run smart-code:verify
```

The v22 framework baseline protects the complete public surface in addition to all historical v14/v16/v17/v18/v19/v20/v21 baselines.

### Core v23 startup fast path

Core v23 adds a generated service startup bundle to reduce CommonJS resolution/compile work before `server.start()`. Original `lib/*.js` modules remain available and authoritative. Run `npm run build:service-startup-bundle` after changing one of the bundled sources; `npm run service-bundle-test` verifies synchronization. See `docs/core-v23.md`.
