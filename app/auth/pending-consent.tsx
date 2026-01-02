import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function PendingConsent() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    checkConsentStatus();
    const interval = setInterval(checkConsentStatus, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const checkConsentStatus = async () => {
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('parental_consent_obtained, requires_parental_consent, display_name')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);

        if (profileData.parental_consent_obtained) {
          router.replace('/auth/verify-email');
          return;
        }

        if (!profileData.requires_parental_consent) {
          router.replace('/auth/verify-email');
          return;
        }
      }

      const { data: consentData } = await supabase
        .from('parental_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (consentData) {
        setConsent(consentData);

        if (consentData.consent_status === 'approved') {
          router.replace('/auth/verify-email');
        } else if (consentData.consent_status === 'denied') {
          router.replace('/auth/consent-denied');
        }
      }
    } catch (err) {
      console.error('Error checking consent status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/sign-in');
  };

  const handleResendEmail = async () => {
    if (!consent || !profile || !user) return;

    setResending(true);
    setResendMessage('');

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/send-parental-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          parentEmail: consent.parent_email,
          userEmail: profile.email || user.email,
          displayName: profile.display_name,
          consentToken: consent.consent_token,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage('Consent email resent successfully!');
      } else {
        setResendMessage('Failed to resend email. Please try again.');
      }
    } catch (err) {
      console.error('Error resending consent email:', err);
      setResendMessage('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
      setTimeout(() => setResendMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⏳</Text>
      <Text style={styles.title}>Your account requires parental consent</Text>

      <Text style={styles.text}>
        We're waiting for your parent or guardian to click the consent link we emailed them.
      </Text>

      {consent && (
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>We sent an email to:</Text>
          <Text style={styles.infoValue}>{consent.parent_email}</Text>
        </View>
      )}

      {resendMessage && (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{resendMessage}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendEmail}
        disabled={resending}
      >
        {resending ? (
          <ActivityIndicator color="#2563EB" />
        ) : (
          <Text style={styles.resendButtonText}>Resend consent email</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.refreshButton} onPress={checkConsentStatus}>
        <Text style={styles.refreshButtonText}>Check Status Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.checkingText}>
        We're automatically checking for approval every 10 seconds
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FFFE',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  messageBox: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  messageText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
  },
  resendButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  resendButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
  },
  checkingText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  refreshButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  signOutButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  supportText: {
    fontSize: 12,
    color: '#999',
    marginTop: 24,
    textAlign: 'center',
  },
});
