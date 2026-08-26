'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { modules: fullModules } = require('./build-service-startup-bundle.js');
const modules = fullModules.filter(([, file]) => file !== 'mongodb.js');
function generate() {
  const out = ['// GENERATED no-Mongo startup bundle. Original lib modules remain public and authoritative.', '// Intentionally no top-level strict mode: legacy modules may rely on sloppy-mode implicit globals.'];
  for (const [key, file] of modules) {
    const source = fs.readFileSync(path.join(root, 'lib', file), 'utf8');
    out.push(`const ${key} = (() => { const module = { exports: {} }; const exports = module.exports;\n${source}\nreturn module.exports; })();`);
  }
  out.push('module.exports = { ' + modules.map(x => x[0]).join(', ') + ' };');
  return out.join('\n\n') + '\n';
}
if (require.main === module) fs.writeFileSync(path.join(root, 'lib', 'service-startup-bundle-nomongo.js'), generate(), 'utf8');
module.exports = { generate, modules };
