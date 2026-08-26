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
console.log(`Static syntax check passed: ${files.length} JavaScript files`);
