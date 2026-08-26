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
            'resources', 'trace', 'stream', 'featuresV3', 'context', 'abort', 'leaks', 'validate', 'async'
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
