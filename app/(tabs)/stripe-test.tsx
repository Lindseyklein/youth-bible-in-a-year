import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Package, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function StripeTestScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [orderData, setOrderData] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadStripeData();
    }
  }, [user]);

  const loadStripeData = async () => {
    // Stripe data loading removed - IAP not wired yet
    setSubscriptionData(null);
    setOrderData([]);
  };

  const handleSubscriptionCheckout = async () => {
    setLoading(true);
    // Temporary stub for IAP purchase
    const startPurchase = () => {
      console.log('IAP not wired yet');
    };
    startPurchase();
    Alert.alert('Info', 'IAP not wired yet');
    setLoading(false);
  };

  const handleOneTimePayment = async () => {
    setLoading(true);
    // Temporary stub for IAP purchase
    const startPurchase = () => {
      console.log('IAP not wired yet');
    };
    startPurchase();
    Alert.alert('Info', 'IAP not wired yet');
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#3B82F6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Stripe Integration Test</Text>
        <Text style={styles.headerSubtitle}>Test payment flows and view data</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Checkouts</Text>
          <Text style={styles.note}>
            Note: Update testPriceId with your actual Stripe Price ID
          </Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubscriptionCheckout}
            disabled={loading}
          >
            <CreditCard size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Test Subscription Checkout'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, loading && styles.buttonDisabled]}
            onPress={handleOneTimePayment}
            disabled={loading}
          >
            <Package size={20} color="#FFF" />
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Test One-Time Payment'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Stripe Data</Text>
            <TouchableOpacity onPress={loadStripeData}>
              <RefreshCw size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataTitle}>Subscription Status</Text>
            {subscriptionData ? (
              <>
                <Text style={styles.dataText}>
                  Status: {subscriptionData.subscription_status || 'None'}
                </Text>
                {subscriptionData.subscription_id && (
                  <>
                    <Text style={styles.dataText}>
                      Subscription ID: {subscriptionData.subscription_id}
                    </Text>
                    <Text style={styles.dataText}>
                      Price ID: {subscriptionData.price_id}
                    </Text>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.dataTextMuted}>No subscription data</Text>
            )}
          </View>

          <View style={styles.dataCard}>
            <Text style={styles.dataTitle}>Orders</Text>
            {orderData.length > 0 ? (
              orderData.map((order, index) => (
                <View key={index} style={styles.orderItem}>
                  <Text style={styles.dataText}>
                    Amount: ${(order.amount_total / 100).toFixed(2)} {order.currency.toUpperCase()}
                  </Text>
                  <Text style={styles.dataText}>
                    Status: {order.order_status}
                  </Text>
                  <Text style={styles.dataTextSmall}>
                    {new Date(order.order_date).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.dataTextMuted}>No orders yet</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Setup Instructions</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>IAP integration not yet implemented</Text>
            <Text style={styles.infoText}>Stripe has been removed from the codebase</Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  note: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  buttonSecondary: {
    backgroundColor: '#10B981',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dataCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  dataTextSmall: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dataTextMuted: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  orderItem: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  infoCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  infoText: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
    lineHeight: 20,
  },
});
