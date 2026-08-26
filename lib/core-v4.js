'use strict';

module.exports = function initCoreV4(site) {
    const { AsyncLocalStorage } = require('node:async_hooks');
    const { performance } = require('node:perf_hooks');

    // ------------------------------------------------------------------
    // Request / operation context propagation. Additive API only.
    // ------------------------------------------------------------------
    const als = new AsyncLocalStorage();
    let contextSeq = 0;
    site.context = {
        run(value, fn) { return als.run(value || {}, fn); },
        get() { return als.getStore() || null; },
        bind(values = {}) {
            const parent = als.getStore() || {};
            return { ...parent, ...values };
        },
        create(values = {}) {
            return { id: values.id || `${process.pid}-${Date.now().toString(36)}-${(++contextSeq).toString(36)}`, createdAt: Date.now(), ...values };
        },
    };

    // ------------------------------------------------------------------
    // Async pool / semaphore for bounded concurrency.
    // ------------------------------------------------------------------
    class AsyncPool {
        constructor(limit = 8) {
            this.limit = Math.max(1, Number(limit) || 1);
            this.active = 0;
            this.queue = [];
            this.completed = 0;
            this.failed = 0;
        }
        run(fn) {
            return new Promise((resolve, reject) => {
                this.queue.push({ fn, resolve, reject });
                this._drain();
            });
        }
        _drain() {
            while (this.active < this.limit && this.queue.length) {
                const item = this.queue.shift();
                this.active++;
                Promise.resolve().then(item.fn).then((value) => {
                    this.completed++; item.resolve(value);
                }, (err) => {
                    this.failed++; item.reject(err);
                }).finally(() => {
                    this.active--; this._drain();
                });
            }
        }
        resize(limit) { this.limit = Math.max(1, Number(limit) || 1); this._drain(); return this.limit; }
        clear(error = Object.assign(new Error('AsyncPool cleared'), { code: 'ISITE_POOL_CLEARED' })) {
            const queued = this.queue.splice(0);
            for (const item of queued) item.reject(error);
            return queued.length;
        }
        stats() { return { limit: this.limit, active: this.active, queued: this.queue.length, completed: this.completed, failed: this.failed }; }
    }
    site.AsyncPool = AsyncPool;
    site.pools = new Map();
    site.pool = function (name, options = {}) {
        name = String(name);
        let pool = site.pools.get(name);
        if (!pool) {
            pool = new AsyncPool(options.limit || options.concurrency || 8);
            site.pools.set(name, pool);
        } else if (options.limit || options.concurrency) {
            pool.resize(options.limit || options.concurrency);
        }
        return pool;
    };

    // ------------------------------------------------------------------
    // Micro-batching primitive. Useful for database/API fan-in.
    // ------------------------------------------------------------------
    site.createBatcher = function (loader, options = {}) {
        const maxBatchSize = Math.max(1, Number(options.maxBatchSize || 100));
        const delay = Math.max(0, Number(options.delay || 0));
        let queue = [];
        let timer = null;
        let scheduled = false;

        const flush = async () => {
            scheduled = false;
            if (timer) { clearTimeout(timer); timer = null; }
            const current = queue.splice(0, maxBatchSize);
            if (!current.length) return;
            try {
                const values = await loader(current.map(x => x.key));
                if (values instanceof Map) {
                    for (const item of current) item.resolve(values.get(item.key));
                } else if (Array.isArray(values)) {
                    for (let i = 0; i < current.length; i++) current[i].resolve(values[i]);
                } else {
                    for (const item of current) item.resolve(values?.[item.key]);
                }
            } catch (err) {
                for (const item of current) item.reject(err);
            }
            if (queue.length) schedule();
        };
        const schedule = () => {
            if (scheduled) return;
            scheduled = true;
            if (delay > 0) timer = setTimeout(flush, delay);
            else queueMicrotask(flush);
        };
        return {
            load(key) { return new Promise((resolve, reject) => { queue.push({ key, resolve, reject }); schedule(); }); },
            flush,
            size() { return queue.length; },
            clear(error = Object.assign(new Error('Batcher cleared'), { code: 'ISITE_BATCH_CLEARED' })) {
                if (timer) clearTimeout(timer);
                timer = null; scheduled = false;
                const items = queue.splice(0);
                for (const item of items) item.reject(error);
                return items.length;
            },
        };
    };

    // ------------------------------------------------------------------
    // Async memoization with TTL and inflight de-duplication.
    // ------------------------------------------------------------------
    site.memoizeAsync = function (fn, options = {}) {
        const cache = new Map();
        const inflight = new Map();
        const ttl = Math.max(0, Number(options.ttl == null ? 60000 : options.ttl));
        const maxEntries = Math.max(1, Number(options.maxEntries || 1000));
        const keyFn = options.key || ((...args) => JSON.stringify(args));
        const memoized = async function (...args) {
            const key = String(keyFn(...args));
            const now = Date.now();
            const cached = cache.get(key);
            if (cached && (!cached.expiresAt || cached.expiresAt > now)) {
                cache.delete(key); cache.set(key, cached);
                return cached.value;
            }
            if (cached) cache.delete(key);
            if (inflight.has(key)) return inflight.get(key);
            const p = Promise.resolve().then(() => fn.apply(this, args)).then((value) => {
                cache.set(key, { value, expiresAt: ttl ? Date.now() + ttl : 0 });
                while (cache.size > maxEntries) cache.delete(cache.keys().next().value);
                return value;
            }).finally(() => inflight.delete(key));
            inflight.set(key, p);
            return p;
        };
        memoized.clear = (key) => key === undefined ? cache.clear() : cache.delete(String(key));
        memoized.stats = () => ({ entries: cache.size, inflight: inflight.size, ttl, maxEntries });
        return memoized;
    };

    // ------------------------------------------------------------------
    // Custom metrics: counters, gauges and bounded timers.
    // ------------------------------------------------------------------
    const counters = new Map();
    const gauges = new Map();
    const timers = new Map();
    const maxTimerSamples = 1024;
    const percentile = (arr, p) => {
        if (!arr.length) return 0;
        const sorted = arr.slice().sort((a, b) => a - b);
        return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] || 0;
    };
    site.metrics = {
        inc(name, amount = 1) { name = String(name); const v = (counters.get(name) || 0) + Number(amount || 0); counters.set(name, v); return v; },
        set(name, value) { gauges.set(String(name), Number(value)); return value; },
        get(name) { name = String(name); return gauges.has(name) ? gauges.get(name) : counters.get(name); },
        time(name, fn) {
            const start = performance.now();
            const record = () => {
                const ms = performance.now() - start;
                let list = timers.get(String(name));
                if (!list) timers.set(String(name), (list = []));
                list.push(ms); if (list.length > maxTimerSamples) list.shift();
                return ms;
            };
            if (typeof fn !== 'function') return record;
            try {
                const value = fn();
                if (value && typeof value.then === 'function') return value.finally(record);
                record(); return value;
            } catch (err) { record(); throw err; }
        },
        snapshot() {
            const timing = {};
            for (const [name, list] of timers) {
                const total = list.reduce((a, b) => a + b, 0);
                timing[name] = { count: list.length, avgMs: list.length ? total / list.length : 0, p95Ms: percentile(list, .95), p99Ms: percentile(list, .99), maxMs: list.length ? Math.max(...list) : 0 };
            }
            return { counters: Object.fromEntries(counters), gauges: Object.fromEntries(gauges), timers: timing };
        },
        reset() { counters.clear(); gauges.clear(); timers.clear(); },
    };

    // ------------------------------------------------------------------
    // Health snapshot is intentionally read-only and side-effect free.
    // ------------------------------------------------------------------
    site.health = function () {
        const memory = process.memoryUsage();
        return {
            ok: true,
            at: Date.now(),
            pid: process.pid,
            uptimeSec: process.uptime(),
            memory,
            diagnostics: site.diagnostics?.snapshot ? site.diagnostics.snapshot() : null,
            pools: Object.fromEntries(Array.from(site.pools.entries()).map(([name, pool]) => [name, pool.stats()])),
            metrics: site.metrics.snapshot(),
            mongodb: site.mongodb ? {
                databases: site.mongodb.databaseIndex?.size || site.databaseList?.length || 0,
                collections: site.mongodb.collectionIndex?.size || site.databaseCollectionList?.length || 0,
                databaseInflight: site.mongodb.databaseInflight?.size || 0,
                collectionInflight: site.mongodb.collectionInflight?.size || 0,
            } : null,
            websocket: site.ws ? {
                clients: site.ws.clientByUuid?.size || site.ws.clientList?.length || 0,
                supportedClients: site.ws.supportedByUuid?.size || site.ws.supportedClientList?.length || 0,
                routes: site.ws.routeByPath?.size || site.ws.routeList?.length || 0,
            } : null,
        };
    };

    if (site.shutdown?.add) {
        site.shutdown.add(async () => {
            try { site.ws?.stopHeartbeat?.(); } catch (_) {}
            try { site.scheduler?.clear?.(); } catch (_) {}
            for (const pool of site.pools.values()) {
                try { pool.clear(); } catch (_) {}
            }
            return { component: 'core-v4', done: true };
        }, 1000);
    }

    const api = { version: '2026.08.26-v4', AsyncPool };
    site.coreV4 = api;
    return api;
};
