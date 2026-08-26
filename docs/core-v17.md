# iSite Core v17 — HTTP Execution & Attribution

Core v17 is additive and preserves all legacy routing, request/response, parser, collection, and callback contracts.

## Request-bound cancellation

Every real HTTP request now receives an additive `req.signal` / `req.abortSignal` backed by an AbortController. The signal aborts when the client aborts or the underlying connection closes before the response finishes. Legacy APIs do not consume the signal automatically, so existing work is never cancelled unless new code opts in.

```js
site.get('/work', async (req, res) => {
  await site.async.mapLimitAbortable(items, 4, worker, { signal: req.signal });
  res.json({ done: true });
});
```

Helpers:

- `site.requestAbort.attach(req, res)`
- `site.requestAbort.get(req)`
- `site.requestAbort.signal(req)`

## Request telemetry

`site.requestTelemetry` records bounded, observational HTTP timings and can attribute resource time to a request. It is disabled by default to avoid adding per-request telemetry overhead to existing applications; enable it explicitly with `site.requestTelemetry.configure({ enabled: true })`.

- `begin(req, res)`
- `mark(name, data)`
- `resource(input)`
- `end(id, input)`
- `recent(limit, filter)`
- `slow(options)`
- `report(options)`
- `attribution(requestId)`
- `configure(options)`
- `stats()`
- `clear()`

Mongo telemetry is correlated with the active AsyncLocalStorage request context and is attributed as a `mongo` resource without changing query behavior or results.

## Opt-in HTTP execution plans

New code can compile explicit async request pipelines without changing the legacy router:

```js
const plan = site.httpPlan.compile([
  { name: 'load', run: async (req, res, state, signal) => ({ ...state, doc: await load(signal) }) },
  { name: 'authorize', run: async (req, res, state) => state },
]);

site.get('/new-api', async (req, res) => {
  const state = await plan(req, res, {});
  res.json(state);
});
```

Plans are ordered, abort-aware, and observationally timed. They are never injected into old routes automatically.

## Compatibility

Core v17 keeps historical v14 and v16 framework baselines and adds a new v17 framework surface baseline. No legacy API is removed, renamed, retyped, or silently redirected to a new execution path.
