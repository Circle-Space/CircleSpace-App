import messaging from '@react-native-firebase/messaging';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';

export const testNotificationSetup = async () => {
  console.log('🔔 Starting notification system test...');
  
  try {
    // 1. Check if Firebase app is initialized
    console.log('1. Checking Firebase initialization...');
    const app = messaging().app;
    console.log('✅ Firebase app initialized:', app.name);

    // 2. Check notification permissions
    console.log('2. Checking notification permissions...');
    if (Platform.OS === 'android') {
      const androidVersion = Platform.Version as number;
      console.log('Android version:', androidVersion);
      
      if (androidVersion >= 33) {
        const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
        const hasPermission = await PermissionsAndroid.check(permission);
        console.log('POST_NOTIFICATIONS permission:', hasPermission ? '✅ Granted' : '❌ Not granted');
        
        if (!hasPermission) {
          console.log('Requesting POST_NOTIFICATIONS permission...');
          const granted = await PermissionsAndroid.request(permission);
          console.log('Permission request result:', granted);
        }
      } else {
        console.log('✅ Android < 13, permission automatically granted');
      }
    } else if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      console.log('iOS permission status:', authStatus, enabled ? '✅ Enabled' : '❌ Disabled');
    }

    // 3. Test device registration for remote messages
    console.log('3. Testing device registration...');
    if (Platform.OS === 'ios') {
      const isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
      console.log('iOS remote messages registration:', isRegistered ? '✅ Registered' : '❌ Not registered');
      
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
        console.log('✅ Device registered for remote messages');
      }
    }

    // 4. Get FCM token
    console.log('4. Getting FCM token...');
    const token = await messaging().getToken();
    if (token) {
      console.log('✅ FCM Token retrieved:', token.substring(0, 20) + '...');
      await AsyncStorage.setItem('fcmToken', token);
      
      // Also log full token for testing
      console.log('Full FCM Token (for testing):', token);
    } else {
      console.log('❌ Failed to get FCM token');
    }

    // 5. Test local notification
    console.log('5. Testing local notification...');
    PushNotification.localNotification({
      title: 'Test Notification',
      message: 'This is a test local notification',
      playSound: true,
      soundName: 'default',
    });
    console.log('✅ Local notification sent');

    // 6. Check for stored notifications
    console.log('6. Checking for stored notifications...');
    const keys = await AsyncStorage.getAllKeys();
    const notificationKeys = keys.filter(key => key.startsWith('notification_'));
    console.log('Stored notifications:', notificationKeys.length);

    console.log('🎉 Notification test completed!');
    
    Alert.alert(
      'Notification Test Complete',
      `✅ Firebase initialized\n✅ Permissions checked\n✅ FCM token: ${token ? 'Retrieved' : 'Failed'}\n✅ Local notification sent\n\nCheck console for detailed logs.`,
      [{ text: 'OK' }]
    );

    return {
      firebaseInitialized: true,
      tokenRetrieved: !!token,
      token: token || null,
    };

  } catch (error) {
    console.error('❌ Notification test failed:', error);
    Alert.alert('Notification Test Failed', error.message);
    return {
      firebaseInitialized: false,
      tokenRetrieved: false,
      token: null,
      error: error.message,
    };
  }
};

export const sendTestNotification = async () => {
  try {
    const token = await AsyncStorage.getItem('fcmToken');
    if (!token) {
      Alert.alert('Error', 'No FCM token found. Please run notification test first.');
      return;
    }

    console.log('Send this token to your backend to test notifications:');
    console.log(token);
    
    Alert.alert(
      'FCM Token',
      'Token copied to console. Send this to your backend to test push notifications:\n\n' + token.substring(0, 50) + '...',
      [
        { text: 'Copy Full Token', onPress: () => console.log('Full token:', token) },
        { text: 'OK' }
      ]
    );
  } catch (error) {
    console.error('Error getting token:', error);
    Alert.alert('Error', 'Failed to get FCM token');
  }
};

export const clearNotificationData = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const notificationKeys = keys.filter(key => 
      key.startsWith('notification_') || key === 'fcmToken'
    );
    
    await AsyncStorage.multiRemove(notificationKeys);
    console.log('Cleared notification data:', notificationKeys);
    
    Alert.alert('Success', `Cleared ${notificationKeys.length} notification items`);
  } catch (error) {
    console.error('Error clearing notification data:', error);
    Alert.alert('Error', 'Failed to clear notification data');
  }
}; 