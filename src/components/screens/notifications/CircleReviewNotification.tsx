import React, { useState, useEffect } from 'react';
import {View, Image, Text, TouchableOpacity, Pressable} from 'react-native';
import {Notification} from './NotificationList';
import {FontFamilies, Color} from '../../../styles/constants';
import RealtiveTime from './RelativeTime';
import { getInitials } from '../../../utils/commonFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {get} from '../../../services/dataRequest';

interface CircleReviewNotificationProps {
  notification: Notification;
}

const CircleReviewNotification: React.FC<CircleReviewNotificationProps> = ({
  notification,
}) => {
  console.log("notification:::::::: CircleReviewNotification", notification);
  const navigation = useNavigation<any>();
  const [userProfile, setUserProfile] = useState<any>(null);

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const userDataStr = await AsyncStorage.getItem('user');
        
        if (savedToken && userDataStr) {
          const userData = JSON.parse(userDataStr);
          
          // Get user profile details from API
          const profileData = await get(
            `user/get-user-info/${userData._id}`,
            {},
            savedToken
          );
          
          if (profileData?.status === 200 && profileData?.user) {
            setUserProfile(profileData.user);
          } else {
            // Fallback to basic user data from AsyncStorage
            setUserProfile(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const routeToProfile = async (id: string, accountType: string) => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('user');
      const userData = userDataStr ? JSON.parse(userDataStr) : {};
      
      // Determine which profile screen to navigate to
      const isSelfProfile = userData._id === id;
      
      if (!isSelfProfile) {
        if (accountType === 'professional') {
          navigation.navigate('otherBusinessScreen', {
            userId: id,
            isSelf: false
          });
        } else {
          navigation.navigate('otherProfileScreen', {
            userId: id,
            isSelf: false
          });
        }
      } else {
        navigation.navigate('BottomBar', {
          screen: 'ProfileScreen',
          params: {
            isSelf: true
          }
        });
      }
    } catch (error) {
      console.error('Error routing to profile:', error);
    }
  };

  const routeToRatingsAndReviews = async () => {
    try {
      if (!userProfile) {
        const userDataStr = await AsyncStorage.getItem('user');
        const userData = userDataStr ? JSON.parse(userDataStr) : {};
        
        navigation.navigate('RatingsAndReviews', {
          profile: userData
        });
      } else {
        navigation.navigate('RatingsAndReviews', {
          profile: userProfile
        });
      }
    } catch (error) {
      console.error('Error navigating to ratings and reviews:', error);
    }
  };

  const renderStars = (stars: number) => {
    return (
      <View style={{ flexDirection: 'row', marginTop: 4 }}>
        {[...Array(5)].map((_, index) => (
          <Image
            key={index}
            source={
              index < stars
                ? require('../../../assets/icons/starFilled.png')
                : require('../../../assets/icons/starUnfilled.png')
            }
            style={{
              width: 12,
              height: 12,
              marginRight: 2,
              tintColor: index < stars ? Color.black : '#D3D3D3'
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <Pressable
      onPress={routeToRatingsAndReviews}
      style={{
        width: '90%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'center',
      }}>
      <TouchableOpacity
        onPress={() => notification?.data?.giverId && routeToProfile(notification.data.giverId, notification.data.giverAccountType)}
        style={{
          backgroundColor: notification?.data?.circleType === 'positive' ? Color.black : Color.black,
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
          {getInitials(notification?.data?.giverName)}
        </Text>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={3}
          style={{
            fontFamily: FontFamilies.medium,
            fontWeight: '400',
            fontSize: 13,
            lineHeight: 18,
            color: "#111",
          }}>
          <Text
            onPress={() => notification?.data?.giverId && routeToProfile(notification.data.giverId, notification.data.giverAccountType)}
            style={{
              fontFamily: FontFamilies.semibold,
              fontWeight: '700',
            }}>
            {notification?.data?.giverName}
          </Text>{' '}
          <Text>has given you a review</Text>{' '}
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
        {notification?.data?.stars && renderStars(notification?.data?.stars)}
      </View>
    </Pressable>
  );
};

export default CircleReviewNotification; 