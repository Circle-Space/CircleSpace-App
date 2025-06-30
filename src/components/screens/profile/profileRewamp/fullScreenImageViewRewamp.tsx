import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    FlatList,
    Text,
    Image,
    NativeScrollEvent,
    Keyboard,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../../styles/constants';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { post, del } from '../../../../services/dataRequest';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike as toggleLikeInPostSlice, toggleSave, updatePostState } from '../../../../redux/slices/postSlice';
import { toggleLike as toggleLikeInLikeSlice } from '../../../../redux/slices/likeSlice';
import { RootState } from '../../../../redux/store';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheet, { BottomSheetFooter, BottomSheetView } from '@gorhom/bottom-sheet';
import { setCommentReply } from '../../../../redux/reducers/chatSlice';
import CommentList from '../../Home/CommentList';
import CommentInputCard from '../../Home/CommentInputCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LikedUsersModal from '../../../commons/LikedUsersModal';
import BottomSheetModal from '../../../screens/profile/BottomSheetModal';
import { setSaveStatus } from '../../../../redux/slices/saveSlice';
import { routeToOtherUserProfile } from '../../../screens/notifications/routingForNotification';

type RootStackParamList = {
    FullScreenImageView: RouteParams;
    FullPostScreen: {
        feed: any;
    };
};

type FullScreenImageViewProps = {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    route: RouteProp<RootStackParamList, 'FullScreenImageView'>;
};

type UserDetails = {
    profilePic: string | undefined;
    id: string;
    name: string;
    username?: string;
    profileImage: string;
    isLiked?: boolean;
    isSaved?: boolean;
    likeCount?: number;
    commentCount?: number;
    caption?: string;
};

type RouteParams = {
    items: Array<{
        imageUrl: string;
        userDetails: UserDetails;
        caption: string;
    }>;
    initialIndex?: number;
    type?: 'project' | 'post';
    projectId?: string;
    token?: string;
};

interface PostState {
    _id: string;
    isLiked: boolean;
    isSaved: boolean;
    likeCount: number;
    commentCount: number;
    likes: number;
}

