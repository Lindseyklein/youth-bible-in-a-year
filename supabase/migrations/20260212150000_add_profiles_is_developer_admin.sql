/*
  # Add profiles.is_developer_admin

  Developer admin is separate from user_role. Only this flag gates
  developer/admin features (e.g. dev diagnostics); user_role stays
  adult|leader|youth for product roles.
*/

-- Add column (default false for new rows)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_developer_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_developer_admin boolean DEFAULT false;
  END IF;
END $$;

-- Backfill existing rows to false (in case any were created with NULL)
UPDATE public.profiles
SET is_developer_admin = false
WHERE is_developer_admin IS NULL;

/*
  To enable developer admin for your account (run in Supabase SQL Editor):
  UPDATE public.profiles SET is_developer_admin = true WHERE email = 'your@email.com';
*/
