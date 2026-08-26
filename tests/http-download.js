'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');

(async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'isite-http-'));
    const file = path.join(dir, 'download.txt');
    fs.writeFileSync(file, '0123456789');

    const init = require('../index.js');
    const site = init({
        name: 'isite-http-test', apps: false, stdin: false, help: false, log: false,
        mongodb: { enabled: false }, security: { enabled: false },
        session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
        port: 0,
    });
    site.get({ name: '/download-test', public: true }, (req, res) => res.download(file));

    const server = http.createServer(site.routing.handleServer);
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const base = `http://127.0.0.1:${server.address().port}/download-test`;

    try {
        let response = await fetch(base, { headers: { connection: 'close' } });
        assert.equal(response.status, 200);
        assert.equal(await response.text(), '0123456789');
        assert.equal(response.headers.get('accept-ranges'), 'bytes');
        const etag = response.headers.get('etag');
        assert.ok(etag);
        assert.ok(response.headers.get('last-modified'));

        response = await fetch(base, { headers: { 'if-none-match': etag, connection: 'close' } });
        assert.equal(response.status, 304);
        assert.equal((await response.arrayBuffer()).byteLength, 0);

        response = await fetch(base, { headers: { range: 'bytes=2-5', connection: 'close' } });
        assert.equal(response.status, 206);
        assert.equal(response.headers.get('content-range'), 'bytes 2-5/10');
        assert.equal(await response.text(), '2345');

        response = await fetch(base, { headers: { range: 'bytes=100-120', connection: 'close' } });
        assert.equal(response.status, 416);
        assert.equal(response.headers.get('content-range'), 'bytes */10');

        response = await fetch(base, { headers: { range: 'bytes=2-5', 'if-range': 'W/"wrong"', connection: 'close' } });
        assert.equal(response.status, 200);
        assert.equal(await response.text(), '0123456789');

        assert.ok(site.metrics.get('http.requests') >= 5);
        await new Promise(r => setTimeout(r, 10));
        assert.ok(site.diagnostics.snapshot().completed >= 5);
        console.log('PASS HTTP streaming download, ETag/304, Range/416 and If-Range');
    } finally {
        if (server.closeAllConnections) server.closeAllConnections();
        await new Promise(resolve => server.close(resolve));
        if (site.ws?.stopHeartbeat) site.ws.stopHeartbeat();
        if (site.scheduler?.clear) site.scheduler.clear();
        if (site.diagnostics?.close) site.diagnostics.close();
        fs.rmSync(dir, { recursive: true, force: true });
    }
})();
