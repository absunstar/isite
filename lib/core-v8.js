'use strict';

module.exports = function initCoreV8(site) {
    const { EventEmitter } = require('node:events');
    const crypto = require('node:crypto');

    // ------------------------------------------------------------------
    // Structured trace/log buffer. Additive; legacy site.log() is untouched.
    // ------------------------------------------------------------------
    const traceEvents = new EventEmitter();
    let traceLimit = 1000;
    const traceBuffer = [];
    const traceStats = { total: 0, dropped: 0, byLevel: Object.create(null) };

    const currentContext = () => {
        try { return site.context && typeof site.context.get === 'function' ? site.context.get() : null; }
        catch (_) { return null; }
    };
    const toError = err => err instanceof Error ? {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack,
    } : err;
    const pushTrace = (level, message, data, options = {}) => {
        const ctx = options.context || currentContext() || null;
        const row = {
            id: options.id || (crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex')),
            time: Date.now(),
            level: String(level || 'info').toLowerCase(),
            message: String(message == null ? '' : message),
        };
        if (ctx) {
            if (ctx.id != null) row.contextId = ctx.id;
            if (ctx.requestId != null) row.requestId = ctx.requestId;
            if (ctx.operation != null) row.operation = ctx.operation;
        }
        if (data !== undefined) row.data = data instanceof Error ? toError(data) : data;
        traceBuffer.push(row);
        traceStats.total++;
        traceStats.byLevel[row.level] = (traceStats.byLevel[row.level] || 0) + 1;
        while (traceBuffer.length > traceLimit) { traceBuffer.shift(); traceStats.dropped++; }
        traceEvents.emit('trace', row);
        traceEvents.emit(row.level, row);
        return row;
    };

    site.trace = {
        log(level, message, data, options) { return pushTrace(level, message, data, options); },
        debug(message, data, options) { return pushTrace('debug', message, data, options); },
        info(message, data, options) { return pushTrace('info', message, data, options); },
        warn(message, data, options) { return pushTrace('warn', message, data, options); },
        error(message, data, options) { return pushTrace('error', message, data, options); },
        child(fields = {}) {
            return {
                log(level, message, data, options = {}) { return pushTrace(level, message, { ...fields, ...(data && typeof data === 'object' && !Array.isArray(data) ? data : { value: data }) }, options); },
                debug(message, data, options) { return this.log('debug', message, data, options); },
                info(message, data, options) { return this.log('info', message, data, options); },
                warn(message, data, options) { return this.log('warn', message, data, options); },
                error(message, data, options) { return this.log('error', message, data, options); },
            };
        },
        on(listener) { traceEvents.on('trace', listener); return () => traceEvents.off('trace', listener); },
        onLevel(level, listener) { level = String(level).toLowerCase(); traceEvents.on(level, listener); return () => traceEvents.off(level, listener); },
        recent(limit = 100, filter = {}) {
            limit = Math.max(1, Number(limit || 100));
            let rows = traceBuffer;
            if (filter.level) rows = rows.filter(x => x.level === String(filter.level).toLowerCase());
            if (filter.contextId != null) rows = rows.filter(x => String(x.contextId) === String(filter.contextId));
            if (filter.requestId != null) rows = rows.filter(x => String(x.requestId) === String(filter.requestId));
            return rows.slice(-limit);
        },
        clear() { const count = traceBuffer.length; traceBuffer.length = 0; return count; },
        configure(options = {}) {
            if (options.maxEntries != null) traceLimit = Math.max(10, Number(options.maxEntries));
            while (traceBuffer.length > traceLimit) { traceBuffer.shift(); traceStats.dropped++; }
            return this.stats();
        },
        stats() { return { entries: traceBuffer.length, maxEntries: traceLimit, total: traceStats.total, dropped: traceStats.dropped, byLevel: { ...traceStats.byLevel } }; },
    };

    // ------------------------------------------------------------------
    // Resource registry for sockets, cursors, watchers, workers, etc.
    // Does not change existing close/shutdown behavior unless used explicitly.
    // ------------------------------------------------------------------
    const resources = new Map();
    let resourceSeq = 0;
    const closeResource = async (resource, options = {}) => {
        if (!resource) return false;
        const method = options.method || ['close', 'destroy', 'terminate', 'end', 'stop'].find(name => typeof resource[name] === 'function');
        if (!method) return false;
        const result = resource[method](...(options.args || []));
        if (result && typeof result.then === 'function') await result;
        return true;
    };
    site.resources = {
        add(resource, options = {}) {
            const id = String(options.id || options.name || `resource-${++resourceSeq}`);
            resources.set(id, { id, resource, options: { ...options }, addedAt: Date.now() });
            return id;
        },
        get(id) { return resources.get(String(id))?.resource || null; },
        has(id) { return resources.has(String(id)); },
        delete(id) { return resources.delete(String(id)); },
        list() { return [...resources.values()].map(x => ({ id: x.id, addedAt: x.addedAt, type: x.options.type || x.resource?.constructor?.name || typeof x.resource })); },
        count() { return resources.size; },
        async close(id, options = {}) {
            const key = String(id); const item = resources.get(key); if (!item) return false;
            try { return await closeResource(item.resource, { ...item.options, ...options }); }
            finally { resources.delete(key); }
        },
        async closeAll(options = {}) {
            const errors = [], closed = [];
            const rows = [...resources.values()].reverse();
            for (const item of rows) {
                try { await closeResource(item.resource, { ...item.options, ...options }); closed.push(item.id); }
                catch (error) { errors.push({ id: item.id, error }); if (options.stopOnError) throw error; }
                finally { resources.delete(item.id); }
            }
            return { closed, errors };
        },
    };
    if (site.shutdown && typeof site.shutdown.add === 'function') {
        site.shutdown.add(() => site.resources.closeAll(), -1000);
    }

    // ------------------------------------------------------------------
    // General concurrency helpers. Existing AsyncPool APIs stay untouched.
    // ------------------------------------------------------------------
    site.async = site.async || {};
    site.async.mapLimit = async function (items, limit, mapper) {
        const list = Array.from(items || []);
        limit = Math.max(1, Number(limit || 1));
        const result = new Array(list.length);
        let next = 0;
        const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
            while (true) {
                const index = next++;
                if (index >= list.length) return;
                result[index] = await mapper(list[index], index, list);
            }
        });
        await Promise.all(workers);
        return result;
    };
    site.async.eachLimit = async function (items, limit, mapper) {
        await site.async.mapLimit(items, limit, async (item, index, list) => { await mapper(item, index, list); return undefined; });
        return true;
    };
    site.async.filterLimit = async function (items, limit, predicate) {
        const list = Array.from(items || []);
        const yes = await site.async.mapLimit(list, limit, predicate);
        return list.filter((_, i) => Boolean(yes[i]));
    };

    // ------------------------------------------------------------------
    // Streaming JSON array in addition to existing NDJSON/jsonLines.
    // ------------------------------------------------------------------
    site.stream = site.stream || {};
    site.stream.jsonArray = async function (iterable, writable, options = {}) {
        const ending = options.end !== false;
        const pretty = Boolean(options.pretty);
        const separator = pretty ? ',\n' : ',';
        let rows = 0, bytes = 0, first = true;
        const write = async chunk => {
            bytes += Buffer.byteLength(chunk);
            if (!writable.write(chunk)) await new Promise(resolve => writable.once('drain', resolve));
        };
        await write(pretty ? '[\n' : '[');
        for await (const value of iterable) {
            if (!first) await write(separator);
            const line = pretty ? '  ' + JSON.stringify(value, null, 2).replace(/\n/g, '\n  ') : JSON.stringify(value);
            await write(line); first = false; rows++;
        }
        await write(pretty ? '\n]' : ']');
        if (ending && typeof writable.end === 'function') writable.end();
        return { rows, bytes };
    };

    // ------------------------------------------------------------------
    // Incremental static manifests: compare manifests and prewarm only changed
    // files. Existing buildManifest/prewarmManifest APIs are unchanged.
    // ------------------------------------------------------------------
    if (site.staticAssets && typeof site.staticAssets.buildManifest === 'function') {
        site.staticAssets.diffManifest = function (previous, current) {
            const prev = new Map((previous?.files || []).map(x => [String(x.path), x]));
            const next = new Map((current?.files || []).map(x => [String(x.path), x]));
            const added = [], changed = [], removed = [], unchanged = [];
            for (const [file, row] of next) {
                const old = prev.get(file);
                if (!old) added.push(row);
                else if (Number(old.size) !== Number(row.size) || Number(old.mtimeMs) !== Number(row.mtimeMs)) changed.push(row);
                else unchanged.push(row);
            }
            for (const [file, row] of prev) if (!next.has(file)) removed.push(row);
            return { added, changed, removed, unchanged, changedFiles: [...added, ...changed] };
        };
        site.staticAssets.prewarmChanged = async function (previous, currentOrRoot, options = {}) {
            const current = typeof currentOrRoot === 'string' ? await this.buildManifest(currentOrRoot, options) : currentOrRoot;
            const diff = this.diffManifest(previous, current);
            const paths = diff.changedFiles.map(x => x.path);
            const results = paths.length ? await this.precompressMany(paths, options) : [];
            return { manifest: current, diff, files: paths.length, results };
        };
    }

    // ------------------------------------------------------------------
    // Query-plan helpers cache normalized query shapes for callers building
    // repeated opt-in fast queries. They never execute or rewrite legacy CRUD.
    // ------------------------------------------------------------------
    const queryPlans = site.adaptiveCache ? site.adaptiveCache('query-plans', { maxEntries: 1000, maxBytes: 8 * 1024 * 1024, ttl: 10 * 60 * 1000 }) : new Map();
    const clonePlain = obj => {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(clonePlain);
        if (obj instanceof Date || obj instanceof RegExp || Buffer.isBuffer(obj)) return obj;
        const out = {};
        for (const [k, v] of Object.entries(obj)) out[k] = clonePlain(v);
        return out;
    };
    site.queryPlan = {
        key(collectionName, operation, options = {}) {
            return site.stableKey ? site.stableKey('plan', collectionName, operation, options) : JSON.stringify([collectionName, operation, options]);
        },
        compile(collectionName, operation, options = {}) {
            const key = this.key(collectionName, operation, options);
            const cached = typeof queryPlans.get === 'function' ? queryPlans.get(key) : undefined;
            if (cached) return cached;
            const plan = Object.freeze({
                key,
                collection: String(collectionName),
                operation: String(operation),
                options: clonePlain(options),
                createdAt: Date.now(),
            });
            if (typeof queryPlans.set === 'function') queryPlans.set(key, plan);
            return plan;
        },
        instantiate(plan, overrides = {}) {
            if (!plan || typeof plan !== 'object') throw new TypeError('Invalid iSite query plan');
            return { ...clonePlain(plan.options || {}), ...clonePlain(overrides || {}) };
        },
        clear() { if (typeof queryPlans.clear === 'function') queryPlans.clear(); return true; },
        stats() { return typeof queryPlans.stats === 'function' ? queryPlans.stats() : { entries: queryPlans.size || 0 }; },
    };

    // Extend health additively.
    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.trace = site.trace.stats();
            out.resources = { count: site.resources.count() };
            out.queryPlans = site.queryPlan.stats();
            return out;
        };
    }

    return { version: 'v8', trace: site.trace, resources: site.resources };
};
