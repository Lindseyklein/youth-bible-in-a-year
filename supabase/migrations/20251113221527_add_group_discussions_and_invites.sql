/*
  # Add Group Discussions and Invite System

  ## New Tables
  
  1. **groups**
    - `id` (uuid, primary key)
    - `name` (text) - Group name
    - `description` (text) - Group description
    - `is_public` (boolean) - Whether the group is public or private
    - `invite_code` (text, unique) - Unique code for joining
    - `leader_id` (uuid) - References profiles(id)
    - `current_week` (integer) - Current week number the group is on
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. **group_members**
    - `id` (uuid, primary key)
    - `group_id` (uuid) - References groups(id)
    - `user_id` (uuid) - References profiles(id)
    - `role` (text) - 'leader', 'moderator', 'member'
    - `status` (text) - 'active', 'pending', 'removed'
    - `joined_at` (timestamptz)
    - `invited_by` (uuid) - References profiles(id)
  
  3. **group_discussions**
    - `id` (uuid, primary key)
    - `group_id` (uuid) - References groups(id)
    - `week_number` (integer) - Week of the reading plan
    - `title` (text) - Discussion title
    - `pinned_message` (text) - Leader's pinned devotional/question
    - `status` (text) - 'active', 'completed'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  4. **discussion_posts**
    - `id` (uuid, primary key)
    - `discussion_id` (uuid) - References group_discussions(id)
    - `user_id` (uuid) - References profiles(id)
    - `parent_post_id` (uuid) - References discussion_posts(id) for replies
    - `content` (text) - Post content
    - `image_url` (text) - Optional image
    - `is_deleted` (boolean) - Soft delete flag
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  5. **post_reactions**
    - `id` (uuid, primary key)
    - `post_id` (uuid) - References discussion_posts(id)
    - `user_id` (uuid) - References profiles(id)
    - `reaction_type` (text) - 'like', 'pray', 'heart', 'amen'
    - `created_at` (timestamptz)
  
  6. **user_invites**
    - `id` (uuid, primary key)
    - `invite_code` (text, unique) - Personal invite code
    - `inviter_id` (uuid) - References profiles(id)
    - `invitee_email` (text) - Email if inviting specific person
    - `group_id` (uuid) - References groups(id), optional
    - `status` (text) - 'pending', 'accepted', 'expired'
    - `created_at` (timestamptz)
    - `expires_at` (timestamptz)
  
  7. **group_notifications**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - References profiles(id)
    - `group_id` (uuid) - References groups(id)
    - `post_id` (uuid) - References discussion_posts(id), optional
    - `notification_type` (text) - 'new_post', 'reply', 'reaction', 'mention'
    - `content` (text)
    - `is_read` (boolean)
    - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Members can view groups they belong to
  - Only leaders can create/modify groups
  - Members can post in groups they belong to
  - Users can only delete their own posts
  - Leaders can delete any posts in their groups

  ## Indexes
  - Foreign key indexes for performance
  - Unique constraints for invite codes
*/

-- Create groups table
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  invite_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  leader_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  current_week integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create group_members table
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('leader', 'moderator', 'member')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'removed')),
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES profiles(id),
  UNIQUE(group_id, user_id)
);

-- Create group_discussions table
CREATE TABLE IF NOT EXISTS group_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  week_number integer NOT NULL,
  title text NOT NULL,
  pinned_message text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, week_number)
);

-- Create discussion_posts table
CREATE TABLE IF NOT EXISTS discussion_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid REFERENCES group_discussions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_post_id uuid REFERENCES discussion_posts(id) ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create post_reactions table
CREATE TABLE IF NOT EXISTS post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES discussion_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'pray', 'heart', 'amen')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id, reaction_type)
);

-- Create user_invites table
CREATE TABLE IF NOT EXISTS user_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 10),
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email text,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + INTERVAL '30 days')
);

