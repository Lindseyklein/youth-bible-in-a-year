/*
  # Add Daily Summaries and Redemption Stories

  ## Changes
  
  1. Add columns to daily_readings table:
    - `summary` (text) - Daily teaching summary
    - `redemption_story` (text) - Key redemption theme or relatable highlight
    - `key_verse` (text) - Most important verse from the reading
    - `reflection_question` (text) - Personal application question
  
  ## Purpose
  
  These additions help teens:
  - Understand the key teaching from each day's reading
  - See how God's redemption story unfolds throughout Scripture
  - Find relatable applications for their lives
  - Engage more deeply with the text
*/

-- Add new columns to daily_readings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'summary'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN summary text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'redemption_story'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN redemption_story text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'key_verse'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN key_verse text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'reflection_question'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN reflection_question text;
  END IF;
END $$;