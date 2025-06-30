import React from 'react';
import {View, Image, StyleSheet} from 'react-native';

const PostedPostContent = ({postImage}: any) => {
  return <Image source={{uri: postImage}} style={styles.postImage} />;
};

const styles = StyleSheet.create({
  postImage: {
    width: '100%',
    height: 300,
  },
});

export default PostedPostContent;
