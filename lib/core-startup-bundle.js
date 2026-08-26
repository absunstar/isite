'use strict';

// GENERATED startup bundle. Original source modules remain public and authoritative.

const diagnostics = (() => { const module = { exports: {} }; const exports = module.exports;
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

return module.exports; })();

const coreV3 = (() => { const module = { exports: {} }; const exports = module.exports;
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
    const scheduled = new Map();
    site.scheduler = {
        later(name, ms, fn) {
            this.cancel(name);
            const timer = setTimeout(async () => {
                scheduled.delete(String(name));
                try { await fn(); } catch (err) { site.events.emit('scheduler.error', { name, err }); }
            }, Math.max(0, Number(ms || 0)));
            if (timer.unref) timer.unref();
            scheduled.set(String(name), { type: 'timeout', timer });
            return timer;
        },
        every(name, ms, fn) {
            this.cancel(name);
            const timer = setInterval(async () => {
                const item = scheduled.get(String(name));
                if (!item || item.running) return;
                item.running = true;
                try { await fn(); } catch (err) { site.events.emit('scheduler.error', { name, err }); }
                finally { item.running = false; }
            }, Math.max(1, Number(ms || 1)));
            if (timer.unref) timer.unref();
            scheduled.set(String(name), { type: 'interval', timer, running: false });
            return timer;
        },
        cancel(name) {
            const item = scheduled.get(String(name));
            if (!item) return false;
            if (item.type === 'interval') clearInterval(item.timer); else clearTimeout(item.timer);
            scheduled.delete(String(name));
            return true;
        },
        clear() { for (const key of Array.from(scheduled.keys())) this.cancel(key); },
        list() { return Array.from(scheduled.keys()); },
    };

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

return module.exports; })();

const coreV4 = (() => { const module = { exports: {} }; const exports = module.exports;
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

return module.exports; })();

const coreV5 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV5(site) {
    const fs = require('node:fs');
    const path = require('node:path');
    let crypto;
    let zlib;
    const getCrypto = () => crypto || (crypto = require('node:crypto'));
    const getZlib = () => zlib || (zlib = require('node:zlib'));

    // Stable, bounded key generation for caches/query de-duplication.
    const stableSerialize = (value, seen = new WeakSet()) => {
        if (value instanceof Date) return `date:${value.toISOString()}`;
        if (value === undefined) return 'undefined';
        if (typeof value === 'number' && Number.isNaN(value)) return 'number:NaN';
        if (typeof value === 'bigint') return `bigint:${value}`;
        if (typeof value === 'function') return `function:${value.name || 'anonymous'}`;
        if (value === null || typeof value !== 'object') return JSON.stringify(value);
        if (seen.has(value)) return '"[Circular]"';
        seen.add(value);
        let out;
        if (Array.isArray(value)) out = '[' + value.map(v => stableSerialize(v, seen)).join(',') + ']';
        else {
            const keys = Object.keys(value).sort();
            out = '{' + keys.map(k => JSON.stringify(k) + ':' + stableSerialize(value[k], seen)).join(',') + '}';
        }
        seen.delete(value);
        return out;
    };
    site.stableKey = function (...parts) {
        const raw = parts.map(v => stableSerialize(v)).join('|');
        // Keep small keys human-readable; hash large keys to cap memory usage.
        return raw.length <= 512 ? raw : 'sha1:' + getCrypto().createHash('sha1').update(raw).digest('hex');
    };

    // Generic adaptive LRU cache. This is additive and does not replace legacy caches.
    class AdaptiveCache {
        constructor(options = {}) {
            this.maxEntries = Math.max(1, Number(options.maxEntries || 1000));
            this.maxBytes = Math.max(1024, Number(options.maxBytes || 32 * 1024 * 1024));
            this.defaultTTL = Math.max(0, Number(options.ttl == null ? 60000 : options.ttl));
            this.map = new Map();
            this.bytes = 0;
            this.hits = 0;
            this.misses = 0;
            this.evictions = 0;
            this._sizeOf = typeof options.sizeOf === 'function' ? options.sizeOf : (value) => {
                if (Buffer.isBuffer(value)) return value.length;
                if (typeof value === 'string') return Buffer.byteLength(value);
                try { return Buffer.byteLength(JSON.stringify(value)); } catch (_) { return 256; }
            };
        }
        set(key, value, options = {}) {
            key = String(key);
            const ttl = Math.max(0, Number(options.ttl == null ? this.defaultTTL : options.ttl));
            const size = Math.max(0, Number(options.size == null ? this._sizeOf(value) : options.size));
            const old = this.map.get(key);
            if (old) this.bytes -= old.size;
            const entry = { value, size, expiresAt: ttl ? Date.now() + ttl : 0, createdAt: Date.now(), hits: 0 };
            this.map.delete(key); this.map.set(key, entry); this.bytes += size;
            this._trim();
            return value;
        }
        get(key, options = {}) {
            key = String(key);
            const entry = this.map.get(key);
            if (!entry) { this.misses++; return undefined; }
            if (entry.expiresAt && entry.expiresAt <= Date.now() && !options.allowStale) {
                this.delete(key); this.misses++; return undefined;
            }
            this.map.delete(key); this.map.set(key, entry);
            entry.hits++; this.hits++;
            return entry.value;
        }
        has(key) { return this.get(key) !== undefined; }
        delete(key) {
            key = String(key);
            const entry = this.map.get(key);
            if (!entry) return false;
            this.bytes -= entry.size; this.map.delete(key); return true;
        }
        clear() { this.map.clear(); this.bytes = 0; }
        resize(options = {}) {
            if (options.maxEntries != null) this.maxEntries = Math.max(1, Number(options.maxEntries));
            if (options.maxBytes != null) this.maxBytes = Math.max(1024, Number(options.maxBytes));
            this._trim(); return this.stats();
        }
        _trim() {
            while (this.map.size > this.maxEntries || this.bytes > this.maxBytes) {
                const key = this.map.keys().next().value;
                if (key === undefined) break;
                const entry = this.map.get(key);
                this.bytes -= entry?.size || 0; this.map.delete(key); this.evictions++;
            }
        }
        stats() {
            const requests = this.hits + this.misses;
            return { entries: this.map.size, bytes: this.bytes, maxEntries: this.maxEntries, maxBytes: this.maxBytes, hits: this.hits, misses: this.misses, hitRate: requests ? this.hits / requests : 0, evictions: this.evictions };
        }
    }
    site.AdaptiveCache = AdaptiveCache;
    site.adaptiveCaches = new Map();
    site.adaptiveCache = function (name, options = {}) {
        name = String(name);
        let cache = site.adaptiveCaches.get(name);
        if (!cache) { cache = new AdaptiveCache(options); site.adaptiveCaches.set(name, cache); }
        else if (options.maxEntries != null || options.maxBytes != null) cache.resize(options);
        return cache;
    };

    // Automatic cache pressure response. Opt-in; callers decide when to start it.
    site.cacheTuner = {
        tune(options = {}) {
            const ratio = Number(options.ratio || 0.8);
            const heap = process.memoryUsage();
            const limit = Number(options.heapLimit || require('node:v8').getHeapStatistics().heap_size_limit || 1);
            const pressure = heap.heapUsed / limit;
            if (pressure < ratio) return { pressure, changed: 0 };
            const factor = Math.max(0.25, Math.min(0.9, Number(options.factor || 0.75)));
            let changed = 0;
            for (const cache of site.adaptiveCaches.values()) {
                cache.resize({ maxEntries: Math.max(1, Math.floor(cache.maxEntries * factor)), maxBytes: Math.max(1024, Math.floor(cache.maxBytes * factor)) });
                changed++;
            }
            // Existing fsm cache remains API-compatible; only its configured budget is tightened.
            if (site.fsm && Number.isFinite(site.fsm.cacheMaxBytes)) {
                site.fsm.cacheMaxBytes = Math.max(1024 * 1024, Math.floor(site.fsm.cacheMaxBytes * factor));
                site.fsm.cacheMaxEntries = Math.max(128, Math.floor(site.fsm.cacheMaxEntries * factor));
                changed++;
            }
            return { pressure, changed };
        },
    };

    // Static asset pre-compression manager. New API only; legacy download paths are untouched.
    const compressedCache = site.adaptiveCache('static-precompressed', { maxEntries: 512, maxBytes: 64 * 1024 * 1024, ttl: 5 * 60 * 1000, sizeOf: b => b?.length || 0 });
    const compressAsync = (buffer, encoding, options) => new Promise((resolve, reject) => {
        const cb = (err, out) => err ? reject(err) : resolve(out);
        if (encoding === 'br') return getZlib().brotliCompress(buffer, options?.brotli || {}, cb);
        if (encoding === 'gzip') return getZlib().gzip(buffer, options?.gzip || {}, cb);
        if (encoding === 'deflate') return getZlib().deflate(buffer, options?.deflate || {}, cb);
        resolve(buffer);
    });
    site.staticAssets = {
        chooseEncoding(header = '') {
            const supported = new Set(['br', 'gzip', 'deflate']);
            const choices = String(header).toLowerCase().split(',').map((part, index) => {
                const [nameRaw, ...params] = part.trim().split(';');
                const name = nameRaw.trim();
                let q = 1;
                for (const param of params) {
                    const m = param.trim().match(/^q=([0-9.]+)$/);
                    if (m) q = Math.max(0, Math.min(1, Number(m[1])));
                }
                return { name, q, index };
            }).filter(x => supported.has(x.name) && x.q > 0);
            choices.sort((a, b) => b.q - a.q || ['br','gzip','deflate'].indexOf(a.name) - ['br','gzip','deflate'].indexOf(b.name) || a.index - b.index);
            return choices[0]?.name || null;
        },
        async precompress(filePath, options = {}) {
            const stat = await fs.promises.stat(filePath);
            const minSize = Number(options.minSize == null ? 1024 : options.minSize);
            if (!stat.isFile() || stat.size < minSize) return { path: filePath, skipped: true, size: stat.size };
            const encoding = options.encoding || 'br';
            const key = site.stableKey(filePath, stat.size, stat.mtimeMs, encoding);
            const cached = compressedCache.get(key);
            if (cached) return { path: filePath, encoding, buffer: cached, size: cached.length, cached: true, originalSize: stat.size };
            const input = await fs.promises.readFile(filePath);
            const buffer = await compressAsync(input, encoding, options);
            compressedCache.set(key, buffer, { size: buffer.length });
            return { path: filePath, encoding, buffer, size: buffer.length, originalSize: stat.size, cached: false };
        },
        async precompressMany(paths, options = {}) {
            const pool = site.pool ? site.pool('static-precompress', { limit: options.concurrency || 4 }) : null;
            return Promise.all(paths.map(p => pool ? pool.run(() => this.precompress(p, options)) : this.precompress(p, options)));
        },
        cacheStats() { return compressedCache.stats(); },
    };

    // Query helper layer for new code: normalized keys + cache + in-flight de-duplication.
    site.queryCache = site.adaptiveCache('queries', { maxEntries: 2000, maxBytes: 32 * 1024 * 1024, ttl: 15000 });
    site.query = {
        key(collectionName, operation, options) { return site.stableKey(collectionName, operation, options || {}); },
        async cached(collectionName, operation, options, loader, cacheOptions = {}) {
            const key = this.key(collectionName, operation, options);
            const cached = site.queryCache.get(key);
            if (cached !== undefined) return cached;
            const run = () => Promise.resolve().then(loader).then((value) => {
                site.queryCache.set(key, value, cacheOptions); return value;
            });
            if (site.inflight?.run) return site.inflight.run('query:' + key, run);
            return run();
        },
        invalidate(collectionName) {
            const prefix = stableSerialize(collectionName) + '|';
            let count = 0;
            for (const key of Array.from(site.queryCache.map.keys())) {
                if (key.startsWith(prefix)) { site.queryCache.delete(key); count++; }
            }
            return count;
        },
    };

    // Extend health diagnostics without changing v4 health contract fields.
    const oldHealth = site.health;
    if (typeof oldHealth === 'function') {
        site.health = function () {
            const out = oldHealth();
            out.adaptiveCaches = Object.fromEntries(Array.from(site.adaptiveCaches.entries()).map(([name, cache]) => [name, cache.stats()]));
            return out;
        };
    }

    return { version: 'v5', AdaptiveCache };
};

