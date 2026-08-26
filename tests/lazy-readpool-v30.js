'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../index.js');

const coreV3Path = require.resolve('../lib/core-v3.js');
const advancedPath = require.resolve('../lib/core-startup-bundle.js');
delete require.cache[coreV3Path];
delete require.cache[advancedPath];

const site = init({
  name: 'lazy-readpool-v30', apps: false, stdin: false, help: false, log: false, port: 0,
  https: { enabled: false }, mail: { enabled: false },
  mongodb: { enabled: true, db: 'lazy-readpool-v30' },
  security: { enabled: false },
  session: { enabled: false, save: false, storage: 'file' },
});

const collection = site.connectCollection('lazy_readpool_test');
assert.equal(require.cache[coreV3Path], undefined, 'legacy collection creation must not materialize Core v3');
assert.equal(require.cache[advancedPath], undefined, 'legacy collection creation must not materialize advanced core');
assert.equal(Object.prototype.hasOwnProperty.call(collection, 'readPool'), true);
assert.equal(Object.keys(collection).includes('readPool'), true);
let descriptor = Object.getOwnPropertyDescriptor(collection, 'readPool');
assert.equal(typeof descriptor.get, 'function');
assert.equal(typeof collection.findOneParallel, 'function');
assert.equal(typeof collection.findManyParallel, 'function');
assert.equal(typeof collection.countParallel, 'function');

const pool1 = collection.readPool;
const pool2 = collection.readPool;
assert.ok(pool1 && typeof pool1.run === 'function');
assert.equal(pool1, pool2, 'readPool identity must remain stable after first materialization');
assert.ok(require.cache[coreV3Path], 'first readPool access should materialize Core v3');
assert.ok(require.cache[advancedPath], 'first readPool access should materialize advanced core');
descriptor = Object.getOwnPropertyDescriptor(collection, 'readPool');
assert.equal(Object.prototype.hasOwnProperty.call(descriptor, 'value'), true);
assert.equal(descriptor.value, pool1);

pool1.run(() => Promise.resolve(17)).then((value) => {
  assert.equal(value, 17);
  console.log('PASS v30 collection readPool is lazy, enumerable, stable, and behaviorally compatible');
  site.diagnostics?.close?.();
  process.exit(0);
}, (error) => {
  console.error(error);
  process.exit(1);
});
