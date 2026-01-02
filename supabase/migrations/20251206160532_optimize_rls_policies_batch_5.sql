/*
  # Optimize RLS Policies - Batch 5 (Badges, Shares & Broadcasts)

  ## Overview
  Continues optimization of RLS policies for badges, wallpapers, shares, and broadcast tables.

  ## Tables Optimized (Batch 5)

  ### week_wallpapers (2 policies)
  - Creators can update wallpapers
  - Leaders can create wallpapers

  ### user_badges (3 policies)
  - System can create badges
  - Users can update their badges
  - Users can view their badges

  ### shared_verses (2 policies)
  - Authenticated users can create shares
  - Users can update their shares

  ### group_broadcasts (4 policies)
  - Leaders can create broadcasts
  - Members can view broadcasts in their groups
  - Senders can delete broadcasts
  - Senders can update broadcasts

  ### weekly_challenges (2 policies)
  - Creators can update challenges
  - Leaders can create challenges
*/

-- week_wallpapers policies
DROP POLICY IF EXISTS "Creators can update wallpapers" ON public.week_wallpapers;
DROP POLICY IF EXISTS "Leaders can create wallpapers" ON public.week_wallpapers;

CREATE POLICY "Creators can update wallpapers" ON public.week_wallpapers
  FOR UPDATE TO authenticated 
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Leaders can create wallpapers" ON public.week_wallpapers
  FOR INSERT TO authenticated WITH CHECK (created_by = (SELECT auth.uid()));

-- user_badges policies
DROP POLICY IF EXISTS "System can create badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can update their badges" ON public.user_badges;
DROP POLICY IF EXISTS "Users can view their badges" ON public.user_badges;

CREATE POLICY "System can create badges" ON public.user_badges
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update their badges" ON public.user_badges
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their badges" ON public.user_badges
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- shared_verses policies
DROP POLICY IF EXISTS "Authenticated users can create shares" ON public.shared_verses;
DROP POLICY IF EXISTS "Users can update their shares" ON public.shared_verses;

CREATE POLICY "Authenticated users can create shares" ON public.shared_verses
  FOR INSERT TO authenticated WITH CHECK (shared_by = (SELECT auth.uid()));

CREATE POLICY "Users can update their shares" ON public.shared_verses
  FOR UPDATE TO authenticated 
  USING (shared_by = (SELECT auth.uid()))
  WITH CHECK (shared_by = (SELECT auth.uid()));

-- group_broadcasts policies
DROP POLICY IF EXISTS "Leaders can create broadcasts" ON public.group_broadcasts;
DROP POLICY IF EXISTS "Members can view broadcasts in their groups" ON public.group_broadcasts;
DROP POLICY IF EXISTS "Senders can delete broadcasts" ON public.group_broadcasts;
DROP POLICY IF EXISTS "Senders can update broadcasts" ON public.group_broadcasts;

CREATE POLICY "Leaders can create broadcasts" ON public.group_broadcasts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_broadcasts.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can view broadcasts in their groups" ON public.group_broadcasts
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_broadcasts.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Senders can delete broadcasts" ON public.group_broadcasts
  FOR DELETE TO authenticated USING (sender_id = (SELECT auth.uid()));

CREATE POLICY "Senders can update broadcasts" ON public.group_broadcasts
  FOR UPDATE TO authenticated 
  USING (sender_id = (SELECT auth.uid()))
  WITH CHECK (sender_id = (SELECT auth.uid()));

-- weekly_challenges policies
DROP POLICY IF EXISTS "Creators can update challenges" ON public.weekly_challenges;
DROP POLICY IF EXISTS "Leaders can create challenges" ON public.weekly_challenges;

CREATE POLICY "Creators can update challenges" ON public.weekly_challenges
  FOR UPDATE TO authenticated 
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

CREATE POLICY "Leaders can create challenges" ON public.weekly_challenges
  FOR INSERT TO authenticated WITH CHECK (created_by = (SELECT auth.uid()));
