import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post } from '../../../services/dataRequest';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { setFeedPosts, updatePostFollowStatus, syncFollowStatus } from '../../../redux/slices/feedSlice';
import { toggleLike } from '../../../redux/slices/likeSlice';
import CustomHeader from "../Home/utils/CustomHeader";
import FeedLayout from "../rewampedExp/feedLayout";

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
  ProjectDetailRewamped: {
    feed: any;
    accountType: string;
    token: string;
    pageName: string;
    query: string;
  };
  // Add other screens as needed
};

// Route params type definition
type TagResultRouteParams = RouteProp<{
  TagResultsScreen: { query: string }
}, 'TagResultsScreen'>;

const TagResultScreenRewamped = () => {
  // State management
  const [token, setToken] = useState('');
  const [tagResultData, setTagResultData] = useState<any[]>([]);
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  
  // References
  const scrollPositionRef = useRef(0);
  
  // Redux
  const dispatch = useDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<TagResultRouteParams>();
  const { query } = route.params;
  // Initialize data on component mount
  useEffect(() => {
    fetchToken();
  }, []);

  // Fetch user token and details
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
      setToken(savedToken || 'No token found');
    } catch (error) {
      setToken('Error fetching token');
    }
  }, []);

  // Fetch posts based on tag
  const fetchPosts = useCallback(async (pageNum = 1, shouldScroll = true) => {
    if (!token || !query) {
      return;
    }
    setLoading(true);
    try {
      const data = await get(
        'search/tags',
        {query, page: pageNum, limit: 24},
        token,
      );
      
      // Initialize Redux state with the data
      dispatch(setFeedPosts(data.ugcs || []));
      
      if (pageNum === 1) {
        setTagResultData(data.ugcs || []);
        // Only store data if coming from another screen for state persistence
        const returnedFromPostDetail = await AsyncStorage.getItem('returnedFromPostDetail');
        if (returnedFromPostDetail === 'true') {
        await AsyncStorage.setItem('tagResultsData', JSON.stringify(data.ugcs || []));
        }
        setInitialLoading(false);
      } else {
        setTagResultData(prevData => {
          const newPosts = [...prevData, ...(data.ugcs || [])];
          const uniqueNewPosts = newPosts.filter(
            (post, index, self) =>
              index === self.findIndex(p => p._id === post._id),
          );
          
          return uniqueNewPosts;
        });
      }
      
      setPage(pageNum);
      setHasMorePosts(data.ugcs && data.ugcs.length > 0);
    } catch (error) {
      console.error('[TagResult] Error fetching tag results:', error);
    } finally {
      setLoading(false);
    }
  }, [token, query, dispatch]);

  // Initialize data when token and query are available
  useEffect(() => {
    const initializeWithTokenAndQuery = async () => {
      if (token && query) {
        // Check if posts are already loaded
        if (tagResultData.length === 0) {
          setPage(1);
          fetchPosts(1);
        }
      }
    };
    
    initializeWithTokenAndQuery();
  }, [token, query, fetchPosts, tagResultData.length]);

  // Focus effect to restore state
  useFocusEffect(
    useCallback(() => {
      const restoreState = async () => {
        try {
          // Only check for returnedFromPostDetail if we have token
          if (!token) {
            // console.log('No token yet, deferring data fetch');
            return;
          }

          const returnedFromPostDetail = await AsyncStorage.getItem('returnedFromPostDetail');
          const savedPage = await AsyncStorage.getItem('savedTagResultPage');
          
          if (returnedFromPostDetail === 'true') {
            // Clear the flag
            await AsyncStorage.removeItem('returnedFromPostDetail');
            
            // If we have saved state, restore it
            if (savedPage) {
              setPage(parseInt(savedPage, 10));
              
              // Only fetch if we don't have data
              if (tagResultData.length === 0) {
                await fetchPosts(parseInt(savedPage, 10), false);
              }
            } else {
              setPage(1);
              // Only fetch if we don't have data
              if (tagResultData.length === 0) {
              await fetchPosts(1);
              }
            }
          } else if (savedPage && query) {
            setPage(parseInt(savedPage, 10));
            // Only fetch if we don't have data
            if (tagResultData.length === 0) {
            await fetchPosts(parseInt(savedPage, 10), false); 
            }
          } else {
            // First time seeing this tag or no saved state
            setPage(1);
            // Only fetch if we don't have data
            if (tagResultData.length === 0) {
            await fetchPosts(1);
            }
          }
        } catch (error) {
          console.error('[TagResult] Error restoring state:', error);
          // Default to page 1 on error
          setPage(1);
          if (tagResultData.length === 0) {
          await fetchPosts(1);
          }
        }
      };

      restoreState();
    }, [token, query, fetchPosts, tagResultData.length])
  );

  // Handle data updates from FeedLayout
  const handleDataUpdate = useCallback((updatedData: any[]) => {
    setTagResultData(updatedData);
    // No need to store in AsyncStorage here
  }, []);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setHasMorePosts(true);
    fetchPosts(1);
  }, [fetchPosts]);

  // Load more posts handler
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMorePosts) {
      const nextPage = page + 1;
      fetchPosts(nextPage);
    } else {
      // console.log(`[TagResult] Skipping load more:`, { loading, hasMorePosts, currentPage: page });
    }
  }, [loading, hasMorePosts, page, fetchPosts]);

  // Track scroll position
  const handleScroll = () => {
    // Only save page number, not data or scroll position
    AsyncStorage.setItem('savedTagResultPage', page.toString());
  };

  // Custom item click handler
  const handleItemClick = useCallback((item: any) => {
    // Only save page info, not full data
    AsyncStorage.setItem('savedTagResultPage', page.toString());
    
    if (item.contentType === 'project') {
      navigation.navigate('ProjectDetailRewamped', {
        feed: item,
        accountType: accountType,
        token: token,
        pageName: 'tags',
        query: query
      });
      // Return true to indicate we've handled the click
      return true;
    } else {
      // Find the index of the selected item in the data
      const currentIndex = tagResultData.findIndex(post => post._id === item._id);
      
      if (currentIndex !== -1) {
        // Process all posts to ensure required properties are present
        const processedPosts = tagResultData.map(post => {
          // Handle dates properly
        const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
        const formattedDate = isNaN(createdAt.getTime()) ? new Date() : createdAt;    
        
          // Return a properly formatted post object
        return {
            ...post,
          imageUrl: post.contentUrl,
            contentUrl: post.contentUrl,
            caption: post.caption || '',
            _id: post._id,
            tags: post.tags || [],
            createdAt: formattedDate,
          userDetails: {
            id: post.posterDetails?.userId || '',
              name: post.posterDetails?.firstName || post.posterDetails?.name || '',
            username: post.posterDetails?.username || '',
            location: post.location || '',
            profilePic: post.posterDetails?.profilePic || '',
              isLiked: post.isLiked !== undefined ? post.isLiked : false,
              isSaved: post.isSaved !== undefined ? post.isSaved : false,
              likeCount: post.likes !== undefined ? post.likes : 0,
              commentCount: post.commentsCount !== undefined ? post.commentsCount : 0,
              isFollowed: post.posterDetails?.isFollowed !== undefined ? post.posterDetails.isFollowed : false
            }
        };
      });

        // Set a flag that we're coming from this screen
        AsyncStorage.setItem('returnedFromPostDetail', 'true');
        
        // Use navigation.push to create a new instance in the stack
        navigation.push('FeedDetailExp', {
          posts: processedPosts,
          currentIndex: currentIndex,
        type: item.contentType || 'post',
        projectId: item._id,
        token: token,
        pageName: 'tags',
        onFollowUpdate: (updatedPosts: any[]) => {
            // Update local data state when returning from detail view
            const updatedLocalData = tagResultData.map(post => {
              const updatedPost = updatedPosts.find(p => p._id === post._id);
              if (updatedPost) {
                return {
                  ...post,
                  ...updatedPost,
                  posterDetails: {
                    ...post.posterDetails,
                    ...updatedPost.posterDetails,
                    // Ensure follow state is updated
                    isFollowed: updatedPost.userDetails?.isFollowed !== undefined
                      ? updatedPost.userDetails.isFollowed
                      : (updatedPost.posterDetails?.isFollowed || post.posterDetails?.isFollowed || false)
                  },
                  userDetails: {
                    ...post.userDetails,
                    ...updatedPost.userDetails
                  }
                };
              }
              return post;
            });
            
            setTagResultData(updatedLocalData);
            handleDataUpdate(updatedLocalData);
          }
        });
        
        // Return true to indicate we've handled the navigation
        return true;
    } else {
        console.error('[TagResult] Could not find clicked item in tag results');
        return false;
      }
    }
  }, [tagResultData, navigation, token, page, accountType, query, handleDataUpdate]);

  return (
    <SafeAreaView style={styles.safeAreaContainer} edges={['top', 'left', 'right']}>
        <CustomHeader title={`${query}`} />
        
      <View style={styles.container}>
        <FeedLayout
          data={tagResultData}
          token={token}
          accountType={accountType}
          currentUserId={currentUser}
          pageName="tags"
          onDataUpdate={handleDataUpdate}
          onLoadMore={loadMorePosts}
          onRefresh={onRefresh}
          loading={loading}
          hasMoreItems={hasMorePosts}
          initialLoading={initialLoading}
          showFAB={false}
          onScroll={handleScroll}
          onItemClick={handleItemClick}
        />
      </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: Color.white,
  },
  container: {
    flex: 1,
    backgroundColor: Color.white,
  }
});

export default TagResultScreenRewamped;
