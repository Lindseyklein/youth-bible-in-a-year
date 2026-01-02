/*
  # Add User Start Date for Personalized Bible Plan

  1. Changes
    - Add `start_date` column to profiles table
    - Default to current timestamp for new users
    - Update existing users to have a start_date of today
    - Update profile creation trigger to set start_date

  2. Purpose
    - Track when each user starts their Bible journey
    - Calculate personalized week/day based on their start date
    - Ensure all users start at Week 1, Day 1 regardless of signup date
*/

-- Add start_date column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN start_date timestamptz DEFAULT now();
  END IF;
END $$;

-- Update existing profiles to have a start_date if null
UPDATE profiles 
SET start_date = now() 
WHERE start_date IS NULL;

-- Update the trigger to set start_date for new users
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  base_username text;
  final_username text;
  counter int := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );
  
  final_username := base_username;
  
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        username,
        display_name,
        age_verified,
        parental_consent_given,
        privacy_policy_accepted,
        start_date
      )
      VALUES (
        NEW.id,
        NEW.email,
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', base_username),
        false,
        false,
        false,
        now()
      );
      
      EXIT;
      
    EXCEPTION WHEN unique_violation THEN
      counter := counter + 1;
      final_username := base_username || counter::text;
      
      IF counter > 100 THEN
        RAISE EXCEPTION 'Could not generate unique username after 100 attempts';
      END IF;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$;