/*
  # Remove Unused Indexes - Batch 1
  
  1. Indexes Removed (First 10)
    - idx_gratitude_entries_entry_date
    - idx_chat_moderation_actions_moderator_id
    - idx_chat_moderation_actions_target_user_id
    - idx_challenge_completions_user_id
    - idx_chat_reactions_user_id
    - idx_chat_typing_indicators_user_id
    - idx_discussion_posts_user_id
    - idx_discussion_replies_user_id
    - idx_friendships_friend_id
    - idx_group_chat_messages_user_id
  
  2. Purpose
    - Remove indexes that are not being used by any queries
    - Reduces storage overhead and improves write performance
    - These indexes can be recreated if needed in the future
*/

DROP INDEX IF EXISTS idx_gratitude_entries_entry_date;
DROP INDEX IF EXISTS idx_chat_moderation_actions_moderator_id;
DROP INDEX IF EXISTS idx_chat_moderation_actions_target_user_id;
DROP INDEX IF EXISTS idx_challenge_completions_user_id;
DROP INDEX IF EXISTS idx_chat_reactions_user_id;
DROP INDEX IF EXISTS idx_chat_typing_indicators_user_id;
DROP INDEX IF EXISTS idx_discussion_posts_user_id;
DROP INDEX IF EXISTS idx_discussion_replies_user_id;
DROP INDEX IF EXISTS idx_friendships_friend_id;
DROP INDEX IF EXISTS idx_group_chat_messages_user_id;
