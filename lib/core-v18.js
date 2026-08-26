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
