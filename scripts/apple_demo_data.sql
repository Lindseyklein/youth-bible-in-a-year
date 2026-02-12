/*
  Apple App Review – Demo data for Groups (join-by-code only, no invites)

  STEP 1 – Create two auth users in Supabase Dashboard
  -----------------------------------------------
  Authentication → Users → Add user (or sign up in the app):

  • Demo Leader
    Email:    demo_leader@yourdomain.com
    Password: e.g. DemoLeader123!

  • Demo Youth
    Email:    demo_youth@yourdomain.com
    Password: e.g. DemoYouth123!

  Copy each User UUID from Authentication → Users.

  STEP 2 – Run the block below in Supabase SQL Editor
  -----------------------------------------------
  Replace REPLACE_WITH_DEMO_LEADER_UUID and REPLACE_WITH_DEMO_YOUTH_UUID
  with the actual UUIDs from Step 1, then run the whole block.
*/

DO $$
DECLARE
  v_leader_id uuid := 'REPLACE_WITH_DEMO_LEADER_UUID';
  v_youth_id  uuid := 'REPLACE_WITH_DEMO_YOUTH_UUID';
  v_group_id  uuid;
BEGIN
  -- Ensure profiles exist (Supabase may have created them on signup)
  INSERT INTO public.profiles (id, username, display_name, user_role, age_group)
  VALUES
    (v_leader_id, 'demo_leader', 'Demo Leader', 'leader', 'adult'),
    (v_youth_id,  'demo_youth',  'Demo Youth',  'youth',  'teen')
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    user_role = EXCLUDED.user_role,
    age_group = EXCLUDED.age_group;

  -- Create a group led by the demo leader (trigger adds leader to group_members)
  INSERT INTO public.groups (name, description, leader_id, is_public, current_week)
  VALUES (
    'Apple Review Demo Group',
    'A sample Bible study group for App Store review.',
    v_leader_id,
    false,
    1
  )
  RETURNING id INTO v_group_id;

  -- Add the demo youth as a member so they see "My Groups" immediately
  INSERT INTO public.group_members (group_id, user_id, role, status)
  VALUES (v_group_id, v_youth_id, 'member', 'active')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RAISE NOTICE 'Demo group created. Group ID: %', v_group_id;
END $$;
