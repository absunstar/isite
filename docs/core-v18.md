# iSite Core v18 — Mongo Query Shapes & Execution Intelligence

Version: `2026.08.26-v18`

Core v18 adds an observational Mongo query-shape layer. It is designed to improve diagnostics across all applications that use iSite without changing any legacy database API.

## Compatibility guarantee

The following legacy methods keep their existing signatures and execution paths:

- `collection.find()` / `findOne()` / `get()`
- `collection.findMany()`
- `collection.count()` / `getCount()`
- `collection.aggregate()`
- all legacy write methods and aliases

No index is created automatically. No query is rewritten. No timeout is added.

## Query fingerprints

```js
const shape = site.mongoShapes.fingerprint(
  'main.users',
  'findMany',
  {
    where: {
      company: { id: 7 },
      active: true
    },
    sort: { createdAt: -1 }
  }
);
```

Fingerprints preserve query structure, operator names, field names, sort direction, projection field names, and broad value types. Actual scalar values are not retained in the fingerprint.

## Runtime aggregation

Mongo operations timed by the existing telemetry layer are correlated with their shape. Use:

```js
site.mongoShapes.stats();
site.mongoShapes.report({ limit: 100 });
site.mongoShapes.slow({ minMs: 100 });
```

Aggregated fields include execution count, completed count, errors, slow executions, total/average/max time, returned documents, examined documents/keys when explain data is available, scan ratios, and observed collection scans.

## Advisory index recommendations

```js
const recommendations = site.mongoShapes.recommend({
  minCount: 5,
  limit: 25,
  scanRatio: 10
});
```

Each recommendation includes an `index` object, impact score, reasons, and `automatic: false`. The application remains responsible for reviewing and creating indexes.

## Explicit explain sampling

Explain is never run automatically. New code may opt in:

```js
const sample = await site.mongoShapes.sampleExplain(
  'main.users',
  'findMany',
  { where: { active: true } },
  () => collection.explainFast({ where: { active: true } })
);
```

## Health

`site.health()` now includes `mongoShapes` statistics.

## Verification

Core v18 is checked against the historical v14, v16, and v17 public surfaces, plus a new v18 surface baseline. The Smart Code project remains an additional real-world compatibility target, not the definition of the iSite public API.
