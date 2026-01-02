/*
  # Secure Functions with search_path - Batch 1

  ## Overview
  Adds SET search_path TO 'public' to functions to prevent search_path-based
  attacks. Functions without explicit search_path can be exploited by malicious
  users who create objects in other schemas.

  ## Security Impact
  - Prevents privilege escalation attacks
  - Ensures functions only access objects in the public schema
  - Follows PostgreSQL security best practices

  ## Functions Secured (Batch 1/2)
  1. create_weekly_discussion - Trigger function for weekly discussions
  2. add_leader_as_member - Trigger function to add group leaders as members
  3. create_default_group_settings - Trigger function for group settings
  4. update_presence_timestamp - Trigger function for presence updates
  5. ensure_user_has_cycle - Function to ensure user has an active cycle
  6. restart_user_plan - Function to restart user's reading plan
  7. update_cycle_stats - Function to update cycle statistics
*/

-- create_weekly_discussion
CREATE OR REPLACE FUNCTION public.create_weekly_discussion()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.current_week != OLD.current_week THEN
    INSERT INTO group_discussions (group_id, week_number, title, status)
    VALUES (
      NEW.id,
      NEW.current_week,
      'Week ' || NEW.current_week || ' Discussion',
      'active'
    )
    ON CONFLICT (group_id, week_number) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- add_leader_as_member
CREATE OR REPLACE FUNCTION public.add_leader_as_member()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO group_members (group_id, user_id, role, status)
  VALUES (NEW.id, NEW.leader_id, 'leader', 'active');
  RETURN NEW;
END;
$function$;

