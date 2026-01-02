/*
  # Remove Unused Indexes - Batch 3
  
  1. Indexes Removed (Final 12)
    - idx_prayer_responses_user_id
    - idx_reply_reactions_user_id
    - idx_study_group_members_user_id
    - idx_user_notes_reading_id
    - idx_user_redemption_badges_badge_id
    - idx_user_streaks_current_cycle_id
    - idx_verse_bookmarks_reading_id
    - idx_video_call_participants_user_id
    - idx_video_call_sessions_started_by
    - idx_video_session_participants_user_id
    - idx_week_wallpapers_created_by
    - idx_weekly_challenges_created_by
    - idx_weekly_discussion_completion_group_id
  
  2. Purpose
    - Remove indexes that are not being used by any queries
    - Reduces storage overhead and improves write performance
    - These indexes can be recreated if needed in the future
*/

DROP INDEX IF EXISTS idx_prayer_responses_user_id;
DROP INDEX IF EXISTS idx_reply_reactions_user_id;
DROP INDEX IF EXISTS idx_study_group_members_user_id;
DROP INDEX IF EXISTS idx_user_notes_reading_id;
DROP INDEX IF EXISTS idx_user_redemption_badges_badge_id;
DROP INDEX IF EXISTS idx_user_streaks_current_cycle_id;
DROP INDEX IF EXISTS idx_verse_bookmarks_reading_id;
DROP INDEX IF EXISTS idx_video_call_participants_user_id;
DROP INDEX IF EXISTS idx_video_call_sessions_started_by;
DROP INDEX IF EXISTS idx_video_session_participants_user_id;
DROP INDEX IF EXISTS idx_week_wallpapers_created_by;
DROP INDEX IF EXISTS idx_weekly_challenges_created_by;
DROP INDEX IF EXISTS idx_weekly_discussion_completion_group_id;
