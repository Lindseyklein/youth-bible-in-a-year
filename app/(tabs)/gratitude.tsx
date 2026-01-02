import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DailyGratitudeScreen from '@/components/DailyGratitudeScreen';
import PastEntriesScreen from '@/components/PastEntriesScreen';
import YearReflectionScreen from '@/components/YearReflectionScreen';

type Tab = 'daily' | 'past' | 'year';

export default function GratitudeTab() {
  const [activeTab, setActiveTab] = useState<Tab>('daily');

  const renderContent = () => {
    switch (activeTab) {
      case 'daily':
        return <DailyGratitudeScreen />;
      case 'past':
        return <PastEntriesScreen />;
      case 'year':
        return <YearReflectionScreen />;
      default:
        return <DailyGratitudeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
          onPress={() => setActiveTab('daily')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
            Today
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Past Entries
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'year' && styles.tabActive]}
          onPress={() => setActiveTab('year')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'year' && styles.tabTextActive]}>
            Year Review
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#10B981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
});
