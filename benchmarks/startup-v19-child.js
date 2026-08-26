'use strict';
const t0 = process.hrtime.bigint();
const init = require('../index.js');
const t1 = process.hrtime.bigint();
const port = 36000 + (process.pid % 20000);
const site = init({
  name:'startup-benchmark', apps:false, stdin:false, help:false, log:false,
  mongodb:{enabled:false}, security:{enabled:false},
  session:{enabled:false,save:false,storage:'file',timeout:1,memoryTimeout:1},
  https:{enabled:false}, mail:{enabled:false}, port
});
const t2 = process.hrtime.bigint();
site.ws.wsSupport = () => Promise.resolve();
site.start(() => {
  const t3 = process.hrtime.bigint();
  console.log(JSON.stringify({
    requireMs:Number(t1-t0)/1e6,
    initMs:Number(t2-t1)/1e6,
    startReadyMs:Number(t3-t2)/1e6,
    totalToReadyMs:Number(t3-t0)/1e6
  }));
  for (const server of site.servers || []) try { server.close(); } catch (_) {}
  site.diagnostics?.close?.(); site.ws?.stopHeartbeat?.(); process.exit(0);
});
