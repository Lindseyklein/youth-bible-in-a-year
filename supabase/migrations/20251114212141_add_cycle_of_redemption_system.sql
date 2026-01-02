/*
  # Cycle of Redemption System

  1. Purpose
    - Adds tables and structures for the complete Cycle of Redemption feature
    - Tracks user reflections, grace moments, achievements, and preferences
    - Stores redemption verses, grace messages, and discussion prompts
    
  2. New Tables
    - `redemption_reflections`: Weekly user reflections on the 4-cycle steps
    - `grace_moments`: User logs of returning to God moments
    - `redemption_verses`: Weekly redemption-themed verses
    - `grace_messages`: Encouraging messages shown weekly
    - `redemption_badges`: Badge definitions and tracking
    - `user_redemption_badges`: User badge achievements
    - `user_redemption_preferences`: Notification and feature preferences
    
  3. Security
    - All tables have RLS enabled
    - Users can only access their own data
    - Public read access for verses and messages
*/

-- Redemption Reflections (private weekly reflections)
CREATE TABLE IF NOT EXISTS redemption_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number int NOT NULL,
  struggle_reflection text,
  gods_response_reflection text,
  repentance_reflection text,
  restoration_reflection text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, week_number)
);

ALTER TABLE redemption_reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON redemption_reflections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON redemption_reflections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON redemption_reflections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON redemption_reflections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Grace Moments (returning to God tracking)
CREATE TABLE IF NOT EXISTS grace_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number int NOT NULL,
  moment_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grace_moments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own grace moments"
  ON grace_moments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grace moments"
  ON grace_moments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grace moments"
  ON grace_moments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Redemption Verses (curated verses for each week)
CREATE TABLE IF NOT EXISTS redemption_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number int NOT NULL UNIQUE,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  theme text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE redemption_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view redemption verses"
  ON redemption_verses FOR SELECT
  TO authenticated
  USING (true);

-- Grace Messages (encouraging messages)
CREATE TABLE IF NOT EXISTS grace_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_text text NOT NULL,
  category text DEFAULT 'general',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view grace messages"
  ON grace_messages FOR SELECT
  TO authenticated
  USING (true);

-- Redemption Badges (badge definitions)
CREATE TABLE IF NOT EXISTS redemption_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_name text NOT NULL UNIQUE,
  badge_description text NOT NULL,
  badge_icon text,
  criteria text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE redemption_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view redemption badges"
  ON redemption_badges FOR SELECT
  TO authenticated
  USING (true);

-- User Redemption Badges (earned badges)
CREATE TABLE IF NOT EXISTS user_redemption_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES redemption_badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_redemption_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON user_redemption_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_redemption_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- User Redemption Preferences
CREATE TABLE IF NOT EXISTS user_redemption_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  grace_notifications_enabled boolean DEFAULT true,
  seen_intro boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_redemption_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_redemption_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_redemption_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_redemption_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial grace messages
INSERT INTO grace_messages (message_text, category) VALUES
  ('You may fall, but God always welcomes you back.', 'encouragement'),
  ('Redemption is God''s specialty.', 'encouragement'),
  ('The Lord is gracious and compassionate.', 'scripture'),
  ('There is no shame in needing grace — we all do.', 'encouragement'),
  ('God already knows your weaknesses — and He still chooses you.', 'encouragement'),
  ('God always redeems those who return to Him.', 'promise'),
  ('You''re not defined by your lowest moments.', 'identity'),
  ('You''re never too far to come back to God.', 'promise'),
  ('God delights in new beginnings.', 'encouragement'),
  ('Every return to God is a victory, not a failure.', 'encouragement')
ON CONFLICT DO NOTHING;

-- Insert redemption badges
INSERT INTO redemption_badges (badge_name, badge_description, badge_icon, criteria) VALUES
  ('I Came Back', 'You returned to your reading plan after missing days. God celebrates your return!', 'comeback', 'Resume reading plan after 3+ days gap'),
  ('New Beginnings', 'You embraced a fresh start with God. New mercies every morning!', 'sunrise', 'Restart your reading plan'),
  ('Redeemed & Growing', 'You''ve consistently returned to God week after week. Your faithfulness inspires!', 'growth', 'Return to plan 5+ times')
ON CONFLICT (badge_name) DO NOTHING;

-- Insert sample redemption verses (first 5 weeks)
INSERT INTO redemption_verses (week_number, verse_reference, verse_text, theme) VALUES
  (1, 'Genesis 3:9', 'But the LORD God called to the man, "Where are you?"', 'God seeks us even in our hiding'),
  (2, 'Genesis 6:8', 'But Noah found favor in the eyes of the LORD.', 'Grace in judgment'),
  (3, 'Genesis 8:1', 'But God remembered Noah and all the wild animals and the livestock that were with him in the ark.', 'God remembers and restores'),
  (4, 'Genesis 9:16', 'Whenever the rainbow appears in the clouds, I will see it and remember the everlasting covenant.', 'Covenant of mercy'),
  (5, 'Genesis 12:2-3', 'I will make you into a great nation, and I will bless you; I will make your name great, and you will be a blessing.', 'From brokenness to blessing')
ON CONFLICT (week_number) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_redemption_reflections_user ON redemption_reflections(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_grace_moments_user ON grace_moments(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_user_redemption_badges_user ON user_redemption_badges(user_id);