return module.exports; })();

const coreV6 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV6(site) {
    const fs = require('node:fs');
    const path = require('node:path');

    // Query-cache generations make invalidation O(1). Existing public v5
    // site.query.cached()/invalidate() signatures stay unchanged.
    const generations = new Map();
    const queryStats = { invalidations: 0, invalidatedCollections: 0 };
    const baseKey = site.query && site.query.key ? site.query.key.bind(site.query) : null;
    if (site.query && baseKey) {
        site.query.generation = function (collectionName) {
            return generations.get(String(collectionName)) || 0;
        };
        site.query.key = function (collectionName, operation, options) {
            const generation = this.generation(collectionName);
            return site.stableKey(collectionName, 'g:' + generation, operation, options || {});
        };
        site.query.invalidate = function (collectionName) {
            const name = String(collectionName);
            const next = (generations.get(name) || 0) + 1;
            generations.set(name, next);
            queryStats.invalidations++;
            queryStats.invalidatedCollections = generations.size;
            return 1;
        };
        site.query.invalidateAll = function () {
            for (const name of generations.keys()) generations.set(name, (generations.get(name) || 0) + 1);
            if (site.queryCache && typeof site.queryCache.clear === 'function') site.queryCache.clear();
            queryStats.invalidations++;
            return true;
        };
        site.query.stats = function () {
            return {
                ...queryStats,
                generations: generations.size,
                cache: site.queryCache && site.queryCache.stats ? site.queryCache.stats() : null,
            };
        };
    }

    // Static asset manifest/prewarm APIs. Opt-in and additive; legacy download
    // behavior is not replaced.
    if (site.staticAssets) {
        const manifests = new Map();
        const walk = async function (root, options, out) {
            const entries = await fs.promises.readdir(root, { withFileTypes: true });
            for (const entry of entries) {
                const full = path.join(root, entry.name);
                if (entry.isDirectory()) {
                    if (options.recursive !== false) await walk(full, options, out);
                    continue;
                }
                if (!entry.isFile()) continue;
                if (options.extensions && options.extensions.length) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (!options.extensions.includes(ext)) continue;
                }
                out.push(full);
            }
        };
        site.staticAssets.buildManifest = async function (root, options = {}) {
            root = path.resolve(root);
            const files = [];
            const extensions = (options.extensions || ['.js', '.css', '.html', '.json', '.svg', '.txt', '.xml'])
                .map(x => String(x).toLowerCase());
            await walk(root, { ...options, extensions }, files);
            const rows = await Promise.all(files.map(async file => {
                const stat = await fs.promises.stat(file);
                return { path: file, size: stat.size, mtimeMs: stat.mtimeMs };
            }));
            const manifest = { root, createdAt: Date.now(), files: rows };
            manifests.set(root, manifest);
            return manifest;
        };
        site.staticAssets.prewarmManifest = async function (manifestOrRoot, options = {}) {
            const manifest = typeof manifestOrRoot === 'string'
                ? (manifests.get(path.resolve(manifestOrRoot)) || await this.buildManifest(manifestOrRoot, options))
                : manifestOrRoot;
            const results = await this.precompressMany(manifest.files.map(x => x.path), options);
            return {
                files: results.length,
                compressed: results.filter(x => !x.skipped).length,
                skipped: results.filter(x => x.skipped).length,
                originalBytes: results.reduce((n, x) => n + Number(x.originalSize || x.size || 0), 0),
                compressedBytes: results.reduce((n, x) => n + Number(x.size || 0), 0),
                results,
            };
        };
        site.staticAssets.manifest = function (root) { return manifests.get(path.resolve(root)) || null; };
        site.staticAssets.clearManifest = function (root) { return manifests.delete(path.resolve(root)); };
    }

    // Public API compatibility snapshots let applications pin the shape of the
    // API without changing any legacy call sites.
    site.compat = site.compat || {};
    site.compat.snapshot = function (target = site, names) {
        const keys = Array.isArray(names) ? names : Object.keys(target).sort();
        const out = {};
        for (const key of keys) {
            const value = target[key];
            out[key] = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
        }
        return out;
    };
    site.compat.compare = function (expected, target = site) {
        const current = this.snapshot(target, Object.keys(expected || {}));
        const missing = [], changed = [];
        for (const [key, type] of Object.entries(expected || {})) {
            if (!(key in target)) missing.push(key);
            else if (current[key] !== type) changed.push({ key, expected: type, actual: current[key] });
        }
        return { ok: missing.length === 0 && changed.length === 0, missing, changed };
    };
    site.compat.assert = function (expected, target = site) {
        const result = this.compare(expected, target);
        if (!result.ok) {
            const err = new Error('iSite compatibility contract mismatch');
            err.code = 'ISITE_COMPAT_MISMATCH';
            err.details = result;
            throw err;
        }
        return result;
    };

    // Extend health without removing any v4/v5 fields.
    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            if (site.query && site.query.stats) out.queryCache = site.query.stats();
            return out;
        };
    }

    return { version: 'v6', queryGenerations: generations };
};

