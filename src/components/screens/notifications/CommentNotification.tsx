import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import {Notification} from './NotificationList';
import {get} from '../../../services/dataRequest';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import RealtiveTime from './RelativeTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {Color, FontFamilies} from '../../../styles/constants';
import {getInitials} from '../../../utils/commonFunctions';
import { routeToOtherUserProfile, routeToPost, routeToProject } from './routingForNotification';

// Extended interface to properly type the comment notification data
interface CommentNotificationData {
  accountType?: string;
  commentId?: string;
  isLiked?: boolean;
  postId?: string;
  profilePicture?: string | null;
  thumbnail?: string | string[];
  userId?: string;
  userName?: string;
  username?: string;
  screen?: string;
  firstName?: string;
  lastName?: string;
}

interface ExtendedNotification extends Omit<Notification, 'data'> {
  data: CommentNotificationData;
}

interface CommentNotificationCardProps {
  notification: ExtendedNotification;
}

const CommentNotification: React.FC<CommentNotificationCardProps> = ({
  notification,
}) => {
  const userId = useCurrentUserId();
  const navigation = useNavigation<any>();
  const [isNavigating, setIsNavigating] = useState(false);
  const lastClickTime = useRef(0);

  // Helper function to check if a URL is a video
  const isVideoURL = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const routeToProfile = async (id: string, accountType: string) => {
    if (!id) return;
    
    // Prevent multiple rapid clicks
    if (isNavigating) return;
    
    // Implement click throttling (prevent clicks within 1000ms)
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime.current < 1000) {
      return;
    }
    lastClickTime.current = currentTime;
    
    try {
      setIsNavigating(true);
      const savedToken = await AsyncStorage.getItem('userToken');
      const screen = userId !== id ? 'OtherUserProfile' : 'Profile';
      
      if (screen === 'OtherUserProfile') {
        routeToOtherUserProfile(navigation, id, userId === id, savedToken, accountType);
      } else {
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      }
    } catch (error) {
      // Silent fail
    } finally {
      // Reset navigation flag after a short delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  };

  const handleNotificationPress = async () => {
    // Prevent multiple rapid clicks
    if (isNavigating) return;
    
    // Implement click throttling (prevent clicks within 1000ms)
    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime.current < 1000) {
      return;
    }
    lastClickTime.current = currentTime;
    
    try {
      setIsNavigating(true);
      const savedToken = await AsyncStorage.getItem('userToken');
      if (!savedToken) {
        setIsNavigating(false);
        return;
      }
      
      if (notification?.data?.screen === 'PROJECTS') {
        const response = await get(`project/get-project/${notification?.data?.postId}`, undefined, savedToken);
        if (response?.status === 200 && response?.project) {
          routeToProject(navigation, response?.project, response?.project?.accountType, savedToken);
        }
      } else if (notification?.data?.postId) {
        // Handle post navigation
        const response = await get(`ugc/get-specific-ugc/${notification.data.postId}`, undefined, savedToken);
        if (response?.ugcs?.length > 0) {
          routeToPost(navigation, response?.ugcs , 0, savedToken);
        }
      }
    } catch (error) {
      // Silent fail
    } finally {
      // Reset navigation flag after a short delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  };

  // Render video icon or thumbnail
  const renderThumbnail = () => {
    const { thumbnail } = notification?.data || {};
    
    if (Array.isArray(thumbnail)) {
      return (
        <View style={{ 
          width: 36, 
          height: 36, 
          flexDirection: thumbnail.length === 2 ? 'column' : 'row', 
          flexWrap: 'wrap',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {thumbnail.slice(0, 4).map((uri: string, index: number) => (
            <Image
              key={index}
              style={{
                width: thumbnail.length === 2 ? '100%' : '50%',
                height: thumbnail.length === 2 ? '50%' : '50%',
              }}
              source={{uri}}
            />
          ))}
        </View>
      );
    } else {
      // Check if it's a video URL
      if (isVideoURL(thumbnail)) {
        return (
          <View style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: '#F0F0F0',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Default video icon - play triangle */}
            <View style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderLeftWidth: 12,
              borderRightWidth: 0,
              borderBottomWidth: 8,
              borderTopWidth: 8,
              borderLeftColor: '#555',
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderTopColor: 'transparent',
            }} />
          </View>
        );
      }
      
      // Default image thumbnail
      return (
        <Image
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
          }}
          source={{
            uri: thumbnail || 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
          }}
        />
      );
    }
  };

  // Extract data for cleaner code
  const {
    profilePicture,
    username = "",
    userName = "",
    userId: notificationUserId,
    firstName = "",
    lastName = "",
    accountType,
  } = notification?.data || {};
  
  const displayName = username || userName || "";
  const initials = getInitials(username);

  return (
    <Pressable
      onPress={handleNotificationPress}
      style={{
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'center',
      }}>
      <Pressable onPress={() => notificationUserId && routeToProfile(notificationUserId, accountType)}>
        {profilePicture ? (
          <Image
            style={{
              backgroundColor: '#D9D9D9',
              width: 36,
              height: 36,
              borderRadius: 72,
            }}
            source={{
              uri: profilePicture,
            }}
          />
        ) : (
          <View
            style={{
              backgroundColor: Color.black,
              width: 36,
              height: 36,
              borderRadius: 72,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#fff',
                fontSize: 16,
                fontFamily: FontFamilies.regular,
              }}>
              {initials}
            </Text>
          </View>
        )}
      </Pressable>
      <Text
        numberOfLines={3}
        style={{
          fontFamily: FontFamilies.medium,
          fontWeight: '400',
          fontSize: 13,
          width: '70%',
          minHeight: '65%',
          lineHeight: 18,
          color: "#111",
        }}>
        <Text
          style={{
            fontFamily: FontFamilies.semibold,
            fontWeight: '700',
          }}
          onPress={() => notificationUserId && routeToProfile(notificationUserId, accountType)}>
          {displayName}
        </Text>{' '}
        {notification?.message}{' '}
        {'\n'}
        <Text style={{
          fontFamily: FontFamilies.regular,
          fontSize: 12,
          color: '#666',
          marginTop: 4,
        }}>
          <RealtiveTime updatedAt={notification?.createdAt} />
        </Text>
        {/* {<RealtiveTime updatedAt={notification?.createdAt} />} */}
      </Text>
      <TouchableOpacity
        onPress={handleNotificationPress}
        style={{
          width: '18%',
          height: 36,
          alignItems: 'flex-end',
          borderRadius: 8,
        }}>
        {renderThumbnail()}
      </TouchableOpacity>
    </Pressable>
  );
};

export default CommentNotification;
