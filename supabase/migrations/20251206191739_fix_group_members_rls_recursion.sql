/*
  # Fix Group Members RLS Infinite Recursion

  1. Issue
    - The SELECT policy on group_members was querying group_members itself, causing infinite recursion
    - This happened when checking if a user can view members in their groups

  2. Solution
    - Create a security definer function that bypasses RLS
    - Update the SELECT policy to use this function instead of a direct query
    - This breaks the recursion loop

  3. Security
    - The function only returns true/false for group membership
    - It doesn't expose any sensitive data
    - Still properly restricts access to only group members
*/

-- Create a security definer function to check group membership
CREATE OR REPLACE FUNCTION public.is_group_member(group_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM group_members
    WHERE group_id = group_uuid
      AND user_id = user_uuid
      AND status = 'active'
  );
$$;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Members can view members in their groups" ON group_members;

-- Create a new policy that uses the security definer function
CREATE POLICY "Members can view members in their groups"
  ON group_members
  FOR SELECT
  TO authenticated
  USING (
    is_group_member(group_id, auth.uid())
  );