'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function initCoreV11(site) {
    const DEFAULT_EXTENSIONS = new Set(['.js', '.cjs', '.mjs']);
    const DEFAULT_IGNORES = new Set([
        '.git', '.svn', '.hg', '.vs', '.vscode', 'node_modules', 'vendor', 'dist', 'build',
        'coverage', 'uploads', 'downloads', 'backups', 'backup', 'tmp', 'temp', '.cache'
    ]);

    const normalizePath = value => String(value || '').replace(/\\/g, '/');
    const addUsage = (map, name, file, line, scope) => {
        if (!name) return;
        let row = map.get(name);
        if (!row) {
            row = { name, count: 0, serverCount: 0, clientCount: 0, files: new Set(), examples: [] };
            map.set(name, row);
        }
        row.count++;
        if (scope === 'client') row.clientCount++;
        else row.serverCount++;
        row.files.add(file);
        if (row.examples.length < 5) row.examples.push({ file, line, scope });
    };

    const lineOf = (text, index) => {
        let line = 1;
        for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
        return line;
    };

    const serializeUsage = map => [...map.values()]
        .map(row => ({
            name: row.name,
            count: row.count,
            serverCount: row.serverCount,
            clientCount: row.clientCount,
            files: [...row.files].sort(),
            fileCount: row.files.size,
            examples: row.examples.slice(),
        }))
        .sort((a, b) => b.serverCount - a.serverCount || b.count - a.count || a.name.localeCompare(b.name));

    const walk = (root, options = {}) => {
        const extensions = new Set(options.extensions || [...DEFAULT_EXTENSIONS]);
        const ignores = new Set([...DEFAULT_IGNORES, ...(options.ignore || [])]);
        const maxFileBytes = Math.max(1024, Number(options.maxFileBytes || 2 * 1024 * 1024));
        const files = [];
        const stack = [root];
        while (stack.length) {
            const current = stack.pop();
            let entries;
            try { entries = fs.readdirSync(current, { withFileTypes: true }); } catch (_) { continue; }
            for (const entry of entries) {
                if (ignores.has(entry.name)) continue;
                const full = path.join(current, entry.name);
                if (entry.isDirectory()) { stack.push(full); continue; }
                if (!entry.isFile()) continue;
                if (!extensions.has(path.extname(entry.name).toLowerCase())) continue;
                let stat;
                try { stat = fs.statSync(full); } catch (_) { continue; }
                if (stat.size > maxFileBytes) continue;
                files.push(full);
            }
        }
        return files.sort();
    };

    const classifyScope = relative => {
        const p = '/' + normalizePath(relative).toLowerCase() + '/';
        if (p.includes('/site_files/js/') || p.includes('/site_files/html/') || p.includes('/public/js/')) return 'client';
        return 'server';
    };

    const scanText = (text, relative, maps) => {
        const scope = classifyScope(relative);
        const scan = (regex, target, mapper) => {
            regex.lastIndex = 0;
            let match;
            while ((match = regex.exec(text))) {
                addUsage(target, mapper(match), relative, lineOf(text, match.index), scope);
                if (match[0].length === 0) regex.lastIndex++;
            }
        };

        // Capture nested paths because Smart Code uses APIs such as
        // site.security.getUserFinger and site.path.join in addition to site.get().
        scan(/\bsite((?:\.[A-Za-z_$][\w$]*){1,4})/g, maps.site, m => m[1].slice(1));
        scan(/\bres((?:\.[A-Za-z_$][\w$]*){1,3})/g, maps.res, m => m[1].slice(1));
        scan(/\breq((?:\.[A-Za-z_$][\w$]*){1,4})/g, maps.req, m => m[1].slice(1));

        // iSite-specific legacy prototype helpers used heavily by Smart Code.
        scan(/\.((?:like|contains|test))\s*\(/g, maps.prototype, m => m[1]);

        const collectionVars = new Set();
        let match;
        const assign = /(?:\b(?:const|let|var)\s+)?([A-Za-z_$][\w$]*)\s*=\s*site\.connectCollection\s*\(/g;
        while ((match = assign.exec(text))) collectionVars.add(match[1]);

        for (const variable of collectionVars) {
            const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const methodRe = new RegExp(escaped + '\\.([A-Za-z_$][\\w$]*)\\s*\\(', 'g');
            scan(methodRe, maps.collection, m => m[1]);
        }

        // Direct chains: site.connectCollection(...).findMany(...)
        scan(/site\.connectCollection\s*\([^;\n]*?\)\s*\.([A-Za-z_$][\w$]*)\s*\(/g, maps.collection, m => m[1]);
    };

    const resolvePath = (target, dotted) => {
        let value = target;
        for (const part of String(dotted || '').split('.').filter(Boolean)) {
            if (value == null || !(part in Object(value))) return { exists: false, value: undefined };
            value = value[part];
        }
        return { exists: true, value };
    };

    const uniqueRootApis = rows => [...new Set(rows.filter(x => x.serverCount > 0).map(row => row.name.split('.')[0]))].sort();

    const scanProject = function (root, options = {}) {
        root = path.resolve(String(root || ''));
        if (!root || !fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
            const error = new Error('project directory not found: ' + root);
            error.code = 'ISITE_COMPAT_PROJECT_NOT_FOUND';
            throw error;
        }

        const files = walk(root, options);
        const maps = { site: new Map(), res: new Map(), req: new Map(), collection: new Map(), prototype: new Map() };
        const parseErrors = [];
        let bytes = 0;
        for (const file of files) {
            let text;
            try {
                text = fs.readFileSync(file, 'utf8');
                bytes += Buffer.byteLength(text);
            } catch (error) {
                parseErrors.push({ file: normalizePath(path.relative(root, file)), error: String(error.message || error) });
                continue;
            }
            scanText(text, normalizePath(path.relative(root, file)), maps);
        }

        const usage = {
            site: serializeUsage(maps.site),
            res: serializeUsage(maps.res),
            req: serializeUsage(maps.req),
            collection: serializeUsage(maps.collection),
            prototype: serializeUsage(maps.prototype),
        };

        return {
            version: 1,
            generatedAt: new Date().toISOString(),
            root,
            filesScanned: files.length,
            bytesScanned: bytes,
            parseErrors,
            usage,
            summary: {
                siteApis: usage.site.filter(x => x.serverCount > 0).length,
                responseApis: usage.res.filter(x => x.serverCount > 0).length,
                requestApis: usage.req.filter(x => x.serverCount > 0).length,
                collectionApis: usage.collection.filter(x => x.serverCount > 0).length,
                prototypeHelpers: usage.prototype.filter(x => x.serverCount > 0).length,
                siteRootApis: uniqueRootApis(usage.site),
            },
        };
    };

    const compareUsage = function (expected, actual) {
        const categories = ['site', 'res', 'req', 'collection', 'prototype'];
        const missing = [];
        const added = [];
        for (const category of categories) {
            const a = new Set((expected?.usage?.[category] || []).filter(x => x.serverCount > 0).map(x => x.name));
            const b = new Set((actual?.usage?.[category] || []).filter(x => x.serverCount > 0).map(x => x.name));
            for (const name of a) if (!b.has(name)) missing.push({ category, name });
            for (const name of b) if (!a.has(name)) added.push({ category, name });
        }
        return { ok: missing.length === 0, missing, added };
    };

    const verifyProject = function (root, options = {}) {
        const report = scanProject(root, options);
        const missingSite = [];
        const customSite = [];
        for (const row of report.usage.site.filter(x => x.serverCount > 0)) {
            const result = resolvePath(site, row.name);
            if (!result.exists) customSite.push(row.name);
        }

        // Verify all observed collection method names against a real collection wrapper.
        // connectCollection() itself remains lazy and does not contact MongoDB here.
        let collection = null;
        try { collection = site.connectCollection({ collection: '__isite_compat__', db: '__isite_compat__' }); } catch (_) {}
        const missingCollection = [];
        if (collection) {
            for (const row of report.usage.collection.filter(x => x.serverCount > 0)) {
                if (typeof collection[row.name] === 'undefined') missingCollection.push(row.name);
            }
        }

        const required = Array.isArray(options.requiredSiteApis) ? options.requiredSiteApis : [];
        for (const name of required) {
            if (!resolvePath(site, name).exists && !missingSite.includes(name)) missingSite.push(name);
        }

        const requiredCollections = Array.isArray(options.requiredCollectionApis) ? options.requiredCollectionApis : [];
        if (collection) {
            for (const name of requiredCollections) {
                if (typeof collection[name] === 'undefined' && !missingCollection.includes(name)) missingCollection.push(name);
            }
        }

        const result = {
            ok: missingSite.length === 0 && missingCollection.length === 0 && report.parseErrors.length === 0,
            report,
            missingSite,
            missingCollection,
            // Smart Code adds many site.* helpers from its apps. They are reported but are
            // not treated as missing iSite APIs unless explicitly listed as required.
            customOrProjectSiteApis: customSite.sort(),
        };
        if (options.assert && !result.ok) {
            const error = new Error('iSite project compatibility verification failed');
            error.code = 'ISITE_PROJECT_COMPAT_MISMATCH';
            error.result = result;
            throw error;
        }
        return result;
    };

    const writeProjectManifest = function (root, output, options = {}) {
        const report = scanProject(root, options);
        const file = path.resolve(String(output));
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(report, null, 2) + '\n', 'utf8');
        return file;
    };

    site.compat = site.compat || {};
    site.compat.scanProject = scanProject;
    site.compat.verifyProject = verifyProject;
    site.compat.compareProjectUsage = compareUsage;
    site.compat.writeProjectManifest = writeProjectManifest;

    const previousHealth = site.health;
    if (typeof previousHealth === 'function') {
        site.health = function () {
            const out = previousHealth();
            out.compatibility = {
                projectScanner: true,
                namedContracts: typeof site.compat.check === 'function',
            };
            return out;
        };
    }

    return { version: 'v11', projectCompatibility: true };
};
