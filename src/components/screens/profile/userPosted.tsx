/* eslint-disable react/self-closing-comp */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {formatDistanceToNow} from 'date-fns';
import {enUS} from 'date-fns/locale';
import {useCallback, useEffect, useState} from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {Divider} from 'react-native-paper';
import {del, get, post} from '../../../services/dataRequest';
import Icon from 'react-native-vector-icons/FontAwesome';

import {useIsFocused} from '@react-navigation/native';
import { Color } from '../../../styles/constants';

const UserPosted = ({route}) => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any>([]);
  const [token, setToken] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const isFocused = useIsFocused();
  const [currentUser, setCurrentUser] = useState('');
  const {isOwner, userId, profilePic, firstName, lastName, businessName} =
    route.params;

  const fetchToken = useCallback(async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const account_ = await AsyncStorage.getItem('user');
      const userId = JSON.parse(account_!);
      console.log('usedID> ', userId._id);
      setCurrentUser(userId?._id);
      if (savedToken !== null) {
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
      if (!token || !hasMorePosts) {
        return;
      }

      setLoading(true);

      try {
        const endpoint = userId
          ? `ugc/get-user-ugc/${userId}`
          : 'ugc/get-user-ugc';
        const data = await get(`${endpoint}?page=${page}&limit=50`, {}, token);
        if (data.ugcs && data.ugcs.length > 0) {
          setPosts((prevPosts: any) =>
            page === 1 ? data.ugcs : [...prevPosts, ...data.ugcs],
          ); // Reset or append posts
          setPage(page);
          setInitialLoading(false);
        } else {
          setHasMorePosts(false); // No more posts to load
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [token, hasMorePosts],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMorePosts(true); // Reset the hasMorePosts state
    fetchPosts(1).then(() => setRefreshing(false));
  }, [fetchPosts]);

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      fetchPosts(page + 1);
    }
  };

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  useEffect(() => {
    if (isFocused) {
      fetchPosts();
    }
  }, [isFocused, token, fetchPosts]);

  const handleLikeToggle = async (postId: any) => {
    // Optimistic UI update
    setPosts((prevPosts: any) =>
      prevPosts.map((post: any) =>
        post._id === postId ? {...post, liked: !post.liked} : post,
      ),
    );
    try {
      const data = await post(`ugc/toggle-like/${postId}`, {});
      if (data) {
        setPosts((prevPosts:any) =>
          prevPosts.map((post:any) =>
            post._id === postId ? { ...post, liked: data.liked } : post,
          ),
        );
        fetchPosts();
      }
    } catch (error) {
      // console.error('Error toggling like:', error);
      // Revert the optimistic update if there's an error
      setPosts((prevPosts: any) =>
        prevPosts.map((post: any) =>
          post._id === postId ? {...post, liked: !post.liked} : post,
        ),
      );
    }
  };

  const isUserLikedPost = (post: any, userId: string) => {
    post['liked']=post.likedBy.includes(userId);
    // return post.likedBy && post.likedBy.some((user:any) => user._id === userId);
  };


  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const deletePost = async (id: any) => {
    try {
      const data = await del('ugc/delete-post', id);
      // console.log('Post deleted:', data);
      if (data.status === 200) {
        // Remove the deleted post from the state
        setPosts((prevPosts: any) =>
          prevPosts.filter((post: any) => post._id !== id),
        );
      }
      // Update your state or perform any other necessary actions here
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const PostCard = ({post}:any) => {
    const liked = post.liked !== undefined ? post.liked : isUserLikedPost(post, currentUser);
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Image
            source={{
              uri:
                profilePic ||
                'https://cs-staging-storage.s3.ap-south-1.amazonaws.com/static/219986.png',
            }}
            style={styles.postAvatar}
          />
          <Text style={styles.postUsername}>
            {toTitleCase(firstName) || businessName}{' '}
            {toTitleCase(lastName) || null}
          </Text>
          <Text style={styles.postDate}>
            {formatDistanceToNow(new Date(post.createdAt), {locale: enUS})} ago
          </Text>
          {isOwner ? (
            <TouchableOpacity
              onPress={() => deletePost(post._id)}
              style={styles.deleteButton}>
              <Icon style={styles.deleteButtonText} name="trash"></Icon>
            </TouchableOpacity>
          ) : null}
        </View>
        <Divider />
        <View style={styles.postContent}>
          <Text style={styles.postDescription}>{post.caption}</Text>
          {post.contentUrl && (
            <Image source={{uri: post.contentUrl}} style={styles.postImage} />
          )}
        </View>
        <Divider />
        <View style={styles.postFooter}>
          <TouchableOpacity
            style={styles.postButton}
            onPress={() => handleLikeToggle(post._id)}>
            <Icon
              name={liked ? 'heart' : 'heart-o'}
              color={liked ? 'red' : '#000'}
              size={16}
            />
            <Text style={styles.postButtonText}>Like</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) {
      return null;
    }
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Color.black}/>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {initialLoading ? (
        <ActivityIndicator size="large" color={Color.black}/>
      ) : posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPostsText}>No posts yet. Post one!</Text>
        </View>
      ) : (
        <FlatList
          scrollIndicatorInsets={{right: 1}}
          data={posts}
          contentContainerStyle={styles.postListContainer}
          keyExtractor={post => post._id.toString()}
          renderItem={({item}) => <PostCard post={item} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={loadMorePosts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 0,
  },
  postListContainer: {
    paddingTop: 20,
    paddingHorizontal: 15,
  },
  postCard: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  postHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  postAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  postUsername: {
    flex: 1,
    color: '#000',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
  postDate: {
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: '#A9A9A9',
  },
  deleteButton: {
    marginLeft: 15,
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 50,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
    color: 'white',
  },
  postContent: {
    padding: 10,
  },
  postDescription: {
    fontSize: 16,
    marginTop: 5,
    color: '#A9A9A9',
  },
  postImage: {
    width: '100%',
    marginVertical: 10,
    borderRadius: 15,
    height: 200,
  },
  postFooter: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 10,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 5,
  },
  postButtonText: {
    color: '#000',
  },
  loader: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#CED0CE',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPostsText: {
    fontSize: 18,
    color: '#A9A9A9',
  },
});

export default UserPosted;
