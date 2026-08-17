const fs = require('fs');
const path = require('path');

const env = fs.readFileSync('.env.local', 'utf8');
let supabaseUrl = '', serviceKey = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = l.split('=').slice(1).join('=');
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = l.split('=').slice(1).join('=');
});

const sql = fs.readFileSync(path.join('supabase', 'migrations', '013b_additional_fixes.sql'), 'utf8');

const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function run() {
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    console.log(`\n[${i + 1}/${statements.length}] ${stmt.substring(0, 80)}...`);
    try {
      const r = await fetch(supabaseUrl + '/rest/v1/rpc/exec_sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': 'Bearer ' + serviceKey,
        },
        body: JSON.stringify({ query: stmt })
      });
      const t = await r.text();
      if (r.ok) {
        console.log('  OK:', t);
      } else {
        console.log('  ERROR:', t);
      }
    } catch (e) {
      console.log('  FETCH ERROR:', e.message);
    }
  }
}
run();
