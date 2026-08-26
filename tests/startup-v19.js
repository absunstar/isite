'use strict';
const assert = require('node:assert/strict');
const init = require('../index.js');

const site = init({
    name: 'isite-startup-v20',
    apps: false,
    stdin: false,
    help: false,
    log: false,
    mongodb: { enabled: false },
    security: { enabled: false },
    session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
    https: { enabled: false },
    mail: { enabled: false },
    port: 39191,
});

// HTTPS-disabled startup must not touch TLS certificate files.
const originalReadFileSync = site.fs.readFileSync;
site.fs.readFileSync = function (file, ...rest) {
    const text = String(file || '');
    if (/[/\\]ssl[/\\](key|cert)\.pem$/i.test(text)) {
        throw new Error('TLS file accessed on HTTP-only startup: ' + text);
    }
    return originalReadFileSync.call(this, file, ...rest);
};

const order = [];
site.ws.wsSupport = function () { order.push('wsSupport'); return Promise.resolve(); };

site.start((servers) => {
    order.push('callback');
    try {
        assert.ok(Array.isArray(servers));
        assert.ok(site.server);
        assert.equal(site.server.listening, true);
        assert.equal(site.readyInterval, null);
        assert.equal(order[0], 'callback', 'outbound websocket support must not block HTTP readiness');
        console.log('PASS v20 startup is event-driven, TLS-lazy, WS-deferred, and DB-disabled preload-light');
    } finally {
        for (const server of site.servers || []) {
            try { server.close(); } catch (_) {}
        }
        site.diagnostics?.close?.();
        site.ws?.stopHeartbeat?.();
        setImmediate(() => process.exit(0));
    }
});
