import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { HandHeart, Plus, X, MessageCircle, Lock } from 'lucide-react-native';

type PrayerRequest = {
  id: string;
  user_id: string;
  title: string;
  details: string | null;
  visibility: 'group' | 'leaders_only';
  prayer_count: number;
  created_at: string;
  user_name: string;
  has_prayed: boolean;
};

type Props = {
  groupId: string;
  isLeader: boolean;
};

export default function PrayerRequestsView({ groupId, isLeader }: Props) {
  const { user } = useAuth();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [visibility, setVisibility] = useState<'group' | 'leaders_only'>('group');

  useEffect(() => {
    loadPrayerRequests();
    subscribeToPrayerRequests();
  }, [groupId]);

  const loadPrayerRequests = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('prayer_requests')
      .select(`
        *,
        profiles!prayer_requests_user_id_fkey(display_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });

    if (data) {
      const formatted = await Promise.all(
        data.map(async (pr) => {
          const { data: prayedData } = await supabase
            .from('prayer_responses')
            .select('id')
            .eq('prayer_request_id', pr.id)
            .eq('user_id', user.id)
            .eq('response_type', 'praying')
            .maybeSingle();

          return {
            id: pr.id,
            user_id: pr.user_id,
            title: pr.title,
            details: pr.details,
            visibility: pr.visibility,
            prayer_count: pr.prayer_count,
            created_at: pr.created_at,
            user_name: pr.profiles?.display_name || 'Anonymous',
            has_prayed: !!prayedData,
          };
        })
      );

      setPrayerRequests(formatted);
    }
  };

  const subscribeToPrayerRequests = () => {
    const channel = supabase
      .channel(`prayer_requests:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prayer_requests',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          loadPrayerRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmit = async () => {
    if (!user || !title.trim()) return;

    const { error } = await supabase.from('prayer_requests').insert({
      group_id: groupId,
      user_id: user.id,
      title: title.trim(),
      details: details.trim() || null,
      visibility,
    });

    if (!error) {
      setTitle('');
      setDetails('');
      setVisibility('group');
      setShowModal(false);
      loadPrayerRequests();
    }
  };

  const handlePray = async (prayerRequestId: string, hasPrayed: boolean) => {
    if (!user) return;

    if (hasPrayed) {
      await supabase
        .from('prayer_responses')
        .delete()
        .eq('prayer_request_id', prayerRequestId)
        .eq('user_id', user.id)
        .eq('response_type', 'praying');

      await supabase.rpc('decrement_prayer_count', {
        prayer_id: prayerRequestId,
      });
    } else {
      await supabase.from('prayer_responses').insert({
        prayer_request_id: prayerRequestId,
        user_id: user.id,
        response_type: 'praying',
      });

      await supabase
        .from('prayer_requests')
        .update({ prayer_count: supabase.raw('prayer_count + 1') })
        .eq('id', prayerRequestId);
    }

    loadPrayerRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prayer Requests</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {prayerRequests.length > 0 ? (
          prayerRequests.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.requestHeader}>
                <View style={styles.requestMeta}>
                  <Text style={styles.requestUser}>{request.user_name}</Text>
                  {request.visibility === 'leaders_only' && (
                    <View style={styles.privateBadge}>
                      <Lock size={12} color="#6B7280" />
                      <Text style={styles.privateBadgeText}>Leaders Only</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.requestDate}>
                  {new Date(request.created_at).toLocaleDateString()}
                </Text>
              </View>

              <Text style={styles.requestTitle}>{request.title}</Text>
              {request.details && (
                <Text style={styles.requestDetails}>{request.details}</Text>
              )}

              <View style={styles.requestFooter}>
                <TouchableOpacity
                  style={[
                    styles.prayButton,
                    request.has_prayed && styles.prayButtonActive,
                  ]}
                  onPress={() => handlePray(request.id, request.has_prayed)}
                >
                  <HandHeart
                    size={16}
                    color={request.has_prayed ? '#ffffff' : '#2563EB'}
                    fill={request.has_prayed ? '#ffffff' : 'none'}
                  />
                  <Text
                    style={[
                      styles.prayButtonText,
                      request.has_prayed && styles.prayButtonTextActive,
                    ]}
                  >
                    {request.has_prayed ? "I'm Praying" : 'Pray'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.prayerCount}>
                  <Text style={styles.prayerCountText}>
                    {request.prayer_count} praying
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <HandHeart size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No prayer requests yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share a prayer need</Text>
          </View>
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Prayer Request</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Title"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Details (optional)"
              placeholderTextColor="#9CA3AF"
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={500}
            />

            <View style={styles.visibilityOptions}>
              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'group' && styles.visibilityButtonActive,
                ]}
                onPress={() => setVisibility('group')}
              >
                <Text
                  style={[
                    styles.visibilityButtonText,
                    visibility === 'group' && styles.visibilityButtonTextActive,
                  ]}
                >
                  Share with Group
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.visibilityButton,
                  visibility === 'leaders_only' && styles.visibilityButtonActive,
                ]}
                onPress={() => setVisibility('leaders_only')}
              >
                <Lock size={14} color={visibility === 'leaders_only' ? '#ffffff' : '#6B7280'} />
                <Text
                  style={[
                    styles.visibilityButtonText,
                    visibility === 'leaders_only' && styles.visibilityButtonTextActive,
                  ]}
                >
                  Leaders Only
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !title.trim() && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <Text style={styles.submitButtonText}>Submit Prayer Request</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  requestUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  privateBadgeText: {
    fontSize: 11,
    color: '#6B7280',
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  requestDetails: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  prayButtonActive: {
    backgroundColor: '#2563EB',
  },
  prayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  prayButtonTextActive: {
    color: '#ffffff',
  },
  prayerCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerCountText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  visibilityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  visibilityButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  visibilityButtonTextActive: {
    color: '#ffffff',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
});
