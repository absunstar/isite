'use strict';
const assert = require('node:assert');
const sessionInit = require('../lib/session');
function runSession(headers) { return new Promise((resolve) => {
  const req={headers,ip:'127.0.0.1',host:'social-browser.com',url:'/account',features:[]};
  const res={cookie(){},set(){}};
  const site={options:{session:{},defaults:{features:[]},dynamic:false},features:[],security:{getUser(_q,cb){cb(null,null)}},getSession(_req,cb){cb({$new:false,accessToken:'x'})},saveSession(){}};
  sessionInit(req,res,site,(session)=>resolve({req,session}));
}); }
(async()=>{
 const full='2026_08_31_ABCDEF123456';
 const {req}=await runSession({'x-browser':'social.'+full,'x-browser-token':'opaque-proof-token'});
 assert.equal(req.browserHeader,'social.'+full);assert.equal(req.browserName,'social');assert.equal(req.browserID,full);assert.equal(req.browserUUID,'ABCDEF123456');assert.equal(req.browserFullID,full);assert.equal(req.browserCanonicalID,'ABCDEF123456');assert.equal(req.browserToken,'opaque-proof-token');assert.equal(req.browserAuth.detected,true);assert.equal(req.browserAuth.tokenPresent,true);assert(req.features.includes('browser.auth-token'));assert(!req.features.some(x=>x.includes('opaque-proof-token')));
 const none=await runSession({});assert.equal(none.req.browserToken,'');assert.equal(none.req.browserAuth.detected,false);assert.equal(none.req.browserAuth.tokenPresent,false);
 console.log('browser-header-v34: pass');
})().catch(e=>{console.error(e);process.exit(1)});
