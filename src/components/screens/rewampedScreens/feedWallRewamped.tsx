import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Modal,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, del } from '../../../services/dataRequest';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PostCard from '../../commons/cardComponents/postCard';
import VideoCard from '../../commons/cardComponents/videoCard';
import ProjectCard from '../../commons/cardComponents/projectCard';
import CustomFAB from '../../commons/customFAB';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUserId } from '../../../redux/reducers/chatSlice';
import { isEmpty } from 'lodash';
import { Color, FontFamilies } from '../../../styles/constants';
import GetStartedModal from '../../commons/getStartedModal';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import { initializeLikes, toggleLike } from '../../../redux/slices/likeSlice';
import { RootState } from '../../../redux/store';
import { FlashList } from '@shopify/flash-list';
import { updateFollowStatus, updateMultipleFollowStatus, clearLastUpdatedUser } from '../../../redux/slices/followSlice';
import { setFeedPosts, updatePostFollowStatus } from '../../../redux/slices/feedSlice';
import { toggleSave, setSaveStatus, initializeSavedPosts } from '../../../redux/slices/saveSlice';
import { initializeCommentCounts } from '../../../redux/slices/commentSlice';
import { is } from 'date-fns/locale';

type RootStackParamList = {
  PostDetail: {
    feed: any;
    accountType: string;
    loggedInUserId: string;
    token: string;
    pageName: string;
  };
  ProjectDetail: {
    feed: any;
    accountType: string;
    loggedInUserId: string;
    token: string;
    pageName: string;
  };
  ProjectDetailRewamped: {
    feed: any;
    accountType: string;
    token: string;
    pageName: string;
  };
  PostDetailRewamped: {
    posts: Array<any>;
    currentIndex: number;
    type: string;
    projectId: string;
    token: string;
    onFollowUpdate: (updatedPosts: any[]) => void;
  };
  feedSearchScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const windowWidth = Dimensions.get('window').width;
const numColumns = 2;
const horizontalPadding = 6;
const gap = 12;
// Calculate item width based on full screen width minus padding and gap
const itemWidth = (windowWidth - (horizontalPadding * 2) - gap) / 2;

// Add type definitions for card props
interface BaseCardProps {
  isFollowed?: boolean;
  onFollowPress?: () => Promise<void>;
}

interface ProjectCardProps extends BaseCardProps {
  title: string;
  images: string[];
  isLiked: boolean;
  isSaved: boolean;
  onLikePress: () => void;
  onSavePress: () => void;
  onPress: () => void;
  showIcons: boolean;
  style: any;
  pageName: string;
}

interface VideoCardProps extends BaseCardProps {
  item: any;
  onPress: () => void;
  isLiked: boolean;
  isSaved: boolean;
  onLikePress: () => void;
  onSavePress: () => void;
  style: any;
}

interface PostCardProps extends BaseCardProps {
  item: any;
  onPress: () => void;
  isLiked: boolean;
  isSaved: boolean;
  onLikePress: () => void;
  onSavePress: () => void;
  style: any;
}

const FeedWallRewamped = () => {
  const [token, setToken] = useState('');
  const [feedWallData, setFeedWallData] = useState<any[]>([]);
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [shouldFetchNewData, setShouldFetchNewData] = useState(true);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const listRef = useRef<FlashList<any>>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const followState = useSelector((state: RootState) => state.follow);
  const feedState = useSelector((state: RootState) => state.feed);
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
  const handleScroll = () => {
    if (isFabOpen) {
      setIsFabOpen(false);
    }
  };

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const [savedToken, accountType_, account_] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('accountType'),
        AsyncStorage.getItem('user')
      ]);

      const userId = JSON.parse(account_!);
      setCurrentUser(userId?._id);
      setAccountType(accountType_!);
      dispatch(setCurrentUserId(userId?._id));
      setToken(savedToken || 'No token found');
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const fetchPosts = useCallback(async (pageNum = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      console.log("[FeedWall] Fetching posts for page:", pageNum);
      
      const data = await get(
        `ugc/get-mixed-ugc?page=${pageNum}&limit=24`,
        {},
        token,
      );

      // Initialize Redux BEFORE updating local state
      dispatch(initializeLikes(data.ugcs));
      
      // Initialize saved posts state
      dispatch(initializeSavedPosts(data.ugcs.map((post: any) => ({
        _id: post._id,
        isSaved: post.isSaved || false
      }))));

      // Initialize comment counts in Redux
      dispatch(initializeCommentCounts(data.ugcs.map((post: any) => ({
        _id: post._id,
        commentCount: post.commentsCount || 0
      }))));
      
      // Wait for Redux update to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      // Get current follow states from Redux
      const currentFollowStates = feedState.userFollowStatus;
      
      // Update posts with preserved follow states
      let updatedPosts = data.ugcs.map((post: any) => {
        if (post.posterDetails?.userId) {
          const userId = post.posterDetails.userId;
          // Preserve existing follow state if it exists
          const preservedFollowState = currentFollowStates[userId];

          if (preservedFollowState !== undefined) {
            return {
              ...post,
              posterDetails: {
                ...post.posterDetails,
                isFollowed: preservedFollowState
              },
              userDetails: {
                ...post.userDetails,
                isFollowed: preservedFollowState
              }
            };
          }
        }
        return post;
      });

      // Separate videos and non-video posts
      const videoPosts = updatedPosts.filter(post => post.contentType === 'video');
      const nonVideoPosts = updatedPosts.filter(post => post.contentType !== 'video');

      // Insert videos after every 4 posts
      const postsWithVideos: any[] = [];
      let videoIndex = 0;

      for (let i = 0; i < nonVideoPosts.length; i++) {
        postsWithVideos.push(nonVideoPosts[i]);
        
        // After every 4 posts, insert a video if available
        if ((i + 1) % 4 === 0 && videoIndex < videoPosts.length) {
          postsWithVideos.push(videoPosts[videoIndex]);
          videoIndex++;
        }
      }

      // Add any remaining videos at the end
      while (videoIndex < videoPosts.length) {
        postsWithVideos.push(videoPosts[videoIndex]);
        videoIndex++;
      }

      // Store updated posts in Redux
      dispatch(setFeedPosts(postsWithVideos));

      if (pageNum === 1) {
        console.log("[FeedWall] Setting initial feed data");
        setFeedWallData(postsWithVideos);
      } else {
        console.log("[FeedWall] Appending new posts to existing data");
        setFeedWallData(prevData => {
          const newPosts = [...prevData, ...postsWithVideos];
          const uniquePosts = newPosts.filter(
            (post, index, self) =>
              index === self.findIndex(p => p._id === post._id),
          );
          console.log("[FeedWall] Updated feed data:", {
            previousCount: prevData.length,
            newCount: uniquePosts.length,
            addedPosts: uniquePosts.length - prevData.length
          });
          return uniquePosts;
        });
      }

      setPage(pageNum);
      setHasMorePosts(data.ugcs.length === 24);
      
      console.log("[FeedWall] Feed update complete:", {
        currentPage: pageNum,
        hasMorePosts: data.ugcs.length === 24,
        totalPosts: feedWallData.length + postsWithVideos.length
      });
    } catch (error) {
      console.error('[FeedWall] Error fetching feedWallData:', error);
    } finally {
      setLoading(false);
    }
  }, [token, dispatch, feedState.userFollowStatus, likedPosts, likeCounts, savedPosts]);

  const restorePostsFromCache = useCallback(async () => {
    try {
      const cachedPosts = await AsyncStorage.getItem('feedWallPostsCache');
      if (cachedPosts && feedWallData.length === 0) {
        console.log("[FeedWall] Restoring posts from cache");
        const parsedPosts = JSON.parse(cachedPosts);
        setFeedWallData(parsedPosts);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[FeedWall] Error restoring posts from cache:", error);
      return false;
    }
  }, [feedWallData.length]);

  useFocusEffect(
    useCallback(() => {
      const setupData = async () => {
        // Try to restore from cache first
        const restoredFromCache = await restorePostsFromCache();
        
        // If cache restore failed or we need fresh data
        if (!restoredFromCache && shouldFetchNewData) {
          // If we have follow states in Redux, preserve them
          const preservedFollowStates = feedState.userFollowStatus;
          
          fetchPosts(1).then(() => {
            // After fetching, ensure follow states are preserved
            if (Object.keys(preservedFollowStates).length > 0) {
              console.log("[FeedWall] Preserving follow states after fetch:", {
                preservedStates: preservedFollowStates,
                totalUsers: Object.keys(preservedFollowStates).length
              });

              setFeedWallData(prevData => {
                const updatedData = prevData.map(post => {
                  if (post.posterDetails?.userId) {
                    const userId = post.posterDetails.userId;
                    const preservedState = preservedFollowStates[userId];
                    if (preservedState !== undefined) {
                      return {
                        ...post,
                        posterDetails: {
                          ...post.posterDetails,
                          isFollowed: preservedState
                        },
                        userDetails: {
                          ...post.userDetails,
                          isFollowed: preservedState
                        }
                      };
                    }
                  }
                  return post;
                });

                return updatedData;
              });
            }
          });
          setShouldFetchNewData(false);
        }
      };
      
      setupData();
    }, [fetchPosts, shouldFetchNewData, feedState.userFollowStatus, restorePostsFromCache])
  );

  const onRefresh = useCallback(() => {
    setRefreshCount(prev => prev + 1);

    if (refreshCount >= 3) {
      setRefreshCount(0);
      setShouldFetchNewData(true);
      fetchPosts(1);
    } else {
      setFeedWallData(prevPosts => shuffleArray(prevPosts));
    }
  }, [refreshCount, fetchPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMorePosts) {
      const nextPage = page + 1;
      console.log("[FeedWall] Fetching page:", nextPage);
      fetchPosts(nextPage);
    }
  }, [loading, hasMorePosts, page, fetchPosts]);

   const handleCardPress = (item: any) => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
    } else {
      if (item.contentType === 'project') {
        navigation.navigate('ProjectDetailRewamped', {
          feed: item,
          accountType: accountType,
          token: token,
          pageName: 'home'
        });
      } else {
        const currentIndex = feedWallData.findIndex(post => post._id === item._id);
        // Create a structured array of items with all necessary details
        const items = feedWallData.map((post: any) => {
          // Safely handle date values
          const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
          const formattedDate = isNaN(createdAt.getTime()) ? new Date() : createdAt;    
          
          // Preserve existing data structure more carefully
          const userDetails = {
            id: post.posterDetails?.userId || post.userDetails?.id || '',
            name: post.posterDetails?.firstName || post.userDetails?.name || '',
            username: post.posterDetails?.username || post.userDetails?.username || '',
            location: post.location || post.userDetails?.location || '',
            profilePic: post.posterDetails?.profilePic || post.userDetails?.profilePic || '',
            isLiked: post.isLiked !== undefined ? post.isLiked : (post.userDetails?.isLiked || false),
            isSaved: post.isSaved !== undefined ? post.isSaved : (post.userDetails?.isSaved || false),
            likeCount: post.likes || post.userDetails?.likeCount || 0,
            commentCount: post.commentsCount || post.userDetails?.commentCount || 0,
            isFollowed: post.posterDetails?.isFollowed !== undefined 
              ? post.posterDetails.isFollowed 
              : (post.userDetails?.isFollowed || false)
          };
          console.log("userDetails :: 415 ::", userDetails);
          // Keep full original post data structure to avoid data loss
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
        
        // Store the full data in AsyncStorage for backup
        AsyncStorage.setItem('feedWallPostsCache', JSON.stringify(items));
        
        navigation.navigate('PostDetailRewamped', {
          posts: items,
          currentIndex: currentIndex >= 0 ? currentIndex : 0,
          type: item.contentType || 'post',
          projectId: item._id,
          token: token,
          pageName: 'home',
          onFollowUpdate: (updatedPosts: any[]) => {
            // Use a more robust update approach to preserve data integrity
            setFeedWallData(prevState => {
              // Create a map of previous posts by ID for quick lookup
              const prevPostsMap = new Map(prevState.map(post => [post._id, post]));
              
              // Apply updates from updatedPosts to our map
              updatedPosts.forEach(updatedPost => {
                if (updatedPost._id) {
                  const existingPost = prevPostsMap.get(updatedPost._id);
                  if (existingPost) {
                    // Merge the data, prioritizing the updated data
                    prevPostsMap.set(updatedPost._id, {
                      ...existingPost,
                      ...updatedPost,
                      posterDetails: {
                        ...existingPost.posterDetails,
                        ...updatedPost.posterDetails,
                        // Ensure follow state is updated
                        isFollowed: updatedPost.userDetails?.isFollowed !== undefined
                          ? updatedPost.userDetails.isFollowed
                          : (updatedPost.posterDetails?.isFollowed || existingPost.posterDetails?.isFollowed || false)
                      },
                      userDetails: {
                        ...existingPost.userDetails,
                        ...updatedPost.userDetails
                      }
                    });
                  }
                }
              });
              
              // Convert map back to array
              return Array.from(prevPostsMap.values());
            });
          }
        });
      }
    }
  };

  const handleProjectLike = async (projectItem: any) => {
    try {
      // Get current state from Redux with explicit has-property check
      const reduxHasLikeInfo = likedPosts.hasOwnProperty(projectItem._id);
      const isLikedInRedux = reduxHasLikeInfo ? likedPosts[projectItem._id] : projectItem.isLiked;
      const likeCountInRedux = reduxHasLikeInfo ? likeCounts[projectItem._id] : (projectItem.likes || 0);
      
      // Calculate new state
      const newLikeState = !isLikedInRedux;
      const newLikeCount = isLikedInRedux ? likeCountInRedux - 1 : likeCountInRedux + 1;
      
      // First, dispatch Redux action for instant UI update
      dispatch(toggleLike(projectItem._id));
      
      // Update local feed data
      setFeedWallData(prevPosts =>
        prevPosts.map(post =>
          post._id === projectItem._id
            ? { 
                ...post, 
                isLiked: newLikeState, 
                likes: newLikeCount 
              }
            : post
        )
      );
      
      // Then make API call - use project like endpoint
      const response = await post(`project/toggle-like/?projectId=${projectItem._id}`, {});
      console.log("response :: 415 like project in feedWallRewamped", response);
      
      // If API call fails, revert changes
      if (response.status !== 200) {
        // Revert Redux state
        dispatch(toggleLike(projectItem._id));
        
        // Revert local state
        setFeedWallData(prevPosts =>
          prevPosts.map(post =>
            post._id === projectItem._id
              ? { 
                  ...post, 
                  isLiked: isLikedInRedux, 
                  likes: likeCountInRedux 
                }
              : post
          )
        );
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error toggling project like:', error);
      Alert.alert('Error', 'Failed to update project like status');
    }
  };

  const handleLikePress = async (item: any) => {
    // Special handler for projects
    if (item.contentType === 'project') {
      return handleProjectLike(item);
    }
    
    try {
      // Get current state from Redux with proper checking
      const reduxHasLikeInfo = likedPosts.hasOwnProperty(item._id);
      const isLikedInRedux = reduxHasLikeInfo ? likedPosts[item._id] : item.isLiked;
      const likeCountInRedux = reduxHasLikeInfo ? likeCounts[item._id] : (item.likes || 0);
      
      // Calculate new state
      const newLikeState = !isLikedInRedux;
      const newLikeCount = isLikedInRedux ? likeCountInRedux - 1 : likeCountInRedux + 1;

      // First, dispatch Redux action for instant UI update
      dispatch(toggleLike(item._id));
      
      // Update local feed data
      setFeedWallData(prevPosts =>
        prevPosts.map(post =>
          post._id === item._id
            ? { 
                ...post, 
                isLiked: newLikeState, 
                likes: newLikeCount 
              }
            : post
        )
      );
      
      // Make API call
      const response = await post(`ugc/toggle-like/${item._id}`, {});
      console.log("response :: 658 like post in feedWallRewamped", response);
      
      // If API call fails, revert changes
      if (response.status !== 200) {
        // Revert Redux state
        dispatch(toggleLike(item._id));
        
        // Revert local state
        setFeedWallData(prevPosts =>
          prevPosts.map(post =>
            post._id === item._id
              ? { 
                  ...post, 
                  isLiked: isLikedInRedux, 
                  likes: likeCountInRedux 
                }
              : post
          )
        );
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSavePress = async (item: any) => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
      return;
    }

    try {
      // Get current save state from Redux
      const isSavedInRedux = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;

      if (isSavedInRedux) {
        // If already saved, perform unsave operation
        // Update Redux state immediately for better UX
        dispatch(setSaveStatus({ postId: item._id, isSaved: false }));
        
        // Update local state
        setFeedWallData(prevPosts =>
          prevPosts.map(post =>
            post._id === item._id
              ? { ...post, isSaved: false }
              : post
          )
        );
        
        // Make API call to remove from collection
        const response = await del(`collections/remove-item/${item._id}`);
        console.log("Unsave response:", response);
        
        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: item._id, isSaved: true }));
          
          // Revert local state
          setFeedWallData(prevPosts =>
            prevPosts.map(post =>
              post._id === item._id
                ? { ...post, isSaved: true }
                : post
            )
          );
          
          throw new Error('Failed to remove from collection');
        }
        
        // showLocalToast('Removed from collection');
      } else {
        // If not saved, open the collection selector modal
        setSelectedPost(item);
        setIsBottomSheetVisible(true);
      }
    } catch (error) {
      console.error('Error removing from collection:', error);
      Alert.alert('Error', 'Failed to remove from collection');
    }
  };

  const handleSaveToCollection = async (collectionInfo: any) => {
    try {
      console.log("Collection info received:", collectionInfo);
      
      // Update Redux state immediately for better UX
      dispatch(setSaveStatus({ postId: selectedPost._id, isSaved: true }));
      
      // Update local state
      setFeedWallData(prevPosts =>
        prevPosts.map(post =>
          post._id === selectedPost._id
            ? { ...post, isSaved: true }
            : post
        )
      );
      
      // Check if this is a new collection creation
      // If so, skip the API call as the item was already added during collection creation
      if (!collectionInfo.isNewCollection) {
        const id = collectionInfo?.collectionInfo?.collectionId;
        console.log("selectedPost :: 257 ::", selectedPost?.contentType);
        // const itemType = selectedPost?.contentType === "ugc" || selectedPost?.contentType === "video" || selectedPost?.contentType === "photo" ? 'post' : selectedPost?.contentType;
        const itemType = selectedPost?.contentType === "ugc" ? 'photo' : selectedPost?.contentType;
        console.log("itemType :: 259 ::", itemType);
        
        if (!selectedPost?._id) {
          console.error("Missing post ID");
          throw new Error("Missing post ID");
        }
        
        if (!id) {
          console.error("Missing collection ID");
          throw new Error("Missing collection ID");
        }
        
        // Make API call only for existing collections
        const response = await post(`collections/add-item/${id}`, {
          itemId: selectedPost._id,
          itemType: itemType     
        });
        
        console.log("Save response:", {
          itemId: selectedPost._id,
          itemType: selectedPost?.contentType === "ugc" || "video" ? 'post' : selectedPost?.contentType
        });
        
        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: selectedPost._id, isSaved: false }));
          
          // Revert local state
          setFeedWallData(prevPosts =>
            prevPosts.map(post =>
              post._id === selectedPost._id
                ? { ...post, isSaved: false }
                : post
            )
          );
          
          throw new Error('Failed to add to collection');
        }
      } else {
        console.log("Skipping API call for new collection - item already added during collection creation");
      }
      
      // showLocalToast('Added to collection');
    } catch (error) {
      console.error('Error saving to collection:', error);
      Alert.alert('Error', 'Failed to add to collection');
    } finally {
      setIsBottomSheetVisible(false);
    }
  };

  // Add a simple toast function
  const showLocalToast = (message: string) => {
    Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
  };

  // Update local state when Redux feed state changes
  useEffect(() => {
    if (feedState.lastUpdatedUserId) {
      console.log("[FeedWall] Feed state changed in Redux:", {
        lastUpdatedUserId: feedState.lastUpdatedUserId,
        lastAction: feedState.lastAction,
        userFollowStatus: feedState.userFollowStatus,
        timestamp: new Date().toISOString()
      });

      setFeedWallData(prevData => {
        const updatedData = prevData.map(post => {
          const userId = feedState.lastUpdatedUserId;
          if (userId && post.posterDetails?.userId === userId) {
            const newFollowState = feedState.lastAction === 'follow';
            console.log("[FeedWall] Updating post follow state:", {
              postId: post._id,
              userId,
              oldState: post.posterDetails.isFollowed,
              newState: newFollowState,
              contentType: post.contentType,
              timestamp: new Date().toISOString()
            });

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

        console.log("[FeedWall] Feed data updated with new follow states:", {
          totalPosts: updatedData.length,
          updatedPosts: updatedData.filter(post => 
            post.posterDetails?.userId === feedState.lastUpdatedUserId
          ).map(post => ({
            postId: post._id,
            userId: post.posterDetails?.userId,
            isFollowed: post.posterDetails?.isFollowed,
            contentType: post.contentType
          })),
          timestamp: new Date().toISOString()
        });

        return updatedData;
      });
    }
  }, [feedState.lastUpdatedUserId, feedState.lastAction, feedState.userFollowStatus]);

  const handleFollowUser = async (userId: string, currentFollowState: boolean) => {
    if (!userId) return;

    try {
      console.log("[FeedWall] Following user:", {
        userId,
        currentFollowState,
        timestamp: new Date().toISOString()
      });

      const response = await post(`user/toggle-follow/${userId}`, {});
      console.log("[FeedWall] Follow API response:", response);

      if (response.status === 200) {
        const newFollowState = !currentFollowState;
        
        // Update Redux feed state
        dispatch(updatePostFollowStatus({ 
          userId, 
          isFollowed: newFollowState 
        }));

        // Update local state
        setFeedWallData(prevData => {
          const updatedData = prevData.map(post => {
            if (post.posterDetails?.userId === userId) {
              return {
                ...post,
                posterDetails: {
                  ...post.posterDetails,
                  isFollowed: newFollowState
                }
              };
            }
            return post;
          });
          return updatedData;
        });
      }
    } catch (error) {
      console.error('[FeedWall] Error toggling follow:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const userId = item.posterDetails?.userId;
    const isFollowed = userId ? followState.followedUsers[userId] || false : false;

    // Direct access to Redux state with proper null checks
    const reduxHasLikeInfo = likedPosts.hasOwnProperty(item._id);
    const isLikedFromRedux = reduxHasLikeInfo ? likedPosts[item._id] : item.isLiked;
    const likeCountFromRedux = reduxHasLikeInfo ? likeCounts[item._id] : (item.likes || 0);
    const isSavedFromRedux = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;

    if (item?.contentType === 'project') {
      return (
        <ProjectCard
          key={`project-${item._id}`}
          title={item.caption || ''}
          images={item.contentUrl || (item.coverImage ? [item.coverImage] : [])}
          isLiked={isLikedFromRedux}
          isSaved={isSavedFromRedux}
          onLikePress={() => handleProjectLike(item)}
          onSavePress={() => handleSavePress(item)}
          onPress={() => handleCardPress(item)}
          showIcons={true}
          style={styles.gridItem}
          pageName="feed"
          isFollowed={isFollowed}
          onFollowPress={() => handleFollowUser(userId, isFollowed)}
        />
      );
    } else if (item?.contentType === 'video') {
      return (
        <VideoCard
          key={`video-${item._id}`}
          item={item}
          onPress={() => handleCardPress(item)}
          isLiked={isLikedFromRedux}
          isSaved={isSavedFromRedux}
          likeCount={likeCountFromRedux}
          onLikePress={() => handleLikePress(item)}
          onSavePress={() => handleSavePress(item)}
          style={styles.gridItem}
          isFollowed={isFollowed}
          onFollowPress={() => handleFollowUser(userId, isFollowed)}
        />
      );
    } else {
      return (
        <PostCard
          key={`post-${item._id}`}
          item={item}
          onPress={() => handleCardPress(item)}
          isLiked={isLikedFromRedux}
          isSaved={isSavedFromRedux}
          likeCount={likeCountFromRedux}
          onLikePress={() => handleLikePress(item)}
          onSavePress={() => handleSavePress(item)}
          style={styles.gridItem}
          isFollowed={isFollowed}
          onFollowPress={() => handleFollowUser(userId, isFollowed)}
        />
      );
    }
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Color.black} />
      </View>
    );
  };

  // Update useEffect to sync with Redux save state
  useEffect(() => {
    if (feedWallData.length > 0) {
      // Update local state with Redux save state
      setFeedWallData(prevData => 
        prevData.map(post => {
          // Check if this post's save state is in Redux
          const hasSaveState = savedPosts[post._id] !== undefined;
          if (hasSaveState) {
            // If it exists in Redux, use that value
            return {
              ...post,
              isSaved: savedPosts[post._id]
            };
          }
          // Otherwise keep the current value
          return post;
        })
      );
    }
  }, [savedPosts]);

  return (
    <TouchableWithoutFeedback onPress={() => setIsFabOpen(false)}>
      <SafeAreaView style={styles.container}>
        <GetStartedModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        <CustomFAB
          accountType={accountType}
          isOpen={isFabOpen}
          onToggle={() => {
            if (accountType === 'temp') {
              setIsModalVisible(true);
            }
          }}
        />
        <BottomSheetModal
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
          post={selectedPost}
          saveToggle={handleSaveToCollection}
        />
        <FlashList
          ref={listRef}
          data={feedWallData}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          estimatedItemSize={itemWidth}
          onRefresh={onRefresh}
          refreshing={false}
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          numColumns={2}
          ListHeaderComponent={() => <View style={{ height: gap }} />}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: gap }} />}
          extraData={[likedPosts, likeCounts]}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  listContent: {
    paddingHorizontal: horizontalPadding,
    paddingBottom: 80,
  },
  gridItem: {
    width: itemWidth,
    flex: 1,
    marginHorizontal: gap / 2,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default FeedWallRewamped;