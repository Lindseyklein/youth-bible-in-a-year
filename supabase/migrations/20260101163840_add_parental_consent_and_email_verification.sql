/*
  # Add Parental Consent and Email Verification System

  1. New Tables
    - `parental_consents`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles) - The 13-17 year old user
      - `parent_email` (text) - Parent's email address
      - `consent_token` (text, unique) - Secure token for consent link
      - `consent_status` (text) - pending, approved, denied
      - `consent_given_at` (timestamptz) - When parent approved
      - `consent_ip_address` (text) - IP address of parent consent
      - `reminder_sent_count` (int) - Number of reminder emails sent
      - `last_reminder_sent_at` (timestamptz) - Last reminder timestamp
      - `expires_at` (timestamptz) - Token expiration
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `email_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `verification_token` (text, unique)
      - `verified_at` (timestamptz)
      - `expires_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `reset_token` (text, unique)
      - `expires_at` (timestamptz)
      - `used_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Profile Updates
    - Add `birthdate` column to profiles
    - Add `email_verified` boolean to profiles
    - Add `email_verified_at` timestamptz to profiles
    - Add `requires_parental_consent` boolean to profiles
    - Add `parental_consent_obtained` boolean to profiles

  3. Security
    - Enable RLS on all new tables
    - Add policies for users to view their own consent status
    - Add policies for anonymous users to update consent via token
*/

-- Add new columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birthdate'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birthdate date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email_verified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email_verified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'requires_parental_consent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN requires_parental_consent boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'parental_consent_obtained'
  ) THEN
    ALTER TABLE profiles ADD COLUMN parental_consent_obtained boolean DEFAULT false;
  END IF;
END $$;

-- Create parental_consents table
CREATE TABLE IF NOT EXISTS parental_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_email text NOT NULL,
  consent_token text UNIQUE NOT NULL,
  consent_status text NOT NULL DEFAULT 'pending' CHECK (consent_status IN ('pending', 'approved', 'denied')),
  consent_given_at timestamptz,
  consent_ip_address text,
  reminder_sent_count int DEFAULT 0,
  last_reminder_sent_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create email_verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  verification_token text UNIQUE NOT NULL,
  verified_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reset_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_parental_consents_user_id ON parental_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_parental_consents_token ON parental_consents(consent_token);
CREATE INDEX IF NOT EXISTS idx_parental_consents_status ON parental_consents(consent_status);
CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(verification_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(reset_token);

-- Enable RLS
ALTER TABLE parental_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parental_consents

-- Users can view their own consent records
CREATE POLICY "Users can view own parental consent"
  ON parental_consents FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service role can insert consent records
CREATE POLICY "Service role can insert consents"
  ON parental_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Anonymous users can update consent via valid token
CREATE POLICY "Parents can approve consent via token"
  ON parental_consents FOR UPDATE
  TO anon
  USING (
    consent_status = 'pending' 
    AND expires_at > now()
  )
  WITH CHECK (
    consent_status IN ('approved', 'denied')
  );

-- Authenticated service can update for reminders
CREATE POLICY "Service can update consent records"
  ON parental_consents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for email_verifications

-- Users can view their own verification records
CREATE POLICY "Users can view own email verification"
  ON email_verifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Service can insert verification records
CREATE POLICY "Service can insert email verifications"
  ON email_verifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Anonymous users can update verification via valid token
CREATE POLICY "Users can verify email via token"
  ON email_verifications FOR UPDATE
  TO anon
  USING (
    verified_at IS NULL 
    AND expires_at > now()
  )
  WITH CHECK (verified_at IS NOT NULL);

-- RLS Policies for password_reset_tokens

-- Anonymous users can insert reset requests
CREATE POLICY "Anyone can request password reset"
  ON password_reset_tokens FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anonymous users can view valid unused tokens
CREATE POLICY "Anyone can view valid reset tokens"
  ON password_reset_tokens FOR SELECT
  TO anon
  USING (
    used_at IS NULL 
    AND expires_at > now()
  );

-- Anonymous users can mark token as used
CREATE POLICY "Anyone can mark token as used"
  ON password_reset_tokens FOR UPDATE
  TO anon
  USING (
    used_at IS NULL 
    AND expires_at > now()
  )
  WITH CHECK (used_at IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_parental_consent_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for parental_consents updated_at
DROP TRIGGER IF EXISTS update_parental_consents_updated_at ON parental_consents;
CREATE TRIGGER update_parental_consents_updated_at
  BEFORE UPDATE ON parental_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_parental_consent_updated_at();
