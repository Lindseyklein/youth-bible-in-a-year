import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Heart, Save, Calendar as CalendarIcon } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function DailyGratitudeScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingEntryId, setExistingEntryId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayEntry();
  }, [user]);

  const loadTodayEntry = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('entry_date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setContent(data.content);
        setExistingEntryId(data.id);
        setLastSaved(new Date(data.updated_at));
      } else {
        setContent('');
        setExistingEntryId(null);
        setLastSaved(null);
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
      Alert.alert('Error', 'Failed to load your gratitude entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveEntry = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to save your gratitude entry.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Content Required', 'Please write something you are grateful for.');
      return;
    }

    setSaving(true);

    try {
      if (existingEntryId) {
        const { error } = await supabase
          .from('gratitude_entries')
          .update({
            content: content.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingEntryId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('gratitude_entries')
          .insert({
            user_id: user.id,
            entry_date: today,
            content: content.trim(),
          })
          .select()
          .single();

        if (error) throw error;

        setExistingEntryId(data.id);
      }

      setLastSaved(new Date());
      Alert.alert('Saved', 'Your gratitude entry has been saved.');
    } catch (error: any) {
      console.error('Error saving entry:', error);
      Alert.alert('Error', error.message || 'Failed to save your entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Today's Gratitude</Text>
            <View style={styles.dateContainer}>
              <CalendarIcon size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
          <Heart size={32} color="#ffffff" fill="#ffffff" />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Daily Gratitude Journal</Text>
          <Text style={styles.infoText}>
            A quiet space to pause, reflect, and remember what matters.
          </Text>
          <Text style={styles.infoText}>
            Each day, take a moment to write down something you're grateful for — big or small.
            Your entries are saved privately to your account, creating a year-long collection of
            moments that shaped you.
          </Text>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>What are you grateful for today?</Text>
          <TextInput
            style={styles.textInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write your thoughts here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={10}
            textAlignVertical="top"
          />

          {lastSaved && (
            <Text style={styles.lastSavedText}>
              Last saved: {lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveEntry}
          disabled={saving}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={saving ? ['#9CA3AF', '#6B7280'] : ['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Save size={20} color="#ffffff" />
                <Text style={styles.saveButtonText}>
                  {existingEntryId ? 'Update Entry' : 'Save Entry'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 Reflection Tips</Text>
          <Text style={styles.tipText}>• Focus on specific moments or people</Text>
          <Text style={styles.tipText}>• Include why you're grateful, not just what</Text>
          <Text style={styles.tipText}>• Be honest and authentic with yourself</Text>
          <Text style={styles.tipText}>• Small joys are just as valid as big wins</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#111827',
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lastSavedText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  tipCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 22,
    marginBottom: 4,
  },
});
