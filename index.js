/**
 * @format
 */

import React from 'react';
import { AppRegistry } from 'react-native';
// import messaging from '@react-native-firebase/messaging';  // Remove this import
import App from './App';
import { name as appName } from './app.json';

// Remove duplicate background handler - it's already handled in usePushNotification hook
// messaging().setBackgroundMessageHandler(async remoteMessage => {
//   console.log('Message handled in the background!', remoteMessage);
//   // You can perform any necessary background tasks here
// });

AppRegistry.registerComponent(appName, () => App);
