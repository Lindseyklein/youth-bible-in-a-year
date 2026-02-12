/*
  # Dev Diagnostics: Profiles constraint definitions

  Temporary RPC for development to verify profiles CHECK constraints
  after moving files. Call via supabase.rpc('dev_diagnostics_profiles_constraints').

  Expected:
  - profiles_user_role_check: user_role IN ('adult', 'leader', 'youth')
  - profiles_age_group_check: age_group IN ('teen', 'adult')
*/

CREATE OR REPLACE FUNCTION public.dev_diagnostics_profiles_constraints()
RETURNS TABLE (
  constraint_name text,
  constraint_definition text,
  expected_note text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Return rows for both expected constraints (present or missing)
  RETURN QUERY
  WITH expected AS (
    SELECT 'profiles_user_role_check'::text AS cn, 'user_role IN (''adult'', ''leader'', ''youth'')'::text AS exp
    UNION ALL
    SELECT 'profiles_age_group_check', 'age_group IN (''teen'', ''adult'')'
  ),
  actual AS (
    SELECT
      c.conname::text AS constraint_name,
      pg_get_constraintdef(c.oid) AS constraint_definition
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = 'profiles'
      AND c.contype = 'c'
      AND c.conname IN ('profiles_user_role_check', 'profiles_age_group_check')
  )
  SELECT
    e.cn AS constraint_name,
    COALESCE(a.constraint_definition, '(constraint not found)') AS constraint_definition,
    e.exp AS expected_note,
    CASE
      WHEN a.constraint_definition IS NULL THEN 'MISSING'
      WHEN e.cn = 'profiles_user_role_check' AND a.constraint_definition ~ 'adult' AND a.constraint_definition ~ 'leader' AND a.constraint_definition ~ 'youth' THEN 'OK'
      WHEN e.cn = 'profiles_age_group_check' AND a.constraint_definition ~ 'teen' AND a.constraint_definition ~ 'adult' THEN 'OK'
      ELSE 'VERIFY_DEFINITION'
    END AS status
  FROM expected e
  LEFT JOIN actual a ON a.constraint_name = e.cn;
END;
$$;

COMMENT ON FUNCTION public.dev_diagnostics_profiles_constraints() IS
  'Dev-only: returns profiles CHECK constraint definitions. Expected: user_role IN (adult,leader,youth), age_group IN (teen,adult). Remove in production.';
