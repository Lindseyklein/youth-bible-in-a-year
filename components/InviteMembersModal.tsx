import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, Mail, Phone, Copy, UserPlus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type Invite = {
  id: string;
  invitee_email: string | null;
  invitee_phone: string | null;
  invite_code: string;
  status: string;
  created_at: string;
};

type InviteMembersModalProps = {
  visible: boolean;
  onClose: () => void;
  groupId?: string;
};

export default function InviteMembersModal({ visible, onClose, groupId }: InviteMembersModalProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inviteMethod, setInviteMethod] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [sentInvites, setSentInvites] = useState<Invite[]>([]);
  const [showInvites, setShowInvites] = useState(false);

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 12).toUpperCase();
  };

  const handleSendInvite = async () => {
    if (inviteMethod === 'email' && !email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (inviteMethod === 'phone' && !phone) {
      Alert.alert('Error', 'Please enter a phone number');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'You must be logged in to send invites');
      setLoading(false);
      return;
    }

    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from('user_invites')
      .insert({
        inviter_id: user.id,
        invitee_email: inviteMethod === 'email' ? email : null,
        invitee_phone: inviteMethod === 'phone' ? phone : null,
        invite_code: inviteCode,
        group_id: groupId || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    const inviterName = profileData?.full_name || 'Your friend';

    try {
      const functionUrl = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/send-invite`;
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionData.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: inviteMethod,
          to: inviteMethod === 'email' ? email : phone,
          inviterName,
        }),
      });

      const result = await response.json();

      setLoading(false);

      if (!response.ok || !result.success) {
        Alert.alert(
          'Invite Created',
          `Invite code: ${inviteCode}\n\nCouldn't send ${inviteMethod} automatically. Please share this code manually with ${inviteMethod === 'email' ? email : phone}.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invite Sent!',
          `Successfully sent invite to ${inviteMethod === 'email' ? email : phone}!\n\nInvite code: ${inviteCode}`,
          [{ text: 'OK' }]
        );
      }
    } catch (sendError) {
      setLoading(false);
      Alert.alert(
        'Invite Created',
        `Invite code: ${inviteCode}\n\nCouldn't send ${inviteMethod} automatically. Please share this code manually with ${inviteMethod === 'email' ? email : phone}.`,
        [{ text: 'OK' }]
      );
    }

    setEmail('');
    setPhone('');
    loadSentInvites();
  };

  const loadSentInvites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_invites')
      .select('*')
      .eq('inviter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setSentInvites(data);
    }
  };

  const copyInviteCode = (code: string) => {
    Alert.alert('Copied', `Invite code ${code} copied!`);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Invite Youth Members</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Invite teens to join your group by sending them an invite code
          </Text>

          <View style={styles.methodSelector}>
            <TouchableOpacity
              style={[styles.methodOption, inviteMethod === 'email' && styles.methodOptionSelected]}
              onPress={() => setInviteMethod('email')}
            >
              <Mail size={20} color={inviteMethod === 'email' ? '#2563EB' : '#666'} />
              <Text style={[styles.methodText, inviteMethod === 'email' && styles.methodTextSelected]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.methodOption, inviteMethod === 'phone' && styles.methodOptionSelected]}
              onPress={() => setInviteMethod('phone')}
            >
              <Phone size={20} color={inviteMethod === 'phone' ? '#2563EB' : '#666'} />
              <Text style={[styles.methodText, inviteMethod === 'phone' && styles.methodTextSelected]}>
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {inviteMethod === 'email' ? (
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor="#999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          )}

          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendInvite}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <UserPlus size={20} color="#fff" />
                <Text style={styles.sendButtonText}>Send Invite</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.viewInvitesButton}
            onPress={() => {
              setShowInvites(!showInvites);
              if (!showInvites) loadSentInvites();
            }}
          >
            <Text style={styles.viewInvitesText}>
              {showInvites ? 'Hide' : 'View'} Sent Invites
            </Text>
          </TouchableOpacity>

          {showInvites && (
            <View style={styles.invitesList}>
              {sentInvites.length === 0 ? (
                <Text style={styles.noInvitesText}>No invites sent yet</Text>
              ) : (
                sentInvites.map((invite) => (
                  <View key={invite.id} style={styles.inviteCard}>
                    <View style={styles.inviteInfo}>
                      <Text style={styles.inviteContact}>
                        {invite.invitee_email || invite.invitee_phone}
                      </Text>
                      <View style={styles.inviteCodeContainer}>
                        <Text style={styles.inviteCodeLabel}>Code:</Text>
                        <Text style={styles.inviteCode}>{invite.invite_code}</Text>
                        <TouchableOpacity onPress={() => copyInviteCode(invite.invite_code)}>
                          <Copy size={16} color="#2563EB" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.inviteStatus}>{invite.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  methodOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  methodTextSelected: {
    color: '#2563EB',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  viewInvitesButton: {
    padding: 16,
    alignItems: 'center',
  },
  viewInvitesText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  invitesList: {
    marginTop: 16,
  },
  noInvitesText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  inviteCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inviteInfo: {
    gap: 8,
  },
  inviteContact: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inviteCodeLabel: {
    fontSize: 14,
    color: '#666',
  },
  inviteCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: 'monospace',
  },
  inviteStatus: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
});
