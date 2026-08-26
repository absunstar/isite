'use strict';
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const projectRoot = path.resolve(__dirname, '..');
const roots = ['index.js', 'proxy.js', 'lib', 'object-options'].map((p) => path.join(projectRoot, p));
const files = [];
function walk(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      if (name === 'node_modules') continue;
      walk(path.join(p, name));
    }
  } else if (p.endsWith('.js')) files.push(p);
}
for (const root of roots) if (fs.existsSync(root)) walk(root);
for (const file of files) cp.execFileSync(process.execPath, ['-c', file], { stdio: 'pipe' });

const textExtensions = new Set([
  '.js', '.mjs', '.cjs', '.json', '.html', '.htm', '.css', '.md', '.txt', '.bat', '.cmd', '.ps1',
  '.xml', '.svg', '.yml', '.yaml', '.ini', '.conf', '.config', '.csv', '.ts', '.map', '.code-workspace'
]);
const textNames = new Set(['LICENSE', 'README', 'Dockerfile', '.gitignore', '.npmignore', '.editorconfig']);
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
const encodingFiles = [];
function walkText(p) {
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const name of fs.readdirSync(p)) {
      if (name === 'node_modules' || name === '.git') continue;
      walkText(path.join(p, name));
    }
    return;
  }
  const ext = path.extname(p).toLowerCase();
  if (textExtensions.has(ext) || textNames.has(path.basename(p))) encodingFiles.push(p);
}
walkText(projectRoot);
for (const file of encodingFiles) {
  const data = fs.readFileSync(file);
  if (data.length >= 2 && ((data[0] === 0xff && data[1] === 0xfe) || (data[0] === 0xfe && data[1] === 0xff))) {
    throw new Error(`UTF-16 is not allowed: ${path.relative(projectRoot, file)}`);
  }
  if (data.length >= 3 && data[0] === 0xef && data[1] === 0xbb && data[2] === 0xbf) {
    throw new Error(`UTF-8 BOM is not allowed; save as UTF-8 without BOM: ${path.relative(projectRoot, file)}`);
  }
  try {
    utf8Decoder.decode(data);
  } catch (error) {
    throw new Error(`File is not valid UTF-8: ${path.relative(projectRoot, file)} (${error.message})`);
  }
}
console.log(`Static syntax check passed: ${files.length} JavaScript files`);
console.log(`UTF-8 encoding check passed: ${encodingFiles.length} text files`);
