/*
  # Fix Stripe User Subscriptions View NULL Handling

  1. Changes
    - Drop and recreate view with correct NULL handling
    - Allow records where subscription doesn't exist yet (LEFT JOIN returns NULL)
    - Only filter out soft-deleted records when they exist

  2. Security
    - Maintains security_invoker for RLS
    - Filters by authenticated user only
*/

-- Drop the existing view
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Recreate with proper NULL handling
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
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id AND s.deleted_at IS NULL
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;