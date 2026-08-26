'use strict';

module.exports = function initCoreV3(site) {
    // v20: keep diagnostics dependencies off the startup critical path.
    // They are loaded on first actual event/profiler use.
    let emitter;
    const getEmitter = () => {
        if (!emitter) { const { EventEmitter } = require('node:events'); emitter = new EventEmitter(); emitter.setMaxListeners(100); }
        return emitter;
    };
    let performanceApi;
    const now = () => {
        if (!performanceApi) performanceApi = require('node:perf_hooks').performance;
        return performanceApi.now();
    };

    // ---------------------------------------------------------------------
    // Capabilities: cheap values are captured immediately, while expensive
    // native-module probes stay lazy. Reading any public capability still
    // returns the same value/type as before, but normal startup no longer
    // loads http2/zlib/worker_threads/os just to build this object.
    // ---------------------------------------------------------------------
    const capabilities = {
        nativeFetch: typeof globalThis.fetch === 'function',
        abortController: typeof globalThis.AbortController === 'function',
        webStreams: typeof globalThis.ReadableStream === 'function',
        platform: process.platform,
        arch: process.arch,
        node: process.versions.node,
    };
    const lazyCapability = function (name, loader) {
        let resolved = false;
        let value;
        Object.defineProperty(capabilities, name, {
            enumerable: true,
            configurable: false,
            get() {
                if (!resolved) {
                    resolved = true;
                    value = loader();
                }
                return value;
            },
        });
    };
    lazyCapability('workerThreads', () => { try { require('node:worker_threads'); return true; } catch (_) { return false; } });
    lazyCapability('brotli', () => !!site.zlib?.brotliCompress);
    lazyCapability('http2', () => !!site.http2);
    lazyCapability('cpus', () => { try { return require('node:os').cpus()?.length || 1; } catch (_) { return 1; } });
    site.capabilities = Object.freeze(capabilities);

    // ---------------------------------------------------------------------
    // Feature flags: additive, disabled flags never change legacy behavior.
    // ---------------------------------------------------------------------
    const flagMap = new Map();
    site.featuresV3 = {
        enable(name, value = true) { flagMap.set(String(name), value); return value; },
        disable(name) { flagMap.set(String(name), false); return false; },
        isEnabled(name, fallback = false) { return flagMap.has(String(name)) ? !!flagMap.get(String(name)) : !!fallback; },
        get(name, fallback) { return flagMap.has(String(name)) ? flagMap.get(String(name)) : fallback; },
        set(name, value) { flagMap.set(String(name), value); return value; },
        list() { return Object.fromEntries(flagMap); },
        clear(name) { return flagMap.delete(String(name)); },
    };

    // ---------------------------------------------------------------------
    // Event bus: native EventEmitter, intentionally separate from old site.on.
    // ---------------------------------------------------------------------
    site.events = {
        on(name, fn) { const e=getEmitter(); e.on(name, fn); return () => e.off(name, fn); },
        once(name, fn) { const e=getEmitter(); e.once(name, fn); return () => e.off(name, fn); },
        off(name, fn) { if (emitter) emitter.off(name, fn); },
        emit(name, ...args) { return emitter ? emitter.emit(name, ...args) : false; },
        listenerCount(name) { return emitter ? emitter.listenerCount(name) : 0; },
        removeAll(name) { if (emitter) emitter.removeAllListeners(name); },
    };

    // ---------------------------------------------------------------------
    // Hooks: small async pipeline for instrumentation/extensions.
    // ---------------------------------------------------------------------
    const hookMap = new Map();
    site.hooks = {
        add(name, fn) {
            name = String(name);
            let list = hookMap.get(name);
            if (!list) hookMap.set(name, (list = []));
            list.push(fn);
            return () => site.hooks.remove(name, fn);
        },
        remove(name, fn) {
            const list = hookMap.get(String(name));
            if (!list) return false;
            const i = list.indexOf(fn);
            if (i === -1) return false;
            list.splice(i, 1);
            return true;
        },
        async run(name, context) {
            const list = hookMap.get(String(name));
            if (!list || list.length === 0) return context;
            for (const fn of list.slice()) await fn(context, site);
            return context;
        },
        list(name) { return (hookMap.get(String(name)) || []).slice(); },
    };

    // ---------------------------------------------------------------------
    // Inflight request/query de-duplication.
    // ---------------------------------------------------------------------
    const inflightMap = new Map();
    site.inflight = {
        map: inflightMap,
        run(key, factory) {
            key = String(key);
            if (inflightMap.has(key)) return inflightMap.get(key);
            const p = Promise.resolve().then(factory).finally(() => inflightMap.delete(key));
            inflightMap.set(key, p);
            return p;
        },
        has(key) { return inflightMap.has(String(key)); },
        size() { return inflightMap.size; },
        clear() { inflightMap.clear(); },
    };

    // ---------------------------------------------------------------------
    // Tagged bounded cache with TTL + stale-while-revalidate support.
    // ---------------------------------------------------------------------
    class TaggedCache {
        constructor(options = {}) {
            this.maxEntries = options.maxEntries || 1000;
            this.maxBytes = options.maxBytes || 32 * 1024 * 1024;
            this.defaultTTL = options.ttl == null ? 5 * 60 * 1000 : options.ttl;
            this.map = new Map();
            this.tags = new Map();
            this.bytes = 0;
            this.hits = 0;
            this.misses = 0;
            this.evictions = 0;
        }
        _size(value) {
            if (value == null) return 0;
            if (Buffer.isBuffer(value)) return value.length;
            if (typeof value === 'string') return Buffer.byteLength(value);
            try { return Buffer.byteLength(JSON.stringify(value)); } catch (_) { return 0; }
        }
        _detach(key, entry) {
            if (!entry) return;
            this.map.delete(key);
            this.bytes -= entry.size || 0;
            for (const tag of entry.tags || []) {
                const set = this.tags.get(tag);
                if (!set) continue;
                set.delete(key);
                if (set.size === 0) this.tags.delete(tag);
            }
        }
        set(key, value, options = {}) {
            key = String(key);
            const previous = this.map.get(key);
            if (previous) this._detach(key, previous);
            const tagList = Array.isArray(options.tags) ? options.tags.map(String) : [];
            const ttl = options.ttl == null ? this.defaultTTL : Number(options.ttl);
            const staleTTL = Number(options.staleTTL || 0);
            const now = Date.now();
            const entry = { value, size: this._size(value), createdAt: now, expiresAt: ttl > 0 ? now + ttl : 0, staleUntil: ttl > 0 ? now + ttl + staleTTL : 0, tags: tagList };
            this.map.set(key, entry);
            this.bytes += entry.size;
            for (const tag of tagList) {
                let set = this.tags.get(tag);
                if (!set) this.tags.set(tag, (set = new Set()));
                set.add(key);
            }
            this._trim();
            return value;
        }
        getEntry(key, options = {}) {
            key = String(key);
            const entry = this.map.get(key);
            if (!entry) { this.misses++; return null; }
            const now = Date.now();
            if (entry.expiresAt && now > entry.expiresAt) {
                if (!(options.allowStale && entry.staleUntil && now <= entry.staleUntil)) {
                    this._detach(key, entry); this.misses++; return null;
                }
                entry.stale = true;
            } else entry.stale = false;
            this.map.delete(key); this.map.set(key, entry);
            this.hits++;
            return entry;
        }
        get(key, options = {}) { const e = this.getEntry(key, options); return e ? e.value : undefined; }
        has(key) { return this.getEntry(key) !== null; }
        delete(key) { const e = this.map.get(String(key)); if (!e) return false; this._detach(String(key), e); return true; }
        invalidateTag(tag) {
            const keys = Array.from(this.tags.get(String(tag)) || []);
            for (const key of keys) this.delete(key);
            return keys.length;
        }
        clear() { this.map.clear(); this.tags.clear(); this.bytes = 0; }
        _trim() {
            while (this.map.size > this.maxEntries || this.bytes > this.maxBytes) {
                const first = this.map.keys().next().value;
                if (first === undefined) break;
                this.delete(first); this.evictions++;
            }
        }
        stats() { return { entries: this.map.size, bytes: this.bytes, hits: this.hits, misses: this.misses, hitRate: (this.hits + this.misses) ? this.hits / (this.hits + this.misses) : 0, evictions: this.evictions, tags: this.tags.size }; }
    }
    site.TaggedCache = TaggedCache;
    site.cacheV3 = new TaggedCache();
    site.cache = site.cache || site.cacheV3; // do not overwrite a legacy cache object if present

    site.cacheGetOrLoad = async function (key, loader, options = {}) {
        const entry = site.cacheV3.getEntry(key, { allowStale: !!options.staleWhileRevalidate });
        if (entry && !entry.stale) return entry.value;
        if (entry && entry.stale && options.staleWhileRevalidate) {
            site.inflight.run('cache:' + key, async () => site.cacheV3.set(key, await loader(), options)).catch(() => {});
            return entry.value;
        }
        return site.inflight.run('cache:' + key, async () => site.cacheV3.set(key, await loader(), options));
    };

    // ---------------------------------------------------------------------
    // Reliability primitives: timeout, retry and circuit breaker.
    // ---------------------------------------------------------------------
    site.withTimeout = function (promiseOrFactory, ms, options = {}) {
        ms = Number(ms || 0);
        if (!(ms > 0)) return Promise.resolve().then(() => typeof promiseOrFactory === 'function' ? promiseOrFactory() : promiseOrFactory);
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                const err = new Error(options.message || `Operation timed out after ${ms}ms`);
                err.code = options.code || 'ISITE_TIMEOUT';
                reject(err);
            }, ms);
            Promise.resolve().then(() => typeof promiseOrFactory === 'function' ? promiseOrFactory() : promiseOrFactory).then(
                value => { clearTimeout(timer); resolve(value); },
                err => { clearTimeout(timer); reject(err); },
            );
        });
    };

    site.retry = async function (factory, options = {}) {
        const retries = Math.max(0, Number(options.retries == null ? 2 : options.retries));
        const minDelay = Math.max(0, Number(options.minDelay == null ? 50 : options.minDelay));
        const maxDelay = Math.max(minDelay, Number(options.maxDelay == null ? 2000 : options.maxDelay));
        const factor = Math.max(1, Number(options.factor == null ? 2 : options.factor));
        const jitter = Math.max(0, Math.min(1, Number(options.jitter == null ? 0.2 : options.jitter)));
        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try { return await factory(attempt); }
            catch (err) {
                lastError = err;
                if (attempt >= retries || (options.shouldRetry && !options.shouldRetry(err, attempt))) throw err;
                let delay = Math.min(maxDelay, minDelay * Math.pow(factor, attempt));
                if (jitter) delay *= 1 + ((Math.random() * 2 - 1) * jitter);
                await new Promise(r => setTimeout(r, Math.max(0, Math.round(delay))));
            }
        }
        throw lastError;
    };

    const breakers = new Map();
    site.circuitBreaker = function (name, options = {}) {
        name = String(name);
        if (breakers.has(name)) return breakers.get(name);
        const state = { state: 'closed', failures: 0, openedAt: 0, halfOpenInFlight: false };
        const threshold = Math.max(1, Number(options.failureThreshold || 5));
        const resetTimeout = Math.max(1, Number(options.resetTimeout || 30000));
        const breaker = {
            async run(factory) {
                const now = Date.now();
                if (state.state === 'open') {
                    if (now - state.openedAt < resetTimeout) {
                        const err = new Error(`Circuit ${name} is open`); err.code = 'ISITE_CIRCUIT_OPEN'; throw err;
                    }
                    state.state = 'half-open';
                }
                if (state.state === 'half-open' && state.halfOpenInFlight) {
                    const err = new Error(`Circuit ${name} is half-open`); err.code = 'ISITE_CIRCUIT_OPEN'; throw err;
                }
                if (state.state === 'half-open') state.halfOpenInFlight = true;
                try {
                    const value = await factory();
                    state.failures = 0; state.state = 'closed'; state.halfOpenInFlight = false;
                    return value;
                } catch (err) {
                    state.halfOpenInFlight = false; state.failures++;
                    if (state.state === 'half-open' || state.failures >= threshold) { state.state = 'open'; state.openedAt = Date.now(); }
                    throw err;
                }
            },
            reset() { state.state = 'closed'; state.failures = 0; state.openedAt = 0; state.halfOpenInFlight = false; },
            snapshot() { return { ...state, name, threshold, resetTimeout }; },
        };
        breakers.set(name, breaker);
        return breaker;
    };

    // ---------------------------------------------------------------------
    // Compiled middleware pipeline. New API only; old validation callbacks remain.
    // ---------------------------------------------------------------------
    site.pipeline = function (...handlers) {
        handlers = handlers.flat().filter((fn) => typeof fn === 'function');
        return async function compiledPipeline(context) {
            let index = -1;
            async function dispatch(i) {
                if (i <= index) throw new Error('next() called multiple times');
                index = i;
                const fn = handlers[i];
                if (!fn) return context;
                return fn(context, () => dispatch(i + 1), site);
            }
            await dispatch(0);
            return context;
        };
    };

    // ---------------------------------------------------------------------
    // Central scheduler: fewer unmanaged timers, cancellable tasks.
    // ---------------------------------------------------------------------
    // v27: normal index startup installs the exact scheduler behavior from the
    // tiny scheduler module before Core v3 is materialized. Direct legacy use
    // of core-v3 still creates the scheduler here exactly as before.
    if (!site.scheduler) require('./scheduler.js')(site);

    // ---------------------------------------------------------------------
    // Worker threads for CPU-heavy file-based jobs; zero dependency.
    // ---------------------------------------------------------------------
    site.workers = {
        runFile(filename, workerData, options = {}) {
            if (!site.capabilities.workerThreads) return Promise.reject(Object.assign(new Error('Worker threads are not supported'), { code: 'ISITE_WORKER_UNAVAILABLE' }));
            const { Worker } = require('node:worker_threads');
            return new Promise((resolve, reject) => {
                const worker = new Worker(filename, { workerData, ...options.workerOptions });
                let settled = false;
                const finish = (fn, value) => { if (settled) return; settled = true; fn(value); };
                worker.once('message', value => finish(resolve, value));
                worker.once('error', err => finish(reject, err));
                worker.once('exit', code => { if (!settled && code !== 0) finish(reject, Object.assign(new Error(`Worker stopped with exit code ${code}`), { code: 'ISITE_WORKER_EXIT' })); });
                if (options.timeout > 0) {
                    const timer = setTimeout(() => { worker.terminate(); finish(reject, Object.assign(new Error('Worker timed out'), { code: 'ISITE_WORKER_TIMEOUT' })); }, options.timeout);
                    if (timer.unref) timer.unref();
                }
            });
        },
    };

    // ---------------------------------------------------------------------
    // Reliable HTTP wrapper: timeout + retry + optional circuit breaker.
    // ---------------------------------------------------------------------
    site.fetchReliable = async function (url, options = {}) {
        const reliability = options.reliability || {};
        const requestOptions = { ...options };
        delete requestOptions.reliability;
        const breaker = reliability.circuit ? site.circuitBreaker(reliability.circuit, reliability.circuitOptions) : null;
        const execute = () => site.withTimeout(() => site.fetch(url, requestOptions), reliability.timeout || 0);
        const attempt = () => breaker ? breaker.run(execute) : execute();
        return site.retry(attempt, {
            retries: reliability.retries == null ? 0 : reliability.retries,
            minDelay: reliability.minDelay,
            maxDelay: reliability.maxDelay,
            factor: reliability.factor,
            jitter: reliability.jitter,
            shouldRetry: reliability.shouldRetry,
        });
    };

    // HTTP cache helpers are opt-in to avoid changing legacy dynamic responses.
    let httpCacheCrypto;
    const getHttpCacheCrypto = () => httpCacheCrypto || (httpCacheCrypto = require('node:crypto'));
    site.httpCache = {
        etag(value, weak = true) {
            const input = Buffer.isBuffer(value) ? value : Buffer.from(String(value == null ? '' : value));
            const hash = getHttpCacheCrypto().createHash('sha1').update(input).digest('base64url').slice(0, 27);
            return `${weak ? 'W/' : ''}"${input.length.toString(16)}-${hash}"`;
        },
        isFresh(req, etag, lastModified) {
            const inm = req?.headers?.['if-none-match'];
            if (inm && etag && String(inm).split(',').map(x => x.trim()).includes(etag)) return true;
            const ims = req?.headers?.['if-modified-since'];
            if (ims && lastModified) {
                const a = Date.parse(ims), b = new Date(lastModified).getTime();
                if (Number.isFinite(a) && Number.isFinite(b) && b <= a) return true;
            }
            return false;
        },
        range(rangeHeader, size) {
            if (!rangeHeader || !/^bytes=/i.test(rangeHeader) || !(size >= 0)) return null;
            const raw = String(rangeHeader).replace(/^bytes=/i, '').split(',')[0].trim();
            const [a, b] = raw.split('-');
            let start, end;
            if (a === '') { const suffix = Number(b); if (!(suffix > 0)) return null; start = Math.max(0, size - suffix); end = size - 1; }
            else { start = Number(a); end = b === '' ? size - 1 : Number(b); }
            if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return { unsatisfiable: true, size };
            end = Math.min(end, size - 1);
            return { start, end, length: end - start + 1, size };
        },
    };

    // ---------------------------------------------------------------------
    // Profiling: bounded samples and aggregate report.
    // ---------------------------------------------------------------------
    const profiles = new Map();
    function profileRecord(name, ms) {
        let p = profiles.get(name);
        if (!p) profiles.set(name, (p = { count: 0, total: 0, max: 0, samples: [] }));
        p.count++; p.total += ms; if (ms > p.max) p.max = ms;
        p.samples.push(ms); if (p.samples.length > 1024) p.samples.shift();
    }
    site.profile = function (name, fn) {
        const start = now();
        if (typeof fn !== 'function') return function end() { const ms = now() - start; profileRecord(String(name), ms); return ms; };
        try {
            const result = fn();
            if (result && typeof result.then === 'function') return result.finally(() => profileRecord(String(name), now() - start));
            profileRecord(String(name), now() - start); return result;
        } catch (err) { profileRecord(String(name), now() - start); throw err; }
    };
    site.profileReport = function () {
        const out = {};
        for (const [name, p] of profiles) {
            const sorted = p.samples.slice().sort((a, b) => a - b);
            const pct = q => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] : 0;
            out[name] = { count: p.count, avgMs: p.count ? p.total / p.count : 0, maxMs: p.max, p50Ms: pct(0.50), p95Ms: pct(0.95), p99Ms: pct(0.99) };
        }
        return out;
    };

    // ---------------------------------------------------------------------
    // Memory pressure manager. Conservative: only prunes V3 cache by default.
    // ---------------------------------------------------------------------
    const memoryState = { level: 0, lastCheck: 0 };
    site.memory = {
        snapshot() { return { ...process.memoryUsage(), level: memoryState.level, cache: site.cacheV3.stats() }; },
        check(options = {}) {
            const m = process.memoryUsage();
            const heapRatio = m.heapTotal ? m.heapUsed / m.heapTotal : 0;
            const rssLimit = Number(options.rssLimit || 0);
            let level = heapRatio >= 0.90 || (rssLimit && m.rss >= rssLimit) ? 3 : heapRatio >= 0.80 ? 2 : heapRatio >= 0.70 ? 1 : 0;
            memoryState.level = level; memoryState.lastCheck = Date.now();
            if (level >= 2) {
                const target = level >= 3 ? Math.ceil(site.cacheV3.map.size * 0.25) : Math.ceil(site.cacheV3.map.size * 0.60);
                while (site.cacheV3.map.size > target) {
                    const key = site.cacheV3.map.keys().next().value;
                    if (key === undefined) break;
                    site.cacheV3.delete(key);
                }
            }
            site.events.emit('memory.pressure', { level, memory: m });
            return level;
        },
    };

    // ---------------------------------------------------------------------
    // Shutdown registry. Does not replace legacy site.close; it augments it.
    // ---------------------------------------------------------------------
    const shutdownHandlers = [];
    site.shutdown = {
        add(fn, priority = 0) { shutdownHandlers.push({ fn, priority }); shutdownHandlers.sort((a, b) => b.priority - a.priority); return fn; },
        async run(context = {}) {
            const errors = [];
            for (const item of shutdownHandlers.slice()) {
                try { await item.fn(context, site); } catch (err) { errors.push(err); }
            }
            return { done: errors.length === 0, errors };
        },
        count() { return shutdownHandlers.length; },
    };

    // Common invalidation bridge. Modules can emit these without direct coupling.
    site.events.on('cache.invalidateTag', tag => site.cacheV3.invalidateTag(tag));

    site.closeGracefully = async function (options = {}) {
        if (site._gracefulClosing) return { done: false, reason: 'already-closing' };
        site._gracefulClosing = true;
        const timeout = Number(options.timeout == null ? 10000 : options.timeout);
        const closeServers = async () => {
            const servers = site.servers || [];
            await Promise.all(servers.map(server => new Promise(resolve => {
                if (!server || typeof server.close !== 'function') return resolve();
                try { server.close(() => resolve()); } catch (_) { resolve(); }
            })));
        };
        const work = async () => {
            site.events.emit('shutdown.start', options);
            await closeServers();
            const hooks = await site.shutdown.run(options);
            if (typeof site.call === 'function') await new Promise(resolve => {
                try { site.call('[close-database]', null, () => resolve()); } catch (_) { resolve(); }
            });
            site.diagnostics?.close?.();
            site.events.emit('shutdown.end', hooks);
            return hooks;
        };
        try { return await site.withTimeout(work, timeout, { code: 'ISITE_SHUTDOWN_TIMEOUT' }); }
        finally { site._gracefulClosing = false; }
    };

    site.coreV3 = {
        version: '3.0.0',
        cache: site.cacheV3,
        breakers,
        profiles,
        snapshot() {
            return {
                version: this.version,
                capabilities: site.capabilities,
                features: site.featuresV3.list(),
                inflight: inflightMap.size,
                cache: site.cacheV3.stats(),
                profiles: site.profileReport(),
                memory: site.memory.snapshot(),
            };
        },
    };

    return site.coreV3;
};
