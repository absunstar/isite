# Core v32 — lazy number-word helper startup optimization

Core v32 removes the legacy Arabic number-word helper implementation from the cold-start object-options bundle.

`object-options/lib/numbers.js` previously parsed and allocated its lookup tables on every `init()` only to define `site.stringfiy()`. v32 exposes `site.stringfiy` immediately as an own enumerable lazy property and loads the original `numbers.js` implementation synchronously on first access.

Compatibility rules:

- `site.stringfiy` remains a public own enumerable API.
- First access returns the same legacy function implementation from `object-options/lib/numbers.js`.
- The original module remains directly require-able and authoritative.
- No parser, routing, MongoDB, Security, session, or collection semantics are changed.
- All historical framework surface baselines remain enforced.

Verification:

```bash
npm run lazy-numbers-v32-test
npm run verify
SMART_CODE_DIR=/path/to/smart-code npm run smart-code:verify
```

## Champion benchmark

Interleaved cold-process medians against Core v31 on Node v22.16.0:

| Profile | v31 cold ready | v32 cold ready |
| --- | ---: | ---: |
| Minimal | 19.324 ms | 19.267 ms |
| Mongo | 21.383 ms | 21.225 ms |
| Mongo + Security | 21.634 ms | 21.546 ms |

The cold-ready improvement is intentionally small in the final large samples, but v32 remained faster in all three profiles and reduced `init()` more clearly in Mongo/Security profiles. Under the startup-champion policy, v32 is adopted only because it wins the measured profiles and passes every compatibility gate.