const FullScreenImageView = ({ route }: FullScreenImageViewProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { items = [], initialIndex = 0, type = 'post', projectId, token } = route.params || {};
    const itemType = type === 'ugc' ? 'photo' : type;
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const CHARACTER_LIMIT = 150;
    const flatListRef = useRef<FlatList>(null);
    const dispatch = useDispatch();
    
    // Get Redux state
    const postState = useSelector((state: RootState) =>
        projectId ? state.posts.posts[projectId] : null
    );
    
    // Get like state from Redux
    const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
    const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
    
    // Create derived values from Redux state for likes
    const isItemLiked = projectId ? (likedPosts[projectId] !== undefined ? likedPosts[projectId] : postState?.isLiked || false) : false;
    const itemLikeCount = projectId ? (likeCounts[projectId] !== undefined ? likeCounts[projectId] : postState?.likeCount || 0) : 0;
    
    const [openComments, setOpenComments] = useState(false);
    const bottomSheetCommentRef = useRef<BottomSheet>(null);
    const [isSelfProfile, setIsSelfProfile] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);
    
    // Get save state from Redux
    const isItemSaved = projectId ? (savedPosts[projectId] !== undefined ? savedPosts[projectId] : postState?.isSaved || false) : false;

    // Get comment count from Redux
    const reduxCommentCount = useSelector((state: RootState) => {
        return projectId ? state.comment.commentCounts[projectId] || 0 : 0;
    });

    // Ensure items is always an array and has the correct structure
    const processedItems = Array.isArray(items) ? items : [];
    const currentItem = processedItems[currentIndex] || null;
    useEffect(() => {
        if (projectId && currentItem?.userDetails) {
            dispatch(updatePostState({
                id: projectId,
                isLiked: currentItem.userDetails?.isLiked || false,
                isSaved: currentItem.userDetails?.isSaved || false,
                likeCount: currentItem.userDetails?.likeCount || 0,
                commentCount: currentItem.userDetails?.commentCount || 0
            }));
        }
    }, [projectId, currentItem?.userDetails]);

    // Reset showFullCaption when currentIndex changes
    useEffect(() => {
        setShowFullCaption(false);
    }, [currentIndex]);

    useEffect(() => {
        // Check if current user is the post owner
        const checkUserMatch = async () => {
            const userData = await AsyncStorage.getItem('user');
            const currentUser = userData ? JSON.parse(userData) : null;
            console.log('check',currentItem)
            
            // Get username from userDetails
            const postUsername = currentItem?.userDetails?.username;
            
            const isSelfProfile = currentUser?.username === postUsername;
            
            console.log("isSelfProfile check in FullScreenImageView:", {
                currentUserUsername: currentUser?.username,
                postUsername,
                isSelfProfile
            });
            
            setIsSelfProfile(isSelfProfile);
        };

        if (currentItem) {
            checkUserMatch();
        }
    }, [currentItem]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleImagePress = () => {
        console.log("userDetails", currentItem?.userDetails);
        setShowUserDetails(!showUserDetails);
    };

    const handleLikePress = async () => {
        console.log('Like pressed in FullScreenImageView');
        console.log('Project ID:', projectId);
        console.log('Current like state:', isItemLiked);
        console.log('Current like count:', itemLikeCount);

        if (!projectId) {
            console.log('No project ID available');
            return;
        }

        try {
            // Optimistic update through Redux
            console.log('Dispatching toggleLike with ID:', projectId);
            dispatch(toggleLikeInPostSlice(projectId));
            dispatch(toggleLikeInLikeSlice(projectId));

            // Use correct endpoint based on type
            const endpoint = type === 'project'
                ? `project/toggle-like/?projectId=${projectId}`
                : `post/toggle-like/?postId=${projectId}`;
                
            console.log('Making API call to:', endpoint);

            // Use post function from dataRequest
            const response = await post(endpoint, {});
            console.log('API Response:', response);

            if (!response || response.status !== 200) {
                console.log('API call failed, reverting state');
                // Revert the optimistic update if the API call fails
                dispatch(toggleLikeInPostSlice(projectId));
                dispatch(toggleLikeInLikeSlice(projectId));
            } else {
                console.log('Like toggled successfully');
                console.log('New like state:', !isItemLiked);
                console.log('New like count:', itemLikeCount);
            }
        } catch (error) {
            console.error('Error in handleLikePress:', error);
            // Revert the optimistic updates
            dispatch(toggleLikeInPostSlice(projectId));
            dispatch(toggleLikeInLikeSlice(projectId));
        }
    };

    const handleSavePress = async () => {
        if (!projectId) return;

        try {
            if (isItemSaved) {
                // If already saved, unsave it
                const response = await del(`collections/remove-item/${projectId}`, '');
                if (response && response.message === 'Item removed from all collections successfully') {
                    dispatch(setSaveStatus({ postId: projectId, isSaved: false }));
                } else {
                    dispatch(setSaveStatus({ postId: projectId, isSaved: true }));      
                    throw new Error('Failed to unsave the post');
                }
            } else {
                // Show collection selector modal
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error('Error handling save:', error);
            Alert.alert('Error', 'Failed to update save status');
        }
    };

    const handleSaveToCollection = async (collectionInfo: any) => {
        if (!projectId) return;

        try {
            // If this is a new collection creation, just update Redux state
            if (collectionInfo.isNewCollection) {
                dispatch(setSaveStatus({ postId: projectId, isSaved: true }));
                return;
            }

            // For existing collections, make the API call
            const response = await post(`collections/add-item/${collectionInfo.collectionInfo.collectionId}`, {
                itemId: projectId,
                itemType: itemType || 'photo'
            });

            if (response && response.message === 'Item added to collection successfully') {
                // Update Redux state
                dispatch(setSaveStatus({ postId: projectId, isSaved: true }));
            } else {
                dispatch(setSaveStatus({ postId: projectId, isSaved: false }));
                throw new Error('Failed to save the post');
            }
        } catch (error) {
            console.error('Error in handleSaveToCollection:', error);
            Alert.alert('Error', 'Failed to save to collection');
        } finally {
            setIsModalVisible(false);
        }
    };

    const handleCommentPress = () => {
        Keyboard.dismiss();
        setOpenComments(true);
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex - 1,
                animated: true
            });
        }
    };

    const handleNext = () => {
        if (currentIndex < (processedItems?.length || 0) - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true
            });
        }
    };

    const renderItem = ({ item }: { item: typeof processedItems[0] }) => {
        return (
            <TouchableOpacity
                style={styles.imageContainer}
                activeOpacity={1}
                onPress={handleImagePress}
            >
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Color.black} />
                    </View>
                )}
                <FastImage
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                />
            </TouchableOpacity>
        );
    };

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }, []);

    const isHorizontal = type === 'project';
    const itemLength = isHorizontal ? Dimensions.get('window').width : Dimensions.get('window').height;

    const renderCaption = () => {
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

    const handleShowLikes = () => {
        setShowLikesModal(true);
    };

    const handleCloseLikesModal = () => {
        setShowLikesModal(false);
    };

    const renderFooter = useCallback(
        props => (
          <BottomSheetFooter {...props} bottomInset={0}>
            <View style={styles.footerContainer}>
            <CommentInputCard
                                    postId={projectId}
                                    token={token}
                                    onCommentAdded={() => {
                                        if (postState && projectId) {
                                            dispatch(updatePostState({
                                                id: projectId,
                                                commentCount: (postState.commentCount || 0) + 1
                                            }));
                                        }
                                    }}
                                    isProject={type === 'project'}
                                />
                            </View>
          </BottomSheetFooter>
        ),
        []
      );

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Add this effect to get the current user ID
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

    // Add navigation function to handle profile taps
    const navigateToUserProfile = (userId: string, accountType: string) => {
        if (!userId) {
            console.log("No user ID provided for navigation");
            return;
        }
        
        // Get the current user data to check if this is the self profile
        AsyncStorage.getItem('user').then(userData => {
            if (userData) {
                const currentUser = JSON.parse(userData);
                // Check if viewing own profile
                const isSelf = currentUser._id === userId || currentUser.id === userId;
                
                console.log("Profile navigation check:", {
                    isSelf,
                    currentUserId: currentUser._id,
                    profileUserId: userId
                });
                
                if (isSelf) {
                    // Navigate to the bottom tab named "ProfileRewamp" for self profile
                    navigation.navigate('ProfileRewamp' as never);
                } else {
                    // Use routeToOtherUserProfile for other users
                    routeToOtherUserProfile(navigation, userId, false, token, accountType);
                }
            } else {
                // Fallback in case user data can't be retrieved
                routeToOtherUserProfile(navigation, userId, false, token, accountType);
            }
        }).catch(error => {
            console.error("Error checking user data:", error);
            // Fallback to other user profile on error
            routeToOtherUserProfile(navigation, userId, false, token, accountType);
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'bottom']}>
    <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <View style={styles.iconWrapper}>
                    <Icon name="chevron-back" size={24} color="#FFF" />
                </View>
            </TouchableOpacity>

            <FlatList
                ref={flatListRef}
                data={processedItems}
                renderItem={renderItem}
                keyExtractor={(item, index) => `${index}`}
                horizontal={isHorizontal}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                initialScrollIndex={initialIndex}
                snapToInterval={itemLength}
                snapToAlignment="center"
                decelerationRate="fast"
                getItemLayout={(data, index) => ({
                    length: itemLength,
                    offset: itemLength * index,
                    index,
                })}
                onViewableItemsChanged={handleViewableItemsChanged}
                viewabilityConfig={{
                    itemVisiblePercentThreshold: 50,
                }}
                onScroll={(event) => {
                    const contentOffset = isHorizontal ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
                    const index = Math.round(contentOffset / itemLength);
                    if (index !== currentIndex) {
                        setCurrentIndex(index);
                    }
                }}
                scrollEventThrottle={16}
                onMomentumScrollEnd={(event) => {
                    const contentOffset = isHorizontal ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
                    const index = Math.round(contentOffset / itemLength);
                    if (index !== currentIndex) {
                        setCurrentIndex(index);
                    }
                }}
            />

            {showUserDetails && currentItem && (
                <View style={styles.userDetailsContainer}>
                    <TouchableOpacity 
                        style={styles.userInfoRow}
                        onPress={() => {
                            console.log("Profile pressed in FullScreenImageViewRewamp");
                            if (currentItem.userDetails?.id) {
                                navigateToUserProfile(currentItem.userDetails.id, currentItem.userDetails.accountType);
                            }
                        }}
                        activeOpacity={0.7}
                    >
                        {currentItem.userDetails.profilePic ? (
                            <Image
                                source={{ uri: currentItem.userDetails.profilePic }}
                                style={styles.profilePic}
                            />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.initialsText}>
                                    {currentItem.userDetails.name?.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                        <View style={styles.userTextContainer}>
                            <Text style={styles.username}>{currentItem.userDetails.username}</Text>
                        </View>
                    </TouchableOpacity>
                    {renderCaption()}
                    <View style={styles.actionContainer}>
                        <View style={styles.actionLeft}>
                            <View
                                style={styles.actionButton}
                            >
                                <TouchableOpacity onPress={handleLikePress}>
                                    <Image
                                        source={isItemLiked
                                            ? require('../../../../assets/postcard/likeFillIcon.png')
                                            : require('../../../../assets/postcard/likeIcon.png')
                                        }
                                        style={[styles.actionIcon, !isItemLiked && { tintColor: '#FFFFFF' }]}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleShowLikes}>
                                    <Text style={styles.actionText}>{itemLikeCount}</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleCommentPress}
                            >
                                <Image
                                    source={require('../../../../assets/postcard/commentIcon.png')}
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={styles.actionText}>{reduxCommentCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleSavePress}
                            >
                                <Image
                                    source={isItemSaved
                                        ? require('../../../../assets/postcard/saveFillIcons.png')
                                        : require('../../../../assets/postcard/saveIcon.png')
                                    }
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={[styles.actionText, { opacity: 0 }]}>0</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Image
                                    source={require('../../../../assets/postcard/sendIcon.png')}
                                    style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
                                />
                                <Text style={[styles.actionText, { opacity: 0 }]}>0</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
                        }}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentHeaderText}>Comments</Text>
                        </View>

                        {projectId && (
                            <>
                                <CommentList
                                    postId={projectId}
                                    isLast={false}
                                    navigation={navigation}
                                    token={token}
                                    isProject={true}
                                    selfPost={isSelfProfile}
                                />
                                
                            </>
                        )}
                    </BottomSheetView>
                </BottomSheet>
            )}

            <LikedUsersModal
                visible={showLikesModal}
                onClose={handleCloseLikesModal}
                postId={projectId || ''}
            />

            <BottomSheetModal
                isVisible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                saveToggle={handleSaveToCollection}
                post={{ 
                    _id: projectId, 
                    title: currentItem?.caption, 
                    url: currentItem?.contentUrl,
                    contentType: type 
                }}
            />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        overflow: 'hidden',
       
      },
      safeArea: {
        flex: 1,
        backgroundColor: '#000',
      },
    backButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 10,
        left: 15,
        zIndex: 1,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        marginLeft: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        tintColor: '#FFF'
    },
    imageContainer: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#000',
    },
    image: {
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
    paginationContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    paginationWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    paginationText: {
        color: Color.white,
        fontSize: 16,
        fontFamily: FontFamilies.medium,
        marginHorizontal: 8,
    },
    iconContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userDetailsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
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
    profilePlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: Color.white,
        fontSize: 16,
        fontFamily: FontFamilies.regular,
    },
    userTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    username: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: FontFamilies.semibold,
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
    moreText: {
        color: '#FFFFFF',
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.medium,
        lineHeight: LineHeights.medium,
        fontWeight: '400',
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
});

export default FullScreenImageView;