import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ParentConsent() {
  const { token } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [consent, setConsent] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadConsentInfo();
  }, [token]);

  const calculateAge = (birthdate: string): number => {
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const loadConsentInfo = async () => {
    if (!token || typeof token !== 'string') {
      setError('Invalid consent link');
      setLoading(false);
      return;
    }

    try {
      const { data: consentData, error: consentError } = await supabase
        .from('parental_consents')
        .select('*')
        .eq('consent_token', token)
        .maybeSingle();

      if (consentError || !consentData) {
        setError('Consent request not found or has expired');
        setLoading(false);
        return;
      }

      if (consentData.consent_status !== 'pending') {
        setError(`This consent has already been ${consentData.consent_status}`);
        setLoading(false);
        return;
      }

      const expiresAt = new Date(consentData.expires_at);
      if (expiresAt < new Date()) {
        setError('This consent link has expired');
        setLoading(false);
        return;
      }

      setConsent(consentData);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, email, birthdate')
        .eq('id', consentData.user_id)
        .maybeSingle();

      if (!profileError && profileData) {
        setProfile(profileData);
      }
    } catch (err) {
      setError('Failed to load consent information');
    } finally {
      setLoading(false);
    }
  };

  const handleConsent = async (approved: boolean) => {
    if (!consent) return;

    setSubmitting(true);
    setError('');

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/confirm-parental-consent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          token,
          approved,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to update consent status');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading consent information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Thank you!</Text>
        <Text style={styles.successText}>
          Your consent has been recorded.
        </Text>
        <Text style={styles.successSubtext}>
          You may close this page.
        </Text>
      </View>
    );
  }

  const childAge = profile?.birthdate ? calculateAge(profile.birthdate) : null;

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Bible in a Year</Text>

      <Text style={styles.title}>Parental Consent</Text>

      {profile && (
        <View style={styles.consentBox}>
          <Text style={styles.consentText}>
            You are confirming that you give permission for{' '}
            <Text style={styles.boldText}>{profile.display_name}</Text>
            {childAge && <Text>, age {childAge},</Text>} to use this app.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.approveButton]}
        onPress={() => handleConsent(true)}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>YES, I GIVE CONSENT</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.denyLink}
        onPress={() => handleConsent(false)}
        disabled={submitting}
      >
        <Text style={styles.denyLinkText}>
          No, I do not give consent
        </Text>
      </TouchableOpacity>
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
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 40,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  consentBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '100%',
    maxWidth: 500,
  },
  consentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '700',
    color: '#1a1a1a',
  },
  button: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  approveButton: {
    backgroundColor: '#2563EB',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  denyLink: {
    padding: 12,
  },
  denyLinkText: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  successIcon: {
    fontSize: 72,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
