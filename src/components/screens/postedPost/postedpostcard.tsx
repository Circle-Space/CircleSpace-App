import React from 'react';
import {View, StyleSheet} from 'react-native';
import PostedPostHeader from './postedPostHeader';
import PostedPostContent from './postedPostContent';
import PostedPostFooter from './postedpostfooter';

const PostedPostCard = ({
  userPhoto,
  username,
  fullName,
  postedTime,
  postImage,
  caption,
  likesCount,
  liked,
  saved,
  postId
}: any) => {
  return (
    <View style={styles.container}>
      <PostedPostHeader
        userPhoto={userPhoto}
        username={username}
        fullName={fullName}
        postedTime={postedTime}
        caption={caption}
      />
      <PostedPostContent postImage={postImage} />
      <PostedPostFooter like={liked} postId={postId} likesCount={likesCount} save={saved}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 3,
    borderWidth: 0,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
});

export default PostedPostCard;
