/*
  # Remove Unused Indexes - Batch 4
  
  1. Performance Optimization
    - Removes unused indexes from user_achievements, user_invites, user_notes
    - Removes unused indexes from user_preferences, user_progress, verse_bookmarks
    - Completes the cleanup of all unused indexes
  
  2. Maintenance
    - Final cleanup of unused indexes
    - Optimizes database for better overall performance
*/

-- user_achievements
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;

-- user_invites
DROP INDEX IF EXISTS idx_user_invites_group_id;
DROP INDEX IF EXISTS idx_user_invites_inviter_id;

-- user_notes
DROP INDEX IF EXISTS idx_user_notes_user_id;

-- user_preferences
DROP INDEX IF EXISTS idx_user_preferences_preferred_bible_version;

-- user_progress
DROP INDEX IF EXISTS idx_user_progress_cycle_id;
DROP INDEX IF EXISTS idx_user_progress_reading_id;

-- verse_bookmarks
DROP INDEX IF EXISTS idx_verse_bookmarks_user_id;