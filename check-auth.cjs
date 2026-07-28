const { createClient } = require('@supabase/supabase-js');
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieGliZXBwY25ubXJ4aHJtYW5mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDk4MjUzNSwiZXhwIjoyMTAwNTU4NTM1fQ.pnIoxJS5svMWrWjMPxrGPQpTe3EVmvu_TZ2sYHqBBqs';
const supabase = createClient('https://pbxibeppcnnmrxhrmanf.supabase.co', SERVICE_KEY);

async function main() {
  // Try querying auth schema tables via PostgREST
  const tables = ['schema_migrations', 'config', 'providers', 'settings', 'sso_providers', 'saml_providers', 'flow_state'];
  let found = false;
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        console.log(`auth.${table}: EXISTS —`, data ? 'has data' : 'empty');
        found = true;
      }
    } catch(e) {
      // Table might be in different schema
    }
  }

  if (!found) {
    // Try direct PostgREST call with auth schema
    console.log('Trying direct PostgREST calls...');
    try {
      const url = `https://pbxibeppcnnmrxhrmanf.supabase.co/rest/v1/`;
      const res = await fetch(url + '?select=1&limit=1', {
        headers: { 
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Accept-Profile': 'auth'
        }
      });
      console.log('Root status:', res.status);
      const text = await res.text();
      console.log(text.substring(0, 300));
    } catch(e) {
      console.log('Error:', e.message);
    }

    // Try to access auth schema tables
    for (const table of ['config', 'schema_migrations', 'providers']) {
      try {
        const url = `https://pbxibeppcnnmrxhrmanf.supabase.co/rest/v1/${table}`;
        const res = await fetch(url + '?limit=1', {
          headers: { 
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
            'Accept-Profile': 'auth'
          }
        });
        console.log(`${table} status:`, res.status);
        if (res.ok) {
          const data = await res.json();
          console.log(JSON.stringify(data).substring(0, 500));
        }
      } catch(e) {
        console.log(`${table} error:`, e.message);
      }
    }
  }
}
main().catch(console.error);
