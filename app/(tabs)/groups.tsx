import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, Plus, MessageCircle, ChevronRight, Hash } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import JoinGroupByCodeModal from '@/components/JoinGroupByCodeModal';

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
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    loadGroups();
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const { data: memberships, error } = await supabase
        .from('group_members')
        .select('group_id, role, groups(*)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) {
        setMyGroups([]);
      } else if (memberships && memberships.length > 0) {
        const groupsWithDetails = await Promise.all(
          memberships.map(async (m: any) => {
            const g = m.groups;
            if (!g) return null;
            const { count } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', g.id)
              .eq('status', 'active');
            return { ...g, role: m.role, member_count: count || 1, unread_count: 0 };
          })
        );
        setMyGroups(groupsWithDetails.filter(Boolean));
      } else {
        setMyGroups([]);
      }
    } catch {
      setMyGroups([]);
    }

    setLoading(false);
  };

  const handleJoinSuccess = () => {
    loadGroups();
  };

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
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
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Join with Code - prominent */}
        <TouchableOpacity style={styles.joinCard} onPress={() => setShowJoinModal(true)}>
          <View style={styles.joinIcon}>
            <Hash size={28} color="#2563EB" />
          </View>
          <View style={styles.joinContent}>
            <Text style={styles.joinTitle}>Join with Code</Text>
            <Text style={styles.joinText}>Have a join code? Enter it here to join a group</Text>
          </View>
          <ChevronRight size={22} color="#2563EB" />
        </TouchableOpacity>

        {/* Create Group CTA */}
        <TouchableOpacity
          style={styles.createCard}
          onPress={() => router.push('/groups/create' as any)}
        >
          <View style={styles.createIcon}>
            <Plus size={28} color="#fff" />
          </View>
          <View style={styles.createContent}>
            <Text style={styles.createTitle}>Create Group</Text>
            <Text style={styles.createText}>Start a new Bible study group</Text>
          </View>
          <ChevronRight size={22} color="#fff" />
        </TouchableOpacity>

        {/* My Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Groups</Text>

          {myGroups.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={48} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No groups yet</Text>
              <Text style={styles.emptyText}>
                Create a group or join one with a code
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setShowJoinModal(true)}
              >
                <Hash size={18} color="#fff" />
                <Text style={styles.emptyButtonText}>Join with Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            myGroups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/groups/${group.id}` as any)}
              >
                <View style={styles.groupIcon}>
                  <LinearGradient colors={['#2563EB', '#1E40AF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.groupIconGrad}>
                    <Users size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.groupInfo}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    {(group.role === 'owner' || group.role === 'leader') && (
                      <View style={styles.badge}><Text style={styles.badgeText}>LEADER</Text></View>
                    )}
                  </View>
                  <Text style={styles.groupDesc} numberOfLines={2}>{group.description || 'Bible study group'}</Text>
                  <View style={styles.meta}>
                    <Users size={14} color="#666" />
                    <Text style={styles.metaText}>{group.member_count} members · Week {group.current_week}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <JoinGroupByCodeModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoinSuccess={handleJoinSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 32, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  createButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1 },
  joinCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20, margin: 16, marginBottom: 8, borderWidth: 2, borderColor: '#BFDBFE' },
  joinIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#DBEAFE', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  joinContent: { flex: 1 },
  joinTitle: { fontSize: 18, fontWeight: '700', color: '#1E40AF', marginBottom: 2 },
  joinText: { fontSize: 14, color: '#3B82F6', lineHeight: 20 },
  createCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563EB', borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 24, borderWidth: 2, borderColor: '#1D4ED8' },
  createIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  createContent: { flex: 1 },
  createTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 2 },
  createText: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 16 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 40, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 },
  emptyButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#2563EB', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 20 },
  emptyButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  groupCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  groupIcon: { marginRight: 16 },
  groupIconGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  groupInfo: { flex: 1 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  groupName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginRight: 8 },
  badge: { backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#92400e', letterSpacing: 0.5 },
  groupDesc: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#666', fontWeight: '600' },
});
