/*
  # Add Community and Gamification Features

  ## New Tables
  
  1. user_streaks
    - `user_id` (uuid, references profiles, primary key)
    - `current_streak` (integer) - consecutive days
    - `longest_streak` (integer) - all-time best
    - `last_reading_date` (date)
    - `total_readings_completed` (integer)
    - `updated_at` (timestamptz)
  
  2. achievements
    - `id` (uuid, primary key)
    - `name` (text) - e.g., "Week Warrior"
    - `description` (text)
    - `icon` (text) - emoji or icon name
    - `category` (text) - streak, completion, social, etc.
    - `requirement` (integer) - number needed
    - `points` (integer) - gamification points
  
  3. user_achievements
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `achievement_id` (uuid, references achievements)
    - `earned_at` (timestamptz)
    - `progress` (integer) - for progressive achievements
  
  4. community_posts
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `post_type` (text) - reflection, prayer_request, verse_art, encouragement
    - `content` (text)
    - `verse_reference` (text)
    - `image_url` (text)
    - `is_moderated` (boolean)
    - `is_approved` (boolean)
    - `likes_count` (integer)
    - `comments_count` (integer)
    - `created_at` (timestamptz)
  
  5. post_comments
    - `id` (uuid, primary key)
    - `post_id` (uuid, references community_posts)
    - `user_id` (uuid, references profiles)
    - `content` (text)
    - `is_approved` (boolean)
    - `created_at` (timestamptz)
  
  6. post_likes
    - `id` (uuid, primary key)
    - `post_id` (uuid, references community_posts)
    - `user_id` (uuid, references profiles)
    - `created_at` (timestamptz)
    - UNIQUE(post_id, user_id)
  
  7. favorite_verses
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `reading_id` (uuid, references daily_readings)
    - `verse_reference` (text)
    - `verse_text` (text)
    - `note` (text)
    - `created_at` (timestamptz)

  ## Security
  
  - All tables have RLS enabled
  - Users can only manage their own data
  - Community posts require moderation approval
*/

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_reading_date date,
  total_readings_completed integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak"
  ON user_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own streak"
  ON user_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak"
  ON user_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL,
  requirement integer NOT NULL,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0,
  UNIQUE(user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create community_posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_type text NOT NULL CHECK (post_type IN ('reflection', 'prayer_request', 'verse_art', 'encouragement')),
  content text NOT NULL,
  verse_reference text,
  image_url text,
  is_moderated boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create post_comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes"
  ON post_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create favorite_verses table
CREATE TABLE IF NOT EXISTS favorite_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reading_id uuid REFERENCES daily_readings(id) ON DELETE CASCADE,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE favorite_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorite_verses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorite_verses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_verses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert initial achievements
INSERT INTO achievements (name, description, icon, category, requirement, points)
VALUES
  ('First Steps', 'Complete your first daily reading', '🎯', 'completion', 1, 10),
  ('Week Warrior', 'Complete 7 days in a row', '🔥', 'streak', 7, 50),
  ('Month Master', 'Maintain a 30-day streak', '⭐', 'streak', 30, 200),
  ('Genesis Graduate', 'Complete the book of Genesis', '📖', 'completion', 50, 100),
  ('Community Builder', 'Share your first reflection', '💬', 'social', 1, 25),
  ('Prayer Partner', 'Post your first prayer request', '🙏', 'social', 1, 25),
  ('Encourager', 'Encourage 10 people in the community', '❤️', 'social', 10, 75),
  ('Verse Collector', 'Save 5 favorite verses', '⭐', 'engagement', 5, 50),
  ('Consistent Reader', 'Complete 100 readings', '📚', 'completion', 100, 500)
ON CONFLICT DO NOTHING;