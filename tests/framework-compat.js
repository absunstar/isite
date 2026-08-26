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
const previousBaseline = path.join(__dirname, 'compat', 'isite-v16-public-surface.json');
const previousV17Baseline = path.join(__dirname, 'compat', 'isite-v17-public-surface.json');
const previousV18Baseline = path.join(__dirname, 'compat', 'isite-v18-public-surface.json');
const previousV19Baseline = path.join(__dirname, 'compat', 'isite-v19-public-surface.json');
const previousV20Baseline = path.join(__dirname, 'compat', 'isite-v20-public-surface.json');
const previousV21Baseline = path.join(__dirname, 'compat', 'isite-v21-public-surface.json');
const previousV22Baseline = path.join(__dirname, 'compat', 'isite-v22-public-surface.json');
const previousV23Baseline = path.join(__dirname, 'compat', 'isite-v23-public-surface.json');
const previousV25Baseline = path.join(__dirname, 'compat', 'isite-v25-public-surface.json');
const previousV26Baseline = path.join(__dirname, 'compat', 'isite-v26-public-surface.json');
const previousV27Baseline = path.join(__dirname, 'compat', 'isite-v27-public-surface.json');
const previousV28Baseline = path.join(__dirname, 'compat', 'isite-v28-public-surface.json');
const previousV29Baseline = path.join(__dirname, 'compat', 'isite-v29-public-surface.json');
const latestBaseline = path.join(__dirname, 'compat', 'isite-v30-public-surface.json');
const historical = site.compat.compareFrameworkSurface(historicalBaseline);
assert.equal(historical.ok, true, JSON.stringify(historical, null, 2));
const previous = site.compat.compareFrameworkSurface(previousBaseline);
assert.equal(previous.ok, true, JSON.stringify(previous, null, 2));
const previousV17 = site.compat.compareFrameworkSurface(previousV17Baseline);
assert.equal(previousV17.ok, true, JSON.stringify(previousV17, null, 2));
const previousV18 = site.compat.compareFrameworkSurface(previousV18Baseline);
assert.equal(previousV18.ok, true, JSON.stringify(previousV18, null, 2));
const previousV19 = site.compat.compareFrameworkSurface(previousV19Baseline);
assert.equal(previousV19.ok, true, JSON.stringify(previousV19, null, 2));
const previousV20 = site.compat.compareFrameworkSurface(previousV20Baseline);
assert.equal(previousV20.ok, true, JSON.stringify(previousV20, null, 2));
const previousV21 = site.compat.compareFrameworkSurface(previousV21Baseline);
assert.equal(previousV21.ok, true, JSON.stringify(previousV21, null, 2));
const previousV22 = site.compat.compareFrameworkSurface(previousV22Baseline);
assert.equal(previousV22.ok, true, JSON.stringify(previousV22, null, 2));
const previousV23 = site.compat.compareFrameworkSurface(previousV23Baseline);
assert.equal(previousV23.ok, true, JSON.stringify(previousV23, null, 2));
const previousV25 = site.compat.compareFrameworkSurface(previousV25Baseline);
assert.equal(previousV25.ok, true, JSON.stringify(previousV25, null, 2));
const previousV26 = site.compat.compareFrameworkSurface(previousV26Baseline);
assert.equal(previousV26.ok, true, JSON.stringify(previousV26, null, 2));
const previousV27 = site.compat.compareFrameworkSurface(previousV27Baseline);
assert.equal(previousV27.ok, true, JSON.stringify(previousV27, null, 2));
const previousV28 = site.compat.compareFrameworkSurface(previousV28Baseline);
assert.equal(previousV28.ok, true, JSON.stringify(previousV28, null, 2));
const previousV29 = site.compat.compareFrameworkSurface(previousV29Baseline);
assert.equal(previousV29.ok, true, JSON.stringify(previousV29, null, 2));
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
console.log('PASS iSite v17 public API/alias surface preserved');
console.log('PASS iSite v18 public API/alias surface preserved');
console.log('PASS iSite v19 public API/alias surface preserved');
console.log('PASS iSite v20 public API/alias surface preserved');
console.log('PASS iSite v21 public API/alias surface preserved');
console.log('PASS iSite v22 public API/alias surface preserved');
console.log('PASS iSite v23 public API/alias surface preserved');
console.log('PASS iSite v25 public API/alias surface preserved');
console.log('PASS iSite v26 public API/alias surface preserved');
console.log('PASS iSite v27 public API/alias surface preserved');
console.log('PASS iSite v28 public API/alias surface preserved');
console.log('PASS iSite v29 public API/alias surface preserved');
console.log('PASS iSite v30 public API/alias surface preserved');

site.diagnostics?.close?.();
process.exit(0);
