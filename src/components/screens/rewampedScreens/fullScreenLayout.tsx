import React, {useState, useRef, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Platform,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Video, {VideoRef} from 'react-native-video';
import FastImage from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  Color,
  FontFamilies,
  FontSizes,
  LineHeights,
} from '../../../styles/constants';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {toggleLike} from '../../../redux/slices/likeSlice';
import {RootState} from '../../../redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import CommentList from '../Home/CommentList';
import CommentInputCard from '../Home/CommentInputCard';
import {setCommentReply} from '../../../redux/reducers/chatSlice';
import {post, del} from '../../../services/dataRequest';
import LikedUsersModal from '../../commons/LikedUsersModal';
import {toggleSave} from '../../../redux/slices/saveSlice';
import BottomSheetModal from '../../screens/profile/BottomSheetModal';
import {updatePostState} from '../../../redux/slices/postSlice';
import {routeToOtherUserProfile} from '../../screens/notifications/routingForNotification';
import {handleSinglePostShare} from '../jobs/utils/utils';
import {getInitials} from '../../../utils/commonFunctions';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

interface UserDetails {
  isPaid: boolean;
  accountType: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  profilePic?: string;
  name?: string;
  username?: string;
  id?: string;
  isLiked?: boolean;
  isSaved?: boolean;
  likeCount?: number;
  commentCount?: number;
  savedCount?: number;
  shares?: number;
}

interface FeedItem {
  id?: string;
  _id?: string;
  imageUrl: string;
  contentType: 'video' | 'image' | 'project' | 'post' | 'ugc' | string;
  userDetails: UserDetails;
  caption?: string;
  contentUrl?: string | string[];
  coverImage?: string;
  tags?: string[];
  createdAt?: Date;
}

interface RouteParams {
  items: FeedItem[];
  initialIndex: number;
  type?: 'project' | 'post' | string;
  projectId?: string;
  token: string;
}

