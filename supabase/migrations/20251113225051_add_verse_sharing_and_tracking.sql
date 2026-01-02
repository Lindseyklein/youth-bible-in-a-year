/*
  # Add Verse Sharing and Tracking

  ## New Tables
  
  1. **shared_verses**
    - `id` (uuid, primary key)
    - `share_id` (text, unique) - Short code for URL
    - `verse_reference` (text)
    - `verse_text` (text)
    - `week_number` (integer)
    - `day_number` (integer)
    - `shared_by` (uuid) - References profiles(id), nullable
    - `share_type` (text) - 'image', 'link', 'text'
    - `view_count` (integer)
    - `install_count` (integer)
    - `created_at` (timestamptz)
  
  2. **share_analytics**
    - `id` (uuid, primary key)
    - `shared_verse_id` (uuid) - References shared_verses(id)
    - `event_type` (text) - 'view', 'share', 'install', 'signup'
    - `referrer` (text)
    - `user_agent` (text)
    - `ip_address` (text)
    - `created_at` (timestamptz)

  ## Purpose
  - Track verse shares for acquisition funnel
  - Generate unique shareable links
  - Measure engagement and conversions
  - Support referral attribution

  ## Security
  - Public read access to shared_verses (no auth required)
  - Analytics insertable by anyone (for tracking)
  - RLS policies allow public viewing
*/

-- Create shared_verses table
CREATE TABLE IF NOT EXISTS shared_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id text UNIQUE NOT NULL,
  verse_reference text NOT NULL,
  verse_text text NOT NULL,
  week_number integer,
  day_number integer,
  shared_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  share_type text DEFAULT 'link' CHECK (share_type IN ('image', 'link', 'text')),
  view_count integer DEFAULT 0,
  install_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create share_analytics table
CREATE TABLE IF NOT EXISTS share_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shared_verse_id uuid REFERENCES shared_verses(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'share', 'install', 'signup', 'click')),
  referrer text,
  user_agent text,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shared_verses_share_id ON shared_verses(share_id);
CREATE INDEX IF NOT EXISTS idx_shared_verses_shared_by ON shared_verses(shared_by);
CREATE INDEX IF NOT EXISTS idx_share_analytics_verse_id ON share_analytics(shared_verse_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_event_type ON share_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_share_analytics_created_at ON share_analytics(created_at DESC);

-- Enable RLS
ALTER TABLE shared_verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_verses (PUBLIC access for acquisition)
CREATE POLICY "Anyone can view shared verses"
  ON shared_verses FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create shares"
  ON shared_verses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = shared_by OR shared_by IS NULL);

CREATE POLICY "Users can update their shares"
  ON shared_verses FOR UPDATE
  TO authenticated
  USING (auth.uid() = shared_by)
  WITH CHECK (auth.uid() = shared_by);

-- RLS Policies for share_analytics (PUBLIC for tracking)
CREATE POLICY "Anyone can view analytics"
  ON share_analytics FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert analytics"
  ON share_analytics FOR INSERT
  WITH CHECK (true);

-- Function to generate unique share ID
CREATE OR REPLACE FUNCTION generate_share_id()
RETURNS text AS $$
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
$$ LANGUAGE plpgsql;

-- Function to create shareable verse
CREATE OR REPLACE FUNCTION create_shared_verse(
  p_verse_reference text,
  p_verse_text text,
  p_week_number integer DEFAULT NULL,
  p_day_number integer DEFAULT NULL,
  p_shared_by uuid DEFAULT NULL,
  p_share_type text DEFAULT 'link'
)
RETURNS json AS $$
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
$$ LANGUAGE plpgsql;

-- Function to track share view
CREATE OR REPLACE FUNCTION track_share_view(
  p_share_id text,
  p_referrer text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Function to track install from share
CREATE OR REPLACE FUNCTION track_share_install(
  p_share_id text
)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;