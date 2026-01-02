/*
  # Simplify Anonymous Update Policy

  1. Changes
    - Simplify WITH CHECK to only validate the status change
    - Remove redundant checks that were causing issues
  
  2. Security
    - Validates status is being set to 'approved' or 'denied'
    - USING clause ensures only pending, non-expired consents can be updated
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
    consent_status = ANY (ARRAY['approved'::text, 'denied'::text])
  );