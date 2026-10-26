-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Delete measurements older than 90 days, runs daily at 2am UTC
SELECT cron.schedule(
  'delete-old-measurements',
  '0 2 * * *',
  $$
    DELETE FROM measurements
    WHERE recorded_at < NOW() - INTERVAL '90 days';
  $$
);