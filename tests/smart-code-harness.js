'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

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

// v13: project compatibility scanning is deliberately independent from iSite runtime
// initialization. This prevents optional integrations (PDF/WebP/mail/etc.) from being
// required just to validate the public contract in CI.
const compatHost = { compat: {} };
require('../lib/core-v11.js')(compatHost);

const sourceRoots = [
    path.join(__dirname, '..', 'index.js'),
    path.join(__dirname, '..', 'lib'),
    path.join(__dirname, '..', 'object-options', 'lib'),
];

function collectFrameworkSource() {
    const chunks = [];
    const stack = sourceRoots.slice();
    while (stack.length) {
        const item = stack.pop();
        if (!fs.existsSync(item)) continue;
        const stat = fs.statSync(item);
        if (stat.isDirectory()) {
            for (const name of fs.readdirSync(item)) stack.push(path.join(item, name));
        } else if (stat.isFile() && /\.(?:js|cjs|mjs)$/.test(item)) {
            chunks.push({ file: item, text: fs.readFileSync(item, 'utf8') });
        }
    }
    return chunks;
}

const frameworkSources = collectFrameworkSource();
const allFrameworkText = frameworkSources.map(x => x.text).join('\n');

function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sourceHasSiteApi(name) {
    const parts = String(name).split('.');
    const leaf = parts[parts.length - 1];
    const e = escapeRegExp(leaf);
    // Covers direct assignment, alias chains and object member definitions used by iSite.
    const patterns = [
        new RegExp('\\b____0\\.' + e + '\\b'),
        new RegExp('\\bsite\\.' + e + '\\b'),
        new RegExp('\\b(?:security|sessions|storage|fsm|app|fn)\\.' + e + '\\b'),
        new RegExp('\\[\\s*[\'\"]' + e + '[\'\"]\\s*\\]'),
    ];
    if (parts.length > 1) {
        const root = escapeRegExp(parts[0]);
        patterns.unshift(new RegExp('\\b' + root + '\\.' + e + '\\b'));
    }
    return patterns.some(re => re.test(allFrameworkText));
}

function sourceHasCollectionApi(name) {
    const e = escapeRegExp(name);
    const text = fs.readFileSync(path.join(__dirname, '..', 'lib', 'collection.js'), 'utf8');
    return new RegExp('\\$collection\\.' + e + '\\b').test(text);
}

function sourceHasResponseApi(name) {
    const e = escapeRegExp(name);
    const text = fs.readFileSync(path.join(__dirname, '..', 'lib', 'routing.js'), 'utf8');
    return new RegExp('\\bres\\.' + e + '\\b').test(text);
}

function sourceHasRequestApi(name) {
    const e = escapeRegExp(name);
    return new RegExp('\\breq\\.' + e + '\\b').test(allFrameworkText) ||
        new RegExp('\\b(?:security|parser|session|sessions)\\.' + e + '\\b').test(allFrameworkText);
}

function sourceHasPrototypeHelper(name) {
    const e = escapeRegExp(name);
    const text = fs.readFileSync(path.join(__dirname, '..', 'object-options', 'lib', 'prototype.js'), 'utf8');
    return new RegExp('prototype\\.' + e + '\\b').test(text) || new RegExp('\\.' + e + '\\s*=|\\[' + e + '\\]').test(text);
}

function staticVerify(report) {
    const missingSite = (baseline.requiredSiteApis || []).filter(name => !sourceHasSiteApi(name));
    const missingCollection = (baseline.requiredCollectionApis || []).filter(name => !sourceHasCollectionApi(name));
    const missingResponse = (baseline.requiredResponseApis || []).filter(name => !sourceHasResponseApi(name));
    const missingRequest = (baseline.requiredRequestApis || []).filter(name => !sourceHasRequestApi(name));
    const missingPrototype = (baseline.legacyPrototypeHelpers || []).filter(name => !sourceHasPrototypeHelper(name));

    // The baseline also represents usage that must still exist in Smart Code itself.
    const observed = category => new Set((report.usage[category] || []).filter(x => x.serverCount > 0).map(x => x.name));
    const absentFromProject = [];
    for (const [category, names] of [
        ['res', baseline.requiredResponseApis || []],
        ['req', baseline.requiredRequestApis || []],
        ['prototype', baseline.legacyPrototypeHelpers || []],
    ]) {
        const set = observed(category);
        for (const name of names) if (!set.has(name)) absentFromProject.push({ category, name });
    }

    return {
        ok: report.parseErrors.length === 0 && !missingSite.length && !missingCollection.length && !missingResponse.length && !missingRequest.length && !missingPrototype.length && !absentFromProject.length,
        missingSite,
        missingCollection,
        missingResponse,
        missingRequest,
        missingPrototype,
        absentFromProject,
    };
}

if (mode === '--scan') {
    const report = compatHost.compat.scanProject(smartCodeDir);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.parseErrors.length ? 1 : 0;
} else if (mode === '--baseline') {
    const output = path.join(__dirname, 'compat', 'smart-code-usage.generated.json');
    compatHost.compat.writeProjectManifest(smartCodeDir, output);
    console.log('Wrote', output);
} else {
    const report = compatHost.compat.scanProject(smartCodeDir);
    const result = staticVerify(report);
    console.log('Smart Code compatibility');
    console.log('files:', report.filesScanned);
    console.log('bytes:', report.bytesScanned);
    console.log('server site APIs:', report.summary.siteApis);
    console.log('collection APIs:', report.summary.collectionApis);
    console.log('prototype helpers:', report.summary.prototypeHelpers);
    if (result.missingSite.length) console.error('Missing site APIs:', result.missingSite.join(', '));
    if (result.missingCollection.length) console.error('Missing collection APIs:', result.missingCollection.join(', '));
    if (result.missingResponse.length) console.error('Missing response APIs:', result.missingResponse.join(', '));
    if (result.missingRequest.length) console.error('Missing request APIs:', result.missingRequest.join(', '));
    if (result.missingPrototype.length) console.error('Missing prototype helpers:', result.missingPrototype.join(', '));
    if (result.absentFromProject.length) console.error('Baseline APIs no longer observed in Smart Code:', JSON.stringify(result.absentFromProject));
    if (report.parseErrors.length) console.error('Read errors:', report.parseErrors.length);
    assert.equal(result.ok, true, 'Smart Code compatibility verification failed');
    console.log('PASS Smart Code real-world compatibility gate');
}
