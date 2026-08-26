# iSite Core v23 — Service Startup Bundle

Core v23 continues the startup-only optimization track while preserving the complete legacy API surface.

## What changed

`index.js` now loads the stable startup service initializers from one generated CommonJS bundle (`lib/service-startup-bundle.js`) instead of resolving and compiling more than twenty small modules independently. The original modules remain present, public, and authoritative, so direct imports such as `require('isite/lib/parser')`, `require('isite/lib/mongodb')`, and `require('isite/lib/routing')` continue to work unchanged.

The generated bundle currently covers routing, filesystem management, MongoDB wrapper initialization, words/storage/logs, sessions, cookie/session/parser exports, WebSocket helpers, email/integrated/browser/helper/PDF/app/eval/proxy modules, and the dashboard initializer.

## Safety

The bundle is generated from the original sources. `npm run service-bundle-test` compares the generated artifact byte-for-byte with a fresh generation and fails when it becomes stale. The existing core startup bundle has the same protection.

No legacy function signature, alias, callback contract, route matching rule, parser behavior, session behavior, or Mongo operation was intentionally changed.

## Startup result

In an interleaved 25-process comparison against v22 on the same host, median `init()` latency improved by about 13.5% in both the minimal and Mongo+Security configurations. Total cold process-to-ready latency improved by about 7.7% in the minimal configuration and 12.9% in the Mongo+Security configuration. Exact numbers vary with CPU scheduling and filesystem cache state.
