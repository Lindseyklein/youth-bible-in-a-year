import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, TrendingUp, Award, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type PlanCycle = {
  id: string;
  cycle_number: number;
  start_date: string;
  end_date: string | null;
  completion_percentage: number;
  total_days_completed: number;
  longest_streak: number;
  status: string;
  restart_type: string;
};

export default function PlanHistoryView() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<PlanCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, [user]);

  const loadCycles = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('plan_cycles')
      .select('*')
      .eq('user_id', user.id)
      .order('cycle_number', { ascending: false });

    if (data) {
      setCycles(data);
    }

    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'In Progress', color: '#74b9ff', bg: '#dbeafe' },
      completed: { text: 'Completed', color: '#10b981', bg: '#d1fae5' },
      abandoned: { text: 'Restarted', color: '#f59e0b', bg: '#fef3c7' },
    };
    return badges[status as keyof typeof badges] || badges.active;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ff6b6b" />
      </View>
    );
  }

  if (cycles.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Award size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No plan history yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Plan History</Text>
      <Text style={styles.subtitle}>Track your progress across multiple cycles</Text>

      {cycles.map((cycle) => {
        const statusBadge = getStatusBadge(cycle.status);
        const isActive = cycle.status === 'active';

        return (
          <View key={cycle.id} style={[styles.cycleCard, isActive && styles.cycleCardActive]}>
            {isActive && (
              <LinearGradient
                colors={['#ff6b6b', '#ee5a6f']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.activeOverlay}
              />
            )}

            <View style={styles.cycleHeader}>
              <View>
                <Text style={[styles.cycleTitle, isActive && styles.cycleTextActive]}>
                  Cycle {cycle.cycle_number}
                </Text>
                <View style={styles.dateRow}>
                  <Calendar size={14} color={isActive ? '#ffffff' : '#666'} />
                  <Text style={[styles.cycleDate, isActive && styles.cycleTextActive]}>
                    {formatDate(cycle.start_date)}
                    {cycle.end_date && ` - ${formatDate(cycle.end_date)}`}
                  </Text>
                </View>
              </View>

              <View style={[styles.statusBadge, isActive && styles.statusBadgeActive]}>
                <Text
                  style={[
                    styles.statusBadgeText,
                    isActive && styles.statusBadgeTextActive,
                  ]}
                >
                  {statusBadge.text}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, isActive && styles.statIconActive]}>
                  <TrendingUp size={20} color={isActive ? '#ffffff' : '#ff6b6b'} />
                </View>
                <Text style={[styles.statValue, isActive && styles.cycleTextActive]}>
                  {cycle.completion_percentage}%
                </Text>
                <Text style={[styles.statLabel, isActive && styles.cycleTextActive]}>
                  Complete
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, isActive && styles.statIconActive]}>
                  <CheckCircle size={20} color={isActive ? '#ffffff' : '#10b981'} />
                </View>
                <Text style={[styles.statValue, isActive && styles.cycleTextActive]}>
                  {cycle.total_days_completed}
                </Text>
                <Text style={[styles.statLabel, isActive && styles.cycleTextActive]}>
                  Days Read
                </Text>
              </View>

              <View style={styles.statItem}>
                <View style={[styles.statIcon, isActive && styles.statIconActive]}>
                  <Award size={20} color={isActive ? '#ffffff' : '#f59e0b'} />
                </View>
                <Text style={[styles.statValue, isActive && styles.cycleTextActive]}>
                  {cycle.longest_streak}
                </Text>
                <Text style={[styles.statLabel, isActive && styles.cycleTextActive]}>
                  Best Streak
                </Text>
              </View>
            </View>

            {cycle.restart_type && cycle.restart_type !== 'initial' && (
              <View style={[styles.restartInfo, isActive && styles.restartInfoActive]}>
                <Text style={[styles.restartText, isActive && styles.cycleTextActive]}>
                  Restart type:{' '}
                  {cycle.restart_type === 'keep_history'
                    ? 'Kept history'
                    : 'Cleared progress'}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  cycleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cycleCardActive: {
    borderWidth: 2,
    borderColor: '#ff6b6b',
  },
  activeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.95,
  },
  cycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  cycleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  cycleTextActive: {
    color: '#ffffff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cycleDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#74b9ff',
  },
  statusBadgeTextActive: {
    color: '#ffffff',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    position: 'relative',
    zIndex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  restartInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    position: 'relative',
    zIndex: 1,
  },
  restartInfoActive: {
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  restartText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
});
