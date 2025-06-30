import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
  FlatList,
  ViewToken,
  StatusBar,
  Animated
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Color, FontFamilies, FontSizes} from '../../../styles/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {post} from '../../../services/dataRequest';
import {handleShareVideo, handleSinglePostShare} from '../jobs/utils/utils';
import Entypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import PostVideoPlayer from './postVideoPlayer';
import {Post, RouteParams} from '../../../types/Posttype';



const SinglePostScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {feed, accountType, loggedInUserId, token, pageName, userId, initialIndex = 0} = (route?.params as RouteParams) || {};
  const [posts, setPosts] = useState<Post[]>(Array.isArray(feed) ? feed : [feed]);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Add states for double tap like animation
  const [lastTap, setLastTap] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const heartScale = useRef(new Animated.Value(0)).current;
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const likePost = async (postId: string, index: number) => {
    if (accountType === 'temp') {
      Alert.alert('Please login');
      return;
    }

    try {
      const response = await post(`ugc/toggle-like/${postId}`, {});
      const updatedPosts = [...posts];
      const currentPost = {...updatedPosts[index]};
      
      if (response.message === 'UGC liked successfully.') {
        currentPost.isLiked = true;
        currentPost.likes += 1;
      } else if (response.message === 'UGC unliked successfully.') {
        currentPost.isLiked = false;
        currentPost.likes = Math.max(0, currentPost.likes - 1);
      }
      
      updatedPosts[index] = currentPost;
      setPosts(updatedPosts);

      // Update in AsyncStorage
      const storedData = await AsyncStorage.getItem('initialData');
      let storedPosts = storedData ? JSON.parse(storedData) : [];
      
      const updatedStoredPosts = storedPosts.map((post: Post) => {
        if (post._id === postId) {
          return {
            ...post,
            isLiked: currentPost.isLiked,
            likes: currentPost.likes,
          };
        }
        return post;
      });

      await AsyncStorage.setItem('initialData', JSON.stringify(updatedStoredPosts));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const savePost = async (postId: string, index: number) => {
    if (accountType === 'temp') {
      Alert.alert('Please login');
      return;
    }

    try {
      const updatedPosts = [...posts];
      const currentPost = {...updatedPosts[index]};

      if (currentPost.isSaved) {
        const response = await post('ugc/unsave-ugc', {ugcId: postId});
        if (response.message === 'UGC Unsaved Successfully.') {
          currentPost.isSaved = false;
          currentPost.savedCount = Math.max(0, currentPost.savedCount - 1);
        }
      } else {
        const response = await post('ugc/save-ugc', {ugcId: postId});
        if (response.message === 'UGC Saved Successfully.') {
          currentPost.isSaved = true;
          currentPost.savedCount += 1;
        }
      }

      updatedPosts[index] = currentPost;
      setPosts(updatedPosts);

      // Update in AsyncStorage
      const storedData = await AsyncStorage.getItem('initialData');
      let storedPosts = storedData ? JSON.parse(storedData) : [];
      
      const updatedStoredPosts = storedPosts.map((post: Post) => {
        if (post._id === postId) {
          return {
            ...post,
            isSaved: currentPost.isSaved,
            savedCount: currentPost.savedCount,
          };
        }
        return post;
      });

      await AsyncStorage.setItem('initialData', JSON.stringify(updatedStoredPosts));
    } catch (error) {
      console.error('Error saving/unsaving post:', error);
    }
  };

  const handleShare = (post: Post) => {
    const isVideo = post.contentType === 'video';
    if (isVideo) {
      handleShareVideo(post);
    } else {
      handleSinglePostShare(post);
    }
  };

  const onViewableItemsChanged = ({viewableItems}: {viewableItems: ViewToken[]}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  };

  const handleDoubleTap = (postId: string, index: number) => {
    likePost(postId, index);
    setLiked(true);
    // Animate the heart
    Animated.spring(heartScale, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.spring(heartScale, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        setLiked(false);
      }, 1000);
    });
  };

  const handleTap = async (item: Post, index: number) => {
    console.log('item', item);
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      handleDoubleTap(item._id, index);
    } else {
      setLastTap(now);
    }
    const account_ = await AsyncStorage.getItem('user');
    const userId = JSON.parse(account_!);
    console.log('userId', userId._id);
    // Send only the tapped post details
    navigation.navigate('PhotoVideoScroll', {
      feed: item, // Single post details
      accountType: accountType,
      loggedInUserId: userId._id,
      token: token,
      page:'profile',
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <Icon name="chevron-left" size={20} color={'#1E1E1E'} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {posts[currentIndex]?.posterDetails[0]?.username || 
         posts[currentIndex]?.posterDetails[0]?.businessName || 
         'User'}
      </Text>
      <TouchableOpacity
        onPress={() => {}}
        style={styles.menuButton}>
        <Entypo name="dots-three-vertical" size={15} color={'#1E1E1E'} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({item, index}: {item: Post; index: number}) => {
    const isVideo = item.contentType === 'video';

    return (
      <View style={styles.postContainer}>
        <View style={styles.mediaContainer}>
          {isVideo ? (
            <View style={styles.videoContainer}>
              <PostVideoPlayer
                feed={item}
                callBack={(currentTime: number) => {
                  console.log('currentTime', currentTime);
                  // Send only the current video post details
                  navigation.navigate('PhotoVideoScroll', {
                    feed: item, // Single post details
                    accountType: accountType,
                    loggedInUserId: loggedInUserId,
                    token: token,
                    pageName: 'home',
                    currentTime: currentTime
                  });
                }}
                fullScreen={false}
                startForm={undefined}
                autoplay={true}
              />
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => handleTap(item, index)}
              style={styles.imageContainer}>
              <Image
                source={{uri: item.contentUrl}}
                style={styles.mainImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
          {(item.contentUrls?.length ?? 0) > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.counterText}>1/{item.contentUrls?.length}</Text>
            </View>
          )}
          {liked && index === currentIndex && (
            <Animated.View
              style={[
                styles.heartContainer,
                {transform: [{scale: heartScale}]},
              ]}>
              <MaterialIcons
                name="favorite"
                size={80}
                color="white"
                style={styles.heartIcon}
              />
            </Animated.View>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <View style={styles.actionFooter}>
            <View style={styles.actionFooterLeft}>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => likePost(item._id, index)}
              >
                <Image 
                  source={item.isLiked ? require('../../../assets/postcard/likeFillIcon.png') : require('../../../assets/postcard/likeIcon.png')}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionCount}>{item.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Image 
                  source={require('../../../assets/postcard/commentIcon.png')}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionCount}>{item.commentsCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => savePost(item._id, index)}
              >
                <Image 
                  source={item.isSaved ? require('../../../assets/postcard/saveFillIcons.png') : require('../../../assets/postcard/saveIcon.png')}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionCount}>{item.savedCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton} 
                onPress={() => handleShare(item)}
              >
                <Image 
                  source={require('../../../assets/postcard/sendIcon.png')}
                  style={styles.actionIcon}
                />
                <Text style={styles.actionCount}>{item.shares || 0}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
        </View>

        {item.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption} numberOfLines={3}>
              {item.caption}
            </Text>
            {item.caption.length > 120 && (
              <TouchableOpacity>
                <Text style={styles.moreText}>more</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, tagIndex) => (
              <TouchableOpacity key={tagIndex} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {renderHeader()}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={Dimensions.get('window').height - HEADER_HEIGHT - (StatusBar.currentHeight || 0)}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').height - HEADER_HEIGHT - (StatusBar.currentHeight || 0),
          offset: (Dimensions.get('window').height - HEADER_HEIGHT - (StatusBar.currentHeight || 0)) * index,
          index,
        })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50
        }}
        contentContainerStyle={styles.flatListContent}
      />
    </SafeAreaView>
  );
};

const HEADER_HEIGHT = 65;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white,
  },
  flatListContent: {
    paddingTop: 0,
  },
  postContainer: {
    height: Dimensions.get('window').height - HEADER_HEIGHT - (StatusBar.currentHeight || 0),
    backgroundColor: Color.white,
  },
  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    zIndex: 1000,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: FontFamilies.semibold,
    color: '#1E1E1E',
    textAlign: 'center',
  },
  mediaContainer: {
    width: '100%',
    aspectRatio: 4/5,
    backgroundColor: '#F8F8F8',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F8F8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontFamily: FontFamilies.medium,
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  actionCount: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
  },
  timeAgo: {
    fontSize: 12,
    color: '#8E8E8E',
    fontFamily: FontFamilies.regular,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  caption: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: FontFamilies.regular,
    lineHeight: 20,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: FontFamilies.medium,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tagChip: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontFamily: FontFamilies.medium,
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    shadowColor: '#A6A6A6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  menuButton: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    width: 37,
    height: 37,
    justifyContent: 'center',
    shadowColor: '#A6A6A6',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heartContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -40}, {translateY: -40}],
    zIndex: 1000,
  },
  heartIcon: {
    width: 80,
    height: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default SinglePostScreen; 