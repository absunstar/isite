'use strict';
const assert = require('node:assert/strict');
const http = require('node:http');
const init = require('../index.js');
const site = init({name:'bundle-runtime-test',apps:false,stdin:false,help:false,log:false,mongodb:{enabled:false},security:{enabled:false},session:{enabled:false,save:false},https:{enabled:false},mail:{enabled:false},port:0});
site.get('/bundle-runtime-json',(req,res)=>res.json({ok:true}));
site.start(()=>{
  const port=site.server.address().port;
  http.get({host:'127.0.0.1',port,path:'/bundle-runtime-json'},res=>{
    let body='';res.setEncoding('utf8');res.on('data',x=>body+=x);res.on('end',()=>{
      try{ assert.equal(res.statusCode,200); assert.equal(JSON.parse(body).ok,true); console.log('PASS service startup bundle preserves legacy sloppy-mode runtime semantics'); }
      finally { site.server.close(()=>process.exit(0)); }
    });
  }).on('error',e=>{console.error(e);process.exit(1)});
});
