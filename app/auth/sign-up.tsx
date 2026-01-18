import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignUp() {
  const { ageGroup: routeAgeGroup } = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [userRole, setUserRole] = useState<'youth_member' | 'youth_leader'>('youth_member');
  const [birthdate, setBirthdate] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [showParentEmail, setShowParentEmail] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();

  const calculateAge = (birthdateStr: string): number | null => {
    if (!birthdateStr || birthdateStr.length !== 10) return null;

    const parts = birthdateStr.split('-');
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    if (year < 1900 || year > new Date().getFullYear()) return null;

    const birthDate = new Date(year, month, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    if (birthdate.length === 10) {
      const age = calculateAge(birthdate);
      setCalculatedAge(age);

      if (age !== null && age >= 13 && age < 18) {
        setShowParentEmail(true);
      } else {
        setShowParentEmail(false);
        setParentEmail('');
      }
    } else {
      setCalculatedAge(null);
      setShowParentEmail(false);
    }
  }, [birthdate]);

  const handleSignUp = async () => {
    if (!email || !password || !username || !displayName) {
      setError('Please fill in all fields');
      return;
    }

    if (!birthdate) {
      setError('Please enter your birthdate');
      return;
    }

    if (calculatedAge === null) {
      setError('Please enter a valid birthdate (YYYY-MM-DD)');
      return;
    }

    if (calculatedAge < 13) {
      setError('You must be at least 13 years old to use this app');
      return;
    }

    if (showParentEmail && !parentEmail) {
      setError('Parent email is required for users under 18');
      return;
    }

    if (parentEmail && !parentEmail.includes('@')) {
      setError('Please enter a valid parent email address');
      return;
    }

    if (!privacyAccepted) {
      setError('You must accept the Privacy Policy to continue');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');
    const { error } = await signUp(
      email,
      password,
      username,
      displayName,
      userRole,
      birthdate,
      parentEmail || undefined
    );

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (showParentEmail) {
      setIsLoading(false);
      router.replace('/auth/pending-consent');
      return;
    }

    // Temporary stub for IAP purchase
    const startPurchase = () => {
      console.log('IAP not wired yet');
    };

    startPurchase();
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the Bible reading journey</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Display Name"
        placeholderTextColor="#999"
        value={displayName}
        onChangeText={setDisplayName}
      />

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#999"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />

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
        placeholder="Password (min 6 characters)"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.birthdateContainer}>
        <TextInput
          style={styles.input}
          placeholder="Birthdate (YYYY-MM-DD)"
          placeholderTextColor="#999"
          value={birthdate}
          onChangeText={setBirthdate}
          keyboardType="numbers-and-punctuation"
        />
        {calculatedAge !== null && (
          <Text style={styles.ageDisplay}>
            Age: {calculatedAge} years old
          </Text>
        )}
        {calculatedAge !== null && calculatedAge < 13 && (
          <Text style={styles.ageWarning}>
            You must be at least 13 years old to use this app
          </Text>
        )}
      </View>

      {showParentEmail && (
        <View style={styles.parentEmailContainer}>
          <Text style={styles.parentEmailLabel}>
            Parent or Guardian Email (Required for ages 13-17)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="parent@example.com"
            placeholderTextColor="#999"
            value={parentEmail}
            onChangeText={setParentEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.parentEmailInfo}>
            We will send a consent email to your parent or guardian
          </Text>
        </View>
      )}

      <View style={styles.roleSelector}>
        <Text style={styles.roleLabel}>I am a:</Text>
        <View style={styles.roleOptions}>
          <TouchableOpacity
            style={[styles.roleOption, userRole === 'youth_member' && styles.roleOptionSelected]}
            onPress={() => setUserRole('youth_member')}
          >
            <Text style={[styles.roleOptionText, userRole === 'youth_member' && styles.roleOptionTextSelected]}>
              Youth Member
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleOption, userRole === 'youth_leader' && styles.roleOptionSelected]}
            onPress={() => setUserRole('youth_leader')}
          >
            <Text style={[styles.roleOptionText, userRole === 'youth_leader' && styles.roleOptionTextSelected]}>
              Youth Leader
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setPrivacyAccepted(!privacyAccepted)}
      >
        <View style={[styles.checkbox, privacyAccepted && styles.checkboxChecked]}>
          {privacyAccepted && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>
          I accept the <Text style={styles.link}>Privacy Policy</Text> and <Text style={styles.link}>Terms of Service</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/sign-in')}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  content: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
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
  roleSelector: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleOption: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  roleOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  roleOptionTextSelected: {
    color: '#2563EB',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  birthdateContainer: {
    marginBottom: 16,
  },
  ageDisplay: {
    fontSize: 14,
    color: '#2563EB',
    marginTop: 8,
    fontWeight: '600',
  },
  ageWarning: {
    fontSize: 14,
    color: '#dc2626',
    marginTop: 8,
    fontWeight: '600',
  },
  parentEmailContainer: {
    marginBottom: 16,
  },
  parentEmailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  parentEmailInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
