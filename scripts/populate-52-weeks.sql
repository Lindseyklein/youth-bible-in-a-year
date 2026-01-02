DO $$
DECLARE
  week_num INT;
  day_num INT;
  current_date DATE := '2025-01-01';
  group_rec RECORD;
BEGIN
  FOR week_num IN 4..52 LOOP
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

    FOR day_num IN 1..7 LOOP
      INSERT INTO daily_readings (
        week_number,
        day_number,
        title,
        scripture_references,
        key_verse,
        created_at
      )
      VALUES (
        week_num,
        day_num,
        'Week ' || week_num || ', Day ' || day_num || ' Reading',
        ARRAY['Genesis ' || ((week_num - 1) * 7 + day_num)::TEXT || ':1-10'],
        NULL,
        NOW()
      ) ON CONFLICT (week_number, day_number) DO NOTHING;
    END LOOP;

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
