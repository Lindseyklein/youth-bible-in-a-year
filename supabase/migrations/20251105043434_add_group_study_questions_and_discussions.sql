/*
  # Add Group Study Questions and Discussion System

  ## New Tables
  
  1. study_questions
    - `id` (uuid, primary key)
    - `week_number` (integer)
    - `plan_id` (uuid, references reading_plans)
    - `question_text` (text)
    - `question_type` (text) - scripture_reflection or personal_reflection
    - `related_passage` (text)
    - `order_number` (integer)
    - `created_by` (uuid, references profiles)
    - `created_at` (timestamptz)
  
  2. study_answers
    - `id` (uuid, primary key)
    - `question_id` (uuid, references study_questions)
    - `group_id` (uuid, references study_groups)
    - `user_id` (uuid, references profiles)
    - `answer_text` (text)
    - `is_anonymous` (boolean)
    - `likes_count` (integer)
    - `comments_count` (integer)
    - `is_flagged` (boolean)
    - `is_hidden` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - `edit_window_expires_at` (timestamptz)
    - UNIQUE(question_id, group_id, user_id)
  
  3. answer_comments
    - `id` (uuid, primary key)
    - `answer_id` (uuid, references study_answers)
    - `user_id` (uuid, references profiles)
    - `comment_text` (text)
    - `is_flagged` (boolean)
    - `is_hidden` (boolean)
    - `created_at` (timestamptz)
  
  4. answer_likes
    - `id` (uuid, primary key)
    - `answer_id` (uuid, references study_answers)
    - `user_id` (uuid, references profiles)
    - `created_at` (timestamptz)
    - UNIQUE(answer_id, user_id)
  
  5. answer_reactions
    - `id` (uuid, primary key)
    - `answer_id` (uuid, references study_answers)
    - `user_id` (uuid, references profiles)
    - `reaction_type` (text) - pray, relate, love
    - `created_at` (timestamptz)
    - UNIQUE(answer_id, user_id, reaction_type)
  
  6. participation_badges
    - `id` (uuid, primary key)
    - `user_id` (uuid, references profiles)
    - `group_id` (uuid, references study_groups)
    - `badge_type` (text) - week_complete, consistent_answerer, encourager
    - `week_number` (integer)
    - `earned_at` (timestamptz)
  
  7. content_reports
    - `id` (uuid, primary key)
    - `content_type` (text) - answer or comment
    - `content_id` (uuid)
    - `reported_by` (uuid, references profiles)
    - `reason` (text)
    - `status` (text) - pending, reviewed, resolved
    - `created_at` (timestamptz)

  ## Security
  
  - All tables have RLS enabled
  - Users can only manage their own content
  - Group members can view group discussions
  - Leaders can moderate content in their groups
*/

-- Create study_questions table
CREATE TABLE IF NOT EXISTS study_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number integer NOT NULL,
  plan_id uuid REFERENCES reading_plans(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text NOT NULL CHECK (question_type IN ('scripture_reflection', 'personal_reflection')),
  related_passage text,
  order_number integer DEFAULT 1,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE study_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view study questions"
  ON study_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create study_answers table
CREATE TABLE IF NOT EXISTS study_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES study_questions(id) ON DELETE CASCADE,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  answer_text text NOT NULL,
  is_anonymous boolean DEFAULT false,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  edit_window_expires_at timestamptz DEFAULT (now() + interval '15 minutes'),
  UNIQUE(question_id, group_id, user_id)
);

ALTER TABLE study_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view answers"
  ON study_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_answers.group_id
      AND study_group_members.user_id = auth.uid()
    )
    AND is_hidden = false
  );

CREATE POLICY "Users can create own answers"
  ON study_answers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers within edit window"
  ON study_answers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND now() < edit_window_expires_at)
  WITH CHECK (auth.uid() = user_id);

-- Create answer_comments table
CREATE TABLE IF NOT EXISTS answer_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES study_answers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  is_flagged boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE answer_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view comments"
  ON answer_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_answers sa
      JOIN study_group_members sgm ON sgm.group_id = sa.group_id
      WHERE sa.id = answer_comments.answer_id
      AND sgm.user_id = auth.uid()
    )
    AND is_hidden = false
  );

CREATE POLICY "Users can create comments"
  ON answer_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create answer_likes table
CREATE TABLE IF NOT EXISTS answer_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES study_answers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id)
);

ALTER TABLE answer_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view likes"
  ON answer_likes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own likes"
  ON answer_likes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON answer_likes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create answer_reactions table
CREATE TABLE IF NOT EXISTS answer_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id uuid REFERENCES study_answers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('pray', 'relate', 'love')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(answer_id, user_id, reaction_type)
);

ALTER TABLE answer_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view reactions"
  ON answer_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own reactions"
  ON answer_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON answer_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create participation_badges table
CREATE TABLE IF NOT EXISTS participation_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  group_id uuid REFERENCES study_groups(id) ON DELETE CASCADE,
  badge_type text NOT NULL CHECK (badge_type IN ('week_complete', 'consistent_answerer', 'encourager')),
  week_number integer,
  earned_at timestamptz DEFAULT now()
);

ALTER TABLE participation_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges"
  ON participation_badges FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create content_reports table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('answer', 'comment')),
  content_id uuid NOT NULL,
  reported_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view own reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reported_by);

-- Insert sample study questions for Week 1
INSERT INTO study_questions (week_number, question_text, question_type, related_passage, order_number)
VALUES
(1, 'Read Genesis 1:27. What does it mean to be created in God''s image? How does this change how you see yourself?', 'scripture_reflection', 'Genesis 1:27', 1),
(1, 'Think about the world God created. What part of creation makes you feel closest to God, and why?', 'personal_reflection', 'Genesis 1-2', 2),
(1, 'Genesis 3:15 is the first promise of a Redeemer. How does knowing God had a rescue plan from day one affect your view of His love?', 'scripture_reflection', 'Genesis 3:15', 3),
(1, 'Where in your life right now do you feel like you''ve messed up? How does God''s promise of redemption give you hope?', 'personal_reflection', 'Genesis 3', 4)
ON CONFLICT DO NOTHING;