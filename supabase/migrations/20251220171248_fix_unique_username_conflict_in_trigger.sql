/*
  # Fix Username Conflict in Profile Creation Trigger

  1. Problem
    - handle_new_user_profile() trigger fails when username already exists
    - ON CONFLICT only handles id conflicts, not username conflicts
    - This causes "Database error saving new user" errors

  2. Solution
    - Generate unique usernames by appending random suffix if conflict occurs
    - Use a loop to ensure uniqueness

  3. Changes
    - Update handle_new_user_profile() to handle username conflicts gracefully
*/

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
        privacy_policy_accepted
      )
      VALUES (
        NEW.id,
        NEW.email,
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'display_name', base_username),
        false,
        false,
        false
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