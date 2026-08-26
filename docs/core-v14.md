# iSite Core v14 — Smart Code findMany optimization

Version: `2026.08.26-v14`

Core v14 focuses on the highest-impact MongoDB read pattern found by scanning the full Smart Code source tree while preserving the legacy `findMany()` contract unchanged.

## Smart Code analysis

The full-project analyzer classifies `findMany()` call sites into three groups:

- call sites that clearly do not consume the legacy `count` callback argument;
- call sites that consume `count` and therefore need count-preserving behavior;
- dynamic/unknown callback shapes that must stay on the legacy path unless reviewed manually.

Run:

```bash
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:findmany
```

The command writes `smart-code-findmany-report.json`.

## New additive APIs

### `collection.findManyNoCount(options[, callback])`

A clear alias for the existing high-throughput `findManyFast()` behavior. It performs only the data query and does not run `countDocuments()`.

```js
const docs = await users.findManyNoCount({
  where: { active: true },
  limit: 50,
  sort: { id: -1 },
});
```

Callback form:

```js
users.findManyNoCount(options, (err, docs) => {
  // no total count query
});
```

Cached alias:

```js
await users.findManyNoCountCached(options, { ttl: 15000 });
```

### `collection.findManyConcurrent(options[, callback])`

Runs `countDocuments()` and the data `find()` concurrently, preserving `docs + count` in the result.

```js
const { list, count } = await users.findManyConcurrent({
  where: { active: true },
  limit: 50,
});
```

Callback form:

```js
users.findManyConcurrent(options, (err, docs, count) => {
  // docs and total count
});
```

Cached variant:

```js
await users.findManyConcurrentCached(options, { ttl: 15000 });
```

Low-level API:

```js
site.mongodb.findManyConcurrent(options, callback);
```

## Compatibility rule

The following legacy path remains unchanged:

```js
collection.findMany(options, (err, docs, count) => {});
```

Core v14 deliberately does not infer whether a callback needs `count`, because callback arity is not a safe compatibility signal in JavaScript (`arguments[2]`, wrappers and dynamic callbacks can still consume it).

## Benchmark

Run:

```bash
npm run benchmark:findmany
```

The included benchmark simulates two equal-latency database round trips. It is intended to show the latency model, not to claim MongoDB production throughput.
