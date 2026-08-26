'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../index.js');
const coreV3Path = require.resolve('../lib/core-v3.js');
delete require.cache[coreV3Path];
const site = init({
  name:'lazy-core-v3-v27', apps:false, stdin:false, help:false, log:false,
  mongodb:{enabled:false}, security:{enabled:false},
  session:{enabled:false,save:false,storage:'file',timeout:1,memoryTimeout:1},
  https:{enabled:false}, mail:{enabled:false}, port:0,
});
assert.equal(require.cache[coreV3Path], undefined, 'full Core v3 must stay off cold init path');
const scheduler = site.scheduler;
assert.ok(scheduler && typeof scheduler.every === 'function' && typeof scheduler.later === 'function');
for (const name of ['capabilities','featuresV3','events','hooks','inflight','TaggedCache','cacheV3','httpCache','profile','memory','shutdown','coreV3']) {
  assert.equal(Object.prototype.hasOwnProperty.call(site, name), true, name + ' must remain an own public API');
  assert.equal(Object.prototype.propertyIsEnumerable.call(site, name), true, name + ' must remain enumerable');
}
site.scheduler.later('v27-preserve', 60_000, () => {});
assert.equal(site.scheduler.list().includes('v27-preserve'), true);
const httpCache = site.httpCache;
assert.ok(require.cache[coreV3Path], 'first Core v3 API access must synchronously load full Core v3');
assert.ok(httpCache && typeof httpCache.etag === 'function');
assert.strictEqual(site.scheduler, scheduler, 'Core v3 activation must preserve startup scheduler identity');
assert.equal(site.scheduler.list().includes('v27-preserve'), true, 'scheduled tasks must survive Core v3 activation');
assert.equal(typeof site.events.on, 'function');
assert.equal(typeof site.cacheGetOrLoad, 'function');
assert.equal(typeof site.closeGracefully, 'function');
site.scheduler.cancel('v27-preserve');
site.diagnostics?.close?.(); site.ws?.stopHeartbeat?.();
console.log('PASS v27 Core v3 is startup-lazy and preserves scheduler state');
