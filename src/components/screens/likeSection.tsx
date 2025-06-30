/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontFamilies } from '../../styles/constants';

const LikeSection = ({ initialLikes, liked, onLikeToggle }) => {
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(liked);

  useEffect(() => {
    setLikeCount(initialLikes);
  }, [initialLikes]);

  useEffect(() => {
    setIsLiked(liked);
  }, [liked]);

  const handleLikeToggle = () => {
    const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;
    setLikeCount(newLikeCount);
    setIsLiked(!isLiked);
    onLikeToggle(!isLiked);
  };

  return (
    <TouchableOpacity style={styles.postButton} onPress={handleLikeToggle}>
      <Icon name={isLiked ? 'heart' : 'heart-o'} color={isLiked ? '#FF6347' : '#000'} size={20} />
      <Text style={[styles.postButtonText, { color: isLiked ? '#FF6347' : '#000' }]}>
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
    fontFamily: FontFamilies.semibold,
  },
});

export default LikeSection;
