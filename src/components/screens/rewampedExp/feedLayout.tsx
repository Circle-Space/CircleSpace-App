import React, { useCallback, useState, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Modal,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PostCard from '../../commons/cardComponents/postCard';
import VideoCard from '../../commons/cardComponents/videoCard';
import ProjectCard from '../../commons/cardComponents/projectCard';
import { useDispatch, useSelector } from 'react-redux';
import { Color } from '../../../styles/constants';
import GetStartedModal from '../../commons/getStartedModal';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import { toggleLike } from '../../../redux/slices/likeSlice';
import { RootState } from '../../../redux/store';
import { FlashList } from '@shopify/flash-list';
import { updatePostFollowStatus, syncFollowStatus } from '../../../redux/slices/feedSlice';
import { setSaveStatus } from '../../../redux/slices/saveSlice';
import { post, del } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SkeletonFeedCard from '../../commons/SkeletonFeedCard';
import { setCurrentPostAuthor } from '../../../redux/reducers/chatSlice';
import { useBottomBarScroll } from '../../../hooks/useBottomBarScroll';

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
    pageName?: string;
    navigationStack?: any[];
  };
  FeedDetailExp: {
    posts: Array<any>;
    currentIndex: number;
    type: string;
    projectId: string;
    token: string;
    pageName: string;
    onFollowUpdate?: (updatedPosts: any[]) => void;
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

// Props definition
interface FeedLayoutProps {
  data: any[];
  token: string;
  accountType: string;
  currentUserId: string;
  pageName: string;
  onDataUpdate?: (updatedData: any[]) => void;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
  hasMoreItems?: boolean;
  showFAB?: boolean;
  fabComponent?: React.ReactNode;
  initialLoading?: boolean;
  onItemClick?: (item: any) => void;
  onScroll?: (event?: any) => void;
  showIcons?: boolean;
  onTouchStart?: () => void;
}

// Add this before the FeedLayout component definition
const cleanupStorage = async () => {
  try {
    // Get all AsyncStorage keys
    const keys = await AsyncStorage.getAllKeys();
    
    // Find cache keys
    const cacheKeys = keys.filter(key => key.includes('PostsCache'));
    
    // If we have more than 3 cache entries, remove older ones
    if (cacheKeys.length > 3) {
      const keysToRemove = cacheKeys.slice(0, cacheKeys.length - 3);
      await AsyncStorage.multiRemove(keysToRemove);
      console.log(`Cleaned up ${keysToRemove.length} cache keys`);
    }
  } catch (error) {
    console.error('Error during storage cleanup:', error);
  }
};

const FeedLayout: React.FC<FeedLayoutProps> = ({
  data,
  token,
  accountType,
  currentUserId,
  pageName,
  onDataUpdate,
  onLoadMore,
  onRefresh,
  loading = false,
  hasMoreItems = false,
  showFAB = false,
  fabComponent,
  initialLoading = false,
  onItemClick,
  onScroll,
  onTouchStart,
  showIcons = true,
}) => {
  const [localData, setLocalData] = useState<any[]>(data);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isDataReady, setIsDataReady] = useState(data.length > 0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const listRef = useRef<FlashList<any>>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp>();
  const followState = useSelector((state: RootState) => state.follow);
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
  const dipstach = useDispatch();
  
  // Get the refresh state management from the hook
  const { setRefreshState } = useBottomBarScroll();

  // Handle refresh with bottom bar state management
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshState(true);
    
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } finally {
      setIsRefreshing(false);
      setRefreshState(false);
    }
  }, [onRefresh, setRefreshState]);

  // Update local data and data ready state when props data changes
  React.useEffect(() => {
    setLocalData(data);
    // For tags pageName, immediately set data as ready regardless of length
    if (pageName === 'tags' || data.length > 0) {
      setIsDataReady(true);
    }
  }, [data, pageName]);

  const handleCardPress = (item: any) => {
    console.log('item', item);
    // Alert.alert(item?.posterDetails?.userId || item?.userDetails?.id)
    dispatch(setCurrentPostAuthor(item?.posterDetails?.userId || item?.userDetails?.id))
    // If custom click handler is provided, use it
    if (onItemClick && item.contentType !== 'project') {
      onItemClick(item);
      return;
    }

    // Otherwise use default behavior
    if (accountType === 'temp') {
      setIsModalVisible(true);
    } else {
      if (item.contentType === 'project') {
        navigation.navigate('ProjectDetailRewamped', {
          feed: item,
          accountType: accountType,
          token: token,
          pageName: pageName
        });
      } else {
        const currentIndex = localData.findIndex(post => post._id === item._id);
        // Create a structured array of items with all necessary details
        const items = localData.map((post: any) => {
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

        // Store only necessary fields to reduce storage size
        if (pageName === 'feed' || pageName === 'home') {
          // Only store minimal essential data like IDs and basic metadata
          const minimalItems = items.map(post => ({
            _id: post._id,
            contentType: post.contentType,
            currentIndex: currentIndex >= 0 ? currentIndex : 0,
          }));
          
          // Limit array size to prevent excessive storage
          const limitedItems = minimalItems.slice(0, 50);
          
          // Store the minimal data in AsyncStorage
          AsyncStorage.setItem(`${pageName}PostsCache`, JSON.stringify(limitedItems))
            .then(() => {
              // Clean up storage after adding new data
              cleanupStorage();
            })
            .catch(err => console.error('Error saving cache:', err));
        }

        navigation.navigate('FeedDetailExp', {
          posts: items,
          currentIndex: currentIndex >= 0 ? currentIndex : 0,
          type: item.contentType || 'post',
          projectId: item._id,
          token: token,
          pageName: pageName,
          onFollowUpdate: (updatedPosts: any[]) => {
            // Use a more robust update approach to preserve data integrity
            const updatedLocalData = localData.map(post => {
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

            setLocalData(updatedLocalData);

            // Inform parent component about the update
            if (onDataUpdate) {
              onDataUpdate(updatedLocalData);
            }
          }
        });
      }
    }
  };

  const handleProjectLike = async (projectItem: any) => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
      return;
    }
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

      // Update local data
      const updatedData = localData.map(post =>
        post._id === projectItem._id
          ? {
            ...post,
            isLiked: newLikeState,
            likes: newLikeCount
          }
          : post
      );

      setLocalData(updatedData);

      // Inform parent component about the update
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }

      // Then make API call - use project like endpoint
      const response = await post(`project/toggle-like/?projectId=${projectItem._id}`, {});

      // If API call fails, revert changes
      if (response.status !== 200) {
        // Revert Redux state
        dispatch(toggleLike(projectItem._id));

        // Revert local state
        const revertedData = localData.map(post =>
          post._id === projectItem._id
            ? {
              ...post,
              isLiked: isLikedInRedux,
              likes: likeCountInRedux
            }
            : post
        );

        setLocalData(revertedData);

        // Inform parent component about the update
        if (onDataUpdate) {
          onDataUpdate(revertedData);
        }

        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error toggling project like:', error);
      Alert.alert('Error', 'Failed to update project like status');
    }
  };

  const handleLikePress = async (item: any) => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
      return;
    }
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

      // Update local data
      const updatedData = localData.map(post =>
        post._id === item._id
          ? {
            ...post,
            isLiked: newLikeState,
            likes: newLikeCount
          }
          : post
      );

      setLocalData(updatedData);

      // Inform parent component about the update
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }

      // Make API call
      const response = await post(`ugc/toggle-like/${item._id}`, {});

      // If API call fails, revert changes
      if (response.status !== 200) {
        // Revert Redux state
        dispatch(toggleLike(item._id));

        // Revert local state
        const revertedData = localData.map(post =>
          post._id === item._id
            ? {
              ...post,
              isLiked: isLikedInRedux,
              likes: likeCountInRedux
            }
            : post
        );

        setLocalData(revertedData);

        // Inform parent component about the update
        if (onDataUpdate) {
          onDataUpdate(revertedData);
        }

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
        const updatedData = localData.map(post =>
          post._id === item._id
            ? { ...post, isSaved: false }
            : post
        );

        setLocalData(updatedData);

        // Inform parent component about the update
        if (onDataUpdate) {
          onDataUpdate(updatedData);
        }

        // Make API call to remove from collection
        const response = await del(`collections/remove-item/${item._id}`);

        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: item._id, isSaved: true }));

          // Revert local state
          const revertedData = localData.map(post =>
            post._id === item._id
              ? { ...post, isSaved: true }
              : post
          );

          setLocalData(revertedData);

          // Inform parent component about the update
          if (onDataUpdate) {
            onDataUpdate(revertedData);
          }

          throw new Error('Failed to remove from collection');
        }
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
      // Update Redux state immediately for better UX
      dispatch(setSaveStatus({ postId: selectedPost._id, isSaved: true }));

      // Update local state
      const updatedData = localData.map(post =>
        post._id === selectedPost._id
          ? { ...post, isSaved: true }
          : post
      );

      setLocalData(updatedData);

      // Inform parent component about the update
      if (onDataUpdate) {
        onDataUpdate(updatedData);
      }

      // Check if this is a new collection creation
      if (!collectionInfo.isNewCollection) {
        const id = collectionInfo?.collectionInfo?.collectionId;
        const itemType = selectedPost?.contentType === "ugc" ? 'photo' : selectedPost?.contentType;

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

        if (response.status !== 200) {
          // If API call fails, revert changes
          dispatch(setSaveStatus({ postId: selectedPost._id, isSaved: false }));

          // Revert local state
          const revertedData = localData.map(post =>
            post._id === selectedPost._id
              ? { ...post, isSaved: false }
              : post
          );

          setLocalData(revertedData);

          // Inform parent component about the update
          if (onDataUpdate) {
            onDataUpdate(revertedData);
          }

          throw new Error('Failed to add to collection');
        }
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
      Alert.alert('Error', 'Failed to add to collection');
    } finally {
      setIsBottomSheetVisible(false);
    }
  };

  const handleFollowUser = async (userId: string, currentFollowState: boolean) => {
    if (!userId) return;

    try {
      const response = await post(`user/toggle-follow/${userId}`, {});
       console.log("follow res",response)
      if (response.status === 200) {
        const newFollowState = !currentFollowState;

        // Update Redux feed state
        dispatch(updatePostFollowStatus({
          userId,
          isFollowed: newFollowState
        }));

        // Add syncFollowStatus to ensure consistency across all components
        dispatch(syncFollowStatus({
          userId,
          isFollowed: newFollowState
        }));

        // Update local state
        const updatedData = localData.map(post => {
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

        setLocalData(updatedData);

        // Inform parent component about the update
        if (onDataUpdate) {
          onDataUpdate(updatedData);
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
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
          showIcons={showIcons}
          style={styles.gridItem}
          pageName={pageName}
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
          showIcons={showIcons}
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
          showIcons={showIcons}
          isFollowed={isFollowed}
          onFollowPress={() => handleFollowUser(userId, isFollowed)}
        />
      );
    }
  };

  // Render skeleton cards for loading state
  const renderSkeletonCards = () => {
    const skeletonTypes = ['post', 'post', 'video', 'project', 'post', 'post', 'video', 'post'];
    return (
      <View style={styles.skeletonContainer}>
        <FlashList
          data={skeletonTypes}
          renderItem={({ item, index }) => (
            <SkeletonFeedCard
              contentType={item as 'post' | 'video' | 'project'}
              style={styles.gridItem}
            />
          )}
          keyExtractor={(_, index) => `skeleton-${index}`}
          estimatedItemSize={itemWidth}
          numColumns={2}
          ListHeaderComponent={() => <View style={{ height: gap }} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: gap }} />}
        />
      </View>
    );
  };  

  // Determine if we should show loading skeletons
  const shouldShowSkeletons = pageName === 'tags' 
    ? false // Never show skeletons for tags page
    : (loading || initialLoading) && !isDataReady;

  // The loading indicator at the bottom of the list when loading more items
  const renderFooter = () => {
    // Don't show footer loader for tags pageName
    if (pageName === 'tags' || !loading || shouldShowSkeletons) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Color.black} />
      </View>
    );
  };

  // If we should show skeletons, render skeleton cards
  if (shouldShowSkeletons) {
    return (
      <SafeAreaView style={styles.container}>
        {renderSkeletonCards()}
      </SafeAreaView>
    );
  }

  return (
    <TouchableWithoutFeedback>
      <SafeAreaView style={styles.container}>
        <GetStartedModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
        {showFAB && fabComponent}
        <BottomSheetModal
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
          post={selectedPost}
          saveToggle={handleSaveToCollection}
        />
        <FlashList
          ref={listRef}
          data={localData}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          estimatedItemSize={itemWidth}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.5}
          numColumns={2}
          ListHeaderComponent={() => <View style={{ height: gap }} />}
          ListFooterComponent={renderFooter}
          removeClippedSubviews={false}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: gap }} />}
          extraData={[likedPosts, likeCounts, savedPosts]}
          onScroll={onScroll}
          onTouchStart={onTouchStart}
          ListEmptyComponent={
            localData.length === 0 && !shouldShowSkeletons ? (
              pageName === 'tags' ? 
              null : // Don't show loader for tags pageName
              <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color={Color.black} />
              </View>
            ) : null
          }
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
  skeletonContainer: {
    flex: 1,
    backgroundColor: Color.white,
  },
  emptyContainer: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default FeedLayout;