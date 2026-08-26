'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const modules = [
  ['fn','fn.js'], ['safty','safty.js'], ['prototype','prototype.js'],
  ['strings','strings.js'], ['features','features.js'], ['constMod','const.js'], ['event','event.js']
];
function generate() {
  const out = [
    '// GENERATED object-options startup bundle. Original modules remain public and authoritative.',
    '// Intentionally no top-level strict mode: preserve legacy sloppy-mode semantics.'
  ];
  for (const [key, file] of modules) {
    const source = fs.readFileSync(path.join(root, 'object-options', 'lib', file), 'utf8');
    out.push(`const ${key} = (() => { const module = { exports: {} }; let exports = module.exports;\n${source}\nreturn module.exports; })();`);
  }
  out.push('module.exports = { ' + modules.map(x => x[0]).join(', ') + ' };');
  return out.join('\n\n') + '\n';
}
if (require.main === module) fs.writeFileSync(path.join(root, 'object-options', 'lib', 'startup-bundle.js'), generate(), 'utf8');
module.exports = { generate, modules };
