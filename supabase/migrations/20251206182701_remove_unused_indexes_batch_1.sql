/*
  # Remove Unused Indexes - Batch 1
  
  1. Performance Optimization
    - Removes unused indexes from answer_comments, answer_likes, answer_reactions
    - Removes unused indexes from bible_verses, chat_moderation_actions, community_posts
    - Removes unused indexes from content_reports, discussion_posts, discussion_replies
    - Reduces database size and improves write performance
  
  2. Maintenance
    - Eliminates technical debt from unused indexes
    - Reduces index maintenance overhead during INSERT/UPDATE/DELETE operations
*/

-- answer_comments
DROP INDEX IF EXISTS idx_answer_comments_answer_id;
DROP INDEX IF EXISTS idx_answer_comments_user_id;

-- answer_likes
DROP INDEX IF EXISTS idx_answer_likes_user_id;

-- answer_reactions
DROP INDEX IF EXISTS idx_answer_reactions_user_id;

-- bible_verses
DROP INDEX IF EXISTS idx_bible_verses_book_id;

-- chat_moderation_actions
DROP INDEX IF EXISTS idx_chat_moderation_actions_group_id;

-- community_posts
DROP INDEX IF EXISTS idx_community_posts_user_id;

-- content_reports
DROP INDEX IF EXISTS idx_content_reports_reported_by;

-- discussion_posts
DROP INDEX IF EXISTS idx_discussion_posts_parent_post_id;

-- discussion_replies
DROP INDEX IF EXISTS idx_discussion_replies_parent_reply_id;