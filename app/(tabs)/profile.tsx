import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Platform, TextInput, Modal, Linking, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LogOut, Award, Calendar, Users, RefreshCw, History, Crown, CheckCircle, Shield, Bell, Mail, Phone, HelpCircle, AlertCircle, FileText, Info, ExternalLink, Trash2, Lock, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import RestartPlanDialog from '@/components/RestartPlanDialog';
import PlanHistoryView from '@/components/PlanHistoryView';
import AdminConsentView from '@/components/AdminConsentView';
import { scheduleDailyReminder, cancelDailyReminder, requestNotificationPermissions } from '@/lib/notifications';

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  subscription_status: string;
  subscription_ends_at: string | null;
  user_role: 'adult' | 'leader' | 'youth' | null;
  age_group: 'teen' | 'adult' | null;
  is_developer_admin: boolean;
  reminder_enabled: boolean;
  reminder_time: string;
};

type Stats = {
  totalCompleted: number;
  currentStreak: number;
  groupCount: number;
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({ totalCompleted: 0, currentStreak: 0, groupCount: 0 });
  const [loading, setLoading] = useState(true);
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdminConsent, setShowAdminConsent] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00:00');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempEmail, setTempEmail] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const { count: completedCount } = await supabase
      .from('user_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', true);

    const { count: groupCount } = await supabase
      .from('study_group_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setProfile(profileData);
    setStats({
      totalCompleted: completedCount || 0,
      currentStreak: 0,
      groupCount: groupCount || 0,
    });

    if (profileData) {
      setReminderEnabled(profileData.reminder_enabled || false);
      setReminderTime(profileData.reminder_time || '09:00:00');
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const handleRestartSuccess = () => {
    loadProfile();
    router.replace('/(tabs)');
  };

  const handleToggleReminder = async (enabled: boolean) => {
    if (!user) return;

    setReminderEnabled(enabled);

    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        setReminderEnabled(false);
        return;
      }

      const [hours, minutes] = reminderTime.split(':').map(Number);
      await scheduleDailyReminder(hours, minutes);
    } else {
      await cancelDailyReminder();
    }

    await supabase
      .from('profiles')
      .update({ reminder_enabled: enabled })
      .eq('id', user.id);
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    if (!user) return;

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    setReminderTime(timeString);

    supabase
      .from('profiles')
      .update({ reminder_time: timeString })
      .eq('id', user.id);

    if (reminderEnabled) {
      scheduleDailyReminder(hours, minutes);
    }
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const handleSaveName = async () => {
    if (!user || !tempName.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: tempName.trim() })
      .eq('id', user.id);

    if (!error) {
      setEditingName(false);
      loadProfile();
    }
  };

  const handleSaveEmail = async () => {
    if (!user || !tempEmail.trim()) return;

    const { error } = await supabase
      .from('profiles')
      .update({ email: tempEmail.trim() })
      .eq('id', user.id);

    if (!error) {
      setEditingEmail(false);
      loadProfile();
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleReportProblem = async () => {
    if (!reportText.trim()) return;

    const mailtoUrl = `mailto:info@youthbibleinayear.com?subject=Problem Report&body=${encodeURIComponent(reportText)}`;

    const canOpen = await Linking.canOpenURL(mailtoUrl);
    if (canOpen) {
      await Linking.openURL(mailtoUrl);
      setShowReportModal(false);
      setReportText('');
      Alert.alert('Success', 'Thank you! Your report has been sent.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user) return;

            const { error } = await supabase.auth.admin.deleteUser(user.id);

            if (!error) {
              await signOut();
              router.replace('/');
            } else {
              Alert.alert('Error', 'Failed to delete account. Please contact support.');
            }
          },
        },
      ]
    );
  };

  const handleManageSubscription = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('itms-apps://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  const handleContactSupport = (method: 'email' | 'phone') => {
    if (method === 'email') {
      Linking.openURL('mailto:info@youthbibleinayear.com');
    } else {
      Linking.openURL('tel:+18305812390');
    }
  };

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleChangeSubscription = async (plan: 'monthly' | 'annual' | 'free') => {
    if (!user) return;

    const subscriptionEnds = plan === 'free'
      ? null
      : new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: plan === 'free' ? 'inactive' : 'active',
        subscription_ends_at: subscriptionEnds,
      })
      .eq('id', user.id);

    if (!error) {
      setShowSubscriptionModal(false);
      loadProfile();
      Alert.alert('Success', `Your subscription has been changed to ${plan === 'free' ? 'Free' : plan === 'monthly' ? 'Monthly' : 'Annual'} plan.`);
    } else {
      Alert.alert('Error', 'Failed to update subscription. Please try again.');
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6b6b" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.display_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.displayName}>{profile?.display_name}</Text>
        <Text style={styles.username}>@{profile?.username}</Text>
        <View style={styles.roleTag}>
          {profile?.user_role === 'leader' ? (
            <>
              <Shield size={14} color="#2563EB" />
              <Text style={styles.roleText}>Youth Leader</Text>
            </>
          ) : (
            <Text style={styles.roleTextMember}>Youth Member</Text>
          )}
        </View>
      </View>

      {profile?.user_role === 'leader' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAdminConsent(!showAdminConsent)}
          >
            <View style={styles.actionButtonIcon}>
              <Shield size={20} color="#6366f1" />
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonText}>Parental Consent Management</Text>
              <Text style={styles.actionButtonSubtext}>
                View and manage parental consent requests
              </Text>
            </View>
            <ChevronRight
              size={20}
              color="#9ca3af"
              style={{
                transform: [{ rotate: showAdminConsent ? '90deg' : '0deg' }],
              }}
            />
          </TouchableOpacity>

          {showAdminConsent && (
            <View style={styles.adminConsentContainer}>
              <AdminConsentView />
            </View>
          )}
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Calendar size={32} color="#ff6b6b" />
          <Text style={styles.statValue}>{stats.totalCompleted}</Text>
          <Text style={styles.statLabel}>Days Completed</Text>
        </View>

        <View style={styles.statCard}>
          <Award size={32} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>

        <View style={styles.statCard}>
          <Users size={32} color="#10b981" />
          <Text style={styles.statValue}>{stats.groupCount}</Text>
          <Text style={styles.statLabel}>Study Groups</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progress</Text>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            You've completed {stats.totalCompleted} daily readings
          </Text>
          <Text style={styles.progressSubtext}>
            Keep going to complete all 365 readings this year!
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>
        <Text style={styles.reminderDescription}>
          Get notified each day to read your daily passage
        </Text>

        <View style={styles.reminderToggle}>
          <View style={styles.reminderToggleLeft}>
            <View style={styles.reminderIcon}>
              <Bell size={20} color="#6366f1" />
            </View>
            <View style={styles.reminderToggleText}>
              <Text style={styles.reminderToggleTitle}>Enable Reminders</Text>
              <Text style={styles.reminderToggleSubtext}>
                {reminderEnabled ? `Daily at ${formatTime(reminderTime)}` : 'Tap to enable'}
              </Text>
            </View>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={handleToggleReminder}
            trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
            thumbColor={reminderEnabled ? '#6366f1' : '#f4f3f4'}
          />
        </View>

        {reminderEnabled && Platform.OS !== 'web' && (
          <View style={styles.timePickerContainer}>
            <Text style={styles.timePickerLabel}>Reminder Time</Text>
            <View style={styles.timePickerButtons}>
              {[
                { label: '7:00 AM', hours: 7, minutes: 0 },
                { label: '9:00 AM', hours: 9, minutes: 0 },
                { label: '12:00 PM', hours: 12, minutes: 0 },
                { label: '6:00 PM', hours: 18, minutes: 0 },
                { label: '8:00 PM', hours: 20, minutes: 0 },
              ].map((time) => {
                const isSelected = reminderTime.startsWith(`${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`);
                return (
                  <TouchableOpacity
                    key={time.label}
                    style={[styles.timeButton, isSelected && styles.timeButtonSelected]}
                    onPress={() => handleTimeChange(time.hours, time.minutes)}
                  >
                    <Text style={[styles.timeButtonText, isSelected && styles.timeButtonTextSelected]}>
                      {time.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {Platform.OS === 'web' && reminderEnabled && (
          <View style={styles.webNoticeContainer}>
            <Text style={styles.webNoticeText}>
              Push notifications are only available on iOS and Android devices.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Reading Plan</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <View style={styles.actionButtonIcon}>
            <History size={20} color="#6366f1" />
          </View>
          <View style={styles.actionButtonContent}>
            <Text style={styles.actionButtonText}>Plan History</Text>
            <Text style={styles.actionButtonSubtext}>
              View your progress across all cycles
            </Text>
          </View>
        </TouchableOpacity>

        {showHistory && (
          <View style={styles.historyContainer}>
            <PlanHistoryView />
          </View>
        )}

        <TouchableOpacity
          style={styles.restartButton}
          onPress={() => setShowRestartDialog(true)}
        >
          <LinearGradient
            colors={['#56F0C3', '#0EA5E9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.restartButtonGradient}
          >
            <RefreshCw size={20} color="#ffffff" />
            <Text style={styles.restartButtonText}>Restart My Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Name</Text>
          {editingName ? (
            <View style={styles.editingRow}>
              <TextInput
                style={styles.textInput}
                value={tempName}
                onChangeText={setTempName}
                placeholder="Enter your name"
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveName} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setTempName(profile?.display_name || '');
                setEditingName(true);
              }}
              style={styles.editableValue}
            >
              <Text style={styles.settingValue}>{profile?.display_name}</Text>
              <ChevronRight size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email</Text>
          {editingEmail ? (
            <View style={styles.editingRow}>
              <TextInput
                style={styles.textInput}
                value={tempEmail}
                onChangeText={setTempEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoFocus
              />
              <TouchableOpacity onPress={handleSaveEmail} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setTempEmail(profile?.email || '');
                setEditingEmail(true);
              }}
              style={styles.editableValue}
            >
              <Text style={styles.settingValue}>{profile?.email || 'Not set'}</Text>
              <ChevronRight size={16} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => setShowPasswordModal(true)}
        >
          <Lock size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Change Password</Text>
          <ChevronRight size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#dc2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>

        <View style={styles.subscriptionInfo}>
          <View style={styles.subscriptionRow}>
            <Text style={styles.subscriptionLabel}>Current Plan</Text>
            <Text style={styles.subscriptionValue}>
              {profile?.subscription_status === 'active' ? 'Monthly' : 'Free'}
            </Text>
          </View>
          {profile?.subscription_ends_at && (
            <View style={styles.subscriptionRow}>
              <Text style={styles.subscriptionLabel}>Renewal Date</Text>
              <Text style={styles.subscriptionValue}>
                {new Date(profile.subscription_ends_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => setShowSubscriptionModal(true)}
        >
          <Crown size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Change Subscription</Text>
          <ChevronRight size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>

        {Platform.OS !== 'web' && (
          <TouchableOpacity
            style={styles.actionButtonFlat}
            onPress={handleManageSubscription}
          >
            <Crown size={18} color="#6366f1" />
            <Text style={styles.actionButtonFlatText}>Manage Subscription</Text>
            <ExternalLink size={16} color="#666" style={styles.actionButtonFlatIcon} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => handleContactSupport('email')}
        >
          <Mail size={18} color="#6366f1" />
          <View style={styles.actionButtonFlatContent}>
            <Text style={styles.actionButtonFlatText}>Email Support</Text>
            <Text style={styles.actionButtonFlatSubtext}>info@youthbibleinayear.com</Text>
          </View>
          <ExternalLink size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => handleContactSupport('phone')}
        >
          <Phone size={18} color="#6366f1" />
          <View style={styles.actionButtonFlatContent}>
            <Text style={styles.actionButtonFlatText}>Phone Support</Text>
            <Text style={styles.actionButtonFlatSubtext}>1-830-581-2390</Text>
          </View>
          <ExternalLink size={16} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => setShowReportModal(true)}
        >
          <AlertCircle size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Report a Problem</Text>
          <ChevronRight size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => handleOpenLink('http://youthbibleinayear.com/privacy-policy/')}
        >
          <FileText size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Privacy Policy</Text>
          <ExternalLink size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => handleOpenLink('http://youthbibleinayear.com/terms-of-service/')}
        >
          <FileText size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Terms of Service</Text>
          <ExternalLink size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Trash2 size={18} color="#dc2626" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>{Constants.expoConfig?.version || '1.0.0'}</Text>
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Developer</Text>
          <Text style={styles.settingValue}>Youth Bible In A Year LLC</Text>
        </View>

        <TouchableOpacity
          style={styles.actionButtonFlat}
          onPress={() => handleOpenLink('https://youthbibleinayear.com')}
        >
          <Info size={18} color="#6366f1" />
          <Text style={styles.actionButtonFlatText}>Visit Website</Text>
          <ExternalLink size={16} color="#666" style={styles.actionButtonFlatIcon} />
        </TouchableOpacity>
      </View>

      <RestartPlanDialog
        visible={showRestartDialog}
        onClose={() => setShowRestartDialog(false)}
        onSuccess={handleRestartSuccess}
      />

      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleChangePassword}
              >
                <Text style={styles.modalButtonConfirmText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showReportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Report a Problem</Text>

            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Describe the issue"
              value={reportText}
              onChangeText={setReportText}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => {
                  setShowReportModal(false);
                  setReportText('');
                }}
              >
                <Text style={styles.modalButtonCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleReportProblem}
              >
                <Text style={styles.modalButtonConfirmText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSubscriptionModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Subscription</Text>
            <Text style={styles.modalDescription}>
              Choose the plan that works best for you
            </Text>

            <View style={styles.subscriptionPlans}>
              <TouchableOpacity
                style={[
                  styles.planCard,
                  profile?.subscription_status !== 'active' && styles.planCardActive,
                ]}
                onPress={() => handleChangeSubscription('free')}
              >
                <Text style={styles.planName}>Free</Text>
                <Text style={styles.planPrice}>$0</Text>
                <Text style={styles.planPeriod}>Forever</Text>
                <Text style={styles.planFeature}>Basic reading plan access</Text>
                <Text style={styles.planFeature}>Limited community features</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.planCard,
                  profile?.subscription_status === 'active' && styles.planCardActive,
                ]}
                onPress={() => handleChangeSubscription('monthly')}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>Popular</Text>
                </View>
                <Text style={styles.planName}>Monthly</Text>
                <Text style={styles.planPrice}>$9.99</Text>
                <Text style={styles.planPeriod}>per month</Text>
                <Text style={styles.planFeature}>Full reading plan access</Text>
                <Text style={styles.planFeature}>All community features</Text>
                <Text style={styles.planFeature}>Priority support</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.planCard}
                onPress={() => handleChangeSubscription('annual')}
              >
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>Save 20%</Text>
                </View>
                <Text style={styles.planName}>Annual</Text>
                <Text style={styles.planPrice}>$95.99</Text>
                <Text style={styles.planPeriod}>per year</Text>
                <Text style={styles.planFeature}>Full reading plan access</Text>
                <Text style={styles.planFeature}>All community features</Text>
                <Text style={styles.planFeature}>Priority support</Text>
                <Text style={styles.planFeature}>Annual planning resources</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalButtonCancel}
              onPress={() => setShowSubscriptionModal(false)}
            >
              <Text style={styles.modalButtonCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  username: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  roleTextMember: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1a1a1a',
  },
  progressInfo: {
    paddingVertical: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  progressSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  actionButtonSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  historyContainer: {
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  adminConsentContainer: {
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
  },
  restartButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  restartButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  subscriptionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subscriptionDate: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  upgradeButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    gap: 8,
  },
  upgradeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  reminderDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 8,
  },
  reminderToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderToggleText: {
    flex: 1,
  },
  reminderToggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  reminderToggleSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  timePickerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  timePickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  timePickerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeButtonSelected: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  timeButtonTextSelected: {
    color: '#6366f1',
  },
  webNoticeContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  webNoticeText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  settingValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  editableValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonFlat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  actionButtonFlatText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
  },
  actionButtonFlatSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  actionButtonFlatContent: {
    flex: 1,
  },
  actionButtonFlatIcon: {
    marginLeft: 'auto',
  },
  subscriptionInfo: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalButtonConfirm: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  subscriptionPlans: {
    gap: 16,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    position: 'relative',
  },
  planCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#6366f1',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: '800',
    color: '#6366f1',
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  planFeature: {
    fontSize: 14,
    color: '#1a1a1a',
    marginBottom: 8,
    paddingLeft: 16,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#6366f1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  savingsBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
