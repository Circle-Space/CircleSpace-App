import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    SafeAreaView,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getWithoutToken, post } from '../../../../services/dataRequest';
import { useFocusEffect } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../../styles/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackButton from '../../../commons/customBackHandler';
import { useDispatch, useSelector } from 'react-redux';
import {
    setFollowers,
    setFollowing,
    updateFollowStatus,
    removeFollower,
    setFollowCounts,
    appendFollowers,
    appendFollowing,
} from '../../../../redux/slices/followSlice';
import { updatePostFollowStatus, syncFollowStatus } from '../../../../redux/slices/feedSlice';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { getInitials } from '../../../../utils/commonFunctions';

interface User {
    _id: string;
    username?: string;
    businessName?: string;
    firstName?: string;
    lastName?: string;
    profilePic?: string;
    profilePicture?: string;
    isFollowing: boolean;
    isVerified?: boolean;
    isProfessional?: boolean;
}

const FollowFollowingRewamp = ({ route, navigation }: any) => {
    const { id, tabName, self, user } = route.params;
    const dispatch = useDispatch();
    const {
        followers = [],
        following = [],
        followersCount = 0,
        followingCount = 0,
    } = useSelector((state: any) => state?.follow || {});

    // Add feedState selector to track global follow status changes
    const feedState = useSelector((state: any) => state?.feed || {});

    // Add count loading state
    const [isCountsLoaded, setIsCountsLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState(tabName || 'Followers');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [filteredData, setFilteredData] = useState<User[]>([]);
    const [loggedInUserId, setLoggedInUserId] = useState('');
    const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});
    const [scrollPosition, setScrollPosition] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // Add navigation state tracking
    const [navigationStack, setNavigationStack] = useState<string[]>([]);
    const [currentScreen, setCurrentScreen] = useState<string>('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const fadeAnim = useSharedValue(1);

    // Add transition animation
    const fadeStyle = useAnimatedStyle(() => {
        return {
            opacity: fadeAnim.value,
        };
    });

    // Remove the AsyncStorage route tracking useEffect
    // And replace with simple navigation listener
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            // Cleanup on navigation away
        });
        return unsubscribe;
    }, [navigation]);

    // Handle back navigation with animation
    const handleBackPress = () => {
        if (isTransitioning) return;
        
        setIsTransitioning(true);
        fadeAnim.value = withTiming(0, { 
            duration: 200,
            easing: Easing.ease
        });

        setTimeout(() => {
            navigation.goBack();
            // Fade back in after navigation
            requestAnimationFrame(() => {
                fadeAnim.value = withTiming(1, {
                    duration: 200,
                    easing: Easing.ease
                });
                setIsTransitioning(false);
            });
        }, 200);
    };

    // Ensure activeTab is always in sync with tabName
    useEffect(() => {
        if (tabName && tabName !== activeTab) {
            setActiveTab(tabName);
        }
    }, [tabName]);

    // Initialize filtered data with the correct list based on active tab
    useEffect(() => {
        const currentData = activeTab === 'Followers' ? followers : following;
        setFilteredData(currentData || []);
    }, [activeTab, followers, following]);

    useEffect(() => {
        const getLoggedInUserId = async () => {
            try {
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setLoggedInUserId(user._id);
                }
            } catch (error) {
                console.error('Error getting user data:', error);
            }
        };
        getLoggedInUserId();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const response = await getWithoutToken(`user/get-user-info/${id}`, {});
            if (response?.user) {
                // Only update Redux counts if they're different to avoid unnecessary re-renders
                const newFollowersCount = response.user.followersCount || 0;
                const newFollowingCount = response.user.followingCount || 0;
                
                // Check if counts are different from current Redux state
                if (newFollowersCount !== followersCount || newFollowingCount !== followingCount) {
                    dispatch(setFollowCounts({
                        followers: newFollowersCount,
                        following: newFollowingCount
                    }));
                }
            }
            return response;
        } catch (error) {
            console.error('Error fetching user info:', error);
            return null;
        }
    };

    const fetchList = async (userId: any, type: string, currentPage: number, isRefreshing = false) => {
        // Update endpoint to match the correct structure
        const endpoint = `user/get-user-${type === 'Followers' ? 'followers' : 'following'}/${userId}?page=${currentPage}&limit=20`;
        
        try {
            if (!isRefreshing) setLoading(true);
            const response = await getWithoutToken(endpoint, {});
            if (response && response.status === 200) {
                // Get data from the correct response field
                const dataset = type === 'Followers' ? response.followers : response.following || [];
                
                // Update state based on page number
                if (currentPage === 1) {
                    // First page - replace existing data
                    if (type === 'Followers') {
                        dispatch(setFollowers(dataset));
                        
                        // Only update follower count from this endpoint
                        if (response.followersCount !== undefined) {
                            // Get current following count from Redux
                            const currentFollowingCount = followingCount;
                            
                            // Update counts, preserving the other count
                            dispatch(setFollowCounts({
                                followers: response.followersCount || 0,
                                following: currentFollowingCount
                            }));
                        }
                    } else {
                        dispatch(setFollowing(dataset));
                        
                        // Only update following count from this endpoint
                        if (response.followingCount !== undefined) {
                            // Get current followers count from Redux
                            const currentFollowersCount = followersCount;
                            
                            // Update counts, preserving the other count
                            dispatch(setFollowCounts({
                                followers: currentFollowersCount,
                                following: response.followingCount || 0
                            }));
                        }
                    }
                } else {
                    // Subsequent pages - append data
                    if (type === 'Followers') {
                        dispatch(appendFollowers(dataset));
                    } else {
                        dispatch(appendFollowing(dataset));
                    }
                }

                // Check if we have more data
                const hasMoreData = dataset.length === 20;
                setHasMore(hasMoreData);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error(`Error fetching ${type}:`, error);
            setHasMore(false);
        } finally {
            setLoading(false);
            if (isRefreshing) setRefreshing(false);
        }
    };

    // Initial data fetch for both lists
    const fetchInitialData = async () => {
        setLoading(true);
        setIsCountsLoaded(false); // Reset counts loaded status when fetching
        try {
            await Promise.all([
                fetchList(id, 'Followers', 1),
                fetchList(id, 'Following', 1)
            ]);
            
            // Log user info response
            const userInfoResponse = await fetchUserInfo();
            // If explicit user info fetching fails, still mark counts as loaded
            if (!userInfoResponse) {
                setIsCountsLoaded(true);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
            // Even on error, we should show something rather than perpetual loading
            setIsCountsLoaded(true);
        } finally {
            setLoading(false);
        }
    };

    // Handle pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        setIsCountsLoaded(false); // Reset counts loaded status when refreshing
        setPage(1);
        setHasMore(true);
        await fetchInitialData();
        setRefreshing(false);
    };

    useEffect(() => {
        if (id) {
            // Reset state when id changes
            dispatch(setFollowers([]));
            dispatch(setFollowing([]));
            dispatch(setFollowCounts({
                followers: 0,
                following: 0
            }));
            setPage(1);
            setHasMore(true);
            // Fetch new data
            fetchInitialData();
        }
    }, [id]);

    const unFollowUser = async (userId: any, type: string) => {
        try {
            const isFollowAction = type === 'follow';
            const currentList = activeTab === 'Followers' ? followers : following;
            
            // Create updated user list with optimistic change
            const updatedList = currentList.map((user: User) => {
                if (user._id === userId) {
                    return {
                        ...user,
                        isFollowing: isFollowAction
                    };
                }
                return user;
            });

            // Optimistically update Redux store
            if (activeTab === 'Followers') {
                dispatch(setFollowers(updatedList));
                // Update counts
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: isFollowAction ? followingCount + 1 : followingCount - 1
                }));
            } else {
                dispatch(setFollowing(updatedList));
                // Update counts
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: isFollowAction ? followingCount + 1 : followingCount - 1
                }));
            }

            // Update global follow status in Redux - this will trigger updates in other components
            dispatch(updatePostFollowStatus({
                userId: userId,
                isFollowed: isFollowAction
            }));
            
            // Also sync with feed slice for consistent UI across the app
            dispatch(syncFollowStatus({
                userId: userId,
                isFollowed: isFollowAction
            }));

            // Make API call
            const response = await post(`user/toggle-follow/${userId}`, {});
            
            if (response?.status !== 200) {
                // Revert changes if API fails
                if (activeTab === 'Followers') {
                    dispatch(setFollowers(currentList));
                } else {
                    dispatch(setFollowing(currentList));
                }
                // Revert counts
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: isFollowAction ? followingCount - 1 : followingCount + 1
                }));

                // Revert global follow status
                dispatch(updatePostFollowStatus({
                    userId: userId,
                    isFollowed: !isFollowAction
                }));
                
                // Revert feed slice sync
                dispatch(syncFollowStatus({
                    userId: userId,
                    isFollowed: !isFollowAction
                }));
                
                console.error('Failed to follow/unfollow the user:', response?.message);
            }
        } catch (error) {
            console.error('Error in follow/unfollow action:', error);
            // Revert changes on error
            const currentList = activeTab === 'Followers' ? followers : following;
            if (activeTab === 'Followers') {
                dispatch(setFollowers(currentList));
            } else {
                dispatch(setFollowing(currentList));
            }
            
            // Define isFollowAction for reversion
            const isFollowAction = type === 'follow';
            
            // Revert counts
            dispatch(setFollowCounts({
                followers: followersCount,
                following: type === 'follow' ? followingCount - 1 : followingCount + 1
            }));
            
            // Revert global follow status
            dispatch(updatePostFollowStatus({
                userId: userId,
                isFollowed: !isFollowAction
            }));
            
            // Revert feed slice sync
            dispatch(syncFollowStatus({
                userId: userId,
                isFollowed: !isFollowAction
            }));
        }
    };

    const removeUser = async (userId: any) => {
        try {
            // Create updated followers list without the removed user
            const updatedList = followers.filter((user: User) => user._id !== userId);
            // Optimistically update Redux store
            dispatch(setFollowers(updatedList));
            dispatch(setFollowCounts({
                followers: followersCount - 1,
                following: followingCount
            }));

            // Make API call
            const response = await post(`user/remove-follower/${userId}`, {});
             
            if (response?.status !== 200) {
                // Revert changes if API fails
                dispatch(setFollowers(followers));
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: followingCount
                }));
                console.error('Failed to remove the follower:', response?.message);
            }
        } catch (error) {
            console.error('Error trying to remove the follower:', error);
            // Revert changes on error
            dispatch(setFollowers(followers));
            dispatch(setFollowCounts({
                followers: followersCount,
                following: followingCount
            }));
        }
    };

    const routeToProfile = async (userId: string) => {
        if (!userId) return;
        
        try {
            // Get current logged-in user ID
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const loggedInUser = JSON.parse(userData);
                const isSelfProfile = loggedInUser._id === userId;
                
                navigation.push('OtherUserProfileRewamped', {
                    userId,
                    isSelfProfile
                });
            }
        } catch (error) {
            console.error('Error getting user data:', error);
            // Fallback to default navigation if there's an error
            navigation.push('OtherUserProfileRewamped', {
                userId,
                isSelfProfile: false
            });
        }
    };

    const loadMoreData = () => {
        if (loading || !hasMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchList(id, activeTab, nextPage);
    };

    const handleFollowPress = async (user: User) => {
        if (followLoading[user._id]) return;

        try {
            // Set loading state
            setFollowLoading(prev => ({ ...prev, [user._id]: true }));

            // New follow state
            const newFollowState = !user.isFollowing;

            // Calculate count changes correctly based on the active tab and action
            let newFollowersCount = followersCount;
            let newFollowingCount = followingCount;
            
            // If the current user (profile owner) is following someone
            if (id === loggedInUserId) {
                // When in Following tab and toggling follow/unfollow
                newFollowingCount = newFollowState 
                    ? followingCount + 1 
                    : Math.max(0, followingCount - 1);
            } else {
                // When viewing someone else's profile
                // Only update counts if the action affects the logged-in user
                if (user._id === loggedInUserId) {
                    // This is about the current logged-in user following/unfollowing the profile owner
                    newFollowersCount = newFollowState
                        ? followersCount + 1
                        : Math.max(0, followersCount - 1);
                }
            }

            // Optimistically update UI immediately
            // Update the filtered data (what the user sees)
            setFilteredData(prevData => 
                prevData.map((item: User) => 
                    item._id === user._id 
                        ? { ...item, isFollowing: newFollowState }
                        : item
                )
            );

            // Create updated copies of both lists to ensure consistency
            const updatedFollowers = followers.map((item: User) => 
                item._id === user._id 
                    ? { ...item, isFollowing: newFollowState }
                    : item
            );
            
            const updatedFollowing = following.map((item: User) => 
                item._id === user._id 
                    ? { ...item, isFollowing: newFollowState }
                    : item
            );

            // Dispatch both updates to Redux store
            dispatch(setFollowers(updatedFollowers));
            dispatch(setFollowing(updatedFollowing));
            
            // Update Redux with new counts - immediate UI feedback
            dispatch(setFollowCounts({
                followers: newFollowersCount,
                following: newFollowingCount
            }));
            
            // Set isCountsLoaded to true to ensure counts are displayed
            setIsCountsLoaded(true);
            
            // Update global follow status in Redux - this will trigger updates in other components
            dispatch(updatePostFollowStatus({
                userId: user._id,
                isFollowed: newFollowState
            }));
            
            // Also sync with feed slice for consistent UI across the app - make sure this dispatch happens
            dispatch(syncFollowStatus({
                userId: user._id,
                isFollowed: newFollowState
            }));
            
            // Make API call
            const response = await post(`user/toggle-follow/${user._id}`, {});
            
            if (response?.status === 200) {
                // Always fetch fresh data after API call succeeds to get accurate counts
                const userInfo = await fetchUserInfo();
                
                if (userInfo?.user) {
                    // Update counts with server values
                    dispatch(setFollowCounts({
                        followers: userInfo.user.followersCount || 0,
                        following: userInfo.user.followingCount || 0
                    }));
                }
                
                // Sync the status with all other components using updatePostFollowStatus
                dispatch(updatePostFollowStatus({
                    userId: user._id,
                    isFollowed: newFollowState
                }));
                
                // Also sync with feed slice to ensure consistency
                dispatch(syncFollowStatus({
                    userId: user._id,
                    isFollowed: newFollowState
                }));
            } else {
                // Revert all state if API call fails
                
                // Revert filtered data
                setFilteredData(prevData => 
                    prevData.map((item: User) => 
                        item._id === user._id 
                            ? { ...item, isFollowing: user.isFollowing }
                            : item
                    )
                );
                
                // Revert followers/following lists
                const revertedFollowers = followers.map((item: User) => 
                    item._id === user._id 
                        ? { ...item, isFollowing: user.isFollowing }
                        : item
                );
                
                const revertedFollowing = following.map((item: User) => 
                    item._id === user._id 
                        ? { ...item, isFollowing: user.isFollowing }
                        : item
                );

                dispatch(setFollowers(revertedFollowers));
                dispatch(setFollowing(revertedFollowing));
                
                // Revert count changes
                dispatch(setFollowCounts({
                    followers: followersCount,
                    following: followingCount
                }));
                
                // Revert follow status updates in global state
                dispatch(updatePostFollowStatus({
                    userId: user._id,
                    isFollowed: user.isFollowing
                }));
                
                dispatch(syncFollowStatus({
                    userId: user._id,
                    isFollowed: user.isFollowing
                }));
            }
        } catch (error) {
            console.error('Error in handleFollowPress:', error);
            
            // Revert to original state on error
            setFilteredData(prevData => 
                prevData.map((item: User) => 
                    item._id === user._id 
                        ? { ...item, isFollowing: user.isFollowing }
                        : item
                )
            );
        } finally {
            setTimeout(() => {
                setFollowLoading(prev => ({ ...prev, [user._id]: false }));
            }, 300); // Small delay to ensure UI feels responsive
        }
    };

    // Add a dedicated effect to monitor follow counts from Redux 
    useEffect(() => {
        if (followersCount >= 0 && followingCount >= 0) {
            // Set counts loaded state as soon as we have valid data
            setIsCountsLoaded(true);
        }
    }, [followersCount, followingCount]);

    // Monitor global follow state changes from Redux
    useEffect(() => {
        const currentData = activeTab === 'Followers' ? followers : following;
        
        // If userFollowStatus or lastUpdatedUserId changed, update local data
        if (feedState.lastUpdatedUserId && feedState.userFollowStatus) {
            const updatedUserId = feedState.lastUpdatedUserId;
            const newFollowState = feedState.userFollowStatus[updatedUserId];
            
            // Check if the user that was updated is in our current list
            const updatedData = currentData.map((user: User) => {
                if (user._id === updatedUserId) {
                    // Only update if the status is different
                    if (user.isFollowing !== newFollowState) {
                        return {
                            ...user,
                            isFollowing: newFollowState
                        };
                    }
                }
                return user;
            });
            
            // Update filtered data to reflect changes
            setFilteredData(updatedData);
            
            // Also update the Redux store for the correct tab
            if (activeTab === 'Followers') {
                dispatch(setFollowers(updatedData));
            } else {
                dispatch(setFollowing(updatedData));
            }
        }
    }, [feedState.lastUpdatedUserId, feedState.userFollowStatus, feedState.lastAction]);

    // Improve the useFocusEffect to refresh data more thoroughly
    useFocusEffect(
        useCallback(() => {
            if (id) {
                // Just fetch the updated counts without resetting UI data
                fetchUserInfo().then(() => {
                    // Don't reset isCountsLoaded, keep existing state
                    // Only fetch tab data if we don't already have it
                    if (
                        (activeTab === 'Followers' && followers.length === 0) ||
                        (activeTab === 'Following' && following.length === 0)
                    ) {
                        fetchList(id, activeTab, 1);
                    }
                });
            }
            
            return () => {
                // No need to reset data when leaving screen
            };
        }, [id, activeTab])
    );

    // Optimize the renderItem function to minimize re-renders
    const renderItem = useCallback(({ item: user }: { item: User }) => {
        const isLoading = followLoading[user._id] || false;
        return (
            <View style={styles.followerItem}>
                <TouchableOpacity
                    onPress={() => routeToProfile(user._id)}
                    style={{ flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    {user.profilePic || user.profilePicture ? (
                        <Image
                            source={{ uri: user.profilePic || user.profilePicture }}
                            style={styles.avatar}
                        />
                    ) : (
                        <View style={styles.initialsAvatar}>
                            <Text style={styles.initialsText}>
                                {getInitials(user.username)}
                            </Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.username}>
                            {user.businessName || user.username || ''}
                            {user.isVerified && (
                                <Image
                                    source={require('../../../../assets/images/verified-tick.png')}
                                    style={styles.verifiedBadge}
                                />
                            )}
                        </Text>
                        {user.isProfessional && (
                            <Text style={styles.professionalText}>Professional</Text>
                        )}
                    </View>
                </TouchableOpacity>
                {user._id !== loggedInUserId && (
                    <TouchableOpacity
                        onPress={() => handleFollowPress(user)}
                        style={[
                            styles.followButton,
                            user.isFollowing ? styles.followingButton : null,
                        ]}
                        disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={user.isFollowing ? "#000" : "#fff"} />
                        ) : (
                            <Text
                                style={[
                                    styles.followButtonText,
                                    user.isFollowing ? styles.followingButtonText : null,
                                ]}>
                                {user.isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        );
    }, [followLoading, loggedInUserId, handleFollowPress, routeToProfile]);

    // Update filtered data when search text or Redux state changes
    useEffect(() => {
        const currentData = activeTab === 'Followers' ? followers : following;
        
        if (searchText.trim() === '') {
            // Just use the current data directly from Redux
            setFilteredData(currentData);
        } else {
            // Apply search filter
            const filtered = currentData.filter((item: any) => {
                const fullName = `${item?.firstName || ''} ${item?.lastName || ''}`.toLowerCase();
                const businessName = item?.businessName?.toLowerCase() || '';
                const username = item?.username?.toLowerCase() || '';

                return (
                    fullName.includes(searchText.toLowerCase()) ||
                    businessName.includes(searchText.toLowerCase()) ||
                    username?.includes(searchText.toLowerCase())
                );
            });
            setFilteredData(filtered);
        }
    }, [
        searchText, 
        followers, 
        following, 
        activeTab, 
        followersCount, 
        followingCount,
        // Add dependency on feed state to re-filter when global follow state changes
        feedState.userFollowStatus,
        feedState.lastUpdatedUserId,
        feedState.lastAction
    ]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setScrollPosition(offsetY);
    };

    // Save scroll position when component unmounts
    useEffect(() => {
        return () => {
            // Save the current scroll position and page to AsyncStorage
            AsyncStorage.setItem(`followScroll_${id}_${activeTab}`, JSON.stringify({
                position: scrollPosition,
                page: page
            }));
        };
    }, [scrollPosition, page, id, activeTab]);

    // Restore scroll position when component mounts
    useEffect(() => {
        const restoreScrollPosition = async () => {
            try {
                const savedState = await AsyncStorage.getItem(`followScroll_${id}_${activeTab}`);
                if (savedState) {
                    const { position, page: savedPage } = JSON.parse(savedState);
                    setPage(savedPage);
                    setScrollPosition(position);
                    // Scroll to the saved position after a short delay to ensure the list is rendered
                    setTimeout(() => {
                        flatListRef.current?.scrollToOffset({ offset: position, animated: false });
                    }, 100);
                }
            } catch (error) {
                console.error('Error restoring scroll position:', error);
            }
        };
        restoreScrollPosition();
    }, [id, activeTab]);

    // Handle tab change
    const handleTabChange = (newTab: string) => {
        if (newTab === activeTab) return;
        
        // Just update the active tab without resetting any data
        setActiveTab(newTab);
        
        // Update filtered data based on the selected tab, but don't trigger a new fetch
        const currentData = newTab === 'Followers' ? followers : following;
        if (searchText.trim() === '') {
            setFilteredData(currentData);
        } else {
            // Apply filter if search is active
            const filtered = currentData.filter((item: any) => {
                const fullName = `${item?.firstName || ''} ${item?.lastName || ''}`.toLowerCase();
                const businessName = item?.businessName?.toLowerCase() || '';
                const username = item?.username?.toLowerCase() || '';
                return (
                    fullName.includes(searchText.toLowerCase()) ||
                    businessName.includes(searchText.toLowerCase()) ||
                    username?.includes(searchText.toLowerCase())
                );
            });
            setFilteredData(filtered);
        }
    };

    // Add a monitor for follow count changes to ensure UI is always consistent
    useEffect(() => {
        // Update UI when Redux state for counts changes
        const currentData = activeTab === 'Followers' ? followers : following;
        setFilteredData(currentData);
    }, [followers, following, activeTab, followersCount, followingCount]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBackPress}>
                        <Ionicons name="chevron-back" size={24} color={Color.black} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{user?.username || ''}</Text>
                    <View style={styles.backButton} />
                </View>
                <Animated.View style={[styles.mainContent, fadeStyle]}>
                <View style={styles.tabs}>
                    <TouchableOpacity onPress={() => handleTabChange('Followers')}>
                        <Text
                            style={activeTab === 'Followers' ? styles.tabActive : styles.tab}>
                                Followers ({followersCount})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleTabChange('Following')}>
                        <Text
                            style={activeTab === 'Following' ? styles.tabActive : styles.tab}>
                                Following ({followingCount})
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#81919E" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        placeholder="Search"
                        placeholderTextColor="#828282"
                        value={searchText}
                        textAlignVertical="center"
                        onChangeText={text => setSearchText(text)}
                        autoCapitalize="none"
                    />
                </View>
                {loading && page === 1 ? (
                    <ActivityIndicator size="large" color={Color.black} />
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={filteredData}
                        renderItem={renderItem}
                        keyExtractor={(item: any) =>
                            item?._id?.toString() || Math.random().toString()
                        }
                        showsVerticalScrollIndicator={false}
                        onEndReached={loadMoreData}
                        onEndReachedThreshold={0.5}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                            contentContainerStyle={styles.listContent}
                            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                        ListFooterComponent={
                            hasMore && loading ? (
                                    <View style={styles.footerLoader}>
                                        <ActivityIndicator size="small" color={Color.black} />
                                    </View>
                            ) : null
                        }
                        extraData={[filteredData, followersCount, followingCount]}
                    />
                )}
                </Animated.View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    backButton: {
        width: 24,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: FontFamilies.semibold,
        color: Color.black,
        textAlign: 'center',
        flex: 1,
        marginHorizontal: 10,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
        borderBottomColor: '#F2F2F2',
        borderBottomWidth: 2,
        paddingHorizontal: 20,
    },
    tabActive: {
        fontSize: 14,
        fontWeight: '400',
        color: '#130F26',
        fontFamily: FontFamilies.semibold,
        borderBottomColor: '#121212',
        borderBottomWidth: 2,
        paddingBottom: 5,
    },
    tab: {
        fontSize: 14,
        color: '#81919E',
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F3F3',
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 20,
        marginHorizontal: 20,
        height: 46,
        ...Platform.select({
            ios: {
                paddingVertical: 10,
            },
            android: {
                paddingVertical: 0,
            },
        }),
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 13,
        fontWeight: '400',
        color: '#81919E',
    },
    followerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        // marginBottom: 16,
        paddingHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 25,
        marginRight: 15,
    },
    initialsAvatar: {
        width: 36,
        height: 36,
        borderRadius: 25,
        backgroundColor: Color.black,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    initialsText: {
        color: Color.white,
        fontSize: 16,
        top: 2,
        fontWeight: '400',
        fontFamily: FontFamilies.regular,
    },
    username: {
        fontSize: 14,
        fontWeight: '500',
        color: '#130F26',
        fontFamily: FontFamilies.medium,
        marginBottom: 2,
    },
    professionalText: {
        fontSize: 12,
        color: '#81919E',
        fontFamily: FontFamilies.regular,
    },
    followButton: {
        backgroundColor: Color.black,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    followingButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    followButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: FontFamilies.medium,
    },
    followingButtonText: {
        color: '#000',
    },
    verifiedBadge: {
        width: 16,
        height: 16,
        marginLeft: 4,
    },
    mainContent: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 80,
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});

export default FollowFollowingRewamp;