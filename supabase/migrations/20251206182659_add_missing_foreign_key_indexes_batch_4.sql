/*
  # Add Missing Foreign Key Indexes - Batch 4
  
  1. Performance Optimization
    - Adds indexes for foreign keys in user_redemption_badges, user_streaks, verse_bookmarks
    - Adds indexes for foreign keys in video_call_participants, video_call_sessions, video_session_participants
    - Adds indexes for foreign keys in week_wallpapers, weekly_challenges, weekly_discussion_completion
    - These indexes complete the foreign key indexing across all tables
  
  2. Security
    - Ensures all foreign key relationships are properly indexed
    - Prevents performance degradation on complex queries
*/

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