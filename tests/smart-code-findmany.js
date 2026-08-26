'use strict';
const fs = require('fs');
const path = require('path');

const root = process.env.SMART_CODE_DIR || process.argv[2];
if (!root) {
  console.error('SMART_CODE_DIR or project path is required');
  process.exit(2);
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    let st;
    try { st = fs.statSync(full); } catch { continue; }
    if (st.isDirectory()) {
      if (['node_modules', '.git', '.vs'].includes(name)) continue;
      walk(full, out);
    } else if (name.endsWith('.js')) out.push(full);
  }
  return out;
}

function findCalls(text, needle) {
  const calls = [];
  let from = 0;
  while (true) {
    const start = text.indexOf(needle, from);
    if (start < 0) break;
    const open = text.indexOf('(', start + needle.length);
    if (open < 0) break;
    let depth = 0, quote = '', escaped = false, lineComment = false, blockComment = false;
    let end = open;
    for (; end < text.length; end++) {
      const c = text[end], n = text[end + 1];
      if (lineComment) { if (c === '\n') lineComment = false; continue; }
      if (blockComment) { if (c === '*' && n === '/') { blockComment = false; end++; } continue; }
      if (quote) {
        if (escaped) escaped = false;
        else if (c === '\\') escaped = true;
        else if (c === quote) quote = '';
        continue;
      }
      if (c === '/' && n === '/') { lineComment = true; end++; continue; }
      if (c === '/' && n === '*') { blockComment = true; end++; continue; }
      if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
      if (c === '(') depth++;
      else if (c === ')' && --depth === 0) { end++; break; }
    }
    calls.push({ start, end, text: text.slice(start, end) });
    from = Math.max(end, start + needle.length);
  }
  return calls;
}

function splitTopLevelArgs(callText) {
  const open = callText.indexOf('('), close = callText.lastIndexOf(')');
  const body = callText.slice(open + 1, close);
  const args = [];
  let start = 0, paren = 0, brace = 0, bracket = 0, quote = '', escaped = false, lineComment = false, blockComment = false;
  for (let i = 0; i < body.length; i++) {
    const c = body[i], n = body[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === quote) quote = '';
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i++; continue; }
    if (c === '/' && n === '*') { blockComment = true; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '(') paren++; else if (c === ')') paren--;
    else if (c === '{') brace++; else if (c === '}') brace--;
    else if (c === '[') bracket++; else if (c === ']') bracket--;
    else if (c === ',' && paren === 0 && brace === 0 && bracket === 0) {
      args.push(body.slice(start, i).trim()); start = i + 1;
    }
  }
  args.push(body.slice(start).trim());
  return args;
}

function callbackInfo(src) {
  if (!src) return { kind: 'missing' };
  let m = src.match(/^\s*function\s*[^ (]*\s*\(([^)]*)\)\s*\{([\s\S]*)\}\s*$/);
  if (!m) m = src.match(/^\s*\(([^)]*)\)\s*=>\s*([\s\S]*)$/);
  if (!m) {
    const s = src.match(/^\s*([A-Za-z_$][\w$]*)\s*=>\s*([\s\S]*)$/);
    if (s) m = [s[0], s[1], s[2]];
  }
  if (!m) return { kind: 'dynamic' };
  const params = m[1].split(',').map(x => x.trim()).filter(Boolean).map(x => x.replace(/=.*$/, '').trim());
  const body = m[2] || '';
  const third = params[2];
  const thirdUsed = !!third && new RegExp('\\b' + third.replace(/[$]/g, '\\$&') + '\\b').test(body);
  const argumentsThird = /arguments\s*\[\s*2\s*\]/.test(body);
  return { kind: 'inline', params, third, thirdUsed, argumentsThird };
}

const report = {
  root: path.resolve(root),
  files: 0,
  calls: 0,
  noCountCandidates: [],
  countRequired: [],
  dynamicOrUnknown: [],
  summary: {},
};

for (const file of walk(root)) {
  report.files++;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  for (const call of findCalls(text, '.findMany')) {
    report.calls++;
    const args = splitTopLevelArgs(call.text);
    const cb = callbackInfo(args[1]);
    const item = { file: path.relative(root, file).replace(/\\/g, '/'), line: text.slice(0, call.start).split('\n').length, callback: cb, sample: call.text.slice(0, 500) };
    if (cb.kind === 'inline' && !cb.argumentsThird && (!cb.third || !cb.thirdUsed)) report.noCountCandidates.push(item);
    else if (cb.kind === 'inline' && (cb.thirdUsed || cb.argumentsThird)) report.countRequired.push(item);
    else report.dynamicOrUnknown.push(item);
  }
}
report.summary = {
  files: report.files,
  calls: report.calls,
  noCountCandidates: report.noCountCandidates.length,
  countRequired: report.countRequired.length,
  dynamicOrUnknown: report.dynamicOrUnknown.length,
  noCountCandidatePercent: report.calls ? +(report.noCountCandidates.length * 100 / report.calls).toFixed(1) : 0,
};

const out = process.env.SMART_CODE_FINDMANY_REPORT || path.join(process.cwd(), 'smart-code-findmany-report.json');
fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
console.log(JSON.stringify(report.summary, null, 2));
console.log('Report:', out);
