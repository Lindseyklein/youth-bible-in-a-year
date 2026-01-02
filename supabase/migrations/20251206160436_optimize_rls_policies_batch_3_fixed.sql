/*
  # Optimize RLS Policies - Batch 3 (Discussion & Video)

  ## Overview
  Continues optimization of RLS policies for discussion and video-related tables.

  ## Tables Optimized (Batch 3)

  ### discussion_questions (1 policy)
  - Group members can view discussion questions

  ### discussion_replies (3 policies)
  - Group members can create replies
  - Group members can view replies
  - Users can update own replies

  ### reply_reactions (3 policies)
  - Group members can add reactions
  - Group members can view reactions
  - Users can remove own reactions

  ### chat_typing_indicators (1 policy)
  - Group members can view typing indicators

  ### user_presence (3 policies)
  - Members can view presence in groups
  - Users can insert their presence
  - Users can modify their presence

  ### live_video_sessions (4 policies)
  - Hosts can delete video sessions
  - Hosts can update video sessions
  - Leaders can create video sessions
  - Members can view video sessions
*/

-- discussion_questions policies
DROP POLICY IF EXISTS "Group members can view discussion questions" ON public.discussion_questions;

CREATE POLICY "Group members can view discussion questions" ON public.discussion_questions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = discussion_questions.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- discussion_replies policies
DROP POLICY IF EXISTS "Group members can create replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Group members can view replies" ON public.discussion_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON public.discussion_replies;

CREATE POLICY "Group members can create replies" ON public.discussion_replies
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.discussion_questions dq
      JOIN public.group_members gm ON dq.group_id = gm.group_id
      WHERE dq.id = discussion_replies.question_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Group members can view replies" ON public.discussion_replies
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.discussion_questions dq
      JOIN public.group_members gm ON dq.group_id = gm.group_id
      WHERE dq.id = discussion_replies.question_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update own replies" ON public.discussion_replies
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- reply_reactions policies
DROP POLICY IF EXISTS "Group members can add reactions" ON public.reply_reactions;
DROP POLICY IF EXISTS "Group members can view reactions" ON public.reply_reactions;
DROP POLICY IF EXISTS "Users can remove own reactions" ON public.reply_reactions;

CREATE POLICY "Group members can add reactions" ON public.reply_reactions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.discussion_replies dr
      JOIN public.discussion_questions dq ON dr.question_id = dq.id
      JOIN public.group_members gm ON dq.group_id = gm.group_id
      WHERE dr.id = reply_reactions.reply_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Group members can view reactions" ON public.reply_reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.discussion_replies dr
      JOIN public.discussion_questions dq ON dr.question_id = dq.id
      JOIN public.group_members gm ON dq.group_id = gm.group_id
      WHERE dr.id = reply_reactions.reply_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can remove own reactions" ON public.reply_reactions
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- chat_typing_indicators policies
DROP POLICY IF EXISTS "Group members can view typing indicators" ON public.chat_typing_indicators;

CREATE POLICY "Group members can view typing indicators" ON public.chat_typing_indicators
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = chat_typing_indicators.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- user_presence policies
DROP POLICY IF EXISTS "Members can view presence in groups" ON public.user_presence;
DROP POLICY IF EXISTS "Users can insert their presence" ON public.user_presence;
DROP POLICY IF EXISTS "Users can modify their presence" ON public.user_presence;

CREATE POLICY "Members can view presence in groups" ON public.user_presence
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = user_presence.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert their presence" ON public.user_presence
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can modify their presence" ON public.user_presence
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- live_video_sessions policies
DROP POLICY IF EXISTS "Hosts can delete video sessions" ON public.live_video_sessions;
DROP POLICY IF EXISTS "Hosts can update video sessions" ON public.live_video_sessions;
DROP POLICY IF EXISTS "Leaders can create video sessions" ON public.live_video_sessions;
DROP POLICY IF EXISTS "Members can view video sessions" ON public.live_video_sessions;

CREATE POLICY "Hosts can delete video sessions" ON public.live_video_sessions
  FOR DELETE TO authenticated USING (host_id = (SELECT auth.uid()));

CREATE POLICY "Hosts can update video sessions" ON public.live_video_sessions
  FOR UPDATE TO authenticated 
  USING (host_id = (SELECT auth.uid()))
  WITH CHECK (host_id = (SELECT auth.uid()));

CREATE POLICY "Leaders can create video sessions" ON public.live_video_sessions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = live_video_sessions.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can view video sessions" ON public.live_video_sessions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = live_video_sessions.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );
