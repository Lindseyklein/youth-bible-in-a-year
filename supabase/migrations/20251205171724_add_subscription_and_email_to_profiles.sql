/*
  # Add Subscription and Email Fields to Profiles

  1. Changes to `profiles` table:
    - Add `email` (text) - User's email address for Polar subscription lookup
    - Add `subscription_status` (text) - Status: 'none', 'trial', 'active', 'expired', 'cancelled'
    - Add `subscription_started_at` (timestamptz) - When subscription started
    - Add `subscription_ends_at` (timestamptz) - When subscription ends or trial expires
    - Add `polar_customer_id` (text) - Polar customer identifier for webhook verification
    - Add `has_seen_trial_modal` (boolean) - Track if user has seen the trial modal

  2. Security:
    - Email is required for subscription management
    - All fields have appropriate defaults
    - RLS policies remain unchanged as they're already set up for profiles
*/

-- Add email field (required for Polar subscription lookup)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN email text;
  END IF;
END $$;

-- Add subscription status tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'none';
  END IF;
END $$;

-- Add subscription start date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz;
  END IF;
END $$;

-- Add subscription end date
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_ends_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_ends_at timestamptz;
  END IF;
END $$;

-- Add Polar customer ID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'polar_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN polar_customer_id text;
  END IF;
END $$;

-- Add trial modal tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'has_seen_trial_modal'
  ) THEN
    ALTER TABLE profiles ADD COLUMN has_seen_trial_modal boolean DEFAULT false;
  END IF;
END $$;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Create index on polar_customer_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_profiles_polar_customer_id ON profiles(polar_customer_id);