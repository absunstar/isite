'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../index.js');
const coreBundle = path.resolve(__dirname, '../lib/core-startup-bundle.js');
delete require.cache[coreBundle];
const site = init({
    name:'lazy-core-v26', apps:false, stdin:false, help:false, log:false,
    mongodb:{enabled:false}, security:{enabled:false},
    session:{enabled:false,save:false,storage:'file',timeout:1,memoryTimeout:1},
    https:{enabled:false}, mail:{enabled:false}, port:0,
});
assert.equal(require.cache[coreBundle], undefined, 'advanced core bundle must stay off startup path');
for (const name of ['context','compat','requestTelemetry','mongoShapes','responseCache','coreV18']) {
    assert.equal(Object.prototype.hasOwnProperty.call(site, name), true, name + ' must remain an own public API before activation');
    assert.equal(Object.prototype.propertyIsEnumerable.call(site, name), true, name + ' must remain enumerable');
}
const context = site.context;
assert.ok(context && typeof context.create === 'function', 'first access must initialize advanced core synchronously');
assert.ok(require.cache[coreBundle], 'advanced core bundle must load on first advanced API access');
assert.equal(typeof site.compat.compareFrameworkSurface, 'function');
assert.equal(typeof site.requestTelemetry.configure, 'function');
assert.equal(typeof site.mongoShapes.report, 'function');
assert.equal(typeof site.responseCache.stats, 'function');
assert.equal(typeof site.coreV18, 'object');
site.diagnostics?.close?.(); site.ws?.stopHeartbeat?.();
console.log('PASS v26 advanced core surface is immediate but initialization is first-use lazy');
