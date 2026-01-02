/*
  # Add Missing Foreign Key Indexes - Batch 2
  
  1. Performance Optimization
    - Adds indexes for foreign keys in group_broadcasts, group_chat_messages, group_members
    - Adds indexes for foreign keys in group_notifications, groups, live_video_sessions
    - These indexes improve query performance for group-related operations
  
  2. Security
    - Better query performance for group operations
    - Reduces potential for denial-of-service through expensive queries
*/

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

-- groups
CREATE INDEX IF NOT EXISTS idx_groups_leader_id 
ON groups(leader_id);

-- live_video_sessions
CREATE INDEX IF NOT EXISTS idx_live_video_sessions_host_id 
ON live_video_sessions(host_id);