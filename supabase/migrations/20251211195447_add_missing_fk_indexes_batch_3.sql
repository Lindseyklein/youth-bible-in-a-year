/*
  # Add Missing Foreign Key Indexes - Batch 3
  
  1. Tables Covered
    - participation_badges (group_id, user_id)
    - post_comments (post_id, user_id)
    - post_likes (user_id)
    - share_analytics (shared_verse_id)
    - shared_verses (shared_by)
    - study_answers (group_id, user_id)
    - study_groups (created_by)
    - study_questions (created_by, plan_id)
    - user_achievements (achievement_id)
    - user_invites (group_id, inviter_id)
    - user_notes (user_id)
    - user_preferences (preferred_bible_version)
    - user_progress (cycle_id, reading_id)
    - verse_bookmarks (user_id)
  
  2. Purpose
    - Add indexes for foreign key columns to improve query performance
    - Prevents suboptimal performance when joining or filtering by these columns
    - Essential for database scalability
*/

-- participation_badges indexes
CREATE INDEX IF NOT EXISTS idx_participation_badges_group_id 
  ON participation_badges(group_id);

CREATE INDEX IF NOT EXISTS idx_participation_badges_user_id 
  ON participation_badges(user_id);

-- post_comments indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id 
  ON post_comments(post_id);

CREATE INDEX IF NOT EXISTS idx_post_comments_user_id 
  ON post_comments(user_id);

-- post_likes indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id 
  ON post_likes(user_id);

-- share_analytics indexes
CREATE INDEX IF NOT EXISTS idx_share_analytics_shared_verse_id 
  ON share_analytics(shared_verse_id);

-- shared_verses indexes
CREATE INDEX IF NOT EXISTS idx_shared_verses_shared_by 
  ON shared_verses(shared_by);

-- study_answers indexes
CREATE INDEX IF NOT EXISTS idx_study_answers_group_id 
  ON study_answers(group_id);

CREATE INDEX IF NOT EXISTS idx_study_answers_user_id 
  ON study_answers(user_id);

-- study_groups indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by 
  ON study_groups(created_by);

-- study_questions indexes
CREATE INDEX IF NOT EXISTS idx_study_questions_created_by 
  ON study_questions(created_by);

CREATE INDEX IF NOT EXISTS idx_study_questions_plan_id 
  ON study_questions(plan_id);

-- user_achievements indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id 
  ON user_achievements(achievement_id);

-- user_invites indexes
CREATE INDEX IF NOT EXISTS idx_user_invites_group_id 
  ON user_invites(group_id);

CREATE INDEX IF NOT EXISTS idx_user_invites_inviter_id 
  ON user_invites(inviter_id);

-- user_notes indexes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id 
  ON user_notes(user_id);

-- user_preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferred_bible_version 
  ON user_preferences(preferred_bible_version);

-- user_progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_cycle_id 
  ON user_progress(cycle_id);

CREATE INDEX IF NOT EXISTS idx_user_progress_reading_id 
  ON user_progress(reading_id);

-- verse_bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_verse_bookmarks_user_id 
  ON verse_bookmarks(user_id);
