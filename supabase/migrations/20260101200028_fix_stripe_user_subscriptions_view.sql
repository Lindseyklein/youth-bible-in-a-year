/*
  # Fix Stripe User Subscriptions View

  1. Changes
    - Drop and recreate `stripe_user_subscriptions` view to include `user_id`
    - This makes it easier to query subscriptions by user_id directly
    - Maintains security by filtering with auth.uid()

  2. Security
    - View uses security_invoker to ensure RLS is applied
    - Only returns data for the authenticated user
*/

-- Drop the existing view
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Recreate with user_id included
CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.user_id,
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND (s.deleted_at IS NULL OR s.deleted_at IS NOT NULL);

GRANT SELECT ON stripe_user_subscriptions TO authenticated;