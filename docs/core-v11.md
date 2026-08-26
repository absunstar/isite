# iSite Core v11 - Real-World Compatibility

Version: `2026.08.26-v11`

Core v11 makes real applications part of the compatibility process without changing any legacy iSite API.

## Smart Code compatibility target

`absunstar/smart-code` is the primary real-world compatibility project because it uses a broad range of iSite routing, parser, sessions, security, files and MongoDB collection APIs.

Core v11 adds:

- `site.compat.scanProject(root, options)`
- `site.compat.verifyProject(root, options)`
- `site.compat.compareProjectUsage(expected, actual)`
- `site.compat.writeProjectManifest(root, output, options)`
- `npm run smart-code:scan`
- `npm run smart-code:verify`
- `npm run smart-code:baseline`
- `npm run verify:full`

The scanner is static: it does not execute Smart Code application business logic or connect to its production databases.

## Usage categories

The generated report separates:

- server `site.*` usage,
- response `res.*` usage,
- request `req.*` usage,
- collection methods from variables returned by `site.connectCollection()`,
- legacy prototype helpers such as `.like()`, `.contains()` and `.test()`,
- client-side code under `site_files/js`.

Unknown server `site.*` names are reported as application/project extensions rather than automatically treated as broken iSite APIs. APIs explicitly pinned in the Smart Code baseline are strict failures if missing.

## Example

```bash
SMART_CODE_DIR=D:/projects/smart-code npm run verify:full
```

Or:

```js
const report = site.compat.scanProject('D:/projects/smart-code');
console.log(report.summary);
```

## Compatibility policy

Core v11 is additive. Existing APIs from v10 and earlier are not renamed, removed or redirected to new semantics. The existing parser hidden-token regression test remains mandatory.
