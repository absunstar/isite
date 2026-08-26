'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const init = require('../index.js');
const site = init({
  name:'v29-lazy-metadata', apps:false, stdin:false, help:false, log:false, port:0,
  mongodb:{enabled:false}, security:{enabled:false},
  session:{enabled:false,save:false,storage:'file',timeout:1,memoryTimeout:1},
  https:{enabled:false}, mail:{enabled:false}
});
let d = Object.getOwnPropertyDescriptor(site, 'package');
assert.equal(typeof d.get, 'function', 'site.package should stay lazy when log=false');
d = Object.getOwnPropertyDescriptor(site, 'Module');
assert.equal(typeof d.get, 'function', 'site.Module should stay lazy when compile cache is disabled');
const expectedVersion = require('../package.json').version;
const pkg = site.package;
assert.equal(pkg.version, expectedVersion);
d = Object.getOwnPropertyDescriptor(site, 'package');
assert.ok(Object.prototype.hasOwnProperty.call(d, 'value'));
assert.strictEqual(site.Module, require('node:module'));
d = Object.getOwnPropertyDescriptor(site, 'Module');
assert.ok(Object.prototype.hasOwnProperty.call(d, 'value'));
assert.equal(typeof site.requireFromString, 'function');
assert.deepEqual(site.requireFromString('module.exports = {ok:true}', path.join(process.cwd(),'lazy-metadata-inline.js')), {ok:true});
console.log('PASS package/module metadata remains API-compatible and lazy until first use');
site.diagnostics?.close?.();
process.exit(0);
