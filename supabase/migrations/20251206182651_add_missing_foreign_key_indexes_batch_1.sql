/*
  # Add Missing Foreign Key Indexes - Batch 1
  
  1. Performance Optimization
    - Adds indexes for foreign keys in challenge_completions, chat_moderation_actions, chat_reactions, chat_typing_indicators
    - Adds indexes for foreign keys in cycle_progress_snapshot, discussion_posts, discussion_replies, friendships
    - These indexes improve query performance for foreign key lookups and joins
  
  2. Security
    - Better query performance helps prevent performance-based attacks
    - Reduces database load during high-traffic scenarios
*/

-- challenge_completions
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id 
ON challenge_completions(user_id);

-- chat_moderation_actions
CREATE INDEX IF NOT EXISTS idx_chat_moderation_actions_moderator_id 
ON chat_moderation_actions(moderator_id);

CREATE INDEX IF NOT EXISTS idx_chat_moderation_actions_target_user_id 
ON chat_moderation_actions(target_user_id);

-- chat_reactions
CREATE INDEX IF NOT EXISTS idx_chat_reactions_user_id 
ON chat_reactions(user_id);

-- chat_typing_indicators
CREATE INDEX IF NOT EXISTS idx_chat_typing_indicators_user_id 
ON chat_typing_indicators(user_id);

-- cycle_progress_snapshot
CREATE INDEX IF NOT EXISTS idx_cycle_progress_snapshot_reading_id 
ON cycle_progress_snapshot(reading_id);

-- discussion_posts
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user_id 
ON discussion_posts(user_id);

-- discussion_replies
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user_id 
ON discussion_replies(user_id);

-- friendships
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id 
ON friendships(friend_id);