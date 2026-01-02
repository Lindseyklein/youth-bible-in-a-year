/*
  # Add Missing Foreign Key Indexes - Batch 5 (Fixed)

  1. New Indexes
    - Add indexes for all unindexed foreign keys to improve query performance
    - Covers challenge_completions, chat_moderation_actions, chat_reactions, chat_typing_indicators
    - Covers discussion_posts, discussion_replies, friendships, group_broadcasts
    - Covers group_chat_messages, group_members, group_notifications

  2. Performance Impact
    - Significantly improves JOIN and foreign key constraint check performance
    - Reduces query execution time for related table lookups
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

-- discussion_posts
CREATE INDEX IF NOT EXISTS idx_discussion_posts_user_id 
  ON discussion_posts(user_id);

-- discussion_replies
CREATE INDEX IF NOT EXISTS idx_discussion_replies_user_id 
  ON discussion_replies(user_id);

-- friendships
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id 
  ON friendships(friend_id);

-- group_broadcasts
CREATE INDEX IF NOT EXISTS idx_group_broadcasts_sender_id 
  ON group_broadcasts(sender_id);

-- group_chat_messages
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_deleted_by 
  ON group_chat_messages(deleted_by);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_reply_to_id 
  ON group_chat_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_user_id 
  ON group_chat_messages(user_id);

-- group_members
CREATE INDEX IF NOT EXISTS idx_group_members_invited_by 
  ON group_members(invited_by);

-- group_notifications
CREATE INDEX IF NOT EXISTS idx_group_notifications_group_id 
  ON group_notifications(group_id);
CREATE INDEX IF NOT EXISTS idx_group_notifications_post_id 
  ON group_notifications(post_id);