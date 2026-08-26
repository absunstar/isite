module.exports = function init(____0) {
    const { monitorEventLoopDelay, performance } = require('node:perf_hooks');
    const loop = monitorEventLoopDelay({ resolution: 20 });
    loop.enable();
    const maxSamples = 2048;
    const stats = {
        startedAt: Date.now(), requests: 0, completed: 0, totalResponseMs: 0, maxResponseMs: 0,
        status: new Map(), samples: [], slowRequests: [], slowThresholdMs: 100,
    };
    function percentile(values, p) {
        if (!values.length) return 0;
        const sorted = values.slice().sort((a, b) => a - b);
        return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0;
    }
    const diagnostics = {
        requestStart(req, res) {
            stats.requests++;
            if (____0.metrics) ____0.metrics.inc('http.requests');
            req.$perfStarted = performance.now();
            if (res && typeof res.once === 'function' && !req.$perfFinishAttached) {
                req.$perfFinishAttached = true;
                res.once('finish', () => diagnostics.requestEnd(req, res));
                res.once('close', () => diagnostics.requestEnd(req, res));
            }
            if (____0.events) ____0.events.emit('request.start', req);
        },
        requestEnd(req, res) {
            if (!req || req.$perfEnded) return;
            req.$perfEnded = true;
            const ms = req.$perfStarted == null ? 0 : performance.now() - req.$perfStarted;
            stats.completed++; stats.totalResponseMs += ms; if (ms > stats.maxResponseMs) stats.maxResponseMs = ms;
            stats.samples.push(ms); if (stats.samples.length > maxSamples) stats.samples.shift();
            const code = String((res && (res.code || res.statusCode)) || 200);
            stats.status.set(code, (stats.status.get(code) || 0) + 1);
            if (____0.metrics) {
                ____0.metrics.inc('http.completed');
                ____0.metrics.inc('http.status.' + code);
                ____0.metrics.set('http.lastResponseMs', ms);
            }
            if (ms >= stats.slowThresholdMs) {
                stats.slowRequests.push({ method: req.method, url: req.url, route: req.route?.name, status: Number(code), ms, at: Date.now() });
                if (stats.slowRequests.length > 200) stats.slowRequests.shift();
                if (____0.events) ____0.events.emit('request.slow', stats.slowRequests[stats.slowRequests.length - 1]);
            }
            if (____0.events) ____0.events.emit('request.end', { req, res, ms });
        },
        configure(options = {}) {
            if (options.slowThresholdMs != null) stats.slowThresholdMs = Math.max(0, Number(options.slowThresholdMs));
            return diagnostics;
        },
        slowRequests(limit = 50) { return stats.slowRequests.slice(-Math.max(0, Number(limit))).reverse(); },
        routes() {
            const routing = ____0.routing;
            return routing ? {
                total: routing.list?.length || 0,
                exactMethods: routing._exactByMethod?.size || 0,
                dynamicMethods: routing._dynamicByMethod?.size || 0,
                indexed: !routing._indexDirty,
            } : null;
        },
        cache() {
            return {
                files: ____0.fsm ? { entries: ____0.fsm.cache?.size || 0, bytes: ____0.fsm.cacheBytes || 0 } : null,
                shared: { entries: ____0.sharedCache?.size || 0, bytes: ____0.sharedCacheBytes || 0 },
                sessions: ____0.sessions ? { entries: ____0.sessions.byToken?.size || 0 } : null,
                v3: ____0.cacheV3?.stats ? ____0.cacheV3.stats() : null,
                adaptive: ____0.adaptiveCaches ? Object.fromEntries(Array.from(____0.adaptiveCaches.entries()).map(([name, cache]) => [name, cache.stats()])) : null,
            };
        },
        snapshot() {
            const memory = process.memoryUsage();
            const uptimeSec = Math.max(0.001, (Date.now() - stats.startedAt) / 1000);
            return {
                startedAt: stats.startedAt, uptimeSec, requests: stats.requests, completed: stats.completed,
                requestsPerSecond: stats.completed / uptimeSec,
                avgResponseMs: stats.completed ? stats.totalResponseMs / stats.completed : 0,
                p50ResponseMs: percentile(stats.samples, .50), p95ResponseMs: percentile(stats.samples, .95), p99ResponseMs: percentile(stats.samples, .99),
                maxResponseMs: stats.maxResponseMs,
                eventLoop: {
                    minMs: Number.isFinite(loop.min) ? loop.min / 1e6 : 0, meanMs: Number.isFinite(loop.mean) ? loop.mean / 1e6 : 0,
                    maxMs: Number.isFinite(loop.max) ? loop.max / 1e6 : 0, p95Ms: loop.percentile(95) / 1e6, p99Ms: loop.percentile(99) / 1e6,
                },
                memory, cache: diagnostics.cache(), status: Object.fromEntries(stats.status), slowRequests: stats.slowRequests.length,
                coreV3: ____0.coreV3 ? { version: ____0.coreV3.version, inflight: ____0.inflight?.size?.() || 0 } : null,
                coreV4: ____0.coreV4 ? { version: ____0.coreV4.version, pools: ____0.pools?.size || 0 } : null,
                coreV5: ____0.coreV5 ? { version: ____0.coreV5.version, adaptiveCaches: ____0.adaptiveCaches?.size || 0, queryCache: ____0.queryCache?.stats?.() || null } : null,
            };
        },
        reset() {
            stats.startedAt = Date.now(); stats.requests = 0; stats.completed = 0; stats.totalResponseMs = 0; stats.maxResponseMs = 0;
            stats.status.clear(); stats.samples.length = 0; stats.slowRequests.length = 0; loop.reset();
        },
        close() { loop.disable(); },
    };
    ____0.diagnostics = diagnostics;
    return diagnostics;
};
