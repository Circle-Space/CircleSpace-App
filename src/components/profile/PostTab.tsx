import React, { useState, useEffect } from 'react';
import { FlatList, StyleSheet, View, ActivityIndicator, Text, Image } from 'react-native';
import PostGridItem from './PostGridItem';
import { useProfile } from '../../hooks/useProfile';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLike } from '../../redux/slices/likeSlice';
import { setSaveStatus } from '../../redux/slices/saveSlice';
import { RootState } from '../../redux/store';
import BottomSheetModal from '../screens/profile/BottomSheetModal';
import { Post } from '../../types/Posttype';
import { SavePayload } from '../../types/save';
import { Color, FontFamilies, FontSizes } from '../../styles/constants';

interface PostTabProps {
  userId: string;
  isSelf?: boolean;
  token: string;
  accountType: string;
}

const PostTab: React.FC<PostTabProps> = ({ userId, isSelf = false, accountType }) => {
  const dispatch = useDispatch();
  console.log("accountType in post tab", accountType);
  const { 
    fetchPosts, 
    loadMorePosts,
    posts, 
    togglePostLike,
    handleSavePress,
    handleSaveToCollection: contextHandleSaveToCollection,
    selectedPost,
    isBottomSheetVisible,
    setIsBottomSheetVisible,
    postsLoading,
    hasMorePosts
  } = useProfile();
  const likedPosts = useSelector((state: RootState) => state.like.likedPosts);
  const likeCounts = useSelector((state: RootState) => state.like.likeCounts);
  const savedPosts = useSelector((state: RootState) => state.save.SavedPosts);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchPosts(userId, !isSelf);
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    loadPosts();
  }, [userId, isSelf]); 

  const handleLike = async (postId: string) => {
    try {
      // Optimistically update UI
      dispatch(toggleLike(postId));

      // Make API call
      const success = await togglePostLike(postId);

      if (!success) {
        // Revert the optimistic update if the API call fails
        dispatch(toggleLike(postId));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Revert the optimistic update on error
      dispatch(toggleLike(postId));
    }
  };

  const handleSave = async (post: Post) => {
    try {
      // Create a fresh post object with the correct contentType
      const postWithType = {
        ...post,
        contentType: post.contentType || post.type || 'photo' // Ensure contentType is set based on type
      };

      // Make API call
      const success = await handleSavePress(postWithType, true);

      // If API call fails, revert the optimistic update
      if (success === false) {
        dispatch(setSaveStatus({ postId: post._id, isSaved: false }));
      }
    } catch (error) {
      // Revert the optimistic update on error
      dispatch(setSaveStatus({ postId: post._id, isSaved: true }));
      console.error('Error handling save:', error);
    }
    fetchPosts(userId, !isSelf);
  };

  const handleCollectionSave = async (payload: SavePayload) => {
    try {
      // Convert SavePayload to CollectionInfo format for the context function
      const collectionInfo = {
        isNewCollection: payload.isNewCollection || false,
        collectionInfo: {
          collectionId: payload.collectionInfo.collectionId || ''
        }
      };
      
      const success = await contextHandleSaveToCollection(collectionInfo);
      
      // Only update UI if save to collection was successful
      if (success === true) {
        if (selectedPost) {
          dispatch(setSaveStatus({ postId: selectedPost._id, isSaved: true }));
        }
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
    } finally {
      setIsBottomSheetVisible(false);
    }
  };

  const handleLoadMore = () => {
    if (!postsLoading && hasMorePosts) {
      loadMorePosts(userId, !isSelf);
    }
  };

  const renderFooter = () => {
    // if (!postsLoading) return null;
    // return (
    //   <View style={styles.footerLoader}>
    //     <ActivityIndicator size="small" color={Color.black} />
    //   </View>
    // );
  };

  return (
    <View style={{ flex: 1 }}>
      {posts.length === 0 && !postsLoading ? (
        <View style={[
          styles.noPostContainer,
          accountType === 'personal' ? styles.personalNoPost : styles.businessNoPost
        ]}>
          <Image
            source={require('../../assets/profile/profileTabs/noPost.png')}
            style={styles.noPostImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.noPostText}>No Posts Yet</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item._id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <PostGridItem
              post={item}
              posts={posts}
              liked={likedPosts[item._id] || false}
              saved={savedPosts[item._id] || false}
              onLike={() => handleLike(item._id)}
              onSave={() => handleSave(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}

      {/* Bottom Sheet Modal for Save functionality */}
      {isBottomSheetVisible && selectedPost && (
        <BottomSheetModal
          isVisible={isBottomSheetVisible}
          onClose={() => setIsBottomSheetVisible(false)}
          post={selectedPost}
          saveToggle={handleCollectionSave}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 8,
    paddingBottom: 80,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  footerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  noPostContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personalNoPost: {
    paddingTop: 40,
  },
  businessNoPost: {
    marginBottom: 50,
  },
  noPostImage: {
    width: 100,
    height: 100,
    marginBottom: 14,
    tintColor: Color.black,
  },
  noPostText: {
    color: Color.black,
    fontSize: FontSizes.medium2,
    fontFamily: FontFamilies.medium,
  },
});

export default PostTab; 