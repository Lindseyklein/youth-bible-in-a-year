/*
  # Make invite code optional in user_invites table

  1. Changes
    - Remove NOT NULL constraint from invite_code column
    - Remove UNIQUE constraint from invite_code column
    - Drop the default value generator

  2. Reason
    - Moving to a direct invitation system without codes
    - Users now send invites directly to email/phone
    - When friend signs up with that contact, they auto-connect
*/

-- Make invite_code nullable and remove unique constraint
ALTER TABLE user_invites 
  ALTER COLUMN invite_code DROP NOT NULL,
  ALTER COLUMN invite_code DROP DEFAULT;

-- Drop the unique constraint on invite_code
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_invites_invite_code_key'
  ) THEN
    ALTER TABLE user_invites DROP CONSTRAINT user_invites_invite_code_key;
  END IF;
END $$;
