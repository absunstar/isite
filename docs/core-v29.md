# iSite Core v29 — Lazy Startup Metadata Champion

v29 keeps `site.package` and `site.Module` as public own enumerable properties while deferring their underlying loads until first use when they are not required by the startup configuration.

The optional compile-cache path still loads `node:module` immediately when `ISITE_COMPILE_CACHE=1`. Logging still reports the package version when logging is enabled.

This release follows the startup-champion policy: it is adopted only after beating v28 in interleaved cold-process benchmarks and passing all historical compatibility gates.
