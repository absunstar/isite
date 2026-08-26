'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generate, modules } = require('../scripts/build-service-startup-bundle.js');
const file = path.join(__dirname, '..', 'lib', 'service-startup-bundle.js');
assert.equal(fs.readFileSync(file, 'utf8'), generate(), 'service-startup-bundle.js is stale; run npm run build:service-startup-bundle');
assert.ok(modules.length >= 20);
console.log(`PASS service startup bundle synchronized (${modules.length} modules)`);
