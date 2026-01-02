/*
  # Remove Unused Indexes - Batch 1

  ## Overview
  Removes database indexes that have not been used, reducing storage overhead and
  improving write performance. Unused indexes consume disk space and slow down
  INSERT, UPDATE, and DELETE operations without providing query benefits.

  ## Performance Impact
  - Reduces storage usage
  - Improves write operation performance
  - Reduces maintenance overhead during VACUUM operations

  ## Indexes Removed (35 total)

  ### User and Activity Indexes
  1. idx_challenge_completions_user_id
  2. idx_chat_moderation_actions_moderator_id
  3. idx_chat_moderation_actions_target_user_id
  4. idx_chat_reactions_user_id
  5. idx_chat_typing_indicators_user_id
  6. idx_cycle_progress_snapshot_reading_id
  7. idx_discussion_posts_user_id
  8. idx_discussion_replies_user_id
  9. idx_friendships_friend_id
  10. idx_group_broadcasts_sender_id

  ### Group and Chat Indexes
  11. idx_group_chat_messages_deleted_by
  12. idx_group_chat_messages_reply_to_id
  13. idx_group_chat_messages_user_id
  14. idx_group_members_invited_by
  15. idx_group_notifications_group_id
  16. idx_group_notifications_post_id
  17. idx_groups_leader_id
  18. idx_live_video_sessions_host_id
  19. idx_member_mutes_muted_by
  20. idx_member_mutes_user_id

  ### Reactions and Prayer Indexes
  21. idx_post_reactions_user_id
  22. idx_prayer_requests_user_id
  23. idx_prayer_responses_user_id
  24. idx_reply_reactions_user_id
  25. idx_study_group_members_user_id
  26. idx_video_session_participants_user_id

  ### Content and Progress Indexes
  27. idx_user_notes_reading_id
  28. idx_user_redemption_badges_badge_id
  29. idx_user_streaks_current_cycle_id
  30. idx_verse_bookmarks_reading_id
  31. idx_video_call_participants_user_id
  32. idx_video_call_sessions_started_by
  33. idx_week_wallpapers_created_by
  34. idx_weekly_challenges_created_by
  35. idx_weekly_discussion_completion_group_id

  ## Note
  These indexes were identified as unused by PostgreSQL statistics. If query patterns
  change in the future and these indexes become needed, they can be recreated.
*/

-- User and Activity Indexes
DROP INDEX IF EXISTS public.idx_challenge_completions_user_id;
DROP INDEX IF EXISTS public.idx_chat_moderation_actions_moderator_id;
DROP INDEX IF EXISTS public.idx_chat_moderation_actions_target_user_id;
DROP INDEX IF EXISTS public.idx_chat_reactions_user_id;
DROP INDEX IF EXISTS public.idx_chat_typing_indicators_user_id;
DROP INDEX IF EXISTS public.idx_cycle_progress_snapshot_reading_id;
DROP INDEX IF EXISTS public.idx_discussion_posts_user_id;
DROP INDEX IF EXISTS public.idx_discussion_replies_user_id;
DROP INDEX IF EXISTS public.idx_friendships_friend_id;
DROP INDEX IF EXISTS public.idx_group_broadcasts_sender_id;

-- Group and Chat Indexes
DROP INDEX IF EXISTS public.idx_group_chat_messages_deleted_by;
DROP INDEX IF EXISTS public.idx_group_chat_messages_reply_to_id;
DROP INDEX IF EXISTS public.idx_group_chat_messages_user_id;
DROP INDEX IF EXISTS public.idx_group_members_invited_by;
DROP INDEX IF EXISTS public.idx_group_notifications_group_id;
DROP INDEX IF EXISTS public.idx_group_notifications_post_id;
DROP INDEX IF EXISTS public.idx_groups_leader_id;
DROP INDEX IF EXISTS public.idx_live_video_sessions_host_id;
DROP INDEX IF EXISTS public.idx_member_mutes_muted_by;
DROP INDEX IF EXISTS public.idx_member_mutes_user_id;

-- Reactions and Prayer Indexes
DROP INDEX IF EXISTS public.idx_post_reactions_user_id;
DROP INDEX IF EXISTS public.idx_prayer_requests_user_id;
DROP INDEX IF EXISTS public.idx_prayer_responses_user_id;
DROP INDEX IF EXISTS public.idx_reply_reactions_user_id;
DROP INDEX IF EXISTS public.idx_study_group_members_user_id;
DROP INDEX IF EXISTS public.idx_video_session_participants_user_id;

-- Content and Progress Indexes
DROP INDEX IF EXISTS public.idx_user_notes_reading_id;
DROP INDEX IF EXISTS public.idx_user_redemption_badges_badge_id;
DROP INDEX IF EXISTS public.idx_user_streaks_current_cycle_id;
DROP INDEX IF EXISTS public.idx_verse_bookmarks_reading_id;
DROP INDEX IF EXISTS public.idx_video_call_participants_user_id;
DROP INDEX IF EXISTS public.idx_video_call_sessions_started_by;
DROP INDEX IF EXISTS public.idx_week_wallpapers_created_by;
DROP INDEX IF EXISTS public.idx_weekly_challenges_created_by;
DROP INDEX IF EXISTS public.idx_weekly_discussion_completion_group_id;
