/*
  # Add Bible Verse Cache Table
  
  ## Description
  This migration creates a caching table for Bible verses fetched from external APIs.
  Caching reduces API calls and improves performance by storing frequently accessed verses.
  
  ## New Tables
  
  1. bible_verse_cache
    - `cache_key` (text, primary key) - Unique identifier combining reference and version
    - `verses` (jsonb) - Array of verse objects with chapter, verse, and text
    - `cached_at` (timestamptz) - When the verses were cached
    - `created_at` (timestamptz) - When the record was first created
  
  ## Security
  - RLS enabled on the cache table
  - All authenticated users can read cached verses
  - Only authenticated users can insert/update cache (for their own use)
  
  ## Performance
  - Index on cache_key for fast lookups
  - Index on cached_at for cache expiration cleanup
*/

-- Create bible_verse_cache table
CREATE TABLE IF NOT EXISTS bible_verse_cache (
  cache_key text PRIMARY KEY,
  verses jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bible_verse_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cached verses"
  ON bible_verse_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can insert cached verses"
  ON bible_verse_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update cached verses"
  ON bible_verse_cache FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bible_verse_cache_cached_at 
  ON bible_verse_cache(cached_at);

-- Add helpful comment
COMMENT ON TABLE bible_verse_cache IS 'Caches Bible verses from external APIs to reduce API calls and improve performance';
