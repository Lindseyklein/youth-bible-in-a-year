/*
  # Add Enhancement Features

  ## New Tables
  
  1. **prayer_requests**
    - `id` (uuid, primary key)
    - `group_id` (uuid) - References groups(id)
    - `user_id` (uuid) - References profiles(id)
    - `title` (text) - Short title
    - `description` (text) - Optional details
    - `visibility` (text) - 'group', 'leaders_only'
    - `is_hidden` (boolean) - Leader moderation
    - `prayer_count` (integer) - Number of prayers
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. **prayer_responses**
    - `id` (uuid, primary key)
    - `prayer_request_id` (uuid) - References prayer_requests(id)
    - `user_id` (uuid) - References profiles(id)
    - `created_at` (timestamptz)
  
  3. **user_notes**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - References profiles(id)
    - `note_type` (text) - 'daily', 'weekly', 'free'
    - `reading_id` (uuid) - References daily_readings(id), nullable
    - `week_number` (integer) - For weekly notes
    - `title` (text)
    - `content` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  4. **verse_bookmarks**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - References profiles(id)
    - `reading_id` (uuid) - References daily_readings(id)
    - `book` (text)
    - `chapter` (integer)
    - `verse_start` (integer)
    - `verse_end` (integer)
    - `verse_text` (text)
    - `title` (text) - Optional custom title
    - `created_at` (timestamptz)
  
  5. **user_badges**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - References profiles(id)
    - `badge_type` (text) - 'streak_7', 'streak_30', 'weeks_4', 'completion_25', etc.
    - `earned_at` (timestamptz)
    - `is_new` (boolean) - For showing badge notification
  
  6. **weekly_challenges**
    - `id` (uuid, primary key)
    - `week_number` (integer)
    - `challenge_text` (text)
    - `challenge_type` (text) - 'memorize', 'act_kindness', 'pray', 'share', 'custom'
    - `created_by` (uuid) - References profiles(id)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  7. **challenge_completions**
    - `id` (uuid, primary key)
    - `challenge_id` (uuid) - References weekly_challenges(id)
    - `user_id` (uuid) - References profiles(id)
    - `completed_at` (timestamptz)
  
  8. **week_wallpapers**
    - `id` (uuid, primary key)
    - `week_number` (integer)
    - `verse_reference` (text)
    - `verse_text` (text)
    - `background_color` (text)
    - `text_color` (text)
    - `image_url` (text) - Optional custom image
    - `created_by` (uuid) - References profiles(id)
    - `created_at` (timestamptz)
  
  9. **group_broadcasts**
    - `id` (uuid, primary key)
    - `group_id` (uuid) - References groups(id)
    - `sender_id` (uuid) - References profiles(id)
    - `message` (text)
    - `is_pinned` (boolean)
    - `created_at` (timestamptz)
    - `expires_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own personal data
  - Group members can view group-wide content
  - Leaders have moderation powers

  ## Indexes
  - Foreign key indexes for performance
  - Date indexes for sorting
*/

-- Create prayer_requests table
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  visibility text DEFAULT 'group' CHECK (visibility IN ('group', 'leaders_only')),
  is_hidden boolean DEFAULT false,
  prayer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create prayer_responses table
CREATE TABLE IF NOT EXISTS prayer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(prayer_request_id, user_id)
);

-- Create user_notes table
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  note_type text DEFAULT 'free' CHECK (note_type IN ('daily', 'weekly', 'free')),
  reading_id uuid REFERENCES daily_readings(id) ON DELETE SET NULL,
  week_number integer,
  title text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verse_bookmarks table
