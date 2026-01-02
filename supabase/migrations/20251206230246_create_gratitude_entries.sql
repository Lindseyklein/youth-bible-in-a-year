/*
  # Create Gratitude Journal System

  1. New Tables
    - `gratitude_entries`
      - `id` (uuid, primary key) - Unique identifier for each entry
      - `user_id` (uuid, foreign key to auth.users) - Owner of the entry
      - `entry_date` (date, required) - Date of the gratitude entry (YYYY-MM-DD)
      - `content` (text, required) - The gratitude entry content
      - `created_at` (timestamptz) - When the entry was first created
      - `updated_at` (timestamptz) - When the entry was last updated

  2. Indexes
    - Unique index on (user_id, entry_date) to prevent duplicate entries per day
    - Index on user_id for efficient querying
    - Index on entry_date for date-based filtering

  3. Security
    - Enable RLS on `gratitude_entries` table
    - Users can only read their own entries
    - Users can only create entries for themselves
    - Users can only update their own entries
    - Users can only delete their own entries

  4. Important Notes
    - Each user can have only ONE entry per date
    - All operations require authentication
    - Entries are private to each user
*/

-- Create the gratitude_entries table
CREATE TABLE IF NOT EXISTS gratitude_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date date NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_content CHECK (char_length(content) > 0)
);

-- Create unique index to prevent duplicate entries per day
CREATE UNIQUE INDEX IF NOT EXISTS idx_gratitude_entries_user_date 
  ON gratitude_entries(user_id, entry_date);

-- Create index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user_id 
  ON gratitude_entries(user_id);

-- Create index for date-based filtering
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_entry_date 
  ON gratitude_entries(entry_date);

-- Enable Row Level Security
ALTER TABLE gratitude_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own entries
CREATE POLICY "Users can view own gratitude entries"
  ON gratitude_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create their own entries
CREATE POLICY "Users can create own gratitude entries"
  ON gratitude_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own entries
CREATE POLICY "Users can update own gratitude entries"
  ON gratitude_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete only their own entries
CREATE POLICY "Users can delete own gratitude entries"
  ON gratitude_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gratitude_entries_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger to update updated_at on changes
DROP TRIGGER IF EXISTS update_gratitude_entries_updated_at_trigger ON gratitude_entries;
CREATE TRIGGER update_gratitude_entries_updated_at_trigger
  BEFORE UPDATE ON gratitude_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_gratitude_entries_updated_at();