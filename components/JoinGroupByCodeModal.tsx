import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { X, Hash } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

type JoinGroupByCodeModalProps = {
  visible: boolean;
  onClose: () => void;
  onJoinSuccess: () => void;
};

export default function JoinGroupByCodeModal({ visible, onClose, onJoinSuccess }: JoinGroupByCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError('Please enter a join code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { data: groupId, error: rpcError } = await supabase.rpc('join_group_by_code', {
        p_code: normalized,
      });

      if (rpcError) {
        console.error('[JoinGroupByCode] RPC error:', rpcError.message, rpcError.details);
        setError(rpcError.message || 'Something went wrong');
        setLoading(false);
        return;
      }

      if (groupId == null) {
        setError('Invalid code. Please check the code and try again.');
        setLoading(false);
        return;
      }

      setCode('');
      onJoinSuccess();
      onClose();
    } catch (err) {
      console.error('[JoinGroupByCode] Unexpected error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setCode('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Join with Code</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading} hitSlop={12}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Enter the join code shared by your group leader. No email or link required.
          </Text>

          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Hash size={20} color="#2563EB" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABC12XYZ"
              placeholderTextColor="#9CA3AF"
              value={code}
              onChangeText={(t) => {
                setCode(t.trim().toUpperCase());
                setError('');
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Join Group</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 2,
  },
  errorText: { fontSize: 14, color: '#DC2626', marginBottom: 12 },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