CREATE TABLE IF NOT EXISTS verse_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reading_id uuid REFERENCES daily_readings(id) ON DELETE SET NULL,
  book text NOT NULL,
  chapter integer NOT NULL,
  verse_start integer NOT NULL,
  verse_end integer,
  verse_text text NOT NULL,
  title text,
  created_at timestamptz DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  is_new boolean DEFAULT true,
  UNIQUE(user_id, badge_type)
);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  challenge_text text NOT NULL,
  challenge_type text DEFAULT 'custom' CHECK (challenge_type IN ('memorize', 'act_kindness', 'pray', 'share', 'custom')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create challenge_completions table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES weekly_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create week_wallpapers table
CREATE TABLE IF NOT EXISTS week_wallpapers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL UNIQUE,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  background_color text DEFAULT '#6366f1',
  text_color text DEFAULT '#ffffff',
  image_url text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create group_broadcasts table
CREATE TABLE IF NOT EXISTS group_broadcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prayer_requests_group_id ON prayer_requests(group_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_responses_request_id ON prayer_responses(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_type ON user_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_verse_bookmarks_user_id ON verse_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge_id ON challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_group_broadcasts_group_id ON group_broadcasts(group_id);

-- Enable RLS
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE verse_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_wallpapers ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_broadcasts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prayer_requests
CREATE POLICY "Members can view group prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    NOT is_hidden AND (
      (visibility = 'group' AND EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = prayer_requests.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'active'
      ))
      OR
      (visibility = 'leaders_only' AND EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = prayer_requests.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role IN ('leader', 'moderator')
        AND group_members.status = 'active'
      ))
      OR
      auth.uid() = user_id
    )
  );

CREATE POLICY "Members can create prayer requests"
  ON prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users and leaders can update prayer requests"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('leader', 'moderator')
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('leader', 'moderator')
    )
  );

CREATE POLICY "Users and leaders can delete prayer requests"
  ON prayer_requests FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('leader', 'moderator')
    )
  );

-- RLS Policies for prayer_responses
CREATE POLICY "Members can view prayer responses"
  ON prayer_responses FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM prayer_requests pr
    JOIN group_members gm ON gm.group_id = pr.group_id
    WHERE pr.id = prayer_responses.prayer_request_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Users can add prayer responses"
  ON prayer_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their responses"
  ON prayer_responses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_notes
CREATE POLICY "Users can view their own notes"
  ON user_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes"
  ON user_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON user_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON user_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for verse_bookmarks
CREATE POLICY "Users can view their bookmarks"
  ON verse_bookmarks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON verse_bookmarks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update bookmarks"
  ON verse_bookmarks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete bookmarks"
  ON verse_bookmarks FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_badges
CREATE POLICY "Users can view their badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their badges"
  ON user_badges FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weekly_challenges
CREATE POLICY "Everyone can view challenges"
  ON weekly_challenges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Leaders can create challenges"
  ON weekly_challenges FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update challenges"
  ON weekly_challenges FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for challenge_completions
CREATE POLICY "Users can view completions"
  ON challenge_completions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can complete challenges"
  ON challenge_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can uncomplete challenges"
  ON challenge_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for week_wallpapers
CREATE POLICY "Everyone can view wallpapers"
  ON week_wallpapers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Leaders can create wallpapers"
  ON week_wallpapers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update wallpapers"
  ON week_wallpapers FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for group_broadcasts
CREATE POLICY "Members can view broadcasts"
  ON group_broadcasts FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_broadcasts.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Leaders can create broadcasts"
  ON group_broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_broadcasts.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('leader', 'moderator')
    )
    AND auth.uid() = sender_id
  );

CREATE POLICY "Senders can update broadcasts"
  ON group_broadcasts FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Senders can delete broadcasts"
  ON group_broadcasts FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id);

-- Function to update prayer count
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET prayer_count = GREATEST(0, prayer_count - 1)
    WHERE id = OLD.prayer_request_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_prayer_count_trigger ON prayer_responses;
CREATE TRIGGER update_prayer_count_trigger
  AFTER INSERT OR DELETE ON prayer_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_prayer_count();

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_streak integer;
  v_completed_days integer;
  v_completed_weeks integer;
  v_completion_pct integer;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Get completed days
  SELECT COUNT(*) INTO v_completed_days
  FROM user_progress
  WHERE user_id = p_user_id
  AND completed = true
  AND (is_archived = false OR is_archived IS NULL);

  -- Calculate completion percentage
  v_completion_pct := ROUND((v_completed_days::numeric / 365) * 100);

  -- Award streak badges
  IF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_7')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_streak >= 30 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_30')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_streak >= 100 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_100')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award weeks completed badges
  v_completed_weeks := v_completed_days / 7;

  IF v_completed_weeks >= 4 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'weeks_4')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completed_weeks >= 12 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'weeks_12')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award completion percentage badges
  IF v_completion_pct >= 25 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_25')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 50 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_50')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 75 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_75')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 100 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_100')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;