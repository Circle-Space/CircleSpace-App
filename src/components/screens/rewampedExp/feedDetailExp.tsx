import React, { useCallback, useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Alert,
  BackHandler,
  Dimensions,
  ActivityIndicator,
  FlatList,
  Modal,
  Keyboard,
} from 'react-native';
import { useNavigation, useFocusEffect, CommonActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import { formatDistanceToNow } from 'date-fns';
import { get, post, del } from '../../../services/dataRequest';
import FeedLayout from './feedLayout';
import { toggleLike } from '../../../redux/slices/likeSlice';
import { setSaveStatus } from '../../../redux/slices/saveSlice';
import { RootState } from '../../../redux/store';
import { updatePostFollowStatus, syncFollowStatus } from '../../../redux/slices/feedSlice';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import { FontFamilies, FontSizes, Color, LineHeights } from '../../../styles/constants';
import Video, { VideoRef } from 'react-native-video';
import CustomTaggedUsersBottomSheet from '../../commons/customTaggedUsersBotttomSheet';
import CustomLocationModal from '../../commons/customLocationModal';
import { handleSinglePostShare } from '../jobs/utils/utils';
import LikedUsersModal from '../../commons/LikedUsersModal';
import BottomSheet, { BottomSheetFooter, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import CommentList from '../Home/CommentList';
import CommentInputCard from '../Home/CommentInputCard';
import { setCommentReply } from '../../../redux/reducers/chatSlice';
import { updateCommentCount as updateCommentCountInRedux } from '../../../redux/slices/postSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getInitials } from '../../../utils/commonFunctions';
import { clearLastEditedPost } from '../../../redux/slices/postSlice';
import useCurrentUserId from '../../../hooks/useCurrentUserId';
import { updateFollowStatus } from '../../../redux/slices/followSlice';
import { useProfile } from '../../../hooks/useProfile';


// Constants for text limits
const CHARACTER_LIMIT = 150;
const TAG_LIMIT = 5;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Format timestamp to relative time (e.g., "5 minutes ago")
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return formatDistanceToNow(date, { addSuffix: true });
};
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
    userId: string;
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
  posts?: PostData[];
  currentIndex?: number;
  type?: string;
  projectId?: string;
  token?: string;
  pageName?: string;
  onFollowUpdate?: (updatedPosts: any[]) => void;
  navigationStack?: any[];
}

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

interface TaggedUser {
  _id: string;
  username?: string;
  profilePic?: string;
  accountType?: string; // added this
}

