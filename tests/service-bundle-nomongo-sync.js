'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generate, modules } = require('../scripts/build-service-startup-bundle-nomongo.js');
const file = path.join(__dirname, '..', 'lib', 'service-startup-bundle-nomongo.js');
assert.equal(fs.readFileSync(file,'utf8'), generate(), 'no-Mongo startup bundle is stale');
assert.ok(!modules.some(([, file]) => file === 'mongodb.js'));
console.log(`PASS no-Mongo startup bundle synchronized (${modules.length} modules)`);
