'use strict';
const { performance } = require('perf_hooks');
const delay = (ms, value) => new Promise(r => setTimeout(() => r(value), ms));
async function legacy() {
  const count = await delay(15, 500);
  const docs = count > 0 ? await delay(15, Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))) : [];
  return { docs, count };
}
async function concurrent() {
  const [count, docs] = await Promise.all([
    delay(15, 500),
    delay(15, Array.from({ length: 50 }, (_, i) => ({ id: i + 1 }))),
  ]);
  return { docs, count };
}
async function noCount() {
  return delay(15, Array.from({ length: 50 }, (_, i) => ({ id: i + 1 })));
}
async function time(fn, n = 10) {
  const t = performance.now();
  for (let i = 0; i < n; i++) await fn();
  return (performance.now() - t) / n;
}
(async () => {
  const legacyMs = await time(legacy);
  const concurrentMs = await time(concurrent);
  const noCountMs = await time(noCount);
  const out = {
    benchmark: 'simulated two-round-trip latency; not a MongoDB server benchmark',
    legacySequentialMs: +legacyMs.toFixed(2),
    concurrentCountAndDocsMs: +concurrentMs.toFixed(2),
    noCountMs: +noCountMs.toFixed(2),
    concurrentSpeedup: +(legacyMs / concurrentMs).toFixed(2),
    noCountSpeedup: +(legacyMs / noCountMs).toFixed(2),
  };
  console.log(JSON.stringify(out, null, 2));
})();
