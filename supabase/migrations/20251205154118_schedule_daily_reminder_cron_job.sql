/*
  # Schedule Daily Reminder Cron Job

  1. Cron Job Setup
    - Schedule the daily-reminder edge function to run every hour
    - This allows checking for users who need reminders at their preferred time
    - Uses pg_cron to invoke the edge function via pg_net HTTP extension

  2. Configuration
    - Runs every hour at the top of the hour
    - Calls the daily-reminder edge function endpoint
    - The function filters users based on their timezone and reminder time

  3. Notes
    - Requires pg_cron and pg_net extensions to be enabled
    - Edge function URL is constructed from SUPABASE_URL environment
    - Uses service role key for authentication
*/

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function to invoke the daily reminder edge function
CREATE OR REPLACE FUNCTION invoke_daily_reminder()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  response_status int;
BEGIN
  -- Get Supabase URL and service role key from environment
  -- Note: In production, these are available as Supabase environment variables
  supabase_url := current_setting('app.settings.supabase_url', true);
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- If settings not available, try to construct from current database
  IF supabase_url IS NULL THEN
    -- This will need to be configured manually or via Supabase vault
    RAISE NOTICE 'Supabase URL not configured in app settings';
    RETURN;
  END IF;

  -- Make HTTP POST request to edge function
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/daily-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  );
  
  RAISE NOTICE 'Daily reminder function invoked at %', now();
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to invoke daily reminder: %', SQLERRM;
END;
$$;

-- Schedule cron job to run every hour
-- This will be executed via Supabase's cron scheduler
SELECT cron.schedule(
  'daily-reminder-hourly',
  '0 * * * *',  -- Run at the top of every hour
  $$SELECT invoke_daily_reminder();$$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION invoke_daily_reminder() TO postgres;
GRANT USAGE ON SCHEMA cron TO postgres;

-- View scheduled jobs (for verification)
-- SELECT * FROM cron.job;
