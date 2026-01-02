import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

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
      const { data: stripeSubscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .eq('user_id', session.user.id)
        .maybeSingle();

      let hasSubscription = false;

      if (stripeSubscription) {
        const status = stripeSubscription.subscription_status;
        hasSubscription = status === 'active' || status === 'trialing';
      } else {
        const { data: profile } = await supabase
          .from('profiles')
          .select('requires_parental_consent, parental_consent_obtained, subscription_status, subscription_ends_at')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile) {
          const needsConsent = profile.requires_parental_consent && !profile.parental_consent_obtained;
          setRequiresConsent(needsConsent);

          const subscriptionStatus = profile.subscription_status || 'none';
          hasSubscription = subscriptionStatus === 'trial' || subscriptionStatus === 'active';

          if (profile.subscription_ends_at && subscriptionStatus === 'active') {
            const endsAt = new Date(profile.subscription_ends_at);
            if (endsAt < new Date()) {
              hasSubscription = false;
            }
          }
        }
      }

      if (!hasSubscription && retryCount < 3) {
        setTimeout(() => checkProfile(retryCount + 1), 2000);
        if (retryCount === 0) {
          setHasActiveSubscription(false);
          setProfileChecked(true);
        }
        return;
      }

      setHasActiveSubscription(hasSubscription);
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
    } else if (session && !requiresConsent && hasActiveSubscription && segments.length === 0) {
      router.replace('/(tabs)');
    } else if (session && !requiresConsent && hasActiveSubscription && inAuthGroup && !isPendingConsent) {
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

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}
