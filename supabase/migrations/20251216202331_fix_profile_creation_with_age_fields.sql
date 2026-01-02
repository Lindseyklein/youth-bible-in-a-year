/*
  # Fix Profile Creation with Age Verification Fields

  1. Problem
    - The handle_new_user_profile() trigger function doesn't account for new age verification fields
    - This causes "Database error saving new user" during sign-up

  2. Solution
    - Update handle_new_user_profile() to properly set defaults for age fields
    - Ensure trigger works with both age-verified and non-age-verified sign-ups

  3. Changes
    - Modify handle_new_user_profile() function to include proper defaults
*/

-- Update function to handle new user signup with age verification fields
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    display_name,
    age_verified,
    parental_consent_given,
    privacy_policy_accepted
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    false,
    false,
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;