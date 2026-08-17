const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=').slice(1).join('=');
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=').slice(1).join('=');
});

async function q(table, select, filter) {
  let u = url + '/rest/v1/' + table + '?select=' + select;
  if (filter) u += '&' + filter;
  const r = await fetch(u, { headers: { 'apikey': key, 'Authorization': 'Bearer ' + key } });
  const t = await r.text();
  try { return JSON.parse(t); } catch(e) { return { error: t.substring(0, 200) }; }
}

async function main() {
  // pg_policies isn't exposed via PostgREST, use a workaround
  // Just check if notification_preferences table works with our new policies
  
  // Try to read from notification_preferences (should work for authenticated users)
  const notifPrefs = await q('notification_preferences', '*', 'limit=1');
  console.log('=== notification_preferences table ===');
  console.log(notifPrefs);

  // Check articles table
  const articles = await q('articles', 'id,status,visibility,author_id', 'limit=3');
  console.log('\n=== articles (sample) ===');
  if (Array.isArray(articles)) {
    articles.forEach(a => console.log(' ', a.id?.substring(0,8), '-', a.status, '-', a.visibility));
  } else {
    console.log(articles);
  }

  // Check if notification_preferences has unique constraint by trying insert
  // Just verify table exists and is accessible
  const notifCount = await q('notification_preferences', '*', 'limit=1');
  console.log('\n=== notification_preferences accessible:', Array.isArray(notifCount), '===');
  
  // Check profiles for admin
  const profiles = await q('profiles', 'id,role', 'limit=3');
  console.log('\n=== profiles (sample) ===');
  if (Array.isArray(profiles)) {
    profiles.forEach(p => console.log(' ', p.id?.substring(0,8), '-', p.role));
  } else {
    console.log(profiles);
  }
}

main().catch(e => console.error(e));
