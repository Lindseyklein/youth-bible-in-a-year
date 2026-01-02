/*
  # Remove Live Meetings System

  1. Changes
    - Drop `live_meetings` table
    - Drop `meeting_participants` table
    - Clean up related indexes, policies, and functions

  2. Security
    - All policies and triggers are automatically dropped with the tables
*/

-- Drop live meetings tables (this also drops all policies, indexes, and foreign keys)
DROP TABLE IF EXISTS meeting_participants CASCADE;
DROP TABLE IF EXISTS live_meetings CASCADE;