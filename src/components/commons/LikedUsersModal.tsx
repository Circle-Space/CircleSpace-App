import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    FlatList,
    TouchableOpacity,
    Text,
    StyleSheet,
    Image,
    Modal,
    Dimensions,
    ActivityIndicator,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
    Animated,
    PanResponder,
    TextInput,
} from 'react-native';
import { get, post } from '../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInitials } from '../../utils/commonFunctions';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { setLikeStatus } from '../../redux/slices/likeSlice';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const DRAG_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 0.5;

interface LikedUsersModalProps {
    visible: boolean;
    onClose: () => void;
    postId: string;
}

interface LikedUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    businessName?: string;
    username: string;
    profilePic?: string;
    isFollowed?: boolean;
    accountType?: string;
}

type RootStackParamList = {
    ProfileRewamp: undefined;
    OtherUserProfileRewamped: {
        userId: string;
        isSelfProfile: boolean;
    };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LikedUsersModal = ({ visible, onClose, postId }: LikedUsersModalProps) => {
    const [likedUsers, setLikedUsers] = useState<LikedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [tokenLoading, setTokenLoading] = useState(true);
    const [token, setToken] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalLikes, setTotalLikes] = useState(0);

    const bottom = useRef(new Animated.Value(-MODAL_HEIGHT)).current;
    const dragY = useRef(0);

    const dispatch = useDispatch();
    const currentLikeStatus = useSelector((state: any) => state.like.likedPosts[postId] || false);

    useEffect(() => {
        fetchToken();
    }, [postId]);

    useEffect(() => {
        if (visible && token) {
            Animated.timing(bottom, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
            }).start();
            fetchLikedUsers(true);
        } else if (!visible) {
            Animated.timing(bottom, {
                toValue: -MODAL_HEIGHT,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [visible, token]);

    const handleGestureMove = (gestureState: any) => {
        const newBottom = Math.min(0, dragY.current - gestureState.dy);
        bottom.setValue(newBottom);
    };

    const handleGestureRelease = (gestureState: any) => {
        const currentBottom = dragY.current - gestureState.dy;
        const shouldClose =
            currentBottom < -DRAG_THRESHOLD ||
            gestureState.vy > VELOCITY_THRESHOLD;

        if (shouldClose) {
            closeModal();
        } else {
            Animated.timing(bottom, {
                toValue: 0,
                duration: 150,
                useNativeDriver: false,
            }).start();
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 2;
            },
            onPanResponderGrant: () => {
                let currentValue = 0;
                bottom.addListener(({ value }) => {
                    currentValue = value;
                });
                dragY.current = currentValue;
            },
            onPanResponderMove: (_, gestureState) => handleGestureMove(gestureState),
            onPanResponderRelease: (_, gestureState) => handleGestureRelease(gestureState),
            onPanResponderTerminate: (_, gestureState) => handleGestureRelease(gestureState),
        })
    ).current;

    const [loggedInUserId, setLoggedInUserId] = useState('');
    const fetchToken = useCallback(async () => {
        setTokenLoading(true);
        try {
            const savedToken = await AsyncStorage.getItem('userToken');
            const storedUserId = await AsyncStorage.getItem('user');
            const userDetails = JSON.parse(storedUserId || '{}');
            if (savedToken) {
                setToken(savedToken);
            }
            if (userDetails?.userId) {
                setLoggedInUserId(userDetails?.userId);
            }
        } catch (error) {
            console.error('Failed to fetch token:', error);
        } finally {
            setTokenLoading(false);
        }
    }, []);

    const fetchLikedUsers = async (reset = false) => {
        if (!token) {
            return;
        }

        if (reset) {
            setPage(1);
            setLikedUsers([]);
            setHasMore(true);
        }

        if (!hasMore && !reset) return;

        setLoading(true);
        try {
            const response = await get(
                `ugc/${postId}/likes?page=${reset ? 1 : page}&limit=200`,
                {},
                token,
            );
            console.log("response:::::::: likedUsersModal", response);
            if (response?.users) {
                if (reset) {
                    setLikedUsers(response?.users);
                } else {
                    setLikedUsers(prev => [...prev, ...response?.users]);
                }
                setHasMore(false); // Disable pagination for test data
                if (response.totalLikes !== undefined) {
                    setTotalLikes(response.totalLikes);
                    
                    // Only update the like count in Redux, preserve isLiked status
                    dispatch(setLikeStatus({
                        postId: postId,
                        isLiked: currentLikeStatus,
                        likeCount: response.totalLikes
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching liked users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLikedUsers(true);
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            fetchLikedUsers();
        }
    };

    const closeModal = () => {
        Keyboard.dismiss();
        Animated.timing(bottom, {
            toValue: -MODAL_HEIGHT,
            duration: 300,
            useNativeDriver: false,
        }).start(() => onClose());
    };

    const handleFollowPress = async (user: LikedUser) => {
        try {
            // Optimistically update UI
            setLikedUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === user._id
                        ? { ...u, isFollowed: !u.isFollowed }
                        : u
                )
            );

            // Make API call
            const response = await post(`user/toggle-follow/${user._id}`, {});

            if (!response || response.status !== 200) {
                // Revert on error
                setLikedUsers(prevUsers =>
                    prevUsers.map(u =>
                        u._id === user._id
                            ? { ...u, isFollowed: !u.isFollowed }
                            : u
                    )
                );
                console.error('Failed to toggle follow');
            }
        } catch (error) {
            // Revert on error
            setLikedUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === user._id
                        ? { ...u, isFollowed: !u.isFollowed }
                        : u
                )
            );
            console.error('Error toggling follow:', error);
        }
    };

    const navigation = useNavigation<NavigationProp>();
  
    const handleUserPress = (item: LikedUser) => {
        const isSelfProfile = loggedInUserId === item._id;
        closeModal(); // Close modal first
       
        if (isSelfProfile) {
            navigation.navigate('BottomBar', {
                screen: 'ProfileScreen',
                params: {
                  isSelf: true
                }
              });
        } else {
            if (item?.accountType === 'business' || item?.accountType === 'professional') {
                navigation.navigate('otherBusinessScreen', {
                    userId: item?._id,
                    isSelf: false
                });
            } else {
                navigation.navigate('otherProfileScreen', {
                    userId: item?._id,
                    isSelf: false
                });
            }
            }
    };

    const renderItem = ({ item }: { item: LikedUser }) => (
        <TouchableOpacity
            style={styles.userItem}
            activeOpacity={0.7}
            onPress={() => handleUserPress(item)}>
            {item?.profilePic ? (
                <Image source={{ uri: item.profilePic }} style={styles.avatar} />
            ) : (
                <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>
                        {getInitials(item?.username)}
                    </Text>
                </View>
            )}
            <View style={styles.userInfo}>
                <Text style={styles.name} numberOfLines={1}>
                    {item?.businessName || `${item?.firstName} ${item?.lastName}`}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                    @{item.username}
                </Text>
            </View>
            {
                loggedInUserId !== item._id && (
                    <TouchableOpacity
                        style={item.isFollowed ? styles.followingButton : styles.followButton}
                        onPress={() => handleFollowPress(item)}>
                        <Text style={item.isFollowed ? styles.followingText : styles.followText}>
                            {item.isFollowed ? 'Following' : 'Follow'}
                        </Text>
                    </TouchableOpacity>
                )
            }
        </TouchableOpacity>
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#1E1E1E" />
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No likes yet</Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={closeModal}
            statusBarTranslucent
        >
            <View style={StyleSheet.absoluteFillObject}>
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <Animated.View
                    style={[styles.modalContent, { bottom }]}
                    {...panResponder.panHandlers}
                >
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    <View style={styles.headerContainer}>
                        <Text style={styles.headerTitle}>Likes</Text>
                    </View>

                    <View style={styles.likesCountContainer}>
                        <Icon name="heart" size={24} color="#FF3B30" />
                        <Text style={styles.likesCount}>
                            {totalLikes.toLocaleString()}
                        </Text>
                    </View>

                    {tokenLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#1E1E1E" />
                        </View>
                    ) : totalLikes === 0 ? (
                        renderEmptyState()
                    ) : (
                        <FlatList
                            data={likedUsers}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            style={styles.list}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            keyboardShouldPersistTaps="handled"
                            keyboardDismissMode="on-drag"
                            scrollEventThrottle={16}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.semibold,
        color: '#1E1E1E',
    },
    likesCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    likesCount: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.semibold,
        color: '#1E1E1E',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.regular,
        color: '#1E1E1E',
        padding: 0,
    },
    list: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    listContent: {
        paddingBottom: 24,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    initialsAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        fontSize: FontSizes.small,
        color: Color.white,
        fontFamily: FontFamilies.semibold,
    },
    userInfo: {
        flex: 1,
        marginLeft: 12,
    },
    name: {
        fontSize: FontSizes.small,
        color: '#1E1E1E',
        fontFamily: FontFamilies.semibold,
    },
    username: {
        fontSize: FontSizes.small,
        color: '#9E9E9E',
        fontFamily: FontFamilies.regular,
    },
    followButton: {
        backgroundColor: '#000000',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
    },
    followingButton: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    followText: {
        color: '#FFFFFF',
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.semibold,
    },
    followingText: {
        color: '#000000',
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.semibold,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        paddingBottom: 100,
    },
    emptyStateText: {
        fontSize: FontSizes.medium,
        fontFamily: FontFamilies.regular,
        color: '#9E9E9E',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
});

export default LikedUsersModal; 