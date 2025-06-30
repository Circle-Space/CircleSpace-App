import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { get } from '../../../services/dataRequest';
import FeedLayout from './feedLayout';
import CustomFAB from '../../commons/customFAB';
import { useDispatch, useSelector } from 'react-redux';
import { initializeLikes } from '../../../redux/slices/likeSlice';
import { initializeSavedPosts } from '../../../redux/slices/saveSlice';
import { initializeCommentCounts } from '../../../redux/slices/commentSlice';
import { setFeedPosts, updatePostFollowStatus, syncFollowStatus } from '../../../redux/slices/feedSlice';
import { RootState } from '../../../redux/store';

// Define the navigation stack params
type RootStackParamList = {
  FeedDetailExp: {
    posts: any[];
    currentIndex: number;
    type: string;
    projectId: string;
    token: string;
    pageName: string;
    onFollowUpdate: (updatedPosts: any[]) => void;
  };
  // Add other screens as needed
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FeedWallExp = () => {
  const navigation = useNavigation<NavigationProp>();
  const [token, setToken] = useState('');
  const [feedWallData, setFeedWallData] = useState<any[]>([]);
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const [shouldFetchNewData, setShouldFetchNewData] = useState(true);
  const [lastScrollTime, setLastScrollTime] = useState(0);
  const dispatch = useDispatch();
  // Get Redux state for follow status
  const feedState = useSelector((state: RootState) => state.feed);
  const followState = useSelector((state: RootState) => state.follow);

  // Add useEffect for syncing follow state from redux updates
  useEffect(() => {
    // Check if feedState has been updated with a new follow status
    if (feedState.lastUpdatedUserId && feedWallData.length > 0) {
      const userId = feedState.lastUpdatedUserId;
      const newFollowState = feedState.userFollowStatus[userId] || false;
      
      // Update feedWallData with the new follow state for matching users
      setFeedWallData(prevData => {
        let updated = false;
        const updatedData = prevData.map(post => {
          if (post.posterDetails?.userId === userId) {
            // Only update if the state is actually different
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
        
        // Only log and update if we actually changed something
        if (updated) {
          // Update Redux with the modified data for consistency
          dispatch(setFeedPosts(updatedData));
          return updatedData;
        }
        
        // If nothing changed, return the original array reference to prevent re-render
        return prevData;
      });
    }
  }, [feedState.lastUpdatedUserId, feedState.userFollowStatus, feedWallData.length]);

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

  // Function to handle card press and navigate to detail view
  const handleCardPress = (item: any) => {
    if (accountType === 'temp') {
      // Handle temp account case if needed
      return;
    }
    
    // Find the index of the selected item in the feed data
    const currentIndex = feedWallData.findIndex(post => post._id === item._id);
    
    if (currentIndex === -1) {
      console.error('Could not find selected post in feed data');
      return;
    }
    
    // Navigate to feed detail view
    navigation.navigate('FeedDetailExp', {
      posts: feedWallData,
      currentIndex,
      type: item.contentType || 'post',
      projectId: item._id,
      token: token,
      pageName: 'feed',
      onFollowUpdate: (updatedPosts: any[]) => {
        // Update feed data when returning from detail view
        setFeedWallData(prevState => {
          // Create a map of previous posts by ID for quick lookup
          const prevPostsMap = new Map(prevState.map(post => [post._id, post]));
          
          // Apply updates from updatedPosts to our map
          updatedPosts.forEach(updatedPost => {
            if (updatedPost._id) {
              const existingPost = prevPostsMap.get(updatedPost._id);
              if (existingPost) {
                const userId = updatedPost.posterDetails?.userId;
                let followState = updatedPost.posterDetails?.isFollowed;
                
                // Check if we have a more recent follow state in Redux
                if (userId && feedState.userFollowStatus[userId] !== undefined) {
                  followState = feedState.userFollowStatus[userId];
                }
                
                // Merge the data, prioritizing the updated data
                prevPostsMap.set(updatedPost._id, {
                  ...existingPost,
                  ...updatedPost,
                  posterDetails: {
                    ...existingPost.posterDetails,
                    ...updatedPost.posterDetails,
                    // Ensure follow state is updated with the most recent value
                    isFollowed: followState
                  },
                  userDetails: {
                    ...existingPost.userDetails,
                    ...updatedPost.userDetails,
                    // Ensure follow state is consistent
                    isFollowed: followState
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
  };

  const fetchPosts = useCallback(async (pageNum = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      if (pageNum === 1) {
        setInitialLoading(true);
      }
      
      
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
      
      // Get current follow states from Redux
      const currentFollowStates = feedState.userFollowStatus;
      
      // Separate videos and non-video posts
      const videoPosts = data.ugcs.filter((post: any) => post.contentType === 'video');
      const nonVideoPosts = data.ugcs.filter((post: any) => post.contentType !== 'video');

      // Insert videos after every 4 posts
      const postsWithVideos: any[] = [];
      let videoIndex = 0;

      for (let i = 0; i < nonVideoPosts.length; i++) {
        // Get post and check if we need to update its follow state
        const post = nonVideoPosts[i];
        if (post.posterDetails?.userId) {
          const userId = post.posterDetails.userId;
          const reduxFollowState = currentFollowStates[userId];
          
          // If we have this user's follow state in Redux, update the post
          if (reduxFollowState !== undefined) {
            post.posterDetails.isFollowed = reduxFollowState;
          }
          // If we have new follow information in the post, sync it to Redux
          else if (post.posterDetails.isFollowed !== undefined) {
            dispatch(updatePostFollowStatus({
              userId,
              isFollowed: post.posterDetails.isFollowed
            }));
          }
        }
        
        postsWithVideos.push(post);
        
        // After every 4 posts, insert a video if available
        if ((i + 1) % 4 === 0 && videoIndex < videoPosts.length) {
          // Same follow state check for video post
          const videoPost = videoPosts[videoIndex];
          if (videoPost.posterDetails?.userId) {
            const userId = videoPost.posterDetails.userId;
            const reduxFollowState = currentFollowStates[userId];
            
            if (reduxFollowState !== undefined) {
              videoPost.posterDetails.isFollowed = reduxFollowState;
            } else if (videoPost.posterDetails.isFollowed !== undefined) {
              dispatch(updatePostFollowStatus({
                userId,
                isFollowed: videoPost.posterDetails.isFollowed
              }));
            }
          }
          
          postsWithVideos.push(videoPost);
          videoIndex++;
        }
      }

      // Add any remaining videos at the end
      while (videoIndex < videoPosts.length) {
        const videoPost = videoPosts[videoIndex];
        if (videoPost.posterDetails?.userId) {
          const userId = videoPost.posterDetails.userId;
          const reduxFollowState = currentFollowStates[userId];
          
          if (reduxFollowState !== undefined) {
            videoPost.posterDetails.isFollowed = reduxFollowState;
          } else if (videoPost.posterDetails.isFollowed !== undefined) {
            dispatch(updatePostFollowStatus({
              userId,
              isFollowed: videoPost.posterDetails.isFollowed
            }));
          }
        }
        
        postsWithVideos.push(videoPost);
        videoIndex++;
      }

      // Store updated posts in Redux
      dispatch(setFeedPosts(postsWithVideos));

      if (pageNum === 1) {
        setFeedWallData(postsWithVideos);
      } else {
        setFeedWallData(prevData => {
          const newPosts = [...prevData, ...postsWithVideos];
          const uniquePosts = newPosts.filter(
            (post, index, self) =>
              index === self.findIndex(p => p._id === post._id),
          );
          return uniquePosts;
        });
      }

      setPage(pageNum);
      setHasMorePosts(data.ugcs.length === 24);
    } catch (error) {
      console.error('[FeedWallExp] Error fetching feedWallData:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [token, dispatch, feedState.userFollowStatus]);

  const restorePostsFromCache = useCallback(async () => {
    try {
      const cachedPosts = await AsyncStorage.getItem('feedWallPostsCache');
      if (cachedPosts && feedWallData.length === 0) {
        const parsedPosts = JSON.parse(cachedPosts);
        setFeedWallData(parsedPosts);
        setInitialLoading(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("[FeedWallExp] Error restoring posts from cache:", error);
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
          fetchPosts(1);
          setShouldFetchNewData(false);
        } else {
          // Even if we restored from cache, we're not in initial loading anymore
          setInitialLoading(false);
        }
      };
      
      setupData();
    }, [fetchPosts, shouldFetchNewData, restorePostsFromCache])
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

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMorePosts) {
      const nextPage = page + 1;
      fetchPosts(nextPage);
    }
  }, [loading, hasMorePosts, page, fetchPosts]);

  const handleDataUpdate = useCallback((updatedData: any[]) => {
    setFeedWallData(updatedData);
    
    // Update follow states in Redux to ensure consistency
    updatedData.forEach(post => {
      if (post.posterDetails?.userId && post.posterDetails?.isFollowed !== undefined) {
        dispatch(updatePostFollowStatus({
          userId: post.posterDetails.userId,
          isFollowed: post.posterDetails.isFollowed
        }));
      }
    });
  }, [dispatch]);
  
  // Function to set current user ID in Redux
  const setCurrentUserId = (userId: string) => {
    return {
      type: 'chat/setCurrentUserId',
      payload: userId,
    };
  };

    // Add scroll handler
    useFocusEffect(
      useCallback(() => {
        setIsFabOpen(false);
      }, [])
    );

  const handleScroll = useCallback(() => {
    const currentTime = Date.now();
    // Only close FAB if it's been more than 500ms since last scroll
    if (isFabOpen && currentTime - lastScrollTime > 500) {
      setIsFabOpen(false);
    }
    setLastScrollTime(currentTime);
  }, [isFabOpen, lastScrollTime]);

  const handleFabToggle = () => {
    setIsFabOpen(prev => !prev);
    // Reset last scroll time when FAB is toggled
    setLastScrollTime(Date.now());
  };

  const handleScreenPress = useCallback(() => {
    if (isFabOpen) {
      setIsFabOpen(false);
    }
  }, [isFabOpen]);

  return (
    <FeedLayout
      data={feedWallData}
      token={token}
      accountType={accountType}
      currentUserId={currentUser}
      pageName="feed"
      onDataUpdate={handleDataUpdate}
      onLoadMore={loadMorePosts}
      onRefresh={onRefresh}
      loading={loading}
      hasMoreItems={hasMorePosts}
      initialLoading={initialLoading}
      showFAB={accountType === 'temp' ? false : true}
      onScroll={handleScroll}
      handleToggle={handleFabToggle}
      onTouchStart={handleScreenPress}
      fabComponent={
        <CustomFAB
          accountType={accountType}
          isOpen={isFabOpen}
          onToggle={() => setIsFabOpen(!isFabOpen)}
        />
      }
    />
  );
};

export default FeedWallExp;