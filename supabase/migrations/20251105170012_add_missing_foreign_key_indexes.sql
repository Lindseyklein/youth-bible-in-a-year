/*
  # Add Missing Foreign Key Indexes for Performance

  1. Purpose
    - Add indexes to all foreign key columns that don't have covering indexes
    - Improves query performance for JOIN operations and foreign key lookups
    - Prevents table scans on foreign key constraints

  2. Tables Updated
    - answer_comments: answer_id, user_id
    - answer_likes: user_id
    - answer_reactions: user_id
    - bible_verses: book_id
    - community_posts: user_id
    - content_reports: reported_by
    - favorite_verses: reading_id, user_id
    - group_study_responses: study_id, user_id
    - participation_badges: group_id, user_id
    - post_comments: post_id, user_id
    - post_likes: user_id
    - study_answers: group_id, user_id
    - study_groups: created_by
    - study_questions: created_by, plan_id
    - user_achievements: achievement_id
    - user_preferences: preferred_bible_version
    - user_progress: reading_id

  3. Index Naming Convention
    - Format: idx_{table_name}_{column_name}
    - Ensures consistent naming across database
*/

-- Answer Comments Indexes
CREATE INDEX IF NOT EXISTS idx_answer_comments_answer_id ON answer_comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_answer_comments_user_id ON answer_comments(user_id);

-- Answer Likes Indexes
CREATE INDEX IF NOT EXISTS idx_answer_likes_user_id ON answer_likes(user_id);

-- Answer Reactions Indexes
CREATE INDEX IF NOT EXISTS idx_answer_reactions_user_id ON answer_reactions(user_id);

-- Bible Verses Indexes
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_id ON bible_verses(book_id);

-- Community Posts Indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON community_posts(user_id);

-- Content Reports Indexes
CREATE INDEX IF NOT EXISTS idx_content_reports_reported_by ON content_reports(reported_by);

-- Favorite Verses Indexes
CREATE INDEX IF NOT EXISTS idx_favorite_verses_reading_id ON favorite_verses(reading_id);
CREATE INDEX IF NOT EXISTS idx_favorite_verses_user_id ON favorite_verses(user_id);

-- Group Study Responses Indexes
CREATE INDEX IF NOT EXISTS idx_group_study_responses_study_id ON group_study_responses(study_id);
CREATE INDEX IF NOT EXISTS idx_group_study_responses_user_id ON group_study_responses(user_id);

-- Participation Badges Indexes
CREATE INDEX IF NOT EXISTS idx_participation_badges_group_id ON participation_badges(group_id);
CREATE INDEX IF NOT EXISTS idx_participation_badges_user_id ON participation_badges(user_id);

-- Post Comments Indexes
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);

-- Post Likes Indexes
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);

-- Study Answers Indexes
CREATE INDEX IF NOT EXISTS idx_study_answers_group_id ON study_answers(group_id);
CREATE INDEX IF NOT EXISTS idx_study_answers_user_id ON study_answers(user_id);

-- Study Groups Indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON study_groups(created_by);

-- Study Questions Indexes
CREATE INDEX IF NOT EXISTS idx_study_questions_created_by ON study_questions(created_by);
CREATE INDEX IF NOT EXISTS idx_study_questions_plan_id ON study_questions(plan_id);

-- User Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- User Preferences Indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_preferred_bible_version ON user_preferences(preferred_bible_version);

-- User Progress Indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_reading_id ON user_progress(reading_id);
