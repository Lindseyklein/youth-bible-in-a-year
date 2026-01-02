/*
  # Remove Email Verification System

  1. Changes
    - Drop `email_verifications` table
    - Remove `email_verified` and `email_verified_at` columns from profiles
    - Clean up related indexes and policies

  2. Security
    - All policies and triggers are automatically dropped with the table
*/

-- Drop email_verifications table (this also drops all policies and indexes)
DROP TABLE IF EXISTS email_verifications CASCADE;

-- Remove email verification columns from profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles DROP COLUMN email_verified;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE profiles DROP COLUMN email_verified_at;
  END IF;
END $$;