import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image'; // FastImage for caching
import BottomSheetModal from './BottomSheetModal';
import {post, del} from '../../../services/dataRequest';
import LoginBottomSheet from '../../commons/loginBottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
// import {formatTime} from '../Home/postVideoPlayer';
import {createVideoThumbnail} from 'react-native-compressor';
import {isEmpty} from 'lodash';
import Toast from 'react-native-toast-message';
import {
  Color,
  FontSizes,
  FontWeights,
  FontFamilies,
  LineHeights,
  LetterSpacings,
} from '../../../styles/constants';
import {useNavigation} from '@react-navigation/native';
import {
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import GetStartedModal from '../../commons/getStartedModal';

const PopularPlaceCard = ({
  id,
  url,
  title,
  liked,
  likesCount,
  saved,
  accountType,
  contentType,
  contentCount,
  isCarousel,
  loading,
  page,
  onPostUpdated,
}: any) => {
  const {width: screenWidth} = Dimensions.get('window');
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likesCount);
  const [isSaved, setIsSaved] = useState(saved);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [cardHeight, setCardHeight] = useState(screenWidth * 0.5); // 80% of screen width for a good aspect ratio
  const opacity = useSharedValue(0.5);
  const [isLandingModalVisible, setIsLandingModalVisible] = useState(false);

  // Sync isLiked state with liked prop
  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  // Sync isSaved state with saved prop
  useEffect(() => {
    setIsSaved(saved);
  }, [saved]);

  // Sync likeCount state with likesCount prop
  useEffect(() => {
    setLikeCount(likesCount);
  }, [likesCount]);

  // Dynamically adjust card height based on title length
  // useEffect(() => {
  //   if (title?.length > 27) {
  //     setCardHeight(245); // Increase height for 2 lines
  //   } else {
  //     setCardHeight(225); // Default height
  //   }
  // }, [title]);

  const updateAsyncStoragePosts = async (updatedPosts: any[]) => {
    if (page == 'profile') {
      await AsyncStorage.setItem(
        'initialProfileData',
        JSON.stringify(updatedPosts),
      );
    } else if (page === 'tags') {
      await AsyncStorage.setItem(
        'tagResultsData',
        JSON.stringify(updatedPosts),
      );
    } else {
      await AsyncStorage.setItem('initialData', JSON.stringify(updatedPosts));
    }
    onPostUpdated(updatedPosts); // Notify parent to update the posts
  };
  const navigation = useNavigation();
  const likePost = async () => {
    if (accountType === 'temp') {
      // setLoginModalVisible(true);
      // navigation.navigate('Landing' as never);
      setIsLandingModalVisible(true);
      return;
    }

    try {
      const response =
        contentType !== 'project'
          ? await post(`ugc/toggle-like/${id}`, {})
          : await post(`project/toggle-like/?projectId=${id}`, {});
          console.log("response :: 116 :: ",response);
      let storedData;
      if (page === 'home') {
        storedData = await AsyncStorage.getItem('initialData');
      } else if (page === 'profile') {
        storedData = await AsyncStorage.getItem('initialProfileData');
      } else if (page === 'tags') {
        storedData = await AsyncStorage.getItem('tagResultsData');
      }

      let posts = storedData ? JSON.parse(storedData) : [];
      const updatedPosts = posts.map((post: any) => {
        if (post._id === id) {
          if (response.message.includes('liked your post.')) {
            return {
              ...post,
              isLiked: true,
              likes: (post.likes || 0) + 1,
            };
          } else if (response.message.includes('unliked the post.')) {
            return {
              ...post,
              isLiked: false,
              likes: post.likes > 0 ? post.likes - 1 : 0,
            };
          }
        }
        return post;
      });
      await updateAsyncStoragePosts(updatedPosts);

      setIsLiked(!isLiked);
      setLikeCount((prev: any) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const savePost = async () => {
    console.log('savePost :: 158 :: ');
    if (accountType === 'temp') {
      // setLoginModalVisible(true);
      // navigation.navigate('Landing' as never);
      setIsLandingModalVisible(true);
      return;
    }

    if (isSaved) {
      unsavePost();
    } else {
      setIsModalVisible(true);
    }
  };

  const unsavePost = async () => {
    if (accountType === 'temp') {
      setIsLandingModalVisible(true);
      return;
    }

    try {
      // Get the posts data first
      let storedData;
      if (page === 'home') {
        storedData = await AsyncStorage.getItem('initialData');
      } else if (page === 'profile') {
        storedData = await AsyncStorage.getItem('initialProfileData');
      } else if (page === 'tags') {
        storedData = await AsyncStorage.getItem('tagResultsData');
      }
      
      console.log('storedData :: 185 :: ', storedData);
      const posts = storedData ? JSON.parse(storedData) : [];
      console.log('posts :: 187 :: ', posts);
      
      const currentPost = posts.find((post: any) => post._id === id);
      console.log('currentPost :: 190 :: ', currentPost);
      
      if (!currentPost?._id) {
        throw new Error('Post not found');
      }

      // Use the del function with the correct endpoint format
      const response = await del(`collections/remove-item/${currentPost._id}`);
      console.log('response :: 198 :: ', response);

      if (response && response.message === 'Item removed from all collections successfully') {
        const updatedPosts = posts.map((post: any) => {
          if (post._id === id) {
            return {
              ...post,
              isSaved: false,
              savedCount: post.savedCount > 0 ? post.savedCount - 1 : 0,
            };
          }
          return post;
        });

        await updateAsyncStoragePosts(updatedPosts);

        setIsSaved(false);
        // Toast.show({
        //   type: 'info',
        //   text1: 'Post Unsaved',
        //   visibilityTime: 1000,
        //   position: 'bottom',
        // });
      } else {
        throw new Error('Failed to unsave the post');
      }
    } catch (error) {
      console.error('Error unsaving post:', error);
      // Toast.show({
      //   type: 'error',
      //   text1: 'Failed to unsave post',
      //   visibilityTime: 2000,
      //   position: 'bottom',
      // });
    }
  };

  const saveToggle = async (params: any) => {
    if (accountType === 'temp') {
      setIsLandingModalVisible(true);
      return;
    }
    console.log('saveToggle :: 223 :: ', params.collectionInfo.contentType);

    try {
      // Convert 'ugc' to 'post' if content type is 'ugc'
      // const itemType = params.collectionInfo.contentType === 'ugc' || params.collectionInfo.contentType === 'video' ? 'post' : params.collectionInfo.contentType;
      const itemType = params.collectionInfo.contentType === 'ugc' ? 'photo' : params.collectionInfo.contentType;
      
      // Use collections/add-item endpoint for both project and post
      const response = await post(`collections/add-item/${params.collectionInfo.collectionId}`, {
        itemId: params.ugcId,
        itemType: itemType
      });
      console.log('response :: 227 :: ', response);

      if (response && response.message === 'Item added to collection successfully') {
        let storedData;
        // showToast();
        if (page === 'home') {
          storedData = await AsyncStorage.getItem('initialData');
        } else if (page === 'profile') {
          storedData = await AsyncStorage.getItem('initialProfileData');
        } else if (page === 'tags') {
          storedData = await AsyncStorage.getItem('tagResultsData');
        }
        let posts = storedData ? JSON.parse(storedData) : [];

        const updatedPosts = posts.map((post: any) => {
          if (post._id === params.ugcId) {
            return {
              ...post,
              isSaved: true,
              savedCount: (post.savedCount || 0) + 1,
            };
          }
          return post;
        });

        await updateAsyncStoragePosts(updatedPosts);

        setIsSaved(true);
      } else {
        throw new Error('Failed to save the post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setIsModalVisible(false); // Close modal after save operation
    }
  };
  const isVideo = contentType === 'video';
  const [duration, setDuration] = useState(0);
  const [thumbnail, setThumbnail] = useState();
  const handleGetThumb = async () => {
    const thumb = await createVideoThumbnail(url);
    setThumbnail(thumb?.path);
  };
  useEffect(() => {
    // handleGetThumb();
  }, []);
  const showToast = () => {
    Toast.show({
      type: 'info',
      text1: 'Post Saved',
      visibilityTime: 1000,
      position: 'bottom',
    });
  };

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, {duration: 500}),
        withTiming(0.5, {duration: 500}),
      ),
      -1,
      true,
    );
  }, []);

  return (
    <View
      style={[
        styles.card,
        {height: cardHeight},
        isCarousel && styles.projectCard,
      ]}>
      {/* Image and Actions */}
      <View style={styles.imageContainer}>
        {contentType === 'project' && (
          <View style={styles.imageCount}>
            <Text style={styles.imageCountText}>1/{contentCount}</Text>
          </View>
        )}
        {isVideo && duration !== 0 ? (
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              height: 22,
              width: 38,
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              top: 10,
              right: 10,
              zIndex: 1,
              borderRadius: 16,
            }}>
            <Text style={styles.imageCountText}>{duration}</Text>
          </View>
        ) : null}

        {/* FastImage to cache and avoid flickering */}
        {isVideo && isEmpty(thumbnail) ? (
          <Video
            style={[styles.image, {borderRadius: 12, overflow: 'hidden'}]}
            paused={true}
            controls={false}
            source={{uri: url}}
            resizeMode="cover"
            onLoad={data => {
              // setDuration(formatTime(data?.duration));
              handleGetThumb();
            }}
          />
        ) : (
          <FastImage
            style={[styles.image, {borderRadius: 12, overflow: 'hidden'}]}
            source={{
              uri:
                contentType !== 'project'
                  ? isVideo
                    ? thumbnail
                    : url
                  : url[0],
            }}
            resizeMode={FastImage.resizeMode.cover}>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color="#1E1E1E" />
              </View>
            )}
          </FastImage>
        )}

        {/* Actions for like and save */}
        {!isCarousel && (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={likePost}>
              <Icon
                name={isLiked ? 'heart' : 'heart-outline'}
                size={14}
                color={isLiked ? 'red' : '#000'}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={savePost}>
              {/* <Icon
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color="#000"
              /> */}
              <Image
                source={
                  isSaved
                    ? require('../../../assets/postcard/saveFillIcons.png') // Path to the bold bookmark image
                    : require('../../../assets/postcard/saveIcon.png') // Path to the outline bookmark image
                }
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Post Title */}
      {/* {!isCarousel && (
        <Text style={styles.postTitle} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>
      )} */}

      {/* Bottom Sheet for Save Post */}
      <BottomSheetModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        saveToggle={saveToggle}
        post={{id, title, url,contentType}}
      />
    {/* Render the GetStartedModal */}
      <GetStartedModal
        visible={isLandingModalVisible}
        onClose={() => setIsLandingModalVisible(false)}
      />
      {/* Login Modal */}
      {loginModalVisible && (
        <LoginBottomSheet
          visible={loginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          showIcon={true}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    // borderRadius: 15,
    overflow: 'hidden',
    // width: '100%',
    height: 225,
    width: '100%',
  },
  projectCard: {
    height: 200,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  imageCount: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    height: 22,
    width: 38,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: 10,
    right: 10,
    zIndex: 1,
    borderRadius: 16,
  },
  imageCountText: {
    fontFamily: FontFamilies.semibold,
    color: Color.black,
    fontWeight: '400',
    fontSize: FontSizes.small,
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  actions: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    right: 1,
  },
  actionButton: {
    padding: 7,
    margin: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 20,
  },
  icon: {
    height: 14,
    width: 14,
    // tintColor: 'ba',
  },
  postTitle: {
    marginTop: 3,
    paddingHorizontal: 5,
    fontSize: FontSizes.small,
    color: Color.black,
    lineHeight: LineHeights.small,
    fontFamily: FontFamilies.medium,
    fontWeight: '400',
    height: '20%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  skeleton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    opacity: 0.7,
  },
});

export default PopularPlaceCard;
