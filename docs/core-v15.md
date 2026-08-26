# iSite Core v15 - Universal Compatibility Hardening

Core v15 changes the upgrade policy from project-specific compatibility to a framework-wide no-break contract.

## Compatibility rule

Every existing public iSite API is treated as a legacy contract. New APIs may be added, but existing APIs must not be removed, change type, or silently lose legacy alias identity.

## Framework public-surface baseline

The repository now contains a baseline captured from Core v14:

`tests/compat/isite-v14-public-surface.json`

It protects:

- 325 `site` properties/APIs,
- 105 collection wrapper properties/APIs,
- 25 public namespaces,
- legacy function alias groups,
- HTTP request helper functions,
- HTTP response helper functions and aliases,
- legacy prototype helpers (`like`, `contains`, `test`).

Run:

```bash
npm run compat:framework
```

The check allows additive APIs. It fails for missing APIs, changed value types, missing namespaces, or broken legacy function aliases.

Function arity and property-descriptor changes are reported as warnings by default because JavaScript default/rest parameters can change `Function.length` without breaking callers. Strict checks are available through `checkArity` and `checkDescriptors`.

## Runtime HTTP compatibility gate

Run:

```bash
npm run http-compat
```

This creates a real HTTP request and verifies the legacy `req` and `res` helpers at runtime, including alias identity.

## Generic compatibility APIs

### Capture a surface

```js
const contract = site.compat.captureSurface(object);
```

### Compare a surface

```js
const result = site.compat.compareSurface(contract, object);
```

### Assert a surface

```js
site.compat.assertSurface(contract, object);
```

### Capture the whole iSite framework surface

```js
const manifest = site.compat.captureFrameworkSurface();
```

### Compare with an older framework manifest

```js
const result = site.compat.compareFrameworkSurface('/path/to/old-manifest.json');
```

### Assert full compatibility

```js
site.compat.assertFrameworkSurface('/path/to/old-manifest.json');
```

### Write a framework manifest

```js
site.compat.writeFrameworkManifest('/path/to/isite-surface.json');
```

## Semantic compatibility probes

API shape alone cannot protect behavior. Applications can register opt-in semantic probes:

```js
site.compat.probes.add('legacy-parser-case', async site => {
  const actual = await runLegacyCase(site);
  return actual === expected;
});

const result = await site.compat.probes.run({ assert: true });
```

Nothing runs automatically in production.

Available APIs:

```js
site.compat.probes.add(name, fn)
site.compat.probes.remove(name)
site.compat.probes.list()
site.compat.probes.clear()
site.compat.probes.run(options)
```

## Generic project compatibility workflow

The scanner added in v11 is now exposed through generic npm commands for every iSite project, not only Smart Code.

Create a project usage baseline:

```bash
npm run project:baseline -- /path/to/project /path/to/project-isite-baseline.json
```

Verify the project later:

```bash
npm run project:verify -- /path/to/project /path/to/project-isite-baseline.json
```

Inspect current usage:

```bash
npm run project:scan -- /path/to/project
```

This allows every application using iSite to keep its own usage contract in CI.

## Normal verification

`npm run verify` now includes:

1. JavaScript and UTF-8 static checks.
2. Regression tests.
3. Framework-wide v14 public-surface compatibility.
4. Runtime HTTP request/response compatibility.
5. HTTP streaming/range integration.
6. Full framework smoke initialization.
7. Performance benchmark.

Project-specific compatibility remains optional because different deployments may keep their source trees outside the iSite repository.
