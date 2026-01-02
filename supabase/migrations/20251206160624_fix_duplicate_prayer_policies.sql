/*
  # Fix Duplicate Prayer Request Policies

  ## Overview
  Removes duplicate SELECT policy on prayer_requests table. The table currently has
  two permissive policies for SELECT on the authenticated role, which can cause
  confusion and unpredictable behavior.

  ## Issue
  - "Group members can view group prayers" - Allows NULL group_id OR member access
  - "Members can view prayer requests in their groups" - Requires active member status

  ## Resolution
  Keep the more comprehensive policy "Group members can view group prayers" which:
  - Allows viewing prayer requests with NULL group_id (personal prayers)
  - Allows group members to view group prayers
  - Uses optimized auth subqueries

  Remove the duplicate policy "Members can view prayer requests in their groups"

  ## Security Impact
  - Maintains proper access control
  - Removes policy confusion
  - Keeps the more permissive policy that handles both personal and group prayers
*/

-- Remove the duplicate policy
DROP POLICY IF EXISTS "Members can view prayer requests in their groups" ON public.prayer_requests;
