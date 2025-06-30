import {useEffect, useCallback, useRef} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {NavigationProp, NavigationState} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../services/dataRequest';
import PushNotification, {Importance} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import {useDispatch} from 'react-redux';
import {setLikeStatus} from '../redux/slices/likeSlice';
import {setCommentCount} from '../redux/slices/commentSlice';
import {
  routeToOtherUserProfile,
  routeToPost,
  routeToProject,
} from '../components/screens/notifications/routingForNotification';
import routes from '../constants/routes';
import {RootStackParamList} from '../navigation/types';
import chatRequest from '../services/chatRequest';
import apiEndPoints from '../constants/apiEndPoints';
import { setCurrentUserId } from '../redux/reducers/chatSlice';

interface NotificationData {
  postId?: string;
  post_id?: string;
  projectId?: string;
  project_id?: string;
  circleId?: string;
  circleType?: string;
  giverId?: string;
  screen: string;
  targetUserId?: string;
  type: string;
  userId: string;
  followerId?: string;
  followingId?: string;
  messageId?: string;
  accountType?: string;
  user_info?: string;
  timestamp?: number;
}

const usePushNotification = (
  navigation: Omit<NavigationProp<RootStackParamList>, 'getState'> & {
    getState(): NavigationState | undefined;
  },
) => {
  const notificationDataMap = useRef<Map<string, NotificationData>>(new Map());
  const dispatch = useDispatch();

  // Debug function to log notification state
  const debugNotificationState = useCallback(() => {
    console.log('🔍 DEBUG: Current notification state:');
    console.log('  - Memory map size:', notificationDataMap.current.size);
    console.log('  - Memory map entries:');
    for (const [key, value] of notificationDataMap.current.entries()) {
      console.log(
        `    - ${key}: ${
          value.user_info ? 'HAS_USER_INFO' : 'NO_USER_INFO'
        } (timestamp: ${value.timestamp})`,
      );
    }
  }, []);

  // Cleanup old notifications from memory map (keep only last 5 for chat)
  const cleanupNotificationMap = useCallback(() => {
    if (notificationDataMap.current.size > 5) {
      console.log('🧹 Cleaning up old notifications from memory map...');
      const entries = Array.from(notificationDataMap.current.entries());

      // Sort by timestamp, keep the 5 most recent
      entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));

      const toKeep = entries.slice(0, 5);
      const toRemove = entries.slice(5);

      // Clear the map and add back the recent ones
      notificationDataMap.current.clear();
      toKeep.forEach(([key, value]) => {
        notificationDataMap.current.set(key, value);
      });

      console.log(
        `🗑️ Removed ${toRemove.length} old notifications from memory map`,
      );
    }
  }, []);

  // Clear all stored notification data for fresh start
  const clearAllNotificationData = useCallback(async () => {
    try {
      console.log('🧹 Clearing all stored notification data...');
      
      // Clear memory map
      notificationDataMap.current.clear();
      
      // Clear AsyncStorage notification data
      const keys = await AsyncStorage.getAllKeys();
      const notificationKeys = keys.filter(key => key.startsWith('notification_'));
      
      if (notificationKeys.length > 0) {
        await AsyncStorage.multiRemove(notificationKeys);
        console.log(`🗑️ Removed ${notificationKeys.length} notifications from AsyncStorage`);
      }
      
      console.log('✅ All notification data cleared');
    } catch (error) {
      console.error('❌ Error clearing notification data:', error);
    }
  }, []);

  const requestUserPermission = async () => {
    try {
      console.log('Requesting user permission for notifications...');

      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission({
          alert: true,
          badge: true,
          sound: true,
          provisional: false,
        });
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        console.log('iOS Permission status:', authStatus, 'Enabled:', enabled);
        return enabled;
      } else if (Platform.OS === 'android') {
        // Check Android version
        const androidVersion = Platform.Version as number;
        console.log('Android version:', androidVersion);

        if (androidVersion >= 33) {
          // Request POST_NOTIFICATIONS permission for Android 13+
          const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
          const hasPermission = await PermissionsAndroid.check(permission);

          if (hasPermission) {
            console.log('Android notification permission already granted');
            return true;
          }

          const granted = await PermissionsAndroid.request(permission, {
            title: 'Notification Permission',
            message: 'This app needs access to send you notifications',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          });

          const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
          console.log(
            'Android 13+ notification permission:',
            granted,
            'Granted:',
            isGranted,
          );
          return isGranted;
        } else {
          console.log('Android version < 13, permission automatically granted');
          return true;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const getFCMToken = async () => {
    try {
      console.log('Getting FCM token...');

      // First, ensure device is registered for remote messages on iOS
      if (Platform.OS === 'ios') {
        console.log('Checking iOS remote registration status...');
        let isRegistered = await messaging()
          .isDeviceRegisteredForRemoteMessages;
        console.log('Initial registration status:', isRegistered);

        if (!isRegistered) {
          console.log('Registering iOS device for remote messages...');
          await messaging().registerDeviceForRemoteMessages();
          console.log('iOS device registered for remote messages');

          // Wait a bit for the registration to complete
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Check again
          isRegistered = await messaging().isDeviceRegisteredForRemoteMessages;
          console.log('Registration status after attempt:', isRegistered);
        }

        // If still not registered, try requesting permissions first
        if (!isRegistered) {
          console.log('Still not registered, requesting permissions first...');
          const permissionGranted = await requestUserPermission();
          console.log('Permission granted:', permissionGranted);

          if (permissionGranted) {
            console.log('Attempting registration again after permission...');
            await messaging().registerDeviceForRemoteMessages();
            await new Promise(resolve => setTimeout(resolve, 2000));

            isRegistered = await messaging()
              .isDeviceRegisteredForRemoteMessages;
            console.log('Final registration status:', isRegistered);
          }
        }

        if (!isRegistered) {
          throw new Error(
            'Failed to register device for remote notifications. Please check iOS notification permissions.',
          );
        }
      }

      // Now attempt to get the FCM token with retry logic
      let fcmToken: string | null = null;
      let attempts = 0;
      const maxAttempts = 3;

      while (!fcmToken && attempts < maxAttempts) {
        attempts++;
        console.log(`FCM token attempt ${attempts}/${maxAttempts}...`);

        try {
          fcmToken = await messaging().getToken();
          if (fcmToken) {
            console.log(
              'FCM Token retrieved successfully:',
              fcmToken.substring(0, 20) + '...',
            );
            await AsyncStorage.setItem('fcmToken', fcmToken);
            return fcmToken;
          }
        } catch (attemptError) {
          console.log(`FCM token attempt ${attempts} failed:`, attemptError);
          if (attempts < maxAttempts) {
            console.log(`Waiting before retry attempt ${attempts + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }

      if (!fcmToken) {
        throw new Error('Failed to get FCM token after multiple attempts');
      }

      return fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);

      // Provide more specific error messages for iOS
      if (
        Platform.OS === 'ios' &&
        (error as Error)?.message?.includes('APNS token')
      ) {
        console.error('APNS token error - this usually means:');
        console.error('1. Device is not registered for remote notifications');
        console.error('2. Notification permissions are not granted');
        console.error(
          "3. App is running in simulator (APNS doesn't work in simulator)",
        );
        console.error(
          'Solution: Make sure to run on physical device and grant notification permissions',
        );
      }

      return null;
    }
  };

  const routeToProfile = useCallback(
    async (id: string, accountType: string) => {
      console.log('routeToProfile', id, accountType);
      try {
        const account = await AsyncStorage.getItem('user');
        const currentUser = JSON.parse(account || '{}')._id;
        const savedToken = await AsyncStorage.getItem('userToken');

        const screen = currentUser !== id ? 'OtherUserProfile' : 'Profile';
        // const accountType = await AsyncStorage.getItem('accountType') || 'user';
        routeToOtherUserProfile(
          navigation,
          id,
          screen === 'Profile',
          savedToken,
          accountType,
        );
      } catch (error) {
        console.error('Error routing to profile:', error);
        Alert.alert('Error', 'Failed to navigate to profile');
      }
    },
    [navigation],
  );

  const handleGetPost = useCallback(
    async (postId: string) => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (!savedToken) {
          throw new Error('User token not found');
        }

        const response = await get(
          `ugc/get-specific-ugc/${postId}`,
          undefined,
          savedToken,
        );

        if (response?.ugcs?.length > 0) {
          response.ugcs.forEach((post: any) => {
            if (post._id) {
              dispatch(
                setLikeStatus({
                  postId: post._id,
                  isLiked: post.isLiked || false,
                  likeCount: post.likes || 0,
                }),
              );
              dispatch(
                setCommentCount({
                  postId: post._id,
                  commentCount: post.commentsCount || 0,
                }),
              );
            }
          });
          routeToPost(navigation, response?.ugcs, 0, savedToken);
        } else {
          throw new Error('Post not found');
        }
      } catch (error) {
        console.error('Error in handleGetPost:', error);
        Alert.alert('Error', 'Unable to fetch post data');
      }
    },
    [navigation, dispatch],
  );

  const handleGetProject = useCallback(
    async (projectId: string) => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        if (!savedToken) {
          throw new Error('User token not found');
        }

        const response = await get(
          `project/get-project/${projectId}`,
          undefined,
          savedToken,
        );

        if (response?.project) {
          const accountType =
            (await AsyncStorage.getItem('accountType')) || 'user';
          routeToProject(navigation, response.project, accountType, savedToken);
        } else {
          throw new Error('Project not found');
        }
      } catch (error) {
        console.error('Error in handleGetProject:', error);
        Alert.alert('Error', 'Unable to fetch project data');
      }
    },
    [navigation],
  );

  const handleGetCircle = useCallback(async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      (navigation as any).navigate('RatingsAndReviews', {profile: userData});
    } catch (error) {
      console.error('Error in handleGetCircle:', error);
      Alert.alert('Error', 'Unable to navigate to circle details');
    }
  }, [navigation]);

  const handleNotificationNavigation = useCallback(
    async (data: NotificationData) => {
      try {
        console.log('🚀 NAVIGATING WITH DATA:', JSON.stringify(data, null, 2));
        
        // Handle chat/message notification if user_info is present
        if (data.user_info) {
          try {
            const room = JSON.parse(data.user_info);
            console.log('💬 Navigating to chat with room:', room);
            
            // Clear this specific notification data immediately to prevent reuse
            if (data.messageId) {
              notificationDataMap.current.delete(data.messageId);
              const storageKey = `notification_${data.messageId}`;
              await AsyncStorage.removeItem(storageKey);
              console.log('🧹 Cleared used chat notification data');
            }
            
            navigation.navigate('privateChat', {roomData: room});
            return;
          } catch (err) {
            console.error(
              'Failed to parse user_info for chat notification:',
              err,
            );
          }
        }

        const savedToken = await AsyncStorage.getItem('userToken');
        if (!savedToken) {
          throw new Error('User token not found');
        }

        switch (data.screen) {
          case 'POSTS':
            if (data.postId || data.post_id) {
              await handleGetPost(data.postId || data.post_id || '');
            }
            break;
          case 'PROJECTS':
            if (data.projectId || data.project_id) {
              await handleGetProject(data.projectId || data.project_id || '');
            }
            break;
          case 'CIRCLES':
            await handleGetCircle();
            break;
          case 'PROFILE':
            if (data.followerId) {
              await routeToProfile(data.followerId, data.accountType || '');
            }
            break;
          default:
            console.log('Unknown screen type:', data.screen);
        }
        
        // Clear the used notification data
        if (data.messageId) {
          notificationDataMap.current.delete(data.messageId);
          const storageKey = `notification_${data.messageId}`;
          await AsyncStorage.removeItem(storageKey);
          console.log('🧹 Cleared used notification data');
        }
      } catch (error) {
        console.error('Error handling notification navigation:', error);
      }
    },
    [handleGetPost, handleGetProject, handleGetCircle, routeToProfile],
  );

  const setupNotificationChannel = useCallback(() => {
    PushNotification.createChannel(
      {
        channelId: 'default-channel-id',
        channelName: 'Default Channel',
        channelDescription: 'Default notification channel',
        soundName: 'default',
        importance: Importance.HIGH,
        vibrate: true,
      },
      (created: boolean) => console.log(`Channel created: ${created}`),
    );
  }, []);

  useEffect(() => {
    console.log('📱 Initializing push notification listeners...');

    // Initialize notification channel
    setupNotificationChannel();

    // Foreground notification handler
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('🔥 FOREGROUND NOTIFICATION RECEIVED 🔥');
        console.log(
          '📨 Full message payload:',
          JSON.stringify(remoteMessage, null, 2),
        );
        console.log('📋 Message details:');
        console.log('  - Message ID:', remoteMessage.messageId || 'N/A');
        console.log('  - From:', remoteMessage.from || 'N/A');
        console.log('  - Sent Time:', remoteMessage.sentTime || 'N/A');
        console.log('  - TTL:', remoteMessage.ttl || 'N/A');

        if (remoteMessage.notification) {
          console.log('🔔 Notification payload:');
          console.log('  - Title:', remoteMessage.notification.title || 'N/A');
          console.log('  - Body:', remoteMessage.notification.body || 'N/A');
          console.log(
            '  - Image:',
            (remoteMessage.notification as any).imageUrl || 'N/A',
          );
        } else {
          console.log('📦 Data-only message (no notification payload)');
        }

        if (remoteMessage.data) {
          console.log('📊 Data payload:');
          Object.keys(remoteMessage.data).forEach(key => {
            console.log(`  - ${key}:`, remoteMessage.data![key]);
          });
        } else {
          console.log('❌ No data payload');
        }

        try {
          let uniqueKey = remoteMessage.messageId || `${Date.now()}_${Math.random()}`;
          
          if (remoteMessage.data && remoteMessage.messageId) {
            console.log('💾 Processing notification data...');

            const notificationData: NotificationData = {
              postId: remoteMessage.data.postId as string,
              post_id: remoteMessage.data.post_id as string,
              projectId: remoteMessage.data.postId as string,
              project_id: remoteMessage.data.post_id as string,
              circleId: remoteMessage.data.circleId as string,
              circleType: remoteMessage.data.circleType as string,
              giverId: remoteMessage.data.giverId as string,
              screen: (remoteMessage.data.screen as string) || 'POSTS',
              targetUserId: remoteMessage.data.targetUserId as string,
              type: (remoteMessage.data.type as string) || 'notification',
              userId: (remoteMessage.data.userId as string) || '',
              followerId: remoteMessage.data.followerId as string,
              followingId: remoteMessage.data.followingId as string,
              messageId: remoteMessage.messageId || '',
              accountType: remoteMessage.data.accountType as string,
              user_info: remoteMessage.data.user_info as string,
              timestamp: remoteMessage.sentTime || Date.now(),
            };

            console.log(
              '🔄 Processed notification data:',
              JSON.stringify(notificationData, null, 2),
            );

            // Store in memory map with a unique key
            uniqueKey = remoteMessage.messageId || `${Date.now()}_${Math.random()}`;
            notificationDataMap.current.set(uniqueKey, {
              ...notificationData,
              messageId: uniqueKey, // Ensure consistent messageId
            });
            console.log(
              '📝 Stored notification in memory map, total stored:',
              notificationDataMap.current.size,
            );
            cleanupNotificationMap();

            // Don't store specific notification refs - they cause stale data
            // Just store in memory map and AsyncStorage with unique keys

            // Store in AsyncStorage with unique key
            const storageKey = `notification_${uniqueKey}`;
            await AsyncStorage.setItem(
              storageKey,
              JSON.stringify({...notificationData, messageId: uniqueKey}),
            );
            console.log(
              '💾 Saved notification to AsyncStorage with key:',
              storageKey,
            );
          } else {
            console.log(
              '⚠️ Missing data or messageId, skipping notification processing',
            );
          }

          console.log('🔔 Creating local notification...');
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title,
            message: remoteMessage.notification?.body || '',
            playSound: true,
            soundName: 'default',
            vibrate: true,
            importance: Importance.HIGH,
            priority: 'high',
            data: {
              messageId: uniqueKey, // Use the unique key we created
              user_info: remoteMessage.data?.user_info || '',
              notificationType:
                remoteMessage.notification?.title === 'New Follower'
                  ? 'follower'
                  : remoteMessage.data?.screen === 'PROJECTS'
                  ? 'project'
                  : remoteMessage.data?.screen === 'CIRCLES'
                  ? 'circle'
                  : remoteMessage.data?.user_info
                  ? 'chat'
                  : 'post',
              timestamp: Date.now().toString(),
            },
          });
          console.log('✅ Local notification created successfully');
        } catch (error) {
          console.error('❌ Error processing foreground notification:', error);
        }

        console.log('🔥 FOREGROUND NOTIFICATION PROCESSING COMPLETE 🔥\n');
      },
    );

    // Background notification handler
    messaging().setBackgroundMessageHandler(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('🌙 BACKGROUND NOTIFICATION RECEIVED 🌙');
        console.log(
          '📨 Full background message payload:',
          JSON.stringify(remoteMessage, null, 2),
        );
        console.log('📋 Background message details:');
        console.log('  - Message ID:', remoteMessage.messageId || 'N/A');
        console.log('  - From:', remoteMessage.from || 'N/A');
        console.log('  - Sent Time:', remoteMessage.sentTime || 'N/A');

        if (remoteMessage.notification) {
          console.log('🔔 Background notification payload:');
          console.log('  - Title:', remoteMessage.notification.title || 'N/A');
          console.log('  - Body:', remoteMessage.notification.body || 'N/A');
        }

        if (remoteMessage.data) {
          console.log('📊 Background data payload:');
          Object.keys(remoteMessage.data).forEach(key => {
            console.log(`  - ${key}:`, remoteMessage.data![key]);
          });
        }

        try {
          if (remoteMessage.data && remoteMessage.messageId) {
            console.log('💾 Processing background notification data...');

            const messageId = remoteMessage.messageId;
            const notificationData: NotificationData = {
              postId: remoteMessage.data.postId as string,
              post_id: remoteMessage.data.post_id as string,
              projectId: remoteMessage.data.postId as string,
              project_id: remoteMessage.data.post_id as string,
              circleId: remoteMessage.data.circleId as string,
              circleType: remoteMessage.data.circleType as string,
              giverId: remoteMessage.data.giverId as string,
              screen: (remoteMessage.data.screen as string) || 'POSTS',
              targetUserId: remoteMessage.data.targetUserId as string,
              type: (remoteMessage.data.type as string) || 'notification',
              userId: (remoteMessage.data.userId as string) || '',
              followerId: remoteMessage.data.followerId as string,
              followingId: remoteMessage.data.followingId as string,
              messageId: messageId,
              accountType: remoteMessage.data.accountType as string,
              user_info: remoteMessage.data.user_info as string,
              timestamp: remoteMessage.sentTime || Date.now(),
            };

            console.log(
              '🔄 Processed background notification data:',
              JSON.stringify(notificationData, null, 2),
            );

            const uniqueKey = messageId || `${Date.now()}_${Math.random()}`;
            notificationDataMap.current.set(uniqueKey, {
              ...notificationData,
              messageId: uniqueKey,
            });
            console.log('📝 Stored background notification in memory map');
            cleanupNotificationMap();

            const storageKey = `notification_${uniqueKey}`;
            await AsyncStorage.setItem(
              storageKey,
              JSON.stringify({...notificationData, messageId: uniqueKey}),
            );
            console.log(
              '💾 Saved background notification to AsyncStorage with key:',
              storageKey,
            );
          }

          console.log('🔔 Creating background local notification...');
          const backgroundUniqueKey = remoteMessage.messageId || `${Date.now()}_${Math.random()}`;
          PushNotification.localNotification({
            channelId: 'default-channel-id',
            title: remoteMessage.notification?.title,
            message: remoteMessage.notification?.body || '',
            playSound: true,
            soundName: 'default',
            vibrate: true,
            importance: Importance.HIGH,
            priority: 'high',
            data: {
              messageId: backgroundUniqueKey,
              user_info: remoteMessage.data?.user_info || '',
              notificationType:
                remoteMessage.notification?.title === 'New Follower'
                  ? 'follower'
                  : remoteMessage.data?.screen === 'PROJECTS'
                  ? 'project'
                  : remoteMessage.data?.screen === 'CIRCLES'
                  ? 'circle'
                  : remoteMessage.data?.user_info
                  ? 'chat'
                  : 'post',
              timestamp: Date.now().toString(),
            },
          });
          console.log('✅ Background local notification created successfully');
        } catch (error) {
          console.error('❌ Error processing background notification:', error);
        }

        console.log('🌙 BACKGROUND NOTIFICATION PROCESSING COMPLETE 🌙\n');
      },
    );

    // Handle notification opened from background/quit state
    const unsubscribeOnOpen = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        console.log('🚀 NOTIFICATION OPENED APP FROM BACKGROUND/QUIT 🚀');
        console.log(
          '📨 Opened notification payload:',
          JSON.stringify(remoteMessage, null, 2),
        );

        if (remoteMessage.data) {
          console.log('🔄 Processing opened notification data...');

          const notificationData: NotificationData = {
            postId: remoteMessage.data.postId as string,
            post_id: remoteMessage.data.post_id as string,
            projectId: remoteMessage.data.postId as string,
            project_id: remoteMessage.data.post_id as string,
            circleId: remoteMessage.data.circleId as string,
            circleType: remoteMessage.data.circleType as string,
            giverId: remoteMessage.data.giverId as string,
            screen: (remoteMessage.data.screen as string) || 'POSTS',
            targetUserId: remoteMessage.data.targetUserId as string,
            type: (remoteMessage.data.type as string) || 'notification',
            userId: (remoteMessage.data.userId as string) || '',
            followerId: remoteMessage.data.followerId as string,
            followingId: remoteMessage.data.followingId as string,
            messageId: remoteMessage.messageId || '',
            accountType: remoteMessage.data.accountType as string,
            user_info: remoteMessage.data.user_info as string,
            timestamp: remoteMessage.sentTime || Date.now(),
          };

          console.log('📱 Navigating to:', notificationData.screen);
          console.log(
            '🔄 Navigation data:',
            JSON.stringify(notificationData, null, 2),
          );

          handleNotificationNavigation(notificationData);
        } else {
          console.log('❌ No data in opened notification');
        }

        console.log('🚀 NOTIFICATION OPENED PROCESSING COMPLETE 🚀\n');
      },
    );

    // Check for initial notification (app opened from notification)
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          console.log(
            '🎯 INITIAL NOTIFICATION DETECTED (APP LAUNCHED FROM NOTIFICATION) 🎯',
          );
          console.log(
            '📨 Initial notification payload:',
            JSON.stringify(remoteMessage, null, 2),
          );

          if (remoteMessage?.data) {
            console.log('🔄 Processing initial notification data...');

            const notificationData: NotificationData = {
              postId: remoteMessage.data.postId as string,
              post_id: remoteMessage.data.post_id as string,
              projectId: remoteMessage.data.postId as string,
              project_id: remoteMessage.data.post_id as string,
              circleId: remoteMessage.data.circleId as string,
              circleType: remoteMessage.data.circleType as string,
              giverId: remoteMessage.data.giverId as string,
              screen: (remoteMessage.data.screen as string) || 'POSTS',
              targetUserId: remoteMessage.data.targetUserId as string,
              type: (remoteMessage.data.type as string) || 'notification',
              userId: (remoteMessage.data.userId as string) || '',
              followerId: remoteMessage.data.followerId as string,
              followingId: remoteMessage.data.followingId as string,
              messageId: remoteMessage.messageId || '',
              accountType: remoteMessage.data.accountType as string,
              user_info: remoteMessage.data.user_info as string,
            };

            console.log('📱 Initial navigation to:', notificationData.screen);
            console.log(
              '🔄 Initial navigation data:',
              JSON.stringify(notificationData, null, 2),
            );

            handleNotificationNavigation(notificationData);
          } else {
            console.log('❌ No data in initial notification');
          }

          console.log('🎯 INITIAL NOTIFICATION PROCESSING COMPLETE 🎯\n');
        } else {
          console.log(
            'ℹ️ No initial notification found (app launched normally)',
          );
        }
      })
      .catch(error => {
        console.error('❌ Error getting initial notification:', error);
      });

    // Notification click handler
    const unsubscribePush = PushNotification.configure({
      onNotification: async (notification: any) => {
        console.log('👆 LOCAL NOTIFICATION CLICKED 👆');
        console.log(
          '📨 Clicked notification:',
          JSON.stringify(notification, null, 2),
        );

        // Debug current state
        debugNotificationState();

        try {
          let notificationData: NotificationData | null = null;

          // For chat notifications, handle different data structures
          if (notification.data?.user_info) {
            console.log('💬 Chat notification detected with user_info');
            try {
              const room = JSON.parse(notification.data.user_info);
              console.log('📱 Navigating directly to chat with room data:', room);
              dispatch(setCurrentUserId(room?.user_id))
              // Use the readAll function pattern from the original code
              const handleReadAll = () => {
                const payload = new FormData();
                payload.append('room_id', room?.room_id);
                chatRequest(
                  apiEndPoints.readAll,
                  'POST',
                  payload,
                  'multipart/form-data',
                )
                  .then((res: any) => {
                    navigation.navigate('privateChat', {roomData: room});
                  })
                  .catch(e => {
                    console.error('Read all failed:', e);
                    // Navigate anyway
                    navigation.navigate('privateChat', {roomData: room});
                  })
                  .finally(() => {});
              };
              handleReadAll();

              // Clear all chat notification data to prevent reuse
              const keys = await AsyncStorage.getAllKeys();
              const chatNotificationKeys = keys.filter(key => key.startsWith('notification_'));
              for (const key of chatNotificationKeys) {
                const storedData = await AsyncStorage.getItem(key);
                if (storedData) {
                  const data = JSON.parse(storedData);
                  if (data.user_info) {
                    await AsyncStorage.removeItem(key);
                    if (data.messageId) {
                      notificationDataMap.current.delete(data.messageId);
                    }
                  }
                }
              }
              console.log('🧹 Cleaned up all chat notification data');
              return;
            } catch (err) {
              console.error('Failed to parse user_info from notification click:', err);
            }
          }

          // Fallback for chat notifications based on title pattern (iOS case)
          if (notification.title && notification.title.startsWith('Message from ')) {
            console.log('💬 Chat notification detected by title pattern - finding most recent chat data');
            
            // Find the most recent chat notification data
            let mostRecentChatData: NotificationData | null = null;
            let mostRecentTimestamp = 0;

            // Check memory map first
            for (const [key, data] of notificationDataMap.current.entries()) {
              if (data.user_info && data.timestamp && data.timestamp > mostRecentTimestamp) {
                mostRecentTimestamp = data.timestamp;
                mostRecentChatData = data;
              }
            }

            // If no recent data in memory, check AsyncStorage
            if (!mostRecentChatData) {
              try {
                const keys = await AsyncStorage.getAllKeys();
                const notificationKeys = keys.filter(key => key.startsWith('notification_'));
                
                for (const key of notificationKeys) {
                  const storedData = await AsyncStorage.getItem(key);
                  if (storedData) {
                    const data = JSON.parse(storedData);
                    if (data.user_info && data.timestamp && data.timestamp > mostRecentTimestamp) {
                      mostRecentTimestamp = data.timestamp;
                      mostRecentChatData = data;
                    }
                  }
                }
              } catch (err) {
                console.error('Error searching AsyncStorage for chat data:', err);
              }
            }

            if (mostRecentChatData && mostRecentChatData.user_info) {
              console.log('📦 Found most recent chat data:', mostRecentChatData);
              try {
                const room = JSON.parse(mostRecentChatData.user_info);
                console.log('📱 Navigating to chat with found room data');
                
                const handleReadAll = () => {
                  const payload = new FormData();
                  payload.append('room_id', room?.room_id);
                  chatRequest(
                    apiEndPoints.readAll,
                    'POST',
                    payload,
                    'multipart/form-data',
                  )
                    .then((res: any) => {
                      navigation.navigate('privateChat', {roomData: room});
                    })
                    .catch(e => {
                      console.error('Read all failed:', e);
                      navigation.navigate('privateChat', {roomData: room});
                    })
                    .finally(() => {});
                };
                handleReadAll();

                // Clear all chat notification data
                const keys = await AsyncStorage.getAllKeys();
                const chatNotificationKeys = keys.filter(key => key.startsWith('notification_'));
                for (const key of chatNotificationKeys) {
                  const storedData = await AsyncStorage.getItem(key);
                  if (storedData) {
                    const data = JSON.parse(storedData);
                    if (data.user_info) {
                      await AsyncStorage.removeItem(key);
                      if (data.messageId) {
                        notificationDataMap.current.delete(data.messageId);
                      }
                    }
                  }
                }
                console.log('🧹 Cleaned up all chat notification data');
                return;
              } catch (err) {
                console.error('Failed to parse user_info from found data:', err);
              }
            } else {
              console.log('❌ No recent chat notification data found');
            }
          }

          // For non-chat notifications, use the messageId to find exact data
          if (notification.data?.messageId && notificationDataMap.current.has(notification.data.messageId)) {
            console.log('📝 Found notification data in memory map');
            notificationData = notificationDataMap.current.get(notification.data.messageId) || null;
          } else if (notification.data?.messageId) {
            console.log('🔍 Searching for notification data in AsyncStorage...');
            const storageKey = `notification_${notification.data.messageId}`;
            const storedData = await AsyncStorage.getItem(storageKey);
            if (storedData) {
              console.log('📦 Found stored notification data');
              notificationData = JSON.parse(storedData);
            }
          }

          if (notificationData) {
            console.log('✅ Processing notification navigation with data');
            await handleNotificationNavigation(notificationData);
          } else {
            console.log('❌ No notification data found - this should not happen for new notifications');
          }

        } catch (error) {
          console.error('❌ Error handling notification click:', error);
        }

        console.log('👆 LOCAL NOTIFICATION CLICK PROCESSING COMPLETE 👆\n');
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    console.log('✅ Push notification listeners initialized successfully');

    return () => {
      console.log('🧹 Cleaning up push notification listeners...');
      unsubscribeForeground();
      unsubscribeOnOpen();
      // unsubscribePush();
      console.log('✅ Push notification listeners cleaned up');
    };
  }, [
    handleNotificationNavigation,
    setupNotificationChannel,
    cleanupNotificationMap,
    debugNotificationState,
  ]);

  // Initialize notifications - should be called early in app lifecycle
  const initializeNotifications = async () => {
    try {
      console.log('🚀 Initializing notification system...');

      // Step 1: Request permissions
      const permissionGranted = await requestUserPermission();
      console.log('Permission granted:', permissionGranted);

      if (!permissionGranted) {
        console.warn('⚠️ Notification permissions not granted');
        return {success: false, error: 'Permissions not granted'};
      }

      // Step 2: Wait a bit for permissions to take effect
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Get FCM token
      const token = await getFCMToken();

      if (token) {
        console.log('✅ Notification system initialized successfully');
        return {success: true, token};
      } else {
        console.error('❌ Failed to initialize notification system - no token');
        return {success: false, error: 'Failed to get FCM token'};
      }
    } catch (error) {
      console.error('❌ Error initializing notification system:', error);
      return {
        success: false,
        error: (error as Error)?.message || 'Unknown error',
      };
    }
  };

  return {
    requestUserPermission,
    getFCMToken,
    initializeNotifications,
    clearAllNotificationData,
  };
};

export default usePushNotification;


