/*
  # Allow Anonymous Access to Reading Plan Data

  1. Changes
    - Add RLS policies to allow anonymous (unauthenticated) users to read:
      - weekly_studies
      - daily_readings
      - weekly_challenges
    
  2. Security
    - These tables contain public reading plan content that should be accessible to everyone
    - Only SELECT access is granted to anonymous users
    - All other operations still require authentication
*/

-- Allow anonymous users to view weekly studies
CREATE POLICY "Anonymous users can view weekly studies"
  ON weekly_studies
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view daily readings
CREATE POLICY "Anonymous users can view daily readings"
  ON daily_readings
  FOR SELECT
  TO anon
  USING (true);

-- Allow anonymous users to view weekly challenges
CREATE POLICY "Anonymous users can view weekly challenges"
  ON weekly_challenges
  FOR SELECT
  TO anon
  USING (true);
