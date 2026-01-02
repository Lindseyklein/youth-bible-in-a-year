/*
  # Add Missing Foreign Key Indexes - Batch 3
  
  1. Performance Optimization
    - Adds indexes for foreign keys in member_mutes, post_reactions, prayer_requests, prayer_responses
    - Adds indexes for foreign keys in reply_reactions, study_group_members, user_notes
    - These indexes improve query performance for user interactions and reactions
  
  2. Security
    - Optimizes queries for user-generated content
    - Prevents slow queries that could impact system performance
*/

-- member_mutes
CREATE INDEX IF NOT EXISTS idx_member_mutes_muted_by 
ON member_mutes(muted_by);

CREATE INDEX IF NOT EXISTS idx_member_mutes_user_id 
ON member_mutes(user_id);

-- post_reactions
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id 
ON post_reactions(user_id);

-- prayer_requests
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id 
ON prayer_requests(user_id);

-- prayer_responses
CREATE INDEX IF NOT EXISTS idx_prayer_responses_user_id 
ON prayer_responses(user_id);

-- reply_reactions
CREATE INDEX IF NOT EXISTS idx_reply_reactions_user_id 
ON reply_reactions(user_id);

-- study_group_members
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id 
ON study_group_members(user_id);

-- user_notes
CREATE INDEX IF NOT EXISTS idx_user_notes_reading_id 
ON user_notes(reading_id);