'use strict';

module.exports = function initCoreV7(site) {
    // ------------------------------------------------------------------
    // Query shape advisor (observability only, never changes execution).
    // ------------------------------------------------------------------
    const shapes = new Map();
    const maxShapes = 2000;
    const fieldNames = (obj, prefix = '', out = []) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$')) continue;
            const name = prefix ? prefix + '.' + key : key;
            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const operatorOnly = Object.keys(value).every(k => k.startsWith('$'));
                if (!operatorOnly) { fieldNames(value, name, out); continue; }
            }
            out.push(name);
        }
        return out;
    };
    const normalizeFields = obj => [...new Set(fieldNames(obj))].sort();
    const normalizeSort = sort => sort && typeof sort === 'object'
        ? Object.entries(sort).filter(([k]) => !k.startsWith('$')).map(([k, v]) => [k, Number(v) < 0 ? -1 : 1])
        : [];

    site.mongoAdvisor = {
        record(collectionName, operation, options = {}, meta = {}) {
            try {
                const whereFields = normalizeFields(options.where || options.filter || {});
                const sortFields = normalizeSort(options.sort || {});
                const key = site.stableKey ? site.stableKey(collectionName, operation, whereFields, sortFields) : JSON.stringify([collectionName, operation, whereFields, sortFields]);
                let row = shapes.get(key);
                if (!row) {
                    row = { collection: String(collectionName), operation: String(operation), whereFields, sortFields, count: 0, totalMs: 0, maxMs: 0, lastSeen: 0 };
                    shapes.set(key, row);
                    while (shapes.size > maxShapes) shapes.delete(shapes.keys().next().value);
                }
                row.count++;
                row.lastSeen = Date.now();
                const ms = Number(meta.ms || 0);
                if (ms >= 0) { row.totalMs += ms; row.maxMs = Math.max(row.maxMs, ms); }
                return row;
            } catch (_) { return null; }
        },
        report(options = {}) {
            const minCount = Math.max(1, Number(options.minCount || 1));
            const limit = Math.max(1, Number(options.limit || 50));
            return [...shapes.values()]
                .filter(x => x.count >= minCount)
                .map(x => ({ ...x, avgMs: x.count ? x.totalMs / x.count : 0 }))
                .sort((a, b) => (b.totalMs - a.totalMs) || (b.count - a.count))
                .slice(0, limit);
        },
        suggest(options = {}) {
            const limit = Math.max(1, Number(options.limit || 25));
            const minCount = Math.max(1, Number(options.minCount || 2));
            return this.report({ limit: limit * 4, minCount }).map(row => {
                const keys = [];
                for (const field of row.whereFields) if (!keys.some(([k]) => k === field)) keys.push([field, 1]);
                for (const [field, dir] of row.sortFields) if (!keys.some(([k]) => k === field)) keys.push([field, dir]);
                return { collection: row.collection, operation: row.operation, count: row.count, avgMs: row.avgMs, index: Object.fromEntries(keys) };
            }).filter(x => Object.keys(x.index).length).slice(0, limit);
        },
        clear() { shapes.clear(); return true; },
        stats() { return { shapes: shapes.size, maxShapes }; },
    };

    // ------------------------------------------------------------------
    // Automatic ID batching primitive. Additive; legacy reads are untouched.
    // ------------------------------------------------------------------
    site.createIdBatcher = function (loader, options = {}) {
        const maxBatchSize = Math.max(1, Number(options.maxBatchSize || 250));
        const delay = Math.max(0, Number(options.delay == null ? 1 : options.delay));
        const keyFn = typeof options.key === 'function' ? options.key : x => String(x);
        let queue = [];
        let timer = null;
        let scheduled = false;
        let batches = 0;
        let loaded = 0;

        const flush = async () => {
            scheduled = false;
            if (timer) { clearTimeout(timer); timer = null; }
            const current = queue.splice(0, maxBatchSize);
            if (!current.length) return 0;
            const unique = [];
            const seen = new Set();
            for (const item of current) {
                const k = keyFn(item.id);
                if (!seen.has(k)) { seen.add(k); unique.push(item.id); }
            }
            batches++; loaded += current.length;
            try {
                const values = await loader(unique);
                const map = values instanceof Map ? values : new Map((Array.isArray(values) ? values : []).map(v => [keyFn(options.valueKey ? v?.[options.valueKey] : (v?.id ?? v?._id)), v]));
                for (const item of current) item.resolve(map.get(keyFn(item.id)) ?? null);
            } catch (err) {
                for (const item of current) item.reject(err);
            }
            if (queue.length) schedule();
            return current.length;
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            if (delay) { timer = setTimeout(flush, delay); if (timer.unref) timer.unref(); }
            else queueMicrotask(flush);
        };
        return {
            load(id) { return new Promise((resolve, reject) => { queue.push({ id, resolve, reject }); schedule(); }); },
            loadMany(ids) { return Promise.all((ids || []).map(id => this.load(id))); },
            flush,
            clear(error = Object.assign(new Error('ID batcher cleared'), { code: 'ISITE_ID_BATCH_CLEARED' })) {
                if (timer) clearTimeout(timer); timer = null; scheduled = false;
                const current = queue.splice(0); for (const item of current) item.reject(error); return current.length;
            },
            stats() { return { queued: queue.length, batches, loaded, maxBatchSize, delay }; },
        };
    };

    // ------------------------------------------------------------------
    // Streaming helpers for large iterables without buffering whole payloads.
    // ------------------------------------------------------------------
    site.stream = site.stream || {};
    site.stream.jsonLines = async function (iterable, writable, options = {}) {
        const ending = options.end !== false;
        let rows = 0, bytes = 0;
        for await (const value of iterable) {
            const line = JSON.stringify(value) + '\n';
            bytes += Buffer.byteLength(line); rows++;
            if (!writable.write(line)) await new Promise(resolve => writable.once('drain', resolve));
        }
        if (ending && typeof writable.end === 'function') writable.end();
        return { rows, bytes };
    };
    site.stream.ndjson = site.stream.jsonLines;

    // Compatibility baseline can now be named and checked later in the same process.
    const contracts = new Map();
    if (site.compat) {
        site.compat.pin = function (name, target = site, names) {
            const contract = site.compat.snapshot(target, names);
            contracts.set(String(name), contract);
            return contract;
        };
        site.compat.check = function (name, target = site) {
            const contract = contracts.get(String(name));
            if (!contract) return { ok: false, missingContract: true, missing: [], changed: [] };
            return site.compat.compare(contract, target);
        };
        site.compat.contracts = function () { return [...contracts.keys()]; };
    }

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.mongoAdvisor = site.mongoAdvisor.stats();
            return out;
        };
    }

    return { version: 'v7', mongoAdvisor: site.mongoAdvisor };
};