return module.exports; })();

const coreV7 = (() => { const module = { exports: {} }; const exports = module.exports;
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

return module.exports; })();

const coreV8 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV8(site) {
    // v20: tracing is observational and normally unused during startup.
    // Delay EventEmitter/crypto until the first trace/event operation.
    let traceEvents;
    const getTraceEvents = () => {
        if (!traceEvents) { const { EventEmitter } = require('node:events'); traceEvents = new EventEmitter(); }
        return traceEvents;
    };
    let cryptoApi;
    const traceId = () => {
        if (!cryptoApi) cryptoApi = require('node:crypto');
        return cryptoApi.randomUUID ? cryptoApi.randomUUID() : cryptoApi.randomBytes(12).toString('hex');
    };

    // ------------------------------------------------------------------
    // Structured trace/log buffer. Additive; legacy site.log() is untouched.
    // ------------------------------------------------------------------
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
            id: options.id || traceId(),
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
        if (traceEvents) { traceEvents.emit('trace', row); traceEvents.emit(row.level, row); }
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
        on(listener) { const e=getTraceEvents(); e.on('trace', listener); return () => e.off('trace', listener); },
        onLevel(level, listener) { level = String(level).toLowerCase(); const e=getTraceEvents(); e.on(level, listener); return () => e.off(level, listener); },
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

return module.exports; })();

const coreV9 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV9(site) {
    let crypto;
    const getCrypto = () => crypto || (crypto = require('node:crypto'));

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
                id: input.id || (getCrypto().randomUUID ? getCrypto().randomUUID() : getCrypto().randomBytes(12).toString('hex')),
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

return module.exports; })();

const coreV10 = (() => { const module = { exports: {} }; const exports = module.exports;
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

return module.exports; })();

