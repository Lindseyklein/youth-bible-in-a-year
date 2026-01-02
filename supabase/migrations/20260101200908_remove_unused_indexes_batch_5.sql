/*
  # Remove Unused Indexes - Batch 5

  1. Changes
    - Remove indexes that are not being used by queries
    - Reduces database storage and maintenance overhead
    - Improves write performance by reducing index updates

  2. Indexes Removed
    - idx_participation_badges_group_id
    - idx_post_comments_post_id
    - idx_share_analytics_shared_verse_id
    - idx_study_answers_group_id
    - idx_study_questions_created_by
    - idx_study_questions_plan_id
    - idx_user_achievements_achievement_id
    - idx_user_invites_group_id
    - idx_user_invites_inviter_id
    - idx_user_notes_user_id
    - idx_user_preferences_preferred_bible_version
    - idx_user_progress_cycle_id
    - idx_user_progress_reading_id
    - idx_verse_bookmarks_user_id
    - idx_password_reset_tokens_token
    - idx_answer_comments_answer_id
    - idx_bible_verses_book_id
    - idx_chat_moderation_actions_group_id
    - idx_parental_consent_status
    - idx_parental_consent_token
    - idx_profiles_age_group
    - idx_profiles_age_verified
    - idx_discussion_posts_parent_post_id
    - idx_discussion_replies_parent_reply_id
    - idx_group_chat_messages_group_id
    - idx_group_study_responses_study_id
*/

DROP INDEX IF EXISTS idx_participation_badges_group_id;
DROP INDEX IF EXISTS idx_post_comments_post_id;
DROP INDEX IF EXISTS idx_share_analytics_shared_verse_id;
DROP INDEX IF EXISTS idx_study_answers_group_id;
DROP INDEX IF EXISTS idx_study_questions_created_by;
DROP INDEX IF EXISTS idx_study_questions_plan_id;
DROP INDEX IF EXISTS idx_user_achievements_achievement_id;
DROP INDEX IF EXISTS idx_user_invites_group_id;
DROP INDEX IF EXISTS idx_user_invites_inviter_id;
DROP INDEX IF EXISTS idx_user_notes_user_id;
DROP INDEX IF EXISTS idx_user_preferences_preferred_bible_version;
DROP INDEX IF EXISTS idx_user_progress_cycle_id;
DROP INDEX IF EXISTS idx_user_progress_reading_id;
DROP INDEX IF EXISTS idx_verse_bookmarks_user_id;
DROP INDEX IF EXISTS idx_password_reset_tokens_token;
DROP INDEX IF EXISTS idx_answer_comments_answer_id;
DROP INDEX IF EXISTS idx_bible_verses_book_id;
DROP INDEX IF EXISTS idx_chat_moderation_actions_group_id;
DROP INDEX IF EXISTS idx_parental_consent_status;
DROP INDEX IF EXISTS idx_parental_consent_token;
DROP INDEX IF EXISTS idx_profiles_age_group;
DROP INDEX IF EXISTS idx_profiles_age_verified;
DROP INDEX IF EXISTS idx_discussion_posts_parent_post_id;
DROP INDEX IF EXISTS idx_discussion_replies_parent_reply_id;
DROP INDEX IF EXISTS idx_group_chat_messages_group_id;
DROP INDEX IF EXISTS idx_group_study_responses_study_id;