'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(process.argv[2] || process.env.SMART_CODE_DIR || '');
if (!root || !fs.existsSync(root)) {
    console.error('SMART_CODE_DIR is required');
    process.exit(2);
}
const host = { compat: {} };
require('../lib/core-v11.js')(host);
const report = host.compat.scanProject(root);
const top = (rows, n = 25) => rows.filter(x => x.serverCount > 0).slice(0, n).map(x => ({ name: x.name, uses: x.serverCount, files: x.fileCount }));
const out = {
    generatedAt: new Date().toISOString(),
    filesScanned: report.filesScanned,
    bytesScanned: report.bytesScanned,
    topSite: top(report.usage.site),
    topResponse: top(report.usage.res),
    topCollection: top(report.usage.collection),
    prototype: top(report.usage.prototype),
};
console.log(JSON.stringify(out, null, 2));