const FeedDetailExp = ({ route, navigation: propNavigation }: { route: { params: RouteParams }, navigation: any }) => {
  const { posts = [], currentIndex = 0, token, pageName = 'feed', onFollowUpdate } = route.params || {};
  console.log("posts feed detail",posts);
  const navigation = propNavigation || useNavigation();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets(); // Get safe area insets

  // State
  const [currentPost, setCurrentPost] = useState<PostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMoreItems, setHasMoreItems] = useState(true);
  const [accountType, setAccountType] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Modals state
  const [showTaggedUsers, setShowTaggedUsers] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const isTransitioning = useRef(false);
  const scrollY = useSharedValue(0);

  // Redux state
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
  const { toggleFollow } = useProfile();
  const followedUsers = useSelector((state: RootState) => state.follow.followedUsers);
  const isFollowing = currentPost?.posterDetails?.userId
    ? followedUsers[currentPost.posterDetails.userId] || false
    : false;
  console.log('isFollowing', isFollowing);
  // Add follow state from Redux
  const followState = useSelector((state: RootState) => state.feed.userFollowStatus);
  const feedState = useSelector((state: RootState) => state.feed);

  // Define a ref to track if a back action should trigger scrolling
  const shouldScrollAfterBack = useRef(false);

  // Add state variables for caption and tag display
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [expandedTags, setExpandedTags] = useState(false);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<any>(null);

  // Maximum lines for collapsed caption
  const MAX_CAPTION_LINES = 2;
  const MAX_VISIBLE_TAGS = 5;

  // Add state to track if actively scrolling
  const [isScrolling, setIsScrolling] = useState(false);
  // Debounce timer ref for scroll end detection
  const scrollEndTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the component with current post data
  useEffect(() => {
    if (posts && posts.length > 0 && currentIndex >= 0 && currentIndex < posts.length) {
      setCurrentPost(posts[currentIndex]);
      fadeAnim.value = withTiming(1, { duration: 300 });
      
      // Only fetch additional data if pageName is "feed"
      if (pageName === 'feed') {
        fetchAdditionalData();
      } else {
        // For other page sources, use the posts passed from navigation props
        // Filter out the current post from the related posts to prevent duplication
        const currentPostId = posts[currentIndex]._id;
        const filteredPosts = posts.filter(post => post._id !== currentPostId);
        setRelatedPosts(filteredPosts);
        
        // Ensure loading states are turned off immediately for non-feed pages
        setInitialLoading(false);
        setIsLoading(false);
        setHasMoreItems(false); // No more items to load in non-feed mode
        
        // Specifically for tags, ensure no loading state appears
        if (pageName === 'tags') {
          console.log('Tags pageName detected, ensuring no loading states are active');
        }
      }

      // Auto-play video with mute when initially loaded
      if (posts[currentIndex].contentType === 'video') {
        // Short delay to ensure video is loaded
        setTimeout(() => {
          setIsPlaying(true);
          setIsMuted(true);
        }, 500);
      }
    }

    fetchUserInfo();
  }, []);

  // Fetch user account info
  const fetchUserInfo = async () => {
    try {
      const [accountType_, account_] = await Promise.all([
        AsyncStorage.getItem('accountType'),
        AsyncStorage.getItem('user')
      ]);

      const userId = JSON.parse(account_ || '{}');
      setCurrentUserId(userId?._id || '');

      // Check if current post is from the current user
      if (posts && posts.length > 0 && posts[currentIndex]?.posterDetails?.userId === userId?._id) {
        setIsSelfProfile(true);
      } else {
        setIsSelfProfile(false);
      }

      setAccountType(accountType_ || '');
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // Fetch related posts
  const fetchAdditionalData = async (pageNum = page) => {
    if (!token || !posts || posts.length === 0) {
      return;
    }

    try {
      if (pageNum === 1) {
        setInitialLoading(true);
      } else {
        setIsLoading(true);
      }

      const currentPostItem = posts[currentIndex];
      if (!currentPostItem) return;

      // Fetch related posts by tags or user
      let endpoint = 'ugc/get-mixed-ugc?';

      /* Temporarily commenting out tags filtering
      if (currentPostItem.tags && currentPostItem.tags.length > 0) {
        const tagQuery = currentPostItem.tags.slice(0, 3).join(',');
        endpoint += `tags=${tagQuery}&`;
      }
      */

      // Add pagination - always use a consistent pageLimit value
      const pageLimit = 24; // Adjusted to match actual API response size
      endpoint += `page=${pageNum}&limit=${pageLimit}`;
      
      // Add random parameter to prevent caching
      const randomParam = Math.floor(Math.random() * 10000);
      endpoint += `&t=${randomParam}`;

      const data = await get(endpoint, {}, token);

      if (data && data.ugcs && data.ugcs.length > 0) {
        // Keep track of the total response size for debugging
        const totalResponseSize = data.ugcs.length;
        
        // Filter out the current post id from results
        const currentPostId = currentPostItem._id;
        const filteredPosts = data.ugcs.filter((post: PostData) => 
          post._id !== currentPostId
        );

   
        if (pageNum === 1) {
          setRelatedPosts(filteredPosts);
        } else {
          setRelatedPosts(prev => {
            // Create a Set of existing post IDs for faster lookup
            const existingPostIds = new Set(prev.map(post => post._id));
            
            // Filter out duplicates
            const newPosts = filteredPosts.filter(
              (newPost: PostData) => !existingPostIds.has(newPost._id)
            );

            // If no new posts were added and we got a full page, the API might be returning duplicates
            // In that case, we should stop pagination to prevent infinite loading
            if (newPosts.length === 0 && totalResponseSize >= pageLimit) {
              setHasMoreItems(false);
              return prev;
            }

            const combinedPosts = [...prev, ...newPosts];
            return combinedPosts;
          });
        }

        // Only continue pagination if we received new unique posts or this is the first page
        const shouldContinue = (pageNum === 1) || 
          (filteredPosts.length > 0 && totalResponseSize >= (pageLimit - 1));
          
        setHasMoreItems(shouldContinue);

        // Only increment page if we should continue
        if (shouldContinue) {
          setPage(pageNum + 1);
          
          // Only store navigation-critical data to AsyncStorage, not the full post objects
          if (pageName === 'feed' || pageName === 'home') {
            // Store minimal data needed for navigation state
            const minimalNavData = {
              currentPostId: currentPost?._id,
              lastPage: pageNum + 1
            };
            await AsyncStorage.setItem('feedNavState', JSON.stringify(minimalNavData));
          }
        } else {
          setHasMoreItems(false);
        }
      } else {
        setHasMoreItems(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasMoreItems(false);
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  };

  const loadMorePosts = useCallback(() => {
    if (isLoading) {
      return;
    }

    if (!hasMoreItems) {
      return;
    }

    // Only fetch more posts if we're in feed page
    if (pageName === 'feed') {
      fetchAdditionalData(page);
    }
  }, [isLoading, hasMoreItems, page, token, posts, currentIndex, pageName]);

  // Centralized function to pause video
  const pauseVideo = useCallback(() => {
    if (currentPost?.contentType === 'video' && videoRef.current) {
      try {
        const video = videoRef.current as any;
        if (video && video.pause) {
          video.pause();
        }
      } catch (error) {
        console.error('Error pausing video:', error);
      }
      // Update states after attempting direct pause
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [currentPost]);

  // Smooth scroll to top function
  const smoothScrollToTop = useCallback(() => {
    if (!scrollViewRef.current) return;

    // Scroll to top with smooth animation
    scrollViewRef.current.scrollTo({
      x: 0,
      y: 0,
      animated: true
    });
  }, []);

  const handleGoBack = useCallback(() => {
    // Pause any playing video before navigating
    pauseVideo();

    // Get the navigation state
    const navState = navigation.getState();

    // Check if we have previous routes
    if (navState.routes && navState.routes.length > 1) {

      // Current index in the navigation stack
      const currentRouteIndex = navState.index;

      // If we're at index 1, simply navigate back without scrolling
      if (currentRouteIndex === 1) {
        navigation.goBack();
        return;
      }

      // Set global flag that will be checked by all instances
      // global.needsScrollToTop = true;

      // For other cases, just navigate back
      navigation.goBack();
    } else {
      // No previous routes, just navigate to home
      navigation.navigate('BottomBar', {
        screen: 'Home'
      });
    }
  }, [navigation, pauseVideo]);

  // Check for scroll flag on focus
  useFocusEffect(
    useCallback(() => {
      /* Commenting out scroll to top logic
      // Check if global flag is set
      if (global.needsScrollToTop) {
        
        // Clear the flag
        global.needsScrollToTop = false;
        
        // Scroll to top with a slight delay to ensure render is complete
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true });
          }
        }, 50);
      }
      */
    }, [])
  );

  const handleDataUpdate = (updatedData: PostData[]) => {
    setRelatedPosts(updatedData);

    // Ensure follow states are synced with Redux
    updatedData.forEach(post => {
      if (post.posterDetails?.userId) {
        const userId = post.posterDetails.userId;
        const followStateInRedux = followState[userId];
        const postFollowState = post.posterDetails.isFollowed;

        // If there's a mismatch between Redux and post data, update post data
        if (followStateInRedux !== undefined && postFollowState !== followStateInRedux) {
          post.posterDetails.isFollowed = followStateInRedux;
        }
        // If post has follow data not in Redux, update Redux
        else if (postFollowState !== undefined && followStateInRedux === undefined) {
          dispatch(updatePostFollowStatus({
            userId,
            isFollowed: postFollowState
          }));
        }
      }
    });

    // If callback exists, update parent screen data
    if (onFollowUpdate) {
      onFollowUpdate(updatedData);
    }
  };

  const getCurrentUserName = () => {
    if (!currentPost) return '';

    const posterDetails = currentPost.posterDetails;
    return posterDetails?.businessName ||
      `${posterDetails?.firstName} ${posterDetails?.lastName}`.trim() ||
      posterDetails?.username;
  };

  const handleFollowUser = async () => {
    if (!currentPost || !currentPost.posterDetails?.userId) return;
    const userId = currentPost.posterDetails.userId;
    try {
      const success = await toggleFollow(userId);
      if (success) {
        const newFollowStatus = !isFollowing;
        dispatch(updateFollowStatus({
          userId,
          isFollowed: newFollowStatus
        }));
      }
    } catch (error) {
      console.error('[FeedDetailExp] Error toggling follow:', error);
    }
  };

  const handleLikePress = async () => {
    if (!currentPost) return;

    try {
      // Store current video state before like action
      const wasPlaying = isPlaying;
      const wasMuted = isMuted;
      
      // Get current state from Redux with proper checking
      const reduxHasLikeInfo = likedPosts.hasOwnProperty(currentPost._id);
      const isLikedInRedux = reduxHasLikeInfo ? likedPosts[currentPost._id] : currentPost.isLiked;
      const likeCountInRedux = reduxHasLikeInfo ? likeCounts[currentPost._id] : (currentPost.likes || 0);

      // Calculate new state
      const newLikeState = !isLikedInRedux;
      const newLikeCount = isLikedInRedux ? likeCountInRedux - 1 : likeCountInRedux + 1;

      // First, dispatch Redux action for instant UI update
      dispatch(toggleLike(currentPost._id));

      // Update local state
      setCurrentPost({
        ...currentPost,
        isLiked: newLikeState,
        likes: newLikeCount
      });

      // Make API call
      const response = await post(`ugc/toggle-like/${currentPost._id}`, {});

      // If API call fails, revert changes
      if (response.status !== 200) {
        // Revert Redux state
        dispatch(toggleLike(currentPost._id));

        // Revert local state
        setCurrentPost({
          ...currentPost,
          isLiked: isLikedInRedux,
          likes: likeCountInRedux
        });

        throw new Error('API call failed');
      }
      
      // Restore video state if it was changed during the like action
      // Only needed if the video state has changed during the operation
      if (currentPost.contentType === 'video' && (wasPlaying !== isPlaying || wasMuted !== isMuted)) {
        setTimeout(() => {
          setIsPlaying(wasPlaying);
          setIsMuted(wasMuted);
        }, 50);
      }
    } catch (error) {
      console.error('[FeedDetailExp] Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSavePress = async (isCardSave = false, item?: PostData) => {
    try {
      // Store current video state before save action
      const wasPlaying = isPlaying;
      const wasMuted = isMuted;
      
      // Determine which post to save based on whether it's a card save or current post save
      const postToSave = item || currentPost;
      if (!postToSave) return;

      // Get current save state from Redux
      const isSavedInRedux = savedPosts[postToSave._id] !== undefined
        ? savedPosts[postToSave._id]
        : postToSave.isSaved;

      if (isSavedInRedux) {
        // If already saved, perform unsave operation
        // Update Redux state immediately for better UX
        dispatch(setSaveStatus({ postId: postToSave._id, isSaved: false }));

        // Make API call to remove from collection
        const response = await del(`collections/remove-item/${postToSave._id}`);
       
        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: postToSave._id, isSaved: true }));
          throw new Error('Failed to remove from collection');
        }
      } else {
        // If not saved, open the collection selector modal
        if (isCardSave) {
          // For card saves, use the card's save functionality
          setSelectedPost(postToSave);
          setIsBottomSheetVisible(true);
        } else {
          // For direct saves without collection selection
          // Update Redux state immediately for better UX
          dispatch(setSaveStatus({ postId: postToSave._id, isSaved: true }));

          // Add to default collection
          const response = await post('ugc/save', {
            ugcId: postToSave._id,
            collectionIds: []
          });

          if (response.status !== 200) {
            // If API call fails, revert changes
            dispatch(setSaveStatus({ postId: postToSave._id, isSaved: false }));
            throw new Error('Failed to save post');
          }
        }
      }
      
      // Restore video state if needed and if this is the current post being saved
      if (currentPost && postToSave._id === currentPost._id && 
          currentPost.contentType === 'video' && 
          (wasPlaying !== isPlaying || wasMuted !== isMuted)) {
        setTimeout(() => {
          setIsPlaying(wasPlaying);
          setIsMuted(wasMuted);
        }, 50);
      }
    } catch (error) {
      console.error('[FeedDetailExp] Error toggling save status:', error);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleSaveToCollection = async (collectionInfo: any) => {
    try {
    
      // Use the selected post
      const postToSave = selectedPost;
      if (!postToSave) return;

      // Update Redux state immediately for better UX
      dispatch(setSaveStatus({ postId: postToSave._id, isSaved: true }));

      // Check if this is a new collection creation
      if (!collectionInfo.isNewCollection) {
        const id = collectionInfo?.collectionInfo?.collectionId;

        if (!id) {
          console.error("Missing collection ID");
          throw new Error("Missing collection ID");
        }

        // Determine the correct item type
        const itemType = postToSave?.contentType === "ugc" ? 'photo' : postToSave?.contentType;

        // Make API call only for existing collections
        const response = await post(`collections/add-item/${id}`, {
          itemId: postToSave._id,
          itemType: itemType
        });


        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: postToSave._id, isSaved: false }));
          throw new Error('Failed to add to collection');
        }
      } else {
        // console.log("[FeedDetailExp] Skipping API call for new collection - item already added during collection creation");
      }

      // Update posts in the related posts array with the new save state
      setRelatedPosts(prev => {
        return prev.map(post =>
          post._id === postToSave._id ? {
            ...post,
            isSaved: true
          } : post
        );
      });

      // If this is the current post, also update it
      if (currentPost && currentPost._id === postToSave._id) {
        setCurrentPost({
          ...currentPost,
          isSaved: true
        });
      }
    } catch (error) {
      console.error('[FeedDetailExp] Error saving to collection:', error);
      Alert.alert('Error', 'Failed to add to collection');
    } finally {
      setIsBottomSheetVisible(false);
    }
  };

  const handleCommentPress = () => {
    if (!currentPost) return;

    handleOpenComments();
  };


  const handleProfilePress = () => {
    const postUserId = currentPost?.posterDetails?.userId;
    if (postUserId === currentUserId) {
      // If it's the user's own profile, navigate through BottomBar
      navigation.navigate('BottomBar', {
        screen: 'ProfileScreen',
        params: {
          isSelf: true
        }
      });
    } else {
      // Check if the profile is personal or professional
      const accountType = currentPost?.posterDetails?.accountType;
      if (accountType === 'professional') {
        // Navigate to business profile screen
        navigation.navigate('otherBusinessScreen', {
          userId: postUserId,
          isSelf: false
        });
      } else {
        // Navigate to personal profile screen
        navigation.navigate('otherProfileScreen', {
          userId: postUserId,
          isSelf: false
        });
      }
    }
  };

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls) {
      // Set a timer to hide controls after 3 seconds
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showControls]);

  // Handle item click in FeedLayout
  const handleItemClick = useCallback((item: any) => {
    // Pause any playing video before navigating
    pauseVideo();

    // Get the original posts array from route params to avoid using filtered relatedPosts
    const originalPosts = route.params.posts || [];
    
    // Find the index of the item in the original posts array
    const clickedItemIndex = originalPosts.findIndex(post => post._id === item._id);

    if (clickedItemIndex !== -1) {
      // Use push instead of navigate to force a new screen instance
      navigation.push('FeedDetailExp', {
        posts: originalPosts, // Use the original posts array to prevent removal of items
        currentIndex: clickedItemIndex,
        type: item.contentType || 'post',
        projectId: item._id,
        token: token,
        pageName: pageName, // Preserve the pageName from parent
        onFollowUpdate: onFollowUpdate // Pass through the original callback if needed
      });
    } else {
      console.error('[FeedDetailExp] Could not find clicked item in original posts array');
    }
  }, [route.params.posts, navigation, token, pageName, onFollowUpdate, pauseVideo]);

  // Add ref for ScrollView
  const scrollViewRef = useRef<ScrollView>(null);

  const handleExpandCaption = () => {
    setExpandedCaption(!expandedCaption);
  };

  const handleExpandTags = () => {
    setExpandedTags(!expandedTags);
  };

  // Handle tag press to navigate to tag results
  const handleTagPress = (tag: string) => {
    navigation.push('TagResultScreenRewamped', { query: tag });
  };

  const handleTap = () => {
    if (!posts || posts.length === 0) return;

    // First pause and mute any current video before navigating
    if (videoRef.current) {
      // Use type assertion to avoid TypeScript error
      const video = videoRef.current as unknown as { pause: () => void };
      video.pause();
      setIsMuted(true);
    }

    // Filter posts to exclude both project and video types
    const filteredPosts = posts.filter(post => {
      return post.contentType !== 'project' && post.contentType !== 'video';
    });
    
    // Find the current post in the filtered array
    let currentPostIndex = 0;
    if (currentPost && filteredPosts.length > 0) {
      currentPostIndex = filteredPosts.findIndex(post => post._id === currentPost._id);
    }
    
    // Check if the current post was filtered out (is project or video)
    const isCurrentPostFiltered = currentPost && 
      (currentPost.contentType === 'project' || currentPost.contentType === 'video');
    
    // Only navigate if there are items remaining after filtering
    if (filteredPosts.length > 0 && !isCurrentPostFiltered) {
      const items = filteredPosts.map(post => {
        const posterDetails = Array.isArray(post.posterDetails) ? post.posterDetails[0] : post.posterDetails;
        const userDetails = Array.isArray(post.userDetails) ? post.userDetails[0] : post.userDetails;
        return {
          id: post._id,
          imageUrl: Array.isArray(post.contentUrl) ? post.contentUrl[0] : post.contentUrl,
          userDetails: {
            id: posterDetails?.userId || posterDetails?._id || '',
            name: userDetails?.name && userDetails.name.trim() !== ''
              ? userDetails.name
              : posterDetails?.firstName && posterDetails?.lastName
                ? `${posterDetails.firstName} ${posterDetails.lastName}`
                : posterDetails?.businessName || '',
            username: posterDetails?.username || userDetails?.username || '',
            location: post?.location || '',
            profilePic: posterDetails?.profilePic || userDetails?.profilePic || '',
            isLiked: Boolean(userDetails?.isLiked || post.isLiked),
            isSaved: Boolean(userDetails?.isSaved || post.isSaved),
            likeCount: Number(userDetails?.likeCount || post.likes) || 0,
            commentCount: Number(userDetails?.commentCount || post.commentsCount) || 0,
            isPaid: post?.posterDetails?.isPaid || false,
            accountType: post?.posterDetails?.accountType || ''
          },
          contentType: post?.contentType || '',
          caption: post?.caption || '',
          tags: post?.tags || [],
        };
      });

      navigation.navigate('FullScreenLayout', {
        items,
        initialIndex: currentPostIndex >= 0 ? currentPostIndex : 0,
        type: 'post',
        projectId: currentPost?._id,
        token: token
      });
    } else {
      // Show an alert to inform user
      Alert.alert(
        "Information", 
        "Cannot display full screen view for this content type.",
        [{ text: "OK" }]
      );
    }
  };

  const isTagIcon = require('../../../assets/ugcs/mentionIcon.png');

  const toggleFullScreen = () => {
    if (currentPost?.contentType === 'video') {
      // Pause the current video before navigating
      pauseVideo();
      setIsMuted(true);

      // Filter posts to include only video items
      const videoPosts = posts.filter(post => post.contentType === 'video');
      
      // Find the index of the current video post in the filtered array
      const currentVideoIndex = currentPost ? videoPosts.findIndex(post => post._id === currentPost._id) : 0;
      
      // Only create items and navigate if we found the current post in filtered videos
      if (currentVideoIndex >= 0) {
        // Map filtered video posts to the required format
        const videoItems = videoPosts.map(post => {
          const posterDetails = Array.isArray(post.posterDetails) ? post.posterDetails[0] : post.posterDetails;
          return {
            imageUrl: Array.isArray(post.contentUrl) ? post.contentUrl[0] : post.contentUrl,
            userDetails: {
              id: posterDetails?._id || '',
              name: posterDetails?.firstName || posterDetails?.lastName || posterDetails?.businessName || '',
              username: posterDetails?.username || '',
              location: post?.location || '',
              profilePic: posterDetails?.profilePic || '',
              isLiked: post.isLiked,
              isSaved: post.isSaved,
              likeCount: post.likes || 0,
              commentCount: post.commentsCount || 0,
              isPaid: post?.posterDetails?.isPaid || false,
              accountType: post?.posterDetails?.accountType || ''
            },
            caption: post?.caption || ''
          };
        });

        navigation.navigate('VideoFullScreenRewamped', {
          items: videoItems,
          initialIndex: currentVideoIndex,
          type: 'post',
          projectId: currentPost?._id,
          token: token
        });
      } else {
        // Just navigate with the current post if filtering failed
        const posterDetails = currentPost.posterDetails;
        navigation.navigate('VideoFullScreenRewamped', {
          items: [{
            imageUrl: Array.isArray(currentPost.contentUrl) ? currentPost.contentUrl[0] : currentPost.contentUrl,
            userDetails: {
              id: posterDetails?._id || '',
              name: posterDetails?.firstName || posterDetails?.lastName || posterDetails?.businessName || '',
              username: posterDetails?.username || '',
              location: currentPost?.location || '',
              profilePic: posterDetails?.profilePic || '',
              isLiked: currentPost.isLiked,
              isSaved: currentPost.isSaved,
              likeCount: currentPost.likes || 0,
              commentCount: currentPost.commentsCount || 0
            },
            caption: currentPost?.caption || ''
          }],
          initialIndex: 0,
          type: 'post',
          projectId: currentPost?._id,
          token: token
        });
      }
    } else {
      setIsFullScreen(!isFullScreen);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number) => {
    if (videoRef.current) {
      // Use type assertion to avoid TypeScript error
      const video = videoRef.current as unknown as { seek: (time: number) => void };
      video.seek(value);
      setCurrentTime(value);
    }
  };

  const handleSharePost = () => {
    if (currentPost) {
      handleSinglePostShare(currentPost);
    }
  };

  // Create fadeStyle animation outside the render function
  const fadeStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const [showLikedUsers, setShowLikedUsers] = useState(false);

  const handleLikeCountPress = () => {
    if (currentPost?._id) {
      setShowLikedUsers(true);
    }
  };

  const [openComments, setOpenComments] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const bottomSheetRef = useRef<BottomSheet>(null);


  const handleOpenComments = () => {
    Keyboard.dismiss(); // Dismiss any active keyboard
    setOpenComments(true);

    // Make sure bottomSheetRef is defined and BottomSheet is visible
    setTimeout(() => {
      if (bottomSheetRef.current) {
        bottomSheetRef.current.expand();
      }
    }, 100);
  };


  const renderActivePostContent = () => {
    if (!currentPost) return null;

    // Get Redux states with proper checks
    const reduxHasLikeInfo = likedPosts.hasOwnProperty(currentPost._id);
    const isLikedFromRedux = reduxHasLikeInfo ? likedPosts[currentPost._id] : currentPost.isLiked;
    const likeCountFromRedux = reduxHasLikeInfo ? likeCounts[currentPost._id] : (currentPost.likes || 0);
    const isSavedFromRedux = savedPosts[currentPost._id] !== undefined ? savedPosts[currentPost._id] : currentPost.isSaved;

    // Determine if the caption is long
    const shouldShowMore = currentPost.caption && currentPost.caption.length > CHARACTER_LIMIT;
    const displayText = expandedCaption
      ? currentPost.caption
      : currentPost.caption?.slice(0, CHARACTER_LIMIT);

    // Filter out empty tags and get the ones to display
    const filteredTags = currentPost.tags?.filter(tag => tag.trim() !== '') || [];
    const tagsToShow = expandedTags ? filteredTags : filteredTags.slice(0, TAG_LIMIT);
    const hasMoreTags = filteredTags.length > TAG_LIMIT;

    // Videos should be paused when scrolling
    const shouldPlayVideo = !isScrolling && currentPost.contentType === 'video';

    // If we're scrolling and there's a video playing, pause it
    if (isScrolling && currentPost.contentType === 'video' && isPlaying && videoRef.current) {
      const video = videoRef.current as unknown as { pause: () => void };
      video.pause();
      // We don't update the isPlaying state here to avoid unnecessary re-renders
    }

    return (
      <Animated.View style={[styles.activePostContainer, fadeStyle]}>
        {/* Media Container */}
        <View style={styles.mediaContainer}>
          {currentPost.contentType === 'video' ? (
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={{ uri: Array.isArray(currentPost.contentUrl) ? currentPost.contentUrl[0] : currentPost.contentUrl }}
                style={styles.mainImage}
                resizeMode="cover"
                repeat={true}
                paused={!isPlaying || isScrolling} // Pause when scrolling or not playing
                muted={isMuted}
                controls={false}
                onProgress={({ currentTime }) => setCurrentTime(currentTime)}
                onLoad={({ duration }) => {
                  setDuration(duration);
                  // Auto-play on load if it's a video and not scrolling
                  if (currentPost.contentType === 'video' && !isScrolling) {
                    setIsPlaying(true);
                  }
                }}
                onError={(error) => console.error("[FeedDetailExp] Video error:", error)}
                onEnd={() => {
                  // When video ends in repeat mode, maintain audio state
                  if (videoRef.current) {
                    const video = videoRef.current as unknown as { seek: (time: number) => void };
                    video.seek(0);
                    
                    // Don't pause if we want to repeat with audio
                    if (!isMuted) {
                      setIsPlaying(true); // Keep playing for autoplay+repeat
                    } else {
                      // Only pause if muted
                      setIsPlaying(false);
                    }
                  }
                }}
              />
              
              {/* Tagged users and location overlays for videos */}
              {currentPost?.taggedUsersDetails && currentPost.taggedUsersDetails.length > 0 && (
                <TouchableOpacity
                  onPress={openTaggedUsersList}
                  style={styles.videoTaggedUsersOverlay}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image source={isTagIcon} style={styles.taggedUserIcon} />
                </TouchableOpacity>
              )}
              {currentPost?.location && (
                <TouchableOpacity
                  onPress={openLocationModal}
                  style={[
                    styles.videoTaggedUsersOverlay,
                    { left: currentPost?.taggedUsersDetails?.length ? 50 : 15 }
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image
                    source={require('../../../assets/postcard/Location.png')}
                    style={styles.taggedUserIcon}
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.videoOverlay}
                activeOpacity={1}
                onPress={() => {
                  // When clicking on the video overlay
                  if (!showControls) {
                    // First click: just show controls
                    setShowControls(true);
                  } else {
                    // Second click: toggle play/pause
                    setIsPlaying(!isPlaying);
                  }
                }}
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
                        name={isPlaying && !isScrolling ? 'pause' : 'play'}
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
                    
                    {/* Video Progress Bar */}
                    <View style={styles.videoProgressContainer}>
                      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                      <View style={styles.seekBarContainer}>
                        <View style={styles.seekBarBackground}>
                          <View 
                            style={[
                              styles.seekBarProgress, 
                              { width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                            ]} 
                          />
                          <View
                            style={[
                              styles.seekBarThumb,
                              { left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }
                            ]}
                          />
                        </View>
                        <TouchableOpacity
                          style={styles.seekBarTouchArea}
                          onPress={(event) => {
                            const { locationX } = event.nativeEvent;
                            // Get the actual width of the seekbar container
                            const seekBarWidth = Dimensions.get('window').width - 32 - 24 - 70; // screen width - padding - margins - time text widths
                            const newTime = (locationX / seekBarWidth) * duration;
                            if (newTime >= 0 && newTime <= duration) {
                              handleSeek(newTime);
                            }
                          }}
                        />
                      </View>
                      <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
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
                resizeMode={FastImage.resizeMode.contain}
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
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Image source={isTagIcon} style={styles.taggedUserIcon} />
                </TouchableOpacity>
              )}
              {currentPost?.location && (
                <TouchableOpacity
                  onPress={openLocationModal}
                  style={[
                    styles.taggedUsersOverlay,
                    { left: currentPost?.taggedUsersDetails?.length ? 50 : 15 }
                  ]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
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
                  source={isLikedFromRedux
                    ? require('../../../assets/postcard/likeFillIcon.png')
                    : require('../../../assets/postcard/likeIcon.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLikeCountPress} style={{ paddingHorizontal: 10, borderRadius: 10 }}>
                <Text style={styles.actionCount}>{likeCountFromRedux}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionItem}>
              <TouchableOpacity onPress={
                () => {
                  handleOpenComments();
                }
              }>
                <Image
                  source={require('../../../assets/postcard/commentIcon.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <Text style={styles.actionCount}>{currentPost.commentsCount || 0}</Text>
            </View>

            <View style={styles.actionItem}>
              <TouchableOpacity onPress={() => handleSavePress(true, currentPost)}>
                <Image
                  source={isSavedFromRedux
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
        <View style={styles.userDetails}>
          <View style={styles.detailsContainer}>
            <TouchableOpacity
              style={styles.userInfoRow}
              onPress={handleProfilePress}
            >
              {currentPost.posterDetails?.profilePic && !imageLoadError ? (
                <FastImage
                  source={{ uri: currentPost.posterDetails.profilePic }}
                  style={styles.avatar}
                  onError={() => setImageLoadError(true)}
                />
              ) : (
                <View style={styles.initialsAvatar}>
                  <Text style={styles.initialsText}>
                    
                    {getInitials(
                      currentPost.posterDetails.username
                    )}
                  </Text>
                </View>
              )}
              <View style={styles.user}>
                <Text style={styles.name}>
                  {
                    currentPost.posterDetails?.username
                  }
                  {/* {isSelfProfile
                    ? getCurrentUserName()
                    : getCurrentUserName()?.length > 15
                      ? `${getCurrentUserName()?.slice(0, 18)}...`
                      : getCurrentUserName()} */}
                </Text>
                {currentPost.posterDetails?.isPaid &&
                  currentPost.posterDetails?.accountType === 'professional' && (
                    <View style={styles.verifiedBadgeContainer}>
                      <Image
                        source={require('../../../assets/settings/subscription/VerifiedIcon.png')}
                        style={styles.verifiedBadge}
                      />
                    </View>
                  )}
              </View>
            </TouchableOpacity>

            {!isSelfProfile && (
              <TouchableOpacity
                onPress={handleFollowUser}
                style={[
                  isFollowing ? styles.followingButton : styles.followButton
                ]}
              >
               <Text style={[
                 isFollowing ? styles.followingText : styles.followText
               ]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Caption */}
        {currentPost.caption ? (
          <TouchableOpacity style={styles.captionContainer} activeOpacity={1}>
            <Text style={styles.caption}>
              {displayText}
              {shouldShowMore && !expandedCaption && <Text>...</Text>}
              {shouldShowMore && (
                <Text
                  style={styles.moreText}
                  onPress={handleExpandCaption}>
                  {expandedCaption ? '  less' : ' more'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Tags */}
        {filteredTags.length > 0 && (
          <View style={styles.tagsContainer}>
            <View style={styles.tagsWrapper}>
              {tagsToShow.map((tag, index) => (
                <TouchableOpacity
                  key={`tag-${index}`}
                  style={[styles.tagItem, { marginRight: 1 }]}
                  onPress={() => handleTagPress(tag)}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </TouchableOpacity>
              ))}

              {hasMoreTags && (
                <TouchableOpacity
                  style={[styles.moreTagsButton, { marginRight: 8 }]}
                  onPress={handleExpandTags}
                >
                  <Text style={styles.moreTagsText}>
                    {expandedTags ? 'less..' : `+${filteredTags.length - TAG_LIMIT}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  // Opening tagged users list
  const openTaggedUsersList = () => {
    setShowTaggedUsers(true);
  };

  // Closing tagged users modal
  const closeTaggedUsersModal = () => {
    setShowTaggedUsers(false);
  };

  // Opening location modal
  const openLocationModal = () => {
    setIsLocationModalVisible(true);
  };

  // Closing location modal
  const closeLocationModal = () => {
    setIsLocationModalVisible(false);
  };
 const loggedInUserId =useCurrentUserId()
  // Navigate to user profile when tagged user is selected
  const handleTagSelect = (user: TaggedUser) => {
    setShowTaggedUsers(false);
    const isSelfProfile = loggedInUserId === user._id;
    const accountType = user.accountType || 'personal'; // fallback

    if (isSelfProfile) {
      navigation.navigate('BottomBar', {
        screen: 'ProfileScreen',
        params: { isSelf: true }
      });
    } else {
      if (accountType === 'business' || accountType === 'professional') {
        navigation.navigate('otherBusinessScreen', {
          userId: user._id,
          isSelf: false
        });
      } else {
        navigation.navigate('otherProfileScreen', {
          userId: user._id,
          isSelf: false
        });
      }
    }
  };

  const updateCommentCount = (postId: string, increment = true) => {
    // Update UI comment count for the current post
    if (currentPost && currentPost._id === postId) {
      const newCount = increment ? (currentPost.commentsCount || 0) + 1 : (currentPost.commentsCount || 0) - 1;

      // Create updated post with new comment count
      const updatedPost = {
        ...currentPost,
        commentsCount: newCount,
        userDetails: {
          ...currentPost.userDetails,
          commentCount: newCount
        }
      };

      // Update the current post with new data
      setCurrentPost(updatedPost);

      // Update the post in the related posts array if it exists there
      setRelatedPosts(prevPosts => {
        return prevPosts.map(post =>
          post._id === postId ? {
            ...post,
            commentsCount: newCount,
            userDetails: {
              ...post.userDetails,
              commentCount: newCount
            }
          } : post
        );
      });

      // Update Redux state if needed
      dispatch(updateCommentCountInRedux({
        id: postId,
        count: newCount
      }));
    }
  };

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footerContainer}>
          <CommentInputCard
            postId={currentPost?._id}
            token={token}
            onCommentAdded={() => currentPost?._id && updateCommentCount(currentPost._id, true)}
          />
        </View>
      </BottomSheetFooter>
    ),
    [currentPost?._id, token]
  );

  // Add useEffect to check Redux comment count whenever component mounts or current post changes
  const commentCounts = useSelector((state: RootState) => state.comment.commentCounts);
  console.log('commentCountsxyz',commentCounts[currentPost?._id])
  useEffect(() => {
    
        setCurrentPost(prev => prev ? {
          ...prev,
          commentsCount: commentCounts[currentPost?._id]
        } : null);
     
   
  }, [currentPost?._id, commentCounts]);

  const toggleOptionsModal = () => {
    setShowOptionsModal(!showOptionsModal);
  };

  const handleOptionPress = (option: string) => {
    switch (option) {
      case 'report':
        setIsReportModalVisible(true);
        break;
      case 'edit':
        if (currentPost) {
          routeToEditPost(currentPost);
        }
        break;
      case 'share':
        if (currentPost) {
          handleSinglePostShare(currentPost);
        }
        break;
      default:
        break;
    }
    setShowOptionsModal(false);
  };

  const handleReportOptionSelect = async (reason: any) => {
    try {
      if (!currentPost?._id) {
        Alert.alert('Error', 'Post not found');
        return;
      }

      // Show confirmation dialog before submitting report
      Alert.alert(
        'Confirm Report',
        'Are you sure you want to report this post?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsReportModalVisible(false)
          },
          {
            text: 'Report',
            style: 'destructive',
            onPress: async () => {
              try {
                const payload = {
                  postId: currentPost._id,
                  reason,
                };
        
                const response = await post('report/post', payload);
        
                if (response.status === 200) {
                  Alert.alert(
                    'Success',
                    'Thanks for your feedback!\nWe use these reports to show you less of this kind of content in the future.'
                  );
                } else {
                  throw new Error(response.message);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to report post');
              } finally {
                setIsReportModalVisible(false);
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      setIsReportModalVisible(false);
    }
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
        post: item
      }
    });
  };

  // Handle scroll events
  const handleScroll = useCallback(() => {
    // If we're scrolling and a video is playing, pause it and update UI state
    if (currentPost?.contentType === 'video' && isPlaying) {
      // Direct video pause for immediate response
      if (videoRef.current) {
        try {
          const video = videoRef.current as any;
          if (video && video.pause) {
            video.pause();
          }
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }

      // Update states after attempting direct pause
      setIsPlaying(false);
      setIsMuted(true);
    }

    setIsScrolling(true);

    // Clear any existing timer
    if (scrollEndTimerRef.current) {
      clearTimeout(scrollEndTimerRef.current);
    }

    // Set a timer to detect when scrolling stops
    scrollEndTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150); // Reduce timeout for more responsive UI
  }, [currentPost, isPlaying]);

  // Callback function to pause video when FeedLayout is scrolled
  const handleFeedLayoutScroll = useCallback(() => {
    // If we're scrolling and a video is playing, pause it and update UI state
    if (currentPost?.contentType === 'video' && isPlaying) {
      // Direct video pause for immediate response
      if (videoRef.current) {
        try {
          const video = videoRef.current as any;
          if (video && video.pause) {
            video.pause();
          }
        } catch (error) {
          console.error('Error pausing video:', error);
        }
      }

      // Update states after attempting direct pause
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [currentPost, isPlaying]);

  // Add a layout effect to ensure video pausing happens immediately
  useLayoutEffect(() => {
    if (isScrolling && currentPost?.contentType === 'video' && videoRef.current) {
      const video = videoRef.current as unknown as { pause: () => void };
      video.pause();
      setIsPlaying(false);
      setIsMuted(true);
    }
  }, [isScrolling, currentPost]);

  // Ensure videos are paused when the user navigates away
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      pauseVideo();
    });

    return unsubscribe;
  }, [navigation, pauseVideo]);

  // Ensure video state is properly maintained when post changes
  useEffect(() => {
    // Only pause if this is a different post (not just a state update on the same post)
    if (currentPost?.contentType === 'video') {
      // New video post - initially play it if not scrolling
      if (!isScrolling) {
        // Short timeout to ensure component is fully mounted
        setTimeout(() => {
          setIsPlaying(true);
          // Keep mute state as is, to respect user preference
        }, 100);
      }
    } else {
      // Not a video, make sure any previous video is paused
      pauseVideo();
    }
  }, [currentPost?._id, pauseVideo]);

  // Enhance the useEffect for following state sync to match the pattern used in postDetailRewamped.tsx
  useEffect(() => {
    // Check if feedState has been updated with a new follow status
    if (feedState.lastUpdatedUserId && currentPost) {
      const userId = feedState.lastUpdatedUserId;

      // First check if this update affects the current post
      if (currentPost.posterDetails?.userId === userId) {
        const newFollowState = feedState.userFollowStatus[userId] || false;

        // Only update if the state is actually different to prevent unnecessary renders and logs
        if (currentPost.posterDetails.isFollowed !== newFollowState) {

          // Update current post with the new follow state
          setCurrentPost({
            ...currentPost,
            posterDetails: {
              ...currentPost.posterDetails,
              isFollowed: newFollowState
            }
          });
        }
      }

      // Then update any related posts with the same userId
      setRelatedPosts(prevPosts => {
        let updated = false;
        const updatedPosts = prevPosts.map(post => {
          if (post.posterDetails?.userId === userId) {
            const newFollowState = feedState.userFollowStatus[userId] || false;

            // Only mark as updated if the state is actually different
            if (post.posterDetails.isFollowed !== newFollowState) {
              updated = true;
              return {
                ...post,
                posterDetails: {
                  ...post.posterDetails,
                  isFollowed: newFollowState
                }
              };
            }
          }
          return post;
        });

        // Only log if we actually updated something
        if (updated) {
          return updatedPosts;
        }

        // If nothing changed, return the original array reference to prevent re-render
        return prevPosts;
      });
    }
  }, [feedState.lastUpdatedUserId, feedState.userFollowStatus, currentPost]);

  // Create a helper function to manage AsyncStorage memory usage
  const manageStorageMemory = async () => {
    try {
      // Get all AsyncStorage keys
      const keys = await AsyncStorage.getAllKeys();
      
      // Find cache-related keys that may be consuming excessive memory
      const cacheKeys = keys.filter(key => 
        key.includes('PostsCache') || 
        key.includes('initialData') || 
        key.includes('initialProfileData')
      );
      
      // Keep only the most recent 5 cache entries and remove older ones
      if (cacheKeys.length > 5) {
        const keysToRemove = cacheKeys.slice(0, cacheKeys.length - 5);
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} outdated storage keys`);
      }
    } catch (error) {
      console.error('Error managing storage memory:', error);
    }
  };

  // Call the storage cleanup function when the component mounts
  useEffect(() => {
    manageStorageMemory();
  }, []);

  // Add postsState from Redux to track updates
  const postsState = useSelector((state: RootState) => state.posts);
  
  // Add effect to check for updated post data in Redux when the screen is focused
  useFocusEffect(
    useCallback(() => {
      // Check if the current post is the one that was just edited
      if (currentPost && postsState.lastEditedPostId === currentPost._id) {
        console.log('[FeedDetailExp] Detected post update in Redux, refreshing UI');
        
        // Get the updated post data from Redux
        const updatedPostData = postsState.posts[currentPost._id]?.fullPostData;
        
        if (updatedPostData) {
          // Update the current post with the new data
          setCurrentPost(updatedPostData);
          
          // Also update the post in the posts array to ensure consistency
          if (posts && posts.length > 0) {
            const updatedPosts = posts.map(post => 
              post._id === currentPost._id ? updatedPostData : post
            );
            
            // If there's a callback to update parent component, call it
            if (onFollowUpdate) {
              onFollowUpdate(updatedPosts);
            }
          }
          
          // Update related posts if the updated post is there
          setRelatedPosts(prevRelatedPosts => 
            prevRelatedPosts.map(post => 
              post._id === currentPost._id ? updatedPostData : post
            )
          );
        }
        
        // Clear the last edited post ID from Redux to avoid duplicate updates
        dispatch(clearLastEditedPost());
      }
    }, [currentPost, postsState.lastEditedPostId, postsState.posts])
  );

  

  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={18} color={Color.black} />
          </TouchableOpacity>
          <Text style={styles.headerUsername}>
            {
              !isSelfProfile ? 'Explore' :
                currentPost?.posterDetails?.username || 'Post Detail'
            }
          </Text>
          {isSelfProfile && currentPost ? (
            <TouchableOpacity onPress={() => routeToEditPost(currentPost)} style={styles.rightHeader}>
              <Image
                source={require('../../../assets/icons/editIcon.png')}
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleOptionsModal} style={styles.rightHeader}>
              <Ionicons name="ellipsis-vertical" size={20} color={Color.black} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={8} // Increase frequency of scroll events for responsiveness
          contentContainerStyle={styles.scrollContent}
          nestedScrollEnabled={true}
          onScroll={handleScroll}
          onScrollBeginDrag={() => {
            pauseVideo();
            setIsScrolling(true);
          }}
          onMomentumScrollEnd={() => {
            // Use a shorter timeout for better responsiveness
            setTimeout(() => setIsScrolling(false), 150);
          }}
        >
          {renderActivePostContent()}

          {/* Related posts grid using FeedLayout */}
          <View style={styles.relatedPostsContainer}>
            <FeedLayout
              data={relatedPosts}
              token={token || ''}
              accountType={accountType}
              currentUserId={currentUserId}
              pageName={pageName}
              onDataUpdate={handleDataUpdate}
              onLoadMore={pageName === 'feed' ? loadMorePosts : () => {}}
              loading={pageName === 'tags' ? false : (pageName === 'feed' ? isLoading : false)}
              hasMoreItems={pageName === 'tags' ? false : (pageName === 'feed' ? hasMoreItems : false)}
              initialLoading={pageName === 'tags' ? false : (pageName === 'feed' ? initialLoading : false)}
              showFAB={false}
              onItemClick={handleItemClick}
              onScroll={() => {
                // Immediately pause video and mute when FeedLayout scrolls
                if (currentPost?.contentType === 'video' && videoRef.current) {
                  try {
                    const video = videoRef.current as any;
                    if (video && video.pause) {
                      video.pause();
                      setIsPlaying(false);
                      setIsMuted(true);
                    }
                  } catch (error) {
                    console.error('Error pausing video:', error);
                  }
                }
                setIsScrolling(true);

                // Clear any existing timer
                if (scrollEndTimerRef.current) {
                  clearTimeout(scrollEndTimerRef.current);
                }

                // Set a timer to detect when scrolling ends with shorter timeout
                scrollEndTimerRef.current = setTimeout(() => {
                  setIsScrolling(false);
                }, 150);
              }}
            />
          </View>
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
                <Text style={[styles.optionText, { color: '#FF3B30' }]}>Report</Text>
                <Image
                  source={require('../../../assets/rewampedIcon/reportIcon.png')}
                  style={styles.optionIcon}
                />
              </TouchableOpacity>
              <View style={styles.divider} />

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

        {/* Modal for reporting post */}
        {isReportModalVisible && (
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
        )}

        {/* Bottom Sheet Modal for Save functionality */}
        {isBottomSheetVisible && (
        <BottomSheetModal
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
          post={selectedPost}
          saveToggle={handleSaveToCollection}
        />
        )}

        {/* Tagged Users Bottom Sheet */}
        {showTaggedUsers && (
        <CustomTaggedUsersBottomSheet
          visible={showTaggedUsers}
          taggedUsers={currentPost?.taggedUsersDetails || []}
          onClose={() => setShowTaggedUsers(false)}
            onTagSelect={handleTagSelect}
            title="Tagged People"
          />
        )}

        {showLikedUsers && (  
        <LikedUsersModal
          visible={showLikedUsers}
          onClose={() => setShowLikedUsers(false)}
          postId={currentPost?._id || ''}
        />
        )}

        {openComments && (
          <BottomSheet
            enablePanDownToClose
            index={0}
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
            needsOffscreenAlphaCompositing={true}
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
                postId={currentPost?._id || ''}
                isLast={false}
                navigation={navigation}
                token={token || ''}
                selfPost={isSelfProfile}
              />
            </BottomSheetView>
          </BottomSheet>
        )}

        {/* Location Modal */}
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
  // container: {
  //   flex: 1,
  //   overflow: 'hidden',
  //   backgroundColor: Color.white,
  // },
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
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  backButton: {
    padding: 4,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FontFamilies.bold,
    color: '#000',
  },
  rightHeader: {
    width: 32,
  },
  scrollContent: {
    flexGrow: 1,
  },
  activePostContainer: {
    marginBottom: 16,
  },
  mediaContainer: {
    width: '100%',
    height: windowWidth,
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Color.white,
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    padding: 10,
  },
  fullScreenButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
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
  videoProgressContainer: {
    position: 'absolute',
    bottom: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    minWidth: 35,
    textAlign: 'center',
  },
  seekBarContainer: {
    flex: 1,
    marginHorizontal: 12,
    position: 'relative',
  },
  seekBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  seekBarProgress: {
    height: 4,
    backgroundColor: '#fff',
    borderRadius: 2,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  seekBarThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    position: 'absolute',
    top: -4,
    marginLeft: -6,
  },
  seekBarTouchArea: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    height: 24,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 12,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%', // Give it a fixed percentage
    justifyContent: 'flex-start',
  },
  actionItem: {
    alignItems: 'center',
    width: 40, // Fixed width for each action
  },
  actionIcon: {
    width: 23,
    height: 23,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 12,
    color: '#000',
    textAlign: 'center', // Center the text
    minWidth: 20, // Ensure minimum width
  },
  timeAgo: {
    fontSize: 12,
    fontFamily: FontFamilies.regular,
    color: '#666',
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
    // marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    gap: 10, // Add consistent gap between all items
  },
  tagItem: {
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
    marginBottom: 6, // Add vertical margin for wrapped items
  },
  tagText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
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
    marginBottom: 6, // Match tagItem style
  },
  moreTagsText: {
    fontSize: FontSizes.small,
    color: Color.black,
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
    lineHeight: 15,
  },
  relatedPostsContainer: {
    flex: 1,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  username: {
    fontSize: 16,
    fontFamily: FontFamilies.regular,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  locationText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FontFamilies.regular,
  },
  footerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    width: '100%',
    // borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
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
  videoTaggedUsersOverlay: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    flexDirection: 'row',
    gap: 10,
    zIndex: 1,
  },
});

export default FeedDetailExp;