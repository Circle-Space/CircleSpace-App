import React, {useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {Notification} from './NotificationList';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {post} from '../../../services/dataRequest';
import RealtiveTime from './RelativeTime';
import {FontFamilies, Color} from '../../../styles/constants';
import {getInitials} from '../../../utils/commonFunctions';
import { routeToOtherUserProfile } from './routingForNotification';
import { useDispatch } from 'react-redux';
import { updateFollowStatus } from '../../../redux/slices/followSlice';

// Update type definition to include optional followerId
interface ExtendedNotificationData {
  accountType?: string;
  postId?: string;
  profilePicture?: string;
  userId?: string;
  userName?: string;
  username?: string;
  isFollowing?: boolean;
  likedByUserId?: any;
  followerId?: string;
  lastName?: string;
  // Circle review specific fields
  circleId?: string;
  circleType?: 'positive' | 'negative';
  giverId?: string;
  giverName?: string;
  review?: string;
  stars?: number;
  // Project specific fields
  projectId?: string;
  thumbnail?: string | string[];
}

// Extend the notification type to use our extended data
interface FollowNotification extends Omit<Notification, 'data'> {
  data: ExtendedNotificationData;
}

interface FollowNotificationCardProps {
  notification: FollowNotification;
  imageLoadStatus?: boolean;
}

const FollowNotificationCard: React.FC<FollowNotificationCardProps> = ({
  notification,
}) => {
  console.log("notification::::::::", notification);
  const navigation = useNavigation<any>(); // Use any for navigation to avoid type issues
  const userId = useCurrentUserId();
  const dispatch = useDispatch();
  const [isFollowing, setIsFollowing] = useState(
    notification?.data?.isFollowing || false
  );

  const routeToProfile = async (id: string, accountType: string) => {
    if (!id) return;
    
    try {
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
      // Silent fail - don't interrupt UX with errors
    }
  };
  
  const followUser = async () => {
    const targetUserId = notification?.data?.followerId;
    console.log("targetUserId ::", targetUserId);
    if (!targetUserId) return;
    
    try {
      const response = await post(
        `user/toggle-follow/${targetUserId}`,
        {},
      );

      console.log('follow user response', response);
      if (response.status === 200) {
        const newFollowStatus = !isFollowing;
        setIsFollowing(newFollowStatus);
        // Update Redux state
        dispatch(updateFollowStatus({ userId: targetUserId, isFollowed: newFollowStatus }));
      }
    } catch (error) {
    }
  };
  
  // Extract data for cleaner code
  const {
    followerId,
    profilePicture,
    userName:username = "someone",
    userName = "",
    lastName = "",
    accountType,
  } = notification?.data || {};
  
  const initials = getInitials(username);

  return (
    <Pressable
      onPress={() => followerId && routeToProfile(followerId, accountType)}
      style={{
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'center',
      }}>
      {profilePicture ? (
        <Image
          style={{
            backgroundColor: '#D9D9D9',
            width: 36,
            height: 36,
            borderRadius: 72,
          }}
          source={{uri: profilePicture}}
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
      <Text
        numberOfLines={4}
        style={{
          fontFamily: FontFamilies.medium,
          fontWeight: '400',
          fontSize: 13,
          maxWidth: '65%',
          width: '60%',
          lineHeight: 18,
          color: "#111",
        }}>
        <Text
          style={{
            fontFamily: FontFamilies.semibold,
            fontWeight: '700',
          }}>
          {username??notification?.data?.senderName}
        </Text>{' '}
        {notification?.message} 
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
        onPress={followUser}
        style={{
          backgroundColor: !isFollowing ? '#1E1E1E' : '#EBEBEB',
          width: '26%',
          height: 36,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 8,
        }}>
        <Text
          style={{
            color: !isFollowing ? '#FFFFFF' : '#1E1E1E',
            fontFamily: FontFamilies.semibold,
            fontWeight: '400',
            fontSize: 12,
          }}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </Pressable>
  );
};

export default FollowNotificationCard;
