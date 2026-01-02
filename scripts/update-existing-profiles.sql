-- Update existing profiles to set default subscription values
-- Run this if you have existing users who signed up before the subscription fields were added

UPDATE profiles
SET
  subscription_status = COALESCE(subscription_status, 'none'),
  has_seen_trial_modal = COALESCE(has_seen_trial_modal, false)
WHERE
  subscription_status IS NULL
  OR has_seen_trial_modal IS NULL;
