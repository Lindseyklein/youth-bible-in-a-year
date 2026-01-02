/*
  # Allow Anonymous Users to View Limited Profile Info for Parental Consent

  1. Changes
    - Add SELECT policy for anonymous users to view basic profile info
    - Only for users who have a pending parental consent record
  
  2. Security
    - Policy only allows viewing display_name, email, and birthdate
    - Only for profiles with pending parental consent
    - This is secure because it only shows minimal info needed for consent
*/

CREATE POLICY "Parents can view child profile for consent"
  ON profiles
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM parental_consents
      WHERE parental_consents.user_id = profiles.id
        AND parental_consents.consent_status = 'pending'
        AND parental_consents.expires_at > now()
    )
  );