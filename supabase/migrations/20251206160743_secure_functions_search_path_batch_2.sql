/*
  # Secure Functions with search_path - Batch 2

  ## Overview
  Completes the security hardening by adding SET search_path TO 'public' to
  the remaining functions that had mutable search_path.

  ## Security Impact
  - Prevents privilege escalation attacks
  - Ensures functions only access objects in the public schema
  - Follows PostgreSQL security best practices

  ## Functions Secured (Batch 2/2)
  1. trigger_update_cycle_stats - Trigger function to update cycle stats
  2. update_prayer_count - Trigger function to update prayer counts
  3. check_and_award_badges - Function to check and award user badges
  4. generate_share_id - Function to generate unique share IDs
  5. create_shared_verse - Function to create shared verses
  6. track_share_view - Function to track verse share views
  7. track_share_install - Function to track app installs from shares
*/

-- trigger_update_cycle_stats
CREATE OR REPLACE FUNCTION public.trigger_update_cycle_stats()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.cycle_id IS NOT NULL THEN
    PERFORM update_cycle_stats(NEW.cycle_id);
  END IF;
  RETURN NEW;
END;
$function$;

-- update_prayer_count
CREATE OR REPLACE FUNCTION public.update_prayer_count()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE prayer_requests
    SET prayer_count = prayer_count + 1
    WHERE id = NEW.prayer_request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE prayer_requests
    SET prayer_count = GREATEST(0, prayer_count - 1)
    WHERE id = OLD.prayer_request_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- check_and_award_badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_streak integer;
  v_completed_days integer;
  v_completed_weeks integer;
  v_completion_pct integer;
BEGIN
  -- Get current streak
  SELECT current_streak INTO v_streak
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- Get completed days
  SELECT COUNT(*) INTO v_completed_days
  FROM user_progress
  WHERE user_id = p_user_id
  AND completed = true
  AND (is_archived = false OR is_archived IS NULL);

  -- Calculate completion percentage
  v_completion_pct := ROUND((v_completed_days::numeric / 365) * 100);

  -- Award streak badges
  IF v_streak >= 7 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_7')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_streak >= 30 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_30')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_streak >= 100 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'streak_100')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award weeks completed badges
  v_completed_weeks := v_completed_days / 7;

  IF v_completed_weeks >= 4 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'weeks_4')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completed_weeks >= 12 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'weeks_12')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  -- Award completion percentage badges
  IF v_completion_pct >= 25 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_25')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 50 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_50')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 75 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_75')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;

  IF v_completion_pct >= 100 THEN
    INSERT INTO user_badges (user_id, badge_type)
    VALUES (p_user_id, 'completion_100')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
END;
$function$;

-- generate_share_id
CREATE OR REPLACE FUNCTION public.generate_share_id()
RETURNS text
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_share_id text;
  v_exists boolean;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    v_share_id := substr(md5(random()::text || clock_timestamp()::text), 1, 8);

    -- Check if it exists
    SELECT EXISTS(SELECT 1 FROM shared_verses WHERE share_id = v_share_id) INTO v_exists;

    -- Exit loop if unique
    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_share_id;
END;
$function$;

-- create_shared_verse
CREATE OR REPLACE FUNCTION public.create_shared_verse(
  p_verse_reference text,
  p_verse_text text,
  p_week_number integer DEFAULT NULL,
  p_day_number integer DEFAULT NULL,
  p_shared_by uuid DEFAULT NULL,
  p_share_type text DEFAULT 'link'
)
RETURNS json
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_share_id text;
  v_verse_id uuid;
  v_result json;
BEGIN
  -- Generate unique share ID
  v_share_id := generate_share_id();

  -- Insert shared verse
  INSERT INTO shared_verses (
    share_id,
    verse_reference,
    verse_text,
    week_number,
    day_number,
    shared_by,
    share_type
  )
  VALUES (
    v_share_id,
    p_verse_reference,
    p_verse_text,
    p_week_number,
    p_day_number,
    p_shared_by,
    p_share_type
  )
  RETURNING id INTO v_verse_id;

  -- Log share event
  INSERT INTO share_analytics (
    shared_verse_id,
    event_type
  )
  VALUES (
    v_verse_id,
    'share'
  );

  -- Return result
  SELECT json_build_object(
    'share_id', v_share_id,
    'verse_id', v_verse_id,
    'share_url', 'https://yourdomain.com/verse/' || v_share_id
  ) INTO v_result;

  RETURN v_result;
END;
$function$;

-- track_share_view
CREATE OR REPLACE FUNCTION public.track_share_view(
  p_share_id text,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_verse_id uuid;
BEGIN
  -- Get verse ID
  SELECT id INTO v_verse_id
  FROM shared_verses
  WHERE share_id = p_share_id;

  IF v_verse_id IS NOT NULL THEN
    -- Increment view count
    UPDATE shared_verses
    SET view_count = view_count + 1
    WHERE id = v_verse_id;

    -- Log view event
    INSERT INTO share_analytics (
      shared_verse_id,
      event_type,
      referrer,
      user_agent
    )
    VALUES (
      v_verse_id,
      'view',
      p_referrer,
      p_user_agent
    );
  END IF;
END;
$function$;

-- track_share_install
CREATE OR REPLACE FUNCTION public.track_share_install(p_share_id text)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_verse_id uuid;
BEGIN
  -- Get verse ID
  SELECT id INTO v_verse_id
  FROM shared_verses
  WHERE share_id = p_share_id;

  IF v_verse_id IS NOT NULL THEN
    -- Increment install count
    UPDATE shared_verses
    SET install_count = install_count + 1
    WHERE id = v_verse_id;

    -- Log install event
    INSERT INTO share_analytics (
      shared_verse_id,
      event_type
    )
    VALUES (
      v_verse_id,
      'install'
    );
  END IF;
END;
$function$;
