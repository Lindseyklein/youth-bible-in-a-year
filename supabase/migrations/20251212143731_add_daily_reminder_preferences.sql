/*
  # Add Daily Reminder Preferences
  
  1. Changes
    - Add `reminder_enabled` (boolean) column to profiles table to track if user wants reminders
    - Add `reminder_time` (time) column to profiles table to store user's preferred reminder time
    - Set default reminder_enabled to false
    - Set default reminder_time to 09:00:00 (9 AM)
  
  2. Security
    - No changes to RLS policies needed - existing policies cover these new columns
*/

-- Add reminder preferences columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'reminder_enabled'
  ) THEN
    ALTER TABLE profiles ADD COLUMN reminder_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'reminder_time'
  ) THEN
    ALTER TABLE profiles ADD COLUMN reminder_time time DEFAULT '09:00:00';
  END IF;
END $$;