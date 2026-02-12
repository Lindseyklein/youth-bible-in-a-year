import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Check, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PurchasesPackage, PurchasesOffering } from 'react-native-purchases';
import { 
  getOfferings, 
  purchase, 
  getCustomerInfo, 
  restorePurchases, 
  isPremium 
} from '@/lib/purchases';

export default function SubscribeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    checkExistingSubscription();
    loadOfferings();
  }, []);

  const checkExistingSubscription = async () => {
    try {
      const customerInfo = await getCustomerInfo();
      setIsPremiumUser(isPremium(customerInfo));
      
      // If user already has premium, redirect to app
      if (isPremium(customerInfo)) {
        router.replace('/(tabs)');
        return;
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const offering = await getOfferings();
      
      if (!offering) {
        Alert.alert(
          'No Offerings Available',
          'Unable to load subscription options. Please check your internet connection and try again.'
        );
        return;
      }

      setOfferings(offering);
      
      // Filter and sort packages (monthly and yearly)
      const availablePackages = offering.availablePackages.filter(
        (pkg) => pkg.packageType === 'MONTHLY' || pkg.packageType === 'ANNUAL'
      ).sort((a, b) => {
        // Sort: ANNUAL first, then MONTHLY
        if (a.packageType === 'ANNUAL') return -1;
        if (b.packageType === 'ANNUAL') return 1;
        return 0;
      });

      setPackages(availablePackages);
    } catch (error: any) {
      console.error('Error loading offerings:', error);
      Alert.alert(
        'Error Loading Packages',
        error.message || 'Unable to load subscription packages. Please try again later.'
      );
    }
  };

  const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
    if (!user) {
      Alert.alert('Please Sign In', 'You need to be signed in to make a purchase.');
      router.replace('/auth/sign-in');
      return;
    }

    setLoading(true);

    try {
      const customerInfo = await purchase(packageToPurchase);
      setIsPremiumUser(isPremium(customerInfo));

      Alert.alert(
        'Purchase Successful!',
        'Thank you for your subscription. You now have access to all premium features.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // User cancellation is handled gracefully, no need to show error
      if (error.message === 'Purchase was cancelled by user') {
        return;
      }

      Alert.alert(
        'Purchase Failed',
        error.message || 'Unable to complete purchase. Please try again or contact support if the problem persists.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    if (!user) {
      Alert.alert('Please Sign In', 'You need to be signed in to restore purchases.');
      return;
    }

    setRestoring(true);

    try {
      const customerInfo = await restorePurchases();
      const hasPremium = isPremium(customerInfo);
      setIsPremiumUser(hasPremium);

      if (hasPremium) {
        Alert.alert(
          'Purchases Restored',
          'Your previous purchases have been restored successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'We couldn\'t find any purchases to restore. If you believe this is an error, please contact support.'
        );
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      Alert.alert(
        'Restore Failed',
        error.message || 'Unable to restore purchases. Please try again or contact support if the problem persists.'
      );
    } finally {
      setRestoring(false);
    }
  };

  const getPackageTitle = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === 'ANNUAL') return 'Premium Annual';
    if (pkg.packageType === 'MONTHLY') return 'Premium Monthly';
    return pkg.identifier;
  };

  const getPackagePeriod = (pkg: PurchasesPackage): string => {
    if (pkg.packageType === 'ANNUAL') return '/year';
    if (pkg.packageType === 'MONTHLY') return '/month';
    return '';
  };

  if (checkingSubscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  if (isPremiumUser) {
    return (
      <View style={styles.loadingContainer}>
        <Check size={64} color="#10B981" />
        <Text style={styles.successText}>You already have premium access!</Text>
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

      {packages.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No subscription packages available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadOfferings}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {packages.map((pkg) => (
            <View key={pkg.identifier} style={styles.pricingCard}>
              <View style={styles.pricingHeader}>
                <Text style={styles.planName}>{getPackageTitle(pkg)}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{pkg.product.priceString}</Text>
                  <Text style={styles.pricePeriod}>{getPackagePeriod(pkg)}</Text>
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
                onPress={() => handlePurchase(pkg)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                )}
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.restoreButton, (loading || restoring) && styles.buttonDisabled]}
              onPress={handleRestorePurchases}
              disabled={loading || restoring}
            >
              {restoring ? (
                <ActivityIndicator color="#2563EB" />
              ) : (
                <>
                  <RefreshCw size={16} color="#2563EB" />
                  <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Cancel anytime. Subscriptions will auto-renew unless cancelled.
            </Text>
          </View>
        </>
      )}
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
    marginTop: 24,
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
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 12,
  },
  restoreButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '600',
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
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
