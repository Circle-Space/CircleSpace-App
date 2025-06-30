import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    Image,
    Platform,
    FlatList,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Video, { VideoRef } from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import CommentList from '../Home/CommentList';
import CommentInputCard from '../Home/CommentInputCard';
import { setCommentReply } from '../../../redux/reducers/chatSlice';
import { Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike } from '../../../redux/slices/likeSlice';
import { toggleSave, setSaveStatus } from '../../../redux/slices/saveSlice';
import { post, del } from '../../../services/dataRequest';
import { RootState } from '../../../redux/store';
import BottomSheetModal from '../profile/BottomSheetModal';
import { routeToOtherUserProfile } from '../../screens/notifications/routingForNotification';
import LikedUsersModal from '../../commons/LikedUsersModal';
import { getInitials } from '../../../utils/commonFunctions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface RouteParams {
    items: Array<{
        id?: string;
        imageUrl: string;
        userDetails: {
            isPaid: boolean;
            accountType: string;
            firstName: any;
            lastName: any;
            name: string;
            username: string;
            location: string;
            profilePic: string;
            isLiked: boolean;
            isSaved: boolean;
            likeCount: number;
            commentCount: number;
            savedCount: number;
            shares: number;
            id?: string; // Add id to userDetails
        };
        caption: string;
    }>;
    initialIndex: number;
    type: string;
    projectId?: string;
    token?: string;
}

