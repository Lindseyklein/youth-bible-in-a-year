-- Seed Data for Groups and All Enhancement Features
-- Run this in your Supabase SQL Editor to populate the app with sample data

-- First, let's get the current user ID (you'll need to replace this with your actual user ID)
-- To find your user ID, run: SELECT id FROM auth.users;
-- Then replace 'YOUR_USER_ID_HERE' below with your actual UUID

DO $$
DECLARE
  v_user_id uuid;
  v_user_id_2 uuid;
  v_group_1 uuid;
  v_group_2 uuid;
  v_group_3 uuid;
  v_discussion_1 uuid;
  v_discussion_2 uuid;
  v_prayer_1 uuid;
  v_prayer_2 uuid;
  v_prayer_3 uuid;
  v_challenge_1 uuid;
  v_challenge_2 uuid;
BEGIN
  -- Get first user from auth.users (or create a test user)
  SELECT id INTO v_user_id FROM auth.users LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please sign up first, then run this script.';
  END IF;

  -- Create a second test profile if not exists
  INSERT INTO profiles (id, email, display_name)
  VALUES (gen_random_uuid(), 'testuser2@example.com', 'Sarah Johnson')
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO v_user_id_2;

  IF v_user_id_2 IS NULL THEN
    SELECT id INTO v_user_id_2 FROM profiles WHERE email = 'testuser2@example.com';
  END IF;

  -- Create Group 1: Youth Group
  INSERT INTO groups (id, name, description, leader_id, is_public, current_week, created_at)
  VALUES (
    gen_random_uuid(),
    'Youth Group 2024',
    'Our church youth group reading through the Bible together this year! Join us for discussions, prayer, and encouragement.',
    v_user_id,
    true,
    4,
    now()
  )
  RETURNING id INTO v_group_1;

  -- Create Group 2: College & Career
  INSERT INTO groups (id, name, description, leader_id, is_public, current_week, created_at)
  VALUES (
    gen_random_uuid(),
    'College & Career',
    'Young adults diving deep into Scripture together. Perfect for college students and young professionals.',
    v_user_id,
    true,
    4,
    now()
  )
  RETURNING id INTO v_group_2;

  -- Create Group 3: High School Warriors
  INSERT INTO groups (id, name, description, leader_id, is_public, current_week, created_at)
  VALUES (
    gen_random_uuid(),
    'High School Warriors',
    'High schoolers committed to finishing the year strong in faith!',
    v_user_id,
    false,
    4,
    now()
  )
  RETURNING id INTO v_group_3;

  -- Add current user as member/leader of all groups
  INSERT INTO group_members (group_id, user_id, role, status)
  VALUES
    (v_group_1, v_user_id, 'leader', 'active'),
    (v_group_2, v_user_id, 'member', 'active'),
    (v_group_3, v_user_id, 'leader', 'active');

  -- Add second user as member
  IF v_user_id_2 IS NOT NULL THEN
    INSERT INTO group_members (group_id, user_id, role, status)
    VALUES
      (v_group_1, v_user_id_2, 'member', 'active'),
      (v_group_2, v_user_id_2, 'member', 'active');
  END IF;

  -- Create Group Discussions for Week 4
  INSERT INTO group_discussions (id, group_id, week_number, title, pinned_message, status, created_at)
  VALUES
    (
      gen_random_uuid(),
      v_group_1,
      4,
      'Week 4: Genesis 22-28 - Abraham''s Test of Faith',
      'This week we see Abraham''s incredible faith when God asks him to sacrifice Isaac. What does this teach us about trusting God even when we don''t understand?',
      'active',
      now()
    ),
    (
      gen_random_uuid(),
      v_group_2,
      4,
      'Week 4: Trusting God in Difficult Times',
      'As we read about Abraham''s journey, let''s discuss how we can apply this faith to our own lives.',
      'active',
      now()
    ),
    (
      gen_random_uuid(),
      v_group_3,
      4,
      'Week 4 Discussion: Faith Like Abraham',
      NULL,
      'active',
      now()
    )
  RETURNING id INTO v_discussion_1;

  -- Add some discussion posts
  INSERT INTO discussion_posts (discussion_id, user_id, content, is_deleted, created_at)
  VALUES
    (v_discussion_1, v_user_id, 'Abraham''s willingness to obey God even in the hardest moment shows incredible faith. How can we develop that kind of trust?', false, now() - interval '2 hours'),
    (v_discussion_1, v_user_id, 'I love how God provided the ram at the last moment. He always makes a way!', false, now() - interval '1 hour');

  -- Create Prayer Requests
  INSERT INTO prayer_requests (id, group_id, user_id, title, description, visibility, prayer_count, created_at)
  VALUES
    (
      gen_random_uuid(),
      v_group_1,
      v_user_id,
      'Pray for my upcoming exams',
      'I have finals next week and I''m feeling really stressed. Please pray for peace and wisdom as I study.',
      'group',
      5,
      now() - interval '1 day'
    ),
    (
      gen_random_uuid(),
      v_group_1,
      v_user_id,
      'Family struggles',
      'My parents have been fighting a lot lately. Pray for healing and unity in our home.',
      'leaders_only',
      2,
      now() - interval '3 hours'
    ),
    (
      gen_random_uuid(),
      v_group_2,
      v_user_id,
      'Job interview this Friday',
      'I have a job interview for my dream internship. Praying for God''s will and favor!',
      'group',
      8,
      now() - interval '2 days'
    ),
    (
      gen_random_uuid(),
      v_group_1,
      v_user_id,
      'Friend salvation',
      'My best friend doesn''t know Jesus. Please pray that God opens their heart to the gospel.',
      'group',
      12,
      now() - interval '5 days'
    );

  -- Create Weekly Challenges (Weeks 1-4)
  INSERT INTO weekly_challenges (id, week_number, challenge_text, challenge_type, created_by, created_at)
  VALUES
    (
      gen_random_uuid(),
      1,
      'Memorize Genesis 1:1 - "In the beginning God created the heavens and the earth."',
      'memorize',
      v_user_id,
      now() - interval '3 weeks'
    ),
    (
      gen_random_uuid(),
      2,
      'Share your favorite verse from this week with someone who needs encouragement.',
      'share',
      v_user_id,
      now() - interval '2 weeks'
    ),
    (
      gen_random_uuid(),
      3,
      'Do an act of kindness for someone without expecting anything in return.',
      'act_kindness',
      v_user_id,
      now() - interval '1 week'
    ),
    (
      gen_random_uuid(),
      4,
      'Pray for 10 minutes each day this week, focusing on trusting God like Abraham did.',
      'pray',
      v_user_id,
      now()
    )
  RETURNING id INTO v_challenge_1;

  -- Add some challenge completions
  INSERT INTO challenge_completions (challenge_id, user_id, completed_at)
  VALUES
    (v_challenge_1, v_user_id, now() - interval '2 hours');

  -- Create Group Broadcasts (Leader Announcements)
  INSERT INTO group_broadcasts (group_id, sender_id, message, is_pinned, created_at)
  VALUES
    (
      v_group_1,
      v_user_id,
      'Reminder: We''re having a special Q&A session this Friday at 7pm! Bring your questions about this week''s reading.',
      true,
      now() - interval '1 day'
    ),
    (
      v_group_2,
      v_user_id,
      'Great job everyone on staying consistent with the reading plan! You''re doing amazing! 🙌',
      true,
      now() - interval '3 hours'
    ),
    (
      v_group_3,
      v_user_id,
      'Don''t forget to complete this week''s challenge! Let''s encourage each other.',
      true,
      now()
    );

  -- Create some user notes (personal journaling)
  INSERT INTO user_notes (user_id, note_type, week_number, title, content, created_at)
  VALUES
    (
      v_user_id,
      'weekly',
      4,
      'Week 4 Reflections',
      'Abraham''s faith really challenged me this week. I need to trust God more even when things don''t make sense.',
      now() - interval '1 day'
    ),
    (
      v_user_id,
      'free',
      NULL,
      'Prayer List',
      '1. My family\n2. School\n3. Friends who don''t know Jesus\n4. Spiritual growth',
      now() - interval '5 days'
    );

  -- Create some verse bookmarks
  INSERT INTO verse_bookmarks (user_id, book, chapter, verse_start, verse_end, verse_text, title, created_at)
  VALUES
    (
      v_user_id,
      'Genesis',
      22,
      14,
      14,
      'So Abraham called that place The LORD Will Provide. And to this day it is said, "On the mountain of the LORD it will be provided."',
      'God Always Provides',
      now() - interval '2 days'
    ),
    (
      v_user_id,
      'Genesis',
      28,
      15,
      15,
      'I am with you and will watch over you wherever you go, and I will bring you back to this land. I will not leave you until I have done what I have promised you.',
      'God''s Promise to Jacob',
      now() - interval '1 day'
    );

  -- Award some badges
  INSERT INTO user_badges (user_id, badge_type, is_new, earned_at)
  VALUES
    (v_user_id, 'streak_7', false, now() - interval '3 weeks'),
    (v_user_id, 'weeks_4', true, now()),
    (v_user_id, 'completion_25', false, now() - interval '1 week');

  -- Create a shared verse
  INSERT INTO shared_verses (share_id, verse_reference, verse_text, week_number, day_number, shared_by, share_type, view_count, created_at)
  VALUES
    (
      substr(md5(random()::text), 1, 8),
      'Genesis 22:14',
      'So Abraham called that place The LORD Will Provide. And to this day it is said, "On the mountain of the LORD it will be provided."',
      4,
      3,
      v_user_id,
      'link',
      15,
      now() - interval '1 day'
    );

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Group 1 (Youth Group 2024): %', v_group_1;
  RAISE NOTICE 'Group 2 (College & Career): %', v_group_2;
  RAISE NOTICE 'Group 3 (High School Warriors): %', v_group_3;
  RAISE NOTICE 'Your user ID: %', v_user_id;

END $$;

-- Summary of what was created
SELECT 'Summary of Seed Data:' as info;
SELECT COUNT(*) as total_groups, 'groups created' as description FROM groups;
SELECT COUNT(*) as total_prayers, 'prayer requests created' as description FROM prayer_requests;
SELECT COUNT(*) as total_challenges, 'weekly challenges created' as description FROM weekly_challenges;
SELECT COUNT(*) as total_broadcasts, 'broadcast messages created' as description FROM group_broadcasts;
SELECT COUNT(*) as total_discussions, 'group discussions created' as description FROM group_discussions;
SELECT COUNT(*) as total_notes, 'personal notes created' as description FROM user_notes;
SELECT COUNT(*) as total_bookmarks, 'verse bookmarks created' as description FROM verse_bookmarks;
SELECT COUNT(*) as total_badges, 'badges awarded' as description FROM user_badges;
