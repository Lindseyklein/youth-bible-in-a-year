# Group Security and Data Isolation

This document explains how groups are secured to ensure each Youth Leader only has access to their own groups and data.

## Security Model Overview

The app implements a strict data isolation model where:

1. **Youth Leaders** can only see, manage, and interact with groups they created
2. **Group Members** can only see groups they are active members of
3. **Public Groups** are visible to all authenticated users (but membership is still controlled)
4. **Private Groups** are only visible to the leader and active members

## Row Level Security (RLS) Implementation

All group-related tables use Postgres Row Level Security (RLS) to enforce data isolation at the database level. This means security is enforced even if the application code has bugs.

### Core Security Principles

1. **Leader Ownership**: Groups are owned by the `leader_id` (the user who created the group)
2. **Member Scoping**: All group data is accessible only to active group members
3. **Status Checking**: Only `status = 'active'` members have access
4. **No Cross-Access**: Leaders cannot see other leaders' groups unless they are members

## Table-by-Table Security

### 1. Groups Table

**SELECT (View Groups)**
```sql
Users can view groups where:
- They are the leader (auth.uid() = leader_id), OR
- The group is public (is_public = true), OR
- They are an active member of the group
```

**INSERT (Create Groups)**
```sql
- Any authenticated user can create a group
- The creator must be set as the leader_id
```

**UPDATE (Modify Groups)**
```sql
- Only the group leader can update their group
```

**DELETE (Remove Groups)**
```sql
- Only the group leader can delete their group
- This cascades to all related data (members, discussions, etc.)
```

### 2. Group Members Table

**SELECT (View Members)**
```sql
Users can view members where:
- They are an active member of the same group, OR
- They are the group leader
```

**INSERT (Add Members)**
```sql
- Group leaders can add members to their groups, OR
- Users can add themselves (for joining via invite codes)
```

**UPDATE (Modify Memberships)**
```sql
- Group leaders can update any membership in their groups, OR
- Users can update their own membership (e.g., to leave)
```

**DELETE (Remove Members)**
```sql
- Group leaders can remove members from their groups, OR
- Users can remove themselves from groups
```

### 3. Group Discussions Table

**SELECT (View Discussions)**
```sql
- Only active members of the group can view discussions
```

**INSERT (Create Discussions)**
```sql
- Only the group leader can create discussions
```

**UPDATE (Modify Discussions)**
```sql
- Only the group leader can update discussions
```

### 4. Discussion Posts Table

**SELECT (View Posts)**
```sql
- Only active members of the group can view posts
```

**INSERT (Create Posts)**
```sql
- Active members can create posts in their groups
- Users can only create posts as themselves (auth.uid() = user_id)
```

**UPDATE (Modify Posts)**
```sql
- Users can only update their own posts
```

**DELETE (Remove Posts)**
```sql
- Users can delete their own posts, OR
- Group leaders can delete any posts in their groups
```

### 5. Group Chat Messages Table

**SELECT (View Messages)**
```sql
- Only active members of the group can view chat messages
```

**INSERT (Send Messages)**
```sql
- Active members can send messages in their groups
- Users can only send messages as themselves
```

**UPDATE (Edit Messages)**
```sql
- Users can only edit their own messages
```

**DELETE (Remove Messages)**
```sql
- Users can delete their own messages, OR
- Group leaders and moderators can delete any messages
```

### 6. Live Video Sessions Table

**SELECT (View Sessions)**
```sql
- Only active members of the group can view video sessions
```

**INSERT (Create Sessions)**
```sql
- Only group leaders and moderators can create video sessions
- The creator must be set as the host_id
```

**UPDATE (Modify Sessions)**
```sql
- Only the session host can update the session
```

**DELETE (Cancel Sessions)**
```sql
- Only the session host can delete the session
```

### 7. Prayer Requests Table

**SELECT (View Requests)**
```sql
Users can view prayer requests where:
- The request has no group (group_id IS NULL), OR
- They created the request (auth.uid() = user_id), OR
- They are an active member of the group
```

### 8. Group Broadcasts Table

**SELECT (View Broadcasts)**
```sql
- Only active members of the group can view broadcasts
```

**INSERT (Send Broadcasts)**
```sql
- Only the group leader can send broadcasts
- The leader must be set as the sender_id
```

**UPDATE (Modify Broadcasts)**
```sql
- Only the sender can update their broadcasts
```

