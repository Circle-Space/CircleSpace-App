import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import PostedPostCardLike from './postedpostcardlike';
import PostedPostCardSave from './postedpostcardsave';

const PostedPostFooter = ({like, likesCount,postId, save}: any) => {
  return (
    <View style={styles.container}>
      <PostedPostCardLike liked={like} postId={postId} likesCount={likesCount}/>
      <PostedPostCardSave saved={save} postId={postId} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PostedPostFooter;
