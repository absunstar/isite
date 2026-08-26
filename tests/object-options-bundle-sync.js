'use strict';
const fs=require('node:fs'); const path=require('node:path');
const builder=require('../scripts/build-object-options-startup-bundle.js');
const file=path.join(__dirname,'..','object-options','lib','startup-bundle.js');
const actual=fs.readFileSync(file,'utf8'); const expected=builder.generate();
if(actual!==expected){ console.error('object-options startup bundle is stale'); process.exit(1); }
console.log('object-options startup bundle sync PASS');
