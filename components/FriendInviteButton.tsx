import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { X, UserPlus, Send, Mail, Phone, Users } from 'lucide-react-native';
import * as Contacts from 'expo-contacts';
import { supabase } from '@/lib/supabase';

type FriendInviteButtonProps = {
  trigger?: React.ReactNode;
};

type InviteMethod = 'email' | 'phone';

export default function FriendInviteButton({ trigger }: FriendInviteButtonProps) {
  const [visible, setVisible] = useState(false);
  const [inviteMethod, setInviteMethod] = useState<InviteMethod>('email');
  const [friendEmail, setFriendEmail] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePickContact = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Contact picker is only available on mobile devices');
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your contacts to use this feature');
      return;
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });

    if (data.length > 0) {
      const contact = data[0];
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        const phoneNumber = contact.phoneNumbers[0].number?.replace(/\D/g, '');
        if (phoneNumber) {
          setFriendPhone(phoneNumber);
        }
      }
    }
  };

  const handleSendInvite = async () => {
    if (inviteMethod === 'email' && !friendEmail) {
      Alert.alert('Error', 'Please enter your friend\'s email address');
      return;
    }

    if (inviteMethod === 'phone' && !friendPhone) {
      Alert.alert('Error', 'Please enter your friend\'s phone number');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Error', 'You must be logged in to send invites');
      setLoading(false);
      return;
    }

    const inviteData: any = {
      inviter_id: user.id,
      status: 'pending',
    };

    if (inviteMethod === 'email') {
      inviteData.invitee_email = friendEmail;
    } else {
      inviteData.invitee_phone = friendPhone;
    }

    const { error } = await supabase
      .from('user_invites')
      .insert(inviteData);

    if (error) {
      setLoading(false);
      Alert.alert('Error', error.message);
      return;
    }

    try {
      console.log('Fetching user profile...');
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .maybeSingle();

      const inviterName = profile?.display_name || 'Your friend';
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      console.log('Calling edge function with:', {
        method: inviteMethod,
        to: inviteMethod === 'email' ? friendEmail : friendPhone,
        inviterName,
        url: `${supabaseUrl}/functions/v1/send-invite`,
      });

      const response = await fetch(`${supabaseUrl}/functions/v1/send-invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: inviteMethod,
          to: inviteMethod === 'email' ? friendEmail : friendPhone,
          inviterName,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      let result;
      try {
        const responseText = await response.text();
        console.log('Response text:', responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        Alert.alert(
          'Error',
          'Received invalid response from server. Please try again.'
        );
        setLoading(false);
        return;
      }

      console.log('Parsed result:', result);

      if (!result.success) {
        console.error('Edge function error:', result);
        Alert.alert(
          'Error Sending Invite',
          result.error || 'Failed to send invite. Please check the details and try again.'
        );
        setLoading(false);
        return;
      }

      Alert.alert(
        'Invite Sent!',
        `We've sent ${inviteMethod === 'email' ? 'an email' : 'a text message'} to ${inviteMethod === 'email' ? friendEmail : friendPhone}. When they sign up, you'll automatically become friends!`
      );

      setFriendEmail('');
      setFriendPhone('');
      setVisible(false);
    } catch (err) {
      console.error('Error sending invite:', err);
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to send invite. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        {trigger || (
          <View style={styles.defaultTrigger}>
            <UserPlus size={20} color="#2563EB" />
            <Text style={styles.defaultTriggerText}>Invite Friends</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Invite Friends</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeButton}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.subtitle}>
              Invite friends to join you on the Bible reading journey and start weekly discussions together!
            </Text>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, inviteMethod === 'email' && styles.activeTab]}
                onPress={() => setInviteMethod('email')}
              >
                <Mail size={20} color={inviteMethod === 'email' ? '#2563EB' : '#666'} />
                <Text style={[styles.tabText, inviteMethod === 'email' && styles.activeTabText]}>
                  Email
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, inviteMethod === 'phone' && styles.activeTab]}
                onPress={() => setInviteMethod('phone')}
              >
                <Phone size={20} color={inviteMethod === 'phone' ? '#2563EB' : '#666'} />
                <Text style={[styles.tabText, inviteMethod === 'phone' && styles.activeTabText]}>
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {inviteMethod === 'email' ? (
              <TextInput
                style={styles.input}
                placeholder="Friend's email address"
                placeholderTextColor="#999"
                value={friendEmail}
                onChangeText={setFriendEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Friend's phone number"
                  placeholderTextColor="#999"
                  value={friendPhone}
                  onChangeText={setFriendPhone}
                  keyboardType="phone-pad"
                />

                {Platform.OS !== 'web' && (
                  <TouchableOpacity
                    style={styles.contactButton}
                    onPress={handlePickContact}
                  >
                    <Users size={20} color="#2563EB" />
                    <Text style={styles.contactButtonText}>Pick from Contacts</Text>
                  </TouchableOpacity>
                )}
              </>
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
                  <Send size={20} color="#fff" />
                  <Text style={styles.sendButtonText}>Send Invite</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How It Works</Text>
              <Text style={styles.infoText}>
                1. Enter your friend's email or phone{'\n'}
                2. Tap "Send Invite"{'\n'}
                3. When they sign up with that contact, you're automatically friends!{'\n'}
                4. Start groups and grow in faith together!
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  defaultTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
  },
  defaultTriggerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563EB',
  },
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
  tabContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
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
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563EB',
    marginBottom: 16,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
