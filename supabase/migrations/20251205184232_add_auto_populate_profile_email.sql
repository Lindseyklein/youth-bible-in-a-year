/*
  # Auto-Populate Profile Email from Auth

  1. Changes
    - Create trigger function to automatically populate email in profiles table
    - Trigger fires when a new user signs up in auth.users
    - Also updates email if it changes in auth.users
    - Ensures email is always in sync between auth.users and profiles

  2. Security
    - Function runs with security definer privileges
    - Automatically handles email population
    - No user action required

  3. Notes
    - This is a backup to the application-level code
    - Ensures data consistency even if app code fails
    - Works for both new signups and existing users
*/

-- Function to handle new user signup and sync email
CREATE OR REPLACE FUNCTION handle_new_user_profile()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert a new profile if it doesn't exist
  INSERT INTO public.profiles (id, email, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_profile();

-- Function to sync email when it changes in auth.users
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update profile email if auth email changed
  IF OLD.email IS DISTINCT FROM NEW.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to sync email updates
DROP TRIGGER IF EXISTS on_auth_user_email_changed ON auth.users;
CREATE TRIGGER on_auth_user_email_changed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION sync_profile_email();

-- Update existing profiles that don't have email set
UPDATE profiles
SET email = auth.users.email
FROM auth.users
WHERE profiles.id = auth.users.id
  AND profiles.email IS NULL;
