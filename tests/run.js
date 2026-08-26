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

    console.log(`\n${passed} tests passed`);
    if (process.exitCode) process.exit(process.exitCode);
})();
