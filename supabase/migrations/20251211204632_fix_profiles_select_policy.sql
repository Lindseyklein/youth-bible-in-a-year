/*
  # Fix profiles SELECT policy
  
  The groups table RLS policies reference the profiles table to check is_admin status,
  but there's no SELECT policy on profiles allowing this query to succeed.
  
  This migration adds a SELECT policy to allow authenticated users to read profiles.
*/

-- Add SELECT policy for profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can view profiles'
  ) THEN
    CREATE POLICY "Users can view profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
