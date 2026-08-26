'use strict';

module.exports = function initCoreV10(site) {
    // ------------------------------------------------------------------
    // Response-cache <-> Mongo collection dependency bindings.
    // Opt-in: no legacy write invalidates HTTP responses until a binding
    // is explicitly registered by application code.
    // ------------------------------------------------------------------
    const bindings = new Map();
    const invalidationStats = { writes: 0, bindingsHit: 0, tags: 0, entries: 0 };
    const normalizeCollection = value => String(value || '').trim();
    const normalizeTags = tags => [...new Set((Array.isArray(tags) ? tags : [tags]).filter(Boolean).map(String))];

    if (site.responseCache) {
        site.responseCache.bindCollection = function (collection, tags, options = {}) {
            const key = normalizeCollection(collection);
            if (!key) throw new Error('collection is required');
            const row = { collection: key, tags: normalizeTags(tags), options: { ...options }, createdAt: Date.now() };
            bindings.set(key, row);
            return { ...row, tags: row.tags.slice(), options: { ...row.options } };
        };
        site.responseCache.unbindCollection = function (collection) { return bindings.delete(normalizeCollection(collection)); };
        site.responseCache.collectionBinding = function (collection) {
            const row = bindings.get(normalizeCollection(collection));
            return row ? { ...row, tags: row.tags.slice(), options: { ...row.options } } : null;
        };
        site.responseCache.collectionBindings = function () {
            return [...bindings.values()].map(row => ({ ...row, tags: row.tags.slice(), options: { ...row.options } }));
        };
        site.responseCache.invalidateCollection = function (collection, meta = {}) {
            const key = normalizeCollection(collection);
            const row = bindings.get(key);
            invalidationStats.writes++;
            if (!row) return { collection: key, bound: false, tags: [], invalidated: 0 };
            invalidationStats.bindingsHit++;
            let invalidated = 0;
            for (const tag of row.tags) {
                invalidated += Number(this.invalidateTag(tag) || 0);
                invalidationStats.tags++;
            }
            invalidationStats.entries += invalidated;
            const result = { collection: key, bound: true, tags: row.tags.slice(), invalidated, meta: { ...meta } };
            if (site.events && typeof site.events.emit === 'function') site.events.emit('responseCache.collectionInvalidated', result);
            return result;
        };
        site.responseCache.invalidationStats = function () { return { ...invalidationStats, bindings: bindings.size }; };

        // --------------------------------------------------------------
        // Background/explicit warming. Never runs unless called.
        // --------------------------------------------------------------
        const warmStats = { runs: 0, loaded: 0, skipped: 0, errors: 0, scheduled: 0 };
        site.responseCache.warm = async function (input, loader, options = {}) {
            const key = this.key(input);
            warmStats.runs++;
            if (!options.force) {
                const current = this.get(key);
                if (current !== undefined) { warmStats.skipped++; return current; }
                try {
                    return await this.getOrLoad(key, async () => { warmStats.loaded++; return loader(); }, options);
                } catch (error) {
                    warmStats.errors++;
                    if (site.trace && typeof site.trace.warn === 'function') site.trace.warn('response cache warm failed', { key, error: String(error?.message || error) });
                    throw error;
                }
            }
            try {
                const value = await Promise.resolve().then(loader);
                warmStats.loaded++;
                return this.set(key, value, options);
            } catch (error) {
                warmStats.errors++;
                if (site.trace && typeof site.trace.warn === 'function') site.trace.warn('response cache warm failed', { key, error: String(error?.message || error) });
                throw error;
            }
        };
        site.responseCache.warmMany = async function (entries, options = {}) {
            entries = Array.isArray(entries) ? entries : [];
            const concurrency = Math.max(1, Number(options.concurrency || 4));
            const run = async entry => {
                if (!entry) return undefined;
                const input = entry.key ?? entry.input;
                const loader = entry.loader;
                if (typeof loader !== 'function') throw new TypeError('response cache warm entry.loader must be a function');
                return this.warm(input, loader, { ...(options.cache || {}), ...(entry.options || {}) });
            };
            if (site.async && typeof site.async.mapLimit === 'function') return site.async.mapLimit(entries, concurrency, run);
            const out = new Array(entries.length); let next = 0;
            const workers = Array.from({ length: Math.min(concurrency, entries.length) }, async () => {
                while (next < entries.length) { const i = next++; out[i] = await run(entries[i]); }
            });
            await Promise.all(workers); return out;
        };
        site.responseCache.scheduleWarm = function (name, intervalMs, entriesProvider, options = {}) {
            if (!site.scheduler || typeof site.scheduler.every !== 'function') throw new Error('site.scheduler is required');
            if (typeof entriesProvider !== 'function' && !Array.isArray(entriesProvider)) throw new TypeError('entriesProvider must be a function or array');
            const taskName = 'response-cache:warm:' + String(name);
            warmStats.scheduled++;
            site.scheduler.every(taskName, Math.max(1, Number(intervalMs)), async () => {
                const entries = typeof entriesProvider === 'function' ? await entriesProvider() : entriesProvider;
                return this.warmMany(entries, options);
            });
            return taskName;
        };
        site.responseCache.cancelWarm = function (name) {
            if (!site.scheduler || typeof site.scheduler.cancel !== 'function') return false;
            return site.scheduler.cancel('response-cache:warm:' + String(name));
        };
        site.responseCache.warmStats = function () { return { ...warmStats }; };
    }

    // ------------------------------------------------------------------
    // Mongo budgets. Observation is safe for every query, while actual
    // maxTimeMS enforcement is opt-in through new *Budgeted APIs.
    // ------------------------------------------------------------------
    const budgetRules = new Map();
    const budgetStats = { observations: 0, warnings: 0, exceeded: 0 };
    const budgetKey = (collection, operation) => normalizeCollection(collection) + '\0' + String(operation || '*');
    const findBudget = (collection, operation) => budgetRules.get(budgetKey(collection, operation)) || budgetRules.get(budgetKey(collection, '*')) || null;

    site.mongoBudget = {
        set(collection, operation, options) {
            if (options === undefined && operation && typeof operation === 'object') { options = operation; operation = '*'; }
            const key = budgetKey(collection, operation || '*');
            const rule = {
                collection: normalizeCollection(collection), operation: String(operation || '*'),
                warnMs: options?.warnMs == null ? null : Math.max(0, Number(options.warnMs)),
                maxTimeMS: options?.maxTimeMS == null ? null : Math.max(1, Number(options.maxTimeMS)),
                enabled: options?.enabled !== false,
            };
            budgetRules.set(key, rule); return { ...rule };
        },
        get(collection, operation = '*') { const row = findBudget(collection, operation); return row ? { ...row } : null; },
        delete(collection, operation = '*') { return budgetRules.delete(budgetKey(collection, operation)); },
        clear() { const n = budgetRules.size; budgetRules.clear(); return n; },
        list() { return [...budgetRules.values()].map(x => ({ ...x })); },
        options(collection, operation, extra = {}) {
            const row = findBudget(collection, operation);
            return row && row.enabled && row.maxTimeMS ? { ...extra, maxTimeMS: row.maxTimeMS } : { ...extra };
        },
        observe(row) {
            if (!row) return null;
            budgetStats.observations++;
            const rule = findBudget(row.collection, row.operation);
            if (!rule || !rule.enabled) return null;
            const warning = rule.warnMs != null && Number(row.ms || 0) >= rule.warnMs;
            const exceeded = rule.maxTimeMS != null && Number(row.ms || 0) >= rule.maxTimeMS;
            if (warning) budgetStats.warnings++;
            if (exceeded) budgetStats.exceeded++;
            if (!warning && !exceeded) return { warning: false, exceeded: false, rule: { ...rule } };
            const event = { warning, exceeded, rule: { ...rule }, query: { ...row } };
            if (site.events && typeof site.events.emit === 'function') site.events.emit('mongoBudget.exceeded', event);
            if (site.trace && typeof site.trace.warn === 'function') site.trace.warn('mongo query budget exceeded', { collection: row.collection, operation: row.operation, ms: row.ms, warnMs: rule.warnMs, maxTimeMS: rule.maxTimeMS });
            return event;
        },
        stats() { return { ...budgetStats, rules: budgetRules.size }; },
    };

    // Observe telemetry without changing the return value of record().
    if (site.mongoTelemetry && typeof site.mongoTelemetry.record === 'function') {
        const previousRecord = site.mongoTelemetry.record.bind(site.mongoTelemetry);
        site.mongoTelemetry.record = function (input = {}) {
            const row = previousRecord(input);
            site.mongoBudget.observe(row);
            return row;
        };
    }

    // Extend health additively.
    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.mongoBudget = site.mongoBudget.stats();
            if (site.responseCache) {
                out.responseCacheInvalidation = site.responseCache.invalidationStats();
                out.responseCacheWarming = site.responseCache.warmStats();
            }
            return out;
        };
    }

    return { version: 'v10', mongoBudget: site.mongoBudget };
};
