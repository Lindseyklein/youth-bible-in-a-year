import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Platform, Animated } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, Circle, Flame, Book, Play, Pause, X, Volume2, Heart, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import BibleReader from '@/components/BibleReader';

type DailyReading = {
  id: string;
  week_number: number;
  day_number: number;
  title: string;
  scripture_references: string[];
  summary: string | null;
  redemption_story: string | null;
  key_verse: string | null;
  topics: string[] | null;
  main_points: string[] | null;
};

type UserProgress = {
  reading_id: string;
  completed: boolean;
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_GRADIENTS = [
  ['#2563EB', '#0EA5E9'],
  ['#0EA5E9', '#2563EB'],
  ['#56F0C3', '#0EA5E9'],
  ['#56F0C3', '#0EA5E9'],
  ['#A5D8FF', '#2563EB'],
  ['#0EA5E9', '#56F0C3'],
  ['#0EA5E9', '#56F0C3'],
];

export default function Plan() {
  const { user } = useAuth();
  const [weekReadings, setWeekReadings] = useState<DailyReading[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDayNum, setCurrentDayNum] = useState(1);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showBibleReader, setShowBibleReader] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [user]);

  useEffect(() => {
    if (!selectedDay && showMiniPlayer) {
      setShowMiniPlayer(false);
      if (Platform.OS !== 'web') {
        Speech.stop();
      }
    }
  }, [selectedDay]);

  const loadPlan = async () => {
    if (!user) return;

    setLoading(true);

    const { data: profile } = await supabase
      .from('profiles')
      .select('start_date')
      .eq('id', user.id)
      .maybeSingle();

    const startDate = profile?.start_date ? new Date(profile.start_date) : new Date();
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const calculatedWeek = Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), 53);
    const dayNum = Math.min((diffDays % 7) + 1, 7);

    setCurrentWeek(calculatedWeek);
    setCurrentDayNum(dayNum);

    const { data: readings } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('week_number', calculatedWeek)
      .order('day_number');

    const { data: userProgress } = await supabase
      .from('user_progress')
      .select('reading_id, completed')
      .eq('user_id', user.id);

    if (readings) {
      setWeekReadings(readings);
    }

    setProgress(userProgress || []);

    const { data: allProgress } = await supabase
      .from('user_progress')
      .select('reading_id')
      .eq('user_id', user.id)
      .eq('completed', true);

    setTotalCompleted(allProgress?.length || 0);

    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    setStreak(streakData?.current_streak || 0);

    setLoading(false);
  };

  const markAsComplete = async (reading: DailyReading) => {
    if (!user) return;

    const existingProgress = progress.find(p => p.reading_id === reading.id);

    if (existingProgress?.completed) {
      return;
    }

    if (existingProgress) {
      await supabase
        .from('user_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('reading_id', reading.id);
    } else {
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          reading_id: reading.id,
          completed: true,
          completed_at: new Date().toISOString(),
        });
    }

    const today = new Date().toISOString().split('T')[0];

    await supabase
      .from('user_streaks')
      .upsert({
        user_id: user.id,
        last_reading_date: today,
        total_readings_completed: totalCompleted + 1,
        updated_at: new Date().toISOString(),
      });

    loadPlan();
  };

  const toggleAudio = () => {
    if (!selectedDay) return;

    if (Platform.OS === 'web') {
      alert('Audio playback is available on iOS and Android apps');
      return;
    }

    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      const text = `${selectedDay.title}. ${selectedDay.summary || ''}`;
      Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
      setIsPlaying(true);
      setShowMiniPlayer(true);
    }
  };

  const isCompleted = (readingId: string) => {
    return progress.find(p => p.reading_id === readingId)?.completed || false;
  };

  const isToday = (dayNumber: number) => {
    return dayNumber === currentDayNum;
  };

  const completedCount = weekReadings.filter(r => isCompleted(r.id)).length;

  const changeWeek = async (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' ? currentWeek - 1 : currentWeek + 1;
    if (newWeek < 1 || newWeek > 53) return;

    setLoading(true);
    setCurrentWeek(newWeek);

    const { data: readings } = await supabase
      .from('daily_readings')
      .select('*')
      .eq('week_number', newWeek)
      .order('day_number');

    if (readings) {
      setWeekReadings(readings);
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E2A38', '#2563EB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.title}>Your Bible Journey</Text>
        <View style={styles.weekNavigator}>
          <TouchableOpacity
            onPress={() => changeWeek('prev')}
            disabled={currentWeek <= 1}
            style={[styles.weekNavButton, currentWeek <= 1 && styles.weekNavButtonDisabled]}
          >
            <ChevronLeft size={20} color={currentWeek <= 1 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
          </TouchableOpacity>
          <Text style={styles.subtitle}>Week {currentWeek} of 53</Text>
          <TouchableOpacity
            onPress={() => changeWeek('next')}
            disabled={currentWeek >= 53}
            style={[styles.weekNavButton, currentWeek >= 53 && styles.weekNavButtonDisabled]}
          >
            <ChevronRight size={20} color={currentWeek >= 53 ? 'rgba(255,255,255,0.3)' : '#FFF'} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressInfo}>
          <View style={styles.statBubble}>
            <Flame size={16} color="#0EA5E9" />
            <Text style={styles.statNumber}>{streak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>

          <View style={styles.statBubble}>
            <Book size={16} color="#10b981" />
            <Text style={styles.statNumber}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>completed</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / 7) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount} of 7 days this week
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>This Week's Plan</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dayCardsContainer}
          contentContainerStyle={styles.dayCardsContent}
        >
          {weekReadings.map((reading, index) => {
            const completed = isCompleted(reading.id);
            const today = isToday(reading.day_number);
            const gradient = DAY_GRADIENTS[index];

            return (
              <TouchableOpacity
                key={reading.id}
                style={[styles.dayCard, today && styles.todayCard]}
                onPress={() => setSelectedDay(reading)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.dayCardGradient}
                >
                  {completed && (
                    <View style={styles.completedBadge}>
                      <CheckCircle2 size={20} color="#FFF" />
                    </View>
                  )}

                  {today && !completed && (
                    <View style={styles.todayBadge}>
                      <Text style={styles.todayBadgeText}>TODAY</Text>
                    </View>
                  )}

                  <Text style={styles.dayName}>{DAY_NAMES[index]}</Text>
                  <Text style={styles.dayNumber}>Day {reading.day_number}</Text>

                  {reading.scripture_references.length > 0 && (
                    <Text style={styles.dayReference} numberOfLines={1}>
                      {reading.scripture_references[0]}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {weekReadings.length > 0 && (
          <View style={styles.planTip}>
            <Text style={styles.tipText}>
              Tap any day to read, listen, and mark complete 📖
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Daily Breakdown</Text>

        {weekReadings.map((reading, index) => {
          const completed = isCompleted(reading.id);
          const today = isToday(reading.day_number);

          return (
            <TouchableOpacity
              key={reading.id}
              style={[styles.breakdownCard, today && styles.breakdownCardToday]}
              onPress={() => setSelectedDay(reading)}
              activeOpacity={0.9}
            >
              <View style={styles.breakdownHeader}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.dayBadge, today && styles.dayBadgeToday]}>
                    <Text style={[styles.dayBadgeText, today && styles.dayBadgeTextToday]}>
                      Day {reading.day_number}
                    </Text>
                  </View>
                  {completed && (
                    <View style={styles.completedTag}>
                      <CheckCircle2 size={14} color="#10b981" />
                      <Text style={styles.completedTagText}>Done</Text>
                    </View>
                  )}
                </View>
                {today && (
                  <View style={styles.todayLabel}>
                    <Text style={styles.todayLabelText}>TODAY</Text>
                  </View>
                )}
              </View>

              <Text style={styles.breakdownTitle}>{reading.title}</Text>

              <Text style={styles.breakdownRefs}>
                📖 {reading.scripture_references.join(', ')}
              </Text>

              {reading.topics && reading.topics.length > 0 && (
                <View style={styles.breakdownTopics}>
                  {reading.topics.map((topic, idx) => (
                    <View key={idx} style={styles.breakdownTopicTag}>
                      <Text style={styles.breakdownTopicText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              )}

              {reading.main_points && reading.main_points.length > 0 && (
                <View style={styles.breakdownPoints}>
                  <Text style={styles.breakdownPointsLabel}>Key Points:</Text>
                  {reading.main_points.slice(0, 2).map((point, idx) => (
                    <Text key={idx} style={styles.breakdownPoint}>
                      • {point}
                    </Text>
                  ))}
                  {reading.main_points.length > 2 && (
                    <Text style={styles.breakdownMore}>
                      +{reading.main_points.length - 2} more points
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={selectedDay !== null}
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        {selectedDay && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={DAY_GRADIENTS[(selectedDay.day_number - 1) % 7]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <View>
                  <Text style={styles.modalDayLabel}>
                    {DAY_NAMES[(selectedDay.day_number - 1) % 7]} • Day {selectedDay.day_number}
                  </Text>
                  <Text style={styles.modalTitle}>{selectedDay.title}</Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedDay(null)}
                >
                  <X size={28} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.referencesRow}>
                {selectedDay.scripture_references.map((ref, idx) => (
                  <View key={idx} style={styles.refPill}>
                    <Text style={styles.refPillText}>{ref}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              {selectedDay.topics && selectedDay.topics.length > 0 && (
                <View style={styles.topicsSection}>
                  <Text style={styles.sectionLabel}>📚 Topics</Text>
                  <View style={styles.topicsContainer}>
                    {selectedDay.topics.map((topic, idx) => (
                      <View key={idx} style={styles.topicTag}>
                        <Text style={styles.topicTagText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedDay.summary && (
                <View style={styles.devotionalSection}>
                  <Text style={styles.sectionLabel}>📖 Today's Devotional</Text>
                  <Text style={styles.devotionalText}>{selectedDay.summary}</Text>
                </View>
              )}

              {selectedDay.main_points && selectedDay.main_points.length > 0 && (
                <View style={styles.mainPointsSection}>
                  <Text style={styles.sectionLabel}>💡 Key Takeaways</Text>
                  {selectedDay.main_points.map((point, idx) => (
                    <View key={idx} style={styles.bulletPointRow}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletPointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => setShowBibleReader(true)}
                >
                  <LinearGradient
                    colors={['#56F0C3', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.actionButtonGradient}
                  >
                    <Book size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Read Now</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.listenButton}
                    onPress={toggleAudio}
                  >
                    <LinearGradient
                      colors={['#0EA5E9', '#A5D8FF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.actionButtonGradient}
                    >
                      {isPlaying ? (
                        <Pause size={20} color="#FFF" />
                      ) : (
                        <Play size={20} color="#FFF" />
                      )}
                      <Text style={styles.actionButtonText}>
                        {isPlaying ? 'Pause' : 'Listen'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>

              <BibleReader scriptureReferences={selectedDay.scripture_references} />

              {selectedDay.key_verse && (
                <View style={styles.keyVerseCard}>
                  <Text style={styles.sectionLabel}>⭐ Key Verse</Text>
                  <Text style={styles.keyVerseText}>{selectedDay.key_verse}</Text>
                </View>
              )}

              {selectedDay.redemption_story && (
                <View style={styles.redemptionCard}>
                  <Text style={styles.sectionLabel}>✨ Redemption Story</Text>
                  <Text style={styles.redemptionText}>{selectedDay.redemption_story}</Text>
                </View>
              )}

              {!isCompleted(selectedDay.id) && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => markAsComplete(selectedDay)}
                >
                  <LinearGradient
                    colors={['#56F0C3', '#0EA5E9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.completeButtonGradient}
                  >
                    <CheckCircle2 size={24} color="#FFF" />
                    <Text style={styles.completeButtonText}>Mark Today as Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {isCompleted(selectedDay.id) && (
                <View style={styles.completedBanner}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <Text style={styles.completedBannerText}>You completed this day! 🎉</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>

      <Modal
        visible={showBibleReader && selectedDay !== null}
        animationType="slide"
        onRequestClose={() => setShowBibleReader(false)}
      >
        <View style={styles.bibleReaderModal}>
          <View style={styles.bibleReaderHeader}>
            <TouchableOpacity onPress={() => setShowBibleReader(false)}>
              <X size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.bibleReaderTitle}>
              {selectedDay?.title || 'Bible Reader'}
            </Text>
            <View style={{ width: 24 }} />
          </View>
          {selectedDay && (
            <BibleReader scriptureReferences={selectedDay.scripture_references} />
          )}
        </View>
      </Modal>

      {showMiniPlayer && selectedDay && Platform.OS !== 'web' && (
        <View style={styles.miniPlayer}>
          <LinearGradient
            colors={['#1E2A38', '#4B5563']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.miniPlayerGradient}
          >
            <View style={styles.miniPlayerContent}>
              <Volume2 size={20} color="#FFF" />
              <View style={styles.miniPlayerInfo}>
                <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                  {selectedDay.title}
                </Text>
                <Text style={styles.miniPlayerSubtitle}>
                  {isPlaying ? 'Playing...' : 'Paused'}
                </Text>
              </View>

              <TouchableOpacity onPress={toggleAudio} style={styles.miniPlayerButton}>
                {isPlaying ? (
                  <Pause size={24} color="#FFF" />
                ) : (
                  <Play size={24} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
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
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  weekNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 16,
  },
  weekNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavButtonDisabled: {
    opacity: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  progressInfo: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  progressBarContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  dayCardsContainer: {
    marginBottom: 16,
  },
  dayCardsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  dayCard: {
    width: 140,
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  todayCard: {
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  dayCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 20,
    padding: 6,
  },
  todayBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  dayReference: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    textAlign: 'center',
  },
  planTip: {
    margin: 16,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalDayLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  referencesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  refPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  topicsSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  topicTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#86efac',
  },
  topicTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
  },
  devotionalSection: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  mainPointsSection: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bulletPointRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 8,
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginRight: 8,
    marginTop: 2,
  },
  bulletPointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#78350f',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  devotionalText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  readButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  listenButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  keyVerseCard: {
    backgroundColor: '#fef9e7',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  keyVerseText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#78350f',
    fontStyle: 'italic',
  },
  redemptionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  redemptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1E40AF',
  },
  completeButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  completeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    marginBottom: 24,
    gap: 12,
  },
  completedBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  miniPlayerGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  miniPlayerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  miniPlayerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  miniPlayerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownCardToday: {
    borderWidth: 2,
    borderColor: '#2563EB',
    shadowOpacity: 0.15,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dayBadgeToday: {
    backgroundColor: '#2563EB',
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dayBadgeTextToday: {
    color: '#FFF',
  },
  completedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10b981',
  },
  todayLabel: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  breakdownRefs: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  breakdownTopics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  breakdownTopicTag: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  breakdownTopicText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e40af',
  },
  breakdownPoints: {
    backgroundColor: '#fef9e7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  breakdownPointsLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 6,
  },
  breakdownPoint: {
    fontSize: 13,
    lineHeight: 20,
    color: '#78350f',
    marginBottom: 4,
  },
  breakdownMore: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bibleReaderModal: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  bibleReaderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bibleReaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
});
