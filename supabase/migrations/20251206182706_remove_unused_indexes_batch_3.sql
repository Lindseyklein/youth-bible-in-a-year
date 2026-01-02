/*
  # Remove Unused Indexes - Batch 3
  
  1. Performance Optimization
    - Removes unused indexes from post_comments, post_likes, share_analytics
    - Removes unused indexes from shared_verses, study_answers, study_groups, study_questions
    - Continues cleanup of unused indexes
  
  2. Maintenance
    - Reduces storage footprint
    - Improves write operation performance
*/

-- post_comments
DROP INDEX IF EXISTS idx_post_comments_post_id;
DROP INDEX IF EXISTS idx_post_comments_user_id;

-- post_likes
DROP INDEX IF EXISTS idx_post_likes_user_id;

-- share_analytics
DROP INDEX IF EXISTS idx_share_analytics_shared_verse_id;

-- shared_verses
DROP INDEX IF EXISTS idx_shared_verses_shared_by;

-- study_answers
DROP INDEX IF EXISTS idx_study_answers_group_id;
DROP INDEX IF EXISTS idx_study_answers_user_id;

-- study_groups
DROP INDEX IF EXISTS idx_study_groups_created_by;

-- study_questions
DROP INDEX IF EXISTS idx_study_questions_created_by;
DROP INDEX IF EXISTS idx_study_questions_plan_id;