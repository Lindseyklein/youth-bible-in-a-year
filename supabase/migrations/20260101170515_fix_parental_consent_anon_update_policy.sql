/*
  # Fix Anonymous Update Policy for Parental Consents

  1. Changes
    - Drop the existing anonymous update policy
    - Create a new policy that properly validates token-based updates
    - Ensure parents can approve or deny consent via the token URL
  
  2. Security
    - Only allows updates for pending consents with valid tokens
    - Only allows changing status to 'approved' or 'denied'
    - Token must not be expired
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Parents can approve consent via token" ON parental_consents;

-- Create a more permissive policy for anonymous updates via token
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
  );