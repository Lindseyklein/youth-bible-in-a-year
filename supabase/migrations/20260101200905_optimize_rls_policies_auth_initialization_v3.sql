/*
  # Optimize RLS Policies - Auth Initialization V3

  1. Changes
    - Replace auth.uid() with (SELECT auth.uid()) in all policies
    - This prevents re-evaluation of auth functions for each row
    - Significantly improves query performance at scale

  2. Tables Updated
    - parental_consents
    - stripe_customers
    - stripe_subscriptions
    - stripe_orders
    - group_members
    - groups
    - parental_consent_requests

  3. Performance Impact
    - Auth functions are evaluated once per query instead of once per row
    - Reduces CPU usage and improves response times
*/

-- parental_consents policies
DROP POLICY IF EXISTS "Users can view own parental consent" ON parental_consents;
CREATE POLICY "Users can view own parental consent"
  ON parental_consents FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service role can insert consents" ON parental_consents;
CREATE POLICY "Service role can insert consents"
  ON parental_consents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Service can update consent records" ON parental_consents;
CREATE POLICY "Service can update consent records"
  ON parental_consents FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- stripe_customers policies
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) AND deleted_at IS NULL);

-- stripe_subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (SELECT auth.uid())
      AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- stripe_orders policies
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id
      FROM stripe_customers
      WHERE user_id = (SELECT auth.uid())
      AND deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- group_members policies
DROP POLICY IF EXISTS "Users can view group members" ON group_members;
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND (
        groups.leader_id = (SELECT auth.uid())
        OR groups.is_public = true
      )
    )
  );

-- groups policies
DROP POLICY IF EXISTS "Users can view public groups and groups they lead" ON groups;
CREATE POLICY "Users can view public groups and groups they lead"
  ON groups FOR SELECT
  TO authenticated
  USING (
    leader_id = (SELECT auth.uid())
    OR is_public = true
  );

-- parental_consent_requests policies
DROP POLICY IF EXISTS "Users can view their own consent requests" ON parental_consent_requests;
CREATE POLICY "Users can view their own consent requests"
  ON parental_consent_requests FOR SELECT
  TO authenticated
  USING (child_user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can create their own consent requests" ON parental_consent_requests;
CREATE POLICY "Users can create their own consent requests"
  ON parental_consent_requests FOR INSERT
  TO authenticated
  WITH CHECK (child_user_id = (SELECT auth.uid()));