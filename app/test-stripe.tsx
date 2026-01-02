import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function TestStripeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const STRIPE_PRICE_ID = process.env.EXPO_PUBLIC_STRIPE_PRICE_ID || 'price_1234567890';

  const testConfiguration = () => {
    const config = {
      priceId: STRIPE_PRICE_ID,
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      hasUser: !!user,
      userEmail: user?.email,
    };
    setResult({ type: 'config', data: config });
    setError('');
  };

  const testCheckoutCreation = async () => {
    if (!user) {
      setError('Not logged in');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('No auth token');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: STRIPE_PRICE_ID,
            mode: 'subscription',
            success_url: 'http://localhost:8081/test-stripe?success=true',
            cancel_url: 'http://localhost:8081/test-stripe?canceled=true',
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({ type: 'success', data });
      } else {
        setError(`Error ${response.status}: ${JSON.stringify(data)}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSubscriptionQuery = async () => {
    if (!user) {
      setError('Not logged in');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: queryError } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (queryError) {
        setError(`Query error: ${queryError.message}`);
      } else {
        setResult({ type: 'subscription', data: data || 'No subscription found' });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Stripe Integration Test</Text>
        <Text style={styles.subtitle}>Debug your Stripe configuration</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testConfiguration}
          >
            <Text style={styles.buttonText}>Check Configuration</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Checkout Creation</Text>
          <Text style={styles.description}>
            This will attempt to create a Stripe checkout session
          </Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testCheckoutCreation}
            disabled={loading || !user}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Test Checkout</Text>
            )}
          </TouchableOpacity>
          {!user && (
            <Text style={styles.warning}>You must be logged in to test</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Subscription Query</Text>
          <Text style={styles.description}>
            Check if subscription data exists in database
          </Text>
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={testSubscriptionQuery}
            disabled={loading || !user}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Query Subscription</Text>
            )}
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Error:</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Result ({result.type}):</Text>
            <Text style={styles.resultText}>{JSON.stringify(result.data, null, 2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: '#1E3A8A',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#7F1D1D',
    fontFamily: 'monospace',
  },
  resultBox: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#93C5FD',
    marginTop: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  resultText: {
    fontSize: 12,
    color: '#1E40AF',
    fontFamily: 'monospace',
  },
});
