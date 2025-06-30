/* eslint-disable curly */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {formatDistanceToNow} from 'date-fns';
import {enUS} from 'date-fns/locale';
import LikeSection from './likeSection';
import {useNavigation} from '@react-navigation/native';
import FullScreenImageModal from './fullScreenModal';
import CommentsBottomSheet from './bottomSheet';
import {BottomSheet} from 'react-native-btr';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesomeIcons from 'react-native-vector-icons/FontAwesome';
import {
  post as postRequest,
  del as deleteReq,
} from '../../services/dataRequest';
import SaveSection from './saveSection';
import { Color, FontFamilies } from '../../styles/constants';

const toTitleCase = (str:any) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const isUserLikedPost = (post:any, currentUser:any) => {
  return Array.isArray(post.likedBy) && post.likedBy.includes(currentUser);
};

const PostCard = React.memo(
  ({
    post,
    currentUser,
    handleLikeToggle,
    comingForSinglePost = false,
    accountType,
    showLoginPopup,
  }:any) => {
    const [imageHeight, setImageHeight] = useState(300);
    const [singlePost, setSinglePost] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [liked, setLiked] = useState(false);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFollowing, setIsFollowing] = useState(post.isFollowed || false);
    const [isLoading, setIsLoading] = useState(true);

    const navigation = useNavigation();

    const memoizedPostLiked = useMemo(
      () =>
        post?.liked !== undefined
          ? post.liked
          : isUserLikedPost(post, currentUser),
      [post, currentUser],
    );

    useEffect(() => {
      setLiked(memoizedPostLiked);
    }, [memoizedPostLiked]);

    useEffect(() => {
      if (post.contentUrl) {
        Image.getSize(
          post.contentUrl,
          (width, height) => {
            const screenWidth = Dimensions.get('window').width;
            const scaleFactor = width / screenWidth;
            const calculatedHeight = height / scaleFactor;
            setImageHeight(calculatedHeight);
            setIsSaved(post.isSaved);
            setSinglePost(comingForSinglePost);
          },
          error => console.error("Couldn't get image size:", error),
        );
      }
    }, [post.contentUrl]);

    const handleLike = useCallback(() => {
      if (accountType !== 'temp') {
        // Check accountType to allow/disallow like action
        handleLikeToggle(post._id);
        setLiked(prevLiked => !prevLiked);
      } else {
        showLoginPopup();
        // Handle case where like action is not allowed for 'temp' account type
      }
    }, [handleLikeToggle, post._id, accountType]);

    const handleImagePress = () => setIsModalVisible(true);
    const handleModalClose = () => setIsModalVisible(false);
    const handleProfileNavigation = userId => {
      const screen = currentUser !== userId ? 'OtherUserProfile' : 'Profile';
      navigation.navigate(screen, {userId});
    };

    const toggleCommentsSheet = () => setShowComments(prevState => !prevState);

    const toggleOptions = () => {
      if (accountType == 'temp') {
        showLoginPopup();
      } else {
        setOptionsVisible(prev => !prev);
      }
    };
    const deletePost = async postId => {
      try {
        const response = await deleteReq(`ugc/delete-post`, postId);

        if (!response) {
          throw new Error('Failed to delete the post');
        }
        navigation.navigate('Profile');
        setOptionsVisible(false);

        // Add any additional actions after successful deletion
      } catch (error) {
        console.error('Error deleting post:', error);
        setOptionsVisible(false);
      }
    };

    const deletePostConfirmation = (id: any) => {
      setOptionsVisible(false);
      setIsLoading(true);
      Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this post?',
        [
          {
            text: 'Cancel',
            onPress: () => {
              setIsLoading(false);
            },
            style: 'cancel',
          },
          {text: 'Yes', onPress: () => deletePost(id)},
        ],
        {cancelable: false},
      );
    };

    const savePost = async postData => {
      try {
        const response = await postRequest('ugc/save-ugc', {ugcId: postData});

        if (!response) {
          throw new Error('Failed to save the post');
        }
        if (response.saved) {
          setIsSaved(true);
        } else {
          setIsSaved(false);
        }
        setOptionsVisible(false);
      } catch (error) {
        console.error('Error saving post:', error);
        setOptionsVisible(false);
      }
    };

    const handleFollowUnfollow = async () => {
      try {
        const action = isFollowing ? 'unfollow' : 'follow';
        const response = await postRequest(
          `user/toggle-follow/${post.posterDetails[0]._id}`,
          {},
        );

        if (!response) {
          throw new Error(`Failed to ${action} the user`);
        }

        setIsFollowing(prev => !prev);
      } catch (error) {
        console.error(
          `Error trying to ${isFollowing ? 'unfollow' : 'follow'} the user:`,
          error,
        );
      }
    };

    return (
      <View style={styles.postCard}>
        <Divider />
        <View style={styles.postHeader}>
          <TouchableOpacity
            onPress={() => handleProfileNavigation(post.posterDetails[0]._id)}
            style={styles.userInfo}>
            <Image
              source={{
                uri:
                  post?.posterDetails?.profilePic ||
                  'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
              }}
              style={styles.postAvatar}
            />
            <Text style={styles.postUsername}>
              {toTitleCase(post?.posterDetails?.firstName) ||
                post?.posterDetails?.businessName}{' '}
              {toTitleCase(post?.posterDetails?.lastName)}
            </Text>
          </TouchableOpacity>
          {/* {post.posterDetails[0]._id != currentUser && singlePost && (
          <TouchableOpacity
            style={styles.followButton}
            onPress={handleFollowUnfollow}>
            <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )} */}
          <Text style={styles.postDate}>
            {formatDistanceToNow(new Date(post.createdAt), {locale: enUS})} ago
          </Text>
          {accountType == 'temp' || accountType == '' ? (
            <TouchableOpacity onPress={() => showLoginPopup()}>
              <Icon name="more-vert" size={24} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={toggleOptions}>
              <Icon name="more-vert" size={24} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.postContent}>
          <Text style={styles.postDescription}>{post.caption}</Text>
          {post.contentUrl && (
            <>
              <TouchableOpacity onPress={handleImagePress} activeOpacity={1}>
                <Image
                  source={{uri: post.contentUrl}}
                  style={[styles.postImage, {height: imageHeight}]}
                  resizeMode="contain"
                  onLoadStart={() => setImageLoading(true)}
                  onLoadEnd={() => setImageLoading(false)}
                />
              </TouchableOpacity>
              {imageLoading && (
                <ActivityIndicator
                  style={[styles.imageLoader, {height: imageHeight}]}
                  size="large"
                  color={Color.black}
                />
              )}
            </>
          )}
        </View>
        <Divider />
        <View style={styles.postFooter}>
          {accountType == 'temp' || accountType == '' ? (
            <TouchableOpacity onPress={() => showLoginPopup()}>
              <FontAwesomeIcons
                style={{marginLeft: 10, marginBottom: 10}}
                name={'heart-o'}
                size={20}
                color={'#000'}
              />
            </TouchableOpacity>
          ) : (
            <LikeSection
              initialLikes={Number(post?.likes)}
              liked={liked}
              onLikeToggle={handleLike}
            />
          )}
          {/* <SaveSection postId={post._id} /> */}
        </View>
        <FullScreenImageModal
          visible={isModalVisible}
          imageUrl={post.contentUrl}
          onClose={handleModalClose}
        />
        <BottomSheet
          visible={showComments}
          onBackButtonPress={toggleCommentsSheet}
          onBackdropPress={toggleCommentsSheet}>
          <CommentsBottomSheet
            comments={post.comments}
            onClose={toggleCommentsSheet}
          />
        </BottomSheet>
        <Modal
          transparent={true}
          visible={optionsVisible}
          animationType="slide"
          onRequestClose={toggleOptions}>
          <TouchableOpacity style={styles.modalOverlay} onPress={toggleOptions}>
            <View style={styles.optionsModal}>
              <View style={styles.pillContainer}>
                <View style={styles.pill} />
              </View>
              {post.posterDetails?._id === currentUser && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => deletePostConfirmation(post._id)}>
                  {/* onPress={() => deletePost(post._id)}> */}
                  <Text style={styles.optionText}>Delete Post</Text>
                </TouchableOpacity>
              )}
              {post.posterDetails[0]._id != currentUser && (
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => savePost(post._id)}>
                  <FontAwesomeIcons
                    name={isSaved ? 'bookmark' : 'bookmark-o'}
                    size={20}
                    color="#000"
                    style={styles.icon}
                  />
                  <Text style={styles.optionText}>
                    {isSaved ? 'Unsave Post' : 'Save Post'}
                  </Text>
                </TouchableOpacity>
              )}
              <Divider />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#fff',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  postUsername: {
    fontWeight: 'bold',
    fontFamily: FontFamilies.semibold,
    fontSize: 16,
  },
  followButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: FontFamilies.regular,
  },
  postDate: {
    color: '#888',
    fontSize: 14,
    fontFamily: FontFamilies.regular,
    marginRight: 10,
  },
  postDescription: {
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 20,
  },
  postImage: {
    width: '100%',
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pillContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  pill: {
    width: 60,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
  },
  optionsModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // Adding box shadow for both iOS and Android
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5, // For Android
  },
  optionButton: {
    flexDirection: 'row',
    paddingVertical: 15,
  },
  icon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 18,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default PostCard;
