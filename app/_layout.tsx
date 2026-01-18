import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { configurePurchases } from '@/lib/purchases';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [profileChecked, setProfileChecked] = useState(false);
  const [requiresConsent, setRequiresConsent] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    if (session && !profileChecked) {
      checkProfile();
    } else if (!session) {
      setProfileChecked(false);
      setRequiresConsent(false);
      setHasActiveSubscription(false);
    }
  }, [session]);

  const checkProfile = async (retryCount = 0) => {
    if (!session?.user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('requires_parental_consent, parental_consent_obtained, subscription_status, subscription_ends_at')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profile) {
        const needsConsent = profile.requires_parental_consent && !profile.parental_consent_obtained;
        setRequiresConsent(needsConsent);

        // Check profile subscription status (IAP not wired yet, so allow access)
        const subscriptionStatus = profile.subscription_status || 'none';
        const hasSubscription = subscriptionStatus === 'trial' || subscriptionStatus === 'active';

        if (profile.subscription_ends_at && subscriptionStatus === 'active') {
          const endsAt = new Date(profile.subscription_ends_at);
          if (endsAt >= new Date()) {
            setHasActiveSubscription(true);
          } else {
            setHasActiveSubscription(false);
          }
        } else {
          // For now, allow access without blocking on subscription (IAP stub)
          setHasActiveSubscription(hasSubscription);
        }
      }
    } catch (err) {
      console.error('Error checking profile:', err);
    } finally {
      setProfileChecked(true);
    }
  };

  useEffect(() => {
    if (loading || (session && !profileChecked)) return;

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const isParentConsent = segments[0] === 'auth' && segments[1] === 'parent-consent';
    const isPendingConsent = segments[0] === 'auth' && segments[1] === 'pending-consent';

    if (isParentConsent) {
      return;
    }

    if (session && requiresConsent && !isPendingConsent) {
      router.replace('/auth/pending-consent');
      return;
    }

    if (isPendingConsent && session && !requiresConsent) {
      router.replace('/(tabs)');
      return;
    }

    if (!session && inTabsGroup) {
      router.replace('/');
    } else if (session && !requiresConsent && segments.length === 0) {
      router.replace('/(tabs)');
    } else if (session && !requiresConsent && inAuthGroup && !isPendingConsent) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments, profileChecked, requiresConsent, hasActiveSubscription]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="auth/sign-in" />
      <Stack.Screen name="auth/sign-up" />
      <Stack.Screen name="auth/parent-consent" />
      <Stack.Screen name="auth/pending-consent" />
      <Stack.Screen name="auth/subscribe" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function RevenueCatInitializer() {
  const { session, loading } = useAuth();
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    // Only configure once on mount, don't block rendering
    if (configured) return;

    // Configure RevenueCat asynchronously without blocking
    const initRevenueCat = async () => {
      try {
        // If user is logged in, use their user ID; otherwise configure anonymously
        const userId = session?.user?.id;
        await configurePurchases(userId);
        setConfigured(true);
      } catch (error) {
        // Log error but don't block app rendering
        console.error('Failed to configure RevenueCat on app boot:', error);
        // Still mark as configured to avoid retrying repeatedly
        setConfigured(true);
      }
    };

    // Don't wait for auth to finish loading - configure anonymously first if needed
    if (!loading) {
      initRevenueCat();
    }
  }, [session, loading, configured]);

  // Re-configure when session changes (user logs in/out)
  useEffect(() => {
    if (configured && !loading) {
      const userId = session?.user?.id;
      // Re-configure with user ID if logged in, or update to anonymous if logged out
      configurePurchases(userId).catch((error) => {
        console.error('Failed to re-configure RevenueCat after auth change:', error);
      });
    }
  }, [session?.user?.id, configured, loading]);

  // This component doesn't render anything
  return null;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RevenueCatInitializer />
      <RootLayoutNav />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
