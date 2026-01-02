/*
  # Remove Unused Indexes - Batch 2
  
  1. Performance Optimization
    - Removes unused indexes from favorite_verses, grace_moments, group_chat_messages
    - Removes unused indexes from group_notifications, group_study_responses, participation_badges
    - Reduces database maintenance overhead
  
  2. Maintenance
    - Cleans up unused indexes that consume storage
    - Improves INSERT/UPDATE performance by reducing index updates
*/

-- favorite_verses
DROP INDEX IF EXISTS idx_favorite_verses_user_id;

-- grace_moments
DROP INDEX IF EXISTS idx_grace_moments_user_id;

-- group_chat_messages
DROP INDEX IF EXISTS idx_group_chat_messages_group_id;

-- group_notifications
DROP INDEX IF EXISTS idx_group_notifications_user_id;

-- group_study_responses
DROP INDEX IF EXISTS idx_group_study_responses_study_id;
DROP INDEX IF EXISTS idx_group_study_responses_user_id;

-- participation_badges
DROP INDEX IF EXISTS idx_participation_badges_group_id;
DROP INDEX IF EXISTS idx_participation_badges_user_id;