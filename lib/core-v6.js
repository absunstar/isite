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
