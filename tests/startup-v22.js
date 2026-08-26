'use strict';
const assert = require('node:assert/strict');
const Module = require('node:module');
process.env.ISITE_COMPILE_CACHE = '1';
const init = require('../index.js');
const site = init({ name:'startup-v22', port:0, apps:false, stdin:false, log:false, www:false, mongodb:{enabled:false}, security:{enabled:false}, session:{enabled:false,save:false,storage:'file'} });
if (typeof Module.getCompileCacheDir === 'function' && !process.env.NODE_DISABLE_COMPILE_CACHE) {
    const dir = Module.getCompileCacheDir();
    assert.equal(typeof dir, 'string');
    assert.ok(dir.length > 0);
}
site.diagnostics?.close?.();
console.log('PASS v22 Node compile cache startup fast path');
process.exit(0);
