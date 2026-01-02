/*
  # Populate 52 Weeks of Content

  1. Purpose
    - Creates weekly challenges for weeks 5-52
    - Creates group discussions for weeks 5-52 for all existing groups
    
  2. Content Structure
    - Weekly Challenges: Rotates through 4 different challenge types
    - Group Discussions: One discussion thread per week per group
    
  3. Notes
    - Uses ON CONFLICT DO NOTHING to avoid duplicates
    - All content is created with current timestamp
    - Discussions are set to 'active' status by default
    - Daily readings require plan_id and are managed separately
*/

DO $$
DECLARE
  week_num INT;
  group_rec RECORD;
BEGIN
  FOR week_num IN 5..52 LOOP
    INSERT INTO weekly_challenges (week_number, challenge_text, challenge_type, created_at)
    VALUES (
      week_num,
      CASE (week_num % 4)
        WHEN 0 THEN 'Memorize a verse from this week''s reading and share it with someone.'
        WHEN 1 THEN 'Pray for your group members and their specific needs this week.'
        WHEN 2 THEN 'Do an act of kindness for someone without expecting anything in return.'
        WHEN 3 THEN 'Spend 15 minutes in silent prayer each day this week.'
      END,
      CASE (week_num % 4)
        WHEN 0 THEN 'memorize'
        WHEN 1 THEN 'pray'
        WHEN 2 THEN 'act_kindness'
        WHEN 3 THEN 'pray'
      END,
      NOW()
    ) ON CONFLICT (week_number) DO NOTHING;

    FOR group_rec IN SELECT id FROM groups LOOP
      INSERT INTO group_discussions (
        group_id,
        week_number,
        title,
        status,
        created_at
      )
      VALUES (
        group_rec.id,
        week_num,
        'Week ' || week_num || ' Discussion',
        'active',
        NOW()
      ) ON CONFLICT (group_id, week_number) DO NOTHING;
    END LOOP;

  END LOOP;
END $$;
