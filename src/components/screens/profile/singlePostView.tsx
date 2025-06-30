/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '../postCart'; // Corrected import assuming this is your existing PostCard component
import {post} from '../../../services/dataRequest'; // Adjust import path for post function
import LoginBottomSheet from '../../commons/loginBottomSheet';

const SinglePostView = ({route, navigation}) => {
  const {post: initialPost} = route.params;
  const [currentUser, setCurrentUser] = useState('');
  const [accountType, setAccountType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [token, setToken] = useState('');
  const [postState, setPostState] = useState(initialPost);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accountType_ = await AsyncStorage.getItem('accountType');
        const user = await AsyncStorage.getItem('user');
        const userId = JSON.parse(user)._id;
        const userToken = await AsyncStorage.getItem('userToken');
        setCurrentUser(userId);
        setAccountType(accountType_);
        setToken(userToken);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLikeToggle = async (postId: any) => {
    if (accountType === 'temp' || accountType === '') {
      setModalVisible(true);
      return;
    }

    // Optimistically update the post's liked status
    const isUserLikedPost = (post: any, currentUser: any) => {
      return Array.isArray(post.likedBy) && post.likedBy.includes(currentUser);
    };

    // Update post state
    setPostState((prevPost: any) => ({
      ...prevPost,
      liked:
        prevPost.liked !== undefined
          ? prevPost.liked
          : isUserLikedPost(prevPost, currentUser),
    }));

    console.log('Single VIew : ', JSON.stringify(postState));

    try {
      const response = await post(`ugc/toggle-like/${postId}`, {}, token);
      if (response && response.status === 200) {
        // Handle successful response if needed
        console.log(response);
      } else {
        // Revert the optimistic update if the server response indicates an error
        setPostState((prevPost: any) => ({
          ...prevPost,
          liked: !prevPost.liked,
        }));
        Alert.alert('Error', 'Failed to toggle like. Please try again.');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert the optimistic update if the request fails
      setPostState((prevPost: any) => ({
        ...prevPost,
        liked: !prevPost.liked,
      }));
      Alert.alert('Error', 'Failed to toggle like. Please try again.');
    }
  };

  const showLoginPopup = () => {
    setModalVisible(true);
  };

  const openLogin = async () => {
    setModalVisible(!modalVisible);
    await AsyncStorage.clear();
    navigation.reset({
      index: 0,
      routes: [{name: 'Login'}] as never,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <PostCard
          post={postState}
          currentUser={currentUser}
          handleLikeToggle={handleLikeToggle}
          accountType={accountType}
          comingForSinglePost={true}
          showLoginPopup={showLoginPopup}
        />
      </View>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    gap:10,
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
    fontFamily: 'Gilroy-ExtraBold',
  },
});

export default SinglePostView;
