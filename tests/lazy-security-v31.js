'use strict';
const assert = require('node:assert/strict');
const init = require('../index.js');
const securityPath = require.resolve('../lib/security.js');
delete require.cache[securityPath];

const site = init({
  name: 'lazy-security-v31', apps: false, stdin: false, help: false, log: false, port: 0,
  https: { enabled: false }, mail: { enabled: false },
  mongodb: { enabled: true, db: 'lazy-security-v31' },
  security: { enabled: true, users: [] },
  session: { enabled: false, save: false, storage: 'file' },
});

assert.equal(Object.prototype.hasOwnProperty.call(site, '$users'), true);
assert.equal(Object.prototype.hasOwnProperty.call(site, '$roles'), true);
assert.ok(site.$users && typeof site.$users.findMany === 'function');
assert.ok(site.$roles && typeof site.$roles.findMany === 'function');
const users = site.$users;
const roles = site.$roles;

assert.equal(Object.prototype.hasOwnProperty.call(site, 'security'), true);
assert.equal(Object.keys(site).includes('security'), true);
let descriptor = Object.getOwnPropertyDescriptor(site, 'security');
assert.equal(typeof descriptor.get, 'function');
assert.equal(require.cache[securityPath], undefined, 'security.js must stay off the pre-listen init path');

const security1 = site.security;
const security2 = site.security;
assert.equal(typeof security1, 'function');
assert.equal(security1, security2, 'security identity must remain stable after materialization');
assert.ok(require.cache[securityPath], 'first security access must materialize the original initializer');
assert.equal(site.$users, users, '$users identity must be preserved');
assert.equal(site.$roles, roles, '$roles identity must be preserved');
assert.equal(typeof security1.getUserFinger, 'function');
assert.equal(typeof security1.isUserHasPermissions, 'function');
descriptor = Object.getOwnPropertyDescriptor(site, 'security');
assert.equal(Object.prototype.hasOwnProperty.call(descriptor, 'value'), true);
assert.equal(descriptor.value, security1);

console.log('PASS v31 security is lazy while legacy $users/$roles and Security API identity are preserved');
site.diagnostics?.close?.();
process.exit(0);
