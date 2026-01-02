/*
  # Optimize RLS Policies - Batch 2 (Group-Related)

  ## Overview
  Continues optimization of RLS policies for group-related tables.

  ## Tables Optimized (Batch 2)

  ### group_discussions (3 policies)
  - Leaders can manage discussions
  - Leaders can update discussions
  - Members can view discussions in their groups

  ### chat_moderation_actions (2 policies)
  - Leaders can create moderation actions
  - Leaders can view moderation logs

  ### group_settings (3 policies)
  - Leaders can create settings
  - Leaders can modify settings
  - Members can view settings

  ### chat_reactions (3 policies)
  - Members can view chat reactions
  - Users can add chat reactions
  - Users can remove their chat reactions

  ### video_session_participants (3 policies)
  - Members can view video participants
  - Users and hosts can update participation
  - Users can join video

  ### member_mutes (1 policy)
  - Leaders can view mutes
*/

-- group_discussions policies
DROP POLICY IF EXISTS "Leaders can manage discussions" ON public.group_discussions;
DROP POLICY IF EXISTS "Leaders can update discussions" ON public.group_discussions;
DROP POLICY IF EXISTS "Members can view discussions in their groups" ON public.group_discussions;

CREATE POLICY "Leaders can manage discussions" ON public.group_discussions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_discussions.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Leaders can update discussions" ON public.group_discussions
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_discussions.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can view discussions in their groups" ON public.group_discussions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_discussions.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- chat_moderation_actions policies
DROP POLICY IF EXISTS "Leaders can create moderation actions" ON public.chat_moderation_actions;
DROP POLICY IF EXISTS "Leaders can view moderation logs" ON public.chat_moderation_actions;

CREATE POLICY "Leaders can create moderation actions" ON public.chat_moderation_actions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = chat_moderation_actions.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Leaders can view moderation logs" ON public.chat_moderation_actions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = chat_moderation_actions.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

-- group_settings policies
DROP POLICY IF EXISTS "Leaders can create settings" ON public.group_settings;
DROP POLICY IF EXISTS "Leaders can modify settings" ON public.group_settings;
DROP POLICY IF EXISTS "Members can view settings" ON public.group_settings;

CREATE POLICY "Leaders can create settings" ON public.group_settings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_settings.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Leaders can modify settings" ON public.group_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = group_settings.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Members can view settings" ON public.group_settings
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = group_settings.group_id
      AND group_members.user_id = (SELECT auth.uid())
    )
  );

-- chat_reactions policies
DROP POLICY IF EXISTS "Members can view chat reactions" ON public.chat_reactions;
DROP POLICY IF EXISTS "Users can add chat reactions" ON public.chat_reactions;
DROP POLICY IF EXISTS "Users can remove their chat reactions" ON public.chat_reactions;

CREATE POLICY "Members can view chat reactions" ON public.chat_reactions
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.group_chat_messages gcm
      JOIN public.group_members gm ON gcm.group_id = gm.group_id
      WHERE gcm.id = chat_reactions.message_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can add chat reactions" ON public.chat_reactions
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can remove their chat reactions" ON public.chat_reactions
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

-- video_session_participants policies
DROP POLICY IF EXISTS "Members can view video participants" ON public.video_session_participants;
DROP POLICY IF EXISTS "Users and hosts can update participation" ON public.video_session_participants;
DROP POLICY IF EXISTS "Users can join video" ON public.video_session_participants;

CREATE POLICY "Members can view video participants" ON public.video_session_participants
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.live_video_sessions lvs
      JOIN public.group_members gm ON lvs.group_id = gm.group_id
      WHERE lvs.id = video_session_participants.session_id
      AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users and hosts can update participation" ON public.video_session_participants
  FOR UPDATE TO authenticated USING (
    user_id = (SELECT auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.live_video_sessions lvs
      WHERE lvs.id = video_session_participants.session_id
      AND lvs.host_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can join video" ON public.video_session_participants
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

-- member_mutes policies
DROP POLICY IF EXISTS "Leaders can view mutes" ON public.member_mutes;

CREATE POLICY "Leaders can view mutes" ON public.member_mutes
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE id = member_mutes.group_id
      AND leader_id = (SELECT auth.uid())
    )
  );
