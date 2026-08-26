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
