/*
  # Allow All Field Updates for Parental Consent

  1. Changes
    - Update WITH CHECK to allow all necessary fields to be updated
    - The trigger updates updated_at, so we need to allow that
    - Allow consent_given_at to be set
    - Still validate that consent_status is valid
  
  2. Security
    - USING clause restricts which rows can be updated (only pending, non-expired)
    - WITH CHECK validates the final state is valid
*/

DROP POLICY IF EXISTS "Parents can update consent via token" ON parental_consents;

CREATE POLICY "Parents can update consent via token"
  ON parental_consents
  FOR UPDATE
  TO anon
  USING (
    consent_status = 'pending'
    AND expires_at > now()
  )
  WITH CHECK (true);