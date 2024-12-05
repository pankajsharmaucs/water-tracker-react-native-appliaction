import React, { useState, useEffect } from 'react';
import { Text, View, Button, Image, StyleSheet, Picker } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

// Define a background task for notifications
const BACKGROUND_NOTIFICATION_TASK = 'background-notification-task';

export default function App() {
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [notificationsActive, setNotificationsActive] = useState(false);
  const [interval, setInterval] = useState('1'); // State for selected interval

  useEffect(() => {
    // Request notification permission using expo-notifications
    const getNotificationPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission for notifications is required!');
        setNotificationPermission(false);
        return;
      }
      setNotificationPermission(true);
    };

    getNotificationPermission();

    // Set up background notifications handling
    const backgroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Background notification received', notification);
    });

    // Register background task
    TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, ({ data, error }) => {
      if (error) {
        console.error(error);
        return;
      }
      console.log('Background task triggered:', data);
      // Handle background notification here
    });

    return () => {
      backgroundSubscription.remove();
    };
  }, []);

  // Schedule water reminder notifications based on selected interval
  const scheduleWaterReminders = async () => {
    const now = new Date();
    let trigger;

    switch (interval) {
      case '1': // 1 minute interval
        trigger = {
          seconds: 60, // Trigger every seconds
          repeats: true, // Repeat notification every minute
        };
        break;

      case '30': // 30 minutes interval
        trigger = {
          minutes: 30, // Trigger every 30 minutes
          repeats: true, // Repeat notification every 30 minutes
        };
        break;

      case '60': // 60 minutes (1 hour) interval
        trigger = {
          minutes: 60, // Trigger every 60 minutes
          repeats: true, // Repeat notification every 60 minutes
        };
        break;

      case '120': // 2 hours interval
        trigger = {
          hours: 2, // Trigger every 2 hours
          repeats: true, // Repeat notification every 2 hours
        };
        break;

      case '180': // 3 hours interval
        trigger = {
          hours: 3, // Trigger every 3 hours
          repeats: true, // Repeat notification every 3 hours
        };
        break;

      case '240': // 4 hours interval
        trigger = {
          hours: 4, // Trigger every 4 hours
          repeats: true, // Repeat notification every 4 hours
        };
        break;

      case '300': // 5 hours interval
        trigger = {
          hours: 5, // Trigger every 5 hours
          repeats: true, // Repeat notification every 5 hours
        };
        break;

      default:
        return;
    }

    // Schedule the notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Drink Water!",
        body: "It's time to drink water and stay hydrated.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger,
    });
  };

  // Start background notifications
  const startBackgroundNotifications = async () => {
    if (notificationPermission) {
      setNotificationsActive(true);
      await scheduleWaterReminders(); // Call this to schedule the reminder with the updated interval

      // Start a background task to send notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Background Task Active",
          body: "The app will keep sending notifications in the background.",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          seconds: 60, // Start background notifications after 1 minute
          repeats: true, // Repeat the task in background
        },
      });

      // Register background task using TaskManager
      TaskManager.startTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    } else {
      alert('Notification permissions are required.');
    }
  };

  const stopBackgroundNotifications = async () => {
    // Cancel all scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    TaskManager.stopTaskAsync(BACKGROUND_NOTIFICATION_TASK);
    setNotificationsActive(false);
  };

  return (
    <View style={styles.container}>
      {/* Water logo centered */}
      <Image
        source={require('./assets/icon.png')}  // Replace with your water logo image path
        style={styles.logo}
      />

      {/* Text and Start/Stop Button */}
      <Text style={styles.title}>Stay Hydrated!</Text>

      {/* Dropdown for selecting notification interval */}
      <Text>Select Notification Interval:</Text>
      <Picker
        selectedValue={interval}
        style={styles.picker}
        onValueChange={(itemValue) => setInterval(itemValue)}
      >
        <Picker.Item label="1 Minute" value="1" />
        <Picker.Item label="30 Minutes" value="30" />
        <Picker.Item label="1 Hour (60 Minutes)" value="60" />
        <Picker.Item label="2 Hours" value="120" />
        <Picker.Item label="3 Hours" value="180" />
        <Picker.Item label="4 Hours" value="240" />
        <Picker.Item label="5 Hours" value="300" />
      </Picker>

      <View style={styles.buttonsContainer}>
        <Button
          title={notificationsActive ? "Stop Notifications" : "Start Notifications"}
          onPress={notificationsActive ? stopBackgroundNotifications : startBackgroundNotifications}
        />
      </View>

      {/* Footer text */}
      <Text style={styles.footer}>© 2024 Hydration App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f8ff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  picker: {
    width: 200,
    height: 40,
    marginBottom: 20,
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#777',
  },
});
