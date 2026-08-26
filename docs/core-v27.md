# iSite Core v27 — Sub-20ms Init Fast Path

Core v27 reduces cold initialization time by keeping the startup-critical scheduler separate from the rest of Core v3.

## What changed

- `lib/scheduler.js` contains the scheduler behavior required before the HTTP listener opens.
- Full `core-v3.js` is no longer parsed/executed during cold `init()` when its advanced APIs are not used yet.
- Core v3 public APIs remain own enumerable properties on `site` and materialize synchronously on first access.
- `initAdvancedCore()` first materializes Core v3, so the existing post-listen advanced warm-up also warms Core v3.
- Full Core v3 reuses the already-created scheduler instead of replacing it, preserving scheduled tasks and scheduler identity.
- Direct `require('isite/lib/core-v3')` still initializes the full Core v3 implementation as before.

## Compatibility guarantees

The following remain available with their legacy behavior after first access:

`capabilities`, `featuresV3`, `events`, `hooks`, `inflight`, `TaggedCache`, `cacheV3`, `cache`, `cacheGetOrLoad`, `withTimeout`, `retry`, `circuitBreaker`, `pipeline`, `workers`, `fetchReliable`, `httpCache`, `profile`, `profileReport`, `memory`, `shutdown`, `closeGracefully`, and `coreV3`.

The startup scheduler itself is immediate because existing startup services use it before `listen()`.

## Benchmark

Node v22.16.0, 81 interleaved independent cold processes per version:

| Metric | v26 | v27 |
| --- | ---: | ---: |
| require | 0.631 ms | 0.646 ms |
| init | 22.423 ms | 19.817 ms |
| start → ready | 2.709 ms | 2.822 ms |
| total cold → ready | 25.847 ms | 23.531 ms |

`init()` improved by about 11.6% and total cold-ready latency by about 9.0%. The `start → ready` segment did not improve in this run; the gain is specifically from removing full Core v3 from pre-listen initialization.

First explicit Core v3 materialization measured about 7.23 ms median in a separate cold-process test. Normal server startup schedules the existing advanced-core warm-up after readiness, so this cost is moved after the `start()` ready callback rather than removed.
