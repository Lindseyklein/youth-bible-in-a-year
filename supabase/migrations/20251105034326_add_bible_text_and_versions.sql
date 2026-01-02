/*
  # Add Bible Text and Versions Support

  ## New Tables
  
  1. bible_versions
    - `id` (uuid, primary key)
    - `abbreviation` (text) - e.g., "NIV", "ESV", "NLT"
    - `name` (text) - Full name
    - `description` (text)
    - `language` (text)
    - `is_active` (boolean)
    - `created_at` (timestamptz)
  
  2. bible_books
    - `id` (uuid, primary key)
    - `name` (text) - e.g., "Genesis"
    - `testament` (text) - "Old" or "New"
    - `book_number` (integer) - Order in Bible
    - `chapter_count` (integer)
  
  3. bible_verses
    - `id` (uuid, primary key)
    - `version_id` (uuid, references bible_versions)
    - `book_id` (uuid, references bible_books)
    - `chapter` (integer)
    - `verse` (integer)
    - `text` (text)
  
  4. user_preferences
    - `user_id` (uuid, references profiles, primary key)
    - `preferred_bible_version` (uuid, references bible_versions)
    - `audio_speed` (numeric) - 0.5 to 2.0
    - `updated_at` (timestamptz)

  ## Security
  
  - RLS enabled on all tables
  - Bible content is publicly readable
  - Only users can manage their own preferences
*/

-- Create bible_versions table
CREATE TABLE IF NOT EXISTS bible_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  abbreviation text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  language text DEFAULT 'en',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bible_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active bible versions"
  ON bible_versions FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Create bible_books table
CREATE TABLE IF NOT EXISTS bible_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('Old', 'New')),
  book_number integer UNIQUE NOT NULL,
  chapter_count integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bible_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bible books"
  ON bible_books FOR SELECT
  TO authenticated
  USING (true);

-- Create bible_verses table
CREATE TABLE IF NOT EXISTS bible_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES bible_versions(id) ON DELETE CASCADE,
  book_id uuid REFERENCES bible_books(id) ON DELETE CASCADE,
  chapter integer NOT NULL,
  verse integer NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(version_id, book_id, chapter, verse)
);

ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bible verses"
  ON bible_verses FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bible_verses_lookup 
  ON bible_verses(version_id, book_id, chapter, verse);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  preferred_bible_version uuid REFERENCES bible_versions(id),
  audio_speed numeric DEFAULT 1.0 CHECK (audio_speed >= 0.5 AND audio_speed <= 2.0),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert popular Bible versions
INSERT INTO bible_versions (abbreviation, name, description, language, is_active)
VALUES
  ('NIV', 'New International Version', 'Contemporary English translation that balances readability and accuracy', 'en', true),
  ('ESV', 'English Standard Version', 'Literal translation that maintains readability', 'en', true),
  ('NLT', 'New Living Translation', 'Thought-for-thought translation focused on clarity', 'en', true),
  ('MSG', 'The Message', 'Contemporary paraphrase in modern conversational language', 'en', true),
  ('KJV', 'King James Version', 'Traditional English translation from 1611', 'en', true)
ON CONFLICT (abbreviation) DO NOTHING;

-- Insert Bible books (first few as examples)
INSERT INTO bible_books (name, testament, book_number, chapter_count)
VALUES
  ('Genesis', 'Old', 1, 50),
  ('Exodus', 'Old', 2, 40),
  ('Leviticus', 'Old', 3, 27),
  ('Numbers', 'Old', 4, 36),
  ('Deuteronomy', 'Old', 5, 34),
  ('Joshua', 'Old', 6, 24),
  ('Judges', 'Old', 7, 21),
  ('Ruth', 'Old', 8, 4),
  ('1 Samuel', 'Old', 9, 31),
  ('2 Samuel', 'Old', 10, 24),
  ('Matthew', 'New', 40, 28),
  ('Mark', 'New', 41, 16),
  ('Luke', 'New', 42, 24),
  ('John', 'New', 43, 21),
  ('Acts', 'New', 44, 28),
  ('Romans', 'New', 45, 16),
  ('1 Corinthians', 'New', 46, 16),
  ('2 Corinthians', 'New', 47, 13),
  ('Galatians', 'New', 48, 6),
  ('Ephesians', 'New', 49, 6),
  ('Philippians', 'New', 50, 4),
  ('Colossians', 'New', 51, 4),
  ('Revelation', 'New', 66, 22)
ON CONFLICT (book_number) DO NOTHING;