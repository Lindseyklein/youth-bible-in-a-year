import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Plus, MessageCircle, Settings, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import FriendInviteButton from '@/components/FriendInviteButton';

type Group = {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  current_week: number;
  member_count?: number;
  role?: string;
  unread_count?: number;
};

export default function Groups() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('Loading groups for user:', user.id);
    setLoading(true);

    try {
      const { data: memberships, error: membershipError } = await supabase
        .from('group_members')
        .select('group_id, role, groups(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      console.log('User memberships:', memberships, 'Error:', membershipError);

      if (membershipError) {
        console.error('Error loading memberships:', membershipError);
        setMyGroups([]);
      } else if (memberships && memberships.length > 0) {
        const groupsWithDetails = await Promise.all(
          memberships.map(async (membership: any) => {
            const group = membership.groups;
            if (!group) return null;

            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)
              .eq('status', 'active');

            return {
              ...group,
              role: membership.role,
              member_count: count || 1,
              unread_count: 0,
            };
          })
        );

        const validGroups = groupsWithDetails.filter(g => g !== null);
        console.log('Final groups with details:', validGroups);
        setMyGroups(validGroups);
      } else {
        console.log('No group memberships found');
        setMyGroups([]);
      }
    } catch (error) {
      console.error('Error in loadGroups:', error);
      setMyGroups([]);
    }

    try {
      const { data: publicGroupsData, error: publicError } = await supabase
        .from('groups')
        .select('*')
        .eq('is_public', true)
        .limit(10);

      console.log('Public groups:', publicGroupsData, 'Error:', publicError);

      if (publicError) {
        console.error('Error loading public groups:', publicError);
        setPublicGroups([]);
      } else if (publicGroupsData) {
        const publicWithCounts = await Promise.all(
          publicGroupsData.map(async (group) => {
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)
              .eq('status', 'active');

            return {
              ...group,
              member_count: count || 0,
            };
          })
        );

        setPublicGroups(publicWithCounts.filter(g => !myGroups.find(mg => mg.id === g.id)));
      } else {
        setPublicGroups([]);
      }
    } catch (error) {
      console.error('Error loading public groups:', error);
      setPublicGroups([]);
    }

    setLoading(false);
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
        status: 'active',
      });

    loadGroups();
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E2A38', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Connect & grow together</Text>
          </View>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/groups/create' as any)}
          >
            <Plus size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.inviteCard}>
          <Text style={styles.inviteCardTitle}>Invite Friends to Join</Text>
          <Text style={styles.inviteCardText}>
            Invite your friends to grow in faith together and start weekly discussions!
          </Text>
          <FriendInviteButton />
        </View>

        <View style={styles.debugBox}>
          <Text style={styles.debugText}>🔍 Debug Info:</Text>
          <Text style={styles.debugText}>User ID: {user?.id?.substring(0, 8) || 'Not logged in'}</Text>
          <Text style={styles.debugText}>My Groups: {myGroups.length}</Text>
          <Text style={styles.debugText}>Public Groups: {publicGroups.length}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={loadGroups}
          >
            <Text style={styles.refreshButtonText}>Refresh Groups</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Groups</Text>

          {myGroups.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptyText}>
                Join a public group or create your own!
              </Text>
              <Text style={[styles.emptyText, { marginTop: 10, fontSize: 12, color: '#f59e0b' }]}>
                Check browser console (F12) for loading errors
              </Text>
            </View>
          ) : (
            myGroups.map(group => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/groups/${group.id}` as any)}
              >
                <View style={styles.groupIconContainer}>
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a6f']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.groupIcon}
                  >
                    <Users size={24} color="#ffffff" />
                  </LinearGradient>
                </View>

                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    {group.role === 'leader' && (
                      <View style={styles.leaderBadge}>
                        <Text style={styles.leaderBadgeText}>LEADER</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description || 'No description'}
                  </Text>
                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Users size={14} color="#666" />
                      <Text style={styles.metaText}>{group.member_count} members</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MessageCircle size={14} color="#666" />
                      <Text style={styles.metaText}>Week {group.current_week}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.groupActions}>
                  {group.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{group.unread_count}</Text>
                    </View>
                  )}
                  <ChevronRight size={20} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {publicGroups.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discover Groups</Text>

            {publicGroups.map(group => (
              <View key={group.id} style={styles.groupCard}>
                <View style={styles.groupIconContainer}>
                  <View style={styles.groupIconPublic}>
                    <Users size={24} color="#ff6b6b" />
                  </View>
                </View>

                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDescription} numberOfLines={2}>
                    {group.description || 'No description'}
                  </Text>
                  <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                      <Users size={14} color="#666" />
                      <Text style={styles.metaText}>{group.member_count} members</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.joinButton}
                  onPress={() => joinGroup(group.id)}
                >
                  <Text style={styles.joinButtonText}>Join</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📖 Weekly Discussions</Text>
          <Text style={styles.infoText}>
            Each week, new discussion threads automatically appear in your groups based on the Bible reading plan.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  inviteCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  inviteCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  inviteCardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  groupCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  groupIconContainer: {
    marginRight: 16,
  },
  groupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupIconPublic: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffe5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: {
    flex: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginRight: 8,
  },
  leaderBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  leaderBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  groupDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  groupActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: '#ef4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  joinButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  infoCard: {
    margin: 16,
    padding: 20,
    backgroundColor: '#ffe5e5',
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#c44569',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#ff6b6b',
    lineHeight: 20,
  },
  signInButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  debugBox: {
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  debugText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  refreshButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
