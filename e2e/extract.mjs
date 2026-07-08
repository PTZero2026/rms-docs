import fs from 'node:fs';
const r = JSON.parse(fs.readFileSync('results.json', 'utf8'));
const out = [];
const walk = (s) => {
  for (const spec of s.specs || []) {
    for (const t of spec.tests) {
      const res = (t.results && t.results[0]) || {};
      out.push({ file: (s.file || spec.file || '').replace(/\\/g, '/').split('/').pop(), title: spec.title, ok: !!t.ok, status: res.status, dur: Math.round(res.duration || 0) });
    }
  }
  for (const c of s.suites || []) walk(c);
};
walk(r);
const byFile = {};
for (const t of out) (byFile[t.file] = byFile[t.file] || []).push(t);
console.log(JSON.stringify({ total: out.length, passed: out.filter((t) => t.ok).length, byFile }, null, 1));
