# iSite Core v25 — Ultra-Fast Object Options Startup

Core v25 continues the startup-only optimization track while preserving the legacy framework surface and runtime semantics.

## Changes

- Added a generated `object-options/lib/startup-bundle.js` so the eight object-options startup modules are parsed/resolved through one CommonJS module during normal iSite initialization.
- Original `object-options/lib/*.js` files remain public and authoritative for direct legacy `require()` usage.
- The generated bundle intentionally preserves sloppy-mode semantics.
- Added bounded string-only memoization to `from123()` / `_x0f1xo()` for repeated encoded constants. Non-string inputs retain the previous execution path.
- Added bundle-integrity and decoder-parity regression tests.

## Compatibility

No legacy API is removed or renamed. The optimization changes how startup code is loaded, not the public contracts.
