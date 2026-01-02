import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Download, Calendar as CalendarIcon, Heart, TrendingUp, Award } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GratitudeEntry = {
  id: string;
  entry_date: string;
  content: string;
  created_at: string;
};

type YearStats = {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  entriesByMonth: { [key: string]: number };
  mostProductiveMonth: string;
  firstEntry: GratitudeEntry | null;
};

export default function YearReflectionScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<YearStats | null>(null);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);

  useEffect(() => {
    loadYearData();
  }, [user, selectedYear]);

  const loadYearData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: true });

      if (error) throw error;

      setEntries(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading year data:', error);
      Alert.alert('Error', 'Failed to load your year reflection. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: GratitudeEntry[]) => {
    if (entries.length === 0) {
      setStats(null);
      return;
    }

    const entriesByMonth: { [key: string]: number } = {};
    const dates = entries.map((e) => new Date(e.entry_date));

    dates.forEach((date) => {
      const monthKey = date.toLocaleDateString('en-US', { month: 'long' });
      entriesByMonth[monthKey] = (entriesByMonth[monthKey] || 0) + 1;
    });

    const mostProductiveMonth =
      Object.keys(entriesByMonth).reduce((a, b) =>
        entriesByMonth[a] > entriesByMonth[b] ? a : b
      ) || '';

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedDates = [...dates].sort((a, b) => a.getTime() - b.getTime());

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const dayDiff =
          (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      if (i === sortedDates.length - 1) {
        longestStreak = Math.max(longestStreak, tempStreak);

        const lastEntryDate = sortedDates[i];
        lastEntryDate.setHours(0, 0, 0, 0);
        const daysSinceLastEntry = Math.floor(
          (today.getTime() - lastEntryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastEntry === 0 || daysSinceLastEntry === 1) {
          currentStreak = tempStreak;
        }
      }
    }

    setStats({
      totalEntries: entries.length,
      currentStreak,
      longestStreak,
      entriesByMonth,
      mostProductiveMonth,
      firstEntry: entries[0],
    });
  };

  const generateReflection = async () => {
    if (entries.length === 0) {
      Alert.alert('No Entries', 'You need at least one entry to generate a reflection.');
      return;
    }

    setGenerating(true);

    try {
      const reflection = generateHTMLReflection(entries, stats!);

      Alert.alert(
        'Download Ready',
        'Your year reflection has been generated. In a production app, this would download as a PDF or HTML file.',
        [
          {
            text: 'Preview',
            onPress: () => {
              console.log('Preview reflection:', reflection.substring(0, 500));
            },
          },
          { text: 'OK' },
        ]
      );
    } catch (error) {
      console.error('Error generating reflection:', error);
      Alert.alert('Error', 'Failed to generate your reflection. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const generateHTMLReflection = (entries: GratitudeEntry[], stats: YearStats): string => {
    const monthlyEntries: { [key: string]: GratitudeEntry[] } = {};

    entries.forEach((entry) => {
      const monthKey = new Date(entry.entry_date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      if (!monthlyEntries[monthKey]) {
        monthlyEntries[monthKey] = [];
      }
      monthlyEntries[monthKey].push(entry);
    });

    let html = `
<!DOCTYPE html>
<html>
<head>
  <title>My ${selectedYear} Gratitude Journey</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
    .cover { text-align: center; margin: 60px 0; }
    .cover h1 { font-size: 42px; color: #10B981; margin-bottom: 10px; }
    .cover p { font-size: 18px; color: #6B7280; }
    .stats { background: #F9FAFB; padding: 30px; border-radius: 12px; margin: 40px 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
    .stat-item { text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #10B981; }
    .stat-label { font-size: 14px; color: #6B7280; margin-top: 5px; }
    .month-section { margin: 40px 0; }
    .month-title { font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 20px; }
    .entry { background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 20px; margin-bottom: 15px; }
    .entry-date { font-size: 14px; font-weight: 600; color: #10B981; margin-bottom: 8px; }
    .entry-content { font-size: 15px; color: #374151; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>My ${selectedYear} Gratitude Journey</h1>
    <p>A year of reflection, growth, and appreciation</p>
  </div>

  <div class="stats">
    <h2 style="text-align: center; color: #111827;">Year in Review</h2>
    <div class="stat-grid">
      <div class="stat-item">
        <div class="stat-value">${stats.totalEntries}</div>
        <div class="stat-label">Total Entries</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.longestStreak}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.mostProductiveMonth}</div>
        <div class="stat-label">Most Active Month</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.currentStreak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
    </div>
  </div>

  ${Object.keys(monthlyEntries)
    .map(
      (month) => `
    <div class="month-section">
      <h2 class="month-title">${month}</h2>
      ${monthlyEntries[month]
        .map(
          (entry) => `
        <div class="entry">
          <div class="entry-date">${new Date(entry.entry_date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}</div>
          <div class="entry-content">${entry.content}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `
    )
    .join('')}
</body>
</html>
    `;

    return html;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EC4899" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EC4899', '#BE185D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Year Reflection</Text>
            <Text style={styles.subtitle}>Your gratitude journey</Text>
          </View>
          <Award size={32} color="#ffffff" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.yearSelector}>
          <TouchableOpacity
            style={styles.yearButton}
            onPress={() => setSelectedYear(selectedYear - 1)}
          >
            <Text style={styles.yearButtonText}>← {selectedYear - 1}</Text>
          </TouchableOpacity>
          <Text style={styles.currentYear}>{selectedYear}</Text>
          <TouchableOpacity
            style={[
              styles.yearButton,
              selectedYear >= new Date().getFullYear() && styles.yearButtonDisabled,
            ]}
            onPress={() => setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= new Date().getFullYear()}
          >
            <Text
              style={[
                styles.yearButtonText,
                selectedYear >= new Date().getFullYear() && styles.yearButtonTextDisabled,
              ]}
            >
              {selectedYear + 1} →
            </Text>
          </TouchableOpacity>
        </View>

        {!stats ? (
          <View style={styles.emptyContainer}>
            <Heart size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No entries for {selectedYear}</Text>
            <Text style={styles.emptyText}>
              Start writing daily gratitude entries to build your year reflection
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Heart size={24} color="#EC4899" fill="#EC4899" />
                </View>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <TrendingUp size={24} color="#10B981" />
                </View>
                <Text style={styles.statValue}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Current Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Award size={24} color="#F59E0B" />
                </View>
                <Text style={styles.statValue}>{stats.longestStreak}</Text>
                <Text style={styles.statLabel}>Longest Streak</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <CalendarIcon size={24} color="#2563EB" />
                </View>
                <Text style={[styles.statValue, { fontSize: 14 }]}>
                  {stats.mostProductiveMonth}
                </Text>
                <Text style={styles.statLabel}>Most Active</Text>
              </View>
            </View>

            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>Your Year at a Glance</Text>
              <Text style={styles.previewText}>
                In {selectedYear}, you wrote {stats.totalEntries} gratitude{' '}
                {stats.totalEntries === 1 ? 'entry' : 'entries'}. Your most productive month was{' '}
                {stats.mostProductiveMonth}, and your longest streak was {stats.longestStreak}{' '}
                {stats.longestStreak === 1 ? 'day' : 'days'}.
              </Text>

              {stats.firstEntry && (
                <View style={styles.highlightBox}>
                  <Text style={styles.highlightLabel}>Your First Entry of {selectedYear}</Text>
                  <Text style={styles.highlightDate}>
                    {new Date(stats.firstEntry.entry_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.highlightContent} numberOfLines={3}>
                    {stats.firstEntry.content}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.downloadButton, generating && styles.downloadButtonDisabled]}
              onPress={generateReflection}
              disabled={generating}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={generating ? ['#9CA3AF', '#6B7280'] : ['#EC4899', '#BE185D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.downloadButtonGradient}
              >
                {generating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Download size={20} color="#ffffff" />
                    <Text style={styles.downloadButtonText}>Download My Year</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>
                Download your complete {selectedYear} gratitude journey as a beautifully formatted
                reflection — a keepsake you can revisit anytime.
              </Text>
            </View>
          </>
        )}
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
    paddingBottom: 24,
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
  content: {
    flex: 1,
    padding: 16,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  yearButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EC4899',
  },
  yearButtonDisabled: {
    opacity: 0.3,
  },
  yearButtonTextDisabled: {
    color: '#9CA3AF',
  },
  currentYear: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  previewCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  previewText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
  highlightBox: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  highlightLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EC4899',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  highlightDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BE185D',
    marginBottom: 8,
  },
  highlightContent: {
    fontSize: 14,
    color: '#831843',
    lineHeight: 20,
  },
  downloadButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoCard: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCE7F3',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#831843',
    lineHeight: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
