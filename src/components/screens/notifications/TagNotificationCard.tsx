import React, {useState, useRef} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import {Notification} from './NotificationList';
import {useNavigation} from '@react-navigation/native';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../../services/dataRequest';
import RealtiveTime from './RelativeTime';
import {FontFamilies, Color} from '../../../styles/constants';
import {getInitials} from '../../../utils/commonFunctions';
import { routeToOtherUserProfile, routeToPost, routeToProject } from './routingForNotification';
import { useDispatch } from 'react-redux';
import { setLikeStatus } from '../../../redux/slices/likeSlice';
import { setCommentCount } from '../../../redux/slices/commentSlice';

interface TagNotificationCardProps {
  notification: Notification;
}

const TagNotificationCard: React.FC<TagNotificationCardProps> = ({
  notification,
}) => {
  console.log("notification:::::::: tag notification ", notification);
  const navigation = useNavigation<any>();
  const userId = useCurrentUserId();
  const [isNavigating, setIsNavigating] = useState(false);
  const lastClickTime = useRef(0);
  const dispatch = useDispatch();

  // Helper function to check if a URL is a video
  const isVideoURL = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Extract relevant data from notification directly
  const {
    profilePicture,
    userName,
    username,
    userId: notificationUserId,
    businessName,
    firstName,
    lastName,
    postId,
    projectId,
    accountType,
    thumbnail,
  } = notification?.data || {};

  const displayName = username || userName || '';

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

      if (notification.data?.screen === 'PROJECTS') {
        const projectId = notification.data?.postId || notification.data?.post_id;
        if (!projectId) {
          console.error('No project ID found in notification');
          return;
        }
        console.log("notification.data?.screen", notification.data?.screen);
        // Handle project navigation
        const response = await get(`project/get-project/${projectId}`, undefined, savedToken);
        console.log("response tag notification card", response);
        if (response?.status === 200 && response?.project) {
          console.log("response tag notification card", response);
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
      } else if (notification.data?.screen === 'POSTS') {
        const response = await get(`ugc/get-specific-ugc/${postId}`, undefined, savedToken);
        console.log("response tag notification card", response);
        
        if (response?.ugcs?.length > 0) {
          // Format the items to match the expected structure in PostDetail
          const formattedItems = response.ugcs.map(post => {
            const formattedDate = post.createdAt ? new Date(post.createdAt).toISOString() : new Date().toISOString();
            
            const userDetails = {
              id: post.posterDetails?.userId || post.posterDetails?._id || '',
              name: post.posterDetails?.firstName || '',
              username: post.posterDetails?.username || '',
              location: post.location || '',
              profilePic: post.posterDetails?.profilePic || '',
              isLiked: post.isLiked !== undefined ? post.isLiked : false,
              isSaved: post.isSaved !== undefined ? post.isSaved : false,
              likeCount: post.likes || 0,
              commentCount: post.commentsCount || 0,
              isFollowed: post.posterDetails?.isFollowed !== undefined 
                ? post.posterDetails.isFollowed 
                : false,
              accountType: post.posterDetails?.accountType || '',
            };
            
            return {
              ...post, // Preserve all original fields first
              imageUrl: post.contentUrl,
              userDetails: userDetails,
              caption: post.caption || '',
              contentType: post.contentType,
              contentUrl: post.contentUrl,
              coverImage: post.coverImage,
              _id: post._id,
              tags: post.tags,
              createdAt: formattedDate,
              // Make sure posterDetails is maintained
              posterDetails: post.posterDetails || {},
              // Include these fields explicitly to ensure they're always available
              likes: post.likes || 0,
              commentsCount: post.commentsCount || 0,
              isLiked: post.isLiked || false,
              isSaved: post.isSaved || false
            };
          });
          
          routeToPost(navigation, formattedItems, 0, savedToken);
        } else {
          Alert.alert('Unable to find post');
        }
      }
    } catch (error) {
      console.error('Error navigating:', error);
    } finally {
      // Reset navigation flag after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
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
      if (!savedToken) {
        setIsNavigating(false);
        return;
      }
      
      // Use the common routing function
      routeToOtherUserProfile(navigation, id, userId === id, savedToken, accountType);
    } catch (error) {
      console.error('Error routing to profile:', error);
    } finally {
      // Reset navigation flag after a delay
      setTimeout(() => {
        setIsNavigating(false);
      }, 1000);
    }
  };

  // Render video icon or thumbnail
  const renderThumbnail = () => {
    // Use thumbnail if available, otherwise fall back to profile picture
    const thumbnailUrl = thumbnail || profilePicture;
    
    if (Array.isArray(thumbnailUrl)) {
      return (
        <View style={{ 
          width: 36, 
          height: 36, 
          flexDirection: thumbnailUrl.length === 2 ? 'column' : 'row', 
          flexWrap: 'wrap',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {thumbnailUrl.slice(0, 4).map((uri: string, index: number) => (
            <Image
              key={index}
              style={{
                width: thumbnailUrl.length === 2 ? '100%' : '50%',
                height: thumbnailUrl.length === 2 ? '50%' : '50%',
              }}
              source={{uri}}
            />
          ))}
        </View>
      );
    } else {
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
      <Pressable
        onPress={() => notificationUserId && routeToProfile(notificationUserId, accountType)}>
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
                color: Color.white,
                fontSize: 16,
                fontFamily: FontFamilies.regular,
              }}>
              {getInitials(
                username,
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
          color: '#111',
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
export default TagNotificationCard;
