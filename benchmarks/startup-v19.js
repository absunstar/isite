'use strict';
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const samples = Math.max(3, Number(process.env.ISITE_STARTUP_SAMPLES || 7));
const runner = path.join(__dirname, 'startup-v19-child.js');
const values = [];
for (let i = 0; i < samples; i++) {
    const out = spawnSync(process.execPath, [runner], { encoding: 'utf8' });
    if (out.status !== 0) {
        process.stderr.write(out.stderr || out.stdout || 'startup child failed\n');
        process.exit(out.status || 1);
    }
    const line = out.stdout.split(/\r?\n/).find((v) => v.startsWith('{'));
    if (line) values.push(JSON.parse(line));
}
const median = (arr) => { const x=arr.slice().sort((a,b)=>a-b); const m=Math.floor(x.length/2); return x.length%2?x[m]:(x[m-1]+x[m])/2; };
const report = {
    samples: values.length,
    requireMs: median(values.map(v=>v.requireMs)),
    initMs: median(values.map(v=>v.initMs)),
    startReadyMs: median(values.map(v=>v.startReadyMs)),
    totalToReadyMs: median(values.map(v=>v.totalToReadyMs)),
};
console.log(JSON.stringify(report, null, 2));
