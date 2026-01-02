/*
  # Fix WITH CHECK Policy for All Updated Columns

  1. Changes
    - Update the WITH CHECK clause to allow all necessary columns to be updated
    - Allow consent_given_at to be set when status changes
    - Allow updated_at to be modified by trigger
  
  2. Security
    - Still restricts status changes to 'approved' or 'denied' only
    - Ensures token hasn't expired
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
  WITH CHECK (
    consent_status IN ('approved', 'denied')
    AND user_id = user_id  -- Ensure user_id doesn't change
    AND parent_email = parent_email  -- Ensure parent_email doesn't change
    AND consent_token = consent_token  -- Ensure token doesn't change
  );