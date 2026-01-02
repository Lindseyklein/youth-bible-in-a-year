import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { BookOpen, Search, ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GratitudeEntry = {
  id: string;
  entry_date: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type GroupedEntries = {
  [key: string]: GratitudeEntry[];
};

export default function PastEntriesScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEntries();
  }, [user]);

  const loadEntries = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'Failed to load your gratitude entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const filterEntries = (entries: GratitudeEntry[]): GratitudeEntry[] => {
    if (!searchQuery.trim()) return entries;

    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.content.toLowerCase().includes(query) ||
        new Date(entry.entry_date).toLocaleDateString().toLowerCase().includes(query)
    );
  };

  const groupEntriesByMonth = (entries: GratitudeEntry[]): GroupedEntries => {
    const grouped: GroupedEntries = {};

    entries.forEach((entry) => {
      const date = new Date(entry.entry_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(entry);
    });

    return grouped;
  };

  const getMonthLabel = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const filteredEntries = filterEntries(entries);
  const groupedEntries = groupEntriesByMonth(filteredEntries);
  const monthKeys = Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Past Entries</Text>
            <Text style={styles.subtitle}>{entries.length} gratitude moments</Text>
          </View>
          <BookOpen size={32} color="#ffffff" />
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search your entries..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {filteredEntries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BookOpen size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matching entries' : 'No entries yet'}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? 'Try a different search term'
              : 'Start writing daily gratitude entries to build your collection'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {monthKeys.map((monthKey) => {
            const monthEntries = groupedEntries[monthKey];
            const isExpanded = expandedMonths.has(monthKey);

            return (
              <View key={monthKey} style={styles.monthSection}>
                <TouchableOpacity
                  style={styles.monthHeader}
                  onPress={() => toggleMonth(monthKey)}
                  activeOpacity={0.7}
                >
                  <View style={styles.monthHeaderLeft}>
                    <CalendarIcon size={20} color="#2563EB" />
                    <Text style={styles.monthTitle}>{getMonthLabel(monthKey)}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{monthEntries.length}</Text>
                    </View>
                  </View>
                  {isExpanded ? (
                    <ChevronUp size={20} color="#6B7280" />
                  ) : (
                    <ChevronDown size={20} color="#6B7280" />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.entriesContainer}>
                    {monthEntries.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} searchQuery={searchQuery} />
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

function EntryCard({ entry, searchQuery }: { entry: GratitudeEntry; searchQuery: string }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(entry.entry_date);
  const preview = entry.content.slice(0, 120);
  const needsExpansion = entry.content.length > 120;

  const highlightText = (text: string) => {
    if (!searchQuery.trim()) return text;
    return text;
  };

  return (
    <TouchableOpacity
      style={styles.entryCard}
      onPress={() => needsExpansion && setExpanded(!expanded)}
      activeOpacity={needsExpansion ? 0.7 : 1}
    >
      <View style={styles.entryHeader}>
        <Text style={styles.entryDate}>
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </View>

      <Text style={styles.entryContent}>
        {expanded ? entry.content : preview}
        {!expanded && needsExpansion && '...'}
      </Text>

      {needsExpansion && (
        <Text style={styles.expandText}>{expanded ? 'Show less' : 'Read more'}</Text>
      )}
    </TouchableOpacity>
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
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  monthSection: {
    marginTop: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  monthHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  entriesContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  entryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  entryHeader: {
    marginBottom: 8,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  entryContent: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  expandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 8,
  },
  bottomPadding: {
    height: 24,
  },
});
