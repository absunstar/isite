'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const init = require('../index.js');

(async () => {
    const site = init({
        name: 'isite-http-v17', apps: false, stdin: false, help: false, log: false,
        mongodb: { enabled: false }, security: { enabled: false },
        session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
        port: 0,
    });

    site.requestTelemetry.configure({ enabled: true });

    site.get({ name: '/__v17_signal', public: true }, (req, res) => {
        assert.ok(req.signal);
        assert.equal(req.signal.aborted, false);
        assert.ok(req.requestId);
        site.requestTelemetry.mark('handler');
        res.json({ done: true, requestId: req.requestId });
    });

    const server = http.createServer(site.routing.handleServer);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    try {
        const url = `http://127.0.0.1:${server.address().port}/__v17_signal`;
        const response = await fetch(url, { headers: { connection: 'close' } });
        assert.equal(response.status, 200);
        const parsed = await response.json();
        assert.equal(parsed.done, true);
        await new Promise(resolve => setTimeout(resolve, 10));
        const rows = site.requestTelemetry.recent(10, { url: '/__v17_signal' });
        assert.equal(rows.length, 1);
        assert.equal(rows[0].status, 200);
        assert.ok(rows[0].phases.some(x => x.name === 'handler'));
        console.log('PASS v17 request signal and telemetry on real HTTP request');
    } finally {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        site.ws?.stopHeartbeat?.();
        site.scheduler?.clear?.();
        site.diagnostics?.close?.();
    }
})();
