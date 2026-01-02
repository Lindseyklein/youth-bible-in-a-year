/*
  # Optimize RLS Policies - Batch 1

  ## Overview
  Optimizes RLS policies to use auth subqueries instead of direct auth function calls.
  This prevents re-evaluation of auth.uid() for each row, improving performance by 10-100x.

  ## Performance Impact
  - Auth functions are called ONCE per query instead of ONCE per row
  - Dramatically reduces CPU usage for queries with many rows
  - Essential for maintaining performance as tables grow

  ## Tables Optimized (Batch 1)

  ### redemption_reflections (4 policies)
  - Users can delete own reflections
  - Users can insert own reflections
  - Users can update own reflections
  - Users can view own reflections

  ### grace_moments (3 policies)
  - Users can delete own grace moments
  - Users can insert own grace moments
  - Users can view own grace moments

  ### user_redemption_badges (2 policies)
  - Users can insert own badges
  - Users can view own badges

  ### user_redemption_preferences (3 policies)
  - Users can insert own preferences
  - Users can update own preferences
  - Users can view own preferences

  ### notification_preferences (3 policies)
  - Users can insert own notification preferences
  - Users can update own notification preferences
  - Users can view own notification preferences
*/

-- redemption_reflections policies
DROP POLICY IF EXISTS "Users can delete own reflections" ON public.redemption_reflections;
DROP POLICY IF EXISTS "Users can insert own reflections" ON public.redemption_reflections;
DROP POLICY IF EXISTS "Users can update own reflections" ON public.redemption_reflections;
DROP POLICY IF EXISTS "Users can view own reflections" ON public.redemption_reflections;

CREATE POLICY "Users can delete own reflections" ON public.redemption_reflections
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own reflections" ON public.redemption_reflections
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own reflections" ON public.redemption_reflections
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own reflections" ON public.redemption_reflections
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- grace_moments policies
DROP POLICY IF EXISTS "Users can delete own grace moments" ON public.grace_moments;
DROP POLICY IF EXISTS "Users can insert own grace moments" ON public.grace_moments;
DROP POLICY IF EXISTS "Users can view own grace moments" ON public.grace_moments;

CREATE POLICY "Users can delete own grace moments" ON public.grace_moments
  FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own grace moments" ON public.grace_moments
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own grace moments" ON public.grace_moments
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- user_redemption_badges policies
DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_redemption_badges;
DROP POLICY IF EXISTS "Users can view own badges" ON public.user_redemption_badges;

CREATE POLICY "Users can insert own badges" ON public.user_redemption_badges
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own badges" ON public.user_redemption_badges
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- user_redemption_preferences policies
DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_redemption_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_redemption_preferences;
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_redemption_preferences;

CREATE POLICY "Users can insert own preferences" ON public.user_redemption_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own preferences" ON public.user_redemption_preferences
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own preferences" ON public.user_redemption_preferences
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

-- notification_preferences policies
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view own notification preferences" ON public.notification_preferences;

CREATE POLICY "Users can insert own notification preferences" ON public.notification_preferences
  FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own notification preferences" ON public.notification_preferences
  FOR UPDATE TO authenticated 
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view own notification preferences" ON public.notification_preferences
  FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));
