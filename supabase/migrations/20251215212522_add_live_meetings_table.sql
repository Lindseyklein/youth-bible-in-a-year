/*
  # Add Live Meetings for Groups

  1. New Tables
    - `live_meetings`
      - `id` (uuid, primary key) - Unique identifier for the meeting
      - `group_id` (uuid, foreign key to groups) - Group this meeting belongs to
      - `created_by_id` (uuid, foreign key to profiles) - User who created the meeting
      - `status` (text) - Meeting status: 'active' or 'ended'
      - `room_name` (text) - Name/ID for the video room
      - `started_at` (timestamptz) - When the meeting was started
      - `ended_at` (timestamptz, nullable) - When the meeting ended
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `live_meetings` table
    - Add policies for group members to read active meetings in their group
    - Add policies for group leaders to create and end meetings
    - Add policy for meeting creator to end meetings

  3. Indexes
    - Add index on `group_id` for faster lookups
    - Add index on `status` for active meeting queries
    - Add composite index on `group_id` and `status` for optimal performance
*/

-- Create live_meetings table
CREATE TABLE IF NOT EXISTS live_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_by_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  room_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_live_meetings_group_id ON live_meetings(group_id);
CREATE INDEX IF NOT EXISTS idx_live_meetings_status ON live_meetings(status);
CREATE INDEX IF NOT EXISTS idx_live_meetings_group_status ON live_meetings(group_id, status);

-- Enable RLS
ALTER TABLE live_meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Group members can view active meetings in their groups
CREATE POLICY "Group members can view active meetings in their group"
  ON live_meetings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = live_meetings.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.status = 'active'
    )
  );

-- Policy: Group leaders can create meetings
CREATE POLICY "Group leaders can create meetings"
  ON live_meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = live_meetings.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'leader'
        AND group_members.status = 'active'
    )
  );

-- Policy: Group leaders and meeting creators can update meetings
CREATE POLICY "Group leaders and creators can update meetings"
  ON live_meetings
  FOR UPDATE
  TO authenticated
  USING (
    created_by_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = live_meetings.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'leader'
        AND group_members.status = 'active'
    )
  )
  WITH CHECK (
    created_by_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = live_meetings.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'leader'
        AND group_members.status = 'active'
    )
  );