**DELETE (Remove Broadcasts)**
```sql
- Only the sender can delete their broadcasts
```

## Testing the Security Model

To verify that the security is working correctly:

### Test 1: Leader Isolation
1. Create User A and User B
2. User A creates Group 1
3. User B creates Group 2
4. Verify User A cannot see Group 2
5. Verify User B cannot see Group 1

### Test 2: Member Access
1. User A creates Group 1
2. User A invites User B to Group 1
3. Verify User B can now see Group 1
4. Verify User B can view posts and discussions in Group 1
5. Remove User B from Group 1
6. Verify User B can no longer see Group 1

### Test 3: Public vs Private Groups
1. User A creates a public Group 1 (is_public = true)
2. User B creates a private Group 2 (is_public = false)
3. Verify User C can see public Group 1 in listings
4. Verify User C cannot see private Group 2
5. Verify User C cannot access Group 1's content without joining

### Test 4: Leader Permissions
1. User A creates Group 1 and adds User B as a member
2. Verify User B cannot update the group settings
3. Verify User B cannot delete the group
4. Verify User A can update and delete the group

### Test 5: Cross-Group Data Isolation
1. User A creates Group 1 with discussion/post
2. User B creates Group 2 with discussion/post
3. Verify posts from Group 1 don't appear in Group 2
4. Verify members of Group 1 don't see members of Group 2

## Common Security Patterns

### Checking if User is Group Leader
```typescript
const { data: isLeader } = await supabase
  .from('groups')
  .select('id')
  .eq('id', groupId)
  .eq('leader_id', user.id)
  .maybeSingle();

if (!isLeader) {
  // User is not the leader
}
```

### Checking if User is Group Member
```typescript
const { data: membership } = await supabase
  .from('group_members')
  .select('role, status')
  .eq('group_id', groupId)
  .eq('user_id', user.id)
  .eq('status', 'active')
  .maybeSingle();

if (!membership) {
  // User is not an active member
}
```

### Getting User's Groups (as Leader)
```typescript
const { data: myGroups } = await supabase
  .from('groups')
  .select('*')
  .eq('leader_id', user.id);
```

### Getting User's Groups (as Member)
```typescript
const { data: memberGroups } = await supabase
  .from('groups')
  .select(`
    *,
    group_members!inner(role, status)
  `)
  .eq('group_members.user_id', user.id)
  .eq('group_members.status', 'active');
```

## Important Security Notes

1. **Never Bypass RLS**: Always use authenticated Supabase client calls. Never use the service role key in client-side code.

2. **Validate on Both Sides**: Even though RLS enforces security at the database level, always validate permissions in your application code for better user experience.

3. **Status Matters**: Always check that `status = 'active'` when querying group members. Users with status 'pending' or 'removed' should not have access.

4. **Leader vs Moderator**: Some features (like chat moderation) are available to both leaders and moderators. The groups table only tracks the single `leader_id`.

5. **Public Groups**: Public groups are visible in listings but require membership to access content. Being public only affects discovery, not access control.

6. **Cascading Deletes**: When a group is deleted, all related data (members, discussions, posts, etc.) is automatically deleted via `ON DELETE CASCADE`.

7. **Self-Service Actions**: Users can always perform certain actions on their own data (leave group, delete own posts, etc.) even if they're not the leader.

## Migration History

The security model was established through these migrations:

1. `20251113221527_add_group_discussions_and_invites.sql` - Initial RLS setup
2. `20251114174727_temporary_open_access_for_testing.sql` - Temporary open access (REMOVED)
3. `20251205_secure_youth_leader_groups_v2.sql` - Production-ready security

## Security Checklist

When adding new group-related features:

- [ ] Enable RLS on the new table
- [ ] Create SELECT policy checking group membership
- [ ] Create INSERT policy checking permissions
- [ ] Create UPDATE policy (usually self or leader only)
- [ ] Create DELETE policy (usually self or leader only)
- [ ] Add foreign key to groups table with ON DELETE CASCADE
- [ ] Test with multiple users and groups
- [ ] Verify no cross-group data leakage

## Support

If you discover a security issue:

1. Do not share details publicly
2. Document the issue with reproduction steps
3. Test with non-production data
4. Review the RLS policies in the relevant migration files
5. Verify using SQL that policies are correctly enforced

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Postgres RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- Migration files in `/supabase/migrations/`
