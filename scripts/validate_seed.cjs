// Simple SQL sanity checker for the generated seed file.
const fs = require('fs');
const sql = fs.readFileSync(process.argv[2] || '/workspace/supabase/seed_products_v3.sql', 'utf8');

let stmts = [], cur = '', inQ = false;
for (let i = 0; i < sql.length; i++) {
  const ch = sql[i];
  if (ch === "'") {
    if (inQ && sql[i + 1] === "'") { cur += "''"; i++; continue; }
    inQ = !inQ;
  }
  if (ch === ';' && !inQ) { stmts.push(cur); cur = ''; } else cur += ch;
}
if (cur.trim()) stmts.push(cur);

const real = stmts.filter((s) => {
  const t = s.replace(/--[^\n]*\n/g, '').trim();
  return t.length > 0;
});

console.log('statements:', real.length);
console.log('inserts:', real.filter((s) => /insert into/i.test(s)).length);
console.log('alters:', real.filter((s) => /alter table/i.test(s)).length);
console.log('products inserts:', real.filter((s) => /insert into public\.products/i.test(s)).length);
console.log('categories inserts:', real.filter((s) => /insert into public\.categories/i.test(s)).length);

let bad = 0;
for (const s of real) {
  const stripped = s.replace(/--[^\n]*/g, '').replace(/''/g, '');
  const quotes = (stripped.match(/'/g) || []).length;
  if (quotes % 2 !== 0) { bad++; console.log('UNBALANCED QUOTES:', s.slice(0, 100)); }
  const opens = (stripped.match(/\(/g) || []).length;
  const closes = (stripped.match(/\)/g) || []).length;
  if (opens !== closes) { bad++; console.log('UNBALANCED PARENS:', s.slice(0, 100)); }
}
console.log('problem statements:', bad);
process.exit(bad === 0 ? 0 : 1);
