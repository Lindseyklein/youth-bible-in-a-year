-- =============================================================================
-- Dev Diagnostics: Profiles constraints
-- Run this in Supabase Dashboard → SQL Editor to verify constraints and
-- list any rows that violate them.
-- Expected: user_role IN ('adult','leader','youth'), age_group IN ('teen','adult')
-- =============================================================================

-- 1) Constraint definitions (same as RPC dev_diagnostics_profiles_constraints)
SELECT
  c.conname AS constraint_name,
  pg_get_constraintdef(c.oid) AS constraint_definition,
  CASE c.conname
    WHEN 'profiles_user_role_check' THEN 'Expected: user_role IN (''adult'', ''leader'', ''youth'')'
    WHEN 'profiles_age_group_check' THEN 'Expected: age_group IN (''teen'', ''adult'')'
    ELSE NULL
  END AS expected_note
FROM pg_constraint c
JOIN pg_class t ON t.oid = c.conrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND t.relname = 'profiles'
  AND c.contype = 'c'
  AND c.conname IN ('profiles_user_role_check', 'profiles_age_group_check')
ORDER BY c.conname;

-- 2) Rows that violate user_role (if column exists; adjust allowed values to match your constraint)
-- Allowed: exactly 'adult', 'leader', 'youth'
SELECT id, username, display_name, user_role AS value, 'user_role' AS column_name
FROM public.profiles
WHERE user_role IS NOT NULL
  AND user_role NOT IN ('adult', 'leader', 'youth')
ORDER BY id;

-- 3) Rows that violate age_group (if column exists)
-- Allowed: exactly 'teen', 'adult'
SELECT id, username, display_name, age_group AS value, 'age_group' AS column_name
FROM public.profiles
WHERE age_group IS NOT NULL
  AND age_group NOT IN ('teen', 'adult')
ORDER BY id;

-- Optional: call the RPC (after migration is applied) for a single combined result
-- SELECT * FROM public.dev_diagnostics_profiles_constraints();
