/*
  # Add User Role to Profiles

  1. Changes to `profiles` table:
    - Add `user_role` (text) - Role: 'youth_leader' or 'youth_member'
    - Default is 'youth_member'

  2. Changes to `user_invites` table:
    - Add `invitee_phone` (text) - Phone number (optional)

  3. Create index on user_role for filtering
*/

-- Add user_role to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_role text DEFAULT 'youth_member';
  END IF;
END $$;

-- Add phone number to user_invites if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_invites' AND column_name = 'invitee_phone'
  ) THEN
    ALTER TABLE user_invites ADD COLUMN invitee_phone text;
  END IF;
END $$;

-- Create index on user_role for filtering
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);
