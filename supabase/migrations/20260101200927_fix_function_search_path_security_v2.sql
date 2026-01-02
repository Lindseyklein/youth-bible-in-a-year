/*
  # Fix Function Search Path Security V2

  1. Changes
    - Set search_path to empty for security functions
    - Prevents schema injection attacks
    - Makes functions use fully qualified names

  2. Functions Updated
    - update_parental_consent_updated_at
    - set_age_based_restrictions
    - can_user_access_app

  3. Security Impact
    - Prevents malicious schema manipulation
    - Ensures functions always reference correct schema objects
*/

-- Update update_parental_consent_updated_at function
CREATE OR REPLACE FUNCTION update_parental_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Update set_age_based_restrictions function
CREATE OR REPLACE FUNCTION set_age_based_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age_group = 'under13' THEN
    NEW.account_restrictions = jsonb_build_object(
      'dataSharing', false,
      'targetedAds', false,
      'canJoinGroups', true,
      'canDirectMessage', false
    );
  ELSIF NEW.age_group = 'teen' THEN
    NEW.account_restrictions = jsonb_build_object(
      'dataSharing', false,
      'targetedAds', false,
      'canJoinGroups', true,
      'canDirectMessage', true
    );
  ELSE
    NEW.account_restrictions = jsonb_build_object(
      'dataSharing', true,
      'targetedAds', true,
      'canJoinGroups', true,
      'canDirectMessage', true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

-- Update can_user_access_app function (keeping same parameter name)
CREATE OR REPLACE FUNCTION can_user_access_app(user_id uuid)
RETURNS boolean AS $$
DECLARE
  user_profile RECORD;
BEGIN
  SELECT 
    age_group,
    requires_parental_consent,
    parental_consent_obtained
  INTO user_profile
  FROM public.profiles
  WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  IF user_profile.requires_parental_consent AND NOT user_profile.parental_consent_obtained THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';