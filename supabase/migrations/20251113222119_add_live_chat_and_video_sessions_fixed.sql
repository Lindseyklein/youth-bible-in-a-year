/*
  # Add Live Chat and Video Sessions

  ## New Tables
  
  1. **group_chat_messages** - Real-time chat messages
  2. **chat_reactions** - Emoji reactions to messages
  3. **user_presence** - Online status and typing indicators
  4. **live_video_sessions** - Video meeting sessions
  5. **video_session_participants** - Track who joined video
  6. **chat_moderation_actions** - Moderation logs
  7. **group_settings** - Group-level feature toggles

  ## Security
  - All tables have RLS enabled
  - Members can only access their group's content
  - Leaders have moderation powers
  - Realtime enabled for live features
*/

-- Create group_chat_messages table
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_text text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji')),
  reply_to_id uuid REFERENCES group_chat_messages(id) ON DELETE SET NULL,
  is_deleted boolean DEFAULT false,
  deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat_reactions table
CREATE TABLE IF NOT EXISTS chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES group_chat_messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  is_online boolean DEFAULT false,
  is_typing boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, group_id)
);

-- Create live_video_sessions table
CREATE TABLE IF NOT EXISTS live_video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  title text NOT NULL,
  description text,
  video_room_id text,
  video_provider text DEFAULT 'jitsi' CHECK (video_provider IN ('daily', 'jitsi', 'zoom', 'custom')),
  host_id uuid REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  max_participants integer DEFAULT 50,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create video_session_participants table
CREATE TABLE IF NOT EXISTS video_session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES live_video_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamptz DEFAULT now(),
  left_at timestamptz,
  is_muted boolean DEFAULT false,
  was_removed boolean DEFAULT false,
  UNIQUE(session_id, user_id)
);

-- Create chat_moderation_actions table
CREATE TABLE IF NOT EXISTS chat_moderation_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  moderator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('mute', 'unmute', 'remove', 'lock_chat', 'unlock_chat', 'delete_message')),
  reason text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create group_settings table
CREATE TABLE IF NOT EXISTS group_settings (
  group_id uuid PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
  chat_enabled boolean DEFAULT true,
  chat_locked boolean DEFAULT false,
  video_enabled boolean DEFAULT true,
  allow_member_video_start boolean DEFAULT false,
  max_chat_message_length integer DEFAULT 2000,
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_group_id ON group_chat_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON group_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_group_id ON user_presence(group_id);
CREATE INDEX IF NOT EXISTS idx_user_presence_online ON user_presence(is_online) WHERE is_online = true;
CREATE INDEX IF NOT EXISTS idx_video_sessions_group_id ON live_video_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_status ON live_video_sessions(status);
CREATE INDEX IF NOT EXISTS idx_moderation_actions_group_id ON chat_moderation_actions(group_id);

-- Enable RLS
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for group_chat_messages
CREATE POLICY "Members can view chat messages in their groups"
  ON group_chat_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_chat_messages.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Members can send chat messages"
  ON group_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_chat_messages.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own chat messages"
  ON group_chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and leaders can delete chat messages"
  ON group_chat_messages FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_chat_messages.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.role IN ('leader', 'moderator')
    )
  );

-- RLS Policies for chat_reactions
CREATE POLICY "Members can view chat reactions"
  ON chat_reactions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_chat_messages gcm
    JOIN group_members gm ON gm.group_id = gcm.group_id
    WHERE gcm.id = chat_reactions.message_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Users can add chat reactions"
  ON chat_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their chat reactions"
  ON chat_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_presence
CREATE POLICY "Members can view presence in groups"
  ON user_presence FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = user_presence.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Users can insert their presence"
  ON user_presence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their presence"
  ON user_presence FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for live_video_sessions
CREATE POLICY "Members can view video sessions"
  ON live_video_sessions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = live_video_sessions.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Leaders can create video sessions"
  ON live_video_sessions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = live_video_sessions.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role IN ('leader', 'moderator')
  ) AND auth.uid() = host_id);

CREATE POLICY "Hosts can update video sessions"
  ON live_video_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can delete video sessions"
  ON live_video_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);

-- RLS Policies for video_session_participants
CREATE POLICY "Members can view video participants"
  ON video_session_participants FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM live_video_sessions lvs
    JOIN group_members gm ON gm.group_id = lvs.group_id
    WHERE lvs.id = video_session_participants.session_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Users can join video"
  ON video_session_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and hosts can update participation"
  ON video_session_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM live_video_sessions lvs
    WHERE lvs.id = video_session_participants.session_id
    AND lvs.host_id = auth.uid()
  ))
  WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM live_video_sessions lvs
    WHERE lvs.id = video_session_participants.session_id
    AND lvs.host_id = auth.uid()
  ));

-- RLS Policies for chat_moderation_actions
CREATE POLICY "Leaders can view moderation logs"
  ON chat_moderation_actions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = chat_moderation_actions.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role IN ('leader', 'moderator')
  ));

CREATE POLICY "Leaders can create moderation actions"
  ON chat_moderation_actions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = chat_moderation_actions.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role IN ('leader', 'moderator')
  ) AND auth.uid() = moderator_id);

-- RLS Policies for group_settings
CREATE POLICY "Members can view settings"
  ON group_settings FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_settings.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Leaders can create settings"
  ON group_settings FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_settings.group_id
    AND groups.leader_id = auth.uid()
  ));

CREATE POLICY "Leaders can modify settings"
  ON group_settings FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_settings.group_id
    AND groups.leader_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_settings.group_id
    AND groups.leader_id = auth.uid()
  ));

-- Function to auto-create group settings
CREATE OR REPLACE FUNCTION create_default_group_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_settings (group_id)
  VALUES (NEW.id)
  ON CONFLICT (group_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_create_group_settings ON groups;
CREATE TRIGGER auto_create_group_settings
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION create_default_group_settings();

-- Function to update presence timestamp
CREATE OR REPLACE FUNCTION update_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.last_seen = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_presence_timestamp ON user_presence;
CREATE TRIGGER update_presence_timestamp
  BEFORE UPDATE ON user_presence
  FOR EACH ROW
  EXECUTE FUNCTION update_presence_timestamp();