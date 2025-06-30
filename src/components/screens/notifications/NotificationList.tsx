/* eslint-disable react-native/no-inline-styles */
/* eslint-disable comma-dangle */
/* eslint-disable no-trailing-spaces */
import React, {useCallback, useEffect, useState, memo, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import LikedNotificationCard from './LikedNotificationCard';
import FollowNotificationCard from './FollowNotificationCard';
import CommentNotification from './CommentNotification';
import CircleReviewNotification from './CircleReviewNotification';
import {get} from '../../../services/dataRequest';
import apiEndPoints from '../../../constants/apiEndPoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useKeyboardVisible} from '../../../hooks/useKeyboardVisible';
import NewApplicantNotificationCard from './NewApplicantNotification';
import NewJobsNotificationCard from './NewJobsNotification';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import TagNotificationCard from './TagNotificationCard';

export interface NotificationData {
  accountType?: string;
  postId?: string;
  profilePicture?: string;
  userId?: string;
  userName?: string;
  username?: string;
  isFollowing?: boolean;
  likedByUserId?: any;
  // Circle review specific fields
  circleId?: string;
  circleType?: 'positive' | 'negative';
  giverId?: string;
  giverName?: string;
  review?: string;
  stars?: number;
  // Project specific fields
  projectId?: string;
  thumbnail?: string | string[];
}

export interface Notification {
  __v: number;
  _id: string;
  createdAt: string;
  data: NotificationData;
  isRead: boolean;
  message: string;
  status: string;
  title: string;
  type: string;
  updatedAt: string;
  userId: string;
}

interface Pagination {
  currentPage: number;
  totalNotifications: number;
  totalPages: number;
}

interface NotificationListProps {
  route?: any;
  refreshing?: boolean;
  onRefresh?: () => void;
  navigation?: any;
  onUnreadCountChange?: (count: number) => void;
}

// Memoized notification wrapper component
const NotificationCardWrapper = memo(({children, isRead}: {children: React.ReactNode, isRead: boolean}) => {
  return (
    <View style={{
      backgroundColor: isRead ? 'white' : '#F0F8FF',
      paddingTop: 15,
      paddingBottom: 15,
      width: '100%',
      paddingRight : 15,
      marginBottom: 5,
    }}>
      {children}
    </View>
  );
});

// Memoized empty component
const EmptyComponent = memo(() => (
  <View style={{alignItems: 'center', paddingTop: 40}}>
    <Text style={{fontFamily: 'Roboto-Medium', color: '#888'}}>No notifications yet</Text>
  </View>
));

// Memoized footer component
const FooterComponent = memo(({loading}: {loading: boolean}) => {
  if (!loading) return null;
  
  return (
    <View style={{paddingVertical: 20}}>
      <ActivityIndicator size="small" />
    </View>
  );
});

// Type mapping for notifications to optimize rendering
const NOTIFICATION_COMPONENTS = {
  follow: FollowNotificationCard,
  like: LikedNotificationCard,
  tag: TagNotificationCard,
  mention: LikedNotificationCard,
  comment: CommentNotification,
  job_application: NewApplicantNotificationCard,
  new_jobs: NewJobsNotificationCard,
  new_circle: CircleReviewNotification,
};

const NotificationList: React.FC<NotificationListProps> = ({
  refreshing: externalRefreshing, 
  onRefresh: externalOnRefresh, 
  onUnreadCountChange
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // Track if user has viewed the notifications
  const viewedRef = useRef(false);
  // Track if we need to update read status
  const needsReadUpdateRef = useRef(false);
  // Track the current page for pagination
  const currentPageRef = useRef(1);
  // Prevent duplicate API calls
  const isLoadingRef = useRef(false);
  // Track if all data has been loaded
  const allLoadedRef = useRef(false);
  // Track if component is mounted
  const isMountedRef = useRef(true);
  // Last API call timestamp to prevent rapid firing
  const lastApiCallRef = useRef(0);
  // Interval timer for checking unread notifications
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const isKeyboardVisible = useKeyboardVisible();
  const isFocused = useIsFocused();

  // Add a ref for the FlatList
  const flatListRef = useRef<FlatList>(null);

  // Get token only once and cache it
  const getToken = useCallback(async () => {
    return await AsyncStorage.getItem('userToken');
  }, []);

  // Function to check for unread notifications
  const checkUnreadNotifications = useCallback(async () => {
    try {
      const savedToken = await getToken();
      if (!savedToken) return;
      
      // Use a lightweight API call specifically for unread count
      const res = await get(apiEndPoints.unreadCount, {}, savedToken);
      
      if (res?.unreadCount !== undefined && isMountedRef.current) {
        const newUnreadCount = parseInt(res.unreadCount, 10) || 0;
        setUnreadNotificationCount(newUnreadCount);
        setHasUnreadNotifications(newUnreadCount > 0);
        
        // Notify parent component about unread count
        if (onUnreadCountChange) {
          onUnreadCountChange(newUnreadCount);
        }
      }
    } catch (error) {
      console.log('Error checking unread notifications:', error);
    }
  }, [getToken, onUnreadCountChange]);

  // Function to fetch notifications with optimizations
  const fetchNotifications = useCallback(async (page = 1, shouldReset = false) => {
    try {
      // Prevent API calls if already loading or all data loaded
      if (isLoadingRef.current) return;
      
      // Throttle API calls - only allow calls every 300ms
      const now = Date.now();
      if (now - lastApiCallRef.current < 300) return;
      lastApiCallRef.current = now;
      
      // Check if all data is loaded (for pagination)
      if (page > 1 && allLoadedRef.current) return;
      
      const savedToken = await getToken();
      if (!savedToken) return;
      
      // Set loading ref to prevent duplicate calls
      isLoadingRef.current = true;
      
      // Prevent duplicate loading states
      if (page === 1 && !refreshing) {
        setRefreshing(true);
      } else if (!shouldReset && !loading && page > 1) {
        setLoading(true);
      }
      
      // Store current page in ref for pagination tracking
      currentPageRef.current = page;
      
      const res = await get(apiEndPoints.getNotifications(page, 25), {}, savedToken);
      console.log("res:::::::: fetchNotifications", res);
      
      // If component unmounted during the API call, don't update state
      if (!isMountedRef.current) return;
      
      if (res?.notifications) {
        // Check if we reached the end
        if (res.notifications.length === 0) {
          allLoadedRef.current = true;
          return;
        }
        
        // Batch state updates to prevent multiple renders
        if (page === 1 || shouldReset) {
          allLoadedRef.current = false;
          setNotifications(res.notifications);
        } else {
          // Avoid duplicate notifications
          const newNotificationIds = new Set(res.notifications.map((n: Notification) => n._id));
          setNotifications(prev => {
            const uniquePrevNotifications = prev.filter(n => !newNotificationIds.has(n._id));
            return [...uniquePrevNotifications, ...res.notifications];
          });
        }
        
        setPagination(res.pagination);
        
        // If we've loaded all pages, mark as all loaded
        if (res.pagination && res.pagination.currentPage >= res.pagination.totalPages) {
          allLoadedRef.current = true;
        }
        
        // Calculate unread count efficiently
        const newUnreadCount = res.notifications.filter((n: Notification) => !n.isRead).length;
        setUnreadNotificationCount(newUnreadCount);
        setHasUnreadNotifications(newUnreadCount > 0);
        
        if (onUnreadCountChange) {
          onUnreadCountChange(newUnreadCount);
        }
        
        // If there are unread notifications, mark the view as needing an update
        if (newUnreadCount > 0) {
          viewedRef.current = true;
        }
      }
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      // Wait a bit before allowing new API calls to prevent rapid firing
      setTimeout(() => {
        isLoadingRef.current = false;
      }, 500);
      
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [getToken, onUnreadCountChange, loading, refreshing]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (!refreshing && !isLoadingRef.current) {
      allLoadedRef.current = false;
      fetchNotifications(1, true);
    }
  }, [fetchNotifications, refreshing]);

  // Load next page with optimized pagination
  const handleLoadMore = useCallback(() => {
    // Prevent loading if already loading, refreshing, or all data loaded
    if (loading || refreshing || isLoadingRef.current || allLoadedRef.current) return;
    
    if (pagination && currentPageRef.current < pagination.totalPages) {
      fetchNotifications(currentPageRef.current + 1);
    }
  }, [loading, refreshing, pagination, fetchNotifications]);

  // Mark all notifications as read - only triggered when navigating away
  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      // Only proceed if there are unread notifications and user has viewed them
      if (!hasUnreadNotifications || !viewedRef.current || !needsReadUpdateRef.current) return;
      
      const savedToken = await getToken();
      if (!savedToken) return;
      
      await get(apiEndPoints.readAllNoti, {}, savedToken);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          isRead: true
        }))
      );
      
      setHasUnreadNotifications(false);
      setUnreadNotificationCount(0);
      
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      
      // Reset tracking refs
      viewedRef.current = false;
      needsReadUpdateRef.current = false;
    } catch (error) {
      console.log('Error marking notifications as read:', error);
    }
  }, [getToken, onUnreadCountChange, hasUnreadNotifications]);

  // Setup interval for checking unread notifications every 10 seconds
  useEffect(() => {
    // Clear any existing interval
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Only set up the interval when component is mounted and we're not on the notifications screen
    if (isMountedRef.current && !isFocused) {
      // Initial check
      checkUnreadNotifications();
      
      // Set up the interval (10 seconds = 10000ms)
      checkIntervalRef.current = setInterval(() => {
        if (isMountedRef.current && !isFocused) {
          checkUnreadNotifications();
        }
      }, 10000);
    }
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, [isFocused, checkUnreadNotifications]);

  // Update when external refresh is triggered
  useEffect(() => {
    if (externalRefreshing && !refreshing && !isLoadingRef.current) {
      allLoadedRef.current = false;
      fetchNotifications(1, true);
    }
  }, [externalRefreshing, refreshing, fetchNotifications]);

  // Track when user is viewing notifications
  useEffect(() => {
    if (isFocused && notifications.length > 0 && hasUnreadNotifications) {
      // User is viewing notifications with unread items
      viewedRef.current = true;
    }
  }, [isFocused, notifications.length, hasUnreadNotifications]);
  
  // Detect when user navigates away to mark as read
  useEffect(() => {
    if (isFocused) {
      // User is on the notification screen
      needsReadUpdateRef.current = true;
    } else if (!isFocused && viewedRef.current && needsReadUpdateRef.current) {
      // User navigated away after viewing notifications
      markAllNotificationsAsRead();
    }
  }, [isFocused, markAllNotificationsAsRead]);

  // Add a new effect to scroll to top when notifications are loaded or screen is focused
  useFocusEffect(
    useCallback(() => {
      // Reset refs when screen is focused
      allLoadedRef.current = false;
      isMountedRef.current = true;
      
      // Only fetch if not already loading
      if (!isLoadingRef.current) {
        fetchNotifications(1, true);
      }

      // Scroll to top when the screen is focused
      if (flatListRef.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 100);
      }
      
      return () => {
        // Cleanup when screen loses focus
        isMountedRef.current = false;
      };
    }, [fetchNotifications])
  );

  // Add another effect to scroll to top when notifications change
  useEffect(() => {
    if (notifications.length > 0 && flatListRef.current && isFocused) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }, 100);
    }
  }, [notifications.length, isFocused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear any interval
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    };
  }, []);

  // Render notification item with optimized component selection
  const renderNotificationItem = useCallback(({item}: {item: Notification}) => {
    const NotificationComponent = NOTIFICATION_COMPONENTS[item.type as keyof typeof NOTIFICATION_COMPONENTS];
    
    if (!NotificationComponent) return null;
    
    return (
      <NotificationCardWrapper isRead={item.isRead}>
        <NotificationComponent notification={item} />
      </NotificationCardWrapper>
    );
  }, []);

  // Optimize rendering with key extractor
  const keyExtractor = useCallback((item: Notification) => item._id, []);

  return (
    <View style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <FlatList
        ref={flatListRef}
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={keyExtractor}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={externalOnRefresh || handleRefresh}
            // colors={['#9Bd35A', '#689F38']}
            // tintColor="#689F38"
          />
        }
        ListEmptyComponent={!loading && !refreshing ? <EmptyComponent /> : null}
        ListFooterComponent={<FooterComponent loading={loading && !refreshing} />}
        contentContainerStyle={{
          paddingBottom: isKeyboardVisible ? 300 : 250,
          flexGrow: 1,
          paddingTop: 10,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={30}
        windowSize={15}
        initialNumToRender={8}
        getItemLayout={(data, index) => (
          {length: 100, offset: 100 * index, index}
        )}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
    </View>
  );
};

// Create a memoized version of the component
const MemoizedNotificationList = React.memo(NotificationList);

// Default export for direct usage
export default MemoizedNotificationList;