-- create_default_group_settings
CREATE OR REPLACE FUNCTION public.create_default_group_settings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO group_settings (group_id)
  VALUES (NEW.id)
  ON CONFLICT (group_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- update_presence_timestamp
CREATE OR REPLACE FUNCTION public.update_presence_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  NEW.last_seen = now();
  RETURN NEW;
END;
$function$;

-- ensure_user_has_cycle
CREATE OR REPLACE FUNCTION public.ensure_user_has_cycle(p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_cycle_id uuid;
  v_start_date date;
BEGIN
  -- Check if user already has an active cycle
  SELECT id INTO v_cycle_id
  FROM plan_cycles
  WHERE user_id = p_user_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- If no active cycle exists, create one
  IF v_cycle_id IS NULL THEN
    -- Get user's start date from user_streaks if available
    SELECT start_date INTO v_start_date
    FROM user_streaks
    WHERE user_id = p_user_id;

    IF v_start_date IS NULL THEN
      v_start_date := CURRENT_DATE;
    END IF;

    -- Create initial cycle
    INSERT INTO plan_cycles (
      user_id,
      cycle_number,
      start_date,
      status,
      restart_type
    )
    VALUES (
      p_user_id,
      1,
      v_start_date,
      'active',
      'initial'
    )
    RETURNING id INTO v_cycle_id;

    -- Update user_streaks with cycle reference
    UPDATE user_streaks
    SET current_cycle_id = v_cycle_id
    WHERE user_id = p_user_id;
  END IF;

  RETURN v_cycle_id;
END;
$function$;

-- restart_user_plan
CREATE OR REPLACE FUNCTION public.restart_user_plan(
  p_user_id uuid,
  p_restart_type text,
  p_keep_history boolean DEFAULT true
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_old_cycle_id uuid;
  v_new_cycle_id uuid;
  v_next_cycle_number integer;
  v_completion_pct integer;
  v_days_completed integer;
BEGIN
  -- Get current active cycle
  SELECT id, cycle_number INTO v_old_cycle_id, v_next_cycle_number
  FROM plan_cycles
  WHERE user_id = p_user_id
  AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Calculate completion stats for old cycle
  SELECT 
    COUNT(*) FILTER (WHERE completed = true) as days_completed,
    ROUND((COUNT(*) FILTER (WHERE completed = true)::numeric / 365) * 100) as completion_pct
  INTO v_days_completed, v_completion_pct
  FROM user_progress
  WHERE user_id = p_user_id
  AND (is_archived = false OR is_archived IS NULL);

  -- Mark old cycle as completed/abandoned if it exists
  IF v_old_cycle_id IS NOT NULL THEN
    UPDATE plan_cycles
    SET 
      status = CASE 
        WHEN v_completion_pct >= 100 THEN 'completed'
        ELSE 'abandoned'
      END,
      end_date = CURRENT_DATE,
      completion_percentage = COALESCE(v_completion_pct, 0),
      total_days_completed = COALESCE(v_days_completed, 0),
      updated_at = now()
    WHERE id = v_old_cycle_id;

    v_next_cycle_number := v_next_cycle_number + 1;
  ELSE
    v_next_cycle_number := 1;
  END IF;

  -- Create snapshot if keeping history
  IF p_keep_history AND v_old_cycle_id IS NOT NULL THEN
    INSERT INTO cycle_progress_snapshot (
      cycle_id,
      reading_id,
      completed,
      completed_at,
      notes
    )
    SELECT 
      v_old_cycle_id,
      reading_id,
      completed,
      completed_at,
      notes
    FROM user_progress
    WHERE user_id = p_user_id
    AND (is_archived = false OR is_archived IS NULL)
    ON CONFLICT (cycle_id, reading_id) DO NOTHING;
  END IF;

  -- Create new cycle
  INSERT INTO plan_cycles (
    user_id,
    cycle_number,
    start_date,
    status,
    restart_type
  )
  VALUES (
    p_user_id,
    v_next_cycle_number,
    CURRENT_DATE,
    'active',
    p_restart_type
  )
  RETURNING id INTO v_new_cycle_id;

  -- Handle progress based on restart type
  IF p_restart_type = 'clear_progress' THEN
    -- Mark all progress as archived
    UPDATE user_progress
    SET 
      is_archived = true,
      cycle_id = v_old_cycle_id
    WHERE user_id = p_user_id
    AND (is_archived = false OR is_archived IS NULL);
  ELSE
    -- Keep history: archive old progress
    UPDATE user_progress
    SET 
      is_archived = true,
      cycle_id = v_old_cycle_id
    WHERE user_id = p_user_id
    AND (is_archived = false OR is_archived IS NULL);
  END IF;

  -- Reset user_streaks
  UPDATE user_streaks
  SET 
    current_streak = 0,
    start_date = CURRENT_DATE,
    last_reading_date = NULL,
    current_cycle_id = v_new_cycle_id,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_new_cycle_id;
END;
$function$;

-- update_cycle_stats
CREATE OR REPLACE FUNCTION public.update_cycle_stats(p_cycle_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_days_completed integer;
  v_completion_pct integer;
  v_longest_streak integer;
BEGIN
  -- Get user_id for this cycle
  SELECT user_id INTO v_user_id
  FROM plan_cycles
  WHERE id = p_cycle_id;

  -- Calculate stats from current progress
  SELECT 
    COUNT(*) FILTER (WHERE completed = true),
    ROUND((COUNT(*) FILTER (WHERE completed = true)::numeric / 365) * 100),
    COALESCE(MAX(us.longest_streak), 0)
  INTO v_days_completed, v_completion_pct, v_longest_streak
  FROM user_progress up
  LEFT JOIN user_streaks us ON us.user_id = up.user_id
  WHERE up.user_id = v_user_id
  AND (up.is_archived = false OR up.is_archived IS NULL)
  AND up.cycle_id = p_cycle_id;

  -- Update cycle
  UPDATE plan_cycles
  SET 
    total_days_completed = COALESCE(v_days_completed, 0),
    completion_percentage = COALESCE(v_completion_pct, 0),
    longest_streak = COALESCE(v_longest_streak, 0),
    updated_at = now()
  WHERE id = p_cycle_id;
END;
$function$;
