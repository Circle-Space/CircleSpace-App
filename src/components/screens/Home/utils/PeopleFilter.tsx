import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {getInitials} from '../../../../utils/commonFunctions';
import {get} from '../../../../services/dataRequest.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import { Color, FontFamilies } from '../../../../styles/constants.tsx';

const DEBOUNCE_DELAY = 50; // Debounce delay for search input

// API call function with token
const fetchPeopleAPI = async (
  searchTerm: string,
  page: number,
  token: string,
) => {
  try {
    const data = await get(
      `search/users?query=${searchTerm}&page=${page}&limit=50`,
      {},
      token,
    );
    console.log('data api', data.users);
    return data.users;
  } catch (error) {
    console.error('API fetch error: ', error);
    return [];
  }
};

const PeopleFilter = ({searchTerm}: {searchTerm: string}) => {
  const navigation = useNavigation();
  const [names, setNames] = useState<any[]>([]); // Names state
  const [loading, setLoading] = useState(false); // Loading state
  const [refreshing, setRefreshing] = useState(false); // Refresh state
  const [page, setPage] = useState(1); // Page number for pagination
  const [hasMore, setHasMore] = useState(true); // Check if there are more results to load
  const [token, setToken] = useState('');
  const [currentUser, setCurrentUser] = useState('');

  // Debounce the search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Token setup
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('user');
        const id = JSON.parse(user);
        setCurrentUser(id);
        if (savedToken) {
          setToken(savedToken);
        } else {
          console.error('No token found');
        }
      } catch (error) {
        console.error('Failed to fetch token:', error);
      }
    };
    fetchToken();
  }, []);

  // Trigger the API search call when debounced search term is updated
  useEffect(() => {
    if (debouncedSearchTerm) {
      fetchNames(1, debouncedSearchTerm); // Reset to page 1 for new search
    } else {
      setNames([]); // Clear the list if search term is empty
    }
  }, [debouncedSearchTerm]);

  // Debounce input to avoid multiple API calls while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        setDebouncedSearchTerm(searchTerm.trim());
      } else {
        setNames([]); // Ensure names are cleared
        setHasMore(false); // No further pagination should occur
        setPage(1); // Reset page to 1
      }
    }, DEBOUNCE_DELAY);
  
    return () => {
      clearTimeout(handler); // Cleanup timeout to avoid unnecessary API calls
    };
  }, [searchTerm]);
  
  // Fetch names (API call)
  const fetchNames = async (
    pageNumber: number,
    search: string,
    append = false,
  ) => {
    if (!token || loading) return; // Don't fetch if there's no token or already loading
    setLoading(true);
    try {
      const newNames = await fetchPeopleAPI(search, pageNumber, token);
      console.log('newNames', newNames);
      if (newNames.length === 0 && pageNumber === 1) {
        setNames([]); // Clear names if no data is found on the first page
        setHasMore(false);
      } else {
        setNames(prevNames =>
          append ? [...prevNames, ...newNames] : newNames,
        );
        setHasMore(newNames.length > 0); // Only set hasMore to false if no results are returned
      }
      setPage(pageNumber); // Update the current page
    } catch (error) {
      console.error('Error fetching names:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true); // Reset hasMore
    fetchNames(1, debouncedSearchTerm).finally(() => setRefreshing(false));
  }, [debouncedSearchTerm, token]);

  // Load more data when reaching the end of the list
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchNames(page + 1, debouncedSearchTerm, true); // Increment page number and load more data
    }
  };

  // Optimize rendering by providing item layout details
  const getItemLayout = (_: any, index: number) => ({
    length: 70, // approximate item height
    offset: 70 * index, // cumulative height of previous items
    index,
  });

  const navigateToProfile = (id: any, accountType: any) => {
    console.log('accountType', accountType,id);
    if (id === currentUser?._id) {
      // If it's the user's own profile, navigate through BottomBar
      navigation.navigate('BottomBar', {
        screen: 'ProfileScreen',
        params: {
          isSelf: true
        }
      });
    } else {
      // Check if the profile is personal or professional
      if (accountType === 'professional') {
        // Navigate to business profile screen
        navigation.navigate('otherBusinessScreen', {
          userId: id,
          isSelf: false
        });
      } else {
        // Navigate to personal profile screen
        navigation.navigate('otherProfileScreen', {
          userId: id,
          isSelf: false
        });
      }
    }
  };

  // Render each person item
  const renderItem = ({item}: any) => (
    console.log('item', item),
    <View style={styles.followerItem}>
      <TouchableOpacity onPress={() => navigateToProfile(item?._id, item?.accountType)}>
        {item?.profilePic ? (
          <Image source={{uri: item?.profilePic}} style={styles.avatar} />
        ) : (
          <View style={styles.initialsAvatar}>
            <Text style={styles.initialsText}>
              {getInitials(item?.username)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigateToProfile(item?._id, item?.accountType)}
        style={styles.followerInfo}>
        <Text style={styles.name}>
          {item?.businessName || `${item?.firstName} ${item?.lastName}`}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={names}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          ListEmptyComponent={
            debouncedSearchTerm ? (
              <Text style={styles.noResultsText}>No users found</Text>
            ) : (
              <View /> // Empty view when no search has been made
            )
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#007BFF" />
            ) : null
          }
          getItemLayout={getItemLayout}
          // refreshControl={
          //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          // }
        />
      )}
    </View>
  );
};

export default PeopleFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  followerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
  },
  followerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1E1E',
    fontFamily: FontFamilies.regular,
  },
  username: {
    marginTop: 4,
    fontSize: 11,
    color: '#B9B9BB',
    fontWeight: '400',
    fontFamily: FontFamilies.regular,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
