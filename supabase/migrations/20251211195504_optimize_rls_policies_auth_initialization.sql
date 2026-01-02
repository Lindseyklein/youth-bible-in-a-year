/*
  # Optimize RLS Policies - Auth Initialization Plan
  
  1. Tables Optimized
    - gratitude_entries (4 policies)
    - group_members (1 policy)
  
  2. Changes
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row
    - This improves query performance at scale by initializing auth once per query
  
  3. Security
    - No changes to security logic, only performance optimization
    - Same access control rules apply
*/

-- gratitude_entries: Drop and recreate policies with optimized auth
DROP POLICY IF EXISTS "Users can view own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can create own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can update own gratitude entries" ON gratitude_entries;
DROP POLICY IF EXISTS "Users can delete own gratitude entries" ON gratitude_entries;

CREATE POLICY "Users can view own gratitude entries"
  ON gratitude_entries FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own gratitude entries"
  ON gratitude_entries FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own gratitude entries"
  ON gratitude_entries FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own gratitude entries"
  ON gratitude_entries FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- group_members: Drop and recreate policy with optimized auth
DROP POLICY IF EXISTS "Members can view members in their groups" ON group_members;

CREATE POLICY "Members can view members in their groups"
  ON group_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members gm
      WHERE gm.group_id = group_members.group_id
      AND gm.user_id = (select auth.uid())
    )
  );
