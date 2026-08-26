'use strict';
const assert = require('node:assert/strict');

// This smoke test intentionally disables optional subsystems. A successful init
// proves the core no longer eagerly loads MongoDB/WebSocket/PDF/mail/etc.
const init = require('../index.js');
const site = init({
    name: 'isite-smoke',
    apps: false,
    stdin: false,
    help: false,
    log: false,
    mongodb: { enabled: false },
    security: { enabled: false },
    session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
    port: 0,
});

assert.ok(site);
assert.ok(site.routing);
assert.ok(site.fsm);
assert.ok(site.diagnostics);
assert.equal(require.cache[require.resolve('../index.js')] !== undefined, true);
assert.equal(Object.keys(require.cache).some((p) => /node_modules[\\/]mongodb[\\/]/.test(p)), false);
assert.equal(Object.keys(require.cache).some((p) => /node_modules[\\/]ws[\\/]/.test(p)), false);

if (site.diagnostics && site.diagnostics.close) site.diagnostics.close();
console.log('PASS full framework init with optional dependencies lazy');
process.exit(0);
