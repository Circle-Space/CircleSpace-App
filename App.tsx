/* eslint-disable react/no-unstable-nested-components */
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, LogBox, Text as RNText, TextInput as RNTextInput } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NoInternetScreen from './src/components/screens/profile/NoInternetScreen';
import { RatingProvider } from './src/context/RatingContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import { ProfileProvider } from './src/context/ProfileContext';
import { TextInput } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';

// Disable font scaling
// @ts-ignore - TS doesn't know about defaultProps but it exists at runtime
RNText.defaultProps = { ...(RNText.defaultProps || {}), allowFontScaling: false };
// @ts-ignore
RNTextInput.defaultProps = { ...(RNTextInput.defaultProps || {}), allowFontScaling: false,fontFamily: 'Poppins-Regular' };

const App = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [initialRoute, setInitialRoute] = useState<string>('Landing');
  const [isLoading, setIsLoading] = useState(true);

  // Check connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Check if user is already logged in
  const checkAuthStatus = useCallback(async () => {
    try {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setInitialRoute('BottomBar');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
      SplashScreen.hide();
    }
  }, []);

  // Initialize notifications early in app lifecycle
  const initializeNotifications = useCallback(async () => {
    try {
      console.log('🔔 Setting up notifications early in app lifecycle...');
      
      // Check if running on simulator (notifications won't work)
      if (__DEV__) {
        console.log('🟡 Running in development mode - notifications may not work on simulator');
      }
      
      // Request notification permissions first
      const authStatus = await messaging().requestPermission({
        alert: true,
        badge: true,
        sound: true,
        provisional: false,
      });
      
      const enabled = 
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
      console.log('📱 Notification permission status:', authStatus, 'Enabled:', enabled);
      
      if (enabled) {
        // Register for remote messages if on iOS
        if (Platform.OS === 'ios') {
          try {
            await messaging().registerDeviceForRemoteMessages();
            console.log('✅ iOS device registered for remote messages');
          } catch (regError) {
            console.error('❌ Failed to register for remote messages:', regError);
          }
        }
        
        // Small delay to ensure registration is complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now try to get FCM token
        try {
          const token = await messaging().getToken();
          if (token) {
            console.log('✅ FCM Token obtained early:', token.substring(0, 20) + '...');
            await AsyncStorage.setItem('fcmToken', token);
          } else {
            console.log('⚠️ No FCM token received during early initialization');
          }
        } catch (tokenError) {
          console.error('❌ Error getting FCM token during early init:', tokenError);
        }
      } else {
        console.log('⚠️ Notification permissions not granted');
      }
    } catch (error) {
      console.error('❌ Error during notification initialization:', error);
    }
  }, []);

  useEffect(() => {
    // Initialize notifications as early as possible
    initializeNotifications();
    checkAuthStatus();
  }, [initializeNotifications, checkAuthStatus]);

  // Handle retry when no internet connection
  const handleRetry = () => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });
  };

  LogBox.ignoreAllLogs();

  if (isLoading) {
    return null;
  }

  return (
    <Provider store={store}>
      <RatingProvider>
        <ProfileProvider>
        <SafeAreaProvider>
          <GestureHandlerRootView style={styles.container}>
            <NavigationContainer>
              {isConnected ? (
                <AppNavigator initialRoute={initialRoute as any} />
              ) : (
                <NoInternetScreen onRetry={handleRetry} />
              )}
            </NavigationContainer>
          </GestureHandlerRootView>
        </SafeAreaProvider>
        </ProfileProvider>
      </RatingProvider>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
