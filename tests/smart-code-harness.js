'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const init = require('../index.js');

const args = process.argv.slice(2);
const mode = args.find(x => x.startsWith('--')) || '--verify';
const explicitDir = args.find(x => !x.startsWith('--'));
const smartCodeDir = path.resolve(explicitDir || process.env.SMART_CODE_DIR || '');
const baselinePath = path.join(__dirname, 'compat', 'smart-code-baseline.json');
const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

if (!explicitDir && !process.env.SMART_CODE_DIR) {
    console.error('Smart Code directory is required.');
    console.error('Usage: SMART_CODE_DIR=/path/to/smart-code npm run smart-code:verify');
    console.error('   or: npm run smart-code:verify -- /path/to/smart-code');
    process.exit(2);
}
if (!fs.existsSync(smartCodeDir)) {
    console.error('Smart Code directory not found:', smartCodeDir);
    process.exit(2);
}

const site = init({
    name: 'isite-smart-code-compat', apps: false, stdin: false, help: false, log: false,
    mongodb: { enabled: false }, security: { enabled: true },
    session: { enabled: false, save: false, storage: 'file', timeout: 1, memoryTimeout: 1 },
    port: 0,
});

try {
    if (mode === '--scan') {
        const report = site.compat.scanProject(smartCodeDir);
        console.log(JSON.stringify(report, null, 2));
        process.exitCode = report.parseErrors.length ? 1 : 0;
    } else if (mode === '--baseline') {
        const output = path.join(__dirname, 'compat', 'smart-code-usage.generated.json');
        site.compat.writeProjectManifest(smartCodeDir, output);
        console.log('Wrote', output);
    } else {
        const result = site.compat.verifyProject(smartCodeDir, {
            requiredSiteApis: baseline.requiredSiteApis,
            requiredCollectionApis: baseline.requiredCollectionApis,
            requiredResponseApis: baseline.requiredResponseApis,
            requiredRequestApis: baseline.requiredRequestApis,
            requiredPrototypeHelpers: baseline.legacyPrototypeHelpers,
        });
        console.log('Smart Code compatibility');
        console.log('files:', result.report.filesScanned);
        console.log('bytes:', result.report.bytesScanned);
        console.log('server site APIs:', result.report.summary.siteApis);
        console.log('collection APIs:', result.report.summary.collectionApis);
        console.log('prototype helpers:', result.report.summary.prototypeHelpers);
        console.log('custom/project site APIs:', result.customOrProjectSiteApis.length);
        if (result.missingSite.length) console.error('Missing site APIs:', result.missingSite.join(', '));
        if (result.missingCollection.length) console.error('Missing collection APIs:', result.missingCollection.join(', '));
        if (result.report.parseErrors.length) console.error('Read errors:', result.report.parseErrors.length);
        assert.equal(result.ok, true, 'Smart Code compatibility verification failed');
        console.log('PASS Smart Code real-world compatibility gate');
    }
} finally {
    if (site.diagnostics?.close) site.diagnostics.close();
}
