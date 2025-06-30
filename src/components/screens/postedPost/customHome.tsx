/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Modal,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../../services/dataRequest';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import PostCardLayout from '../Home/postCardsLayout';
import CustomFAB from '../../commons/customFAB';
import LoginBottomSheet from '../../commons/loginBottomSheet';
import {useDispatch} from 'react-redux';
import {setCurrentUserId} from '../../../redux/reducers/chatSlice';
import {TapGestureHandler} from 'react-native-gesture-handler';
import {isEmpty} from 'lodash';
import {Color, FontFamilies} from '../../../styles/constants';
import GetStartedModal from '../../commons/getStartedModal';

const CustomHome = () => {
  // Essential states
  const [token, setToken] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const scrollPositionRef = useRef(0);
  const listRef = useRef<any>(null);

  useFocusEffect(
    useCallback(() => {
      // fetchPosts(1, true, false);
      const fetchFreshData = async () => {
        try {
          const data = await get(
            `ugc/get-mixed-ugc?page=1&limit=25`,
            {},
            token,
          );
          if (data?.ugcs) {
            setPosts(data.ugcs);
            await AsyncStorage.setItem('initialData', JSON.stringify(data.ugcs));
            console.log('Fetched fresh data on screen focus',data.ugcs);
          }
        } catch (error) {
          console.error('Error fetching fresh data:', error);
        }
      };

      fetchFreshData();
      // fetchPosts(1, true, false);
    }, [token])
  );

  useEffect(() => {
    fetchToken();
  }, []);
  const dispatch = useDispatch();

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      const account_ = await AsyncStorage.getItem('user');
      const userId = JSON.parse(account_!);
      console.log('userId', userId?._id);
      setCurrentUser(userId?._id);
      setAccountType(accountType_!);
      dispatch(setCurrentUserId(userId?._id));
      if (savedToken) {
        setToken(savedToken);
      } else {
        setToken('No token found');
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
      setToken('Error fetching token');
    }
  }, []);

  const fetchPosts = useCallback(
    async (page = 1, shouldScroll = true, reorderOnRefresh = false) => {
      if (!token) return;

      // If we already have posts and it's not a refresh request, don't fetch again
      if (posts.length > 0 && page === 1 && !reorderOnRefresh) {
        return;
      }

      try {
        setLoading(true);
        const data = await get(
          `ugc/get-mixed-ugc?page=${page}&limit=25`,
          {},
          token,
        );

        setIsFabOpen(false);
        // Handle data based on page and refresh state
        if (page === 1 && reorderOnRefresh) {
          // First page - either initial load or refresh
          const newPosts = reorderOnRefresh
            ? [...data.ugcs].sort(() => Math.random() - 0.5) // Only reorder on manual refresh
            : data.ugcs; // Keep original order for API calls
          setPosts(newPosts);
          await AsyncStorage.setItem('initialData', JSON.stringify(newPosts));
        } else if(page === 1 && !reorderOnRefresh && !shouldScroll) {
          const newPosts = data?.ugcs; // Keep original order for API calls
          setPosts(newPosts);
          await AsyncStorage.setItem('initialData', JSON.stringify(newPosts));
        } else {
          // Pagination - append new data without reordering
          setPosts(prevPosts => {
            const newPosts = [...prevPosts, ...data.ugcs];
            const uniquePosts = newPosts.filter(
              (post, index, self) =>
                index === self.findIndex(p => p._id === post._id),
            );
            AsyncStorage.setItem('initialData', JSON.stringify(uniquePosts));
            return uniquePosts;
          });
        }

        // Handle scroll position
        if (listRef.current && shouldScroll) {
          listRef.current.scrollToOffset({
            offset: scrollPositionRef.current,
            animated: false,
          });
        }

        setPage(page);
        setHasMorePosts(data.ugcs.length === 25);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, posts.length],
  );

  // Manual refresh - with reorder
  const onRefresh = useCallback(() => {
    setHasMorePosts(true);
    fetchPosts(1, true, true);
  }, [fetchPosts]);

  // Load more - no reorder
  const loadMorePosts = useCallback(() => {
    if (!loading && hasMorePosts) {
      fetchPosts(page + 1, true, false);
    }
  }, [loading, hasMorePosts, page, fetchPosts]);

  // Initial load - no reorder
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const restoreState = async () => {
        try {
          const savedPage = await AsyncStorage.getItem('savedPage');
          const savedScroll = await AsyncStorage.getItem('savedScroll');
          const previousRoute = checkPreviousRoute();

          console.log('Previous Route:', previousRoute);
          console.log('Saved Page:', savedPage);
          console.log('Saved Scroll:', savedScroll);

          if (!isActive) return;

          if (previousRoute === 'Other') {
            console.log('Fetching posts because coming from Other route');
            await fetchPosts(1, false, false);
          } else if (savedPage && previousRoute === 'PostDetail') {
            console.log('Restoring scroll position from PostDetail');
            const pageNum = parseInt(savedPage, 10);
            scrollPositionRef.current = parseFloat(savedScroll || '0');
            if (listRef.current) {
              listRef.current.scrollToOffset({
                offset: scrollPositionRef.current,
                animated: false,
              });
            }
          }
        } catch (error) {
          console.error('Error restoring state:', error);
        }
      };

      restoreState();

      return () => {
        isActive = false;
      };
    }, [token, fetchPosts]),
  );

  const navigation = useNavigation();

  const checkPreviousRoute = () => {
    const state = navigation.getState();
    const routes: any = state?.routes;
    const prevRoute = routes[routes.length - 2];

    if (prevRoute && prevRoute.name === 'PostDetail') {
      return 'PostDetail';
    }
    return 'Other';
  };

  const keyForPostCardLayout =
    checkPreviousRoute() === 'PostDetail' ? posts[0]?._id : posts[0]?._id;

  const handlePostUpdated = async (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    await AsyncStorage.setItem('initialData', JSON.stringify(updatedPosts));
  };

  const handleCardPress = (item: any) => {
    if (accountType === 'temp') {
      setIsModalVisible(true);
    } else {
      // Store current state before navigation
      AsyncStorage.setItem('savedPage', page.toString());
      AsyncStorage.setItem('savedScroll', scrollPositionRef.current.toString());
      if (['ugc', 'video'].includes(item?.contentType)) {
        navigation.navigate('PostDetail', {
          feed: item,
          accountType: accountType,
          loggedInUserId: currentUser,
          token: token,
          pageName: 'home',
        });
      } else {
        navigation.navigate('ProjectDetail', {
          feed: item,
          accountType: accountType,
          loggedInUserId: currentUser,
          token: token,
          pageName: 'home',
        });
      }
    }
  };

  const handleSearchPress = () => {
    if (accountType === 'temp') {
      // setLoginModalVisible(true);
    } else {
      navigation.navigate('feedSearchScreen' as never);
    }
  };

  const handleScreenPress = () => {
    setIsFabOpen(false);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Add this new useFocusEffect to refresh data when returning from project detail
  useFocusEffect(
    useCallback(() => {
      const fetchFreshData = async () => {
        try {
          const data = await get(
            `ugc/get-mixed-ugc?page=1&limit=25`,
            {},
            token,
          );
          if (data?.ugcs) {
            setPosts(data.ugcs);
            await AsyncStorage.setItem('initialData', JSON.stringify(data.ugcs));
            console.log('Fetched fresh data on screen focus', data.ugcs);
          }
        } catch (error) {
          console.error('Error fetching fresh data:', error);
        }
      };

      fetchFreshData();
    }, [token])
  );

  return (
    <TouchableWithoutFeedback onPress={handleScreenPress}>
      <SafeAreaView style={styles.container}>
        <GetStartedModal visible={isModalVisible} onClose={handleModalClose} />
        <CustomFAB
          accountType={accountType}
          isOpen={isFabOpen}
          onToggle={() => {
            if (accountType === 'temp') {
              setIsModalVisible(true);
            } else {
              setIsFabOpen(prev => !prev);
            }
          }}
        />
        {/* <PostCardLayout
          ref={listRef}
          posts={posts}
          loading={loading}
          hasMorePosts={hasMorePosts}
          onRefresh={onRefresh}
          loadMorePosts={loadMorePosts}
          handleCardPress={handleCardPress}
          accountType={accountType}
          isCarousel={false}
          key={keyForPostCardLayout}
          onPostUpdated={handlePostUpdated}
          handleSearchPress={handleSearchPress}
          setIsFabOpen={setIsFabOpen}
          page="home"
        /> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: '#FFF',
  },
});

export default CustomHome;
