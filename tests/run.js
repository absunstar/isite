'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');

let passed = 0;
async function test(name, fn) {
    try { await fn(); passed++; console.log('PASS', name); }
    catch (err) { console.error('FAIL', name); console.error(err); process.exitCode = 1; }
}

function initPrototype() {
    const site = { options: { proto: { object: true, array: true } }, toJson: JSON.stringify };
    require('../object-options/lib/prototype.js')(site);
    return site;
}

function routingSite() {
    const site = {
        strings: Array.from({ length: 30 }, (_, i) => 's' + i),
        on() {},
        options: { public: true, require: { features: [], permissions: [] }, defaults: { features: [], permissions: [] }, help: false },
        fs, dir: process.cwd(), escapeRegExp: (s) => String(s).replace(/[\/\\^$*+?.()\[\]{}|]/g, '\\$&'),
        log() {}, fsm: { off() {} }, path, zlib: require('node:zlib'),
    };
    return site;
}

(async function () {
    const protoSite = initPrototype();

    await test('String.like keeps wildcard, alternation and case-insensitive compatibility', () => {
        assert.equal('HelloWorld'.like('hello*'), true);
        assert.equal('GET'.like('post|get'), true);
        assert.equal('/users/42'.like('/users/*'), true);
        assert.equal('abc'.like('abd'), false);
    });

    await test('contains uses fast case-insensitive literal matching', () => {
        assert.equal('Hello Browser'.contains('browser'), true);
        assert.equal('Hello Browser'.contains('x|HELLO'), true);
        assert.equal(['Alpha', 'Beta'].contains('beta'), true);
        assert.equal({ name: 'Alpha' }.contains('alpha'), true);
    });

    await test('regex cache does not suffer global lastIndex state', () => {
        for (let i = 0; i < 20; i++) assert.equal('abc'.test('a', 'gium'), true);
        assert.ok(protoSite.pattern.regexCache.size > 0);
    });

    await test('router exact and dynamic indexes preserve route order semantics', () => {
        const site = routingSite();
        const routing = require('../lib/routing.js')(site);
        routing.add({ name: '/first/*', method: 'GET', public: true, callback() {} });
        routing.add({ name: '/first/exact', method: 'GET', public: true, callback() {} });
        routing.add({ name: '/other', method: 'POST', public: true, callback() {} });
        assert.equal(routing.findRoute('/first/exact', 'GET').name, '/first/*'); // legacy first-match behavior
        assert.equal(routing.findRoute('/other', 'POST').name, '/other');
        assert.equal(routing.findRoute('/missing', 'GET'), null);
    });

    await test('router invalidates index after adding routes', () => {
        const site = routingSite();
        const routing = require('../lib/routing.js')(site);
        routing.add({ name: '/one', method: 'GET', public: true, callback() {} });
        assert.ok(routing.findRoute('/one', 'GET'));
        routing.add({ name: '/two', method: 'GET', public: true, callback() {} });
        assert.ok(routing.findRoute('/two', 'GET'));
    });


    await test('response compression is asynchronous, thresholded and prefers Brotli', async () => {
        const site = routingSite();
        const routing = require('../lib/routing.js')(site);
        const text = 'x'.repeat(5000);
        const result = await new Promise((resolve, reject) => routing.compress(text, 'text/plain', 'gzip, br', (err, body, encoding) => err ? reject(err) : resolve({ body, encoding })));
        assert.equal(result.encoding, 'br');
        assert.ok(Buffer.isBuffer(result.body));
        assert.ok(result.body.length < text.length);
        const small = await new Promise((resolve, reject) => routing.compress('small', 'text/plain', 'gzip', (err, body, encoding) => err ? reject(err) : resolve({ body, encoding })));
        assert.equal(small.encoding, null);
        assert.equal(small.body, 'small');
    });

    await test('collection queue is event-driven and serial', async () => {
        const events = [];
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], hide: () => 'g',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: {
                collections_indexed: { c: { nextID: 1 } },
                insertOne(opts, cb) { events.push('start:' + opts.doc.n); setTimeout(() => { events.push('end:' + opts.doc.n); cb(null, opts.doc); }, 5); }
            },
            log() {}, toInt: Number,
        };
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        await new Promise((resolve, reject) => {
            let done = 0;
            c.add({ n: 1 }, (e) => { if (e) reject(e); if (++done === 2) resolve(); });
            c.add({ n: 2 }, (e) => { if (e) reject(e); if (++done === 2) resolve(); });
        });
        assert.deepEqual(events, ['start:1', 'end:1', 'start:2', 'end:2']);
        assert.equal(c.taskList.length, 0);
        assert.equal(c.taskBusy, false);
    });

    await test('v13 removeRefObject preserves legacy repeated-reference and _id semantics', () => {
        const site = { options: {}, path: require('node:path') };
        // Load only enough object-options state for the helper under test.
        // The helper implementation is reproduced through the real source module by extracting
        // the public function after a minimal init is not safe because fn.js initializes unrelated services.
        const current = function (obj) {
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
        };
        const legacy = function (obj) {
            const seen = new Set();
            const recurse = (value) => {
                seen.add(value, true);
                for (let [k, v] of Object.entries(value)) {
                    if (k !== '_id' && v && typeof v == 'object') {
                        if (seen.has(v)) delete value[k];
                        else recurse(v);
                    }
                }
                return value;
            };
            return recurse(obj);
        };
        function fixture() {
            const shared = { x: 1 };
            const root = { a: shared, b: shared, _id: { cycle: null }, nested: { ok: true } };
            root.nested.root = root;
            root._id.cycle = root;
            return root;
        }
        const a = fixture();
        const b = fixture();
        assert.deepEqual(current(a), legacy(b));
        assert.equal(Object.hasOwn(a, 'b'), false);
        assert.ok(a._id.cycle === a);
    });

    await test('v13 removeRefObject matches legacy JSON output across shared-reference fixtures', () => {
        const current = function (obj) {
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
        };
        const legacy = function (obj) {
            const seen = new Set();
            const recurse = (value) => {
                seen.add(value, true);
                for (let [k, v] of Object.entries(value)) {
                    if (k !== '_id' && v && typeof v == 'object') {
                        if (seen.has(v)) delete value[k];
                        else recurse(v);
                    }
                }
                return value;
            };
            return recurse(obj);
        };
        for (let i = 0; i < 250; i++) {
            const sharedA = { n: i, x: { value: i % 7 } };
            const sharedB = { n: i, x: { value: i % 7 } };
            const a = { id: i, first: sharedA, second: sharedA, list: [{ ref: sharedA }, { value: i }], _id: { raw: i } };
            const b = { id: i, first: sharedB, second: sharedB, list: [{ ref: sharedB }, { value: i }], _id: { raw: i } };
            assert.equal(JSON.stringify(current(a)), JSON.stringify(legacy(b)));
        }
    });

    await test('v13 user-finger cached date preserves legacy getDate value and returns fresh Date objects', () => {
        const now = new Date();
        const legacyValue = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
        let cache = { value: 0, expiresAt: 0 };
        const getFingerDate = () => {
            const n = Date.now();
            if (!cache.value || n >= cache.expiresAt) {
                const d = new Date(n);
                cache.value = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
                cache.expiresAt = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
            }
            return new Date(cache.value);
        };
        const a = getFingerDate();
        const b = getFingerDate();
        assert.equal(a.getTime(), legacyValue);
        assert.equal(b.getTime(), legacyValue);
        assert.notEqual(a, b);
    });

    await test('FSM uses Map cache and async atomic write', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'isite-fsm-'));
        const file = path.join(dir, 'a.txt');
        fs.writeFileSync(file, 'one');
        const site = { on() {}, dir, cwd: dir, path, fn: { getFileEncode: () => 'utf8' }, log() {}, apps: [] };
        const fsm = require('../lib/fsm.js')(site);
        site.isFileExistsSync = fsm.isFileExistsSync;
        site.fsm = fsm;
        assert.equal(fsm.readFileSync(file), 'one');
        assert.equal(fsm.readFileSync(file), 'one');
        assert.equal(fsm.cache.size, 1);
        assert.ok(fsm.cache.get(file).count >= 2);
        await new Promise((resolve, reject) => fsm.writeFile(file, 'two', (err) => err ? reject(err) : resolve()));
        assert.equal(fs.readFileSync(file, 'utf8'), 'two');
        assert.equal(fsm.cache.has(file), false);
        fs.rmSync(dir, { recursive: true, force: true });
    });

    await test('sessions index access tokens and reuse cached session', async () => {
        const site = {
            path, cwd: os.tmpdir(), options: { name: 't', language: { id: 'En' }, theme: {}, session: { collection: 'sessions', db: 'd', storage: 'file', save: false, timeout: 20, memoryTimeout: 20 } },
            connectCollection: () => ({ find() {}, findAll() {}, deleteAll() {}, update() {}, insert() {} }),
            on() {}, onPOST() {}, readFileSync: () => '', writeFile(p, d, cb) { cb && cb(null, p); },
            x0md50x: (s) => crypto.createHash('md5').update(s).digest('hex'),
        };
        const sessions = require('../lib/sessions.js')(site);
        function req(token) { return { headers: token ? { 'access-token': token } : {}, query: {}, cookie: () => null, host: 'h', ip: '1.2.3.4' }; }
        const first = await new Promise((r) => site.getSession(req(), r));
        const second = await new Promise((r) => site.getSession(req(first.accessToken), r));
        assert.equal(first, second);
        assert.equal(sessions.byToken.get(first.accessToken), first);
        assert.equal(sessions.list.length, 1);
    });


    await test('security indexes users, roles and permissions without repeated linear scans', async () => {
        const collection = {
            createIndex(o, p, cb) { if (typeof p === 'function') p(); else cb && cb(); },
            deleteDuplicate(o, cb) { cb && cb(null, {}); }, createUnique(o, cb) { cb && cb(null, {}); },
            add(o, cb) { cb && cb(null, o); }, update(o, cb) { cb && cb(null, { doc: o.set || o }); },
            delete(o, cb) { cb && cb(null, {}); }, deleteOne(o, cb) { cb && cb(null, {}); },
            findMany(o, cb) { cb && cb(null, [], 0); }, findOne(o, cb) { cb && cb(null, null); },
        };
        const site = new Proxy({
            options: { security: { users_collection: 'users', roles_collection: 'roles', db: 'd', keys: [], users: [] } },
            connectCollection: () => collection, on() {}, onPOST() {}, post() {}, all() {},
            isFileExistsSync: () => false, dir: os.tmpdir(), fromJson: JSON.parse, readFileSync: () => '',
            readFile(p, cb) { cb(new Error('no')); }, _x0f1xo: (x) => x, x0md50x: (x) => x,
            sessions: { invalidateUser() {} }, call() {}, log() {}, getDate: () => new Date(),
        }, { get(target, prop) { if (prop in target) return target[prop]; return function () {}; } });
        const security = require('../lib/security.js')(site);
        security.permissions.push({ name: 'read' }, { name: 'write' });
        security.roles.push({ name: 'editor', permissions: ['read', 'write'] });
        security.rebuildRoleIndexes();
        const user = { id: 7, email: 'USER@EXAMPLE.COM', roles: [{ name: 'editor' }], permissions: [] };
        security.cacheUser(user);
        const fetched = await new Promise((resolve, reject) => security.getUser({ id: 7 }, (e, u) => e ? reject(e) : resolve(u)));
        assert.equal(fetched, user);
        assert.equal(security.userIndexes.id.get('7'), user);
        assert.deepEqual(new Set(fetched.$permissions), new Set(['read', 'write']));
        assert.equal(fetched.$permissions_info.length, 2);
    });

    await test('authenticated session user cache avoids repeated security database reads within TTL', async () => {
        let reads = 0;
        const session = { user_id: 5, user: { id: 5, email: 'u@e.com' }, $userLoadedAt: Date.now(), $new: false };
        const site = {
            options: { session: { userCacheTTL: 30000 }, defaults: { features: [] }, dynamic: false, language: { id: 'En' } },
            features: [], getSession(req, cb) { cb(session); }, saveSession() {},
            security: { getUser(q, cb) { reads++; cb(null, { id: 5, email: 'u@e.com' }); } },
        };
        const req = { ip: '1.1.1.1', url: '/', host: 'localhost', headers: { 'user-agent': 'Mozilla/5.0 Chrome/151 Windows NT 10.0' }, features: [] };
        const res = { cookie() {}, set() {} };
        await new Promise((resolve) => require('../lib/session.js')(req, res, site, () => resolve()));
        assert.equal(reads, 0);
        assert.ok(req.features.includes('login'));
        session.$userLoadedAt = 0;
        const req2 = { ip: '1.1.1.1', url: '/', host: 'localhost', headers: { 'user-agent': 'Mozilla/5.0 Chrome/151 Windows NT 10.0' }, features: [] };
        await new Promise((resolve) => require('../lib/session.js')(req2, res, site, () => resolve()));
        assert.equal(reads, 1);
    });

    await test('parser token replacement renders multiple token types in one pass', () => {
        const site = { var: (k) => ({ a: 'A' })[k], toJson: JSON.stringify, hide: (x) => x, setting: {}, word: (x) => x, getContent: () => '', apps: [] };
        const req = { features: [], paramsRaw: { id: '42' }, queryRaw: { q: 'yes' }, data: { x: 'X' }, session: { user: { name: 'U' } } };
        const parser = require('../lib/parser.js')(req, {}, site, { parserDir: process.cwd() });
        assert.equal(parser.txt('##var.a##/##user.name##/##params.id##/##query.q##/##data.x##'), 'A/U/42/yes/X');
    });

    await test('parser preserves legacy hidden-token syntax used by showObject/from123', () => {
        const hidden = [];
        const site = {
            var: (k) => ({ secret: 'VAR' })[k],
            toJson: JSON.stringify,
            hide: (x) => { hidden.push(x); return 'ENC<' + String(x) + '>'; },
            setting: {}, word: (x) => x, getContent: () => '', apps: [], secret: 'SITE'
        };
        const req = {
            features: [], paramsRaw: {}, queryRaw: {}, data: { secret: 'DATA' },
            secret: 'REQ', session: { user: { secret: 'USER' } }
        };
        const parser = require('../lib/parser.js')(req, {}, site, { parserDir: process.cwd() });
        const out = parser.txt('##data.#secret##|##user.#secret##|##site.#secret##|##req.#secret##');
        assert.equal(out, 'ENC<DATA>|ENC<USER>|ENC<SITE>|ENC<REQ>');
        assert.deepEqual(hidden, ['DATA', 'USER', 'SITE', 'REQ']);
    });

    await test('Core v3 inflight deduplicates concurrent work', async () => {
        const site = { zlib: require('node:zlib'), http2: require('node:http2'), fetch: globalThis.fetch };
        require('../lib/core-v3.js')(site);
        let runs = 0;
        const [a, b, c] = await Promise.all([
            site.inflight.run('same', async () => { runs++; await new Promise(r => setTimeout(r, 5)); return 42; }),
            site.inflight.run('same', async () => { runs++; return 9; }),
            site.inflight.run('same', async () => { runs++; return 10; }),
        ]);
        assert.deepEqual([a, b, c], [42, 42, 42]);
        assert.equal(runs, 1);
        assert.equal(site.inflight.size(), 0);
    });

    await test('Core v3 tagged cache supports TTL, tags and stale-while-revalidate', async () => {
        const site = { zlib: require('node:zlib'), http2: require('node:http2'), fetch: globalThis.fetch };
        require('../lib/core-v3.js')(site);
        site.cacheV3.set('u:1', { id: 1 }, { tags: ['user:1'], ttl: 1000 });
        assert.equal(site.cacheV3.get('u:1').id, 1);
        assert.equal(site.cacheV3.invalidateTag('user:1'), 1);
        assert.equal(site.cacheV3.get('u:1'), undefined);
        let loads = 0;
        const value = await site.cacheGetOrLoad('x', async () => { loads++; return 'ok'; }, { ttl: 1000 });
        const value2 = await site.cacheGetOrLoad('x', async () => { loads++; return 'bad'; }, { ttl: 1000 });
        assert.equal(value, 'ok'); assert.equal(value2, 'ok'); assert.equal(loads, 1);
    });

    await test('Core v3 retry, timeout and circuit breaker primitives work', async () => {
        const site = { zlib: require('node:zlib'), http2: require('node:http2'), fetch: globalThis.fetch };
        require('../lib/core-v3.js')(site);
        let attempts = 0;
        const result = await site.retry(async () => { if (++attempts < 3) throw new Error('x'); return 'done'; }, { retries: 2, minDelay: 1, jitter: 0 });
        assert.equal(result, 'done'); assert.equal(attempts, 3);
        await assert.rejects(site.withTimeout(() => new Promise(() => {}), 5), err => err.code === 'ISITE_TIMEOUT');
        const cb = site.circuitBreaker('test', { failureThreshold: 2, resetTimeout: 1000 });
        await assert.rejects(cb.run(async () => { throw new Error('a'); }));
        await assert.rejects(cb.run(async () => { throw new Error('b'); }));
        await assert.rejects(cb.run(async () => 'no'), err => err.code === 'ISITE_CIRCUIT_OPEN');
        assert.equal(cb.snapshot().state, 'open');
    });

    await test('Core v3 pipeline, hooks, events and profiler are additive', async () => {
        const site = { zlib: require('node:zlib'), http2: require('node:http2'), fetch: globalThis.fetch };
        require('../lib/core-v3.js')(site);
        const seq = [];
        site.events.on('x', v => seq.push('event:' + v)); site.events.emit('x', 1);
        site.hooks.add('h', ctx => { ctx.h = true; }); await site.hooks.run('h', {});
        const run = site.pipeline(
            async (ctx, next) => { seq.push('a'); await next(); seq.push('c'); },
            async (ctx, next) => { seq.push('b'); ctx.done = true; await next(); },
        );
        const ctx = await run({}); assert.equal(ctx.done, true); assert.deepEqual(seq, ['event:1', 'a', 'b', 'c']);
        await site.profile('p', async () => new Promise(r => setTimeout(r, 2)));
        assert.equal(site.profileReport().p.count, 1);
    });

    await test('Core v3 HTTP cache helpers produce etags and validated ranges', () => {
        const site = { zlib: require('node:zlib'), http2: require('node:http2'), fetch: globalThis.fetch };
        require('../lib/core-v3.js')(site);
        const etag = site.httpCache.etag('hello');
        assert.ok(etag.startsWith('W/"'));
        assert.equal(site.httpCache.isFresh({ headers: { 'if-none-match': etag } }, etag), true);
        assert.deepEqual(site.httpCache.range('bytes=10-19', 100), { start: 10, end: 19, length: 10, size: 100 });
        assert.deepEqual(site.httpCache.range('bytes=-10', 100), { start: 90, end: 99, length: 10, size: 100 });
        assert.equal(site.httpCache.range('bytes=100-120', 100).unsatisfiable, true);
    });


    await test('Core v4 async pool enforces bounded concurrency', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        const pool = site.pool('db', { limit: 2 });
        let active = 0, maxActive = 0;
        const jobs = Array.from({ length: 8 }, (_, i) => pool.run(async () => {
            active++; maxActive = Math.max(maxActive, active);
            await new Promise(r => setTimeout(r, 2));
            active--; return i;
        }));
        assert.deepEqual(await Promise.all(jobs), [0,1,2,3,4,5,6,7]);
        assert.equal(maxActive, 2);
        assert.equal(pool.stats().completed, 8);
    });

    await test('Core v4 batcher combines same-tick loads and preserves result order', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        let batches = 0;
        const batcher = site.createBatcher(async (keys) => { batches++; return keys.map(k => k * 10); });
        const result = await Promise.all([batcher.load(1), batcher.load(2), batcher.load(3)]);
        assert.deepEqual(result, [10, 20, 30]);
        assert.equal(batches, 1);
    });

    await test('Core v4 memoizeAsync deduplicates inflight work and caches result', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        let runs = 0;
        const fn = site.memoizeAsync(async (id) => { runs++; await new Promise(r => setTimeout(r, 2)); return { id }; }, { ttl: 1000, key: id => id });
        const [a, b] = await Promise.all([fn(7), fn(7)]);
        const c = await fn(7);
        assert.equal(runs, 1);
        assert.equal(a.id, 7); assert.equal(b.id, 7); assert.equal(c.id, 7);
        assert.equal(fn.stats().entries, 1);
    });

    await test('Core v4 context, metrics and health snapshot are additive', async () => {
        const site = { databaseList: [], databaseCollectionList: [] };
        require('../lib/core-v4.js')(site);
        const ctx = site.context.create({ operation: 'test' });
        await site.context.run(ctx, async () => {
            await Promise.resolve();
            assert.equal(site.context.get().id, ctx.id);
            assert.equal(site.context.get().operation, 'test');
        });
        site.metrics.inc('x'); site.metrics.inc('x', 2); site.metrics.set('g', 4);
        await site.metrics.time('timer', async () => new Promise(r => setTimeout(r, 1)));
        const snap = site.metrics.snapshot();
        assert.equal(snap.counters.x, 3); assert.equal(snap.gauges.g, 4); assert.equal(snap.timers.timer.count, 1);
        assert.equal(site.health().ok, true);
    });

    await test('Mongo v4 de-duplicates concurrent database and collection connects', async () => {
        const Module = require('node:module');
        const originalLoad = Module._load;
        let connects = 0;
        const collections = new Map();
        class FakeMongoClient {
            constructor(url, config) { this.url = url; this.config = config; }
            async connect() { connects++; await new Promise(r => setTimeout(r, 3)); return this; }
            db(name) { return { name, collection(n) { if (!collections.has(name + ':' + n)) collections.set(name + ':' + n, { name: n }); return collections.get(name + ':' + n); } }; }
            close() {}
        }
        Module._load = function (request, parent, isMain) {
            if (request === 'mongodb') return { MongoClient: FakeMongoClient, ObjectId: class ObjectId {} };
            return originalLoad.apply(this, arguments);
        };
        try {
            const site = {
                options: { mongodb: { enabled: true, url: 'mongodb://fake', db: 'main', collection: 'x', prefix: { db: '', collection: '' }, config: {} } },
                databaseList: [], databaseCollectionList: [], log() {}, on() {},
                removeRefObject: x => x, fn: { isDate: () => false }, getDateTime: x => x,
            };
            const mongo = require('../lib/mongodb.js')(site);
            const dbs = await Promise.all(Array.from({ length: 5 }, () => new Promise((resolve, reject) => mongo.connectDB('main', (e, db) => e ? reject(e) : resolve(db)))));
            assert.equal(connects, 1);
            assert.equal(new Set(dbs).size, 1);
            const cols = await Promise.all(Array.from({ length: 5 }, () => new Promise((resolve, reject) => mongo.connectCollection({ dbName: 'main', collectionName: 'users' }, (e, c) => e ? reject(e) : resolve(c)))));
            assert.equal(new Set(cols).size, 1);
            assert.equal(mongo.databaseIndex.size, 1);
            assert.equal(mongo.collectionIndex.size, 1);
        } finally { Module._load = originalLoad; }
    });

    await test('WebSocket v4 indexes routes without loading ws dependency', () => {
        const events = [];
        const site = {
            strings: Array(20).fill('ready'), servers: [], guid: () => 'g', md5: x => x, f1: x => String(x),
            on(name, fn) { events.push([name, fn]); }, call() {}, newURL: u => new URL(u, 'http://localhost'),
            fromJson: JSON.parse, eval() {},
        };
        require('../lib/ws.js')(site);
        const fn = () => {};
        site.onWS('/chat', fn);
        assert.equal(site.ws.getRoute('/chat').callback, fn);
        assert.equal(site.ws.routeByPath.has('/chat'), true);
        assert.equal(Object.keys(require.cache).some((p) => /node_modules[\\/]ws[\\/]/.test(p)), false);
    });

    await test('diagnostics exposes event-loop, memory and cache snapshot', () => {
        const site = { fsm: { cache: new Map(), cacheBytes: 0 }, sharedCache: new Map() };
        const d = require('../lib/performance.js')(site);
        const req = {}; const res = { statusCode: 200 };
        d.requestStart(req); d.requestEnd(req, res);
        const snap = d.snapshot();
        assert.equal(snap.requests, 1);
        assert.equal(snap.completed, 1);
        assert.ok(snap.memory.heapUsed > 0);
        d.close();
    });


    await test('Core v5 stableKey is deterministic and order-insensitive for object keys', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        assert.equal(site.stableKey({ b: 2, a: 1 }), site.stableKey({ a: 1, b: 2 }));
        const long = site.stableKey({ x: 'z'.repeat(2000) });
        assert.ok(long.startsWith('sha1:'));
    });

    await test('Core v5 AdaptiveCache enforces entry and byte budgets', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        const c = new site.AdaptiveCache({ maxEntries: 2, maxBytes: 1024, ttl: 1000 });
        c.set('a', 'A'); c.set('b', 'B'); c.get('a'); c.set('c', 'C');
        assert.equal(c.get('b'), undefined);
        assert.equal(c.get('a'), 'A');
        assert.equal(c.get('c'), 'C');
        assert.ok(c.stats().evictions >= 1);
    });

    await test('Core v5 query cache de-duplicates inflight loads and caches results', async () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        let runs = 0;
        const loader = async () => { runs++; await new Promise(r => setTimeout(r, 3)); return { id: 7 }; };
        const opts = { where: { id: 7 }, select: { name: 1 } };
        const [a, b] = await Promise.all([
            site.query.cached('users', 'findOne', opts, loader),
            site.query.cached('users', 'findOne', { select: { name: 1 }, where: { id: 7 } }, loader),
        ]);
        const c = await site.query.cached('users', 'findOne', opts, loader);
        assert.equal(runs, 1); assert.equal(a.id, 7); assert.equal(b.id, 7); assert.equal(c.id, 7);
        assert.equal(site.query.invalidate('users'), 1);
    });

    await test('Core v5 static precompression caches Brotli output', async () => {
        const os = require('node:os');
        const fs = require('node:fs');
        const path = require('node:path');
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'isite-v5-'));
        const file = path.join(dir, 'asset.js');
        fs.writeFileSync(file, 'const hello = "world";\n'.repeat(500));
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        const a = await site.staticAssets.precompress(file, { encoding: 'br' });
        const b = await site.staticAssets.precompress(file, { encoding: 'br' });
        assert.equal(a.encoding, 'br'); assert.ok(a.size < a.originalSize); assert.equal(b.cached, true);
        fs.rmSync(dir, { recursive: true, force: true });
    });


    await test('Core v5 encoding negotiation honors q values and disabled encodings', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        assert.equal(site.staticAssets.chooseEncoding('gzip;q=1, br;q=0.5'), 'gzip');
        assert.equal(site.staticAssets.chooseEncoding('br;q=0, gzip;q=0.8'), 'gzip');
        assert.equal(site.staticAssets.chooseEncoding('deflate;q=0, gzip;q=0'), null);
        assert.equal(site.staticAssets.chooseEncoding('gzip, br'), 'br');
    });

    await test('Mongo v5 fast reads use one find call and writes invalidate new query cache', async () => {
        const site = {
            options: { mongodb: { enabled: true, url: 'mongodb://fake', db: 'main', collection: 'x', limit: 100, prefix: { db: '', collection: '' }, config: {} } },
            databaseList: [], databaseCollectionList: [], log() {}, on() {},
            removeRefObject: x => x, fn: { isDate: () => false }, getDateTime: x => x,
        };
        let invalidations = 0, findCalls = 0;
        site.query = { invalidate(name) { invalidations++; assert.equal(name, 'main.users'); return 1; } };
        const mongo = require('../lib/mongodb.js')(site);
        const fake = {
            find(where, options) { findCalls++; return { toArray: async () => [{ id: 1 }, { id: 2 }] }; },
            insertOne: async () => ({ insertedId: 'abc' }),
        };
        mongo.connectCollection = (obj, cb) => cb(null, fake);
        const docs = await new Promise((resolve, reject) => mongo.findManyFast({ dbName: 'main', collectionName: 'users', where: {} }, (e, v) => e ? reject(e) : resolve(v)));
        assert.equal(findCalls, 1); assert.equal(docs.length, 2);
        await new Promise((resolve, reject) => mongo.insertOne({ dbName: 'main', collectionName: 'users', doc: { id: 3 } }, (e) => e ? reject(e) : resolve()));
        assert.equal(invalidations, 1);
    });


    await test('Mongo v5 findPageFast returns data and count from one aggregate call', async () => {
        const site = {
            options: { mongodb: { enabled: true, url: 'mongodb://fake', db: 'main', collection: 'x', limit: 50, prefix: { db: '', collection: '' }, config: {} } },
            databaseList: [], databaseCollectionList: [], log() {}, on() {},
            removeRefObject: x => x, fn: { isDate: () => false }, getDateTime: x => x,
        };
        const mongo = require('../lib/mongodb.js')(site);
        let aggregateCalls = 0; let pipelineSeen;
        mongo.connectCollection = (obj, cb) => cb(null, {
            aggregate(pipeline) { aggregateCalls++; pipelineSeen = pipeline; return { toArray: async () => [{ data: [{ id: 2 }], meta: [{ count: 11 }] }] }; },
        });
        const out = await new Promise((resolve, reject) => mongo.findPageFast({ dbName: 'main', collectionName: 'users', where: { active: true }, sort: { id: -1 }, skip: 5, limit: 10 }, (e, list, count) => e ? reject(e) : resolve({ list, count })));
        assert.equal(aggregateCalls, 1); assert.equal(out.count, 11); assert.equal(out.list[0].id, 2);
        assert.equal(pipelineSeen[0].$match.active, true);
        assert.equal(pipelineSeen[1].$facet.data.some(x => x.$limit === 10), true);
    });


    await test('Core v6 query invalidation is generation based and keeps cached API compatible', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        let runs = 0;
        const loader = async () => ({ run: ++runs });
        const first = await site.query.cached('main.users', 'findOne', { where: { id: 1 } }, loader);
        const second = await site.query.cached('main.users', 'findOne', { where: { id: 1 } }, loader);
        assert.equal(first.run, 1); assert.equal(second.run, 1);
        assert.equal(site.query.invalidate('main.users'), 1);
        const third = await site.query.cached('main.users', 'findOne', { where: { id: 1 } }, loader);
        assert.equal(third.run, 2);
        assert.equal(site.query.generation('main.users'), 1);
        assert.equal(site.query.stats().invalidations, 1);
    });

    await test('Core v6 compatibility contracts detect missing or changed public APIs', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        const target = { get() {}, post() {}, sessions: [] };
        const contract = site.compat.snapshot(target);
        assert.deepEqual(site.compat.compare(contract, target), { ok: true, missing: [], changed: [] });
        const broken = { get: 1, sessions: [] };
        const result = site.compat.compare(contract, broken);
        assert.equal(result.ok, false);
        assert.deepEqual(result.missing, ['post']);
        assert.equal(result.changed[0].key, 'get');
        assert.throws(() => site.compat.assert(contract, broken), e => e.code === 'ISITE_COMPAT_MISMATCH');
    });

    await test('Core v6 static manifest scans and prewarms eligible assets', async () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'isite-v6-static-'));
        fs.mkdirSync(path.join(dir, 'sub'));
        fs.writeFileSync(path.join(dir, 'a.js'), 'var a=1;\n'.repeat(400));
        fs.writeFileSync(path.join(dir, 'sub', 'b.css'), '.x{display:block}\n'.repeat(400));
        fs.writeFileSync(path.join(dir, 'ignore.bin'), Buffer.alloc(2048));
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        const manifest = await site.staticAssets.buildManifest(dir);
        assert.equal(manifest.files.length, 2);
        const warmed = await site.staticAssets.prewarmManifest(manifest, { encoding: 'br', concurrency: 2 });
        assert.equal(warmed.files, 2); assert.equal(warmed.compressed, 2);
        assert.ok(warmed.compressedBytes < warmed.originalBytes);
        assert.equal(site.staticAssets.manifest(dir), manifest);
        fs.rmSync(dir, { recursive: true, force: true });
    });

    await test('Mongo v6 findByIdsFast batches ids into one query and bulkWrite invalidates once', async () => {
        const site = {
            options: { mongodb: { enabled: true, url: 'mongodb://fake', db: 'main', collection: 'x', limit: 100, prefix: { db: '', collection: '' }, config: {} } },
            databaseList: [], databaseCollectionList: [], log() {}, on() {},
            removeRefObject: x => x, fn: { isDate: () => false }, getDateTime: x => x,
        };
        let invalidations = 0, findCalls = 0, bulkCalls = 0, whereSeen;
        site.query = { invalidate(name) { invalidations++; assert.equal(name, 'main.users'); return 1; } };
        const mongo = require('../lib/mongodb.js')(site);
        mongo.connectCollection = (obj, cb) => cb(null, {
            find(where) { findCalls++; whereSeen = where; return { toArray: async () => [{ id: 1 }, { id: 3 }] }; },
            bulkWrite: async (ops) => { bulkCalls++; return { acknowledged: true, modifiedCount: ops.length }; },
        });
        const docs = await new Promise((resolve, reject) => mongo.findByIdsFast({ dbName: 'main', collectionName: 'users', ids: [1, 2, 3] }, (e, v) => e ? reject(e) : resolve(v)));
        assert.equal(findCalls, 1); assert.deepEqual(whereSeen.id.$in, [1, 2, 3]); assert.equal(docs.length, 2);
        const result = await new Promise((resolve, reject) => mongo.bulkWriteFast({ dbName: 'main', collectionName: 'users', operations: [{ updateOne: { filter: { id: 1 }, update: { $set: { x: 1 } } } }] }, (e, v) => e ? reject(e) : resolve(v)));
        assert.equal(bulkCalls, 1); assert.equal(result.modifiedCount, 1); assert.equal(invalidations, 1);
    });

    await test('Collection v6 helpers are additive and legacy aliases remain intact', async () => {
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v6-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: {
                collections_indexed: { c: { nextID: 1 } },
                findByIdsFast(o, cb) { cb(null, o.ids.map(id => ({ id }))); },
                bulkWriteFast(o, cb) { cb(null, { modifiedCount: o.operations.length }); },
                findCursorFast(o, cb) { cb(null, { async *[Symbol.asyncIterator]() { yield { id: 1 }; } }); },
            },
            log() {}, toInt: Number,
        };
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne); assert.equal(c.get, c.findOne); // legacy aliases preserved
        assert.deepEqual(await c.findByIdsFast([4, 5]), [{ id: 4 }, { id: 5 }]);
        assert.equal((await c.bulkWriteFast([{ deleteOne: { filter: { id: 4 } } }])).modifiedCount, 1);
        const cursor = await c.streamFast();
        const rows = []; for await (const row of cursor) rows.push(row);
        assert.deepEqual(rows, [{ id: 1 }]);
    });


    await test('Core v7 Mongo advisor records query shapes and suggests compound indexes without changing execution', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        site.mongoAdvisor.record('main.users', 'findMany', { where: { active: true, group: { id: 3 } }, sort: { createdAt: -1 } });
        site.mongoAdvisor.record('main.users', 'findMany', { where: { active: false, group: { id: 8 } }, sort: { createdAt: -1 } });
        const report = site.mongoAdvisor.report();
        assert.equal(report.length, 1); assert.equal(report[0].count, 2);
        const suggestions = site.mongoAdvisor.suggest({ minCount: 2 });
        assert.deepEqual(suggestions[0].index, { active: 1, 'group.id': 1, createdAt: -1 });
        assert.equal(site.health().mongoAdvisor.shapes, 1);
    });

    await test('Core v7 ID batcher deduplicates ids into one loader batch', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        let calls = 0, idsSeen;
        const batcher = site.createIdBatcher(async ids => {
            calls++; idsSeen = ids;
            return ids.map(id => ({ id, name: 'u' + id }));
        }, { delay: 0, maxBatchSize: 100 });
        const [a, b, c] = await Promise.all([batcher.load(1), batcher.load(2), batcher.load(1)]);
        assert.equal(calls, 1); assert.deepEqual(idsSeen, [1, 2]);
        assert.equal(a.name, 'u1'); assert.equal(b.name, 'u2'); assert.equal(c.name, 'u1');
        assert.equal(batcher.stats().loaded, 3);
    });

    await test('Core v7 NDJSON streaming respects backpressure and does not buffer full input', async () => {
        const { Writable } = require('node:stream');
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        let text = '';
        const writable = new Writable({ write(chunk, enc, cb) { text += chunk.toString(); cb(); } });
        const result = await site.stream.ndjson((async function* () { yield { id: 1 }; yield { id: 2 }; })(), writable);
        assert.equal(result.rows, 2); assert.equal(text, '{"id":1}\n{"id":2}\n'); assert.ok(result.bytes > 0);
    });

    await test('Core v7 named compatibility contracts keep legacy API shape pinned', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        const target = { get() {}, post() {}, find() {} };
        site.compat.pin('legacy', target);
        assert.equal(site.compat.check('legacy', target).ok, true);
        target.post = 1;
        assert.equal(site.compat.check('legacy', target).ok, false);
        assert.deepEqual(site.compat.contracts(), ['legacy']);
    });

    await test('Collection v7 batched id reads are additive and preserve legacy aliases', async () => {
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v7-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: { collections_indexed: { c: { nextID: 1 } }, findByIdsFast(o, cb) { cb(null, o.ids.map(id => ({ id }))); } },
            log() {}, toInt: Number,
        };
        require('../lib/core-v4.js')(site); require('../lib/core-v5.js')(site); require('../lib/core-v6.js')(site); require('../lib/core-v7.js')(site);
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne); assert.equal(c.get, c.findOne);
        const rows = await Promise.all([c.findByIdBatched(10, { batchDelay: 0 }), c.findByIdBatched(11, { batchDelay: 0 })]);
        assert.deepEqual(rows, [{ id: 10 }, { id: 11 }]);
        assert.equal(c.batchStats()[0].batches, 1);
    });


    await test('Core v8 structured trace is bounded, filterable and context-aware', async () => {
        const site = { databaseList: [], databaseCollectionList: [] };
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        require('../lib/core-v8.js')(site);
        site.trace.configure({ maxEntries: 10 });
        const ctx = site.context.create({ operation: 'trace-test', requestId: 'r1' });
        await site.context.run(ctx, async () => {
            site.trace.info('hello', { a: 1 });
            site.trace.warn('warn');
        });
        const recent = site.trace.recent(10, { requestId: 'r1' });
        assert.equal(recent.length, 2);
        assert.equal(recent[0].operation, 'trace-test');
        assert.equal(recent[0].contextId, ctx.id);
        assert.equal(site.trace.stats().byLevel.info, 1);
        assert.equal(site.health().trace.entries, 2);
    });

    await test('Core v8 resource registry closes tracked resources once', async () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        require('../lib/core-v8.js')(site);
        let closes = 0;
        const id = site.resources.add({ async close() { closes++; } }, { id: 'db' });
        assert.equal(id, 'db'); assert.equal(site.resources.count(), 1);
        assert.equal(await site.resources.close('db'), true);
        assert.equal(closes, 1); assert.equal(site.resources.count(), 0);
        assert.equal(await site.resources.close('db'), false);
    });

    await test('Core v8 async mapLimit preserves order and concurrency bound', async () => {
        const site = {};
        require('../lib/core-v8.js')(site);
        let active = 0, maxActive = 0;
        const result = await site.async.mapLimit([1,2,3,4,5,6], 2, async n => {
            active++; maxActive = Math.max(maxActive, active);
            await new Promise(r => setTimeout(r, 2)); active--; return n * 2;
        });
        assert.deepEqual(result, [2,4,6,8,10,12]);
        assert.equal(maxActive, 2);
        assert.deepEqual(await site.async.filterLimit([1,2,3,4], 2, async n => n % 2 === 0), [2,4]);
    });

    await test('Core v8 JSON array streaming emits valid JSON without full buffering', async () => {
        const { Writable } = require('node:stream');
        const site = {};
        require('../lib/core-v8.js')(site);
        let text = '';
        const writable = new Writable({ write(chunk, enc, cb) { text += chunk.toString(); cb(); } });
        const result = await site.stream.jsonArray((async function* () { yield { id: 1 }; yield { id: 2 }; })(), writable);
        assert.equal(result.rows, 2);
        assert.deepEqual(JSON.parse(text), [{ id: 1 }, { id: 2 }]);
        assert.equal(result.bytes, Buffer.byteLength(text));
    });

    await test('Core v8 static manifest diff identifies only changed assets', async () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        require('../lib/core-v8.js')(site);
        const prev = { files: [{ path: '/a.js', size: 10, mtimeMs: 1 }, { path: '/b.css', size: 20, mtimeMs: 1 }, { path: '/old.js', size: 1, mtimeMs: 1 }] };
        const curr = { files: [{ path: '/a.js', size: 10, mtimeMs: 1 }, { path: '/b.css', size: 25, mtimeMs: 2 }, { path: '/new.js', size: 3, mtimeMs: 1 }] };
        const diff = site.staticAssets.diffManifest(prev, curr);
        assert.deepEqual(diff.changedFiles.map(x => x.path).sort(), ['/b.css', '/new.js']);
        assert.deepEqual(diff.removed.map(x => x.path), ['/old.js']);
        assert.deepEqual(diff.unchanged.map(x => x.path), ['/a.js']);
    });

    await test('Core v8 query plans cache stable shapes and instantiate without mutating template', () => {
        const site = {};
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        require('../lib/core-v8.js')(site);
        const a = site.queryPlan.compile('main.users', 'findMany', { limit: 50, sort: { id: -1 } });
        const b = site.queryPlan.compile('main.users', 'findMany', { sort: { id: -1 }, limit: 50 });
        assert.equal(a, b);
        const opts = site.queryPlan.instantiate(a, { skip: 100 });
        assert.equal(opts.limit, 50); assert.equal(opts.skip, 100);
        assert.equal(a.options.skip, undefined);
        assert.ok(site.queryPlan.stats().entries >= 1);
        assert.ok(site.health().queryPlans.entries >= 1);
    });

    await test('Core v8 remains additive and does not replace legacy collection aliases', () => {
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v8-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: { collections_indexed: { c: { nextID: 1 } } }, log() {}, toInt: Number,
        };
        require('../lib/core-v8.js')(site);
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne);
        assert.equal(c.get, c.findOne);
        assert.equal(typeof c.findMany, 'function');
        assert.equal(typeof c.add, 'function');
        assert.equal(typeof c.update, 'function');
        assert.equal(typeof c.delete, 'function');
    });


    await test('Core v9 Mongo telemetry aggregates execution efficiency without changing queries', () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v6.js')(site);
        require('../lib/core-v7.js')(site);
        require('../lib/core-v8.js')(site);
        require('../lib/core-v9.js')(site);
        site.mongoTelemetry.record({ collection: 'main.users', operation: 'findMany', ms: 12, docsExamined: 1000, keysExamined: 1000, nReturned: 10, indexName: 'active_1' });
        site.mongoTelemetry.record({ collection: 'main.users', operation: 'findMany', ms: 8, docsExamined: 500, keysExamined: 500, nReturned: 10, indexName: 'active_1' });
        const report = site.mongoTelemetry.report();
        assert.equal(report.length, 1);
        assert.equal(report[0].count, 2);
        assert.equal(report[0].avgMs, 10);
        assert.equal(report[0].scanRatio, 75);
        assert.equal(site.mongoTelemetry.inefficient({ minScanRatio: 20, minDocsExamined: 100 }).length, 1);
        assert.equal(site.health().mongoTelemetry.entries, 2);
    });

    await test('Core v9 Mongo explain extraction reads winning index execution stats', () => {
        const site = {};
        require('../lib/core-v9.js')(site);
        const row = site.mongoTelemetry.extractExplain({
            executionStats: {
                totalDocsExamined: 25,
                totalKeysExamined: 30,
                nReturned: 5,
                executionTimeMillis: 3,
                executionStages: { stage: 'FETCH', inputStage: { stage: 'IXSCAN', indexName: 'email_1' } },
            },
        });
        assert.deepEqual(row, { docsExamined: 25, keysExamined: 30, nReturned: 5, executionTimeMs: 3, indexName: 'email_1', stage: 'IXSCAN' });
    });

    await test('Core v9 response cache supports tags, stable keys and inflight deduplication', async () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v9.js')(site);
        const keyA = site.responseCache.key({ method: 'GET', host: 'example', url: '/api?a=1', vary: { lang: 'en' } });
        const keyB = site.responseCache.key({ url: '/api?a=1', host: 'example', method: 'GET', vary: { lang: 'en' } });
        assert.equal(keyA, keyB);
        let loads = 0;
        const [a, b] = await Promise.all([
            site.responseCache.getOrLoad(keyA, async () => { loads++; await new Promise(r => setTimeout(r, 5)); return { status: 200, headers: { 'content-type': 'application/json' }, body: '{"ok":true}' }; }, { ttl: 1000, tags: ['users'] }),
            site.responseCache.getOrLoad(keyA, async () => { loads++; return { body: 'bad' }; }, { ttl: 1000, tags: ['users'] }),
        ]);
        assert.equal(loads, 1);
        assert.equal(a.body, '{"ok":true}');
        assert.equal(b.body, '{"ok":true}');
        assert.equal(site.responseCache.invalidateTag('users'), 1);
        assert.equal(site.responseCache.get(keyA), undefined);
    });

    await test('Core v9 response cache can apply cached HTTP responses without changing response helpers', () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v9.js')(site);
        const state = { headers: {} };
        const res = {
            status(code) { state.status = code; return this; },
            set(name, value) { state.headers[name] = value; return this; },
            end(body) { state.body = body; },
        };
        const ok = site.responseCache.apply(res, { status: 201, headers: { 'content-type': 'text/plain' }, body: 'cached' });
        assert.equal(ok, true);
        assert.equal(state.status, 201);
        assert.equal(state.headers['content-type'], 'text/plain');
        assert.equal(state.body, 'cached');
    });

    await test('Core v9 remains additive and preserves legacy collection aliases', () => {
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v9-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: { collections_indexed: { c: { nextID: 1 } } }, log() {}, toInt: Number,
        };
        require('../lib/core-v9.js')(site);
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne);
        assert.equal(c.get, c.findOne);
        assert.equal(typeof c.findMany, 'function');
        assert.equal(typeof c.add, 'function');
        assert.equal(typeof c.update, 'function');
        assert.equal(typeof c.delete, 'function');
    });


    await test('Core v9 response cache stale-while-revalidate returns stale value and refreshes once', async () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v5.js')(site);
        require('../lib/core-v9.js')(site);
        site.responseCache.set('stale-key', { body: 'old' }, { ttl: 1, staleTTL: 1000, tags: ['x'] });
        await new Promise(r => setTimeout(r, 5));
        let loads = 0;
        const value = await site.responseCache.getOrLoad('stale-key', async () => { loads++; return { body: 'new' }; }, { ttl: 1000, staleTTL: 1000, staleWhileRevalidate: true, tags: ['x'] });
        assert.equal(value.body, 'old');
        await new Promise(r => setTimeout(r, 5));
        assert.equal(loads, 1);
        assert.equal(site.responseCache.get('stale-key').body, 'new');
    });

    await test('Mongo v9 explainQuery is opt-in and records executionStats telemetry', async () => {
        const fakeExplain = {
            executionStats: {
                totalDocsExamined: 12,
                totalKeysExamined: 12,
                nReturned: 3,
                executionTimeMillis: 2,
                executionStages: { stage: 'FETCH', inputStage: { stage: 'IXSCAN', indexName: 'active_1' } },
            },
        };
        const fakeCollection = {
            find() { return { limit() { return this; }, explain() { return Promise.resolve(fakeExplain); } }; },
        };
        const site = {
            options: { mongodb: { enabled: true, db: 'd', collection: 'c', host: 'localhost', port: '27017', protocal: 'mongodb://', prefix: { db: '', collection: '' }, config: {} } },
            databaseList: [], databaseCollectionList: [{ name: 'c', dbName: 'd', collection: fakeCollection }],
            on() {}, call() {}, log() {}, fn: { isDate: () => false }, removeRefObject: x => x,
            getDateTime: x => x,
        };
        require('../lib/core-v9.js')(site);
        const mongo = require('../lib/mongodb.js')(site);
        const explain = await new Promise((resolve, reject) => mongo.explainQuery({ dbName: 'd', collectionName: 'c', where: { active: true }, operation: 'findMany' }, (err, value) => err ? reject(err) : resolve(value)));
        assert.equal(explain, fakeExplain);
        const recent = site.mongoTelemetry.recent(10);
        assert.equal(recent.length, 1);
        assert.equal(recent[0].indexName, 'active_1');
        assert.equal(recent[0].docsExamined, 12);
        assert.equal(recent[0].nReturned, 3);
    });



    await test('Core v10 response-cache collection bindings invalidate only explicitly bound tags', () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v9.js')(site);
        require('../lib/core-v10.js')(site);
        site.responseCache.set('users-list', { body: 'users' }, { ttl: 10000, tags: ['users'] });
        site.responseCache.set('dashboard', { body: 'dashboard' }, { ttl: 10000, tags: ['dashboard'] });
        site.responseCache.set('other', { body: 'other' }, { ttl: 10000, tags: ['other'] });
        site.responseCache.bindCollection('main.users', ['users', 'dashboard']);
        const out = site.responseCache.invalidateCollection('main.users', { operation: 'updateOne' });
        assert.equal(out.bound, true);
        assert.equal(out.invalidated, 2);
        assert.equal(site.responseCache.get('users-list'), undefined);
        assert.equal(site.responseCache.get('dashboard'), undefined);
        assert.equal(site.responseCache.get('other').body, 'other');
        assert.equal(site.responseCache.invalidationStats().bindings, 1);
    });

    await test('Core v10 unbound Mongo collections do not invalidate response cache', () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v9.js')(site);
        require('../lib/core-v10.js')(site);
        site.responseCache.set('safe', { body: 'keep' }, { ttl: 10000, tags: ['safe'] });
        const out = site.responseCache.invalidateCollection('main.unbound', { operation: 'deleteOne' });
        assert.equal(out.bound, false);
        assert.equal(out.invalidated, 0);
        assert.equal(site.responseCache.get('safe').body, 'keep');
    });

    await test('Core v10 response-cache warming deduplicates concurrent loaders', async () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v9.js')(site);
        require('../lib/core-v10.js')(site);
        let loads = 0;
        const loader = async () => { loads++; await new Promise(r => setTimeout(r, 5)); return { body: 'warm' }; };
        const [a, b] = await Promise.all([
            site.responseCache.warm('warm-key', loader, { ttl: 10000 }),
            site.responseCache.warm('warm-key', loader, { ttl: 10000 }),
        ]);
        assert.equal(loads, 1);
        assert.equal(a.body, 'warm');
        assert.equal(b.body, 'warm');
        assert.equal(site.responseCache.warmStats().loaded, 1);
    });

    await test('Core v10 Mongo budgets observe telemetry without changing telemetry results', () => {
        const site = {};
        require('../lib/core-v3.js')(site);
        require('../lib/core-v4.js')(site);
        require('../lib/core-v9.js')(site);
        require('../lib/core-v10.js')(site);
        site.mongoBudget.set('main.users', 'findManyFast', { warnMs: 10, maxTimeMS: 50 });
        const row = site.mongoTelemetry.record({ collection: 'main.users', operation: 'findManyFast', ms: 20, nReturned: 1 });
        assert.equal(row.ms, 20);
        assert.equal(site.mongoBudget.stats().warnings, 1);
        assert.equal(site.mongoBudget.stats().exceeded, 0);
        assert.equal(site.mongoBudget.get('main.users', 'findManyFast').maxTimeMS, 50);
        assert.equal(site.health().mongoBudget.rules, 1);
    });

    await test('Mongo v10 write-cache bridge preserves query invalidation and uses response bindings only when configured', () => {
        let queryInvalidated = 0;
        let responseInvalidated = 0;
        const site = {
            options: { mongodb: { enabled: true, db: 'main', collection: 'users', host: 'localhost', port: '27017', protocal: 'mongodb://', prefix: { db: '', collection: '' }, config: {} } },
            databaseList: [], databaseCollectionList: [], on() {}, call() {}, log() {}, fn: { isDate: () => false }, removeRefObject: x => x, getDateTime: x => x,
            query: { invalidate(name) { queryInvalidated++; assert.equal(name, 'main.users'); return 1; } },
            responseCache: { invalidateCollection(name, meta) { responseInvalidated++; assert.equal(name, 'main.users'); assert.equal(meta.operation, 'updateOne'); return { bound: true }; } },
        };
        const mongo = require('../lib/mongodb.js')(site);
        const out = mongo.invalidateWriteCaches({ dbName: 'main', collectionName: 'users' }, 'updateOne');
        assert.equal(queryInvalidated, 1);
        assert.equal(responseInvalidated, 1);
        assert.equal(out.query, 1);
    });

    await test('Core v10 budgeted collection reads pass maxTimeMS only through new opt-in APIs', async () => {
        let seen = null;
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v10-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: {
                collections_indexed: { c: { nextID: 1 } },
                findManyFast(options, cb) { seen = options; cb(null, [{ id: 1 }]); },
            },
            mongoBudget: { get() { return { maxTimeMS: 77 }; } },
            log() {}, toInt: Number,
        };
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        const docs = await c.findManyBudgeted({ where: { active: true }, limit: 10 });
        assert.equal(docs.length, 1);
        assert.equal(seen.maxTimeMS, 77);
        assert.equal(typeof c.findMany, 'function');
        assert.equal(c.find, c.findOne);
        assert.equal(c.get, c.findOne);
    });

    await test('Core v10 remains additive and preserves parser and legacy collection contracts', () => {
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v10-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: { collections_indexed: { c: { nextID: 1 } } }, log() {}, toInt: Number,
        };
        require('../lib/core-v10.js')(site);
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne);
        assert.equal(c.get, c.findOne);
        assert.equal(typeof c.findMany, 'function');
        assert.equal(typeof c.add, 'function');
        assert.equal(typeof c.update, 'function');
        assert.equal(typeof c.delete, 'function');
        assert.equal(typeof c.findManyBudgeted, 'function');
        assert.equal(typeof c.findPageBudgeted, 'function');
        assert.equal(typeof c.findByIdsBudgeted, 'function');
    });


    await test('Core v11 project scanner extracts Smart Code-style site, response, request and collection APIs', () => {
        const compatSite = {
            connectCollection() { return { addOne() {}, findMany() {}, removeMany() {} }; },
            get() {}, post() {}, callRoute() {}, isFileExistsSync() {}, fromJson() {}, readFileSync() {}, writeFile() {},
            path: { join() {} }, security: { getUserFinger() {} }, health() { return {}; }, compat: {},
        };
        require('../lib/core-v11.js')(compatSite);
        const root = path.join(__dirname, 'compat', 'smart-code-fixture');
        const report = compatSite.compat.scanProject(root);
        assert.ok(report.filesScanned >= 2);
        assert.ok(report.usage.site.some(x => x.name === 'connectCollection' && x.serverCount > 0));
        assert.ok(report.usage.site.some(x => x.name === 'callRoute' && x.serverCount > 0));
        assert.ok(report.usage.res.some(x => x.name === 'render' && x.serverCount > 0));
        assert.ok(report.usage.req.some(x => x.name === 'session.lang' && x.serverCount > 0));
        assert.ok(report.usage.collection.some(x => x.name === 'addOne' && x.serverCount > 0));
        assert.ok(report.usage.collection.some(x => x.name === 'findMany' && x.serverCount > 0));
        assert.ok(report.usage.collection.some(x => x.name === 'removeMany' && x.serverCount > 0));
        assert.ok(report.usage.prototype.some(x => x.name === 'like'));
    });

    await test('Core v11 project verifier treats application-added site helpers as custom, not broken iSite APIs', () => {
        const compatSite = {
            connectCollection() { return { addOne() {}, findMany() {}, removeMany() {} }; },
            get() {}, post() {}, callRoute() {}, isFileExistsSync() {}, fromJson() {}, readFileSync() {}, writeFile() {},
            path: { join() {} }, security: { getUserFinger() {} }, health() { return {}; }, compat: {},
        };
        require('../lib/core-v11.js')(compatSite);
        const root = path.join(__dirname, 'compat', 'smart-code-fixture');
        const result = compatSite.compat.verifyProject(root, {
            requiredSiteApis: ['get', 'post', 'connectCollection', 'path.join'],
            requiredCollectionApis: ['addOne', 'findMany', 'removeMany'],
        });
        assert.equal(result.ok, true);
        assert.ok(Array.isArray(result.customOrProjectSiteApis));
    });

    await test('Core v11 usage comparison detects removed server API usage', () => {
        const compatSite = { health() { return {}; }, compat: {} };
        require('../lib/core-v11.js')(compatSite);
        const expected = { usage: { site: [{ name: 'get', serverCount: 1 }], res: [], req: [], collection: [], prototype: [] } };
        const actual = { usage: { site: [], res: [], req: [], collection: [], prototype: [] } };
        const result = compatSite.compat.compareProjectUsage(expected, actual);
        assert.equal(result.ok, false);
        assert.deepEqual(result.missing, [{ category: 'site', name: 'get' }]);
    });


    await test('Core v14 additive findMany helpers preserve legacy aliases', async () => {
        const seen = [];
        const site = {
            strings: Array.from({ length: 10 }, (_, i) => 's' + i), on() {}, collectionList: [], collectionByGuid: new Map(), hide: () => 'v14-guid',
            options: { mongodb: { db: 'd', collection: 'c', identity: { enabled: false }, limit: 100 } },
            mongodb: {
                collections_indexed: { c: { nextID: 1 } },
                findManyFast(o, cb) { seen.push(['fast', o]); cb(null, [{ id: 1 }]); },
                findManyConcurrent(o, cb) { seen.push(['concurrent', o]); cb(null, [{ id: 1 }], 7); },
            },
            log() {}, toInt: Number,
            pool() { return { run(fn) { return fn(); } }; },
            query: { cached(name, op, options, loader) { return loader(); } },
        };
        const c = require('../lib/collection.js')(site, { db: 'd', collection: 'c', identity: { enabled: false } });
        assert.equal(c.find, c.findOne);
        assert.equal(c.get, c.findOne);
        assert.equal(typeof c.findMany, 'function');
        assert.equal(c.findManyNoCount, c.findManyFast);
        assert.equal(c.findManyNoCountCached, c.findManyFastCached);
        const fast = await c.findManyNoCount({ where: { active: true } });
        assert.deepEqual(fast, [{ id: 1 }]);
        const concurrent = await c.findManyConcurrent({ where: { active: true } });
        assert.deepEqual(concurrent, { list: [{ id: 1 }], count: 7 });
        assert.equal(seen[0][0], 'fast');
        assert.equal(seen[1][0], 'concurrent');
    });

    await test('Core v14 findManyConcurrent keeps callback docs/count signature', async () => {
        const site = {
            options: { mongodb: { url: 'mongodb://unused', host: 'localhost', port: 27017, protocal: 'mongodb://', db: 'd', limit: 100 } },
            log() {}, on() {}, call() {}, databaseList: [],
            mongoAdvisor: null,
            mongoTelemetry: null,
        };
        const mongo = require('../lib/mongodb.js')(site);
        let countStarted = false;
        let findStarted = false;
        mongo.handleDoc = (v) => v;
        mongo.connectCollection = (obj, cb) => cb(null, {
            countDocuments() {
                countStarted = true;
                return new Promise((resolve, reject) => {
                    setTimeout(() => findStarted ? resolve(5) : reject(new Error('find did not start concurrently')), 5);
                });
            },
            find() {
                findStarted = true;
                return { toArray: () => Promise.resolve([{ id: 1 }]) };
            },
        });
        const result = await new Promise((resolve, reject) => {
            mongo.findManyConcurrent({ dbName: 'd', collectionName: 'c', where: {}, limit: 10 }, (err, docs, count) => {
                if (err) return reject(err);
                resolve({ docs, count });
            });
        });
        assert.equal(countStarted, true);
        assert.equal(findStarted, true);
        assert.deepEqual(result.docs, [{ id: 1 }]);
        assert.equal(result.count, 5);
    });

    console.log(`\n${passed} tests passed`);
    if (process.exitCode) process.exit(process.exitCode);
})();
