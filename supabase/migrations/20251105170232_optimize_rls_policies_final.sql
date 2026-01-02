/*
  # Optimize RLS Policies with Subquery Pattern (Final)

  1. Purpose
    - Replace direct auth.uid() calls with (select auth.uid()) pattern
    - Prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale
    - Uses correct column names (is_approved instead of status)

  2. Pattern
    - Before: USING (auth.uid() = user_id)
    - After: USING ((select auth.uid()) = user_id)
*/

-- Profiles policies
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- User Progress policies
DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;

CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own progress"
  ON user_progress FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Study Groups policies
DROP POLICY IF EXISTS "Group members can view groups" ON study_groups;
DROP POLICY IF EXISTS "Authenticated users can create groups" ON study_groups;
DROP POLICY IF EXISTS "Group creators can update groups" ON study_groups;

CREATE POLICY "Group members can view groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_groups.id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Authenticated users can create groups"
  ON study_groups FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = created_by);

CREATE POLICY "Group creators can update groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = created_by)
  WITH CHECK ((select auth.uid()) = created_by);

-- Study Group Members policies
DROP POLICY IF EXISTS "Group members can view membership" ON study_group_members;
DROP POLICY IF EXISTS "Group admins can add members" ON study_group_members;
DROP POLICY IF EXISTS "Users can remove themselves from groups" ON study_group_members;

CREATE POLICY "Group members can view membership"
  ON study_group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
      AND sgm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Group admins can add members"
  ON study_group_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM study_group_members sgm
      WHERE sgm.group_id = study_group_members.group_id
      AND sgm.user_id = (select auth.uid())
      AND sgm.is_admin = true
    )
  );

CREATE POLICY "Users can remove themselves from groups"
  ON study_group_members FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Group Study Responses policies
DROP POLICY IF EXISTS "Group members can view responses" ON group_study_responses;
DROP POLICY IF EXISTS "Users can insert own responses" ON group_study_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON group_study_responses;

CREATE POLICY "Group members can view responses"
  ON group_study_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = group_study_responses.study_id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own responses"
  ON group_study_responses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own responses"
  ON group_study_responses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Friendships policies
DROP POLICY IF EXISTS "Users can view own friendships" ON friendships;
DROP POLICY IF EXISTS "Users can send friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can update received friend requests" ON friendships;
DROP POLICY IF EXISTS "Users can delete own friendships" ON friendships;

CREATE POLICY "Users can view own friendships"
  ON friendships FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = friend_id);

CREATE POLICY "Users can send friend requests"
  ON friendships FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update received friend requests"
  ON friendships FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = friend_id)
  WITH CHECK ((select auth.uid()) = friend_id);

CREATE POLICY "Users can delete own friendships"
  ON friendships FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR (select auth.uid()) = friend_id);

-- User Preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- User Streaks policies
DROP POLICY IF EXISTS "Users can view own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can update own streak" ON user_streaks;
DROP POLICY IF EXISTS "Users can insert own streak" ON user_streaks;

CREATE POLICY "Users can view own streak"
  ON user_streaks FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own streak"
  ON user_streaks FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own streak"
  ON user_streaks FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- User Achievements policies
DROP POLICY IF EXISTS "Users can view own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can insert own achievements" ON user_achievements;
DROP POLICY IF EXISTS "Users can update own achievement progress" ON user_achievements;

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own achievements"
  ON user_achievements FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own achievement progress"
  ON user_achievements FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Community Posts policies
DROP POLICY IF EXISTS "Anyone can view approved posts" ON community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;

CREATE POLICY "Anyone can view approved posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own posts"
  ON community_posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- Post Comments policies
DROP POLICY IF EXISTS "Anyone can view approved comments" ON post_comments;
DROP POLICY IF EXISTS "Users can create comments" ON post_comments;

CREATE POLICY "Anyone can view approved comments"
  ON post_comments FOR SELECT
  TO authenticated
  USING (is_approved = true);

CREATE POLICY "Users can create comments"
  ON post_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Post Likes policies
DROP POLICY IF EXISTS "Users can manage own likes" ON post_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;

CREATE POLICY "Users can manage own likes"
  ON post_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own likes"
  ON post_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Favorite Verses policies
DROP POLICY IF EXISTS "Users can view own favorites" ON favorite_verses;
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorite_verses;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorite_verses;

CREATE POLICY "Users can view own favorites"
  ON favorite_verses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can manage own favorites"
  ON favorite_verses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorite_verses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Study Answers policies
DROP POLICY IF EXISTS "Group members can view answers" ON study_answers;
DROP POLICY IF EXISTS "Users can create own answers" ON study_answers;
DROP POLICY IF EXISTS "Users can update own answers within edit window" ON study_answers;

CREATE POLICY "Group members can view answers"
  ON study_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_group_members
      WHERE study_group_members.group_id = study_answers.group_id
      AND study_group_members.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create own answers"
  ON study_answers FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own answers within edit window"
  ON study_answers FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id 
    AND created_at > NOW() - INTERVAL '30 minutes'
  )
  WITH CHECK ((select auth.uid()) = user_id);

-- Answer Comments policies
DROP POLICY IF EXISTS "Group members can view comments" ON answer_comments;
DROP POLICY IF EXISTS "Users can create comments" ON answer_comments;

CREATE POLICY "Group members can view comments"
  ON answer_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM study_answers sa
      JOIN study_group_members sgm ON sgm.group_id = sa.group_id
      WHERE sa.id = answer_comments.answer_id
      AND sgm.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create comments"
  ON answer_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- Answer Likes policies
DROP POLICY IF EXISTS "Users can manage own likes" ON answer_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON answer_likes;

CREATE POLICY "Users can manage own likes"
  ON answer_likes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own likes"
  ON answer_likes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Answer Reactions policies
DROP POLICY IF EXISTS "Users can manage own reactions" ON answer_reactions;
DROP POLICY IF EXISTS "Users can delete own reactions" ON answer_reactions;

CREATE POLICY "Users can manage own reactions"
  ON answer_reactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own reactions"
  ON answer_reactions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Participation Badges policies
DROP POLICY IF EXISTS "Users can view own badges" ON participation_badges;

CREATE POLICY "Users can view own badges"
  ON participation_badges FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- Content Reports policies
DROP POLICY IF EXISTS "Users can create reports" ON content_reports;
DROP POLICY IF EXISTS "Users can view own reports" ON content_reports;

CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = reported_by);

CREATE POLICY "Users can view own reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = reported_by);
