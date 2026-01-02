import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw, X, Archive, Trash2, AlertCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type RestartPlanDialogProps = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function RestartPlanDialog({ visible, onClose, onSuccess }: RestartPlanDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'confirm' | 'options'>('confirm');
  const [loading, setLoading] = useState(false);

  const handleRestart = async (restartType: 'keep_history' | 'clear_progress') => {
    if (!user) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('restart_user_plan', {
        p_user_id: user.id,
        p_restart_type: restartType,
        p_keep_history: restartType === 'keep_history',
      });

      if (error) throw error;

      setStep('confirm');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error restarting plan:', error);
      alert('Failed to restart plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {step === 'confirm' ? (
            <>
              <View style={styles.iconContainer}>
                <RefreshCw size={48} color="#ff6b6b" />
              </View>

              <Text style={styles.title}>Restart Your Journey</Text>
              <Text style={styles.description}>
                God delights in new beginnings. This will take you back to Week 1, Day 1 with a fresh start.
              </Text>

              <View style={styles.infoBox}>
                <AlertCircle size={20} color="#74b9ff" />
                <Text style={styles.infoText}>
                  Don't worry! You can choose to keep your completion history and stats.
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={() => setStep('options')}
                >
                  <LinearGradient
                    colors={['#ff6b6b', '#ee5a6f']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.continueButtonGradient}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <X size={24} color="#666" />
              </TouchableOpacity>

              <Text style={styles.title}>Choose Restart Type</Text>
              <Text style={styles.description}>
                How would you like to restart your reading plan?
              </Text>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleRestart('keep_history')}
                disabled={loading}
              >
                <View style={styles.optionIcon}>
                  <Archive size={32} color="#10b981" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Keep My History</Text>
                  <Text style={styles.optionDescription}>
                    Save all my progress, streaks, and notes. Start a fresh cycle while preserving my achievements.
                  </Text>
                  <View style={styles.optionBadge}>
                    <Text style={styles.optionBadgeText}>✓ Recommended</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleRestart('clear_progress')}
                disabled={loading}
              >
                <View style={[styles.optionIcon, styles.optionIconDanger]}>
                  <Trash2 size={32} color="#ef4444" />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Clear My Progress</Text>
                  <Text style={styles.optionDescription}>
                    Reset everything to 0%. Notes and group participation stay intact.
                  </Text>
                </View>
              </TouchableOpacity>

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#ff6b6b" />
                  <Text style={styles.loadingText}>Restarting your plan...</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#74b9ff',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  continueButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  continueButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIconDanger: {
    backgroundColor: '#fee2e2',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  optionBadge: {
    backgroundColor: '#d1fae5',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  optionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
});
