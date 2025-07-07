/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef} from 'react';
import {View, Image, Text, TouchableOpacity, Pressable} from 'react-native';
import {Notification} from './NotificationList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import RealtiveTime from './RelativeTime';
import {get} from '../../../services/dataRequest';
import { FontFamilies, Color } from '../../../styles/constants'
import { getInitials } from '../../../utils/commonFunctions'; 
import { routeToOtherUserProfile, routeToPost, routeToProject } from './routingForNotification';
import { useDispatch } from 'react-redux';
import { setLikeStatus } from '../../../redux/slices/likeSlice';
import { setCommentCount } from '../../../redux/slices/commentSlice';

interface LikedNotificationCardProps {
  notification: Notification;
}

const LikedNotificationCard: React.FC<LikedNotificationCardProps> = ({
  notification,
}) => {
  console.log("notification:::::::: liked notification ", notification);
  const navigation = useNavigation<any>();
  const userId = useCurrentUserId();
  // const [userProfile, setUserProfile] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const lastClickTime = useRef(0);
  const dispatch = useDispatch();

  // useEffect(() => {
  //   const fetchUserProfile = async () => {
  //     try {
  //       const savedToken = await AsyncStorage.getItem('userToken');
  //       if (savedToken && notification?.data?.likedByUserId) {
  //         const profileData = await get(
  //           `user/get-user-info/${notification.data.likedByUserId}`,
  //           {},
  //           savedToken,
  //         );
  //         if (profileData.status === 200) {
  //           setUserProfile(profileData?.user);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user profile:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserProfile();
  // }, [notification?.data?.likedByUserId]);

  // Helper function to check if a URL is a video
  const isVideoURL = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
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

      // Check if it's a project notification
      const isProjectNotification = notification.data?.screen === 'PROJECTS' || 
                                  notification.message.includes("liked your project.");

      if (isProjectNotification) {
        // Handle project navigation
        const projectId = notification.data?.postId || notification.data?.post_id;
        if (!projectId) {
          console.error('No project ID found in notification');
          return;
        }

        const response = await get(`project/get-project/${projectId}`, undefined, savedToken);
        if (response?.status === 200 && response?.project) {
          // Update Redux store with like and comment counts
          if (response.project._id) {
            dispatch(setLikeStatus({
              postId: response.project._id,
              isLiked: response.project.isLiked || false,
              likeCount: response.project.likes || 0
            }));
            
            dispatch(setCommentCount({
              postId: response.project._id,
              commentCount: response.project.commentsCount || 0
            }));
          }
          
          routeToProject(navigation, response?.project, response?.project?.accountType, savedToken);
        }
      } else {
        // Handle post navigation
        const postId = notification.data?.postId || notification.data?.post_id;
        if (!postId) {
          console.error('No post ID found in notification');
          return;
        }

        const response = await get(`ugc/get-specific-ugc/${postId}`, undefined, savedToken);
        if (response?.ugcs?.length > 0) {
          // Update Redux store with like and comment counts
          response.ugcs.forEach((post: any) => {
            if (post._id) {
              dispatch(setLikeStatus({
                postId: post._id,
                isLiked: post.isLiked || false,
                likeCount: post.likes || 0
              }));
              
              dispatch(setCommentCount({
                postId: post._id,
                commentCount: post.commentsCount || 0
              }));
            }
          });
          
          routeToPost(navigation, response?.ugcs, 0, savedToken);
        }
      }
    } catch (error) {
      console.error('Error navigating:', error);
    } finally {
      // Reset navigation flag after a short delay to ensure navigation completes
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  };
  
  const routeToProfile = async (id: any, accountType: string) => {
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
      routeToOtherUserProfile(navigation, id, userId === id, savedToken, accountType);
    } catch (error) {
      console.error('Error routing to profile:', error);
    } finally {
      // Reset navigation flag after a short delay to ensure navigation completes
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  };
  
  // Render video icon or thumbnail
  const renderThumbnail = () => {
    if (Array.isArray(notification?.data?.thumbnail)) {
      return (
        <View style={{ 
          width: 36, 
          height: 36, 
          flexDirection: notification?.data?.thumbnail?.length === 2 ? 'column' : 'row', 
          flexWrap: 'wrap',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {notification?.data?.thumbnail?.slice(0, 4).map((uri:any, index:any) => (
            <Image
              key={index}
              style={{
                width: notification?.data?.thumbnail?.length === 2 ? '100%' : '50%',
                height: notification?.data?.thumbnail?.length === 2 ? '50%' : '50%',
              }}
              source={{ uri }}
            />
          ))}
        </View>
      );
    } else {
      const thumbnailUrl = notification?.data?.thumbnail;
      
      // Check if it's a video URL
      if (isVideoURL(thumbnailUrl)) {
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
            uri: thumbnailUrl ?? 'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
          }}
        />
      );
    }
  };
  
  return (
    <Pressable
      onPress={handleNotificationPress}
      style={{
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
      }}>
      <Pressable onPress={() => routeToProfile(notification?.data?.likedByUserId || notification?.data?.userId, notification?.data?.accountType)}>
        {notification?.data?.profilePicture ? (
          <Image
            style={{
              backgroundColor: '#D9D9D9',
              width: 36,
              height: 36,
              borderRadius: 72,
            }}
            source={{
              uri: notification?.data?.profilePicture,
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
              shadowColor: '#000',
            }}>
            <Text
             style={{
              color: '#fff',
              fontSize: 16,
              fontFamily: FontFamilies.regular,
            }}>
              {getInitials(
                notification?.data?.username,
              )}
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
          flex: 1,
          minHeight: '65%',
          lineHeight: 18,
          color:"#111",
        }}>
        <Text
          style={{
            fontFamily: FontFamilies.semibold,
            fontWeight: '700',
          }}
          onPress={() => routeToProfile(notification?.data?.likedByUserId || notification?.data?.userId, notification?.data?.accountType)}>
          {/* {userProfile?.username || notification?.data?.userName} */}
          {notification?.data?.username??notification?.data?.senderName}
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
      </Text>
      <TouchableOpacity
        onPress={handleNotificationPress}
        style={{
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          marginLeft: 8,
        }}>
        {renderThumbnail()}
      </TouchableOpacity>
    </Pressable>
  );
};

export default LikedNotificationCard;
