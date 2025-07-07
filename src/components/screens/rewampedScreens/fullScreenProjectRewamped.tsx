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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import {
    PanGestureHandler,
    PinchGestureHandler,
    TapGestureHandler,
    State,
} from 'react-native-gesture-handler';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../styles/constants';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { updatePostState } from '../../../redux/slices/postSlice';
import { RootState } from '../../../redux/store';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { routeToOtherUserProfile } from '../notifications/routingForNotification';
import { getInitials } from '../../../utils/commonFunctions';

type RootStackParamList = {
    FullScreenProjectRewamped: RouteParams;
    FullPostScreen: {
        feed: any;
    };
};

type FullScreenProjectProps = {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    route: RouteProp<RootStackParamList, 'FullScreenProjectRewamped'>;
};

type UserDetails = {
    isPaid: boolean;
    accountType: string;
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

const FullScreenProjectRewamped = ({ route }: FullScreenProjectProps) => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { items = [], initialIndex = 0, type = 'project', projectId, token } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showFullCaption, setShowFullCaption] = useState(false);
    const CHARACTER_LIMIT = 150;
    const flatListRef = useRef<FlatList>(null);
    const dispatch = useDispatch();

    // Zoom state for images
    const [scale, setScale] = useState(1);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [lastScale, setLastScale] = useState(1);
    const [lastTranslateX, setLastTranslateX] = useState(0);
    const [lastTranslateY, setLastTranslateY] = useState(0);

    // Get Redux state
    const postState = useSelector((state: RootState) =>
        projectId ? state.posts.posts[projectId] : null
    );

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

            // Get username from userDetails
            const postUsername = currentItem?.userDetails?.username;

            const isSelfProfile = currentUser?.username === postUsername;
        };

        if (currentItem) {
            checkUserMatch();
        }
    }, [currentItem]);

    const handleBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const handleImagePress = () => {
        setShowUserDetails(!showUserDetails);
    };

    // Pinch gesture handler for zoom
    const onPinchGestureEvent = useCallback((event: any) => {
        const newScale = lastScale * event.nativeEvent.scale;
        setScale(Math.min(Math.max(newScale, 1), 3)); // Limit zoom between 1x and 3x
    }, [lastScale]);

    const onPinchHandlerStateChange = useCallback((event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            setLastScale(scale);
        }
    }, [scale]);

    // Pan gesture handler for moving zoomed image
    const onPanGestureEvent = useCallback((event: any) => {
        if (scale > 1) {
            const newTranslateX = lastTranslateX + event.nativeEvent.translationX;
            const newTranslateY = lastTranslateY + event.nativeEvent.translationY;
            
            // Limit panning based on zoom level
            const maxTranslateX = (scale - 1) * Dimensions.get('window').width / 2;
            const maxTranslateY = (scale - 1) * Dimensions.get('window').height / 2;
            
            setTranslateX(Math.min(Math.max(newTranslateX, -maxTranslateX), maxTranslateX));
            setTranslateY(Math.min(Math.max(newTranslateY, -maxTranslateY), maxTranslateY));
        }
    }, [lastTranslateX, lastTranslateY, scale]);

    // Check if we should allow scrolling
    const shouldAllowScroll = useCallback(() => {
        return scale <= 1;
    }, [scale]);

    const onPanHandlerStateChange = useCallback((event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            setLastTranslateX(translateX);
            setLastTranslateY(translateY);
        }
    }, [translateX, translateY]);

    // Reset zoom when changing items
    const resetZoom = useCallback(() => {
        setScale(1);
        setTranslateX(0);
        setTranslateY(0);
        setLastScale(1);
        setLastTranslateX(0);
        setLastTranslateY(0);
    }, []);

    // Double tap to reset zoom
    const onDoubleTap = useCallback(() => {
        if (scale > 1) {
            resetZoom();
        } else {
            setScale(2);
            setLastScale(2);
        }
    }, [scale, resetZoom]);

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
                <TapGestureHandler
                    numberOfTaps={2}
                    onActivated={onDoubleTap}>
                    <PinchGestureHandler
                        onGestureEvent={onPinchGestureEvent}
                        onHandlerStateChange={onPinchHandlerStateChange}>
                        <PanGestureHandler
                            onGestureEvent={onPanGestureEvent}
                            onHandlerStateChange={onPanHandlerStateChange}
                            enabled={scale > 1}
                            shouldCancelWhenOutside={false}
                            activeOffsetX={[-10, 10]}
                            activeOffsetY={[-10, 10]}>
                            <View style={styles.imageWrapper}>
                                <FastImage
                                    source={{ uri: item.imageUrl }}
                                    style={[
                                        styles.image,
                                        {
                                            transform: [
                                                { scale: scale },
                                                { translateX: translateX },
                                                { translateY: translateY },
                                            ],
                                        },
                                    ]}
                                    resizeMode={FastImage.resizeMode.contain}
                                    onLoadStart={() => setLoading(true)}
                                    onLoadEnd={() => setLoading(false)}
                                />
                            </View>
                        </PanGestureHandler>
                    </PinchGestureHandler>
                </TapGestureHandler>
            </TouchableOpacity>
        );
    };

    const handleViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
                // Reset zoom when changing items
                resetZoom();
            }
        }
    }, [currentIndex, resetZoom]);

    const isHorizontal = true; // Always horizontal for projects
    const itemLength = Dimensions.get('window').width;

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

    // Add navigation function to handle profile taps
    const navigateToUserProfile = (userId: string, accountType: string) => {
        console.log("userId", userId);
        if (!userId) {
            return;
        }

        // Get the current user data to check if this is the self profile
        AsyncStorage.getItem('user').then(userData => {
            if (userData) {
                const currentUser = JSON.parse(userData);
                // Check if viewing own profile
                const isSelf = currentUser._id === userId || currentUser.id === userId;

                if (isSelf) {
                    // Navigate to the bottom tab named "ProfileRewamp" for self profile
                    (navigation as any).navigate('BottomBar', {
                        screen: 'ProfileScreen',
                        params: {
                            isSelf: true
                        }
                    });
                } else {
                    // Use routeToOtherUserProfile for other users
                    routeToOtherUserProfile(navigation, userId, false, token || null, accountType);
                }
            } else {
                // Fallback in case user data can't be retrieved
                routeToOtherUserProfile(navigation, userId, false, token || null, accountType);
            }
        }).catch(error => {
            console.error("Error checking user data:", error);
            // Fallback to other user profile on error
            routeToOtherUserProfile(navigation, userId, false, token || null, accountType);
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
                        const contentOffset = event.nativeEvent.contentOffset.x;
                        const index = Math.round(contentOffset / itemLength);
                        if (index !== currentIndex) {
                            setCurrentIndex(index);
                            // Reset zoom when changing items
                            resetZoom();
                        }
                    }}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(event) => {
                        const contentOffset = event.nativeEvent.contentOffset.x;
                        const index = Math.round(contentOffset / itemLength);
                        if (index !== currentIndex) {
                            setCurrentIndex(index);
                            // Reset zoom when changing items
                            resetZoom();
                        }
                    }}
                    scrollEnabled={shouldAllowScroll()}
                />

                {showUserDetails && currentItem && (
                    <View style={styles.userDetailsContainer}>
                        <TouchableOpacity
                            style={styles.userInfoRow}
                            onPress={() => {
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
                                        {getInitials(currentItem.userDetails.username)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.userTextContainer}>
                                <Text style={styles.username}>{currentItem.userDetails.username}</Text>
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
                    </View>
                )}
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
    imageContainer: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        backgroundColor: '#000',
    },
    imageWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
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
    userDetailsContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        padding: 16,
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
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 0,
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
    captionContainer: {
        paddingVertical: 12,
        marginBottom: 15,
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
    }
});

export default FullScreenProjectRewamped;