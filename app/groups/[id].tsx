import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Settings, MessageCircle, BookOpen, Users, Heart, Target, Bell, Plus, Trash2, History } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DiscussionHistory from '@/components/DiscussionHistory';
import GroupMembersList from '@/components/GroupMembersList';
import ShareGroupCard from '@/app/groups/[id]/ShareGroupCard';
import { toDisplayString } from '@/lib/displayUtils';

type Group = {
  id: string;
  name: string;
  description: string;
  current_week: number;
  leader_id: string;
  member_count: number;
  invite_code?: string;
};

type Discussion = {
  id: string;
  week_number: number;
  title: string;
  pinned_message: string | null;
  status: string;
  post_count?: number;
};

type WeeklyReading = {
  id: string;
  week_number: number;
  title: string;
  scripture_references: string[];
  key_verse: string | null;
};

type PrayerRequest = {
  id: string;
  title: string;
  description: string | null;
  visibility: string;
  prayer_count: number;
  user_id: string;
  created_at: string;
  profiles: { display_name: string };
};

type WeeklyChallenge = {
  id: string;
  week_number: number;
  challenge_text: string;
  challenge_type: string;
  completion_count?: number;
  user_completed?: boolean;
};

type Broadcast = {
  id: string;
  message: string;
  is_pinned: boolean;
  created_at: string;
  sender_id: string;
  profiles: { display_name: string };
};

