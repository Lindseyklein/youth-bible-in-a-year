import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { ChevronDown, ChevronUp, Send, MessageCircle, Pin, Trash2, Star } from 'lucide-react-native';

type Question = {
  id: string;
  question_text: string;
  question_type: string;
  is_pinned: boolean;
  order_position: number;
};

type Reply = {
  id: string;
  user_id: string;
  content: string;
  is_highlighted: boolean;
  created_at: string;
  parent_reply_id: string | null;
  user_name: string;
  reactions: { emoji: string; count: number }[];
};

type Props = {
  groupId: string;
  weekNumber: number;
  isLeader: boolean;
};

export default function DiscussionQuestions({ groupId, weekNumber, isLeader }: Props) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
    subscribeToReplies();
  }, [groupId, weekNumber]);

  const loadQuestions = async () => {
    const { data } = await supabase
      .from('discussion_questions')
      .select('*')
      .eq('group_id', groupId)
      .eq('week_number', weekNumber)
      .order('is_pinned', { ascending: false })
      .order('order_position', { ascending: true });

    if (data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const loadReplies = async (questionId: string) => {
    const { data } = await supabase
      .from('discussion_replies')
      .select(`
        *,
        profiles!discussion_replies_user_id_fkey(display_name)
      `)
      .eq('question_id', questionId)
      .is('parent_reply_id', null)
      .order('created_at', { ascending: true });

    if (data) {
      const formattedReplies = await Promise.all(
        data.map(async (reply) => {
          const { data: reactionsData } = await supabase
            .from('reply_reactions')
            .select('emoji')
            .eq('reply_id', reply.id);

          const reactionCounts: Record<string, number> = {};
          reactionsData?.forEach((r) => {
            reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
          });

          return {
            id: reply.id,
            user_id: reply.user_id,
            content: reply.content,
            is_highlighted: reply.is_highlighted,
            created_at: reply.created_at,
            parent_reply_id: reply.parent_reply_id,
            user_name: reply.profiles?.display_name || 'Anonymous',
            reactions: Object.entries(reactionCounts).map(([emoji, count]) => ({ emoji, count })),
          };
        })
      );

      setReplies((prev) => ({ ...prev, [questionId]: formattedReplies }));
    }
  };

  const subscribeToReplies = () => {
    const channel = supabase
      .channel('discussion_replies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discussion_replies',
        },
        () => {
          if (expandedQuestion) {
            loadReplies(expandedQuestion);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleToggleQuestion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
      loadReplies(questionId);
    }
  };

  const handlePostReply = async (questionId: string) => {
    if (!user || !replyText.trim()) return;

    const { error } = await supabase
      .from('discussion_replies')
      .insert({
        question_id: questionId,
        user_id: user.id,
        content: replyText.trim(),
      });

    if (!error) {
      setReplyText('');
      loadReplies(questionId);
    }
  };

  const handleAddReaction = async (replyId: string, emoji: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('reply_reactions')
      .select('id')
      .eq('reply_id', replyId)
      .eq('user_id', user.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('reply_reactions')
        .delete()
        .eq('id', existing.id);
    } else {
      await supabase
        .from('reply_reactions')
        .insert({
          reply_id: replyId,
          user_id: user.id,
          emoji,
        });
    }

    if (expandedQuestion) {
      loadReplies(expandedQuestion);
    }
  };

  const handlePinQuestion = async (questionId: string, isPinned: boolean) => {
    if (!isLeader) return;

    await supabase
      .from('discussion_questions')
      .update({ is_pinned: !isPinned })
      .eq('id', questionId);

    loadQuestions();
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!isLeader) return;

    Alert.alert('Delete Reply', 'Are you sure you want to delete this reply?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await supabase
            .from('discussion_replies')
            .delete()
            .eq('id', replyId);

          if (expandedQuestion) {
            loadReplies(expandedQuestion);
          }
        },
      },
    ]);
  };

  const handleHighlightReply = async (replyId: string, isHighlighted: boolean) => {
    if (!isLeader) return;

    await supabase
      .from('discussion_replies')
      .update({ is_highlighted: !isHighlighted })
      .eq('id', replyId);

    if (expandedQuestion) {
      loadReplies(expandedQuestion);
    }
  };

  if (loading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Discussion Questions</Text>

      {questions.map((question) => (
        <View key={question.id} style={styles.questionCard}>
          <TouchableOpacity
            style={styles.questionHeader}
            onPress={() => handleToggleQuestion(question.id)}
            activeOpacity={0.7}
          >
            <View style={styles.questionHeaderLeft}>
              {question.is_pinned && (
                <Pin size={16} color="#0EA5E9" fill="#0EA5E9" />
              )}
              <Text style={styles.questionText}>{question.question_text}</Text>
            </View>
            {expandedQuestion === question.id ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {isLeader && (
            <TouchableOpacity
              style={styles.pinButton}
              onPress={() => handlePinQuestion(question.id, question.is_pinned)}
            >
              <Pin size={14} color="#6B7280" />
              <Text style={styles.pinButtonText}>
                {question.is_pinned ? 'Unpin' : 'Pin'}
              </Text>
            </TouchableOpacity>
          )}

          {expandedQuestion === question.id && (
            <View style={styles.repliesContainer}>
              {replies[question.id]?.length > 0 ? (
                <ScrollView style={styles.repliesList}>
                  {replies[question.id].map((reply) => (
                    <View
                      key={reply.id}
                      style={[
                        styles.replyCard,
                        reply.is_highlighted && styles.highlightedReply,
                      ]}
                    >
                      <View style={styles.replyHeader}>
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {reply.user_name.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.replyMeta}>
                          <Text style={styles.replyUserName}>{reply.user_name}</Text>
                          <Text style={styles.replyTime}>
                            {new Date(reply.created_at).toLocaleDateString()}
                          </Text>
                        </View>
                        {isLeader && (
                          <View style={styles.replyActions}>
                            <TouchableOpacity
                              onPress={() =>
                                handleHighlightReply(reply.id, reply.is_highlighted)
                              }
                            >
                              <Star
                                size={16}
                                color={reply.is_highlighted ? '#56F0C3' : '#9CA3AF'}
                                fill={reply.is_highlighted ? '#56F0C3' : 'none'}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteReply(reply.id)}>
                              <Trash2 size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>

                      <Text style={styles.replyContent}>{reply.content}</Text>

                      <View style={styles.reactionBar}>
                        {['❤️', '🙏', '👍', '💡'].map((emoji) => {
                          const reaction = reply.reactions.find((r) => r.emoji === emoji);
                          return (
                            <TouchableOpacity
                              key={emoji}
                              style={styles.reactionButton}
                              onPress={() => handleAddReaction(reply.id, emoji)}
                            >
                              <Text style={styles.reactionEmoji}>{emoji}</Text>
                              {reaction && (
                                <Text style={styles.reactionCount}>{reaction.count}</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyState}>
                  <MessageCircle size={32} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No replies yet. Be the first to share!</Text>
                </View>
              )}

              <View style={styles.replyInputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Share your thoughts..."
                  placeholderTextColor="#9CA3AF"
                  value={replyText}
                  onChangeText={setReplyText}
                  multiline
                />
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={() => handlePostReply(question.id)}
                  disabled={!replyText.trim()}
                >
                  <Send
                    size={20}
                    color={replyText.trim() ? '#2563EB' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  questionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 22,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  pinButtonText: {
    fontSize: 12,
    color: '#6B7280',
  },
  repliesContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  repliesList: {
    maxHeight: 400,
    marginBottom: 12,
  },
  replyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  highlightedReply: {
    backgroundColor: '#DBEAFE',
    borderLeftWidth: 3,
    borderLeftColor: '#56F0C3',
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  replyMeta: {
    flex: 1,
  },
  replyUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  replyTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  replyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 8,
  },
  reactionBar: {
    flexDirection: 'row',
    gap: 8,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  replyInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    padding: 8,
  },
});
