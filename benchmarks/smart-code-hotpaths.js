'use strict';
const { performance } = require('node:perf_hooks');

const protoSite = { options: { proto: { object: true, array: true } }, toJson: JSON.stringify };
require('../object-options/lib/prototype.js')(protoSite);

function legacyRemoveRefObject(obj) {
    const seen = new Set();
    const recurse = (obj) => {
        seen.add(obj, true);
        for (let [k, v] of Object.entries(obj)) {
            if (k !== '_id') {
                if (v && typeof v == 'object') {
                    if (seen.has(v)) delete obj[k];
                    else recurse(v);
                }
            }
        }
        return obj;
    };
    return recurse(obj);
}

function v13RemoveRefObject(obj) {
    const seen = new Set();
    const recurse = (value) => {
        seen.add(value);
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (key === '_id') continue;
            const child = value[key];
            if (child && typeof child === 'object') {
                if (seen.has(child)) delete value[key];
                else recurse(child);
            }
        }
        return value;
    };
    return recurse(obj);
}

function legacyContentType(value) {
    let b = value;
    if (!b.contains('charset=utf-8')) b += '; charset=utf-8';
    return b.toLowerCase();
}
function v13ContentType(value) {
    let type = String(value || '');
    if (!type.toLowerCase().includes('charset=utf-8')) type += '; charset=utf-8';
    return type.toLowerCase();
}

function legacyFingerDate() {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0));
}
let fingerCache = { value: 0, expiresAt: 0 };
function v13FingerDate() {
    const now = Date.now();
    if (!fingerCache.value || now >= fingerCache.expiresAt) {
        const d = new Date(now);
        fingerCache.value = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
        fingerCache.expiresAt = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    }
    return new Date(fingerCache.value);
}

function makePayload(i) {
    return {
        done: true,
        id: i,
        user: { id: i, name: 'User ' + i, profile: { active: true, score: i % 100 } },
        list: Array.from({ length: 8 }, (_, n) => ({ id: n, value: 'value-' + n, ok: true })),
        meta: { page: 1, limit: 20, total: 1000 }
    };
}

function bench(name, iterations, fn) {
    for (let i = 0; i < Math.min(1000, iterations); i++) fn(i);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn(i);
    const ms = performance.now() - start;
    const opsPerSec = iterations / (ms / 1000);
    console.log(`${name}: ${opsPerSec.toFixed(0)} ops/s (${ms.toFixed(2)} ms)`);
    return { name, iterations, ms, opsPerSec };
}

const legacyJson = bench('smartcode-json-clean-legacy', 100000, (i) => JSON.stringify(legacyRemoveRefObject(makePayload(i))));
const v13Json = bench('smartcode-json-clean-v13', 100000, (i) => JSON.stringify(v13RemoveRefObject(makePayload(i))));
const legacyCt = bench('content-type-legacy-equivalent', 1000000, () => legacyContentType('application/json'));
const v13Ct = bench('content-type-v13-fastpath', 1000000, () => v13ContentType('application/json'));
const legacyFinger = bench('user-finger-date-legacy', 500000, () => legacyFingerDate());
const v13Finger = bench('user-finger-date-v13', 500000, () => v13FingerDate());

console.log(`json-clean-speedup: ${(v13Json.opsPerSec / legacyJson.opsPerSec).toFixed(2)}x`);
console.log(`content-type-speedup: ${(v13Ct.opsPerSec / legacyCt.opsPerSec).toFixed(2)}x`);
console.log(`user-finger-date-speedup: ${(v13Finger.opsPerSec / legacyFinger.opsPerSec).toFixed(2)}x`);
