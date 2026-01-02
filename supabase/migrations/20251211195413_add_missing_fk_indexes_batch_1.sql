/*
  # Add Missing Foreign Key Indexes - Batch 1
  
  1. Tables Covered
    - answer_comments (answer_id, user_id)
    - answer_likes (user_id)
    - answer_reactions (user_id)
    - bible_verses (book_id)
    - chat_moderation_actions (group_id)
    - community_posts (user_id)
    - content_reports (reported_by)
  
  2. Purpose
    - Add indexes for foreign key columns to improve query performance
    - Prevents suboptimal performance when joining or filtering by these columns
    - Essential for database scalability
*/

-- answer_comments indexes
CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id 
  ON answer_comments(answer_id);

CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id 
  ON answer_comments(user_id);

-- answer_likes indexes
CREATE INDEX IF NOT EXISTS idx_answer_likes_user_id 
  ON answer_likes(user_id);

-- answer_reactions indexes
CREATE INDEX IF NOT EXISTS idx_answer_reactions_user_id 
  ON answer_reactions(user_id);

-- bible_verses indexes
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_id 
  ON bible_verses(book_id);

-- chat_moderation_actions indexes
CREATE INDEX IF NOT EXISTS idx_chat_moderation_actions_group_id 
  ON chat_moderation_actions(group_id);

-- community_posts indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id 
  ON community_posts(user_id);

-- content_reports indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_by 
  ON content_reports(reported_by);
