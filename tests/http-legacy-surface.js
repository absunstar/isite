'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

(async () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'compat', 'isite-v14-public-surface.json'), 'utf8'));
    const init = require('../index.js');
    const site = init({
        name: 'isite-http-legacy-surface', apps: false, stdin: false, help: false, log: false,
        mongodb: { enabled: false }, security: { enabled: false },
        session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
        port: 0,
    });

    site.get({ name: '/__legacy-surface', public: true }, (req, res) => {
        const missingResponse = manifest.httpSurface.responseFunctions.filter(name => typeof res[name] !== 'function');
        const missingRequest = manifest.httpSurface.requestFunctions.filter(name => typeof req[name] !== 'function');
        const brokenAliases = manifest.httpSurface.responseAliases.filter(group => !group.every(name => res[name] === res[group[0]]));
        res.json({ missingResponse, missingRequest, brokenAliases });
    });

    const server = http.createServer(site.routing.handleServer);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const url = `http://127.0.0.1:${server.address().port}/__legacy-surface`;

    try {
        const response = await fetch(url, { headers: { connection: 'close' } });
        assert.equal(response.status, 200);
        const result = await response.json();
        assert.deepEqual(result.missingResponse, []);
        assert.deepEqual(result.missingRequest, []);
        assert.deepEqual(result.brokenAliases, []);
        for (const name of manifest.prototypeFunctions) assert.equal(typeof String.prototype[name], 'function', `missing legacy prototype helper ${name}`);
        console.log('PASS legacy HTTP request/response helpers and aliases preserved');
    } finally {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        site.ws?.stopHeartbeat?.();
        site.scheduler?.clear?.();
        site.diagnostics?.close?.();
    }
})();
