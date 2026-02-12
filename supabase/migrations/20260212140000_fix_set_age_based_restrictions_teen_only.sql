/*
  # Fix set_age_based_restrictions for teen|adult only

  profiles.age_group now allows only 'teen' | 'adult' (constraint).
  Remove 'under13' branch; treat 'teen' as the restricted group.
*/

CREATE OR REPLACE FUNCTION set_age_based_restrictions()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age_group = 'teen' THEN
    NEW.account_restrictions = jsonb_build_object(
      'dataSharing', false,
      'targetedAds', false,
      'canJoinGroups', true,
      'canDirectMessage', true
    );
  ELSIF NEW.age_group = 'adult' THEN
    NEW.account_restrictions = jsonb_build_object(
      'dataSharing', true,
      'targetedAds', true,
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
