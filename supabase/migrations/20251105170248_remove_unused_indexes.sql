/*
  # Remove Unused Indexes

  1. Purpose
    - Remove indexes that are not being used by queries
    - Reduces storage overhead and improves write performance
    - Indexes can be recreated if needed in the future

  2. Indexes Removed
    - idx_study_group_members_group_id (not used)
    - idx_study_group_members_user_id (not used)
    - idx_friendships_user_id (not used)
    - idx_friendships_friend_id (not used)
    - idx_bible_verse_cache_cached_at (not used)

  3. Note
    - Foreign key indexes were added in previous migration
    - These specific named indexes were redundant or unused
*/

DROP INDEX IF EXISTS idx_study_group_members_group_id;
DROP INDEX IF EXISTS idx_study_group_members_user_id;
DROP INDEX IF EXISTS idx_friendships_user_id;
DROP INDEX IF EXISTS idx_friendships_friend_id;
DROP INDEX IF EXISTS idx_bible_verse_cache_cached_at;
