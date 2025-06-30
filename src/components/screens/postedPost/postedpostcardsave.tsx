/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {post} from '../../../services/dataRequest';

const PostedPostCardSave = ({postId, saved}: any) => {
  const [isSaved, setIsSaved] = useState(saved);

  const handleSaveClick = async () => {
    try {
      const response = await post('ugc/save-ugc', {ugcId: postId});
      if (!response.message) {
        throw new Error('Failed to save the post');
      }
      if (response?.saved) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.postButton} onPress={handleSaveClick}>
      <Icon name={isSaved ? 'bookmark' : 'bookmark-o'} color="#000" size={20} />
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

export default PostedPostCardSave;
