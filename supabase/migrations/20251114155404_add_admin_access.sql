/*
  # Add Admin Access System

  1. Changes
    - Add is_admin flag to profiles table
    - Update all RLS policies to allow admin full access
    - Mark current user as admin

  2. Security
    - Admins can view and manage all data
    - Regular users maintain existing restrictions
*/

-- Add is_admin column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Make the current user an admin
UPDATE profiles 
SET is_admin = true 
WHERE id = 'eda2265a-65fd-458e-8a50-5491e02304ae';

-- Update groups policies to allow admin access
DROP POLICY IF EXISTS "Users can view public groups" ON groups;
CREATE POLICY "Users can view public groups"
  ON groups FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR is_public = true 
    OR leader_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM group_members 
      WHERE group_members.group_id = groups.id 
      AND group_members.user_id = auth.uid() 
      AND group_members.status = 'active'
    )
  );

-- Update group_members policies to allow admin access
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (
      SELECT 1 FROM group_members gm2
      WHERE gm2.group_id = group_members.group_id
      AND gm2.user_id = auth.uid()
      AND gm2.status = 'active'
    )
  );

-- Update prayer_requests policies to allow admin access
DROP POLICY IF EXISTS "Users can view group prayer requests" ON prayer_requests;
CREATE POLICY "Users can view group prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR (
      visibility = 'group' 
      AND EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = prayer_requests.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'active'
      )
    )
    OR (
      visibility = 'leaders_only'
      AND EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = prayer_requests.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'active'
        AND group_members.role IN ('leader', 'moderator')
      )
    )
    OR user_id = auth.uid()
  );

-- Update group_discussions policies to allow admin access
DROP POLICY IF EXISTS "Users can view discussions in their groups" ON group_discussions;
CREATE POLICY "Users can view discussions in their groups"
  ON group_discussions FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_discussions.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Update discussion_posts policies to allow admin access
DROP POLICY IF EXISTS "Users can view posts in accessible discussions" ON discussion_posts;
CREATE POLICY "Users can view posts in accessible discussions"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (
      SELECT 1 FROM group_discussions gd
      JOIN group_members gm ON gd.group_id = gm.group_id
      WHERE gd.id = discussion_posts.discussion_id
      AND gm.user_id = auth.uid()
      AND gm.status = 'active'
    )
  );

-- Update group_broadcasts policies to allow admin access
DROP POLICY IF EXISTS "Users can view broadcasts in their groups" ON group_broadcasts;
CREATE POLICY "Users can view broadcasts in their groups"
  ON group_broadcasts FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_broadcasts.group_id
      AND group_members.user_id = auth.uid()
      AND group_members.status = 'active'
    )
  );

-- Update weekly_challenges policies to allow admin access
DROP POLICY IF EXISTS "Anyone can view weekly challenges" ON weekly_challenges;
CREATE POLICY "Anyone can view weekly challenges"
  ON weekly_challenges FOR SELECT
  TO authenticated
  USING (true);

-- Update challenge_completions policies to allow admin access
DROP POLICY IF EXISTS "Users can view all challenge completions" ON challenge_completions;
CREATE POLICY "Users can view all challenge completions"
  ON challenge_completions FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin FROM profiles WHERE id = auth.uid()) = true
    OR true
  );
