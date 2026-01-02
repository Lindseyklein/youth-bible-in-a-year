import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MessageCircle, Users, ChevronRight, Book } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

type Group = {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
};

type DiscussionQuestion = {
  id: string;
  question_text: string;
  question_type: string;
  reply_count: number;
};

export default function WeeklyDiscussionModule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekTitle, setWeekTitle] = useState('');
  const [sampleQuestions, setSampleQuestions] = useState<DiscussionQuestion[]>([]);

  useEffect(() => {
    loadWeeklyDiscussionData();
  }, [user]);

  const loadWeeklyDiscussionData = async () => {
    if (!user) return;

    setLoading(true);

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
      weekNum = Math.min(Math.ceil(diffDays / 7), 52);
    }
    setCurrentWeek(weekNum);

    const { data: weekData } = await supabase
      .from('weekly_studies')
      .select('title')
      .eq('week_number', weekNum)
      .maybeSingle();

    if (weekData) {
      setWeekTitle(weekData.title || `Week ${weekNum}`);
    } else {
      setWeekTitle(`Week ${weekNum}`);
    }

    const { data: groupsData } = await supabase
      .from('group_members')
      .select(`
        groups!inner(
          id,
          name,
          description
        )
      `)
      .eq('user_id', user.id);

    if (groupsData) {
      const groupsWithCounts = await Promise.all(
        groupsData.map(async (gm: any) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', gm.groups.id);

          return {
            id: gm.groups.id,
            name: gm.groups.name,
            description: gm.groups.description,
            member_count: count || 0,
          };
        })
      );

      setMyGroups(groupsWithCounts);

      if (groupsWithCounts.length > 0) {
        const firstGroupId = groupsWithCounts[0].id;

        const { data: questions } = await supabase
          .from('discussion_questions')
          .select('id, question_text, question_type')
          .eq('group_id', firstGroupId)
          .eq('week_number', weekNum)
          .order('order_position', { ascending: true })
          .limit(3);

        if (questions) {
          const questionsWithReplies = await Promise.all(
            questions.map(async (q) => {
              const { count } = await supabase
                .from('discussion_replies')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', q.id);

              return {
                ...q,
                reply_count: count || 0,
              };
            })
          );

          setSampleQuestions(questionsWithReplies);
        }
      }
    }

    setLoading(false);
  };

  const handleGroupPress = (groupId: string) => {
    router.push(`/groups/${groupId}/weekly-discussion`);
  };

  const handleViewAllGroups = () => {
    router.push('/(tabs)/groups');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  if (myGroups.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <LinearGradient
          colors={['#EEF2FF', '#DBEAFE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.emptyGradient}
        >
          <Users size={32} color="#2563EB" />
          <Text style={styles.emptyTitle}>Join a Group</Text>
          <Text style={styles.emptySubtitle}>
            Connect with others and dive into weekly discussions
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={handleViewAllGroups}>
            <Text style={styles.emptyButtonText}>Browse Groups</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Weekly Discussions</Text>
          <Text style={styles.headerSubtitle}>
            Week {currentWeek}: {weekTitle}
          </Text>
        </View>
        <TouchableOpacity onPress={handleViewAllGroups}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {sampleQuestions.length > 0 && (
        <View style={styles.questionsPreview}>
          <View style={styles.questionsHeader}>
            <Book size={16} color="#6B7280" />
            <Text style={styles.questionsHeaderText}>This Week's Questions</Text>
          </View>
          {sampleQuestions.map((question) => (
            <View key={question.id} style={styles.questionItem}>
              <Text style={styles.questionText} numberOfLines={2}>
                {question.question_text}
              </Text>
              {question.reply_count > 0 && (
                <View style={styles.replyBadge}>
                  <MessageCircle size={12} color="#6B7280" />
                  <Text style={styles.replyCount}>{question.reply_count}</Text>
                </View>
              )}
            </View>
          ))}
          <TouchableOpacity
            style={styles.viewQuestionsButton}
            onPress={() => router.push(`/groups/${myGroups[0].id}/questions`)}
          >
            <Text style={styles.viewQuestionsText}>View All Questions</Text>
            <ChevronRight size={16} color="#2563EB" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupsScroll}
      >
        {myGroups.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={styles.groupCard}
            onPress={() => handleGroupPress(group.id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.groupGradient}
            >
              <View style={styles.groupIcon}>
                <Users size={20} color="#2563EB" />
              </View>
              <Text style={styles.groupName} numberOfLines={2}>
                {group.name}
              </Text>
              {group.description && (
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {group.description}
                </Text>
              )}
              <View style={styles.groupFooter}>
                <View style={styles.memberCount}>
                  <Users size={12} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.memberCountText}>{group.member_count} members</Text>
                </View>
                <ChevronRight size={16} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  questionsPreview: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  questionsHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    color: '#374151',
  },
  replyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  replyCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  viewQuestionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    gap: 4,
  },
  viewQuestionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  groupsScroll: {
    paddingRight: 20,
  },
  groupCard: {
    width: 240,
    height: 180,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  groupGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  groupIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 20,
  },
  groupDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 8,
  },
  groupFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  memberCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  memberCountText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  emptyContainer: {
    marginBottom: 24,
  },
  emptyGradient: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
