/*
  # Add Plan Restart and Multiple Cycles

  ## New Tables
  
  1. **plan_cycles**
    - `id` (uuid, primary key)
    - `user_id` (uuid) - References profiles(id)
    - `cycle_number` (integer) - Which cycle (1st, 2nd, 3rd run)
    - `start_date` (date) - When this cycle started
    - `end_date` (date) - When completed (null if ongoing)
    - `completion_percentage` (integer) - Overall completion %
    - `total_days_completed` (integer) - Days marked complete
    - `longest_streak` (integer) - Best streak in this cycle
    - `status` (text) - 'active', 'completed', 'abandoned'
    - `restart_type` (text) - 'keep_history', 'clear_progress', 'new_cycle'
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  2. **cycle_progress_snapshot**
    - `id` (uuid, primary key)
    - `cycle_id` (uuid) - References plan_cycles(id)
    - `reading_id` (uuid) - References daily_readings(id)
    - `completed` (boolean)
    - `completed_at` (timestamptz)
    - `notes` (text) - User notes for that day
    - `created_at` (timestamptz)

  ## Changes to Existing Tables
  
  - Add `current_cycle_id` to user_streaks
  - Add `is_archived` flag to user_progress

  ## Purpose
  - Track multiple plan runs for each user
  - Allow users to restart without losing history
  - Support "keep history" vs "clear progress" options
  - Show completion history and stats per cycle

  ## Security
  - Users can only access their own cycles
  - Cycles are automatically created on first read or restart
  - RLS policies protect personal cycle data
*/

-- Create plan_cycles table
CREATE TABLE IF NOT EXISTS plan_cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  cycle_number integer NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  completion_percentage integer DEFAULT 0,
  total_days_completed integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  restart_type text CHECK (restart_type IN ('keep_history', 'clear_progress', 'new_cycle', 'initial')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, cycle_number)
);

-- Create cycle_progress_snapshot table
CREATE TABLE IF NOT EXISTS cycle_progress_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid REFERENCES plan_cycles(id) ON DELETE CASCADE NOT NULL,
  reading_id uuid REFERENCES daily_readings(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT true,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(cycle_id, reading_id)
);

-- Add current_cycle_id to user_streaks if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_streaks' AND column_name = 'current_cycle_id'
  ) THEN
    ALTER TABLE user_streaks ADD COLUMN current_cycle_id uuid REFERENCES plan_cycles(id);
  END IF;
END $$;

-- Add is_archived to user_progress if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN is_archived boolean DEFAULT false;
  END IF;
END $$;

-- Add cycle_id to user_progress if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_progress' AND column_name = 'cycle_id'
  ) THEN
    ALTER TABLE user_progress ADD COLUMN cycle_id uuid REFERENCES plan_cycles(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_plan_cycles_user_id ON plan_cycles(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_cycles_status ON plan_cycles(status);
CREATE INDEX IF NOT EXISTS idx_cycle_snapshot_cycle_id ON cycle_progress_snapshot(cycle_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_archived ON user_progress(is_archived);
CREATE INDEX IF NOT EXISTS idx_user_progress_cycle_id ON user_progress(cycle_id);

-- Enable RLS
ALTER TABLE plan_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_progress_snapshot ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plan_cycles
CREATE POLICY "Users can view their own cycles"
  ON plan_cycles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cycles"
  ON plan_cycles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cycles"
  ON plan_cycles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cycles"
  ON plan_cycles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for cycle_progress_snapshot
CREATE POLICY "Users can view their own cycle snapshots"
  ON cycle_progress_snapshot FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM plan_cycles
    WHERE plan_cycles.id = cycle_progress_snapshot.cycle_id
    AND plan_cycles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own cycle snapshots"
  ON cycle_progress_snapshot FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM plan_cycles
    WHERE plan_cycles.id = cycle_progress_snapshot.cycle_id
    AND plan_cycles.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own cycle snapshots"
  ON cycle_progress_snapshot FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM plan_cycles
    WHERE plan_cycles.id = cycle_progress_snapshot.cycle_id
    AND plan_cycles.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM plan_cycles
    WHERE plan_cycles.id = cycle_progress_snapshot.cycle_id
    AND plan_cycles.user_id = auth.uid()
  ));

-- Function to create initial cycle for existing users
CREATE OR REPLACE FUNCTION ensure_user_has_cycle(p_user_id uuid)
RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql;

-- Function to restart user's plan
CREATE OR REPLACE FUNCTION restart_user_plan(
  p_user_id uuid,
  p_restart_type text,
  p_keep_history boolean DEFAULT true
)
RETURNS uuid AS $$
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
$$ LANGUAGE plpgsql;

-- Function to update cycle stats
CREATE OR REPLACE FUNCTION update_cycle_stats(p_cycle_id uuid)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update cycle stats when progress changes
CREATE OR REPLACE FUNCTION trigger_update_cycle_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.cycle_id IS NOT NULL THEN
    PERFORM update_cycle_stats(NEW.cycle_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cycle_stats_on_progress ON user_progress;
CREATE TRIGGER update_cycle_stats_on_progress
  AFTER INSERT OR UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_cycle_stats();