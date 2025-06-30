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
                    navigation.navigate('BottomBar', {
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
            routeToOtherUserProfile(navigation, userId, false, token || null);
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
                        }
                    }}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={(event) => {
                        const contentOffset = event.nativeEvent.contentOffset.x;
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