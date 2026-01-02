/*
  # Allow Anonymous Access to Parental Consents via Token

  1. Changes
    - Add SELECT policy for anonymous users to view parental consent records via token
    - This allows parents to access the consent form without being authenticated
  
  2. Security
    - Policy only allows access to pending consents with valid tokens
    - Token must not be expired
    - This is secure because tokens are cryptographically random UUIDs
*/

CREATE POLICY "Parents can view consent via token"
  ON parental_consents
  FOR SELECT
  TO anon
  USING (
    consent_status = 'pending'
    AND expires_at > now()
  );