/*
  # Temporary Open Access for Testing

  1. Changes
    - Make all groups visible to all authenticated users
    - Make all group_members visible to all authenticated users
    - This is TEMPORARY to verify the app is working

  2. Security
    - This bypasses all security for testing
    - Should be replaced with proper RLS later
*/

-- Drop existing policies
DROP POLICY IF EXISTS "View groups policy" ON groups;
DROP POLICY IF EXISTS "View group members policy" ON group_members;

-- Create ultra-simple policies - everyone can see everything
CREATE POLICY "Anyone can view groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can view group members"
  ON group_members FOR SELECT
  TO authenticated
  USING (true);

-- Also open up all the other tables for viewing
DROP POLICY IF EXISTS "Users can view group prayer requests" ON prayer_requests;
CREATE POLICY "Anyone can view prayer requests"
  ON prayer_requests FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view discussions in their groups" ON group_discussions;
CREATE POLICY "Anyone can view discussions"
  ON group_discussions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view posts in accessible discussions" ON discussion_posts;
CREATE POLICY "Anyone can view discussion posts"
  ON discussion_posts FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can view broadcasts in their groups" ON group_broadcasts;
CREATE POLICY "Anyone can view broadcasts"
  ON group_broadcasts FOR SELECT
  TO authenticated
  USING (true);
