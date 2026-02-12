/**
 * Dev Diagnostics: Profiles constraints
 *
 * Run after applying migration 20260212120000_dev_diagnostics_profiles_constraints.sql.
 * Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in env.
 *
 * Usage:
 *   node scripts/run-dev-diagnostics-profiles.js
 * Or with env file:
 *   export $(grep -v '^#' .env | xargs) && node scripts/run-dev-diagnostics-profiles.js
 */

const { createClient } = require('@supabase/supabase-js');

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  console.log('--- Dev Diagnostics: profiles CHECK constraints ---\n');

  const { data, error } = await supabase.rpc('dev_diagnostics_profiles_constraints');

  if (error) {
    console.error('RPC error:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No constraint rows returned (table or RPC may not exist yet).');
    return;
  }

  for (const row of data) {
    console.log('Constraint:', row.constraint_name);
    console.log('Definition:', row.constraint_definition);
    console.log('Expected:  ', row.expected_note);
    console.log('Status:    ', row.status);
    console.log('');
  }

  const allOk = data.every((r) => r.status === 'OK');
  if (allOk) {
    console.log('Result: All constraints match expected (user_role: adult|leader|youth, age_group: teen|adult).');
  } else {
    console.log('Result: Review definitions above. Run SQL in scripts/DEV_DIAGNOSTICS_PROFILES.sql to verify and list violations.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
