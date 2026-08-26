'use strict';

module.exports = function initCoreV16(site) {
    const { EventEmitter } = require('node:events');

    // ------------------------------------------------------------------
    // Abort / cancellation primitives. Entirely additive: legacy APIs are
    // not given implicit timeouts or cancellation semantics.
    // ------------------------------------------------------------------
    site.abort = site.abort || {};

    const abortError = reason => {
        if (reason instanceof Error) return reason;
        const err = new Error(reason == null ? 'Operation aborted' : String(reason));
        err.name = 'AbortError';
        err.code = 'ABORT_ERR';
        return err;
    };

    site.abort.throwIfAborted = function (signal) {
        if (signal?.aborted) throw abortError(signal.reason);
        return false;
    };

    site.abort.link = function (controller, signal) {
        if (!controller || typeof controller.abort !== 'function' || !signal) return () => {};
        if (signal.aborted) {
            controller.abort(signal.reason);
            return () => {};
        }
        const onAbort = () => controller.abort(signal.reason);
        signal.addEventListener('abort', onAbort, { once: true });
        return () => signal.removeEventListener('abort', onAbort);
    };

    site.abort.create = function (options = {}) {
        const controller = new AbortController();
        const cleanups = [];
        if (options.signal) cleanups.push(site.abort.link(controller, options.signal));
        const signals = Array.isArray(options.signals) ? options.signals : [];
        for (const signal of signals) if (signal) cleanups.push(site.abort.link(controller, signal));
        let timer = null;
        if (options.timeoutMs != null) {
            const ms = Math.max(0, Number(options.timeoutMs) || 0);
            timer = setTimeout(() => {
                const err = new Error(`Operation timed out after ${ms}ms`);
                err.name = 'TimeoutError';
                err.code = 'ISITE_ABORT_TIMEOUT';
                controller.abort(err);
            }, ms);
            if (typeof timer.unref === 'function') timer.unref();
            cleanups.push(() => clearTimeout(timer));
        }
        controller.cleanup = () => {
            while (cleanups.length) {
                try { cleanups.pop()(); } catch (_) {}
            }
        };
        return controller;
    };

    site.abort.withSignal = async function (signal, fn) {
        site.abort.throwIfAborted(signal);
        if (typeof fn !== 'function') throw new TypeError('withSignal requires a function');
        if (!signal) return fn();
        return new Promise((resolve, reject) => {
            let settled = false;
            const onAbort = () => {
                if (settled) return;
                settled = true;
                reject(abortError(signal.reason));
            };
            signal.addEventListener('abort', onAbort, { once: true });
            Promise.resolve().then(() => fn(signal)).then(value => {
                if (settled) return;
                settled = true;
                signal.removeEventListener('abort', onAbort);
                resolve(value);
            }, error => {
                if (settled) return;
                settled = true;
                signal.removeEventListener('abort', onAbort);
                reject(error);
            });
        });
    };

    // Abort-aware siblings of the existing async helpers. Existing mapLimit /
    // eachLimit / filterLimit signatures remain untouched.
    site.async = site.async || {};
    site.async.mapLimitAbortable = async function (items, limit, mapper, options = {}) {
        const list = Array.from(items || []);
        const signal = options.signal || null;
        limit = Math.max(1, Number(limit || 1));
        const result = new Array(list.length);
        let next = 0;
        let firstError = null;
        const workers = Array.from({ length: Math.min(limit, list.length) }, async () => {
            while (true) {
                site.abort.throwIfAborted(signal);
                if (firstError) throw firstError;
                const index = next++;
                if (index >= list.length) return;
                try {
                    result[index] = await mapper(list[index], index, list, signal);
                } catch (error) {
                    firstError = error;
                    throw error;
                }
            }
        });
        await Promise.all(workers);
        return result;
    };
    site.async.eachLimitAbortable = async function (items, limit, mapper, options = {}) {
        await site.async.mapLimitAbortable(items, limit, async (item, index, list, signal) => {
            await mapper(item, index, list, signal);
            return undefined;
        }, options);
        return true;
    };
    site.async.filterLimitAbortable = async function (items, limit, predicate, options = {}) {
        const list = Array.from(items || []);
        const yes = await site.async.mapLimitAbortable(list, limit, predicate, options);
        return list.filter((_, i) => Boolean(yes[i]));
    };

    // ------------------------------------------------------------------
    // Bounded queue with explicit backpressure. No existing queue behavior is
    // replaced. Producers may await enqueue() instead of allowing memory to
    // grow without bounds.
    // ------------------------------------------------------------------
    class BackpressureQueue extends EventEmitter {
        constructor(options = {}) {
            super();
            this.concurrency = Math.max(1, Number(options.concurrency || 1));
            this.maxQueued = Math.max(1, Number(options.maxQueued || 1000));
            this.active = 0;
            this.queue = [];
            this.waitingForSpace = [];
            this.closed = false;
            this.completed = 0;
            this.failed = 0;
            this.highWaterMark = 0;
        }
        _wakeSpace() {
            while (this.waitingForSpace.length && this.queue.length < this.maxQueued && !this.closed) {
                const waiter = this.waitingForSpace.shift();
                waiter.resolve();
            }
        }
        _drain() {
            while (!this.closed && this.active < this.concurrency && this.queue.length) {
                const item = this.queue.shift();
                this._wakeSpace();
                this.active++;
                Promise.resolve().then(() => item.fn(item.signal)).then(value => {
                    this.completed++;
                    item.resolve(value);
                }, error => {
                    this.failed++;
                    item.reject(error);
                }).finally(() => {
                    this.active--;
                    this.emit('settled');
                    this._drain();
                });
            }
            if (!this.active && !this.queue.length) this.emit('idle');
        }
        async enqueue(fn, options = {}) {
            if (typeof fn !== 'function') throw new TypeError('BackpressureQueue.enqueue requires a function');
            if (this.closed) throw Object.assign(new Error('BackpressureQueue is closed'), { code: 'ISITE_QUEUE_CLOSED' });
            const signal = options.signal || null;
            site.abort.throwIfAborted(signal);
            while (this.queue.length >= this.maxQueued) {
                await new Promise((resolve, reject) => {
                    const waiter = { resolve, reject };
                    this.waitingForSpace.push(waiter);
                    if (signal) {
                        const onAbort = () => {
                            const i = this.waitingForSpace.indexOf(waiter);
                            if (i >= 0) this.waitingForSpace.splice(i, 1);
                            reject(abortError(signal.reason));
                        };
                        signal.addEventListener('abort', onAbort, { once: true });
                        waiter.resolve = () => { signal.removeEventListener('abort', onAbort); resolve(); };
                    }
                });
                site.abort.throwIfAborted(signal);
                if (this.closed) throw Object.assign(new Error('BackpressureQueue is closed'), { code: 'ISITE_QUEUE_CLOSED' });
            }
            return new Promise((resolve, reject) => {
                this.queue.push({ fn, resolve, reject, signal });
                this.highWaterMark = Math.max(this.highWaterMark, this.queue.length);
                this._drain();
            });
        }
        resize(concurrency) {
            this.concurrency = Math.max(1, Number(concurrency || 1));
            this._drain();
            return this.concurrency;
        }
        async onIdle() {
            if (!this.active && !this.queue.length) return true;
            await new Promise(resolve => this.once('idle', resolve));
            return true;
        }
        close(error = Object.assign(new Error('BackpressureQueue closed'), { code: 'ISITE_QUEUE_CLOSED' })) {
            this.closed = true;
            const queued = this.queue.splice(0);
            for (const item of queued) item.reject(error);
            const waiters = this.waitingForSpace.splice(0);
            for (const waiter of waiters) waiter.reject(error);
            return { queued: queued.length, waiting: waiters.length };
        }
        stats() {
            return {
                concurrency: this.concurrency,
                maxQueued: this.maxQueued,
                active: this.active,
                queued: this.queue.length,
                waitingForSpace: this.waitingForSpace.length,
                completed: this.completed,
                failed: this.failed,
                highWaterMark: this.highWaterMark,
                closed: this.closed,
            };
        }
    }
    site.BackpressureQueue = BackpressureQueue;
    site.backpressureQueues = site.backpressureQueues || new Map();
    site.backpressureQueue = function (name, options = {}) {
        name = String(name);
        let queue = site.backpressureQueues.get(name);
        if (!queue) {
            queue = new BackpressureQueue(options);
            site.backpressureQueues.set(name, queue);
        } else if (options.concurrency) {
            queue.resize(options.concurrency);
        }
        return queue;
    };

    // ------------------------------------------------------------------
    // Memory/resource leak diagnostics. Read-only until watch() is explicitly
    // enabled. It intentionally does not patch timers/listeners or GC behavior.
    // ------------------------------------------------------------------
    site.leaks = site.leaks || {};
    const leakBaselines = new Map();
    const leakWatches = new Map();
    let leakWatchSeq = 0;

    const safeHandleCounts = () => {
        const handles = typeof process._getActiveHandles === 'function' ? process._getActiveHandles() : [];
        const requests = typeof process._getActiveRequests === 'function' ? process._getActiveRequests() : [];
        const byType = {};
        for (const handle of handles) {
            const type = handle?.constructor?.name || typeof handle;
            byType[type] = (byType[type] || 0) + 1;
        }
        return { handles: handles.length, requests: requests.length, byType };
    };
    const listenerStats = () => {
        const events = site.events;
        if (!events || typeof events.eventNames !== 'function') return { total: 0, byEvent: {} };
        const byEvent = {};
        let total = 0;
        for (const name of events.eventNames()) {
            const count = events.listenerCount(name);
            byEvent[String(name)] = count;
            total += count;
        }
        return { total, byEvent };
    };
    site.leaks.snapshot = function () {
        const memory = process.memoryUsage();
        const active = safeHandleCounts();
        return {
            at: Date.now(),
            memory,
            active,
            listeners: listenerStats(),
            resources: site.resources?.count ? site.resources.count() : 0,
            pools: site.pools ? Object.fromEntries([...site.pools].map(([name, pool]) => [name, pool.stats?.() || null])) : {},
            backpressureQueues: Object.fromEntries([...site.backpressureQueues].map(([name, queue]) => [name, queue.stats()])),
            sessions: site.sessions?.byToken?.size || 0,
            traceEntries: site.trace?.stats?.().entries || 0,
        };
    };
    site.leaks.baseline = function (name = 'default') {
        const snap = this.snapshot();
        leakBaselines.set(String(name), snap);
        return snap;
    };
    site.leaks.compare = function (baseline = 'default', options = {}) {
        const before = typeof baseline === 'string' ? leakBaselines.get(baseline) : baseline;
        if (!before) throw Object.assign(new Error('Leak baseline not found'), { code: 'ISITE_LEAK_BASELINE_NOT_FOUND' });
        const after = this.snapshot();
        const delta = {
            rss: after.memory.rss - before.memory.rss,
            heapUsed: after.memory.heapUsed - before.memory.heapUsed,
            external: after.memory.external - before.memory.external,
            handles: after.active.handles - before.active.handles,
            requests: after.active.requests - before.active.requests,
            listeners: after.listeners.total - before.listeners.total,
            resources: after.resources - before.resources,
            sessions: after.sessions - before.sessions,
        };
        const limits = {
            heapUsed: options.maxHeapGrowthBytes ?? Infinity,
            rss: options.maxRssGrowthBytes ?? Infinity,
            handles: options.maxHandleGrowth ?? Infinity,
            listeners: options.maxListenerGrowth ?? Infinity,
            resources: options.maxResourceGrowth ?? Infinity,
            sessions: options.maxSessionGrowth ?? Infinity,
        };
        const exceeded = Object.entries(limits).filter(([key, max]) => Number.isFinite(max) && delta[key] > max).map(([key, max]) => ({ key, delta: delta[key], max }));
        return { ok: exceeded.length === 0, before, after, delta, exceeded };
    };
    site.leaks.assert = function (baseline = 'default', options = {}) {
        const result = this.compare(baseline, options);
        if (!result.ok) {
            const error = new Error('iSite leak budget exceeded');
            error.code = 'ISITE_LEAK_BUDGET_EXCEEDED';
            error.details = result;
            throw error;
        }
        return result;
    };
    site.leaks.watch = function (options = {}) {
        const id = String(options.id || `leak-watch-${++leakWatchSeq}`);
        const intervalMs = Math.max(1000, Number(options.intervalMs || 30000));
        const baselineName = options.baseline || id;
        this.baseline(baselineName);
        const timer = setInterval(() => {
            const result = this.compare(baselineName, options);
            if (!result.ok) {
                site.events?.emit?.('leak.warning', result);
                site.trace?.warn?.('Leak budget exceeded', result.delta);
                if (typeof options.onWarning === 'function') options.onWarning(result);
            }
        }, intervalMs);
        if (typeof timer.unref === 'function') timer.unref();
        leakWatches.set(id, { id, timer, baselineName, intervalMs });
        return id;
    };
    site.leaks.stop = function (id) {
        const row = leakWatches.get(String(id));
        if (!row) return false;
        clearInterval(row.timer);
        leakWatches.delete(String(id));
        return true;
    };
    site.leaks.stopAll = function () {
        const ids = [...leakWatches.keys()];
        for (const id of ids) this.stop(id);
        return ids.length;
    };
    site.leaks.watches = function () { return [...leakWatches.values()].map(({ id, baselineName, intervalMs }) => ({ id, baselineName, intervalMs })); };

    // ------------------------------------------------------------------
    // Route conflict / configuration validation. Report-only by default.
    // No route ordering, overwrite rules, or matching behavior is changed.
    // ------------------------------------------------------------------
    site.validate = site.validate || {};
    const normalizeMethods = route => String(route?.method || 'GET').split('|').map(v => v.trim().toUpperCase()).filter(Boolean);
    const methodOverlap = (a, b) => {
        const aa = normalizeMethods(a), bb = normalizeMethods(b);
        return aa.includes('*') || bb.includes('*') || aa.some(x => bb.includes(x));
    };
    const wildcardPattern = name => {
        try {
            const source = '^' + String(name).split('*').map(part => site.escapeRegExp ? site.escapeRegExp(part) : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$';
            return new RegExp(source, 'u');
        } catch (_) { return null; }
    };
    site.validate.routes = function (options = {}) {
        const routes = Array.isArray(options.routes) ? options.routes : (site.routing?.list || []);
        const duplicates = [];
        const overlaps = [];
        const invalid = [];
        for (let i = 0; i < routes.length; i++) {
            const a = routes[i];
            if (!a || typeof a.name !== 'string' || !a.name) {
                invalid.push({ index: i, reason: 'missing-name' });
                continue;
            }
            if (typeof a.callback !== 'function' && !a.path) invalid.push({ index: i, name: a.name, reason: 'missing-handler-and-path' });
            for (let j = i + 1; j < routes.length; j++) {
                const b = routes[j];
                if (!b || typeof b.name !== 'string' || !methodOverlap(a, b)) continue;
                if (a.name === b.name) {
                    duplicates.push({ first: i, second: j, name: a.name, methods: [a.method, b.method] });
                    continue;
                }
                if (!a.name.includes('*') && !b.name.includes('*')) continue;
                const ar = a.name.includes('*') ? wildcardPattern(a.name) : null;
                const br = b.name.includes('*') ? wildcardPattern(b.name) : null;
                let overlapsNow = false;
                if (ar && !b.name.includes('*')) overlapsNow = ar.test(b.name);
                else if (br && !a.name.includes('*')) overlapsNow = br.test(a.name);
                // wildcard-vs-wildcard overlap is difficult to prove cheaply; report only
                // obvious shared-prefix cases to avoid false certainty.
                else if (ar && br) {
                    const ap = a.name.split('*')[0], bp = b.name.split('*')[0];
                    overlapsNow = ap.startsWith(bp) || bp.startsWith(ap);
                }
                if (overlapsNow) overlaps.push({ first: i, second: j, names: [a.name, b.name], methods: [a.method, b.method] });
            }
        }
        const report = { ok: invalid.length === 0 && duplicates.length === 0, total: routes.length, invalid, duplicates, overlaps };
        if (options.assert && !report.ok) {
            const error = new Error('iSite route validation failed');
            error.code = 'ISITE_ROUTE_VALIDATION_FAILED';
            error.details = report;
            throw error;
        }
        return report;
    };
    site.validate.options = function (options = site.options || {}, config = {}) {
        const errors = [], warnings = [];
        const expectNumber = (path, value, min = 0) => {
            if (value == null) return;
            if (!Number.isFinite(Number(value)) || Number(value) < min) errors.push({ path, value, expected: `number >= ${min}` });
        };
        expectNumber('port', options.port, 0);
        expectNumber('responseTimeout', options.responseTimeout, 0);
        expectNumber('savingTime', options.savingTime, 0);
        if (options.mongodb) {
            expectNumber('mongodb.port', options.mongodb.port, 0);
            expectNumber('mongodb.limit', options.mongodb.limit, 0);
            if (options.mongodb.enabled && options.mongodb.db != null && typeof options.mongodb.db !== 'string') errors.push({ path: 'mongodb.db', value: options.mongodb.db, expected: 'string' });
        }
        if (options.session) {
            expectNumber('session.timeout', options.session.timeout, 0);
            expectNumber('session.memoryTimeout', options.session.memoryTimeout, 0);
        }
        for (const key of ['upload_dir', 'download_dir', 'backup_dir', 'apps_dir']) {
            if (options[key] != null && typeof options[key] !== 'string') errors.push({ path: key, value: options[key], expected: 'string' });
        }
        if (config.knownOnly === true) {
            const known = new Set(Object.keys(site.options || {}));
            for (const key of Object.keys(options || {})) if (!known.has(key)) warnings.push({ path: key, reason: 'unknown-option' });
        }
        const report = { ok: errors.length === 0, errors, warnings };
        if (config.assert && !report.ok) {
            const error = new Error('iSite options validation failed');
            error.code = 'ISITE_OPTIONS_VALIDATION_FAILED';
            error.details = report;
            throw error;
        }
        return report;
    };
    site.validate.all = function (options = {}) {
        const result = { options: this.options(site.options, options), routes: this.routes(options) };
        result.ok = result.options.ok && result.routes.ok;
        if (options.assert && !result.ok) {
            const error = new Error('iSite validation failed');
            error.code = 'ISITE_VALIDATION_FAILED';
            error.details = result;
            throw error;
        }
        return result;
    };

    if (site.shutdown && typeof site.shutdown.add === 'function') {
        site.shutdown.add(() => site.leaks.stopAll(), -1100);
        site.shutdown.add(() => {
            for (const queue of site.backpressureQueues.values()) queue.close();
            site.backpressureQueues.clear();
        }, -1090);
    }

    // Extend health output additively while retaining the previous function.
    if (typeof site.health === 'function') {
        const previousHealth = site.health;
        site.health = function (...args) {
            const out = previousHealth.apply(this, args);
            if (out && typeof out === 'object') {
                out.leaks = site.leaks.snapshot();
                out.backpressureQueues = Object.fromEntries([...site.backpressureQueues].map(([name, q]) => [name, q.stats()]));
            }
            return out;
        };
    }

    return {
        version: 'v16',
        abort: site.abort,
        BackpressureQueue,
        leaks: site.leaks,
        validate: site.validate,
    };
};