-- Create group_notifications table
CREATE TABLE IF NOT EXISTS group_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES discussion_posts(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('new_post', 'reply', 'reaction', 'mention', 'group_invite')),
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_discussions_group_id ON group_discussions(group_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_discussion_id ON discussion_posts(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_posts_parent_id ON discussion_posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_user_id ON group_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_inviter_id ON user_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_user_invites_group_id ON user_invites(group_id);

-- Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view public groups"
  ON groups FOR SELECT
  TO authenticated
  USING (is_public = true OR leader_id = auth.uid() OR EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leaders can delete their groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = leader_id);

-- RLS Policies for group_members
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id
    AND gm2.user_id = auth.uid()
    AND gm2.status = 'active'
  ));

CREATE POLICY "Leaders can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.leader_id = auth.uid()
  ) OR group_members.user_id = auth.uid());

CREATE POLICY "Leaders and users can update memberships"
  ON group_members FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.leader_id = auth.uid()
  ) OR group_members.user_id = auth.uid())
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.leader_id = auth.uid()
  ) OR group_members.user_id = auth.uid());

CREATE POLICY "Leaders can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_members.group_id
    AND groups.leader_id = auth.uid()
  ) OR group_members.user_id = auth.uid());

-- RLS Policies for group_discussions
CREATE POLICY "Members can view discussions in their groups"
  ON group_discussions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_discussions.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.status = 'active'
  ));

CREATE POLICY "Leaders can create discussions"
  ON group_discussions FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_discussions.group_id
    AND groups.leader_id = auth.uid()
  ));

CREATE POLICY "Leaders can update discussions"
  ON group_discussions FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_discussions.group_id
    AND groups.leader_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups
    WHERE groups.id = group_discussions.group_id
    AND groups.leader_id = auth.uid()
  ));

-- RLS Policies for discussion_posts
CREATE POLICY "Members can view posts in their groups"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM group_discussions gd
    JOIN group_members gm ON gm.group_id = gd.group_id
    WHERE gd.id = discussion_posts.discussion_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Members can create posts"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM group_discussions gd
    JOIN group_members gm ON gm.group_id = gd.group_id
    WHERE gd.id = discussion_posts.discussion_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ) AND auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON discussion_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and leaders can delete posts"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN groups g ON g.id = gd.group_id
      WHERE gd.id = discussion_posts.discussion_id
      AND g.leader_id = auth.uid()
    )
  );

-- RLS Policies for post_reactions
CREATE POLICY "Members can view reactions"
  ON post_reactions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM discussion_posts dp
    JOIN group_discussions gd ON gd.id = dp.discussion_id
    JOIN group_members gm ON gm.group_id = gd.group_id
    WHERE dp.id = post_reactions.post_id
    AND gm.user_id = auth.uid()
    AND gm.status = 'active'
  ));

CREATE POLICY "Users can add reactions"
  ON post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for user_invites
CREATE POLICY "Users can view their sent invites"
  ON user_invites FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can create invites"
  ON user_invites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = inviter_id);

CREATE POLICY "Users can update their invites"
  ON user_invites FOR UPDATE
  TO authenticated
  USING (auth.uid() = inviter_id)
  WITH CHECK (auth.uid() = inviter_id);

-- RLS Policies for group_notifications
CREATE POLICY "Users can view their notifications"
  ON group_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON group_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
  ON group_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their notifications"
  ON group_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to auto-create discussion when group advances week
CREATE OR REPLACE FUNCTION create_weekly_discussion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_week != OLD.current_week THEN
    INSERT INTO group_discussions (group_id, week_number, title, status)
    VALUES (
      NEW.id,
      NEW.current_week,
      'Week ' || NEW.current_week || ' Discussion',
      'active'
    )
    ON CONFLICT (group_id, week_number) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_discussion
  AFTER UPDATE ON groups
  FOR EACH ROW
  WHEN (NEW.current_week IS DISTINCT FROM OLD.current_week)
  EXECUTE FUNCTION create_weekly_discussion();

-- Function to auto-add leader as member when group is created
CREATE OR REPLACE FUNCTION add_leader_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role, status)
  VALUES (NEW.id, NEW.leader_id, 'leader', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_add_leader
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION add_leader_as_member();