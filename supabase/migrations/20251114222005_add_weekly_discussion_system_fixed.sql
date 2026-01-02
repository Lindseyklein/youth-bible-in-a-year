/*
  # Weekly Discussion System

  1. New Tables
    - Tables for discussion questions, replies, reactions
    - Group chat with typing indicators
    - Video call sessions and participants
    - Prayer request system
    - Weekly completion tracking
    - Member moderation (mutes)

  2. Updates to Existing Tables
    - `daily_readings` - add theme_relevance_score and contains_redemption_cycle

  3. Security
    - Enable RLS on all new tables
    - Policies for group members and leaders
*/

-- Add new columns to daily_readings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'theme_relevance_score'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN theme_relevance_score integer DEFAULT 3 CHECK (theme_relevance_score >= 0 AND theme_relevance_score <= 5);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_readings' AND column_name = 'contains_redemption_cycle'
  ) THEN
    ALTER TABLE daily_readings ADD COLUMN contains_redemption_cycle boolean DEFAULT false;
  END IF;
END $$;

-- Member Mutes (create first since other tables reference it in policies)
CREATE TABLE IF NOT EXISTS member_mutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  muted_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  muted_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE member_mutes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaders can view mutes"
  ON member_mutes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = member_mutes.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  );

CREATE POLICY "Leaders can manage mutes"
  ON member_mutes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = member_mutes.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  )
  WITH CHECK (
    auth.uid() = muted_by
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = member_mutes.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  );

-- Discussion Questions
CREATE TABLE IF NOT EXISTS discussion_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  question_type text NOT NULL,
  question_text text NOT NULL,
  order_position integer NOT NULL,
  is_pinned boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view discussion questions"
  ON discussion_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = discussion_questions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group leaders can manage discussion questions"
  ON discussion_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = discussion_questions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  );

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES discussion_questions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_reply_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_highlighted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view replies"
  ON discussion_replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussion_questions dq
      JOIN group_members gm ON gm.group_id = dq.group_id
      WHERE dq.id = discussion_replies.question_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can create replies"
  ON discussion_replies FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM discussion_questions dq
      JOIN group_members gm ON gm.group_id = dq.group_id
      WHERE dq.id = question_id
      AND gm.user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM member_mutes mm
        WHERE mm.group_id = dq.group_id
        AND mm.user_id = auth.uid()
        AND mm.muted_until > now()
      )
    )
  );

CREATE POLICY "Users can update own replies"
  ON discussion_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leaders can manage all replies"
  ON discussion_replies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussion_questions dq
      JOIN group_members gm ON gm.group_id = dq.group_id
      WHERE dq.id = discussion_replies.question_id
      AND gm.user_id = auth.uid()
      AND gm.role = 'leader'
    )
  );

-- Reply Reactions
CREATE TABLE IF NOT EXISTS reply_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id uuid REFERENCES discussion_replies(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reply_id, user_id, emoji)
);

ALTER TABLE reply_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view reactions"
  ON reply_reactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM discussion_replies dr
      JOIN discussion_questions dq ON dq.id = dr.question_id
      JOIN group_members gm ON gm.group_id = dq.group_id
      WHERE dr.id = reply_reactions.reply_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can add reactions"
  ON reply_reactions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM discussion_replies dr
      JOIN discussion_questions dq ON dq.id = dr.question_id
      JOIN group_members gm ON gm.group_id = dq.group_id
      WHERE dr.id = reply_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON reply_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Group Chat Messages
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view messages"
  ON group_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_chat_messages.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON group_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_chat_messages.group_id
      AND group_members.user_id = auth.uid()
      AND NOT EXISTS (
        SELECT 1 FROM member_mutes
        WHERE member_mutes.group_id = group_chat_messages.group_id
        AND member_mutes.user_id = auth.uid()
        AND member_mutes.muted_until > now()
      )
    )
  );

CREATE POLICY "Leaders can delete messages"
  ON group_chat_messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_chat_messages.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  );

-- Chat Typing Indicators
CREATE TABLE IF NOT EXISTS chat_typing_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);

ALTER TABLE chat_typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view typing indicators"
  ON chat_typing_indicators FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = chat_typing_indicators.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can update own typing status"
  ON chat_typing_indicators FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Video Call Sessions
CREATE TABLE IF NOT EXISTS video_call_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  started_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_active boolean DEFAULT true,
  room_url text,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE video_call_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view video sessions"
  ON video_call_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = video_call_sessions.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group leaders can manage video sessions"
  ON video_call_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = video_call_sessions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  )
  WITH CHECK (
    auth.uid() = started_by
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = video_call_sessions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role = 'leader'
    )
  );

-- Video Call Participants
CREATE TABLE IF NOT EXISTS video_call_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES video_call_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  UNIQUE(session_id, user_id, joined_at)
);

ALTER TABLE video_call_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view call participants"
  ON video_call_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM video_call_sessions vcs
      JOIN group_members gm ON gm.group_id = vcs.group_id
      WHERE vcs.id = video_call_participants.session_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can join calls"
  ON video_call_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM video_call_sessions vcs
      JOIN group_members gm ON gm.group_id = vcs.group_id
      WHERE vcs.id = session_id
      AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own participation"
  ON video_call_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Prayer Requests
CREATE TABLE IF NOT EXISTS prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  details text,
  visibility text NOT NULL CHECK (visibility IN ('group', 'leaders_only')),
  prayer_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view group prayers"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
    )
    AND (
      prayer_requests.visibility = 'group'
      OR EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = prayer_requests.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'leader'
      )
    )
  );

CREATE POLICY "Group members can create prayer requests"
  ON prayer_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own prayer requests"
  ON prayer_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Prayer Responses
CREATE TABLE IF NOT EXISTS prayer_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  response_type text NOT NULL CHECK (response_type IN ('praying', 'comment')),
  content text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view prayer responses"
  ON prayer_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prayer_requests pr
      JOIN group_members gm ON gm.group_id = pr.group_id
      WHERE pr.id = prayer_responses.prayer_request_id
      AND gm.user_id = auth.uid()
      AND (
        pr.visibility = 'group'
        OR EXISTS (
          SELECT 1 FROM group_members
          WHERE group_members.group_id = pr.group_id
          AND group_members.user_id = auth.uid()
          AND group_members.role = 'leader'
        )
      )
    )
  );

CREATE POLICY "Group members can add prayer responses"
  ON prayer_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM prayer_requests pr
      JOIN group_members gm ON gm.group_id = pr.group_id
      WHERE pr.id = prayer_request_id
      AND gm.user_id = auth.uid()
    )
  );

-- Weekly Discussion Completion
CREATE TABLE IF NOT EXISTS weekly_discussion_completion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, group_id, week_number)
);

ALTER TABLE weekly_discussion_completion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completion"
  ON weekly_discussion_completion FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Group members can mark completion"
  ON weekly_discussion_completion FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = weekly_discussion_completion.group_id
      AND group_members.user_id = auth.uid()
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_discussion_questions_group_week ON discussion_questions(group_id, week_number);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_question ON discussion_replies(question_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent ON discussion_replies(parent_reply_id);
CREATE INDEX IF NOT EXISTS idx_reply_reactions_reply ON reply_reactions(reply_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_group ON group_chat_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_video_sessions_group_active ON video_call_sessions(group_id, is_active);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_group ON prayer_requests(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_member_mutes_active ON member_mutes(group_id, user_id, muted_until);
