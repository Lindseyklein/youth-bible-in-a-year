-- Run this in Supabase SQL Editor. Replace 'your@email.com' with your developer account email.

-- 1) Add column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_developer_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_developer_admin boolean DEFAULT false;
  END IF;
END $$;

-- 2) Backfill NULL to false
UPDATE public.profiles
SET is_developer_admin = false
WHERE is_developer_admin IS NULL;

-- 3) Set developer admin for your account (replace email)
UPDATE public.profiles
SET is_developer_admin = true
WHERE email = 'your@email.com';
