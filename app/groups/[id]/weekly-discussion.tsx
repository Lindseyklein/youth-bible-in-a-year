import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Book, MessageCircle, HandHeart, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DiscussionQuestions from '@/components/DiscussionQuestions';
import GroupChatView from '@/components/GroupChatView';
import PrayerRequestsView from '@/components/PrayerRequestsView';

type WeeklyTheme = {
  week_number: number;
  theme_title: string;
  theme_verse: string;
  verse_reference: string;
  summary: string;
};

type FeaturedReading = {
  id: string;
  title: string;
  scripture_references: string[];
  summary: string;
  theme_relevance_score: number;
};

type GroupMember = {
  user_id: string;
  role: string;
};

export default function WeeklyDiscussionScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groupId] = useState(id as string);
  const [weeklyTheme, setWeeklyTheme] = useState<WeeklyTheme | null>(null);
  const [featuredReading, setFeaturedReading] = useState<FeaturedReading | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isMember, setIsMember] = useState(false);
  const [isLeader, setIsLeader] = useState(false);
  const [activeTab, setActiveTab] = useState<'discussion' | 'chat' | 'prayer'>('discussion');
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    loadWeeklyDiscussion();
  }, [groupId, user]);

  const loadWeeklyDiscussion = async () => {
    if (!user || !groupId) return;

    setLoading(true);

    const { data: memberData } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (memberData) {
      setIsMember(true);
      setIsLeader(memberData.role === 'leader');
    }

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('start_date')
      .eq('user_id', user.id)
      .maybeSingle();

    let weekNum = 1;
    if (streakData?.start_date) {
      const startDate = new Date(streakData.start_date);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      weekNum = Math.min(Math.ceil(diffDays / 7), 53);
    }
    setCurrentWeek(weekNum);

    const { data: themeData } = await supabase
      .from('weekly_studies')
      .select('*')
      .eq('week_number', weekNum)
      .maybeSingle();

    if (themeData) {
      setWeeklyTheme({
        week_number: themeData.week_number,
        theme_title: themeData.title || `Week ${weekNum}`,
        theme_verse: themeData.theme || '',
        verse_reference: '',
        summary: themeData.theme || '',
      });
    }

    const { data: readings } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('week_number', weekNum)
      .order('theme_relevance_score', { ascending: false });

    if (readings && readings.length > 0) {
      const featured = readings.reduce((best, current) => {
        if (current.theme_relevance_score > best.theme_relevance_score) return current;
        if (current.theme_relevance_score === best.theme_relevance_score &&
            current.contains_redemption_cycle && !best.contains_redemption_cycle) return current;
        return best;
      }, readings[0]);

      setFeaturedReading({
        id: featured.id,
        title: featured.title,
        scripture_references: featured.scripture_references || [],
        summary: featured.summary || '',
        theme_relevance_score: featured.theme_relevance_score || 3,
      });
    }

    const { data: completionData } = await supabase
      .from('weekly_discussion_completion')
      .select('id')
      .eq('user_id', user.id)
      .eq('group_id', groupId)
      .eq('week_number', weekNum)
      .maybeSingle();

    setHasCompleted(!!completionData);

    await initializeDiscussionQuestions(groupId, weekNum, themeData?.theme_title || '');

    setLoading(false);
  };

  const initializeDiscussionQuestions = async (gId: string, week: number, themeTitle: string) => {
    const { data: existing } = await supabase
      .from('discussion_questions')
      .select('id')
      .eq('group_id', gId)
      .eq('week_number', week);

    if (!existing || existing.length === 0) {
      const questions = [
        {
          group_id: gId,
          week_number: week,
          question_type: 'observation',
          question_text: 'What stood out to you in this passage? Was there a moment that surprised or challenged you?',
          order_position: 1,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'scripture1',
          question_text: 'What does this passage teach us about God\'s character?',
          order_position: 2,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'scripture2',
          question_text: 'How does this passage challenge the way you think or live?',
          order_position: 3,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'scripture3',
          question_text: 'What questions does this passage raise for you?',
          order_position: 4,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'theme',
          question_text: `How does this connect to our weekly theme: "${themeTitle}"?`,
          order_position: 5,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'personal',
          question_text: 'When have you experienced something in your own life that relates to this passage?',
          order_position: 6,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'application',
          question_text: 'What is one practical step you can take this week based on this reading?',
          order_position: 7,
        },
        {
          group_id: gId,
          week_number: week,
          question_type: 'redemption',
          question_text: 'Where do you see the cycle of sin → struggle → turning back to God → redemption in this story?',
          order_position: 8,
        },
      ];

      await supabase.from('discussion_questions').insert(questions).select();
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        role: 'member',
      });

    if (error) {
      Alert.alert('Error', 'Failed to join group');
      return;
    }

    setIsMember(true);
    loadWeeklyDiscussion();
  };

  const handleMarkComplete = async () => {
    if (!user || hasCompleted) return;

    const { error } = await supabase
      .from('weekly_discussion_completion')
      .insert({
        user_id: user.id,
        group_id: groupId,
        week_number: currentWeek,
      });

    if (!error) {
      setHasCompleted(true);
      Alert.alert('Great Job!', 'You completed this week\'s discussion!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!isMember) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
        </View>
        <View style={styles.joinContainer}>
          <Text style={styles.joinTitle}>Join this Group's Discussions</Text>
          <Text style={styles.joinSubtitle}>
            Join to participate in weekly discussions, chat, and prayer requests.
          </Text>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinGroup}>
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Discussion</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
          onPress={() => setActiveTab('discussion')}
        >
          <Book size={20} color={activeTab === 'discussion' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
            Discussion
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <MessageCircle size={20} color={activeTab === 'chat' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
            Chat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'prayer' && styles.activeTab]}
          onPress={() => setActiveTab('prayer')}
        >
          <HandHeart size={20} color={activeTab === 'prayer' ? '#2563EB' : '#6B7280'} />
          <Text style={[styles.tabText, activeTab === 'prayer' && styles.activeTabText]}>
            Prayer
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'discussion' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {weeklyTheme && (
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.themeHeader}
            >
              <Text style={styles.weekLabel}>Week {weeklyTheme.week_number}</Text>
              <Text style={styles.themeTitle}>{weeklyTheme.theme_title}</Text>
              {weeklyTheme.theme_verse && (
                <>
                  <Text style={styles.themeVerse}>{weeklyTheme.theme_verse}</Text>
                  <Text style={styles.verseReference}>— {weeklyTheme.verse_reference}</Text>
                </>
              )}
              {weeklyTheme.summary && (
                <Text style={styles.themeSummary}>{weeklyTheme.summary}</Text>
              )}
            </LinearGradient>
          )}

          {featuredReading && (
            <View style={styles.featuredSection}>
              <View style={styles.featuredHeader}>
                <Book size={20} color="#2563EB" />
                <Text style={styles.featuredTitle}>Featured Reading</Text>
              </View>

              {featuredReading.scripture_references.map((ref, index) => (
                <Text key={index} style={styles.passageReference}>
                  {ref}
                </Text>
              ))}

              {featuredReading.summary && (
                <Text style={styles.featuredExplanation}>{featuredReading.summary}</Text>
              )}

              <TouchableOpacity
                style={styles.readButton}
                onPress={() => router.push('/(tabs)/plan')}
              >
                <Text style={styles.readButtonText}>Read This Passage</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.questionsSection}>
            <View style={styles.questionsSectionHeader}>
              <Text style={styles.questionsSectionTitle}>Discussion Questions</Text>
              <TouchableOpacity
                style={styles.viewOnlyButton}
                onPress={() => router.push(`/groups/${groupId}/questions`)}
              >
                <Text style={styles.viewOnlyButtonText}>View Only</Text>
              </TouchableOpacity>
            </View>
          </View>

          <DiscussionQuestions
            groupId={groupId}
            weekNumber={currentWeek}
            isLeader={isLeader}
          />

          {!hasCompleted && (
            <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
              <CheckCircle size={20} color="#ffffff" />
              <Text style={styles.completeButtonText}>Mark This Week's Discussion Complete</Text>
            </TouchableOpacity>
          )}

          {hasCompleted && (
            <View style={styles.completedBadge}>
              <CheckCircle size={20} color="#10B981" />
              <Text style={styles.completedText}>Completed for this week!</Text>
            </View>
          )}
        </ScrollView>
      )}

      {activeTab === 'chat' && (
        <GroupChatView groupId={groupId} isLeader={isLeader} />
      )}

      {activeTab === 'prayer' && (
        <PrayerRequestsView groupId={groupId} isLeader={isLeader} />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  joinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  joinTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  joinSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  joinButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2563EB',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#2563EB',
  },
  content: {
    flex: 1,
  },
  themeHeader: {
    padding: 24,
    marginBottom: 16,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  themeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  themeVerse: {
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  verseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  themeSummary: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  featuredSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  passageReference: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 8,
  },
  featuredExplanation: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 16,
  },
  readButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  readButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  questionsSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  questionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  questionsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  viewOnlyButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  viewOnlyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
});
