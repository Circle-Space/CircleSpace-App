import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity, Image, Dimensions, FlatList, RefreshControl, Alert, Animated, Modal, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get, post, del } from '../../../../services/dataRequest';
import ProfileHeader from './profileHeader';
import ProfileTabs from './profileTabs';
import { Color, FontFamilies, FontSizes, LineHeights } from '../../../../styles/constants';
import useCurrentUserId from '../../../../hooks/useCurrentUserId';
import SharePostToChat from '../../Home/SharePostToChat';
// import ProfileOptionModal from '../../ProfileOptionModal';
import { handleShareProfile } from '../../jobs/utils/utils';
import ProfileOptionModal from '../ProfileOptionModal';
import PostCard from '../../../commons/cardComponents/postCard';
import ProjectCard from '../../../commons/cardComponents/projectCard';
import SpaceCard from '../../../commons/cardComponents/spaceCard';
import { useIsFocused, useFocusEffect, useNavigation, NavigationProp } from '@react-navigation/native';
import CatalogCard from '../../../commons/cardComponents/catalogCard';
import CustomFAB from '../../../commons/customFAB';
import VideoCard from '../../../commons/cardComponents/videoCard';
import { useDispatch, useSelector } from 'react-redux';
import { setTabLoading, setTabData, setActiveTab } from '../../../../redux/slices/profileTabSlice';
import { RootState } from '../../../../redux/store';
import { toggleLike, setLikeStatus, initializeLikes } from '../../../../redux/slices/likeSlice';
import { toggleSave, setSaveStatus } from '../../../../redux/slices/saveSlice';
import { initializeCommentCounts } from '../../../../redux/slices/commentSlice';
import BottomSheetModal from '../BottomSheetModal';
import { FlashList } from '@shopify/flash-list';
import { clearProfileData, loadTabData as loadTabDataFromService, loadAllTabData as loadAllTabDataFromService } from '../../../../services/profileTabService';
import { Divider } from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import { updatePostFollowStatus, setFollowCounts, syncFollowStatus } from '../../../../redux/slices/feedSlice';
import FeedLayout from '../../rewampedExp/feedLayout';

// Define types for the navigation
type RootStackParamList = {
    PostDetailRewamped: {
        posts: any[];
        currentIndex: number;
        token: string;
        profile: any;
        isSelfProfile: boolean;
        navigationStack?: any[];
        onFollowUpdate?: (updatedPosts: any[]) => void;
    };
    FeedDetailExp: {
        posts: any[];
        currentIndex: number;
        token: string;
        profile: any;
        isSelfProfile: boolean;
        navigationStack?: any[];
        type?: string;
        pageName?: string;
        onFollowUpdate?: (updatedPosts: any[]) => void;
    };
    ProjectDetailRewamped: {
        feed: any;
        accountType: string;
        token: string;
        pageName: string;
        navigationStack?: any[];
        onFollowUpdate?: (updatedProject: any) => void;
    };
    SpaceDetail: {
        item: any;
        token: string;
        profile: any;
        isSelfProfile: boolean;
        navigationStack?: any[];
        onUpdate?: (updatedSpace: any) => void;
    };
    PDFViewer: {
        url: string;
        title: string;
    };
    ProfessionalDetailRewamped: {
        profile: any;
        self: boolean;
    };
    FollowFollowingRewamp: {
        id: any;
        tabName: any;
        username: any;
        user: any;
        self: any;
    };
};

type NavigationProps = NavigationProp<RootStackParamList> & {
    push: (name: keyof RootStackParamList, params?: any) => void;
};

interface ProfileLayoutProps {
    profile: any;
    self: boolean;
    setOpenShare: (value: boolean) => void;
    openShare: boolean;
    navigation: NavigationProps;
}

interface TabState {
    data: any[];
    isLoading: boolean;
    page: number;
    hasMore: boolean;
}

interface ProfileTabState {
    data: {
        posts: TabState;
        projects: TabState;
        catalog: TabState;
        spaces: TabState;
    };
    activeTab: string;
}

type TabKey = 'posts' | 'projects' | 'catalog' | 'spaces';

interface PostItem {
    _id: string;
    isLiked: boolean;
    isSaved: boolean;
    likes: number;
    contentType?: string;
    contentUrl?: string | string[];
    coverImage?: string;
    likedByUsers?: string[] | any[];
}

interface CatalogItem {
    _id: string;
    title: string;
    contentUrl: string;
}

interface ProfileUserInfoProps {
    profile: any;
    navigation: NavigationProps;
    self: boolean;
}

const horizontalPadding = 16;
const gap = 10; // Gap between items
const screenWidth = Dimensions.get('window').width;
const itemWidth = (screenWidth - (horizontalPadding * 2) - gap) / 2; // Calculate item width for 2 columns with gap

const SkeletonCard = () => {
    const animatedValue = new Animated.Value(0);

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                })
            ])
        );

        animation.start();

        return () => animation.stop();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={[styles.skeletonCard, { opacity }]} />
    );
};

const SkeletonGrid = () => {
    const skeletonData = [1, 2, 3, 4]; // Array to map over for skeleton items

    return (
        <FlatList
            data={skeletonData}
            renderItem={() => <SkeletonCard />}
            numColumns={2}
            keyExtractor={(item) => item.toString()}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.gridContainer}
            scrollEnabled={false}
        />
    );
};

