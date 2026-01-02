/*
  # Simplify group_members SELECT policy to avoid recursion
  
  Remove the circular reference by making the policy simpler:
  - Users can see members if they're viewing their own membership
  - Users can see members if they're the group leader
  - Users can see members if the group is public
  
  No more recursive group_members queries.
*/

-- Drop the policy with circular reference
DROP POLICY IF EXISTS "Users can view members of accessible groups" ON group_members;

-- Create a non-recursive policy
CREATE POLICY "Users can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()  -- Can see own membership
    OR EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND (groups.leader_id = auth.uid() OR groups.is_public = true)
    )
  );
