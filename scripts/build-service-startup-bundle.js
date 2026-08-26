'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const modules = [
  ['data','data.js'],['fsm','fsm.js'],['routing','routing.js'],['vars','vars.js'],['mongodb','mongodb.js'],
  ['words','words.js'],['storage','storage.js'],['logs','logs.js'],['ws','ws.js'],['wsClient','wsClient.js'],
  ['email','email.js'],['integrated','integrated.js'],['browser','browser.js'],['helper','helper.js'],['pdf','pdf.js'],
  ['app','app.js'],['evalMod','eval.js'],['proxy','proxy.js'],['sessions','sessions.js'],['cookie','cookie.js'],
  ['session','session.js'],['parser','parser.js'],['dashboard','dashboard.js']
];
function generate() {
  const out = ["'use strict';", '// GENERATED startup bundle. Original lib modules remain public and authoritative.'];
  for (const [key, file] of modules) {
    const source = fs.readFileSync(path.join(root, 'lib', file), 'utf8');
    out.push(`const ${key} = (() => { const module = { exports: {} }; const exports = module.exports;\n${source}\nreturn module.exports; })();`);
  }
  out.push('module.exports = { ' + modules.map(x => x[0]).join(', ') + ' };');
  return out.join('\n\n') + '\n';
}
if (require.main === module) fs.writeFileSync(path.join(root, 'lib', 'service-startup-bundle.js'), generate(), 'utf8');
module.exports = { generate, modules };
