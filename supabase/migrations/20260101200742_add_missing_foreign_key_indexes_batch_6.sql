/*
  # Add Missing Foreign Key Indexes - Batch 6

  1. New Indexes
    - Add indexes for remaining unindexed foreign keys
    - Covers member_mutes, post_reactions, prayer_requests, prayer_responses
    - Covers reply_reactions, study_group_members, user_notes, user_redemption_badges
    - Covers user_streaks, verse_bookmarks, video_call_participants, video_call_sessions
    - Covers video_session_participants, week_wallpapers, weekly_challenges, weekly_discussion_completion

  2. Performance Impact
    - Completes foreign key indexing across all tables
    - Ensures optimal JOIN performance throughout the application
*/

-- member_mutes
CREATE INDEX IF NOT EXISTS idx_member_mutes_muted_by 
  ON member_mutes(muted_by);
CREATE INDEX IF NOT EXISTS idx_member_mutes_user_id 
  ON member_mutes(user_id);

-- post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id 
  ON post_reactions(user_id);

-- prayer_requests
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id 
  ON prayer_requests(user_id);

-- prayer_responses
CREATE INDEX IF NOT EXISTS idx_prayer_responses_user_id 
  ON prayer_responses(user_id);

-- reply_reactions
CREATE INDEX IF NOT EXISTS idx_reply_reactions_user_id 
  ON reply_reactions(user_id);

-- study_group_members
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id 
  ON study_group_members(user_id);

-- user_notes
CREATE INDEX IF NOT EXISTS idx_user_notes_reading_id 
  ON user_notes(reading_id);

-- user_redemption_badges
CREATE INDEX IF NOT EXISTS idx_user_redemption_badges_badge_id 
  ON user_redemption_badges(badge_id);

-- user_streaks
CREATE INDEX IF NOT EXISTS idx_user_streaks_current_cycle_id 
  ON user_streaks(current_cycle_id);

-- verse_bookmarks
CREATE INDEX IF NOT EXISTS idx_verse_bookmarks_reading_id 
  ON verse_bookmarks(reading_id);

-- video_call_participants
CREATE INDEX IF NOT EXISTS idx_video_call_participants_user_id 
  ON video_call_participants(user_id);

-- video_call_sessions
CREATE INDEX IF NOT EXISTS idx_video_call_sessions_started_by 
  ON video_call_sessions(started_by);

-- video_session_participants
CREATE INDEX IF NOT EXISTS idx_video_session_participants_user_id 
  ON video_session_participants(user_id);

-- week_wallpapers
CREATE INDEX IF NOT EXISTS idx_week_wallpapers_created_by 
  ON week_wallpapers(created_by);

-- weekly_challenges
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_created_by 
  ON weekly_challenges(created_by);

-- weekly_discussion_completion
CREATE INDEX IF NOT EXISTS idx_weekly_discussion_completion_group_id 
  ON weekly_discussion_completion(group_id);