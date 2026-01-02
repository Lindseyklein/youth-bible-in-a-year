import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Calendar as CalendarIcon, Book, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type DailyReading = {
  id: string;
  week_number: number;
  day_number: number;
  title: string;
  scripture_references: string[];
  summary: string;
};

type WeeklyStudy = {
  week_number: number;
  title: string;
  theme: string;
};

type DayData = {
  date: Date;
  dayNumber: number;
  reading: DailyReading | null;
  weekStudy: WeeklyStudy | null;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isPlanDay: boolean;
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [allReadings, setAllReadings] = useState<DailyReading[]>([]);
  const [allWeekStudies, setAllWeekStudies] = useState<WeeklyStudy[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  useEffect(() => {
    loadCalendarData();
  }, [user]);

  const loadCalendarData = async () => {
    setLoading(true);

    let userStartDate = new Date();

    if (user) {
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('start_date')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakData?.start_date) {
        userStartDate = new Date(streakData.start_date);
      }
    }

    setStartDate(userStartDate);

    const { data: readings } = await supabase
      .from('daily_readings')
      .select('*')
      .order('week_number', { ascending: true })
      .order('day_number', { ascending: true });

    if (readings) {
      setAllReadings(readings);
    }

    const { data: weekStudies } = await supabase
      .from('weekly_studies')
      .select('week_number, title, theme')
      .order('week_number', { ascending: true });

    if (weekStudies) {
      setAllWeekStudies(weekStudies);
    }

    setLoading(false);
  };

  const getDayData = (date: Date): DayData => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const planStart = new Date(startDate);
    planStart.setHours(0, 0, 0, 0);

    const isToday = checkDate.getTime() === today.getTime();
    const isPast = checkDate < today;
    const isFuture = checkDate > today;

    if (checkDate < planStart) {
      return {
        date,
        dayNumber: 0,
        reading: null,
        weekStudy: null,
        isToday,
        isPast,
        isFuture,
        isPlanDay: false,
      };
    }

    const diffTime = checkDate.getTime() - planStart.getTime();
    const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (dayNumber > 364) {
      return {
        date,
        dayNumber: 0,
        reading: null,
        weekStudy: null,
        isToday,
        isPast,
        isFuture,
        isPlanDay: false,
      };
    }

    const weekNumber = Math.ceil(dayNumber / 7);
    const dayInWeek = ((dayNumber - 1) % 7) + 1;

    const reading = allReadings.find(
      r => r.week_number === weekNumber && r.day_number === dayInWeek
    );

    const weekStudy = allWeekStudies.find(w => w.week_number === weekNumber);

    return {
      date,
      dayNumber,
      reading: reading || null,
      weekStudy: weekStudy || null,
      isToday,
      isPast,
      isFuture,
      isPlanDay: true,
    };
  };

  const generateMonthDays = (monthOffset: number) => {
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + monthOffset;
    const adjustedDate = new Date(year, month, 1);
    const daysInMonth = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = adjustedDate.getDay();

    const days: (DayData | null)[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), day);
      days.push(getDayData(date));
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex < 11) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const monthDays = generateMonthDays(currentMonthIndex);
  const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth() + currentMonthIndex, 1);

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
            <Text style={styles.title}>52-Week Calendar</Text>
            <Text style={styles.subtitle}>Full year reading plan</Text>
          </View>
          <CalendarIcon size={32} color="#ffffff" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.monthNavigation}>
          <TouchableOpacity
            style={[styles.navButton, currentMonthIndex === 0 && styles.navButtonDisabled]}
            onPress={handlePrevMonth}
            disabled={currentMonthIndex === 0}
          >
            <ChevronLeft size={24} color={currentMonthIndex === 0 ? '#d1d5db' : '#2563EB'} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>

          <TouchableOpacity
            style={[styles.navButton, currentMonthIndex === 11 && styles.navButtonDisabled]}
            onPress={handleNextMonth}
            disabled={currentMonthIndex === 11}
          >
            <ChevronRight size={24} color={currentMonthIndex === 11 ? '#d1d5db' : '#2563EB'} />
          </TouchableOpacity>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.daysHeader}>
            {DAYS.map((day) => (
              <View key={day} style={styles.dayHeaderCell}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {monthDays.map((dayData, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !dayData && styles.dayCellEmpty,
                  dayData?.isToday && styles.dayCellToday,
                  dayData?.isPlanDay && styles.dayCellPlan,
                ]}
                onPress={() => dayData && dayData.isPlanDay && setSelectedDay(dayData)}
                disabled={!dayData || !dayData.isPlanDay}
                activeOpacity={0.7}
              >
                {dayData && (
                  <>
                    <Text style={[
                      styles.dayNumber,
                      dayData.isToday && styles.dayNumberToday,
                      dayData.isPlanDay && styles.dayNumberPlan,
                    ]}>
                      {dayData.date.getDate()}
                    </Text>
                    {dayData.isPlanDay && dayData.reading && (
                      <View style={styles.dayIndicator} />
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
            <Text style={styles.legendText}>Has Reading</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedDay}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalDate}>
                  {selectedDay?.date.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                {selectedDay?.weekStudy && (
                  <Text style={styles.modalWeek}>
                    Week {selectedDay.weekStudy.week_number}: {selectedDay.weekStudy.title}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <X size={28} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedDay?.reading ? (
                <>
                  {selectedDay.weekStudy?.theme && (
                    <View style={styles.themeCard}>
                      <Text style={styles.themeLabel}>Weekly Theme</Text>
                      <Text style={styles.themeText}>{selectedDay.weekStudy.theme}</Text>
                    </View>
                  )}

                  <View style={styles.readingCard}>
                    <Text style={styles.readingTitle}>{selectedDay.reading.title}</Text>

                    <View style={styles.scripturesSection}>
                      <Text style={styles.sectionLabel}>Scripture References</Text>
                      {selectedDay.reading.scripture_references.map((ref, index) => (
                        <Text key={index} style={styles.scriptureRef}>
                          {ref}
                        </Text>
                      ))}
                    </View>

                    {selectedDay.reading.summary && (
                      <View style={styles.summarySection}>
                        <Text style={styles.sectionLabel}>Summary</Text>
                        <Text style={styles.summaryText}>{selectedDay.reading.summary}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.dayNumberLabel}>Day {selectedDay.dayNumber} of 364</Text>
                </>
              ) : (
                <View style={styles.noReadingCard}>
                  <Book size={48} color="#d1d5db" />
                  <Text style={styles.noReadingText}>
                    No reading scheduled for this day
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCellEmpty: {
    opacity: 0,
  },
  dayCellToday: {
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
  },
  dayCellPlan: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dayNumberToday: {
    color: '#059669',
    fontWeight: '700',
  },
  dayNumberPlan: {
    color: '#2563EB',
  },
  dayIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginVertical: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalWeek: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  modalContent: {
    padding: 24,
  },
  themeCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  themeText: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 22,
  },
  readingCard: {
    marginBottom: 16,
  },
  readingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  scripturesSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  scriptureRef: {
    fontSize: 15,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 6,
  },
  summarySection: {
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  dayNumberLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  noReadingCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noReadingText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
});
