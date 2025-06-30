/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { getWithoutToken } from '../../../services/dataRequest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Color, FontFamilies } from '../../../styles/constants';

const FollowersList = ({ route }) => {
  const navigation = useNavigation();
  const [currentUser, setCurrentUser] = useState('');
  const [followingData, setFollowingData] = useState({
    followers: [],
    currentPage: 1,
    totalPages: 1,
    totalFollowers: 0,
  });
  const [loading, setLoading] = useState(false);

  const useridTobeFetched = route.params.userId || '';

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const account_ = await AsyncStorage.getItem('user');
      const userId = JSON.parse(account_!);
      setCurrentUser(userId?._id);
      if (savedToken) {
        await fetchFollowingList(useridTobeFetched, 1);
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, [useridTobeFetched]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const fetchFollowingList = async (userid, page) => {
    try {
      setLoading(true);
      const response = await getWithoutToken(`user/get-user-followers/${userid}?page=${page}&limit=20`, {});
      if (response && response.status === 200) {
        setFollowingData(prevData => ({
          ...response,
          followers: page === 1 ? response.followers : [...prevData.followers, ...response.followers],
        }));
      } else {
        console.error('Error fetching list:', response);
      }
    } catch (error) {
      console.error('Error fetching list:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (followingData.currentPage < followingData.totalPages) {
      const nextPage = followingData.currentPage + 1;
      fetchFollowingList(useridTobeFetched, nextPage);
    }
  };
  const handleProfileNavigation = userId => {
    const screen = currentUser !== userId ? 'OtherUserProfile' : 'Profile';
    navigation.navigate(screen, {userId});
  };

  // const handleProfileNavigation = (userId : any) => {

  //   navigation.navigate('OtherUserProfile', { userId });
  // };

  const renderSeparator = () => (
    <View style={styles.separator} />
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleProfileNavigation(item.userId)}>
      <Image
        source={{
          uri:
            item.profilePic ||
            'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
        }}
        style={styles.profilePic}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>
          {item.firstName && item.lastName ? `${item.firstName} ${item.lastName}` : item.businessName}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>

      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (loading && followingData.currentPage === 1 && followingData.followers.length === 0) {
      // Initial loading indicator
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={Color.black} />
        </View>
      );
    } else if (loading) {
      // Footer loading indicator for subsequent loads
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={Color.black} />
        </View>
      );
    } else if (followingData.followers.length === 0) {
      // Empty list message
      return (
        <View style={styles.loaderContainer}>
          <Text>No accounts followed.</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={followingData.followers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={renderSeparator}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    width: '100%',
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  infoContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  username: {
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    color: '#666',
    marginTop: 4,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loader: {
    marginVertical: 20,
    alignSelf: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#CED0CE',
    width: '100%',
  },
});

export default FollowersList;
