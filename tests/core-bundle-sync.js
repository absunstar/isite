'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generate } = require('../scripts/build-core-startup-bundle.js');
const actual = fs.readFileSync(path.join(__dirname, '..', 'lib', 'core-startup-bundle.js'), 'utf8');
assert.equal(actual, generate(), 'core-startup-bundle.js is stale; run npm run build:startup-bundle');
console.log('PASS startup core bundle matches authoritative source modules');
