'use strict';
const fs = require('node:fs');
const { performance } = require('node:perf_hooks');

const protoSite = { options: { proto: { object: true, array: true } }, toJson: JSON.stringify };
require('../object-options/lib/prototype.js')(protoSite);

const site = {
    strings: Array.from({ length: 30 }, (_, i) => 's' + i), on() {},
    options: { public: true, require: { features: [], permissions: [] }, defaults: { features: [], permissions: [] }, help: false },
    fs, dir: process.cwd(), escapeRegExp: protoSite.escapeRegExp, log() {}, fsm: { off() {} }, path: require('node:path')
};
const routing = require('../lib/routing.js')(site);
const ROUTES = 5000;
for (let i = 0; i < ROUTES; i++) routing.list.push({ name: '/api/route-' + i, method: 'GET', map: [], count: 0 });
routing.list.push({ name: '/users/*/detail', method: 'GET', map: [], count: 0 });
routing.invalidateIndex();
routing.rebuildIndex();

function bench(name, fn, iterations) {
    for (let i = 0; i < 1000; i++) fn(i);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn(i);
    const ms = performance.now() - start;
    return { name, iterations, ms, opsPerSec: iterations / (ms / 1000) };
}

const target = '/api/route-4999';
const legacy = bench('legacy-linear-router', () => routing.list.find((r) => target.like(r.name) && 'GET'.like(r.method)), 200);
const indexed = bench('indexed-router', () => routing.findRoute(target, 'GET'), 100000);
const dynamic = bench('indexed-dynamic-router', (i) => routing.findRoute('/users/' + i + '/detail', 'GET'), 50000);
const like = bench('cached-like', () => 'Social Browser'.like('social*|other'), 200000);
const contains = bench('fast-contains', () => 'Social Browser'.contains('browser|missing'), 500000);

const results = [legacy, indexed, dynamic, like, contains];
for (const r of results) console.log(`${r.name}: ${r.opsPerSec.toFixed(0)} ops/s (${r.ms.toFixed(2)} ms)`);
console.log(`router-speedup-vs-linear: ${(indexed.opsPerSec / legacy.opsPerSec).toFixed(1)}x`);
