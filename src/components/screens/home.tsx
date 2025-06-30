/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from '@react-navigation/native';
import {get, post} from '../../services/dataRequest';
import {FlashList} from '@shopify/flash-list';
import PostCard from './postCart'; // Adjust the import path as needed
import CustomAlertModal from '../commons/customAlert';
import LoginBottomSheet from '../commons/loginBottomSheet';
import {FontFamilies} from '../../styles/constants';
import {useDispatch} from 'react-redux';
import {setCurrentUserId} from '../../redux/reducers/chatSlice';

const Home = () => {
  const [token, setToken] = useState('');
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    fetchToken();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserdetails();
    }, []),
  );
  const dispatch = useDispatch();
  async function fetchUserdetails() {
    const accountType_ = await AsyncStorage.getItem('accountType');
    const account_ = await AsyncStorage.getItem('user');
    const userId = JSON.parse(account_!);
    setCurrentUser(userId?._id);
    setAccountType(accountType_!);
  }
  const [accountType, setAccountType] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const accountType_ = await AsyncStorage.getItem('accountType');
      const account_ = await AsyncStorage.getItem('user');
      const userId = JSON.parse(account_!);
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
    async (page = 1) => {
      if (!token) return;
      setLoading(true);
      try {
        const data = await get(`ugc/get-ugc?page=${page}&limit=10`, {}, token);
        setPosts((prevPosts: any[]) =>
          page === 1 ? data.ugcs : [...prevPosts, ...data.ugcs],
        );
        setPage(page);
        setHasMorePosts(data.ugcs.length === 10);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchPosts();
  }, [token, fetchPosts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMorePosts(true);
    fetchPosts(1).then(() => setRefreshing(false));
  }, [fetchPosts]);

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      fetchPosts(page + 1);
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const openLogin = async () => {
    setModalVisible(!modalVisible);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('accountType');
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}] as never,
    });
  };
  const handleLikeToggle = async (postId: any) => {
    if (accountType === 'temp') {
      setModalVisible(true);
    } else {
      // Optimistically update the post's liked status
      setPosts((prevPosts: any[]) =>
        prevPosts.map((post: any) =>
          post._id === postId ? {...post, liked: !post.liked} : post,
        ),
      );
      try {
        const response = await post(`ugc/toggle-like/${postId}`, {}, token);

        // Handle successful response as needed
      } catch (error) {
        console.error('Error toggling like:', error);

        // Revert the optimistic update if the server request fails
        setPosts((prevPosts: any[]) =>
          prevPosts.map((post: any) =>
            post._id === postId ? {...post, liked: !post.liked} : post,
          ),
        );
      }
    }
  };

  const renderItem = ({item}: {item: any}) => (
    <PostCard
      post={item}
      currentUser={currentUser}
      handleLikeToggle={handleLikeToggle}
      accountType={accountType}
      showLoginPopup={showLoginPopup}
    />
  );
  const showLoginPopup = () => {
    setModalVisible(true);
  };
  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E1E1E']}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          loading && hasMorePosts ? (
            <ActivityIndicator size="large" color="#1E1E1E" />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsText}>No posts available</Text>
            </View>
          )
        }
        contentContainerStyle={styles.postListContainer}
      />
      {/* <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}>
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Please login to access this feature!
              </Text>
              <TouchableOpacity style={styles.modalButton} onPress={openLogin}>
                <Text style={styles.modalButtonText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal> */}
      <TouchableWithoutFeedback
        onPress={() => {
          setModalVisible(!modalVisible);
        }}>
        <LoginBottomSheet
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
          }}
          showIcon={true}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postListContainer: {
    // paddingVertical: 10,
    paddingBottom: 100,
  },
  loader: {
    marginVertical: 10,
    alignItems: 'center',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noPostsText: {
    fontSize: 18,
    color: '#888',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  modalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: FontFamilies.semibold,
  },
});

export default Home;
