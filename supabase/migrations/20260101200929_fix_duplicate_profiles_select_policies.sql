/*
  # Fix Duplicate Profiles SELECT Policies

  1. Changes
    - Remove duplicate permissive policies for profiles table
    - Consolidate into a single optimized SELECT policy

  2. Security Impact
    - Maintains same access control
    - Improves query performance by eliminating redundant policy evaluation
*/

-- Drop both existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;

-- Create single consolidated policy
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);