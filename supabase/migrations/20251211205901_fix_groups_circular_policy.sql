/*
  # Fix circular dependency between groups and group_members RLS
  
  Current problem:
  - groups SELECT policy queries group_members to check membership
  - group_members SELECT policy queries groups to check access
  - This creates infinite recursion
  
  Solution:
  - Simplify groups SELECT policy to only check leader and is_public
  - Remove the membership check from groups policy
  - Users will see all public groups and groups they lead
  - For private groups where they're a member, they'll access via direct queries
*/

-- Drop the policy with circular reference
DROP POLICY IF EXISTS "Leaders and members can view their groups" ON groups;

-- Create a simpler non-recursive policy
CREATE POLICY "Users can view public groups and groups they lead"
  ON groups FOR SELECT
  TO authenticated
  USING (
    leader_id = auth.uid()
    OR is_public = true
  );