const coreV11 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function initCoreV11(site) {
    const DEFAULT_EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);
    const DEFAULT_IGNORES = new Set([
        '.git', '.svn', '.hg', '.vs', '.vscode', 'node_modules', 'vendor', 'dist', 'build',
        'coverage', 'uploads', 'downloads', 'backups', 'backup', 'tmp', 'temp', '.cache'
    ]);

    const normalizePath = value => String(value || '').replace(/\\/g, '/');
    const addUsage = (map, name, file, line, scope) => {
        if (!name) return;
        let row = map.get(name);
        if (!row) {
            row = { name, count: 0, serverCount: 0, clientCount: 0, files: new Set(), examples: [] };
            map.set(name, row);
        }
        row.count++;
        if (scope === 'client') row.clientCount++;
        else row.serverCount++;
        row.files.add(file);
        if (row.examples.length < 5) row.examples.push({ file, line, scope });
    };

    const lineOf = (text, index) => {
        let line = 1;
        for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
        return line;
    };

    const serializeUsage = map => [...map.values()]
        .map(row => ({
            name: row.name,
            count: row.count,
            serverCount: row.serverCount,
            clientCount: row.clientCount,
            files: [...row.files].sort(),
            fileCount: row.files.size,
            examples: row.examples.slice(),
        }))
        .sort((a, b) => b.serverCount - a.serverCount || b.count - a.count || a.name.localeCompare(b.name));

    const walk = (root, options = {}) => {
        const extensions = new Set(options.extensions || [...DEFAULT_EXTENSIONS]);
        const ignores = new Set([...DEFAULT_IGNORES, ...(options.ignore || [])]);
        const maxFileBytes = Math.max(1024, Number(options.maxFileBytes || 2 * 1024 * 1024));
        const files = [];
        const stack = [root];
        while (stack.length) {
            const current = stack.pop();
            let entries;
            try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch (_) { continue; }
            for (const entry of entries) {
                if (ignores.has(entry.name)) continue;
                const full = path.join(current, entry.name);
                if (entry.isDirectory()) { stack.push(full); continue; }
                if (!entry.isFile()) continue;
                if (!extensions.has(path.extname(entry.name).toLowerCase())) continue;
                let stat;
                try { stat = fs.statSync(full); } catch (_) { continue; }
                if (stat.size > maxFileBytes) continue;
                files.push(full);
            }
        }
        return files.sort();
    };

    const classifyScope = relative => {
        const p = '/' + normalizePath(relative).toLowerCase() + '/';
        if (p.includes('/site_files/js/') || p.includes('/site_files/html/') || p.includes('/public/js/')) return 'client';
        return 'server';
    };

    const scanText = (text, relative, maps) => {
        const scope = classifyScope(relative);
        const scan = (regex, target, mapper) => {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(text))) {
                addUsage(target, mapper(match), relative, lineOf(text, match.index), scope);
                if (match[0].length === 0) regex.lastIndex++;
            }
        };

        // Capture nested paths because Smart Code uses APIs such as
        // site.security.getUserFinger and site.path.join in addition to site.get().
        scan(/\bsite((?:\.[A-Za-z_$][\w$]*){1,4})/g, maps.site, m => m[1].slice(1));
        scan(/\bres((?:\.[A-Za-z_$][\w$]*){1,3})/g, maps.res, m => m[1].slice(1));
        scan(/\breq((?:\.[A-Za-z_$][\w$]*){1,4})/g, maps.req, m => m[1].slice(1));

        // iSite-specific legacy prototype helpers used heavily by Smart Code.
        scan(/\.((?:like|contains|test))\s*\(/g, maps.prototype, m => m[1]);

        const collectionVars = new Set();
        let match;
        const assign = /(?:\b(?:const|let|var)\s+)?([A-Za-z_$][\w$]*)\s*=\s*site\.connectCollection\s*\(/g;
        while ((match = assign.exec(text))) collectionVars.add(match[1]);

        for (const variable of collectionVars) {
            const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const methodRe = new RegExp(escaped + '\\.([A-Za-z_$][\\w$]*)\\s*\\(', 'g');
            scan(methodRe, maps.collection, m => m[1]);
        }

        // Direct chains: site.connectCollection(...).findMany(...)
        scan(/site\.connectCollection\s*\([^;\n]*?\)\s*\.([A-Za-z_$][\w$]*)\s*\(/g, maps.collection, m => m[1]);
    };

    const resolvePath = (target, dotted) => {
        let value = target;
        for (const part of String(dotted || '').split('.').filter(Boolean)) {
            if (value == null || !(part in Object(value))) return { exists: false, value: undefined };
            value = value[part];
        }
        return { exists: true, value };
    };

    const uniqueRootApis = rows => [...new Set(rows.filter(x => x.serverCount > 0).map(row => row.name.split('.')[0]))].sort();

    const scanProject = function (root, options = {}) {
        root = path.resolve(String(root || ''));
        if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
            const error = new Error('project directory not found: ' + root);
            error.code = 'ISITE_COMPAT_PROJECT_NOT_FOUND';
            throw error;
        }

        const files = walk(root, options);
        const maps = { site: new Map(), res: new Map(), req: new Map(), collection: new Map(), prototype: new Map() };
        const parseErrors = [];
        let bytes = 0;
        for (const file of files) {
            let text;
            try {
                text = fs.readFileSync(file, 'utf8');
                bytes += Buffer.byteLength(text);
            } catch (error) {
                parseErrors.push({ file: normalizePath(path.relative(root, file)), error: String(error.message || error) });
                continue;
            }
            scanText(text, normalizePath(path.relative(root, file)), maps);
        }

        const usage = {
            site: serializeUsage(maps.site),
            res: serializeUsage(maps.res),
            req: serializeUsage(maps.req),
            collection: serializeUsage(maps.collection),
            prototype: serializeUsage(maps.prototype),
        };

        return {
            version: 1,
            generatedAt: new Date().toISOString(),
            root,
            filesScanned: files.length,
            bytesScanned: bytes,
            parseErrors,
            usage,
            summary: {
                siteApis: usage.site.filter(x => x.serverCount > 0).length,
                responseApis: usage.res.filter(x => x.serverCount > 0).length,
                requestApis: usage.req.filter(x => x.serverCount > 0).length,
                collectionApis: usage.collection.filter(x => x.serverCount > 0).length,
                prototypeHelpers: usage.prototype.filter(x => x.serverCount > 0).length,
                siteRootApis: uniqueRootApis(usage.site),
            },
        };
    };

    const compareUsage = function (expected, actual) {
        const categories = ['site', 'res', 'req', 'collection', 'prototype'];
        const missing = [];
        const added = [];
        for (const category of categories) {
            const a = new Set((expected?.usage?.[category] || []).filter(x => x.serverCount > 0).map(x => x.name));
            const b = new Set((actual?.usage?.[category] || []).filter(x => x.serverCount > 0).map(x => x.name));
            for (const name of a) if (!b.has(name)) missing.push({ category, name });
            for (const name of b) if (!a.has(name)) added.push({ category, name });
        }
        return { ok: missing.length === 0, missing, added };
    };

    const verifyProject = function (root, options = {}) {
        const report = scanProject(root, options);
        const missingSite = [];
        const customSite = [];
        for (const row of report.usage.site.filter(x => x.serverCount > 0)) {
            const result = resolvePath(site, row.name);
            if (!result.exists) customSite.push(row.name);
        }

        // Verify all observed collection method names against a real collection wrapper.
        // connectCollection() itself remains lazy and does not contact MongoDB here.
        let collection = null;
        try { collection = site.connectCollection({ collection: '__isite_compat__', db: '__isite_compat__' }); } catch (_) {}
        const missingCollection = [];
        if (collection) {
            for (const row of report.usage.collection.filter(x => x.serverCount > 0)) {
                if (typeof collection[row.name] === 'undefined') missingCollection.push(row.name);
            }
        }

        const required = Array.isArray(options.requiredSiteApis) ? options.requiredSiteApis : [];
        for (const name of required) {
            if (!resolvePath(site, name).exists && !missingSite.includes(name)) missingSite.push(name);
        }

        const requiredCollections = Array.isArray(options.requiredCollectionApis) ? options.requiredCollectionApis : [];
        if (collection) {
            for (const name of requiredCollections) {
                if (typeof collection[name] === 'undefined' && !missingCollection.includes(name)) missingCollection.push(name);
            }
        }

        const requiredResponse = Array.isArray(options.requiredResponseApis) ? options.requiredResponseApis : [];
        const requiredRequest = Array.isArray(options.requiredRequestApis) ? options.requiredRequestApis : [];
        const requiredPrototype = Array.isArray(options.requiredPrototypeHelpers) ? options.requiredPrototypeHelpers : [];
        const observedResponse = new Set(report.usage.res.filter(x => x.serverCount > 0).map(x => x.name));
        const observedRequest = new Set(report.usage.req.filter(x => x.serverCount > 0).map(x => x.name));
        const observedPrototype = new Set(report.usage.prototype.filter(x => x.serverCount > 0).map(x => x.name));
        const missingObservedResponse = requiredResponse.filter(name => !observedResponse.has(name));
        const missingObservedRequest = requiredRequest.filter(name => !observedRequest.has(name));
        const missingObservedPrototype = requiredPrototype.filter(name => !observedPrototype.has(name));

        const result = {
            ok: missingSite.length === 0 && missingCollection.length === 0 && report.parseErrors.length === 0 && missingObservedResponse.length === 0 && missingObservedRequest.length === 0 && missingObservedPrototype.length === 0,
            report,
            missingSite,
            missingCollection,
            missingObservedResponse,
            missingObservedRequest,
            missingObservedPrototype,
            // Smart Code adds many site.* helpers from its apps. They are reported but are
            // not treated as missing iSite APIs unless explicitly listed as required.
            customOrProjectSiteApis: customSite.sort(),
        };
        if (options.assert && !result.ok) {
            const error = new Error('iSite project compatibility verification failed');
            error.code = 'ISITE_PROJECT_COMPAT_MISMATCH';
            error.result = result;
            throw error;
        }
        return result;
    };

    const writeProjectManifest = function (root, output, options = {}) {
        const report = scanProject(root, options);
        const file = path.resolve(String(output));
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
        return file;
    };

    site.compat = site.compat || {};
    site.compat.scanProject = scanProject;
    site.compat.verifyProject = verifyProject;
    site.compat.compareProjectUsage = compareUsage;
    site.compat.writeProjectManifest = writeProjectManifest;

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.compatibility = {
                projectScanner: true,
                namedContracts: typeof site.compat.check === 'function',
            };
            return out;
        };
    }

    return { version: 'v11', projectCompatibility: true };
};

return module.exports; })();

const coreV15 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

const fs = require('node:fs');
const path = require('node:path');