const ProfileLayout: React.FC<ProfileLayoutProps> = ({
    profile: initialProfile,
    self: initialSelf,
    setOpenShare,
    openShare,
    navigation: propNavigation,
}) => {
    const dispatch = useDispatch();
    console.log("initialProfile",initialSelf);
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const navigationWithPush = navigation as NavigationProp<RootStackParamList> & {
        push: (name: keyof RootStackParamList, params?: any) => void;
    };
    const tabState = useSelector((state: RootState) => state.profileTab as unknown as ProfileTabState);
    const { data: tabData, activeTab } = tabState;
    const [profile, setProfile] = useState(initialProfile);
    const [accountType, setAccountType] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState('');
    const [showProfileOptions, setShowProfileOptions] = useState(false);
    const [blockedStatus, setBlockedStatus] = useState(false);
    const [isFollowing, setIsFollowing] = useState(profile?.isFollowed || false);
    const [followersCount, setFollowersCount] = useState(profile?.followersCount || 0);
    const [isSelfProfile, setIsSelfProfile] = useState(initialSelf);
    const userId = useCurrentUserId();
    const [refreshing, setRefreshing] = useState(false);
    const isFocused = useIsFocused();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [initialLoading, setInitialLoading] = useState(true);
    const feedState = useSelector((state: RootState) => state.feed);

    // Added for embedded ProfileUserInfo
    const [isBioExpanded, setIsBioExpanded] = useState(false);
    const [showProfilePopup, setShowProfilePopup] = useState(false);

    const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
    const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
    const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);

    const loadTabData = async (tab: string, userToken: string, isLoadMore = false) => {
        try {
            // Start loading immediately
            if (!isLoadMore) {
                dispatch(setTabLoading({ tab, isLoading: true }));
            } else {
                // For load more, also set loading state
                dispatch(setTabLoading({ tab, isLoading: true }));
            }
            
            // When not loading more, always start with page 1
            const currentPage = isLoadMore ? tabState.data[tab as TabKey].page : 0;
            const nextPage = isLoadMore ? currentPage + 1 : 1;
            const pageSize = 24; // Number of items per page


            // Use the profileTabService to load data with pagination
            await loadTabDataFromService(tab, {
                userId: profile?._id || '',
                userToken,
                dispatch,
                isOtherUser: !isSelfProfile, // Set based on whether this is self profile or not
                pagination: {
                    page: nextPage,
                    limit: pageSize,
                    isLoadMore
                }
            });

            // Add a slight delay before hiding loading indicator to ensure rendering completes
            setTimeout(() => {
                if (!isLoadMore) {
                    setInitialLoading(false);
                }
                dispatch(setTabLoading({ tab, isLoading: false }));
            }, 300);
        } catch (error) {
            console.error(`Error fetching ${tab} data:`, error);
            // Always make sure loading states are reset on error
            if (!isLoadMore) {
                setInitialLoading(false);
            }
            dispatch(setTabLoading({ tab, isLoading: false }));
        }
    };

    const loadMoreData = () => {
        // Get the current tab data
        const currentTabData = tabData[activeTab as keyof typeof tabData];

        // Don't try to load more if we're already loading or if there's no more data
        if (currentTabData.isLoading || !currentTabData.hasMore) {
            return;
        }
        
        loadTabData(activeTab, token, true);
    };

    // Let's first modify the onLoadMore function for FeedLayout
    const handlePostsLoadMore = () => {
        if (activeTab === 'posts') {
            const currentTabData = tabData.posts;
            if (!currentTabData.isLoading && currentTabData.hasMore) {
                loadMoreData();
            }
        }
    };

    const handleTabPress = async (tab: string) => {
        if (tabData[tab as keyof typeof tabData].isLoading) return;
        dispatch(setActiveTab(tab));
        await loadTabData(tab, token);
    };

    const renderTabContent = () => {
        const currentTabData = tabData[activeTab as keyof typeof tabData];

        if (currentTabData.isLoading && currentTabData.data.length === 0) {
            return <SkeletonGrid />;
        }

        switch (activeTab) {
            case 'posts':
                return (
                    <View style={styles.feedLayoutContainer}>
                        {currentTabData.data.length === 0 ? (
                            <View style={styles.noDataContainer}>
                                <Image
                                    source={require('../../../../assets/profile/noPostPlaceholder.png')}
                                    style={styles.noDataImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.noDataText}>No Posts</Text>
                                <Text style={styles.noDataSubText}>Create your first post</Text>
                            </View>
                        ) : (
                            <FeedLayout
                                data={currentTabData.data}
                                token={token}
                                accountType={accountType}
                                currentUserId={profile?._id || ''}
                                pageName="profile"
                                onDataUpdate={(updatedData) => {
                                    dispatch(setTabData({
                                        tab: 'posts',
                                        data: updatedData,
                                        page: currentTabData.page,
                                        hasMore: currentTabData.hasMore
                                    }));
                                }}
                                onLoadMore={handlePostsLoadMore}
                                loading={currentTabData.isLoading}
                                hasMoreItems={currentTabData.hasMore}
                                initialLoading={false}
                                showFAB={false}
                                onItemClick={(item) => {
                                    // Create navigation stack for better back navigation
                                    const navigationStack = [{
                                        type: 'profile',
                                        userId: profile._id,
                                        isSelfProfile: true
                                    }];

                                    navigationWithPush.push('FeedDetailExp', {
                                        posts: currentTabData.data,
                                        currentIndex: currentTabData.data.findIndex((post: any) => post._id === item._id),
                                        token: token,
                                        profile: profile,
                                        isSelfProfile: true,
                                        pageName: 'profile',
                                        type: item.contentType || 'post',
                                        navigationStack, // Add navigation stack to help with back navigation
                                        onFollowUpdate: (updatedPosts: any[]) => {
                                            // Update posts data when returning from detail view
                                            updatedPosts.forEach(updatedPost => {
                                                if (updatedPost._id) {
                                                    // Update the post in the tab data
                                                    const updatedPostsData = currentTabData.data.map((post: any) =>
                                                        post._id === updatedPost._id ? {
                                                            ...post,
                                                            ...updatedPost,
                                                            posterDetails: {
                                                                ...post.posterDetails,
                                                                ...updatedPost.posterDetails
                                                            }
                                                        } : post
                                                    );

                                                    dispatch(setTabData({
                                                        tab: 'posts',
                                                        data: updatedPostsData,
                                                        page: currentTabData.page,
                                                        hasMore: currentTabData.hasMore
                                                    }));
                                                }
                                            });
                                        }
                                    });
                                }}
                            />
                        )}
                    </View>
                );
            case 'projects':
                return (
                    <View style={styles.gridWrapperContainer}>
                        {currentTabData.data.length === 0 ? (
                            <View style={styles.noDataContainer}>
                                <Image
                                    source={require('../../../../assets/profile/noPostPlaceholder.png')}
                                    style={styles.noDataImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.noDataText}>No Projects</Text>
                                <Text style={styles.noDataSubText}>Create your first project</Text>
                            </View>
                        ) : (
                            <FlashList
                                data={currentTabData.data.filter((item) => item && item._id)}
                                renderItem={renderProjectItem}
                                keyExtractor={(item, index) => `project_${item._id}_${index}`}
                                estimatedItemSize={itemWidth}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={false}
                                ListFooterComponent={null}
                                contentContainerStyle={styles.gridContainer}
                            />
                        )}
                    </View>
                );
            case 'catalog':
                return (
                    <View style={styles.gridWrapperContainer}>
                        {currentTabData.data.length === 0 ? (
                            <View style={styles.noDataContainer}>
                                <Image
                                    source={require('../../../../assets/profile/noPostPlaceholder.png')}
                                    style={styles.noDataImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.noDataText}>No Catalogs</Text>
                                <Text style={styles.noDataSubText}>Create your first catalog</Text>
                            </View>
                        ) : (
                            <FlashList
                                data={currentTabData.data.filter((item) => item && item._id)}
                                renderItem={renderCatalogItem}
                                keyExtractor={(item, index) => `catalog_${item._id}_${index}`}
                                estimatedItemSize={itemWidth}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={false}
                                ListFooterComponent={null}
                                contentContainerStyle={styles.gridContainer}
                            />
                        )}
                    </View>
                );
            case 'spaces':
                return (
                    <View style={styles.gridWrapperContainer}>
                        {currentTabData.data.length === 0 ? (
                            <View style={styles.noDataContainer}>
                                <Image
                                    source={require('../../../../assets/profile/noPostPlaceholder.png')}
                                    style={styles.noDataImage}
                                    resizeMode="contain"
                                />
                                <Text style={styles.noDataText}>No Spaces</Text>
                                <Text style={styles.noDataSubText}>Create your first space</Text>
                            </View>
                        ) : (
                            <FlashList
                                data={currentTabData.data.filter((item) => item && (item._id || item.id))}
                                renderItem={renderSpaceItem}
                                keyExtractor={(item, index) => `space_${item._id || item.id}_${index}`}
                                estimatedItemSize={itemWidth}
                                numColumns={2}
                                showsVerticalScrollIndicator={false}
                                scrollEnabled={false}
                                ListFooterComponent={null}
                                contentContainerStyle={styles.gridContainer}
                            />
                        )}
                    </View>
                );
            default:
                return null;
        }
    };

    useFocusEffect(
        useCallback(() => {
            const initialize = async () => {
                try {
                    setInitialLoading(true);
                    // Clear existing profile data first to prevent stale data display
                    clearProfileData(dispatch);

                    const savedToken = await AsyncStorage.getItem('userToken');
                    if (!savedToken) {
                        console.error('No token found');
                        setInitialLoading(false);
                        return;
                    }

                    setToken(savedToken);

                    // Get logged-in user data from AsyncStorage first
                    const userData = await AsyncStorage.getItem('user');
                    let isOwnProfile = initialSelf;

                    if (userData && profile?._id) {
                        const loggedInUser = JSON.parse(userData);
                        isOwnProfile = loggedInUser._id === profile._id;
                        setIsSelfProfile(isOwnProfile);
                    }


                    // Load profile first
                    await loadProfile(savedToken);

                    // Then load tab data with the correct isOtherUser parameter
                    await loadAllTabDataFromService({
                        userId: profile?._id || '',
                        userToken: savedToken,
                        dispatch,
                        isOtherUser: !isOwnProfile,
                        pagination: {
                            page: 1,
                            limit: 24,
                            isLoadMore: false
                        },
                        deduplicateData: true
                    });

                    const accountType_ = await AsyncStorage.getItem('accountType');
                    setAccountType(accountType_ || '');

                } catch (error) {
                    console.error('Error initializing profile:', error);
                } finally {
                    setInitialLoading(false);
                    setIsLoading(false);
                }
            };

            initialize();
        }, [profile?._id, dispatch])
    );

    // fab logic
    const [isFabOpen, setIsFabOpen] = useState(false);

    // Add navigation listener to close FAB when route changes
    useEffect(() => {
        const unsubscribe = navigationWithPush.addListener('blur', () => {
            setIsFabOpen(false);
        });

        return unsubscribe;
    }, [navigationWithPush]);

    const loadProfile = async (userToken: string) => {
        try {
            const profileData = await get(`user/get-user-info?userId=${profile?._id}`, {}, userToken);

            if (profileData?.user) {
                setProfile(profileData.user);
                await AsyncStorage.setItem('user', JSON.stringify(profileData.user));
            } else {
                console.error('No user data in response');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Sync likes with Redux for both posts and projects
    const syncLikesToRedux = useCallback((items: Array<any>, itemType: 'posts' | 'projects') => {
        if (!Array.isArray(items) || items.length === 0) {
            return;
        }

        // Create array for batch update
        const itemsForRedux = items.map(item => ({
            _id: item._id,
            isLiked: item.isLiked || false,
            likes: item.likes || 0
        }));

        // Use initializeLikes for batch update instead of individual updates for performance
        dispatch(initializeLikes(itemsForRedux));
    }, [dispatch]);

    const followUser = async () => {
        try {
            const action = isFollowing ? 'unfollow' : 'follow';
            const response = await post(`user/toggle-follow/${profile?._id}`, {});
            if (response.status === 200) {
                setIsFollowing((prev: any) => !prev);
                setFollowersCount((prevCount: any) =>
                    isFollowing ? prevCount - 1 : prevCount + 1,
                );
            }
            if (!response) {
                throw new Error(`Failed to ${action} the user`);
            }
        } catch (error) {
            console.error(
                `Error trying to ${isFollowing ? 'unfollow' : 'follow'} the user:`,
                error,
            );
        }
    };

    // Update handleLikePress to use setLikeStatus for more precise control
    const handleLikePress = async (item: PostItem) => {
        try {
            // Get current state from Redux
            const isLikedInRedux = likedPosts[item._id] || false;
            const likeCountInRedux = likeCounts[item._id] || 0;

            // Calculate new state
            const newLikeState = !isLikedInRedux;
            const newLikeCount = isLikedInRedux ? likeCountInRedux - 1 : likeCountInRedux + 1;

            // First, dispatch setLikeStatus for precise control instead of toggleLike
            dispatch(toggleLike(item._id));

            // Update local tab data
            const updatedPosts = tabData.posts.data.map((post: PostItem) =>
                post._id === item._id
                    ? {
                        ...post,
                        isLiked: newLikeState,
                        likes: newLikeCount
                    }
                    : post
            );
            
            dispatch(setTabData({ 
                tab: 'posts' as TabKey, 
                data: updatedPosts,
                page: tabData.posts.page,
                hasMore: tabData.posts.hasMore
            }));

            // Then make API call
            const response = await post(`ugc/toggle-like/${item._id}`, {});

            // If API call is successful, check if response contains updated like count
            if (response.status === 200) {
                let serverLikeCount = newLikeCount; // Default to our calculated count

                // If API returns a like count, use that instead (server source of truth)
                if (response.data && typeof response.data.likeCount === 'number') {
                    serverLikeCount = response.data.likeCount;

                    // If server count is different, update Redux with server's count
                    if (serverLikeCount !== newLikeCount) {
                        // Update Redux with server count
                        dispatch(setLikeStatus({
                            postId: item._id,
                            isLiked: newLikeState,
                            likeCount: serverLikeCount
                        }));

                        dispatch(toggleLike(item._id));

                        // Update local state with server count
                        const updatedPostsWithServerCount = tabData.posts.data.map((post: PostItem) =>
                            post._id === item._id
                                ? {
                                    ...post,
                                    isLiked: newLikeState,
                                    likes: serverLikeCount
                                }
                                : post
                        );
                        
                        dispatch(setTabData({ 
                            tab: 'posts' as TabKey, 
                            data: updatedPostsWithServerCount,
                            page: tabData.posts.page,
                            hasMore: tabData.posts.hasMore
                        }));
                    }
                }

                // Also ensure we update the item's likedByUsers array for data consistency
                if (item.likedByUsers) {
                    const userId = await AsyncStorage.getItem('userId');
                    if (userId) {
                        const updatedLikedByUsers = newLikeState
                            ? [...(item.likedByUsers || []), userId]
                            : (item.likedByUsers || []).filter(id => id !== userId);

                        const updatedPostsWithLikedUsers = tabData.posts.data.map((post: PostItem) =>
                            post._id === item._id
                                ? {
                                    ...post,
                                    likedByUsers: updatedLikedByUsers
                                }
                                : post
                        );
                        
                        dispatch(setTabData({ 
                            tab: 'posts' as TabKey, 
                            data: updatedPostsWithLikedUsers,
                            page: tabData.posts.page,
                            hasMore: tabData.posts.hasMore
                        }));
                    }
                }
            }

            // If API call fails, revert changes
            if (response.status !== 200) {
                // Revert Redux state
                dispatch(setLikeStatus({
                    postId: item._id,
                    isLiked: isLikedInRedux,
                    likeCount: likeCountInRedux
                }));

                // Revert local state
                const revertedPosts = tabData.posts.data.map((post: PostItem) =>
                    post._id === item._id
                        ? {
                            ...post,
                            isLiked: isLikedInRedux,
                            likes: likeCountInRedux
                        }
                        : post
                );
                
                dispatch(setTabData({ 
                    tab: 'posts' as TabKey, 
                    data: revertedPosts,
                    page: tabData.posts.page,
                    hasMore: tabData.posts.hasMore
                }));
                
                throw new Error('API call failed');
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            Alert.alert('Error', 'Failed to update like status');
        }
    };

    const handleSavePress = async (item: any) => {

        // If item is just an ID string, find the full item from tabs data
        let itemToSave = item;
        if (typeof item === 'string' || !item.contentType) {
            const itemId = typeof item === 'string' ? item : item._id;

            // Look for the item in posts tab
            const foundInPosts = tabData.posts.data.find((post: any) => post._id === itemId);
            if (foundInPosts) {
                itemToSave = foundInPosts;
            } else {
                // Look for the item in projects tab
                const foundInProjects = tabData.projects.data.find((project: any) => project._id === itemId);
                if (foundInProjects) {
                    itemToSave = foundInProjects;
                }
            }
        }

        if (!itemToSave._id) {
            console.error("No valid item ID found for saving");
            return;
        }

        try {
            const isSaved = savedPosts[itemToSave._id] !== undefined ? savedPosts[itemToSave._id] : itemToSave.isSaved;

            if (isSaved) {
                // If already saved, unsave it
                const response = await del(`collections/remove-item/${itemToSave._id}`, '');
                if (response && response.message === 'Item removed from all collections successfully') {
                    dispatch(setSaveStatus({ postId: itemToSave._id, isSaved: false }));
                } else {
                    throw new Error('Failed to unsave the post');
                }
            } else {
                // Show collection selector modal
                setSelectedItem(itemToSave);
                setIsModalVisible(true);
            }
        } catch (error) {
            console.error('Error handling save:', error);
            Alert.alert('Error', 'Failed to update save status');
        }
    };

    const handleSaveToCollection = async (collectionInfo: any) => {
        if (!selectedItem?._id) return;

        try {
            // If this is a new collection creation, just update Redux state
            if (collectionInfo.isNewCollection) {
                dispatch(setSaveStatus({ postId: selectedItem._id, isSaved: true }));
                return;
            }

            // const itemType = selectedItem?.contentType === "ugc" || selectedItem?.contentType === "video" || selectedItem?.contentType === "photo" ? 'post' : selectedItem?.contentType;
            const itemType = selectedItem?.contentType === "ugc" ? 'photo' : selectedItem?.contentType;

            // For existing collections, make the API call
            const response = await post(`collections/add-item/${collectionInfo.collectionInfo.collectionId}`, {
                itemId: selectedItem._id,
                itemType: itemType
            });

            if (response && response.message === 'Item added to collection successfully') {
                // Update Redux state
                dispatch(setSaveStatus({ postId: selectedItem._id, isSaved: true }));
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

    const handleDelete = async (item: CatalogItem) => {
        try {
            const payload = {
                catalogId: item?._id,
            };
            const response = await post('catalog/delete-catalog', payload);
            if (response.status === 200) {
                Alert.alert('Success', 'Catalog deleted successfully');
                const updatedCatalogs = tabData.catalog.data.filter((catalog: CatalogItem) => catalog._id !== item._id);
                
                dispatch(setTabData({ 
                    tab: 'catalog' as TabKey, 
                    data: updatedCatalogs,
                    page: tabData.catalog.page,
                    hasMore: tabData.catalog.hasMore
                }));
            } else {
                Alert.alert('Error', 'Failed to delete catalog');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'An error occurred while deleting the catalog');
        }
    };

    // Render function for different item types
    const renderPostItem = ({ item, index }: { item: any, index: number }) => {
        const CardComponent = item?.contentType === 'video' ? VideoCard : PostCard;

        // Use the like and save state from Redux if available, otherwise fallback to item state
        const isLiked = likedPosts[item._id] !== undefined ? likedPosts[item._id] : item.isLiked;
        const likeCount = likeCounts[item._id] !== undefined ? likeCounts[item._id] : item.likes || 0;
        const isSaved = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;

            return (
            <CardComponent
                item={item}
                style={{ ...styles.gridItem, margin: 5 }}
                isLiked={isLiked}
                isSaved={isSaved}
                    onLikePress={() => handleLikePress(item)}
                    onSavePress={() => handleSavePress(item)}
                    onPress={() => {
                    // Create navigation stack for better back navigation
                    const navigationStack = [{
                        type: 'profile',
                        userId: profile._id,
                            isSelfProfile: true
                    }];

                    navigationWithPush.push('FeedDetailExp', {
                            posts: tabData.posts.data,
                        currentIndex: tabData.posts.data.findIndex((post: any) => post._id === item._id),
                            token: token,
                            profile: profile,
                        isSelfProfile: true,
                        pageName: 'profile',
                        type: item.contentType || 'post',
                        navigationStack, // Add navigation stack to help with back navigation
                        onFollowUpdate: (updatedPosts: any[]) => {
                            // Update posts data when returning from detail view
                            updatedPosts.forEach(updatedPost => {
                                if (updatedPost._id) {
                                    // Update the post in the tab data
                                    const updatedPostsData = tabData.posts.data.map((post: any) =>
                                        post._id === updatedPost._id ? {
                                            ...post,
                                            ...updatedPost,
                                            posterDetails: {
                                                ...post.posterDetails,
                                                ...updatedPost.posterDetails
                                            }
                                        } : post
                                    );

                                    dispatch(setTabData({
                                        tab: 'posts',
                                        data: updatedPostsData,
                                        page: tabData.posts.page,
                                        hasMore: tabData.posts.hasMore
                                    }));
                                }
                            });
                        }
                        });
                    }}
                />
            );
    };

    const renderProjectItem = ({ item, index }: { item: any, index: number }) => {
        // Use the like and save state from Redux if available, otherwise fallback to item state
        const isLiked = likedPosts[item._id] !== undefined ? likedPosts[item._id] : item.isLiked;
        const likeCount = likeCounts[item._id] !== undefined ? likeCounts[item._id] : item.likes || 0;
        const isSaved = savedPosts[item._id] !== undefined ? savedPosts[item._id] : item.isSaved;

        return (
            <ProjectCard
                title={item.caption || ''}
                images={item.contentUrl || (item.coverImage ? [item.coverImage] : [])}
                isLiked={isLiked}
                isSaved={isSaved}
                onLikePress={() => handleLikePress(item)}
                onSavePress={() => handleSavePress(item)}
                style={{ ...styles.gridItem, margin: 5 }}
                onPress={() => {
                    navigationWithPush.push('ProjectDetailRewamped', {
                        feed: item,
                        accountType: item.posterDetails?.accountType,
                        token: token,
                        pageName: 'profile',
                        onUpdate: (updatedProject: any) => {
                            if (updatedProject?._id) {
                                // Update the project in the tab data
                                const updatedProjectsData = tabData.projects.data.map((project: any) =>
                                    project._id === updatedProject._id ? {
                        ...project,
                                        ...updatedProject,
                                        posterDetails: {
                                            ...project.posterDetails,
                                            ...updatedProject.posterDetails
                                        }
                                    } : project
            );
            
            dispatch(setTabData({ 
                                    tab: 'projects',
                                    data: updatedProjectsData,
                page: tabData.projects.page,
                hasMore: tabData.projects.hasMore
            }));
                            }
                        }
                    });
                }}
                showIcons={false}
            />
        );
    };

    const renderCatalogItem = ({ item, index }: { item: any, index: number }) => {
        return (
            <CatalogCard
                title={item.title || ''}
                onView={() => {
                    navigationWithPush.navigate('PDFViewer', {
                        url: item.contentUrl,
                        title: item.title,
                    });
                }}
                onDelete={() => {
                    Alert.alert(
                        'Delete Catalog',
                        'Are you sure you want to delete this catalog?',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', onPress: () => handleDelete(item), style: 'destructive' },
                        ],
                    );
                }}
                isSelfProfile={true}
            />
        );
    };

    const renderSpaceItem = ({ item, index }: { item: any, index: number }) => {
        return (
            <SpaceCard
                title={item.name || ''}
                images={item.thumbnails || []}
                itemCount={item.itemCount || 0}
                style={{
                    ...styles.gridItem,
                    width: itemWidth,
                    margin: 5,
                }}
                onPress={() => {
                    navigationWithPush.navigate('SpaceDetail', {
                        item: {
                            ...item,
                            _id: item._id || item.id // Ensure _id is available
                        },
                        token: token,
                        profile: profile,
                        isSelfProfile: true,
                        onUpdate: (updatedSpace: any) => {
                            if (updatedSpace?._id || updatedSpace?.id) {
                                // Update the space in the tab data
                                const updatedSpacesData = tabData.spaces.data.map((space: any) =>
                                    (space._id === updatedSpace._id || space.id === updatedSpace.id) ? {
                                        ...space,
                                        ...updatedSpace
                                    } : space
                                );

                                dispatch(setTabData({
                                    tab: 'spaces',
                                    data: updatedSpacesData,
                                    page: tabData.spaces.page,
                                    hasMore: tabData.spaces.hasMore
                                }));
                            }
                        }
                    });
                }}
            />
        );
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                loadProfile(token),
                loadAllTabDataFromService({
                    userId: profile?._id || '',
                    userToken: token,
                    dispatch,
                    isOtherUser: !isSelfProfile,
                    pagination: {
                        page: 1,
                        limit: 24,
                        isLoadMore: false
                    },
                    deduplicateData: true // Add flag to deduplicate data
                })
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // ProfileUserInfo embedded functions
    const getInitials = (businessName?: string, firstName?: string) => {
        if (businessName) return businessName.charAt(0).toUpperCase();
        return firstName ? firstName.charAt(0).toUpperCase() : '';
    };

    const handleProfileImagePress = () => {
        setShowProfilePopup(true);
    };

    const closeProfilePopup = () => {
        setShowProfilePopup(false);
    };

    const handleProfileShare = () => {
        if (setOpenShare) {
            setOpenShare(true);
        }
    };

    const renderBio = () => {
        if (!profile?.bio) {
            return null;
        }
        // Count lines and characters
        const lines = profile.bio.split('\n');
        const hasMoreLines = lines.length > 3;
        const cleanBio = profile.bio.replace(/\n/g, '');
        const hasMoreChars = cleanBio.length > 90;
        const shouldShowMore = hasMoreLines || hasMoreChars;

        // Get display text
        let displayText = profile?.bio;
        if (!isBioExpanded) {
            // Limit to 3 lines
            const limitedLines = lines.slice(0, 3);
            displayText = limitedLines.join('\n');

            // If still too long, truncate to 90 chars
            if (cleanBio.length > 90) {
                let charCount = 0;
                let truncatedText = '';
                for (let i = 0; i < displayText.length; i++) {
                    if (displayText[i] === '\n') {
                        truncatedText += '\n';
                    } else if (charCount < 90) {
                        truncatedText += displayText[i];
                        charCount++;
                    }
                }
                displayText = truncatedText;
            }
        }

        return (
            <Text style={profileUserInfoStyles.bio}>
                {displayText}
                {shouldShowMore && (
                    <>
                        {!isBioExpanded && '... '}
                        <Text
                            style={profileUserInfoStyles.moreButtonText}
                            onPress={() => setIsBioExpanded(!isBioExpanded)}>
                            {isBioExpanded ? ' less' : 'more'}
                        </Text>
                    </>
                )}
            </Text>
        );
    };

    const renderServices = () => {
        if (!profile?.servicesProvided?.length) return null;

        return (
            <TouchableOpacity
                style={profileUserInfoStyles.servicesChip}
                onPress={() => navigationWithPush.navigate('ProfessionalDetailRewamped', { profile, self: true })}>
                <View style={profileUserInfoStyles.serviceContent}>
                    <Image
                        style={profileUserInfoStyles.serviceIcon}
                        source={require('../../../../assets/profile/image.png')}
                    />
                    <Text style={profileUserInfoStyles.serviceText}>
                        {profile.servicesProvided[0]}
                        {profile.servicesProvided.length > 1 && (
                            <Text style={profileUserInfoStyles.moreServicesText}>
                                {` & ${profile.servicesProvided.length - 1} more`}
                            </Text>
                        )}
                    </Text>
                </View>
                <Image
                    source={require('../../../../assets/profile/arrowRight.png')}
                    style={[
                        profileUserInfoStyles.accountTypeImage,
                        { position: 'absolute', right: 0 },
                    ]}
                />
            </TouchableOpacity>
        );
    };

    const handleFollowerFollowingPress = (user: any, type: string) => {
        navigationWithPush.navigate('FollowFollowingRewamp', {
            id: user._id,
            tabName: type,
            username: user.username,
            user: user,
            self: true, // This is self profile
        });
    };

    // Render embedded ProfileUserInfo component
    const renderProfileUserInfo = () => {
        if (!profile) return null;

        const displayName = profile?.accountType === 'professional'
            ? profile?.businessName || profile?.firstName || ''
            : profile?.firstName || '';

        return (
            <View style={profileUserInfoStyles.container}>
                <View style={profileUserInfoStyles.statsContainer}>
                    <TouchableOpacity
                        style={profileUserInfoStyles.statItem}
                        onPress={() => handleFollowerFollowingPress(profile, 'Followers')}>
                        <Text style={profileUserInfoStyles.statNumber}>{followersCount}</Text>
                        <Text style={profileUserInfoStyles.statLabel}>Followers</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={profileUserInfoStyles.profileImageContainer}
                        onPress={handleProfileImagePress}
                    >
                        {profile?.profilePic ? (
                            <Image
                                style={profileUserInfoStyles.profileImage}
                                source={{ uri: profile.profilePic }}
                            />
                        ) : (
                            <View style={profileUserInfoStyles.initialsAvatar}>
                                <Text style={profileUserInfoStyles.initialsText}>
                                    {getInitials(profile?.businessName, profile?.firstName)}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={profileUserInfoStyles.statItem}
                        onPress={() => handleFollowerFollowingPress(profile, 'Following')}>
                        <Text style={profileUserInfoStyles.statNumber}>{profile?.followingCount || 0}</Text>
                        <Text style={profileUserInfoStyles.statLabel}>Following</Text>
                    </TouchableOpacity>
                </View>

                <View style={profileUserInfoStyles.infoContainer}>
                    <Text style={profileUserInfoStyles.name}>{displayName}</Text>
                    <Divider style={profileUserInfoStyles.divider} />
                    {renderBio()}
                    {!isSelfProfile && (
                        <TouchableOpacity
                            style={[
                                profileUserInfoStyles.followButton,
                                isFollowing ? profileUserInfoStyles.followingButton : profileUserInfoStyles.followChip,
                            ]}
                            onPress={followUser}>
                            <Text
                                style={[
                                    profileUserInfoStyles.followButtonText,
                                    isFollowing ? profileUserInfoStyles.followingText : profileUserInfoStyles.followText,
                                ]}>
                                {isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {profile?.accountType === 'professional' && renderServices()}
                </View>
            </View>
        );
    };

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Color.black} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomFAB
                accountType={accountType}
                isOpen={isFabOpen}
                onToggle={() => setIsFabOpen(prev => !prev)}
            />
            
            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContentContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={Color.black}
                    />
                }
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                onScroll={({ nativeEvent }) => {
                    // Only handle pagination for non-posts tabs here
                    // FeedLayout handles its own pagination through onLoadMore
                    if (activeTab !== 'posts') {
                        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                        const paddingToBottom = 200;  // Increase padding to trigger earlier

                        const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

                        if (isEndReached && !tabData[activeTab as keyof typeof tabData].isLoading && tabData[activeTab as keyof typeof tabData].hasMore) {
                            loadMoreData();
                        }
                    }
                }}
                scrollEventThrottle={200}
                maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            >
                {/* Replace ProfileUserInfo component with direct render */}
                {renderProfileUserInfo()}

            <ProfileTabs
                activeTab={activeTab}
                accountType={accountType}
                hasCatalog={tabData.catalog.data.length > 0}
                onTabPress={handleTabPress}
                isLoading={tabData[activeTab as TabKey].isLoading}
            />

            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>

                {/* Only show loading indicator for non-posts tabs */}
                {tabData[activeTab as keyof typeof tabData].isLoading && (
                    <ActivityIndicator size="small" color={Color.black} style={styles.loadingIndicator} />
                )}
            </ScrollView>

            <SharePostToChat
                feed={profile as any}
                openShare={openShare}
                setOpenShare={setOpenShare}
                isProfile={true}
            />
            
            <BottomSheetModal
                isVisible={isModalVisible}
                onClose={() => {
                    setIsModalVisible(false);
                    setSelectedItem(null);
                }}
                saveToggle={handleSaveToCollection}
                post={{
                    _id: selectedItem?._id,
                    title: selectedItem?.caption,
                    url: selectedItem?.contentUrl,
                    contentType: selectedItem?.contentType
                }}
            />

            {/* Profile Picture Popup - moved from ProfileUserInfo */}
            <Modal
                visible={showProfilePopup}
                transparent={true}
                animationType="fade"
                onRequestClose={closeProfilePopup}
            >
                <TouchableWithoutFeedback onPress={closeProfilePopup}>
                    <View style={profileUserInfoStyles.popupOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={profileUserInfoStyles.popupContent}>
                                {profile?.profilePic ? (
                                    <FastImage
                                        style={profileUserInfoStyles.popupImage}
                                        source={{ uri: profile.profilePic }}
                                        resizeMode={FastImage.resizeMode.contain}
                                    />
                                ) : (
                                    <View style={profileUserInfoStyles.popupInitialsContainer}>
                                        <Text style={profileUserInfoStyles.popupInitialsText}>
                                            {getInitials(profile?.businessName, profile?.firstName)}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
    scrollContentContainer: {
        flexGrow: 1,
        width: '100%',
        paddingBottom: 40, // Add some padding at the bottom for better scrolling
    },
    contentContainer: {
        flex: 1,
        // paddingHorizontal: 16,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerLeft: {
        width: 40,
    },
    headerRight: {
        width: 40,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        padding: 8,
    },
    gridWrapperContainer: {
        width: '100%',
        minHeight: 200,
    },
    feedLayoutContainer: {
        width: '100%',
        minHeight: Dimensions.get('window').height * 0.65, // Use min-height instead of fixed height
        overflow: 'visible', // Allow content to be fully displayed
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    loadingIndicator: {
        marginTop: 20,
        marginBottom: 20,
    },
    noDataContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    noDataImage: {
        width: 100,
        height: 100,
        marginBottom: 16,
    },
    noDataText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: Color.black,
    },
    noDataSubText: {
        fontSize: 14,
        color: Color.grey,
    },
    gridItem: {
        width: itemWidth,
        marginBottom: gap,
    },
    skeletonCard: {
        width: itemWidth,
        height: itemWidth,
        backgroundColor: '#E1E9EE',
        borderRadius: 8,
    },
    columnWrapper: {
        marginBottom: gap,
        justifyContent: 'space-between',
    },
    loadMoreButton: {
        padding: 10,
        backgroundColor: Color.black,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    loadMoreText: {
        color: Color.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadMoreButtonGlobal: {
        padding: 10,
        backgroundColor: Color.black,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        marginHorizontal: 16,
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: Color.black,
        fontFamily: FontFamilies.regular,
    },
    loadingIndicatorContainer: {
        padding: 10,
        alignItems: 'center',
        width: '100%',
        height: 60,
    },
});

// Add ProfileUserInfo styles
const profileUserInfoStyles = StyleSheet.create({
    container: {
        backgroundColor: Color.white,
        paddingHorizontal: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statNumber: {
        fontFamily: FontFamilies.semibold,
        fontSize: FontSizes.medium2,
        fontWeight: '400',
        color: Color.black,
        paddingBottom: 10,
    },
    statLabel: {
        fontFamily: FontFamilies.medium,
        fontSize: FontSizes.small,
        fontWeight: '400',
        color: Color.black,
    },
    profileImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 50,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    initialsAvatar: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
    infoContainer: {
        alignItems: 'center',
        marginTop: 16,
        width: '100%',
        minHeight: 100,
    },
    name: {
        fontFamily: FontFamilies.semibold,
        fontSize: FontSizes.medium2,
        fontWeight: '800',
        color: Color.black,
        lineHeight: LineHeights.large,
    },
    divider: {
        width: '80%',
        height: 0.5,
        backgroundColor: '#D9D9D9',
        marginTop: 13,
    },
    bio: {
        marginTop: 10,
        marginHorizontal: 10,
        maxWidth: '90%',
        minHeight: 20,
        fontSize: FontSizes.small,
        lineHeight: LineHeights.medium,
        color: Color.black,
        fontWeight: '400',
        textAlign: 'center',
        fontFamily: FontFamilies.medium,
    },
    moreButtonText: {
        fontSize: FontSizes.small,
        fontFamily: FontFamilies.medium,
        color: Color.grey,
    },
    followButton: {
        width: '90%',
        height: 44,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    followChip: {
        backgroundColor: Color.black,
    },
    followingButton: {
        backgroundColor: '#E5E5E5',
    },
    followButtonText: {
        fontFamily: FontFamilies.semibold,
        fontWeight: '800',
        fontSize: FontSizes.medium,
        color: Color.black,
    },
    followText: {
        color: '#fff',
    },
    followingText: {
        color: Color.black,
    },
    servicesChip: {
        marginTop: 12,
        minWidth: '90%',
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 15,
        backgroundColor: Color.white,
        paddingHorizontal: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    serviceContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    serviceIcon: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    serviceText: {
        fontFamily: FontFamilies.semibold,
        fontWeight: '800',
        fontSize: FontSizes.medium,
        color: Color.black,
    },
    moreServicesText: {
        color: Color.grey,
        fontSize: FontSizes.small,
        fontWeight: '400',
        fontFamily: FontFamilies.medium,
    },
    arrowIcon: {
        width: 20,
        height: 20,
    },
    accountTypeImage: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupContent: {
        width: Dimensions.get('window').width * 0.9,
        height: Dimensions.get('window').width * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupImage: {
        width: '100%',
        height: '100%',
        borderRadius: 0,
    },
    popupInitialsContainer: {
        width: '100%',
        height: '100%',
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
    },
    popupInitialsText: {
        color: '#fff',
        fontSize: 80,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
});

export default ProfileLayout;