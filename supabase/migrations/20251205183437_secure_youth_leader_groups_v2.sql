/*
  # Secure Youth Leader Groups - Proper Data Isolation

  1. Changes
    - Remove temporary open access policies
    - Implement proper RLS to ensure Youth Leaders only see their own groups
    - Members can only see groups they belong to
    - Public groups are visible to all authenticated users
    - Private groups are only visible to the leader and active members

  2. Security
    - Leaders can only view, update, and delete their own groups
    - Members can only view groups they are active members of
    - All group-related data is scoped to group membership
    - No cross-contamination between different leaders' groups

  3. Policy Breakdown
    - SELECT: Leaders see their groups + members see groups they belong to + public groups
    - INSERT: Any authenticated user can create a group (becomes leader)
    - UPDATE: Only the group leader can update their group
    - DELETE: Only the group leader can delete their group
*/

-- Drop temporary open access policies
DROP POLICY IF EXISTS "Anyone can view groups" ON groups;
DROP POLICY IF EXISTS "Anyone can view group members" ON group_members;
DROP POLICY IF EXISTS "Anyone can view prayer requests" ON prayer_requests;
DROP POLICY IF EXISTS "Anyone can view discussions" ON group_discussions;
DROP POLICY IF EXISTS "Anyone can view discussion posts" ON discussion_posts;
DROP POLICY IF EXISTS "Anyone can view broadcasts" ON group_broadcasts;

-- Drop old policies that might conflict
DROP POLICY IF EXISTS "Users can view public groups" ON groups;
DROP POLICY IF EXISTS "Users can create groups" ON groups;
DROP POLICY IF EXISTS "Leaders can update their groups" ON groups;
DROP POLICY IF EXISTS "Leaders can delete their groups" ON groups;
DROP POLICY IF EXISTS "Group members can view groups" ON groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON groups;
DROP POLICY IF EXISTS "Group creators can update groups" ON groups;

-- Groups: Secure RLS Policies
CREATE POLICY "Leaders and members can view their groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    auth.uid() = leader_id 
    OR is_public = true 
    OR EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Only leaders can update their groups"
  ON groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = leader_id)
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Only leaders can delete their groups"
  ON groups FOR DELETE
  TO authenticated
  USING (auth.uid() = leader_id);

-- Group Members: Secure RLS Policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Leaders can add members" ON group_members;
DROP POLICY IF EXISTS "Leaders and users can update memberships" ON group_members;
DROP POLICY IF EXISTS "Leaders can remove members" ON group_members;
DROP POLICY IF EXISTS "View group members policy" ON group_members;
DROP POLICY IF EXISTS "Users can remove themselves from groups" ON group_members;

CREATE POLICY "Members can view members in their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
      AND gm2.status = 'active'
    )
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.leader_id = auth.uid()
    )
  );

CREATE POLICY "Leaders and self can add members"
  ON group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.leader_id = auth.uid()
    ) 
    OR group_members.user_id = auth.uid()
  );

CREATE POLICY "Leaders and self can update memberships"
  ON group_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.leader_id = auth.uid()
    ) 
    OR group_members.user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.leader_id = auth.uid()
    ) 
    OR group_members.user_id = auth.uid()
  );

CREATE POLICY "Leaders and self can remove members"
  ON group_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND groups.leader_id = auth.uid()
    ) 
    OR group_members.user_id = auth.uid()
  );

-- Group Discussions: Secure RLS Policies
DROP POLICY IF EXISTS "Members can view discussions in their groups" ON group_discussions;
DROP POLICY IF EXISTS "Leaders can create discussions" ON group_discussions;
DROP POLICY IF EXISTS "Leaders can update discussions" ON group_discussions;
DROP POLICY IF EXISTS "Users can view discussions in their groups" ON group_discussions;

CREATE POLICY "Members can view discussions in their groups"
  ON group_discussions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_discussions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Leaders can manage discussions"
  ON group_discussions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_discussions.group_id
      AND groups.leader_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can update discussions"
  ON group_discussions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_discussions.group_id
      AND groups.leader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_discussions.group_id
      AND groups.leader_id = auth.uid()
    )
  );

-- Discussion Posts: Secure RLS Policies
DROP POLICY IF EXISTS "Members can view posts in their groups" ON discussion_posts;
DROP POLICY IF EXISTS "Members can create posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users and leaders can delete posts" ON discussion_posts;
DROP POLICY IF EXISTS "Users can view posts in accessible discussions" ON discussion_posts;

CREATE POLICY "Members can view posts in their groups"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gm.group_id = gd.group_id
      WHERE gd.id = discussion_posts.discussion_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

CREATE POLICY "Members can create posts in their groups"
  ON discussion_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gm.group_id = gd.group_id
      WHERE gd.id = discussion_posts.discussion_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    ) 
    AND auth.uid() = user_id
  );

CREATE POLICY "Users can update their own posts"
  ON discussion_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and leaders can delete posts"
  ON discussion_posts FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN groups g ON g.id = gd.group_id
      WHERE gd.id = discussion_posts.discussion_id
      AND g.leader_id = auth.uid()
    )
  );

-- Prayer Requests: Secure RLS Policies
DROP POLICY IF EXISTS "Users can view group prayer requests" ON prayer_requests;

CREATE POLICY "Members can view prayer requests in their groups"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    group_id IS NULL 
    OR auth.uid() = user_id 
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Group Broadcasts: Secure RLS Policies  
DROP POLICY IF EXISTS "Users can view broadcasts in their groups" ON group_broadcasts;
DROP POLICY IF EXISTS "Members can view broadcasts" ON group_broadcasts;
DROP POLICY IF EXISTS "Leaders can create broadcasts" ON group_broadcasts;
DROP POLICY IF EXISTS "Senders can update broadcasts" ON group_broadcasts;
DROP POLICY IF EXISTS "Senders can delete broadcasts" ON group_broadcasts;

CREATE POLICY "Members can view broadcasts in their groups"
  ON group_broadcasts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_broadcasts.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

CREATE POLICY "Leaders can create broadcasts"
  ON group_broadcasts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_broadcasts.group_id
      AND groups.leader_id = auth.uid()
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
