/*
  # Optimize RLS Policies - Batch 4 (Cycles & Video Calls)

  ## Overview
  Continues optimization of RLS policies for cycle, video call, and challenge tables.

  ## Tables Optimized (Batch 4)

  ### cycle_progress_snapshot (3 policies)
  - Users can create their own cycle snapshots
  - Users can update their own cycle snapshots
  - Users can view their own cycle snapshots

  ### video_call_sessions (1 policy)
  - Group members can view video sessions

  ### video_call_participants (3 policies)
  - Group members can join calls
  - Group members can view call participants
  - Users can update own participation

  ### weekly_discussion_completion (2 policies)
  - Group members can mark completion
  - Users can view own completion

  ### prayer_requests (1 policy)
  - Group members can view group prayers

  ### challenge_completions (2 policies)
  - Users can complete challenges
  - Users can uncomplete challenges
*/

-- cycle_progress_snapshot policies
DROP POLICY IF EXISTS "Users can create their own cycle snapshots" ON public.cycle_progress_snapshot;
DROP POLICY IF EXISTS "Users can update their own cycle snapshots" ON public.cycle_progress_snapshot;
DROP POLICY IF EXISTS "Users can view their own cycle snapshots" ON public.cycle_progress_snapshot;

CREATE POLICY "Users can create their own cycle snapshots" ON public.cycle_progress_snapshot
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.plan_cycles
      WHERE id = cycle_progress_snapshot.cycle_id
      AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update their own cycle snapshots" ON public.cycle_progress_snapshot
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.plan_cycles
      WHERE id = cycle_progress_snapshot.cycle_id
      AND user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view their own cycle snapshots" ON public.cycle_progress_snapshot
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.plan_cycles
      WHERE id = cycle_progress_snapshot.cycle_id
      AND user_id = (SELECT auth.uid())
    )
  );

-- video_call_sessions policies
DROP POLICY IF EXISTS "Group members can view video sessions" ON public.video_call_sessions;

CREATE POLICY "Group members can view video sessions" ON public.video_call_sessions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = video_call_sessions.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- video_call_participants policies
DROP POLICY IF EXISTS "Group members can join calls" ON public.video_call_participants;
DROP POLICY IF EXISTS "Group members can view call participants" ON public.video_call_participants;
DROP POLICY IF EXISTS "Users can update own participation" ON public.video_call_participants;

CREATE POLICY "Group members can join calls" ON public.video_call_participants
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.video_call_sessions vcs
      JOIN public.group_members gm ON vcs.group_id = gm.group_id
      WHERE vcs.id = video_call_participants.session_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Group members can view call participants" ON public.video_call_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.video_call_sessions vcs
      JOIN public.group_members gm ON vcs.group_id = gm.group_id
      WHERE vcs.id = video_call_participants.session_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own participation" ON public.video_call_participants
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- weekly_discussion_completion policies
DROP POLICY IF EXISTS "Group members can mark completion" ON public.weekly_discussion_completion;
DROP POLICY IF EXISTS "Users can view own completion" ON public.weekly_discussion_completion;

CREATE POLICY "Group members can mark completion" ON public.weekly_discussion_completion
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = weekly_discussion_completion.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can view own completion" ON public.weekly_discussion_completion
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- prayer_requests policies (keeping existing policy name)
DROP POLICY IF EXISTS "Group members can view group prayers" ON public.prayer_requests;

CREATE POLICY "Group members can view group prayers" ON public.prayer_requests
  FOR SELECT TO authenticated USING (
    group_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = prayer_requests.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- challenge_completions policies
DROP POLICY IF EXISTS "Users can complete challenges" ON public.challenge_completions;
DROP POLICY IF EXISTS "Users can uncomplete challenges" ON public.challenge_completions;

CREATE POLICY "Users can complete challenges" ON public.challenge_completions
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can uncomplete challenges" ON public.challenge_completions
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));
