/*
  # Enable pg_cron Extension for Scheduled Tasks

  1. Extension Setup
    - Enable pg_cron extension for database scheduled tasks
    - Required for daily email reminder functionality

  2. Notes
    - pg_cron allows scheduling database functions to run at specified intervals
    - Used to trigger the daily-reminder edge function for sending emails via Resend
*/

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
