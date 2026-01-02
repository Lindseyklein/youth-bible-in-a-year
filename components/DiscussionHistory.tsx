import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { MessageCircle, ChevronRight, Calendar } from 'lucide-react-native';

type DiscussionItem = {
  id: string;
  week_number: number;
  title: string;
  status: string;
  post_count: number;
  created_at: string;
};

type Props = {
  groupId: string;
  onSelectDiscussion: (discussionId: string, weekNumber: number) => void;
};

export default function DiscussionHistory({ groupId, onSelectDiscussion }: Props) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState<DiscussionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiscussions();
  }, [groupId]);

  const loadDiscussions = async () => {
    if (!user || !groupId) return;

    setLoading(true);

    const { data: discussionData } = await supabase
      .from('group_discussions')
      .select('*')
      .eq('group_id', groupId)
      .order('week_number', { ascending: false });

    if (discussionData) {
      const discussionsWithCounts = await Promise.all(
        discussionData.map(async (discussion) => {
          const { count } = await supabase
            .from('discussion_posts')
            .select('*', { count: 'exact', head: true })
            .eq('discussion_id', discussion.id)
            .eq('is_deleted', false);

          return {
            ...discussion,
            post_count: count || 0,
          };
        })
      );

      setDiscussions(discussionsWithCounts);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  if (discussions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <MessageCircle size={48} color="#d1d5db" />
        <Text style={styles.emptyText}>No discussions yet</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text style={styles.title}>Discussion Archive</Text>
        <Text style={styles.subtitle}>Browse past weekly discussions</Text>

        {discussions.map((discussion) => (
          <TouchableOpacity
            key={discussion.id}
            style={styles.discussionCard}
            onPress={() => onSelectDiscussion(discussion.id, discussion.week_number)}
          >
            <View style={styles.weekBadge}>
              <Calendar size={16} color="#ff6b6b" />
              <Text style={styles.weekText}>Week {discussion.week_number}</Text>
            </View>

            <Text style={styles.discussionTitle}>{discussion.title}</Text>

            <View style={styles.discussionFooter}>
              <View style={styles.postCount}>
                <MessageCircle size={14} color="#666" />
                <Text style={styles.postCountText}>
                  {discussion.post_count} {discussion.post_count === 1 ? 'post' : 'posts'}
                </Text>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {discussion.status === 'active' ? 'Active' : 'Archived'}
                </Text>
              </View>

              <ChevronRight size={20} color="#ff6b6b" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  discussionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weekText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff6b6b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  discussionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  postCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  postCountText: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
});
