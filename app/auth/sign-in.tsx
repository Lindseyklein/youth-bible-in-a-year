import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');
    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('requires_parental_consent, parental_consent_obtained')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        if (profile.requires_parental_consent && !profile.parental_consent_obtained) {
          setIsLoading(false);
          router.replace('/auth/pending-consent');
          return;
        }
      }

      const { data: stripeSubscription } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!stripeSubscription ||
          (stripeSubscription.subscription_status !== 'active' &&
           stripeSubscription.subscription_status !== 'trialing')) {

        try {
          const session = await supabase.auth.getSession();
          const token = session.data.session?.access_token;

          if (!token) {
            throw new Error('No authentication token found');
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
                price_id: process.env.EXPO_PUBLIC_STRIPE_PRICE_ID,
              }),
            }
          );

          const data = await response.json();

          if (response.ok && data.url) {
            setIsLoading(false);
            if (Platform.OS === 'web') {
              window.location.href = data.url;
            } else {
              const { WebBrowser } = await import('expo-web-browser');
              await WebBrowser.openBrowserAsync(data.url);
            }
            return;
          } else {
            throw new Error(data.error || 'Failed to create checkout session');
          }
        } catch (checkoutError: any) {
          console.error('Checkout error:', checkoutError);
          setError(`Payment setup failed: ${checkoutError.message}`);
          setIsLoading(false);
          return;
        }
      }
    }

    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bible in a Year</Text>
      <Text style={styles.subtitle}>Sign in to continue your journey</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/forgot-password')}>
        <Text style={styles.forgotLink}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/sign-up')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#F8FFFE',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  forgotLink: {
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  error: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
});