module.exports = function initCoreV15(site) {
    site.compat = site.compat || {};

    const valueType = value => Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;

    const captureSurface = function (target, options = {}) {
        target = target || {};
        const includeNonEnumerable = options.includeNonEnumerable === true;
        const keys = includeNonEnumerable ? Object.getOwnPropertyNames(target) : Object.keys(target);
        keys.sort();
        const entries = {};
        const functionKeys = [];

        for (const key of keys) {
            let value;
            try {
                value = target[key];
            } catch (_) {
                entries[key] = { type: 'getter-error' };
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(target, key) || {};
            const row = {
                type: valueType(value),
                enumerable: !!descriptor.enumerable,
                writable: !!descriptor.writable,
                configurable: !!descriptor.configurable,
            };
            if (typeof value === 'function') {
                row.arity = value.length;
                functionKeys.push(key);
            }
            entries[key] = row;
        }

        const aliases = [];
        const consumed = new Set();
        for (const key of functionKeys) {
            if (consumed.has(key)) continue;
            let value;
            try { value = target[key]; } catch (_) { continue; }
            const group = functionKeys.filter(other => {
                try { return target[other] === value; } catch (_) { return false; }
            }).sort();
            for (const item of group) consumed.add(item);
            if (group.length > 1) aliases.push(group);
        }
        aliases.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        return { entries, aliases };
    };

    const compareCaptured = function (expected, actual, options = {}) {
        expected = expected || { entries: {}, aliases: [] };
        actual = actual || { entries: {}, aliases: [] };
        const missing = [];
        const changedType = [];
        const arityChanged = [];
        const descriptorChanged = [];
        const brokenAliases = [];

        for (const [key, before] of Object.entries(expected.entries || {})) {
            const now = actual.entries?.[key];
            if (!now) {
                missing.push(key);
                continue;
            }
            if (before.type !== now.type) {
                changedType.push({ key, expected: before.type, actual: now.type });
                continue;
            }
            if (before.type === 'function' && Number(before.arity) !== Number(now.arity)) {
                arityChanged.push({ key, expected: before.arity, actual: now.arity });
            }
            for (const field of ['enumerable', 'writable', 'configurable']) {
                if (before[field] !== undefined && before[field] !== now[field]) {
                    descriptorChanged.push({ key, field, expected: before[field], actual: now[field] });
                }
            }
        }

        // Alias identity matters for legacy code that compares function references or
        // monkey-patches one alias expecting the others to reference the same function.
        for (const group of expected.aliases || []) {
            const present = group.filter(name => actual.entries?.[name]);
            if (present.length < group.length) continue; // already reported as missing
            const matchingGroup = (actual.aliases || []).some(now => group.every(name => now.includes(name)));
            if (!matchingGroup) brokenAliases.push(group.slice());
        }

        const breaking = missing.length + changedType.length + brokenAliases.length;
        const strictArity = options.checkArity === true;
        const strictDescriptors = options.checkDescriptors === true;
        const ok = breaking === 0 && (!strictArity || arityChanged.length === 0) && (!strictDescriptors || descriptorChanged.length === 0);
        return {
            ok,
            breaking: { missing, changedType, brokenAliases },
            warnings: { arityChanged, descriptorChanged },
            counts: {
                expected: Object.keys(expected.entries || {}).length,
                actual: Object.keys(actual.entries || {}).length,
                missing: missing.length,
                changedType: changedType.length,
                brokenAliases: brokenAliases.length,
                arityChanged: arityChanged.length,
                descriptorChanged: descriptorChanged.length,
            },
        };
    };

    site.compat.captureSurface = captureSurface;
    site.compat.compareSurface = function (expected, target, options = {}) {
        const actual = target && target.entries ? target : captureSurface(target || site, options);
        return compareCaptured(expected, actual, options);
    };
    site.compat.assertSurface = function (expected, target, options = {}) {
        const result = this.compareSurface(expected, target, options);
        if (!result.ok) {
            const error = new Error('iSite legacy API surface compatibility mismatch');
            error.code = 'ISITE_LEGACY_SURFACE_MISMATCH';
            error.details = result;
            throw error;
        }
        return result;
    };

    const resolveManifest = input => {
        if (!input) return null;
        if (typeof input === 'string') {
            const file = path.resolve(input);
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
        return input;
    };

    site.compat.captureFrameworkSurface = function (options = {}) {
        const namespaces = Array.isArray(options.namespaces) ? options.namespaces : [
            'routing', 'fsm', 'mongodb', 'words', 'security', 'sessions', 'staticAssets',
            'responseCache', 'mongoTelemetry', 'mongoBudget', 'query', 'queryPlan', 'compat',
            'events', 'hooks', 'scheduler', 'workers', 'metrics', 'diagnostics', 'memory',
            'resources', 'trace', 'stream', 'featuresV3', 'context', 'abort', 'leaks', 'validate', 'async', 'requestTelemetry', 'requestAbort', 'httpPlan'
        ];
        let collection = options.collection || null;
        if (!collection && typeof site.connectCollection === 'function') {
            try { collection = site.connectCollection({ collection: '__isite_compat__', db: '__isite_compat__' }); } catch (_) {}
        }
        const out = {
            version: 1,
            frameworkVersion: site.package?.version || null,
            generatedAt: new Date().toISOString(),
            site: captureSurface(site, options),
            collection: collection ? captureSurface(collection, options) : null,
            namespaces: {},
        };
        for (const name of namespaces) {
            const value = site[name];
            if (value && (typeof value === 'object' || typeof value === 'function')) out.namespaces[name] = captureSurface(value, options);
        }
        return out;
    };

    site.compat.compareFrameworkSurface = function (manifestInput, options = {}) {
        const expected = resolveManifest(manifestInput);
        if (!expected) {
            const error = new Error('iSite compatibility manifest is required');
            error.code = 'ISITE_COMPAT_MANIFEST_REQUIRED';
            throw error;
        }
        const current = this.captureFrameworkSurface({
            ...options,
            namespaces: Object.keys(expected.namespaces || {}),
        });
        const result = {
            ok: true,
            site: compareCaptured(expected.site, current.site, options),
            collection: expected.collection && current.collection ? compareCaptured(expected.collection, current.collection, options) : null,
            namespaces: {},
            missingNamespaces: [],
            expectedVersion: expected.frameworkVersion || null,
            currentVersion: current.frameworkVersion || null,
        };
        if (!result.site.ok) result.ok = false;
        if (expected.collection && (!result.collection || !result.collection.ok)) result.ok = false;
        for (const [name, before] of Object.entries(expected.namespaces || {})) {
            const now = current.namespaces[name];
            if (!now) {
                result.missingNamespaces.push(name);
                result.ok = false;
                continue;
            }
            result.namespaces[name] = compareCaptured(before, now, options);
            if (!result.namespaces[name].ok) result.ok = false;
        }
        return result;
    };

    site.compat.assertFrameworkSurface = function (manifestInput, options = {}) {
        const result = this.compareFrameworkSurface(manifestInput, options);
        if (!result.ok) {
            const error = new Error('iSite framework compatibility baseline mismatch');
            error.code = 'ISITE_FRAMEWORK_COMPAT_MISMATCH';
            error.details = result;
            throw error;
        }
        return result;
    };

    site.compat.writeFrameworkManifest = function (output, options = {}) {
        const file = path.resolve(String(output));
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(this.captureFrameworkSurface(options), null, 2) + '\n', 'utf8');
        return file;
    };

    // Generic semantic probes let every application protect behavior that a simple
    // API-name/type manifest cannot describe. Nothing runs automatically in production.
    const probes = new Map();
    site.compat.probes = site.compat.probes || {};
    site.compat.probes.add = function (name, fn) {
        if (typeof fn !== 'function') throw new TypeError('compatibility probe must be a function');
        probes.set(String(name), fn);
        return () => probes.delete(String(name));
    };
    site.compat.probes.remove = function (name) { return probes.delete(String(name)); };
    site.compat.probes.list = function () { return [...probes.keys()]; };
    site.compat.probes.clear = function () { probes.clear(); };
    site.compat.probes.run = async function (options = {}) {
        const only = options.names ? new Set(options.names.map(String)) : null;
        const results = [];
        for (const [name, fn] of probes) {
            if (only && !only.has(name)) continue;
            const started = process.hrtime.bigint();
            try {
                const value = await fn(site);
                results.push({ name, ok: value !== false, value, ms: Number(process.hrtime.bigint() - started) / 1e6 });
            } catch (error) {
                results.push({ name, ok: false, error: String(error?.message || error), code: error?.code, ms: Number(process.hrtime.bigint() - started) / 1e6 });
            }
        }
        const failed = results.filter(x => !x.ok);
        const result = { ok: failed.length === 0, total: results.length, passed: results.length - failed.length, failed: failed.length, results };
        if (options.assert && !result.ok) {
            const error = new Error('iSite semantic compatibility probes failed');
            error.code = 'ISITE_COMPAT_PROBE_FAILED';
            error.details = result;
            throw error;
        }
        return result;
    };

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.compatibility = {
                ...(out.compatibility || {}),
                legacySurfaceGuard: true,
                semanticProbes: probes.size,
                projectScanner: typeof site.compat.scanProject === 'function',
            };
            return out;
        };
    }

    return { version: 'v15', legacySurfaceGuard: true };
};

