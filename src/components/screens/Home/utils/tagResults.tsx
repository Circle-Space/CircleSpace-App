/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState, useRef} from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from '../../../../services/dataRequest';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native'; // Import useRoute for accessing params
import PostCardLayout from '../../Home/postCardsLayout';
import LoginBottomSheet from '../../../commons/loginBottomSheet';
import CustomHeader from './CustomHeader';
import { RouteProp } from '@react-navigation/native';
import { FontFamilies } from '../../../../styles/constants';
type customProp = RouteProp<
  {TagResultsScreen: {query: any}},
  'TagResultsScreen'
>;

const TagResultsScreen = () => {
  const route = useRoute<customProp>(); // Access route params
  const {query} = route.params; // Destructure query parameter from route
  const [token, setToken] = useState('');
  const [searchTerm, setSearchTerm] = useState(query);
  const [posts, setPosts] = useState<any[]>([]);
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [restoreScroll, setRestoreScroll] = useState(true); // New state to trigger scroll restore

  const scrollPositionRef = useRef(0); // Ref to store scroll position
  const listRef = useRef<any>(null); // Ref for the FlashList

  useEffect(() => {
    fetchToken();
  }, []);

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      const account_ = await AsyncStorage.getItem('user');
      const userId = JSON.parse(account_!);
      setCurrentUser(userId?._id);
      setAccountType(accountType_!);
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
    async (page = 1, shouldScroll = true) => {
      if (!token || !query) {
        // Ensure query is available
        return;
      }
      setLoading(true);
      try {
        console.log(searchTerm);
        const data = await get(
          'search/tags',
          {query: searchTerm, page, limit: 100},
          token,
        );
        const storedData = await AsyncStorage.getItem('tagResultsData');
        const currentPosts = storedData ? JSON.parse(storedData) : [];
        let combinedPosts =
          page === 1 ? data.ugcs : [...currentPosts, ...data.ugcs];
        const uniquePosts = combinedPosts.filter(
          (post: any, index: any, self: any) =>
            index === self.findIndex((p: any) => p._id === post._id),
        );
        
        await AsyncStorage.setItem(
          'tagResultsData',
          JSON.stringify(uniquePosts),
        );

        const updatedStoredData = await AsyncStorage.getItem('tagResultsData');
        const updatedPosts = updatedStoredData
          ? JSON.parse(updatedStoredData)
          : [];

        console.log('updated post  :: 100 ::', updatedPosts);


        setPosts(updatedPosts);

        if (listRef.current && shouldScroll) {
          listRef.current.scrollToOffset({
            offset: scrollPositionRef.current,
            animated: false,
          });
        }

        setPage(page);
        setHasMorePosts(data.ugcs.length === 100);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token, query], // Include query as a dependency
  );

  // When the component is focused, restore scroll and page
  useFocusEffect(
    useCallback(() => {
      console.log('108 ::');

      const restoreState = async () => {
        const savedPage = await AsyncStorage.getItem('savedTagResultPage');
        const savedScroll = await AsyncStorage.getItem('savedScrollTagResults');
        setRestoreScroll(true);

        if (savedPage) {
          setPage(parseInt(savedPage, 10));
          scrollPositionRef.current = parseFloat(savedScroll || '0'); // Restore the scroll position
          await fetchPosts(parseInt(savedPage, 10), false); // Load the right page
        } else {
          await fetchPosts(1); // Load the first page if no state saved
        }
      };

      restoreState();
      return () => {};
    }, [token, query, fetchPosts]), // Include query as a dependency
  );

  const onRefresh = useCallback(() => {
    setHasMorePosts(true);
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      fetchPosts(page + 1);
    }
  };

  const navigation = useNavigation();
  const [loginModalVisible, setLoginModalVisible] = useState(false);

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

  // Handle post updates from PostCardLayout
  const handlePostUpdated = async (updatedPosts: any[]) => {
    setPosts(updatedPosts);
    await AsyncStorage.setItem('tagResultsData', JSON.stringify(updatedPosts));
  };

  const handleCardPress = (item: any) => {
    if (accountType === 'temp') {
      setLoginModalVisible(true);
    } else {
      // Save the current page and scroll position before navigating away
      AsyncStorage.setItem('savedTagResultPage', page.toString());
      AsyncStorage.setItem(
        'savedScrollTagResults',
        scrollPositionRef.current.toString(),
      );

      if (item.contentType === 'post') {
        navigation.push('PostDetail', {
          feed: item,
          accountType: accountType,
          loggedInUserId: currentUser,
          token: token,
          pageName: 'tags',
        });
      } else {
        navigation.navigate('ProjectDetail', {
          feed: item,
          accountType: accountType,
          loggedInUserId: currentUser,
          token: token,
          pageName: 'tags',
        });
      }
    }
  };

  const handleScroll = (event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={searchTerm} />
      <PostCardLayout
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
        onScroll={handleScroll}
        page="tags"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#FFF',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 15,
    width: '100%',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    maxWidth: '95%',
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: '#828282',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#81919E',
    fontSize: 13,
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
  },
});

export default TagResultsScreen;
