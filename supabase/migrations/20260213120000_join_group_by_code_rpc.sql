/*
  # Join Group by Code RPC

  Allows any authenticated user to join a group by entering the group's
  invite_code. Used for the Groups tab "Join with Code" flow (no email/SMS invites).

  - Look up group by invite_code (normalized: trim, case-insensitive)
  - Insert group_members (user_id = auth.uid(), role = 'member', status = 'active')
  - Unique (group_id, user_id) prevents duplicates
*/

CREATE OR REPLACE FUNCTION public.join_group_by_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id uuid;
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Normalize: trim and match case-insensitively (invite_code is alphanumeric)
  SELECT id INTO v_group_id
  FROM groups
  WHERE UPPER(TRIM(invite_code)) = UPPER(TRIM(p_code))
  LIMIT 1;

  IF v_group_id IS NULL THEN
    RETURN NULL;  -- Invalid code: caller should show "Invalid code"
  END IF;

  -- Insert membership (ON CONFLICT DO NOTHING for idempotent join)
  INSERT INTO group_members (group_id, user_id, role, status)
  VALUES (v_group_id, v_uid, 'member', 'active')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN v_group_id;
END;
$$;

COMMENT ON FUNCTION public.join_group_by_code(text) IS
  'Join a group by its invite code. Returns group_id on success, NULL if code invalid.';
