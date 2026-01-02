import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const { token } = useLocalSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [userId, setUserId] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token || typeof token !== 'string') {
      setError('Invalid reset link');
      setIsLoading(false);
      return;
    }

    try {
      const { data: resetToken, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('*')
        .eq('reset_token', token)
        .single();

      if (tokenError || !resetToken) {
        setError('Invalid or expired reset link');
        setIsLoading(false);
        return;
      }

      if (resetToken.used_at) {
        setError('This reset link has already been used');
        setIsLoading(false);
        return;
      }

      const expiresAt = new Date(resetToken.expires_at);
      if (expiresAt < new Date()) {
        setError('This reset link has expired');
        setIsLoading(false);
        return;
      }

      setTokenValid(true);
      setUserId(resetToken.user_id);
    } catch (err) {
      setError('Failed to validate reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password }
      );

      if (updateError) {
        setError('Failed to update password. Please try again.');
        setIsSubmitting(false);
        return;
      }

      const { error: tokenUpdateError } = await supabase
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('reset_token', token);

      if (tokenUpdateError) {
        console.error('Failed to mark token as used:', tokenUpdateError);
      }

      setSuccess(true);
      setTimeout(() => {
        router.replace('/auth/sign-in');
      }, 2000);
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Validating reset link...</Text>
      </View>
    );
  }

  if (!tokenValid) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Invalid Link</Text>
        <Text style={styles.errorText}>{error}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/auth/forgot-password')}
        >
          <Text style={styles.buttonText}>Request New Link</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (success) {
    return (
      <View style={styles.container}>
        <Text style={styles.successIcon}>✓</Text>
        <Text style={styles.successTitle}>Password Reset!</Text>
        <Text style={styles.successText}>
          Your password has been successfully reset. Redirecting to sign in...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>Enter your new password below</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="New Password (min 6 characters)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor="#999"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleResetPassword}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Reset Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/auth/sign-in')}>
        <Text style={styles.link}>Back to Sign In</Text>
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
  error: {
    color: '#dc2626',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