const FullScreenLayout = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    items = [],
    initialIndex,
    projectId,
    token,
  } = route.params as RouteParams;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showUserDetails, setShowUserDetails] = useState(true);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const videoRef = useRef<VideoRef>(null);
  const flatListRef = useRef<FlatList>(null);
  const CHARACTER_LIMIT = 150;

  const dispatch = useDispatch();
  const postState = useSelector((state: RootState) =>
    projectId ? state.posts.posts[projectId] : null,
  );

  // Add new state for current item
  const [currentItem, setCurrentItem] = useState<FeedItem | null>(null);
  const [currentCaption, setCurrentCaption] = useState<string | null>(null);

  // Add these new state variables
  const [openComments, setOpenComments] = useState(false);
  const [isSelfProfile, setIsSelfProfile] = useState(false);
  const bottomSheetCommentRef = useRef<BottomSheet>(null);
  const [commentCount, setCommentCount] = useState(0);

  // Get like state from Redux
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);

  // Add new state for modal
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  // Get save state from Redux
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);

  const [currentProjectImageIndex, setCurrentProjectImageIndex] = useState(0);
  const projectFlatListRef = useRef<FlatList>(null);

  // Get comment count from Redux
  const reduxCommentCount = useSelector((state: RootState) => {
    const currentItem = items[currentIndex];
    return currentItem ? state.comment.commentCounts[currentItem.id] || 0 : 0;
  });

  // Add a memoized current item ID to ensure stability
  const currentItemId = useMemo(() => {
    if (!currentItem) return '';
    return currentItem.id || currentItem._id || '';
  }, [currentItem]);

  // Helper function to safely get item ID
  const getItemId = (item: FeedItem): string => {
    return item?.id || item?._id || '';
  };

  // const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token when component mounts
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        // setToken(savedToken);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    // Initialize current item when component mounts
    if (items.length > 0 && initialIndex >= 0) {
      const initialItem = items[initialIndex];
      console.log('initialItem :::', initialItem);
      setCurrentItem(initialItem);
      setCurrentCaption(initialItem.caption || null);
      if (initialItem.userDetails) {
        setIsLiked(initialItem.userDetails.isLiked || false);
        setIsSaved(initialItem.userDetails.isSaved || false);
        setLikeCount(initialItem.userDetails.likeCount || 0);
        setCommentCount(initialItem.userDetails.commentCount || 0);
      }
      // Scroll to initial index
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }
      // Ensure currentIndex matches initialIndex
      setCurrentIndex(initialIndex);
    }
  }, [initialIndex, items]);

  useEffect(() => {
    // Check if current user is the post owner
    const checkUserMatch = async () => {
      if (!currentItem) return;

      const userData = await AsyncStorage.getItem('user');
      const currentUser = userData ? JSON.parse(userData) : null;

      // Get username from userDetails
      const postUsername = currentItem.userDetails?.username;

      const isSelf = currentUser?.username === postUsername;

      setIsSelfProfile(isSelf);
    };

    checkUserMatch();
  }, [currentItem]);

  // Update useEffect to sync with Redux state for both likes and saves
  useEffect(() => {
    if (currentItem?.id) {
      const isLikedInRedux = likedPosts[currentItem.id] || false;
      const likeCountInRedux = likeCounts[currentItem.id] || 0;
      const isSavedInRedux = savedPosts[currentItem.id] || false;

      // Update local state with Redux values
      setIsLiked(isLikedInRedux);
      setLikeCount(likeCountInRedux);
      setIsSaved(isSavedInRedux);
    }
  }, [currentItem?.id, likedPosts, likeCounts, savedPosts]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLikePress = async () => {
    if (!currentItem?.id) return;

    try {
      // Get current state from Redux
      const currentLiked = likedPosts[currentItem.id] || false;
      const currentCount = likeCounts[currentItem.id] || 0;

      // Calculate new states
      const newLikeState = !currentLiked;
      const newLikeCount = currentLiked ? currentCount - 1 : currentCount + 1;

      // Update local state for immediate UI feedback
      setIsLiked(newLikeState);
      setLikeCount(newLikeCount);

      // Update Redux state
      dispatch(toggleLike(currentItem.id));

      // API call
      const response = await post(`ugc/toggle-like/${currentItem.id}`, {});

      if (response.status !== 200) {
        throw new Error('Failed to toggle like');
      }

      // Update the current item's like state
      if (currentItem) {
        setCurrentItem({
          ...currentItem,
          userDetails: {
            ...currentItem.userDetails,
            isLiked: newLikeState,
            likeCount: newLikeCount,
          },
        });
      }
    } catch (error) {
      // Revert local state
      const currentLiked = likedPosts[currentItem.id] || false;
      const currentCount = likeCounts[currentItem.id] || 0;

      setIsLiked(currentLiked);
      setLikeCount(currentCount);

      // Revert Redux state
      dispatch(toggleLike(currentItem.id));

      console.error('Error toggling like:', error);
    }
  };

  const handleSavePress = async () => {
    if (!currentItem?.id) return;

    try {
      // Check current save state from Redux
      const isSavedInRedux = savedPosts[currentItem.id] || false;

      if (isSavedInRedux) {
        // If already saved, perform unsave operation

        // First make the API call before updating UI for better consistency
        try {
          // Make API call to remove from collection
          const response = await del(
            `collections/remove-item/${currentItem.id}`,
          );

          if (response.status !== 200) {
            throw new Error(
              `Failed to remove from collection: ${
                response.message || 'Unknown error'
              }`,
            );
          }

          // Only update Redux and local state if API call succeeded
          dispatch(toggleSave(currentItem.id));
          setIsSaved(false);

          // Update current item state to reflect changes
          setCurrentItem(prevItem => {
            if (!prevItem) return null;
            return {
              ...prevItem,
              userDetails: {
                ...prevItem.userDetails,
                isSaved: false,
              },
            };
          });

          // showLocalToast('Removed from collection');
        } catch (apiError) {
          console.error('API Error removing from collection:', apiError);
          Alert.alert(
            'Error',
            'Failed to remove from collection. Please try again.',
          );
        }
      } else {
        // If not saved, open the collection selector modal
        setSelectedPost(currentItem);
        setIsModalVisible(true);
      }
    } catch (error) {
      console.error('Error in save/unsave operation:', error);
      Alert.alert('Error', 'Failed to update save status. Please try again.');
    }
  };

  const handleSaveToCollection = async (collectionInfo: any) => {
    if (!currentItem?.id) return;

    try {
      // Check if this is a new collection creation
      if (collectionInfo.isNewCollection) {
        // Update Redux and local state
        dispatch(toggleSave(currentItem.id));
        setIsSaved(true);

        // Update current item state
        setCurrentItem(prevItem => {
          if (!prevItem) return null;
          return {
            ...prevItem,
            userDetails: {
              ...prevItem.userDetails,
              isSaved: true,
            },
          };
        });

        // showLocalToast('Added to collection');
        return;
      }

      // For existing collections, make the API call
      const id = collectionInfo?.collectionInfo?.collectionId;
      if (!id) {
        throw new Error('Missing collection ID');
      }

      // const itemType = currentItem?.contentType === "ugc" || currentItem?.contentType === "video" || currentItem?.contentType === "photo" ? 'post' : currentItem?.contentType;

      const itemType =
        currentItem?.contentType === 'ugc' ? 'photo' : currentItem?.contentType;
      // Make API call for existing collections
      const payload = {
        itemId: currentItem.id,
        itemType: itemType,
      };

      const response = await post(`collections/add-item/${id}`, payload);

      if (!response || response.status !== 200) {
        throw new Error(
          `Failed to add to collection: ${
            response?.message || 'Unknown error'
          }`,
        );
      }

      // Only update state after successful API call
      dispatch(toggleSave(currentItem.id));
      setIsSaved(true);

      // Update current item state
      setCurrentItem(prevItem => {
        if (!prevItem) return null;
        return {
          ...prevItem,
          userDetails: {
            ...prevItem.userDetails,
            isSaved: true,
          },
        };
      });

      // showLocalToast('Added to collection');
    } catch (error) {
      console.error('Error saving to collection:', error);
      Alert.alert('Error', 'Failed to add to collection. Please try again.');
    } finally {
      setIsModalVisible(false);
    }
  };

  // Add a simple toast function
  const showLocalToast = (message: string) => {
    Alert.alert('', message, [{text: 'OK'}], {cancelable: true});
  };

  const handleVideoPress = () => {
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleVideoEnd = () => {
    if (videoRef.current) {
      videoRef.current.seek(0);
    }
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update handleViewableItemsChanged to use the helper function
  const handleViewableItemsChanged = useCallback(
    ({viewableItems}: any) => {
      if (viewableItems.length > 0) {
        const newIndex = viewableItems[0].index;
        if (newIndex !== currentIndex) {
          const newItem = items[newIndex];
          const itemId = getItemId(newItem);

          // Update current item and related states
          setCurrentItem(newItem);
          setCurrentCaption(newItem.caption || null);
          setShowFullCaption(false);

          if (newItem.userDetails) {
            const isLikedInRedux = likedPosts[itemId] || false;
            const likeCountInRedux = likeCounts[itemId] || 0;
            const isSavedInRedux = savedPosts[itemId] || false;
            const commentCountInRedux = reduxCommentCount[itemId] || 0;

            setIsLiked(isLikedInRedux);
            setLikeCount(likeCountInRedux);
            setIsSaved(isSavedInRedux);
            setCommentCount(commentCountInRedux);
          }

          if (newItem.contentType === 'video') {
            setIsPlaying(true);
            setIsVideoLoaded(false);
            setIsLoading(true);
            setCurrentTime(0);
            if (videoRef.current) {
              videoRef.current.seek(0);
            }
          }

          setCurrentIndex(newIndex);
        }
      }
    },
    [
      currentIndex,
      items,
      likedPosts,
      likeCounts,
      savedPosts,
      reduxCommentCount,
    ],
  );

  // Update handleScroll to use the helper function
  const handleScroll = useCallback(
    (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.y;
      const newIndex = Math.round(contentOffset / SCREEN_HEIGHT);

      if (
        newIndex !== currentIndex &&
        newIndex >= 0 &&
        newIndex < items.length
      ) {
        const newItem = items[newIndex];
        const itemId = getItemId(newItem);

        setCurrentItem(newItem);
        setCurrentCaption(newItem.caption || null);
        setShowFullCaption(false);

        if (newItem.userDetails) {
          const isLikedInRedux = likedPosts[itemId] || false;
          const likeCountInRedux = likeCounts[itemId] || 0;
          const isSavedInRedux = savedPosts[itemId] || false;
          const commentCountInRedux = reduxCommentCount[itemId] || 0;

          setIsLiked(isLikedInRedux);
          setLikeCount(likeCountInRedux);
          setIsSaved(isSavedInRedux);
          setCommentCount(commentCountInRedux);
        }

        if (newItem.contentType === 'video') {
          setIsPlaying(true);
          setIsVideoLoaded(false);
          setIsLoading(true);
          setCurrentTime(0);
          if (videoRef.current) {
            videoRef.current.seek(0);
          }
        }

        setCurrentIndex(newIndex);
      }
    },
    [
      currentIndex,
      items,
      likedPosts,
      likeCounts,
      savedPosts,
      reduxCommentCount,
    ],
  );

  const handleMomentumScrollEnd = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(contentOffset / SCREEN_HEIGHT);

    // Ensure we're at the exact position
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index: newIndex,
        animated: false,
      });
    }
  }, []);

  const handleProjectScroll = useCallback(
    (event: any) => {
      const contentOffset = event.nativeEvent.contentOffset.x;
      const newIndex = Math.round(contentOffset / SCREEN_WIDTH);

      if (newIndex !== currentProjectImageIndex) {
        setCurrentProjectImageIndex(newIndex);
      }
    },
    [currentProjectImageIndex],
  );

  const handleProjectMomentumScrollEnd = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffset / SCREEN_WIDTH);

    if (projectFlatListRef.current) {
      projectFlatListRef.current.scrollToIndex({
        index: newIndex,
        animated: false,
      });
    }
  }, []);

  const navigateToUserProfile = (userId: string, accountType: string) => {
    if (!userId) {
      return;
    }

    // In your custom bottom bar, the Profile tab is named "ProfileRewamp"
    // Get the current user data to check if this is the self profile
    AsyncStorage.getItem('user')
      .then(userData => {
        if (userData) {
          const currentUser = JSON.parse(userData);
          // Check if viewing own profile
          const isSelf =
            currentUser._id === userId || currentUser.id === userId;

          if (isSelf) {
            // Navigate to the bottom tab named "ProfileRewamp" for self profile
            navigation.navigate('BottomBar', {
              screen: 'ProfileScreen',
              params: {
                isSelf: true,
              },
            });
          } else {
            // Use routeToOtherUserProfile for other users
            routeToOtherUserProfile(
              navigation,
              userId,
              false,
              token,
              accountType,
            );
          }
        } else {
          // Fallback in case user data can't be retrieved
          routeToOtherUserProfile(
            navigation,
            userId,
            false,
            token,
            accountType,
          );
        }
      })
      .catch(error => {
        console.error('Error checking user data:', error);
        // Fallback to other user profile on error
        routeToOtherUserProfile(navigation, userId, false, token);
      });
  };

  const renderItem = ({item, index}: {item: FeedItem; index: number}) => {
    const isVideo = item.contentType === 'video';
    const isProject = item.contentType === 'project';
    const isCurrentItem = index === currentIndex;
    return (
      <TouchableOpacity
        style={styles.contentContainer}
        activeOpacity={1}
        onPress={
          isVideo
            ? () => setShowUserDetails(!showUserDetails)
            : () => setShowUserDetails(!showUserDetails)
        }>
        {isLoading && isCurrentItem && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.black} />
          </View>
        )}
        {isVideo ? (
          <>
            <Video
              ref={isCurrentItem ? videoRef : null}
              source={{uri: item.imageUrl}}
              style={styles.video}
              resizeMode="contain"
              repeat={true}
              controls={false}
              muted={isMuted}
              paused={!isPlaying || !isCurrentItem}
              onLoad={data => {
                if (isCurrentItem) {
                  setIsLoading(false);
                  setDuration(data.duration);
                  setCurrentTime(0);
                }
              }}
              onError={error => {
                console.error('Video error:', error);
                if (isCurrentItem) {
                  setIsLoading(false);
                }
              }}
              onProgress={({
                currentTime,
                playableDuration,
                seekableDuration,
              }) => {
                if (isCurrentItem) {
                  setCurrentTime(currentTime);
                  setDuration(seekableDuration);
                }
              }}
              onEnd={handleVideoEnd}
            />
            {isCurrentItem && (
              <TouchableOpacity
                style={styles.videoControlOverlay}
                activeOpacity={1}
                onLongPress={() => setIsPlaying(false)}
                onPressOut={() => setIsPlaying(true)}
              />
            )}
           
                            <View style={styles.progressContainer}>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
                                </View>
                                <View style={styles.progressBarContainer}>
                                    <TouchableOpacity
                                        style={styles.progressBar}
                                        onPress={(e) => {
                                            const touchX = e.nativeEvent.locationX;
                                            const progressBarWidth = SCREEN_WIDTH - 32;
                                            const seekTime = (touchX / progressBarWidth) * duration;
                                            if (videoRef.current) {
                                                videoRef.current.seek(seekTime);
                                            }
                                        }}
                                    >
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${(currentTime / duration) * 100}%` }
                                                ]}
                                            />
                                            <View
                                                style={[
                                                    styles.progressRemaining,
                                                    { width: `${100 - (currentTime / duration) * 100}%` }
                                                ]}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                       
          </>
        ) : isProject ? (
          <View style={styles.projectContainer}>
            <FlatList
              ref={projectFlatListRef}
              data={
                Array.isArray(item.contentUrl)
                  ? item.contentUrl
                  : [item.contentUrl]
              }
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={({item: imageUrl, index: imageIndex}) => (
                <View style={styles.projectImageContainer}>
                  <FastImage
                    source={{uri: imageUrl}}
                    style={[styles.image, {width: SCREEN_WIDTH}]}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoadStart={() => isCurrentItem && setIsLoading(true)}
                    onLoadEnd={() => isCurrentItem && setIsLoading(false)}
                  />
                </View>
              )}
              keyExtractor={(_, index) => index.toString()}
              onScroll={handleProjectScroll}
              scrollEventThrottle={16}
              onMomentumScrollEnd={handleProjectMomentumScrollEnd}
              getItemLayout={(_, index) => ({
                length: SCREEN_WIDTH,
                offset: SCREEN_WIDTH * index,
                index,
              })}
            />
            {isCurrentItem && (
              <View style={styles.projectIndicatorContainer}>
                {Array.isArray(item.contentUrl) &&
                  item.contentUrl.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.projectIndicator,
                        currentProjectImageIndex === idx &&
                          styles.projectIndicatorActive,
                      ]}
                    />
                  ))}
              </View>
            )}
          </View>
        ) : (
          <FastImage
            source={{uri: item.imageUrl}}
            style={styles.image}
            resizeMode={FastImage.resizeMode.contain}
            onLoadStart={() => isCurrentItem && setIsLoading(true)}
            onLoadEnd={() => isCurrentItem && setIsLoading(false)}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderCaption = () => {
    if (!currentCaption) return null;

    const shouldShowMore = currentCaption.length > CHARACTER_LIMIT;
    const displayText = showFullCaption
      ? currentCaption
      : currentCaption.slice(0, CHARACTER_LIMIT);

    return (
      <TouchableOpacity
        style={styles.captionContainer}
        activeOpacity={1}
        onPress={() => setShowFullCaption(!showFullCaption)}>
        <Text style={styles.caption}>
          {displayText}
          {shouldShowMore && !showFullCaption && <Text>...</Text>}
          {shouldShowMore && (
            <Text style={styles.moreText}>
              {showFullCaption ? '  less' : ' more'}
            </Text>
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleCommentPress = () => {
    Keyboard.dismiss(); // Dismiss any active keyboard
    setOpenComments(true);
  };

  const handleLikeCountPress = (postId: string) => {
    setSelectedPostId(postId);
    setShowLikesModal(true);
  };

  const handleCloseLikesModal = () => {
    setShowLikesModal(false);
    setSelectedPostId('');
  };

  const renderFooter = useCallback(
    (props: any) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={styles.footerContainer}>
          <CommentInputCard
            postId={currentItemId}
            token={token}
            onCommentAdded={() => {
              if (currentItemId) {
                // Update local comment count
                setCommentCount(prev => prev + 1);

                // Update Redux state
                if (postState) {
                  dispatch(
                    updatePostState({
                      id: currentItemId,
                      commentCount: (postState.commentCount || 0) + 1,
                    }),
                  );
                }
              }
            }}
            isProject={false}
          />
        </View>
      </BottomSheetFooter>
    ),
    [currentItemId, token, postState, dispatch],
  );
  console.log('currentItem', currentItem?.userDetails.name);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      {/* <View style={styles.container}> */}

      <View style={styles.headerButtons}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.iconWrapper}>
            <Icon name="chevron-back" size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
        {currentItem?.contentType === 'video' && (
          <TouchableOpacity
            style={styles.muteButton}
            onPress={() => setIsMuted(!isMuted)}>
            <View style={styles.iconWrapper}>
              <Icon
                name={isMuted ? 'volume-mute' : 'volume-medium'}
                size={24}
                color="#FFF"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        horizontal={false}
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEnabled={true}
        directionalLockEnabled={true}
        snapToOffsets={items.map((_, index) => index * SCREEN_HEIGHT)}
        snapToStart={true}
        snapToEnd={true}
        maxToRenderPerBatch={3}
        windowSize={3}
        removeClippedSubviews={true}
      />

      {showUserDetails && currentItem && (
        <View
          style={[
            styles.userDetailsContainer,
            // currentItem.contentType === 'video' && styles.videoUserDetailsContainer
          ]}>
          <TouchableOpacity
            style={styles.userInfoRow}
            onPress={() => {
              if (currentItem.userDetails && currentItem.userDetails.id) {
                navigateToUserProfile(
                  currentItem.userDetails.id,
                  currentItem.userDetails.accountType,
                );
              }
            }}
            activeOpacity={0.7}>
            {currentItem.userDetails.profilePic ? (
              <Image
                source={{uri: currentItem.userDetails.profilePic}}
                style={styles.profilePic}
              />
            ) : (
              <View style={styles.initialsAvatar}>
                <Text style={styles.initialsText}>
                  {getInitials(
                    currentItem.userDetails.name ||
                      currentItem.userDetails.firstName ||
                      currentItem.userDetails.username,
                  )}
                </Text>
              </View>
            )}
            <View style={styles.userTextContainer}>
              <Text style={styles.username}>
                {currentItem.userDetails.username}
              </Text>
              {currentItem?.userDetails?.isPaid &&
                currentItem?.userDetails?.accountType === 'professional' && (
                  <View style={styles.verifiedBadgeContainer}>
                    <Image
                      source={require('../../../assets/settings/subscription/VerifiedIcon.png')}
                      style={styles.verifiedBadge}
                    />
                  </View>
                )}
            </View>
          </TouchableOpacity>
          {renderCaption()}
          <View style={styles.actionContainer}>
            <View style={styles.actionLeft}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleLikePress}>
                <Image
                  source={
                    isLiked
                      ? require('../../../assets/postcard/likeFillIcon.png')
                      : require('../../../assets/postcard/likeIcon.png')
                  }
                  style={[
                    styles.actionIcon,
                    !isLiked && {tintColor: '#FFFFFF'},
                  ]}
                />
                <TouchableOpacity
                  onPress={() => handleLikeCountPress(currentItem?.id || '')}
                  style={styles.likeCountContainer}>
                  <Text style={styles.actionText}>{likeCount}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={()=>{
                    setOpenComments(true)
                }}>
                <Image
                  source={require('../../../assets/postcard/commentIcon.png')}
                  style={[styles.actionIcon, {tintColor: '#FFFFFF'}]}
                />
                <Text style={styles.actionText}>{reduxCommentCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSavePress}>
                <Image
                  source={
                    isSaved
                      ? require('../../../assets/postcard/saveFillIcons.png')
                      : require('../../../assets/postcard/saveIcon.png')
                  }
                  style={[styles.actionIcon, {tintColor: '#FFFFFF'}]}
                />
                <Text style={[styles.actionText, {opacity: 0}]}>
                  {currentItem.userDetails.savedCount || 0}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSinglePostShare(currentItem)}>
                <Image
                  source={require('../../../assets/postcard/sendIcon.png')}
                  style={[styles.actionIcon, {tintColor: '#FFFFFF'}]}
                />
                <Text style={[styles.actionText, {opacity: 0}]}>
                  {currentItem.userDetails.shares || 0}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    
{openComments && (
          <BottomSheet
            enablePanDownToClose
            index={0}
           snapPoints={[500,800]}
            ref={bottomSheetCommentRef}
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
                postId={currentItemId}
                isLast={false}
                navigation={navigation}
                token={token || ''}
                selfPost={isSelfProfile}
              />
            </BottomSheetView>
          </BottomSheet>
        )}

      <LikedUsersModal
        visible={showLikesModal}
        onClose={handleCloseLikesModal}
        postId={selectedPostId}
      />

      {/* Bottom Sheet Modal for Save */}
      <BottomSheetModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        // post={selectedPost}
        saveToggle={handleSaveToCollection}
        post={{
          _id: projectId,
          title: currentItem?.caption,
          url: currentItem?.contentUrl,
          contentType: currentItem?.contentType,
        }}
      />
      {/* </View> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 10,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
    backgroundColor: 'transparent',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButton: {
    marginLeft: 'auto',
    backgroundColor: 'transparent',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  userDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    padding: 16,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  videoUserDetailsContainer: {
    bottom: 75,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
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
  userTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: FontFamilies.semibold,
  },
  verifiedBadgeContainer: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  verifiedBadge: {
    height: 18,
    width: 18,
  },
  actionContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 23,
    height: 23,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: FontFamilies.regular,
  },
  captionContainer: {
    paddingVertical: 12,
  },
  caption: {
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    lineHeight: LineHeights.medium,
    color: '#FFFFFF',
  },
  footerContainer: {
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    width: '100%',
    // borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  moreText: {
    color: '#FFFFFF',
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.medium,
    lineHeight: LineHeights.medium,
    fontWeight: '400',
  },
  videoControlOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: FontFamilies.regular,
  },
  progressBarContainer: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    width: '100%',
    flexDirection: 'row',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 2,
  },
  progressRemaining: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
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
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  projectImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectIndicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  projectIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  projectIndicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
});

export default FullScreenLayout;
