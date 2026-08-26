'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const modules = [
  ['diagnostics','performance.js'],['coreV3','core-v3.js'],['coreV4','core-v4.js'],['coreV5','core-v5.js'],['coreV6','core-v6.js'],['coreV7','core-v7.js'],['coreV8','core-v8.js'],['coreV9','core-v9.js'],['coreV10','core-v10.js'],['coreV11','core-v11.js'],['coreV15','core-v15.js'],['coreV16','core-v16.js'],['coreV17','core-v17.js'],['coreV18','core-v18.js']
];
function generate() {
  const out = ["'use strict';", '// GENERATED startup bundle. Original source modules remain public and authoritative.'];
  for (const [key, file] of modules) {
    const source = fs.readFileSync(path.join(root, 'lib', file), 'utf8');
    out.push(`const ${key} = (() => { const module = { exports: {} }; const exports = module.exports;\n${source}\nreturn module.exports; })();`);
  }
  out.push('module.exports = { ' + modules.map(x => x[0]).join(', ') + ' };');
  return out.join('\n\n') + '\n';
}
if (require.main === module) fs.writeFileSync(path.join(root, 'lib', 'core-startup-bundle.js'), generate(), 'utf8');
module.exports = { generate, modules };
