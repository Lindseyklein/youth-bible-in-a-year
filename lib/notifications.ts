import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    // Cancel any existing daily reminder
    await cancelDailyReminder();

    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Your Daily Reading is Ready',
        body: 'Your daily reading is ready for you. Take a moment today to pause, reflect, and stay on track with your Bible-in-a-Year journey.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return null;
  }
}

export async function cancelDailyReminder(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    // Cancel all scheduled notifications (in this case, the daily reminder)
    for (const notification of scheduledNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  } catch (error) {
    console.error('Error canceling daily reminder:', error);
  }
}

export async function hasNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}
