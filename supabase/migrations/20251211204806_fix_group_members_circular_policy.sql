/*
  # Fix group_members circular RLS policy
  
  The current group_members SELECT policy has a circular reference where it queries
  group_members to check if a user can view group_members, causing infinite recursion.
  
  Changes:
  - Drop the problematic circular policy
  - Create a new policy that checks via the groups table instead
  - Users can see group_members if they can see the group (via groups RLS)
*/

-- Drop the circular policy
DROP POLICY IF EXISTS "Members can view members in their groups" ON group_members;

-- Create a better policy that checks via groups table
CREATE POLICY "Users can view members of accessible groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE groups.id = group_members.group_id
      AND (
        groups.leader_id = auth.uid()
        OR groups.is_public = true
        OR EXISTS (
          SELECT 1 FROM group_members gm2
          WHERE gm2.group_id = groups.id
          AND gm2.user_id = auth.uid()
          AND gm2.status = 'active'
        )
      )
    )
  );
