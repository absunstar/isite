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