export default function GroupDetail() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [weeklyReading, setWeeklyReading] = useState<WeeklyReading | null>(null);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [activeTab, setActiveTab] = useState<'discussion' | 'reading' | 'prayer' | 'more'>('discussion');
  const [isLeader, setIsLeader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDescription, setPrayerDescription] = useState('');
  const [prayerVisibility, setPrayerVisibility] = useState<'group' | 'leaders_only'>('group');
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    loadGroupDetails();
  }, [id]);

  const loadGroupDetails = async () => {
    if (!user || !id) return;

    setLoading(true);

    const { data: groupData } = await supabase
      .from('groups')
      .select('*')
      .eq('id', id)
      .single();

    if (groupData) {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupData.id)
        .eq('status', 'active');

      setGroup({ ...groupData, member_count: count || 0 });
      setIsLeader(groupData.leader_id === user.id);

      const { data: memberData } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (memberData?.role === 'leader' || memberData?.role === 'moderator') {
        setIsLeader(true);
      }

      loadWeeklyDiscussion(groupData.current_week);
      loadWeeklyReading(groupData.current_week);
      loadPrayerRequests();
      loadWeeklyChallenge(groupData.current_week);
      loadBroadcasts();
    }

    setLoading(false);
  };

  const loadWeeklyDiscussion = async (weekNumber: number) => {
    const { data } = await supabase
      .from('group_discussions')
      .select('*')
      .eq('group_id', id)
      .eq('week_number', weekNumber)
      .maybeSingle();

    if (data) {
      const { count } = await supabase
        .from('discussion_posts')
        .select('*', { count: 'exact', head: true })
        .eq('discussion_id', data.id)
        .eq('is_deleted', false);

      setDiscussion({ ...data, post_count: count || 0 });
    }
  };

  const loadWeeklyReading = async (weekNumber: number) => {
    const { data } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('week_number', weekNumber)
      .eq('day_number', 1)
      .maybeSingle();

    if (data) {
      setWeeklyReading(data);
    }
  };

  const loadPrayerRequests = async () => {
    const { data } = await supabase
      .from('prayer_requests')
      .select('*, profiles(display_name)')
      .eq('group_id', id)
      .order('created_at', { ascending: false });

    if (data) {
      setPrayerRequests(data);
    }
  };

  const loadWeeklyChallenge = async (weekNumber: number) => {
    const { data: challengeData } = await supabase
      .from('weekly_challenges')
      .select('*')
      .eq('week_number', weekNumber)
      .maybeSingle();

    if (challengeData) {
      const { count } = await supabase
        .from('challenge_completions')
        .select('*', { count: 'exact', head: true })
        .eq('challenge_id', challengeData.id);

      const { data: userCompletion } = await supabase
        .from('challenge_completions')
        .select('id')
        .eq('challenge_id', challengeData.id)
        .eq('user_id', user!.id)
        .maybeSingle();

      setWeeklyChallenge({
        ...challengeData,
        completion_count: count || 0,
        user_completed: !!userCompletion,
      });
    }
  };

  const loadBroadcasts = async () => {
    const { data } = await supabase
      .from('group_broadcasts')
      .select('*, profiles(display_name)')
      .eq('group_id', id)
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (data) {
      setBroadcasts(data);
    }
  };

  const handlePrayerSubmit = async () => {
    if (!user || !prayerTitle.trim()) return;

    await supabase.from('prayer_requests').insert({
      group_id: id,
      user_id: user.id,
      title: prayerTitle.trim(),
      description: prayerDescription.trim() || null,
      visibility: prayerVisibility,
    });

    setPrayerTitle('');
    setPrayerDescription('');
    setShowPrayerModal(false);
    loadPrayerRequests();
  };

  const handlePrayForRequest = async (prayerRequestId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('prayer_responses')
      .insert({
        prayer_request_id: prayerRequestId,
        user_id: user.id,
      });

    if (!error) {
      loadPrayerRequests();
    }
  };

  const handleCompleteChallenge = async () => {
    if (!user || !weeklyChallenge) return;

    if (weeklyChallenge.user_completed) {
      await supabase
        .from('challenge_completions')
        .delete()
        .eq('challenge_id', weeklyChallenge.id)
        .eq('user_id', user.id);
    } else {
      await supabase.from('challenge_completions').insert({
        challenge_id: weeklyChallenge.id,
        user_id: user.id,
      });
    }

    if (group) loadWeeklyChallenge(group.current_week);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0EA5E9', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          {isLeader && (
            <TouchableOpacity
              onPress={() => router.push(`/groups/${id}/settings` as any)}
              style={styles.settingsButton}
            >
              <Settings size={24} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.groupName}>{toDisplayString(group.name)}</Text>
        <Text style={styles.groupDescription}>{toDisplayString(group.description)}</Text>

        <View style={styles.groupMeta}>
          <View style={styles.metaItem}>
            <Users size={16} color="#ffffff" />
            <Text style={styles.metaText}>{group.member_count} members</Text>
          </View>
          <View style={styles.metaItem}>
            <BookOpen size={16} color="#ffffff" />
            <Text style={styles.metaText}>Week {group.current_week}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'discussion' && styles.tabActive]}
              onPress={() => setActiveTab('discussion')}
            >
              <MessageCircle size={18} color={activeTab === 'discussion' ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.tabText, activeTab === 'discussion' && styles.tabTextActive]}>Discuss</Text>
              {discussion && discussion.post_count > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{discussion.post_count}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'prayer' && styles.tabActive]}
              onPress={() => setActiveTab('prayer')}
            >
              <Heart size={18} color={activeTab === 'prayer' ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.tabText, activeTab === 'prayer' && styles.tabTextActive]}>Prayer</Text>
              {prayerRequests.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{prayerRequests.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'reading' && styles.tabActive]}
              onPress={() => setActiveTab('reading')}
            >
              <BookOpen size={18} color={activeTab === 'reading' ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.tabText, activeTab === 'reading' && styles.tabTextActive]}>Reading</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'more' && styles.tabActive]}
              onPress={() => setActiveTab('more')}
            >
              <Target size={18} color={activeTab === 'more' ? '#ffffff' : 'rgba(255,255,255,0.7)'} />
              <Text style={[styles.tabText, activeTab === 'more' && styles.tabTextActive]}>More</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {activeTab === 'reading' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Week {group.current_week} Reading</Text>

            {weeklyReading ? (
              <View style={styles.readingCard}>
                <Text style={styles.readingTitle}>{toDisplayString(weeklyReading.title)}</Text>

                <View style={styles.scriptureSection}>
                  <Text style={styles.scriptureLabel}>Scripture References</Text>
                  {weeklyReading.scripture_references.map((ref, index) => (
                    <Text key={index} style={styles.scriptureRef}>
                      • {toDisplayString(ref)}
                    </Text>
                  ))}
                </View>

                {weeklyReading.key_verse && (
                  <View style={styles.keyVerseSection}>
                    <Text style={styles.keyVerseLabel}>Key Verse</Text>
                    <Text style={styles.keyVerseText}>{toDisplayString(weeklyReading.key_verse)}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => router.push('/(tabs)/plan')}
                >
                  <Text style={styles.readButtonText}>Go to Reading Plan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <BookOpen size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No reading available for this week</Text>
              </View>
            )}

            {discussion?.pinned_message && (
              <View style={styles.pinnedCard}>
                <Text style={styles.pinnedLabel}>📌 Leader's Devotional</Text>
                <Text style={styles.pinnedMessage}>{toDisplayString(discussion.pinned_message)}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'discussion' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Week {group.current_week} Discussion</Text>
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => setShowHistoryModal(true)}
              >
                <History size={20} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {discussion ? (
              <View style={styles.discussionCard}>
                <Text style={styles.discussionTitle}>{toDisplayString(discussion.title)}</Text>
                <Text style={styles.discussionSubtitle}>
                  {discussion.post_count} {discussion.post_count === 1 ? 'post' : 'posts'}
                </Text>

                {discussion.pinned_message && (
                  <View style={styles.pinnedSection}>
                    <Text style={styles.pinnedLabel}>📌 Pinned by Leader</Text>
                    <Text style={styles.pinnedText}>{toDisplayString(discussion.pinned_message)}</Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewDiscussionButton}
                  onPress={() => router.push(`/groups/${id}/weekly-discussion` as any)}
                >
                  <Text style={styles.viewDiscussionText}>View Full Discussion</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <MessageCircle size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>
                  No discussion thread yet for Week {group.current_week}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'prayer' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Prayer Requests</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowPrayerModal(true)}
              >
                <Plus size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {broadcasts.length > 0 && (
              <View style={styles.broadcastCard}>
                <Bell size={20} color="#92400e" />
                <View style={styles.broadcastContent}>
                  <Text style={styles.broadcastTitle}>📢 From {toDisplayString(broadcasts[0].profiles?.display_name)}</Text>
                  <Text style={styles.broadcastMessage}>{toDisplayString(broadcasts[0].message)}</Text>
                </View>
              </View>
            )}

            {prayerRequests.length === 0 ? (
              <View style={styles.emptyCard}>
                <Heart size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No prayer requests yet. Be the first to share!</Text>
              </View>
            ) : (
              prayerRequests.map((request) => (
                <View key={request.id} style={styles.prayerCard}>
                  <View style={styles.prayerHeader}>
                    <View>
                      <Text style={styles.prayerTitle}>{toDisplayString(request.title)}</Text>
                      <Text style={styles.prayerAuthor}>by {request.profiles.display_name}</Text>
                    </View>
                    {request.visibility === 'leaders_only' && (
                      <View style={styles.privateBadge}>
                        <Text style={styles.privateBadgeText}>LEADERS ONLY</Text>
                      </View>
                    )}
                  </View>

                  {request.description && (
                    <Text style={styles.prayerDescription}>{toDisplayString(request.description)}</Text>
                  )}

                  <TouchableOpacity
                    style={styles.prayButton}
                    onPress={() => handlePrayForRequest(request.id)}
                  >
                    <Heart size={16} color="#6366f1" />
                    <Text style={styles.prayButtonText}>
                      {request.prayer_count} {request.prayer_count === 1 ? 'person' : 'people'} praying
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {activeTab === 'more' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            {isLeader && group.invite_code ? (
              <View style={styles.sectionBlock}>
                <ShareGroupCard
                  groupId={group.id}
                  groupName={toDisplayString(group.name)}
                  joinCode={group.invite_code}
                />
              </View>
            ) : null}
            <Text style={styles.sectionTitle}>This Week's Challenge</Text>

            {weeklyChallenge ? (
              <View style={styles.challengeCard}>
                <View style={styles.challengeIcon}>
                  <Target size={24} color="#6366f1" />
                </View>
                <Text style={styles.challengeText}>{toDisplayString(weeklyChallenge.challenge_text)}</Text>
                <Text style={styles.challengeStats}>
                  {weeklyChallenge.completion_count} {weeklyChallenge.completion_count === 1 ? 'member' : 'members'} completed
                </Text>
                <TouchableOpacity
                  style={[
                    styles.challengeButton,
                    weeklyChallenge.user_completed && styles.challengeButtonCompleted,
                  ]}
                  onPress={handleCompleteChallenge}
                >
                  <Text style={styles.challengeButtonText}>
                    {weeklyChallenge.user_completed ? '✓ Completed!' : 'Mark as Done'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Target size={48} color="#d1d5db" />
                <Text style={styles.emptyText}>No challenge this week</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Group Members</Text>
            <GroupMembersList groupId={group.id} />

            <Text style={styles.sectionTitle}>Group Info</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Users size={20} color="#6366f1" />
                <Text style={styles.infoText}>{group.member_count} members in this group</Text>
              </View>
              <View style={styles.infoRow}>
                <BookOpen size={20} color="#6366f1" />
                <Text style={styles.infoText}>Currently on Week {group.current_week}</Text>
              </View>
              <View style={styles.infoRow}>
                <MessageCircle size={20} color="#6366f1" />
                <Text style={styles.infoText}>Weekly discussions automatically posted</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      <Modal
        visible={showPrayerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPrayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>New Prayer Request</Text>

            <TextInput
              style={styles.input}
              placeholder="Title (required)"
              value={prayerTitle}
              onChangeText={setPrayerTitle}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={prayerDescription}
              onChangeText={setPrayerDescription}
              multiline
              numberOfLines={4}
              maxLength={500}
            />

            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  prayerVisibility === 'group' && styles.visibilityOptionActive,
                ]}
                onPress={() => setPrayerVisibility('group')}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    prayerVisibility === 'group' && styles.visibilityTextActive,
                  ]}
                >
                  Visible to Everyone
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityOption,
                  prayerVisibility === 'leaders_only' && styles.visibilityOptionActive,
                ]}
                onPress={() => setPrayerVisibility('leaders_only')}
              >
                <Text
                  style={[
                    styles.visibilityText,
                    prayerVisibility === 'leaders_only' && styles.visibilityTextActive,
                  ]}
                >
                  Leaders Only
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPrayerModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitButton, !prayerTitle.trim() && styles.modalSubmitButtonDisabled]}
                onPress={handlePrayerSubmit}
                disabled={!prayerTitle.trim()}
              >
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showHistoryModal}
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.historyModalContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Discussion History</Text>
            <TouchableOpacity
              style={styles.historyCloseButton}
              onPress={() => setShowHistoryModal(false)}
            >
              <Text style={styles.historyCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
          <DiscussionHistory
            groupId={group.id}
            onSelectDiscussion={(discussionId, weekNumber) => {
              setShowHistoryModal(false);
              router.push(`/groups/${id}/discussion/${discussionId}` as any);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 16,
  },
  groupMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  readingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  readingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scriptureSection: {
    marginBottom: 16,
  },
  scriptureLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scriptureRef: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 4,
  },
  keyVerseSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  keyVerseLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  keyVerseText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1a1a1a',
    fontStyle: 'italic',
  },
  readButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  readButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  pinnedCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  pinnedLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  pinnedMessage: {
    fontSize: 15,
    lineHeight: 22,
    color: '#78350f',
  },
  discussionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  discussionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  discussionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  pinnedSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  pinnedText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350f',
  },
  viewDiscussionButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewDiscussionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyCard: {
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
    textAlign: 'center',
    marginTop: 12,
  },
  tabsScroll: {
    flexGrow: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  broadcastCard: {
    flexDirection: 'row',
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  broadcastContent: {
    flex: 1,
  },
  broadcastTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 4,
  },
  broadcastMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78350f',
  },
  prayerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  prayerAuthor: {
    fontSize: 13,
    color: '#666',
  },
  privateBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  privateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400e',
  },
  prayerDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  prayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  challengeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  challengeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  challengeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  challengeStats: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
  },
  challengeButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  challengeButtonCompleted: {
    backgroundColor: '#10b981',
  },
  challengeButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#1a1a1a',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1a1a1a',
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  visibilityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  visibilityOptionActive: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  visibilityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  visibilityTextActive: {
    color: '#2563EB',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  modalSubmitButtonDisabled: {
    opacity: 0.5,
  },
  modalSubmitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  historyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  historyCloseButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  historyCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
});
