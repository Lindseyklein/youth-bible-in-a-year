import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert, Platform, Linking } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Book, Users, MessageCircle, Award, Flame, BookOpen, Target, HelpCircle, HandHeart, Share2, ChevronRight, Download } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import WeeklyDiscussionModule from '@/components/WeeklyDiscussionModule';
import { fetchBibleVerses } from '@/lib/bibleApi';

type DailyReading = {
  id: string;
  title: string;
  scripture_references: string[];
  key_verse: string | null;
  topics: string[] | null;
  main_points: string[] | null;
  summary: string | null;
};

type UserStreak = {
  current_streak: number;
  longest_streak: number;
  total_readings_completed: number;
};

type WeeklyTheme = {
  number: number;
  title: string;
  verse_text: string;
  verse_reference: string;
};

type WeeklyEncouragement = {
  type: 'challenge' | 'reflection' | 'prayer' | 'verse';
  title: string;
  body: string;
};

export default function Home() {
  const { user } = useAuth();
  const [todayReading, setTodayReading] = useState<DailyReading | null>(null);
  const [streak, setStreak] = useState<UserStreak>({ current_streak: 0, longest_streak: 0, total_readings_completed: 0 });
  const [currentWeek, setCurrentWeek] = useState<WeeklyTheme>({ number: 1, title: 'Getting Started', verse_text: '', verse_reference: '' });
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [totalDays] = useState(365);
  const [weeklyEncouragement, setWeeklyEncouragement] = useState<WeeklyEncouragement | null>(null);
  const [dailyVerseText, setDailyVerseText] = useState<string | null>(null);
  const [dailyVerseLoading, setDailyVerseLoading] = useState(false);
  const [preferredVersion, setPreferredVersion] = useState<string>('NIV');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  useEffect(() => {
    if (todayReading?.key_verse) {
      fetchDailyVerse();
    }
  }, [todayReading, preferredVersion]);

  const fetchDailyVerse = async () => {
    if (!todayReading?.key_verse) return;

    setDailyVerseLoading(true);
    setDailyVerseText(null);

    try {
      const verses = await fetchBibleVerses(todayReading.key_verse, preferredVersion);
      if (verses && verses.length > 0) {
        const verseText = verses.map(v => v.text).join(' ');
        setDailyVerseText(verseText);
      } else {
        setDailyVerseText(null);
      }
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      setDailyVerseText(null);
    } finally {
      setDailyVerseLoading(false);
    }
  };

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);

    await supabase.rpc('ensure_user_has_cycle', { p_user_id: user.id });

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('display_name, email, user_role')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData?.display_name) {
      const name = profileData.display_name.split(' ')[0];
      setFirstName(name);
    }

    if (profileData?.user_role === 'admin') {
      setIsAdmin(true);
    }

    // Load user's preferred Bible version
    const { data: preferencesData } = await supabase
      .from('user_preferences')
      .select('preferred_bible_version')
      .eq('user_id', user.id)
      .maybeSingle();

    if (preferencesData?.preferred_bible_version) {
      const { data: versionData } = await supabase
        .from('bible_versions')
        .select('abbreviation')
        .eq('id', preferencesData.preferred_bible_version)
        .maybeSingle();

      if (versionData?.abbreviation) {
        setPreferredVersion(versionData.abbreviation);
      }
    }

    // Load streak
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    let userStartDate = new Date();

    if (streakData) {
      setStreak(streakData);
      if (streakData.start_date) {
        userStartDate = new Date(streakData.start_date);
      }
    } else {
      const { data: newStreak } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          start_date: new Date().toISOString().split('T')[0],
          current_streak: 0,
          longest_streak: 0,
          total_readings_completed: 0,
        })
        .select()
        .single();

      if (newStreak) {
        setStreak(newStreak);
        userStartDate = new Date(newStreak.start_date);
      }
    }

    // Calculate week and day
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - userStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNum = Math.min(Math.ceil(diffDays / 7), 53);
    const dayNum = ((diffDays - 1) % 7) + 1;

    // Load week data
    const { data: weekData } = await supabase
      .from('weekly_studies')
      .select('title, theme')
      .eq('week_number', weekNum)
      .maybeSingle();

    if (weekData) {
      setCurrentWeek({
        number: weekNum,
        title: weekData.title || `Week ${weekNum}`,
        verse_text: weekData.theme || '',
        verse_reference: '',
      });
    } else {
      setCurrentWeek({
        number: weekNum,
        title: `Week ${weekNum}`,
        verse_text: '',
        verse_reference: '',
      });
    }

    // Load today's reading
    const { data: readings } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('week_number', weekNum)
      .eq('day_number', dayNum)
      .maybeSingle();

    if (readings) {
      setTodayReading(readings);
    }

    // Generate weekly encouragement
    const encouragements: WeeklyEncouragement[] = [
      {
        type: 'challenge',
        title: 'Challenge of the Week',
        body: 'Do something kind for someone who\'s struggling this week.',
      },
      {
        type: 'reflection',
        title: 'Reflection Question',
        body: 'What\'s one thing God is teaching you right now?',
      },
      {
        type: 'prayer',
        title: 'Prayer Prompt',
        body: 'Pray for clarity in an area of uncertainty.',
      },
      {
        type: 'verse',
        title: 'Verse of the Week',
        body: 'The Lord is my strength and my shield; my heart trusts in him. — Psalm 28:7',
      },
    ];

    const randomEncouragement = encouragements[weekNum % encouragements.length];
    setWeeklyEncouragement(randomEncouragement);

    setLoading(false);
  };

  const handleShare = async () => {
    if (!weeklyEncouragement || weeklyEncouragement.type !== 'verse') return;

    try {
      await Share.share({
        message: weeklyEncouragement.body,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownloadPlan = async () => {
    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace('/rest/v1', '');
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      const url = `${supabaseUrl}/functions/v1/generate-pdf`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${anonKey}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate reading plan');
      }

      const htmlContent = await response.text();

      if (Platform.OS === 'web') {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error downloading plan:', error);
      Alert.alert('Download Error', 'Unable to download the reading plan. Please try again.');
    }
  };

  const getEncouragementIcon = () => {
    if (!weeklyEncouragement) return Target;

    switch (weeklyEncouragement.type) {
      case 'challenge': return Target;
      case 'reflection': return HelpCircle;
      case 'prayer': return HandHeart;
      case 'verse': return BookOpen;
      default: return Target;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const Icon = getEncouragementIcon();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dashboard Snapshot Header */}
        <View style={styles.dashboardHeader}>

        {/* 1. Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLine1}>
            {firstName ? `Hey there, ${firstName}! 👋` : 'Hey there! 👋'}
          </Text>
          <Text style={styles.greetingLine2}>
            {firstName ? 'Ready to grow this week?' : "Let's grow together this week."}
          </Text>
          <Text style={styles.greetingSubtitle}>
            You're on Week {currentWeek.number}: {currentWeek.title}
          </Text>
          <Text style={styles.readyText}>Today's reading is ready.</Text>
        </View>

        {/* 2. Daily Bible Verse */}
        {todayReading?.key_verse && (
          <View style={styles.dailyVerseCard}>
            <LinearGradient
              colors={['#FEF3C7', '#FDE68A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dailyVerseGradient}
            >
              <View style={styles.dailyVerseHeader}>
                <BookOpen size={20} color="#92400E" />
                <Text style={styles.dailyVerseLabel}>Today's Verse</Text>
              </View>

              {dailyVerseLoading ? (
                <View style={styles.verseLoadingContainer}>
                  <ActivityIndicator size="small" color="#92400E" />
                  <Text style={styles.verseLoadingText}>Loading verse...</Text>
                </View>
              ) : dailyVerseText ? (
                <>
                  <Text style={styles.dailyVerseText}>"{dailyVerseText}"</Text>
                  <Text style={styles.dailyVerseReference}>— {todayReading.key_verse}</Text>
                  <TouchableOpacity
                    style={styles.dailyVerseShareButton}
                    onPress={async () => {
                      try {
                        await Share.share({
                          message: `"${dailyVerseText}"\n\n— ${todayReading.key_verse}`,
                        });
                      } catch (error) {
                        console.error('Error sharing:', error);
                      }
                    }}
                  >
                    <Share2 size={14} color="#92400E" />
                    <Text style={styles.dailyVerseShareText}>Share Verse</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.dailyVerseReference}>{todayReading.key_verse}</Text>
                  <Text style={styles.verseFallbackText}>
                    Read this verse in your Bible or tap on Today's Reading below
                  </Text>
                </>
              )}
            </LinearGradient>
          </View>
        )}

        {/* 3. Today's Reading Card */}
        <TouchableOpacity
          style={styles.todayReadingCard}
          onPress={() => router.push('/(tabs)/plan')}
          activeOpacity={0.7}
        >
          <View style={styles.readingCardHeader}>
            <Book size={20} color="#2563EB" />
            <Text style={styles.readingCardTitle}>Today's Reading</Text>
          </View>

          <View style={styles.passagesList}>
            {todayReading?.scripture_references && todayReading.scripture_references.length > 0 ? (
              todayReading.scripture_references.map((passage, index) => (
                <Text key={index} style={styles.passageText}>
                  {passage}
                </Text>
              ))
            ) : (
              <Text style={styles.passageText}>{todayReading?.title || 'No reading available'}</Text>
            )}
          </View>

          <View style={styles.startButton}>
            <Text style={styles.startButtonText}>Start Reading</Text>
            <ChevronRight size={18} color="#ffffff" />
          </View>
        </TouchableOpacity>

        {/* 4. Progress Snapshot Row */}
        <View style={styles.progressRow}>
          <View style={styles.progressPill}>
            <Flame size={16} color="#0EA5E9" />
            <Text style={styles.progressPillValue}>{streak.current_streak}</Text>
            <Text style={styles.progressPillLabel}>day streak</Text>
          </View>

          <View style={styles.progressPill}>
            <BookOpen size={16} color="#2563EB" />
            <Text style={styles.progressPillValue}>{streak.total_readings_completed}</Text>
            <Text style={styles.progressPillLabel}>of {totalDays}</Text>
          </View>

          <View style={[styles.progressPill, styles.progressPillWide]}>
            <Award size={16} color="#56F0C3" />
            <Text style={styles.progressPillLabel}>Theme:</Text>
            <Text style={styles.progressPillValueSmall}>{currentWeek.title}</Text>
          </View>
        </View>

        {/* 5. Weekly Theme Banner */}
        {currentWeek.verse_text && (
          <LinearGradient
            colors={['#0EA5E9', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.themeBanner}
          >
            <Text style={styles.themeBannerLabel}>Week {currentWeek.number} Theme:</Text>
            <Text style={styles.themeBannerTitle}>{currentWeek.title}</Text>
            <Text style={styles.themeBannerVerse}>{currentWeek.verse_text}</Text>
            {currentWeek.verse_reference && (
              <Text style={styles.themeBannerReference}>— {currentWeek.verse_reference}</Text>
            )}
          </LinearGradient>
        )}

        {/* 6. Weekly Encouragement Box */}
        {weeklyEncouragement && (
          <View style={styles.encouragementBox}>
            <View style={styles.encouragementHeader}>
              <View style={styles.encouragementIcon}>
                <Icon size={18} color="#2563EB" />
              </View>
              <Text style={styles.encouragementTitle}>{weeklyEncouragement.title}</Text>
            </View>
            <Text style={styles.encouragementBody}>{weeklyEncouragement.body}</Text>

            {weeklyEncouragement.type === 'verse' && (
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share2 size={14} color="#2563EB" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Quick Access Section */}
      <View style={styles.content}>
        <WeeklyDiscussionModule />

        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.tilesGrid}>
          <TouchableOpacity
            style={styles.tile}
            onPress={() => router.push('/(tabs)/groups')}
          >
            <LinearGradient
              colors={['#0EA5E9', '#A5D8FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            >
              <Users size={24} color="#FFF" />
              <Text style={styles.tileTitle}>Weekly Study</Text>
              <Text style={styles.tileSubtitle}>Join Discussion</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tile}
            onPress={() => router.push('/(tabs)/groups')}
          >
            <LinearGradient
              colors={['#56F0C3', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            >
              <MessageCircle size={24} color="#FFF" />
              <Text style={styles.tileTitle}>Community</Text>
              <Text style={styles.tileSubtitle}>Share & Connect</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tile}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <LinearGradient
              colors={['#56F0C3', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            >
              <Award size={24} color="#FFF" />
              <Text style={styles.tileTitle}>Achievements</Text>
              <Text style={styles.tileSubtitle}>{streak.total_readings_completed} completed</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tile}
            onPress={() => router.push('/(tabs)/plan')}
          >
            <LinearGradient
              colors={['#2563EB', '#0EA5E9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tileGradient}
            >
              <Book size={24} color="#FFF" />
              <Text style={styles.tileTitle}>Full Plan</Text>
              <Text style={styles.tileSubtitle}>Week {currentWeek.number}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {isAdmin && (
            <TouchableOpacity
              style={styles.tile}
              onPress={handleDownloadPlan}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tileGradient}
              >
                <Download size={24} color="#FFF" />
                <Text style={styles.tileTitle}>Download Plan</Text>
                <Text style={styles.tileSubtitle}>52-Week PDF</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
        </View>
      </ScrollView>
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

  // Dashboard Header
  dashboardHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // 1. Greeting Section
  greetingSection: {
    marginBottom: 20,
  },
  greetingLine1: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  greetingLine2: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
    marginBottom: 12,
  },
  greetingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  readyText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },

  // 2. Daily Bible Verse
  dailyVerseCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  dailyVerseGradient: {
    padding: 20,
  },
  dailyVerseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dailyVerseLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailyVerseText: {
    fontSize: 17,
    lineHeight: 26,
    color: '#78350F',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  dailyVerseReference: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'right',
  },
  dailyVerseShareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(146, 64, 14, 0.1)',
    borderRadius: 8,
  },
  dailyVerseShareText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  verseLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  verseLoadingText: {
    fontSize: 14,
    color: '#92400E',
  },
  verseFallbackText: {
    fontSize: 14,
    color: '#78350F',
    marginTop: 8,
  },

  // 3. Today's Reading Card
  todayReadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  readingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  readingCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  passagesList: {
    marginBottom: 16,
  },
  passageText: {
    fontSize: 15,
    color: '#4B5563',
    marginBottom: 6,
    lineHeight: 22,
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // 4. Progress Snapshot Row
  progressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  progressPillWide: {
    flex: 1,
    minWidth: 160,
  },
  progressPillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressPillValueSmall: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  progressPillLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  // 5. Weekly Theme Banner
  themeBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  themeBannerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  themeBannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  themeBannerVerse: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  themeBannerReference: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // 6. Weekly Encouragement Box
  encouragementBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  encouragementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  encouragementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  encouragementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4338CA',
    flex: 1,
  },
  encouragementBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 8,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },

  // Quick Access Section
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '48%',
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tileGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 8,
    textAlign: 'center',
  },
  tileSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    textAlign: 'center',
  },
});
