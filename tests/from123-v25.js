'use strict';
const init=require('../index.js');
const site=init({stdin:false,apps:false,mongodb:{enabled:false},security:{enabled:false},www:false,log:false,port:0});
const values=['4159236947792757465382744578276241387191','2619517126151271','bad','',null,undefined,123,[],{}];
for(const value of values){
  let a,b,ea,eb;
  try{a=site.from123(value);}catch(e){ea=e?.constructor?.name+':'+e?.message}
  try{b=site.from123(value);}catch(e){eb=e?.constructor?.name+':'+e?.message}
  if(a!==b || ea!==eb){console.error('from123 repeat parity failed',value,a,b,ea,eb);process.exit(1)}
}
for(const server of site.servers||[])try{server.close()}catch(_){}
site.diagnostics?.close?.(); site.ws?.stopHeartbeat?.();
console.log('from123 v25 cache parity PASS'); process.exit(0);
