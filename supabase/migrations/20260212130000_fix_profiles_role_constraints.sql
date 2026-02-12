/*
  # Fix Profiles Role Constraints

  Ensures profiles CHECK constraints enforce:
  - user_role: exactly 'adult', 'leader', 'youth' (default 'youth')
  - age_group: exactly 'teen', 'adult' (nullable)

  1. Backfill existing rows to valid values (map old roles to new)
  2. Drop any existing CHECK constraints on these columns
  3. Set default for user_role to 'youth'
  4. Add profiles_user_role_check and profiles_age_group_check
*/

-- 1) Backfill user_role to allowed values (adult, leader, youth)
UPDATE public.profiles
SET user_role = CASE
  WHEN user_role IN ('youth_leader', 'admin') THEN 'leader'
  WHEN user_role IN ('youth_member', 'student') THEN 'youth'
  WHEN user_role = 'parent' THEN 'adult'
  ELSE 'youth'
END
WHERE user_role IS NOT NULL AND user_role NOT IN ('adult', 'leader', 'youth');

-- 2) Backfill age_group to allowed values (teen, adult); map under13 -> teen (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'age_group'
  ) THEN
    UPDATE public.profiles
    SET age_group = CASE
      WHEN age_group IN ('teen', 'adult') THEN age_group
      WHEN age_group = 'under13' THEN 'teen'
      ELSE 'teen'
    END
    WHERE age_group IS NOT NULL AND age_group <> '' AND age_group NOT IN ('teen', 'adult');
  END IF;
END $$;

-- 3) Drop existing CHECK constraints if they exist
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_role_check;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_age_group_check;

-- 4) Set default for user_role so new rows get 'youth'
ALTER TABLE public.profiles
  ALTER COLUMN user_role SET DEFAULT 'youth';

-- 5) Add CHECK constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_user_role_check
  CHECK (user_role IS NULL OR user_role IN ('adult', 'leader', 'youth'));

-- Only add age_group constraint if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'age_group'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_age_group_check
      CHECK (age_group IS NULL OR age_group IN ('teen', 'adult'));
  END IF;
END $$;
