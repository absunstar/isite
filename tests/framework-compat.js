'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../index.js');

const site = init({
    name: 'isite-framework-compat',
    apps: false,
    stdin: false,
    help: false,
    log: false,
    mongodb: { enabled: false },
    security: { enabled: true, users: [] },
    session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
    port: 0,
});

const historicalBaseline = path.join(__dirname, 'compat', 'isite-v14-public-surface.json');
const latestBaseline = path.join(__dirname, 'compat', 'isite-v16-public-surface.json');
const historical = site.compat.compareFrameworkSurface(historicalBaseline);
assert.equal(historical.ok, true, JSON.stringify(historical, null, 2));
const baseline = latestBaseline;
const result = site.compat.compareFrameworkSurface(baseline);

console.log('iSite legacy framework surface compatibility');
console.log('baseline:', result.expectedVersion);
console.log('current:', result.currentVersion);
console.log('site expected APIs:', result.site.counts.expected);
console.log('site missing:', result.site.counts.missing);
console.log('site type changes:', result.site.counts.changedType);
console.log('site broken aliases:', result.site.counts.brokenAliases);
if (result.collection) {
    console.log('collection expected APIs:', result.collection.counts.expected);
    console.log('collection missing:', result.collection.counts.missing);
    console.log('collection type changes:', result.collection.counts.changedType);
    console.log('collection broken aliases:', result.collection.counts.brokenAliases);
}
console.log('protected namespaces:', Object.keys(result.namespaces).length);
console.log('missing namespaces:', result.missingNamespaces.length);

assert.equal(result.ok, true, JSON.stringify(result, null, 2));
console.log('PASS iSite v14 historical surface preserved');
console.log('PASS iSite v16 public API/alias surface preserved');

site.diagnostics?.close?.();
process.exit(0);
