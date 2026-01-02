/*
  # Remove Unused Indexes - Batch 2
  
  1. Indexes Removed (Next 10)
    - idx_group_broadcasts_sender_id
    - idx_group_chat_messages_deleted_by
    - idx_group_chat_messages_reply_to_id
    - idx_group_members_invited_by
    - idx_group_notifications_group_id
    - idx_group_notifications_post_id
    - idx_member_mutes_muted_by
    - idx_member_mutes_user_id
    - idx_post_reactions_user_id
    - idx_prayer_requests_user_id
  
  2. Purpose
    - Remove indexes that are not being used by any queries
    - Reduces storage overhead and improves write performance
    - These indexes can be recreated if needed in the future
*/

DROP INDEX IF EXISTS idx_group_broadcasts_sender_id;
DROP INDEX IF EXISTS idx_group_chat_messages_deleted_by;
DROP INDEX IF EXISTS idx_group_chat_messages_reply_to_id;
DROP INDEX IF EXISTS idx_group_members_invited_by;
DROP INDEX IF EXISTS idx_group_notifications_group_id;
DROP INDEX IF EXISTS idx_group_notifications_post_id;
DROP INDEX IF EXISTS idx_member_mutes_muted_by;
DROP INDEX IF EXISTS idx_member_mutes_user_id;
DROP INDEX IF EXISTS idx_post_reactions_user_id;
DROP INDEX IF EXISTS idx_prayer_requests_user_id;