const VideoFullScreenRewamped = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { items, initialIndex ,type = 'post',token, projectId} = route.params as RouteParams;
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showUserDetails, setShowUserDetails] = useState(true);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const [isLiked, setIsLiked] = useState(items[currentIndex]?.userDetails?.isLiked || false);
    const [isSaved, setIsSaved] = useState(items[currentIndex]?.userDetails?.isSaved || false);
    const [likeCount, setLikeCount] = useState(items[currentIndex]?.userDetails?.likeCount || 0);
    const [isMuted, setIsMuted] = useState(true);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [openComments, setOpenComments] = useState(false);
    const [isSelfProfile, setIsSelfProfile] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState('');
    const [currentItemDetails, setCurrentItemDetails] = useState(
        items[initialIndex]?.userDetails || {}
    );
    const [showControls, setShowControls] = useState(false);

    const videoRefs = useRef<{ [key: number]: VideoRef | null }>({});
    const flatListRef = useRef<FlatList>(null);
    const CHARACTER_LIMIT = 150;
    const dispatch = useDispatch();
    const bottomSheetCommentRef = useRef<BottomSheet>(null);

    const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
    const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
    const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
    
    const reduxCommentCount = useSelector((state: RootState) => {
        return projectId ? state.comment.commentCounts[projectId || ''] || 0 : 0;
    });

    useEffect(() => {
        if (items && items[currentIndex]?.userDetails) {
            setCurrentItemDetails(items[currentIndex].userDetails);
        }
    }, [currentIndex, items]);

    useEffect(() => {
        setIsPlaying(true);
        
        return () => {
            setIsPlaying(false);
            Object.values(videoRefs.current).forEach(ref => {
                if (ref) {
                    ref.pause();
                }
            });
        };
    }, []);

    useEffect(() => {
        setIsPlaying(true);
        setIsVideoLoaded(false);
        setIsLoading(true);
        setCurrentTime(0);
        
        if (videoRefs.current[currentIndex]) {
            videoRefs.current[currentIndex]?.seek(0);
        }
        
        Object.entries(videoRefs.current).forEach(([indexStr, ref]) => {
            const index = parseInt(indexStr);
            if (ref && index !== currentIndex) {
                ref.seek(0);
                ref.pause();
            }
        });
    }, [currentIndex]);

    useEffect(() => {
        const checkUserMatch = async () => {
            if (!items || !items[currentIndex]) return;
            
            const userData = await AsyncStorage.getItem('user');
            const currentUser = userData ? JSON.parse(userData) : null;
            
            const postUsername = items[currentIndex]?.userDetails?.username;
            
            const isSelf = currentUser?.username === postUsername;
            
            setIsSelfProfile(isSelf);
        };

        checkUserMatch();
    }, [currentIndex, items]);

    useEffect(() => {
        if (items.length > 0 && currentIndex >= 0) {
            const currentItem = items[currentIndex];
            if (currentItem) {
                const postId = currentItem.id || projectId;
                if (postId && likedPosts[postId || ''] !== undefined) {
                    setIsLiked(likedPosts[postId || '']);
                    setLikeCount(likeCounts[postId || ''] || 0);
                } else {
                    setIsLiked(currentItem.userDetails?.isLiked || false);
                    setLikeCount(currentItem.userDetails?.likeCount || 0);
                }
            }
        }
    }, [currentIndex, items, likedPosts, likeCounts, projectId]);

    useEffect(() => {
        if (items.length > 0 && currentIndex >= 0) {
            const currentItem = items[currentIndex];
            if (currentItem) {
                const postId = currentItem.id || projectId;
                if (postId && savedPosts[postId || ''] !== undefined) {
                    setIsSaved(savedPosts[postId || '']);
                } else {
                    setIsSaved(currentItem.userDetails?.isSaved || false);
                }
            }
        }
    }, [currentIndex, items, savedPosts, projectId]);

    useEffect(() => {
        const getUserId = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                setCurrentUserId(userId);
            } catch (error) {
                console.error('Error getting user ID:', error);
            }
        };
        getUserId();
    }, []);

    // Auto-hide controls after inactivity
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (showControls) {
            timer = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [showControls]);

    const handleBack = () => {
        navigation.goBack();
    };

    const handleLikePress = async () => {
        const postId = projectId || items[currentIndex]?.id;
        if (!postId) return;

        try {
            const currentLiked = likedPosts[postId || ''] !== undefined ? likedPosts[postId || ''] : isLiked;
            const currentCount = likeCounts[postId || ''] !== undefined ? likeCounts[postId || ''] : likeCount;
            
            const newLikeState = !currentLiked;
            const newLikeCount = currentLiked ? currentCount - 1 : currentCount + 1;

            setIsLiked(newLikeState);
            setLikeCount(newLikeCount);
            
            dispatch(toggleLike(postId));

            const response = await post(`ugc/toggle-like/${postId}`, {});

            if (response.status !== 200) {
                setIsLiked(currentLiked);
                setLikeCount(currentCount);
                dispatch(toggleLike(postId));
                throw new Error('Failed to toggle like');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleLikeCountPress = (postId: string) => {
        if (!postId) return;
        
        setSelectedPostId(postId);
        setShowLikesModal(true);
    };

    const handleCloseLikesModal = () => {
        setShowLikesModal(false);
        setSelectedPostId('');
    };

    const handleSavePress = async () => {
        const currentItem = items[currentIndex];
        const postId = projectId || currentItem?.id;
        if (!postId) return;

        try {
            const isItemSaved = savedPosts[postId] || false;
            
            if (isItemSaved) {
                const response = await del(`collections/remove-item/${postId}`, '');
                if (response && response.message === 'Item removed from all collections successfully') {
                    dispatch(setSaveStatus({ postId: postId, isSaved: false }));
                    setIsSaved(false);
                } else {
                    throw new Error('Failed to unsave the post');
                }
            } else {
                setIsModalVisible(true);
                setSelectedItem(currentItem);
            }
        } catch (error) {
            console.error('Error handling save:', error);
            Alert.alert('Error', 'Failed to update save status');
        }
    };

    const handleSaveToCollection = async (collectionInfo: any) => {
        const currentItem = items[currentIndex];
        const postId = projectId || currentItem?.id;
        if (!postId) return;

        try {
            if (collectionInfo.isNewCollection) {
                dispatch(setSaveStatus({ postId: postId, isSaved: true }));
                setIsSaved(true);
                const updatedItems = [...items];
                if (currentIndex >= 0 && currentIndex < updatedItems.length) {
                    updatedItems[currentIndex] = {
                        ...updatedItems[currentIndex],
                        userDetails: {
                            ...updatedItems[currentIndex].userDetails,
                            isSaved: true,
                            savedCount: (updatedItems[currentIndex].userDetails?.savedCount || 0) + 1
                        }
                    };
                }
                return;
            }

            const response = await post(`collections/add-item/${collectionInfo.collectionInfo.collectionId}`, {
                itemId: postId,
                itemType: 'video'
            });

            if (response && response.message === 'Item added to collection successfully') {
                dispatch(setSaveStatus({ postId: postId, isSaved: true }));
                setIsSaved(true);
                const updatedItems = [...items];
                if (currentIndex >= 0 && currentIndex < updatedItems.length) {
                    updatedItems[currentIndex] = {
                        ...updatedItems[currentIndex],
                        userDetails: {
                            ...updatedItems[currentIndex].userDetails,
                            isSaved: true,
                            savedCount: (updatedItems[currentIndex].userDetails?.savedCount || 0) + 1
                        }
                    };
                }
            } else {
                throw new Error('Failed to save the post');
            }
        } catch (error) {
            console.error('Error in handleSaveToCollection:', error);
            Alert.alert('Error', 'Failed to save to collection');
        } finally {
            setIsModalVisible(false);
            setSelectedItem(null);
        }
    };

    const handleCommentPress = () => {
        Keyboard.dismiss();
        setOpenComments(true);
    };

    const renderCaption = () => {
        const currentItem = items[currentIndex];
        if (!currentItem?.caption) return null;

        const shouldShowMore = currentItem.caption.length > CHARACTER_LIMIT;
        const displayText = showFullCaption
            ? currentItem.caption
            : currentItem.caption.slice(0, CHARACTER_LIMIT);

        return (
            <TouchableOpacity style={styles.captionContainer} activeOpacity={1}>
                <Text style={styles.caption}>
                    {displayText}
                    {shouldShowMore && !showFullCaption && <Text>...</Text>}
                    {shouldShowMore && (
                        <Text
                            style={styles.moreText}
                            onPress={() => setShowFullCaption(!showFullCaption)}>
                            {showFullCaption ? '  less' : ' more'}
                        </Text>
                    )}
                </Text>
            </TouchableOpacity>
        );
    };

    const currentPostId = projectId || items[currentIndex]?.id;
    const currentPostLiked = currentPostId && likedPosts[currentPostId || ''] !== undefined 
        ? likedPosts[currentPostId || ''] 
        : isLiked;
    const currentPostLikeCount = currentPostId && likeCounts[currentPostId || ''] !== undefined
        ? likeCounts[currentPostId || '']
        : likeCount;
    const currentPostSaved = currentPostId && savedPosts[currentPostId || ''] !== undefined 
        ? savedPosts[currentPostId || ''] 
        : isSaved;

    const renderItem = ({ item, index }: { item: typeof items[0], index: number }) => {
        const shouldMute = index !== currentIndex || isMuted;

        return (
            <View style={styles.videoContainer}>
                <Video
                    ref={ref => {
                        videoRefs.current[index] = ref;
                    }}
                    source={{ uri: item.imageUrl }}
                    style={styles.video}
                    resizeMode="contain"
                    repeat={true}
                    controls={false}
                    muted={shouldMute}
                    paused={!isPlaying || index !== currentIndex}
                    onLoad={(data) => {
                        if (index === currentIndex) {
                            setIsVideoLoaded(true);
                            setIsLoading(false);
                            setDuration(data.duration);
                        }
                    }}
                    onError={(error) => {
                        console.error('Video error:', error);
                        if (index === currentIndex) {
                            setIsLoading(false);
                        }
                    }}
                    onProgress={({ currentTime, playableDuration, seekableDuration }) => {
                        if (index === currentIndex) {
                            setCurrentTime(currentTime);
                            setDuration(seekableDuration);
                        }
                    }}
                    onEnd={() => {
                        if (index === currentIndex && videoRefs.current[index]) {
                            videoRefs.current[index]?.seek(0);
                            setIsPlaying(true);
                        }
                    }}
                />

                <TouchableOpacity
                    style={styles.videoControlOverlay}
                    activeOpacity={1}
                    onPress={() => {
                        if (index === currentIndex) {
                            if (!showControls) {
                                setShowControls(true);
                            } else {
                                setIsPlaying(!isPlaying);
                            }
                        } else {
                            setShowUserDetails(!showUserDetails);
                        }
                    }}
                >
                    {/* Center Play/Pause Button - Always visible when not playing or controls are shown */}
                    {index === currentIndex && (!isPlaying || showControls) && (
                        <TouchableOpacity
                            style={styles.centerPlayButton}
                            onPress={() => setIsPlaying(!isPlaying)}
                        >
                            <Icon
                                name={isPlaying ? 'pause' : 'play'}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    )}

                    {index === currentIndex && showControls && (
                        <>
                            {/* <TouchableOpacity
                                style={styles.muteButtonOverlay}
                                onPress={() => setIsMuted(!isMuted)}
                            >
                                <Icon
                                    name={isMuted ? 'volume-mute' : 'volume-high'}
                                    size={20}
                                    color="#fff"
                                />
                            </TouchableOpacity> */}
                            
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
                                            const seekBarWidth = SCREEN_WIDTH - 32 - 24 - 70;
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
        );
    };

    const handleViewableItemsChanged = ({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            if (newIndex !== currentIndex) {
                if (videoRefs.current[currentIndex]) {
                    videoRefs.current[currentIndex]?.pause();
                }
                
                setCurrentIndex(newIndex);
                setShowFullCaption(false);
                
                const newItem = items[newIndex];
                if (newItem?.userDetails) {
                    setCurrentItemDetails(newItem.userDetails);
                }
                
                const itemId = newItem.id || projectId;
                
                if (itemId && likedPosts[itemId || ''] !== undefined) {
                    setIsLiked(likedPosts[itemId || '']);
                    setLikeCount(likeCounts[itemId || ''] || 0);
                } else {
                    setIsLiked(newItem?.userDetails?.isLiked || false);
                    setLikeCount(newItem?.userDetails?.likeCount || 0);
                }
                
                setIsSaved(newItem?.userDetails?.isSaved || false);
                
                if (videoRefs.current[newIndex]) {
                    videoRefs.current[newIndex]?.seek(0);
                    // Using paused property instead of play() which doesn't exist
                    if (isPlaying) {
                        // Force a re-render to toggle the paused state for this video
                        const pauseState = !isPlaying;
                        setIsPlaying(pauseState);
                        setTimeout(() => {
                            setIsPlaying(!pauseState);
                        }, 50);
                    }
                }
            }
        }
    };

    const handleScroll = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.y;
        const newIndex = Math.floor(contentOffset / SCREEN_HEIGHT + 0.5);
        
        if (newIndex >= 0 && newIndex < items.length && newIndex !== currentIndex) {
            if (items[newIndex]?.userDetails) {
                setCurrentItemDetails(items[newIndex].userDetails);
            }
        }
    };

    const handleSeek = (value: number) => {
        if (videoRefs.current[currentIndex]) {
            videoRefs.current[currentIndex]?.seek(value);
            setCurrentTime(value);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const navigateToUserProfile = (userId: string, accountType: string) => {
        if (!userId) {
            return;
        }
        
        AsyncStorage.getItem('user').then(userData => {
            if (userData) {
                const currentUser = JSON.parse(userData);
                const isSelf = currentUser._id === userId || currentUser.id === userId;
                
                
                if (isSelf) {
                    navigation.navigate('BottomBar', {
                        screen: 'ProfileScreen',
                        params: {
                            isSelf: true
                        }
                    });
                } else {
                    routeToOtherUserProfile(navigation, userId, false, token || null, accountType);
                }
            } else {
                routeToOtherUserProfile(navigation, userId, false, token || null, accountType);
            }
        }).catch(error => {
            console.error("Error checking user data:", error);
            routeToOtherUserProfile(navigation, userId, false, token || null);
        });
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right']}>
            <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <View style={styles.iconWrapper}>
                        <Icon name="chevron-back" size={24} color="#FFF" />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.muteButton} 
                    onPress={() => {
                        // Toggle mute state
                        const newMutedState = !isMuted;
                        setIsMuted(newMutedState);
                        
                        // Force current video to update its muted state through component re-rendering
                        // We can't use setNativeProps directly on VideoRef
                        if (videoRefs.current[currentIndex] && newMutedState) {
                            // For muting, we need to ensure the video updates
                            // Force a re-render by briefly toggling isPlaying state
                            const wasPlaying = isPlaying;
                            if (wasPlaying) {
                                // Briefly pause the video
                                setIsPlaying(false);
                                
                                // Then resume after a short delay
                                setTimeout(() => {
                                    setIsPlaying(true);
                                }, 50);
                            }
                        }
                    }}
                >
                    <View style={styles.iconWrapper}>
                        <Icon 
                            name={isMuted ? "volume-mute" : "volume-medium"} 
                            size={24} 
                            color="#FFF" 
                        />
                    </View>
                </TouchableOpacity>
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
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                }}
                getItemLayout={(_, index) => ({
                    length: SCREEN_HEIGHT,
                    offset: SCREEN_HEIGHT * index,
                    index,
                })}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                removeClippedSubviews={false} // Keep video components mounted for better audio control
                maxToRenderPerBatch={3} // Render fewer items at once for smoother scrolling
                windowSize={5} // Keep nearby items loaded
            />

            {showUserDetails && (
                <View style={styles.userDetailsContainer}>
                    <TouchableOpacity 
                        style={styles.userInfoRow}
                        onPress={() => {
                            const userId = currentItemDetails?.id;
                            if (userId) {
                                navigateToUserProfile(userId, currentItemDetails?.accountType);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        {currentItemDetails?.profilePic ? (
                            <Image
                                source={{ uri: currentItemDetails.profilePic }}
                                style={styles.profilePic}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.initialsText}>
                                {getInitials(
                                        currentItemDetails?.username
                                    )}
                                </Text>
                            </View>
                        )}
                        <View style={styles.userTextContainer}>
                            <Text style={styles.username}>{currentItemDetails?.username}</Text>
                            {currentItemDetails?.isPaid &&
                                currentItemDetails?.accountType === 'professional' && (
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
                                onPress={handleLikePress}
                            >
                                <Image
                                    source={isLiked
                                        ? require('../../../assets/postcard/likeFillIcon.png')
                                        : require('../../../assets/postcard/likeIcon.png')
                                    }
                                    style={[styles.actionIcon, !isLiked && { tintColor: '#FFFFFF' }]}
                                />
                                <TouchableOpacity
                                    onPress={() => handleLikeCountPress(currentPostId || '')}
                                    style={styles.likeCountContainer}>
                                    <Text style={styles.actionText}>{likeCount}</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.actionButton}
                                onPress={handleCommentPress}
                            >
                                <Image
                                    source={require('../../../assets/postcard/commentIcon.png')}
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={styles.actionText}>{reduxCommentCount}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleSavePress}
                            >
                                <Image
                                    source={currentPostSaved
                                        ? require('../../../assets/postcard/saveFillIcons.png')
                                        : require('../../../assets/postcard/saveIcon.png')
                                    }
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={[styles.actionText, { opacity: 0 }]}>{currentItemDetails?.savedCount || 0}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.actionButton}>
                                <Image
                                    source={require('../../../assets/postcard/sendIcon.png')}
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={[styles.actionText, { opacity: 0 }]}>{currentItemDetails?.shares || 0}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            {showLikesModal && (
                <LikedUsersModal
                    visible={showLikesModal}
                    onClose={handleCloseLikesModal}
                    postId={selectedPostId || ''}
                />
            )}

            {openComments && (
                <BottomSheet
                    enablePanDownToClose
                    index={2}
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
                        borderRadius: 22,
                    }}
                    handleIndicatorStyle={{
                        width: 50,
                        backgroundColor: '#CECECE',
                    }}>
                    <BottomSheetView
                        style={{
                            flex: 1,
                            padding: 0,
                            paddingLeft: 0,
                            paddingRight: 0,
                            gap: 0,
                            backgroundColor: 'white',
                        }}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentHeaderText}>Comments</Text>
                        </View>

                        <CommentList
                            postId={projectId || ''}
                            isLast={false}
                            navigation={navigation}
                            token={token || ''}
                            isProject={type === 'project'}
                            selfPost={isSelfProfile}
                        />
                        <CommentInputCard
                            postId={projectId || ''}
                            token={token || ''}
                            onCommentAdded={() => {
                                // This function is called when a comment is added
                            }}
                            isProject={type === 'project'}
                        />
                    </BottomSheetView>
                </BottomSheet>
            )}

            <BottomSheetModal
                isVisible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedItem(null);
                }}
                saveToggle={handleSaveToCollection}
                post={{ 
                    _id: projectId, 
                    title: items[currentIndex]?.caption, 
                    url: items[currentIndex]?.imageUrl,
                    contentType: 'video'
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
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
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: '#000',
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
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
        opacity: 1,
        transform: [{ translateY: 0 }],
    },
    userInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    profilePic: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    profilePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: FontFamilies.regular,
    },
    userTextContainer: {
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
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
    username: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: FontFamilies.semibold,
    },
    captionContainer: {
        marginBottom: 16,
    },
    caption: {
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.medium,
        color: '#FFFFFF',
        lineHeight: LineHeights.medium,
    },
    moreText: {
        color: '#CCCCCC',
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.medium,
    },
    actionContainer: {
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
    actionText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: FontFamilies.regular,
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
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#FFF',
        borderRadius: 2,
    },
    actionIcon: {
        width: 23,
        height: 23,
        marginBottom: 4,
    },
    muteButton: {
        marginLeft: 'auto',
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
    muteButtonOverlay: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 20,
    },
    centerPlayButton: {
        position: 'absolute',
        top: SCREEN_HEIGHT / 2 - 30,
        left: SCREEN_WIDTH / 2 - 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    videoProgressContainer: {
        position: 'absolute',
        bottom: 200,
        left: 16,
        right: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
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
});

export default VideoFullScreenRewamped;