'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const security = fs.readFileSync(path.join(root, 'lib/security.js'), 'utf8');
const session = fs.readFileSync(path.join(root, 'lib/session.js'), 'utf8');
const bundle = fs.readFileSync(path.join(root, 'lib/service-startup-bundle.js'), 'utf8');
const bundleNoMongo = fs.readFileSync(path.join(root, 'lib/service-startup-bundle-nomongo.js'), 'utf8');
assert(security.includes('security.userProviders = new Map()'), 'external user-provider registry missing');
assert(security.includes('security.registerUserProvider'), 'registerUserProvider missing');
assert(security.includes('security.getSessionUser'), 'source-aware getSessionUser missing');
assert(security.includes('security.setSessionUser'), 'native setSessionUser helper missing');
assert(security.includes('security.clearSessionUser'), 'clearSessionUser helper missing');
assert(session.includes("session.user_source = null"), 'failed external reload must clear source state');
assert(session.includes('____0.security.getSessionUser'), 'session loader must use source-aware provider');
assert(session.includes("req.features.push('login')"), 'native login feature must remain based on session user');
assert(bundle.includes('____0.security.getSessionUser'), 'service startup bundle is out of sync');
assert(bundleNoMongo.includes('____0.security.getSessionUser'), 'no-Mongo service startup bundle is out of sync');
const sessionInit = require('../lib/session');
function runExternalSession() { return new Promise((resolve,reject)=>{
  const req={headers:{},ip:'127.0.0.1',host:'example.test',url:'/private',features:[]};
  const res={cookie(){},set(){}};
  const sessionState={$new:false,accessToken:'x',user_id:'acc_demo',user_source:'social-browser-json',$save(){}};
  const site={
    options:{session:{},defaults:{features:[]},dynamic:false},features:[],
    security:{
      getSessionUser(session,cb){
        try{ assert.equal(session.user_source,'social-browser-json');assert.equal(session.user_id,'acc_demo');cb(null,{id:'acc_demo',email:'demo@example.test',profile:{name:'Demo'}}); }catch(e){reject(e);}
      },
      getUser(){reject(new Error('default Mongo user loader must not run for external source'));}
    },
    getSession(_req,cb){cb(sessionState)},saveSession(){}
  };
  sessionInit(req,res,site,(session)=>resolve({req,session}));
});}
(async()=>{
  const {req,session}=await runExternalSession();
  assert.equal(session.user.id,'acc_demo');
  assert(req.features.includes('login'));
  console.log('session-user-provider-v36: pass');
})().catch(e=>{console.error(e);process.exit(1)});
