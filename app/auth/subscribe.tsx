import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function SubscribeScreen() {
  const { user } = useAuth();
  const { success, canceled } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    if (success === 'true') {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1000);
    }
  }, [success]);

  useEffect(() => {
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    if (!user) {
      setCheckingSubscription(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.subscription_status === 'active' || data?.subscription_status === 'trialing') {
        router.replace('/(tabs)');
        return;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }

    setCheckingSubscription(false);
  };

  const handleSubscribe = async () => {
    if (!user) {
      router.replace('/auth/sign-in');
      return;
    }

    setLoading(true);

    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      if (!token) {
        throw new Error('No authentication token found');
      }

      const currentUrl = Platform.OS === 'web' ? window.location.origin : '';
      const successUrl = Platform.OS === 'web' ? `${currentUrl}/auth/subscribe?success=true` : undefined;
      const cancelUrl = Platform.OS === 'web' ? `${currentUrl}/auth/subscribe?canceled=true` : undefined;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID,
            success_url: successUrl,
            cancel_url: cancelUrl,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.url) {
        if (Platform.OS === 'web') {
          window.location.href = data.url;
        } else {
          const { WebBrowser } = await import('expo-web-browser');
          await WebBrowser.openBrowserAsync(data.url);
        }
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(`Error: ${error.message || 'Failed to start checkout process'}`);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSubscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (success === 'true') {
    return (
      <View style={styles.loadingContainer}>
        <Check size={64} color="#10B981" />
        <Text style={styles.successText}>Payment successful!</Text>
        <Text style={styles.successSubtext}>Redirecting to app...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Unlock the full Bible reading experience
        </Text>
      </LinearGradient>

      {canceled === 'true' && (
        <View style={styles.canceledBanner}>
          <Text style={styles.canceledText}>Payment was canceled. You can try again below.</Text>
        </View>
      )}

      <View style={styles.pricingCard}>
        <View style={styles.pricingHeader}>
          <Text style={styles.planName}>Premium Annual</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>$24.99</Text>
            <Text style={styles.pricePeriod}>/year</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Complete chronological Bible plan</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Daily reading reminders</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Group Bible study features</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Discussion questions & reflections</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Prayer requests & gratitude journal</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>Track your spiritual growth</Text>
          </View>
          <View style={styles.feature}>
            <Check size={20} color="#10B981" />
            <Text style={styles.featureText}>No ads, ever</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Cancel anytime.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: '#2563EB',
  },
  pricePeriod: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#4B5563',
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  successText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  successSubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  canceledBanner: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 12,
  },
  canceledText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
});
