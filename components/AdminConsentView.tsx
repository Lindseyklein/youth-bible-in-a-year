import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '@/lib/supabase';

type ConsentRecord = {
  id: string;
  user_id: string;
  parent_email: string;
  consent_status: string;
  consent_given_at: string | null;
  created_at: string;
  profile?: {
    username: string;
    display_name: string;
    birthdate: string | null;
  };
};

export default function AdminConsentView() {
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConsentData();
  }, []);

  const calculateAge = (birthdate: string | null): number | null => {
    if (!birthdate) return null;
    const birthDate = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const loadConsentData = async () => {
    try {
      const { data: consentsData, error: consentsError } = await supabase
        .from('parental_consents')
        .select('*')
        .order('created_at', { ascending: false });

      if (consentsError) throw consentsError;

      const consentRecords: ConsentRecord[] = [];

      for (const consent of consentsData || []) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, display_name, birthdate')
          .eq('id', consent.user_id)
          .maybeSingle();

        consentRecords.push({
          ...consent,
          profile: profile || undefined,
        });
      }

      setConsents(consentRecords);
    } catch (err: any) {
      setError(err.message || 'Failed to load consent data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'denied':
        return '#dc2626';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading consent data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Parental Consent Management</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadConsentData}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {consents.filter((c) => c.consent_status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {consents.filter((c) => c.consent_status === 'approved').length}
          </Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {consents.filter((c) => c.consent_status === 'denied').length}
          </Text>
          <Text style={styles.statLabel}>Denied</Text>
        </View>
      </View>

      {consents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No consent records found</Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          {consents.map((consent) => (
            <View key={consent.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {consent.profile?.display_name || 'Unknown'}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(consent.consent_status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {consent.consent_status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.row}>
                  <Text style={styles.label}>Username:</Text>
                  <Text style={styles.value}>{consent.profile?.username || 'N/A'}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Age:</Text>
                  <Text style={styles.value}>
                    {consent.profile?.birthdate
                      ? calculateAge(consent.profile.birthdate) || 'N/A'
                      : 'N/A'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Parent Email:</Text>
                  <Text style={styles.value}>{consent.parent_email}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Request Date:</Text>
                  <Text style={styles.value}>{formatDate(consent.created_at)}</Text>
                </View>

                {consent.consent_given_at && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Consent Date:</Text>
                    <Text style={styles.value}>{formatDate(consent.consent_given_at)}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFFE',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  refreshButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  tableContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContent: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
});
