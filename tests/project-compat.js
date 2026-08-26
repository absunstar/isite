'use strict';

const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const mode = args.find(x => x.startsWith('--')) || '--scan';
const positional = args.filter(x => !x.startsWith('--'));
const projectDir = path.resolve(positional[0] || process.env.ISITE_PROJECT_DIR || '');
const manifestFile = positional[1] ? path.resolve(positional[1]) : (process.env.ISITE_PROJECT_MANIFEST ? path.resolve(process.env.ISITE_PROJECT_MANIFEST) : null);

if (!positional[0] && !process.env.ISITE_PROJECT_DIR) {
    console.error('Project directory is required.');
    console.error('Examples:');
    console.error('  npm run project:scan -- /path/to/project');
    console.error('  npm run project:baseline -- /path/to/project /path/to/manifest.json');
    console.error('  npm run project:verify -- /path/to/project /path/to/manifest.json');
    process.exit(2);
}
if (!fs.existsSync(projectDir)) {
    console.error('Project directory not found:', projectDir);
    process.exit(2);
}

// Static project scanning is independent from the full runtime and optional dependencies.
const host = { compat: {} };
require('../lib/core-v11.js')(host);

const report = host.compat.scanProject(projectDir);

if (mode === '--scan') {
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.parseErrors.length ? 1 : 0;
    return;
}

if (mode === '--baseline') {
    const output = manifestFile || path.join(projectDir, '.isite-compat.json');
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('Wrote project compatibility baseline:', output);
    return;
}

if (mode === '--verify') {
    if (!manifestFile || !fs.existsSync(manifestFile)) {
        console.error('Compatibility manifest is required for --verify.');
        process.exit(2);
    }
    const expected = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const result = host.compat.compareProjectUsage(expected, report);
    console.log('Project:', projectDir);
    console.log('files:', report.filesScanned);
    console.log('bytes:', report.bytesScanned);
    console.log('missing previously-used APIs:', result.missing.length);
    console.log('newly observed APIs:', result.added.length);
    if (result.missing.length) console.error(JSON.stringify(result.missing, null, 2));
    if (report.parseErrors.length) console.error('Read errors:', report.parseErrors.length);
    if (!result.ok || report.parseErrors.length) process.exit(1);
    console.log('PASS project iSite usage remains compatible with its baseline');
    return;
}

console.error('Unknown mode:', mode);
process.exit(2);
