import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Book } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DiscussionQuestions from '@/components/DiscussionQuestions';

type Group = {
  id: string;
  name: string;
  current_week: number;
};

type WeeklyTheme = {
  week_number: number;
  title: string;
  theme: string;
};

export default function QuestionsScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [weeklyTheme, setWeeklyTheme] = useState<WeeklyTheme | null>(null);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    loadGroupData();
  }, [id, user]);

  const loadGroupData = async () => {
    if (!user || !id) return;

    setLoading(true);

    const { data: groupData } = await supabase
      .from('groups')
      .select('id, name, current_week')
      .eq('id', id)
      .single();

    if (groupData) {
      setGroup(groupData);

      const { data: memberData } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsLeader(memberData?.role === 'leader' || memberData?.role === 'moderator');

      const { data: themeData } = await supabase
        .from('weekly_studies')
        .select('*')
        .eq('week_number', groupData.current_week)
        .maybeSingle();

      if (themeData) {
        setWeeklyTheme({
          week_number: themeData.week_number,
          title: themeData.title || `Week ${groupData.current_week}`,
          theme: themeData.theme || '',
        });
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
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
          <Text style={styles.headerTitle}>Discussion Questions</Text>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.groupName}>{group.name}</Text>
        {weeklyTheme && (
          <>
            <Text style={styles.weekLabel}>Week {weeklyTheme.week_number}</Text>
            <Text style={styles.themeTitle}>{weeklyTheme.title}</Text>
            {weeklyTheme.theme && (
              <Text style={styles.themeDescription}>{weeklyTheme.theme}</Text>
            )}
          </>
        )}
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Book size={20} color="#2563EB" />
          <Text style={styles.infoText}>
            Answer the questions below and read what others have shared. Your responses help everyone grow!
          </Text>
        </View>

        <DiscussionQuestions
          groupId={id as string}
          weekNumber={group.current_week}
          isLeader={isLeader}
        />

        <View style={styles.bottomPadding} />
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
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  groupName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1E40AF',
  },
  bottomPadding: {
    height: 32,
  },
});
