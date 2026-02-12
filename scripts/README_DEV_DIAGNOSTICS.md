# Dev Diagnostics: Profiles constraints

Temporary dev-only tooling to verify `profiles` CHECK constraints after moving files.

**Expected constraints:**
- `profiles_user_role_check`: `user_role` IN (`'adult'`, `'leader'`, `'youth'`)
- `profiles_age_group_check`: `age_group` IN (`'teen'`, `'adult'`)

## 1. Apply the migration

Run migrations so the RPC exists:

```bash
supabase db push
# or apply migration 20260212120000_dev_diagnostics_profiles_constraints.sql in Dashboard
```

## 2. Run from command line

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key node scripts/run-dev-diagnostics-profiles.js
```

Or with env loaded from `.env`:

```bash
export $(grep -v '^#' .env | xargs) && node scripts/run-dev-diagnostics-profiles.js
```

Output confirms each constraint’s definition and whether it matches the expected values.

## 3. Run in Supabase SQL Editor

Open **Supabase Dashboard → SQL Editor** and run the contents of:

**`scripts/DEV_DIAGNOSTICS_PROFILES.sql`**

That file:
1. Lists the current definition of `profiles_user_role_check` and `profiles_age_group_check`.
2. Lists any rows where `user_role` is not one of `adult`, `leader`, `youth`.
3. Lists any rows where `age_group` is not one of `teen`, `adult`.

## 4. Call from the app (optional)

In any component with Supabase client:

```ts
const { data, error } = await supabase.rpc('dev_diagnostics_profiles_constraints');
if (!error) console.log('Profiles constraints:', data);
```

## Remove in production

The RPC `dev_diagnostics_profiles_constraints` is for development only. Drop it before production:

```sql
DROP FUNCTION IF EXISTS public.dev_diagnostics_profiles_constraints();
```
