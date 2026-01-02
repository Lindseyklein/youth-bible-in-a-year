/*
  # Add Missing Foreign Key Indexes - Batch 2
  
  1. Tables Covered
    - discussion_posts (parent_post_id)
    - discussion_replies (parent_reply_id)
    - favorite_verses (user_id)
    - grace_moments (user_id)
    - group_chat_messages (group_id)
    - group_notifications (user_id)
    - group_study_responses (study_id, user_id)
  
  2. Purpose
    - Add indexes for foreign key columns to improve query performance
    - Prevents suboptimal performance when joining or filtering by these columns
    - Essential for database scalability
*/

-- discussion_posts indexes
CREATE INDEX IF NOT EXISTS idx_discussion_posts_parent_post_id 
  ON discussion_posts(parent_post_id);

-- discussion_replies indexes
CREATE INDEX IF NOT EXISTS idx_discussion_replies_parent_reply_id 
  ON discussion_replies(parent_reply_id);

-- favorite_verses indexes
CREATE INDEX IF NOT EXISTS idx_favorite_verses_user_id 
  ON favorite_verses(user_id);

-- grace_moments indexes
CREATE INDEX IF NOT EXISTS idx_grace_moments_user_id 
  ON grace_moments(user_id);

-- group_chat_messages indexes
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id 
  ON group_chat_messages(group_id);

-- group_notifications indexes
CREATE INDEX IF NOT EXISTS idx_group_notifications_user_id 
  ON group_notifications(user_id);

-- group_study_responses indexes
CREATE INDEX IF NOT EXISTS idx_group_study_responses_study_id 
  ON group_study_responses(study_id);

CREATE INDEX IF NOT EXISTS idx_group_study_responses_user_id 
  ON group_study_responses(user_id);
