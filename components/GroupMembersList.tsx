import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Crown, Shield } from 'lucide-react-native';

type GroupMembersListProps = {
  groupId: string;
};

type Member = {
  id: string;
  user_id: string;
  role: 'leader' | 'moderator' | 'member';
  joined_at: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
};

export default function GroupMembersList({ groupId }: GroupMembersListProps) {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('id, user_id, role, joined_at, profiles(display_name, avatar_url)')
        .eq('group_id', groupId)
        .eq('status', 'active')
        .order('role', { ascending: true })
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error loading members:', error);
      } else if (data) {
        setMembers(data as Member[]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':
        return <Crown size={16} color="#f59e0b" />;
      case 'moderator':
        return <Shield size={16} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'leader':
        return 'Youth Leader';
      case 'moderator':
        return 'Moderator';
      default:
        return 'Member';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  if (members.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Users size={40} color="#d1d5db" />
        <Text style={styles.emptyText}>No members found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Users size={20} color="#6366f1" />
        <Text style={styles.headerTitle}>Group Members ({members.length})</Text>
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {member.profiles.display_name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.profiles.display_name}</Text>
              <View style={styles.roleContainer}>
                {getRoleIcon(member.role)}
                <Text
                  style={[
                    styles.roleText,
                    member.role === 'leader' && styles.roleTextLeader,
                    member.role === 'moderator' && styles.roleTextModerator,
                  ]}
                >
                  {getRoleLabel(member.role)}
                </Text>
              </View>
            </View>

            {member.user_id === user?.id && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>You</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  list: {
    maxHeight: 400,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    fontSize: 13,
    color: '#666',
  },
  roleTextLeader: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  roleTextModerator: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  youBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  youBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
});
