/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {post} from '../../../services/dataRequest';

const PostedPostCardLike = ({postId, likesCount, liked}:any) => {
  const [likeCount, setLikeCount] = useState(likesCount);
  const [isLiked, setIsLiked] = useState(liked);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikeCount(likesCount);
    setIsLiked(liked);
  }, [likesCount, liked]);

  const handleLikeToggle = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const newLikeStatus = !isLiked;
      const response = await post(`ugc/toggle-like/${postId}`, {});
      console.log('response:', response);
      if (response.status === 200) {
        setLikeCount((prevCount: any) =>
          newLikeStatus ? prevCount + 1 : prevCount - 1,
        );
        setIsLiked(newLikeStatus);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.postButton}
      onPress={handleLikeToggle}
      disabled={loading}>
      <Icon
        name={isLiked ? 'heart' : 'heart-o'}
        color={isLiked ? '#FF6347' : '#000'}
        size={20}
      />
      <Text
        style={[styles.postButtonText, {color: isLiked ? '#FF6347' : '#000'}]}>
        {likeCount}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  postButtonText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Gilroy-ExtraBold',
  },
});

export default PostedPostCardLike;