return module.exports; })();

const coreV16 = (() => { const module = { exports: {} }; const exports = module.exports;
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

return module.exports; })();

const coreV17 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV17(site) {
    const { performance } = require('node:perf_hooks');

    // ------------------------------------------------------------------
    // Request telemetry / slow-resource attribution. Observational by
    // default and bounded in memory. No legacy route behavior is changed.
    // ------------------------------------------------------------------
    const rows = [];
    let maxEntries = 2000;
    let slowMs = 250;
    let enabled = false;
    const active = new Map();
    const stats = { total: 0, completed: 0, aborted: 0, slow: 0, dropped: 0 };

    const now = () => performance.now();
    const ctx = () => {
        try { return site.context?.get?.() || null; } catch (_) { return null; }
    };
    const trim = () => {
        while (rows.length > maxEntries) { rows.shift(); stats.dropped++; }
    };
    const normalizeError = error => error ? {
        name: error.name || 'Error',
        message: String(error.message || error),
        code: error.code || null,
    } : null;

    site.requestTelemetry = {
        begin(req, res, options = {}) {
            if (!enabled && options.force !== true) return null;
            const context = options.context || ctx();
            const id = String(options.id || context?.requestId || context?.id || `${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
            const row = {
                id,
                contextId: context?.id || null,
                requestId: context?.requestId || id,
                method: String(req?.method || options.method || ''),
                url: String(req?.url || options.url || ''),
                host: String(req?.headers?.host || options.host || ''),
                startedAt: Date.now(),
                startedPerf: now(),
                status: null,
                ms: 0,
                bytesIn: 0,
                bytesOut: 0,
                aborted: false,
                error: null,
                phases: [],
                resources: [],
                meta: options.meta ? { ...options.meta } : {},
            };
            active.set(id, row);
            stats.total++;
            if (req && !req.requestId) req.requestId = row.requestId;
            return id;
        },
        mark(idOrName, nameOrData, maybeData) {
            let id = idOrName;
            let name = nameOrData;
            let data = maybeData;
            if (!active.has(String(idOrName))) {
                const context = ctx();
                id = context?.requestId || context?.id;
                name = idOrName;
                data = nameOrData;
            }
            const row = active.get(String(id || ''));
            if (!row) return null;
            const phase = { name: String(name || 'mark'), atMs: now() - row.startedPerf };
            if (data !== undefined) phase.data = data;
            row.phases.push(phase);
            return phase;
        },
        resource(input = {}) {
            const context = ctx();
            const id = String(input.requestId || context?.requestId || context?.id || '');
            const row = active.get(id);
            if (!row) return null;
            const item = {
                type: String(input.type || 'resource'),
                name: String(input.name || input.operation || ''),
                ms: Math.max(0, Number(input.ms) || 0),
            };
            if (input.collection != null) item.collection = String(input.collection);
            if (input.status != null) item.status = Number(input.status);
            if (input.error) item.error = normalizeError(input.error);
            if (input.meta) item.meta = input.meta;
            row.resources.push(item);
            return item;
        },
        end(id, input = {}) {
            const key = String(id || ctx()?.requestId || ctx()?.id || '');
            const row = active.get(key);
            if (!row) return null;
            active.delete(key);
            row.ms = Math.max(0, now() - row.startedPerf);
            delete row.startedPerf;
            row.status = input.status != null ? Number(input.status) : row.status;
            row.bytesIn = input.bytesIn != null ? Number(input.bytesIn) || 0 : row.bytesIn;
            row.bytesOut = input.bytesOut != null ? Number(input.bytesOut) || 0 : row.bytesOut;
            row.aborted = Boolean(input.aborted || row.aborted);
            row.error = input.error ? normalizeError(input.error) : row.error;
            row.finishedAt = Date.now();
            rows.push(row);
            trim();
            stats.completed++;
            if (row.aborted) stats.aborted++;
            if (row.ms >= slowMs) stats.slow++;
            return row;
        },
        recent(limit = 100, filter = {}) {
            limit = Math.max(1, Number(limit || 100));
            let list = rows;
            if (filter.method) list = list.filter(x => x.method === String(filter.method));
            if (filter.minMs != null) list = list.filter(x => x.ms >= Number(filter.minMs));
            if (filter.aborted != null) list = list.filter(x => x.aborted === Boolean(filter.aborted));
            if (filter.url) list = list.filter(x => x.url.includes(String(filter.url)));
            return list.slice(-limit);
        },
        slow(options = {}) {
            const minMs = Number(options.minMs == null ? slowMs : options.minMs);
            const limit = Math.max(1, Number(options.limit || 100));
            return rows.filter(x => x.ms >= minMs).sort((a, b) => b.ms - a.ms).slice(0, limit);
        },
        report(options = {}) {
            const groups = new Map();
            for (const row of rows) {
                const route = options.normalizeUrl === false ? row.url : row.url.replace(/\?.*$/, '').replace(/\/\d+(?=\/|$)/g, '/:id');
                const key = `${row.method}\0${route}`;
                let g = groups.get(key);
                if (!g) groups.set(key, (g = { method: row.method, route, count: 0, totalMs: 0, maxMs: 0, aborted: 0, errors: 0, resourcesMs: 0 }));
                g.count++; g.totalMs += row.ms; g.maxMs = Math.max(g.maxMs, row.ms);
                if (row.aborted) g.aborted++;
                if (row.error) g.errors++;
                for (const resource of row.resources) g.resourcesMs += resource.ms || 0;
            }
            return [...groups.values()].map(g => ({ ...g, avgMs: g.count ? g.totalMs / g.count : 0 })).sort((a, b) => b.totalMs - a.totalMs);
        },
        attribution(id) {
            const row = active.get(String(id)) || rows.find(x => x.id === String(id) || x.requestId === String(id));
            if (!row) return null;
            const byType = {};
            for (const r of row.resources || []) {
                const key = r.type || 'resource';
                const g = byType[key] || (byType[key] = { count: 0, totalMs: 0, maxMs: 0 });
                g.count++; g.totalMs += r.ms || 0; g.maxMs = Math.max(g.maxMs, r.ms || 0);
            }
            return { requestId: row.requestId, totalMs: row.ms || Math.max(0, now() - row.startedPerf), byType, resources: row.resources.slice() };
        },
        configure(options = {}) {
            if (options.enabled != null) enabled = Boolean(options.enabled);
            if (options.maxEntries != null) maxEntries = Math.max(100, Number(options.maxEntries) || 2000);
            if (options.slowMs != null) slowMs = Math.max(0, Number(options.slowMs) || 0);
            trim();
            return this.stats();
        },
        clear() { const n = rows.length; rows.length = 0; return n; },
        isEnabled() { return enabled; },
        stats() { return { ...stats, enabled, active: active.size, entries: rows.length, maxEntries, slowMs }; },
        _active: active,
    };

    // ------------------------------------------------------------------
    // Request-bound AbortSignal helper. Attaches only new properties and
    // never cancels legacy work by itself. Consumers opt in by using signal.
    // ------------------------------------------------------------------
    site.requestAbort = {
        attach(req, res, options = {}) {
            if (!req) return null;
            if (req.$isiteAbortController) return req.$isiteAbortController;
            const controller = site.abort?.create ? site.abort.create({ signal: options.signal }) : new AbortController();
            Object.defineProperty(req, '$isiteAbortController', { value: controller, configurable: true, enumerable: false });
            if (req.signal == null) req.signal = controller.signal;
            if (req.abortSignal == null) req.abortSignal = controller.signal;
            let finished = false;
            const abort = reason => {
                if (finished || controller.signal.aborted) return;
                controller.abort(reason);
            };
            const onAborted = () => abort(Object.assign(new Error('HTTP request aborted by client'), { name: 'AbortError', code: 'ISITE_HTTP_ABORTED' }));
            const onFinish = () => { finished = true; cleanup(); controller.cleanup?.(); };
            const onClose = () => {
                if (!finished && !res?.writableEnded) abort(Object.assign(new Error('HTTP connection closed'), { name: 'AbortError', code: 'ISITE_HTTP_CLOSED' }));
                cleanup(); controller.cleanup?.();
            };
            const cleanup = () => {
                req.off?.('aborted', onAborted);
                res?.off?.('finish', onFinish);
                res?.off?.('close', onClose);
            };
            req.once?.('aborted', onAborted);
            res?.once?.('finish', onFinish);
            res?.once?.('close', onClose);
            return controller;
        },
        get(req) { return req?.$isiteAbortController || null; },
        signal(req) { return req?.signal || req?.abortSignal || req?.$isiteAbortController?.signal || null; },
    };

    // ------------------------------------------------------------------
    // Compiled execution plans for new code. Nothing is injected into the
    // legacy routing chain. Steps may be sync/async and are abort-aware.
    // ------------------------------------------------------------------
    site.httpPlan = {
        compile(steps, options = {}) {
            const list = (Array.isArray(steps) ? steps : []).map((step, index) => {
                if (typeof step === 'function') return { name: step.name || `step-${index + 1}`, run: step };
                if (!step || typeof step.run !== 'function') throw new TypeError(`Invalid HTTP plan step at index ${index}`);
                return { ...step, name: step.name || `step-${index + 1}` };
            });
            const plan = async function (req, res, initial = {}) {
                const signal = options.signal || site.requestAbort.signal(req);
                let state = initial;
                for (const step of list) {
                    site.abort?.throwIfAborted?.(signal);
                    const started = now();
                    state = await step.run(req, res, state, signal);
                    site.requestTelemetry?.mark?.(`plan:${step.name}`, { ms: now() - started });
                    if (state && state.stop === true) break;
                }
                return state;
            };
            plan.steps = list.map(x => x.name);
            plan.describe = () => ({ name: options.name || null, steps: plan.steps.slice() });
            return plan;
        },
        run(steps, req, res, initial, options) { return this.compile(steps, options)(req, res, initial); },
    };

    // Correlate Mongo telemetry with the active request without changing
    // Mongo operation results or timing behavior.
    if (site.mongoTelemetry && typeof site.mongoTelemetry.record === 'function' && !site.mongoTelemetry.$v17Wrapped) {
        const original = site.mongoTelemetry.record.bind(site.mongoTelemetry);
        site.mongoTelemetry.record = function (input = {}) {
            const context = ctx();
            const contextId = input.contextId ?? context?.id ?? null;
            const requestId = input.requestId ?? context?.requestId ?? context?.id ?? null;
            const row = original({ ...input, contextId, requestId });
            if (row && typeof row === 'object') {
                if (row.contextId == null) row.contextId = contextId;
                if (row.requestId == null) row.requestId = requestId;
            }
            site.requestTelemetry?.resource?.({
                requestId: row?.requestId || context?.requestId || context?.id,
                type: 'mongo',
                name: row?.operation || input.operation,
                collection: row?.collection || input.collection,
                ms: row?.ms ?? input.ms,
                error: input.error,
            });
            return row;
        };
        Object.defineProperty(site.mongoTelemetry, '$v17Wrapped', { value: true, enumerable: false });
    }

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.requestTelemetry = site.requestTelemetry.stats();
            return out;
        };
    }

    return { version: 'v17', requestTelemetry: site.requestTelemetry, requestAbort: site.requestAbort, httpPlan: site.httpPlan };
};

return module.exports; })();

const coreV18 = (() => { const module = { exports: {} }; const exports = module.exports;
'use strict';

module.exports = function initCoreV18(site) {
    // Mongo query-shape execution aggregation. Observability only: this module
    // never changes a filter, pipeline, index, read preference, or legacy API.
    const rows = new Map();
    let maxShapes = 4000;
    let slowMs = 100;

    const scalarType = value => {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (value instanceof Date) return 'date';
        if (Buffer.isBuffer(value)) return 'buffer';
        return typeof value;
    };

    const shapeValue = (value, depth = 0) => {
        if (depth > 12) return '<depth>';
        if (Array.isArray(value)) {
            if (!value.length) return ['<empty>'];
            // Preserve structure/type, never user values.
            const sample = value.slice(0, 4).map(v => shapeValue(v, depth + 1));
            return ['<array>', ...sample];
        }
        if (!value || typeof value !== 'object' || value instanceof Date || Buffer.isBuffer(value)) {
            return `<${scalarType(value)}>`;
        }
        const out = {};
        for (const key of Object.keys(value).sort()) {
            out[key] = shapeValue(value[key], depth + 1);
        }
        return out;
    };

    const pipelineShape = pipeline => (Array.isArray(pipeline) ? pipeline : []).map(stage => shapeValue(stage));
    const stable = value => {
        if (site.stableKey) return site.stableKey('mongo-shape-v18', value);
        return JSON.stringify(value);
    };

    const fieldsFromFilter = (obj, prefix = '', out = []) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
        for (const key of Object.keys(obj)) {
            if (key.startsWith('$')) {
                const value = obj[key];
                if (Array.isArray(value)) value.forEach(v => fieldsFromFilter(v, prefix, out));
                else if (value && typeof value === 'object') fieldsFromFilter(value, prefix, out);
                continue;
            }
            const name = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                const keys = Object.keys(value);
                const operatorOnly = keys.length > 0 && keys.every(k => k.startsWith('$'));
                if (!operatorOnly) {
                    fieldsFromFilter(value, name, out);
                    continue;
                }
            }
            out.push(name);
        }
        return out;
    };

    const normalizedSort = sort => {
        if (!sort || typeof sort !== 'object' || Array.isArray(sort)) return [];
        return Object.entries(sort)
            .filter(([key]) => !String(key).startsWith('$'))
            .map(([key, direction]) => [String(key), Number(direction) < 0 ? -1 : 1]);
    };

    const describe = (collection, operation, input = {}) => {
        const where = input.where || input.filter || {};
        const sort = input.sort || {};
        const pipeline = input.arr || input.pipeline || [];
        const descriptor = {
            collection: String(collection || 'unknown'),
            operation: String(operation || 'unknown'),
            where: shapeValue(where),
            sort: normalizedSort(sort),
            pipeline: pipelineShape(pipeline),
            projection: input.select ? Object.keys(input.select).sort() : [],
            hasSkip: Number(input.skip || 0) > 0,
            hasLimit: input.limit != null,
        };
        descriptor.key = stable(descriptor);
        descriptor.whereFields = [...new Set(fieldsFromFilter(where))].sort();
        return descriptor;
    };

    const trim = () => {
        while (rows.size > maxShapes) {
            let oldestKey = null;
            let oldest = Infinity;
            for (const [key, row] of rows) {
                if (row.lastSeen < oldest) { oldest = row.lastSeen; oldestKey = key; }
            }
            if (oldestKey == null) break;
            rows.delete(oldestKey);
        }
    };

    const ensure = descriptor => {
        let row = rows.get(descriptor.key);
        if (!row) {
            row = {
                key: descriptor.key,
                collection: descriptor.collection,
                operation: descriptor.operation,
                whereFields: descriptor.whereFields,
                sortFields: descriptor.sort,
                projectionFields: descriptor.projection,
                pipeline: descriptor.pipeline,
                hasSkip: descriptor.hasSkip,
                hasLimit: descriptor.hasLimit,
                count: 0,
                completed: 0,
                errors: 0,
                slow: 0,
                totalMs: 0,
                maxMs: 0,
                totalReturned: 0,
                docsExamined: 0,
                keysExamined: 0,
                collScans: 0,
                lastSeen: Date.now(),
            };
            rows.set(descriptor.key, row);
            trim();
        }
        return row;
    };

    const publicRow = row => ({
        ...row,
        avgMs: row.completed ? row.totalMs / row.completed : 0,
        avgReturned: row.completed ? row.totalReturned / row.completed : 0,
        scanRatio: row.totalReturned ? row.docsExamined / row.totalReturned : row.docsExamined,
        keyRatio: row.totalReturned ? row.keysExamined / row.totalReturned : row.keysExamined,
    });

    site.mongoShapes = {
        fingerprint(collection, operation, input = {}) { return describe(collection, operation, input); },
        begin(collection, operation, input = {}) {
            const descriptor = describe(collection, operation, input);
            const row = ensure(descriptor);
            row.count++;
            row.lastSeen = Date.now();
            return descriptor;
        },
        end(shape, execution = {}) {
            if (!shape) return null;
            const descriptor = typeof shape === 'string' ? { key: shape } : shape;
            const row = rows.get(descriptor.key);
            if (!row) return null;
            const ms = Number(execution.ms || 0);
            const nReturned = Number(execution.nReturned || 0);
            const docsExamined = Number(execution.docsExamined || 0);
            const keysExamined = Number(execution.keysExamined || 0);
            row.completed++;
            row.totalMs += Number.isFinite(ms) ? Math.max(0, ms) : 0;
            row.maxMs = Math.max(row.maxMs, Number.isFinite(ms) ? ms : 0);
            row.totalReturned += Number.isFinite(nReturned) ? Math.max(0, nReturned) : 0;
            row.docsExamined += Number.isFinite(docsExamined) ? Math.max(0, docsExamined) : 0;
            row.keysExamined += Number.isFinite(keysExamined) ? Math.max(0, keysExamined) : 0;
            if (execution.error) row.errors++;
            if (ms >= slowMs) row.slow++;
            if (String(execution.stage || '').toUpperCase() === 'COLLSCAN') row.collScans++;
            row.lastSeen = Date.now();
            return publicRow(row);
        },
        get(key) { const row = rows.get(String(key)); return row ? publicRow(row) : null; },
        report(options = {}) {
            const minCount = Math.max(1, Number(options.minCount || 1));
            const limit = Math.max(1, Number(options.limit || 100));
            let list = [...rows.values()].filter(row => row.count >= minCount).map(publicRow);
            if (options.collection) list = list.filter(row => row.collection === String(options.collection));
            if (options.operation) list = list.filter(row => row.operation === String(options.operation));
            return list.sort((a, b) => (b.totalMs - a.totalMs) || (b.maxMs - a.maxMs) || (b.count - a.count)).slice(0, limit);
        },
        slow(options = {}) {
            const threshold = Number(options.minMs == null ? slowMs : options.minMs);
            return this.report({ ...options, limit: options.limit || 1000 })
                .filter(row => row.maxMs >= threshold || row.avgMs >= threshold)
                .slice(0, Math.max(1, Number(options.limit || 100)));
        },
        recommend(options = {}) {
            const minCount = Math.max(1, Number(options.minCount || 2));
            const limit = Math.max(1, Number(options.limit || 50));
            const candidates = this.report({ minCount, limit: Math.max(limit * 5, 100) });
            const out = [];
            for (const row of candidates) {
                // Aggregation pipelines need pipeline-aware analysis; do not guess an index.
                if (row.pipeline && row.pipeline.length && !row.whereFields.length) continue;
                const index = {};
                for (const field of row.whereFields) if (!(field in index)) index[field] = 1;
                for (const [field, dir] of row.sortFields || []) if (!(field in index)) index[field] = dir;
                if (!Object.keys(index).length) continue;
                const impact = row.totalMs * Math.max(1, Math.log2(row.count + 1));
                const reasons = [];
                if (row.collScans) reasons.push('COLLSCAN observed');
                if (row.scanRatio >= Number(options.scanRatio || 10)) reasons.push(`high scan ratio ${row.scanRatio.toFixed(1)}`);
                if (row.avgMs >= Number(options.slowMs == null ? slowMs : options.slowMs)) reasons.push(`avg ${row.avgMs.toFixed(1)}ms`);
                if (!reasons.length && row.count >= Math.max(10, minCount)) reasons.push('frequent query shape');
                out.push({
                    collection: row.collection,
                    operation: row.operation,
                    shapeKey: row.key,
                    index,
                    count: row.count,
                    avgMs: row.avgMs,
                    maxMs: row.maxMs,
                    scanRatio: row.scanRatio,
                    impact,
                    reasons,
                    automatic: false,
                });
            }
            return out.sort((a, b) => b.impact - a.impact).slice(0, limit);
        },
        configure(options = {}) {
            if (options.maxShapes != null) maxShapes = Math.max(100, Number(options.maxShapes) || 4000);
            if (options.slowMs != null) slowMs = Math.max(0, Number(options.slowMs) || 0);
            trim();
            return this.stats();
        },
        clear() { const count = rows.size; rows.clear(); return count; },
        stats() {
            let completed = 0, errors = 0, slow = 0, executions = 0;
            for (const row of rows.values()) { executions += row.count; completed += row.completed; errors += row.errors; slow += row.slow; }
            return { shapes: rows.size, executions, completed, errors, slow, maxShapes, slowMs };
        },
    };

    // Opt-in explain sampling helper. It does not run by itself and never
    // creates indexes. The caller supplies an explain loader, making it usable
    // for find/count/aggregate without coupling old APIs to explain().
    site.mongoShapes.sampleExplain = async function (collection, operation, input, loader) {
        if (typeof loader !== 'function') throw new TypeError('mongoShapes.sampleExplain requires a loader function');
        const shape = this.begin(collection, operation, input || {});
        const started = process.hrtime.bigint();
        try {
            const explain = await loader();
            const extracted = site.mongoTelemetry?.extractExplain ? site.mongoTelemetry.extractExplain(explain) : {};
            const ms = Number(process.hrtime.bigint() - started) / 1e6;
            this.end(shape, { ...extracted, ms });
            return { shapeKey: shape.key, explain, execution: extracted };
        } catch (error) {
            const ms = Number(process.hrtime.bigint() - started) / 1e6;
            this.end(shape, { ms, error });
            throw error;
        }
    };

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.mongoShapes = site.mongoShapes.stats();
            return out;
        };
    }

    return { version: 'v18', mongoShapes: site.mongoShapes };
};

return module.exports; })();

module.exports = { diagnostics, coreV3, coreV4, coreV5, coreV6, coreV7, coreV8, coreV9, coreV10, coreV11, coreV15, coreV16, coreV17, coreV18 };
