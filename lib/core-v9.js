'use strict';

module.exports = function initCoreV9(site) {
    const crypto = require('node:crypto');

    // ------------------------------------------------------------------
    // Mongo execution telemetry. Observability-only: it never changes a
    // query, index, read preference, or legacy callback behavior.
    // ------------------------------------------------------------------
    const mongoRows = [];
    let mongoLimit = 2000;
    const mongoStats = { total: 0, slow: 0, errors: 0 };
    const normalizeNumber = value => Number.isFinite(Number(value)) ? Number(value) : 0;
    const normalizeCollection = value => String(value || 'unknown');

    const extractExplain = explain => {
        if (!explain || typeof explain !== 'object') return {};
        const execution = explain.executionStats || explain.executionStats?.executionStages || {};
        const planner = explain.queryPlanner || {};
        const winning = planner.winningPlan || {};
        const executionStages = explain.executionStats?.executionStages || {};
        const findStage = stage => {
            if (!stage || typeof stage !== 'object') return null;
            if (stage.indexName || stage.stage === 'COLLSCAN' || stage.stage === 'IXSCAN') return stage;
            for (const value of Object.values(stage)) {
                if (value && typeof value === 'object') {
                    const found = findStage(value);
                    if (found) return found;
                }
            }
            return null;
        };
        const stage = findStage(executionStages) || findStage(winning) || {};
        return {
            docsExamined: normalizeNumber(explain.executionStats?.totalDocsExamined ?? execution.totalDocsExamined),
            keysExamined: normalizeNumber(explain.executionStats?.totalKeysExamined ?? execution.totalKeysExamined),
            nReturned: normalizeNumber(explain.executionStats?.nReturned ?? execution.nReturned),
            executionTimeMs: normalizeNumber(explain.executionStats?.executionTimeMillis ?? execution.executionTimeMillis),
            indexName: stage.indexName || null,
            stage: stage.stage || null,
        };
    };

    site.mongoTelemetry = {
        record(input = {}) {
            const row = {
                id: input.id || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex')),
                time: Date.now(),
                collection: normalizeCollection(input.collection),
                operation: String(input.operation || 'query'),
                ms: normalizeNumber(input.ms),
                docsExamined: normalizeNumber(input.docsExamined),
                keysExamined: normalizeNumber(input.keysExamined),
                nReturned: normalizeNumber(input.nReturned),
                indexName: input.indexName || null,
                stage: input.stage || null,
                error: input.error ? String(input.error.message || input.error) : null,
            };
            row.scanRatio = row.nReturned > 0 ? row.docsExamined / row.nReturned : row.docsExamined;
            row.keyRatio = row.nReturned > 0 ? row.keysExamined / row.nReturned : row.keysExamined;
            mongoRows.push(row);
            mongoStats.total++;
            if (row.error) mongoStats.errors++;
            if (row.ms >= 100) mongoStats.slow++;
            while (mongoRows.length > mongoLimit) mongoRows.shift();
            return row;
        },
        recordExplain(collection, operation, explain, extra = {}) {
            return this.record({ collection, operation, ...extractExplain(explain), ...extra });
        },
        recent(limit = 100, filter = {}) {
            limit = Math.max(1, Number(limit || 100));
            let rows = mongoRows;
            if (filter.collection) rows = rows.filter(x => x.collection === String(filter.collection));
            if (filter.operation) rows = rows.filter(x => x.operation === String(filter.operation));
            if (filter.minMs != null) rows = rows.filter(x => x.ms >= Number(filter.minMs));
            return rows.slice(-limit);
        },
        report(options = {}) {
            const minCount = Math.max(1, Number(options.minCount || 1));
            const groups = new Map();
            for (const row of mongoRows) {
                const key = row.collection + '\0' + row.operation + '\0' + String(row.indexName || row.stage || 'unknown');
                let g = groups.get(key);
                if (!g) {
                    g = { collection: row.collection, operation: row.operation, indexName: row.indexName, stage: row.stage, count: 0, totalMs: 0, maxMs: 0, docsExamined: 0, keysExamined: 0, nReturned: 0, errors: 0 };
                    groups.set(key, g);
                }
                g.count++; g.totalMs += row.ms; g.maxMs = Math.max(g.maxMs, row.ms);
                g.docsExamined += row.docsExamined; g.keysExamined += row.keysExamined; g.nReturned += row.nReturned;
                if (row.error) g.errors++;
            }
            return [...groups.values()].filter(x => x.count >= minCount).map(x => ({
                ...x,
                avgMs: x.count ? x.totalMs / x.count : 0,
                scanRatio: x.nReturned ? x.docsExamined / x.nReturned : x.docsExamined,
                keyRatio: x.nReturned ? x.keysExamined / x.nReturned : x.keysExamined,
            })).sort((a, b) => (b.totalMs - a.totalMs) || (b.scanRatio - a.scanRatio));
        },
        inefficient(options = {}) {
            const minScanRatio = Number(options.minScanRatio || 10);
            const minDocsExamined = Number(options.minDocsExamined || 100);
            const limit = Math.max(1, Number(options.limit || 50));
            return this.report({ minCount: options.minCount || 1 })
                .filter(x => x.docsExamined >= minDocsExamined && x.scanRatio >= minScanRatio)
                .slice(0, limit);
        },
        configure(options = {}) {
            if (options.maxEntries != null) mongoLimit = Math.max(100, Number(options.maxEntries));
            while (mongoRows.length > mongoLimit) mongoRows.shift();
            return this.stats();
        },
        clear() { const n = mongoRows.length; mongoRows.length = 0; mongoStats.total = mongoStats.slow = mongoStats.errors = 0; return n; },
        stats() { return { entries: mongoRows.length, maxEntries: mongoLimit, ...mongoStats }; },
        extractExplain,
    };

    // ------------------------------------------------------------------
    // Tagged HTTP response cache. Additive and opt-in; no legacy route is
    // cached automatically. Supports TTL, stale-while-revalidate and tags.
    // ------------------------------------------------------------------
    const ResponseCache = site.TaggedCache || null;
    const responseStore = ResponseCache ? new ResponseCache({ maxEntries: 1000, maxBytes: 64 * 1024 * 1024, ttl: 30000 }) : new Map();
    const responseStats = { hits: 0, misses: 0, sets: 0, invalidations: 0, loads: 0, staleHits: 0 };
    const responseInflight = new Map();
    const bodySize = body => Buffer.isBuffer(body) ? body.length : Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body ?? null));
    const normalizeResponse = value => {
        if (value && typeof value === 'object' && ('body' in value || 'status' in value || 'headers' in value)) {
            return { status: Number(value.status || 200), headers: { ...(value.headers || {}) }, body: value.body };
        }
        return { status: 200, headers: {}, body: value };
    };
    const responseKey = input => {
        if (typeof input === 'string') return input;
        const obj = input || {};
        if (site.stableKey) return site.stableKey('http-response', obj.method || 'GET', obj.host || '', obj.url || obj.path || '/', obj.vary || {});
        return JSON.stringify([obj.method || 'GET', obj.host || '', obj.url || obj.path || '/', obj.vary || {}]);
    };
    const getEntry = key => typeof responseStore.getEntry === 'function' ? responseStore.getEntry(key, { allowStale: true }) : null;

    site.responseCache = {
        key: responseKey,
        set(input, value, options = {}) {
            const key = responseKey(input); const normalized = normalizeResponse(value);
            if (typeof responseStore.set === 'function') responseStore.set(key, normalized, { ...options, size: bodySize(normalized.body) });
            else responseStore.set(key, normalized);
            responseStats.sets++;
            return normalized;
        },
        get(input, options = {}) {
            const key = responseKey(input);
            if (typeof responseStore.getEntry === 'function') {
                const entry = responseStore.getEntry(key, { allowStale: Boolean(options.allowStale) });
                if (!entry) { responseStats.misses++; return undefined; }
                if (entry.stale) responseStats.staleHits++; else responseStats.hits++;
                return options.entry ? entry : entry.value;
            }
            const value = responseStore.get(key);
            if (value === undefined) responseStats.misses++; else responseStats.hits++;
            return value;
        },
        has(input) { return this.get(input) !== undefined; },
        delete(input) { return responseStore.delete(responseKey(input)); },
        invalidateTag(tag) {
            const n = typeof responseStore.invalidateTag === 'function' ? responseStore.invalidateTag(tag) : 0;
            responseStats.invalidations += n;
            return n;
        },
        clear() { const n = responseStore.size || responseStore.stats?.().entries || 0; responseStore.clear(); responseInflight.clear(); return n; },
        async getOrLoad(input, loader, options = {}) {
            const key = responseKey(input);
            if (typeof responseStore.getEntry === 'function') {
                const entry = responseStore.getEntry(key, { allowStale: Boolean(options.staleWhileRevalidate) });
                if (entry && !entry.stale) { responseStats.hits++; return entry.value; }
                if (entry && entry.stale && options.staleWhileRevalidate) {
                    responseStats.staleHits++;
                    if (!responseInflight.has(key)) {
                        const pending = Promise.resolve().then(loader).then(value => this.set(key, value, options)).finally(() => responseInflight.delete(key));
                        responseInflight.set(key, pending);
                    }
                    return entry.value;
                }
                responseStats.misses++;
            } else {
                const fresh = responseStore.get(key);
                if (fresh !== undefined) { responseStats.hits++; return fresh; }
                responseStats.misses++;
            }
            if (responseInflight.has(key)) return responseInflight.get(key);
            responseStats.loads++;
            const pending = Promise.resolve().then(loader).then(value => this.set(key, value, options)).finally(() => responseInflight.delete(key));
            responseInflight.set(key, pending);
            return pending;
        },
        apply(res, cached, options = {}) {
            if (!cached || !res) return false;
            const row = normalizeResponse(cached);
            if (typeof res.status === 'function') res.status(row.status);
            else res.statusCode = row.status;
            for (const [name, value] of Object.entries(row.headers || {})) {
                if (typeof res.set === 'function') res.set(name, value);
                else if (typeof res.setHeader === 'function') res.setHeader(name, value);
            }
            if (options.head) { if (typeof res.end === 'function') res.end(); return true; }
            if (typeof res.end === 'function') res.end(row.body);
            return true;
        },
        stats() {
            return { ...responseStats, inflight: responseInflight.size, store: typeof responseStore.stats === 'function' ? responseStore.stats() : { entries: responseStore.size } };
        },
    };

    // Extend health additively.
    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.mongoTelemetry = site.mongoTelemetry.stats();
            out.responseCache = site.responseCache.stats();
            return out;
        };
    }

    return { version: 'v9', mongoTelemetry: site.mongoTelemetry, responseCache: site.responseCache };
};
