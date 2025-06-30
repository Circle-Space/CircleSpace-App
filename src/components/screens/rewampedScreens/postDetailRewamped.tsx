import React, { useCallback, useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, ScrollView, FlatList, Text, ActivityIndicator, Image, Keyboard, BackHandler, Alert, Modal, Platform } from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../../redux/store';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '../../commons/cardComponents/postCard';
import { getInitials } from '../../../utils/commonFunctions';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import Animated, { useSharedValue, withTiming, withRepeat, withSequence, useAnimatedStyle, interpolate, withDelay, Easing, runOnJS, cancelAnimation } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoCard from '../../commons/cardComponents/videoCard';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import SliderCommunity from '@react-native-community/slider';
import ProjectCard from '../../commons/cardComponents/projectCard';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/types';
import { del, get, post } from '../../../services/dataRequest';
import { updatePostFollowStatus, syncFollowStatus } from '../../../redux/slices/feedSlice';
import { updateFollowStatus, setFollowCounts } from '../../../redux/slices/followSlice';

import CustomTaggedUsersBottomSheet from '../../commons/customTaggedUsersBotttomSheet';
import BottomSheet, { BottomSheetFooter, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import CommentList from '../Home/CommentList';
import CommentInputCard from '../Home/CommentInputCard';
import { setCommentReply } from '../../../redux/reducers/chatSlice';
import { updatePostState, toggleSave, updateCommentCount, toggleFollow } from '../../../redux/slices/postSlice';
import { handleSinglePostShare } from '../jobs/utils/utils';
import { FlashList } from '@shopify/flash-list';
import { toggleLike } from '../../../redux/slices/likeSlice';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import { setSaveStatus } from '../../../redux/slices/saveSlice';
import LikedUsersModal from '../../commons/LikedUsersModal';
import CustomLocationModal from '../../commons/customLocationModal';

// Local implementations for missing imports
const LOCAL_API_URL = 'https://your-api-url.com'; // Replace with your actual API URL

const showLocalToast = (message: string) => {
  // Implement your toast functionality here
  console.log(message);
};

// Local implementation of updatePost
const updatePost = (post: any) => {
  // Implement your post update logic here
  return { type: 'UPDATE_POST', payload: post };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostData {
  isFollowed: any;
  userDetails: any;
  tags: string[];
  commentsCount: number;
  savedCount: number;
  shares: number;
  _id: string;
  caption: string;
  contentUrl: string[];
  contentType: string;
  createdAt: string;
  updatedAt?: string;
  likes: number;
  likedBy: string[];
  taggedUsersDetails?: any[];
  location?: string;
  posterDetails: {
    businessName: string;
    firstName: string;
    lastName: string;
    isPaid: boolean;
    accountType: string;
    _id: string;
    username: string;
    profilePic: string;
    isFollowed?: boolean;
  };
  userId: string;
  isLiked: boolean;
  isSaved: boolean;
  title?: string;
  coverImage?: string;
  imageUrl?: string;
}

interface RouteParams {
  posts: PostData[];
  currentIndex: number;
  token?: string;
  profile?: any;
  feed?: 'ugc' | 'project' | 'video';
  onFollowUpdate?: (posts: any[]) => void;
  page?: string;
  navigationStack?: any[];
  entryPost?: PostData;
}

// Update type definition for navigation
type NavigationProp = any;

const formatTimestamp = (timestamp: string) => {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
};

const DANGER_COLOR = '#ED4956';

interface BaseCardProps {
  item: PostData;
  style: any;
  isLiked: boolean;
  isSaved: boolean;
  onLikePress: () => void;
  onSavePress: () => void;
  onPress: () => void;
  feed?: 'ugc' | 'project' | 'video';
}

interface VideoCardProps extends BaseCardProps {
  autoplay?: boolean;
}

interface ProjectCardProps extends BaseCardProps {
  title?: string;
  images?: string[];
}

const windowWidth = Dimensions.get('window').width;
const numColumns = 2;
const horizontalPadding = 6;
const gap = 12;
// Calculate item width based on full screen width minus padding and gap
const itemWidth = (windowWidth - (horizontalPadding * 2) - gap) / 2;

interface UserDetails {
  id: string;
  isFollowed?: boolean;
  username?: string;
  profilePic?: string;
}

interface TaggedUser {
  _id: string;
  username?: string;
  profilePic?: string;
}

interface PostDetailRewampedProps {
  route: {
    params: RouteParams;
  };
}

// Update Skeleton component with shimmer effect
const Skeleton = () => {
  const shimmerValue = useSharedValue(0);

  // Start the shimmer animation only when the component is mounted
  useEffect(() => {
    // Cancel any previous animation and start a new one
    shimmerValue.value = 0;
    
    shimmerValue.value = withRepeat(
      withTiming(1, { 
        duration: 1200, 
        easing: Easing.inOut(Easing.ease) 
      }),
      -1, // Infinite repeat
      true // Reverse on each repeat
    );
    
    // Cleanup function to cancel animation when unmounted
    return () => {
      cancelAnimation(shimmerValue);
    };
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmerValue.value,
            [0, 1],
            [-SCREEN_WIDTH, SCREEN_WIDTH]
          ),
        },
      ],
      opacity: 0.5,
    };
  });

  const getShimmerStyle = (delay: number) => {
    return useAnimatedStyle(() => {
      return {
        opacity: interpolate(
          shimmerValue.value,
          [0, 0.5, 1],
          [0.3, 0.7, 0.3]
        ),
      };
    });
  };

  return (
    <View style={styles.skeletonContainer} testID="skeleton-loader">
      <View style={styles.skeletonMediaContainer}>
        <Animated.View style={[styles.skeletonMedia, getShimmerStyle(0)]} />
        <Animated.View style={[styles.shimmer, shimmerStyle]} />
      </View>
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonUserInfo}>
          <View style={styles.skeletonAvatarContainer}>
            <Animated.View style={[styles.skeletonAvatar, getShimmerStyle(100)]} />
            <Animated.View style={[styles.shimmer, shimmerStyle]} />
          </View>
          <View style={styles.skeletonTextContainer}>
            <View style={styles.skeletonNameContainer}>
              <Animated.View style={[styles.skeletonName, getShimmerStyle(200)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
            <View style={styles.skeletonUsernameContainer}>
              <Animated.View style={[styles.skeletonUsername, getShimmerStyle(300)]} />
              <Animated.View style={[styles.shimmer, shimmerStyle]} />
            </View>
          </View>
        </View>
        <View style={styles.skeletonCaptionContainer}>
          <Animated.View style={[styles.skeletonCaption, getShimmerStyle(400)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
        <View style={styles.skeletonTagsContainer}>
          <Animated.View style={[styles.skeletonTags, getShimmerStyle(500)]} />
          <Animated.View style={[styles.shimmer, shimmerStyle]} />
        </View>
      </View>
    </View>
  );
};

// Add these interfaces for save handling
interface SaveHandlerProps {
  item: PostData;
  onSaveComplete?: () => void;
}

interface SaveModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (collectionInfo: any) => void;
  post: {
    _id: string;
    title?: string;
    url?: string;
    contentType: string;
  };
}

const PostDetailRewamped: React.FC<PostDetailRewampedProps> = ({ route }) => {
  const { posts = [], currentIndex = 0, feed, onFollowUpdate, token, page } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRef = useRef<VideoRef>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State variables
  const [currentPostIndex, setCurrentPostIndex] = useState(currentIndex);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [shouldShowContent, setShouldShowContent] = useState(true);
  const [isPostLoading, setIsPostLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const [activePostStack, setActivePostStack] = useState<number[]>([currentIndex]);
  const [showTaggedUsers, setShowTaggedUsers] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useSharedValue(1);
  const lastActiveIndexRef = useRef<number>(currentIndex);
  const [isProfileNavigationActive, setIsProfileNavigationActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  // Add useIsFocused hook to detect when screen is focused
  const isFocused = useIsFocused();

  // Reset profile navigation flag when returning to this screen
  useEffect(() => {
    if (isFocused && isProfileNavigationActive) {
      setIsProfileNavigationActive(false);
      setIsPostLoading(false);
    }
  }, [isFocused]);

  // Constants
  const CHARACTER_LIMIT = 150;
  const TAG_LIMIT = 3;

  // console.log("currentPost:", currentPost);
  // Redux selectors
  const { followersCount, followingCount } = useSelector((state: any) => state.follow);
  const feedState = useSelector((state: RootState) => state.feed);
  const followState = useSelector((state: RootState) => state.follow);
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
  const commentCounts = useSelector((state: RootState) => state.comment.commentCounts);

  // Get saved posts from Redux
  const currentPost = posts?.[currentPostIndex] || null;
  console.log("currentPost :: 336 ::", currentPost);
  const otherPosts = posts?.filter((_, index) => index !== currentPostIndex) || [];

  // Add cleanup effect
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);
  // Check saved status from Redux
  const currentPostSaved = currentPost ? (savedPosts[currentPost._id] !== undefined ? savedPosts[currentPost._id] : currentPost.isSaved) : false;
  // Add focus effect to handle returning from other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (lastActiveIndexRef.current !== currentPostIndex) {
        setCurrentPostIndex(lastActiveIndexRef.current);
        setIsPostLoading(false);
      }
    });

    return unsubscribe;
  }, [navigation, currentPostIndex]);

  // Update lastActiveIndexRef when currentPostIndex changes
  useEffect(() => {
    lastActiveIndexRef.current = currentPostIndex;
  }, [currentPostIndex]);

  // Add transition animation
  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  // Update handleGoBack to use runOnJS
  const handleGoBack = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    console.log("activePostStack :: 372 ::", activePostStack?.length);
    // If we have more than one item in the stack, pop the last one and go to previous
    if (activePostStack.length > 1) {
      // First fade out smoothly
      fadeAnim.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease
      }, (finished) => {
        if (finished) {
          runOnJS(updatePreviousPost)();
        }
      });
    } else {
      // If we're at the first post, go back to feed wall
      fadeAnim.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease
      }, (finished) => {
        if (finished) {
          runOnJS(goBackToFeed)();
        }
      });
    }
  };

  // Define helper functions for state updates
  const updatePreviousPost = () => {
    // Only update state after animation completes
    const newStack = [...activePostStack];
    console.log("newStack :: 401 ::", newStack);
    newStack.pop(); // Remove current index

    if (newStack.length === 0) {
      // If there's no valid previous index, go back to feed
      goBackToFeed();
      return;
    }

    const previousIndex = newStack[newStack.length - 1];

    // Validate the previous index
    if (previousIndex === undefined || previousIndex < 0 || previousIndex >= posts.length) {
      // If previous index is invalid, go back to feed
      console.log("Invalid previous index, navigating back to feed");
      goBackToFeed();
      return;
    }

    // Update stack and current index
    setActivePostStack(newStack);
    setCurrentPostIndex(previousIndex);
    lastActiveIndexRef.current = previousIndex;
    AsyncStorage.setItem('selectedPostIndex', previousIndex.toString());

    // Fade back in after all updates are applied
    fadeAnim.value = withTiming(1, {
      duration: 200,
      easing: Easing.ease
    }, (finished) => {
      if (finished) {
        runOnJS(setIsTransitioning)(false);
      }
    });
  };

  const goBackToFeed = () => {
    setShouldShowContent(false);
    AsyncStorage.removeItem('selectedPostIndex').then(() => {
      console.log("route?.params?.page :: 434 ::", route?.params?.page);
      if (route?.params?.page === 'otherUserProfile') {
        navigation.navigate('OtherUserProfileRewamped', {
          userId: currentPost?.posterDetails?._id,
          isSelfProfile: false
        });
      } else {
        navigation.goBack();
      }
    });
  };

  // Update hardware back handler with same pattern
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isTransitioning) return true;

      setIsTransitioning(true);

      if (activePostStack.length > 1) {
        // First fade out smoothly
        fadeAnim.value = withTiming(0, {
          duration: 200,
          easing: Easing.ease
        }, (finished) => {
          if (finished) {
            runOnJS(updatePreviousPost)();
          }
        });
        return true;
      }

      // First fade out, then navigate
      fadeAnim.value = withTiming(0, {
        duration: 200,
        easing: Easing.ease
      }, (finished) => {
        if (finished) {
          runOnJS(goBackToFeed)();
        }
      });
      return true;
    });

    return () => {
      backHandler.remove();
      AsyncStorage.removeItem('selectedPostIndex');
    };
  }, [activePostStack, navigation, isTransitioning]);

  // Update activePostStack when currentPostIndex changes
  useEffect(() => {
    if (currentPostIndex !== activePostStack[activePostStack.length - 1]) {
      setActivePostStack(prev => [...prev, currentPostIndex]);
    }
  }, [currentPostIndex]);

  // Add useEffect to sync currentPostIndex with route params
  useEffect(() => {
    setCurrentPostIndex(currentIndex);
  }, [currentIndex]);

  // Add useFocusEffect to handle navigation changes
  useFocusEffect(
    useCallback(() => {
      setCurrentPostIndex(currentIndex);
    }, [currentIndex])
  );

  // Add a useEffect to ensure currentPostIndex is within valid range
  useEffect(() => {
    // Make sure currentPostIndex is a valid index within posts array
    if (posts && posts.length > 0) {
      if (currentPostIndex === undefined || currentPostIndex < 0 || currentPostIndex >= posts.length) {
        console.log("Fixing invalid currentPostIndex:", currentPostIndex);
        setCurrentPostIndex(0);
        lastActiveIndexRef.current = 0;
      }
    }
  }, [posts, currentPostIndex]);

  // Get current post data helpers
  const getLikedStatus = () => {
    if (!currentPost || !currentPost._id) return false;
    return likedPosts[currentPost._id] !== undefined ? likedPosts[currentPost._id] : currentPost.isLiked;
  };

  const getLikeCount = () => {
    if (!currentPost || !currentPost._id) return 0;
    return likeCounts[currentPost._id] !== undefined ? likeCounts[currentPost._id] : (currentPost.likes || 0);
  };

  // Use these functions instead of duplicate declarations
  const currentPostLiked = getLikedStatus();
  const currentPostLikeCount = getLikeCount();

  // Define a function to get the current post directly from the posts array if needed
  const getPostById = (index: number) => {
    if (posts && posts.length > 0 && index >= 0 && index < posts.length) {
      return posts[index];
    }
    return null;
  };

  // Update loading state management
  useEffect(() => {
    console.log("currentPost :: 2297 ::", currentPost);
    console.log("currentPostIndex :: 2298 ::", currentPostIndex);
    console.log("posts :: 2299 ::", posts);

    // Add a loading state immediately
    setIsPostLoading(true);

    // Validate and correct currentPostIndex if needed
    if (posts && posts.length > 0) {
      if (currentPostIndex === undefined || currentPostIndex < 0 || currentPostIndex >= posts.length) {
        console.log("Fixing invalid currentPostIndex:", currentPostIndex);
        setCurrentPostIndex(0);
        return; // This will trigger a re-render with the correct index
      }
    }

    // If posts array is empty or currentPostIndex is invalid, show appropriate message
    if (!posts || posts.length === 0) {
      setIsPostLoading(false);
      setShouldShowContent(false);
      showLocalToast('No posts available');
      return;
    }

    // Try to get post directly from array if currentPost is null
    const directPost = !currentPost && posts.length > 0 && currentPostIndex >= 0 && currentPostIndex < posts.length
      ? posts[currentPostIndex]
      : null;

    // Use either currentPost or the direct post reference
    const activePost = currentPost || directPost;

    if (!activePost) {
      setIsPostLoading(false);
      setShouldShowContent(false);
      showLocalToast('Failed to load post data');
      // navigation.goBack();
      return;
    }

    const initializePost = async () => {
      setIsInitialLoad(true);
      setShouldShowContent(false);

      // Update all states in one go
      setLikeCount(activePost.likes || 0);
      setIsLiked(activePost?.userDetails?.isLiked || false);
      setIsSaved(activePost?.userDetails?.isSaved || false);
      setIsFollowed(activePost?.userDetails?.isFollowed || false);
      setCommentCount(activePost.commentsCount || activePost.userDetails?.commentCount || 0);

      // Check if current user is the post owner
      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;
      const postUsername = activePost?.userDetails?.username
        ? activePost.userDetails.username
        : activePost?.posterDetails?.username;
      const isSelfProfile = currentUser?.username === postUsername;
      setIsSelfProfile(isSelfProfile);

      // Scroll to top when currentPost changes
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      // Add a small delay to ensure smooth transition
      await new Promise(resolve => setTimeout(resolve, 50));
      setIsPostLoading(false);
      setIsInitialLoad(false);
      setShouldShowContent(true);
    };

    initializePost();
  }, [currentPost, currentPostIndex, posts]);

  useEffect(() => {
    if (currentPost?._id) {
      const reduxCommentCount = commentCounts[currentPost._id] || 0;
      setCommentCount(reduxCommentCount);
    }
  }, [currentPost?._id, commentCounts]);

  const handleLikePress = async () => {
    if (!currentPost) return;

    try {
      // Dispatch Redux action to update state immediately
      dispatch(toggleLike(currentPost._id));

      // Make API call
      const response = await post(`ugc/toggle-like/${currentPost._id}`, {});
      console.log('responsepostdetail', response);

      // If API call fails, revert Redux state
      if (response.status !== 200) {
        dispatch(toggleLike(currentPost._id)); // Revert the change
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showLocalToast('Failed to update like status');
    }
  };

  // Add state variable for modal visibility at the beginning of the component with other state declarations
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Add selectedPost state variable near the other state variables
  const [selectedPost, setSelectedPost] = useState<PostData | null>(null);

  // Update the handleSavePress function to use the collection modal


  const handlePostLikePress = async (item: PostData) => {
    try {
      // Update Redux state immediately
      dispatch(toggleLike(item._id));

      // Make API call
      const response = await post(`ugc/toggle-like/${item._id}`, {});

      // If API call fails, revert Redux state
      if (response.status !== 200) {
        dispatch(toggleLike(item._id)); // Revert the change
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showLocalToast('Failed to update like status');
    }
  };

  const handleSavePress = async (isCardSave = false, item?: PostData) => {
    try {
      // Determine which post to save based on whether it's a card save or current post save
      const postToSave = isCardSave ? item : currentPost;
      if (!postToSave) return;

      const isSavedInRedux = savedPosts[postToSave._id] || false;

      if (isSavedInRedux) {
        // If already saved, perform unsave operation
        dispatch(setSaveStatus({ postId: postToSave._id, isSaved: false }));

        // Make API call to remove from collection
        const response = await del(`collections/remove-item/${postToSave._id}`);
        console.log("Unsave response:", response);

        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: postToSave._id, isSaved: true }));
          throw new Error('Failed to remove from collection');
        }

        // showLocalToast('Removed from collection');
      } else {
        // If not saved, open the collection selector modal
        if (isCardSave) {
          // For card saves, use the card's save functionality
          setSelectedPost(postToSave);
          setIsModalVisible(true);
        } else {
          // For current post saves, use the current post's save functionality
          setSelectedPost(currentPost);
          setIsModalVisible(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleSaveToCollection = async (collectionInfo: any) => {
    try {
      console.log("Collection info received:", collectionInfo);

      // Use the selected post (either from card or current post)
      const postToSave = selectedPost;
      if (!postToSave) return;

      // Update Redux state immediately for better UX
      dispatch(setSaveStatus({ postId: postToSave._id, isSaved: true }));

      // Check if this is a new collection creation
      if (!collectionInfo.isNewCollection) {
        const id = collectionInfo?.collectionInfo?.collectionId;
        console.log("Collection ID:", id, "Post ID:", postToSave._id, "Content type:", postToSave?.contentType);

        if (!id) {
          console.error("Missing collection ID");
          throw new Error("Missing collection ID");
        }

        const itemType = selectedPost?.contentType === "ugc" ? 'photo' : selectedPost?.contentType;
        console.log("Item type:", itemType);

        // Make API call only for existing collections
        const response = await post(`collections/add-item/${id}`, {
          itemId: postToSave._id,
          itemType: itemType
        });

        console.log("Save response:", response);

        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: postToSave._id, isSaved: false }));
          throw new Error('Failed to add to collection');
        }
      } else {
        console.log("Skipping API call for new collection - item already added during collection creation");
      }

      // Update all posts in the list with the new save state
      if (route.params.onFollowUpdate && Array.isArray(posts)) {
        const updatedPosts = posts.map(post => {
          if (post._id === postToSave._id) {
            return { ...post, isSaved: true };
          }
          return post;
        });
        route.params.onFollowUpdate(updatedPosts);
      }

      // showLocalToast('Added to collection');
    } catch (error) {
      console.error('Error saving to collection:', error);
      Alert.alert('Error', 'Failed to add to collection');
    } finally {
      setIsModalVisible(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handlePostNavigation = (item: PostData, type: 'video' | 'ugc') => {
    // First pause and mute any current video before navigating
    if (videoRef.current) {
      videoRef.current.pause();
      setIsMuted(true);
    }
    
    const newIndex = posts.findIndex(post => post._id === item._id);
    
    // Set active item for animation
    setActiveItemId(item._id);
    
    // Use push to maintain stack and allow proper back navigation
    navigation.push('PostDetailRewamped', {
      posts: posts,
      currentIndex: newIndex,
      token: token,
      feed: type,
      page: 'feed',
      navigationStack: route.params?.navigationStack || []
    });

    // Then scroll to top after a small delay to ensure the new post is loaded
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      // Reset active item after animation
      setTimeout(() => {
        setActiveItemId(null);
      }, 300);
    }, 50);
  };

  // Add useFocusEffect to handle back navigation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Check if we have a navigation stack and entry post
        if (route.params?.navigationStack?.length > 0) {
          const lastStackItem = route.params.navigationStack[route.params.navigationStack.length - 1];
          
          if (lastStackItem.type === 'profile' && route.params.entryPost) {
            // Navigate back to the entry post
            navigation.replace('PostDetailRewamped', {
              posts: [route.params.entryPost],
              currentIndex: 0,
              token: token,
              profile: route.params.entryPost.posterDetails,
              isSelfProfile: false,
              navigationStack: route.params.navigationStack.slice(0, -1),
              fromProfile: true
            });
            return true;
          }
        }
        
        if (navigation.canGoBack()) {
          navigation.goBack();
          return true;
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation, route.params])
  );

  // Add useEffect to handle entry post
  useEffect(() => {
    if (route.params?.entryPost && route.params?.fromProfile) {
      setCurrentPostIndex(0);
      setPosts([route.params.entryPost]);
      setIsLoading(false);
    }
  }, [route.params?.entryPost, route.params?.fromProfile]);

  const renderPostItem = ({ item }: { item: PostData }) => {
    const isLikedFromRedux = likedPosts[item._id] !== undefined ? likedPosts[item._id] : item.isLiked;
    const likeCountFromRedux = likeCounts[item._id] !== undefined ? likeCounts[item._id] : item.likes || 0;
    const isSavedFromRedux = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;
    const isActive = activeItemId === item._id;

    if (item?.contentType === 'video') {
      return (
        <Animated.View style={[
          styles.gridItem,
          isActive && styles.activeItem
        ]}>
          <VideoCard
            item={item}
            style={styles.gridItem}
            isLiked={isLikedFromRedux}
            isSaved={isSavedFromRedux}
            onLikePress={() => handlePostLikePress(item)}
            onSavePress={() => handleSavePress(true, item)}
            onPress={() => {
              setIsPlaying(false);
              if (videoRef.current) {
                videoRef.current.pause();
                setIsMuted(true);
              }
              handlePostNavigation(item, 'video');
            }}
            autoplay={false}
          />
        </Animated.View>
      );
    } else if (item?.contentType === 'project') {
      return (
        <Animated.View style={[
          styles.gridItem,
          isActive && styles.activeItem
        ]}>
          <ProjectCard
            images={Array.isArray(item.contentUrl) ? item.contentUrl : [item.contentUrl]}
            style={styles.gridItem}
            title={item.title || ''}
            isLiked={isLikedFromRedux}
            isSaved={isSavedFromRedux}
            onLikePress={() => handlePostLikePress(item)}
            onSavePress={() => handleSavePress(true, item)}
            onPress={() => {
              // First pause and mute any current video before navigating
              if (videoRef.current) {
                videoRef.current.pause();
                setIsMuted(true);
              }
              navigation.navigate('ProjectDetailRewamped', {
                feed: item,
                accountType: item.posterDetails?.accountType,
                token: token,
                pageName: 'feed'
              });
            }}
            pageName="feed"
          />
        </Animated.View>
      );
    } else {
      return (
        <Animated.View style={[
          styles.gridItem,
          isActive && styles.activeItem
        ]}>
          <PostCard
            item={item}
            style={styles.gridItem}
            isLiked={isLikedFromRedux}
            isSaved={isSavedFromRedux}
            likeCount={likeCountFromRedux}
            onLikePress={() => handlePostLikePress(item)}
            onSavePress={() => handleSavePress(true, item)}
            onPress={() => {
              // First pause and mute any current video before navigating
              if (videoRef.current) {
                videoRef.current.pause();
                setIsMuted(true);
              }
              handlePostNavigation(item, 'ugc');
            }}
          />
        </Animated.View>
      );
    }
  };

  // Add this useEffect to handle video state changes
  useEffect(() => {
    if (currentPost?.contentType === 'video') {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [currentPostIndex, currentPost?.contentType]);

  // Add this useEffect to force re-render when currentPost changes
  useEffect(() => {
    // This will force the FlatList to re-render when currentPost changes
    if (currentPost) {
      // Force re-render by updating a dummy state
      setLoading((prevLoading: boolean) => !prevLoading);
    }
  }, [currentPost]);

  const handleTap = () => {
    if (!posts || posts.length === 0) return;

    // First pause and mute any current video before navigating
    if (videoRef.current) {
      videoRef.current.pause();
      setIsMuted(true);
    }

    // Get all images from all posts
    const allImages = posts.flatMap(post =>
      Array.isArray(post.contentUrl) ? post.contentUrl : [post.contentUrl]
    );

    // Find the index of the current post's first image in the allImages array
    const initialIndex = allImages.findIndex((img: string | string[]) => {
      if (typeof img === 'string') return img === currentPost?.contentUrl[0];
      if (Array.isArray(img)) return img.includes(currentPost?.contentUrl[0]);
      return false;
    });

    // Create a structured array of items with all necessary details
    const items = posts.map(post => {
      const posterDetails = Array.isArray(post.posterDetails) ? post.posterDetails[0] : post.posterDetails;
      const userDetails = Array.isArray(post.userDetails) ? post.userDetails[0] : post.userDetails;
      return {
        id: post._id,
        imageUrl: Array.isArray(post.contentUrl) ? post.contentUrl[0] : post.contentUrl,
        userDetails: {
          id: userDetails?.id || '',
          name: userDetails?.name && userDetails.name.trim() !== ''
            ? userDetails.name
            : posterDetails?.firstName && posterDetails?.lastName
              ? `${posterDetails.firstName} ${posterDetails.lastName}`
              : posterDetails?.businessName || '',
          username: posterDetails?.username || userDetails?.username || '',
          location: post?.location || '',
          profilePic: posterDetails?.profilePic || userDetails?.profilePic || '',
          isLiked: Boolean(userDetails?.isLiked),
          isSaved: Boolean(userDetails?.isSaved),
          likeCount: Number(userDetails?.likeCount) || 0,
          commentCount: Number(userDetails?.commentCount) || 0
        },
        contentType: post?.contentType || '',
        caption: post?.caption || ''
      };
    });

    navigation.navigate('FullScreenLayout', {
      items,
      initialIndex: typeof currentPostIndex !== 'undefined' ? currentPostIndex : (initialIndex >= 0 ? initialIndex : 0),
      type: 'post',
      projectId: currentPost?._id,
      token: token
    });
  };

  const openTaggedUsersList = () => {
    setShowTaggedUsers(true);
  };

  const handleOpenComments = () => {
    Keyboard.dismiss(); // Dismiss any active keyboard
    setOpenComments(true);
  };


  const renderTaggedUsers = () => {
    if (!currentPost.taggedUsersDetails || currentPost.taggedUsersDetails.length === 0) return null;

    return (
      <TouchableOpacity
        style={styles.taggedUsersContainer}
        onPress={openTaggedUsersList}
      >
        <View style={styles.taggedUsersIcon}>
          <Image
            source={require('../../../assets/icons/tagIcon.png')}
            style={styles.tagIcon}
          />
        </View>
        <Text style={styles.taggedUsersText}>
          {currentPost.taggedUsersDetails.length} {currentPost.taggedUsersDetails.length === 1 ? 'person' : 'people'} tagged
        </Text>
      </TouchableOpacity>
    );
  };

  const renderCaption = () => {

    if (!currentPost?.caption) return null;

    const shouldShowMore = currentPost.caption.length > CHARACTER_LIMIT;
    const displayText = showFullCaption
      ? currentPost.caption
      : currentPost.caption.slice(0, CHARACTER_LIMIT);

    return (
      <TouchableOpacity style={styles.captionContainer} activeOpacity={1}>
        <Text style={styles.caption}>
          {displayText}
          {shouldShowMore && !showFullCaption && <Text>...</Text>}
          {shouldShowMore && (
            <Text
              style={styles.moreText}
              onPress={() => setShowFullCaption(!showFullCaption)}>
              {showFullCaption ? '  less' : 'more'}
            </Text>
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      videoRef.current.seek(value);
      setCurrentTime(value);
    }
  };

  const toggleFullScreen = () => {
    if (currentPost?.contentType === 'video') {
      // First pause and mute the current video before navigating
      if (videoRef.current) {
        // Fix: Use pause() method that exists on VideoRef instead of setNativeProps
        videoRef.current.pause();
        setIsMuted(true); // Use state setter instead as VideoRef doesn't have direct mute method
      }
      
      const posterDetails = currentPost.posterDetails;
      const userDetails = Array.isArray(currentPost.userDetails) ? currentPost.userDetails[0] : currentPost.userDetails;

      (navigation as any).navigate('VideoFullScreenRewamped', {
        items: [{
          imageUrl: Array.isArray(currentPost.contentUrl) ? currentPost.contentUrl[0] : currentPost.contentUrl,
          userDetails: {
            id: posterDetails?._id || userDetails?._id || '',
            name: posterDetails?.firstName && posterDetails?.lastName
              ? `${posterDetails.firstName} ${posterDetails.lastName}`
              : posterDetails?.businessName || userDetails?.businessName || userDetails?.name || '',
            username: posterDetails?.username || userDetails?.username || '',
            location: currentPost?.location || '',
            profilePic: posterDetails?.profilePic || userDetails?.profilePic || '',
            isLiked: Boolean(userDetails?.isLiked),
            isSaved: Boolean(userDetails?.isSaved),
            likeCount: Number(userDetails?.likeCount) || 0,
            commentCount: Number(userDetails?.commentCount) || 0
          },
          caption: currentPost?.caption || ''
        }],
        initialIndex: 0,
        type: 'post',
        projectId: currentPost?._id,
        token: token
      });
    } else {
      setIsFullScreen(!isFullScreen);
      if (videoRef.current) {
        videoRef.current.presentFullscreenPlayer();
      }
    }
  };

  const renderTags = () => {
    if (!currentPost?.tags || !Array.isArray(currentPost.tags) || currentPost.tags.length === 0) {
      return null;
    }

    const filteredTags = currentPost.tags.filter((tag: string) => tag.trim() !== '');
    const displayTags = showAllTags ? filteredTags : filteredTags.slice(0, TAG_LIMIT);
    const hasMoreTags = filteredTags.length > TAG_LIMIT;

    // Fix the navigation function with type assertion
    const routeToTagResults = (tag: string) => {
      // Navigate to the TagResultsScreen with the tag as query parameter
      if (navigation) {
        (navigation as any).navigate('TagResultScreenRewamped', { query: tag });
      }
    };

    return (
      <View style={styles.tagsContainer}>
        <View style={styles.tagsWrapper}>
          {displayTags.map((tag: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.tagButton}
              onPress={() => routeToTagResults(tag)}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
          {hasMoreTags && (
            <TouchableOpacity
              style={styles.moreTagsButton}
              onPress={() => setShowAllTags(!showAllTags)}
            >
              <Text style={styles.moreText}>
                {showAllTags ? 'less..' : `+${filteredTags.length - TAG_LIMIT}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Add this function to handle modal visibility
  const toggleOptionsModal = () => {
    setShowOptionsModal(!showOptionsModal);
  };

  // Add this function to handle scroll events
  const handleScroll = () => {
    // Pause and mute video when scrolling if the current item is a video
    if (currentPost?.contentType === 'video' && videoRef.current) {
      videoRef.current.pause();
      setIsMuted(true);
    }
    
    if (showOptionsModal) {
      setShowOptionsModal(false);
    }
  };

  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const handleReportOptionSelect = async (reason: any) => {
    try {
      const payload = {
        postId: currentPost?._id,
        reason,
      };
      const response = await post('report/post', payload);
      if (response.status === 200) {
        Alert.alert(
          'Success',
          'Thanks for your feedback!\n We use these reports to show you less of this kind of content in the future.',
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to report post');
    } finally {
      setIsReportModalVisible(false);
    }
  };

  // Add this function to handle option selection
  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'report':
        setIsReportModalVisible(true);
        // Handle report action
        break;
      case 'download':
        // Handle download action
        break;
      case 'share':
        handleSinglePostShare(currentPost);
        break;
      default:
        break;
    }
    setShowOptionsModal(false);
  };

  const updateCommentCount = (postId: string, increment = true) => {
    setCommentCount(prev => increment ? prev + 1 : prev - 1);

    // Update the post in the posts array
    const updatedPosts = [...posts];
    if (currentPostIndex >= 0 && currentPostIndex < updatedPosts.length) {
      updatedPosts[currentPostIndex] = {
        ...currentPost,
        commentsCount: increment ? (currentPost.commentsCount || 0) + 1 : (currentPost.commentsCount || 0) - 1,
        userDetails: {
          ...currentPost.userDetails,
          commentCount: increment ? (currentPost.userDetails?.commentCount || 0) + 1 : (currentPost.userDetails?.commentCount || 0) - 1
        }
      };
      dispatch(updatePost(updatedPosts[currentPostIndex]));
    }
  };

  const handleCloseCommentModal = () => {
    setShowCommentModal(false);
  };


  const routeToEditPost = (item: PostData) => {
    navigation.navigate('EditPostRewamped', {
      draft: {
        _id: item._id,
        caption: item.caption,
        contentUrl: Array.isArray(item.contentUrl) ? item.contentUrl[0] : item.contentUrl,
        contentType: item.contentType,
        tags: item.tags,
        userDetails: {
          location: item.location || ''
        },
        post : item
      }
    });
  };

  const getCurrentUserDetails = (post: any) => {

    // If userDetails exists and is an object, return it
    if (post?.userDetails && typeof post.userDetails === 'object' && !Array.isArray(post.userDetails)) {
      return post.userDetails;
    }

    // If userDetails exists and is an array, return first item
    if (Array.isArray(post?.userDetails) && post.userDetails.length > 0) {
      return post.userDetails[0];
    }

    // If posterDetails exists and is an array, return first item
    if (Array.isArray(post?.posterDetails) && post.posterDetails.length > 0) {
      return post.posterDetails[0];
    }

    // If posterDetails exists and is an object, return it
    if (post?.posterDetails && typeof post.posterDetails === 'object' && !Array.isArray(post.posterDetails)) {
      return post.posterDetails;
    }

    return null;
  };

  // Initialize follow state from feed data and Redux
  useEffect(() => {
    console.log("[PostDetail] Feed data changed:", {
      feedId: currentPost?._id,
      postedByUserId: currentPost?.userDetails?.id,
      isFollowed: currentPost?.userDetails?.isFollowed,
      reduxFollowState: feedState.userFollowStatus[currentPost?.userDetails?.id]
    });

    if (currentPost?.userDetails?.id) {
      // First check Redux state
      const reduxFollowState = feedState.userFollowStatus[currentPost.userDetails.id];

      if (reduxFollowState !== undefined) {
        console.log("[PostDetail] Using Redux follow state:", {
          userId: currentPost.userDetails.id,
          isFollowed: reduxFollowState
        });
        setIsFollowed(reduxFollowState);
      } else if (currentPost?.userDetails?.isFollowed !== undefined) {
        // Fallback to feed data if Redux state doesn't exist
        console.log("[PostDetail] Using feed follow state:", {
          userId: currentPost.userDetails.id,
          isFollowed: currentPost.userDetails.isFollowed
        });
        setIsFollowed(currentPost.userDetails.isFollowed);
        // Sync to Redux
        dispatch(updatePostFollowStatus({
          userId: currentPost.userDetails.id,
          isFollowed: currentPost.userDetails.isFollowed
        }));
      }
    }
  }, [currentPost?.userDetails?.isFollowed, currentPost?.userDetails?.id, feedState.userFollowStatus]);

  // Update follow state when Redux state changes
  useEffect(() => {
    if (feedState.lastUpdatedUserId === currentPost?.userDetails?.id) {
      console.log("[PostDetail] Follow state changed in Redux:", {
        lastUpdatedUserId: feedState.lastUpdatedUserId,
        lastAction: feedState.lastAction,
        postedByUserId: currentPost?.userDetails?.id,
        userFollowStatus: feedState.userFollowStatus
      });

      const isFollowed = feedState.userFollowStatus[currentPost?.userDetails?.id] || false;
      console.log("[PostDetail] Updating local follow state:", {
        userId: currentPost?.userDetails?.id,
        newFollowStatus: isFollowed
      });
      setIsFollowed(isFollowed);
    }
  }, [feedState.lastUpdatedUserId, feedState.lastAction, feedState.userFollowStatus, currentPost?.userDetails?.id]);

  const handleFollowPress = async (userDetails: UserDetails) => {
    if (!userDetails?.id || !currentPost) {
      showLocalToast('Invalid user or post data');
      return;
    }

    // Prevent multiple clicks while processing
    if (followLoading[userDetails.id]) return;

    try {
      // Set loading state for this specific user
      setFollowLoading(prev => ({ ...prev, [userDetails.id]: true }));

      // Get current follow state
      const currentFollowState = currentPost.userDetails?.isFollowed;

      console.log("[PostDetail] Before API call - Current follow state:", {
        isFollowing: currentFollowState,
        userId: userDetails.id,
        postId: currentPost._id,
        timestamp: new Date().toISOString()
      });

      // Make API call
      const response = await post(`user/toggle-follow/${userDetails.id}`, {});
      console.log("[PostDetail] API Response:", response);

      if (response?.status === 200) {
        const newFollowState = !currentFollowState;

        console.log("[PostDetail] Updating follow state:", {
          oldState: currentFollowState,
          newState: newFollowState,
          userId: userDetails.id,
          postId: currentPost._id,
          timestamp: new Date().toISOString()
        });

        // Update Redux feed state
        dispatch(updatePostFollowStatus({
          userId: userDetails.id,
          isFollowed: newFollowState
        }));

        // Sync with other components
        dispatch(syncFollowStatus({
          userId: userDetails.id,
          isFollowed: newFollowState
        }));

        // Update local state
        setIsFollowed(newFollowState);

        // Update follow counts in Redux
        dispatch(setFollowCounts({
          followers: followersCount,
          following: newFollowState ? followingCount + 1 : followingCount - 1
        }));
        console.log("currentPost :: 1288 :: ", newFollowState);
        // Update the current post's userDetails
        if (currentPost.userDetails) {
          currentPost.userDetails.isFollowed = newFollowState;
        }
        console.log("post user details :: 1293 :: ", currentPost.userDetails);
        // Update parent component (FeedWall) if callback exists
        if (route.params?.onFollowUpdate) {
          const updatedPosts = posts.map(post => {
            if (post.posterDetails?._id === userDetails.id) {
              return {
                ...post,
                userDetails: {
                  ...post.userDetails,
                  isFollowed: newFollowState
                },
                posterDetails: {
                  ...post.posterDetails,
                  isFollowed: newFollowState
                }
              };
            }
            return post;
          });
          route.params.onFollowUpdate(updatedPosts);
        }

        console.log("[PostDetail] Follow state update complete:", {
          userId: userDetails.id,
          newFollowState,
          postId: currentPost._id,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(response?.message || 'Failed to update follow status');
      }
    } catch (error) {
      showLocalToast(error instanceof Error ? error.message : 'Failed to update follow status');
      console.error('[PostDetail] Error following user:', error);
    } finally {
      // Clear loading state
      setFollowLoading(prev => ({ ...prev, [userDetails.id]: false }));
    }
  };

  // Fix user profile navigation to maintain state
  const routeToUserProfile = (userId: string) => {
    setIsProfileNavigationActive(true);
    setIsPostLoading(true);

    if (!userId) {
      setIsProfileNavigationActive(false);
      setIsPostLoading(false);
      return;
    }

    // Check if this is the current user
    AsyncStorage.getItem('user')
      .then(userData => {
        if (userData) {
          const currentUser = JSON.parse(userData);
          if (currentUser._id === userId) {
            // This is the current user's profile
            // (navigation as any).navigate('UserProfile', {
            //   userId: userId,
            //   isSelfProfile: true,
            //   token: token || ''
            // });
            navigation.navigate('BottomBar', {
              screen: 'ProfileRewamp',
            });
          } else {
            if (userId) {
              // This is another user's profile
              (navigation as any).navigate('OtherUserProfileRewamped', {
                userId: userId,
                isSelfProfile: false,
                // Add callback to handle return
                onReturn: () => {
                  setIsProfileNavigationActive(false);
                  setIsPostLoading(false);
                }
              });
            }
          }
        }
      })
      .catch(error => {
        console.error('Error getting user data:', error);
        setIsProfileNavigationActive(false);
        setIsPostLoading(false);
      });
  };

  // Add effect to restore state when returning from profile navigation
  useEffect(() => {
    if (isFocused && !isInitialLoad) {
      const restoreState = async () => {
        try {
          const savedState = await AsyncStorage.getItem('postDetailState');
          if (savedState && isProfileNavigationActive) {
            const { currentPostIndex: savedIndex, activePostStack: savedStack } = JSON.parse(savedState);

            // Restore state
            setCurrentPostIndex(savedIndex);
            setActivePostStack(savedStack);
            lastActiveIndexRef.current = savedIndex;

            // Clear navigation flag
            setIsProfileNavigationActive(false);
            setIsPostLoading(false);
          }
        } catch (error) {
          console.error('Error restoring post detail state:', error);
          setIsPostLoading(false);
        }
      };

      restoreState();
    }
  }, [isFocused, isInitialLoad]);

  const [showLikedUsers, setShowLikedUsers] = useState(false);

  const handleLikeCountPress = () => {
    setShowLikedUsers(true);
  };

  // Update the handlePostTransition to use the same pattern
  const handlePostTransition = (newIndex: number) => {
    if (isTransitioning) return;

    // Pause and mute current video before transitioning
    if (currentPost?.contentType === 'video' && videoRef.current) {
      videoRef.current.pause();
      setIsMuted(true);
    }

    setIsTransitioning(true);

    // First fade out
    fadeAnim.value = withTiming(0, {
      duration: 200,
      easing: Easing.ease
    }, (finished) => {
      if (finished) {
        runOnJS(updateToNewPost)(newIndex);
      }
    });
  };

  const updateToNewPost = (newIndex: number) => {
    // Clear any existing timeout
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = undefined;
    }

    // Update state after animation completes
    setCurrentPostIndex(newIndex);
    lastActiveIndexRef.current = newIndex;
    AsyncStorage.setItem('selectedPostIndex', newIndex.toString());

    // Then fade back in
    fadeAnim.value = withTiming(1, {
      duration: 200,
      easing: Easing.ease
    }, (finished) => {
      if (finished) {
        runOnJS(setIsTransitioning)(false);
      }
    });
  };

  // Add a retry mechanism for loading posts
  const retryLoadingPost = () => {
    if (posts && posts.length > 0 && currentPostIndex >= 0 && currentPostIndex < posts.length) {
      setCurrentPostIndex(currentPostIndex); // This will trigger the useEffect above
    }
  };

  // Replace the error container with a retry option
  const renderErrorContainer = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Post is still loading or failed to load</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={retryLoadingPost}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.retryButton, { marginTop: 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.retryButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  // Remove the duplicate safeNavigate declaration 
  const TaggedUsersModal = () => {
    return showTaggedUsers ? (
      <CustomTaggedUsersBottomSheet
        taggedUsers={currentPost?.taggedUsersDetails || []}
        onClose={() => setShowTaggedUsers(false)}
        onTagSelect={(user: any) => {
          setShowTaggedUsers(false);
          navigation.navigate('UserProfile', { userId: user._id });
        }}
        title="Tagged People"
      />
    ) : null;
  };

  // const unsavePost = async (id: string) => {
  //   try {
  //     // Update Redux state immediately for better UX
  //     dispatch(toggleSave(id));

  //     // Update local state
  //     setIsSaved(false);

  //     // Make API call
  //     const response = await del(`collections/remove-item/${id}`);
  //     console.log("response :: 1078 :: remove item ", response);

  //     if (response.status !== 200) {
  //       // If API call fails, revert changes
  //       dispatch(toggleSave(id));

  //       // Revert local state
  //       setIsSaved(true);

  //       throw new Error('Failed to unsave post');
  //     }

  //     showLocalToast('Post unsaved successfully');
  //   } catch (error) {
  //     console.error('Error unsaving post:', error);
  //     showLocalToast('Failed to unsave post');
  //   }
  // };

  // const handleTagSelect = (user: TaggedUser) => {
  //   setShowTaggedUsers(false);
  //   navigation.navigate('OtherUserProfileRewamped', { 
  //     userId: user._id,
  //     isSelfProfile: false
  //   });
  // };

  const unsavePost = async (id: string) => {
    try {
      // Update Redux state immediately for better UX
      dispatch(toggleSave(id));

      // Update local state
      setIsSaved(false);

      // Make API call
      const response = await del(`collections/remove-item/${id}`);
      console.log("response :: 1078 :: remove item ", response);

      if (response.status !== 200) {
        // If API call fails, revert changes
        dispatch(toggleSave(id));

        // Revert local state
        setIsSaved(true);

        throw new Error('Failed to unsave post');
      }

      showLocalToast('Post unsaved successfully');
    } catch (error) {
      console.error('Error unsaving post:', error);
      showLocalToast('Failed to unsave post');
    }
  };

  const handleTagSelect = (user: TaggedUser) => {
    setShowTaggedUsers(false);
    navigation.navigate('OtherUserProfileRewamped', {
      userId: user._id,
      isSelfProfile: false
    });
  };

  const isTagIcon = require('../../../assets/ugcs/isTaggedIcon.png');

  // Add state for location modal
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

  // Add location icon and modal handlers
  const openLocationModal = () => {
    setIsLocationModalVisible(true);
  };

  const closeLocationModal = () => {
    setIsLocationModalVisible(false);
  };

  const renderFooter = useCallback(
    props => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footerContainer}>
        <CommentInputCard
                postId={currentPost?._id}
                token={token}
                onCommentAdded={() => updateCommentCount(currentPost?._id, true)}
              />
        </View>
      </BottomSheetFooter>
    ),
    []
  );

  // Add useEffect to check Redux comment count whenever component mounts or current post changes
  useEffect(() => {
    if (currentPost?._id) {
      const reduxCommentCount = commentCounts[currentPost._id] || 0;
      setCommentCount(reduxCommentCount);
    }
  }, [currentPost?._id, commentCounts]);

  return (
   <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Icon
            name="chevron-back"
            size={16}
            color="#000"
          />
        </TouchableOpacity>
        <Text style={styles.headerUsername}>
          {
            !isSelfProfile ? 'Explore' :
              currentPost?.posterDetails?.username || 'Post Detail'
          }
        </Text>
        {isSelfProfile && currentPost ?
          <View style={styles.headerButtonsContainer}>
            <TouchableOpacity onPress={() => routeToEditPost(currentPost)} style={styles.shareButton}>
              <Image
                source={require('../../../assets/icons/editIcon.png')}
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>
          </View>
          :
          <TouchableOpacity onPress={toggleOptionsModal} style={styles.shareButton}>
            <Icon
              name="ellipsis-vertical"
              size={16}
              color="#000"
            />
          </TouchableOpacity>
        }
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={styles.mainScrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {!currentPost ? (
          renderErrorContainer()
        ) : (!shouldShowContent || isPostLoading || isNavigating || isInitialLoad || isTransitioning) ? (
          <Skeleton />
        ) : (
          <Animated.View style={[styles.mainContent, fadeStyle]}>
            {/* Media Container with Counter */}
            <View style={styles.mediaContainer}>
              {currentPost.contentType === 'video' ? (
                <View style={styles.videoContainer}>
                  <Video
                    ref={videoRef}
                    source={{ uri: Array.isArray(currentPost.contentUrl) ? currentPost.contentUrl[0] : currentPost.contentUrl }}
                    style={styles.mainImage}
                    resizeMode="cover"
                    repeat={true}
                    paused={!isPlaying}
                    muted={isMuted}
                    controls={false}
                    onProgress={({ currentTime }) => setCurrentTime(currentTime)}
                    onLoad={({ duration }) => setDuration(duration)}
                    onEnd={() => setIsPlaying(false)}
                  />
                  <TouchableOpacity
                    style={styles.videoOverlay}
                    activeOpacity={1}
                    onPress={() => setShowControls(!showControls)}
                  >
                    {showControls && (
                      <>
                        <TouchableOpacity
                          style={styles.muteButton}
                          onPress={() => setIsMuted(!isMuted)}
                        >
                          <Icon
                            name={isMuted ? 'volume-mute' : 'volume-high'}
                            size={20}
                            color="#fff"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.playButton}
                          onPress={() => setIsPlaying(!isPlaying)}
                        >
                          <Icon
                            name={isPlaying ? 'pause' : 'play'}
                            size={24}
                            color="#fff"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.fullScreenButton}
                          onPress={toggleFullScreen}
                        >
                          <Icon
                            name={isFullScreen ? 'resize-outline' : 'resize-outline'}
                            size={20}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={handleTap}
                  style={styles.imageContainer}
                >
                  <FastImage
                    source={{
                      uri: Array.isArray(currentPost.contentUrl) ? currentPost.contentUrl[0] : currentPost.contentUrl,
                      priority: FastImage.priority.normal,
                      cache: FastImage.cacheControl.immutable
                    }}
                    style={styles.mainImage}
                    resizeMode="cover"
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => setImageLoadError(true)}
                  />
                  {Array.isArray(currentPost.contentUrl) && currentPost.contentUrl.length > 1 && (
                    <View style={styles.imageCounter}>
                      <Text style={styles.imageCounterText}>
                        1/{currentPost.contentUrl.length}
                      </Text>
                    </View>
                  )}
                  {currentPost?.taggedUsersDetails && currentPost.taggedUsersDetails.length > 0 && (
                    <TouchableOpacity
                      onPress={openTaggedUsersList}
                      style={styles.taggedUsersOverlay}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Image source={isTagIcon} style={styles.taggedUserIcon} />
                    </TouchableOpacity>
                  )}
                  {currentPost?.location && (
                    <TouchableOpacity
                      onPress={openLocationModal}
                      style={[styles.taggedUsersOverlay, { left: currentPost?.taggedUsersDetails?.length ? 50 : 15 }]}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Image
                        source={require('../../../assets/postcard/Location.png')}
                        style={styles.taggedUserIcon}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Action Footer */}
            <View style={styles.actionFooter}>
              <View style={styles.actionLeft}>
                <View style={styles.actionItem}>
                  <TouchableOpacity onPress={handleLikePress}>
                    <Image
                      source={currentPostLiked
                        ? require('../../../assets/postcard/likeFillIcon.png')
                        : require('../../../assets/postcard/likeIcon.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleLikeCountPress} style={{ paddingHorizontal: 10, borderRadius: 10 }}>
                    <Text style={styles.actionCount}>{currentPostLikeCount}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.actionItem}>
                  <TouchableOpacity onPress={() => {
                    handleOpenComments();
                  }}>
                    <Image
                      source={require('../../../assets/postcard/commentIcon.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <Text style={styles.actionCount}>{commentCount}</Text>
                </View>

                <View style={styles.actionItem}>
                  <TouchableOpacity onPress={() => handleSavePress(true, currentPost)}>
                    <Image
                      source={currentPostSaved
                        ? require('../../../assets/postcard/saveFillIcons.png')
                        : require('../../../assets/postcard/saveIcon.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.actionCount, { opacity: 0 }]}>{currentPost.savedCount || 0}</Text>
                </View>

                <View style={styles.actionItem}>
                  <TouchableOpacity onPress={() => handleSinglePostShare(currentPost)}>
                    <Image
                      source={require('../../../assets/postcard/sendIcon.png')}
                      style={styles.actionIcon}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.actionCount, { opacity: 0 }]}>{currentPost.shares || 0}</Text>
                </View>
              </View>
              <Text style={styles.timeAgo}>{formatTimestamp(currentPost.createdAt)}</Text>
            </View>

            {/* User Details Component */}
            {currentPost?.userDetails && (
              <View style={styles.userDetails}>
                <View style={styles.detailsContainer}>
                  <TouchableOpacity
                    style={styles.userInfoRow}
                    onPress={() => routeToUserProfile(currentPost?.userDetails?.id)}>
                    {(() => {
                      const userDetails = getCurrentUserDetails(currentPost);
                      if (!userDetails) return null;

                      if (userDetails.profilePic && userDetails.profilePic.trim() !== '') {
                        return (
                          <FastImage
                            source={{ uri: userDetails.profilePic }}
                            style={styles.avatar}
                            onError={() => setImageLoadError(true)}
                          />
                        );
                      } else {
                        return (
                          <View style={styles.initialsAvatar}>
                            <Text style={styles.initialsText}>
                              {getInitials(
                                userDetails.username,
                              )}
                            </Text>
                          </View>
                        );
                      }
                    })()}
                    {imageLoadError && (() => {
                      const userDetails = getCurrentUserDetails(currentPost);
                      if (!userDetails) return null;

                      return (
                        <View style={styles.initialsAvatar}>
                          <Text style={styles.initialsText}>
                            {getInitials(
                              userDetails.username,
                            )}
                          </Text>
                        </View>
                      );
                    })()}
                    <View style={styles.user}>
                      {(() => {
                        const userDetails = getCurrentUserDetails(currentPost);
                        if (!userDetails) return null;

                        return (
                          <>
                            <Text style={styles.name}>
                              {isSelfProfile
                                ? userDetails.name
                                : userDetails.name?.length > 15
                                  ? `${userDetails.name.slice(0, 18)}...`
                                  : userDetails.name}
                            </Text>
                            {userDetails.isPaid &&
                              userDetails.accountType === 'professional' && (
                                <View style={styles.verifiedBadgeContainer}>
                                  <Image
                                    source={require('../../../assets/settings/subscription/VerifiedIcon.png')}
                                    style={styles.verifiedBadge}
                                  />
                                </View>
                              )}
                          </>
                        );
                      })()}
                    </View>
                  </TouchableOpacity>
                  {!isSelfProfile && (
                    <TouchableOpacity
                      style={isFollowed ? styles.followingButton : styles.followButton}
                      onPress={() => handleFollowPress(currentPost?.userDetails)}>
                      <Text
                        style={isFollowed ? styles.followingText : styles.followText}>
                        {isFollowed ? 'Following' : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* Caption */}
            {renderCaption()}

            {/* Tags */}
            {renderTags()}

            {/* Other Posts Grid */}
            <FlashList
              data={otherPosts}
              renderItem={renderPostItem}
              keyExtractor={(item) => item._id}
              estimatedItemSize={itemWidth}
              numColumns={numColumns}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              ItemSeparatorComponent={() => <View style={{ height: gap }} />}
            />
          </Animated.View>
        )}
      </ScrollView>

      {/* Options Modal */}
      {showOptionsModal && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOptionsModal(false)}
        >
          <View style={styles.optionsCard}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('report')}
            >
              <Text style={[styles.optionText, { color: DANGER_COLOR }]}>Report</Text>
              <Image
                source={require('../../../assets/rewampedIcon/reportIcon.png')}
                style={styles.optionIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} />

            {/* <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('download')}
            >
              <Text style={styles.optionText}>Download</Text>
              <Image
                source={require('../../../assets/rewampedIcon/downloadIcon.png')}
                style={styles.optionIcon}
              />
            </TouchableOpacity>
            <View style={styles.divider} /> */}

            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => handleOptionPress('share')}
            >
              <Text style={styles.optionText}>Share to...</Text>
              <Image
                source={require('../../../assets/rewampedIcon/sendIcon.png')}
                style={styles.optionIcon}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Comment Modal */}


      {/* Tagged Users Bottom Sheet */}
      <CustomTaggedUsersBottomSheet
        visible={showTaggedUsers}
        taggedUsers={currentPost?.taggedUsersDetails || []}
        onClose={() => setShowTaggedUsers(false)}
        onTagSelect={handleTagSelect}
        title="Tagged People"
      />

      {openComments && (
        <BottomSheet
          enablePanDownToClose
          index={2}
          snapPoints={[500,800]}
          ref={bottomSheetRef}
          onClose={() => {
            setOpenComments(false);
            dispatch(setCommentReply(null));
          }}
         
          backgroundStyle={{
            borderRadius: 22,
          }}
         
          style={{
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            borderRadius: 22,
            width: '100%',
            overflow: 'hidden',
          }}
          handleIndicatorStyle={{
            width: 50,
            backgroundColor: '#CECECE',
          }}
          footerComponent={renderFooter}
          >
          <BottomSheetView
            style={{
              flex: 1,
              padding: 0,
              paddingLeft: 0,
              paddingRight: 0,
              gap: 0,
              backgroundColor: 'white',
              width: '100%',
              overflow: 'hidden',
            }}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentHeaderText}>Comments</Text>
            </View>

            <CommentList
              postId={currentPost?._id}
              isLast={false}
              navigation={navigation}
              token={token || ''}
              selfPost={isSelfProfile}
              // contentContainerStyle={{ paddingBottom: 70 }}
            />
          </BottomSheetView>
        </BottomSheet>
      )}

      {/* Bottom Sheet Modal for Save */}
      <BottomSheetModal
        isVisible={isModalVisible}
        onClose={closeModal}
        saveToggle={handleSaveToCollection}
        post={selectedPost ? {
          _id: selectedPost._id,
          title: selectedPost.caption,
          url: selectedPost.contentUrl,
          contentType: selectedPost.contentType
        } : undefined}
      />

      <Modal
        visible={isReportModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReportModalVisible(false)}>
        <View style={styles.modalOverlayReport}>
          <View style={[styles.modalContentReport, { width: '90%', maxWidth: 350, overflow: 'hidden' }]}>
            <Text style={styles.modalTitle}>Report This Post</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  handleReportOptionSelect("I just don't like it")
                }>
                <Text style={styles.modalOptionText}>
                  I just don't like it
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  handleReportOptionSelect('Scam, Fraud or spam')
                }>
                <Text style={styles.modalOptionText}>
                  Scam, Fraud, or Spam
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() =>
                  handleReportOptionSelect('False Information')
                }>
                <Text style={styles.modalOptionText}>
                  False Information
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={() => handleReportOptionSelect('Others')}>
                <Text style={styles.modalOptionText}>Others</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setIsReportModalVisible(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <LikedUsersModal
        visible={showLikedUsers}
        onClose={() => setShowLikedUsers(false)}
        postId={currentPost?._id || ''}
      />

      {isLocationModalVisible && (
        <CustomLocationModal
          visible={isLocationModalVisible}
          location={currentPost?.location || ''}
          onClose={closeLocationModal}
        />
      )}
    </View>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
    width: '100%',
  },
  backButton: {
    padding: 8,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.bold,
    color: '#000',
  },
  headerButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    width: 16,
    height: 16,
    tintColor: '#000',
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 20,
    backgroundColor: '#fff',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginRight: 18,
  },
  actionIcon: {
    width: 23,
    height: 23,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#000',
  },
  timeAgo: {
    fontSize: 12,
    color: '#666',
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  caption: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    lineHeight: LineHeights.medium,
    color: Color.black,
  },
  moreText: {
    color: Color.grey,
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    lineHeight: LineHeights.medium,
    fontWeight: '400',
  },
  tagsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
  },
  tagButton: {
    backgroundColor: Color.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tagText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
  },
  gridContainer: {
    paddingHorizontal: horizontalPadding,
    marginBottom: 20,
  },
  gridItem: {
    width: itemWidth,
    flex: 1,
    marginHorizontal: gap / 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  taggedUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  taggedUsersIcon: {
    marginRight: 10,
  },
  tagIcon: {
    width: 24,
    height: 24,
  },
  taggedUsersText: {
    fontSize: 14,
    color: '#000',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  muteButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  fullScreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  userDetails: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
    marginBottom: 12
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  initialsAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Color.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 16,
    color: Color.white,
    fontWeight: '600',
  },
  user: {
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  verifiedBadgeContainer: {
    marginLeft: 4,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
  },
  followButton: {
    height: 32,
    width: 90,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  followText: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  followingButton: {
    height: 30,
    width: 95,
    alignItems: 'center',
    backgroundColor: '#EBEBEB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  followingText: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    fontWeight: '400',
    color: Color.black,
  },
  moreTagsButton: {
    backgroundColor: Color.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  moreTagsText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    zIndex: 1000,
    width: '100%',
    // height: Dimensions.get('window').height - 50,
    overflow: 'hidden',
  },
  optionsCard: {
    position: 'absolute',
    top: 60,
    right: 15,
    backgroundColor: Color.white,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 5,
    width: 180,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginHorizontal: 8,
  },
  optionText: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    color: Color.black,
  },
  optionIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  commentHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  commentHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.bold,
    color: '#000',
  },
  skeletonContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  skeletonMediaContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  skeletonMedia: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E1E1E1',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatarContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 20,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#E1E1E1',
    borderRadius: 20,
  },
  skeletonTextContainer: {
    marginLeft: 12,
  },
  skeletonNameContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
    borderRadius: 4,
  },
  skeletonName: {
    width: '60%',
    height: 16,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonUsernameContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  skeletonUsername: {
    width: '40%',
    height: 14,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonCaptionContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    borderRadius: 4,
  },
  skeletonCaption: {
    width: '100%',
    height: 60,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  skeletonTagsContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 4,
  },
  skeletonTags: {
    width: '80%',
    height: 24,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    transform: [{ skewX: '-20deg' }],
  },
  modalOverlayReport: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: '100%',
    height: '100%',
  },
  modalContentReport: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    maxWidth: 350,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: FontFamilies.semibold,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginVertical: 5,
    width: '100%',
    borderRadius: 8,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 12,
    color: '#333',
    fontFamily: FontFamilies.regular,
  },
  modalCancel: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: FontFamilies.semibold,
  },
  taggedUsersOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    flexDirection: 'row',
    gap: 10,
    zIndex: 1,
  },
  taggedUserIcon: {
    height: 25,
    width: 25,
  },
  activeItem: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  footerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    width: '100%',
    // borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    
  },
});

export default PostDetailRewamped;

