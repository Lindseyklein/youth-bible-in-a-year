/*
  # Add User Start Date Tracking

  1. Changes to Tables
    - `user_streaks`
      - Add `start_date` (date) - The date when user first started their Bible reading journey
      - Defaults to the date when the row is created
  
  2. Purpose
    - Track when each user begins their Bible reading plan
    - Calculate user-specific day numbers (Day 1 for each user starts on their start_date)
    - Show verse of the day relative to user's journey, not calendar date
    - Each user gets a personalized experience starting from Day 1

  3. Security
    - No changes to RLS policies needed
    - Existing policies already protect user_streaks data
*/

-- Add start_date column to user_streaks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN start_date date DEFAULT CURRENT_DATE;
  END IF;
END $$;

-- Update existing users to have start_date set to today if not already set
UPDATE user_streaks
SET start_date = CURRENT_DATE
WHERE start_date IS NULL;